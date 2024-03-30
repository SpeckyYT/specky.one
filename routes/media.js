const { Router } = require('express');
const router = Router();
const bodyParser = require('body-parser');

const { resolvePath } = require("../util/path");

const fs = require('fs/promises');
const fss = require('fs');
const path = require('path');

const maxSize = 2**25; // 33MB seem good
const maxFiles = 30;

const mediaFolder = path.join(process.cwd(), "public", "media");
const jsonBodyParser = bodyParser.json({ limit: '100gb'});

const getUserFolder = id => resolvePath(mediaFolder, id || "unknown");
const getFilesOfUser = async id => {
    const userFolder = getUserFolder(id);
    return fss.existsSync(userFolder) ? fs.readdir(userFolder) : [];
}

// create media folder
if(!fss.existsSync(mediaFolder))
    fss.mkdirSync(mediaFolder);

// clean empty user folders
for(const userFolder of fss.readdirSync(mediaFolder).map(f => path.join(mediaFolder, f))) {
    if(fss.readdirSync(userFolder).length == 0) {
        fss.rmdirSync(userFolder);
    }
}

router.get("/", (req, res) => {
    res.render("other/media.pug", { req, res })
})

router.use("*", async (req, res, next) => {
    if(req.discord.powerLevel() > 0) {
        return next();
    } else {
        return res.sendStatus(401)
    }
})

router.get("/files", async (req, res) => {
    const content = await getFilesOfUser(req.session?.discord?.user?.id);
    return res.json(content.map(f => `${req.session?.discord?.user?.id ?? "unknown"}/${path.parse(f).base}`));
})

// body: { filename, size, content }
router.post("/files", jsonBodyParser, async (req, res) => {
    try {
        const userFolder = getUserFolder(req.session?.discord?.user?.id);

        const { filename, size, content } = req.body;

        if(!isValidFilename(filename)) {
            return res.status(400).send(`Invalid filename`);
        }

        if(!req.discord.isAdmin()) {
            if(size > maxSize) {
                return res.status(413).send("File too large");
            }

            const currentFiles = await getFilesOfUser(req.session?.discord?.user?.id);
            if(currentFiles >= maxFiles) {
                return res.status(402).send(`Exceeded ${maxFiles} files.`)
            }
        }

        // create user folder
        if(!fss.existsSync(userFolder)) {
            await fs.mkdir(userFolder);
        }

        await fs.writeFile(resolvePath(userFolder, filename), Buffer.from(content))

        res.send("File saved")
    } catch (err) {
        res.status(500).send(`${err}`);
    }
})

router.get("/files/:id", async (req, res) => {
    if (req.discord.powerLevel() >= 2) {
        if(req.params.id == "ids") {
            const content = await getFilesOfUser(".");
            return res.json(content.map(f => path.parse(f).base));
        } else if (!isNaN(parseInt(req.params.id))) {
            const content = await getFilesOfUser(req.params.id);
            return res.json(content.map(f => `${req.params.id}/${path.parse(f).base}`));
        } else {
            res.sendStatus(400);
        }
    }
    return res.sendStatus(401);
})

router.get("/:id/:file", (req, res) => {
    const id = req.params.id;
    const file = req.params.file;

    const filePath = resolvePath(mediaFolder, id, file);

    if(filePath && fss.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.sendStatus(404)
    }
})

router.delete("/:id/:file", jsonBodyParser, async (req, res) => {
    const id = req.params.id;
    const file = req.params.file;

    if(id != (req.session?.discord?.user?.id || "unknown")) return res.sendStatus(403)

    const userFolder = getUserFolder(req.session?.discord?.user?.id);

    const filePath = resolvePath(userFolder, file);

    if(!filePath || !fss.existsSync(filePath))
        return res.sendStatus(404)

    try {
        await fs.rm(filePath)
        res.send("File deleted")
    } catch (err) {
        res.sendStatus(500)
    }

    // delete user folder if empty
    if((await fs.readdir(userFolder)).length == 0) {
        await fs.rmdir(userFolder);
    }
})

// https://stackoverflow.com/a/11101624
function isValidFilename(filename) {
    const rg1 = /^[^\\/:\*\?"<>\|]+$/; // forbidden characters \ / : * ? " < > |
    const rg2 = /^\./; // cannot start with dot (.)
    const rg3 = /^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names
    const rg4 = /^[a-zA-Z0-9-_.]+$/g;
    return rg1.test(filename) && !rg2.test(filename) && !rg3.test(filename) && rg4.test(filename);
}

module.exports = {
    route: "/media",
    router: router,
}
