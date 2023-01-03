# ALL USERS HAVE ACCESS TO THIS

express = require 'express'
router = express.Router()

router.get "/", (req, res) =>
    res.send("Welcome to the APIs!")

module.exports = router
