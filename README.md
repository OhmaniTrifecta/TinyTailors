# Tiny Tailors 🧵

Dress up the cutest cartoon critters!
**App design by Sophia Pernal · 2026**

Tiny Tailors is a dress-up web app for kids. You pick a critter, then mix and match clothes, colors, fabric patterns, pets, scenes and magic effects. All the art is drawn in code (SVG), so every outfit fits every critter.

## What's inside

| Drawer | Choices |
| --- | --- |
| Critters | 27 animals (kitty, bunny, panda, axolotl, unicorn, dragon, red panda…) + 13 fur colors |
| Face | 10 eye styles, 8 mouths, 5 cheek styles |
| Hair | 13 styles in 16 colors |
| Tops | 26 (hoodie, princess gown, knight armor, space suit, kimono…) |
| Bottoms | 17 (tutu, overalls, mermaid tail, grass skirt…) |
| Shoes | 14 (bunny slippers, roller skates, light-up kicks…) |
| Hats | 27 (crown, witch hat, strawberry hat, space helmet…) |
| Specs & face fun | 15 |
| Neckwear | 11 |
| Wings & capes | 12 |
| Things to hold | 20 |
| Pet pals | 15 |
| Scenes | 19 (Tailor's shop, outer space, candy land, under the sea…) |
| Magic effects | 11 animated effects |

Most clothes come in **16 colors** and **12 fabric patterns** (stripes, polka dots, hearts, stars, gingham, flowers, zigzag, plaid, rainbow, cow spots, checkers). That adds up to about **4 undecillion** different looks.

### Features
- **Surprise me!** builds a random outfit with a matching color story. Lock any drawer to keep it when you shuffle.
- **Undo / Redo** (also Ctrl/⌘ + Z).
- **Name your critter** with your own name or a silly random one.
- **Snap photo** makes a picture card you can download.
- **Save look** hangs the outfit in your closet (saved on this device).
- **Style challenge** gives you a theme like "Spooky… but make it cute".
- Little sounds, blinking eyes, wagging tails, bouncing pets.
- Works on phones, tablets and computers. Sound can be turned off.

## Put it on GitHub and Vercel

No build step and no installs. It's plain HTML, CSS and JavaScript.

### 1. GitHub
1. Go to [github.com/new](https://github.com/new) and create a repository called `tiny-tailors`.
2. Click **uploading an existing file**, drag in **everything inside this folder** (`index.html`, `style.css`, the `js` folder, and the rest), then click **Commit changes**.

   Or from a terminal:
   ```bash
   cd tiny-tailors
   git init
   git add .
   git commit -m "Tiny Tailors"
   git branch -M main
   git remote add origin https://github.com/YOUR-NAME/tiny-tailors.git
   git push -u origin main
   ```

### 2. Vercel
1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Import the `tiny-tailors` repository.
3. Leave **Framework Preset** as **Other**. Leave the build command and output directory empty.
4. Click **Deploy**. You get a link like `tiny-tailors.vercel.app`.

Every time you push a change to GitHub, Vercel updates the site on its own.

## Try it on your computer
Just double-click `index.html`. Or run a tiny server:
```bash
npx serve .
```

## Files
```
index.html                 the page (title screen + studio)
style.css                  all the styling
js/core.js                 drawing helpers, colors, fabric patterns
js/animals.js              the critters, faces and tails
js/wardrobe-clothes.js     tops, bottoms, shoes
js/wardrobe-accessories.js hats, hair, specs, neckwear, wings, things to hold
js/world.js                pet pals, scenes, magic effects
js/render.js               puts a critter together
js/sound.js                little synth sounds
js/app.js                  buttons, drawers, closet, photos, challenges
```

### Adding a new item
Every item is one line: an id, a name and a drawing function. For example, to add a new hat open `js/wardrobe-accessories.js` and add to `TT.HATS`:
```js
I('donuthat', 'Donut hat', c => TT.C(200, 70, 34, c.fill) + TT.C(200, 70, 12, '#fff1f5')),
```
The canvas is 400 × 460. The head is centered at (200, 165), so the top of the head is around y = 80.
