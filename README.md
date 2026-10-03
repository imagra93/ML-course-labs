# ML Course Labs

Material for a master's-level machine learning course: theory notes, class slides and
hands-on lab notebooks. The labs go from implementing algorithms by hand in NumPy up to
multi-task deep learning and transformer text generation.

# Theory notes

Web pages with every derivation, the assumptions of each method, and code that reproduces
every plot: **<https://imagra93.github.io/ML-course-labs/notes/>**

## Machine learning

| # | Note | Contents |
|---|---|---|
| 00 | [Supervised learning, splits and CV](https://imagra93.github.io/ML-course-labs/notes/machine_learning/00_supervised_learning.html) | bias–variance, train/val/test, K-fold and nested CV, metric precision; assumptions: i.i.d., shift, groups, time, leakage |
| 01 | [Linear regression](https://imagra93.github.io/ML-course-labs/notes/machine_learning/01_linear_regression.html) | gradient descent, normal equation, convexity, MLE, OLS statistics; assumptions and diagnostics, collinearity and VIF, influence |
| 02 | [Logistic regression](https://imagra93.github.io/ML-course-labs/notes/machine_learning/02_logistic_regression.html) | cross-entropy = MLE, Newton/IRLS, separation, odds ratios, metrics, ROC/AUC, calibration; assumptions, class imbalance |
| 02b | [Generalised linear models](https://imagra93.github.io/ML-course-labs/notes/machine_learning/02b_generalized_linear_models.html) | the GLM recipe, IRLS, deviance, Poisson claim counts, overdispersion, offsets, Gamma, Tweedie |
| 03 | [Regularisation, inputs, assumptions](https://imagra93.github.io/ML-course-labs/notes/machine_learning/03_regularization_inputs_assumptions.html) | Ridge, Lasso, Elastic Net, MAP, choosing λ; scaling, encodings, missing values, pipelines and leakage |
| 04 | [Softmax regression](https://imagra93.github.io/ML-course-labs/notes/machine_learning/04_softmax_regression.html) | softmax, log-sum-exp, gradient, convexity, multiclass metrics; IIA, imbalance, temperature scaling |
| 05 | [Support vector classifier](https://imagra93.github.io/ML-course-labs/notes/machine_learning/05_support_vector_classifier.html) | margin, duality and KKT, kernels and Mercer, hinge loss; scaling, C and γ, Platt probabilities |
| 06 | [Decision trees and CART](https://imagra93.github.io/ML-course-labs/notes/machine_learning/06_decision_trees_cart.html) | entropy, Gini, CART from scratch, pruning; what trees assume, categorical and missing values |
| 07 | [Bagging, random forests and boosting](https://imagra93.github.io/ML-course-labs/notes/machine_learning/07_bagging_random_forest_boosting.html) | bootstrap and OOB, random forests, AdaBoost, gradient boosting, XGBoost derivation, boosting in practice |

Original class notes (PDF): [ML_classNotes.pptx.pdf](ML_classNotes.pptx.pdf)

## Neural networks

| # | Note | Contents |
|---|---|---|
| 00 | [Neural networks and the MLP](https://imagra93.github.io/ML-course-labs/notes/neural_networks/00_neural_networks_mlp.html) | neuron, XOR, forward pass, activations, losses as MLE, universal approximation; practical checks |
| 01 | [Backpropagation](https://imagra93.github.io/ML-course-labs/notes/neural_networks/01_backpropagation.html) | chain rule on graphs, backprop derivation, gradient checking, autograd, initialisation, vanishing gradients |
| 02 | [Training: optimisation and regularisation](https://imagra93.github.io/ML-course-labs/notes/neural_networks/02_training_optimization_regularization.html) | SGD, momentum, Adam, schedules, weight decay, dropout, BatchNorm; debugging guide |
| 03 | [CNNs, transfer and multi-task learning](https://imagra93.github.io/ML-course-labs/notes/neural_networks/03_cnn_transfer_multitask.html) | convolution and its backward pass, ResNet, transfer and multi-task learning, segmentation, detection |
| 04 | [Embeddings, RNNs and LSTMs](https://imagra93.github.io/ML-course-labs/notes/neural_networks/04_rnn_lstm.html) | embeddings, RNN, BPTT, clipping, LSTM/GRU, masking; sequence-model assumptions |
| 05 | [Attention and transformers](https://imagra93.github.io/ML-course-labs/notes/neural_networks/05_attention_transformers.html) | attention, multi-head, positions, causal mask, KV cache, a tiny GPT, decoding, perplexity |
| 06 | [Embeddings, retrieval and RAG](https://imagra93.github.io/ML-course-labs/notes/neural_networks/06_embeddings_rag.html) | TF-IDF, BM25, LSA, neural embeddings, retrieval metrics, hybrid search, chunking, RAG |

Original class notes (PDF): [ML_notes_NN.pptx.pdf](ML_notes_NN.pptx.pdf)

---

# Class slides

Interactive HTML decks, one per topic: **<https://imagra93.github.io/ML-course-labs/slides/>**
→ / Space advances, ← goes back, F is full screen, N / P jump between topics.

## Machine learning

| # | Deck |
|---|---|
| 00 | [Introduction · Python for ML](https://imagra93.github.io/ML-course-labs/slides/machine_learning/00_introduction.html) |
| 01 | [Supervised learning · train, validation, test](https://imagra93.github.io/ML-course-labs/slides/machine_learning/01_supervised_learning.html) |
| 02 | [Linear regression](https://imagra93.github.io/ML-course-labs/slides/machine_learning/02_linear_regression.html) |
| 03 | [Logistic regression and classification metrics](https://imagra93.github.io/ML-course-labs/slides/machine_learning/03_logistic_regression.html) |
| 04 | [Softmax regression](https://imagra93.github.io/ML-course-labs/slides/machine_learning/04_softmax_regression.html) |
| 05 | [Regularization, inputs, assumptions](https://imagra93.github.io/ML-course-labs/slides/machine_learning/05_regularization.html) |
| 06 | [Decision trees and CART](https://imagra93.github.io/ML-course-labs/slides/machine_learning/06_decision_trees.html) |
| 07 | [Bagging, random forest, boosting, XGBoost](https://imagra93.github.io/ML-course-labs/slides/machine_learning/07_ensembles.html) |
| 08 | [Support vector machines](https://imagra93.github.io/ML-course-labs/slides/machine_learning/08_svm.html) |

## Neural networks

| # | Deck |
|---|---|
| 01 | [From logistic regression to neural networks](https://imagra93.github.io/ML-course-labs/slides/neural_networks/01_neural_networks.html) |
| 02 | [Forward and backward propagation](https://imagra93.github.io/ML-course-labs/slides/neural_networks/02_backpropagation.html) |
| 03 | [Training: optimizers, regularization, layers](https://imagra93.github.io/ML-course-labs/slides/neural_networks/03_training.html) |
| 04 | [CNNs, transfer learning, segmentation, detection](https://imagra93.github.io/ML-course-labs/slides/neural_networks/04_cnn.html) |
| 05 | [RNNs and LSTMs](https://imagra93.github.io/ML-course-labs/slides/neural_networks/05_rnn_lstm.html) |
| 06 | [Attention and transformers](https://imagra93.github.io/ML-course-labs/slides/neural_networks/06_transformers.html) |

---

# Lab notebooks

Every notebook opens in Google Colab from its badge. The last neural-network labs are much
faster on a GPU (**Runtime → Change runtime type → T4 GPU**).

## Part 0 — Prerequisites

Work through this **before the first session**. It covers the subset of Python, NumPy
and pandas the labs assume, and ends with a miniature end-to-end ML workflow.

| # | Lab | Topics | Colab |
|---|-----|--------|-------|
| 0 | [Python for Machine Learning](notebooks/lab 0 - Python for Machine Learning.ipynb) | Python essentials, OOP (`fit`/`predict`), NumPy, pandas, Matplotlib | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/lab 0 - Python for Machine Learning.ipynb) |

## Part 1 — Classical Machine Learning

Scikit-learn / NumPy. Small datasets, runs comfortably on a laptop CPU.

| # | Lab | Topics | Colab |
|---|-----|--------|-------|
| 1 | [Ordinary Least Squares Regression](notebooks/machine_learning/lab%201%20-%20Ordinary%20Least%20Squares%20Regression.ipynb) | Linear model, normal equation, gradient descent from scratch | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/machine_learning/lab%201%20-%20Ordinary%20Least%20Squares%20Regression.ipynb) |
| 2 | [Polynomial Regression and Regularisation](notebooks/machine_learning/lab%202%20-%20Polynomial%20Regression%20and%20Regularisation.ipynb) | Basis expansion, bias–variance trade-off, Ridge/Lasso, pipelines | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/machine_learning/lab%202%20-%20Polynomial%20Regression%20and%20Regularisation.ipynb) |
| 3 | [Logistic Regression](notebooks/machine_learning/lab%203%20-%20Logistic%20Regression.ipynb) | Sigmoid, cross-entropy, gradient descent from scratch, ROC/AUC | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/machine_learning/lab%203%20-%20Logistic%20Regression.ipynb) |
| 4 | [Decision Trees from Scratch](notebooks/machine_learning/lab%204%20-%20Decision%20Trees%20from%20scratch.ipynb) | How a split is chosen, step by step: Gini, entropy, information gain, MSE decrease, threshold/feature search, recursion | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/machine_learning/lab%204%20-%20Decision%20Trees%20from%20scratch.ipynb) |
| 4b | [Decision Trees and Random Forests](notebooks/machine_learning/lab%204b%20-%20Decision%20Trees%20and%20Random%20Forests.ipynb) | Impurity criteria, pruning, bagging, feature importance | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/machine_learning/lab%204b%20-%20Decision%20Trees%20and%20Random%20Forests.ipynb) |
| 5 | [Support Vector Machines](notebooks/machine_learning/lab%205%20-%20Support%20Vector%20Machines.ipynb) | Maximum margin, soft margin, the kernel trick, hyperparameter search | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/machine_learning/lab%205%20-%20Support%20Vector%20Machines.ipynb) |
| 6 | [XGBoost and Gradient Boosting](notebooks/machine_learning/lab%206%20-%20XGBoost%20and%20Gradient%20Boosting.ipynb) | Boosting theory, regularised objective, early stopping, tuning | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/machine_learning/lab%206%20-%20XGBoost%20and%20Gradient%20Boosting.ipynb) |

## Part 2 — Neural Networks

PyTorch. The last few labs are much faster on a GPU —
in Colab, use **Runtime → Change runtime type → T4 GPU**.

| # | Lab | Topics | GPU | Colab |
|---|-----|--------|-----|-------|
| 7 | [MLP from scratch (NumPy)](notebooks/neural_networks/lab 7 - MLP from scratch.ipynb) | Forward pass and backpropagation by hand, XOR / non-linear boundaries | – | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/lab 7 - MLP from scratch.ipynb) |
| 8 | [MLP with PyTorch](notebooks/neural_networks/lab 8 - MLP with PyTorch.ipynb) | Autograd, `nn.Module`, optimisers, training loops | – | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/lab 8 - MLP with PyTorch.ipynb) |
| 9 | [Multiclass classification (MLP)](notebooks/neural_networks/lab 9 - Multiclass classification.ipynb) | Softmax and cross-entropy (with proofs), train/val/test, early stopping, confusion matrix, dropout, why MLPs fail on shifted images | opt. | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/lab 9 - Multiclass classification.ipynb) |
| 10 | [CNNs for image classification](notebooks/neural_networks/lab 10 - CNNs for image classification.ipynb) | Convolution from scratch, output size, parameter count, equivariance, receptive field, feature maps, augmentation, dropout, BatchNorm | opt. | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/lab 10 - CNNs for image classification.ipynb) |
| 11 | [LSTM sentiment analysis](notebooks/neural_networks/lab 11 - LSTM sentiment analysis.ipynb) | TF-IDF baseline, embeddings, RNN and LSTM from scratch, BPTT and vanishing gradients, packing, RNN vs LSTM vs GRU, reading a review word by word | opt. | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/lab 11 - LSTM sentiment analysis.ipynb) |
| 12 | [Fine-tuning a ResNet: pre-trained vs scratch](notebooks/neural_networks/lab 12 - Fine-tuning ResNet pretrained vs scratch.ipynb) | Transfer learning on EuroSAT satellite images: ImageNet features with no CNN training, feature extraction, fine-tuning with discriminative learning rates, accuracy vs number of labels, three ways to break a fine-tune | **yes** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/lab 12 - Fine-tuning ResNet pretrained vs scratch.ipynb) |
| 13 | [Object detection with YOLO](notebooks/neural_networks/lab 13 - Object detection with YOLO.ipynb) | Box formats, IoU, the YOLO11 head, NMS and mAP from scratch, fine-tuning YOLO11n on African Wildlife, ONNX export | opt. | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/lab 13 - Object detection with YOLO.ipynb) |
| demo | [Multi-task face analysis (plain PyTorch)](notebooks/neural_networks/demo - multitask face analysis plain PyTorch.ipynb) | ResNet-50 transfer learning on real photos, shared backbone with a regression head (eye positions) | **yes** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/demo - multitask face analysis plain PyTorch.ipynb) |
| demo | [Multi-task face analysis (Lightning)](notebooks/neural_networks/demo - multitask face analysis Lightning.ipynb) | Three tasks (eyes + gender + age) with Lightning: `LightningModule`, `LightningDataModule`, callbacks, TorchMetrics, loss weighting | **yes** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/demo - multitask face analysis Lightning.ipynb) |
| 14 | [Text generation with Transformers](notebooks/neural_networks/lab 14 - Text generation with Transformers.ipynb) | BPE from scratch, GPT-2 parameter count, perplexity and surprisal, causal attention, greedy/temperature/top-k/top-p from scratch, KV cache, beam search, few-shot prompting | opt. | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/lab 14 - Text generation with Transformers.ipynb) |
| 15 | [RAG: embeddings and similarity search](notebooks/neural_networks/lab 15 - RAG embeddings and similarity search.ipynb) | Full RAG pipeline: TF-IDF, character n-grams, LSA and a neural encoder compared with hit rate@k and MRR, approximate search (IVF), chunking, grounded answers with a small LLM, hallucination and prompt injection | opt. | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/lab 15 - RAG embeddings and similarity search.ipynb) |

## Part 3 — Time Series

The methodology lab. Linear regression again, but with data where the i.i.d. assumption
fails — and where the usual validation habits silently produce worthless models.

| # | Lab | Topics | Colab |
|---|-----|--------|-------|
| 16 | [Linear Regression for Time Series](notebooks/machine_learning/lab%2016%20-%20Linear%20Regression%20for%20Time%20Series.ipynb) | Why random splits leak, chronological & rolling-origin validation (`TimeSeriesSplit`), causal lag/rolling/calendar features, look-ahead bias, MASE vs. R², baselines and residual diagnostics | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/machine_learning/lab%2016%20-%20Linear%20Regression%20for%20Time%20Series.ipynb) |

Best placed at the end of the course: it assumes Labs 1 and 2, and it re-examines the
train/validation discipline students have been applying since Lab 1.
