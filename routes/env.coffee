{ Router } = require 'express'
router = Router()
{ createPcg32, randomInt } = require 'pcg'

env_paths = [
    "/.env"
    "/.env.bak"
    "/.env.example"
    
    "/app/.env"
    "/admin/.env"
    "/backend/.env"
    
    "/.env.production"
    "/.env.old"
    "/.env.save"

    "/laravel/.env"
    "/core/.env"
    "/web/.env"
    
    "/secrets.env"
    "/sendgrid.env"
    "/.env.php"
    "/config.env"
    "/.env.env"

    "/.env.local"
    "/.env.prod"
    "/.env.staging"
]

env_func = (req, res) =>
    seed = Math.floor Date.now() / 1000 / 60 / 60 / 24
    rng_state = createPcg32({}, seed, ~seed)

    rng = ->
        max = 2**32
        [number, new_state] = randomInt(0, max, rng_state)
        rng_state = new_state
        number / max

    pick = (array) ->
        array[Math.floor rng() * array.length]
    pick_n = (array, amount) ->
        (pick array for _ in [1..amount]).join ""

    special = (amount = 1) ->
        pick_n "!'-,._%&/?°", amount
    alpha_numeric_special = (amount = 1) ->
        pick_n "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-", amount
    alpha_numeric = (amount = 1) ->
        pick_n "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", amount
    alpha = (amount = 1) ->
        pick_n "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", amount
    uppercase = (amount = 1) ->
        pick_n "ABCDEFGHIJKLMNOPQRSTUVWXYZ", amount
    lowercase = (amount = 1) ->
        pick_n "abcdefghijklmnopqrstuvwxyz", amount
    numeric = (amount = 1) ->
        pick_n "0123456789", amount
    range_inclusive = (min = 0, max = 10) ->
        [min, max] = [max, min] if min > max
        min + Math.floor rng() * (max - min + 1)

    year = -> range_inclusive 1970, 2026
    month = -> range_inclusive 1, 12
    day = -> range_inclusive 1, 31

    client_id = "1#{numeric 17}"

    env =
        # general stuff
        NODE_ENV: "development"
        APP_NAME: "MyWebsite"
        PORT: 3000
        APP_URL: "http://localhost:3000"
        DEBUG: true
        DEV_MODE: true

        # express.js
        LOG_LEVEL: "debug"
        LOG_FORMAT: "json"
        MORGAN_ENABLED: true
        SESSION_SECRET: lowercase 8
        COOKIE_SECURE: false
        COOKIE_HTTPONLY: true
        CORS_ORIGIN: "http://localhost:3000"
        CSRF_ENABLED: false
        HSTS_ENABLED: false
        CONTENT_SECURITY_POLICY: "default-src 'self';"

        # keys
        OPENAI_KEY: "sk-proj-#{alpha_numeric_special 51}"
 
        # jokes
        FEATURE_ENABLE_INFINITE_LONELY_PLACE: false
        FEATURE_ENABLE_GLOBAL_CHAT: false

        # db/auth/discord
        DATABASE_URL: "postgres://specky:#{alpha_numeric(8)}@localhost:5432/db"
        SECONDARY_DATABASE_URL: "mongodb://specky:#{alpha_numeric 10}@localhost:27017/speckyone?authSource=admin"
        JWT_SECRET: "#{uppercase()}#{lowercase 10}#{year()}#{"#{month()}".padStart 2, "0"}#{"#{day()}".padStart 2, "0"}#{special()}"
        JWT_EXPIRES_IN: "7d"
        CACHE_TTL_SECONDS: 30
        DISCORD_REDIRECT_URI: "https://discord.com/api/oauth2/authorize?client_id=#{client_id}&redirect_uri=https%3A%2F%2Fspecky.one%2Fdiscord&response_type=code&scope=identify%20guilds%20email"
        DISCORD_CLIENT_ID: client_id
        DISCORD_CLIENT_SECRET: "#{alpha_numeric_special 32}"

        # specky.one
        ADMINS: ("#{range_inclusive 2, 9}#{numeric 16}" for a in [2..Math.floor(rng() * 7)]).join ","
        CERT_KEY: "/etc/letsencrypt/live/specky.one/privkey.pem"
        CERT_CERT: "/etc/letsencrypt/live/specky.one/fullchain.pem"

    env_file = Object.entries env
        .map (entry) ->
            "#{entry[0]}=#{entry[1]}"
        .join "\n"

    res.type 'text/plain; charset=utf-8'
    res.send env_file

for path from env_paths
    router.get path, env_func

module.exports =
    route: "/"
    router: router
