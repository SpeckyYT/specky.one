global.devModeSettings = {
    powerLevel: 0,
    isAdmin: false,
    user: {
        id: "334361254435225602",
        username: "Specky",
        // TODO: check everything that is available
    },
    labels: [],
}

module.exports = async (req, res, next) => {
    if(DEV_MODE) {
        req.discord.isAdmin = () => devModeSettings.isAdmin || devModeSettings.powerLevel >= 2;
        req.discord.powerLevel = () => devModeSettings.powerLevel;

        req.session.discord.user = devModeSettings.user;
    }

    return next();
}
