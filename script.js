const products = IARA_PRODUCTS.slice(0, 4);
const state = { cart: IaraShop.getCart(), wishlist: IaraShop.getWishlist(), language: "zh" };
const productGrid = document.querySelector("#product-grid");
const overlay = document.querySelector("#overlay");
const cartDrawer = document.querySelector("#cart-drawer");
const searchDrawer = document.querySelector("#search-drawer");
const appointmentModal = document.querySelector("#appointment-modal");
const toast = document.querySelector("#toast");
let toastTimer;

function productCard(product) {
  const wished = state.wishlist.has(product.id);
  return `<article class="product-card" data-product="${product.id}">
    <div class="product-image">
      <a class="product-main-link" href="product.html?id=${product.id}"><img src="${product.image}" alt="${product.name}" loading="lazy" /></a>
      <span class="product-badge">${product.badge}</span>
      <button class="wish-button ${wished ? "active" : ""}" data-wish="${product.id}" aria-label="收藏 ${product.name}" aria-pressed="${wished}">${wished ? "♥" : "♡"}</button>
      <button class="quick-add" data-add="${product.id}">${product.sizes.length > 1 ? "選擇尺寸" : "加入購物袋"}</button>
    </div>
    <div class="product-info"><p class="product-collection">${product.collection}</p><h3><a href="product.html?id=${product.id}">${product.name}</a></h3><p class="product-price">${IaraShop.formatPrice(product.price)}</p></div>
  </article>`;
}

productGrid.innerHTML = products.map(productCard).join("");

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function openPanel(panel) {
  [cartDrawer, searchDrawer, appointmentModal].forEach((item) => {
    item.classList.remove("active");
    item.setAttribute("aria-hidden", "true");
  });
  panel.classList.add("active");
  panel.setAttribute("aria-hidden", "false");
  overlay.classList.add("active");
  document.body.classList.add("locked");
  setTimeout(() => panel.querySelector("input, button")?.focus(), 100);
}

function closePanels() {
  [cartDrawer, searchDrawer, appointmentModal].forEach((item) => {
    item.classList.remove("active");
    item.setAttribute("aria-hidden", "true");
  });
  overlay.classList.remove("active");
  document.body.classList.remove("locked");
}

function updateCounts() {
  const cartCount = state.cart.length;
  const wishCount = state.wishlist.size;
  document.querySelector("#cart-count").textContent = cartCount;
  document.querySelector("#cart-count").dataset.count = cartCount;
  document.querySelector("#wishlist-count").textContent = wishCount;
  document.querySelector("#wishlist-count").dataset.count = wishCount;
  document.querySelector("#cart-title-count").textContent = `(${cartCount})`;
}

function renderCart() {
  const cartContent = document.querySelector("#cart-content");
  if (!state.cart.length) {
    cartContent.innerHTML = `<div class="empty-state"><span>◇</span><h3>你的購物袋仍是空的</h3><p>讓一件閃耀新作陪你回家。</p><button class="button button-dark" data-close>探索新品</button></div>`;
    return;
  }
  const total = state.cart.reduce((sum, item) => sum + item.price, 0);
  cartContent.innerHTML = `${state.cart.map((item, index) => `<div class="cart-item"><img src="${item.image}" alt="${item.name}" /><div><small>${item.collection}</small><h3><a href="product.html?id=${item.id}">${item.name}</a></h3>${item.selectedSize ? `<p>尺寸：${item.selectedSize}</p>` : ""}<p>${IaraShop.formatPrice(item.price)}</p></div><button class="cart-remove" data-remove="${index}" aria-label="移除 ${item.name}">×</button></div>`).join("")}<div class="cart-summary"><p><span>小計</span><strong>${IaraShop.formatPrice(total)}</strong></p><button class="button button-dark" id="checkout-button">前往結帳</button></div>`;
}

productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const wishButton = event.target.closest("[data-wish]");
  if (addButton) {
    const product = products.find((item) => item.id === Number(addButton.dataset.add));
    if (product.sizes.length > 1) {
      location.href = `product.html?id=${product.id}`;
      return;
    }
    IaraShop.addCart(product.id, { size: product.sizes[0] });
    state.cart = IaraShop.getCart();
    updateCounts();
    renderCart();
    showToast(`${product.name} 已加入購物袋`);
  }
  if (wishButton) {
    const id = Number(wishButton.dataset.wish);
    const product = products.find((item) => item.id === id);
    const wasWished = state.wishlist.has(id);
    state.wishlist = IaraShop.toggleWishlist(id);
    if (wasWished) {
      wishButton.classList.remove("active");
      wishButton.textContent = "♡";
      wishButton.setAttribute("aria-pressed", "false");
      showToast(`已從願望清單移除 ${product.name}`);
    } else {
      wishButton.classList.add("active");
      wishButton.textContent = "♥";
      wishButton.setAttribute("aria-pressed", "true");
      showToast(`${product.name} 已收藏`);
    }
    updateCounts();
  }
});

