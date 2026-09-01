// ===== NÚMERO DO WHATSAPP PARA RECEBER PEDIDOS =====
const WHATSAPP_NUMBER = "5521964351472";

// ===== Catálogo (admite override via admin localStorage) =====
let perfumesData = (typeof perfumes !== 'undefined') ? perfumes.slice() : [];

// Importar dados salvos pelo admin, se houverem
try {
    const saved = localStorage.getItem('ea_perfumes_admin');
    if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) {
            perfumesData = parsed;
        }
    }
} catch (e) {
    // ignora e usa o catálogo padrão
}

// ===== Pedidos salvos no localStorage =====
function getOrders() {
    try {
        const saved = localStorage.getItem('ea_orders');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
}

function saveOrder(order) {
    const orders = getOrders();
    order.id = Date.now();
    order.data = new Date().toLocaleString('pt-BR');
    order.status = 'Solicitado';
    orders.push(order);
    localStorage.setItem('ea_orders', JSON.stringify(orders));
}

// ===== Formatação de preço BRL =====
function formatPrice(value) {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// ===== Gerar estrelas =====
function renderStars(nota) {
    nota = nota || 0;
    const full = Math.floor(nota);
    const half = nota - full >= 0.4;
    let stars = '';
    for (let i = 0; i < full; i++) stars += '★';
    if (half) stars += '⯨';
    const rest = 5 - Math.ceil(nota);
    for (let i = 0; i < rest; i++) stars += '☆';
    return stars;
}

// ===== Renderizar card de perfume =====
function renderPerfumeCard(perfume) {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-categoria', perfume.categoria || '');
    card.setAttribute('data-genero', (perfume.genero || '').toLowerCase());
    card.setAttribute('data-id', perfume.id);

    const badgeHtml = perfume.badge
        ? `<span class="card-badge">${perfume.badge}</span>`
        : '';

    const imgHtml = perfume.imagem
        ? `<img src="${perfume.imagem}" alt="${perfume.nome}" class="card-img-real">`
        : `<div class="card-img">${perfume.emoji}</div>`;

    const esgotado = perfume.esgotado;
    const orderHtml = esgotado
        ? `<span class="btn-out-stock">Esgotado</span>`
        : `<button class="btn-order" data-id="${perfume.id}">
                <span class="wa-icon">💬</span> Pedir
            </button>`;

    const badgeFinal = esgotado
        ? `<span class="card-badge badge-soldout">Esgotado</span>`
        : badgeHtml;

    const stars = renderStars(perfume.nota || 0);

    const inspiradoHtml = perfume.inspirado
        ? `<p class="card-inspired">${perfume.inspirado}</p>`
        : '';

    const shareUrl = encodeURIComponent(`${perfume.nome} - ${perfume.marca} por ${formatPrice(perfume.preco)}. Essência Árabe 🕌`);

    card.innerHTML = `
        <div class="card-img-wrap">
            ${badgeFinal}
            <span class="card-original">100% Original</span>
            ${imgHtml}
        </div>
        <div class="card-body">
            <div class="card-top">
                <span class="card-category">${perfume.genero}</span>
                <div class="card-rating" title="${perfume.nota} de 5">${stars} <span class="rating-count">(${perfume.avaliacoes || 0})</span></div>
            </div>
            <h3 class="card-title">${perfume.nome}</h3>
            <p class="card-brand">${perfume.marca}</p>
            ${inspiradoHtml}
            <p class="card-desc">${perfume.descricao}</p>
            <div class="card-footer">
                <span class="card-price">${formatPrice(perfume.preco)}
                    <span class="card-fixacao">Fixação ${perfume.fixacao || ''}</span>
                </span>
                ${orderHtml}
            </div>
            <button class="btn-share" data-share="${shareUrl}">
                🔗 Compartilhar no WhatsApp
            </button>
        </div>
    `;

    const orderBtn = card.querySelector('.btn-order');
    if (orderBtn) {
        orderBtn.addEventListener('click', function () {
            window.openModal(perfume);
        });
    }

    const shareBtn = card.querySelector('.btn-share');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            window.open(`https://wa.me/?text=${shareUrl}`, '_blank');
        });
    }

    return card;
}

