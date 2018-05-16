const mutations = {
  SET_USER: function (state, user) {
    state.authUser = user
  },
  TAG_TERMS: function (state, tagTerms) {
    state.tagTerms = tagTerms
  }
}

export default mutations