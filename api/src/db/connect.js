const mysql = require("mysql2");

const pool = mysql.createPool({
    connectionLimit:10,
    host:"192.168.8.172",
    user:"alunods",
    password:"senai@604",
    database:"reservas"
});

module.exports = pool;