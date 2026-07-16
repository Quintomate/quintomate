const mates = [
    { id: 1, name: "Mate Térmico Acero Inox 304 Doble Pared + Bombilla", price: 18990, transferPrice: 17091, icon: "fa-mug-hot", badge: null, shipping: "Envío gratis" },
    { id: 2, name: "Mate Térmico Personalizado Acero Inox 304 + Bombilla + Logo", price: 25000, transferPrice: 22500, icon: "fa-mug-hot", badge: null, shipping: "Envío gratis" },
    { id: 3, name: "Camionero Criollo Calabaza Brasilera Pulida Base Cuero Crudo", price: 25000, transferPrice: 22500, icon: "fa-mug-hot", badge: null, shipping: "Envío gratis" },
    { id: 4, name: "Mate Algarrobo Boca Ancha Virola Acero Inox + Pico Loro", price: 29500, transferPrice: 26550, icon: "fa-mug-hot", badge: null, shipping: "Envío gratis" },
    { id: 5, name: "Mate Galleta Criollo Calabaza Gaucha + Base Cuero Crudo", price: 32975, transferPrice: 29677, icon: "fa-mug-hot", badge: null, shipping: "Envío gratis" },
    { id: 6, name: "Mate Algarrobo Personalizado Cuerpo/Madera + Pico Loro", price: 38500, transferPrice: 34650, icon: "fa-mug-hot", badge: "Personalizable", shipping: "Envío gratis" },
    { id: 7, name: "Mate Algarrobo Personalizado Virola Acero Inox + Pico Loro", price: 38990, transferPrice: 35091, icon: "fa-mug-hot", badge: "Personalizable", shipping: "Envío gratis" },
    { id: 8, name: "Mate Torpedo Algarrobo De Alpaca Cincelado Uruguayo Criollo", price: 40000, transferPrice: 36000, icon: "fa-mug-hot", badge: "Exclusivo", shipping: "Envío gratis" },
    { id: 9, name: "Mate Criollo Personalizado Camionero Base Cruda + Bombilla", price: 46990, transferPrice: 42291, icon: "fa-mug-hot", badge: "Personalizable", shipping: "Envío gratis" },
    { id: 10, name: "Mate Torpedo Algarrobo Alpaca Cincelado + Bombilla Pico Loro", price: 49000, transferPrice: 44100, icon: "fa-mug-hot", badge: null, shipping: "Envío gratis" },
    { id: 11, name: "Mate Camionero Uruguayo Personalizado Grabado Clubes Fútbol", price: 55000, transferPrice: 49500, icon: "fa-mug-hot", badge: "Exclusivo", shipping: "Envío gratis" },
    { id: 12, name: "Mate Imperial Algarrobo Fleje De Alpaca + Pico Loro Inox", price: 55900, transferPrice: 50310, icon: "fa-mug-hot", badge: "Exclusivo", shipping: "Envío gratis" }
];

const bombillas = [
    { id: 101, name: "Bombilla de Acero Inoxidable 304", price: 3200, transferPrice: 2880, icon: "fa-wand-magic-sparkles", badge: null, shipping: null },
    { id: 102, name: "Bombilla de Alpaca Cincelada", price: 4500, transferPrice: 4050, icon: "fa-wand-magic-sparkles", badge: "Popular", shipping: null },
    { id: 103, name: "Bombilla de Plata 925", price: 12000, transferPrice: 10800, icon: "fa-wand-magic-sparkles", badge: "Premium", shipping: null },
    { id: 104, name: "Bombilla de Acero Doble Vía", price: 3800, transferPrice: 3420, icon: "fa-wand-magic-sparkles", badge: null, shipping: null }
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
const bombillasGrid = document.getElementById('bombillasGrid');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    renderBombillas();
    updateCart();
    setupEvents();
});

function renderProducts() {
    productsGrid.innerHTML = mates.map(p => productCard(p)).join('');
    document.querySelectorAll('#productsGrid .add-to-cart-btn').forEach(b => b.addEventListener('click', addToCart));
}

function renderBombillas() {
    bombillasGrid.innerHTML = bombillas.map(p => productCard(p)).join('');
    document.querySelectorAll('#bombillasGrid .add-to-cart-btn').forEach(b => b.addEventListener('click', addToCart));
}

function productCard(p) {
    const d = Math.round((1 - p.transferPrice / p.price) * 100);
    return `
        <div class="product-card">
            ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
            ${p.shipping ? `<span class="product-shipping">${p.shipping}</span>` : ''}
            <div class="product-image"><i class="fas ${p.icon}"></i></div>
            <div class="product-info">
                <h3 class="product-name">${p.name}</h3>
                <div class="product-prices">
                    <span class="price-original">$${p.price.toLocaleString('es-AR')}</span>
                    <span class="price-current">$${p.transferPrice.toLocaleString('es-AR')}</span>
                    <span class="price-transfer"><strong>${d}% OFF</strong> con transferencia</span>
                </div>
                <button class="add-to-cart-btn" data-id="${p.id}">
                    <i class="fas fa-shopping-cart"></i> Agregar al carrito
                </button>
            </div>
        </div>`;
}

function addToCart(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    const all = [...mates, ...bombillas];
    const product = all.find(p => p.id === id);
    const existing = cart.find(i => i.id === id);
    existing ? existing.quantity++ : cart.push({ ...product, quantity: 1 });
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
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) { removeFromCart(id); return; }
        saveCart();
        updateCart();
    }
}

function saveCart() {
    localStorage.setItem('quintomate_cart', JSON.stringify(cart));
}

function updateCart() {
    cartCount.textContent = cart.reduce((s, i) => s + i.quantity, 0);
    const total = cart.reduce((s, i) => s + (i.transferPrice * i.quantity), 0);
    cartTotal.textContent = `$${total.toLocaleString('es-AR')}`;

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="cart-empty"><i class="fas fa-shopping-cart"></i><p>Tu carrito está vacío</p></div>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image"><i class="fas ${item.icon}"></i></div>
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name.substring(0, 40)}...</h4>
                    <span class="cart-item-price">$${(item.transferPrice * item.quantity).toLocaleString('es-AR')}</span>
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
        msg += `• ${item.name}\n  Cant: ${item.quantity} | $${(item.transferPrice * item.quantity).toLocaleString('es-AR')}\n`;
    });

    const total = cart.reduce((s, i) => s + (i.transferPrice * i.quantity), 0);
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

    document.getElementById('sortSelect').addEventListener('change', e => {
        const v = e.target.value;
        if (v === 'menor') mates.sort((a, b) => a.transferPrice - b.transferPrice);
        else if (v === 'mayor') mates.sort((a, b) => b.transferPrice - a.transferPrice);
        else if (v === 'nombre') mates.sort((a, b) => a.name.localeCompare(b.name));
        renderProducts();
    });
}