# ML Course Labs

Material for a master's-level machine learning course: hands-on lab notebooks, theory
notes and class slides. The labs go from implementing algorithms by hand in NumPy up to
multi-task deep learning and transformer text generation, and each one is self-contained:
theory, code, and exercises in the same notebook.

Every notebook can be opened directly in Google Colab — click a badge below, no
local install required.

## Repository layout

Everything is split the same way: a **machine learning** part (classical ML) and a
**neural networks** part (deep learning).

```
notebooks/
  python_course_0.ipynb     Part 0: Python prerequisites
  machine_learning/         Labs 1–6 and 16 (scikit-learn / NumPy)
  neural_networks/          Labs 7–15 (PyTorch)
notes/
  machine_learning/         Theory notebooks 00–07 + class notes PDF
  neural_networks/          Theory notebooks 00–06 + class notes PDF
slides/
  index.html                Landing page for both slide sets
  assets/                   Shared slide engine (styles, navigation, figures, MathJax)
  machine_learning/         Decks 01–08
  neural_networks/          Decks 01–06
```

| | Machine learning | Neural networks |
|---|---|---|
| **Labs** (notebooks) | [notebooks/machine_learning](notebooks/machine_learning) | [notebooks/neural_networks](notebooks/neural_networks) |
| **Notes** (theory) | [notes/machine_learning](notes/machine_learning) | [notes/neural_networks](notes/neural_networks) |
| **Slides** (HTML) | [slides/machine_learning](slides/machine_learning) | [slides/neural_networks](slides/neural_networks) |

---

# Lab notebooks

## Part 0 — Prerequisites ([notebooks](notebooks))

Work through this **before the first session**. It covers the subset of Python, NumPy
and pandas the labs assume, and ends with a miniature end-to-end ML workflow.

| # | Lab | Topics | Colab |
|---|-----|--------|-------|
| 0 | [Python for Machine Learning](notebooks/python_course_0.ipynb) | Python essentials, OOP (`fit`/`predict`), NumPy, pandas, Matplotlib | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/python_course_0.ipynb) |

## Part 1 — Classical Machine Learning ([notebooks/machine_learning](notebooks/machine_learning))

Scikit-learn / NumPy. Small datasets, runs comfortably on a laptop CPU.

| # | Lab | Topics | Colab |
|---|-----|--------|-------|
| 1 | [Ordinary Least Squares Regression](notebooks/machine_learning/lab%20-%20Ordinary%20Least%20Squares%20Regression.ipynb) | Linear model, normal equation, gradient descent from scratch | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/machine_learning/lab%20-%20Ordinary%20Least%20Squares%20Regression.ipynb) |
| 2 | [Polynomial Regression and Regularisation](notebooks/machine_learning/lab%20-%20Polynomial%20Regression%20and%20Regularisation.ipynb) | Basis expansion, bias–variance trade-off, Ridge/Lasso, pipelines | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/machine_learning/lab%20-%20Polynomial%20Regression%20and%20Regularisation.ipynb) |
| 3 | [Logistic Regression](notebooks/machine_learning/lab%20-%20Logistic%20Regression.ipynb) | Sigmoid, cross-entropy, gradient descent from scratch, ROC/AUC | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/machine_learning/lab%20-%20Logistic%20Regression.ipynb) |
| 4 | [Decision Trees and Random Forests](notebooks/machine_learning/lab%20-%20Decision%20Trees%20and%20Random%20Forests.ipynb) | Impurity criteria, pruning, bagging, feature importance | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/machine_learning/lab%20-%20Decision%20Trees%20and%20Random%20Forests.ipynb) |
| 4b | [Decision Trees from Scratch](notebooks/machine_learning/lab%20-%20Decision%20Trees%20from%20scratch.ipynb) | CART from scratch in NumPy: impurity, greedy split search, recursive growth, feature importance | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/machine_learning/lab%20-%20Decision%20Trees%20from%20scratch.ipynb) |
| 5 | [Support Vector Machines](notebooks/machine_learning/lab%20-%20Support%20Vector%20Machines.ipynb) | Maximum margin, soft margin, the kernel trick, hyperparameter search | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/machine_learning/lab%20-%20Support%20Vector%20Machines.ipynb) |
| 6 | [XGBoost and Gradient Boosting](notebooks/machine_learning/lab%20-%20XGBoost%20and%20Gradient%20Boosting.ipynb) | Boosting theory, regularised objective, early stopping, tuning | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/machine_learning/lab%20-%20XGBoost%20and%20Gradient%20Boosting.ipynb) |

