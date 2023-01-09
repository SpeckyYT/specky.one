const { getReasonPhrase } = require('http-status-codes');

global.wait = ms => new Promise(res => setTimeout(res, ms));

global.renderError = (req, res, code = 400, extraInfo = "", depth = 0) => {
    try {
        res
        .status(code)
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
