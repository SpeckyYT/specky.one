express = require 'express'
fs = require 'fs'
path = require 'path'

{ all_art } =require('./gallery/art.coffee')

gallery_folder = path.join process.cwd(), "public", "gallery"
lastUpdate = 0
filtered_art = []

router = express.Router()

router.get "/", (req, res) =>
    if Date.now() > lastUpdate
        if not fs.existsSync gallery_folder
            fs.mkdirSync gallery_folder
        files = fs.readdirSync(gallery_folder)
        filtered_art = all_art.filter (art) => files.includes(art.filename)

        lastUpdate = Date.now()
    
    res.render "other/gallery.pug",
        req: req,
        res: res,
        arts: filtered_art,

module.exports =
    route: "/gallery"
    router: router
