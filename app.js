/* =========================================================
   app.js — вся «живая» логика сайта
   1. Утилиты
   2. Витрина: фильтры и карточки
   3. Корзина: хранение, добавление, отрисовка
   4. Оформление заказа (условное)
   5. Hero: панельки с окнами
   6. Запуск
   ========================================================= */

/* ---------- 1. УТИЛИТЫ ---------- */

// Короткие имена для поиска элементов на странице
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Форматирование денег по-американски: 64.99 → "$64.99"
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

// Цена для карточки: крупные доллары и мелкие центы — "$64<small>.99</small>"
function priceHTML(value) {
  const [dollars, cents] = usd.format(value).split('.');
  return `${dollars}<small>.${cents}</small>`;
}

// Быстрый поиск товара по id: productById['deck-block9'] → объект товара
const productById = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

/* ---------- 2. ВИТРИНА ---------- */

function renderFilters() {
  const buttons = [{ id: 'all', title: 'All', count: PRODUCTS.length }].concat(
    CATEGORIES.map((c) => ({ ...c, count: PRODUCTS.filter((p) => p.category === c.id).length }))
  );
  $('#filters').innerHTML = buttons
    .map((b, i) => `
      <button type="button" class="filter" data-filter="${b.id}" aria-pressed="${i === 0}">
        ${b.title} <span class="num">${b.count}</span>
      </button>`)
    .join('');
}

// HTML одной карточки товара. Шаблонная строка `...${переменная}...` —
// удобный способ собрать кусок HTML из данных.
function cardHTML(p) {
  const badge = p.badge
    ? `<span class="badge" data-badge="${p.badge.toLowerCase().replace(/\s+/g, '-')}">${p.badge}</span>`
    : '';

  // Размеры — это радиокнопки: выбрать можно только один вариант.
  // По умолчанию выбран средний размер.
  const defaultSize = p.sizes ? Math.floor((p.sizes.length - 1) / 2) : -1;
  const sizes = p.sizes
    ? `
      <fieldset class="sizes">
        <legend>${p.sizeLabel || 'Size'}</legend>
        <div class="chips">
          ${p.sizes.map((s, i) => `
            <label class="chip">
              <input type="radio" name="size-${p.id}" value="${s}" ${i === defaultSize ? 'checked' : ''}>
              <span>${s}</span>
            </label>`).join('')}
        </div>
      </fieldset>`
    : '';

  return `
    <article class="card">
      <div class="card-media">${badge}${productArt(p)}</div>
      <div class="card-body">
        <p class="card-kind">${p.kind}</p>
        <h4 class="card-title">${p.name}</h4>
        <p class="card-desc">${p.desc}</p>
        ${sizes}
        <div class="card-foot">
          <p class="price">${priceHTML(p.price)}</p>
          <button type="button" class="btn btn-primary btn-add" data-add="${p.id}">Add to cart</button>
        </div>
      </div>
    </article>`;
}

// Весь каталог: для каждой категории — заголовок и сетка карточек
function renderCatalog() {
  $('#catalog').innerHTML = CATEGORIES.map((cat) => {
    const items = PRODUCTS.filter((p) => p.category === cat.id);
    return `
      <section class="category" data-category="${cat.id}" aria-labelledby="cat-${cat.id}">
        <header class="category-head">
          <h3 id="cat-${cat.id}">${cat.title}</h3>
          <span class="count">${items.length} items</span>
          <p>${cat.note}</p>
        </header>
        <div class="grid">${items.map(cardHTML).join('')}</div>
      </section>`;
  }).join('');
}

