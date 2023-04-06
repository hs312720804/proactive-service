<template>
  <BaseListPro
    :menu-id="menuId"
    :fetch-method="commonFetch"
    :menu-detail-method="getMenusDetail"
    :handle-resource="handleResource"
  ></BaseListPro>
</template>

<script>
import { BaseListPro } from '@cseed/ui-base-list-pro'
import extendBaseList from '@/mixins/extendBaseList'
import commonFetch from 'cseed-frame/services/_fetch'
import { getMenusDetail } from '@/services/common'
export default {
  props: ['menuId'],
  mixins: [extendBaseList],
  components: {
    BaseListPro
  },
  data () {
    return {
      commonFetch,
      getMenusDetail
    }
  }
}
</script>

<style>

</style>
