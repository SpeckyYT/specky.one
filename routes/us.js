/*
const express = require('express');
const router = express.Router();

const db = database.table("url_shortener");

const getDB = async () => (await db.all()).map(v => v.value)
const getChar = () => '0123456789abcdef'[Math.floor(Math.random() * 16)];

const randomString = async () => {
    const links = (await getDB()).map(v => v.shorten);
    let current = Array(6).fill().map(() => getChar()).join('');

    while(!current || links.includes(current)) {
        await wait(0);
        current += getChar();
    }

    return current
}

router.all('/', (req, res) => {
    res.render('other/us.pug', {
        req,
        res
    });
});

router.all('/shorten', async (req, res) => {
    if(!req.query.url) return res.status(400).json({ error: 'No URL provided' })
    
    const url = req.query.url;

    try {
        new URL(url)
    } catch (err) {
        console.log(err)
        return res.status(400).json({ error: 'invalid URL' })
    }

    const existing = (await getDB()).find(v => v.url == url)

    if(!existing){
        const content = {
            ip: req.ip, // sorry 💀
            shorten: await randomString(),
            url: url,
            date: Date.now(),
        }

        await db.set(content.shorten, content)

        res.json({ error: false, url: `/us/${content.shorten}` })
    } else {
        res.json({ error: false, url: `/us/${existing.shorten}` })
    }
})

router.all('*', async (req, res) => {
    const url = req.url.slice(1)

    if(url){
        if(await db.has(url)){
            return res.redirect((await db.get(url)).url)
        }else{
            return res.status(404).json({ error: 'URL not found' })
        }
    } else {
        return renderError(req, res, 404)
    }
})

module.exports = {
    route: "/us",
    router: router,
}
*/
