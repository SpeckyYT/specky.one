const { Router } = require('express');
const router = Router();

const links = {
    "/": "https://discord.gg/4EecFku",
    "/ladinia": "https://discord.gg/cD6QCmEsWN",
};

for(const [link, invite] of Object.entries(links)) {
    router.get(link, (req, res) => {
        res.redirect(invite);
    });
}

module.exports = {
    route: "/discord",
    router: router,
}
