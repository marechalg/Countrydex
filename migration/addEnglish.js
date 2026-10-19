const { name, version } = require('../package.json');
const { keys } = require('../data/config.json');
const { delay, pdo, adlog } = require('../src/functions/import');
const axios = require('axios');

const countries = require('../data/countries.json');

const header = `${name}/${version} (${keys.MAIL})`;

(async () => {
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

        try {
            await pdo.query('alter table countrydex._country drop column name, drop column description');
        } catch (err) {
            adlog('error', 'deletion', err);
        }

        await delay(250);
    }
})();