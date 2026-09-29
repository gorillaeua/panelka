/* =========================================================
   art.js — «фотографии» товаров, нарисованные кодом

   Настоящих фото у нас нет, поэтому каждая картинка — это SVG
   (векторная графика). Функции ниже собирают её из простых фигур:
   <rect> — прямоугольник, <circle> — круг, <line> — линия,
   <path> — произвольная фигура, <text> — текст.

   Все картинки рисуются на «холсте» 400×400 (viewBox="0 0 400 400"):
   x растёт вправо, y — вниз. Точка (200, 200) — центр.

   Плюсы подхода: картинки почти ничего не весят, не размываются
   на любом экране, а цвета меняются в products.js.
   ========================================================= */

const FONT_DISPLAY = 'Anton, Impact, sans-serif';
const FONT_TAG = "'Permanent Marker', cursive";
const FONT_MONO = "'IBM Plex Mono', monospace";

// Белая обводка «вырубной» наклейки. paint-order="stroke" рисует
// обводку ПОД заливкой, поэтому снаружи остаётся белый край.
const STICKER_EDGE = 'stroke="#fff" stroke-width="10" stroke-linejoin="round" paint-order="stroke"';

/* Главная функция: принимает товар, возвращает строку с <svg>.
   uid нужен, чтобы id внутри SVG (clipPath, фильтры) не повторялись,
   когда одна и та же картинка есть и в каталоге, и в корзине. */
function productArt(product, uid = product.id) {
  const painters = { deck: drawDeck, bike: drawBike, hoodie: drawHoodie, stickers: drawStickers };
  const paint = painters[product.art.type];
  return `<svg viewBox="0 0 400 400" aria-hidden="true" focusable="false">${paint(product.art, uid, product.id)}</svg>`;
}

/* Генератор «случайных» чисел с зерном (алгоритм mulberry32).
   Для одного и того же текста всегда выдаёт одну и ту же
   последовательность — поэтому горящие окна на доске не «прыгают»
   при каждой перезагрузке страницы. */
function seededRandom(seedText) {
  let a = 0;
  for (const ch of seedText) a = (a * 31 + ch.charCodeAt(0)) | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Сетка окон панельки: часть окон «горит» (цвет on), остальные тёмные (off)
function windowGrid({ x, y, cols, rows, w, h, stepX, stepY, rnd, chance, on, off }) {
  let out = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const fill = rnd() < chance ? on : off;
      out += `<rect x="${x + c * stepX}" y="${y + r * stepY}" width="${w}" height="${h}" fill="${fill}"/>`;
    }
  }
  return out;
}

// Точки многоконечной звезды («взрыв» на наклейке)
function starPoints(spikes, outer, inner) {
  const points = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 ? inner : outer;
    const angle = (Math.PI / spikes) * i - Math.PI / 2;
    points.push(`${(Math.cos(angle) * r).toFixed(1)},${(Math.sin(angle) * r).toFixed(1)}`);
  }
  return points.join(' ');
}

/* =========================================================
   СКЕЙТБОРД
   Дека — это прямоугольник 120×348 со скруглением 60
   (то есть полностью круглые нос и хвост). Всё, что нарисовано
   поверх, обрезается по форме деки через clipPath.
   ========================================================= */
function drawDeck(a, uid, seed) {
  const clip = `deck-clip-${uid}`;
  const graphics = { block: deckBlock, door: deckDoor, siren: deckSiren, garage: deckGarage };
  return `
    <ellipse cx="200" cy="386" rx="120" ry="9" fill="rgba(0,0,0,.25)"/>
    <g transform="rotate(-16 200 200)">
      <clipPath id="${clip}"><rect x="140" y="26" width="120" height="348" rx="60"/></clipPath>
      <rect x="140" y="26" width="120" height="348" rx="60" fill="${a.bg}"/>
      <g clip-path="url(#${clip})">${graphics[a.graphic](a, seed)}</g>
      <rect x="140" y="26" width="120" height="348" rx="60" fill="none" stroke="#111" stroke-width="4"/>
      ${a.complete ? deckTrucks() : ''}
    </g>`;
}

