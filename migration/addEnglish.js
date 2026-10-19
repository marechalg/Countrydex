const { name, version } = require('../package.json');
const { keys } = require('../data/config.json');
const { delay, pdo, adlog } = require('../src/functions/import');
const axios = require('axios');
const fs = require('node:fs');

const countries = require('../data/countries.json');

const header = `${name}/${version} (${keys.MAIL})`;

(async () => {
    try {
        await pdo.query(fs.readFileSync('data/tables/language.sql', 'utf-8'));
        adlog('log', 'table-creation', 'Created table _language');
    } catch (err) {
        adlog('error', 'table-creation', err);
    }

    try {
        await pdo.query(`alter table countrydex._country
            add column name_fr varchar(128),
            add column name_en varchar(128),
            add column desc_fr text,
            add column desc_en text
        `);
        adlog('log', 'col-creation', 'Added columns name_fr, name_en, desc_fr, desc_en');
    } catch (err) {
        adlog('error', 'col-creation', err);
    }

    for (const country of countries) {
        try {
            const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(country.name_en)}`;

            let summary = 'No description found';
            try {
                const { data } = await axios.get(url, {
                    headers: { 'User-Agent': header, 'Api-User-Agent': header }
                });

                if (data.type !== 'disambiguation' && data.extract) {
                    summary = data.extract.length > 1024
                        ? data.extract.slice(0, 1021) + '...'
                        : data.extract;
                }
            } catch (err) {
                adlog('error', 'axios', err);
            }

            await pdo.query(
                `update countrydex._country
                 set name_fr = name, name_en = $1, desc_fr = description, desc_en = $2
                 where code = $3`,
                [country.name_en, summary, country.code]
            );

            adlog('info', 'insertion', `Migrated [${country.code}] ${country.name_en}`);
        } catch (err) {
            adlog('error', 'insertion', `[${country.code}] ${err.message}`);
        }

        await delay(250);
    }

    try {
        await pdo.query('alter table countrydex._country drop column name, drop column description');
        adlog('log', 'col-deletion', 'Deleted colmuns name and description');
    } catch (err) {
        adlog('error', 'col-deletion', err);
    }
})();