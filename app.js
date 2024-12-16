const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const personagemRoutes = require('./routes/personagens');
const routes = require('./routes/routes');
const frutaRoutes = require('./routes/frutas');
const ilhasRoutes = require('./routes/ilhas');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express')
const fs = require('fs');
const yaml = require('yaml');
const checkIp = require('./routes/checkIp')
require('dotenv').config();

const app = express();

const swaggerDocument = yaml.parse(fs.readFileSync('./api.yaml', 'utf-8'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(bodyParser.json());
app.use(cors());
app.set('trust proxy', true);

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

  app.use((req, res, next) => {
    if (req.method === 'GET') {
      return next();
    } else {
      checkIp(req, res, next);
    }
  });

app.use('/v1/personagens', personagemRoutes);
app.use('/v1', routes);
app.use('/v1/frutas', frutaRoutes);
app.use('/v1/ilhas', ilhasRoutes);

// Inicialização do Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
