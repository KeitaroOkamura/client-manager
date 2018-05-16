const mysql = require('mysql')
const async = require('async')
const Promise = require('bluebird')
Promise.promisifyAll(require('mysql/lib/Connection').prototype)
Promise.promisifyAll(require('mysql/lib/Pool').prototype)
require('date-utils')
const timestamp = new Date().toFormat('YYYY-MM-DD HH24:MI:SS')
const tableName = 'clients'

module.exports = {

  getAll: function (req, res, connection) {
    let query = 'SELECT * FROM ?? WHERE ??=? order by sort ASC'
    const table = [tableName, 'status', 0]
    query = mysql.format(query, table)
    return connection.queryAsync(query)
  },

  getByParameterId: function (req, res, connection) {
    let clientId = req.params.id
    let query = 'SELECT * FROM ?? WHERE ??=?'
    const table = [tableName, 'id', clientId]
    query = mysql.format(query, table)
    return connection.queryAsync(query)
  },

  getByQueryId: function (req, res, connection) {
    let clientId = req.query.id
    let query = 'SELECT * FROM ?? WHERE ??=?'
    const table = [tableName, 'id', clientId]
    query = mysql.format(query, table)
    return connection.queryAsync(query)
  },

  getBySearchValue: function (req, res, connection) {
    let value = req.query.value
    let query = 'SELECT * FROM ?? WHERE ??=?'
    const table = [tableName, 'status', 0]
    if (value) {
      query =　query + ' AND ?? LIKE ?'
      const searchValue = ['name', '%'+value+'%']
      Array.prototype.push.apply(table, searchValue)
    }
    query += ' order by sort ASC'
    query = mysql.format(query, table)
    return connection.queryAsync(query)
  },

  getMaxSort: function (req, res, connection) {
    let query = 'SELECT MAX(sort) as max_sort FROM ?? WHERE ??=?'
    const table = [tableName, 'status', 0]
    query = mysql.format(query, table)
    return connection.queryAsync(query)
  },

  updateSort: function (req, res, connection) {
    const id = req.query.id
    const sort = req.query.sort
    let query = 'UPDATE ?? SET ?? = ?, ?? = ? WHERE ?? = ?'
    const table = [tableName, 'sort', sort, 'modified', timestamp, 'id', id]
    query = mysql.format(query, table)
    return connection.queryAsync(query)
  },

  update: function (req, res, connection) {
    const id = req.query.id
    delete req.query.id
    delete req.query.addTagList
    delete req.query.deleteTagList
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
    delete req.query.addTagList
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
  }
}
