const express = require('express');
const router = express.Router();
const session = require('express-session');

router.use(sessionMiddleware)

router.post('/discord', async (req, res) => {
    
})

module.exports = {
    route: "/auth",
    router: router,
}
