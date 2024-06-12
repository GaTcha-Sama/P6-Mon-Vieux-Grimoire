const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    imageUrl: { type: String, required: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true },
    ratings: [{ userId: String, grade: Number }],
    averageRating: { type: Number, required: true },
});

 // Méthode d'instance pour calculer la moyenne des notes //
bookSchema.methods.calculateAverageRating = () => {
    if (this.ratings.length > 0) {                                                          // Si des notes existent //
        const totalNotes = this.ratings.reduce((total, rating) => total + rating.grade, 0); // totalNotes stocke les notes, reduce calcule la somme des notes //
        this.averageRating = totalNotes / this.ratings.length;                              // Calcul de la moyenne des notes //
    } else {
        this.averageRating = 0; // Si pas de notes //
    }
    return this.averageRating; // Moyenne calculée des notes //
};

// Middleware "pre('save')" pour mettre à jour la moyenne avant de sauvegarder //
bookSchema.pre('save', (next) => {
    this.calculateAverageRating();
    next();
}); 

module.exports = mongoose.model('Book', bookSchema);