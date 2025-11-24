// ======================================================
// BEAUTY ESTHETICA - LÓGICA PRINCIPAL (FUNCTIONS.JS)
// ======================================================

const WHATSAPP_NUMBER = '5581999545034'; 
let cartItems = [];
let appliedCoupon = null;

// --- 1. INICIALIZAÇÃO E COMPONENTES GERAIS ---

function setupHeaderLogic() {
    setupScrolledHeader(); 
    setupMobileMenu(); 
    setupSearch(); 
    updateCartCount(); 

    // Sincroniza carrinho entre abas
    window.addEventListener('storage', (event) => {
        if (event.key === 'kangarooCart' || event.key === 'appliedCouponCode') {
            loadCart(); 
            updateCartCount();
            if (document.body.classList.contains('cart-page')) renderCartPage();
            if (document.body.classList.contains('checkout-page')) setupPaymentPage(); 
        }
    });
}

function loadComponent(elementId, componentUrl, callback = null) {
    const componentElement = document.getElementById(elementId);
    if (!componentElement) return;

    fetch(componentUrl)
        .then(response => {
            if (!response.ok) throw new Error(`Erro componente: ${response.statusText}`);
            return response.text();
        })
        .then(html => {
            componentElement.innerHTML = html;
            if (callback) callback();
        })
        .catch(error => {
            console.error(`Falha ao carregar ${componentUrl}:`, error);
        });
}

// --- 2. GERENCIAMENTO DO CARRINHO ---

function saveCart() {
    localStorage.setItem('kangarooCart', JSON.stringify(cartItems));
}

function loadCart() { 
    const storedCart = localStorage.getItem('kangarooCart');
    if (storedCart) cartItems = JSON.parse(storedCart);
    
    const storedCoupon = localStorage.getItem('appliedCouponCode');
    if (storedCoupon && typeof COUPONS !== 'undefined') {
        appliedCoupon = COUPONS.find(c => c.code === storedCoupon);
    }
}

function addItemToCart(productId, color, size, quantity = 1) {
    if (typeof PRODUCTS === 'undefined') return; 
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const itemIdentifier = `${productId}-${color}-${size}`;
    const existingItem = cartItems.find(item => item.identifier === itemIdentifier);
    const isService = product.tags.includes('servico');

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cartItems.push({
            identifier: itemIdentifier,
            id: productId,
            name: product.name,
            image: product.image,
            price: product.price,
            color: color,
            size: size,
            quantity: quantity,
            isService: isService 
        });
    }
    saveCart();
    updateCartCount(); 
    if (document.body.classList.contains('cart-page')) renderCartPage();
}

// Adiciona o resultado da Avaliação ao carrinho
function addCustomItemToCart(itemData) {
    const itemIdentifier = `custom-${Date.now()}`;
    cartItems.push({
        identifier: itemIdentifier,
        id: 'custom-avaliacao', 
        name: itemData.name, 
        image: itemData.image, 
        price: itemData.price, 
        color: itemData.color, 
        size: itemData.size, 
        quantity: 1,
        customDetails: itemData.description,
        isService: true 
    });
    saveCart();
    updateCartCount();
}

function removeItem(identifier) {
    cartItems = cartItems.filter(item => item.identifier !== identifier);
    saveCart();
    updateCartCount();
    renderCartPage();
}

function updateCartItemQuantity(identifier, newQuantity) {
    const item = cartItems.find(item => item.identifier === identifier);
    if (item) {
        item.quantity = parseInt(newQuantity);
        if (item.quantity <= 0) {
            removeItem(identifier);
        } else {
            saveCart();
            renderCartPage();
        }
    }
}

function calculateTotals() {
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const SHIPPING_THRESHOLD = 300.00; 
    const SHIPPING_COST = 20.00; 
    
    // Regra: Se só tiver serviços, frete grátis
    const onlyServices = cartItems.length > 0 && cartItems.every(i => i.isService);
    
    let shipping = 0;
    if (!onlyServices && subtotal < SHIPPING_THRESHOLD && subtotal > 0) {
        shipping = SHIPPING_COST;
    }

    let discount = 0;
    if (appliedCoupon) {
        discount = subtotal * appliedCoupon.discount_percent;
    }

    const total = subtotal + shipping - discount;
    return { subtotal, shipping, discount, total };
}

// --- 3. UTILITÁRIOS UI ---

