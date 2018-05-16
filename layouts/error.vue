<template>
  <v-jumbotron>
    <v-container fluid fill-height class="pa-0">
      <v-layout fill-height align-center justify-center>
        <v-flex xs12 sm8 md4>
          <h1 v-if="error.statusCode === 404" class="display-4 mb-1 text--disabled">404</h1>
          <h1 v-else class="display-4 mb-1 text--disabled">Error</h1>
          <h1 v-if="error.statusCode === 404" class="mb-4 headline text--disabled">Page Not Found</h1>
          <v-btn large color="error" @click="goToHome">ホーム</v-btn>
        </v-flex>
      </v-layout>
    </v-container>
  </v-jumbotron>
</template>

<script>
  export default {
    props: ['error'],
    layout: 'default',
    methods: {
      goToHome: function (index, event) {
        this.$router.replace({ path: '/' })
      }
    }
  }
</script>