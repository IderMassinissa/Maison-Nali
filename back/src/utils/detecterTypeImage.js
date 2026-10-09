// Détecte le type réel d'une image à partir de ses premiers octets
// ("magic bytes" / signature de fichier), indépendamment de ce que le
// client a déclaré (nom de fichier, en-tête Content-Type) -- ces deux
// informations sont entièrement contrôlées par celui qui envoie la
// requête, donc falsifiables (un fichier HTML peut être envoyé avec un nom
// en .jpg et un Content-Type "image/jpeg"). Les vraies images, elles,
// commencent toujours par une signature fixe propre à leur format.
function detecterTypeImage(buffer) {
  if (!buffer || buffer.length < 12) return null;

  // JPEG : les 3 premiers octets sont toujours FF D8 FF.
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG : signature fixe sur 8 octets.
  const SIGNATURE_PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (SIGNATURE_PNG.every((octet, i) => buffer[i] === octet)) {
    return "image/png";
  }

  // WebP : conteneur RIFF ("RIFF" aux octets 0-3) contenant la chaîne
  // "WEBP" aux octets 8-11.
  const estRiff = buffer.toString("ascii", 0, 4) === "RIFF";
  const estWebp = buffer.toString("ascii", 8, 12) === "WEBP";
  if (estRiff && estWebp) {
    return "image/webp";
  }

  return null;
}

// Extension à utiliser pour chaque type détecté -- jamais l'extension
// fournie par le client, voir upload.js.
const EXTENSION_PAR_TYPE = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

module.exports = { detecterTypeImage, EXTENSION_PAR_TYPE };