function formatPrice(priceValue) {
    if (typeof priceValue === 'string') {
        priceValue = parseFloat(priceValue.replace('R$', '').replace('.', '').replace(',', '.').trim());
    }
    return `R$ ${priceValue.toFixed(2).replace('.', ',')}`;
}

function getSearchQuery() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('q') ? urlParams.get('q').toLowerCase() : null;
}

function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) { 
        const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}

function createColorSwatches(colors) {
    let swatchesHTML = '';
    for (const colorName of colors) {
        swatchesHTML += `<span class="color-swatch-text" style="display:inline-block; font-size:0.7em; border:1px solid #ddd; padding:2px 6px; border-radius:4px; margin-right:4px; color:#666; background:#f9f9f9;">${colorName}</span>`;
    }
    return swatchesHTML;
}

// --- 4. RENDERIZAÇÃO DE PÁGINAS ---

function renderProductCard(product) {
    const priceString = formatPrice(product.price);
    const variationsHTML = createColorSwatches(product.colors);
    return `
        <a href="produtos.html?id=${product.id}" class="product-card-link">
            <div class="product-card">
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-main-img" loading="lazy">
                </div>
                <div class="product-info">
                    <div class="product-meta">
                        <span class="rating"><i class="fas fa-star"></i> ${product.rating}</span>
                        <span class="reviews-count">${product.reviews} avaliações</span>
                    </div>
                    <h3>${product.name}</h3>
                    <div class="price-box">
                        <span class="price-tag">a partir de</span>
                        <span class="current-price">${priceString}</span>
                    </div>
                    <div style="margin-top:5px;">${variationsHTML}</div>
                </div>
            </div>
        </a>
    `;
}

function renderSearchPage() {
    const resultsGridEl = document.getElementById('search-results');
    if (!resultsGridEl) return;
    if (typeof PRODUCTS === 'undefined') return;

    const query = getSearchQuery(); 

    if (!query) {
        resultsGridEl.innerHTML = '<p class="search-no-results">Navegue pelo menu para encontrar o que precisa.</p>';
        return;
    }

    const decodedQuery = decodeURIComponent(query);
    const results = searchProducts(decodedQuery); 

    if (results.length > 0) {
        resultsGridEl.innerHTML = results.map(renderProductCard).join('');
    } else {
        resultsGridEl.innerHTML = `<p class="search-no-results">Nenhum tratamento encontrado.</p>`;
    }
}

