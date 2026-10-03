# Neural network slides

One HTML file per topic, built on the same engine as [`../machine_learning`](../machine_learning) (styles, navigation, logo and shared figures live in [`../assets`](../assets)). Open `index.html` to present.

| File | Topic | Labs in the deck | From ML_notes_NN.pptx |
|---|---|---|---|
| `01_neural_networks.html` | From one neuron to deep networks: linear and logistic regression as neurons, a layer of neurons, XOR, hand-made vs learned features, MLP, depth, the network family of the course, forward pass with numbers, activations and their derivatives (one slide each), losses, sigmoid + cross-entropy, multiclass and one-hot, softmax (with numbers and an interactive demo), where the losses come from, losses in PyTorch | – | slides 2–27, 44–48 + notes 00 |
| `02_backpropagation.html` | Derivatives refresher, chain rule on graphs, backprop with real numbers, the derivation and the algorithm, the algorithm in NumPy, gradient checking, initialization, vanishing gradients | 7 | slides 28–43, 53 + notes 01 |
| `03_training.html` | Mini-batches, learning rate, moving averages, momentum, RMSProp, Adam, schedules, over/underfitting, weight decay (derivation and demo), augmentation, early stopping, dropout, BatchNorm, other layers, debugging | 8, 9 | slides 41–42, 49–59 + notes 02 |
| `04_cnn.html` | Dense layer vs convolution, convolutions, pooling, receptive field, architectures, transfer learning, multi-task learning, PyTorch Lightning, segmentation, detection (YOLO11 loss), NMS, mAP | 10, 12, 13 (+ a multi-task demo) | slides 60–81 + notes 03 |
| `05_rnn_lstm.html` | Tokens and embedding lookup, RNNs, BPTT, vanishing gradients (derivation), gates, the LSTM gate by gate, GRU, packing | 11 | slides 83–93 + notes 04 |
| `06_transformers.html` | In four parts. Attention: soft lookup with numbers, where Q/K/V come from, √d_k, multi-head, word order and positions, masks, self-attention in code. The transformer block, encoder–decoder, BERT vs GPT. GPT: tokens, next-token objective with GPT-2's numbers, parameters, decoding with real GPT-2 outputs, KV cache, surprisal and perplexity. RAG: embeddings, similarity, search, chunking, IVF, the prompt, retrieval metrics, hybrid search and re-ranking | 14, 15 | slides 94–109 + notes 05, 06 |

Figures: `assets/nn-core.js` (network drawings, matrices, tensor blocks, heat maps, the step-panel driver, the tiny 2-2-1 example network, a small MLP trainer with optional L2, and `TT()` for figure labels with sub/superscripts such as `W^{[1]}` or `h_{t−1}`) and one `assets/fig-nn-<topic>.js` per topic. Extra styles for these decks live in `assets/nn.css`.

Every deck is self-contained: a "where we are" slide, worked examples with real numbers (neuron, forward pass, backprop, convolution, RNN, LSTM step, attention, perplexity), scripted demos that advance with → (`data-auto` on a widget), a vocabulary slide with a link to the theory notes, and a lab slide for every notebook.

## Lab slides

Each lab notebook of `notebooks/neural_networks` has one green lab slide, placed right after the theory it needs (Lab 7 → 8 → 9 → 10 → 12 → [demo] → 13 → 11 → 14 → 15; the lab numbers are not in course order). The two `demo - multitask …` notebooks share one orange slide (`<section class="slide lab demo">`, tag `DEMO`, two Colab buttons). `index.html` lists them all in order with direct links. To add a lab:

```html
<section class="slide lab">
  <div class="labtag">LAB 7</div>
  <h2>Title</h2>
  <div class="cols c64">
    <div class="stack" style="gap:10px"><p>One sentence.</p><ol class="todo"><li>step</li>…</ol></div>
    <div class="labcard">
      <a class="colab" href="https://colab.research.google.com/github/imagra93/ML-course-labs/blob/main/notebooks/neural_networks/NAME.ipynb" target="_blank" rel="noopener"><span class="co">CO</span> Open in Colab</a>
      <dl class="gloss"><dt>notebook</dt><dd>…</dd><dt>you need</dt><dd>…</dd><dt>runs on</dt><dd>…</dd></dl>
    </div>
  </div>
</section>
```

Other helpers in `nn.css`: `.labline` (a one-line pointer to a lab or the notes), `.idea` (a yellow key-idea box).

Step-by-step widgets: a slider `<input data-k="s">` plus panels `<div data-i="k">` inside `.panels` (in the widget or elsewhere on the same slide); the figure calls `MLNN.stepper(root, draw)`. Decks are chained with `data-prev` / `data-next` on `<body>` (N / P keys jump between topics).
Editing works exactly as described in [`../machine_learning/README.md`](../machine_learning/README.md).
