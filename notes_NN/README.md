# Neural network notes (redes neuronales)

Self-contained notes for the deep learning part of the course. They continue the classical ML notes in
[`../notes_ML`](../notes_ML) with the same notation and style: theory with full derivations, plus short code cells
that reproduce every plot and number. The notebooks are saved with their outputs, so they can be read on GitHub,
in VS Code or in Colab without running anything.

Everything runs on a CPU in about a minute per notebook, with no downloads: small built-in datasets
(scikit-learn digits, synthetic data) stand in for Fashion-MNIST, IMDB, the face dataset and GPT-2 used in the labs.

| # | Notebook | Contents | Related labs |
|---|---|---|---|
| 00 | [Neural networks and the MLP](00_neural_networks_mlp.ipynb) | neuron = logistic regression, XOR (proof), forward propagation, why non-linearity (proof), activations, output layer + loss as MLE, universal approximation (constructive), non-convexity (proof) | MLP_Numpy |
| 01 | [Backpropagation](01_backpropagation.ipynb) | chain rule on graphs, backprop derivation for an MLP, NumPy implementation + gradient checking, initialisation (Xavier/He derivation), vanishing/exploding gradients, PyTorch autograd | MLP_Numpy, MLP_pytorch |
| 02 | [Training: optimisation and regularisation](02_training_optimization_regularization.ipynb) | mini-batch SGD, momentum, RMSProp/Adam (bias correction), LR schedules, the PyTorch training loop, learning curves, weight decay/AdamW, dropout, augmentation, early stopping, BatchNorm/LayerNorm, clipping | MLP_pytorch, Demo_Multiclass, face labs |
| 03 | [CNNs, transfer and multi-task learning](03_cnn_transfer_multitask.ipynb) | convolution, output size, parameter count, equivariance (proof), pooling, receptive field, CNN vs MLP, filters, ResNet, transfer learning, multi-task loss weighting (MLE derivation) | Demo_CNN_Multiclass, multitask_face_* |
| 04 | [Embeddings, RNNs and LSTMs](04_rnn_lstm.ipynb) | tokens and embeddings, RNN, BPTT and vanishing gradients (derivation), LSTM/GRU and why the gradient survives, practicalities, memory experiment | LSTM_sentiment |
| 05 | [Attention and transformers](05_attention_transformers.ipynb) | language modelling, BPE, attention, the √d scaling (derivation), permutation equivariance (proof), causal mask, multi-head, transformer block, GPT parameter count, a tiny GPT trained from scratch, decoding strategies | Text_Generation_with_Transformers |
| 06 | [Embeddings, retrieval and RAG](06_embeddings_rag.ipynb) | cosine vs Euclidean, TF-IDF, LSA/SVD, word2vec and contrastive encoders, nearest-neighbour search, recall@k/MRR, the RAG pipeline | rag_embeddings_demo |

## Notation

| Symbol | Meaning |
|---|---|
| $m$, $n$ | number of examples, number of input features |
| $\mathbf{x}^{(i)}$, $y^{(i)}$; $\mathbf{X}$ | $i$-th input and target; inputs stacked as rows |
| $\mathbf{W}^{[l]}, \mathbf{b}^{[l]}$ | weights and bias of layer $l$ (row convention: $\mathbf{Z}^{[l]} = \mathbf{A}^{[l-1]}\mathbf{W}^{[l]} + \mathbf{b}^{[l]}$) |
| $\boldsymbol{\theta}$ | all parameters of the network |
| $\mathbf{Z}^{[l]}, \mathbf{A}^{[l]}$ | pre-activations and activations of layer $l$; $\mathbf{A}^{[0]} = \mathbf{X}$ |
| $J(\boldsymbol{\theta})$ | loss being minimised |
| $\alpha$, $\lambda$ | learning rate, regularisation strength |

Requirements: the packages in `requirements.txt` plus `torch` (from `requirements-dl.txt`).
