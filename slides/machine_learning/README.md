# Class slides

One HTML file per topic. The shared engine (styles, navigation, logo, shared figures, MathJax config) lives in [`../assets`](../assets). Open `index.html` in a browser (or via GitHub Pages) to present.

| File | Topic | From ML_classNotes.pptx |
|---|---|---|
| `00_introduction.html` | Teacher, course overview, Python / NumPy / pandas / Matplotlib basics (Lab 0) | slides 2–19 + Lab 0 notebook |
| `01_supervised_learning.html` | Supervised learning, train / validation / test, k-fold CV | slides 20–22 |
| `02_linear_regression.html` | Linear regression | slides 23–44 |
| `03_logistic_regression.html` | Logistic regression and classification metrics | slides 45–67 |
| `04_softmax_regression.html` | Softmax regression | slide 64 + notes 04 |
| `05_regularization.html` | Regularization, inputs, assumptions | slides 40–41 + notes 03 |
| `06_decision_trees.html` | Decision trees and CART | slides 68–75, 80 |
| `07_ensembles.html` | Bagging, random forest, boosting, XGBoost | slides 76–85 |
| `08_svm.html` | Support vector machines | slides 86–113 |

## Presenting
→ / Space: next step · ← back · F: full screen · the URL `#12` jumps to slide 12 (`#last` = last slide).
Topics are chained: → on the last slide opens the next topic, ← on the first slide goes back to the previous one
(`data-prev` / `data-next` on `<body>`). N / P jump to the next / previous topic from anywhere.
Equations need internet (MathJax from a CDN).

### Scripted demos (no mouse needed)
Every interactive figure has a `data-auto` script. Pressing → walks through it, one preset per press, with a
yellow caption under the figure; ← walks back. You can still drag the sliders at any time.

```html
<div class="widget" data-fig="overfit" data-auto="d=1 :: Degree 1: underfitting|d=15 :: Overfitting|d=15;l=-2 :: λ tames it">
```
Steps are separated by `|`, assignments by `;`, and `:: text` is the caption. `key=value` sets the slider with
`data-k="key"`, or presses the segment button with `data-key="value"` (e.g. `mode=std`). `key=click` presses a plain
button with `data-k="key"` once (e.g. `go=click`). Steps and `.step` reveals are played in document order.

## Editing a topic
Each slide is one `<section class="slide">` block. Just edit the text.

- Title: `<h2>…</h2>`. Add class `u` to the section for the underlined title style.
- Math: `$inline$` and `$$display$$` (LaTeX, MathJax). Write `\lt` / `\gt` instead of `<` / `>`. A wide equation: give the `.eq` the class `s` (19 px) or `xs` (17 px), or split it into two `$$…$$` lines; never rely on scrolling.
- Macros: `\bx \bX \by \bth \bz \bp \bP \bL \bTh \bv \bzero \norm{}` (see `../assets/mathjax-config.js`).
- Reveal one line at a time: add `class="step"` to any element.
- Key formula box: `<div class="bluebox">$$…$$</div>`. Yellow hint: `<div class="hint"><div class="hd">HINT</div><div class="bd">…</div></div>`.
- Two columns: `<div class="cols">…</div>` (`c64` / `c46` for 60/40 splits).
- Figures: `<svg class="fig" data-fig="NAME"></svg>`. Shared ones live in `../assets/figures.js`; each topic has its own `assets/fig-<topic>.js` (one `FIG['NAME']` function per figure).
- Logo and page number are added automatically to every slide.

## Adding a topic
Copy any topic file, keep the `<head>` and the `<script>` lines at the end (point the middle one at your own `assets/fig-<topic>.js`, or remove it), replace the sections, and add a link in `index.html`.