function renderCartPage() {
    const cartBody = document.getElementById('cart-list-body');
    if (!cartBody) return;

    if (cartItems.length === 0) {
        cartBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 60px 0; color: #888; font-weight:300;">Sua sacola está vazia.<br><a href="index.html" style="color:var(--color-accent); font-weight:600;">Ver tratamentos</a></td></tr>`;
    } else {
        cartBody.innerHTML = cartItems.map(item => `
            <tr>
                <td class="product-info-cell">
                    <img src="${item.image}" alt="${item.name}" class="cart-product-img">
                    <div style="display:flex; flex-direction:column;">
                        <span style="font-weight:600; color:var(--color-primary);">${item.name}</span>
                        ${item.isService ? '<span style="font-size:0.75em; color:var(--color-accent); text-transform:uppercase; letter-spacing:1px;"><i class="fas fa-calendar-check"></i> Serviço</span>' : ''}
                        ${item.id === 'custom-avaliacao' ? `<span style="font-size:0.75em; color:#666; margin-top:5px; font-style:italic;">${item.customDetails}</span>` : ''}
                    </div>
                </td>
                <td>${item.color}</td>
                <td>${item.size}</td>
                <td>
                    <input type="number" min="1" value="${item.quantity}" class="cart-quantity-input" data-identifier="${item.identifier}">
                </td>
                <td style="font-weight:600;">${formatPrice(item.price * item.quantity)}</td>
                <td>
                    <button class="btn-remove-item" data-identifier="${item.identifier}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }
    updateCartSummary(); 
    setupCartListeners(); 
}

function updateCartSummary() {
    const { subtotal, shipping, total } = calculateTotals(); 
    const subtotalEl = document.getElementById('summary-subtotal');
    const shippingEl = document.getElementById('summary-shipping');
    const totalEl = document.getElementById('summary-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (shippingEl) shippingEl.textContent = (shipping === 0) ? 'GRÁTIS / AGENDAR' : formatPrice(shipping);
    if (totalEl) totalEl.textContent = formatPrice(total);
    
    if (checkoutBtn) {
        checkoutBtn.disabled = total <= 0;
        checkoutBtn.innerHTML = total > 0 ? `<i class="fab fa-whatsapp"></i> AGENDAR / COMPRAR` : 'SACOLA VAZIA';
    }
}

function searchProducts(query) {
    if (!query || typeof PRODUCTS === 'undefined') return [];
    const lowerCaseQuery = query.toLowerCase();
    return PRODUCTS.filter(product => {
        return product.name.toLowerCase().includes(lowerCaseQuery) || product.tags.join(' ').toLowerCase().includes(lowerCaseQuery) || product.collection.toLowerCase().includes(lowerCaseQuery);
    });
}

// --- 5. PÁGINA DE PRODUTO ---

function setupProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (!productId || typeof PRODUCTS === 'undefined') { window.location.href = 'index.html'; return; }
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) { window.location.href = 'index.html'; return; }

    const isService = product.tags.includes('servico');
    document.title = `${product.name} | BEAUTY ESTHETICA`;
    
    document.getElementById('main-product-image').src = product.image;
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-rating').innerHTML = `<i class="fas fa-star"></i> ${product.rating}`;
    document.getElementById('product-reviews').textContent = `(${product.reviews} avaliações)`;
    document.getElementById('product-price').textContent = formatPrice(product.price);
    document.getElementById('product-material').textContent = product.material;

    // Ajusta rótulos dinamicamente
    const labelSize = document.querySelector('label[for="size-select"]');
    const labelColor = document.querySelector('label[for="color-select"]');
    const btnAdd = document.querySelector('.add-to-cart-btn');

    if (isService) {
        if(labelSize) labelSize.textContent = "Duração / Pacote:";
        if(labelColor) labelColor.textContent = "Variação / Área:";
        if(btnAdd) btnAdd.innerHTML = '<i class="fas fa-calendar-check"></i> AGENDAR SESSÃO';
    } else {
        if(labelSize) labelSize.textContent = "Volume / Tamanho:";
        if(labelColor) labelColor.textContent = "Opção / Fragrância:";
        if(btnAdd) btnAdd.innerHTML = '<i class="fas fa-shopping-bag"></i> COLOCAR NA SACOLA';
    }

    const colorSelect = document.getElementById('color-select');
    colorSelect.innerHTML = product.colors.map(c => `<option value="${c}">${c}</option>`).join('');
    
    const sizeSelect = document.getElementById('size-select');
    sizeSelect.innerHTML = product.sizes.map(s => `<option value="${s}">${s}</option>`).join('');

    document.getElementById('add-to-cart-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const color = colorSelect.value;
        const size = sizeSelect.value;
        const qty = parseInt(document.getElementById('quantity-input').value);
        addItemToCart(product.id, color, size, qty);
        const msg = document.getElementById('add-to-cart-message');
        msg.textContent = 'Adicionado! ✨';
        setTimeout(() => { msg.textContent = ''; }, 2000);
    });
    
    setupInternalBannerCarousel('internal-banner-carousel-produto'); 
}

// --- 6. PARCEIROS (VERSÃO GRID FIXO DE 5) ---

function renderPartnerCardSimple(partner) {
    return `
        <a href="${partner.link}" class="partner-card-link" title="${partner.nickname}">
            <div class="partner-card">
                <div class="partner-image-container">
                    <img src="Imagens/Fotos Parceiros/${partner.image}" alt="${partner.name}" loading="lazy">
                </div>
                <div class="partner-info">
                    <h3>${partner.name}</h3>
                    <p class="partner-nickname">${partner.nickname}</p> </div>
            </div>
        </a>
    `;
}

function setupPartnerContent() {
    // Procura o novo container fixo
    const gridContainer = document.getElementById('static-partner-grid');
    
    // Se não achar (ou se o array de parceiros não existir), para.
    if (!gridContainer || typeof PARTNERS === 'undefined') return;

    // Pega APENAS OS PRIMEIROS 5 parceiros
    const top5Partners = PARTNERS.slice(0, 5);

    gridContainer.innerHTML = top5Partners.map(renderPartnerCardSimple).join('');
}


// --- 7. WHATSAPP CHECKOUT ---

function generateWhatsAppOrderLink(formData) {
    const totals = calculateTotals(); 
    let msg = `Olá, Beauty Esthetica! ✨%0A%0ASou: ${formData.nome_cliente}%0A`;
    msg += `Gostaria de solicitar os seguintes itens:%0A%0A`;
    
    cartItems.forEach((item) => {
        if(item.isService) {
            msg += `💆‍♀️ *SERVIÇO: ${item.name}*%0A   - Opção: ${item.size}%0A   - Detalhe: ${item.color}%0A   - Qtd: ${item.quantity}%0A`;
        } else {
            msg += `🧴 *PRODUTO: ${item.name}*%0A   - Tam: ${item.size}%0A   - Var: ${item.color}%0A   - Qtd: ${item.quantity}%0A`;
        }
        if (item.id === 'custom-avaliacao') msg += `   -> (Avaliação Online Realizada)%0A`;
        msg += `%0A`;
    });
    msg += `--------------------------------%0ATotal Estimado: ${formatPrice(totals.total)}%0A--------------------------------%0A`;
    msg += `Dados para contato/entrega:%0ARua: ${formData.rua}, ${formData.numero} - ${formData.bairro}%0A`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}

function setupPaymentPage() {
    // --- SEGURANÇA: Se o carrinho estiver vazio, chuta para a home ---
    // Isso evita erros e garante que o cliente só veja essa tela se for comprar.
    if (!cartItems || cartItems.length === 0) {
        alert("Sua sacola está vazia! Você será redirecionado para nossos tratamentos.");
        window.location.href = 'index.html';
        return; // Para o código aqui, não deixa carregar o resto.
    }
    // ------------------------------------------------------------------

    const contactForm = document.getElementById('contact-info-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = {
                nome_cliente: document.getElementById('nome-completo').value,
                rua: document.getElementById('rua').value,
                numero: document.getElementById('numero').value,
                bairro: document.getElementById('bairro').value,
            };
            window.open(generateWhatsAppOrderLink(formData), '_blank');
        });
    }
    
    // Calcula os totais para exibir na tela
    const totals = calculateTotals();
    document.getElementById('co_subtotal').textContent = formatPrice(totals.subtotal);
    document.getElementById('co_total').textContent = formatPrice(totals.total);
    
    // Atualiza botão para texto mais chamativo com ícone do WhatsApp
    const btnConfirm = document.getElementById('confirm-payment-btn');
    if(btnConfirm) btnConfirm.innerHTML = '<i class="fab fa-whatsapp"></i> ENVIAR PEDIDO NO WHATSAPP';
}


// --- 8. ANAMNESE VIRTUAL (ASSISTENTE INTELIGENTE) ---

function setupExclusivasPage() {
    // Renomeada no fluxo, mas mantemos o nome para compatibilidade se o HTML ainda chamar assim.
    // Se no HTML estiver setupAvaliacaoPage, altere o nome aqui.
    const contentDiv = document.getElementById('wizard-content');
    const progressBar = document.getElementById('wiz-progress-bar');
    
    if(!contentDiv) return;

    let formData = {
        nome: "", idade: "", categories: [], facialOptions: [], corporalOptions: [], capilarOptions: [],
        massagem: { queixa: "", exercicio: null, freq: "", trabalho: null, descTrab: "", localDor: "" }
    };

    let currentStep = "nome"; 
    let stepQueue = [];     
    let stepHistory = [];   

    const btnBack = `<button class="btn btn-secondary" onclick="handleBack()">Voltar</button>`;

    const renderStep = () => {
        contentDiv.innerHTML = ''; 
        let html = '';
        let progress = 0;

        switch(currentStep) {
            case "nome":
                progress = 10;
                html = `<h2 class="wiz-title">Olá! Qual é o seu nome?</h2><input type="text" id="input-nome" class="wiz-input-sutil" placeholder="Digite seu nome..." value="${formData.nome}"><div class="wiz-nav"><button class="btn btn-primary" onclick="handleNext('nome')">Continuar</button></div>`;
                break;
            case "idade":
                progress = 20;
                html = `<h2 class="wiz-title">Prazer, ${formData.nome}.<br>Qual sua idade?</h2><input type="number" id="input-idade" class="wiz-input-sutil" placeholder="Ex: 30" value="${formData.idade}"><div class="wiz-nav">${btnBack}<button class="btn btn-primary" onclick="handleNext('idade')">Continuar</button></div>`;
                break;
            case "categorias":
                progress = 30;
                html = `<h2 class="wiz-title">${formData.nome}, o que vamos tratar hoje?</h2><p class="wiz-subtitle">Pode selecionar mais de um.</p><div class="wiz-options-grid">${renderMultiOption('categories', 'Corporal')}${renderMultiOption('categories', 'Facial')}${renderMultiOption('categories', 'Capilar')}${renderMultiOption('categories', 'Massagens')}</div><div class="wiz-nav">${btnBack}<button class="btn btn-primary" onclick="handleNext('categorias')">Avançar</button></div>`;
                break;

            case "sub_corporal":
                progress = 50;
                html = `<h2 class="wiz-title">Tratamentos Corporais</h2><p class="wiz-subtitle">Selecione suas queixas:</p><div class="wiz-options-grid">${renderMultiOption('corporalOptions', 'Gordura Localizada')}${renderMultiOption('corporalOptions', 'Estrias')}${renderMultiOption('corporalOptions', 'Celulite')}${renderMultiOption('corporalOptions', 'Flacidez')}${renderMultiOption('corporalOptions', 'Depilação a Laser')}${renderMultiOption('corporalOptions', 'Clareamento Íntimo')}${renderMultiOption('corporalOptions', 'Aplicação de Enzimas')}${renderMultiOption('corporalOptions', 'Remoção de Sinais')}</div><div class="wiz-nav">${btnBack}<button class="btn btn-primary" onclick="handleNext('generic_sub')">Avançar</button></div>`;
                break;
            case "sub_facial":
                progress = 50;
                html = `<h2 class="wiz-title">Tratamentos Faciais</h2><p class="wiz-subtitle">O que deseja tratar?</p><div class="wiz-options-grid">${renderMultiOption('facialOptions', 'Limpeza de pele')}${renderMultiOption('facialOptions', 'Gerenciamento de Acne e Manchas')}${renderMultiOption('facialOptions', 'Rejuvenescimento')}${renderMultiOption('facialOptions', 'Peeling de Diamante')}${renderMultiOption('facialOptions', 'Microagulhamento')}${renderMultiOption('facialOptions', 'Remoção de Sinais Facial')}${renderMultiOption('facialOptions', 'Micropigmentação Labial')}${renderMultiOption('facialOptions', 'Hidragloss')}${renderMultiOption('facialOptions', 'Depilação a Laser Facial')}</div><div class="wiz-nav">${btnBack}<button class="btn btn-primary" onclick="handleNext('generic_sub')">Avançar</button></div>`;
                break;
            case "sub_capilar":
                progress = 50;
                html = `<h2 class="wiz-title">Tratamentos Capilares</h2><div class="wiz-options-grid">${renderMultiOption('capilarOptions', 'Queda de Cabelo')}${renderMultiOption('capilarOptions', 'Terapia Capilar')}${renderMultiOption('capilarOptions', 'Microagulhamento Capilar', '<div style="text-align:center; line-height:1.3;">Microagulhamento Capilar<div style="font-size:0.75em; font-style:italic; margin-top:4px; opacity:0.9;">(Para estimular o crescimento)</div></div>')}</div><div class="wiz-nav">${btnBack}<button class="btn btn-primary" onclick="handleNext('generic_sub')">Avançar</button></div>`;
                break;

            case "sub_massagem":
                progress = 50;
                html = `<h2 class="wiz-title">Massagem: O que sente?</h2><textarea id="input-massagem-queixa" class="wiz-textarea-sutil" placeholder="Ex: Tensão nos ombros, cansaço...">${formData.massagem.queixa}</textarea><div class="wiz-nav">${btnBack}<button class="btn btn-primary" onclick="handleNext('sub_massagem')">Continuar</button></div>`;
                break;
            case "exercicio":
                progress = 60;
                html = `<h2 class="wiz-title">Pratica exercícios físicos?</h2><div class="wiz-options-grid"><button class="wiz-btn-option" onclick="handleExercise(true)">Sim</button><button class="wiz-btn-option" onclick="handleExercise(false)">Não</button></div><div class="wiz-nav">${btnBack}</div>`;
                break;
            case "freq_exercicio":
                progress = 65;
                html = `<h2 class="wiz-title">Com qual frequência?</h2><div class="wiz-options-grid"><button class="wiz-btn-option" onclick="handleFreq('1-2x semana')">1-2x na semana</button><button class="wiz-btn-option" onclick="handleFreq('3-4x semana')">3-4x na semana</button><button class="wiz-btn-option" onclick="handleFreq('Todos os dias')">Todos os dias</button></div><div class="wiz-nav">${btnBack}</div>`;
                break;
            case "trabalho":
                progress = 70;
                html = `<h2 class="wiz-title">Trabalho ou atividade pesada?</h2><div class="wiz-options-grid"><button class="wiz-btn-option" onclick="handleWork(true)">Sim</button><button class="wiz-btn-option" onclick="handleWork(false)">Não</button></div><div class="wiz-nav">${btnBack}</div>`;
                break;
            case "desc_trabalho":
                progress = 75;
                html = `<h2 class="wiz-title">Descreva a atividade:</h2><textarea id="input-massagem-trab" class="wiz-textarea-sutil" placeholder="Ex: Fico muito tempo em pé...">${formData.massagem.descTrab}</textarea><div class="wiz-nav">${btnBack}<button class="btn btn-primary" onclick="handleNext('desc_trabalho')">Continuar</button></div>`;
                break;
            case "dor":
                progress = 85;
                html = `<h2 class="wiz-title">Local de maior dor/tensão?</h2><textarea id="input-massagem-dor" class="wiz-textarea-sutil" placeholder="Ex: Lombar, pescoço...">${formData.massagem.localDor}</textarea><div class="wiz-nav">${btnBack}<button class="btn btn-primary" onclick="handleNext('dor')">Finalizar Massagem</button></div>`;
                break;

            case "final":
                progress = 100;
                let summary = '<div class="wiz-summary-box"><h3>Resumo da Avaliação</h3>';
                summary += `<p><strong>Nome:</strong> ${formData.nome} (${formData.idade} anos)</p><ul class="wiz-summary-list">`;
                if(formData.facialOptions.length) summary += `<li><strong>FACIAL:</strong><br><span class="wiz-summary-detail">${formData.facialOptions.join(', ')}</span></li>`;
                if(formData.corporalOptions.length) summary += `<li><strong>CORPORAL:</strong><br><span class="wiz-summary-detail">${formData.corporalOptions.join(', ')}</span></li>`;
                if(formData.capilarOptions.length) { 
                    let cleanCap = formData.capilarOptions.map(o => o.replace(/<[^>]*>?/gm, ' ').replace('(Para estimular o crescimento)', ''));
                    summary += `<li><strong>CAPILAR:</strong><br><span class="wiz-summary-detail">${cleanCap.join(', ')}</span></li>`; 
                }
                if(formData.categories.includes('Massagens')) summary += `<li><strong>MASSAGEM:</strong><br><span class="wiz-summary-detail">Queixa: ${formData.massagem.queixa}<br>Dor: ${formData.massagem.localDor}</span></li>`;
                summary += '</ul></div>';
                html = `<h2 class="wiz-title">Tudo Pronto!</h2><p class="wiz-subtitle">Confira antes de enviar.</p>${summary}<div class="wiz-nav">${btnBack}<button id="wiz-finish-whatsapp" class="btn btn-primary" style="background-color:#25D366; border-color:#25D366;"><i class="fab fa-whatsapp"></i> CONFIRMAR E ENVIAR</button></div>`;
                break;
        }
        contentDiv.innerHTML = html;
        progressBar.style.width = `${progress}%`;
    };

    const renderMultiOption = (arrayName, value, customHtml = null) => {
        const arr = formData[arrayName];
        const isSelected = arr.includes(value);
        const display = customHtml || value;
        return `<button class="wiz-btn-option ${isSelected ? 'selected' : ''}" onclick="toggleSelection('${arrayName}', '${value}')">${display}</button>`;
    };

    window.toggleSelection = function(arrayName, value) {
        const arr = formData[arrayName];
        if (arr.includes(value)) {
            formData[arrayName] = arr.filter(item => item !== value);
        } else {
            formData[arrayName].push(value);
        }
        renderStep(); 
    };

    window.handleNext = function(currentContext) {
        if (currentContext === 'nome') {
            const val = document.getElementById('input-nome').value;
            if(!val) return alert('Digite seu nome.');
            formData.nome = val;
            changeStep('idade');
        } 
        else if (currentContext === 'idade') {
            const val = document.getElementById('input-idade').value;
            if(!val) return alert('Digite sua idade.');
            formData.idade = val;
            changeStep('categorias');
        }
        else if (currentContext === 'categorias') {
            if(formData.categories.length === 0) return alert('Selecione pelo menos uma opção.');
            stepQueue = []; 
            if(formData.categories.includes('Corporal')) stepQueue.push('sub_corporal');
            if(formData.categories.includes('Facial')) stepQueue.push('sub_facial');
            if(formData.categories.includes('Capilar')) stepQueue.push('sub_capilar');
            if(formData.categories.includes('Massagens')) stepQueue.push('sub_massagem', 'exercicio'); 
            stepQueue.push('final'); 
            processQueue();
        }
        else if (currentContext === 'generic_sub') processQueue();
        else if (currentContext === 'sub_massagem') { formData.massagem.queixa = document.getElementById('input-massagem-queixa').value; processQueue(); }
        else if (currentContext === 'desc_trabalho') { formData.massagem.descTrab = document.getElementById('input-massagem-trab').value; changeStep('dor'); }
        else if (currentContext === 'dor') { formData.massagem.localDor = document.getElementById('input-massagem-dor').value; processQueue(); }
    };

    window.handleBack = function() {
        if(stepHistory.length > 0) {
            const prev = stepHistory.pop();
            if (currentStep !== 'final') stepQueue.unshift(currentStep);
            currentStep = prev;
            renderStep();
        }
    };

    function changeStep(nextStep) {
        stepHistory.push(currentStep);
        currentStep = nextStep;
        renderStep();
    }

    function processQueue() {
        if(stepQueue.length > 0) {
            stepHistory.push(currentStep);
            currentStep = stepQueue.shift(); 
            renderStep();
        } else {
            changeStep('final');
        }
    }

    window.handleExercise = function(bool) {
        formData.massagem.exercicio = bool;
        stepHistory.push('exercicio');
        if(bool) currentStep = 'freq_exercicio';
        else currentStep = 'trabalho';
        renderStep();
    };

    window.handleFreq = function(val) {
        formData.massagem.freq = val;
        changeStep('trabalho');
    };

    window.handleWork = function(bool) {
        formData.massagem.trabalhoPesado = bool;
        stepHistory.push('trabalho');
        if(bool) currentStep = 'desc_trabalho';
        else currentStep = 'dor';
        renderStep();
    };

    contentDiv.addEventListener('click', (e) => {
        if(e.target.id === 'wiz-finish-whatsapp' || e.target.closest('#wiz-finish-whatsapp')) {
            let msg = `Olá, Beauty Esthetica!%0A%0ASou ${formData.nome}, tenho ${formData.idade} anos, e gostaria de seguir com minha avaliação!%0A________________________%0A`;
            if (formData.categories.includes('Facial') && formData.facialOptions.length) { msg += `💆‍♀️ *FACIAL*%0A`; formData.facialOptions.forEach(opt => msg += `- ${opt}%0A`); msg += `%0A`; }
            if (formData.categories.includes('Corporal') && formData.corporalOptions.length) { msg += `👙 *CORPORAL*%0A`; formData.corporalOptions.forEach(opt => msg += `- ${opt}%0A`); msg += `%0A`; }
            if (formData.categories.includes('Capilar') && formData.capilarOptions.length) { msg += `💇‍♀️ *CAPILAR*%0A`; formData.capilarOptions.forEach(opt => { let cleanOpt = opt.replace(/<[^>]*>?/gm, '').replace('(Para estimular o crescimento)', ''); msg += `- ${cleanOpt.trim()}%0A` }); msg += `%0A`; }
            if (formData.categories.includes('Massagens')) { msg += `🧘‍♀️ *MASSAGEM / SPA*%0AQueixa: ${formData.massagem.queixa || 'N/A'}%0AExercício: ${formData.massagem.exercicio ? 'Sim (' + formData.massagem.freq + ')' : 'Não'}%0ATrabalho: ${formData.massagem.trabalhoPesado ? 'Sim (' + formData.massagem.descTrab + ')' : 'Não'}%0ADor/Tensão: ${formData.massagem.localDor || 'N/A'}%0A`; }
            msg += `________________________%0AAguardo retorno`;
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
        }
    });

    renderStep();
}


// --- 9. RESULTADOS RECENTES (HOME - MAGIC REVEAL) ---

function setupHomePortfolio() {
    const container = document.querySelector('.recent-works-section .container');
    if (!container) return;

    // Evita duplicar se já tiver sido criado
    if(container.querySelector('.comparison-grid')) return;

    const title = container.querySelector('h2');
    container.innerHTML = ''; 
    if(title) container.appendChild(title);

    const gridDiv = document.createElement('div');
    gridDiv.className = 'comparison-grid';
    container.appendChild(gridDiv);

    // Imagens devem estar em Imagens/Resultados/
    // AJUSTE: Reduzido para 4 itens apenas (para casar com o CSS de 4 colunas)
    const RESULTS_DATA = [
        { title: "Micropigmentação", after: "result1.jpg", before: "before1.jpg" },
        { title: "Harmonização", after: "result2.jpg", before: "before2.jpg" },
        { title: "Bioestimulador", after: "result3.jpg", before: "before3.jpg" },
        { title: "Preenchimento", after: "result4.jpg", before: "before4.jpg" }
    ];
    
    gridDiv.innerHTML = RESULTS_DATA.map(item => `
        <div class="comparison-card">
            <img src="Imagens/Resultados/${item.after}" class="comparison-item img-after" alt="${item.title} Depois" loading="lazy">
            <div class="img-before-wrapper">
                <img src="Imagens/Resultados/${item.before}" class="comparison-item img-before" alt="${item.title} Antes" loading="lazy">
            </div>
            <div class="comparison-label"><h3>${item.title}</h3></div>
        </div>
    `).join('');
}

// --- 10. HELPERS FINAIS ---

function scrollSlider(sliderId, direction) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;
    const amount = 300 * direction; 
    slider.scrollBy({ left: amount, behavior: 'smooth' });
}

function setupScrolledHeader() {
    const header = document.querySelector('.header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });
}

function setupMobileMenu() {
    const menu = document.querySelector('.mobile-menu');
    const toggle = document.querySelector('.menu-toggle');
    const close = document.querySelector('.close-menu');
    
    // Abrir e Fechar o Painel Lateral
    if(menu && toggle) {
        toggle.addEventListener('click', () => menu.classList.add('open'));
        close.addEventListener('click', () => menu.classList.remove('open'));
    }

    // Lógica do Accordion (Sanfona)
    const dropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');

    dropdownToggles.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Verifica se este botão já está ativo
            const isAlreadyActive = btn.classList.contains('active');

            // 1. FECHA TODOS (Reseta tudo para o estado padrão)
            dropdownToggles.forEach(otherBtn => {
                otherBtn.classList.remove('active'); // Tira a cor dourada
                const content = otherBtn.nextElementSibling;
                if (content) {
                    content.classList.remove('open'); // Esconde o sub-menu
                }
            });

            // 2. SE NÃO ESTAVA ATIVO, ABRE ESTE (Se estava, ele já fechou no passo acima)
            if (!isAlreadyActive) {
                btn.classList.add('active'); // Coloca cor dourada
                const content = btn.nextElementSibling;
                if (content) {
                    content.classList.add('open'); // Mostra o sub-menu deste
                }
            }
        });
    });

    // Fecha o menu ao clicar em um link direto (ex: Parcerias, Avaliação)
    const directLinks = document.querySelectorAll('.mobile-direct-link, .mobile-dropdown-content a');
    directLinks.forEach(link => {
        link.addEventListener('click', () => {
            if(menu) menu.classList.remove('open');
        });
    });
}

function setupSearch() {
    const input = document.querySelector('.header .search-input');
    if (!input) return;
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value.trim() !== '') {
            e.preventDefault();
            window.location.href = `busca.html?q=${encodeURIComponent(input.value.trim())}`;
        }
    });
}

function setupInternalBannerCarousel(carouselId) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;
    const items = carousel.querySelectorAll('.internal-banner-item');
    if (items.length <= 1) return;
    let currentIndex = 0;
    setInterval(() => {
        const nextIndex = (currentIndex + 1) % items.length;
        items[currentIndex].classList.remove('active');
        items[nextIndex].classList.add('active');
        currentIndex = nextIndex;
    }, 4000);
}

function setupCartListeners() {
    document.querySelectorAll('.btn-remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => removeItem(e.currentTarget.dataset.identifier));
    });
    document.querySelectorAll('.cart-quantity-input').forEach(input => {
        input.addEventListener('input', (e) => updateCartItemQuantity(e.currentTarget.dataset.identifier, e.target.value));
    });
}

