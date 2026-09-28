const db = require("./connection");

const PREFIXE = "http://localhost:3001";

const produits = db
  .prepare("SELECT id, photo_url FROM products WHERE photo_url LIKE ?")
  .all(`${PREFIXE}%`);

const majProduit = db.prepare("UPDATE products SET photo_url = ? WHERE id = ?");
for (const produit of produits) {
  majProduit.run(produit.photo_url.replace(PREFIXE, ""), produit.id);
}

const sections = db
  .prepare("SELECT id, content FROM sections WHERE content LIKE ?")
  .all(`%${PREFIXE}%`);

const majSection = db.prepare("UPDATE sections SET content = ? WHERE id = ?");
for (const section of sections) {
  majSection.run(section.content.split(PREFIXE).join(""), section.id);
}

console.log(`Produits mis à jour : ${produits.length}`);
console.log(`Sections mises à jour : ${sections.length}`);