// Подвески и колёса — только у «комплитов» (собранных досок)
function deckTrucks() {
  const truck = (y) => `
    <rect x="178" y="${y - 20}" width="44" height="40" rx="5" fill="#9a9a9a" stroke="#111" stroke-width="3"/>
    <rect x="124" y="${y - 7}" width="152" height="14" rx="7" fill="#c4c4c4" stroke="#111" stroke-width="3"/>
    <circle cx="200" cy="${y}" r="6" fill="#555" stroke="#111" stroke-width="2"/>
    <rect x="106" y="${y - 17}" width="24" height="34" rx="9" fill="#efeadf" stroke="#111" stroke-width="3"/>
    <rect x="270" y="${y - 17}" width="24" height="34" rx="9" fill="#efeadf" stroke="#111" stroke-width="3"/>`;
  return truck(92) + truck(308);
}

// Графика «девятиэтажка»
function deckBlock(a, seed) {
  const rnd = seededRandom(seed);
  let seams = '';
  for (let i = 1; i < 9; i++) {
    const y = 141.5 + i * 23;
    seams += `<line x1="150" y1="${y}" x2="250" y2="${y}" stroke="rgba(0,0,0,.22)" stroke-width="1.5"/>`;
  }
  return `
    <circle cx="176" cy="70" r="11" fill="#ece8de"/>
    <circle cx="232" cy="58" r="1.6" fill="#ece8de"/>
    <circle cx="214" cy="82" r="1.2" fill="#ece8de"/>
    <text x="200" y="120" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="30" fill="${a.accent}">BLOCK 9</text>
    <rect x="150" y="136" width="100" height="250" fill="#9a9a95"/>
    ${seams}
    ${windowGrid({ x: 161.5, y: 146, cols: 4, rows: 9, w: 14, h: 14, stepX: 21, stepY: 23, rnd, chance: 0.2, on: a.accent, off: '#2a2b2d' })}
    <rect x="193" y="355" width="14" height="22" fill="#2a2b2d"/>`;
}

// Графика «подъезд №3»
function deckDoor(a) {
  return `
    <rect x="140" y="26" width="120" height="120" fill="rgba(0,0,0,.14)"/>
    <line x1="140" y1="146" x2="260" y2="146" stroke="rgba(0,0,0,.35)" stroke-width="3"/>
    <text x="200" y="102" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="46" fill="${a.accent}">Nº3</text>
    <text x="200" y="128" text-anchor="middle" font-family="${FONT_MONO}" font-size="11" letter-spacing="2" fill="${a.accent}">ENTRANCE</text>
    <rect x="160" y="160" width="80" height="182" fill="#2d5057" stroke="#111" stroke-width="3"/>
    <rect x="172" y="174" width="56" height="44" fill="#1c3438" stroke="#111" stroke-width="2"/>
    <line x1="172" y1="196" x2="228" y2="196" stroke="#111" stroke-width="2"/>
    <circle cx="228" cy="262" r="4.5" fill="#c9c7c0" stroke="#111" stroke-width="1.5"/>
    <rect x="245" y="226" width="11" height="32" rx="2" fill="#c9c7c0" stroke="#111" stroke-width="1.5"/>
    <circle cx="250.5" cy="234" r="2" fill="#111"/>
    <circle cx="250.5" cy="242" r="2" fill="#111"/>
    <circle cx="250.5" cy="250" r="2" fill="#ff2a3a"/>
    <path d="M168 292 q10 -18 20 0 t20 0 t20 0" fill="none" stroke="${a.accent}" stroke-width="3" stroke-linecap="round"/>
    <text x="200" y="326" text-anchor="middle" font-family="${FONT_TAG}" font-size="20" fill="#ffd400" transform="rotate(-8 200 326)">pnlk</text>
    <rect x="140" y="342" width="120" height="12" fill="#8f8e89"/>
    <rect x="140" y="354" width="120" height="30" fill="#6f6e6a"/>`;
}

