const Book = require('../models/Book');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });  
    thing.save()
    .then(() => res.status(201).json({message: 'Livre enregistré !'}))
    .catch(error => res.status(400).json( { error }))
 };

exports.modifyBook = (req, res, next) => {
    Book.updateOne({ _id: req.params.id }, { ...req.body, id: req.params.id })
        .then(() => res.status(200).json({message: 'Livre modifié !'}))
        .catch(error => res.status(400).json({error}));
};

exports.ratingBook = (req, res, next) => {
    // a faire //
};

exports.deleteBook = (req, res, next) => {
    Book.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({message: 'Livre supprimé !'}))
        .catch(error => res.status(400).json({error}));
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({error}));
};

exports.getAllBooks = (req, res, next) => {
    Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({error}));
};

exports.getBestRatings = (req, res, next) => {
    // à faire //
};