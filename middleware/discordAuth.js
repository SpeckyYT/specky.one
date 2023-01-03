const { default: axios, AxiosError } = require('axios');

// In seconds
const REFRESH_INTERVAL = 60 * 3;

const isDisabled = !REDIRECT_URI || !CLIENT_ID || !CLIENT_SECRET;

if(isDisabled) {
    console.log('Discord oAuth disabled! Could not find env values for: REDIRECT_URI, REDIRECT_URI_CALLBACK, CLIENT_ID, or CLIENT_SECRET');
}

/** @type {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => void} */
module.exports.default  = async function (req, res, next) {
    if (req.session.discord === undefined) {
        req.session.authenticated = false;
        req.session.discord = {
            authenticated: false,
            user: null,
            tokenData: null,
            lastFetch: 0,
            scopes: []
        };
    }

    req.discord = {};

    req.discord.refreshUser = async () => {
        if (isDisabled) return;
        if (!req.session.authenticated || !req.session.discord) return;
        let ses = req.session.discord;

        if ((ses.lastFetch + (1000 * REFRESH_INTERVAL)) <= Date.now()) {
            // perform a refresh of discord data.
            req.session.discord.lastFetch = Date.now();

            try {
                const response = await axios.get('https://discord.com/api/users/@me', {
                    headers: {
                        authorization: `${ses.tokenData.type} ${ses.tokenData.token}`
                    }
                });

                req.session.discord.user = response.data;
                return response.data;
            } catch (err) {
                if (err instanceof AxiosError) {
                    const response = err.response;
                    if (response.status !== 429 && (response.status > 404 || response.status < 400)) {
                        // if there's an error, invalidate the session
                        req.session.authenticated = false;
                        req.session.discord = {
                            authenticated: false,
                            user: null,
                            token: null,
                            tokenData: null,
                            lastFetch: 0,
                            scopes: []
                        };
                    }
                }
            }
        }

        return req.session.discord.user;
    }

    req.discord.logout = async () => {
        if (isDisabled) return;
        if (!req.session.authenticated || !req.session.discord) return;

        const GRANT_PATH_URI = 'https://discord.com/api/v10/oauth2/token/revoke';
        const CREDENTIALS = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`, 'utf-8').toString('base64');
        const params = new URLSearchParams();
        params.append('token', req.session.discord.tokenData.token);
        params.append('refresh_token', req.session.discord.tokenData.refresh);
        params.append('token_type_hint', 'refresh_token');

        try {
            const options = {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + CREDENTIALS,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                data: params.toString(),
                url: GRANT_PATH_URI.toString()
            };
            const response = await axios(options);

            let success = false;

            if (response.status === 200) {
                success = true;
            }

            req.session.discord = undefined;
            req.session.authenticated = false;

            return success;
        } catch(error) {
            req.session.discord = undefined;
            req.session.authenticated = false;

            return false;
        }
    }

    req.discord.refresh = async () => {
        if (isDisabled) return;
        if (!req.session.authenticated || !req.session.discord) return;
        if (req.session.discord && req.session.discord.tokenData) {
            if (req.session.discord.tokenData.expiresAt >= (Date.now() - (60 * 60 * 1000))) {
                // discord is giving us the code.
                const GRANT_PATH_URI = 'https://discord.com/api/v10/oauth2/token';
                const params = new URLSearchParams();
                params.append('grant_type', 'refresh_token');
                params.append('refresh_token', req.session.discord.tokenData.refresh);
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

                    req.session.discord.scopes = response.data.scope.split(' ');
                    req.session.authenticated = true;

                    await req.discord.refreshUser();
                    return true;
                } catch (error) {
                    return false;
                }
            }
        }
    }

    req.discord.isAdmin = () => {
        if (isDisabled) return false;
        if (!req.session.authenticated || !req.session.discord) return false;
        if (!req.session.discord?.user?.id) return false;
        return ADMINS.split(" ").includes(req.session.discord.user.id);
    }

    req.discord.powerLevel = () => {
        if (isDisabled) return 0;
        if(req.discord.isAdmin()) return 2;
        if(req.session.authenticated) return 1;
        return 0;
    }

    if (req.session.authenticated && req.session.discord) {
        await req.discord.refreshUser();
    }

    next();
}