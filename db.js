/** Database config for database. */

const { Client } = require('pg');
const dotenv = require('dotenv');
const { DB_URI } = require('./config');
dotenv.config();

const { USER, HOST, PASSWORD, PORT } = process.env;

let db = new Client({
	user: USER,
	host: HOST,
	database: DB_URI,
	password: PASSWORD,
	port: PORT,
});

db.connect();

module.exports = db;
