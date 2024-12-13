const express = require('express');
const Personagem = require('../models/personagens');
const Fruta = require('../models/frutas');
const Ilha = require('../models/ilhas');
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

router.get('/buscar', async (req, res) => {
  const { searchTerm } = req.query;

  
  if (!searchTerm) {
    return res.status(400).json({ message: 'O termo de pesquisa é obrigatório.' });
  }
  
  try {
    let results = [];
    
    const personagens = await Personagem.aggregate([
      {
        $search: {
          index: 'personagensIndex',
          text: {
            query: searchTerm,
            path: ['nome', 'apelido', 'ocupacao', 'afiliacao'],
          },
        },
      },
      {
        $limit: 20, // Limitar o número de resultados
      },
    ]);
    
    const frutasResults = await Fruta.aggregate([
      {
        $search: {
          index: 'frutasIndex',
          text: {
            query: searchTerm,
            path: ['nome', 'tipo', 'descricao', 'significado'],
          },
        },
      },
      { $limit: 10 },
    ]);

    const ilhasResult = await Ilha.aggregate([
      {
        $search: {
          index: 'ilhasIndex',
          text: {
            query: searchTerm,
            path: ['nome', 'regiao', 'afiliada'],
          },
        },
      },
      { $limit: 10 },
    ]);

    if (personagens.length > 0) {
      results.push({ collection: 'personagens', data: personagens });
    }

    if (frutasResults.length > 0) {
      results.push({ collection: 'frutas', data: frutasResults });
    }

    if (ilhasResult.length > 0) {
      results.push({ collection: 'ilhas', data: ilhasResult });
    }
    

    if (results.length === 0) {
      return res.status(404).json({ message: 'Nenhum resultado encontrado.' });
    }

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar', error: err });
  }
});

module.exports = router;
