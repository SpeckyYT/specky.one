# PEOPLE LOGGED IN WITH DISCORD HAVE ACCESS TO THIS
express = require 'express'
router = express.Router()

router.use (req, res, next) =>
    if req.discord.powerLevel() >= 1
        return next()
    else
        return renderError(
            req,
            res,
            401,
            "Requires discord login / level 1",
        )

module.exports = router
