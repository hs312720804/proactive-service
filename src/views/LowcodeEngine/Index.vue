<template>
  <LowcodeEngine
    v-if="menuDetail"
    :menu-id="menuId"
    :menuDetail="menuDetail"
    :fetch-method="commonFetch"
    :_headers="headers"
    :page-detail-method="getLowerDetail"
    :handle-resource="handleResource"
  ></LowcodeEngine>
</template>
<script>
import { LowcodeEngine } from '@cseed/ui-lowcode-engine'
import { getMenusDetail, getLowerDetail } from '@/services/common'
import commonFetch from 'cseed-frame/services/_fetch'
import extendBaseList from '@/mixins/extendBaseList'
export default {
  name: 'lowerEngine',
  props: ['menuId'],
  mixins: [extendBaseList],
  components: {
    LowcodeEngine
  },
  data () {
    return {
      commonFetch,
      getMenusDetail,
      getLowerDetail,
      menuDetail: '',
      headers: () => {
        return this.$store.getters.httpHeaders
      }
    }
  },
  created () {
    this.getMenusDetail({ id: this.menuId }).then(rs => {
      this.menuDetail = rs.data
    })
  }
}
</script>
