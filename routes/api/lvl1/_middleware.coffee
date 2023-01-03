# PEOPLE LOGGED IN WITH DISCORD HAVE ACCESS TO THIS
express = require 'express'
router = express.Router()

router.use (req, res, next) =>
    if req.discord.powerLevel() >= 2
        return next()
    else
        return res.render "error.pug", {
            req,
            res,
            code: 401,
            error: "Unauthorized (requires discord login / level 1)"
        }

module.exports = router
