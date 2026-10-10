const test = require("node:test");
const assert = require("node:assert");
const sharp = require("sharp");
const {
  optimiserImage,
  ImageTropLourdeError,
  LARGEUR_MAX,
} = require("./optimiserImage");

async function creerJpeg({ width, height, orientation, gps } = {}) {
  let image = sharp({
    create: { width, height, channels: 3, background: { r: 180, g: 90, b: 40 } },
  }).jpeg();

  if (gps) {
    image = image.withExifMerge({
      GPS: { GPSLatitude: "48/1 0/1 0/1", GPSLatitudeRef: "N" },
    });
  }
  if (orientation) {
    image = image.withMetadata({ orientation });
  }
  return image.toBuffer();
}

test("redimensionne une image plus large que 1600px, sans dépasser", async () => {
  const original = await creerJpeg({ width: 3200, height: 1600 });
  const { buffer, largeurApres, hauteurApres } = await optimiserImage(
    original,
    "image/jpeg",
  );
  assert.ok(largeurApres <= LARGEUR_MAX);
  const meta = await sharp(buffer).metadata();
  assert.strictEqual(meta.width, largeurApres);
  assert.strictEqual(meta.height, hauteurApres);
});

test("n'agrandit jamais une image déjà sous la largeur max", async () => {
  const original = await creerJpeg({ width: 400, height: 300 });
  const { largeurApres, hauteurApres } = await optimiserImage(
    original,
    "image/jpeg",
  );
  assert.strictEqual(largeurApres, 400);
  assert.strictEqual(hauteurApres, 300);
});

test("applique la rotation EXIF puis retire toutes les métadonnées (GPS inclus)", async () => {
  const original = await creerJpeg({
    width: 2000,
    height: 1000,
    orientation: 6,
    gps: true,
  });
  const avant = await sharp(original).metadata();
  assert.ok(avant.exif, "l'image de test doit porter de l'EXIF avant traitement");

  const { buffer } = await optimiserImage(original, "image/jpeg");
  const apres = await sharp(buffer).metadata();

  assert.strictEqual(apres.exif, undefined, "aucune métadonnée EXIF ne doit subsister");
  assert.strictEqual(apres.orientation, undefined);
  // orientation 6 = rotation 90° : largeur/hauteur inversées par rapport à
  // l'original une fois l'orientation appliquée puis supprimée.
  assert.strictEqual(apres.width, 1000);
  assert.strictEqual(apres.height, 2000);
});

test("refuse une image \"bombe\" dépassant la limite de pixels (400 attendu côté route)", async () => {
  const bombe = await sharp({
    create: { width: 8000, height: 6000, channels: 3, background: "red" },
  })
    .jpeg()
    .toBuffer();

  await assert.rejects(
    () => optimiserImage(bombe, "image/jpeg"),
    ImageTropLourdeError,
  );
});

test("conserve le même format de sortie que le format détecté (pas de conversion)", async () => {
  const png = await sharp({
    create: { width: 2000, height: 1000, channels: 4, background: "white" },
  })
    .png()
    .toBuffer();
  const { buffer } = await optimiserImage(png, "image/png");
  const meta = await sharp(buffer).metadata();
  assert.strictEqual(meta.format, "png");

  const webp = await sharp({
    create: { width: 2000, height: 1000, channels: 3, background: "blue" },
  })
    .webp()
    .toBuffer();
  const { buffer: bufferWebp } = await optimiserImage(webp, "image/webp");
  const metaWebp = await sharp(bufferWebp).metadata();
  assert.strictEqual(metaWebp.format, "webp");
});

test("si le résultat optimisé est plus lourd que l'original, garde l'original nettoyé de ses métadonnées", async () => {
  // Image déjà sous la largeur max et déjà bien compressée (bruit aléatoire,
  // peu compressible) : la recompression qualité 80/mozjpeg a de bonnes
  // chances de produire un fichier plus lourd que l'original déjà petit.
  const bruitAleatoire = Buffer.alloc(300 * 200 * 3);
  for (let i = 0; i < bruitAleatoire.length; i++) {
    bruitAleatoire[i] = Math.floor(Math.random() * 256);
  }
  const original = await sharp(bruitAleatoire, {
    raw: { width: 300, height: 200, channels: 3 },
  })
    .jpeg({ quality: 95 })
    .toBuffer();

  const { buffer, largeurApres, hauteurApres } = await optimiserImage(
    original,
    "image/jpeg",
  );

  // Les dimensions ne doivent jamais changer dans ce cas de repli (pas de
  // recadrage/redimensionnement, cf. consigne).
  assert.strictEqual(largeurApres, 300);
  assert.strictEqual(hauteurApres, 200);
  const meta = await sharp(buffer).metadata();
  assert.strictEqual(meta.exif, undefined);
});
