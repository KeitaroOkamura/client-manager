const mysql = require('mysql')
const async = require('async')
const Promise = require('bluebird')
Promise.promisifyAll(require('mysql/lib/Connection').prototype)
Promise.promisifyAll(require('mysql/lib/Pool').prototype)
require('date-utils')
const timestamp = new Date().toFormat('YYYY-MM-DD HH24:MI:SS')
const tableName = 'tag_terms'

module.exports = {

  getByClientId: function (req, res, connection) {
    let clientId = req.query.client_id
    let query = 'SELECT * FROM ?? WHERE ??=?'
    const table = [tableName, 'client_id', clientId]
    query = mysql.format(query, table)
    return connection.queryAsync(query)
  },
  add: function (req, res, connection, tagId) {
    const clientId = req.query.client_id
    let query = 'INSERT INTO ??(??,??,??) VALUES (?,?,?)'
    const table = [tableName, 'client_id', 'tag_id', 'created', clientId, tagId, timestamp]
    query = mysql.format(query, table)
    return connection.queryAsync(query)
  },
  delete: function (req, res, connection, tagId) {
    const clientId = req.query.client_id
    let query = 'DELETE from ?? WHERE ?? = ? AND ?? = ?'
    const table = [tableName, 'client_id', clientId, 'tag_id', tagId]
    query = mysql.format(query, table)
    return connection.queryAsync(query)
  },
  deleteByClientId: function (req, res, connection) {
    const clientId = req.query.client_id
    let query = 'DELETE from ?? WHERE ?? = ?'
    const table = [tableName, 'client_id', clientId]
    query = mysql.format(query, table)
    return connection.queryAsync(query)
  }
}
