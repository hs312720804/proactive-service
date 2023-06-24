<template>
  <div class="flowchart-component-wrapper">
    <div class="flowchart-render-container">flowchart-render-container</div>
    <FlowComposition></FlowComposition>
    <Operate></Operate>
    <Detail class="detail-wrapper"></Detail>
  </div>
</template>
<script>
import FlowComposition from '@/components/Flow/Composition'
import Operate from '@/components/Flow/Operate'
import Detail from '@/components/Flow/Detail'

export default {
  components: {
    FlowComposition,
    Operate,
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

    }
  },
  computed: {
    isEdit () {
      return this.statu === 'edit'
    }
  }
}
</script>
<style lang="stylus" scoped>
.flowchart-component-wrapper {
  .detail-wrapper {

  }
}
</style>
