const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const moment = require('moment');
const { db } = require('../../data/config.json');
const adlog = require('./adlog');

async function backup() {
    try {
        const filename = `data/backups/backup_${moment.now()}.sql`;
        const cmd = `PGPASSWORD=${db.PASSWORD} pg_dump -U ${db.USERNAME} -d ${db.DATABASE} -f ${filename}`;
        
        await execAsync(cmd);
        adlog('info', 'pgsql', 'New backup');
    } catch (err) {
        adlog('error', 'pgsql', `Failed backing up DB : ${err.stack}`);
    }
}

module.exports = { backup };