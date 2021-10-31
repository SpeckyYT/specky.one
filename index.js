const express = require('express');

const match = {
    '/': 'index.pug',
} 

const app = express();

app.set('view engine','pug');

for(const [key,file] of Object.entries(match)){
    app.get(key, (req, res) => {
        res.render(file)
    })
}

app.use(express.static('public'));

app.all('*', (req, res) => {
    res.render('404.pug')
})

app.listen(80)