document.querySelector("#cart-trigger").addEventListener("click", () => { renderCart(); openPanel(cartDrawer); });
document.querySelector("#search-trigger").addEventListener("click", () => openPanel(searchDrawer));
document.querySelectorAll("[data-open-appointment]").forEach((button) => button.addEventListener("click", () => openPanel(appointmentModal)));
document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", closePanels));
overlay.addEventListener("click", closePanels);
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closePanels(); });

cartDrawer.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove]");
  if (removeButton) {
    IaraShop.removeCart(Number(removeButton.dataset.remove));
    state.cart = IaraShop.getCart();
    updateCounts();
    renderCart();
    showToast("商品已從購物袋移除");
  }
  if (event.target.closest("#checkout-button")) showToast("安全結帳功能將於正式商店版本啟用");
  if (event.target.closest("[data-close]")) closePanels();
});

const searchInput = document.querySelector("#search-input");
const searchResults = document.querySelector("#search-results");
function renderSearch(query) {
  const term = query.trim().toLowerCase();
  if (!term) {
    searchResults.innerHTML = `<p class="drawer-label">熱門搜尋</p><div class="search-tags"><button>鑽石戒指</button><button>Lumea</button><button>結婚對戒</button><button>送禮</button></div>`;
    return;
  }
  const matches = IARA_PRODUCTS.filter((product) => `${product.name} ${product.collection} ${product.category}`.toLowerCase().includes(term)).slice(0, 6);
  searchResults.innerHTML = matches.length ? `<p class="drawer-label">找到 ${matches.length} 件作品</p>${matches.map((product) => `<a class="search-result" href="product.html?id=${product.id}"><img src="${product.image}" alt="" /><div><h3>${product.name}</h3><p>${IaraShop.formatPrice(product.price)}</p></div></a>`).join("")}` : `<div class="empty-state"><h3>未找到相符作品</h3><p>試試「戒指」、「Lumea」或「鑽石」。</p></div>`;
}
searchInput.addEventListener("input", () => renderSearch(searchInput.value));
searchResults.addEventListener("click", (event) => {
  const tag = event.target.closest("button");
  if (tag) { searchInput.value = tag.textContent; renderSearch(searchInput.value); }
  if (event.target.closest("[data-close]")) closePanels();
});

const menuTrigger = document.querySelector("#menu-trigger");
const mobileMenu = document.querySelector("#mobile-menu");
menuTrigger.addEventListener("click", () => {
  const open = mobileMenu.classList.toggle("open");
  menuTrigger.textContent = open ? "×" : "☰";
  menuTrigger.setAttribute("aria-expanded", String(open));
  mobileMenu.setAttribute("aria-hidden", String(!open));
  document.body.classList.toggle("locked", open);
});
mobileMenu.addEventListener("click", (event) => {
  if (event.target.closest("a") || event.target.closest("[data-open-appointment]")) {
    mobileMenu.classList.remove("open");
    menuTrigger.textContent = "☰";
    menuTrigger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("locked");
  }
});

document.querySelector("#appointment-form").addEventListener("submit", (event) => {
  event.preventDefault();
  event.target.style.display = "none";
  document.querySelector(".modal-copy").style.display = "none";
  document.querySelector("#appointment-success").style.display = "flex";
});

document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#newsletter-email");
  document.querySelector("#newsletter-note").textContent = `謝謝你，品牌通訊將寄送至 ${input.value}`;
  input.value = "";
});

document.querySelector("#language-button").addEventListener("click", (event) => {
  state.language = state.language === "zh" ? "en" : "zh";
  event.target.textContent = state.language === "zh" ? "EN" : "繁";
  document.documentElement.lang = state.language === "zh" ? "zh-HK" : "en-HK";
  showToast(state.language === "zh" ? "已切換至繁體中文" : "English edition selected");
});
document.querySelector("#wishlist-trigger").addEventListener("click", () => showToast(state.wishlist.size ? `願望清單內有 ${state.wishlist.size} 件作品` : "你的願望清單仍是空的"));
document.querySelector("#cookie-button").addEventListener("click", () => showToast("Cookie 偏好設定已開啟"));

window.addEventListener("scroll", () => document.querySelector("#site-header").classList.toggle("scrolled", window.scrollY > 45), { passive: true });
updateCounts();
