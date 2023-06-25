<template>
  <div class="flowchart-component-wrapper">
    <Graph :serviceId="serviceId" :showNodeDetail="showNodeDetail" @updateDetail="updateDetail"></Graph>
    <Detail
      v-if="showDetail"
      class="detail-wrapper"
      :showNodeDetail.sync="showNodeDetail"
      @update:showNodeDetail="showNodeDetail = $event"
    ></Detail>
  </div>
</template>
<script>
import Graph from '@/components/Flow/Graph'
import Detail from '@/components/Flow/Detail'

export default {
  components: {
    Graph,
    Detail
  },
  props: {
    statu: { // edit, view
      type: String,
      default: 'edit'
    },
    serviceId: {
      type: Number
    }
  },
  data () {
    return {
      showNodeDetail: false
    }
  },
  methods: {
    updateDetail (data) {
      console.debug('updateDetail', data)
      this.showNodeDetail = data
    }
  },
  computed: {
    isEdit () {
      return this.statu === 'edit'
    },
    showDetail () {
      return this.showNodeDetail && this.isEdit
    }
  }
}
</script>
<style lang="stylus" scoped>
.flowchart-component-wrapper {
  display block
  width 100%
  height 68vh
  .detail-wrapper {

  }
}
</style>
