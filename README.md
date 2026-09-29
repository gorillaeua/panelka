# PANELKA — skate shop from the blocks

A one-page demo store for skateboards, BMX bikes, own-brand hoodies and sticker packs.
Grey Soviet panel blocks, police tape, graffiti tags and a 3 AM vibe.

**Portfolio project — nothing is actually for sale.** The checkout is simulated: no payments, no data is sent anywhere.

## Features

- 16 products in 4 categories, filter by category
- Size picker, cart with quantities, free-shipping threshold
- Cart saved in `localStorage` (survives page reload)
- Checkout form with native validation, courier / pickup options
- All product images are drawn in code (SVG), no photo files
- OpenStreetMap embed, no API key needed
- Responsive, keyboard-accessible, respects "reduce motion"

## Stack

Plain HTML, CSS and JavaScript. No frameworks, no build step.

```
index.html   — page structure
style.css    — styles
products.js  — product catalog (edit this to add products)
art.js       — SVG product illustrations
app.js       — catalog, filters, cart, checkout
favicon.svg  — site icon
```

## Run locally

Open `index.html` in a browser, or start a tiny server:

```bash
python3 -m http.server 8080
```

Then visit http://localhost:8080.
