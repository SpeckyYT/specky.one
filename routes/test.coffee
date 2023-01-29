{ Router } = require 'express'
router = Router()

router.get "/popup", (req, res) ->
    res.render "test/popup.pug",
        req: req,
        res: res,

module.exports =
    route: "/test"
    router: router
