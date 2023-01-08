const { Router } = require('express');
const router = Router();

const PIXELS = 256; // pixels * pixels is the max

const path = require('path');
const fs = require('fs');
const jimp = require('jimp');
const { MIME_JPEG } = require('jimp');
const filehound = require('filehound');
const { default: axios } = require('axios');
const colors = require('colors/safe');

const log = require('../util/log.js');

const cache = new Map();

const publicFolder = path.join(process.cwd(), "/public/");

const bufferToBuffer = (buffer) => {
    if(buffer.bitmap) return buffer.bitmap.data.data; // png
    if(Buffer.isBuffer(buffer)) return buffer; // jpg
    throw "Unable to get image buffer";
}

router.get("/", async (req, res) => {
    if(!req.query.image) return res.status(400).send();

    const localPublic = path.join(publicFolder, req.query.image);
    const image = path.relative(publicFolder, localPublic);

    if(!localPublic.startsWith(publicFolder))
        return res.status(403).send();

    if(cache.has(image))
        return res.send(cache.get(image));

    const saveAndSend = (buffer) => {
        cache.set(image, buffer);
        return res.send(buffer);
    }

    if(fs.existsSync(localPublic)) {
        try {
            const image = await jimp.read(localPublic);
            const width = image.getWidth();
            const height = image.getHeight();

            if(width <= PIXELS && height <= PIXELS)
                return saveAndSend(bufferToBuffer(await image.getBufferAsync(MIME_JPEG)));

            const [ x, y ] = scaleDimensions(width, height);

            return saveAndSend(bufferToBuffer(await image.resize(x, y).getBufferAsync(MIME_JPEG)));
        } catch(err) {
            return res.status(500).send(`${err}`);
        }
    }
    return res.status(404).send();
})

function scaleDimensions(width, height) {
    const aspectRatio = width / height;
  
    if(aspectRatio == 1) {
        return [Math.min(PIXELS, width), Math.min(PIXELS, height)]
    } else if(aspectRatio > 1) {
        // width is larger than height
        const newWidth = PIXELS;
        const newHeight = Math.max(Math.round(height * PIXELS / width), 1);
        return [newWidth, newHeight];
    } else {
        // height is larger than width
        const newHeight = PIXELS;
        const newWidth = Math.max(Math.round(width * PIXELS / height), 1);
        return [newWidth, newHeight];
    }
}

(async () => {
    const images = filehound.create()
        .path(path.join(process.cwd(), "public"))
        .depth(Infinity)
        .ext(['.png', '.jpeg', '.jpg', '.gif'])
        .findSync();
    
    for(const imagePath of images) {
        await wait(1000);

        const startTime = Date.now();
        const imageURI = path.relative(path.join(process.cwd(), "public"), imagePath);
        const baseName = path.parse(imageURI).base.slice(0, 25);

        const save = (buffer) => {
            cache.set(imageURI, buffer);
        }

        try {
            if(cache.has(imageURI)) {
                log(`Image ${baseName}`, "already cached", colors.magenta, startTime);
                continue
            }

            // todo: should be turned into a function or something
            const image = await jimp.read(imagePath);
            const width = image.getWidth();
            const height = image.getHeight();

            if(width <= PIXELS && height <= PIXELS) {
                save(bufferToBuffer(await image.getBufferAsync(MIME_JPEG)));
            } else {
                const [ x, y ] = scaleDimensions(width, height);
                save(bufferToBuffer(await image.resize(x, y).getBufferAsync(MIME_JPEG)));
            }

            if(DEBUG) {
                log(`Image ${baseName}`, "cached", colors.magenta, startTime);
            }
        } catch(err) {
            if(DEBUG) {
                log(`Image ${baseName}`, `${err}`, colors.red, startTime, true);
            }
        }
    }
})();

module.exports = {
    route: "/preview",
    router: router,
}
