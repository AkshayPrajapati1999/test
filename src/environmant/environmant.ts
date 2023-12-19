import * as dotenv from 'dotenv';
dotenv.config();

export const env = {
    production: false,
    port: 3003,
    database: {
        type: process.env.DB_TYPE,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },
    auth: {
        user: 'sahil.vaghasiya@appunik.com',
        pass: 'nxkntvzhkeyfmjip',
    },
    companyName: 'Meditation',
    from: 'sahil.vaghasiya@appunik.com',
    session_secret_key: 'sessionSecretKey',
}