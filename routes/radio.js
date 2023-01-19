const { Router } = require('express');
const router = Router();
const { default: axios } = require('axios');

const songLink = "https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Still+alive+(Radio+loop)&filename=mt/MTE5NDI3NjUzMTE5NDQ4_dln0fNzdWkI.mp3";
let cache = null;

router.get("/", (req, res) => {
    return res.render("other/radio.pug")
})

router.get("/song.mp3", async (req, res) => {
    if(cache) {
        return res.send(cache);
    } else {
        return axios(songLink)
        .then(v => {
            cache = Buffer.from(v.data);

            return res.send(cache)
        })
        .catch(() => {
            return renderError(req, res, 500, "Unable to load song");
        })
    }
})

module.exports = module.exports = {
    route: "/radio",
    router: router,
};
