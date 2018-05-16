<template>
  <v-card class="mb-5">
    <v-container>
      <v-form @submit.prevent="submit" ref="form">
        <v-container fluid grid-list-md>
          <v-subheader class="title black--text pl-0 pr-0">
            <v-icon class="mr-1">label</v-icon>
            アナリティクス情報
          </v-subheader>
          <v-dialog v-model="dialog" max-width="500px">
            <v-btn
              absolute
              dark
              fab
              top
              right
              color="primary"
              slot="activator"
              small
              style="z-index: 1 !important"
            >
              <v-icon>add</v-icon>
            </v-btn>
            <v-card>
              <v-card-title>
                <v-subheader class="headline black--text pl-0 pr-0">
                  <v-icon class="mr-1">{{ formIcon }}</v-icon>
                  {{ formTitle }}
                </v-subheader>
              </v-card-title>
              <v-card-text>
                <v-container grid-list-md>
                  <v-layout wrap>
                    <v-flex xs12 sm6>
                      <v-text-field
                        label="アナリティクス名"
                        v-model="editedItem.name"
                        :error-messages="errors.collect('name')"
                        v-validate="'required'"
                        data-vv-name="name"
                        required
                      >
                      </v-text-field>
                    </v-flex>
                    <v-flex xs12 sm6>
                      <v-text-field
                        label="URL"
                        v-model="editedItem.url"
                      >
                      </v-text-field>
                    </v-flex>
                    <v-flex xs12 sm6>
                      <v-text-field
                        label="ID"
                        v-model="editedItem.account"
                        :error-messages="errors.collect('id')"
                        v-validate="'required'"
                        data-vv-name="id"
                        required
                      >
                      </v-text-field>
                    </v-flex>
                    <v-flex xs12 sm6>
                      <v-text-field
                        label="パスワード"
                        v-model="editedItem.password"
                        :error-messages="errors.collect('password')"
                        v-validate="'required'"
                        data-vv-name="password"
                        required
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        multi-line
                        v-model="editedItem.note"
                      >
                        <div slot="label">備考</div>
                      </v-text-field>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click.native="close">閉じる</v-btn>
                <v-btn color="primary white--text" @click.native="save">{{ btnTitle }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-data-table
            :headers="headers"
            :items="items"
            hide-actions
            class="elevation-1"
          >
            <template slot="items" slot-scope="props">
              <td class="text-xs-left">{{ props.item.name }}</td>
              <td class="text-xs-left">{{ props.item.account }}</td>
              <td class="text-xs-left">{{ props.item.password }}</td>
              <td class="justify-center layout px-0">
                <v-btn icon class="mx-0" @click="editItem(props.item)">
                  <v-icon>edit</v-icon>
                </v-btn>
                <v-btn icon class="mx-0" @click="deleteItem(props.item)">
                  <v-icon color="error">delete</v-icon>
                </v-btn>
              </td>
            </template>
            <template slot="no-data">
              <v-alert class="text-sm-left" outline color="grey darken-1" icon="info" :value="true" transition="fade-transition">
                データがありません
              </v-alert>
            </template>
          </v-data-table>
        </v-container>
      </v-form>
    </v-container>
  </v-card>
</template>

<script>
  import axios from 'axios'
  export default {
    props: ['clientId', 'analytics'],
    $_veeValidate: {
      validator: 'clientAnalytics'
    },
    data () {
      return {
        dialog: false,
        headers: [
          {
            text: 'アナリティクス名',
            align: 'left',
            sortable: false,
            value: 'name'
          },
          {text: 'ID', value: 'account', sortable: false},
          {text: 'パスワード', value: 'password', sortable: false},
          {text: '操作', align: 'center', value: 'name', sortable: false}
        ],
        items: [],
        types: this.$store.state.type,
        dictionary: {
          custom: {
            name: {
              required: () => 'アナリティクス名を入力してください',
            },
            id: {
              required: () => 'IDを入力してください',
            },
            password: {
              required: () => 'パスワードを入力してください',
            }
          }
        },
        editedIndex: -1,
        editedItem: {
          id: '',
          name: '',
          url: '',
          account: '',
          password: '',
          note: ''
        },
        defaultItem: {
          name: '',
          url: '',
          account: '',
          password: '',
          note: ''
        }
      }
    },
    computed: {
      formTitle () {
        return this.editedIndex === -1 ? '新規作成' : '編集'
      },
      formIcon () {
        return this.editedIndex === -1 ? 'add' : 'edit'
      },
      btnTitle () {
        return this.editedIndex === -1 ? '登録' : '更新'
      }
    },
    watch: {
      dialog (val) {
        val || this.close()
      }
    },
    mounted () {
      this.$validator.localize('en', this.dictionary)
    },
    created () {
      this.initialize(this.analytics)
    },
    methods: {
      initialize (value) {
        this.items = value
      },
      editItem (item) {
        this.editedIndex = this.items.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },
      deleteItem (item) {
        const index = this.items.indexOf(item)
        confirm('アナリティクス情報を削除しますか?') && this.deleteAnalytics(item.id, index)
      },
      close () {
        this.dialog = false
        setTimeout(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        }, 300)
        this.$validator.reset()
      },
      save () {
        this.$validator.validateAll().then(result => {
          if (result) {
            if (this.editedIndex > -1) {
              this.updateAnalytics()
            } else {
              this.insertAnalytics()
            }
            this.close()
          }
        })
      },
      getClientAnalytics () {
        let params = {}
        let self = this
        params['client_id'] = this.clientId
        axios.get('/api/clientAnalytics', {
          params: params
        }).then((res) => {
          this.initialize(res.data)
        })
      },
      insertAnalytics () {
        let params = {}
        params['client_id'] = this.clientId
        Object.keys(this.editedItem).forEach(function (key) {
          params[key] = this.editedItem[key]
        }, this)
        axios.get('/api/analytics/add', {
          params: params
        }).then((res) => {
          this.getClientAnalytics()
        })
      },
      updateAnalytics () {
        let params = {}
        Object.keys(this.editedItem).forEach(function (key) {
          params[key] = this.editedItem[key]
        }, this)
        axios.get('/api/analytics/update', {
          params: params
        }).then((res) => {
          this.getClientAnalytics()
        })
      },
      deleteAnalytics (id, index) {
        let params = {}
        params['id'] = id
        axios.get('/api/analytics/delete', {
          params: params
        }).then((res) => {
          this.getClientAnalytics()
        })
      }
    }
  }
</script>