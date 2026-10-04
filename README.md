# Blockstead

Blockstead is a browser-first voxel survival sandbox built around a compact first-night loop: move through a generated Starter Valley, mine and place blocks, craft tools and Torches, survive Shadow Pressure, and reload into the same edited world.

## Run

```sh
npm install
npm run dev
```

Open the printed Vite URL at `/app.html`.

## Direct File Launch

```sh
npm run build:file
```

Then open `index.html` directly in a browser. The generated root launcher uses relative assets under `file-dist/`.

## Checks

```sh
npm run check
```

The check runs Vitest domain tests, a production build, direct-file bundle generation, and Playwright browser acceptances for every MVP Slice.
