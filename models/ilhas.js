const mongoose = require('mongoose');

const ilhasSchema = new mongoose.Schema({
    nome:{
        type: String,
        required: true,
    },
    regiao:{
        type: String,
        required: true,
    },
    descricao:{
        type: String,
        required: true,
    },
    afiliada:{
        type: [String],
    },
    populacao:{
        type: String,
    },
    _id: {
        type: Number,
        required: true,
  }
}, { versionKey: false });

const Ilha = mongoose.model('Ilhas', ilhasSchema);

module.exports = Ilha;