// ===== Inicialização principal =====
document.addEventListener('DOMContentLoaded', function () {

    const grid = document.getElementById('perfumes-grid');

    // Renderiza todos os perfumes
    function renderAllPerfumes() {
        grid.innerHTML = '';
        perfumesData.forEach(function (perfume) {
            grid.appendChild(renderPerfumeCard(perfume));
        });
    }

    renderAllPerfumes();

    // ===== Filtros por gênero =====
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            filterBtns.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            const cards = grid.querySelectorAll('.card');

            cards.forEach(function (card) {
                const genero = card.getAttribute('data-genero');
                if (filter === 'all' || genero === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // ===== Modal de Pedido =====
    const modalOverlay = document.getElementById('order-modal');
    const modalClose = document.getElementById('modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalBrand = document.getElementById('modal-brand');
    const modalPrice = document.getElementById('modal-price');
    const modalPerfumeImg = document.getElementById('modal-perfume-img');
    const orderForm = document.getElementById('order-form');
    const qtyInput = document.getElementById('quantidade');

    window.openModal = function (perfume) {
        window.currentPerfume = perfume;
        modalTitle.textContent = perfume.nome;
        modalBrand.textContent = perfume.marca;
        modalPrice.textContent = formatPrice(perfume.preco);
        if (perfume.imagem) {
            modalPerfumeImg.innerHTML = `<img src="${perfume.imagem}" alt="${perfume.nome}" class="modal-img-real">`;
        } else {
            modalPerfumeImg.textContent = perfume.emoji;
        }
        qtyInput.value = 1;
        orderForm.reset();
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(function () { document.getElementById('nome').focus(); }, 100);
    };

    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) closeModal();
    });

    // Controle de quantidade
    const qtyMinus = document.getElementById('qty-minus');
    const qtyPlus = document.getElementById('qty-plus');
    qtyMinus.addEventListener('click', function () {
        let v = parseInt(qtyInput.value) || 1;
        if (v > 1) qtyInput.value = v - 1;
    });
    qtyPlus.addEventListener('click', function () {
        let v = parseInt(qtyInput.value) || 1;
        if (v < 99) qtyInput.value = v + 1;
    });
    qtyInput.addEventListener('change', function () {
        let v = parseInt(qtyInput.value) || 1;
        if (v < 1) v = 1;
        if (v > 99) v = 99;
        qtyInput.value = v;
    });

    // Limpa o aviso de pagamento ao selecionar uma opção
    document.querySelectorAll('input[name="pagamento"]').forEach(function (r) {
        r.addEventListener('change', function () {
            const err = document.getElementById('payment-error');
            if (err) err.textContent = '';
        });
    });

    // ===== Enviar pedido via WhatsApp =====
    orderForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const perfume = window.currentPerfume;
        if (!perfume) return;

        const nome = document.getElementById('nome').value.trim();
        const telefone = document.getElementById('telefone').value.trim();
        const quantidade = parseInt(qtyInput.value) || 1;
        const observacoes = document.getElementById('observacoes').value.trim();
        const pagamento = document.querySelector('input[name="pagamento"]:checked');

        if (!nome || !telefone) {
            alert('Por favor, preencha nome e telefone.');
            return;
        }

        if (!pagamento) {
            const err = document.getElementById('payment-error');
            if (err) err.textContent = 'Selecione a forma de pagamento.';
            alert('Por favor, selecione a forma de pagamento (PIX ou Cartão).');
            return;
        }

        const total = perfume.preco * quantidade;

        // Salva o pedido no localStorage
        saveOrder({
            perfumeId: perfume.id,
            perfume: perfume.nome,
            marca: perfume.marca,
            preco: perfume.preco,
            quantidade: quantidade,
            total: total,
            pagamento: pagamento.value,
            nome: nome,
            telefone: telefone,
            observacoes: observacoes
        });

        let mensagem = `*🕌 NOVO PEDIDO - ESSÊNCIA ÁRABE*\n\n`;
        mensagem += `*Perfume:* ${perfume.nome} (${perfume.marca})\n`;
        mensagem += `*Valor unitário:* ${formatPrice(perfume.preco)}\n`;
        mensagem += `*Quantidade:* ${quantidade}\n`;
        mensagem += `*Total:* ${formatPrice(total)}\n`;
        mensagem += `*Pagamento:* ${pagamento.value}\n\n`;
        mensagem += `*Dados do Cliente:*\n`;
        mensagem += `*Nome:* ${nome}\n`;
        mensagem += `*Telefone:* ${telefone}\n`;
        if (observacoes) mensagem += `*Observações:* ${observacoes}\n`;
        mensagem += `\n_Obrigado pela preferência! 🙏_`;

        // Envia o pedido para o WhatsApp
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`, '_blank');
        closeModal();
    });

    // ===== Animação dos números (stats) =====
    function animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        if (!statNumbers.length) return;
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.getAttribute('data-target'));
                    const suffix = entry.target.dataset.target === '100' ? '%' : '+';
                    let current = 0;
                    const increment = target / 60;
                    const timer = setInterval(function () {
                        current += increment;
                        if (current >= target) {
                            clearInterval(timer);
                            entry.target.textContent = target + suffix;
                        } else {
                            entry.target.textContent = Math.floor(current) + suffix;
                        }
                    }, 25);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        statNumbers.forEach(function (num) { observer.observe(num); });
    }
    animateStats();

    // ===== Esc fecha modais =====
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            modalOverlay.classList.remove('active');
            const pm = document.getElementById('policy-modal');
            if (pm) pm.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // ===== Modal de Política =====
    const policyModal = document.getElementById('policy-modal');
    if (policyModal) {
        const policyClose = document.getElementById('policy-close');
        const policyTitle = document.getElementById('policy-title');
        const policyContent = document.getElementById('policy-content');

        const policies = {
            entrega: {
                titulo: 'Política de Entrega',
                texto: `<p><strong>Prazo de envio:</strong> os pedidos são processados em até 24h úteis após a confirmação do pagamento.</p>
                        <p><strong>Transporte:</strong> enviamos para todo o Brasil via Correios (PAC e SEDEX) ou transportadora, conforme a região.</p>
                        <p><strong>Prazo de entrega:</strong> de 3 a 10 dias úteis, dependendo da localidade. O código de rastreio é enviado pelo WhatsApp após o poste.</p>`
            },
            privacidade: {
                titulo: 'Política de Privacidade',
                texto: `<p>Usamos seus dados (nome e telefone) apenas para processar o seu pedido e entrar em contato sobre ele.</p>
                        <p>Não compartilhamos suas informações com terceiros e não enviamos spam. Seus dados são tratados com confidencialidade.</p>`
            }
        };

        function openPolicy(type) {
            const p = policies[type];
            if (!p) return;
            policyTitle.textContent = p.titulo;
            policyContent.innerHTML = p.texto;
            policyModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closePolicy() {
            policyModal.classList.remove('active');
            document.body.style.overflow = '';
        }

        document.querySelectorAll('[data-policy]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                openPolicy(link.getAttribute('data-policy'));
            });
        });

        policyClose.addEventListener('click', closePolicy);
        policyModal.addEventListener('click', function (e) {
            if (e.target === policyModal) closePolicy();
        });
    }

    // ===== Header muda de estilo no scroll =====
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
            } else {
                header.style.boxShadow = 'none';
            }
        });
    }

    // ===== Links de WhatsApp =====
    document.querySelectorAll('a[data-multi-wa]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            window.open('https://wa.me/' + WHATSAPP_NUMBER, '_blank');
        });
    });
});
