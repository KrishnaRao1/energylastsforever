// cart.js — cart logic + floating cart widget UI

function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCartWidget();
}

function addToCart(productId, size) {
  const cart = getCart();
  const existing = cart.find(item => item.id === productId && item.size === size);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId, size: size || null, qty: 1 });
  }
  saveCart(cart);
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
}

function updateQty(index, qty) {
  const cart = getCart();
  if (qty <= 0) {
    cart.splice(index, 1);
  } else {
    cart[index].qty = qty;
  }
  saveCart(cart);
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => {
    const product = (typeof PRODUCTS !== "undefined") ? PRODUCTS[item.id] : null;
    return sum + (product ? product.price * item.qty : 0);
  }, 0);
}

function clearCart() {
  localStorage.removeItem("cart");
  renderCartWidget();
}

// Kept for backward compatibility with any page still referencing it directly
function updateCartBadge() {
  renderCartWidget();
}

/* ---------------- Floating Cart Widget ---------------- */

function buildCartWidget() {
  if (document.getElementById("cart-widget-root")) return;

  const style = document.createElement("style");
  style.textContent = `
    #cart-widget-root {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      font-family: 'Orbitron Black', sans-serif;
    }
    #cart-icon-btn {
      position: relative;
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background-color: rgba(0,0,0,0.6);
      border: 1px solid rgba(255,255,255,0.25);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      backdrop-filter: blur(4px);
    }
    #cart-icon-btn:hover {
      border-color: #800080;
      box-shadow: 0 0 12px rgba(128,0,128,0.6);
    }
    #cart-icon-btn svg { width: 22px; height: 22px; }
    #cart-count {
      position: absolute;
      top: -4px;
      right: -4px;
      background-color: #800080;
      color: white;
      font-size: 0.7rem;
      min-width: 18px;
      height: 18px;
      border-radius: 9px;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }
    #cart-dropdown {
      position: absolute;
      top: 56px;
      right: 0;
      width: 300px;
      max-height: 400px;
      overflow-y: auto;
      background-color: #141414;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 10px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.5);
      padding: 16px;
      display: none;
      color: white;
    }
    #cart-dropdown.open { display: block; }
    #cart-dropdown h3 {
      margin: 0 0 12px;
      font-size: 0.9rem;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #ccc;
    }
    .cart-dd-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      font-size: 0.85rem;
    }
    .cart-dd-item-info { display: flex; flex-direction: column; gap: 2px; }
    .cart-dd-item-info small { opacity: 0.6; }
    .cart-dd-remove {
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
      padding: 0 4px;
    }
    .cart-dd-remove:hover { color: #ff6b6b; }
    #cart-dd-empty {
      text-align: center;
      opacity: 0.6;
      font-size: 0.85rem;
      padding: 20px 0;
    }
    #cart-dd-total {
      display: flex;
      justify-content: space-between;
      font-size: 0.95rem;
      margin: 14px 0;
      font-weight: bold;
    }
    #cart-dd-checkout {
      display: block;
      width: 100%;
      text-align: center;
      padding: 12px;
      background-color: #800080;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-family: 'Orbitron Black', sans-serif;
      text-decoration: none;
      cursor: pointer;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    #cart-dd-checkout:hover { box-shadow: 0 0 14px rgba(128,0,128,0.7); }
    #cart-dd-checkout:disabled { opacity: 0.4; cursor: not-allowed; }
  `;
  document.head.appendChild(style);

  const root = document.createElement("div");
  root.id = "cart-widget-root";
  root.innerHTML = `
    <button id="cart-icon-btn" aria-label="View cart" aria-expanded="false">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
      <span id="cart-count">0</span>
    </button>
    <div id="cart-dropdown" role="menu" aria-label="Cart contents">
      <h3>Your Cart</h3>
      <div id="cart-dd-items"></div>
      <div id="cart-dd-total" style="display:none;"><span>Total</span><span id="cart-dd-total-amt"></span></div>
      <a id="cart-dd-checkout" href="/checkout.html">Proceed to Checkout</a>
    </div>
  `;
  document.body.appendChild(root);

  const btn = document.getElementById("cart-icon-btn");
  const dropdown = document.getElementById("cart-dropdown");

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle("open");
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  document.addEventListener("click", (e) => {
    if (!root.contains(e.target)) {
      dropdown.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      dropdown.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });
}

function openCartWidget() {
  const dropdown = document.getElementById("cart-dropdown");
  const btn = document.getElementById("cart-icon-btn");
  if (dropdown && btn) {
    dropdown.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
  }
}

function renderCartWidget() {
  if (!document.getElementById("cart-widget-root")) return;

  const cart = getCart();
  const countEl = document.getElementById("cart-count");
  const itemsEl = document.getElementById("cart-dd-items");
  const totalWrap = document.getElementById("cart-dd-total");
  const totalAmt = document.getElementById("cart-dd-total-amt");
  const checkoutBtn = document.getElementById("cart-dd-checkout");

  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  countEl.textContent = count;
  countEl.style.display = count > 0 ? "flex" : "none";

  if (cart.length === 0) {
    itemsEl.innerHTML = '<div id="cart-dd-empty">Your cart is empty.</div>';
    totalWrap.style.display = "none";
    checkoutBtn.style.pointerEvents = "none";
    checkoutBtn.style.opacity = "0.4";
    return;
  }

  checkoutBtn.style.pointerEvents = "auto";
  checkoutBtn.style.opacity = "1";

  itemsEl.innerHTML = cart.map((item, i) => {
    const product = (typeof PRODUCTS !== "undefined") ? PRODUCTS[item.id] : null;
    const name = product ? product.name : item.id;
    const lineTotal = product ? ((product.price * item.qty) / 100).toFixed(2) : "0.00";
    return `
      <div class="cart-dd-item">
        <div class="cart-dd-item-info">
          <strong>${name}</strong>
          <small>${item.size ? "Size: " + item.size + " · " : ""}Qty: ${item.qty}</small>
          <small>$${lineTotal}</small>
        </div>
        <button class="cart-dd-remove" onclick="removeFromCart(${i})" aria-label="Remove ${name}">×</button>
      </div>
    `;
  }).join("");

  totalWrap.style.display = "flex";
  totalAmt.textContent = "$" + (getCartTotal() / 100).toFixed(2);
}

document.addEventListener("DOMContentLoaded", () => {
  buildCartWidget();
  renderCartWidget();
});
