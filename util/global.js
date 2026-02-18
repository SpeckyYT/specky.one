const { getReasonPhrase } = require('http-status-codes');
const ws = require('ws');
const https = require('https');

global.wait = ms => new Promise(res => setTimeout(res, ms));

global.renderError = (req, res, code = 400, extraInfo = "", depth = 0) => {
    try {
        return res
        .status(depth >= 0 ? (code < 200 ? 200 : code) : 200)
        .render(
            'error.pug',
            {
                req,
                res,
                code,
                title: getReasonPhrase(code).toUpperCase(),
                error: `${getReasonPhrase(code)} ${extraInfo ? `- ${extraInfo}` : ""}`.trim(),
            }
        )
    } catch(err) {
        if(depth > 5) {
            res
            .status(508) // loop detected
            .send(`${err}`)
        } else {
            return global.renderError(req, res, 500, `${err}`, depth + 1)
        }
    }
}

global.createWebsocketServer = (port) => {
    if(DEV_MODE) {
        return new ws.Server({
            port,
        });
    } else {
        const httpsServer = https.createServer(httpsCertificates).listen(port);
        return new ws.Server({
            server: httpsServer,
        });
    }
}
