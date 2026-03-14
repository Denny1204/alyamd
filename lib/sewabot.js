const fs = require('fs');
const path = './database/sewabot.json';
let db = JSON.parse(fs.readFileSync(path));

function save() {
    fs.writeFileSync(path, JSON.stringify(db, null, 2));
}

module.exports = {
    addGroup: function (groupId, durationMs) {
        const now = Date.now();
        const expire = now + durationMs;
        db.groups[groupId] = { expire };
        save();
        return expire;
    },

    checkExpire: function (groupId) {
        if (!db.groups[groupId]) return false;
        const { expire } = db.groups[groupId];
        if (Date.now() > expire) {
            delete db.groups[groupId];
            save();
            return true; // expired
        }
        return false; // still active
    },

    getExpire: function (groupId) {
        if (!db.groups[groupId]) return null;
        return db.groups[groupId].expire;
    },

    remove: function (groupId) {
        delete db.groups[groupId];
        save();
    },

    db
};
