import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';

export const alt = 'Notix - Entraîne-toi à la prise de notes';
export const contentType = 'image/png';
export const size = {
  width: 1200,
  height: 630,
};

async function getFonts() {
  try {
    const [nunito, dmSans] = await Promise.all([
      fetch(
        'https://cdn.jsdelivr.net/fontsource/fonts/nunito@latest/latin-800-normal.woff',
      ).then((res) => (res.ok ? res.arrayBuffer() : null)),
      fetch(
        'https://cdn.jsdelivr.net/fontsource/fonts/dm-sans@latest/latin-400-normal.woff',
      ).then((res) => (res.ok ? res.arrayBuffer() : null)),
    ]);

    return { nunito, dmSans };
  } catch {
    return { nunito: null, dmSans: null };
  }
}

export default async function Image() {
  const t = await getTranslations('metadata');
  const { nunito, dmSans } = await getFonts();

  const fonts: Array<{
    name: string;
    data: ArrayBuffer;
    style: 'normal';
    weight: 400 | 800;
  }> = [];
  if (nunito !== null) {
    fonts.push({
      name: 'Nunito',
      data: nunito,
      style: 'normal',
      weight: 800,
    });
  }
  if (dmSans !== null) {
    fonts.push({
      name: 'DM Sans',
      data: dmSans,
      style: 'normal',
      weight: 400,
    });
  }

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #fffbeb, #fff7ed)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '120px',
              fontWeight: '800',
              color: '#f43f5e',
              margin: 0,
              lineHeight: '1',
              fontFamily: 'Nunito',
              position: 'relative',
            }}
          >
            Notix
          </h1>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            fontSize: '48px',
          }}
        >
          <span>📝</span>
          <span>✨</span>
          <span>🎓</span>
        </div>
        <p
          style={{
            fontSize: '32px',
            color: '#525252',
            margin: 0,
            marginTop: '16px',
            fontFamily: 'DM Sans',
          }}
        >
          {t('description')}
        </p>
      </div>
    </div>,
    {
      ...size,
      fonts,
    },
  );
}
