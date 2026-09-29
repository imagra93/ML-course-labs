# Neural network slides

One HTML file per topic, built on the same engine as [`../slides`](../slides) (styles, navigation, logo and shared figures live in `../slides/assets`). Open `index.html` to present.

| File | Topic | From ML_notes_NN.pptx |
|---|---|---|
| `01_neural_networks.html` | Logistic regression vs neural networks, MLP, activations, non-linearity, losses, softmax | slides 2–27, 44–48 + notes 00 |
| `02_backpropagation.html` | Forward and backward propagation, initialization, vanishing gradients | slides 28–43, 53 + notes 01 |
| `03_training.html` | Mini-batch GD, optimizers, schedules, over/underfitting, dropout, BatchNorm, other layers | slides 41–42, 49–59 + notes 02 |
| `04_cnn.html` | Convolutions, pooling, architectures, transfer learning, augmentation, segmentation, detection | slides 60–81 + notes 03, 07 |
| `05_rnn_lstm.html` | Embeddings, RNNs, BPTT, LSTM, GRU | slides 83–93 + notes 04 |
| `06_transformers.html` | Attention, transformers, GPT, decoding, RAG | slides 94–109 + notes 05 |

Figures: `assets/nn-core.js` (network drawings, matrices, tensor blocks, heat maps, the step-panel driver, the tiny 2-2-1 example network and a small MLP trainer) and one `assets/fig-nn-<topic>.js` per topic. Extra styles for these decks live in `assets/nn.css`.

Every deck is self-contained: a "where we are" slide, worked examples with real numbers (neuron, forward pass, backprop, convolution, RNN, LSTM step, attention), scripted demos that advance with → (`data-auto` on a widget), and a vocabulary slide at the end.

Step-by-step widgets: a slider `<input data-k="s">` plus panels `<div data-i="k">` inside `.panels`; the figure calls `MLNN.stepper(root, draw)`. Decks are chained with `data-prev` / `data-next` on `<body>` (N / P keys jump between topics).
Editing works exactly as described in [`../slides/README.md`](../slides/README.md).
