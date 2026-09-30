/* Notes pages: a top bar (notes index, slides) and previous / next links at the end of each note.
   The reading order is the list below: add a note here when it is created. Paths are relative to notes/. */
(function(){
'use strict';
const NOTES=[
  ['machine_learning/00_supervised_learning.html','00 · Supervised learning, splits and CV'],
  ['machine_learning/01_linear_regression.html','01 · Linear regression'],
  ['machine_learning/02_logistic_regression.html','02 · Logistic regression'],
  ['machine_learning/02b_generalized_linear_models.html','02b · Generalised linear models'],
  ['machine_learning/03_regularization_inputs_assumptions.html','03 · Regularisation, inputs, assumptions'],
  ['machine_learning/04_softmax_regression.html','04 · Softmax regression'],
  ['machine_learning/05_support_vector_classifier.html','05 · Support vector classifier'],
  ['machine_learning/06_decision_trees_cart.html','06 · Decision trees and CART'],
  ['machine_learning/07_bagging_random_forest_boosting.html','07 · Bagging, random forests and boosting'],
  ['neural_networks/00_neural_networks_mlp.html','NN 00 · Neural networks and the MLP'],
  ['neural_networks/01_backpropagation.html','NN 01 · Backpropagation'],
  ['neural_networks/02_training_optimization_regularization.html','NN 02 · Training: optimisation and regularisation'],
  ['neural_networks/03_cnn_transfer_multitask.html','NN 03 · CNNs, transfer and multi-task learning'],
  ['neural_networks/04_rnn_lstm.html','NN 04 · Embeddings, RNNs and LSTMs'],
  ['neural_networks/05_attention_transformers.html','NN 05 · Attention and transformers'],
  ['neural_networks/06_embeddings_rag.html','NN 06 · Embeddings, retrieval and RAG']
];
const root=document.currentScript.src.replace(/assets\/notes-nav\.js.*$/,'');   /* …/notes/ */
const here=location.href.split(/[?#]/)[0];
const i=NOTES.findIndex(([p])=>here.endsWith('/notes/'+p));
function link(href,text,cls){const a=document.createElement('a');a.href=href;a.textContent=text;if(cls)a.className=cls;return a}
const bar=document.createElement('nav');bar.className='notes-top';bar.setAttribute('aria-label','Course notes');
bar.append(link(root+'index.html','ML course notes','home'),link(root+'../slides/index.html','Slides'));
document.body.prepend(bar);
if(i<0)return;
const pager=document.createElement('nav');pager.className='notes-pager';pager.setAttribute('aria-label','Previous and next note');
if(i>0)pager.append(link(root+NOTES[i-1][0],'← '+NOTES[i-1][1],'prev'));
if(i<NOTES.length-1)pager.append(link(root+NOTES[i+1][0],NOTES[i+1][1]+' →','next'));
(document.querySelector('main')||document.body).append(pager);
})();
