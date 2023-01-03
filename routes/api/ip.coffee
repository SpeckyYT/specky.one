axios = require 'axios'
express = require 'express'
router = express.Router()

router.all '/ip-api/:ip', (req, res) =>
    ip = req.params.ip
    info = await axios.get "http://ip-api.com/json/#{ip}"
        .then (res) => res.data
        .catch () =>
            status: "fail"
            message: "unable to reach ip-api.com service"
            query: ip

    res.json(info);

module.exports = router
