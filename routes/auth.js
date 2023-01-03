const { Router } = require('express');
const router = Router();

router.get('/', async (req, res) => {
    if (req.session.authenticated) {
        return res.render('error.pug', { req, code: 400, title: "Already Authorizied", error: "Already authenticated with discord!" });
    }
    if (req.query.code) {
        // discord is giving us the code.
        const GRANT_PATH_URI = 'https://discord.com/api/v10/oauth2/token';
        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('code', req.query.code);
        params.append('redirect_uri', REDIRECT_URI_CALLBACK);
        params.append('client_id', CLIENT_ID);
        params.append('client_secret', CLIENT_SECRET);

        try {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                data: params.toString(),
                url: GRANT_PATH_URI.toString()
            };
            const response = await axios(options);

            req.session.discord.tokenData = {
                token: response.data.access_token,
                type: response.data.token_type,
                refresh: response.data.refresh_token,
                expiresAt: Date.now() + (response.data.expires_in || 0)
            };

            req.session.authenticated = true;
            await req.discord.refreshUser();
            return res.redirect('/admin');
        } catch (error) {
            let msg =
                error.response ?
                    (error.response.data && error.response.data.error_description)
                        ? error.response.data.error_description
                        : error.response.data?.error || "Unknown Error"
                    : "Unknown Error";
            return res.render('error.pug', { req, error: msg });
        }
    } else {
        // we don't have any valid authorization
        if (!req.session.authenticated || req.session.discord.tokenData.expiresAt < Date.now()) {
            // we redirect to discord.
            return res.render('admin/login.pug', { req, res });
            // return res.redirect(REDIRECT_URI);
        }
    }
    return res.send("🤨 what the fuck happened")
})

router.get('/logout', async (req, res) => {
    if (req.session.authenticated && req.session.discord) {
        await req.discord.logout();
        return res.redirect('/');
    } else {
        return res.redirect('/');
    }
})

module.exports = {
    route: "/auth",
    router: router,
}
