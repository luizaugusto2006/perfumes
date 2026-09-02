// ===== ADMIN - Essência Árabe (API Backend) =====
(function () {
    'use strict';

    const ADMIN_PASS = '19160731';
    let data = [];

    // ---------- API Helpers ----------
    async function apiRequest(method, path, body) {
        const opts = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Pass': ADMIN_PASS
            }
        };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(path, opts);
        if (!res.ok) {
            const err = await res.json().catch(function () { return { error: 'Erro na API' }; });
            throw new Error(err.error || 'Erro na API');
        }
        return res.json();
    }

    async function loadPerfumes() {
        data = await apiRequest('GET', '/api/perfumes');
    }

    async function savePerfume(payload) {
        if (payload._isNew) {
            delete payload._isNew;
            const created = await apiRequest('POST', '/api/perfumes', payload);
            data.push(created);
        } else {
            const updated = await apiRequest('PUT', '/api/perfumes/' + payload.id, payload);
            const idx = data.findIndex(function (x) { return x.id === payload.id; });
            if (idx !== -1) data[idx] = updated;
        }
    }

    async function deletePerfumeApi(id) {
        await apiRequest('DELETE', '/api/perfumes/' + id);
        data = data.filter(function (x) { return x.id !== id; });
    }

    // ---------- Helpers ----------
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
            ? { id: nextId(), nome: '', marca: '', categoria: 'amadeirado', genero: 'Masculino', preco: 0, descricao: '', inspirado: '', nota: 4.5, avaliacoes: 0, fixacao: 'Alta', estoque: 5, badge: '', emoji: '🫙', imagem: '', esgotado: false }
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
    async function handleSavePerfume(e) {
        e.preventDefault();
        const nome = document.getElementById('f-nome').value.trim();
        if (!nome) { showStatus('Informe o nome do perfume.', 'error'); return; }

        const isNew = (editId === 'new');
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

        if (isNew) payload._isNew = true;

        try {
            await savePerfume(payload);
            closeModal();
            renderList();
            showStatus('Perfume "' + nome + '" salvo com sucesso!');
        } catch (err) {
            showStatus('Erro ao salvar: ' + err.message, 'error');
        }
    }

    async function handleDeletePerfume(id) {
        const p = data.find(function (x) { return x.id === id; });
        if (!p) return;
        if (!confirm('Excluir o perfume "' + p.nome + '"?')) return;
        try {
            await deletePerfumeApi(id);
            renderList();
            showStatus('Perfume excluído.');
        } catch (err) {
            showStatus('Erro ao excluir: ' + err.message, 'error');
        }
    }

    async function handleDuplicatePerfume(id) {
        const p = data.find(function (x) { return x.id === id; });
        if (!p) return;
        const copy = JSON.parse(JSON.stringify(p));
        copy.id = nextId();
        copy.nome = p.nome + ' (cópia)';
        copy._isNew = true;
        try {
            await savePerfume(copy);
            renderList();
            showStatus('Perfume duplicado.');
        } catch (err) {
            showStatus('Erro ao duplicar: ' + err.message, 'error');
        }
    }

    // ---------- Pedidos (API) ----------
    let ordersData = [];

    async function loadOrders() {
        try {
            ordersData = await apiRequest('GET', '/api/orders');
        } catch (e) {
            ordersData = [];
        }
    }

    async function renderOrders() {
        await loadOrders();
        var listEl = document.getElementById('orders-list');
        var statusFilter = document.getElementById('order-filter-status').value;

        var filtered = ordersData.filter(function (o) {
            return statusFilter === 'all' || o.status === statusFilter;
        });

        if (!filtered.length) {
            listEl.innerHTML = '<p style="color:var(--text-soft);text-align:center;padding:40px;">Nenhum pedido encontrado.</p>';
            return;
        }

        listEl.innerHTML = filtered.slice().reverse().map(function (o) {
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

        listEl.querySelectorAll('[data-action]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var action = btn.getAttribute('data-action');
                var id = parseInt(btn.getAttribute('data-id'));
                updateOrderStatus(id, action);
            });
        });
    }

    async function updateOrderStatus(id, action) {
        var order = ordersData.find(function (o) { return o.id === id; });
        if (!order) return;

        var newStatus = '';
        switch (action) {
            case 'confirm': newStatus = 'Confirmado'; break;
            case 'cancel': newStatus = 'Cancelado'; break;
            case 'ship': newStatus = 'Enviado'; break;
            case 'deliver': newStatus = 'Entregue'; break;
        }

        if (newStatus) {
            order.status = newStatus;
            try {
                await apiRequest('PUT', '/api/orders/' + id, order);
            } catch (e) {
                showStatus('Erro ao atualizar pedido: ' + e.message, 'error');
                return;
            }
            await renderOrders();
            showStatus('Pedido #' + id + ' atualizado para: ' + newStatus, 'success');
        }
    }

    // ---------- Eventos ----------
    async function bindEvents() {
        document.getElementById('login-form').addEventListener('submit', async function (e) {
            e.preventDefault();
            const pass = document.getElementById('admin-senha').value;
            if (pass === ADMIN_PASS) {
                try {
                    await loadPerfumes();
                    document.getElementById('login-screen').style.display = 'none';
                    document.getElementById('admin-panel').style.display = 'block';
                    renderList();
                } catch (err) {
                    document.getElementById('login-error').textContent = 'Erro ao conectar com o servidor.';
                }
            } else {
                document.getElementById('login-error').textContent = 'Senha incorreta.';
            }
        });

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
            else if (action === 'delete') handleDeletePerfume(id);
            else if (action === 'duplicate') handleDuplicatePerfume(id);
        });

        document.getElementById('f-imagem').addEventListener('input', updateImgPreview);

        document.getElementById('admin-form').addEventListener('submit', handleSavePerfume);
        document.getElementById('admin-edit-close').addEventListener('click', closeModal);
        document.getElementById('btn-delete').addEventListener('click', function () {
            if (editId !== 'new' && editId != null) {
                handleDeletePerfume(editId);
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

    document.addEventListener('DOMContentLoaded', bindEvents);
})();
