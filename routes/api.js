const express = require('express');
const router = express.Router();
const axios = require('axios').default;

router.all('/ip-api/:ip', async (req, res) => {
    const ip = req.params.ip;
    const info = await axios.get(`http://ip-api.com/json/${ip}`)
        .then(res => res.data)
        .catch(() => undefined);

    res.json(info);
});

module.exports = router;
