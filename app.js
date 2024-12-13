const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const personagemRoutes = require('./routes/personagens');
const routes = require('./routes/routes');
const frutaRoutes = require('./routes/frutas');
const ilhasRoutes = require('./routes/ilhas');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Conexão com o MongoDB usando Mongoose
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Conectado ao MongoDB Atlas com Mongoose');
  })
  .catch((err) => {
    console.error('Erro ao conectar ao MongoDB Atlas:', err);
  });

// Rotas
app.use('/v1/personagens', personagemRoutes);
app.use('/v1', routes);
app.use('/v1/frutas', frutaRoutes);
app.use('/v1/ilhas', ilhasRoutes);

// Inicialização do Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
