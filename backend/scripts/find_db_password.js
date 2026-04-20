const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

const commonPasswords = [
    'password',
    'postgres',
    'admin',
    'root',
    '123456',
    'vitaliq',
    ''
];

async function tryPassword(password) {
    const connectionString = `postgres://postgres:${password}@localhost:5432/vitaliq`;
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log(`SUCCESS: Password found: "${password}"`);
        await client.end();
        process.exit(0);
    } catch (err) {
        // console.log(`Failed with "${password}": ${err.message}`);
        await client.end();
    }
}

async function find() {
    console.log('Trying common passwords...');
    for (const p of commonPasswords) {
        await tryPassword(p);
    }
    console.log('FAILURE: No common password worked.');
    process.exit(1);
}

find();
