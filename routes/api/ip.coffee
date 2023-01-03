express = require 'express'
router = express.Router()

router.all '/ip-api/:ip', (req, res) =>
    ip = req.params.ip;
    info = await axios.get "http://ip-api.com/json/#{ip}"
        .then(res => res.data)
        .catch(() => undefined);

    res.json(info);

module.exports = router
