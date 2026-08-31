# 🕌 Essência Árabe - Perfumes Árabes

Site de apresentação de perfumes árabes com pedido via WhatsApp. **100% estático** (HTML/CSS/JS), pronto para hospedar em qualquer servidor gratuito.

## ✅ Já configurado

- Número do WhatsApp para pedidos: **55 21970088404** (em `js/script.js`)
- **24 perfumes reais** mais vendidos para revenda em 2026 (Lattafa, Armaf, Rasasi, Al Haramain, etc.)
- Filtros por **gênero**: **Todos / Masculino / Feminino / Unissex**. Produtos Unissex também aparecem em Masculino e Feminino.
- Modal de pedido via WhatsApp (nome, telefone, quantidade, observações)
- Favicon + meta tags SEO + Open Graph (preview bonito ao compartilhar no WhatsApp)
- Botão flutuante de WhatsApp
- Suporte a produto **Esgotado**

## 📦 Estrutura

```
site-perfumes-arabes/
├── index.html      → Página principal
├── css/
│   └── style.css   → Estilos
├── js/
│   ├── data.js     → Catálogo de perfumes
│   └── script.js   → Lógica (filtros, modal, WhatsApp)
└── images/         → Fotos dos produtos + favicon.png + og-image.png
```

## 🚀 Hospedagem

### Opção A - GitHub Pages (recomendado para o site público)
1. Crie um repositório no GitHub (ex: `essencia-arabe`)
2. Envie os arquivos (index.html, css/, js/, images/) para a raiz do repositório
3. No repositório: **Settings → Pages → Branch: `main` → `/ (root)` → Save**
4. Seu site ficará em `https://SEUUSUARIO.github.io/ESSENCIA-ARABE/`

> Atualize a URL em `index.html` (meta `og:url`) e no botão flutuante se necessário.

### Opção B - PythonAnywhere
1. Entre em [pythonanywhere.com](https://www.pythonanywhere.com) (plano gratuito)
2. **Files → Download a file** ou use o console para subir os arquivos
3. Em **Web → Add a new web app** → escolha "Manual configuration → Static files"
4. Aponte a URL `/` para a pasta onde está o `index.html`

> Como o site é 100% estático, ele roda sem precisar de aplicação Python/Flask. O PythonAnywhere também permitirá, no futuro, um painel dinâmico de pedidos em `perfume.pythonanywhere.com`.

> 🏗️ **Divisão de papéis sugerida:** use o **GitHub Pages** para o site de apresentação (rápido e bonito) e **PythonAnywhere** quando quiser um sistema com banco de dados / painel de pedidos.

## ⚙️ Configuração

### Número do WhatsApp (recebimento de pedidos)

Em `js/script.js`, no topo:

```js
const WHATSAPP_NUMBER = "5521970088404"; // já configurado
```

Formato: `55` + DDD + número, **somente dígitos**.

### Marcar um produto como Esgotado

No `js/data.js`, adicione `esgotado: true` ao perfume:

```js
{
    nome: "Liquid Brun",
    ...
    esgotado: true   // ← mostra "Esgotado" e esconde o botão de pedir
}
```

## ✏️ Adicionar/editar perfumes

Edite `js/data.js`. Campos:

| Campo        | Descrição                            |
|--------------|--------------------------------------|
| id           | Identificador único                  |
| nome         | Nome do perfume                      |
| marca        | Marca/fabricante                     |
| categoria    | `oud`, `floral`, `amadeirado`, `citrico` |
| genero       | `Masculino`, `Feminino` ou `Unissex` |
| preco        | Preço em R$ (decimal)                |
| descricao    | Breve descrição                      |
| badge        | Selo (ex: "Top Vendas") ou `""`      |
| emoji        | Ícone (usado se não houver foto)     |
| imagem       | (Opcional) caminho da foto, ex: `"images/asad.jpg"` |
| fixacao      | Nível de fixação                     |
| esgotado     | (Opcional) `true` para mostrar Esgotado |

### Fotos reais dos produtos

Fotografe seus frascos e salve em `images/`, depois referencie:

```js
{ ..., imagem: "images/asad.jpg", emoji: "🦁" }
```

O card exibe a foto automaticamente. Sem o campo `imagem`, usa o emoji.

## ▶️ Visualizar localmente

```bash
python -m http.server 8000   # Python
# ou
npx serve                   # Node
```

Depois acesse `http://localhost:8000`.

