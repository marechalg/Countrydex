//CONST
const moment = require('moment');

//EXPORT
module.exports = {
    adlog, neutralize, h, m, s
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

function neutralize(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function h(n) {
    return n * 60 * 60 * 1000;
}
function m(n) {
    return n * 60 * 1000;
}
function s(n) {
    return n * 1000;
}