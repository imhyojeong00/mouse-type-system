# Mouse Graft System

A typing site in which every letter A–Z is one assembled mouse: the **body** of one mouse with the **machine** (sensor, board, cable) of another inside it. 39 mice, 1964–2020. Everything on the web is in English; Korean lives in the report.

## Run
Open the folder with VS Code Live Server (or any static server) and open `index.html`. Deploys as-is to GitHub Pages. No build step, no server, nothing is stored anywhere but the visitor's own browser.

## How the screen works
- The letters run sideways in typing order and stay in the line. Each letter reaches back into the one before it, and the two are **multiplied** into each other where they join. Only cables that belong to a real mouse are shown; nothing is drawn between letters. The typing fills the screen: the whole line is scaled to the screen width (one scale for all letters), and once the line gets too long to shrink further the view steps along (no sliding). ← → or a dot on the tape brings an earlier letter back.
- **Original** = every mouse of the letter standing whole, two or three of them grafted into one overlapping body (grey). **X-RAY** = the same letter as the body of one mouse with the machine of another inside it, in colour (brown body, green and blue machine). The machine is always smaller than the body that holds it. Both views sit at the same place in the line. **Sizes are real and relative**: one scale for every letter (`REAL_SIZE` in `data.js`, from the size-comparison sheet), so a small mouse stays small next to a large one; the machine is shrunk only when it would not fit inside its body. No boxes are drawn around anything.
- Every letter needs at least two different mice (see `LETTERS` in `data.js`).
- A tape along the top has one dot per letter with its year. The label under the title (the only information text) says which mice mix in the letter and what changed against the previous letter (wired → wireless, ball → laser, box → ergonomic).

## Controls
| Input | Action |
|---|---|
| A–Z | Type a letter |
| Backspace | Take the last letter back |
| ← → or click a dot on the tape | Look at an earlier letter (its dot lights up, the label follows) |
| Tab / X-RAY button | Toggle original ↔ X-ray |
| Esc | Close the open panel |
| RECEIPT | Every letter typed. PRINT (80 mm layout) or SAVE TXT |
| LINEAGE | Year × form-family map of all 39 mice and 26 letters; typing order as a dashed chain, brown line to the body mouse, green line to each machine |
| GRAPH | Per-letter charts: years spanned inside the letter, distance from the previous letter, mice per letter, and the graft network |

## Sound (synthesised, no files)
A bed that never switches off from the first gesture: room air, mains hum, the low resonance of the desk, and a hand resting on the table that now and then rubs it. More letters, more rubbing.
Each letter plays one short phrase built from the mice inside it:
- **tak** the mouse knocks the table · **ssk** it slides (rough hiss, up or down)
- **tuk tuk tuk** the buttons — a dull thock for old mice, a light tick for new ones
- **deureureuk** scroll wheel with detents; free-spinning wheels (MX series) buzz instead — only if a mouse in the letter has a wheel
- **deureuk** ball or trackball grinding on its rollers — only for ball and trackball mice
- **deu-geuk deu-geuk** double click — for letters of three mice or a many-button body
- a soft cable scrape if the body mouse is wired
When letters are typed quickly the phrase shortens to keep the sound clean. In X-RAY the bed is muffled and a scanner hum comes in.

## Files
`index.html`, `style.css`, `script.js`, `data.js` (`MICE`, `LETTERS`, `LANES`, `WHEEL`, `FREE_WHEEL`, geometry), `images/` (per mouse: `NN_c_body.webp` the body, `NN_c_parts.webp` the machine).

## Changing a letter (`data.js` → `LETTERS`)
`parts` lists mouse numbers: the first gives the body, the others give the machine. Every letter needs at least two different mice.