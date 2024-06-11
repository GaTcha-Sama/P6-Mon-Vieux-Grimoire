const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { uploadImage, compressImage } = require('../middleware/multer-config');
const booksCtrl = require('../controllers/Book');

router.post('/', auth, uploadImage, compressImage, booksCtrl.createBook); // Créer livre //
router.post('/:id/rating', auth, uploadImage, compressImage, booksCtrl.ratingBook); // Noter livre //
router.put('/:id', auth, uploadImage, compressImage, booksCtrl.modifyBook); // MAJ livre //
router.delete('/:id', auth, booksCtrl.deleteBook); // Supprimer livre //
router.get('/:id', booksCtrl.getOneBook); // Obtenir un livre //
router.get('/', booksCtrl.getAllBooks); // Obtenir tous les livres //
router.get('/bestrating', booksCtrl.getBestRatings); // Obtenir les meilleurs livres //

module.exports = router;