const actions = {
  nuxtServerInit ({commit}, {req}) {
    if (req.session && req.session.authUser) {
      commit('SET_USER', req.session.authUser)
    }
  },

  login ({commit}, {name, password}) {
    return fetch('/api/login', {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        password
      })
    })
      .then((res) => {
        if (res.status === 401) {
          throw new Error('ログインに失敗しました')
        } else {
          return res.json()
        }
      })
      .then((authUser) => {
        commit('SET_USER', authUser)
      })
  },

  logout ({commit}) {
    return fetch('/api/logout', {
      credentials: 'same-origin',
      method: 'POST'
    })
      .then(() => {
        commit('SET_USER', null)
      })
  },

  setTagTerms ({commit}, {tagTerms}) {
    commit('TAG_TERMS', tagTerms)
  }
}

export default actions