// Графика «мигалка в 3 часа ночи».
// Текст стоит между подвесками (y≈112…288), чтобы у комплита его ничего не закрывало.
function deckSiren() {
  return `
    <rect x="140" y="26" width="60" height="160" fill="#ff2a3a"/>
    <rect x="200" y="26" width="60" height="160" fill="#2a6bff"/>
    <polygon points="181,146 136,26 176,26" fill="#fff" opacity=".28"/>
    <polygon points="219,146 224,26 264,26" fill="#fff" opacity=".28"/>
    <rect x="164" y="140" width="34" height="22" rx="9" fill="#ff8a92" stroke="#111" stroke-width="3"/>
    <rect x="202" y="140" width="34" height="22" rx="9" fill="#8cb0ff" stroke="#111" stroke-width="3"/>
    <rect x="156" y="158" width="88" height="22" rx="6" fill="#111"/>
    <text x="200" y="252" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="60" fill="#ece8de">3AM</text>
    <text x="200" y="276" text-anchor="middle" font-family="${FONT_MONO}" font-size="12" font-weight="700" letter-spacing="2" fill="#ffd400">SKATE FAST</text>
    <text x="200" y="354" text-anchor="middle" font-family="${FONT_MONO}" font-size="10" letter-spacing="2" fill="#6b6c6f">PANELKA</text>`;
}

// Графика «гаражный кооператив» с тегом во всю длину
function deckGarage(a) {
  const colors = ['#6f7a70', '#7a6a5c', '#5f6b75', '#7d7d78', '#6d5f58'];
  let doors = '';
  colors.forEach((color, i) => {
    const y = 30 + i * 70;
    doors += `<rect x="146" y="${y}" width="108" height="62" fill="${color}" stroke="#111" stroke-width="2"/>`;
    for (let x = 152; x < 254; x += 8) {
      doors += `<line x1="${x}" y1="${y + 3}" x2="${x}" y2="${y + 59}" stroke="rgba(0,0,0,.18)" stroke-width="2"/>`;
    }
    doors += `<ellipse cx="${166 + ((i * 29) % 64)}" cy="${y + 44}" rx="11" ry="6" fill="#8b4a2b" opacity=".55"/>`;
    doors += `<rect x="189" y="${y + 6}" width="22" height="12" fill="#ece8de"/>`;
    doors += `<text x="200" y="${y + 15.5}" text-anchor="middle" font-family="${FONT_MONO}" font-size="9" font-weight="700" fill="#111">${43 + i}</text>`;
  });
  return `${doors}
    <text x="200" y="214" text-anchor="middle" transform="rotate(-90 200 200)"
      font-family="${FONT_TAG}" font-size="44" fill="${a.accent}"
      stroke="#111" stroke-width="3" stroke-linejoin="round" paint-order="stroke">panelka</text>`;
}

/* =========================================================
   BMX — вид сбоку.
   Сначала задаём ключевые точки рамы, потом соединяем их линиями.
   ========================================================= */
