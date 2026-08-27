const filterConfig = [
  { key: "category", label: "珠寶分類", values: ["戒指", "項鏈", "吊墜", "耳環", "手鏈"] },
  { key: "collection", label: "系列", values: ["LUMEA", "ARIA", "ARIA BRIDAL", "MAREA", "SOLENNE", "AURORA", "TIDE"] },
  { key: "material", label: "材質", values: ["18K 黃金", "18K 白金", "18K 玫瑰金", "鉑金"] },
  { key: "gemstone", label: "寶石", values: ["鑽石", "藍寶石", "紅寶石", "珍珠", "無寶石"] },
  { key: "price", label: "價格", values: ["10,000 以下", "10,000–20,000", "20,000–40,000", "40,000 以上"] }
];

const params = new URLSearchParams(location.search);
const selected = Object.fromEntries(filterConfig.map((group) => [group.key, new Set(params.getAll(group.key))]));
const grid = document.querySelector("#catalogue-grid");
const filterGroups = document.querySelector("#filter-groups");
const searchInput = document.querySelector("#product-search");
const sortSelect = document.querySelector("#sort-select");
const activeFilters = document.querySelector("#active-filters");
const filterPanel = document.querySelector("#filter-panel");

searchInput.value = params.get("q") || "";
sortSelect.value = params.get("sort") || "featured";

function countFor(key, value) {
  if (key === "price") return IARA_PRODUCTS.filter((product) => matchPrice(product.price, value)).length;
  return IARA_PRODUCTS.filter((product) => product[key] === value).length;
}

filterGroups.innerHTML = filterConfig.map((group, index) => `<details class="filter-group" ${index < 2 ? "open" : ""}><summary>${group.label}</summary><div class="filter-options">${group.values.map((value) => `<label class="filter-option"><input type="checkbox" data-filter="${group.key}" value="${value}" ${selected[group.key].has(value) ? "checked" : ""} /><span>${value}</span><span>${countFor(group.key, value)}</span></label>`).join("")}</div></details>`).join("");

function matchPrice(price, value) {
  if (value === "10,000 以下") return price < 10000;
  if (value === "10,000–20,000") return price >= 10000 && price < 20000;
  if (value === "20,000–40,000") return price >= 20000 && price < 40000;
  return price >= 40000;
}

function productMatches(product) {
  const query = searchInput.value.trim().toLowerCase();
  if (query && !`${product.name} ${product.collection} ${product.category}`.toLowerCase().includes(query)) return false;
  return filterConfig.every((group) => {
    const values = selected[group.key];
    if (!values.size) return true;
    if (group.key === "price") return [...values].some((value) => matchPrice(product.price, value));
    return values.has(product[group.key]);
  });
}

function sortProducts(products) {
  const sort = sortSelect.value;
  if (sort === "price-asc") return products.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return products.sort((a, b) => b.price - a.price);
  if (sort === "newest") return products.sort((a, b) => (b.badge === "NEW") - (a.badge === "NEW") || b.id - a.id);
  return products.sort((a, b) => a.id - b.id);
}

function card(product) {
  const wished = IaraShop.getWishlist().has(product.id);
  return `<article class="catalogue-card">
    <div class="catalogue-card-image">
      <a class="catalogue-image-link" href="product.html?id=${product.id}" aria-label="查看 ${product.name}"><img src="${product.image}" alt="${product.name}" loading="lazy" /></a><span class="product-badge">${product.badge}</span>
      <button class="catalogue-wish ${wished ? "active" : ""}" data-wish="${product.id}" aria-label="${wished ? "取消收藏" : "收藏"} ${product.name}" aria-pressed="${wished}">${wished ? "♥" : "♡"}</button>
      <button class="catalogue-quick-add" data-add="${product.id}">${product.sizes.length > 1 ? "選擇尺寸" : "加入購物袋"}</button>
    </div>
    <div class="catalogue-card-info"><div class="catalogue-card-meta"><span>${product.collection}</span><span>${product.material}</span></div><h2><a href="product.html?id=${product.id}">${product.name}</a></h2><p>${IaraShop.formatPrice(product.price)}</p></div>
  </article>`;
}

function syncUrl() {
  const next = new URLSearchParams();
  filterConfig.forEach((group) => selected[group.key].forEach((value) => next.append(group.key, value)));
  if (searchInput.value.trim()) next.set("q", searchInput.value.trim());
  if (sortSelect.value !== "featured") next.set("sort", sortSelect.value);
  history.replaceState(null, "", `${location.pathname}${next.toString() ? `?${next}` : ""}`);
}

