express = require 'express'
router = express.Router()

# main API page
router.get '/', (req, res) =>
    res.render "api.pug", { req, res }

module.exports = router
