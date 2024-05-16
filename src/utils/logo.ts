export const weight = 64;

export const rect = {
  rx: '32',
  ry: '32',
  style: {
    fill: 'red',
    stroke: 'black',
    strokeSidth: 5,
    opacity: 0.5,
  },
};

export const getLogoSVG = () => {
  return `<svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <rect x="0" y="0" rx="${rect.rx}" ry="${rect.ry}" style="${Object.entries(
    rect.style,
  )
    .map(([key, value]) => `${key}: ${value}`)
    .join(';')}" width="512" height="${weight}" />
      <rect x="${512 - weight}" y="0" rx="${rect.rx}" ry="${
    rect.ry
  }" style="${Object.entries(rect.style)
    .map(([key, value]) => `${key}: ${value}`)
    .join(';')}" width="${weight}" height="1024" />
      <rect x="0" y="${1024 - weight}" rx="${rect.rx}" ry="${
    rect.ry
  }" style="${Object.entries(rect.style)
    .map(([key, value]) => `${key}: ${value}`)
    .join(';')}" width="512" height="${weight}" />
      <rect x="0" y="512" rx="${rect.rx}" ry="${
    rect.ry
  }" style="${Object.entries(rect.style)
    .map(([key, value]) => `${key}: ${value}`)
    .join(';')}" width="${weight}" height="512" />
      <rect x="0" y="512" rx="${rect.rx}" ry="${
    rect.ry
  }" style="${Object.entries(rect.style)
    .map(([key, value]) => `${key}: ${value}`)
    .join(';')}" width="512" height="${weight}" />
      <rect x="512" y="${512 - weight}"  rx="${rect.rx}" ry="${
    rect.ry
  }" style="${Object.entries(rect.style)
    .map(([key, value]) => `${key}: ${value}`)
    .join(';')}" width="512" height="${weight}" /> 
      <rect x="${1024 - weight}" y="512" rx="${rect.rx}" ry="${
    rect.ry
  }" style="${Object.entries(rect.style)
    .map(([key, value]) => `${key}: ${value}`)
    .join(';')}" width="${weight}" height="246" />
      <rect x="768" y="512" rx="${rect.rx}" ry="${
    rect.ry
  }" style="${Object.entries(rect.style)
    .map(([key, value]) => `${key}: ${value}`)
    .join(';')}" width="256" height="${weight}" />
      <rect x="512" y="${512 - weight}" rx="${rect.rx}" ry="${
    rect.ry
  }" style="${Object.entries(rect.style)
    .map(([key, value]) => `${key}: ${value}`)
    .join(';')}" width="512" height="${weight}" />
      <rect x="${1024 - weight}" y="0" rx="${rect.rx}" ry="${
    rect.ry
  }" style="${Object.entries(rect.style)
    .map(([key, value]) => `${key}: ${value}`)
    .join(';')}" width="${weight}" height="512" />
      <rect x="512" y="0" rx="${rect.rx}" ry="${
    rect.ry
  }" style="${Object.entries(rect.style)
    .map(([key, value]) => `${key}: ${value}`)
    .join(';')}" width="512" height="${weight}" />
      <rect x="512" y="0" rx="${rect.rx}" ry="${
    rect.ry
  }" style="${Object.entries(rect.style)
    .map(([key, value]) => `${key}: ${value}`)
    .join(';')}" width="${weight}" height="768" />
      <rect x="512" y="${768 - weight}" rx="${rect.rx}" ry="${
    rect.ry
  }" style="${Object.entries(rect.style)
    .map(([key, value]) => `${key}: ${value}`)
    .join(';')}" width="512" height="${weight}" />
      <rect x="768" y="512" rx="${rect.rx}" ry="${
    rect.ry
  }" style="${Object.entries(rect.style)
    .map(([key, value]) => `${key}: ${value}`)
    .join(';')}" width="${weight}" height="512" />
      <rect x="512" y="${1024 - weight}" rx="${rect.rx}" ry="${
    rect.ry
  }" style="${Object.entries(rect.style)
    .map(([key, value]) => `${key}: ${value}`)
    .join(';')}" width="256" height="${weight}" />
      <rect x="512" y="768" rx="${rect.rx}" ry="${
    rect.ry
  }" style="${Object.entries(rect.style)
    .map(([key, value]) => `${key}: ${value}`)
    .join(';')}" width="${weight}" height="256" />
      <rect x="512" y="768" rx="${rect.rx}" ry="${
    rect.ry
  }" style="${Object.entries(rect.style)
    .map(([key, value]) => `${key}: ${value}`)
    .join(';')}" width="512" height="${weight}" />
      <rect x="${1024 - weight}" y="768" rx="${rect.rx}" ry="${
    rect.ry
  }" style="${Object.entries(rect.style)
    .map(([key, value]) => `${key}: ${value}`)
    .join(';')}" width="${weight}" height="256" />
    </svg>`;
};