// Клик по фильтру: подсвечиваем кнопку и прячем лишние категории.
// Слушаем клик на общем контейнере, а не на каждой кнопке —
// это называется «делегирование событий».
function onFilterClick(event) {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  const filter = button.dataset.filter;

  $$('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
  $$('.category').forEach((section) => {
    section.hidden = filter !== 'all' && section.dataset.category !== filter;
  });

  // Если фильтр «уехал» наверх — вернём пользователя к началу каталога
  const top = $('#catalog').getBoundingClientRect().top;
  if (top < 0) $('#filters').scrollIntoView({ block: 'start' });
}

/* ---------- 3. КОРЗИНА ---------- */

// Корзина — это массив строк вида { id, size, qty }.
// Храним её в localStorage — памяти браузера, которая переживает перезагрузку.
const CART_KEY = 'panelka-cart';
const FREE_SHIPPING_FROM = 100;
const SHIPPING_PRICE = 9.99;

let cart = loadCart();

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY));
    // Выкидываем товары, которых больше нет в каталоге
    return Array.isArray(saved) ? saved.filter((line) => productById[line.id]) : [];
  } catch {
    return []; // приватный режим или битые данные — начинаем с пустой корзины
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    /* браузер запретил хранилище — корзина просто не запомнится */
  }
}

function addToCart(id, size) {
  // Одинаковый товар одного размера не дублируем, а увеличиваем количество
  const line = cart.find((l) => l.id === id && l.size === size);
  if (line) line.qty += 1;
  else cart.push({ id, size, qty: 1 });
  saveCart();
  renderCart();
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) return removeLine(index);
  saveCart();
  renderCart();
  // Список перерисован заново — возвращаем фокус на ту же кнопку (важно для клавиатуры)
  $(`[data-${delta > 0 ? 'inc' : 'dec'}="${index}"]`)?.focus();
}

function removeLine(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
  // Строки с нажатой кнопкой больше нет — без этого фокус «упал» бы на <body>.
  // Переводим его на «Remove» соседнего товара, а если корзина пуста — на «Go shopping».
  const next = $(`[data-remove="${Math.min(index, cart.length - 1)}"]`) || $('#cartEmpty [data-close]');
  next.focus();
}

// Считаем суммы. pickup = самовывоз (доставка бесплатная)
function getTotals(pickup = false) {
  const subtotal = cart.reduce((sum, l) => sum + productById[l.id].price * l.qty, 0);
  const count = cart.reduce((n, l) => n + l.qty, 0);
  const shipping = pickup || subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_PRICE;
  return { subtotal, shipping, total: subtotal + shipping, count };
}

// Перерисовываем всё, что зависит от корзины
function renderCart() {
  const { subtotal, shipping, total, count } = getTotals();

  // Счётчик на кнопке в шапке
  const counter = $('#cartCount');
  counter.textContent = count;
  counter.hidden = count === 0;
  $('#cartOpen').setAttribute('aria-label', `Open cart, ${count} item${count === 1 ? '' : 's'}`);

  // Список товаров
  $('#cartList').innerHTML = cart.map((line, index) => {
    const p = productById[line.id];
    return `
      <li class="cart-item">
        <div class="cart-thumb">${productArt(p, `cart-${index}`)}</div>
        <div class="cart-info">
          <p class="cart-name">${p.name}</p>
          <p class="cart-meta">${line.size ? `${p.sizeLabel || 'Size'}: ${line.size} · ` : ''}${usd.format(p.price)}</p>
          <div class="qty">
            <button type="button" data-dec="${index}" aria-label="Decrease quantity of ${p.name}">−</button>
            <span>${line.qty}</span>
            <button type="button" data-inc="${index}" aria-label="Increase quantity of ${p.name}">+</button>
          </div>
        </div>
        <div class="cart-line-end">
          <strong>${usd.format(p.price * line.qty)}</strong>
          <button type="button" class="remove" data-remove="${index}" aria-label="Remove ${p.name}">Remove</button>
        </div>
      </li>`;
  }).join('');

  const empty = cart.length === 0;
  $('#cartList').hidden = empty;
  $('#cartEmpty').hidden = !empty;
  $('.summary').hidden = empty;

  $('#subtotal').textContent = usd.format(subtotal);
  $('#shipping').textContent = shipping === 0 ? 'Free' : usd.format(shipping);
  $('#total').textContent = usd.format(total);
  $('#shipHint').textContent = subtotal >= FREE_SHIPPING_FROM
    ? 'Free shipping unlocked. Respect.'
    : `Add ${usd.format(FREE_SHIPPING_FROM - subtotal)} more for free shipping`;

  updateCheckout();
}

