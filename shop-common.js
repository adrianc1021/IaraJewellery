(function () {
  const cartCount = document.querySelector("#cart-count");
  const wishlistCount = document.querySelector("#wishlist-count");

  function updateShopCounts() {
    const cartLength = IaraShop.getCartIds().length;
    const wishlistLength = IaraShop.getWishlist().size;
    if (cartCount) {
      cartCount.textContent = cartLength;
      cartCount.dataset.count = cartLength;
    }
    if (wishlistCount) {
      wishlistCount.textContent = wishlistLength;
      wishlistCount.dataset.count = wishlistLength;
    }
  }

  function showShopToast(message) {
    const toast = document.querySelector("#toast");
    if (!toast) return;
    clearTimeout(window.iaraToastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    window.iaraToastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  function renderMiniCart() {
    const content = document.querySelector("#cart-content");
    const titleCount = document.querySelector("#cart-title-count");
    if (!content) return;
    const cart = IaraShop.getCart();
    if (titleCount) titleCount.textContent = `(${cart.length})`;
    if (!cart.length) {
      content.innerHTML = `<div class="empty-state"><span>◇</span><h3>你的購物袋仍是空的</h3><p>讓一件閃耀新作陪你回家。</p><a class="button button-dark" href="catalogue.html">探索所有珠寶</a></div>`;
      return;
    }
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    content.innerHTML = `${cart.map((item, index) => `<div class="cart-item"><img src="${item.image}" alt="${item.name}" /><div><small>${item.collection}</small><h3><a href="product.html?id=${item.id}">${item.name}</a></h3>${item.selectedSize ? `<p>尺寸：${item.selectedSize}</p>` : ""}<p>${IaraShop.formatPrice(item.price)}</p></div><button class="cart-remove" data-remove-cart="${index}" aria-label="移除 ${item.name}">×</button></div>`).join("")}<div class="cart-summary"><p><span>小計</span><strong>${IaraShop.formatPrice(total)}</strong></p><button class="button button-dark" data-checkout>安全結帳</button></div>`;
  }

  function openMiniCart() {
    const drawer = document.querySelector("#cart-drawer");
    const overlay = document.querySelector("#overlay");
    if (!drawer || !overlay) return;
    renderMiniCart();
    drawer.classList.add("active");
    drawer.setAttribute("aria-hidden", "false");
    overlay.classList.add("active");
    document.body.classList.add("locked");
  }

  function closeMiniCart() {
    document.querySelector("#cart-drawer")?.classList.remove("active");
    document.querySelector("#cart-drawer")?.setAttribute("aria-hidden", "true");
    document.querySelector("#overlay")?.classList.remove("active");
    document.body.classList.remove("locked");
  }

  document.querySelector("#cart-trigger")?.addEventListener("click", openMiniCart);
  document.querySelector("#overlay")?.addEventListener("click", closeMiniCart);
  document.querySelector("#cart-drawer")?.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-cart]")) closeMiniCart();
    const remove = event.target.closest("[data-remove-cart]");
    if (remove) {
      IaraShop.removeCart(remove.dataset.removeCart);
      renderMiniCart();
      updateShopCounts();
      showShopToast("商品已從購物袋移除");
    }
    if (event.target.closest("[data-checkout]")) showShopToast("安全結帳將於下一個商店階段接通");
  });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMiniCart(); });

  window.IaraUI = { updateShopCounts, showShopToast, openMiniCart, closeMiniCart };
  updateShopCounts();
})();
