# Tiny Tailors 🧵

Dress up the cutest cartoon critters!
**App design by Sophia Pernal · 2026**

Tiny Tailors is a dress-up web app for kids. You pick a critter, then mix and match clothes, colors, fabric patterns, pets, scenes and magic effects. All the art is drawn in code (SVG), so every outfit fits every critter.

## What's inside

| Drawer | Choices |
| --- | --- |
| Critters | 33 animals (kitty, bunny, panda, axolotl, unicorn, dragon, red panda…) + 15 fur colors |
| Face | 11 eye styles, 10 mouths, 5 cheek styles, 10 moods |
| Hair | 13 styles in 20 colors |
| Tops | 30 (hoodie, princess gown, knight armor, space suit, kimono…) |
| Bottoms | 19 (tutu, overalls, mermaid tail, grass skirt…) |
| Shoes | 16 (bunny slippers, roller skates, light-up kicks…) |
| Hats | 32 (crown, witch hat, strawberry hat, space helmet…) |
| Specs & face fun | 17 |
| Neckwear | 13 |
| Wings & capes | 15 |
| Things to hold | 23 |
| Pet pals | 19 |
| Scenes | 22 (Tailor's shop, outer space, candy land, under the sea…) |
| Magic effects | 14 animated effects |
| Poses | 11 |

Most clothes come in **20 colors** (plus a color mixer), a second **trim color**, and **17 fabric patterns** plus fabrics you design yourself. That adds up to more than **900 quindecillion** different looks.

### Features
- **Surprise me!** builds a random outfit with a matching color story. Lock any drawer to keep it when you shuffle.
- **Poses & moods**: 11 poses (wave, hooray, dab, ballerina…) where sleeves and held items follow the arms, 10 one-tap moods, and a **Dance!** button with music.
- **Two colors per item**: pick a main color and a trim color (collars, cuffs, bows, and the second color in fabric patterns), or mix any color with the color mixer.
- **Fabric studio**: draw an 8×8 tile and it repeats across clothes. Empty squares take the clothing color, so one fabric works in every color.
- **Stitches & unlockables**: earn stitches and spend them on 54 locked goodies: 6 rare critters (capybara, narwhal, alpaca…), gold and cosmic colors, galaxy and glitter fabrics, gowns, wings, hats, pets, scenes, effects and poses.
- **Style challenges with a real judge**: 32 challenges. Every item has theme tags, and each challenge is a set of rules (enough beach items? the right scene? one color head to toe? three patterns?). The judge scores each rule, gives 1 to 5 stars and tells you exactly what to add.
- **Daily challenge**: the same challenge for everyone each day, double stitches and a streak bonus.
- **No spamming for stitches**: a challenge only pays with 3 stars or more (a score of 55+), only once a day for each challenge, and regular challenges pay at most 45 stitches a day.
- **Fashion show**: pick 2 to 5 saved looks and they strut the runway with music, camera flashes and a cheer meter.
- **Group photo**: put 2 to 4 saved critters in one picture.
- **Share codes**: every look turns into a code (and a link like `yoursite.vercel.app/#look=TT1-…`). Friends paste it to wear the exact look, custom fabrics included.
- **Printable paper doll** and **coloring page**: the critter on a stand plus every clothing piece with fold-over tabs, printed to scale.
- **Search & Faves**: search all 400+ items, and star favorites into their own drawer.
- **Settings**: sound, read item names out loud, calm mode (no animations), bigger buttons.
- **Undo / Redo**, name tag with random silly names, photos, closet, drag your pet anywhere.

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
js/extras.js               unlockable items, poses, moods
js/render.js               puts a critter together (poses, colors, fabrics)
js/challenges.js           item theme tags, challenges and the judge
js/progress.js             stitches, unlocks, streaks, faves, settings
js/fabric.js               the fabric studio
js/share.js                share codes
js/sound.js                little synth sounds and music
js/show.js                 fashion show and group photos
js/paperdoll.js            printable paper doll and coloring page
js/app.js                  buttons, drawers, closet, everything you tap
```

### Adding a new item
Every item is one line: an id, a name and a drawing function. For example, to add a new hat open `js/wardrobe-accessories.js` and add to `TT.HATS`:
```js
I('donuthat', 'Donut hat', c => TT.C(200, 70, 34, c.fill) + TT.C(200, 70, 12, '#fff1f5')),
```
The canvas is 400 × 460. The head is centered at (200, 165), so the top of the head is around y = 80.
