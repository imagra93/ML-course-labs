# Class slides

One HTML file per topic. Open `index.html` in a browser (or via GitHub Pages) to present.

| File | Topic | From ML_classNotes.pptx |
|---|---|---|
| `01_supervised_learning.html` | Supervised learning, train / validation / test, k-fold CV | slides 20–22 |
| `02_linear_regression.html` | Linear regression | slides 23–44 |
| `03_logistic_regression.html` | Logistic regression and classification metrics | slides 45–67 |
| `04_softmax_regression.html` | Softmax regression | slide 64 + notes 04 |
| `05_regularization.html` | Regularization, inputs, assumptions | slides 40–41 + notes 03 |
| `06_decision_trees.html` | Decision trees and CART | slides 68–75, 80 |
| `07_ensembles.html` | Bagging, random forest, boosting, XGBoost | slides 76–85 |
| `08_svm.html` | Support vector machines | slides 86–113 |

## Presenting
→ / Space: next step · ← back · F: full screen · the URL `#12` jumps to slide 12.
Equations need internet (MathJax from a CDN).

## Editing a topic
Each slide is one `<section class="slide">` block. Just edit the text.

- Title: `<h2>…</h2>`. Add class `u` to the section for the underlined title style.
- Math: `$inline$` and `$$display$$` (LaTeX, MathJax). Write `\lt` / `\gt` instead of `<` / `>`.
- Reveal one line at a time: add `class="step"` to any element.
- Key formula box: `<div class="bluebox">$$…$$</div>`. Yellow hint: `<div class="hint"><div class="hd">HINT</div><div class="bd">…</div></div>`.
- Two columns: `<div class="cols">…</div>` (`c64` / `c46` for 60/40 splits).
- Figures: `<svg class="fig" data-fig="NAME"></svg>`. Shared ones live in `assets/figures.js`; each topic has its own `assets/fig-<topic>.js` (one `FIG['NAME']` function per figure).
- Logo and page number are added automatically to every slide.

## Adding a topic
Copy any topic file, keep the `<head>` and the `<script>` lines at the end (point the middle one at your own `assets/fig-<topic>.js`, or remove it), replace the sections, and add a link in `index.html`.
