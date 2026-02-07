const { db } = require('../../data/config.json');
const { Pool } = require('pg');

const pdo = new Pool({
    host: db.HOST,
    port: db.PORT,
    database: db.DATABASE,
    user: db.USERNAME,
    password: db.PASSWORD
})

module.exports = pdo;