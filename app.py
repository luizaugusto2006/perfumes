import os
import json
from flask import Flask, jsonify, request, send_from_directory
from functools import wraps

app = Flask(__name__, static_folder='static')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
DATA_FILE = os.path.join(DATA_DIR, 'perfumes.json')
ORDERS_FILE = os.path.join(DATA_DIR, 'orders.json')
INITIAL_DATA = os.path.join(BASE_DIR, 'perfumes.json')
ADMIN_PASS = '19160731'


def ensure_data_dir():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(DATA_FILE) and os.path.exists(INITIAL_DATA):
        import shutil
        shutil.copy2(INITIAL_DATA, DATA_FILE)


def load_perfumes():
    ensure_data_dir()
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_perfumes(perfumes):
    ensure_data_dir()
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(perfumes, f, ensure_ascii=False, indent=2)


def load_orders():
    ensure_data_dir()
    if not os.path.exists(ORDERS_FILE):
        return []
    with open(ORDERS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_orders(orders):
    ensure_data_dir()
    with open(ORDERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(orders, f, ensure_ascii=False, indent=2)


def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        password = request.headers.get('X-Admin-Pass') or request.args.get('pass')
        if password != ADMIN_PASS:
            return jsonify({'error': 'Acesso negado'}), 401
        return f(*args, **kwargs)
    return decorated


# ===== Rotas estáticas =====

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')


@app.route('/admin.html')
def admin():
    return send_from_directory('static', 'admin.html')


@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)


# ===== API Perfumes =====

@app.route('/api/perfumes', methods=['GET'])
def api_list_perfumes():
    return jsonify(load_perfumes())


@app.route('/api/perfumes', methods=['POST'])
@require_admin
def api_create_perfume():
    perfumes = load_perfumes()
    data = request.get_json(force=True)
    if not data.get('nome'):
        return jsonify({'error': 'Nome obrigatório'}), 400
    next_id = max((p['id'] for p in perfumes), default=0) + 1
    data['id'] = next_id
    perfumes.append(data)
    save_perfumes(perfumes)
    return jsonify(data), 201


@app.route('/api/perfumes/<int:perfume_id>', methods=['PUT'])
@require_admin
def api_update_perfume(perfume_id):
    perfumes = load_perfumes()
    idx = next((i for i, p in enumerate(perfumes) if p['id'] == perfume_id), None)
    if idx is None:
        return jsonify({'error': 'Perfume não encontrado'}), 404
    data = request.get_json(force=True)
    data['id'] = perfume_id
    perfumes[idx] = data
    save_perfumes(perfumes)
    return jsonify(data)


@app.route('/api/perfumes/<int:perfume_id>', methods=['DELETE'])
@require_admin
def api_delete_perfume(perfume_id):
    perfumes = load_perfumes()
    new_perfumes = [p for p in perfumes if p['id'] != perfume_id]
    if len(new_perfumes) == len(perfumes):
        return jsonify({'error': 'Perfume não encontrado'}), 404
    save_perfumes(new_perfumes)
    return jsonify({'ok': True})


# ===== API Pedidos =====

@app.route('/api/orders', methods=['GET'])
def api_list_orders():
    return jsonify(load_orders())


@app.route('/api/orders', methods=['POST'])
def api_create_order():
    orders = load_orders()
    data = request.get_json(force=True)
    required = ['perfume', 'nome', 'telefone', 'quantidade', 'total', 'pagamento']
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({'error': 'Campos obrigatórios: ' + ', '.join(missing)}), 400
    next_id = max((o['id'] for o in orders), default=0) + 1
    data['id'] = next_id
    data['status'] = 'Solicitado'
    orders.append(data)
    save_orders(orders)
    return jsonify(data), 201


@app.route('/api/orders/<int:order_id>', methods=['PUT'])
def api_update_order(order_id):
    orders = load_orders()
    idx = next((i for i, o in enumerate(orders) if o['id'] == order_id), None)
    if idx is None:
        return jsonify({'error': 'Pedido não encontrado'}), 404
    data = request.get_json(force=True)
    data['id'] = order_id
    old_status = orders[idx].get('status', 'Solicitado')
    orders[idx] = data
    save_orders(orders)

    # Baixa estoque ao avançar status (Solicitado → Confirmado/Enviado/Entregue)
    if data.get('status') in ('Confirmado', 'Enviado', 'Entregue'):
        if old_status == 'Solicitado' and data.get('perfumeId') and data.get('quantidade'):
            perfumes = load_perfumes()
            pidx = next((i for i, p in enumerate(perfumes) if p['id'] == data['perfumeId']), None)
            if pidx is not None:
                perfumes[pidx]['estoque'] = max(0, (perfumes[pidx].get('estoque') or 0) - data['quantidade'])
                save_perfumes(perfumes)

    return jsonify(data)


if __name__ == '__main__':
    app.run(debug=True, port=5000)
