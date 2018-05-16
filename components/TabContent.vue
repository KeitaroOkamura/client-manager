<template>
  <v-container fluid grid-list-md>
    <v-data-iterator
      content-tag="v-layout"
      row
      wrap
      :items="tabContents"
      :rows-per-page-items="rowsPerPageItems"
      :pagination.sync="pagination"
    >
      <v-flex
        slot="item"
        slot-scope="props"
        xs12
      >
        <v-card>
          <v-card-title>
            <div class="text-xs-center" v-show="props.item.type">
              <v-chip label :color="labelColor" outline>{{ labelName }}</v-chip>
            </div>
            <h4 class="ml-1" v-show="props.item.name">{{ props.item.name }}</h4>
          </v-card-title>
          <v-divider></v-divider>
          <v-list dense>
            <v-list-tile v-for="(item, index) in items" :key="index" v-show="props.item[item.column]">
              <v-list-tile-content>{{ item.name }}</v-list-tile-content>
              <v-list-tile-content class="align-end">
                <div ref="copyElm" class="selectElm">{{ props.item[item.column] }}</div>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn flat icon color="primary" v-if="item.column != 'note'" @click="execCopy(index, $event)">
                  <v-icon>attach_file</v-icon>
                </v-btn>
              </v-list-tile-action>
            </v-list-tile>
          </v-list>
        </v-card>
      </v-flex>
    </v-data-iterator>
  </v-container>
</template>

<script>
  export default {
    props: ['tabContents'],
    data () {
      return {
        rowsPerPageItems: [1, 2, 3],
        pagination: {
          rowsPerPage: 1
        },
        items: [
          {
            name: 'ホスト:',
            column: 'host'
          },
          {
            name: 'サーバー:',
            column: 'server'
          },
          {
            name: 'アカウント:',
            column: 'account'
          },
          {
            name: 'ユーザーID:',
            column: 'user_id'
          },
          {
            name: 'アクセスID:',
            column: 'access_id'
          },
          {
            name: 'パスワード:',
            column: 'password'
          },
          {
            name: 'URL:',
            column: 'url'
          },
          {
            name: '備考:',
            column: 'note'
          }
        ],
        type: this.$store.state.type
      }
    },
    computed: {
      labelColor: function () {
        let color = ''
        if (this.tabContents[0].type) {
          color = this.type[this.tabContents[0].type].color
        }
        return color
      },
      labelName: function () {
        let name = ''
        if (this.tabContents[0].type) {
          name = this.type[this.tabContents[0].type].name
        }
        return name
      },
    },
    methods: {
      execCopy: function (index, event) {
        const self = this
        const text = this.$refs.copyElm[index].innerText
        this.$copyText(text).then(function (e) {
          self.selectText(self.$refs.copyElm[index])
        }, function (e) {
          console.log(e)
        })
      },
      selectText: function (obj) {
        const range = document.createRange()
        range.selectNodeContents(obj)
        const selection = window.getSelection()
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  }
</script>
<style scoped>
  .selectElm {
    user-select: text !important;
  }

  .selectElm::-moz-selection {
    color: #C62828;
    background-color: #fee5ee;
  }

  .selectElm::selection {
    color: #C62828;
    background-color: #fee5ee;
  }
</style>