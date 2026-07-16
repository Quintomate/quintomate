const products = [
    { id: 1, name: "Camionero Cuero Negro", price: 26500, img: "img/camionero-cuero-negro.jpg", badge: null, shipping: "Envío gratis", stock: 1 },
    { id: 2, name: "Imperial Cuero Negro", price: 28500, img: "img/imperial-cuero-negro.jpg", badge: null, shipping: "Envío gratis", stock: 5 },
    { id: 3, name: "Mate Galleta", price: 18900, img: "img/mate-galleta.jpg", badge: null, shipping: null, stock: 0 },
    { id: 4, name: "Imperial Cuero Crudo", price: 36900, img: "img/imperial-cuero-crudo.jpg", badge: null, shipping: null, stock: 0 },
    { id: 5, name: "Bombillón Acero Inox", price: 12900, img: "img/bombillon-acero-inox.jpg", badge: null, shipping: null, stock: 5 },
    { id: 6, name: "Bombillón Mundial Alpaca", price: 20900, img: "img/bombillon-mundial-alpaca.jpg", badge: null, shipping: null, stock: 0 }
];

const WHATSAPP_NUMBER = "542644456391";
let cart = JSON.parse(localStorage.getItem('quintomate_cart')) || [];

const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const productsGrid = document.getElementById('productsGrid');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCart();
    setupEvents();
});

function renderProducts() {
    productsGrid.innerHTML = products.map(p => productCard(p)).join('');
    document.querySelectorAll('#productsGrid .add-to-cart-btn').forEach(b => b.addEventListener('click', addToCart));
}

function productCard(p) {
    const outOfStock = p.stock === 0;
    return `
        <div class="product-card">
            ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
            ${p.shipping ? `<span class="product-shipping">${p.shipping}</span>` : ''}
            ${outOfStock ? '<span class="product-badge" style="background:#999;left:auto;right:10px">Sin stock</span>' : ''}
            <div class="product-image"><img src="${p.img}" alt="${p.name}"></div>
            <div class="product-info">
                <h3 class="product-name">${p.name}</h3>
                <div class="product-prices">
                    <span class="price-current">$${p.price.toLocaleString('es-AR')}</span>
                </div>
                <button class="add-to-cart-btn" data-id="${p.id}" ${outOfStock ? 'disabled style="opacity:0.5;cursor:not-allowed;border-color:#ccc;color:#999"' : ''}>
                    <i class="fas fa-shopping-cart"></i> ${outOfStock ? 'Sin stock' : 'Agregar al carrito'}
                </button>
            </div>
        </div>`;
}

function addToCart(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    const product = products.find(p => p.id === id);
    const inCart = cart.find(i => i.id === id);
    const currentQty = inCart ? inCart.quantity : 0;
    if (currentQty >= product.stock) { showToast('No hay más stock'); return; }
    inCart ? inCart.quantity++ : cart.push({ ...product, quantity: 1 });
    saveCart();
    updateCart();
    showToast('Agregado al carrito');
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCart();
}

function updateQuantity(id, change) {
    const item = cart.find(i => i.id === id);
    const product = products.find(p => p.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) { removeFromCart(id); return; }
        if (item.quantity > product.stock) { item.quantity = product.stock; showToast('Stock máximo alcanzado'); }
        saveCart();
        updateCart();
    }
}

function saveCart() {
    localStorage.setItem('quintomate_cart', JSON.stringify(cart));
}

function updateCart() {
    cartCount.textContent = cart.reduce((s, i) => s + i.quantity, 0);
    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    cartTotal.textContent = `$${total.toLocaleString('es-AR')}`;

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="cart-empty"><i class="fas fa-shopping-cart"></i><p>Tu carrito está vacío</p></div>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image"><img src="${item.img}" alt="${item.name}"></div>
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <span class="cart-item-price">$${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)"><i class="fas fa-minus"></i></button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)"><i class="fas fa-plus"></i></button>
                        <button class="remove-item-btn" onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>`).join('');
    }
}

function sendToWhatsApp() {
    if (cart.length === 0) { showToast('Tu carrito está vacío'); return; }

    let msg = `🛒 *¡Hola! Quiero hacer un pedido*\n\n📦 *Productos:*\n`;

    cart.forEach(item => {
        msg += `• ${item.name}\n  Cant: ${item.quantity} | $${(item.price * item.quantity).toLocaleString('es-AR')}\n`;
    });

    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    msg += `\n💰 *Total: $${total.toLocaleString('es-AR')}*\n`;
    msg += `\n_Medio de pago a coordinar_`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    showToast('Abriendo WhatsApp...');
}

function toggleCart() {
    cartSidebar.classList.toggle('active');
    cartOverlay.classList.toggle('active');
    document.body.style.overflow = cartSidebar.classList.contains('active') ? 'hidden' : '';
}

function toggleMobileMenu() {
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
}

function showToast(msg) {
    toastMessage.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function setupEvents() {
    cartBtn.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    closeMenuBtn.addEventListener('click', toggleMobileMenu);
    checkoutBtn.addEventListener('click', sendToWhatsApp);

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const t = document.querySelector(link.getAttribute('href'));
            if (t) { t.scrollIntoView({ behavior: 'smooth' }); if (mobileMenu.classList.contains('active')) toggleMobileMenu(); }
        });
    });
}