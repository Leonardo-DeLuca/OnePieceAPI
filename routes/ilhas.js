const express = require('express');
const Ilha = require('../models/ilhas');
const {CounterIlhas} = require('../models/counter');

const router = express.Router();

async function getNextId() {
  const counter = await CounterIlhas.findOneAndUpdate(
    { name: 'ilhaId' }, 
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return counter.seq;
}

// Rota para criar uma nova ilha (POST)
router.post('/', async (req, res) => {
  let { nome, populacao, regiao, descricao, afiliada} = req.body;
  
  try {
    const countQuery = await Ilha.where({nome: nome}).countDocuments()

    if(countQuery > 0){
      return res.status(409).json({ message: 'Ilha com esse nome já existe'});
    }
    
      const novoId = await getNextId();
      const novaIlha = new Ilha({ _id: novoId, nome, populacao, regiao, descricao, afiliada});
      await novaIlha.save();
      res.status(201).json(novaIlha);
      
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar ilha', error: err });
  }
});

// Rota para listar todas as ilhas (GET)
router.get('/', async (req, res) => {
  try {
    const ilhas = await Ilha.find();
    res.status(200).json(ilhas);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar ilhas', error: err });
  }
});

router.get('/:param', async (req, res) => {
  const { param } = req.params;
  try {
    let ilha;

    if(!isNaN(param)){
        ilha = await Ilha.findOne({ _id: param});
    }
    else{
        ilha = await Ilha.findOne({ nome: param });
    }

    if (!ilha) {
      return res.status(404).json({ message: 'Ilha não encontrada' });
    }
    res.status(200).json(ilha);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar Ilha', error: err });
  }
});

// Rota para atualizar ua ilha (PUT)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, populacao, regiao, descricao, afiliada} = req.body;

  try {
    const ilhaAtualizada = await Ilha.findByIdAndUpdate(
      id,
      { nome, populacao, regiao, descricao, afiliada},
      { new: true }
    );
    if (!ilhaAtualizada) {
      return res.status(404).json({ message: 'Ilha não encontrada' });
    }
    res.status(200).json(ilhaAtualizada);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar ilha', error: err });
  }
});

// Rota para excluir ua ilha (DELETE)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {

    const ilhaDeletada = await Ilha.findByIdAndDelete(id);

    if (!ilhaDeletada) {
      return res.status(404).json({ message: 'Ilha não encontrada' });
    }

    const ilhasSubsequentes = await Ilha.find({ _id: { $gt: id } }).sort('_id');

    for (let i = 0; i < ilhasSubsequentes.length; i++) {
      const ilha = ilhasSubsequentes[i];

      const novaIlha = new Ilha({
        _id: ilha._id - 1,
        nome: ilha.nome,
        afiliada: ilha.afiliada,
        descricao: ilha.descricao,
        populacao: ilha.populacao,
        regiao: ilha.regiao
      });

      await novaIlha.save();

      await Ilha.findByIdAndDelete(ilha._id);
    }

    await CounterIlhas.updateOne({ name: 'ilhaId' }, { $inc: { seq: -1 } });

    res.status(200).json({ message: 'Ilha deletada e IDs subsequentes atualizados' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao deletar ilha e atualizar IDs', error: err });
  }
});

module.exports = router;
