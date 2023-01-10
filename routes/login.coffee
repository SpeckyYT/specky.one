{ Router } = require 'express'
router = Router()

router.get "/login", (req, res) =>
    res.render "login.pug",
        req: req
        res: res

router.get "/logout", (req, res) =>
    await res.discord.logout()
    res.redirect "/"

module.exports =
    route: "/"
    router: router
