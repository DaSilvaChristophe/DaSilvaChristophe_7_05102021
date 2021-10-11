/* Imports */

const bcrypt = require('bcrypt'); 
const jsonWebToken = require('jsonwebtoken');
const models = require('../models');

/* Regex */

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const passwordRegex = /^[a-zA-Z]\w{3,14}$/;

/* Exports */

module.exports.signup = (req, res, next) => {
    
    const email = req.body.email;
    const password = req.body.password;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
  
    if (firstName.length >= 13 && firstName.length <= 2) {
      return res.status(400).json({ 'error': 'Votre prénom doit contenir entre 2 et 13 caractères' });
    }

    if (lastName.length >= 13 && lastName.length <= 2) {
      return res.status(400).json({ 'error': 'Votre nom doit contenir entre 2 et 13 caractères' });
    }
    
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 'error': 'email est invalide' });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 'error': 'Votre mot de passe doit commencer par une lettre, être compris entre 3 et 15 caractères et contenir uniquement des lettres et des chiffres' });
    }
  
    bcrypt.hash(password, 10) // Apel de la fonction de hachage "hash" de bcrypt et salage du mdp (10 fois)
      .then(hash => {
        const user = models.User.create({
          email: email,
          password: hash,
          firstName: firstName,
          lastName: lastName,
          admin: 0
        })
        return res.status(201).json({ message:'Nouvel utilisateur créer'});
    }) 
       .catch(error => res.status(500).json({ error }));
};

module.exports.login = (req, res, next) => {
    models.User.findOne({ where: {email: req.body.email} })
      .then( user => {
        if (!user) {
          return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }
        bcrypt.compare(req.body.password, user.password)
          .then(valid => {
            if (!valid) {
              return res.status(401).json({ error: 'Mot de passe incorrect !' });
            }
            res.status(200).json({
              userId: user.id,
              token: jsonWebToken.sign (
                { userId: user.id } ,
                'TOKEN_RANDOM', // Token aléatoire en développement uniquement, pour la production mettre une chaine de caractéres pour éviter la resignature extérieur et des attaques sur les données     
                { expiresIn: '1h' }
              )
            });
          })
          .catch(error => res.status(500).json({ error }));
        })
      .catch(error => res.status(500).json({ error }));
};