<template>
  <v-flex xs12 mt-5 mb-5>
    <v-select
      :items="searchList"
      v-model="searchValue"
      label="クライアント検索"
      autocomplete
      single-line
      prepend-icon="search"
      clearable
      solo
    ></v-select>
  </v-flex>
</template>

<script>
  import axios from 'axios'
  export default {
    props: ['searchList'],
    data () {
      return {
        searchValue: null
      }
    },
    methods: {
      changeSearch: function (value) {
        this.$emit('search-child', value)
      },
      changeLabel: function (label) {
        this.$emit('search-child', label)
      }
    },
    watch: {
      searchValue: function (value) {
        this.$emit('search-child', value);
      }
    }
  }
</script>