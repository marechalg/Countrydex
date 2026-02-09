const { name, version } = require('../../package.json');
const { keys } = require('../../data/config.json');
const { delay, pdo, adlog } = require('../functions/import');
const axios = require('axios');
const countries = require('../../data/countries.json');

const header = `${name}/${version} (${keys.MAIL})`;

(async () => {
    for (const country of countries) {
        try {
            const url = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(country.name)}`;
            
            let summary;
            
            try {
                const response = await axios.get(url, {
                    headers: {
                        'User-Agent': header,
                        'Api-User-Agent': header
                    }
                })

                summary = response.data.extract;

                if (summary.length > 1024) {
                    summary = summary.slice(0, 1021) + '...';
                }
            } catch (err) {
                summary = 'Pas de déscription trouvée';
            }
            
            await pdo.query('insert into countrydex._country (code, name, description) values ($1, $2, $3)', [
                country.code,
                country.name,
                summary
            ])
            
            adlog('info', 'insertion', `Inserted [${country.code}] ${country.name}`);
        } catch (err) {
            adlog('error', 'insertion', err.message);
        }
        
        await delay(250);
    }
})()