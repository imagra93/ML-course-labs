# ML course notes

Self-contained notes for the classical machine learning part of the course. Each notebook contains the
theory with full derivations, plus short code cells that reproduce every plot. The notebooks are saved
with their outputs, so they can be read on GitHub, in VS Code or in Colab without running anything.

| # | Notebook | Contents |
|---|---|---|
| 00 | [Supervised learning, splits and CV](00_supervised_learning.ipynb) | problem setup, notation, empirical risk, bias–variance (proof), train/val/test, k-fold CV, leakage |
| 01 | [Linear regression](01_linear_regression.ipynb) | problem, MSE loss, gradient (derived), batch GD, learning rate (stability proof), normal equation, convexity, MLE equivalence, metrics |
| 02 | [Logistic regression](02_logistic_regression.ipynb) | sigmoid, log-odds, cross-entropy = MLE, gradient, GD, convexity, separability; confusion matrix, precision/recall/F1, thresholds, ROC/AUC, PR curve, calibration |
| 03 | [Regularisation, inputs, assumptions](03_regularization_inputs_assumptions.ipynb) | L2/Ridge, L1/Lasso (soft-thresholding), Elastic Net, MAP view, regularised logistic regression; scaling, one-hot and the dummy trap, collinearity/VIF; assumptions of linear and logistic regression with diagnostic plots |
| 04 | [Softmax regression](04_softmax_regression.ipynb) | softmax, categorical cross-entropy, gradient, convexity, from-scratch implementation, multiclass metrics |
| 05 | [Support vector classifier](05_support_vector_classifier.ipynb) | margin geometry, hard/soft margin, equivalence with the hinge loss, sub-gradient descent from scratch, support vectors, dual and kernels |
| 06 | [Decision trees and CART](06_decision_trees_cart.ipynb) | impurity (Gini, entropy, variance), split search, CART from scratch, regression trees, cost-complexity pruning |
| 07 | [Bagging, random forests, boosting](07_bagging_random_forest_boosting.ipynb) | variance of an average (proof), bootstrap and OOB, bagging, random forests, feature importance; AdaBoost and gradient boosting in brief |

## Notation (all notebooks)

| Symbol | Meaning |
|---|---|
| $m$, $n$ | number of examples, number of features |
| $\mathbf{x}^{(i)}$, $y^{(i)}$ | $i$-th input vector and target |
| $\mathbf{X}$ | design matrix, one row per example, first column of ones |
| $\boldsymbol{\theta}$ | parameters ($\theta_0$ = intercept) |
| $h_{\boldsymbol{\theta}}(\mathbf{x})$ | model prediction |
| $J(\boldsymbol{\theta})$ | loss function being minimised |
| $\alpha$, $\lambda$ | learning rate, regularisation strength |

Requirements: the packages in the repository's `requirements.txt`, which are the same as for the labs.
