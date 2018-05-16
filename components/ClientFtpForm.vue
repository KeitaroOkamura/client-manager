<template>
  <v-card class="mb-5">
    <v-container>
      <v-form @submit.prevent="submit" ref="form">
        <v-container fluid grid-list-md>
          <v-subheader class="title black--text pl-0 pr-0">
            <v-icon class="mr-1">label</v-icon>
            FTP情報
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
                    <v-flex xs12>
                      <v-text-field
                        label="ホスト"
                        v-model="editedItem.host"
                        :error-messages="errors.collect('host')"
                        v-validate="'required'"
                        data-vv-name="host"
                        required
                      >
                      </v-text-field>
                    </v-flex>
                    <v-flex xs12 sm6>
                      <v-text-field
                        label="ID"
                        v-model="editedItem.user_id"
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
                      <v-select
                        label="タイプ"
                        v-model="editedItem.type"
                        item-text="name"
                        item-value="key"
                        :items="types"
                      ></v-select>
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
              <td class="text-xs-left">{{ props.item.host }}</td>
              <td class="text-xs-left">{{ props.item.user_id }}</td>
              <td class="text-xs-left">{{ props.item.password }}</td>
              <td class="text-xs-left">{{ types[props.item.type].name }}</td>
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
    props: ['clientId', 'ftp'],
    $_veeValidate: {
      validator: 'clientFtp'
    },
    data () {
      return {
        dialog: false,
        headers: [
          {
            text: 'ホスト',
            align: 'left',
            sortable: false,
            value: 'host'
          },
          {text: 'ID', value: 'user_id', sortable: false},
          {text: 'パスワード', value: 'password', sortable: false},
          {text: 'タイプ', value: 'type', sortable: false},
          {text: '操作', align: 'center', value: 'name', sortable: false}
        ],
        items: [],
        types: this.$store.state.type,
        dictionary: {
          custom: {
            host: {
              required: () => 'ホストを入力してください',
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
          host: '',
          user_id: '',
          password: '',
          type: 0,
          note: ''
        },
        defaultItem: {
          host: '',
          user_id: '',
          password: '',
          type: 0,
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
      this.initialize(this.ftp)
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
        confirm('FTP情報を削除しますか?') && this.deleteFtp(item.id, index)
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
              this.updateFtp()
            } else {
              this.insertFtp()
            }
            this.close()
          }
        })
      },
      getClientFtp () {
        let params = {}
        let self = this
        params['client_id'] = this.clientId
        axios.get('/api/clientFtp', {
          params: params
        }).then((res) => {
          this.initialize(res.data)
        })
      },
      insertFtp () {
        let params = {}
        params['client_id'] = this.clientId
        Object.keys(this.editedItem).forEach(function (key) {
          params[key] = this.editedItem[key]
        }, this)
        axios.get('/api/ftp/add', {
          params: params
        }).then((res) => {
          this.getClientFtp()
        })
      },
      updateFtp () {
        let params = {}
        Object.keys(this.editedItem).forEach(function (key) {
          params[key] = this.editedItem[key]
        }, this)
        axios.get('/api/ftp/update', {
          params: params
        }).then((res) => {
          this.getClientFtp()
        })
      },
      deleteFtp (id, index) {
        let params = {}
        params['id'] = id
        axios.get('/api/ftp/delete', {
          params: params
        }).then((res) => {
          this.getClientFtp()
        })
      }
    }
  }
</script>