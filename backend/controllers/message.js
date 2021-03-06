/* Imports */

const fs = require('fs');
const models = require('../models');

/* Exports - Requête Message */

// Post Message

module.exports.createMessage = (req, res, next) => {

  models.User.findOne({ where: {id: req.params.id} }) 
    .then((user) => {
        models.Message.create({
            content: req.body.content,
            gif: req.file ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : null,
            likes: 0,
            UserId: user.id,
          })
          .then(() => res.status(200).json({ message: 'Nouveau message créer !'}))
          .catch((error) => {res.status(400).json({'error': 'Création du message échoué'});
        })
      })
    .catch((error) => {res.status(500).json({ error })
    });
};

// Get All Messages

module.exports.getAllMessages = (req, res, next) => {
    
  const fields  = req.params.fields; // Récupération dans les paramètres de l'url : fields permet de séléctionner les valeurs que l'on souhaite afficher
  const order   = req.params.order; // order : Récupération des messages par ordre particulier
  
  models.Message.findAll({
    order: [(order != null) ? order.split(':') : ['createdAt', 'DESC']],
    attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
    include: {
      model: models.User,
      attributes: ['firstName','lastName','imageProfileUrl','job']
    }
  })
  .then(function(messages) {
    if (messages) {
      res.status(200).json(messages);
    } else {
      res.status(404).json({ 'error': 'Messages non trouvé' });
    }
  })
  .catch((error) => {res.status(500).json({ error });
  })
};

// Get Message

module.exports.getUserMessage = (req, res, next) => {
  models.Message.findOne({ where: {id: req.params.id} })
  .then( (message) => {res.status(200).json(message);
  })
  .catch((error) => {res.status(404).json({ error: 'message non trouvé'});
  });
};

// Put Message

module.exports.updateMessage = (req, res, next) => {
  const messageObject = req.file ? 
  {
    ...req.body.message,
    
    gif: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  console.log(req.body);
  models.Message.findOne({ where: {id: req.params.id} }) 
    .then((message) => {
      console.log(message);
      message.update({ ...messageObject }, { where: {id: req.params.id} })
      .then(() => res.status(200).json({ message: 'Message modifié !'}))
  })

    .catch((error) => res.status(403).json({ error: 'Requête non autorisé' }));  
};

// Delete Message

module.exports.deleteMessage =  (req, res, next) => {
  
  models.Message.findOne({ where: {id: req.params.id} })
    .then(message => {  
      if (message.dataValues.gif !== null) {
        const filename = message.dataValues.gif.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => { 
        message.destroy({ where: {id: req.params.id} })
        .then(() => res.status(200).json({ message: 'Message et image message supprimé' }))
          })
      } else {
        message.destroy({ where: {id: req.params.id} })
        .then(() => res.status(200).json({ message: 'Message supprimé' }))
      }
  })
    .catch(error => res.status(403).json({ error }));
};