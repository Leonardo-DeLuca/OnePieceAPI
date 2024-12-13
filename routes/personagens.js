const express = require('express');
const Personagem = require('../models/personagens');
const Fruta = require('../models/frutas')
const {CounterPersonagens} = require('../models/counter');

const router = express.Router();

async function getNextId() {
  const counter = await CounterPersonagens.findOneAndUpdate(
    { name: 'personagemId' }, 
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

// Rota para criar um novo personagem (POST)
router.post('/', async (req, res) => {
  let { nome, apelido, fruta, afiliacao, origem, status, idade, ocupacao, aniversario, altura, descricao } = req.body;
  
  try {
    if(!afiliacao || afiliacao === ""){
      afiliacao = "undefined"
    }
  
    if(!origem || origem === ""){
      origem = "undefined"
    }

    if (typeof fruta === 'string') {
      const frutaExistente = await Fruta.findOne({ nome: fruta });
      if (frutaExistente) {
        fruta = frutaExistente._id;
      } else {
        return res.status(400).json({ message: 'Fruta não encontrada' });
      }
    }

    const novoId = await getNextId();

    const novoPersonagem = new Personagem({ _id: novoId, nome, apelido, fruta, afiliacao, origem, status, idade, ocupacao, aniversario, altura, descricao });
    await novoPersonagem.save();
    res.status(201).json(novoPersonagem);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar personagem', error: err });
  }
});

// Rota para listar todos os personagens (GET)
router.get('/', async (req, res) => {
  try {
    const personagens = await Personagem.find().populate('fruta');
    res.status(200).json(personagens);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar personagens', error: err });
  }
});

router.get('/:param', async (req, res) => {
  const { param } = req.params;
  try {
    let personagem;

    if(!isNaN(param)){
        personagem = await Personagem.findOne({ _id: param}).populate('fruta');
    }
    else{
        personagem = await Personagem.findOne({ apelido: param }).populate('fruta');
    }

    if (!personagem) {
      return res.status(404).json({ message: 'Personagem não encontrado' });
    }
    res.status(200).json(personagem);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar personagem', error: err });
  }
});

// Rota para atualizar um personagem (PUT)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, apelido, fruta, afiliacao, origem, status, idade, ocupacao, aniversario, altura, descricao } = req.body;

  try {
    const personagemAtualizado = await Personagem.findByIdAndUpdate(
      id,
      { nome, apelido, fruta, afiliacao, origem, status, idade, ocupacao, aniversario, altura, descricao },
      { new: true }
    );
    if (!personagemAtualizado) {
      return res.status(404).json({ message: 'Personagem não encontrado' });
    }
    res.status(200).json(personagemAtualizado);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar personagem', error: err });
  }
});

// Rota para excluir um personagem (DELETE)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const personagemDeletado = await Personagem.findByIdAndDelete(id);

    if (!personagemDeletado) {
      return res.status(404).json({ message: 'Personagem não encontrado' });
    }

    const personagensSubsequentes = await Personagem.find({ _id: { $gt: id } }).sort('_id');

    for (let i = 0; i < personagensSubsequentes.length; i++) {
      const personagem = personagensSubsequentes[i];

      const novoPersonagem = new Personagem({
        _id: personagem._id - 1,
        nome: personagem.nome,
        apelido: personagem.apelido,
        fruta: personagem.fruta,
        afiliacao: personagem.afiliacao,
        origem: personagem.origem,
        idade: personagem.idade,
        ocupacao: personagem.ocupacao,
        aniversario: personagem.aniversario,
        altura: personagem.altura,
        status: personagem.status,
        descricao: personagem.descricao
      });

      await novoPersonagem.save();

      await Personagem.findByIdAndDelete(personagem._id);
    }

    await CounterPersonagens.updateOne({ name: 'personagemId' }, { $inc: { seq: -1 } });

    res.status(200).json({ message: 'Personagem deletado e IDs subsequentes atualizados' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao deletar personagem e atualizar IDs', error: err });
  }
});

module.exports = router;
