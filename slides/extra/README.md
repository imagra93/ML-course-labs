# Extra topics slides

Advanced topics for students who finished the neural-network part. One HTML file per topic, built on the same engine as
[`../machine_learning`](../machine_learning) and [`../neural_networks`](../neural_networks): styles, navigation, logo and
shared figures come from [`../assets`](../assets), and the decks also load `../neural_networks/assets/nn.css` and
`nn-core.js` (cards, code blocks, lab slides, step widgets, `TT()` labels). Open `index.html` to present.

| File | Topic | Lab in the deck |
|---|---|---|
| `01_gnn.html` | Graph neural networks, in four parts. Graphs as data: applications, nodes, edges, features and the adjacency matrix, node/edge/graph tasks, why the node order must not matter (equivariance, invariance). Message passing and the GCN: neighbour sum = $\mathbf{A}\mathbf{X}$, self-loops and normalisation, the GCN layer with numbers on a 5-node toy graph, layers = hops, the computation tree, semi-supervised training (Cora), a GCN on the karate club. Variants and limits: the Laplacian and its modes, GCN as a low-pass filter, over-smoothing, GraphSAGE, GAT with numbers, transformers as GNNs on the complete graph, sum/mean/max, the WL test and what it cannot see. Tasks and practice: readout and batching, link prediction and edge leakage, gather + scatter on `edge_index`, PyTorch Geometric, a practical guide | Extra 1 |

Figures: `assets/fig-gnn.js` (one `FIG['gnn-…']` per figure) and `assets/gnn-data.js`, the karate-club data precomputed in
Python (layout, Laplacian eigenvectors, and the snapshots of a small GCN trained with two labels). The toy graph A–E and its
features are the same as in the notebook.

Every deck follows the course pattern: a "where we are" slide, worked examples with real numbers, scripted demos that
advance with → (`data-auto` on a widget), a summary, a vocabulary slide and a green lab slide for its notebook in
[`../../notebooks/extra`](../../notebooks/extra). Editing works exactly as described in
[`../machine_learning/README.md`](../machine_learning/README.md).

The class PDFs (`tools/make-handouts.mjs`) only cover `machine_learning/` and `neural_networks/`: the extra decks are web-only.