// Анимация «подпрыгивания» кнопки корзины
function bumpCartButton() {
  const button = $('#cartOpen');
  button.classList.remove('bump');
  void button.offsetWidth; // трюк: заставляет браузер перезапустить анимацию
  button.classList.add('bump');
}

// Всплывающее уведомление внизу экрана
let toastTimer;
function showToast(html) {
  const toast = $('#toast');
  toast.innerHTML = html;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// Клик по «Add to cart» в любой карточке
function onCatalogClick(event) {
  const button = event.target.closest('[data-add]');
  if (!button) return;

  const product = productById[button.dataset.add];
  const checked = button.closest('.card').querySelector('input[type="radio"]:checked');
  const size = checked ? checked.value : null;

  addToCart(product.id, size);
  bumpCartButton();
  showToast(`
    <span>✔ <b>${product.name}</b>${size ? ` (${size})` : ''} added</span>
    <button type="button" data-open-cart>View cart</button>`);

  // Кнопка на секунду показывает «Added ✓»
  button.textContent = 'Added ✓';
  button.classList.add('is-added');
  setTimeout(() => {
    button.textContent = 'Add to cart';
    button.classList.remove('is-added');
  }, 1200);
}

/* ---------- 4. ОФОРМЛЕНИЕ ЗАКАЗА ----------
   Корзина живёт в <dialog>. Внутри три «экрана» (data-view):
   cart → checkout → done. Показываем один, остальные прячем. */

const drawer = $('#cartDrawer');
const form = $('#checkoutForm');

function showView(name) {
  $$('.drawer-view', drawer).forEach((view) => {
    view.hidden = view.dataset.view !== name;
  });
  $('#drawerTitle').textContent = { cart: 'Your cart', checkout: 'Checkout', done: 'Thank you' }[name];
}

function openCart() {
  showView('cart');
  drawer.showModal(); // встроенный метод <dialog>: открыть поверх страницы
}

const isPickup = () => form.elements.delivery.value === 'pickup';

// Обновляем итог на кнопке и мини-сводку при смене доставки
function updateCheckout() {
  const pickup = isPickup();
  const { subtotal, shipping, total, count } = getTotals(pickup);

  // При самовывозе адрес не нужен: отключаем поля — и браузер их не проверяет
  $('#addressFields').disabled = pickup;
  $('#addressFields').hidden = pickup;

  const courier = getTotals(false).shipping;
  $('#courierNote').textContent = `3–5 days · ${courier === 0 ? 'free' : usd.format(courier)}`;

  $('#checkoutSummary').innerHTML = `
    <div class="row"><span>${count} item${count === 1 ? '' : 's'}</span><span>${usd.format(subtotal)}</span></div>
    <div class="row"><span>Shipping</span><span>${shipping === 0 ? 'Free' : usd.format(shipping)}</span></div>`;
  $('#placeOrder').textContent = `Place order · ${usd.format(total)}`;
}

function onCheckoutSubmit(event) {
  // Не даём форме уйти на сервер — сервера у нас нет, магазин условный.
  // Сюда мы попадаем, только если браузер уже проверил обязательные поля.
  event.preventDefault();

  const firstName = form.elements.fullName.value.trim().split(/\s+/)[0];
  const { total } = getTotals(isPickup());
  const orderNumber = 'PNL-' + Math.floor(100000 + Math.random() * 900000);

  $('#orderNumber').textContent = `Order ${orderNumber}`;
  $('#orderText').textContent =
    `Thanks, ${firstName}! Your order for ${usd.format(total)} is “confirmed”. ` +
    'This is a demo store, so nothing will be shipped and no money was charged. But thanks for the vibe.';

  cart = [];
  saveCart();
  form.reset();
  renderCart();
  showView('done');
  // Кнопка «Place order» спряталась вместе с формой — переносим фокус на «штамп»,
  // чтобы экранный диктор сразу прочитал «Order accepted» (tabindex="-1" в HTML).
  $('.done-stamp').focus();
}

/* ---------- 5. HERO: ПАНЕЛЬКИ С ОКНАМИ ----------
   Рисуем ряд домов разной этажности. Окна случайно горят,
   некоторые мерцают (класс flicker), а в паре светится телевизор. */
function buildSkyline() {
  const W = 1600;
  const H = 520;
  const FLOOR = 24;
  const types = [
    { floors: 5, width: [230, 300] },  // хрущёвка
    { floors: 9, width: [190, 260] },  // брежневка
    { floors: 12, width: [120, 160] },
    { floors: 16, width: [100, 130] },
  ];
  const random = (min, max) => min + Math.random() * (max - min);

  // Дальний ряд — просто тёмные силуэты
  let back = '';
  for (let x = -40; x < W; ) {
    const w = random(120, 260);
    const h = random(300, 480);
    back += `<rect x="${x.toFixed(0)}" y="${(H - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}"/>`;
    x += w + random(10, 40);
  }

  // Ближний ряд — дома с окнами
  let front = '';
  for (let x = -20; x < W; ) {
    const type = types[Math.floor(Math.random() * types.length)];
    const w = Math.round(random(...type.width));
    const h = type.floors * FLOOR + 18;
    const y = H - h;
    front += `<rect class="bldg" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
    front += `<rect class="roof" x="${x + w * 0.2}" y="${y - 10}" width="${w * 0.18}" height="10"/>`;

    const cols = Math.floor((w - 16) / 20);
    const startX = x + (w - cols * 20) / 2 + 5;
    for (let f = 0; f < type.floors; f++) {
      for (let c = 0; c < cols; c++) {
        const r = Math.random();
        let cls = 'win';
        let style = '';
        if (r < 0.1) {
          cls += ' lit';
          if (Math.random() < 0.25) {
            cls += ' flicker';
            style = ` style="animation-delay:${random(0, 6).toFixed(2)}s"`;
          }
        } else if (r < 0.13) {
          cls += ' tv';
        }
        front += `<rect class="${cls}" x="${startX + c * 20}" y="${y + 12 + f * FLOOR}" width="10" height="12"${style}/>`;
      }
    }
    x += w + Math.round(random(18, 60));
  }

  $('#skyline').innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice">
      <g class="back">${back}</g>
      <g class="front">${front}</g>
    </svg>`;
}

/* ---------- 6. ЗАПУСК ---------- */

renderFilters();
renderCatalog();
renderCart();
buildSkyline();
$('#year').textContent = new Date().getFullYear();

$('#filters').addEventListener('click', onFilterClick);
$('#catalog').addEventListener('click', onCatalogClick);
$('#cartOpen').addEventListener('click', openCart);

// Кнопка «View cart» внутри уведомления
document.addEventListener('click', (event) => {
  if (event.target.closest('[data-open-cart]')) openCart();
});

// Все клики внутри корзины обрабатываем в одном месте
drawer.addEventListener('click', (event) => {
  const t = event.target;
  // Клик по затемнённому фону вокруг панели — событие приходит на сам <dialog>
  if (t === drawer || t.closest('[data-close]')) return drawer.close();
  if (t.closest('[data-back]')) {
    showView('cart');
    return $('#toCheckout').focus(); // возвращаемся туда, откуда ушли в оформление
  }

  const inc = t.closest('[data-inc]');
  const dec = t.closest('[data-dec]');
  const remove = t.closest('[data-remove]');
  if (inc) changeQty(Number(inc.dataset.inc), +1);
  if (dec) changeQty(Number(dec.dataset.dec), -1);
  if (remove) removeLine(Number(remove.dataset.remove));
});

$('#toCheckout').addEventListener('click', () => {
  showView('checkout');
  $('#fullName').focus();
});

form.addEventListener('change', updateCheckout);
form.addEventListener('submit', onCheckoutSubmit);
