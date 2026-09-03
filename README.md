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
| 1 | [Ordinary Least Squares Regression](machina_learning/lab%20-%20Ordinary%20Least%20Squares%20Regression.ipynb) | Linear model, normal equation, gradient descent from scratch | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/machina_learning/lab%20-%20Ordinary%20Least%20Squares%20Regression.ipynb) |
| 2 | [Polynomial Regression and Regularisation](machina_learning/lab%20-%20Polynomial%20Regression%20and%20Regularisation.ipynb) | Basis expansion, bias–variance trade-off, Ridge/Lasso, pipelines | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/machina_learning/lab%20-%20Polynomial%20Regression%20and%20Regularisation.ipynb) |
| 3 | [Logistic Regression](machina_learning/lab%20-%20Logistic%20Regression.ipynb) | Sigmoid, cross-entropy, gradient descent from scratch, ROC/AUC | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/machina_learning/lab%20-%20Logistic%20Regression.ipynb) |
| 4 | [Decision Trees and Random Forests](machina_learning/lab%20-%20Decision%20Trees%20and%20Random%20Forests.ipynb) | Impurity criteria, pruning, bagging, feature importance | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/machina_learning/lab%20-%20Decision%20Trees%20and%20Random%20Forests.ipynb) |
| 5 | [Support Vector Machines](machina_learning/lab%20-%20Support%20Vector%20Machines.ipynb) | Maximum margin, soft margin, the kernel trick, hyperparameter search | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/machina_learning/lab%20-%20Support%20Vector%20Machines.ipynb) |
| 6 | [XGBoost and Gradient Boosting](machina_learning/lab%20-%20XGBoost%20and%20Gradient%20Boosting.ipynb) | Boosting theory, regularised objective, early stopping, tuning | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/machina_learning/lab%20-%20XGBoost%20and%20Gradient%20Boosting.ipynb) |

## Part 2 — Deep Learning

PyTorch (plus one Keras-dataset lab). The last few labs are much faster on a GPU —
in Colab, use **Runtime → Change runtime type → T4 GPU**.

| # | Lab | Topics | GPU | Colab |
|---|-----|--------|-----|-------|
| 7 | [MLP from scratch (NumPy)](deep_learning/MLP_Numpy.ipynb) | Forward pass and backpropagation by hand, XOR / non-linear boundaries | – | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/deep_learning/MLP_Numpy.ipynb) |
| 8 | [MLP with PyTorch](deep_learning/MLP_pytorch.ipynb) | Autograd, `nn.Module`, optimisers, training loops | – | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/deep_learning/MLP_pytorch.ipynb) |
| 9 | [Multiclass classification (MLP)](deep_learning/Demo_Multiclass.ipynb) | Softmax, cross-entropy, Fashion-MNIST, `DataLoader` | opt. | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/deep_learning/Demo_Multiclass.ipynb) |
| 10 | [CNNs for image classification](deep_learning/Demo_CNN_Multiclass.ipynb) | Convolutions, pooling, feature maps, data augmentation | opt. | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/deep_learning/Demo_CNN_Multiclass.ipynb) |
| 11 | [LSTM sentiment analysis](deep_learning/LSTM_sentiment.ipynb) | Sequence models, embeddings, padding/packing, IMDB reviews | opt. | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/deep_learning/LSTM_sentiment.ipynb) |
| 12 | [Multi-task face analysis (plain PyTorch)](deep_learning/multitask_face_plain_pytorch.ipynb) | Shared backbone, multiple heads, combined losses, transfer learning | **yes** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/deep_learning/multitask_face_plain_pytorch.ipynb) |
| 13 | [Multi-task face analysis (Lightning)](deep_learning/task_face_notebook.ipynb) | Same task with PyTorch Lightning: `LightningModule`, callbacks, logging | **yes** | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/deep_learning/task_face_notebook.ipynb) |
| 14 | [Text generation with Transformers](deep_learning/Text_Generation_with_Transformers.ipynb) | GPT-2, autoregressive decoding, greedy vs. sampling vs. beam search | opt. | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/deep_learning/Text_Generation_with_Transformers.ipynb) |
| 15 | [RAG: embeddings and similarity search](deep_learning/rag_embeddings_demo.ipynb) | Vector representations, cosine similarity, retrieval, PCA visualisation | – | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/deep_learning/rag_embeddings_demo.ipynb) |

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

- Lab 0 and labs 1–6, 7, 8, 15 use synthetic data or the small datasets bundled with
  scikit-learn (Iris, Wine, Breast Cancer, Diabetes).
- Labs 9–10 download **Fashion-MNIST** through `torchvision.datasets` on first run.
- Lab 11 downloads the **IMDB** review dataset through `tf.keras.datasets`.
- Labs 12–13 download the face dataset from Google Drive with `gdown` and unzip
  it into `data/`.
- Lab 14 downloads pretrained **GPT-2** weights from the Hugging Face Hub.

Downloaded data is git-ignored.

## Known caveats

- **Lab 11 (LSTM)** imports TensorFlow *only* to load the Keras IMDB dataset; the
  model itself is PyTorch. TensorFlow is therefore commented out in
  `requirements-dl.txt` — uncomment it (or just run this lab in Colab, which
  ships TensorFlow already) if you want to run it locally.
- **Lab 14 (GPT-2)** imports `pytorch_transformers`, the 2019 predecessor of
  Hugging Face `transformers`, which no longer installs cleanly on recent Python.
  The modern equivalent is a drop-in swap for this notebook's usage:
  ```python
  from transformers import GPT2Tokenizer, GPT2LMHeadModel
  ```
  `requirements-dl.txt` installs `transformers` for this reason.
- **Lab 6 (XGBoost)** needs the Graphviz *system* binaries for the tree plots
  (`sudo apt install graphviz` / `brew install graphviz`), not just the Python
  package.
