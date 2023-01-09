// https://developers.themoviedb.org/3/

const { Router } = require('express');
const router = Router();
const { default: axios } = require('axios');
const colors = require('colors/safe');

const movies = require('./movie/movies.coffee');
const log = require('../util/log.js');

const movieDataCache = {}
const movieImageCache = {}

const defaultImage = "https://as1.ftcdn.net/v2/jpg/02/43/62/78/1000_F_243627831_mZP0TwkljMspNOW8zxMsSvWJhLi749ig.jpg"

if(!TMDB_KEY) throw "TMDB_KEY in .env missing"

router.get("/", async (req, res) => {
    try {
        res.render("movie/main.pug", {
            req,
            res,
            movies: (await Promise.all(
                movies.map(
                    async m => await getMovieData(m.id)
                    .catch(()=>{})
                )
            ))
            .filter(f=>f),
        })
    } catch(err) {
        renderError(req, res, 400, `${err}`);
    }
})

router.get("/:movie", async (req, res) => {
    const movieID = req.params.movie;

    try {
        const data = await getMovieData(movieID);

        return res.json(data);
    } catch(err) {
        if(Array.isArray(err)) {
            return res.status(err[0]).send(...[err[1]].filter(v => v));
        }
    }
})

router.get("/image/:image", (req, res) => res.send(originalImage(req.params.image)))

function generateMovieLink(movieID = 1, apiVersion = 3) {
    return `https://api.themoviedb.org/${apiVersion}/movie/${movieID}?api_key=${TMDB_KEY}`
}

async function getMovieData(movieID) {
    movieID = `${movieID}`;

    if(movieDataCache[movieID]) {
        if(Array.isArray(movieDataCache[movieID])) {
            throw movieDataCache[movieID];
        }
        return movieDataCache[movieID];
    }

    const linkV3 = generateMovieLink(movieID, 3);
    const linkV4 = generateMovieLink(movieID, 4);

    try {
        const outputV3 = await axios(linkV3);
        const outputV4 = await axios(linkV4);

        const output = { ...outputV3.data, ...outputV4.data }; 

        // IMAGES
        await Promise.all(
            ["backdrop_path", "poster_path"]
            .map(async i => {
                if(output[i]) {
                    output[i] = await originalImage(output[i]);
                }
            })
        );
        if(Array.isArray(output.production_companies)) {
            output.production_companies = await Promise.all(
                output.production_companies.map(async comp => {
                    const o = comp;
                    if(o.logo_path) o.logo_path = await originalImage(o.logo_path);
                    return o;
                })
            )
        }

        // APPEND SPECKY.ONE DATA
        output.speckyone = movies.find(m => `${m.id}` == movieID) || null;

        movieDataCache[movieID] = output;

        return output;
    } catch (err) {
        movieDataCache[movieID] = [err?.response?.status || 400, `${err}`];
        throw movieDataCache[movieID]
    }
}

async function originalImage(imageLink) {
    if(movieImageCache[imageLink]) return movieImageCache[imageLink];

    const link = `https://image.tmdb.org/t/p/original/${imageLink}`;

    try {
        const image = await axios(link);
        if(image.status >= 400) throw "";
        movieImageCache[imageLink] = link;
        return link;
    } catch(err) {
        movieImageCache[imageLink] = defaultImage;
        return defaultImage;
    }
}

(async function() {
    for(const movie of movies) {
        await wait(5000);
        const startTime = Date.now();
        try {
            await getMovieData(movie.id);
            if(DEBUG) {
                log(`Movie #${movie.id}`, "cached", colors.magenta, startTime);
            }
        } catch(err) {
            if(DEBUG) {
                log(`Movie #${movie.id}`, `${err}`, colors.red, startTime, true);
            }
        }
    }
})();

module.exports = {
    route: "/movie",
    router: router,
}
