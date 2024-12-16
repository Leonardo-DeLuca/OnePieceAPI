require('dotenv').config();

const authenticateApiKey = (req, res, next) => {
    const apiKey = req.header('x-api-key');
    const validApiKey = process.env.API_KEY;
  
    if (!apiKey) {
      return res.status(403).json({ message: 'Acesso proibido: API Key não fornecida' });
    }
  
    if (apiKey !== validApiKey) {
      return res.status(403).json({ message: 'Acesso proibido: API Key inválida' });
    }
  
    return next(); // Se a API Key for válida, prossegue para o próximo middleware
  };
  
  module.exports = authenticateApiKey;
  