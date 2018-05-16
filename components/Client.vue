<template>
  <div>
    <v-toolbar tabs>
      <v-icon>recent_actors</v-icon>
      <v-toolbar-title class="mr-1">{{ client.name }}</v-toolbar-title>
      <div class="text-xs-center">
        <v-chip
          v-for="(tagTerm, index) in tagTermsList"
          :key="index"
          :style="{ backgroundColor: tagTerm.color, borderColor: tagTerm.color }"
          text-color="white"
        >
          {{ tagTerm.name }}
        </v-chip>
      </div>
      <v-spacer></v-spacer>
      <v-btn icon @click.native="show = !show">
        <v-icon>{{ !show ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}</v-icon>
      </v-btn>
      <v-btn icon :to="client.id | editLink">
        <v-icon>mode_edit</v-icon>
      </v-btn>
      <v-tabs
        color="tranparent"
        slot="extension"
        v-model="tab"
        align-with-title
      >
        <v-tabs-slider color="primary"></v-tabs-slider>
        <v-tab v-for="(tab, tabIndex) in tabs" :key="tabIndex" v-show="client[tabIndex].length > 0">
          {{ tab }}
        </v-tab>
      </v-tabs>
    </v-toolbar>
    <v-slide-y-transition>
      <v-tabs-items v-model="tab" class="white elevation-1" v-show="show">
        <v-tab-item v-for="(tab, tabItemIndex) in tabs" :key="tabItemIndex" v-show="client[tabItemIndex].length > 0" lazy>
          <tab-content :tabContents="client[tabItemIndex]"></tab-content>
        </v-tab-item>
      </v-tabs-items>
    </v-slide-y-transition>
  </div>
</template>

<script>
  import axios from 'axios'
  import TabContent from '~/components/TabContent'
  export default {
    components: {
      TabContent
    },
    props: ['client', 'initShow'],
    data () {
      return {
        tab: null,
        tabs: this.$store.state.tabs,
        tagTermsList: [],
        show: this.initShow
      }
    },
    created: function () {
      this.getTagTermsList()
    },
    filters: {
      editLink(value) {
        return '/client/' + value
      }
    },
    methods: {
      getTagTermsList () {
        let params = {}
        params['client_id'] = this.client.id
        axios.get('/api/tagTermsList', {
          params: params
        }).then((res) => {
          this.tagTermsList = res.data
        })
      }
    }
  }
</script>