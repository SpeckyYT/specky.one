const express = require('express');
const router = express.Router();
const sigi = require('sigidb');

const db = sigi('url_shortener.sqlite');

const getDB = () => db.all().map(v => v.value)

const randomString = () => {
    const getChar = () => '0123456789abcdef'[Math.floor(Math.random() * 16)]
    const links = getDB().map(v => v.shorten);
    let current = ''
    while(!current || links.includes(current))
        current = Array(8).fill().map(() => getChar()).join('');
    return current
}

router.all('/', (req, res) => {
    res.render('other/us.pug', {
        req,
        res
    });
});

router.all('/shorten', (req, res) => {
    if(!req.query.url) return res.status(400).json({ error: 'No URL provided' })
    
    const url = req.query.url;

    try {
        new URL(url)
    } catch (err) {
        console.log(err)
        return res.status(400).json({ error: 'invalid URL' })
    }

    const existing = getDB().find(v => v.url == url)

    if(!existing){
        const content = {
            ip: req.ip, // sorry 💀
            shorten: randomString(),
            url: url,
            date: Date.now(),
        }

        db.set(content.shorten, content)

        res.json({ error: false, url: `/us/${content.shorten}` })
    } else {
        res.json({ error: false, url: `/us/${existing.shorten}` })
    }
})

router.all('*', (req, res) => {
    const url = req.url.slice(1)

    if(url){
        if(db.has(url)){
            return res.redirect(db.get(url).url)
        }else{
            return res.status(404).json({ error: 'URL not found' })
        }
    } else {
        return res
        .status(404)
        .render('error.pug', {
            req,
            res,
        })
    }
})

module.exports = {
    route: "/us",
    router: router,
}
