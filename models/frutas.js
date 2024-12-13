const mongoose = require('mongoose');

const frutasSchema = new mongoose.Schema({
    nome:{
        type: String,
        required: true,
    },
    significado:{
        type: String,
        required: true,
    },
    tipo:{
        type: String,
        required: true,
    },
    descricao:{
        type: String,
        required: true,
    },
    _id: {
        type: Number,
        required: true,
  }
}, { versionKey: false });

const Fruta = mongoose.model('Frutas', frutasSchema);

module.exports = Fruta;
