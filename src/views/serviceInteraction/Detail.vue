<template>
  <div class="detail-page-wrapper">
    <el-page-header
      @back="goBack"
      content="交互详情"
    ></el-page-header>
    <el-tabs
      v-if="show"
      style="margin-top: 10px;"
      v-model="activeTabId"
      type="card"
      @tab-remove="removeTab"
    >
      <el-tab-pane
        v-for="(item) in tabsArr"
        :key="item.id.toString()"
        :label="item.serviceName"
        :name="item.id.toString()"
        :closable="true"
        :lazy="true"
      >
        <Version
          v-show="mode === 'edit'"
          :serviceId="item.id"
        ></Version>
        <Flowchart :serviceId="item.id"></Flowchart>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import store from 'cseed-frame/store/_index'
import Version from '@/components/Version.vue'
import Flowchart from '@/components/Flowchart.vue'
export default {
  components: {
    Version,
    Flowchart
  },
  data () {
    return {
      activeTabId: '',
      tabsArr: [],
      tabIndex: 2,
      mode: 'edit',
      show: true
    }
  },

  methods: {
    init () {
      console.log('权限', this.$store.getters.getAccessMap())
      this.show = false
      this.tabsArr = store.getters.tabsArr
      this.activeTabId = store.getters.activeTab.id.toString()
      // console.debug(this.$route)
      this.mode = this.$route.query.mode
      // 每次 actived 的时候，初始化组件
      this.$nextTick(() => {
        this.show = true
      })
    },
    updateTabActiveIndex () {
      // store.commit('services/updateTabActiveIndex', )
    },
    goBack () {
      this.$router.go(-1)
    },
    removeTab (tabId) {
      const tabs = this.tabsArr
      let activeTabId = this.activeTabId
      if (activeTabId === tabId) {
        tabs.forEach((tab, index) => {
          if (tab.id.toString() === tabId) {
            const nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeTabId = nextTab.id.toString()
              store.commit('services/removeTab', index)
            } else {
              if (index === 0 && tabs.length === 1) {
                activeTabId = ''
                store.commit('services/removeTab', index)
                this.$router.push({
                  path: '/service-interaction'
                })
              }
            }
          }
        })
      } else {
        const index = tabs.findIndex(tab => tab.id.toString() === tabId)
        store.commit('services/removeTab', index)
      }
      this.activeTabId = activeTabId
      //   this.tabsArr = tabs.filter(tab => tab.id !== tabId)
    },
    addTab (targetName) {
      const newTabName = ++this.tabIndex + ''
      this.editableTabs.push({
        title: 'New Tab',
        name: newTabName,
        content: 'New Tab content'
      })
      this.editableTabsValue = newTabName
    }
  },
  created () {
    this.init()
  },
  activated () {
    this.init()
  }
}
</script>
<style lang="stylus" scoped>
.detail-page-wrapper
  width 100%
  // height 100%
  background-color #fff
  padding 20px
  box-sizing border-box
  // >>>.el-page-header {
  // .el-page-header__title {
  // font-size 16px
  // }
  // }
</style>
