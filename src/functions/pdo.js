const { db } = require('../../data/config.json');
const { Pool } = require('pg');
const adlog = require('../functions/adlog');

const pdo = new Pool({
    host: db.HOST,
    port: db.PORT,
    database: db.DATABASE,
    user: db.USERNAME,
    password: db.PASSWORD,
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pdo.on('error', (err) => adlog('error', 'pgsql', err));
pdo.on('connect', () => adlog('log', 'pgsql', 'Connected to database'));

module.exports = pdo;