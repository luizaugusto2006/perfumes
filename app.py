import os
import json
from flask import Flask, jsonify, request, send_from_directory
from functools import wraps

app = Flask(__name__, static_folder='static')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'perfumes.json')
ADMIN_PASS = '19160731'


def load_perfumes():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_perfumes(perfumes):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(perfumes, f, ensure_ascii=False, indent=2)


def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        password = request.headers.get('X-Admin-Pass') or request.args.get('pass')
        if password != ADMIN_PASS:
            return jsonify({'error': 'Acesso negado'}), 401
        return f(*args, **kwargs)
    return decorated


@app.route('/')
def index():
    return send_from_directory('static', 'index.html')


@app.route('/admin.html')
def admin():
    return send_from_directory('static', 'admin.html')


@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)


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


if __name__ == '__main__':
    app.run(debug=True, port=5000)
