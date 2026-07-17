const products = [
    { id: 1, name: "Camionero Cuero Negro", price: 26500, img: "img/camionero-cuero-negro.jpg", badge: null, stock: 1, category: "camioneros", order: 1 },
    { id: 2, name: "Imperial Cuero Negro", price: 28500, img: "img/imperial-cuero-negro.jpg", badge: null, stock: 5, category: "imperiales", order: 2 },
    { id: 3, name: "Mate Galleta", price: 20900, img: "img/mate-galleta.jpg", badge: null, stock: 0, category: "galleta", order: 3 },
    { id: 4, name: "Imperial Cuero Crudo", price: 36900, img: "img/imperial-cuero-crudo.jpg", badge: null, stock: 0, category: "imperiales", order: 4 },
    { id: 5, name: "Bombillón Acero Inox", price: 14000, img: "img/bombillon-acero-inox.jpg", badge: null, stock: 4, category: "bombillones", order: 5 },
    { id: 6, name: "Bombillón Mundial Alpaca", price: 20900, img: "img/bombillon-mundial-alpaca.jpg", badge: null, stock: 1, category: "bombillones", order: 6 }
];

const WHATSAPP_NUMBER = "542644456391";
let cart = JSON.parse(localStorage.getItem('quintomate_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
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
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');

    function renderAll() {
        productsGrid.innerHTML = products.map(p => productCard(p)).join('');
        productsGrid.querySelectorAll('.product-card-btn').forEach(b => b.addEventListener('click', e => addToCart(parseInt(e.currentTarget.dataset.id))));
        productsGrid.querySelectorAll('.product-image').forEach(img => {
            img.addEventListener('click', e => {
                lightboxImg.src = e.target.src;
                lightboxImg.alt = e.target.alt;
                lightbox.classList.add('active');
            });
        });
    }

    function productCard(p) {
        const outOfStock = p.stock === 0;
        const inCart = cart.find(i => i.id === p.id);
        const qty = inCart ? inCart.quantity : 0;
        let btnHTML;
        if (outOfStock) {
            btnHTML = `<button class="add-to-cart-btn" disabled style="opacity:0.5;cursor:not-allowed;border-color:#ccc;color:#999"><i class="fas fa-shopping-cart"></i> Sin stock</button>`;
        } else if (qty > 0) {
            btnHTML = `<div class="qty-controls"><button class="qty-btn-card" data-id="${p.id}" data-action="minus"><i class="fas fa-minus"></i></button><span class="qty-card-number">${qty}</span><button class="qty-btn-card" data-id="${p.id}" data-action="plus"><i class="fas fa-plus"></i></button></div>`;
        } else {
            btnHTML = `<button class="add-to-cart-btn product-card-btn" data-id="${p.id}"><i class="fas fa-shopping-cart"></i> Agregar al carrito</button>`;
        }
        return `<div class="product-card">${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}<div class="product-image"><img src="${p.img}" alt="${p.name}"></div><div class="product-info"><h3 class="product-name">${p.name}</h3><div class="product-prices"><span class="price-current">$${p.price.toLocaleString('es-AR')}</span></div>${btnHTML}</div></div>`;
    }

    function addToCart(id) {
        const product = products.find(p => p.id === id);
        const inCart = cart.find(i => i.id === id);
        const currentQty = inCart ? inCart.quantity : 0;
        if (currentQty >= product.stock) { showToast('No hay más stock'); return; }
        inCart ? inCart.quantity++ : cart.push({ ...product, quantity: 1 });
        saveCart();
        renderAll();
        updateCart();
        showToast('Agregado al carrito');
    }

    function removeFromCart(id) {
        cart = cart.filter(i => i.id !== id);
        saveCart();
        renderAll();
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
            renderAll();
            updateCart();
        }
    }

    function saveCart() { localStorage.setItem('quintomate_cart', JSON.stringify(cart)); }

    function updateCart() {
        cartCount.textContent = cart.reduce((s, i) => s + i.quantity, 0);
        const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
        cartTotal.textContent = `$${total.toLocaleString('es-AR')}`;
        if (cart.length === 0) {
            cartItems.innerHTML = '<div class="cart-empty"><i class="fas fa-shopping-cart"></i><p>Tu carrito está vacío</p></div>';
        } else {
            cartItems.innerHTML = cart.map(item => `<div class="cart-item"><div class="cart-item-image"><img src="${item.img}" alt="${item.name}"></div><div class="cart-item-details"><h4 class="cart-item-name">${item.name}</h4><span class="cart-item-price">$${(item.price * item.quantity).toLocaleString('es-AR')}</span><div class="cart-item-controls"><button class="quantity-btn" onclick="window._updateQuantity(${item.id}, -1)"><i class="fas fa-minus"></i></button><span class="quantity">${item.quantity}</span><button class="quantity-btn" onclick="window._updateQuantity(${item.id}, 1)"><i class="fas fa-plus"></i></button><button class="remove-item-btn" onclick="window._removeFromCart(${item.id})"><i class="fas fa-trash"></i></button></div></div></div>`).join('');
        }
    }

    function sendToWhatsApp() {
        if (cart.length === 0) { showToast('Tu carrito está vacío'); return; }
        let msg = `🛒 *¡Hola! Quiero hacer un pedido*\n\n📦 *Productos:*\n`;
        cart.forEach(item => { msg += `• ${item.name}\n  Cant: ${item.quantity} | $${(item.price * item.quantity).toLocaleString('es-AR')}\n`; });
        const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
        msg += `\n💰 *Total: $${total.toLocaleString('es-AR')}*\n\n_Medio de pago a coordinar_`;
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

    window._updateQuantity = updateQuantity;
    window._removeFromCart = removeFromCart;

    cartBtn.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    closeMenuBtn.addEventListener('click', toggleMobileMenu);
    checkoutBtn.addEventListener('click', sendToWhatsApp);

    lightbox.addEventListener('click', () => lightbox.classList.remove('active'));
    lightboxImg.addEventListener('click', e => e.stopPropagation());

    document.addEventListener('click', e => {
        const btn = e.target.closest('.qty-btn-card');
        if (!btn) return;
        if (btn.dataset.action === 'plus') addToCart(parseInt(btn.dataset.id));
        else if (btn.dataset.action === 'minus') updateQuantity(parseInt(btn.dataset.id), -1);
    });

    renderAll();
    updateCart();
});