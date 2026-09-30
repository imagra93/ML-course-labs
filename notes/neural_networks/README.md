# ML course notes: neural networks

Self-contained theory notes for the deep learning part of the course. They continue the
[machine learning notes](../machine_learning) with the same notation and style: the theory with every derivation, the
assumptions of each model with how to check them and what to do when they fail, and code that reproduces every plot
and number. The interactive figures are the same ones used in the [slides](../../slides/neural_networks/index.html).

**Read them online:** <https://imagra93.github.io/ML-course-labs/notes/> (or open any `.html` file of this folder in a
browser). Each note is a [Quarto](https://quarto.org) file (`.qmd`: Markdown with Python cells), rendered to the `.html`
page next to it.

Everything runs on a CPU in a minute or two per note, with no downloads: small built-in or synthetic datasets
(scikit-learn digits, synthetic sequences and documents) stand in for Fashion-MNIST, IMDB, the face dataset and GPT-2
used in the labs.

| # | Note | Source | Contents | Related labs |
|---|---|---|---|---|
| 00 | [Neural networks and the MLP](https://imagra93.github.io/ML-course-labs/notes/neural_networks/00_neural_networks_mlp.html) | [.qmd](00_neural_networks_mlp.qmd) | neuron = logistic regression, XOR, the MLP, forward pass with numbers, activations, losses as MLE, universal approximation, non-convexity; practical checks | MLP_Numpy |
| 01 | [Backpropagation](https://imagra93.github.io/ML-course-labs/notes/neural_networks/01_backpropagation.html) | [.qmd](01_backpropagation.qmd) | chain rule on graphs, backpropagation derived with numbers, NumPy code, gradient checking, autograd, initialisation, vanishing and exploding gradients | MLP_Numpy, MLP_pytorch |
| 02 | [Training: optimisation and regularisation](https://imagra93.github.io/ML-course-labs/notes/neural_networks/02_training_optimization_regularization.html) | [.qmd](02_training_optimization_regularization.qmd) | mini-batches, learning rate, momentum, RMSProp, Adam, schedules, learning curves, weight decay and AdamW, dropout, BatchNorm (backward derived), debugging guide, assumptions of training | MLP_pytorch, Demo_Multiclass, face labs |
| 03 | [CNNs, transfer and multi-task learning](https://imagra93.github.io/ML-course-labs/notes/neural_networks/03_cnn_transfer_multitask.html) | [.qmd](03_cnn_transfer_multitask.qmd) | convolution and its backward pass, receptive field, pooling, inductive biases, ResNet, transfer and multi-task learning, segmentation, detection (IoU, NMS, AP) | Demo_CNN_Multiclass, multitask_face_*, object_detection_yolo |
| 04 | [Embeddings, RNNs and LSTMs](https://imagra93.github.io/ML-course-labs/notes/neural_networks/04_rnn_lstm.html) | [.qmd](04_rnn_lstm.qmd) | embeddings, RNN, BPTT, vanishing and exploding gradients, clipping, LSTM and GRU, padding and masking, sequence-model assumptions and look-ahead leakage | LSTM_sentiment |
| 05 | [Attention and transformers](https://imagra93.github.io/ML-course-labs/notes/neural_networks/05_attention_transformers.html) | [.qmd](05_attention_transformers.qmd) | attention, √d scaling, multi-head, positional encodings, causal mask, cost and KV cache, GPT parameter count, a tiny GPT, decoding, perplexity | Text_Generation_with_Transformers |
| 06 | [Embeddings, retrieval and RAG](https://imagra93.github.io/ML-course-labs/notes/neural_networks/06_embeddings_rag.html) | [.qmd](06_embeddings_rag.qmd) | similarity, TF-IDF, BM25, LSA, neural embeddings, approximate search, retrieval metrics, hybrid retrieval, chunking, RAG and its failure modes | rag_embeddings_demo |

The full YOLO pipeline (fine-tuning YOLO11n, ONNX export, a Gradio app) is a lab:
[`notebooks/neural_networks/object_detection_yolo.ipynb`](../../notebooks/neural_networks/object_detection_yolo.ipynb).
The detection concepts it builds on (boxes, IoU, NMS, precision–recall and AP) are in note 03.

Original class notes (PDF): [ML_notes_NN.pptx.pdf](ML_notes_NN.pptx.pdf)

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

## Editing a note

Same as for the [machine learning notes](../machine_learning/README.md#editing-a-note): edit the `.qmd`, run
`quarto render notes/neural_networks/<note>.qmd` from the repository root, and commit the `.qmd`, the `.html` and its
`<note>_files/` folder. Requirements: Quarto, the packages in `requirements.txt` plus `torch` (from
`requirements-dl.txt`). These pages also load the neural-network figure helpers (`nn-core.js`, `notes-nn.css`, see
[`_metadata.yml`](_metadata.yml)). NN step widgets (a slider `data-k="s"` with panels `data-i` / `data-from`) need
their panels inside the widget `<div>`, because a note has no enclosing slide.
