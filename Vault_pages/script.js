document.addEventListener('DOMContentLoaded', function () {
    const cartMessage = document.getElementById('cart-message');
    let cartMessageTimer = null;

    document.querySelectorAll('.btn').forEach(function (button) {
        button.addEventListener('click', function () {
            const card = button.closest('.product-card');
            if (!card) {
                return;
            }

            const product = {
                title: card.querySelector('h4')?.textContent.trim() || 'Продукт',
                description: card.querySelector('.product-desc')?.textContent.trim() || '',
                price: card.querySelector('.product-price')?.textContent.trim() || '',
                image: card.querySelector('img')?.getAttribute('src') || '',
                quantity: 1
            };

            const cartItems = JSON.parse(localStorage.getItem('vaultCartItems') || '[]');
            const existingIndex = cartItems.findIndex(item => item.title === product.title && item.price === product.price);

            if (existingIndex >= 0) {
                cartItems[existingIndex].quantity += 1;
            } else {
                cartItems.push(product);
            }

            localStorage.setItem('vaultCartItems', JSON.stringify(cartItems));

            if (cartMessage) {
                cartMessage.textContent = 'Продуктът е успешно добавен в кошницата';
                cartMessage.classList.add('visible');
                clearTimeout(cartMessageTimer);
                cartMessageTimer = setTimeout(function () {
                    cartMessage.classList.remove('visible');
                }, 1000);
            }
        });
    });

    // Product slider functionality
    function initSlider(gridId, prevBtnId, nextBtnId) {
        const grid = document.getElementById(gridId);
        const prevBtn = document.getElementById(prevBtnId);
        const nextBtn = document.getElementById(nextBtnId);
        if (!grid || !prevBtn || !nextBtn) {
            return;
        }

        const cards = grid.querySelectorAll('.product-card');
        let currentIndex = 0; // Start with product 1 in center

        function setGridHeight() {
            const firstCard = cards[0];
            if (!firstCard) {
                return;
            }
            grid.style.height = `${firstCard.offsetHeight}px`;
        }

        function updateSlider() {
            cards.forEach((card, index) => {
                card.classList.remove('visible', 'pos-0', 'pos-1', 'pos-2', 'hidden-left', 'hidden-right');

                if (index < currentIndex) {
                    card.classList.add('hidden-left');
                } else if (index >= currentIndex + 3) {
                    card.classList.add('hidden-right');
                } else {
                    card.classList.add('visible', `pos-${index - currentIndex}`);
                }
            });

            const isAtStart = currentIndex === 0;
            const isAtEnd = currentIndex >= cards.length - 3;

            prevBtn.disabled = isAtStart;
            nextBtn.disabled = isAtEnd;

            prevBtn.classList.toggle('hidden', isAtStart);
            nextBtn.classList.toggle('hidden', isAtEnd);
        }

        prevBtn.addEventListener('click', function () {
            if (currentIndex > 0) {
                currentIndex--;
                updateSlider();
            }
        });

        nextBtn.addEventListener('click', function () {
            if (currentIndex < cards.length - 3) {
                currentIndex++;
                updateSlider();
            }
        });

        window.addEventListener('resize', setGridHeight);
        window.addEventListener('load', setGridHeight);
        setGridHeight();
        updateSlider();
    }

    // Initialize sliders for each category
    initSlider('wallets-grid', 'prev-wallets', 'next-wallets');
    initSlider('belts-grid', 'prev-belts', 'next-belts');
    initSlider('watches-grid', 'prev-watches', 'next-watches');
    initSlider('accessories-grid', 'prev-accessories', 'next-accessories');

    const cartContent = document.getElementById('cart-content');
    if (cartContent) {
        const cartDetailsSections = document.getElementById('cart-details-sections');
        let cartItems = JSON.parse(localStorage.getItem('vaultCartItems') || '[]');

        function parsePrice(priceString) {
            return parseFloat((priceString.match(/[0-9]+[\.,]?[0-9]*/)?.[0] || '0').replace(',', '.')) || 0;
        }

        function formatPrice(value) {
            return value.toFixed(2).replace('.', ',');
        }

        function saveCart() {
            localStorage.setItem('vaultCartItems', JSON.stringify(cartItems));
        }

        function renderCart() {
            if (cartItems.length === 0) {
                cartContent.innerHTML = `
                    <div class="cart-empty">
                        <p>Кошницата е празна. Изберете продукт от страницата с продукти.</p>
                    </div>
                `;
                if (cartDetailsSections) {
                    cartDetailsSections.style.display = '';
                }
                return;
            }

            if (cartDetailsSections) {
                cartDetailsSections.style.display = 'none';
            }

            const itemsHtml = cartItems.map((item, index) => {
                const unitPrice = parsePrice(item.price);
                const itemTotal = formatPrice(unitPrice * item.quantity);
                const currency = item.price.replace(/[0-9\.,\s]/g, '') || 'BGN';

                return `
                    <div class="cart-item" data-index="${index}">
                        <button type="button" class="cart-remove" aria-label="Премахни продукта">×</button>
                        <div class="cart-image">
                            <img src="${item.image}" alt="${item.title}">
                        </div>
                        <div class="cart-details">
                            <h3>${item.title}</h3>
                            <p>${item.description}</p>
                            <p class="cart-price">Една бройка: ${formatPrice(unitPrice)} ${currency}</p>
                            <div class="quantity-control">
                                <button type="button" class="quantity-button quantity-decrease">-</button>
                                <span class="quantity-value">${item.quantity}</span>
                                <button type="button" class="quantity-button quantity-increase">+</button>
                            </div>
                            <p class="cart-item-total">Общо: ${itemTotal} ${currency}</p>
                        </div>
                    </div>
                `;
            }).join('');

            const totalAmount = formatPrice(cartItems.reduce((sum, item) => {
                return sum + parsePrice(item.price) * item.quantity;
            }, 0));
            const currency = cartItems.length ? cartItems[0].price.replace(/[0-9\.,\s]/g, '') || 'BGN' : 'BGN';

            cartContent.innerHTML = `
                <div class="cart-list">
                    ${itemsHtml}
                </div>
                <div class="cart-summary">
                    <p>Обща сума: <strong>${totalAmount} ${currency}</strong></p>
                </div>
            `;

            cartContent.querySelectorAll('.cart-item').forEach(function (cartItem) {
                const index = Number(cartItem.dataset.index);
                const decreaseButton = cartItem.querySelector('.quantity-decrease');
                const increaseButton = cartItem.querySelector('.quantity-increase');
                const removeButton = cartItem.querySelector('.cart-remove');

                decreaseButton.addEventListener('click', function () {
                    if (cartItems[index].quantity > 1) {
                        cartItems[index].quantity -= 1;
                        saveCart();
                        renderCart();
                    }
                });

                increaseButton.addEventListener('click', function () {
                    cartItems[index].quantity += 1;
                    saveCart();
                    renderCart();
                });

                if (removeButton) {
                    removeButton.addEventListener('click', function () {
                        cartItems.splice(index, 1);
                        saveCart();
                        renderCart();
                    });
                }
            });
        }

        renderCart();
    }
});
