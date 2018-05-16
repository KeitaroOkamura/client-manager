<template>
  <div>
    <client-form :client="clients"></client-form>
    <div v-if="clients.id">
      <client-system-form :client-id="clients.id" :system="clients['system']"></client-system-form>
      <client-server-form :client-id="clients.id" :server="clients['server']"></client-server-form>
      <client-ftp-form :client-id="clients.id" :ftp="clients['ftp']"></client-ftp-form>
      <client-database-form :client-id="clients.id" :database="clients['database']"></client-database-form>
      <client-access-form :client-id="clients.id" :access="clients['access']"></client-access-form>
      <client-analytics-form :client-id="clients.id" :analytics="clients['analytics']"></client-analytics-form>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import ClientForm from '~/components/ClientForm'
  import ClientSystemForm from '~/components/ClientSystemForm'
  import ClientServerForm from '~/components/ClientServerForm'
  import ClientFtpForm from '~/components/ClientFtpForm'
  import ClientDatabaseForm from '~/components/ClientDatabaseForm'
  import ClientAccessForm from '~/components/ClientAccessForm'
  import ClientAnalyticsForm from '~/components/ClientAnalyticsForm'

  export default {
    components: {
      ClientForm,
      ClientSystemForm,
      ClientServerForm,
      ClientFtpForm,
      ClientDatabaseForm,
      ClientAccessForm,
      ClientAnalyticsForm
    },
    validate({ params }) {
      return !isNaN(+params.id)
    },
    asyncData ({env, route, params, error}) {
      return axios.get(`${env.baseUrl}/api/client/${params.id}`)
        .then((res) => {
          return {clients: res.data}
        })
        .catch((e) => {
          return {clients: null, message: 'ページが見つかりません'}
        })
    },
    data () {
      return {
        clients: {}
      }
    }
  }
</script>