# ALL USERS HAVE ACCESS TO THIS

express = require 'express'
router = express.Router()

router.get "/mypower", (req, res) =>
    res.json req.discord.powerLevel()

module.exports = router
