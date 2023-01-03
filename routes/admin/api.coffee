express = require 'express'
router = express.Router()

router.use (req, res, next) =>
    if req.session.discord.isAdmin()
        return next()
    else
        res.render "error.pug", { req, res, code: 401, error: "Unauthorized" }

router.get "/", (req, res) =>
    res.send "Welcome to the API page! (you shouldn't be here btw)"

module.exports = router
