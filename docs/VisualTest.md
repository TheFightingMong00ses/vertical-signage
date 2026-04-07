## Visual Testing (HTML & CSS Preview)

Since this is a plain HTML/CSS/JS project — not a browser extension — you do **not** need a special debugger to see your work. You have a few options depending on your setup.

---

### Option 1: Live Server (Recommended for VS Code users)

1. Open the project folder in **VS Code**.
2. Install the **Live Server** extension (by Ritwick Dey) from the Extensions marketplace.
3. Right-click `src/index.html` in the file explorer and select **"Open with Live Server"**.
4. Your browser will open automatically at something like `http://127.0.0.1:5500/src/index.html`.
5. Every time you save a file, the browser **auto-refreshes** — no manual reloading needed.

> This is the closest experience to what you had with the Mozilla debugger. It handles the CORS issue with `fetch()` automatically because it serves files over HTTP rather than the `file://` protocol.

---

### Option 2: Python Local Server (No extensions needed)

If you have Python installed (Raspberry Pi OS includes it by default):

1. Open a terminal and navigate to your project root:
```bash
   cd path/to/your/project
```
2. Start the server:
```bash
   python -m http.server 8080
```
3. Open your browser and go to: http://localhost:8080/src/index.html
> This is especially useful on the Raspberry Pi itself for final testing before connecting to the projector.

---

### Option 3: npx serve (Node.js)

If you have Node.js installed:

```bash
npx serve .
```

Then visit the URL it prints (usually `http://localhost:3000`).

---

### Why not just open the file directly?

You can drag `index.html` straight into a browser, but the `fetch("../config/config.json")` call in `app.js` **will fail silently** due to browser CORS restrictions on the `file://` protocol. Your cards won't load. Use one of the server options above to avoid this.

---

### Note on Jest

**Jest** (suggested for unit testing) runs in the terminal and tests your JavaScript logic only — it has no visual output. Use Jest to verify that functions like `createCard()` and `renderItems()` behave correctly, and use the server options above to verify how the project actually looks. They serve different purposes and work best together.