//CONST
const moment = require('moment');

const { spawnMinute, backupHour } = require('../data/config.json');

//EXPORT
module.exports = {
    adlog, neutralize, h, m, s, spawnTime, backupTime
}

//ADVANCED LOG SYSTEM
const LOG_NORMALIZER = 30;
const colors = {
    reset: "\x1b[0m",
    log: "\x1b[37m", //white
    info: "\x1b[34m", //blue
    warn: "\x1b[33m", //yellow
    error: "\x1b[31m", //red
    debug: "\x1b[35m" //magenta
};
function adlog(type, from, message) {
    const hour = moment().format('DD/MM/YYYY_HH:mm:ss');
    const msg = `${`[${hour}-${from}]:`.padEnd(LOG_NORMALIZER)} ${message}`;
    switch(type) {
        case 'log':
            console.log(colors.log + msg);
            break;
        case 'info':
            console.info(colors.info + msg);
            break;
        case 'warn':
            console.warn(colors.warn + msg);
            break;
        case 'error':
            console.error(colors.error + msg);
            break;
        case 'debug':
            console.debug(colors.debug + msg);
        default:
            console.log(colors.log + msg);
            break;
    }
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