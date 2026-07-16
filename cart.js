// cart.js — shared cart logic using localStorage

function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
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
  updateCartBadge();
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
    const product = PRODUCTS[item.id];
    return sum + (product ? product.price * item.qty : 0);
  }, 0);
}

function clearCart() {
  localStorage.removeItem("cart");
}

function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (badge) {
    const count = getCart().reduce((sum, item) => sum + item.qty, 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? "inline-block" : "none";
  }
}

document.addEventListener("DOMContentLoaded", updateCartBadge);
