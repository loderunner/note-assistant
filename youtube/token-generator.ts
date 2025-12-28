import { BG, GOOG_API_KEY, type WebPoSignalOutput, buildURL } from 'bgutils-js';
import { JSDOM } from 'jsdom';
import { Innertube } from 'youtubei.js';

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
    console.debug('getInnertube: returning cached instance');
    return cachedInnertube;
  }

  // If already generating, wait for that promise
  if (innertubePromise !== null) {
    console.debug('getInnertube: waiting for in-progress creation');
    return innertubePromise;
  }

  console.info('getInnertube: creating new authenticated instance');
  innertubePromise = createAuthenticatedInnertube();

  try {
    cachedInnertube = await innertubePromise;
    innertubeExpiry = Date.now() + INNERTUBE_TTL_MS;
    console.info(
      `getInnertube: instance created and cached, expires in ${INNERTUBE_TTL_MS}ms`,
    );
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
  console.debug('createAuthenticatedInnertube: fetching visitor data');
  const innertube = await Innertube.create({ retrieve_player: false });
  const visitorData = innertube.session.context.client.visitorData;

  if (visitorData === undefined) {
    throw new Error('Could not get visitor data from YouTube');
  }
  console.debug('createAuthenticatedInnertube: got visitor data');

  // 2. Setup fake DOM environment for BotGuard
  // Using jsdom 27.0.0 - the last version before ESM issues
  // See: https://github.com/jsdom/jsdom/issues/3959 - jsdom 27.0.1+ has ESM issues
  console.debug(
    'createAuthenticatedInnertube: setting up fake DOM for BotGuard',
  );
  const dom = new JSDOM('', { url: 'https://www.youtube.com/' });

  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
  });

  // 3. Fetch BotGuard challenge
  console.debug('createAuthenticatedInnertube: fetching BotGuard challenge');
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
  console.debug('createAuthenticatedInnertube: BotGuard challenge received');

  // 4. Execute BotGuard interpreter script in fake DOM
  console.debug('createAuthenticatedInnertube: executing BotGuard interpreter');
  const interpreterJavascript =
    bgChallenge.interpreterJavascript
      .privateDoNotAccessOrElseSafeScriptWrappedValue;

  if (interpreterJavascript === null) {
    throw new Error('Could not load BotGuard VM');
  }

  new Function(interpreterJavascript)();

  // 5. Create BotGuard client and get snapshot
  console.debug('createAuthenticatedInnertube: creating BotGuard snapshot');
  const botguard = await BG.BotGuardClient.create({
    globalName: bgChallenge.globalName,
    globalObj: globalThis,
    program: bgChallenge.program,
  });

  const webPoSignalOutput: WebPoSignalOutput = [];
  const botguardResponse = await botguard.snapshot({ webPoSignalOutput });
  console.debug(
    `createAuthenticatedInnertube: BotGuard snapshot created, response length=${botguardResponse.length}`,
  );

  // 6. Get integrity token
  console.debug('createAuthenticatedInnertube: fetching integrity token');
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

  // Find the integrity token - it's the first string in the response array
  // Response format: [null, ttl, null, token] or similar
  const integrityToken = response.find(
    (item): item is string => typeof item === 'string',
  );

  if (integrityToken === undefined) {
    console.error(
      'createAuthenticatedInnertube: integrity token response (no string found):',
      JSON.stringify(response, null, 2),
    );
    throw new Error('Could not get integrity token from response');
  }
  console.debug('createAuthenticatedInnertube: integrity token received');

  // 7. Mint PO token using integrity token
  console.debug('createAuthenticatedInnertube: minting PO token');
  const integrityTokenBasedMinter = await BG.WebPoMinter.create(
    { integrityToken },
    webPoSignalOutput,
  );

  const poToken =
    await integrityTokenBasedMinter.mintAsWebsafeString(visitorData);
  console.debug(
    `createAuthenticatedInnertube: PO token minted, length=${poToken.length}`,
  );

  // 8. Create authenticated Innertube instance with the generated tokens
  console.debug(
    'createAuthenticatedInnertube: creating Innertube with PO token',
  );
  const authenticatedInnertube = await Innertube.create({
    po_token: poToken,
    visitor_data: visitorData,
    generate_session_locally: true,
  });

  console.info('createAuthenticatedInnertube: authenticated instance created');
  return authenticatedInnertube;
}
