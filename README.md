# 🕌 Essência Árabe - Perfumes Árabes

Site de apresentação de perfumes árabes com pedido via WhatsApp. **100% estático** (HTML/CSS/JS), pronto para hospedar em qualquer servidor gratuito.

## 🌐 Publicado

- **GitHub Pages:** https://luizaugusto2006.github.io/perfumes/
- **Repositório:** https://github.com/luizaugusto2006/perfumes
- **PythonAnywhere:** *perfume.pythonanywhere.com* (configurar)

## ✅ Já configurado

- Número do WhatsApp para pedidos: **55 21970088404** (em `js/script.js`)
- **30 perfumes reais** mais vendidos (Lattafa, Armaf, Rasasi, Al Haramain, etc.)
- Filtros por **gênero**: **Todos / Masculino / Feminino / Unissex** (10 de cada)
- **Painel Admin** (`admin.html`) com senha para editar preços, estoque, fotos e cadastrar novos perfumes
- Fotos reais dos frascos em **WebP** (pasta `images/`)
- Modal de pedido via WhatsApp (nome, telefone, quantidade, observações)
- Favicon + meta tags SEO + Open Graph (preview bonito ao compartilhar no WhatsApp)
- Botão flutuante de WhatsApp
- Suporte a produto **Esgotado**

## 📦 Estrutura

```
perfumes/
├── index.html      → Página principal
├── admin.html      → Painel administrativo (senha)
├── css/
│   ├── style.css   → Estilos do site
│   └── admin.css   → Estilos do admin
├── js/
│   ├── data.js     → Catálogo de perfumes
│   ├── script.js   → Lógica do site (filtros, modal, WhatsApp)
│   └── admin.js    → Lógica do painel admin
└── images/
    ├── Masculino/  → Fotos (webp) dos perfumes masculinos
    ├── Feminino/   → Fotos (webp) dos femininos
    ├── Unissex/    → Fotos (webp) dos unissex
    ├── favicon.png
    └── og-image.png
```

## 🔐 Painel Admin

Acesse pelo **link discreto "•"** no rodapé do site ou abrindo `admin.html`.

- **Senha padrão:** `admin123` (troque em `js/admin.js` → `const ADMIN_PASS = ...`)
- Edite: nome, marca, gênero, categoria, **preço**, **estoque (Disponível/Esgotado)**, descrição, nota, avaliações, fixação, badge, foto e emoji.
- Adicione / duplique / exclua perfumes.
- **💾 Salvar Alterações** → guarda no navegador (as mudanças aparecem na hora no site).
- **⬇ Exportar data.js** → gera o catálogo atualizado para substituir `js/data.js` e publicar.

> ⚠️ As alterações ficam salvas no navegador onde você fez login. Para valerem para todos os visitantes, use **Exportar data.js**, substitua `js/data.js` no repositório e publique (GitHub Pages / PythonAnywhere).

## 🚀 Publicar alterações (GitHub Pages)

```bash
cd C:\Projetos\site-perfumes-arabes
git add -A
git commit -m "descrição da alteração"
git push origin main
```

O GitHub Pages publica automaticamente a branch `main` na raiz.

## 🚀 PythonAnywhere (perfume.pythonanywhere.com)

Como o site é 100% estático, suba os arquivos via **Files** ou console:

```bash
# no console PythonAnywhere (bash)
git clone https://github.com/luizaugusto2006/perfumes.git /home/SEUUSUARIO/perfumes
```

Depois em **Web → Add a new web app** → *Manual configuration → Static files*:
- URL `/` → pasta onde está o `index.html` (ex: `/home/SEUUSUARIO/perfumes/`)

## ⚙️ Configuração

### Número do WhatsApp (recebimento de pedidos)

Em `js/script.js`:
```js
const WHATSAPP_NUMBER = "5521970088404"; // 55 + DDD + número, só dígitos
```

### Marcar um produto como Esgotado

No admin: Estoque → **Esgotado**. Ou manualmente no `data.js` adicione `esgotado: true`.

## ▶️ Visualizar localmente

```bash
python -m http.server 8000   # Python
# ou
npx serve                   # Node
```

Depois acesse `http://localhost:8000`.