## Part 2 — Neural Networks ([notebooks/neural_networks](notebooks/neural_networks))

PyTorch. The last few labs are much faster on a GPU —
in Colab, use **Runtime → Change runtime type → T4 GPU**.

| # | Lab | Topics | GPU | Colab |
|---|-----|--------|-----|-------|
| 7 | [MLP from scratch (NumPy)](notebooks/neural_networks/MLP_Numpy.ipynb) | Forward pass and backpropagation by hand, XOR / non-linear boundaries | – | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/MLP_Numpy.ipynb) |
| 8 | [MLP with PyTorch](notebooks/neural_networks/MLP_pytorch.ipynb) | Autograd, `nn.Module`, optimisers, training loops | – | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/MLP_pytorch.ipynb) |
| 9 | [Multiclass classification (MLP)](notebooks/neural_networks/Demo_Multiclass.ipynb) | Softmax and cross-entropy (with proofs), train/val/test, early stopping, confusion matrix, dropout, why MLPs fail on shifted images | opt. | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/Demo_Multiclass.ipynb) |
| 10 | [CNNs for image classification](notebooks/neural_networks/Demo_CNN_Multiclass.ipynb) | Convolution from scratch, output size, parameter count, equivariance, receptive field, feature maps, augmentation, dropout, BatchNorm | opt. | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/Demo_CNN_Multiclass.ipynb) |
| 10b | [Object detection with YOLO](notebooks/neural_networks/object_detection_yolo.ipynb) | Box formats, IoU, the YOLO11 head, NMS and mAP from scratch, fine-tuning YOLO11n on African Wildlife, ONNX export, a Gradio app | opt. | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/object_detection_yolo.ipynb) |
| 11 | [LSTM sentiment analysis](notebooks/neural_networks/LSTM_sentiment.ipynb) | TF-IDF baseline, embeddings, RNN and LSTM from scratch, BPTT and vanishing gradients, packing, RNN vs LSTM vs GRU, reading a review word by word | opt. | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/LSTM_sentiment.ipynb) |
| 12 | [Multi-task face analysis (plain PyTorch)](notebooks/neural_networks/multitask_face_plain_pytorch.ipynb) | Shared backbone, multiple heads, combined losses, transfer learning | **yes** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/multitask_face_plain_pytorch.ipynb) |
| 13 | [Multi-task face analysis (Lightning)](notebooks/neural_networks/multitask_face_lightning.ipynb) | Three tasks (eyes + gender + age) with Lightning: `LightningModule`, `LightningDataModule`, callbacks, TorchMetrics, loss weighting | **yes** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/multitask_face_lightning.ipynb) |
| 14 | [Text generation with Transformers](notebooks/neural_networks/Text_Generation_with_Transformers.ipynb) | BPE from scratch, GPT-2 parameter count, perplexity and surprisal, causal attention, greedy/temperature/top-k/top-p from scratch, KV cache, beam search, few-shot prompting | opt. | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/Text_Generation_with_Transformers.ipynb) |
| 15 | [RAG: embeddings and similarity search](notebooks/neural_networks/rag_embeddings_demo.ipynb) | Full RAG pipeline: TF-IDF, character n-grams, LSA and a neural encoder compared with hit rate@k and MRR, approximate search (IVF), chunking, grounded answers with a small LLM, hallucination and prompt injection | opt. | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/rag_embeddings_demo.ipynb) |

## Part 3 — Time Series ([notebooks/machine_learning](notebooks/machine_learning))

The methodology lab. Linear regression again, but with data where the i.i.d. assumption
fails — and where the usual validation habits silently produce worthless models.

| # | Lab | Topics | Colab |
|---|-----|--------|-------|
| 16 | [Linear Regression for Time Series](notebooks/machine_learning/lab%20-%20Linear%20Regression%20for%20Time%20Series.ipynb) | Why random splits leak, chronological & rolling-origin validation (`TimeSeriesSplit`), causal lag/rolling/calendar features, look-ahead bias, MASE vs. R², baselines and residual diagnostics | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/machine_learning/lab%20-%20Linear%20Regression%20for%20Time%20Series.ipynb) |

Best placed at the end of the course: it assumes Labs 1 and 2, and it re-examines the
train/validation discipline students have been applying since Lab 1.

---

# Theory notes

Self-contained theory notebooks with full derivations and code cells that reproduce every
plot. They are saved with outputs, so they read fine on GitHub without running anything.
Each folder's README has the notation table and the full contents list.

## Machine learning — [notes/machine_learning](notes/machine_learning)

