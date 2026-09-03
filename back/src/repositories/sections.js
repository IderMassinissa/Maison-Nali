const db = require("../db/connection");

function getSectionsByPageId(pageId) {
  return db
    .prepare("SELECT * FROM sections WHERE page_id = ? ORDER BY position")
    .all(pageId);
}

function updateSectionContent(id, content) {
  return db
    .prepare("UPDATE sections SET content = ? WHERE id = ?")
    .run(content, id);
}

function updateSectionPosition(id, position) {
  return db
    .prepare("UPDATE sections SET position = ? WHERE id = ?")
    .run(position, id);
}

function getSectionById(id) {
  return db.prepare("SELECT * FROM sections WHERE id = ?").get(id);
}

function createSection(pageId, type) {
  const maxPosition = db
    .prepare("SELECT MAX(position) as max FROM sections WHERE page_id = ?")
    .get(pageId);
  const nouvellePosition = (maxPosition.max || 0) + 1;
  const stmt = db.prepare(
    "INSERT INTO sections (type, position, content, page_id) VALUES (?, ?, ?, ?)",
  );
  return stmt.run(type, nouvellePosition, "{}", pageId);
}

function deleteSection(id) {
  return db.prepare("DELETE FROM sections WHERE id = ?").run(id);
}

module.exports = {
  getSectionsByPageId,
  getSectionById,
  updateSectionContent,
  updateSectionPosition,
  createSection,
  deleteSection,
};
