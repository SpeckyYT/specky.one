const filehound = require('filehound');
const colors = require('colors/safe');

const longestRoute = filehound.create()
    .path("./routes")
    .depth(Infinity)
    .findSync()
    .map(v => v.length)
    .reduce((p, c) => p > c ? p : c);

module.exports = (
    routePath = "",
    details = "",
    color = colors.green,
    startTime = Date.now(),
    error = false,
) => {
    const stream = error ? console.error : console.log;

    const array = [
        routePath.padEnd(longestRoute),
        `${Date.now() - startTime}ms`.padStart(7) // "99999ms" before overflowing
    ]

    if (details) array.push(details)

    stream(color(array.join(" | ")))
}
