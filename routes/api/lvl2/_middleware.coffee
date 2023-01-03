# ADMINS HAVE ACCESS TO THIS
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
            error: "Unauthorized (requires admin / level 2)"
        }

module.exports = router
