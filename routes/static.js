const { Router } = require('express');
const router = Router();

// add here pages that don't require any special routes
const match = {
    '/': 'index.pug',
    '/sort': 'other/visort.pug',
    '/sugo': 'games/sugo.pug',
    '/summertime': 'memes/summertime.pug',
    '/case': 'utils/case_converter.pug',
}

for(const [key,file] of Object.entries(match)){
    router.get(key, (req, res) => {
        res.render(file, {
            req,
            res,
        })
    })
}

module.exports = {
    route: "/",
    router: router,
}
