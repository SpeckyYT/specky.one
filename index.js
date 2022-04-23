require('coffeescript');
require('dotenv').config();
const express = require('express');

const match = {
    '/': 'index.pug',
    '/summertime': 'memes/summertime.pug',
} 

const app = express();

app.set('view engine','pug');
app.use(express.static('public'));

for(const [key,file] of Object.entries(match)){
    app.get(key, (req, res) => {
        res.render(file, {
            req,
            res,
        })
    })
}

app.use('/us', require('./routes/us'))
app.use('/admin', require('./routes/admin'))
app.use('/lonely', require('./routes/lonely'))

app.all('*', (req, res) => {
    res
    .status(404)
    .render('404.pug', {
        req,
        res,
    })
})

app.listen(80)
