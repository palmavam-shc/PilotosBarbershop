// ===================================================
// PILOTOS BARBERSHOP - INTERACTIVE PRICING & BOOKING
// ===================================================

// STEP 1: BARBERSHOP SERVICES DATA (Uses existing img/price-*.jpg files)
const services = [
    { id: 1, name: 'Classic Haircut', price: 150, img: 'img/price-1.jpg', hasTier: true },
    { id: 2, name: 'Hair Wash & Scalp Massage', price: 100, img: 'img/price-2.jpg', hasTier: false },
    { id: 3, name: 'Hair Color & Highlights', price: 450, img: 'img/price-3.jpg', hasTier: true },
    { id: 4, name: 'Hot Towel Straight Shave', price: 120, img: 'img/price-4.jpg', hasTier: false },
    { id: 5, name: 'Beard Trim & Line-Up', price: 100, img: 'img/price-5.jpg', hasTier: false },
    { id: 6, name: 'Razor Fade & Taper', price: 180, img: 'img/price-6.jpg', hasTier: true },
    { id: 7, name: 'Kids & Student Cut', price: 120, img: 'img/price-7.jpg', hasTier: false },
    { id: 8, name: 'Signature Hair Styling', price: 130, img: 'img/price-8.jpg', hasTier: false },
    { id: 9, name: 'Charcoal Facial Cleanse', price: 200, img: 'img/price-9.jpg', hasTier: false },
    { id: 10, name: 'Full Grooming Package', price: 380, img: 'img/price-10.jpg', hasTier: true },
    { id: 11, name: 'Mustache Sculpting', price: 80, img: 'img/price-11.jpg', hasTier: false },
    { id: 12, name: 'Hair Spa & Keratin Treatment', price: 350, img: 'img/price-12.jpg', hasTier: false }
];

// Load saved service selections from localStorage
let cart = JSON.parse(localStorage.getItem('pilotos_service_cart')) || [];

// STEP 2: DISPLAY AVAILABLE BARBERSHOP SERVICES
function showServices() {
    const menuContainer = document.getElementById('serviceMenu');
    if (!menuContainer) return;

    let html = '';
    for (const item of services) {
        // Conditional dropdown for services that offer Barber Tiers
        const tierDropdownHtml = item.hasTier ? `
            <select id="tier-${item.id}" class="tier-select" aria-label="Select barber tier for ${item.name}">
                <option value="Regular|0">Regular (+₱0)</option>
                <option value="Senior|50">Senior (+₱50)</option>
                <option value="Master|100">Master (+₱100)</option>
            </select>
        ` : '';

        html += `
        <div class="service-row">
            <div class="service-info">
                <img src="${item.img}" class="service-pic" alt="${item.name}">
                <div>
                    <div class="service-name">${item.name}</div>
                    <div class="service-price">₱${item.price.toFixed(2)}</div>
                </div>
            </div>
            <div class="controls">
                ${tierDropdownHtml}
                <button type="button" class="btn-add" onclick="addToCart(${item.id})">
                    <i class="fas fa-plus mr-1"></i>Select
                </button>
            </div>
        </div>`;
    }
    menuContainer.innerHTML = html;
}

// STEP 3: ADD SERVICE & ADJUST QUANTITY (e.g., for group/family bookings)
function addToCart(id) {
    const item = services.find(s => s.id === id);
    if (!item) return;

    let tierName = 'Standard';
    let extraCharge = 0;

    if (item.hasTier) {
        const tierDropdown = document.getElementById(`tier-${id}`);
        const [parsedTierName, tierPriceMod] = tierDropdown.value.split('|');
        tierName = parsedTierName;
        extraCharge = parseInt(tierPriceMod, 10);
    }

    const finalServicePrice = item.price + extraCharge;
    const displayName = item.hasTier ? `${item.name} (${tierName})` : item.name;
    const cartItemId = item.hasTier ? `${id}-${tierName}` : `${id}-Standard`;
    const existingLine = cart.find(c => c.cartItemId === cartItemId);

    if (existingLine) {
        existingLine.qty++;
    } else {
        cart.push({
            cartItemId: cartItemId,
            id: item.id,
            name: displayName,
            price: finalServicePrice,
            qty: 1
        });
    }

    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'order-message mt-3';
    updateCartState();
}

function changeQty(cartItemId, amount) {
    const line = cart.find(c => c.cartItemId === cartItemId);
    if (line) {
        line.qty += amount;
        if (line.qty <= 0) {
            cart = cart.filter(c => c.cartItemId !== cartItemId);
        }
    }
    updateCartState();
}

