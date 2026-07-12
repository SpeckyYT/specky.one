express = require 'express'
router = express.Router()

router.get "/log", (req, res) ->
    content = await requestsLogTable.get requestsLogKey
    res.send content

module.exports = router
