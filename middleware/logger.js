// logger-quickdb.js
const db = database.table("log");
const key = "requests";

global.requestsLogTable = db
global.requestsLogKey = key

/**
 * createRequestLogger options
 * @param {Object} options
 * @param {number} options.maxEntries - max number of entries to keep (oldest removed) (default: 10000)
 * @param {boolean} options.storeQuery - whether to store req.query (default: true)
 */
function createRequestLogger(options = {}) {
    const {
        maxEntries = 10000,
        storeQuery = true,
    } = options;

    // Helper to trim array to maxEntries
    async function trimIfNeeded() {
        try {
            const len = await db.get(key)?.legnth || 0;
            if (typeof len === 'number' && len > maxEntries) {
                // remove oldest entries: read, slice, set
                const all = await db.get(key) || [];
                const trimmed = all.slice(-maxEntries);
                await db.set(key, trimmed);
            }
        } catch (err) {
            // swallow DB errors to avoid breaking requests
            console.error('Request logger trim error:', err);
        }
    }

    return function requestLogger(req, res, next) {
        const start = process.hrtime.bigint();
        const ip = (req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress || '').toString().split(',')[0].trim();
        const discord_id = req?.discord?.user?.id;
        const method = req.method;
        const path = req.originalUrl || req.url;
        const userAgent = req.get('User-Agent') || null;
        const query = storeQuery && Object.keys(req.query || {}).length ? req.query : null;

        res.on('finish', async () => {
            try {
                const end = process.hrtime.bigint();
                const durationMs = Number((end - start) / 1000000n);
                const status = res.statusCode || 0;
                const contentLengthHeader = res.getHeader('content-length');
                const contentLength = contentLengthHeader ? parseInt(contentLengthHeader, 10) : null;

                const entry = {
                    timestamp: new Date().toISOString(),
                    ip,
                    discord_id,
                    method,
                    path,
                    query,
                    status,
                    response_time_ms: durationMs,
                    user_agent: userAgent,
                    content_length: contentLength,
                };

                // push entry into array stored at key
                await db.push(key, entry);

                // trim if necessary (non-blocking)
                trimIfNeeded();
            } catch (err) {
                console.error('Request logger DB error:', err);
            }
        });

        next();
    };
}

module.exports = createRequestLogger;
