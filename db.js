const mysql = require('mysql');
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'agencydb'
});

function executeQuery(query) {
    return new Promise((resolve, reject) => {
        pool.query(query, function(error, results, fields) {
            if (error) reject(err.message);
            resolve(results);
        })
    })
}

module.exports = { executeQuery };