function renderActiveFilters() {
  const tags = [];
  filterConfig.forEach((group) => selected[group.key].forEach((value) => tags.push(`<button class="active-filter" data-remove-filter="${group.key}" data-value="${value}">${value}<span>×</span></button>`)));
  if (searchInput.value.trim()) tags.push(`<button class="active-filter" data-remove-search>「${searchInput.value.trim()}」<span>×</span></button>`);
  activeFilters.innerHTML = tags.join("");
  document.querySelector("#active-filter-count").textContent = tags.length || "";
}

function render() {
  const matches = sortProducts(IARA_PRODUCTS.filter(productMatches));
  grid.innerHTML = matches.map(card).join("");
  document.querySelector("#result-count").textContent = matches.length;
  document.querySelector("#no-results").hidden = matches.length > 0;
  renderActiveFilters();
  syncUrl();
}

filterGroups.addEventListener("change", (event) => {
  const input = event.target.closest("[data-filter]");
  if (!input) return;
  input.checked ? selected[input.dataset.filter].add(input.value) : selected[input.dataset.filter].delete(input.value);
  render();
});
sortSelect.addEventListener("change", render);
searchInput.addEventListener("input", render);
activeFilters.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.hasAttribute("data-remove-search")) searchInput.value = "";
  else {
    selected[button.dataset.removeFilter].delete(button.dataset.value);
    const checkbox = filterGroups.querySelector(`[data-filter="${button.dataset.removeFilter}"][value="${CSS.escape(button.dataset.value)}"]`);
    if (checkbox) checkbox.checked = false;
  }
  render();
});

function clearAll() {
  Object.values(selected).forEach((set) => set.clear());
  filterGroups.querySelectorAll("input").forEach((input) => { input.checked = false; });
  searchInput.value = "";
  render();
}
document.querySelector("#clear-filters").addEventListener("click", clearAll);
document.querySelector("[data-clear-all]").addEventListener("click", clearAll);

grid.addEventListener("click", (event) => {
  const add = event.target.closest("[data-add]");
  const wish = event.target.closest("[data-wish]");
  if (add || wish) event.preventDefault();
  if (add) {
    const product = IARA_PRODUCTS.find((item) => item.id === Number(add.dataset.add));
    if (product.sizes.length > 1) {
      location.href = `product.html?id=${product.id}`;
      return;
    }
    IaraShop.addCart(product.id, { size: product.sizes[0] });
    IaraUI.updateShopCounts();
    IaraUI.showShopToast(`${product.name} 已加入購物袋`);
  }
  if (wish) {
    const wishlist = IaraShop.toggleWishlist(wish.dataset.wish);
    const active = wishlist.has(Number(wish.dataset.wish));
    wish.classList.toggle("active", active);
    wish.textContent = active ? "♥" : "♡";
    wish.setAttribute("aria-pressed", String(active));
    IaraUI.updateShopCounts();
    IaraUI.showShopToast(active ? "作品已加入願望清單" : "作品已從願望清單移除");
  }
});

document.querySelector("#mobile-filter-trigger").addEventListener("click", () => { filterPanel.classList.add("open"); document.body.classList.add("locked"); });
document.querySelector("#filter-close").addEventListener("click", () => { filterPanel.classList.remove("open"); document.body.classList.remove("locked"); });
document.querySelector("#apply-filters").addEventListener("click", () => { filterPanel.classList.remove("open"); document.body.classList.remove("locked"); });
document.querySelector("#catalogue-search-trigger").addEventListener("click", () => { searchInput.focus(); searchInput.scrollIntoView({ behavior: "smooth", block: "center" }); });
document.querySelector("#wishlist-jump")?.addEventListener("click", () => IaraUI.showShopToast(`願望清單內有 ${IaraShop.getWishlist().size} 件作品`));

const menuTrigger = document.querySelector("#shop-menu-trigger");
const mobileNav = document.querySelector("#shop-mobile-nav");
menuTrigger.addEventListener("click", () => {
  const open = mobileNav.classList.toggle("open");
  menuTrigger.textContent = open ? "×" : "☰";
  menuTrigger.setAttribute("aria-expanded", String(open));
  mobileNav.setAttribute("aria-hidden", String(!open));
  document.body.classList.toggle("locked", open);
});

render();
