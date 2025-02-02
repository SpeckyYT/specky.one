const { QuickDB } = require('quick.db');

const database = new QuickDB({
    filePath: "speckydb.sqlite",
    table: "global",
});

module.exports = database;
