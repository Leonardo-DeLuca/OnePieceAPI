const express = require('express');
const Personagem = require('../models/personagens')
const { default: mongoose } = require('mongoose');

const router = express.Router();

// Rota para listar todos os personagens (GET)
router.get('/', async (req, res) => {
    try {
      // Obter todas as coleções do banco de dados
      const collections = await mongoose.connection.db.listCollections().toArray();
  
      // Array para armazenar os dados de todas as coleções
      let allData = [];
  
      // Para cada coleção, buscamos os dados
      for (const collection of collections) {
        let data;
        if (collection.name !== 'counterpersonagens' && collection.name !== 'counterfrutas') {
          data = await mongoose.connection.db.collection(collection.name).find().toArray();
          
          if (collection.name === 'personagens') {
            data = await Promise.all(data.map(async (personagem) => {
              // Usamos populate para preencher o campo fruta
              const populatedPersonagem = await Personagem.populate(personagem, { path: 'fruta' });
              return populatedPersonagem;
            }));
          } 
          
        allData.push({
          collection: collection.name,
          data: data
        });
        }
      }
  
      // Se não houver dados, retorna uma mensagem
      if (allData.length === 0) {
        return res.status(404).json({ message: 'Nenhum dado encontrado nas coleções' });
      }
  
      // Retorna os dados de todas as coleções
      res.status(200).json(allData);
    } catch (err) {
      res.status(500).json({ message: 'Erro ao buscar dados de todas as coleções', error: err });
    }
  });

module.exports = router;
