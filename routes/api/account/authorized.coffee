# PEOPLE LOGGED IN WITH DISCORD HAVE ACCESS TO THIS

express = require 'express'
router = express.Router()

router.use (req, res, next) =>
    return if req.session.authenticated
        next()
    else
        res.render "error.pug", { req, res, code: 401, error: "Unauthorized" }

module.exports = router
