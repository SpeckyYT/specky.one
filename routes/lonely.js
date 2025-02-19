const { Router } = require('express');
const router = Router();

const ws = require('ws');
const cron = require('node-cron');
const https = require('https');

// Literally copy and pasted from r/place 🤣🤣🤣🤣
const ALLOWED_COLORS = [
    '#ffffff',
    '#e4e4e4',
    '#888888',
    '#222222',
    '#a06a42',
    '#e50000',
    '#e59500',
    '#e5d900',
    '#94e044',
    '#02be01',
    '#00d3dd',
    '#0083c7',
    '#0000ea',
    '#820080',
    '#cf6ee4',
    '#ffa7d1',
]

// Lonely Place informations
const lonelyDB = database.table("lonely");
let grid = lonelyDB.get("grid").catch(()=>[]);

setImmediate(async () => {
    grid = await grid || [];
    for (let w = 0; w < WIDTH; w++) {
        grid[w] = grid[w] || [];
        for (let h = 0; h < HEIGHT; h++) {
            grid[w][h] = grid[w][h] || ALLOWED_COLORS[0];
        }
    }
    let history = await lonelyDB.get("history");
    if(!Array.isArray(history)) lonelyDB.set("history", []);
});

// if you are reading this, resulution won't be set to something bigger than 64
// since the front-end canvas doesn't implement a zoom feature to zoom in in a pretty way
//
// If you want to upgrade the resolution, you should implement a zoom feature to the front-end
const WIDTH = 64;
const HEIGHT = 64;

// Server for Lonely Place
const PORT = 1505;

let server;
if(DEV_MODE) {
    server = new ws.Server({
        port: PORT,
    });
} else {
    const httpsServer = https.createServer(httpsCertificates).listen(PORT);
    server = new ws.Server({
        server: httpsServer,
    });
}

const listeners = {};
const timeout = {};
const stats = {
    activity: 0,
    connections: 0,
};

function giveTimeout() {
    if (stats.activity <= 60) {
        return 5;
    } if (stats.activity <= 120) {
        return 10;
    } else if (stats.activity <= 180) {
        return 20;
    } else if (stats.activity <= 240) {
        return 30;
    } else if (stats.activity <= 300) {
        return 60;
    } else if (stats.activity <= 360) {
        return 120;
    } else {
        return 180;
    }
}

function increaseActivity() {
    stats.activity++;
    setTimeout(() => stats.activity--, 5*60*1000);
}

function updateListeners(data) {
    for (const id in listeners) {
        listeners[id].send(JSON.stringify(data));
    }
}

const updateGridDB = () => {
    lonelyDB.set('grid', grid)
};

server.on('connection', async (sock, req) => {
    await new Promise(res => sessionMiddleware(req, {}, res));
    await new Promise(res => discordAuth(req, {}, res));

    if(grid instanceof Promise) return sock.terminate();

    let ip = `${req.socket.remoteAddress}`;
    let id = `${stats.connections} ${req.socket.remoteAddress}`;
    stats.connections++;

    function sendJSON(content) {
        sock.send(JSON.stringify(content));
    }
    
    sendJSON({
        grid: grid,
        colors: ALLOWED_COLORS,
    })

    sock.on('message', (data) => {
        if(timeout[ip] > Date.now()) {
            return sendJSON({
                timeout: timeout[ip],
            })
        }

        try {
            const {
                x,
                y,
                color,
            } = JSON.parse(data.toString("utf-8"));
            
            if (
                grid[x]
                && x < grid.length
                && grid[x][y]
                && y < grid[x].length
                && ALLOWED_COLORS.includes(color.toLowerCase())
            ) {
                if(grid[x][y] != color){
                    grid[x][y] = color;
                    increaseActivity();
                    let timeNow = Date.now();
                    const powerLevel = req.discord.powerLevel();
                    if(powerLevel == 1) {
                        timeout[ip] = timeNow + giveTimeout() * 1000;
                    } else if(powerLevel == 2) {
                        timeout[ip] = timeNow + 2000;
                    } else {
                        timeout[ip] = timeNow + 3 * giveTimeout() * 1000;
                    }
                    updateGridDB();
                    lonelyDB.push("history", [x, y, timeNow, color]);
                    sendJSON({
                        x: x,
                        y: y,
                        color: color,
                        success: true,
                        reason: null,
                        timeout: timeout[ip],
                    })
                    updateListeners({
                        x: x,
                        y: y,
                        color: color,
                    })
                } else {
                    sendJSON({
                        success: false,
                        reason: 'Color is already set',
                    })
                }
            } else {
                sendJSON({
                    success: false,
                    reason: 'Invalid color or input',
                })
            }
        } catch (err) {
            console.error(err)
            sendJSON({
                success: false,
                reason: 'Invalid input',
            })
        }
    })
    sock.on('close', (code) => {
        delete listeners[id];
    })

    listeners[id] = sock;
})

cron.schedule("0 * * * * *", (date) => {
    // once per minute will save the grid
    updateGridDB();
})

router.get('/', async (req, res, next) => {
    if(grid instanceof Promise) {
        next() // 404 if grid not loaded
    } else {
        res.render('games/lonely.pug', {
            req,
            res,
            port: PORT,
            width: WIDTH,
            height: HEIGHT,
            DEV_MODE: DEV_MODE,
        })
    }
})

module.exports = {
    route: "/lonely",
    router: router,
}
