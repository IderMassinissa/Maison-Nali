/**
 * Force NODE_ENV=test avant que le moindre autre module ne se charge.
 * Chargé via `node --require ./src/db/testEnv.js` (package.json, script
 * `test`) pour garantir que connection.js choisit data/test.sqlite dès le
 * premier `require`, même si la variable n'est pas positionnée dans
 * l'environnement d'exécution.
 */
process.env.NODE_ENV = "test";
