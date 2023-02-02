{ Router } = require 'express'
router = Router()

router.get "/popup", (req, res) ->
    res.render "test/popup.pug",
        req: req,
        res: res,

router.get "/error", (req, res) ->
    res.render "test/error.pug",
        req: req,
        res: res,

router.get "/error/:code/", (req, res) ->
    renderError(req, res, req.params.code, "", -1);
router.get "/error/:code/:info", (req, res) ->
    renderError(req, res, req.params.code, req.params.info, -1);

module.exports =
    route: "/test"
    router: router
