/*
// this is probably just a dream
const express = require('express');
const router = express.Router();
const { default: axios, AxiosError } = require('axios');

router.all('/proxy/*', async (req, res) => {
    const url = req.path.replace(/\/?proxy\//, "");

    if(!url) return res.status(400).send("Specky Proxy Error: No link provided");

    function setHeaders(headers) {
        for(const header in headers) {
            res.setHeader(header, headers[header])
        }
    }

    return axios(url, {
        method: req.method,
        responseType: req.headers["content-type"],
        // headers: req.headers, // "Error: unable to verify the first certificate" 💀
    })
    .then(v => {
        if (DEBUG) console.log(v);

        setHeaders(v.headers);
        return res.status(v.status).header(v.headers).send(v.data)
    })
    .catch(v => {
        if (DEBUG) console.log(v);

        if(v instanceof AxiosError) {
            if(v.response) {
                setHeaders(v.response.headers);

                return res
                .status(v.response.status)
                .type(v.response.headers["content-type"])
                .send(v.response.data);
            } else {
                return res.status(400).send(`Specky Proxy Error: ${v}`);
            }
        } else {
            return res.status(400).send(`Specky Proxy Error: ${v}`);
        }
    });
})

module.exports = router
*/