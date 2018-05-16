<template>
  <v-app dark id="inspire">
    <v-jumbotron height="100%">
      <!--<transition appear name="login" :duration="1000">-->
        <video-bg :sources="[videoSource]">
          <v-jumbotron
            :gradient="gradient"
            height="100%"
          >
            <v-container fluid fill-height class="pa-0">
              <nuxt/>
            </v-container>
          </v-jumbotron>
        </video-bg>
      <!--</transition>-->
    </v-jumbotron>
  </v-app>
</template>
<script>
  export default {
    data: () => ({
      gradient: 'to right, rgba(35, 37, 38, .5), rgba(65, 67, 69, .5)',
      video: '/movie/cover'
    }),
    computed: {
      videoSource () {
        const min = 1
        const max = 11
        const number = Math.floor(Math.random() * (max + 1 - min)) + min
        return this.video + number + '.mp4'
      }
    }
  }
</script>
<style>
  .login-enter-active, .login-leave-active {
    transition: opacity .5s
  }

  .login-enter, .login-leave-to {
    opacity: 0
  }
</style>