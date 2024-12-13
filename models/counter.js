const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const CounterPersonagens = mongoose.model('CounterPersonagens', counterSchema);
const CounterFrutas = mongoose.model('CounterFrutas', counterSchema);

module.exports = {CounterPersonagens, CounterFrutas} ;
