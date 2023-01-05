const { Router } = require('express');
const router = Router();
const { default: axios } = require('axios');

const cache = {}

if(!TMDB_KEY) throw "TMDB_KEY in .env missing"

router.get("/", (req, res) => {
    res.render("movie/main.pug", { req, res })
})

router.get("/:movie", async (req, res) => {
    const movieID = req.params.movie;
    if(cache[movieID]) {
        return res.json(cache[movieID]);
    }

    const linkV3 = generateMovieLink(movieID, 3);
    const linkV4 = generateMovieLink(movieID, 4);

    try {
        const outputV3 = await axios(linkV3);
        const outputV4 = await axios(linkV4);

        const output = { ...outputV3.data, ...outputV4.data }; 

        cache[movieID] = output;

        return res.json(output);
    } catch (err) {
        if(err?.response?.status == 404) {
            return res.status(404).send() 
        }
        return res.status(400).send(`${err}`)
    }
})

function generateMovieLink(movieID = 1, apiVersion = 3) {
    return `https://api.themoviedb.org/${apiVersion}/movie/${movieID}?api_key=${TMDB_KEY}`
}

module.exports = {
    route: "/movie",
    router: router,
}
