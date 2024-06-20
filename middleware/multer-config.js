const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/svg': 'svg',
  'image/webp': 'webp'
};

const storage = multer.memoryStorage();

const upload = multer({ storage: storage }).single('image');

module.exports = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (req.file) {
      const outputPath = path.join('images', req.file.originalname.split(' ').join('_').split('.')[0] + Date.now() + '.webp');
      
      try {
        await sharp(req.file.buffer)
          .webp({ quality: 80 }) // Optimisation de la qualité de l'image WebP //
          .toFile(outputPath);

        // Mise à jour du chemin du fichier et du nom du fichier pour pointer vers le fichier WebP //
        req.file.path = outputPath;
        req.file.filename = path.basename(outputPath);
        next();
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    } else {
      next();
    }
  });
};
