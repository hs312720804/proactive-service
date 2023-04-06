<template>
  <BaseList
    :menu-id="menuId"
    :fetch-method="commonFetch"
    :menu-detail-method="getMenusDetail"
    :handle-resource="handleResource"
  ></BaseList>
</template>

<script>
import { BaseList } from '@cseed/ui-base-list'
import extendBaseList from '@/mixins/extendBaseList'
import commonFetch from 'cseed-frame/services/_fetch'
import { getMenusDetail } from '@/services/common'
export default {
  props: ['menuId'],
  mixins: [extendBaseList],
  components: {
    BaseList
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
