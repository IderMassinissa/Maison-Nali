const sharp = require("sharp");

const LARGEUR_MAX = 1600;
const QUALITE_JPEG = 80;
const QUALITE_WEBP = 80;

// Au-delà de cette taille décodée, on refuse (image "bombe" -- un petit
// fichier compressé qui décompresse en une image énorme, coûteuse en
// mémoire/CPU à traiter). 40 mégapixels couvre largement les vrais usages
// (un appareil photo 24 Mpx grand format inclus) sans laisser passer un
// fichier conçu pour épuiser la mémoire du serveur.
const PIXELS_MAX = 40_000_000;

const FORMAT_SHARP_PAR_TYPE = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};

class ImageTropLourdeError extends Error {}

function appliquerFormat(pipeline, format) {
  if (format === "jpeg") return pipeline.jpeg({ quality: QUALITE_JPEG, mozjpeg: true });
  if (format === "png") return pipeline.png({ compressionLevel: 9 });
  return pipeline.webp({ quality: QUALITE_WEBP });
}

// Rotation EXIF puis suppression de toutes les métadonnées (GPS inclus) :
// par défaut, sharp n'écrit aucune métadonnée en sortie sauf appel explicite
// à `withMetadata()` -- il suffit donc de ne jamais l'appeler. `.rotate()`
// sans argument applique l'orientation EXIF puis la retire (l'image rendue
// n'a plus besoin de ce tag).
async function optimiserImage(buffer, typeMime) {
  const format = FORMAT_SHARP_PAR_TYPE[typeMime];
  if (!format) {
    throw new Error(`Type d'image non supporté pour l'optimisation : ${typeMime}`);
  }

  let metadonneesAvant;
  try {
    metadonneesAvant = await sharp(buffer, { limitInputPixels: PIXELS_MAX }).metadata();
  } catch (err) {
    if (/exceeds pixel limit/i.test(err.message)) {
      throw new ImageTropLourdeError(
        "Image trop grande une fois décompressée (dépasse la limite de 40 mégapixels)",
      );
    }
    throw err;
  }

  const optimise = await appliquerFormat(
    sharp(buffer, { limitInputPixels: PIXELS_MAX })
      .rotate()
      .resize({ width: LARGEUR_MAX, withoutEnlargement: true }),
    format,
  ).toBuffer();

  // Si le résultat optimisé (redimensionné) est plus lourd que l'original
  // (arrive sur une image déjà bien compressée, ou déjà sous la largeur
  // max), on ne regresse pas sur le poids -- mais on ne sert jamais non plus
  // l'original tel quel (métadonnées/GPS). On retombe sur l'original gardé
  // à sa taille, juste nettoyé de ses métadonnées (même rotation EXIF,
  // aucun redimensionnement).
  let bufferFinal = optimise;
  if (optimise.length >= buffer.length) {
    bufferFinal = await appliquerFormat(
      sharp(buffer, { limitInputPixels: PIXELS_MAX }).rotate(),
      format,
    ).toBuffer();
  }

  const metadonneesApres = await sharp(bufferFinal).metadata();

  return {
    buffer: bufferFinal,
    largeurAvant: metadonneesAvant.width,
    hauteurAvant: metadonneesAvant.height,
    largeurApres: metadonneesApres.width,
    hauteurApres: metadonneesApres.height,
  };
}

module.exports = { optimiserImage, ImageTropLourdeError, LARGEUR_MAX, PIXELS_MAX };
