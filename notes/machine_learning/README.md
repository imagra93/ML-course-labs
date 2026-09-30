# ML course notes: machine learning

Self-contained theory notes for the classical machine learning part of the course. Each note has the theory with every
derivation, the assumptions of the method with how to check them and what to do when they fail, and code that
reproduces every plot and number. The interactive figures are the same ones used in the
[slides](../../slides/machine_learning/index.html).

**Read them online:** <https://imagra93.github.io/ML-course-labs/notes/> (or open any `.html` file of this folder in a
browser). Each note is a [Quarto](https://quarto.org) file (`.qmd`: Markdown with Python cells), rendered to the `.html`
page next to it.

| # | Note | Source | Contents |
|---|---|---|---|
| 00 | [Supervised learning, splits and CV](https://imagra93.github.io/ML-course-labs/notes/machine_learning/00_supervised_learning.html) | [.qmd](00_supervised_learning.qmd) | problem setup and notation, empirical risk, bias–variance (proof), train/validation/test, K-fold and nested CV, how precise a test metric is, learning curves; assumptions: i.i.d. data, no distribution shift, grouped and time-ordered data, leakage |
| 01 | [Linear regression](https://imagra93.github.io/ML-course-labs/notes/machine_learning/01_linear_regression.html) | [.qmd](01_linear_regression.qmd) | loss, gradient descent, normal equation, convexity, Newton, MLE, features, metrics; OLS statistics (standard errors, intervals, Gauss–Markov); assumptions: linearity, independence, homoscedasticity, normality, collinearity and VIF, exogeneity, leverage and influence |
| 02 | [Logistic regression](https://imagra93.github.io/ML-course-labs/notes/machine_learning/02_logistic_regression.html) | [.qmd](02_logistic_regression.qmd) | sigmoid and odds, cross-entropy = MLE, convexity, Newton/IRLS, separation, odds ratios with CIs, metrics, ROC/AUC, thresholds from costs, calibration; assumptions; class imbalance |
| 02b | [Generalised linear models](https://imagra93.github.io/ML-course-labs/notes/machine_learning/02b_generalized_linear_models.html) | [.qmd](02b_generalized_linear_models.qmd) | the GLM recipe, exponential family, IRLS, deviance; Poisson for claim counts, overdispersion, exposure and offsets, Gamma severity, Tweedie pure premium; assumptions |
| 03 | [Regularisation, inputs, assumptions](https://imagra93.github.io/ML-course-labs/notes/machine_learning/03_regularization_inputs_assumptions.html) | [.qmd](03_regularization_inputs_assumptions.qmd) | Ridge (SVD view), Lasso (coordinate descent), Elastic Net, MAP view, choosing λ; scaling, encodings, missing values, skew, outliers, interactions, pipelines and leakage |
| 04 | [Softmax regression](https://imagra93.github.io/ML-course-labs/notes/machine_learning/04_softmax_regression.html) | [.qmd](04_softmax_regression.qmd) | softmax, identifiability, log-sum-exp, gradient, convexity, multiclass metrics; assumptions (IIA), imbalance, temperature scaling |
| 05 | [Support vector classifier](https://imagra93.github.io/ML-course-labs/notes/machine_learning/05_support_vector_classifier.html) | [.qmd](05_support_vector_classifier.qmd) | margin, duality and KKT, the dual, soft margin, kernels and Mercer, hinge loss, sub-gradient descent; scaling, C and γ, imbalance, Platt probabilities |
| 06 | [Decision trees and CART](https://imagra93.github.io/ML-course-labs/notes/machine_learning/06_decision_trees_cart.html) | [.qmd](06_decision_trees_cart.qmd) | entropy and Gini, CART from scratch, regression trees, pruning, instability; what trees assume, categorical and missing values, feature-importance bias |
| 07 | [Bagging, random forests and boosting](https://imagra93.github.io/ML-course-labs/notes/machine_learning/07_bagging_random_forest_boosting.html) | [.qmd](07_bagging_random_forest_boosting.qmd) | variance of an average, bootstrap and OOB, random forests, AdaBoost, gradient boosting, XGBoost's second-order derivation, boosting in practice |

Original class notes (PDF): [ML_classNotes.pptx.pdf](ML_classNotes.pptx.pdf)

## Notation (all notes)

| Symbol | Meaning |
|---|---|
| $m$, $n$ | number of examples, number of features |
| $\mathbf{x}^{(i)}$, $y^{(i)}$ | $i$-th input vector and target |
| $\mathbf{X}$ | design matrix, one row per example, first column of ones |
| $\boldsymbol{\theta}$ | parameters ($\theta_0$ = intercept) |
| $h_{\boldsymbol{\theta}}(\mathbf{x})$ | model prediction |
| $J(\boldsymbol{\theta})$ | loss function being minimised |
| $\alpha$, $\lambda$ | learning rate, regularisation strength |

## Editing a note

1. Edit the `.qmd`. In VS Code with the Quarto extension its Python cells run like a notebook's.
2. From the repository root, `quarto render notes/machine_learning/<note>.qmd` (or `quarto render` for every note).
   Code only re-runs for notes that changed (the cache is `_freeze/`, not committed).
3. Commit the `.qmd`, the `.html` and the `<note>_files/` folder next to it: GitHub Pages serves them as they are.

Requirements: [Quarto](https://quarto.org/docs/get-started/) and the packages in the repository's `requirements.txt`.
The data are synthetic or bundled with scikit-learn, so nothing is downloaded.

**Slide figures in a note.** Copy the widget `<div>` from the deck into a ```` ```{=html} ```` block and add the deck's
topic file (`slides/machine_learning/assets/fig-<topic>.js`) to the note's `include-after-body` in its header; the shared
scripts and styles come from [`_metadata.yml`](_metadata.yml). Inside such raw HTML write math as `\(…\)` / `\[…\]`
and expand the slide macros (`\bx` → `\mathbf{x}`, …). A `data-auto` script becomes ◀ ▶ step buttons. A table inside a
widget needs `data-quarto-disable-processing="true"`, otherwise Quarto drops its `data-r` read-outs.
