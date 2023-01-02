const { Router } = require('express');
const router = Router();

const PIXELS = 256; // pixels * pixels is the max

const path = require('path');
const fs = require('fs');
const jimp = require('jimp');
const { MIME_JPEG } = require('jimp');

const cache = new Map();

const publicFolder = path.join(process.cwd(), "/public/");

router.get("/", async (req, res) => {

    if(!req.query.image) return res.status(400).send();
    
    const localPublic = path.join(publicFolder, req.query.image);

    if(!localPublic.startsWith(publicFolder))
        return res.status(403).send();

    if(cache.has(localPublic))
        return res.send(cache.get(localPublic));

    const saveAndSend = (buffer) => {
        cache.set(localPublic, buffer);
        return res.send(buffer);
    }

    const bufferToBuffer = (buffer) => {
        if(buffer.bitmap) return buffer.bitmap.data.data; // png
        if(Buffer.isBuffer(buffer)) return buffer; // jpg
        throw "Unable to get image buffer";
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
        const newHeight = Math.round(height * PIXELS / width);
        return [newWidth, newHeight];
    } else {
        // height is larger than width
        const newHeight = PIXELS;
        const newWidth = Math.round(width * PIXELS / height);
        return [newWidth, newHeight];
    }
}  

module.exports = {
    route: "/preview",
    router: router,
}