// STEP 4: CALCULATE SUBTOTAL, VIP DISCOUNT & RENDER SUMMARY
function getSubtotal() {
    let subtotal = 0;
    for (const line of cart) {
        subtotal += line.price * line.qty;
    }
    return subtotal;
}

function showCart() {
    const cartContainer = document.getElementById('serviceCart');
    let html = '';

    for (const line of cart) {
        html += `
        <div class="service-row">
            <div>
                <div class="service-name">${line.name}</div>
                <div class="service-price">₱${line.price} × ${line.qty} person(s)</div>
            </div>
            <div class="controls">
                <button type="button" class="qty-btn" onclick="changeQty('${line.cartItemId}', -1)">-</button>
                <span class="font-weight-bold px-1">${line.qty}</span>
                <button type="button" class="qty-btn" onclick="changeQty('${line.cartItemId}', 1)">+</button>
                <span class="font-weight-bold ml-2">₱${(line.price * line.qty).toFixed(2)}</span>
            </div>
        </div>`;
    }

    if (cart.length === 0) {
        html = '<p class="text-muted py-3 mb-0">No services selected yet. Choose a service on the left to estimate your total.</p>';
    }

    cartContainer.innerHTML = html;

    const subtotal = getSubtotal();
    const discount = subtotal >= 500 ? subtotal * 0.10 : 0;
    const finalTotal = subtotal - discount;

    document.getElementById('subtotal').innerHTML = `<span>Subtotal:</span> <span>₱${subtotal.toFixed(2)}</span>`;
    document.getElementById('discountLine').innerHTML = `<span>VIP Discount (10%):</span> <span>-₱${discount.toFixed(2)}</span>`;
    document.getElementById('total').innerHTML = `<span>Total Bill:</span> <span>₱${finalTotal.toFixed(2)}</span>`;
}

function updateCartState() {
    localStorage.setItem('pilotos_service_cart', JSON.stringify(cart));
    showCart();
}

// STEP 5: VALIDATE INPUTS & CONFIRM BOOKING
function placeOrder() {
    const customerName = document.getElementById('customerName').value.trim();
    const selectedBarber = document.getElementById('barberSelect').value;
    const paymentInput = document.getElementById('paymentAmount').value.trim();
    const messageElement = document.getElementById('message');

    if (cart.length === 0) {
        messageElement.className = 'order-message mt-3 alert alert-danger';
        messageElement.textContent = 'Please select at least one barbershop service first.';
        return;
    }

    if (customerName === '') {
        messageElement.className = 'order-message mt-3 alert alert-danger';
        messageElement.textContent = 'Please enter the client name.';
        return;
    }

    const subtotal = getSubtotal();
    const discount = subtotal >= 500 ? subtotal * 0.10 : 0;
    const finalTotal = subtotal - discount;
    const paymentAmount = parseFloat(paymentInput);

    if (isNaN(paymentAmount) || paymentAmount <= 0 || paymentAmount < finalTotal) {
        messageElement.className = 'order-message mt-3 alert alert-danger';
        messageElement.textContent = `Insufficient payment! Total amount due is ₱${finalTotal.toFixed(2)}.`;
        return;
    }

    const change = paymentAmount - finalTotal;
    messageElement.className = 'order-message mt-3 alert alert-success';
    messageElement.innerHTML = `
        <strong>Booking & Payment Confirmed!</strong><br>
        Client: <strong>${customerName}</strong><br>
        Assigned Barber: <strong>${selectedBarber}</strong><br>
        Total: ₱${finalTotal.toFixed(2)} | Paid: ₱${paymentAmount.toFixed(2)} | Change: <strong>₱${change.toFixed(2)}</strong>
    `;

    resetCartFields();
}

function resetCartFields() {
    cart = [];
    localStorage.removeItem('pilotos_service_cart');
    document.getElementById('customerName').value = '';
    document.getElementById('paymentAmount').value = '';
    showCart();
}

function clearOrder() {
    resetCartFields();
    const messageElement = document.getElementById('message');
    messageElement.className = 'order-message mt-3';
    messageElement.textContent = '';
}

// STEP 6: INITIALIZE SYSTEM ON PAGE LOAD
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('placeOrder').addEventListener('click', placeOrder);
    document.getElementById('clearOrder').addEventListener('click', clearOrder);
    showServices();
    showCart();
});
