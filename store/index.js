import Vue from 'vue'
import Vuex from 'vuex'
import mutations from './mutations'
import actions from './actions'

Vue.use(Vuex)

// window.fetch() のためのポリフィル
require('whatwg-fetch')

const store = () => new Vuex.Store({

  state: {
    authUser: null,
    tabs: {
      'system': 'システム',
      'ftp': 'FTP',
      'server': 'サーバー',
      'database': 'データベース',
      'analytics': 'アナリティクス',
      'access': 'アクセス制限'
    },
    type: [
      {
        key: 0,
        name: '',
        color: ''
      },
      {
        key: 1,
        name: '本番環境',
        color: 'red'
      },
      {
        key: 2,
        name: 'テスト環境',
        color: 'light-blue'
      },
      {
        key: 3,
        name: '自社テスト環境',
        color: 'pink'
      },
    ],
    tagTerms: null
  },
  mutations,
  actions
})

export default store