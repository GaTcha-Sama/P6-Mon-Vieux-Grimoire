const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

// Check le mot de passe //
exports.signup = (req, res, next) => {
    const password = req.body.password;
    
    // Vérification de la longueur du mot de passe
    if (password.length < 5) {
        return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 5 caractères.' });
    }
    
    // Vérification des caractères spécifiques
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/; // C'est un regex donc écriture normale pour vérifier les caractères //
    if (!password.match(passwordRegex)) {
        return res.status(400).json({ error: 'Le mot de passe doit contenir au moins une majuscule, un chiffre et un caractère spécial.' });
    }

    bcrypt.hash(password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};


// Check l'identifiant de l'utilisateur //
  exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };