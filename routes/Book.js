const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware//multer-config');
const booksCtrl = require('../controllers/Book');

router.get('/bestrating', booksCtrl.getBestRatings); // Obtenir les meilleurs livres //
router.post('/', auth, multer, booksCtrl.createBook); // Créer livre //
router.post('/:id/rating', auth, booksCtrl.ratingBook); // Noter livre //
router.put('/:id', auth, multer, booksCtrl.modifyBook); // MAJ livre //
router.delete('/:id', auth, booksCtrl.deleteBook); // Supprimer livre //
router.get('/:id', booksCtrl.getOneBook); // Obtenir un livre //
router.get('/', booksCtrl.getAllBooks); // Obtenir tous les livres //


module.exports = router;