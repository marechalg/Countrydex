//CONST
const moment = require('moment');

const { spawnMinute, backupHour } = require('../data/config.json');

//EXPORT
module.exports = {
    neutralize, h, m, s, spawnTime, backupTime
}

// NORMALIZATION
function neutralize(text) {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[-'''`\s]/g, '')
        .toLowerCase().trim();
}

// TIME CONVERTER
function h(n) {
    return n * 60 * 60 * 1000;
}
function m(n) {
    return n * 60 * 1000;
}
function s(n) {
    return n * 1000;
}

// DELAYs
function spawnTime() {
    const now = moment();
    const next = moment().minutes(spawnMinute).seconds(0).milliseconds(0);
    if (now.minutes() >= spawnMinute) {
        next.add(1, 'h');
    }
    return next.diff(now);
}
function backupTime() {
    const now = moment();
    const next = moment().hours(backupHour).minutes(0).seconds(0).milliseconds(0);
    if (now.hours() >= backupHour) {
        next.add(1, 'd');
    }
    return next.diff(now);
}