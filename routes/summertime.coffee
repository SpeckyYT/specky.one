{ Router } = require 'express'
router = Router()

summertimes =
    '/':
        file: '/videos/summertime.mp4'
        title: "Summertime"
        hacked_title: "You got summertime'd!"
        description: "Kasumi dancing with amogus"
        image: "https://i.ytimg.com/vi/xIUKVAtW1Fc/maxresdefault.jpg"
        color: "#FF00AA"
        start: 2.100
        bpm: 132
    '/peashooter':
        file: '/videos/peashooter.mp4'
        title: "Peashooter"
        hacked_title: "You've been peashot"
        description: "Look at the peashooter shoot"
        image: "https://i.ytimg.com/vi/SosnT928970/hq2.jpg"
        color: "#A2D72A"
        start: 3.015
        bpm: 132

for summertime from Object.entries summertimes
    do ->
        [key, data] = summertime
        if not data.file
            throw "Summertime '#{key}' does not contain video file path"
        for [k, d] from (Object.entries Object.values(summertimes)[0])
            data[k] ?= d

        router.get key, (req, res) =>
            res.render "memes/summertime.pug", {
                req
                res
                key
                ...data
            }

module.exports =
    route: "/summertime"
    router: router

