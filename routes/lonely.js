const { Router } = require('express');
const router = Router();
const ws = require('ws');
const cron = require('node-cron');
const sigi = require('sigidb');

const db = sigi('lonely.sqlite');

// Lonely Place informations
const grid = db.get('grid') || [];
const WIDTH = 32;
const HEIGHT = 32;
const ALLOWED_COLORS = [
    '#ffffff',
    '#7f7f7f',
    '#000000',
    '#ff0000',
    '#ff7f00',
    '#ffff00',
    '#7fff00',
    '#00ff00',
    '#00ff7f',
    '#00ffff',
    '#007fff',
    '#0000ff',
    '#7f00ff',
    '#ff00ff',
    '#ff007f',
]

for (let w = 0; w < WIDTH; w++) {
    grid[w] = grid[w] || [];
    for (let h = 0; h < HEIGHT; h++) {
        grid[w][h] = grid[w][h] || ALLOWED_COLORS[0];
    }
}

// Server for Lonely Place
const PORT = 1505;

const server = new ws.Server({
    path: '/lonely/ws',
    port: PORT,
});

const listeners = {};
const timeout = {};
const stats = {
    activity: 0,
};

function giveTimeout() {
    if (stats.activity <= 20) {
        return 5;
    } if (stats.activity <= 50) {
        return 10;
    } else if (stats.activity <= 100) {
        return 20;
    } else if (stats.activity <= 200) {
        return 30;
    } else if (stats.activity <= 500) {
        return 60;
    } else if (stats.activity <= 1000) {
        return 120;
    } else {
        return 180;
    }
}

function increaseActivity() {
    stats.activity++;
    setTimeout(() => stats.activity--, 5*60*1000);
}

function updateListeners(data, /* ignore */) {
    for (const id in listeners) {
        listeners[id].send(JSON.stringify(data));
    }
}

server.on('connection', async (sock, req) => {
    let id = `${req.socket.remoteAddress}`;

    function sendJSON(content) {
        sock.send(JSON.stringify(content));
    }
    
    sendJSON({
        grid: grid,
        colors: ALLOWED_COLORS,
    })

    sock.on('message', (data) => {
        if(timeout[id] > Date.now()) {
            return sendJSON({
                timeout: timeout[id],
            })
        }

        try {
            const {
                x,
                y,
                color,
            } = JSON.parse(data.toString("utf-8"));
            
            if (grid[x] && grid[x][y] && ALLOWED_COLORS.includes(color.toLowerCase())) {
                if(grid[x][y] != color){
                    grid[x][y] = color;
                    increaseActivity();
                    timeout[id] = Date.now() + giveTimeout() * 1000;
                    sendJSON({
                        success: true,
                        reason: null,
                        timeout: timeout[id],
                    })
                    updateListeners({
                        x: x,
                        y: y,
                        color: color,
                    }, id)
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
    db.set('grid', grid)
})

router.get('/', async (req, res) => {
    res.render('games/lonely.pug', {
        req,
        res,
        port: PORT,
        width: WIDTH,
        height: HEIGHT,
    })
})

module.exports = router;
