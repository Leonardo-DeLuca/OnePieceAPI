const mongoose = require('mongoose');

const personagemSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
  },
  apelido: {
    type: String,
    required: true
  },
  fruta: {
    type: mongoose.SchemaTypes.Number,
    ref: 'Frutas',
  },
  afiliacao: {
    type: [String],
  },
  origem: {
    type: String,
  },
  status: {
    type: String,
  },
  idade:{
    type: [String],
  },
  ocupacao:{
    type: [String],
  },
  aniversario:{
    type: String,
  },
  altura:{
    type: [String],
  },
  _id: {
    type: Number,
    required: true,
  }
}, { versionKey: false });

const Personagem = mongoose.model('Personagens', personagemSchema);

module.exports = Personagem;
