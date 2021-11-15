const express = require('express');
const router = express.Router();
const { exec } = require('child_process');

const run = (command) => {
    const child = exec(command);
    return new Promise((res,rej) => {
        child.on('close', (code) => code ? rej(code) : res(code))
    })
}

router.use((req, res, next) => {
    // idk how to make a login page
    res.json({ authorized: false }) // 😂🤣😂🤣
})

router.all('/update', async (req, res) => {
    try {
        await run('git reset --hard')
        await run('git fetch --all')
        await run('git pull origin')
        await run('npm i')
        res.json({ success: true });
    }catch(err){
        res.json({ success: false, error: `${err}` });
    }
})

module.exports = router;
