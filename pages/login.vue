<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm8 md4>
      <v-card flat color="transparent" class="text-xs-center">
        <v-layout
          column
          align-center
          justify-center
          class="white--text"
        >
          <img src="/logo/heart01.gif" height="50px" width="50px">
          <h1 class="white--text mb-2 display-1 text-xs-center" v-text="title"></h1>
        </v-layout>
        <v-form @submit.prevent="submit">
          <v-card-text>
            <v-text-field
              v-model="name"
              prepend-icon="person"
              label="ユーザー名"
              :error-messages="errors.collect('name')"
              :counter="10"
              v-validate="'required|max:10'"
              data-vv-name="name"
              type="text"
              required
              dark
            ></v-text-field>
            <v-text-field
              v-model="password"
              prepend-icon="lock"
              label="パスワード"
              :error-messages="errors.collect('password')"
              v-validate="'required'"
              data-vv-name="password"
              type="password"
              required
              dark
            ></v-text-field>
            <v-alert
              v-if="error"
              outline color="error"
              icon="warning"
              :value="true"
              transition="scale-transition"
            >
              {{ error }}
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <!-- <v-btn round light @click="clear">クリア</v-btn> -->
            <v-btn block color="light-blue darken-3" type="submit">ログイン</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    layout: 'login',
    $_veeValidate: {
      validator: 'new'
    },
    data: () => ({
      title: 'Client Manager',
      name: '',
      password: '',
      error: null,
      dictionary: {
        custom: {
          name: {
            required: () => 'ユーザー名を入力してください',
            max: 'ユーザ名は10文字以内で入力してください'
          },
          password: {
            required: 'パスワードを入力してください'
          }
        }
      }
    }),
    props: {
      source: String
    },
    mounted () {
      this.$validator.localize('en', this.dictionary)
      // ログイン済の場合
      if (this.$store.state.authUser) {
        this.name = this.$store.state.authUser.name
        this.password = this.$store.state.authUser.password
      }
    },
    methods: {
      submit () {
        this.$validator.validateAll().then(result => {
          if (result) {
            this.login()
          }
        }).catch(() => {
          this.error = 'エラーが発生しました。もう一度ログインしてください'
        })
      },
      clear () {
        this.name = ''
        this.password = ''
        this.error = null
        this.$validator.reset()
      },
      async login() {
        try {
          await this.$store.dispatch('login', {
            name: this.name,
            password: this.password
          })
          this.$router.replace('/')
        } catch (e) {
          this.error = e.message
        }
      },
      async logout() {
        try {
          await this.$store.dispatch('logout')
        } catch (e) {
          console.log(e.message)
        }
      }
    }
  }
</script>