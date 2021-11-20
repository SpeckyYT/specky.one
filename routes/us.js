const express = require('express');
const router = express.Router();
const sigi = require('sigidb');

const db = sigi('url_shortener.sqlite');

const DOT_REPLACER = '\uFFFF'
const DOT = '.'

const randomString = () => {
    const getChar = () => '0123456789abcdef'[Math.floor(Math.random() * 16)]

    const links = db.all().map(v => v.value.shorten);

    let current = ''

    while(!current || links.includes(current)){
        current = Array(8).fill().map(() => getChar()).join('');
    }

    return current
}

router.all('/shorten', (req, res) => {
    if(!req.query.url) return res.status(400).json({ error: 'No URL provided' })
    
    const url = req.query.url.replaceAll(DOT, DOT_REPLACER);

    if(!db.has(url)){
        const content = {
            ip: req.ip, // sorry 💀
            shorten: randomString(),
            url: url,
            date: Date.now(),
        }

        db.set(content.shorten, content)

        res.json({ error: false, url: `/us/${content.shorten}` })
    } else {
        res.json({ error: false, url: `/us/${db.get(url).shorten}` })
    }
})

router.all('*', (req, res) => {
    const url = req.url.slice(1)

    if(url){
        if(db.has(url)){
            return res.redirect(db.get(url).url.replaceAll(DOT_REPLACER, DOT))
        }else{
            return res.status(404).json({ error: 'URL not found' })
        }
    } else {
        return res.status(404).render('404')
    }
})

module.exports = router;