| # | Notes | Contents | Colab |
|---|---|---|---|
| 00 | [Supervised learning, splits and CV](notes/machine_learning/00_supervised_learning.ipynb) | notation, empirical risk, bias–variance, train/val/test, k-fold CV, leakage | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notes/machine_learning/00_supervised_learning.ipynb) |
| 01 | [Linear regression](notes/machine_learning/01_linear_regression.ipynb) | MSE, gradient descent, normal equation, convexity, MLE, metrics | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notes/machine_learning/01_linear_regression.ipynb) |
| 02 | [Logistic regression](notes/machine_learning/02_logistic_regression.ipynb) | sigmoid, cross-entropy = MLE, confusion matrix, thresholds, ROC/AUC, calibration | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notes/machine_learning/02_logistic_regression.ipynb) |
| 02b | [Generalised linear models](notes/machine_learning/02b_generalized_linear_models.ipynb) | distribution + linear score + link, one GD for all GLMs, Poisson regression | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notes/machine_learning/02b_generalized_linear_models.ipynb) |
| 03 | [Regularisation, inputs, assumptions](notes/machine_learning/03_regularization_inputs_assumptions.ipynb) | Ridge, Lasso, Elastic Net, MAP view, scaling, one-hot, VIF, diagnostics | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notes/machine_learning/03_regularization_inputs_assumptions.ipynb) |
| 04 | [Softmax regression](notes/machine_learning/04_softmax_regression.ipynb) | softmax, categorical cross-entropy, from-scratch implementation | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notes/machine_learning/04_softmax_regression.ipynb) |
| 05 | [Support vector classifier](notes/machine_learning/05_support_vector_classifier.ipynb) | margin, hard/soft margin, the dual, kernel trick, hinge loss | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notes/machine_learning/05_support_vector_classifier.ipynb) |
| 06 | [Decision trees and CART](notes/machine_learning/06_decision_trees_cart.ipynb) | impurity, split search, CART from scratch, pruning | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notes/machine_learning/06_decision_trees_cart.ipynb) |
| 07 | [Bagging, random forests, boosting](notes/machine_learning/07_bagging_random_forest_boosting.ipynb) | variance of an average, bootstrap/OOB, random forests, AdaBoost, gradient boosting | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notes/machine_learning/07_bagging_random_forest_boosting.ipynb) |

Original class notes (PDF): [ML_classNotes.pptx.pdf](notes/machine_learning/ML_classNotes.pptx.pdf)

## Neural networks — [notes/neural_networks](notes/neural_networks)

| # | Notes | Contents | Colab |
|---|---|---|---|
| 00 | [Neural networks and the MLP](notes/neural_networks/00_neural_networks_mlp.ipynb) | neuron, XOR, forward propagation, activations, universal approximation | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notes/neural_networks/00_neural_networks_mlp.ipynb) |
| 01 | [Backpropagation](notes/neural_networks/01_backpropagation.ipynb) | chain rule on graphs, backprop derivation, gradient checking, initialisation | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notes/neural_networks/01_backpropagation.ipynb) |
| 02 | [Training: optimisation and regularisation](notes/neural_networks/02_training_optimization_regularization.ipynb) | SGD, momentum, Adam, schedules, weight decay, dropout, BatchNorm | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notes/neural_networks/02_training_optimization_regularization.ipynb) |
| 03 | [CNNs, transfer and multi-task learning](notes/neural_networks/03_cnn_transfer_multitask.ipynb) | convolution, receptive field, ResNet, transfer learning, multi-task loss | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notes/neural_networks/03_cnn_transfer_multitask.ipynb) |
| 04 | [Embeddings, RNNs and LSTMs](notes/neural_networks/04_rnn_lstm.ipynb) | embeddings, RNN, BPTT, vanishing gradients, LSTM/GRU | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notes/neural_networks/04_rnn_lstm.ipynb) |
| 05 | [Attention and transformers](notes/neural_networks/05_attention_transformers.ipynb) | BPE, attention, causal mask, multi-head, a tiny GPT, decoding | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notes/neural_networks/05_attention_transformers.ipynb) |
| 06 | [Embeddings, retrieval and RAG](notes/neural_networks/06_embeddings_rag.ipynb) | TF-IDF, LSA, contrastive encoders, nearest-neighbour search, RAG | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notes/neural_networks/06_embeddings_rag.ipynb) |

Original class notes (PDF): [ML_notes_NN.pptx.pdf](notes/neural_networks/ML_notes_NN.pptx.pdf)

---

# Class slides

