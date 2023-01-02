const { Router } = require('express');
const router = Router();

router.get("/", (req, res) => res.redirect("https://github.com/SpeckyYT/"));

router.get("/:repo", (req, res) => res.redirect(`https://github.com/SpeckyYT/${req.params.repo}`));

module.exports = {
    route: "/github",
    router: router,
}
