const mysql = require('mysql')
const async = require('async')
const Promise = require('bluebird')
Promise.promisifyAll(require('mysql/lib/Connection').prototype)
Promise.promisifyAll(require('mysql/lib/Pool').prototype)
require('date-utils')
const timestamp = new Date().toFormat('YYYY-MM-DD HH24:MI:SS')
const tableName = 'tags'

module.exports = {

  getAll: function (req, res, connection) {
    let tagQuery = 'SELECT * FROM ??'
    const tagTable = ['tags']
    tagQuery = mysql.format(tagQuery, tagTable)
    return connection.queryAsync(tagQuery)
  },
  getById: function (connection, id) {
    let query = 'SELECT * FROM ?? WHERE ??=?'
    const table = [tableName, 'id', id]
    query = mysql.format(query, table)
    return connection.queryAsync(query)
      .then((rows) => {
        return rows[0]
      }).catch(function (err) {
        return err
      })
  },
  update: function (req, res, connection) {
    let query = 'UPDATE ?? SET ?? = ?, ?? = ?, ?? = ? WHERE ?? = ?'
    const table = [tableName, 'name', req.query.name, 'color', req.query.color, 'modified', timestamp, 'id', req.query.id]
    query = mysql.format(query, table)
    return connection.queryAsync(query)
  },
  add: function (req, res, connection) {
    let query = 'INSERT INTO ??(??,??,??) VALUES (?,?,?)'
    const table = [tableName, 'name', 'color', 'created', req.query.name, req.query.color, timestamp]
    query = mysql.format(query, table)
    return connection.queryAsync(query)
  },
  delete: function (req, res, connection) {
    let query = 'DELETE from ?? WHERE ?? = ?'
    const table = [tableName, 'id', req.query.id]
    query = mysql.format(query, table)
    return connection.queryAsync(query)
  }
}
