/* Imports */

const bcrypt = require('bcrypt'); 
const jsonWebToken = require('jsonwebtoken');
const fs = require('fs');
const models = require('../models');

/* Regex */

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const passwordRegex = /^[a-zA-Z]\w{3,14}$/;

/* Exports - Inscription and Connexion User */

module.exports.signup = (req, res, next) => {

  const email = req.body.email;
  const password = req.body.password;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const job = req.body.job;
  const bio = req.body.bio;
  const imageProfileUrl = req.body.imageProfileUrl;
  
    if (firstName.length >= 13 && firstName.length <= 2) {
      return res.status(400).json({ 'error': 'Le prénom doit contenir entre 2 et 13 caractères' });
    }

    if (lastName.length >= 13 && lastName.length <= 2) {
      return res.status(400).json({ 'error': 'Le nom doit contenir entre 2 et 13 caractères' });
    }
    
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 'error': 'Email invalide' });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 'error': 'Le mot de passe doit commencer par une lettre, être compris entre 3 et 15 caractères et contenir uniquement des lettres et des chiffres' });
    }
  
    bcrypt.hash(password, 10) // Apel de la fonction de hachage "hash" de bcrypt et salage du mdp (10 fois)
      .then(hash => {
        const user = models.User.create({
          email: email,
          password: hash,
          firstName: firstName,
          lastName: lastName,
          job: job,
          bio: bio,
          imageProfileUrl: imageProfileUrl,
          admin: 0
        })
        return res.status(201).json({ message: 'Nouvel utilisateur créer' });
    }) 
       .catch(error => res.status(500).json({ error }));
};

module.exports.login = (req, res, next) => {
    models.User.findOne({ where: {email: req.body.email} })
      .then( user => {
        if (!user) {
          return res.status(401).json({ 'error': 'Email utilisateur non trouvé !' });
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
                { expiresIn: '3h' }
              )
            });
          })
          .catch(error => res.status(500).json({ error }));
        })
      .catch(error => res.status(500).json({ error }));
};

/* Exports - Requète User */

// Get user profile

module.exports.getAllUser = (req, res, next) => {
  models.User.findAll({attributes: ['id','firstName','lastName','job','imageProfileUrl']})
  .then((users) => {res.status(200).json(users);
  })
  .catch((error) => {res.status(400).json({error: error});
  });
};

// Get user profile

module.exports.getUserProfile = (req, res, next) => {
  models.User.findOne({ where: {id: req.params.id} })
  .then((user) => {res.status(200).json(user);
  })
  .catch((error) => {res.status(404).json({error: error});
  });
};

// Put user profile

module.exports.modifyUserProfile = (req, res, next) => {
  const userObject = req.file ? 
  {
    ...req.body.user, 
    imageProfileUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  
  models.User.findOne({ where: {id: req.params.id} }) 
    .then((user) => {
      user.update({ ...userObject }, { where: {id: req.params.id} })
      .then(() => res.status(200).json({ message: 'Profil utilisateur modifié !'}))
  })

    .catch((error) => res.status(403).json({ error: 'Requête non autorisé' }));  
};

// Delete user profile

module.exports.deleteUserProfile =  (req, res, next) => {
  
  models.User.findOne({ where: {id: req.params.id} })
    .then(user => {    
      if (user.dataValues.imageProfileUrl !== null) {
        const filename = user.dataValues.imageProfileUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => { 
        user.destroy({ where: {id: req.params.id} })
        .then(() => res.status(200).json({ message: 'Profil utilisateur supprimé' }))
          })
      } else {
        user.destroy({ where: {id: req.params.id} })
        .then(() => res.status(200).json({ message: 'Profil utilisateur supprimé' }))
      }
  })
    .catch(error => res.status(401).json({ error: 'Requête non autorisé' }));  
};


