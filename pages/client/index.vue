<template>
  <div>
    <client-form :client="clients"></client-form>
  </div>
</template>

<script>
  import ClientForm from '~/components/ClientForm'

  export default {
    components: {
      ClientForm
    },
    data () {
      return {
        clients: []
      }
    }
  }
</script>