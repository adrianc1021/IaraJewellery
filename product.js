const productParams = new URLSearchParams(location.search);
const productId = Number(productParams.get("id")) || 1;
const product = IARA_PRODUCTS.find((item) => item.id === productId) || IARA_PRODUCTS[0];
let selectedSize = "";

document.title = `${product.name} | Iara Jewellery`;
document.querySelector("#page-description").content = product.description;
document.querySelector("#breadcrumb-name").textContent = product.name;
document.querySelector("#product-collection").textContent = product.collection;
document.querySelector("#product-name").textContent = product.name;
document.querySelector("#product-price").textContent = IaraShop.formatPrice(product.price);
document.querySelector("#product-material").textContent = product.material;
document.querySelector("#product-gemstone").textContent = product.gemstone;
document.querySelector("#product-description").textContent = product.description;
document.querySelector("#product-availability").textContent = product.availability;
document.querySelector("#product-details-copy").textContent = product.details;
document.querySelector("#story-description").textContent = product.description;

const mainImage = document.querySelector("#main-product-image");
const storyImage = document.querySelector("#story-image");
mainImage.src = product.images[0];
mainImage.alt = product.name;
document.querySelector("#lightbox-image").src = product.images[0];
document.querySelector("#lightbox-image").alt = product.name;
storyImage.src = product.images[1] || product.images[0];
document.querySelector("#thumbnail-list").innerHTML = product.images.map((image, index) => `<button class="thumbnail-button ${index === 0 ? "active" : ""}" data-image="${image}" aria-label="查看圖片 ${index + 1}"><img src="${image}" alt="${product.name} 圖片 ${index + 1}" /></button>`).join("");

document.querySelector("#thumbnail-list").addEventListener("click", (event) => {
  const thumbnail = event.target.closest("[data-image]");
  if (!thumbnail) return;
  mainImage.style.opacity = "0";
  setTimeout(() => { mainImage.src = thumbnail.dataset.image; mainImage.style.opacity = "1"; }, 150);
  document.querySelectorAll(".thumbnail-button").forEach((button) => button.classList.toggle("active", button === thumbnail));
});

const sizeOptions = document.querySelector("#size-options");
sizeOptions.innerHTML = product.sizes.map((size) => `<button class="size-option" data-size="${size}" role="radio" aria-checked="false">${size}</button>`).join("");
const sizeGuideButton = document.querySelector("#size-guide");
const isRing = product.category === "戒指";
sizeGuideButton.hidden = product.sizes.length === 1;
document.querySelector("#size-modal-title").textContent = isRing ? "戒指尺寸指南" : "珠寶尺寸指南";
document.querySelector("#size-modal-copy").textContent = isRing ? "以軟尺量度手指最寬處的周長，保持貼合但不要拉緊。介乎兩個尺寸之間時，建議選擇較大尺寸。" : "項鏈長度會影響吊墜落點，手鏈及手鐲則應預留約一指鬆位。歡迎預約到店，由珠寶顧問協助量度。";
document.querySelector("#ring-size-table").hidden = !isRing;
sizeOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-size]");
  if (!button) return;
  selectedSize = button.dataset.size;
  document.querySelectorAll(".size-option").forEach((option) => {
    const active = option === button;
    option.classList.toggle("selected", active);
    option.setAttribute("aria-checked", String(active));
  });
  document.querySelector("#size-error").textContent = "";
});

document.querySelector("#product-add").addEventListener("click", () => {
  if (!selectedSize) {
    document.querySelector("#size-error").textContent = "請先選擇尺寸。";
    sizeOptions.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  IaraShop.addCart(product.id, { size: selectedSize });
  IaraUI.updateShopCounts();
  IaraUI.showShopToast(`${product.name}（${selectedSize}）已加入購物袋`);
});

const wishButton = document.querySelector("#product-wish");
function renderWish() {
  const active = IaraShop.getWishlist().has(product.id);
  wishButton.classList.toggle("active", active);
  wishButton.textContent = active ? "♥" : "♡";
  wishButton.setAttribute("aria-pressed", String(active));
  wishButton.setAttribute("aria-label", active ? "從願望清單移除" : "加入願望清單");
}
wishButton.addEventListener("click", () => {
  const wishlist = IaraShop.toggleWishlist(product.id);
  renderWish();
  IaraUI.updateShopCounts();
  IaraUI.showShopToast(wishlist.has(product.id) ? "作品已加入願望清單" : "作品已從願望清單移除");
});
renderWish();

const lightbox = document.querySelector("#image-lightbox");
document.querySelector("#main-image-button").addEventListener("click", () => {
  document.querySelector("#lightbox-image").src = mainImage.src;
  document.querySelector("#lightbox-image").alt = product.name;
  lightbox.classList.add("active");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("locked");
});
function closeLightbox() { lightbox.classList.remove("active"); lightbox.setAttribute("aria-hidden", "true"); document.body.classList.remove("locked"); }
document.querySelector("#lightbox-close").addEventListener("click", closeLightbox);

const sizeModal = document.querySelector("#size-modal");
function toggleSizeModal(open) {
  sizeModal.classList.toggle("active", open);
  sizeModal.setAttribute("aria-hidden", String(!open));
  document.querySelector("#overlay").classList.toggle("active", open);
  document.body.classList.toggle("locked", open);
}
sizeGuideButton.addEventListener("click", () => toggleSizeModal(true));
document.querySelector("#size-modal-close").addEventListener("click", () => toggleSizeModal(false));
document.querySelector("#overlay").addEventListener("click", () => { if (sizeModal.classList.contains("active")) toggleSizeModal(false); });

const related = IARA_PRODUCTS.filter((item) => item.id !== product.id && (item.collection === product.collection || item.category === product.category)).slice(0, 4);
const fallbackRelated = [...related, ...IARA_PRODUCTS.filter((item) => item.id !== product.id && !related.includes(item))].slice(0, 4);
document.querySelector("#related-grid").innerHTML = fallbackRelated.map((item) => `<article class="related-card"><a class="related-card-image" href="product.html?id=${item.id}"><img src="${item.image}" alt="${item.name}" loading="lazy" /></a><div><small>${item.collection}</small><h3><a href="product.html?id=${item.id}">${item.name}</a></h3><p>${IaraShop.formatPrice(item.price)}</p></div></article>`).join("");

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") { closeLightbox(); toggleSizeModal(false); }
});
