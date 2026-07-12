# ALL USERS HAVE ACCESS TO THIS

express = require 'express'
axios = require 'axios'
router = express.Router()

userDataCache = {}
router.get "/discord/user/:userid", (req, res) ->
    userId = req.params.userid
    now = Date.now()

    cachedUser = userDataCache[userId]
    if cachedUser?.cache_expiry > now
        return res.json {
            cache_expiry: Math.ceil((cachedUser.cache_expiry - now) / 1000),
            cached: true,
            data: cachedUser.data,
        }

    url = "https://discord-arts.asure.dev/v1/user/#{userId}"

    try
        response = await axios.get url
        status = response.status
        if status < 200 or status >= 300
            return res.status(status).json
                cache_expiry: now
                cached: false
                error: response.data
        json = response.data

        userDataCache[userId] =
            cache_expiry: now + (json.cache_expiry or 0) * 1000
            cached: json.cached
            data: json.data

        res.json json
    catch err
        msg = err.response?.data or err.message or String(err)
        res.json
            cache_expiry: now
            cached: false
            error: msg

module.exports = router
