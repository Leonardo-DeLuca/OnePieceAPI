require('dotenv').config();

const allowedIp = process.env.ALLOWED_IP  // Defina o IP permitido para as rotas POST, PUT, DELETE

// Middleware para verificar o IP da requisição
const checkIp = (req, res, next) => {
  const xForwardedFor = req.headers['x-forwarded-for'] || req.ip;
  const clientIp = xForwardedFor.split(',')[0].trim();

  if (!clientIp || clientIp === allowedIp) {
      return next();  // Se o IP for permitido, prossiga com a requisição
  } else {
    return res.status(403).json({ message: `Acesso proibido: IP não autorizado ${clientIp}` });
  }
};

module.exports = checkIp;
