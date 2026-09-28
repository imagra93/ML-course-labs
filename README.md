# ML Course Labs

Hands-on notebooks for a master's-level machine learning course. The labs go from
implementing algorithms by hand in NumPy up to multi-task deep learning and
transformer text generation, and each one is self-contained: theory, code, and
exercises in the same notebook.

Every notebook can be opened directly in Google Colab — click a badge below, no
local install required.

---

## Part 0 — Prerequisites

Work through this **before the first session**. It covers the subset of Python, NumPy
and pandas the labs assume, and ends with a miniature end-to-end ML workflow.

| # | Lab | Topics | Colab |
|---|-----|--------|-------|
| 0 | [Python for Machine Learning](python_course_0.ipynb) | Python essentials, OOP (`fit`/`predict`), NumPy, pandas, Matplotlib | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/python_course_0.ipynb) |

## Part 1 — Classical Machine Learning

Scikit-learn / NumPy. Small datasets, runs comfortably on a laptop CPU.

| # | Lab | Topics | Colab |
|---|-----|--------|-------|
| 1 | [Ordinary Least Squares Regression](machine_learning/lab%20-%20Ordinary%20Least%20Squares%20Regression.ipynb) | Linear model, normal equation, gradient descent from scratch | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/machine_learning/lab%20-%20Ordinary%20Least%20Squares%20Regression.ipynb) |
| 2 | [Polynomial Regression and Regularisation](machine_learning/lab%20-%20Polynomial%20Regression%20and%20Regularisation.ipynb) | Basis expansion, bias–variance trade-off, Ridge/Lasso, pipelines | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/machine_learning/lab%20-%20Polynomial%20Regression%20and%20Regularisation.ipynb) |
| 3 | [Logistic Regression](machine_learning/lab%20-%20Logistic%20Regression.ipynb) | Sigmoid, cross-entropy, gradient descent from scratch, ROC/AUC | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/machine_learning/lab%20-%20Logistic%20Regression.ipynb) |
| 4 | [Decision Trees and Random Forests](machine_learning/lab%20-%20Decision%20Trees%20and%20Random%20Forests.ipynb) | Impurity criteria, pruning, bagging, feature importance | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/machine_learning/lab%20-%20Decision%20Trees%20and%20Random%20Forests.ipynb) |
| 4b | [Decision Trees from Scratch](machine_learning/lab%20-%20Decision%20Trees%20from%20scratch.ipynb) | CART from scratch in NumPy: impurity, greedy split search, recursive growth, feature importance | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/machine_learning/lab%20-%20Decision%20Trees%20from%20scratch.ipynb) |
| 5 | [Support Vector Machines](machine_learning/lab%20-%20Support%20Vector%20Machines.ipynb) | Maximum margin, soft margin, the kernel trick, hyperparameter search | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/machine_learning/lab%20-%20Support%20Vector%20Machines.ipynb) |
| 6 | [XGBoost and Gradient Boosting](machine_learning/lab%20-%20XGBoost%20and%20Gradient%20Boosting.ipynb) | Boosting theory, regularised objective, early stopping, tuning | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/machine_learning/lab%20-%20XGBoost%20and%20Gradient%20Boosting.ipynb) |

## Part 2 — Deep Learning

PyTorch. The last few labs are much faster on a GPU —
in Colab, use **Runtime → Change runtime type → T4 GPU**.

| # | Lab | Topics | GPU | Colab |
|---|-----|--------|-----|-------|
| 7 | [MLP from scratch (NumPy)](deep_learning/MLP_Numpy.ipynb) | Forward pass and backpropagation by hand, XOR / non-linear boundaries | – | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/deep_learning/MLP_Numpy.ipynb) |
| 8 | [MLP with PyTorch](deep_learning/MLP_pytorch.ipynb) | Autograd, `nn.Module`, optimisers, training loops | – | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/deep_learning/MLP_pytorch.ipynb) |
| 9 | [Multiclass classification (MLP)](deep_learning/Demo_Multiclass.ipynb) | Softmax and cross-entropy (with proofs), train/val/test, early stopping, confusion matrix, dropout, why MLPs fail on shifted images | opt. | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/deep_learning/Demo_Multiclass.ipynb) |
| 10 | [CNNs for image classification](deep_learning/Demo_CNN_Multiclass.ipynb) | Convolution from scratch, output size, parameter count, equivariance, receptive field, feature maps, augmentation, dropout, BatchNorm | opt. | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/deep_learning/Demo_CNN_Multiclass.ipynb) |
| 10b | [Object detection with YOLO](deep_learning/object_detection_yolo.ipynb) | Box formats, IoU, the YOLO11 head, NMS and mAP from scratch, fine-tuning YOLO11n on African Wildlife, ONNX export, a Gradio app | opt. | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/deep_learning/object_detection_yolo.ipynb) |
| 11 | [LSTM sentiment analysis](deep_learning/LSTM_sentiment.ipynb) | TF-IDF baseline, embeddings, RNN and LSTM from scratch, BPTT and vanishing gradients, packing, RNN vs LSTM vs GRU, reading a review word by word | opt. | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/deep_learning/LSTM_sentiment.ipynb) |
| 12 | [Multi-task face analysis (plain PyTorch)](deep_learning/multitask_face_plain_pytorch.ipynb) | Shared backbone, multiple heads, combined losses, transfer learning | **yes** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/deep_learning/multitask_face_plain_pytorch.ipynb) |
| 13 | [Multi-task face analysis (Lightning)](deep_learning/multitask_face_lightning.ipynb) | Three tasks (eyes + gender + age) with Lightning: `LightningModule`, `LightningDataModule`, callbacks, TorchMetrics, loss weighting | **yes** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/deep_learning/multitask_face_lightning.ipynb) |
| 14 | [Text generation with Transformers](deep_learning/Text_Generation_with_Transformers.ipynb) | BPE from scratch, GPT-2 parameter count, perplexity and surprisal, causal attention, greedy/temperature/top-k/top-p from scratch, KV cache, beam search, few-shot prompting | opt. | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/deep_learning/Text_Generation_with_Transformers.ipynb) |
| 15 | [RAG: embeddings and similarity search](deep_learning/rag_embeddings_demo.ipynb) | Full RAG pipeline: TF-IDF, character n-grams, LSA and a neural encoder compared with hit rate@k and MRR, approximate search (IVF), chunking, grounded answers with a small LLM, hallucination and prompt injection | opt. | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/deep_learning/rag_embeddings_demo.ipynb) |

## Part 3 — Time Series

The methodology lab. Linear regression again, but with data where the i.i.d. assumption
fails — and where the usual validation habits silently produce worthless models.

| # | Lab | Topics | Colab |
|---|-----|--------|-------|
| 16 | [Linear Regression for Time Series](machine_learning/lab%20-%20Linear%20Regression%20for%20Time%20Series.ipynb) | Why random splits leak, chronological & rolling-origin validation (`TimeSeriesSplit`), causal lag/rolling/calendar features, look-ahead bias, MASE vs. R², baselines and residual diagnostics | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/machine_learning/lab%20-%20Linear%20Regression%20for%20Time%20Series.ipynb) |

Best placed at the end of the course: it assumes Labs 1 and 2, and it re-examines the
train/validation discipline students have been applying since Lab 1.

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

# Part 2 (deep learning) as well:
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
