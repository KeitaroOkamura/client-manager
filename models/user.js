const mysql = require('mysql')
const Promise = require('bluebird')
Promise.promisifyAll(require('mysql/lib/Connection').prototype)
Promise.promisifyAll(require('mysql/lib/Pool').prototype)
const tableName = 'users'

module.exports = {

  login: function (req, res, connection) {
    let query = 'SELECT * FROM ?? WHERE ??=? AND ??=?'
    const table = [tableName, 'account', req.body.name, 'password', req.body.password]
    query = mysql.format(query, table)
    connection.query(query, function (err, rows) {
      if (err) throw err

      if (rows && Object.keys(rows).length) {
        const authUser = {
          name: req.body.name,
          password: req.body.password
        }
        req.session.authUser = authUser
        return res.json(authUser)
      }
      res.status(401).json({message: 'ログインに失敗しました'})
    })
  },

  logout: function (req, res) {
    delete req.session.authUser
    res.json({result: true})
  }
}
