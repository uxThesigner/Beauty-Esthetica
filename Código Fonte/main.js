// ======================================================
// MAIN.JS - CONTROLE GERAL E ROTEAMENTO (BEAUTY ESTHETICA)
// ======================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. LÓGICA DE CARRINHO COMPARTILHADO (Link vindo do WhatsApp)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const sharedCartData = urlParams.get('cart');

        if (sharedCartData) {
            const jsonString = atob(sharedCartData);
            const parsedCart = JSON.parse(jsonString);
            
            if (Array.isArray(parsedCart)) {
                localStorage.setItem('kangarooCart', JSON.stringify(parsedCart));
                localStorage.removeItem('appliedCouponCode');
                // Limpa a URL para não recarregar o carrinho ao dar F5
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    } catch (e) {
        console.warn("Nenhum carrinho compartilhado detectado.");
    }

    // 2. INICIALIZAÇÃO GLOBAL
    loadCart(); 
    
    // Carrega Header e Footer (Injeção de HTML)
    // O setupHeaderLogic inicia os menus e busca assim que o HTML carregar
    loadComponent('header-placeholder', 'cabecalho.html', setupHeaderLogic);
    loadComponent('footer-placeholder', 'rodape.html'); 
    

    // 3. ROTEAMENTO DE PÁGINAS (Lógica Específica por Tela)
    const body = document.body;

    // --- HOME PAGE ---
    // Detecta a Home pela presença do vídeo Hero
    if (document.querySelector('.hero-banner-video')) {
        
        // Parceiros (Novo Grid Fixo de 5 itens)
        if (typeof setupPartnerContent === 'function') {
            setupPartnerContent(); 
        }
        
        // Resultados Recentes (Magic Reveal - 4 colunas)
        if (typeof setupHomePortfolio === 'function') {
            setupHomePortfolio();
        }
    }

    // --- PÁGINA DE COMBOS & PROMOÇÕES ---
    if (body.classList.contains('promocoes-page')) {
        // Inicia o Banner Rotativo Slim
        setupInternalBannerCarousel('love-banner-carousel');
        
        // Preenche automaticamente o Slider de Ofertas (se houver placeholder no HTML)
        const promoSlider = document.getElementById('love-product-slider');
        if (promoSlider && typeof PRODUCTS !== 'undefined') {
            // Filtra produtos que tenham tags de oferta
            const promos = PRODUCTS.filter(p => p.tags.some(t => ['promo', 'kit', 'presente', 'home care'].includes(t)));
            
            if (promos.length > 0) {
                promoSlider.innerHTML = promos.map(renderProductCard).join('');
            } else {
                promoSlider.innerHTML = '<p style="padding:20px; color:#888;">Nenhuma oferta disponível no momento.</p>';
            }
        }
    }

    // --- PÁGINA DE AVALIAÇÃO (Anamnese Virtual) ---
    if (body.classList.contains('avaliacao-page')) {
        if (typeof setupExclusivasPage === 'function') {
            setupExclusivasPage();
        }
    }

    // --- PÁGINA DE BUSCA ---
    if (body.classList.contains('search-page')) {
        renderSearchPage();
        setupInternalBannerCarousel('internal-banner-carousel-busca');
    }

    // --- PÁGINA DE DETALHES DO PRODUTO ---
    if (body.classList.contains('product-detail-page')) {
        setupProductPage();
    }

    // --- PÁGINA DO CARRINHO ---
    if (body.classList.contains('cart-page')) {
        renderCartPage();
        
        // Lógica do Cupom
        const btnCupom = document.getElementById('cupom-btn');
        const inputCupom = document.getElementById('cupom-input');
        const msgCupom = document.getElementById('cupom-status-message');
        
        if (btnCupom && inputCupom && typeof COUPONS !== 'undefined') {
            btnCupom.addEventListener('click', () => {
                const code = inputCupom.value.toUpperCase().trim();
                const coupon = COUPONS.find(c => c.code === code);
                
                if (coupon) {
                    localStorage.setItem('appliedCouponCode', code);
                    loadCart(); 
                    updateCartSummary();
                    msgCupom.textContent = `Cupom ${code} aplicado!`;
                    msgCupom.style.color = 'var(--color-accent)';
                } else {
                    msgCupom.textContent = "Cupom inválido.";
                    msgCupom.style.color = 'red';
                }
            });
        }
        
        // Lógica de Compartilhar Carrinho
        const btnShare = document.getElementById('share-cart-btn');
        const msgShare = document.getElementById('share-cart-success');
        if (btnShare && msgShare) {
            btnShare.addEventListener('click', (e) => {
                e.preventDefault();
                if (cartItems.length === 0) return alert('Sacola vazia!');
                
                const b64 = btoa(JSON.stringify(cartItems));
                const link = `${window.location.origin}${window.location.pathname}?cart=${b64}`;
                
                const el = document.createElement('textarea');
                el.value = link;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                
                btnShare.style.display = 'none';
                msgShare.style.display = 'inline';
                setTimeout(() => { 
                    btnShare.style.display = 'inline'; 
                    msgShare.style.display = 'none'; 
                }, 3000);
            });
        }
    }

    // --- PÁGINA DE CHECKOUT ---
    if (body.classList.contains('checkout-page')) {
        setupPaymentPage();
    }
});
