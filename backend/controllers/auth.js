/* Imports */

const jsonWebToken = require('jsonwebtoken');

/* Exports */

module.exports = (req, res, next) => {
    try {
      const token = req.headers.authorization.split(' ')[1]; 
      const decodedToken = jsonWebToken.verify(token, 'TOKEN_RANDOM'); 
      const userId = decodedToken.userId;
      if (req.body.userId && req.body.userId !== userId) {
        throw 'Utilisateur non autorisé !';
      } else {
        next();
      }
    } catch {
      res.status(401).json({ error: 'Utilisateur non authentifié !'});
    }
};