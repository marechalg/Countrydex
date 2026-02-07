const moment = require('moment');
const { spawnMinute, backupHour } = require('../../data/config.json');

function h(n) {
    return n * 60 * 60 * 1000;
}

function m(n) {
    return n * 60 * 1000;
}

function s(n) {
    return n * 1000;
}

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

module.exports = {
    h, m, s, spawnTime, backupTime
}