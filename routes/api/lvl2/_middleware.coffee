# ADMINS HAVE ACCESS TO THIS
express = require 'express'
router = express.Router()

router.use (req, res, next) =>
    if req.discord.powerLevel() >= 2
        return next()
    else
        return renderError(
            req,
            res,
            401,
            "Requires discord login / level 2",
        )

module.exports = router
