/* =========================================================
   products.js — КАТАЛОГ (только данные, никакой логики)

   Хочешь добавить товар — скопируй любой объект { ... },
   поменяй id (он должен быть уникальным) и остальные поля.
   Карточка на сайте появится сама: её строит app.js.

   Поля товара:
   id        — уникальное имя латиницей, без пробелов
   category  — к какой категории относится (id из CATEGORIES)
   kind      — маленькая подпись над названием
   name      — название
   price     — цена в долларах (число, без знака $)
   badge     — наклейка на карточке: New / Hot / Pro / Starter / Low stock (можно не указывать)
   desc      — описание
   sizes     — варианты размера (можно не указывать)
   sizeLabel — как называется размер: Width, Top tube... (по умолчанию Size)
   art       — настройки картинки для art.js (тип и цвета)

   ВАЖНО: для дюймов используем знак ″, а не обычную кавычку ",
   иначе он сломает HTML-атрибуты.
   ========================================================= */

const CATEGORIES = [
  { id: 'skate',    title: 'Skateboards',   note: 'Decks & completes. 7-ply maple, pressed for concrete, stairs and handrails.' },
  { id: 'bmx',      title: 'BMX Bikes',     note: '20″ street and park bikes. Built for stairs, rails and fast exits.' },
  { id: 'hoodies',  title: 'Hoodies',       note: 'Heavyweight cotton, own-brand prints. Warm enough for a November session.' },
  { id: 'stickers', title: 'Sticker Packs', note: 'Weatherproof vinyl. Made to survive on lamp posts and garage doors.' },
];

