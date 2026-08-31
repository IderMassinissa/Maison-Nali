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

module.exports = {
  getSectionsByPageId,
  getSectionById,
  updateSectionContent,
  updateSectionPosition,
};
