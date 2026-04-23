const { Router } = require('express');
const router = Router();
const path = require('path');

// add here pages that don't require any special routes
const toRender = {
    '/': 'index.pug',
    '/sort': 'other/visort.pug',
    '/sugo': 'games/sugo.pug',
    '/case': 'utils/case_converter.pug',
    '/waifus': 'other/waifus.pug',
    '/dictionary': 'other/dictionary.pug',
}

const htmlFiles = {
    '/ngon': 'other/ngon_generator.html',
}

for(const [key,file] of Object.entries(toRender)){
    router.get(key, (req, res) => {
        res.render(file, {
            req,
            res,
        })
    })
}
for(const [key,file] of Object.entries(htmlFiles)){
    router.get(key, (req, res) => {
        res.sendFile(path.join(process.cwd(), "views", file), {
            req,
            res,
        })
    })
}

module.exports = {
    route: "/",
    router: router,
}
