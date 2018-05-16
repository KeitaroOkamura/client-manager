<template>
  <v-card class="mb-5">
    <v-container>
      <v-form ref="form">
        <v-container fluid grid-list-md>
          <v-subheader class="title black--text pl-0 pr-0">
            <v-icon class="mr-1">label</v-icon>
            クライアント情報
            <v-spacer></v-spacer>
            <v-btn
              color="error"
              fab
              small
              @click="deleteBtn"
              v-if="this.items.id"
            >
              <v-icon dark>delete</v-icon>
            </v-btn>
          </v-subheader>
          <v-layout row wrap>
            <v-flex xs12 sm6>
              <v-text-field
                name="input-1-3"
                label="クライアント名"
                v-model="items.name"
                :error-messages="errors.collect('name')"
                v-validate="'required'"
                data-vv-name="name"
                required
                prepend-icon="supervisor_account"
              ></v-text-field>
            </v-flex>
            <v-flex xs12 sm6>
              <v-text-field
                name="input-1-3"
                label="URL"
                v-model="items.url"
                required
                prepend-icon="link"
              ></v-text-field>
            </v-flex>
          </v-layout>

          <v-layout row wrap>
            <v-flex xs2>
              <v-subheader class="pl-0">
                <v-icon class="mr-1">bookmark_border</v-icon>
                タグ
              </v-subheader>
            </v-flex>
            <v-flex xs12 sm7 class="text-xs-left">
              <v-chip
                close
                v-for="(tagTerm, index) in tagTermsList"
                :key="index"
                :style="{ backgroundColor: tagTerm.color, borderColor: tagTerm.color }"
                text-color="white"
                @input="remove(tagTerm.tag_id)"
              >
                {{ tagTerm.name }}
              </v-chip>
            </v-flex>
            <v-flex xs12 sm3 class="text-xs-right">
              <v-menu
                left
                :close-on-content-click="false"
                v-model="menu"
                max-width="400"
                min-width="400"
              >
                <v-btn color="cyan" dark slot="activator">
                  <v-icon left dark>add_circle</v-icon>
                  タグを選択
                </v-btn>
                <v-card>
                  <v-card-text>
                    <v-tabs
                      v-model="active"
                      color="white"
                      slider-color="cyan"
                    >
                      <v-tab
                        v-for="n in tabTitle"
                        :key="n"
                        ripple
                        @click="initTag"
                      >
                        {{ n }}
                      </v-tab>
                      <v-tab-item lazy>
                        <v-card flat>
                          <v-card-text style="max-height: 270px" class="scroll-y">
                            <v-list>
                              <v-list-tile v-for="(tag, index) in tagList" :key="index" @click="cancel">
                                <v-checkbox
                                  v-model="tags"
                                  :value="tag.id"
                                  color="cyan"
                                  hide-details
                                  :label="tag.name"
                                  @change="selectedTags"
                                ></v-checkbox>
                                <v-list-tile-action>
                                  <v-btn icon left class="mx-0" @click.stop="editTabSlide(tag.id)">
                                    <v-icon>edit</v-icon>
                                  </v-btn>
                                </v-list-tile-action>
                              </v-list-tile>
                            </v-list>
                          </v-card-text>
                        </v-card>
                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn @click="closeMenu">閉じる</v-btn>
                          <v-btn dark color="cyan" @click="addTabSlide()">タグ新規作成</v-btn>
                        </v-card-actions>
                      </v-tab-item>
                      <v-tab-item lazy>
                        <v-card flat>
                          <v-card-text>
                            <v-text-field
                              prepend-icon="edit"
                              label="タグ名"
                              v-model="editTags.name"
                              required
                              :rules="tagNameRules"
                              flat
                            ></v-text-field>
                            <swatches v-model="editTags.color" inline></swatches>
                          </v-card-text>
                        </v-card>
                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn @click="tabSlide('0')">戻る</v-btn>
                          <v-btn v-if="editTags.id" color="error" @click="registerTag('delete')">削除</v-btn>
                          <v-btn color="cyan" :class="editTags.name == '' ? '' : 'white--text'" @click="registerTag()" :disabled="editTags.name == '' ">{{ editTags.id | tagBtn }}
                          </v-btn>
                        </v-card-actions>
                      </v-tab-item>
                    </v-tabs>
                  </v-card-text>
                </v-card>
              </v-menu>
            </v-flex>
          </v-layout>
          <hr>
          <v-layout row wrap>
            <v-flex xs2>
              <v-subheader class="pl-0">
                <v-icon class="mr-1">lock_outline</v-icon>
                表示設定
              </v-subheader>
            </v-flex>
            <v-flex xs12 sm8>
              <v-flex xs4 class="text-xs-left light--text">{{ items.status ? '表示する' : '表示しない' }}</v-flex>
              <v-switch
                value
                v-model="items.status"
                color="info"
                hide-details
                :true-value="1"
                :false-value="0"
              ></v-switch>
            </v-flex>
          </v-layout>
        </v-container>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="submit"
          >
            {{ this.items.id | submitBtn }}
          </v-btn>
        </v-card-actions>

      </v-form>
    </v-container>
  </v-card>
