# DaSilvaChristophe_7_05102021

Projet Groupomania

Création d'un réseau social interne pour les employés de la société Groupomania.

Technologies

Voici la liste des technologies utilisées pour ce projet :

Frontend
Vue.js: v3.2.20
Bootstrap: v5.1.3
Axios: v0.23.0

Backend
Node.js: v14.18.0
Express: v4.17.1
Mysql: v2.18.1
Mysql2: v2.3.0
Sequelize: v6.6.5
Sequelize-cli: v6.2.0

Installation

Base de données

Vous devez avoir MySQL installé en localhost sur le port 3306. Créez la base de données :

CREATE DATABASE groupomania;

Pour la version MySQL 8 ou supérieure, créez l'utilisateur de cette façon :

CREATE USER 'root'@'localhost'IDENTIFIED WITH mysql_native_password BY 'root';

Donnez les droits sur la base de données groupomania à l'utilisateur créé :

GRANT ALL PRIVILEGES ON groupomania.* TO 'root'@'localhost';

Rajout de 'ON DELETE' manuellement pour les FOREIGN KEY dans la base de données :

ALTER TABLE messages DROP FOREIGN KEY messages_ibfk_1;
alter table messages add constraint messages_ibfk_1 foreign key (userId) references users(id) on delete cascade;

ALTER TABLE comments DROP FOREIGN KEY comments_ibfk_1;
alter table comments add constraint comments_ibfk_1 foreign key (messageId) references messages(id) on delete cascade;

ALTER TABLE comments DROP FOREIGN KEY comments_ibfk_2;
alter table comments add constraint comments_ibfk_2 foreign key (userId) references users(id) on delete cascade;

ALTER TABLE likes DROP FOREIGN KEY likes_ibfk_1;
alter table likes add constraint likes_ibfk_1 foreign key (messageId) references messages(id) on delete cascade;

ALTER TABLE likes DROP FOREIGN KEY likes_ibfk_2;
alter table likes add constraint likes_ibfk_2 foreign key (userId) references users(id) on delete cascade;

Application

Vous devez avoir Node.js installé sur votre ordinateur.
Clonez ce dépôt GitHub. Rendez-vous dans le dossier backend et installez les modules nécessaires :

npm install

Démarrez l'API :

npm start

Pour continuer, vous devez avoir Vue CLI installé :

npm install -g @vue/cli

Depuis le dossier frontend, installez les modules nécessaires :

cd groupomania

npm install

Puis démarrez l'application :

npm run serve

Rendez-vous sur votre navigateur à l'adresse : http://localhost:8080

Pour définir un utilisateur en tant qu'administrateur

Rendez-vous dans la base de données groupomania :

USE groupomania;

Modifier la donnée admin en renseignant l'adresse email de votre inscription :

UPDATE `users` SET `admin` = 1 WHERE `email` = 'votre adresse email';