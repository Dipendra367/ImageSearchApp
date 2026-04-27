
# 🖼️ ImageSearchApp

A clean, fast image search app powered by the [Unsplash API](https://unsplash.com/developers) — with a Node.js proxy server to keep your API key safe.

---

## ✨ Features

- 🔍 Search millions of free high-quality images
- 🎲 Random topic discovery
- 🗂️ Sort by relevance or latest
- ❤️ Favourite images
- 📋 Copy image links to clipboard
- ⬇️ Download images directly
- 🌙 Dark / Light mode toggle
- ⌨️ Keyboard shortcuts
- 📄 Pagination
- 💀 Skeleton loaders while fetching

---

## 🛠️ Tech Stack

- HTML, CSS, JavaScript (vanilla)
- Node.js + Express (proxy server)
- Unsplash API
- dotenv

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Dipendra367/ImageSearchApp.git
cd ImageSearchApp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file in the root

```
UNSPLASH_KEY=your_unsplash_api_key_here
```

> Get your free API key at [unsplash.com/developers](https://unsplash.com/developers)

### 4. Run the server

```bash
npm start
```

### 5. Open in browser

```
http://localhost:3000
```

---

## 📁 Folder Structure

```
ImageSearchApp/
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── .env            ← not pushed to GitHub
├── .gitignore
├── server.js
└── package.json
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search bar |
| `Enter` | Search |
| `R` | Random topic |
| `Esc` | Close modal / panel |

---

## ⚠️ Important

Never commit your `.env` file. Make sure `.gitignore` includes:

```
.env
node_modules
```

---

## 📄 License

MIT — free to use and modify.
