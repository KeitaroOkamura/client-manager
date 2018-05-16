const mysql = require('mysql')
const request = require('request')
const crypto = require('crypto')
const async = require('async')
const Promise = require('bluebird')
Promise.promisifyAll(require('mysql/lib/Connection').prototype)
Promise.promisifyAll(require('mysql/lib/Pool').prototype)

const user = require('./models/user.js')
const client = require('./models/client.js')
const clientSystem = require('./models/client_system.js')
const clientFtp = require('./models/client_ftp.js')
const clientServer = require('./models/client_server.js')
const clientDatabase = require('./models/client_database.js')
const clientAccess = require('./models/client_access.js')
const clientAnalytics = require('./models/client_analytics.js')
const tag = require('./models/tag.js')
const tagTerm = require('./models/tag_term.js')

module.exports = function (router, connection, md5) {
  //====================================
  //
  //             auth
  //
  //====================================
  router.post('/login', function (req, res) {
    user.login(req, res, connection)
  })

  router.post('/logout', function (req, res) {
    user.logout(req, res)
  })

  //====================================
  //
  //             index
  //
  //====================================
  router.get('/list', function (req, res) {
    client.getAll(req, res, connection)
      .then((rows) => {
        let clients = []
        async.forEachOf(rows, function (row, key, callback) {
          const clientId = row.id
          clients[key] = row
          const promises = [
            clientSystem.getByClientId(connection, clientId),
            clientFtp.getByClientId(connection, clientId),
            clientServer.getByClientId(connection, clientId),
            clientDatabase.getByClientId(connection, clientId),
            clientAccess.getByClientId(connection, clientId),
            clientAnalytics.getByClientId(connection, clientId)
          ]

          // 並列処理に対してPromise.allを使う
          Promise.all(promises).then(function (results) {
            for (let i = 0; i < results.length; i++) {
              for (const tableKey in results[i]) {
                clients[key][tableKey] = results[i][tableKey]
              }
            }
            callback()
          })
        }, function (err) {
          return res.json(clients)
        })
      })
  })

  //====================================
  //
  //             search
  //
  //====================================
  router.get('/search', function (req, res) {
    client.getBySearchValue(req, res, connection)
      .then((rows) => {
        let clients = []
        async.forEachOf(rows, function (row, key, callback) {
          const clientId = row.id
          clients[key] = row
          const promises = [
            clientSystem.getByClientId(connection, clientId),
            clientFtp.getByClientId(connection, clientId),
            clientServer.getByClientId(connection, clientId),
            clientDatabase.getByClientId(connection, clientId),
            clientAccess.getByClientId(connection, clientId),
            clientAnalytics.getByClientId(connection, clientId)
          ]

          // 並列処理に対してPromise.allを使う
          Promise.all(promises).then(function (results) {
            for (let i = 0; i < results.length; i++) {
              for (const tableKey in results[i]) {
                clients[key][tableKey] = results[i][tableKey]
              }
            }
            callback()
          })
        }, function (err) {
          return res.json(clients)
        });
      })
  })

  //====================================
  //
  //             searchList
  //
  //====================================
  router.get('/searchList', function (req, res) {
    client.getAll(req, res, connection)
      .then((rows) => {
        let searchList = []
        async.forEachOf(rows, function (row, key, callback) {
          searchList[key] = row.name
          callback()
        }, function (err) {
          return res.json(searchList)
        });
      })
  })

  //====================================
  //
  //             tagList
  //
  //====================================
  router.get('/tagList', function (req, res) {
    tag.getAll(req, res, connection)
      .then((rows) => {
        return res.json(rows)
      })
  })

  //====================================
  //
  //             tagTermsList
  //
  //====================================
  router.get('/tagTermsList', function (req, res) {
    tagTerm.getByClientId(req, res, connection)
      .then((rows) => {
        let tagTerms = []
        async.forEachOf(rows, function (row, key, callback) {
          const tagId = row.tag_id
          let func = tag.getById(connection, tagId)
          Promise.props(func).then(function (tagRows) {
            tagTerms[key] = row
            tagTerms[key]['name'] = tagRows.name
            tagTerms[key]['color'] = tagRows.color
            callback()
          }).catch((err) => {
            callback()
          })
        }, function (err) {
          return res.json(tagTerms)
        });
      })
  })

  //====================================
  //
  //             tag
  //
  //====================================
  router.get('/tag', function (req, res) {
    let id = req.query.id
    tag.getById(connection, id)
      .then((rows) => {
        return res.json(rows)
      })
  })

  //====================================
  //
  //             tagUpdate
  //
  //====================================
  router.get('/tag/update', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      tag.update(req, res, connection)
        .then((result) => {
          connection.commit(function (err) {
            if (err) {
              connection.rollback(function () {
                throw err
              })
            }
          })
          res.json({result: true})
        })
        .catch(function (err) {
          connection.rollback(function () {
            throw err
          })
          res.status(401).json({result: false})
        })
    })
  })

  //====================================
  //
  //             tagAdd
  //
  //====================================
  router.get('/tag/add', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      tag.add(req, res, connection)
        .then((result) => {
          connection.commit(function (err) {
            if (err) {
              connection.rollback(function () {
                throw err
              })
            }
          })
          res.json({result: true})
        })
        .catch(function (err) {
          connection.rollback(function () {
            throw err
          })
          res.status(401).json({result: false})
        })
    })
  })

  //====================================
  //
  //             tagDelete
  //
  //====================================
  router.get('/tag/delete', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      tag.delete(req, res, connection)
        .then((result) => {
          connection.commit(function (err) {
            if (err) {
              connection.rollback(function () {
                throw err
              })
            }
          })
          res.json({result: true})
        })
        .catch(function (err) {
          connection.rollback(function () {
            throw err
          })
          res.status(401).json({result: false})
        })
    })
  })

  //====================================
  //
  //             tagTermsDelete
  //
  //====================================
  router.get('/tagTerms/delete', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      const deleteTagList = req.query.deleteTagList
      if (deleteTagList) {
        tagTerm.delete(req, res, connection, deleteTagList[0])
          .then((result) => {
            connection.commit(function (err) {
              if (err) {
                connection.rollback(function () {
                  throw err
                })
              }
            })
            res.json({result: true})
          })
          .catch(function (err) {
            connection.rollback(function () {
              throw err;
            })
            res.status(401).json({result: false})
          })
      }
    })
  })

  //====================================
  //
  //             client:id
  //
  //====================================
  router.get('/client/:id', function (req, res) {
    client.getByParameterId(req, res, connection)
      .then((rows) => {
        let clients = {}
        async.forEachOf(rows, function (row, key, callback) {
          const clientId = row.id
          clients[key] = row
          const promises = [
            clientSystem.getByClientId(connection, clientId),
            clientFtp.getByClientId(connection, clientId),
            clientServer.getByClientId(connection, clientId),
            clientDatabase.getByClientId(connection, clientId),
            clientAccess.getByClientId(connection, clientId),
            clientAnalytics.getByClientId(connection, clientId)
          ]

          // 並列処理に対してPromise.allを使う
          Promise.all(promises).then(function (results) {
            for (let i = 0; i < results.length; i++) {
              for (const tableKey in results[i]) {
                clients[key][tableKey] = results[i][tableKey]
              }
            }
            callback()
          })
        }, function (err) {
          return res.json(clients[0])
        });
      })
  })

  //====================================
  //
  //             clients
  //
  //====================================
  router.get('/clients', function (req, res) {
    client.getByQueryId(req, res, connection)
      .then((rows) => {
        return res.json(rows[0])
      })
  })

  //====================================
  //
  //             maxSort
  //
  //====================================
  router.get('/maxSort', function (req, res) {
    client.getMaxSort(req, res, connection)
      .then((rows) => {
        return res.json(rows[0])
      })
  })

  //====================================
  //
  //             sortList
  //
  //====================================
  router.get('/sortList', function (req, res) {
    client.getAll(req, res, connection)
      .then((rows) => {
        return res.json(rows)
      })
  })

  //====================================
  //
  //             sortUpdate
  //
  //====================================
  router.get('/sort/update', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      let i = 1
      async.forEachOf(req.query.idList, function (clientId, key, callback) {
        req.query.id = clientId
        req.query.sort = i
        client.updateSort(req, res, connection)
          .then((result) => {
            callback()
          })
          .catch(function (err) {
            connection.rollback(function () {
              throw err;
            })
            res.status(401).json({result: false})
          })
        i++
      })

      connection.commit(function (err) {
        if (err) {
          connection.rollback(function () {
            throw err
          })
        }
      })
      res.json({result: true})
    })
  })

  //====================================
  //
  //             clientUpdate
  //
  //====================================
  router.get('/clients/update', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      const clientId = req.query.id
      const addTagList = req.query.addTagList
      const deleteTagList = req.query.deleteTagList
      client.update(req, res, connection)
        .then((result) => {
          if (addTagList) {
            req.query['client_id'] = clientId
            async.forEachOf(addTagList, function (tagId, key, callback) {
              tagTerm.add(req, res, connection, tagId)
                .then((result) => {
                  callback()
                })
                .catch(function (err) {
                  connection.rollback(function () {
                    throw err;
                  })
                })
            })
          }

          if (deleteTagList) {
            req.query['client_id'] = clientId
            async.forEachOf(deleteTagList, function (tagId, key, callback) {
              tagTerm.delete(req, res, connection, tagId)
                .then((result) => {
                  callback()
                })
                .catch(function (err) {
                  connection.rollback(function () {
                    throw err;
                  })
                })
            })
          }

          connection.commit(function (err) {
            if (err) {
              connection.rollback(function () {
                throw err
              })
            }
          })
          res.json({result: true})
        })
        .catch(function (err) {
          connection.rollback(function () {
            throw err
          })
          res.status(401).json({result: false})
        })
    })
  })

  //====================================
  //
  //             clientAdd
  //
  //====================================
  router.get('/clients/add', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      const addTagList = req.query.addTagList
      client.add(req, res, connection)
        .then((result) => {
          let clientId = result.insertId
          req.query['client_id'] = clientId
          if (addTagList) {
            async.forEachOf(addTagList, function (tagId, key, callback) {
              tagTerm.add(req, res, connection, tagId)
                .then((result) => {
                  callback()
                })
                .catch(function (err) {
                  connection.rollback(function () {
                    throw err;
                  })
                })
            })
          }

          connection.commit(function (err) {
            if (err) {
              connection.rollback(function () {
                throw err
              })
            }
          })
          res.json({result: true, clientId: clientId})
        })
        .catch(function (err) {
          connection.rollback(function () {
            throw err
          })
          res.status(401).json({result: false})
        })
    })
  })

  //====================================
  //
  //             clientDelete
  //
  //====================================
  router.get('/clients/delete', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      client.delete(req, res, connection)
        .then((result) => {
          req.query['client_id'] = req.query.id
          const promises = [
            tagTerm.deleteByClientId(req, res, connection),
            clientSystem.deleteByClientId(req, res, connection),
            clientFtp.deleteByClientId(req, res, connection),
            clientServer.deleteByClientId(req, res, connection),
            clientDatabase.deleteByClientId(req, res, connection),
            clientAccess.deleteByClientId(req, res, connection),
            clientAnalytics.deleteByClientId(req, res, connection)
          ]

          // 並列処理に対してPromise.allを使う
          Promise.all(promises).then(function (results) {
            connection.commit(function (err) {
              if (err) {
                connection.rollback(function () {
                  throw err
                })
              }
            })
          }).catch(function (err) {
            connection.rollback(function () {
              throw err;
            })
          })

          res.json({result: true})
        })
        .catch(function (err) {
          connection.rollback(function () {
            throw err
          })
          res.status(401).json({result: false})
        })
    })
  })

  //====================================
  //
  //             clientSystem
  //
  //====================================
  router.get('/clientSystem', function (req, res) {
    let clientId = req.query.client_id
    clientSystem.getByClientId(connection, clientId)
      .then((rows) => {
        return res.json(rows['system'])
      })
  })

  //====================================
  //
  //             clientSystemUpdate
  //
  //====================================
  router.get('/system/update', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      clientSystem.update(req, res, connection)
        .then((rows) => {
          connection.commit(function (err) {
            if (err) {
              connection.rollback(function () {
                throw err
              })
            }
          })
          res.json({result: true})
        })
        .catch(function (err) {
          connection.rollback(function () {
            throw err
          })
          res.status(401).json({result: false})
        })
    })
  })

  //====================================
  //
  //             clientSystemAdd
  //
  //====================================
  router.get('/system/add', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      clientSystem.add(req, res, connection)
        .then((rows) => {
          connection.commit(function (err) {
            if (err) {
              connection.rollback(function () {
                throw err
              })
            }
          })
          res.json({result: true})
        })
        .catch(function (err) {
          connection.rollback(function () {
            throw err
          })
          res.status(401).json({result: false})
        })
    })
  })

  //====================================
  //
  //             clientSystemDelete
  //
  //====================================
  router.get('/system/delete', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      clientSystem.delete(req, res, connection)
        .then((rows) => {
          connection.commit(function (err) {
            if (err) {
              connection.rollback(function () {
                throw err
              })
            }
          })
          res.json({result: true})
        })
        .catch(function (err) {
          connection.rollback(function () {
            throw err
          })
          res.status(401).json({result: false})
        })
    })
  })

  //====================================
  //
  //             clientServer
  //
  //====================================
  router.get('/clientServer', function (req, res) {
    let clientId = req.query.client_id
    clientServer.getByClientId(connection, clientId)
      .then((rows) => {
        return res.json(rows['server'])
      })
  })

  //====================================
  //
  //             clientServerUpdate
  //
  //====================================
  router.get('/server/update', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      clientServer.update(req, res, connection)
        .then((rows) => {
          connection.commit(function (err) {
            if (err) {
              connection.rollback(function () {
                throw err
              })
            }
          })
          res.json({result: true})
        })
        .catch(function (err) {
          connection.rollback(function () {
            throw err
          })
          res.status(401).json({result: false})
        })
    })
  })

  //====================================
  //
  //             clientServerAdd
  //
  //====================================
  router.get('/server/add', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      clientServer.add(req, res, connection)
        .then((rows) => {
          connection.commit(function (err) {
            if (err) {
              connection.rollback(function () {
                throw err
              })
            }
          })
          res.json({result: true})
        })
        .catch(function (err) {
          connection.rollback(function () {
            throw err
          })
          res.status(401).json({result: false})
        })
    })
  })

  //====================================
  //
  //             clientServerDelete
  //
  //====================================
  router.get('/server/delete', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      clientServer.delete(req, res, connection)
        .then((rows) => {
          connection.commit(function (err) {
            if (err) {
              connection.rollback(function () {
                throw err
              })
            }
          })
          res.json({result: true})
        })
        .catch(function (err) {
          connection.rollback(function () {
            throw err
          })
          res.status(401).json({result: false})
        })
    })
  })

  //====================================
  //
  //             clientAccess
  //
  //====================================
  router.get('/clientAccess', function (req, res) {
    let clientId = req.query.client_id
    clientAccess.getByClientId(connection, clientId)
      .then((rows) => {
        return res.json(rows['access'])
      })
  })

  //====================================
  //
  //             clientAccessUpdate
  //
  //====================================
  router.get('/access/update', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      clientAccess.update(req, res, connection)
        .then((rows) => {
          connection.commit(function (err) {
            if (err) {
              connection.rollback(function () {
                throw err
              })
            }
          })
          res.json({result: true})
        })
        .catch(function (err) {
          connection.rollback(function () {
            throw err
          })
          res.status(401).json({result: false})
        })
    })
  })

  //====================================
  //
  //             clientAccessAdd
  //
  //====================================
  router.get('/access/add', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      clientAccess.add(req, res, connection)
        .then((rows) => {
          connection.commit(function (err) {
            if (err) {
              connection.rollback(function () {
                throw err
              })
            }
          })
          res.json({result: true})
        })
        .catch(function (err) {
          connection.rollback(function () {
            throw err
          })
          res.status(401).json({result: false})
        })
    })
  })

  //====================================
  //
  //             clientAccessDelete
  //
  //====================================
  router.get('/access/delete', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      clientAccess.delete(req, res, connection)
        .then((rows) => {
          connection.commit(function (err) {
            if (err) {
              connection.rollback(function () {
                throw err
              })
            }
          })
          res.json({result: true})
        })
        .catch(function (err) {
          connection.rollback(function () {
            throw err
          })
          res.status(401).json({result: false})
        })
    })
  })

  //====================================
  //
  //             clientAnalytics
  //
  //====================================
  router.get('/clientAnalytics', function (req, res) {
    let clientId = req.query.client_id
    clientAnalytics.getByClientId(connection, clientId)
      .then((rows) => {
        return res.json(rows['analytics'])
      })
  })

  //====================================
  //
  //             clientAnalyticsUpdate
  //
  //====================================
  router.get('/analytics/update', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      clientAnalytics.update(req, res, connection)
        .then((rows) => {
          connection.commit(function (err) {
            if (err) {
              connection.rollback(function () {
                throw err
              })
            }
          })
          res.json({result: true})
        })
        .catch(function (err) {
          connection.rollback(function () {
            throw err
          })
          res.status(401).json({result: false})
        })
    })
  })

  //====================================
  //
  //             clientAnalyticsAdd
  //
  //====================================
  router.get('/analytics/add', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      clientAnalytics.add(req, res, connection)
        .then((rows) => {
          connection.commit(function (err) {
            if (err) {
              connection.rollback(function () {
                throw err
              })
            }
          })
          res.json({result: true})
        })
        .catch(function (err) {
          connection.rollback(function () {
            throw err
          })
          res.status(401).json({result: false})
        })
    })
  })

  //====================================
  //
  //             clientAnalyticsDelete
  //
  //====================================
  router.get('/analytics/delete', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      clientAnalytics.delete(req, res, connection)
        .then((rows) => {
          connection.commit(function (err) {
            if (err) {
              connection.rollback(function () {
                throw err
              })
            }
          })
          res.json({result: true})
        })
        .catch(function (err) {
          connection.rollback(function () {
            throw err
          })
          res.status(401).json({result: false})
        })
    })
  })

  //====================================
  //
  //             clientDatabase
  //
  //====================================
  router.get('/clientDatabase', function (req, res) {
    let clientId = req.query.client_id
    clientDatabase.getByClientId(connection, clientId)
      .then((rows) => {
        return res.json(rows['database'])
      })
  })

  //====================================
  //
  //             clientDatabaseUpdate
  //
  //====================================
  router.get('/database/update', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      clientDatabase.update(req, res, connection)
        .then((rows) => {
          connection.commit(function (err) {
            if (err) {
              connection.rollback(function () {
                throw err
              })
            }
          })
          res.json({result: true})
        })
        .catch(function (err) {
          connection.rollback(function () {
            throw err
          })
          res.status(401).json({result: false})
        })
    })
  })

  //====================================
  //
  //             clientDatabaseAdd
  //
  //====================================
  router.get('/database/add', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      clientDatabase.add(req, res, connection)
        .then((rows) => {
          connection.commit(function (err) {
            if (err) {
              connection.rollback(function () {
                throw err
              })
            }
          })
          res.json({result: true})
        })
        .catch(function (err) {
          connection.rollback(function () {
            throw err
          })
          res.status(401).json({result: false})
        })
    })
  })

  //====================================
  //
  //             clientDatabaseDelete
  //
  //====================================
  router.get('/database/delete', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      clientDatabase.delete(req, res, connection)
        .then((rows) => {
          connection.commit(function (err) {
            if (err) {
              connection.rollback(function () {
                throw err
              })
            }
          })
          res.json({result: true})
        })
        .catch(function (err) {
          connection.rollback(function () {
            throw err
          })
          res.status(401).json({result: false})
        })
    })
  })

  //====================================
  //
  //             clientFtp
  //
  //====================================
  router.get('/clientFtp', function (req, res) {
    let clientId = req.query.client_id
    clientFtp.getByClientId(connection, clientId)
      .then((rows) => {
        return res.json(rows['ftp'])
      })
  })

  //====================================
  //
  //             clientFtpUpdate
  //
  //====================================
  router.get('/ftp/update', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      clientFtp.update(req, res, connection)
        .then((rows) => {
          connection.commit(function (err) {
            if (err) {
              connection.rollback(function () {
                throw err
              })
            }
          })
          res.json({result: true})
        })
        .catch(function (err) {
          connection.rollback(function () {
            throw err
          })
          res.status(401).json({result: false})
        })
    })
  })

  //====================================
  //
  //             clientFtpAdd
  //
  //====================================
  router.get('/ftp/add', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      clientFtp.add(req, res, connection)
        .then((rows) => {
          connection.commit(function (err) {
            if (err) {
              connection.rollback(function () {
                throw err
              })
            }
          })
          res.json({result: true})
        })
        .catch(function (err) {
          connection.rollback(function () {
            throw err
          })
          res.status(401).json({result: false})
        })
    })
  })

  //====================================
  //
  //             clientFtpDelete
  //
  //====================================
  router.get('/ftp/delete', function (req, res) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err
      }
      clientFtp.delete(req, res, connection)
        .then((rows) => {
          connection.commit(function (err) {
            if (err) {
              connection.rollback(function () {
                throw err
              })
            }
          })
          res.json({result: true})
        })
        .catch(function (err) {
          connection.rollback(function () {
            throw err
          })
          res.status(401).json({result: false})
        })
    })
  })
}