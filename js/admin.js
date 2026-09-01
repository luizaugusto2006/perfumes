// ===== ADMIN - Essência Árabe =====
(function () {
    'use strict';

    const STORAGE_KEY = 'ea_perfumes_admin';
    const ADMIN_PASS = '19160731';

    let data = [];

    // ---------- Helpers ----------
    function getBasePerfumes() {
        if (typeof perfumes !== 'undefined') {
            return JSON.parse(JSON.stringify(perfumes));
        }
        return [];
    }

    function loadData() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length) {
                    data = parsed;
                    return;
                }
            }
        } catch (e) {}
        data = getBasePerfumes();
    }

    function persist() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function showStatus(msg, type) {
        const el = document.getElementById('admin-status');
        el.textContent = msg;
        el.className = 'admin-status show ' + (type || 'success');
        setTimeout(function () { el.className = 'admin-status'; }, 4000);
    }

    function escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function formatPrice(v) {
        return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function nextId() {
        let max = 0;
        data.forEach(function (p) { if (p.id > max) max = p.id; });
        return max + 1;
    }

    // ---------- Render lista ----------
    function renderList() {
        const listEl = document.getElementById('admin-list');
        const search = (document.getElementById('admin-search').value || '').toLowerCase().trim();
        const genre = document.getElementById('admin-filter-genre').value;

        const filtered = data.filter(function (p) {
            const matchGenre = genre === 'all' || p.genero === genre;
            const matchSearch = !search ||
                (p.nome + ' ' + (p.marca || '') + ' ' + (p.badge || '')).toLowerCase().indexOf(search) !== -1;
            return matchGenre && matchSearch;
        });

        if (!filtered.length) {
            listEl.innerHTML = '<p style="color:var(--text-soft);text-align:center;padding:40px;">Nenhum perfume encontrado.</p>';
            return;
        }

        listEl.innerHTML = filtered.map(function (p) {
            var stock = p.esgotado
                ? '<span class="admin-stock-badge esg">Esgotado</span>'
                : '<span class="admin-stock-badge disp">Disponível</span>';
            var stockQty = p.estoque != null ? '<span class="admin-stock-qty">(' + p.estoque + ' un.)</span>' : '';
            var img = p.imagem
                ? '<img src="' + escapeHtml(p.imagem) + '" alt="">'
                : escapeHtml(p.emoji || '🫙');
            return '<div class="admin-item" data-id="' + p.id + '">' +
                '<div class="admin-item-img">' + img + '</div>' +
                '<div class="admin-item-body">' +
                    '<h3 class="admin-item-title">' + escapeHtml(p.nome) + ' ' + stock + stockQty + '</h3>' +
                    '<div class="admin-item-meta">' + escapeHtml(p.marca) + ' • ' + escapeHtml(p.genero) + ' • ' + escapeHtml(p.categoria || '') + '</div>' +
                    '<div class="admin-item-price">' + formatPrice(p.preco) + '</div>' +
                    '<div class="admin-item-actions">' +
                        '<button class="admin-mini-btn" data-action="edit" data-id="' + p.id + '">✏️ Editar</button>' +
                        '<button class="admin-mini-btn" data-action="duplicate" data-id="' + p.id + '">⧉ Duplicar</button>' +
                        '<button class="admin-mini-btn" data-action="delete" data-id="' + p.id + '">🗑 Excluir</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        }).join('');
    }

    // ---------- Modal edição ----------
    let editId = null;

    function openModal(id) {
        editId = id;
        const isNew = (id === 'new');
        const p = isNew
            ? { id: nextId(), nome: '', marca: '', categoria: 'amadeirado', genero: 'Masculino', preco: 0, descricao: '', inspirado: '', nota: 4.5, avaliacoes: 0, fixacao: 'Alta', badge: '', emoji: '🫙', imagem: '', esgotado: false }
            : data.find(function (x) { return x.id === id; });

        document.getElementById('admin-edit-title').textContent = isNew ? 'Novo Perfume' : 'Editar Perfume';
        document.getElementById('f-nome').value = p.nome || '';
        document.getElementById('f-marca').value = p.marca || '';
        document.getElementById('f-idi').value = p.id || '';
        document.getElementById('f-genero').value = p.genero || 'Masculino';
        document.getElementById('f-categoria').value = p.categoria || 'amadeirado';
        document.getElementById('f-preco').value = p.preco != null ? p.preco : '';
        document.getElementById('f-fixacao').value = p.fixacao || 'Alta';
        document.getElementById('f-estoque').value = p.estoque != null ? p.estoque : 5;
        document.getElementById('f-nota').value = p.nota != null ? p.nota : '';
        document.getElementById('f-avaliacoes').value = p.avaliacoes != null ? p.avaliacoes : '';
        document.getElementById('f-esgotado').value = p.esgotado ? 'esgotado' : 'disponivel';
        document.getElementById('f-badge').value = p.badge || '';
        document.getElementById('f-descricao').value = p.descricao || '';
        document.getElementById('f-inspirado').value = p.inspirado || '';
        document.getElementById('f-emoji').value = p.emoji || '🫙';
        document.getElementById('f-imagem').value = p.imagem || '';

        updateImgPreview();

        document.getElementById('btn-delete').style.display = isNew ? 'none' : 'inline-block';
        document.getElementById('admin-edit-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
        document.getElementById('f-nome').focus();
    }

    function closeModal() {
        document.getElementById('admin-edit-modal').classList.remove('active');
        document.body.style.overflow = '';
    }

    function updateImgPreview() {
        const src = document.getElementById('f-imagem').value;
        const box = document.getElementById('admin-img-preview');
        if (src) {
            box.innerHTML = '<img src="' + escapeHtml(src) + '" alt="preview">';
        } else {
            box.textContent = 'Sem imagem';
        }
    }

    // ---------- Salvar perfume ----------
    function savePerfume(e) {
        e.preventDefault();
        const nome = document.getElementById('f-nome').value.trim();
        if (!nome) { showStatus('Informe o nome do perfume.', 'error'); return; }

        const payload = {
            id: parseInt(document.getElementById('f-idi').value) || nextId(),
            nome: nome,
            marca: document.getElementById('f-marca').value.trim() || 'Sem marca',
            categoria: document.getElementById('f-categoria').value,
            genero: document.getElementById('f-genero').value,
            preco: parseFloat(document.getElementById('f-preco').value) || 0,
            descricao: document.getElementById('f-descricao').value.trim(),
            inspirado: document.getElementById('f-inspirado').value.trim(),
            nota: parseFloat(document.getElementById('f-nota').value) || 0,
            avaliacoes: parseInt(document.getElementById('f-avaliacoes').value) || 0,
            fixacao: document.getElementById('f-fixacao').value,
            estoque: parseInt(document.getElementById('f-estoque').value) || 0,
            badge: document.getElementById('f-badge').value.trim(),
            emoji: document.getElementById('f-emoji').value || '🫙',
            imagem: document.getElementById('f-imagem').value.trim(),
            esgotado: document.getElementById('f-esgotado').value === 'esgotado'
        };

        if (editId === 'new') {
            data.push(payload);
        } else {
            const idx = data.findIndex(function (x) { return x.id === editId; });
            if (idx !== -1) {
                data[idx] = payload;
            }
        }

        persist();
        closeModal();
        renderList();
        showStatus('Perfume "' + nome + '" salvo. Clique em "Salvar Alterações" se ainda não salvou tudo.');
    }

    function deletePerfume(id) {
        const p = data.find(function (x) { return x.id === id; });
        if (!p) return;
        if (!confirm('Excluir o perfume "' + p.nome + '"?')) return;
        data = data.filter(function (x) { return x.id !== id; });
        persist();
        renderList();
        showStatus('Perfume excluído.');
    }

    function duplicatePerfume(id) {
        const p = data.find(function (x) { return x.id === id; });
        if (!p) return;
        const copy = JSON.parse(JSON.stringify(p));
        copy.id = nextId();
        copy.nome = p.nome + ' (cópia)';
        data.push(copy);
        persist();
        renderList();
        showStatus('Perfume duplicado.');
    }

    // ---------- Exportar data.js ----------
    function exportDataJs() {
        const lines = [];
        lines.push('const perfumes = [');
        data.forEach(function (p, i) {
            lines.push('    {');
            lines.push('        id: ' + p.id + ',');
            lines.push('        nome: ' + JSON.stringify(p.nome) + ',');
            lines.push('        marca: ' + JSON.stringify(p.marca || '') + ',');
            lines.push('        categoria: ' + JSON.stringify(p.categoria || '') + ',');
            lines.push('        genero: ' + JSON.stringify(p.genero || '') + ',');
            lines.push('        preco: ' + p.preco + ',');
            lines.push('        descricao: ' + JSON.stringify(p.descricao || '') + ',');
            lines.push('        inspirado: ' + JSON.stringify(p.inspirado || '') + ',');
            lines.push('        nota: ' + (p.nota != null ? p.nota : 0) + ',');
            lines.push('        avaliacoes: ' + (p.avaliacoes != null ? p.avaliacoes : 0) + ',');
            lines.push('        fixacao: ' + JSON.stringify(p.fixacao || '') + ',');
            lines.push('        badge: ' + JSON.stringify(p.badge || '') + ',');
            lines.push('        emoji: ' + JSON.stringify(p.emoji || '') + ',');
            lines.push('        imagem: ' + JSON.stringify(p.imagem || '') + ',');
            lines.push('        esgotado: ' + (p.esgotado ? 'true' : 'false'));
            lines.push(i < data.length - 1 ? '    },' : '    }');
        });
        lines.push('];');

        const content = lines.join('\n');
        const blob = new Blob([content], { type: 'application/javascript;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showStatus('data.js exportado! Substitua o arquivo em js/data.js e publique no site.');
    }

    // ---------- Reset ----------
    function resetData() {
        if (!confirm('Restaurar o catálogo original? Suas alterações no admin serão descartadas.')) return;
        localStorage.removeItem(STORAGE_KEY);
        data = getBasePerfumes();
        renderList();
        showStatus('Catálogo restaurado para o original.');
    }

    // ---------- Eventos ----------
    function bindEvents() {
        document.getElementById('login-form').addEventListener('submit', function (e) {
            e.preventDefault();
            const pass = document.getElementById('admin-senha').value;
            if (pass === ADMIN_PASS) {
                document.getElementById('login-screen').style.display = 'none';
                document.getElementById('admin-panel').style.display = 'block';
                loadData();
                renderList();
            } else {
                document.getElementById('login-error').textContent = 'Senha incorreta.';
            }
        });

        document.getElementById('btn-save').addEventListener('click', function () {
            persist();
            showStatus('💾 Alterações salvas no navegador!');
        });

        document.getElementById('btn-export').addEventListener('click', exportDataJs);
        document.getElementById('btn-reset').addEventListener('click', resetData);

        document.getElementById('btn-logout').addEventListener('click', function () {
            document.getElementById('admin-panel').style.display = 'none';
            document.getElementById('login-screen').style.display = 'flex';
            document.getElementById('admin-senha').value = '';
            document.getElementById('login-error').textContent = '';
        });

        document.getElementById('btn-add').addEventListener('click', function () { openModal('new'); });

        document.getElementById('admin-search').addEventListener('input', renderList);
        document.getElementById('admin-filter-genre').addEventListener('change', renderList);

        document.getElementById('admin-list').addEventListener('click', function (e) {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const id = parseInt(btn.getAttribute('data-id'));
            const action = btn.getAttribute('data-action');
            if (action === 'edit') openModal(id);
            else if (action === 'delete') deletePerfume(id);
            else if (action === 'duplicate') duplicatePerfume(id);
        });

        document.getElementById('f-imagem').addEventListener('input', updateImgPreview);

        document.getElementById('admin-form').addEventListener('submit', savePerfume);
        document.getElementById('admin-edit-close').addEventListener('click', closeModal);
        document.getElementById('btn-delete').addEventListener('click', function () {
            if (editId !== 'new' && editId != null) {
                deletePerfume(editId);
                closeModal();
            }
        });
        document.getElementById('admin-edit-modal').addEventListener('click', function (e) {
            if (e.target === this) closeModal();
        });

        // ===== Abas =====
        document.querySelectorAll('.admin-tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                document.querySelectorAll('.admin-tab').forEach(function (t) { t.classList.remove('active'); });
                document.querySelectorAll('.admin-tab-content').forEach(function (c) { c.classList.remove('active'); });
                tab.classList.add('active');
                var tabId = 'tab-' + tab.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
                if (tab.getAttribute('data-tab') === 'pedidos') renderOrders();
            });
        });

        // ===== Pedidos =====
        document.getElementById('order-filter-status').addEventListener('change', renderOrders);
    }

    // ---------- Pedidos ----------
    function getOrders() {
        try {
            var saved = localStorage.getItem('ea_orders');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    function saveOrders(orders) {
        localStorage.setItem('ea_orders', JSON.stringify(orders));
    }

    function renderOrders() {
        var listEl = document.getElementById('orders-list');
        var statusFilter = document.getElementById('order-filter-status').value;
        var orders = getOrders();

        var filtered = orders.filter(function (o) {
            return statusFilter === 'all' || o.status === statusFilter;
        });

        if (!filtered.length) {
            listEl.innerHTML = '<p style="color:var(--text-soft);text-align:center;padding:40px;">Nenhum pedido encontrado.</p>';
            return;
        }

        listEl.innerHTML = filtered.reverse().map(function (o) {
            var statusClass = 'status-' + o.status.toLowerCase();
            var actions = '';
            if (o.status === 'Solicitado') {
                actions = '<button class="admin-mini-btn btn-confirm" data-action="confirm" data-id="' + o.id + '">✅ Confirmar</button>' +
                          '<button class="admin-mini-btn btn-cancel" data-action="cancel" data-id="' + o.id + '">❌ Cancelar</button>';
            } else if (o.status === 'Confirmado') {
                actions = '<button class="admin-mini-btn" data-action="ship" data-id="' + o.id + '">📦 Enviar</button>';
            } else if (o.status === 'Enviado') {
                actions = '<button class="admin-mini-btn" data-action="deliver" data-id="' + o.id + '">🚚 Entregue</button>';
            }

            return '<div class="admin-item order-item" data-id="' + o.id + '">' +
                '<div class="admin-item-body">' +
                    '<h3 class="admin-item-title">' + escapeHtml(o.perfume) + ' <span class="order-status-badge ' + statusClass + '">' + o.status + '</span></h3>' +
                    '<div class="admin-item-meta">' + escapeHtml(o.marca) + ' • ' + o.quantidade + 'x • ' + formatPrice(o.total) + '</div>' +
                    '<div class="admin-item-meta">' + escapeHtml(o.nome) + ' • ' + escapeHtml(o.telefone) + ' • ' + o.pagamento + '</div>' +
                    '<div class="admin-item-meta">' + o.data + '</div>' +
                    (o.observacoes ? '<div class="admin-item-meta">Obs: ' + escapeHtml(o.observacoes) + '</div>' : '') +
                    '<div class="admin-item-actions">' + actions + '</div>' +
                '</div>' +
            '</div>';
        }).join('');

        // Bind order actions
        listEl.querySelectorAll('[data-action]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var action = btn.getAttribute('data-action');
                var id = parseInt(btn.getAttribute('data-id'));
                updateOrderStatus(id, action);
            });
        });
    }

    function updateOrderStatus(id, action) {
        var orders = getOrders();
        var order = orders.find(function (o) { return o.id === id; });
        if (!order) return;

        var newStatus = '';
        var stockChange = 0;

        switch (action) {
            case 'confirm':
                newStatus = 'Confirmado';
                stockChange = -order.quantidade;
                break;
            case 'cancel':
                newStatus = 'Cancelado';
                break;
            case 'ship':
                newStatus = 'Enviado';
                break;
            case 'deliver':
                newStatus = 'Entregue';
                break;
        }

        if (newStatus) {
            order.status = newStatus;
            saveOrders(orders);

            // Baixa estoque ao confirmar
            if (stockChange !== 0) {
                var perfume = data.find(function (p) { return p.id === order.perfumeId; });
                if (perfume) {
                    perfume.estoque = Math.max(0, (perfume.estoque || 0) + stockChange);
                    persist();
                    renderList();
                }
            }

            renderOrders();
            showStatus('Pedido #' + id + ' atualizado para: ' + newStatus, 'success');
        }
    }

    document.addEventListener('DOMContentLoaded', bindEvents);
})();
