const {Nuxt, Builder} = require('nuxt')
const bodyParser = require('body-parser')
const session = require('express-session')
const express = require('express')
const app = express()
const config = require('./config/env.js')
const mysql = require('mysql')
const md5 = require('MD5')
const rest = require('./rest.js')
const Promise = require('bluebird')
Promise.promisifyAll(require('mysql/lib/Connection').prototype)
Promise.promisifyAll(require('mysql/lib/Pool').prototype)

function REST() {
  const self = this
  self.connectMysql()
}

REST.prototype.connectMysql = function () {
  const self = this
  const pool = mysql.createPool({
    connectionLimit: 100,
    host: config.ENV.HOST,
    user: config.ENV.USER,
    password: config.ENV.PASSWORD,
    database: config.ENV.DATABASE,
    debug: config.ENV.DEBUG
  })
  pool.getConnectionAsync(function (err, connection) {
    if (err) {
      self.stop(err)
    } else {
      self.configureExpress(connection)
    }
  })
}

REST.prototype.configureExpress = function (connection) {
  const self = this

  // req.body へアクセスするために body-parser を使う
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(bodyParser.json())

  // req.session を作成します
  app.use(session({
    secret: 'super-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 60000}
  }))

  const router = express.Router()
  app.use('/api', router)
  const restRouter = new rest(router, connection, md5)
  // オプションとともに Nuxt.js をインスタンス化
  const isProd = process.env.NODE_ENV === 'production'
  // Nuxt の設定ファイルを require します
  const config = require('./nuxt.config.js')
  // 新たに Nuxt のインスタンスを生成します
  const nuxt = new Nuxt(config)
  // プロダクション環境ではビルドしない
  if (!isProd) {
    const builder = new Builder(nuxt)
    builder.build()
  }

  self.startServer(nuxt)
}

REST.prototype.startServer = function (nuxt) {
  app.use(nuxt.render)
  app.listen(3000)
  console.log('Server is listening on http://localhost:3000')
}

REST.prototype.stop = function (err) {
  process.exit(1)
}

new REST()