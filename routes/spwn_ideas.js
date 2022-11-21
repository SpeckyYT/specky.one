const { Router } = require('express');
const fs = require("fs");
const path = require("path");

const router = Router();
const ideas_folder = path.join(process.cwd(), "views", "other", "spwn_ideas");

let lastUpdate = 0;
let files = [];

function updateFiles() {
    if (Date.now() > lastUpdate + 60000) {
        if(!fs.existsSync(ideas_folder)) fs.mkdirSync(ideas_folder);
        files = fs.readdirSync(ideas_folder)
            .filter(file => file.endsWith(".pug"))
            .sort()
            .map(file => path.parse(file));
        lastUpdate = Date.now();
    }
}

router.get('/', async (req, res) => {
    updateFiles()
    res.render('other/spwn_ideas.pug', {
        req,
        res,
        files,
    })
})

router.get("/:page", async (req, res) => {
    updateFiles()

    if(files.map(file => file.base).includes(req.params.page)) {
        res.render(`other/spwn_ideas/${req.params.page}`, {
            req,
            res,
            files,
        })
    } else {
        res.render(`other/spwn_ideas/${files[0].base}`, {
            req,
            res,
            files,
        })
    }
})

module.exports = {
    route: "/spwnideas",
    router: router,
}
