{ Router } = require 'express'
router = Router()

router.get "/", (req, res) =>
    res.render "login.pug",
        req: req
        res: res

module.exports =
    route: "/login"
    router: router
