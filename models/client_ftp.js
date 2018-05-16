const mysql = require('mysql')
const async = require('async')
const Promise = require('bluebird')
Promise.promisifyAll(require('mysql/lib/Connection').prototype)
Promise.promisifyAll(require('mysql/lib/Pool').prototype)
require('date-utils')
const timestamp = new Date().toFormat('YYYY-MM-DD HH24:MI:SS')
const tableName = 'client_ftp'

module.exports = {

  getByClientId: function (connection, clientId) {
    let data = {}
    let query = 'SELECT * FROM ?? WHERE ??=?'
    const table = [tableName, 'client_id', clientId]
    query = mysql.format(query, table)
    return connection.queryAsync(query)
      .then((rows) => {
        data['ftp'] = JSON.parse(JSON.stringify(rows))
        return data
      })
  },
  update: function (req, res, connection) {
    const id = req.query.id
    delete req.query.id
    delete req.query.created
    req.query['modified'] = timestamp

    let colList = []
    let params = []
    params.push(tableName)
    for (let key in req.query) {
      colList[colList.length] = key + ' = ?'
      params[params.length] = req.query[key]
    }

    let query = 'UPDATE ?? SET '
    query += colList.join(',')
    query += ' WHERE id = ?'
    params[params.length] = id

    query = mysql.format(query, params)
    return connection.queryAsync(query)
  },
  add: function (req, res, connection) {
    delete req.query.id
    req.query['created'] = timestamp

    let query = 'INSERT INTO ??('
    query += Object.keys(req.query).join(',')
    query += ') VALUES ('
    query += Object.keys(req.query).fill('?').join(',') + ')'

    let params = []
    params.push(tableName)
    for (let key in req.query) {
      params[params.length] = req.query[key]
    }

    query = mysql.format(query, params)
    return connection.queryAsync(query)
  },
  delete: function (req, res, connection) {
    let query = 'DELETE from ?? WHERE ?? = ?'
    const table = [tableName, 'id', req.query.id]
    query = mysql.format(query, table)
    return connection.queryAsync(query)
  },
  deleteByClientId: function (req, res, connection) {
    let query = 'DELETE from ?? WHERE ?? = ?'
    const table = [tableName, 'client_id', req.query.client_id]
    query = mysql.format(query, table)
    return connection.queryAsync(query)
  }
}
