const Book = require('../models/Book');
const fs = require('fs');

// Création d'un livre //
exports.createBook = (req, res, next) => {
    let bookObject;
    
    try {
        bookObject = JSON.parse(req.body.book);
    } catch (error) {
        if (req.file) {
            fs.unlink(`images/${req.file.filename}`, () => {});
        }
        return res.status(400).json({ message: 'Invalid JSON data in request body' });
    }

    delete bookObject._id;
    delete bookObject._userId;

    if (!req.file || !req.file.filename) {
        return res.status(400).json({ message: 'Image file is missing' });
    }

    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    book.save()
        .then(() => { res.status(201).json({ message: 'Livre enregistré !' }); })
        .catch(error => { 
            if (req.file) {
                fs.unlink(`images/${req.file.filename}`, () => {});
            }
            res.status(400).json({ error }); 
        });
};

// Modification d'un livre //
exports.modifyBook = (req, res, next) => {
    let updateBook;
    
    try {
        updateBook = req.file ? {
            ...JSON.parse(req.body.book),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` 
        } : { ...req.body };

        delete updateBook._userId; 
    } catch (error) {
        if (req.file) {
            fs.unlink(`images/${req.file.filename}`, (err) => {
                if (err) console.error(err);
            });
        }
        return res.status(400).json({ error: 'Format invalide' });
    }
    
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if(book.userId != req.auth.userId) {
                res.status(403).json({message: 'Non-autorisé !'})
            } else {
                // Suppression ancienne image - respect du green code //
                if (req.file) {
                    const oldImageUrl = book.imageUrl;
                    const oldImageName = oldImageUrl.split('/images/')[1];
                    fs.unlink(`images/${oldImageName}`, (err) => {
                        if (err) console.error('Error deleting old image:', err);
                    });
                }

                Book.updateOne({_id: req.params.id}, {...updateBook, _id: req.params.id})
                    .then(() => res.status(200).json({message: 'Livre modifié !'}))
                    .catch(error => res.status(401).json({error}));
            }
        })
        .catch(error => res.status(400).json({error}))
};

// Suppression d'un livre //
exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(book => {
            if(book.userId != req.auth.userId) { // Vérification si l'user est bien le même que l'auth //
                res.status(403).json({message: 'Non-autorisé !'})
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => { // fs.unlink est l'action qui supprime le fichier et envoit un callback pour supprimer dans la database //
                    Book.deleteOne({_id: req.params.id})
                        .then(() => res.status(200).json({message: 'Livre Supprimé !'}))
                        .catch(error => res.status(401).json({error}));
                });
            }
        })
        .catch(error => res.status(500).json({error}));
};

// Récupération d'un livre //
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({error}));
};

// Récupération de tous les livres //
exports.getAllBooks = (req, res, next) => {
    Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({error}));
};

// Notation d'un livre //
exports.ratingBook = (req, res, next) => {
    const updatedRating = {
        userId: req.auth.userId,
        grade: req.body.rating
    };
    // Vérification des notes //
    if (updatedRating.grade < 0 || updatedRating.grade > 5) {
        return res.status(400).json({ message: 'La note doit se trouver entre 0 et 5' });
    }
    Book.findOne({ _id: req.params.id }) // Récupération du livre voulu //
        .then((book) => {
            if (book.ratings.find(r => r.userId === req.auth.userId)) { // Vérification si l'user n'a pas déjà mis une note //
                return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
            } else {
                book.ratings.push(updatedRating); // On pousse la notation dans un tableau //
                book.averageRating = (book.averageRating * (book.ratings.length - 1) + updatedRating.grade) / book.ratings.length; // Classe la note dans le tableau //
                return book.save(); // Sauvegarde //
            }
        })
        .then((updatedBook) => res.status(201).json(updatedBook))
        .catch(error => res.status(400).json({ error }));
};

// Récupération des 3 meilleures notations //
exports.getBestRatings = (req, res, next) => {
    Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

