<template>
  <v-layout row wrap>
    <search :search-list="searchList" @search-child="search"></search>
    <v-flex xs12>
      <transition-group name="fade" tag="div" class="xs12" appear>
        <div class="xs12 mb-4" v-for="client in viewItems" :key="client.id">
          <client :client="client" :init-show="initShow"></client>
        </div>
      </transition-group>
    </v-flex>
    <v-flex xs12 md50>
      <transition name="pagination">
        <v-pagination :length="totalPages" v-model="pagination.page" v-show="showPagination"></v-pagination>
      </transition>
    </v-flex>
  </v-layout>
</template>

<script>
  import axios from 'axios'
  import Search from '~/components/Search'
  import Client from '~/components/Client'
  export default {
    components: {
      Search,
      Client
    },
    asyncData ({env, params, error}) {
      return axios.get(`${env.baseUrl}/api/list`)
        .then((res) => {
          return {
            clients: res.data
          }
        })
        .catch((e) => {
          return {clients: null, message: 'クライアントが見つかりません'}
        })
    },
    data () {
      return {
        clients: [],
        searchList: [],
        pagination: {
          page: 1,
          rowsPerPage: 2,
        },
        initShow: false,
        showPagination: false
      }
    },
    mounted: function () {
      axios.get('/api/searchList')
        .then((res) => {
          this.searchList = res.data
        })
      this.showPagination = this.clients ? true : false
    },
    computed: {
      viewItems () {
        let currentPage = this.pagination.page - 1
        let items = this.clients ? this.array_chunk(this.clients) : this.clients
        return items ? items[currentPage] : items
      },
      totalPages () {
        let totalItems = this.clients ? this.clients.length : 0
        return Math.ceil(totalItems / this.pagination.rowsPerPage)
      }
    },
    watch: {
      'pagination.page': function (value) {
        this.showPagination = this.viewItems ? true : false
      }
    },
    methods: {
      search (value) {
        let params = {}
        params['value'] = value
        axios.get('/api/search', {
          params: params
        }).then((res) => {
          this.pagination.page = 1
          this.clients = res.data
        })
      },
      array_chunk (arr) {
        let ret = []
        let n = this.pagination.rowsPerPage
        for (let i = 0; i < arr.length; i += n) {
          ret.push(arr.slice(i, i + n))
        }
        return ret
      }
    }
  }
</script>
<style scoped>
  .fade-enter-active {
    transition: all .9s ease;
  }

  .fade-leave-active {
    /*transition: all 0s cubic-bezier(1.0, 0.5, 0.8, 1.0);*/
    opacity: 0;
  }

  .fade-enter, .fade-leave-to {
    transform: translateX(10px);
    opacity: 0;
  }

  .pagination-enter-active, .pagination-leave-active {
    transition: opacity 1s;
  }

  .pagination-enter, .pagination-leave-to {
    opacity: 0;
  }
</style>