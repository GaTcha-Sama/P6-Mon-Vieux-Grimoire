const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const bookRoutes = require('./routes/Book');
const userRoutes = require('./routes/User');

// Connexion à MongoDB //
mongoose.connect('mongodb+srv://GaTcha-Sama:Chateaulin-29@gatcha.wpin6p4.mongodb.net/?retryWrites=true&w=majority&appName=GaTcha',
    { useNewUrlParser: true,
      useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

// Création d'une application Express //
const app = express();

// CORS //
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Rend les données exploitables en JSON //
app.use(express.json());

// Routes de l'application //
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;