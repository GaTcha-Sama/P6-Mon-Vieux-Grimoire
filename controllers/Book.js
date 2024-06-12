const Book = require('../models/Book');
const fs = require('fs');

// Création d'un livre //
exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book); // Form-data en JSON //
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({  // Création du nouveau livre //
        ...bookObject,
        userId: req.auth.userId,
        ratings: [],
        averageRating: 0,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` // Récupération de l'URL //
    });  
    book.save()  // Sauvegarde du nouveau livre //
    .then(() => res.status(201).json({message: 'Livre enregistré !'}))
    .catch(error => res.status(400).json( { error }));
 };

// Modification d'un livre //
exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` 
    } : { ...req.body };

    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if(book.userId != req.auth.userId) {
                res.status(401).json({message: 'Non-autorisé !'})
            } else {
                Book.updateOne({_id: req.params.id}, {...bookObject, _id: req.params.id})
                    .then(() => res.status(200).json({message: 'Objet modifié !'}))
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
                res.status(401).json({message: 'Non-autorisé !'})
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => { // fs.unlink est l'action qui supprime le fichier et envoit un callback pour supprimer dans la database //
                    Book.deleteOne({_id: req.params.id})
                        .then(() => res.status(200).json({message: 'Objet Supprimé !'}))
                        .catch(error => res.status(401).json({error}));
                });
            }
        })
        .catch(error => res.status(500).json({error}));
};

// Récupération d'un livre //
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => res.status(200).json(book))
        .catch(error => res.status(404).json({error}));
};

// Récupération de tous les livres //
exports.getAllBooks = (req, res, next) => {
    Book.find()
    .then((books) => res.status(200).json(books))
    .catch(error => res.status(400).json({error}));
};

// Notation d'un livre //
exports.ratingBook = (req, res, next) => {
    const updatedRating = {
        userId: req.auth.userId,
        grade: req.body.rating
    };
    // Vérifiaction des notes //
    if (updatedRating.grade < 0 || updatedRating.grade > 5) {
        return res.status(400).json({ message: 'La note doit se trouver entre 0 et 5' });
    }
    Book.findOne({ _id: req.params.id }) // Récupération du livre voulu //
        .then((book) => {
            if (book.ratings.find(r => r.userId === req.auth.userId)) { // Vérifiaction si l'user n'a pas déjà mis une note //
                return res.status(400).json({ message: 'User already voted for this book' });
            } else {
                book.ratings.push(updatedRating); // On pousse la notation dans un tableau //
                book.averageRating = (book.averageRating * (book.ratings.length - 1) + updatedRating.grade) / book.ratings.length; // Classe la note dans le tableau //
                return book.save(); // Sauvegarde //
            }
        })
        .then((updatedBook) => res.status(201).json(updatedBook))
        .catch(error => res.status(400).json({ error }));
};

// Récupération des meilleurs notations //
exports.getBestRatings = (req, res, next) => {
    Book.find()
        .sort({ averageRating: -1 }) // Classe les notes par ordre décroissant //
        .limit(3)                    // Récupère les 3 meilleures notes //
        .then((books) => {res.status(200).json(books);})
        .catch((error) => {res.status(500).json({message:"Une erreur est survenue lors de la récupération des livres avec la meilleure note.", 
                                                error: error,});
        });
};

