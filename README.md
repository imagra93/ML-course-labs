# ML Course Labs

Material for a master's-level course in machine learning and neural networks. The course goes
topic by topic, and every topic has:

- **Slides**: what we cover in class. Interactive HTML decks: → / Space advances, ← goes back,
  F is full screen, N / P jump between topics.
- **Notebook**: the hands-on lab for the topic. Open it in Google Colab with its badge.
- **Extra notes**: optional reading that goes deeper than the slides: every derivation, the
  assumptions of each method and what to do when they fail, and code that reproduces every plot.

All slides: **<https://imagra93.github.io/ML-course-labs/slides/>** ·
all notes: **<https://imagra93.github.io/ML-course-labs/notes/>**  
Printable slides (two per page, with room for your own notes):
[machine learning](slides/machine_learning_class_ppt.pdf) ·
[neural networks](slides/neural_networks_class_ppt.pdf)

---

## Before the first class · Python for ML

- **Slides:** [Introduction · Python for ML](https://imagra93.github.io/ML-course-labs/slides/machine_learning/00_introduction.html)
- **Content:** course overview; Python essentials, classes and the scikit-learn `fit`/`predict` contract,
  NumPy (indexing, vectorisation, broadcasting), pandas, Matplotlib, an ML workflow in 5 steps
- **Notebook:** [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/lab%200%20-%20Python%20for%20Machine%20Learning.ipynb)
  [Lab 0 · Python for Machine Learning](notebooks/lab%200%20-%20Python%20for%20Machine%20Learning.ipynb):
  work through it **before the first session**. It covers the Python, NumPy and pandas the labs
  assume and ends with a miniature end-to-end ML workflow.

---

# Part 1 · Machine learning

Scikit-learn / NumPy. Small datasets: a laptop CPU is enough.

## 01 · Supervised learning and data splits

- **Slides:** [Supervised learning · train, validation, test](https://imagra93.github.io/ML-course-labs/slides/machine_learning/01_supervised_learning.html)
- **Content:** the ML workflow, underfitting and overfitting, train / validation / test, splitting
  correctly (leakage, classes, groups, time)
- **Notebook:** none of its own: every lab applies it, and Lab 16 is the time-series case
- **Extra notes:** [Supervised learning, splits and CV](https://imagra93.github.io/ML-course-labs/notes/machine_learning/00_supervised_learning.html):
  bias–variance, train/val/test, K-fold and nested CV, metric precision; assumptions: i.i.d., shift,
  groups, time, leakage

## 02 · Linear regression

- **Slides:** [Linear regression](https://imagra93.github.io/ML-course-labs/slides/machine_learning/02_linear_regression.html)
- **Content:** the model and its cost, convexity, gradient descent and the learning rate, the normal
  equation, Newton's method, feature engineering, encoding and scaling, regression metrics,
  probabilistic interpretation
- **Notebook:** [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/machine_learning/lab%201%20-%20Ordinary%20Least%20Squares%20Regression.ipynb)
  [Lab 1 · Ordinary Least Squares Regression](notebooks/machine_learning/lab%201%20-%20Ordinary%20Least%20Squares%20Regression.ipynb):
  linear model, normal equation, gradient descent from scratch
- **Extra notes:** [Linear regression](https://imagra93.github.io/ML-course-labs/notes/machine_learning/01_linear_regression.html):
  gradient descent, normal equation, convexity, MLE, OLS statistics; assumptions and diagnostics,
  collinearity and VIF, influence

## 03 · Logistic regression and classification metrics

- **Slides:** [Logistic regression and classification metrics](https://imagra93.github.io/ML-course-labs/slides/machine_learning/03_logistic_regression.html)
- **Content:** sigmoid, odds and log-odds, cross-entropy and its probabilistic meaning, convexity,
  gradient descent, separable data, decision boundary; precision and recall, ROC/AUC, choosing the
  threshold from costs, class imbalance, calibration
- **Notebook:** [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/machine_learning/lab%203%20-%20Logistic%20Regression.ipynb)
  [Lab 3 · Logistic Regression](notebooks/machine_learning/lab%203%20-%20Logistic%20Regression.ipynb):
  sigmoid, cross-entropy, gradient descent from scratch, ROC/AUC
- **Extra notes:**
  - [Logistic regression](https://imagra93.github.io/ML-course-labs/notes/machine_learning/02_logistic_regression.html):
    cross-entropy = MLE, Newton/IRLS, separation, odds ratios, metrics, ROC/AUC, calibration;
    assumptions, class imbalance
  - [Generalised linear models](https://imagra93.github.io/ML-course-labs/notes/machine_learning/02b_generalized_linear_models.html):
    the GLM recipe, IRLS, deviance, Poisson claim counts, overdispersion, offsets, Gamma, Tweedie

## 04 · Softmax regression

- **Slides:** [Softmax regression](https://imagra93.github.io/ML-course-labs/slides/machine_learning/04_softmax_regression.html)
- **Content:** classes as one-hot vectors, the softmax model and its properties, K = 2 is logistic
  regression, cross-entropy cost, gradient, convexity, multiclass metrics
- **Notebook:** none of its own: Lab 9 (Part 2) codes softmax and cross-entropy by hand
- **Extra notes:** [Softmax regression](https://imagra93.github.io/ML-course-labs/notes/machine_learning/04_softmax_regression.html):
  softmax, log-sum-exp, gradient, convexity, multiclass metrics; IIA, imbalance, temperature scaling

## 05 · Regularization, inputs, assumptions

- **Slides:** [Regularization, inputs, assumptions](https://imagra93.github.io/ML-course-labs/slides/machine_learning/05_regularization.html)
- **Content:** why regularise, Ridge (gradient and closed form), Lasso and its exact zeros, the
  geometric picture, coefficient paths, regularisation as a prior (MAP), choosing λ with
  cross-validation, input variables, collinearity, the assumptions of linear and logistic
  regression, a practical "what to do when…" guide
- **Notebook:** [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/machine_learning/lab%202%20-%20Polynomial%20Regression%20and%20Regularisation.ipynb)
  [Lab 2 · Polynomial Regression and Regularisation](notebooks/machine_learning/lab%202%20-%20Polynomial%20Regression%20and%20Regularisation.ipynb):
  basis expansion, bias–variance trade-off, Ridge/Lasso, pipelines
- **Extra notes:** [Regularisation, inputs, assumptions](https://imagra93.github.io/ML-course-labs/notes/machine_learning/03_regularization_inputs_assumptions.html):
  Ridge, Lasso, Elastic Net, MAP, choosing λ; scaling, encodings, missing values, pipelines and leakage

## 06 · Decision trees and CART

- **Slides:** [Decision trees and CART](https://imagra93.github.io/ML-course-labs/slides/machine_learning/06_decision_trees.html)
- **Content:** a tree as boxes in feature space, what a leaf predicts, entropy, information gain, Gini
  impurity, searching the threshold, the CART algorithm, regression trees, depth and overfitting,
  regularisation, instability
- **Notebook:** [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/machine_learning/lab%204%20-%20Decision%20Trees%20from%20scratch.ipynb)
  [Lab 4 · Decision Trees from Scratch](notebooks/machine_learning/lab%204%20-%20Decision%20Trees%20from%20scratch.ipynb):
  how a split is chosen, step by step: Gini, entropy, information gain, MSE decrease,
  threshold/feature search, recursion
- **Extra notes:** [Decision trees and CART](https://imagra93.github.io/ML-course-labs/notes/machine_learning/06_decision_trees_cart.html):
  entropy, Gini, CART from scratch, pruning; what trees assume, categorical and missing values

## 07 · Bagging, random forests and boosting

- **Slides:** [Bagging, random forest, boosting, XGBoost](https://imagra93.github.io/ML-course-labs/slides/machine_learning/07_ensembles.html)
- **Content:** why averaging works, the bootstrap and the out-of-bag error, bagging, random forests,
  AdaBoost, gradient boosting round by round and why it is called "gradient", XGBoost
- **Notebooks:**
  - [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/machine_learning/lab%204b%20-%20Decision%20Trees%20and%20Random%20Forests.ipynb)
    [Lab 4b · Decision Trees and Random Forests](notebooks/machine_learning/lab%204b%20-%20Decision%20Trees%20and%20Random%20Forests.ipynb):
    impurity criteria, pruning, bagging, feature importance
  - [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/machine_learning/lab%206%20-%20XGBoost%20and%20Gradient%20Boosting.ipynb)
    [Lab 6 · XGBoost and Gradient Boosting](notebooks/machine_learning/lab%206%20-%20XGBoost%20and%20Gradient%20Boosting.ipynb):
    gradient boosting and AdaBoost from scratch side by side, XGBoost, early stopping, tuning,
    feature selection by importance with a cross-validation stopping rule
- **Extra notes:** [Bagging, random forests and boosting](https://imagra93.github.io/ML-course-labs/notes/machine_learning/07_bagging_random_forest_boosting.html):
  bootstrap and OOB, random forests, AdaBoost, gradient boosting, XGBoost derivation, boosting in practice

## 08 · Support vector machines

- **Slides:** [Support vector machines](https://imagra93.github.io/ML-course-labs/slides/machine_learning/08_svm.html)
- **Content:** hyperplanes and what the dot product means, the margin, the optimisation problem,
  Lagrange multipliers, the dual problem, support vectors, kernels and the kernel trick, the RBF
  kernel, Mercer's condition, the soft margin, more than two classes
- **Notebook:** [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/machine_learning/lab%205%20-%20Support%20Vector%20Machines.ipynb)
  [Lab 5 · Support Vector Machines](notebooks/machine_learning/lab%205%20-%20Support%20Vector%20Machines.ipynb):
  maximum margin, soft margin, the kernel trick, hyperparameter search
- **Extra notes:** [Support vector classifier](https://imagra93.github.io/ML-course-labs/notes/machine_learning/05_support_vector_classifier.html):
  margin, duality and KKT, kernels and Mercer, hinge loss; scaling, C and γ, Platt probabilities

## Bonus · Linear regression for time series

- **Slides:** [bonus slide at the end of the SVM deck](https://imagra93.github.io/ML-course-labs/slides/machine_learning/08_svm.html#38)
- **Content:** linear regression again, but on a time series, where the i.i.d. assumption fails and
  the usual random splits silently produce worthless models. Assumes Labs 1 and 2.
- **Notebook:** [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/machine_learning/lab%2016%20-%20Linear%20Regression%20for%20Time%20Series.ipynb)
  [Lab 16 · Linear Regression for Time Series](notebooks/machine_learning/lab%2016%20-%20Linear%20Regression%20for%20Time%20Series.ipynb):
  why random splits leak, chronological & rolling-origin validation (`TimeSeriesSplit`), causal
  lag/rolling/calendar features, look-ahead bias, MASE vs. R², baselines, forecast horizon
- **Extra notes:** [Supervised learning, splits and CV: when the data are a time series](https://imagra93.github.io/ML-course-labs/notes/machine_learning/00_supervised_learning.html#the-data-are-a-time-series)

---

# Part 2 · Neural networks

PyTorch. Labs marked **GPU** need one, and those marked *GPU optional* run faster with one: in
Colab, use **Runtime → Change runtime type → T4 GPU**. The lab numbers do not follow the class
order: follow the topics below.

## 01 · From logistic regression to neural networks

- **Slides:** [From logistic regression to neural networks](https://imagra93.github.io/ML-course-labs/slides/neural_networks/01_neural_networks.html)
- **Content:** a review of linear and logistic regression (model, cost, gradient descent, the limits of
  a straight line), one neuron is logistic regression, the XOR limit and the hidden layer, the multi-layer
  perceptron and its forward pass in matrix form, activations and their derivatives (sigmoid, tanh,
  ReLU, LeakyReLU, GELU), matching the output layer and the loss, softmax, losses from maximum
  likelihood, universal approximation, why the loss is no longer convex
- **Notebook:** none of its own: Lab 7 comes after the next topic
- **Extra notes:** [Neural networks and the MLP](https://imagra93.github.io/ML-course-labs/notes/neural_networks/00_neural_networks_mlp.html):
  neuron, XOR, forward pass, activations, losses as MLE, universal approximation; practical checks

## 02 · Forward and backward propagation

- **Slides:** [Forward and backward propagation](https://imagra93.github.io/ML-course-labs/slides/neural_networks/02_backpropagation.html)
- **Content:** a derivative as a sensitivity, computations as graphs, forward and backward with
  numbers, the backpropagation derivation and algorithm, the same algorithm in NumPy, gradient
  checking and autograd, weight initialisation, vanishing and exploding gradients
- **Notebook:** [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/lab%207%20-%20MLP%20from%20scratch.ipynb)
  [Lab 7 · MLP from scratch (NumPy)](notebooks/neural_networks/lab%207%20-%20MLP%20from%20scratch.ipynb):
  forward pass and backpropagation by hand, XOR / non-linear boundaries
- **Extra notes:** [Backpropagation](https://imagra93.github.io/ML-course-labs/notes/neural_networks/01_backpropagation.html):
  chain rule on graphs, backprop derivation, gradient checking, autograd, initialisation, vanishing gradients

## 03 · Training: optimizers, regularization, layers

- **Slides:** [Training: optimizers, regularization, layers](https://imagra93.github.io/ML-course-labs/slides/neural_networks/03_training.html)
- **Content:** epochs and mini-batches, gradient descent variants, the learning rate, momentum,
  RMSProp, Adam, learning-rate schedules, shapes through the layers, the MLP in PyTorch, weight
  decay, data augmentation, early stopping, dropout, BatchNorm vs LayerNorm, reading the loss curve,
  sensible defaults
- **Notebooks:**
  - [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/lab%208%20-%20MLP%20with%20PyTorch.ipynb)
    [Lab 8 · MLP with PyTorch](notebooks/neural_networks/lab%208%20-%20MLP%20with%20PyTorch.ipynb):
    autograd, `nn.Module`, optimisers, training loops
  - [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/lab%209%20-%20Multiclass%20classification.ipynb)
    [Lab 9 · Multiclass classification (MLP)](notebooks/neural_networks/lab%209%20-%20Multiclass%20classification.ipynb)
    · *GPU optional*: softmax and cross-entropy (with proofs), train/val/test, early stopping,
    confusion matrix, dropout, why MLPs fail on shifted images
- **Extra notes:** [Training: optimisation and regularisation](https://imagra93.github.io/ML-course-labs/notes/neural_networks/02_training_optimization_regularization.html):
  SGD, momentum, Adam, schedules, weight decay, dropout, BatchNorm; debugging guide

## 04 · CNNs, transfer learning, segmentation, detection

- **Slides:** [CNNs, transfer learning, segmentation, detection](https://imagra93.github.io/ML-course-labs/slides/neural_networks/04_cnn.html)
- **Content:** why not an MLP on pixels, convolutional layers and filters, output size, pooling,
  receptive field; classic architectures (AlexNet, VGG, ResNet), residual connections, 1×1
  convolutions, data augmentation, transfer learning, multi-task learning, PyTorch Lightning;
  semantic segmentation (FCN, upsampling, U-Net, IoU and Dice), object detection (YOLO, its loss,
  IoU, non-maximum suppression, mAP)
- **Notebooks:**
  - [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/lab%2010%20-%20CNNs%20for%20image%20classification.ipynb)
    [Lab 10 · CNNs for image classification](notebooks/neural_networks/lab%2010%20-%20CNNs%20for%20image%20classification.ipynb)
    · *GPU optional*: convolution from scratch, output size, parameter count, equivariance,
    receptive field, feature maps, augmentation, dropout, BatchNorm
  - [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/lab%2012%20-%20Fine-tuning%20ResNet%20pretrained%20vs%20scratch.ipynb)
    [Lab 12 · Fine-tuning a ResNet: pre-trained vs scratch](notebooks/neural_networks/lab%2012%20-%20Fine-tuning%20ResNet%20pretrained%20vs%20scratch.ipynb)
    · **GPU**: transfer learning on EuroSAT satellite images: ImageNet features with no CNN
    training, feature extraction, fine-tuning with discriminative learning rates, accuracy vs
    number of labels, three ways to break a fine-tune
  - [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/demo%20-%20multitask%20face%20analysis%20plain%20PyTorch.ipynb)
    [Demo · Multi-task face analysis (plain PyTorch)](notebooks/neural_networks/demo%20-%20multitask%20face%20analysis%20plain%20PyTorch.ipynb)
    · **GPU**: ResNet-50 transfer learning on real photos, shared backbone with a regression head
    (eye positions)
  - [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/demo%20-%20multitask%20face%20analysis%20Lightning.ipynb)
    [Demo · Multi-task face analysis (Lightning)](notebooks/neural_networks/demo%20-%20multitask%20face%20analysis%20Lightning.ipynb)
    · **GPU**: three tasks (eyes + gender + age) with Lightning: `LightningModule`,
    `LightningDataModule`, callbacks, TorchMetrics, loss weighting
  - [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/lab%2013%20-%20Object%20detection%20with%20YOLO.ipynb)
    [Lab 13 · Object detection with YOLO](notebooks/neural_networks/lab%2013%20-%20Object%20detection%20with%20YOLO.ipynb)
    · *GPU optional*: box formats, IoU, the YOLO11 head, NMS and mAP from scratch, fine-tuning
    YOLO11n on African Wildlife, ONNX export
- **Extra notes:** [CNNs, transfer and multi-task learning](https://imagra93.github.io/ML-course-labs/notes/neural_networks/03_cnn_transfer_multitask.html):
  convolution and its backward pass, ResNet, transfer and multi-task learning, segmentation, detection

## 05 · RNNs and LSTMs

- **Slides:** [RNNs and LSTMs](https://imagra93.github.io/ML-course-labs/slides/neural_networks/05_rnn_lstm.html)
- **Content:** from text to vectors, embeddings and word2vec, the recurrent cell, backpropagation
  through time, vanishing gradients, gates, the LSTM one gate at a time, GRU, bidirectional and deep
  RNNs, practicalities, the limit of recurrence: one vector for everything
- **Notebook:** [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/lab%2011%20-%20LSTM%20sentiment%20analysis.ipynb)
  [Lab 11 · LSTM sentiment analysis](notebooks/neural_networks/lab%2011%20-%20LSTM%20sentiment%20analysis.ipynb)
  · *GPU optional*: TF-IDF baseline, embeddings, RNN and LSTM from scratch, BPTT and vanishing
  gradients, packing, RNN vs LSTM vs GRU, reading a review word by word
- **Extra notes:** [Embeddings, RNNs and LSTMs](https://imagra93.github.io/ML-course-labs/notes/neural_networks/04_rnn_lstm.html):
  embeddings, RNN, BPTT, clipping, LSTM/GRU, masking; sequence-model assumptions

## 06 · Attention and transformers

- **Slides:** [Attention and transformers](https://imagra93.github.io/ML-course-labs/slides/neural_networks/06_transformers.html)
- **Content:** attention as a soft dictionary lookup, queries, keys and values, self-attention,
  multi-head attention, positional encodings, the causal mask; the transformer block, encoders and
  decoders (BERT vs GPT); GPT: tokens, next-token prediction, decoding, the KV cache, surprisal and
  perplexity; RAG: embeddings, similarity search, chunking, approximate nearest neighbours,
  retrieval metrics, hybrid search and re-ranking
- **Notebooks:**
  - [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/lab%2014%20-%20Text%20generation%20with%20Transformers.ipynb)
    [Lab 14 · Text generation with Transformers](notebooks/neural_networks/lab%2014%20-%20Text%20generation%20with%20Transformers.ipynb)
    · *GPU optional*: BPE from scratch, GPT-2 parameter count, perplexity and surprisal, causal
    attention, greedy/temperature/top-k/top-p from scratch, KV cache, beam search, few-shot prompting
  - [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/lab%2015%20-%20RAG%20embeddings%20and%20similarity%20search.ipynb)
    [Lab 15 · RAG: embeddings and similarity search](notebooks/neural_networks/lab%2015%20-%20RAG%20embeddings%20and%20similarity%20search.ipynb)
    · *GPU optional*: full RAG pipeline: TF-IDF, character n-grams, LSA and a neural encoder
    compared with hit rate@k and MRR, approximate search (IVF), chunking, grounded answers with a
    small LLM, hallucination and prompt injection
- **Extra notes:**
  - [Attention and transformers](https://imagra93.github.io/ML-course-labs/notes/neural_networks/05_attention_transformers.html):
    attention, Q/K/V, backpropagation through attention, multi-head, positions, causal and
    cross-attention, KV cache, a tiny GPT, decoding, perplexity, modern LLMs
  - [Embeddings, retrieval and RAG](https://imagra93.github.io/ML-course-labs/notes/neural_networks/06_embeddings_rag.html):
    TF-IDF, BM25, LSA, neural embeddings, IVF / HNSW / PQ, retrieval metrics, hybrid search and
    re-ranking, chunking, RAG