function drawBike(a) {
  const chrome = '#c9c9c9';
  const R = [110, 262];   // ось заднего колеса
  const F = [292, 262];   // ось переднего колеса
  const BB = [190, 256];  // каретка (где педали)
  const S = [170, 184];   // узел под седлом
  const H1 = [266, 168];  // верх рулевого стакана
  const H2 = [274, 204];  // низ рулевого стакана
  const line = (p1, p2, color, width) =>
    `<line x1="${p1[0]}" y1="${p1[1]}" x2="${p2[0]}" y2="${p2[1]}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;

  const wheel = ([cx, cy]) => {
    let spokes = '';
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      spokes += `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(angle) * 53).toFixed(1)}" y2="${(cy + Math.sin(angle) * 53).toFixed(1)}"/>`;
    }
    return `
      <circle cx="${cx}" cy="${cy}" r="62" fill="none" stroke="#141414" stroke-width="12"/>
      <circle cx="${cx}" cy="${cy}" r="66" fill="none" stroke="#2c2c2c" stroke-width="3" stroke-dasharray="3 5"/>
      <circle cx="${cx}" cy="${cy}" r="55" fill="none" stroke="${a.rim || chrome}" stroke-width="4"/>
      <g stroke="#8d8d8d" stroke-width="1.3">${spokes}</g>
      <circle cx="${cx}" cy="${cy}" r="8" fill="#7a7a7a" stroke="#111" stroke-width="2"/>`;
  };
  // Пеги — короткие трубы на осях; сбоку видны как кружки
  const peg = ([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="11" fill="${chrome}" stroke="#111" stroke-width="2.5"/>`;

  // scale(1.12) вокруг центра — чуть увеличиваем велосипед, чтобы он заполнил кадр
  return `<g transform="translate(200 215) scale(1.12) translate(-200 -215)">
    <ellipse cx="200" cy="336" rx="170" ry="9" fill="rgba(0,0,0,.25)"/>
    ${wheel(R)}${wheel(F)}
    <path d="M190 236 L110 254 M190 276 L110 270" stroke="#555" stroke-width="3" stroke-dasharray="3 2"/>
    ${line(BB, R, a.frame, 8)}
    ${line(S, R, a.frame, 7)}
    <circle cx="190" cy="256" r="20" fill="${chrome}" stroke="#111" stroke-width="2.5"/>
    <circle cx="190" cy="256" r="7" fill="#333"/>
    ${line(BB, S, a.frame, 10)}
    ${line(S, H1, a.frame, 10)}
    ${line(BB, H2, a.frame, 10)}
    ${line(H1, H2, a.frame, 15)}
    <text x="232" y="234" text-anchor="middle" transform="rotate(-32.7 232 231)"
      font-family="${FONT_DISPLAY}" font-size="8.5" letter-spacing="1" fill="${a.accent}">PANELKA</text>
    ${line(H2, F, a.frame, 9)}
    ${peg(R)}${peg(F)}
    ${line(BB, [214, 298], '#1a1a1a', 8)}
    <rect x="200" y="294" width="30" height="9" rx="2" fill="#111"/>
    ${line(S, [166, 164], chrome, 6)}
    <path d="M140 160 Q148 150 170 152 L194 156 Q198 164 190 166 L150 168 Q138 168 140 160 Z" fill="#111"/>
    <rect x="258" y="152" width="18" height="16" rx="3" fill="#1a1a1a"/>
    ${line([269, 160], [254, 106], chrome, 7)}
    <circle cx="261" cy="132" r="4" fill="${chrome}" stroke="#111" stroke-width="1.5"/>
    ${line([256, 106], [242, 101], '#111', 13)}
  </g>`;
}

/* =========================================================
   ХУДИ — плоский силуэт (как вещь лежит на столе).
   Один путь <path> описывает тело и рукава, капюшон рисуется
   отдельно ПОЗАДИ тела, принт обрезается по форме худи.
   ========================================================= */
function drawHoodie(a, uid, seed) {
  const body = 'M160 96 L112 112 Q88 122 84 150 L62 312 L104 320 L126 196 L128 338 L272 338 L274 196 L296 320 L338 312 L316 150 Q312 122 288 112 L240 96 Q200 126 160 96 Z';
  const clip = `hoodie-clip-${uid}`;
  const shade = `hoodie-shade-${uid}`;
  const ink = a.ink || '#ece8de';
  const prints = { block: hoodieBlock, tape: hoodieTape, tag: hoodieTag, window: hoodieWindow };

  const pocket = a.zip
    ? `<path d="M140 266 L190 262 L190 322 L136 322 Z M260 266 L210 262 L210 322 L264 322 Z" fill="rgba(0,0,0,.08)" stroke="rgba(0,0,0,.35)" stroke-width="2.5"/>`
    : `<path d="M146 262 L254 262 L262 322 L138 322 Z" fill="rgba(0,0,0,.08)" stroke="rgba(0,0,0,.35)" stroke-width="2.5"/>`;

  const zipper = a.zip
    ? `<line x1="200" y1="111" x2="200" y2="338" stroke="#111" stroke-width="3" stroke-dasharray="2 2"/>
       <rect x="196" y="118" width="8" height="16" rx="2" fill="#c9c9c9" stroke="#111" stroke-width="1.5"/>`
    : '';

  return `
    <defs>
      <clipPath id="${clip}"><path d="${body}"/></clipPath>
      <linearGradient id="${shade}" x1="0" x2="1">
        <stop offset="0" stop-color="#fff" stop-opacity=".08"/>
        <stop offset=".55" stop-color="#000" stop-opacity="0"/>
        <stop offset="1" stop-color="#000" stop-opacity=".2"/>
      </linearGradient>
    </defs>
    <ellipse cx="200" cy="362" rx="150" ry="9" fill="rgba(0,0,0,.25)"/>
    <path d="M156 118 C142 60 172 36 200 36 C228 36 258 60 244 118 Z" fill="${a.color}" stroke="#111" stroke-width="3" stroke-linejoin="round"/>
    <path d="M172 118 C166 72 182 56 200 56 C218 56 234 72 228 118 Z" fill="rgba(0,0,0,.42)"/>
    <path d="${body}" fill="${a.color}"/>
    <path d="${body}" fill="url(#${shade})"/>
    <g clip-path="url(#${clip})">
      <rect x="120" y="322" width="160" height="20" fill="rgba(0,0,0,.2)"/>
      <polygon points="62,312 104,320 107,305 64,297" fill="rgba(0,0,0,.2)"/>
      <polygon points="338,312 296,320 293,305 336,297" fill="rgba(0,0,0,.2)"/>
      ${prints[a.print](a, ink, seed)}
      ${pocket}
    </g>
    <path d="${body}" fill="none" stroke="#111" stroke-width="3" stroke-linejoin="round"/>
    ${zipper}
    <path d="M186 110 L184 138 M214 110 L216 138" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>
    <rect x="181" y="136" width="6" height="10" rx="1" fill="#c9c9c9" stroke="#111" stroke-width="1"/>
    <rect x="213" y="136" width="6" height="10" rx="1" fill="#c9c9c9" stroke="#111" stroke-width="1"/>`;
}

function hoodieBlock(a, ink, seed) {
  const rnd = seededRandom(seed);
  return `
    <rect x="178" y="146" width="44" height="58" fill="${ink}"/>
    ${windowGrid({ x: 182, y: 152, cols: 3, rows: 4, w: 8, h: 8, stepX: 14, stepY: 12, rnd, chance: 0, on: a.accent, off: a.color })}
    <rect x="196" y="164" width="8" height="8" fill="${a.accent}"/>
    <text x="200" y="232" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="22" letter-spacing="2" fill="${ink}">PANELKA</text>
    <text x="200" y="245" text-anchor="middle" font-family="${FONT_MONO}" font-size="7" letter-spacing="2" fill="${ink}">EST. BLOCK 9</text>`;
}

function hoodieTape(a) {
  return `
    <g transform="rotate(-9 200 188)">
      <rect x="70" y="176" width="260" height="24" fill="${a.accent}"/>
      <text x="200" y="193" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="11.5" letter-spacing=".5" fill="#111">SKATEBOARDING IS NOT A CRIME</text>
    </g>
    <g transform="rotate(7 200 222)">
      <rect x="70" y="211" width="260" height="22" fill="${a.accent}"/>
      <text x="200" y="226" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="11" letter-spacing="1" fill="#111">DO NOT CROSS — DO NOT CROSS</text>
    </g>`;
}

function hoodieTag(a, ink) {
  return `
    <g transform="rotate(-8 200 200)">
      <text x="200" y="192" text-anchor="middle" font-family="${FONT_TAG}" font-size="40" fill="${a.accent}">chased</text>
      <rect x="160" y="194" width="3" height="16" rx="1.5" fill="${a.accent}"/>
      <rect x="203" y="194" width="3" height="10" rx="1.5" fill="${a.accent}"/>
      <rect x="231" y="194" width="3" height="20" rx="1.5" fill="${a.accent}"/>
      <text x="206" y="232" text-anchor="middle" font-family="${FONT_TAG}" font-size="22" fill="${ink}">since ’09</text>
    </g>`;
}

function hoodieWindow(a, ink) {
  let grid = '';
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const lit = r === 1 && c === 1;
      grid += `<rect x="${222 + c * 14}" y="${150 + r * 14}" width="10" height="10" fill="${lit ? a.accent : '#1a1f27'}" stroke="${ink}" stroke-width=".8"/>`;
    }
  }
  return `${grid}
    <text x="241" y="206" text-anchor="middle" font-family="${FONT_MONO}" font-size="8.5" font-weight="700" fill="${ink}">3:07 AM</text>
    <text x="96" y="240" text-anchor="middle" transform="rotate(-82 96 236)" font-family="${FONT_DISPLAY}" font-size="10" letter-spacing="2" fill="${ink}">LAST WINDOW</text>`;
}

/* =========================================================
   СТИКЕРПАКИ — несколько наклеек внахлёст.
   Каждая наклейка: <g transform="translate(x y) rotate(угол)">,
   то есть мы рисуем её вокруг точки (0,0), а потом сдвигаем и крутим.
   ========================================================= */
function drawStickers(a, uid, seed) {
  const shadow = `sticker-shadow-${uid}`;
  const packs = { district: stickersDistrict, tape: stickersTape, slaps: stickersSlaps, night: stickersNight };
  return `
    <defs>
      <filter id="${shadow}" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="4" stdDeviation="3" flood-opacity=".35"/>
      </filter>
    </defs>
    <g filter="url(#${shadow})">${packs[a.pack](uid, seed)}</g>`;
}

function stickersDistrict(uid, seed) {
  const rnd = seededRandom(seed);
  return `
    <g transform="translate(128 128) rotate(-10)">
      <circle r="70" fill="#ffd400" ${STICKER_EDGE}/>
      <rect x="-24" y="-44" width="48" height="60" fill="#1a1b1d"/>
      ${windowGrid({ x: -18, y: -38, cols: 3, rows: 4, w: 8, h: 8, stepX: 14, stepY: 13, rnd, chance: 0.3, on: '#ffd400', off: '#4a4b4e' })}
      <text y="44" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="20" letter-spacing="1" fill="#1a1b1d">PANELKA</text>
    </g>
    <g transform="translate(284 116) rotate(8)">
      <rect x="-78" y="-40" width="156" height="80" rx="10" fill="#3d6b73" ${STICKER_EDGE}/>
      <text y="4" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="30" letter-spacing="2" fill="#ece8de">GARAGE</text>
      <text y="30" text-anchor="middle" font-family="${FONT_TAG}" font-size="17" fill="#ffd400">box 47</text>
    </g>
    <g transform="translate(122 288) rotate(6)">
      <rect x="-58" y="-64" width="116" height="128" fill="#9a9a95" ${STICKER_EDGE}/>
      ${windowGrid({ x: -48, y: -54, cols: 6, rows: 7, w: 10, h: 10, stepX: 17, stepY: 16, rnd, chance: 0.22, on: '#ffcf5a', off: '#2a2b2d' })}
    </g>
    <g transform="translate(286 286) rotate(-12)">
      <polygon points="${starPoints(14, 74, 57)}" fill="#ff5a1f" ${STICKER_EDGE}/>
      <text y="-2" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="26" fill="#1a1b1d">KIOSK</text>
      <text y="26" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="24" fill="#fff">24/7</text>
    </g>`;
}

function stickersTape(uid) {
  const stripes = `hazard-${uid}`;
  const tape = (x, y, angle, fill, color, text) => `
    <g transform="translate(${x} ${y}) rotate(${angle})">
      <rect x="-172" y="-24" width="344" height="48" fill="${fill}" ${STICKER_EDGE}/>
      ${text ? `<text y="8" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="22" letter-spacing="1.5" fill="${color}">${text}</text>` : ''}
    </g>`;
  return `
    <defs>
      <pattern id="${stripes}" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="14" height="28" fill="#111"/><rect x="14" width="14" height="28" fill="#ffd400"/>
      </pattern>
    </defs>
    ${tape(200, 112, -16, '#ffd400', '#111', 'POLICE LINE — DO NOT CROSS')}
    ${tape(200, 206, 10, `url(#${stripes})`, '', '')}
    ${tape(200, 300, -5, '#111', '#ffd400', 'SKATE SPOT — KEEP OUT')}`;
}

function stickersSlaps() {
  const slap = (x, y, angle, color, tag) => `
    <g transform="translate(${x} ${y}) rotate(${angle})">
      <rect x="-88" y="-58" width="176" height="116" rx="8" fill="#fff" stroke="#dcdcdc" stroke-width="1"/>
      <path d="M-88 -50 Q-88 -58 -80 -58 H80 Q88 -58 88 -50 V-16 H-88 Z" fill="${color}"/>
      <path d="M-88 46 H88 V50 Q88 58 80 58 H-80 Q-88 58 -88 50 Z" fill="${color}"/>
      <text y="-31" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="24" letter-spacing="3" fill="#fff">HELLO</text>
      <text y="-20" text-anchor="middle" font-family="${FONT_MONO}" font-size="9" fill="#fff">my name is</text>
      <text y="30" text-anchor="middle" transform="rotate(-5)" font-family="${FONT_TAG}" font-size="34" fill="#111">${tag}</text>
    </g>`;
  return `
    ${slap(138, 118, -12, '#e0262b', 'PNLK')}
    ${slap(276, 150, 9, '#2a6bff', 'BLOCK9')}
    ${slap(128, 284, 6, '#e0262b', '')}
    ${slap(276, 292, -7, '#1d9e5a', '3AM')}`;
}

function stickersNight() {
  const glow = '#c6ff4a';
  return `
    <g transform="translate(132 128) rotate(-8)">
      <rect x="-70" y="-52" width="140" height="104" rx="16" fill="#141416" ${STICKER_EDGE}/>
      <path d="M-44 14 A44 44 0 0 1 0 -30 V14 Z" fill="#ff2a3a"/>
      <path d="M0 -30 A44 44 0 0 1 44 14 H0 Z" fill="#2a6bff"/>
      <rect x="-54" y="14" width="108" height="16" rx="4" fill="${glow}"/>
      <g stroke="${glow}" stroke-width="4" stroke-linecap="round">
        <line x1="-50" y1="-10" x2="-62" y2="-16"/><line x1="-40" y1="-30" x2="-50" y2="-42"/>
        <line x1="50" y1="-10" x2="62" y2="-16"/><line x1="40" y1="-30" x2="50" y2="-42"/>
      </g>
    </g>
    <g transform="translate(288 122) rotate(10)">
      <circle r="60" fill="${glow}" ${STICKER_EDGE}/>
      <text y="14" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="46" fill="#141416">RUN</text>
      <text y="40" text-anchor="middle" font-family="${FONT_TAG}" font-size="16" fill="#141416">faster</text>
    </g>
    <g transform="translate(142 292) rotate(14)">
      <path d="M-86 -16 H-34 L72 -56 V56 L-34 16 H-86 Z" fill="#141416" ${STICKER_EDGE}/>
      <path d="M-30 -11 L66 -48 V48 L-30 11 Z" fill="${glow}"/>
      <line x1="-72" y1="-16" x2="-72" y2="16" stroke="#3a3b3e" stroke-width="3"/>
      <line x1="-62" y1="-16" x2="-62" y2="16" stroke="#3a3b3e" stroke-width="3"/>
      <text x="28" y="-2" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="16" fill="#141416">WHO’S</text>
      <text x="28" y="16" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="16" fill="#141416">THERE?</text>
    </g>
    <g transform="translate(282 292) rotate(-10)">
      <rect x="-74" y="-48" width="148" height="96" rx="48" fill="#2c3440" ${STICKER_EDGE}/>
      <text y="-6" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="18" letter-spacing="2" fill="${glow}">SECURITY</text>
      <text y="30" text-anchor="middle" font-family="${FONT_TAG}" font-size="30" fill="#ece8de">zzz</text>
    </g>`;
}