const PRODUCTS = [
  /* ---------- СКЕЙТБОРДЫ (дека в США ≈ $55–75, комплит ≈ $120–180) ---------- */
  {
    id: 'deck-block9',
    category: 'skate',
    kind: 'Deck',
    name: 'Block 9 Deck',
    price: 64.99,
    badge: 'New',
    desc: 'Nine floors of grey concrete and one window still on at 3 AM. 7-ply Canadian maple, medium concave.',
    sizeLabel: 'Width',
    sizes: ['8.0″', '8.25″', '8.5″'],
    art: { type: 'deck', graphic: 'block', bg: '#56585b', accent: '#ffd400' },
  },
  {
    id: 'deck-entrance3',
    category: 'skate',
    kind: 'Deck',
    name: 'Entrance Nº3 Deck',
    price: 59.99,
    desc: 'Tribute to the teal door with the broken buzzer and the eternal smell of fresh paint. Mellow concave.',
    sizeLabel: 'Width',
    sizes: ['7.75″', '8.0″', '8.25″'],
    art: { type: 'deck', graphic: 'door', bg: '#3d6b73', accent: '#ece8de' },
  },
  {
    id: 'complete-siren',
    category: 'skate',
    kind: 'Complete skateboard',
    name: 'Siren 3AM Complete',
    price: 139.99,
    badge: 'Hot',
    desc: 'Ready to roll: deck, 139 mm trucks, 53 mm 99A wheels, ABEC-7 bearings. Built for quick exits.',
    sizeLabel: 'Width',
    sizes: ['8.0″', '8.25″'],
    art: { type: 'deck', graphic: 'siren', bg: '#141416', complete: true },
  },
  {
    id: 'complete-garage',
    category: 'skate',
    kind: 'Pro complete',
    name: 'Garage Co-op Pro Complete',
    price: 164.99,
    desc: 'Pro setup: hollow trucks, 54 mm conical wheels, Swiss bearings. Graphic sprayed by the kid from box 47.',
    sizeLabel: 'Width',
    sizes: ['8.25″', '8.5″'],
    art: { type: 'deck', graphic: 'garage', bg: '#8a8d86', accent: '#ff5a1f', complete: true },
  },

  /* ---------- BMX (начальный ≈ $300–400, средний ≈ $450–600, про ≈ $700–1000) ---------- */
  {
    id: 'bmx-rustbelt',
    category: 'bmx',
    kind: 'Street BMX · 20″',
    name: 'Rust Belt 20″',
    price: 349,
    badge: 'Starter',
    desc: 'Hi-ten steel frame with a rust-patina finish, 25/9 gearing, two pegs. The perfect first bike for the garage rows.',
    sizeLabel: 'Top tube',
    sizes: ['20″', '20.5″'],
    art: { type: 'bike', frame: '#8b4a2b', accent: '#ece8de' },
  },
  {
    id: 'bmx-dvor',
    category: 'bmx',
    kind: 'Street BMX · 20″',
    name: 'Dvor 20″ Street',
    price: 449,
    desc: 'Chromoly main triangle, sealed mid BB, four pegs included. The courtyard bike that survives literally everything.',
    sizeLabel: 'Top tube',
    sizes: ['20.5″', '20.75″', '21″'],
    art: { type: 'bike', frame: '#d9d6ce', accent: '#1a1b1d' },
  },
  {
    id: 'bmx-podyezd',
    category: 'bmx',
    kind: 'Park BMX · 20″',
    name: 'Podyezd Park 20″',
    price: 579,
    desc: 'Park geometry, short rear end, 2-piece bars. Rides the ledges nobody is allowed to ride.',
    sizeLabel: 'Top tube',
    sizes: ['20.5″', '20.75″'],
    art: { type: 'bike', frame: '#3d6b73', accent: '#ffd400' },
  },
  {
    id: 'bmx-nightshift',
    category: 'bmx',
    kind: 'Pro BMX · 20″',
    name: 'Night Shift Pro 20″',
    price: 799,
    badge: 'Pro',
    desc: 'Full chromoly, freecoaster hub, sealed bearings everywhere. Silent enough to roll past the night guard.',
    sizeLabel: 'Top tube',
    sizes: ['20.75″', '21″'],
    art: { type: 'bike', frame: '#1a1b1d', accent: '#ff2a3a', rim: '#ff2a3a' },
  },

  /* ---------- ХУДИ (стритвир-худи в США ≈ $65–90) ---------- */
  {
    id: 'hoodie-panelka',
    category: 'hoodies',
    kind: 'Heavyweight hoodie',
    name: 'Panelka Heavy Hoodie',
    price: 78,
    badge: 'New',
    desc: '450 gsm cotton in concrete grey. Screen-printed panel block on the chest, one window left on.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    art: { type: 'hoodie', print: 'block', color: '#8e8e8c', ink: '#1a1b1d', accent: '#ffd400' },
  },
  {
    id: 'hoodie-notacrime',
    category: 'hoodies',
    kind: 'Oversized hoodie',
    name: 'Not A Crime Hoodie',
    price: 72,
    desc: 'Black oversized hoodie with a police-tape print across the chest. Say it louder for the guys in the back.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    art: { type: 'hoodie', print: 'tape', color: '#1d1d1f', ink: '#ece8de', accent: '#ffd400' },
  },
  {
    id: 'hoodie-chased',
    category: 'hoodies',
    kind: 'Boxy hoodie',
    name: 'Chased Since ’09 Hoodie',
    price: 74,
    badge: 'Low stock',
    desc: 'Army-green boxy fit with a marker-tag print. For those who know every shortcut through the courtyards.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    art: { type: 'hoodie', print: 'tag', color: '#48533f', ink: '#ece8de', accent: '#ff5a1f' },
  },
  {
    id: 'hoodie-lastwindow',
    category: 'hoodies',
    kind: 'Zip hoodie',
    name: 'Last Window Zip Hoodie',
    price: 86,
    desc: 'Full zip, brushed fleece inside. Window-grid print with one light still on at 3:07 AM.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    art: { type: 'hoodie', print: 'window', zip: true, color: '#2c3440', ink: '#9aa3ad', accent: '#ffd400' },
  },

  /* ---------- СТИКЕРПАКИ (≈ $5–12 за пак) ---------- */
  {
    id: 'stickers-district',
    category: 'stickers',
    kind: 'Sticker pack · 10 pcs',
    name: 'District Pack',
    price: 9.99,
    desc: '10 vinyl stickers: panel blocks, garages, the rusty swing and the legendary 24/7 kiosk.',
    art: { type: 'stickers', pack: 'district' },
  },
  {
    id: 'stickers-policeline',
    category: 'stickers',
    kind: 'Sticker pack · 6 pcs',
    name: 'Police Line Pack',
    price: 7.99,
    desc: '6 long tape-style stickers. Mark your spot before anyone else does.',
    art: { type: 'stickers', pack: 'tape' },
  },
  {
    id: 'stickers-slaps',
    category: 'stickers',
    kind: 'Slap kit · 30 pcs',
    name: 'Slap Tag Starter Kit',
    price: 11.99,
    badge: 'Hot',
    desc: '25 blank “Hello my name is” slaps for your tag + 5 printed ones. Marker not included.',
    art: { type: 'stickers', pack: 'slaps' },
  },
  {
    id: 'stickers-nightshift',
    category: 'stickers',
    kind: 'Glow pack · 8 pcs',
    name: 'Night Shift Glow Pack',
    price: 8.99,
    desc: '8 glow-in-the-dark stickers: sirens, flashlights and one very sleepy security guard.',
    art: { type: 'stickers', pack: 'night' },
  },
];