Interactive HTML decks (one per topic) built on a shared engine in
[slides/assets](slides/assets). Open [slides/index.html](slides/index.html) in a browser,
or a set's own `index.html`. → / Space advances (and drives the interactive demos), ← goes
back, F is full screen, N / P jump between topics. Equations need internet (MathJax from a CDN).
Editing instructions are in [slides/machine_learning/README.md](slides/machine_learning/README.md)
and [slides/neural_networks/README.md](slides/neural_networks/README.md).
In the neural-network decks every lab has its own slide with an **Open in Colab** button, placed right
after the theory it needs; [slides/neural_networks/index.html](slides/neural_networks/index.html) also lists
the labs in that order.

## Machine learning — [slides/machine_learning](slides/machine_learning/index.html)

| # | Deck |
|---|---|
| 01 | [Supervised learning · train, validation, test](slides/machine_learning/01_supervised_learning.html) |
| 02 | [Linear regression](slides/machine_learning/02_linear_regression.html) |
| 03 | [Logistic regression and classification metrics](slides/machine_learning/03_logistic_regression.html) |
| 04 | [Softmax regression](slides/machine_learning/04_softmax_regression.html) |
| 05 | [Regularization, inputs, assumptions](slides/machine_learning/05_regularization.html) |
| 06 | [Decision trees and CART](slides/machine_learning/06_decision_trees.html) |
| 07 | [Bagging, random forest, boosting, XGBoost](slides/machine_learning/07_ensembles.html) |
| 08 | [Support vector machines](slides/machine_learning/08_svm.html) |

## Neural networks — [slides/neural_networks](slides/neural_networks/index.html)

| # | Deck |
|---|---|
| 01 | [From logistic regression to neural networks](slides/neural_networks/01_neural_networks.html) |
| 02 | [Forward and backward propagation](slides/neural_networks/02_backpropagation.html) |
| 03 | [Training: optimizers, regularization, layers](slides/neural_networks/03_training.html) |
| 04 | [CNNs, transfer learning, segmentation, detection](slides/neural_networks/04_cnn.html) |
| 05 | [RNNs and LSTMs](slides/neural_networks/05_rnn_lstm.html) |
| 06 | [Attention and transformers](slides/neural_networks/06_transformers.html) |

---

## Running in Google Colab (recommended)

Click any **Open in Colab** badge above. Colab reads the notebook straight from
GitHub — nothing to install, and a free GPU is one menu click away.

The general URL pattern is:

```
https://colab.research.google.com/github/<user>/<repo>/blob/<branch>/<path-to-notebook>
```

Two things to keep in mind:

- **The repository must be public** (or you must authorise Colab's GitHub access
  via *File → Open notebook → GitHub*), and the notebooks must be **pushed** to
  `main` — Colab reads GitHub, not your local disk.
- Changes made in Colab are **not** saved back here. Use *File → Save a copy in
  Drive* to keep your work.

Most notebooks already contain their own `!pip install` cells for anything Colab
does not ship by default, so they run top-to-bottom as-is.

## Running locally

```bash
git clone https://github.com/imagra93/ML-course-labs.git
cd ML-course-labs

python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Part 1 (classical ML) only:
pip install -r requirements.txt

# Part 2 (neural networks) as well:
pip install -r requirements.txt -r requirements-dl.txt

jupyter lab
```

`requirements-dl.txt` installs CPU PyTorch wheels. For an NVIDIA GPU, install
Torch from the official index instead:

```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124
```

## Data

Nothing needs to be downloaded by hand:

- Lab 0, labs 1–6, labs 7, 8, 15 and lab 16 use synthetic data or the small datasets bundled with
  scikit-learn (Iris, Wine, Breast Cancer, Diabetes).
- Labs 9–10 download **Fashion-MNIST** through `torchvision.datasets` on first run.
- Lab 11 downloads the **IMDB** review dataset (the Keras version, about 19 MB) directly with `urllib`; no TensorFlow needed.
- Lab 10b downloads the **African Wildlife** detection dataset (≈100 MB) and YOLO11n weights (≈5 MB) through Ultralytics.
- Labs 12–13 download the face dataset from Google Drive with `gdown` and unzip
  it into `data/`.
- Lab 14 downloads pretrained **GPT-2** weights (≈500 MB) from the Hugging Face Hub.
- Lab 15 downloads a multilingual sentence encoder (≈470 MB) and Qwen2.5-1.5B-Instruct plus Qwen2.5-0.5B-Instruct (≈4 GB) from the Hugging Face Hub.

Downloaded data is git-ignored.

## Known caveats

- **Lab 6 (XGBoost)** needs the Graphviz *system* binaries for the tree plots
  (`sudo apt install graphviz` / `brew install graphviz`), not just the Python
  package.
