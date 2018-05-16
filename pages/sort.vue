<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-data-table
        :headers="headers"
        :items="items"
        hide-actions
        class="elevation-1"
        ref="sortableTable"
        item-key="name"
      >
        <template slot="headers" slot-scope="props">
          <tr>
            <th>
              <v-icon>open_with</v-icon>
            </th>
            <th
              v-for="header in props.headers"
              :key="header.text"
              :class="'text-xs-'+header.align"
            >
              {{ header.text }}
            </th>
          </tr>
        </template>
        <template slot="items" slot-scope="props">
          <tr class="sortableRow" :key="itemKey(props.item)">
            <td class="px-1" style="width: 0.1%">
              <v-btn style="cursor: move" large icon class="sortHandle">
                <v-icon color="primary">drag_handle</v-icon>
              </v-btn>
            </td>
            <td class="px-1 text-xs-center">{{ props.item.sort }}</td>
            <td class="text-xs-left">{{ props.item.name }}</td>
            <td class="justify-center layout px-0">
              <v-btn icon :to="props.item.id | editLink">
                <v-icon>mode_edit</v-icon>
              </v-btn>
            </td>
          </tr>
        </template>
        <template slot="no-data">
          <v-alert class="text-sm-left" outline color="grey darken-1" icon="info" :value="true"
                   transition="fade-transition">
            {{ this.message }}
          </v-alert>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>

<script>
  import axios from 'axios'
  import Sortable from 'sortablejs/Sortable.min.js'

  export default {
    asyncData ({env, params, error}) {
      return axios.get(`${env.baseUrl}/api/sortList`)
        .then((res) => {
          return {
            items: res.data
          }
        })
        .catch((e) => {
          return {items: null, message: 'クライアントが見つかりません'}
        })
    },
    mounted () {
      new Sortable(
        this.$refs.sortableTable.$el.getElementsByTagName('tbody')[0],
        {
          draggable: '.sortableRow',
          handle: '.sortHandle',
          onEnd: this.dragReorder
        }
      )
    },
    data () {
      return {
        message: '',
        itemKeys: new WeakMap(),
        currentItemKey: 0,
        headers: [
          {text: '並び順', align: 'center', sortable: false, value: 'sort'},
          {text: 'クライアント名', align: 'left', sortable: false, value: 'name'},
          {text: '編集', align: 'center', value: 'name', sortable: false}
        ],
        items: []
      }
    },
    computed: {
      clientIdList () {
        let clientIdList = []
        Object.keys(this.items).forEach(function (key) {
          clientIdList.push(this.items[key].id)
        }, this)
        return clientIdList
      }
    },
    filters: {
      editLink(value) {
        return '/client/' + value
      }
    },
    methods: {
      dragReorder ({oldIndex, newIndex}) {
        const movedItem = this.items.splice(oldIndex, 1)[0]
        this.items.splice(newIndex, 0, movedItem)
        this.updateSort()
      },
      itemKey (item) {
        if (!this.itemKeys.has(item)) this.itemKeys.set(item, ++this.currentItemKey)
        return this.itemKeys.get(item)
      },
      getSortList () {
        axios.get('/api/sortList')
          .then((res) => {
            this.items = res.data
          })
      },
      updateSort () {
        let params = {}
        params['idList'] = this.clientIdList
        axios.get('/api/sort/update', {
          params: params
        }).then((res) => {
          this.getSortList()
          console.log('update sort')
        }).catch((err) => {
          console.log(err)
        })
      }
    }
  }
</script>