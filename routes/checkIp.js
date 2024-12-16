// middleware/checkIp.js
const allowedIp = '172.20.208.1';  // Defina o IP permitido para as rotas POST, PUT, DELETE

// Middleware para verificar o IP da requisição
const checkIp = (req, res, next) => {
  const clientIp = req.ip;  // O IP do cliente

  console.log(clientIp)

  if (clientIp === allowedIp) {
    return next();  // Se o IP for permitido, prossiga com a requisição
  } else {
    return res.status(403).json({ message: 'Acesso proibido: IP não autorizado' });
  }
};

module.exports = checkIp;
