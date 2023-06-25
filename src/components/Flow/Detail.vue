<template>
  <div class="graph-info-detail-component">
    <!-- :wrapperClosable="false" -->
    <el-drawer
      title="标题"
      :visible.sync="showBool"
      :direction="direction"
      :before-close="handleClose"
      :close-on-press-escape="false"
      :modal-append-to-body="false"
      :wrapperClosable="true"
      :modal="false"
      :size="400"
    >
      <span>我来啦!</span>
    </el-drawer>
  </div>
</template>
<script>
export default {
  props: {
    showNodeDetail: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      direction: 'rtl',
      showBool: this.showNodeDetail
    }
  },
  methods: {
    handleClose (done) {
      // if (true) { // 业务判断
      //   done()
      //   this.$emit('updateDetail', true)
      // }
      done()
      this.$emit('update:showNodeDetail', this.showBool)
    }
  }
}
</script>
<style lang="stylus" scoped></style>
