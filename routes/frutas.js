const express = require('express');
const Fruta = require('../models/frutas');
const Personagem = require('../models/personagens')
const {CounterFrutas} = require('../models/counter');

const router = express.Router();

async function getNextId() {
  const counter = await CounterFrutas.findOneAndUpdate(
    { name: 'frutaId' }, 
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return counter.seq;
}

// Rota para criar uma nova fruta (POST)
router.post('/', async (req, res) => {
  let { nome, significado, tipo, descricao} = req.body;
  
  try {
    const countQuery = await Fruta.where({nome: nome}).countDocuments()

    if(countQuery > 0){
      return res.status(409).json({ message: 'Fruta com esse nome já existe'});
    }
    
      const novoId = await getNextId();
      const novaFruta = new Fruta({ _id: novoId, nome, significado, tipo, descricao});
      await novaFruta.save();
      res.status(201).json(novaFruta);
      
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar fruta', error: err });
  }
});

// Rota para listar todas as frutas (GET)
router.get('/', async (req, res) => {
  try {
    const frutas = await Fruta.find();
    res.status(200).json(frutas);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar frutas', error: err });
  }
});

router.get('/:param', async (req, res) => {
  const { param } = req.params;
  try {
    let fruta;

    if(!isNaN(param)){
        fruta = await Fruta.findOne({ _id: param});
    }
    else{
        fruta = await Fruta.findOne({ nome: param });
    }

    if (!fruta) {
      return res.status(404).json({ message: 'Fruta não encontrada' });
    }
    res.status(200).json(fruta);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar Fruta', error: err });
  }
});

// Rota para atualizar ua fruta (PUT)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, significado, tipo, descricao} = req.body;

  try {
    const frutaAtualizada = await Fruta.findByIdAndUpdate(
      id,
      { nome, significado, tipo, descricao},
      { new: true }
    );
    if (!frutaAtualizada) {
      return res.status(404).json({ message: 'Fruta não encontrada' });
    }
    res.status(200).json(frutaAtualizada);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar fruta', error: err });
  }
});

// Rota para excluir ua fruta (DELETE)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {

    const personagensUsandoFruta = await Personagem.find({ fruta: id });

    if (personagensUsandoFruta.length > 0) {
      // Se houver personagens usando a fruta, não podemos deletá-la
      return res.status(400).json({ message: 'Não é possível deletar a fruta, pois ela está sendo usada por personagens.' });
    }

    const frutaDeletada = await Fruta.findByIdAndDelete(id);

    if (!frutaDeletada) {
      return res.status(404).json({ message: 'Fruta não encontrado' });
    }

    const frutasSubsequentes = await Fruta.find({ _id: { $gt: id } }).sort('_id');

    for (let i = 0; i < frutasSubsequentes.length; i++) {
      const fruta = frutasSubsequentes[i];

      const novaFruta = new Fruta({
        _id: fruta._id - 1,
        nome: fruta.nome,
        significado: fruta.significado,
        descricao: fruta.descricao,
        tipo: fruta.tipo,
      });

      await novaFruta.save();

      await Fruta.findByIdAndDelete(fruta._id);
    }

    await CounterFrutas.updateOne({ name: 'frutaId' }, { $inc: { seq: -1 } });

    res.status(200).json({ message: 'Fruta deletada e IDs subsequentes atualizados' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao deletar fruta e atualizar IDs', error: err });
  }
});

module.exports = router;
