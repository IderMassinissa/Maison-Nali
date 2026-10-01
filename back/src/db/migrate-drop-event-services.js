const db = require("./connection");

db.exec("DROP TABLE IF EXISTS event_services");

console.log("Table event_services supprimée.");
