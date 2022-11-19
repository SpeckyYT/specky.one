const express = require('express');
const fs = require("fs");
const path = require("path");

const router = express.Router();
const anmt_folder = path.join(process.cwd(), "public", "anmt");

let lastUpdate = 0;
let files = [];

router.get("/", (req, res) => {
    if (Date.now() > lastUpdate + 60000) {
        if(!fs.existsSync(anmt_folder)) fs.mkdirSync(anmt_folder);
        files = fs.readdirSync(anmt_folder).filter(file => file.endsWith(".anmt"));
        lastUpdate = Date.now();
    }

    res.render("other/anmt.pug", {
        req, res,
        files,
    })
})

module.exports = {
    route: "/anmt",
    router: router,
}
