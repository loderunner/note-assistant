import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { BG, GOOG_API_KEY, type WebPoSignalOutput, buildURL } from 'bgutils-js';
import { Innertube } from 'youtubei.js';

const require = createRequire(fileURLToPath(import.meta.url));

let cachedInnertube: Innertube | null = null;
let innertubeExpiry: number = 0;
let innertubePromise: Promise<Innertube> | null = null;
const INNERTUBE_TTL_MS = 5 * 60 * 60 * 1000; // 5 hours (conservative, tokens last ~6 hours)

/**
 * Gets a cached authenticated Innertube instance, creating one if needed.
 * The instance is cached for 5 hours along with its PO tokens.
 *
 * Uses BgUtils to generate Proof of Origin (PO) tokens via YouTube's BotGuard
 * system, which is required to avoid "Precondition check failed" errors.
 *
 * Based on the official BgUtils Node.js example:
 * https://github.com/LuanRT/BgUtils/blob/main/examples/node/index-alt.ts
 *
 * @returns A promise resolving to an authenticated Innertube instance
 *
 * @example
 * const yt = await getInnertube();
 * const video = await yt.getInfo('dQw4w9WgXcQ');
 */
export async function getInnertube(): Promise<Innertube> {
  // Return cached instance if still valid
  if (cachedInnertube !== null && Date.now() < innertubeExpiry) {
    return cachedInnertube;
  }

  // If already generating, wait for that promise
  if (innertubePromise !== null) {
    console.info('Waiting for in-progress Innertube creation');
    return innertubePromise;
  }

  console.info('Creating new authenticated Innertube instance');
  innertubePromise = createAuthenticatedInnertube();

  try {
    cachedInnertube = await innertubePromise;
    innertubeExpiry = Date.now() + INNERTUBE_TTL_MS;
    return cachedInnertube;
  } finally {
    innertubePromise = null;
  }
}

/**
 * Creates a new authenticated Innertube instance with PO tokens.
 */
async function createAuthenticatedInnertube(): Promise<Innertube> {
  // 1. Create barebones Innertube instance to get visitorData
  console.info('Getting visitor data from YouTube');
  const innertube = await Innertube.create({ retrieve_player: false });
  const visitorData = innertube.session.context.client.visitorData;

  if (visitorData === undefined) {
    throw new Error('Could not get visitor data from YouTube');
  }

  // 2. Setup fake DOM environment for BotGuard
  // Use require() to load JSDOM as CommonJS, bypassing Turbopack's ESM handling
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM();

  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
  });

  // 3. Fetch BotGuard challenge
  console.info('Fetching BotGuard challenge');
  const requestKey = 'O43z0dpjhgX20SCx4KAo';

  const challengeResponse = await fetch(buildURL('Create', true), {
    method: 'POST',
    headers: {
      'content-type': 'application/json+protobuf',
      'x-goog-api-key': GOOG_API_KEY,
      'x-user-agent': 'grpc-web-javascript/0.1',
    },
    body: JSON.stringify([requestKey]),
  });

  if (!challengeResponse.ok) {
    throw new Error(
      `Failed to fetch BotGuard challenge: ${challengeResponse.status}`,
    );
  }

  const bgChallenge = BG.Challenge.parseChallengeData(
    await challengeResponse.json(),
  );

  if (bgChallenge === undefined) {
    throw new Error('Could not parse BotGuard challenge');
  }

  // 4. Execute BotGuard interpreter script in fake DOM
  console.info('Executing BotGuard interpreter');
  const interpreterJavascript =
    bgChallenge.interpreterJavascript
      .privateDoNotAccessOrElseSafeScriptWrappedValue;

  if (interpreterJavascript === null) {
    throw new Error('Could not load BotGuard VM');
  }

  new Function(interpreterJavascript)();

  // 5. Create BotGuard client and get snapshot
  console.info('Creating BotGuard snapshot');
  const botguard = await BG.BotGuardClient.create({
    globalName: bgChallenge.globalName,
    globalObj: globalThis,
    program: bgChallenge.program,
  });

  const webPoSignalOutput: WebPoSignalOutput = [];
  const botguardResponse = await botguard.snapshot({ webPoSignalOutput });

  // 6. Get integrity token
  console.info('Fetching integrity token');
  const integrityTokenResponse = await fetch(buildURL('GenerateIT', true), {
    method: 'POST',
    headers: {
      'content-type': 'application/json+protobuf',
      'x-goog-api-key': GOOG_API_KEY,
      'x-user-agent': 'grpc-web-javascript/0.1',
    },
    body: JSON.stringify([requestKey, botguardResponse]),
  });

  if (!integrityTokenResponse.ok) {
    throw new Error(
      `Failed to get integrity token: ${integrityTokenResponse.status}`,
    );
  }

  const response = (await integrityTokenResponse.json()) as unknown[];

  if (typeof response[0] !== 'string') {
    throw new Error('Could not get integrity token from response');
  }

  // 7. Mint PO token using integrity token
  console.info('Minting PO token');
  const integrityTokenBasedMinter = await BG.WebPoMinter.create(
    { integrityToken: response[0] },
    webPoSignalOutput,
  );

  const poToken =
    await integrityTokenBasedMinter.mintAsWebsafeString(visitorData);

  // 8. Create authenticated Innertube instance with the generated tokens
  console.info('Creating final Innertube instance with PO token');
  const authenticatedInnertube = await Innertube.create({
    po_token: poToken,
    visitor_data: visitorData,
    generate_session_locally: true,
  });

  console.info('Authenticated Innertube instance created');
  return authenticatedInnertube;
}
