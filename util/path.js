const path = require('path');

const resolvePath = require('resolve-path');

module.exports = {
    resolvePath: function(rootDirectory, ...relativePath) {
        try {
            const relativePathFixed = relativePath.join(path.sep).replace(/^\/+/,"");
            return resolvePath(rootDirectory, relativePathFixed);
        } catch(e) {
            return ""
        }
    }
}
