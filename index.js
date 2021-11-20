require('dotenv').config()
const express = require('express');

const match = {
    '/': 'index.pug',
} 

const app = express();

app.set('view engine','pug');
app.use(express.static('public'));

for(const [key,file] of Object.entries(match)){
    app.get(key, (req, res) => {
        res.render(file)
    })
}

app.use('/us', require('./routes/us'))
app.use('/admin', require('./routes/admin'))

app.all('*', (req, res) => {
    res.status(404).render('404.pug')
})

app.listen(80)
