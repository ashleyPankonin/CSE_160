# Running the project

**Open by clicking:** You can double-click `index.html` to open it. Scripts load from `lib/` and `src/`. Some browsers may block loading textures and the wolf model when using `file://`; if things don’t load, use a local server below.

---

## After cloning from GitHub

From the repo root (e.g. `CSE160`), go into the assignment folder and start the server:

**Option 1 – Node (recommended):**
```bash
cd asgn3
npm install
npm start
```
Then open in your browser: **http://localhost:8000**

**Option 2 – Python (if you have Python):**
```bash
cd asgn3
python -m http.server 8000
```
Then open: **http://localhost:8000**

---

## GitHub Codespaces (run server in the cloud)

If you open this repo in **GitHub Codespaces**:

1. In the terminal, run: `cd asgn3 && npm start`
2. When the server is running, Codespaces will show a prompt to **open the port** (8000). Click it, or use the “Ports” tab to open the forwarded URL.
3. Open the link (e.g. `https://...-8000.app.github.dev`) in your browser to view the project.

---

## GitHub Pages (optional – host the site on GitHub)

To have GitHub serve the app at a public URL (no local server):

1. Put the **contents** of `asgn3` at the **root** of a branch named `gh-pages`, or use **Settings → Pages** and set “Source” to a branch/folder that contains `index.html` and the `lib/`, `src/` folders.
2. Your site will be at `https://<username>.github.io/<repo>/` (or the folder you chose).  
   **Note:** The wolf uses `../minecraft-wolf/...`; for Pages to load it, the `minecraft-wolf` folder must be in the same repo (e.g. copy it into `asgn3` and change the path in code to `minecraft-wolf/...`), or the wolf will use the built‑in fallback.

---

**Layout:** Scripts and assets are under `lib/` and `src/`. Textures (e.g. `sky.jpg`, `dirt.jpeg`, `green.jpg`) go in `src/`. Wolf model: `../minecraft-wolf/source/wolf.obj` and `../minecraft-wolf/textures/wolf.png` (sibling folder to `asgn3`). If a texture is missing, a procedural fallback is used.
