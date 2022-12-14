const { Pool } = require('pg');

const config = {
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    database: process.env.PGDATABASE || 'yelp'
};

const pool = new Pool(config);

(async () => {
    var client = await pool.connect()
    try {
        var result = await client.query('SELECT EXISTS ( SELECT * FROM pg_tables WHERE schemaname = \'public\' AND tablename  = \'restaurants\');')
        if (!result.rows[0].exists) {
            await client.query('CREATE TABLE restaurants ( id BIGSERIAL NOT NULL PRIMARY KEY, name VARCHAR(50) NOT NULL, location VARCHAR(59) NOT NULL, price_range INT NOT NULL CHECK(price_range >= 1 AND price_range <= 4) ); ')
            await client.query('CREATE TABLE reviews ( id BIGSERIAL NOT NULL PRIMARY KEY, restaurant_id BIGINT NOT NULL REFERENCES restaurants(id), name VARCHAR(50) NOT NULL, content TEXT NOT NULL, rating INT NOT NULL CHECK(rating >= 1 AND rating <= 5) );')
        }
    } finally {
        client.release()
    }
})().catch(e => {
    console.error(e.message, e.stack)
    process.exit(1)
})

module.exports = {
    query: (text, params) => pool.query(text, params)
}