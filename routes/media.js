const { Router } = require('express');
const router = Router();

const { resolvePath } = require("../util/path");

const fs = require('fs/promises');
const fss = require('fs');
const path = require('path');
const multer = require('multer');
const prettyBytes = require('pretty-bytes');

const maxSize = 2**32; // 4GB seem good
const maxUserSize = 2**25; // 33MB seem good
const maxUserFiles = 30;

const mediaFolder = path.join(process.cwd(), "public", "media");

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
    res.render("other/media.pug", {
        req, res,
        maxSize, maxUserSize, maxUserFiles,
        prettyBytes,
    })
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

const adminUpload = multer({ limits: { fileSize: maxSize } });
const userUpload = multer({ limits: { fileSize: maxUserSize } });

router.post(
    "/files",
    (req, res, next) => {
        if(req.discord.isAdmin()) {
            adminUpload.single('file')(req, res, next)
        } else {
            userUpload.single('file')(req, res, next)
        }
    },
    async (req, res) => {
        try {
            const userFolder = getUserFolder(req.session?.discord?.user?.id);
            const file = req.file;

            if (!file) {
                return res.status(400).send("No file uploaded");
            }

            if (!req.discord.isAdmin()) {
                const currentFiles = await getFilesOfUser(req.session?.discord?.user?.id);
                if (currentFiles.length >= maxUserFiles) {
                    return res.status(402).send(`Exceeded ${maxUserFiles} files.`);
                }
                if (file.buffer.length > maxUserSize) {
                    return res.status(413).send("File size exceeds the limit");
                }
            }

            const filename = file.originalname;

            if (!isValidFilename(filename)) {
                return res.status(400).send("Invalid filename");
            }

            // create user folder
            if (!fss.existsSync(userFolder)) {
                await fs.mkdir(userFolder);
            }

            await fs.writeFile(resolvePath(userFolder, filename), file.buffer);

            res.send("File saved");
        } catch (err) {
            res.status(500).send(`${err}`);
        }
    }
);

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

router.delete("/:id/:file", async (req, res) => {
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

router.patch("/:id/:file", async (req, res) => {
    const id = req.params.id;
    const oldFile = req.params.file;
    const newFile = req.query.newname;

    if (id != (req.session?.discord?.user?.id || "unknown")) return res.sendStatus(403);

    if (!newFile || !isValidFilename(newFile)) return res.status(400).send("Invalid new filename");

    const userFolder = getUserFolder(req.session?.discord?.user?.id);
    const oldFilePath = resolvePath(userFolder, oldFile);
    const newFilePath = resolvePath(userFolder, newFile);

    if(!oldFilePath || !newFilePath) return res.sendStatus(400);
    if (!fss.existsSync(oldFilePath)) return res.sendStatus(404);
    if (fss.existsSync(newFilePath)) return res.sendStatus(409);

    try {
        await fs.rename(oldFilePath, newFilePath);
        res.send("File renamed");
    } catch (err) {
        res.status(500).send(`${err}`);
    }
});

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
