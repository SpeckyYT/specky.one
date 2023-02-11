const { Router } = require('express');
const router = Router();

const bodyParser = require('body-parser');
const jsonBodyParser = bodyParser.json({
    limit: "10kB",
    strict: false,
});

if(DEV_MODE) {
    router.get("/", (req, res) => {
        res.render("dev.pug", {
            req,
            res,
            devModeSettings,
        });
    })

    router.post("/", jsonBodyParser, (req, res) => {
        const {
            powerLevel,
            isAdmin,
            labels,
            user,
        } = req.body;

        if(typeof powerLevel == "number") {
            devModeSettings.powerLevel = powerLevel
        }
        if(typeof isAdmin == "boolean") {
            devModeSettings.isAdmin = true
        }
        if(user && typeof user == "object") {
            devModeSettings.user = {
                ...devModeSettings.user,
                ...user,
            }
        }
        if(Array.isArray(labels)) {
            devModeSettings.labels = labels
        }

        res.send()
    })
}

module.exports = {
    route: "/dev",
    router: router,
}