</template>

<script>
  import axios from 'axios'
  import "vue-swatches/dist/vue-swatches.min.css"
  export default {
    props: ['client'],
    $_veeValidate: {
      validator: 'clientForm'
    },
    data: () => ({
      tags: [],
      tagList: [],
      tagTermsList: [],
      active: null,
      menu: false,
      items: {},
      editTags: {
        id: '',
        name: '',
        color: '#BDC3C8'
      },
      tagNameRules: [
        v => !!v || 'タグ名を入力してください'
      ],
      colors: ['#F64272', '#F6648B', '#F493A7', '#F891A6', '#FFCCD5', ''],
      dictionary: {
        custom: {
          name: {
            required: () => 'クライアント名を入力してください',
          }
        }
      },
      defaultClient: Object.freeze({
        name: '',
        url: '',
        status: ''
      }),
      tabTitle: ['タグ選択', 'タグ登録'],
      sort: 0
    }),
    created: function () {
      this.initialize(this.client)
      this.getTagList()
      this.getTagTermsList()
      this.getMaxSort()
    },
    mounted () {
      this.$validator.localize('en', this.dictionary)
    },
    computed: {
      clientId: {
        get: function () {
          return this.client.id ? this.client.id : ''
        },
        set: function (value) {
          this.client.id = value
        }
      }
    },
    filters: {
      tagBtn (value) {
        return value ? '更新' : '登録'
      },
      submitBtn (value) {
        return value ? '更新' : '登録'
      }
    },
    methods: {
      initialize (value) {
        this.items = {
          id: value.id,
          name: value.name,
          url: value.url,
          status: value.status
        }
      },
      getClient () {
        let params = {}
        params['id'] = this.items.id
        axios.get('/api/clients', {
          params: params
        }).then((res) => {
          this.items = Object.assign({}, res.data)
        })
      },
      getTagList () {
        axios.get('/api/tagList')
          .then((res) => {
            this.tagList = res.data
            Object.keys(this.tagList).forEach(function (key) {
              this.$set(this.tagList[key], 'tag_id', this.tagList[key]['id'])
            }, this)
          })
      },
      getMaxSort () {
        axios.get('/api/maxSort')
          .then((res) => {
            let maxSort = res.data.max_sort + 1
            this.sort = maxSort
          })
      },
      getTagTermsList () {
        let params = {}
        params['client_id'] = this.items.id
        axios.get('/api/tagTermsList', {
          params: params
        }).then((res) => {
          this.tagTermsList = res.data
          this.tags = []
          Object.keys(this.tagTermsList).forEach(function (key) {
            this.tags.push(this.tagTermsList[key].tag_id)
          }, this)
          this.setTagTermsList()
        })
      },
      getTagById (id) {
        let params = {}
        params['id'] = id
        axios.get('/api/tag', {
          params: params
        }).then((res) => {
          this.editTags.id = res.data.id
          this.editTags.name = res.data.name
          this.editTags.color = res.data.color
        })
      },
      updateClient (addTagId, deleteTagId) {
        let params = {}
        Object.keys(this.items).forEach(function (key) {
          params[key] = this.items[key]
        }, this)
        params['addTagList'] = addTagId
        params['deleteTagList'] = deleteTagId
        axios.get('/api/clients/update', {
          params: params
        }).then((res) => {
          console.log('update')
        })
      },
      addClient (addTagId) {
        let params = {}
        Object.keys(this.items).forEach(function (key) {
          params[key] = this.items[key]
        }, this)
        params['addTagList'] = addTagId
        params['sort'] = this.sort
        axios.get('/api/clients/add', {
          params: params
        }).then((res) => {
          this.$set(this.items, 'id', res.data.clientId)
          this.$router.replace('/client/' + res.data.clientId)
          console.log('add')
        })
      },
      deleteClient () {
        let params = {}
        params['id'] = this.items.id
        axios.get('/api/clients/delete', {
          params: params
        }).then((res) => {
          this.$router.replace('/')
          console.log('delete')
        })
      },
      updateTag () {
        let params = {}
        Object.keys(this.editTags).forEach(function (key) {
          params[key] = this.editTags[key]
        }, this)
        axios.get('/api/tag/update', {
          params: params
        }).then((res) => {
          this.getTagTermsList()
          console.log('update tag')
        }).catch((err) => {
          console.log(err)
        })
      },
      addTag () {
        let params = {}
        params['name'] = this.editTags.name
        params['color'] = this.editTags.color
        axios.get('/api/tag/add', {
          params: params
        }).then((res) => {
          console.log('add')
        })
      },
      deleteTag () {
        let params = {}
        params['id'] = this.editTags.id
        axios.get('/api/tag/delete', {
          params: params
        }).then((res) => {
          console.log('delete')
        })
      },
      deleteTagTerms (deleteTagId) {
        let params = {}
        params['client_id'] = this.items.id
        params['deleteTagList'] = deleteTagId
        axios.get('/api/tagTerms/delete', {
          params: params
        }).then((res) => {
          this.getTagTermsList()
          console.log('delete')
        })
      },
      initTag () {
        this.editTags.id = ''
        this.editTags.name = ''
        this.editTags.color = '#BDC3C8'
      },
      selectedTags () {
        const tagTermsList = this.getTagTermsArray()
        let arrayDiff = null
        let deleteTagId = null
        let addTagId = null
        if (tagTermsList) {
          arrayDiff = this.array_diff(tagTermsList, this.tags)
          deleteTagId = arrayDiff[0]
        }
        arrayDiff = this.array_diff(this.tags, tagTermsList)
        addTagId = arrayDiff[0]

        if (deleteTagId) {
          this.tagTermsList = this.tagTermsList.filter(function (item) {
            return item.tag_id !== deleteTagId
          })
        }
        if (addTagId) {
          Object.keys(this.tagList).forEach(function (key) {
            if (this.tagList[key].id === addTagId) {
              this.tagTermsList.push(this.tagList[key])
            }
          }, this)
        }
      },
      registerClient () {
        const tagTermsList = this.$store.state.tagTerms
        let deleteTagId = []
        let addTagId = []
        if (tagTermsList) {
          deleteTagId = this.array_diff(tagTermsList, this.tags)
        }
        addTagId = this.array_diff(this.tags, tagTermsList)

        if (this.items.id) {
          this.updateClient(addTagId, deleteTagId)
          this.getClient()
        } else {
          this.addClient(addTagId)
        }
      },
      registerTag (mode) {
        if (mode == 'delete') {
          this.deleteTag()
          let deleteTagId = [this.editTags.id]
          this.deleteTagTerms(deleteTagId)
        } else {
          if (this.editTags.id) {
            this.updateTag()
          } else {
            this.addTag()
          }
        }
        this.initTag()
        this.getTagList()
        this.tabSlide('0')
      },
      closeMenu () {
        this.initTag()
        this.menu = false
      },
      editTabSlide (id) {
        this.getTagById(id)
        this.tabSlide('1')
      },
      addTabSlide () {
        this.initTag()
        this.tabSlide('1')
      },
      tabSlide (index) {
        this.active = index
      },
      remove (tagId) {
        this.tagTermsList = this.tagTermsList.filter(function (item) {
          return item.tag_id !== tagId
        })

        this.tags = this.tags.filter(function (item) {
          return item !== tagId
        })
      },
      resetForm () {
        this.client = Object.assign({}, this.defaultClient)
        this.$refs.form.reset()
      },
      submit () {
        this.$validator.validateAll().then(result => {
          if (result) {
            this.registerClient()
          }
        })
      },
      deleteBtn () {
        confirm('クライアントを削除しますか?') && this.deleteClient()
      },
      cancel () {
        // hoverのデザインのため
        return false
      },
      async setTagTermsList() {
        try {
          await this.$store.dispatch('setTagTerms', {
            tagTerms: this.tags
          })
        } catch (e) {
          console.log('dispatch error')
        }
      },
      getTagTermsArray () {
        let tagTermsArray = []
        for (let k in this.tagTermsList) {
          tagTermsArray.push(this.tagTermsList[k].tag_id)
        }
        return tagTermsArray
      },
      array_diff (arr1) {
        let diffTagId = []
        let arr = {}

        arr1keys: for (let k1 in arr1) {
          for (let i = 1; i < arguments.length; i++) {
            arr = arguments[i]
            for (let k in arr) {
              if (arr[k] === arr1[k1]) {
                continue arr1keys
              }
            }
            diffTagId.push(arr1[k1])
          }
        }

        return diffTagId
      }
    }
  }
</script>