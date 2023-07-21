<template>
  <div class="flowchart-component-wrapper">
    <div class="anylise-filter-wrapper" v-if="!isEdit">
      <el-form :inline="true">
        <el-form-item>
          <el-radio-group v-model="anyliseFilterForm.versionId" size="medium">
            <el-radio-button
              v-for="(item) in anyliseVersionList"
              :key="item.id"
              :label="item.id"
            >{{ item.humanVersion }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="维度" style="margin-left: 20px">
          <el-radio-group v-model="anyliseFilterForm.dataType">
            <el-radio :label="1">PV</el-radio>
            <el-radio :label="2">UV</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="选择日期" style="margin-left: 20px">
          <el-date-picker
            v-model="anyliseFilterForm.time"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <Graph
      :showNodeDetail="showNodeDetail"
      @updateDetail="updateDetail"
    ></Graph>
    <Detail
      v-if="showDetail"
      class="detail-wrapper"
      :showNodeDetail.sync="showNodeDetail"
      @update:showNodeDetail="showNodeDetail = $event"
    ></Detail>
  </div>
</template>
<script>
import store from 'cseed-frame/store/_index'
import Graph from '@/components/Flow/Graph'
import Detail from '@/components/Flow/Detail'
import { getAnyliseVersionListAPI } from '@/services/anylise'
export default {
  components: {
    Graph,
    Detail
  },
  props: {
    statu: { // edit, anylise
      type: String,
      default: 'edit'
    },
    serviceId: {
      type: Number
    }
  },
  provide () {
    return {
      serviceId: this.serviceId
    }
  },
  data () {
    return {
      showNodeDetail: false,
      anyliseVersionList: [], // 分析版本列表 array
      anyliseFilterForm: {
        versionId: '',
        dataType: 1,
        time: '',
        beginTime: '',
        endTime: ''
      } // 分析筛选表单
    }
  },
  methods: {
    updateDetail (data) {
      this.showNodeDetail = data
    },
    search () {
      if (this.anyliseFilterForm.time) {
        this.anyliseFilterForm.beginTime = this.anyliseFilterForm.time[0]
        this.anyliseFilterForm.endTime = this.anyliseFilterForm.time[1]
      }
      this.anyliseFilterForm.serviceId = this.serviceId
      store.commit('flow/setAnyliseFilterForm', this.anyliseFilterForm)
    },
    async getAnyliseVersionList () {
      try {
        const res = await getAnyliseVersionListAPI({
          serviceId: Number(this.serviceId) // 19Number(this.serviceId)
        })
        if (res.code === 1000) {
          // console.debug('getAnyliseVersionList res: ', res)
          this.anyliseVersionList = res.data
          // this.versionList = res.data
        }
      } catch (error) {
        console.error('getAnyliseVersionList error: ', error)
      }
    },
    initVuexListen () {
      store.subscribe((mutation, state) => {
        if (mutation.type === 'flow/initAnyliseData') { // 初始化分析数据
          if (mutation.payload.serviceId !== this.serviceId) return
          this.initSelectedVersion()
          this.search()
        }
      })
    },
    async initAnylise () {
      // （1）获取版本列表
      await this.getAnyliseVersionList()
    },
    initSelectedVersion () {
      // （2）初始化选中版本
      if (this.anyliseVersionList.length > 0) {
        this.anyliseFilterForm.versionId = this.anyliseVersionList[this.anyliseVersionList.length - 1].id
      }
    }
  },
  watch: {
    anyliseVersionList (newVal, oldVal) {
      if (newVal.length > 0) {
        this.anyliseFilterForm.versionId = newVal[newVal.length - 1].id
        this.initSelectedVersion()
        this.search()
      }
    }
  },
  mounted () {
    this.initVuexListen()
  },
  async created () {
    await this.initAnylise()
  },
  computed: {
    isEdit () {
      return this.$route.query.mode === 'edit'
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
  .anylise-filter-wrapper {
    margin-bottom 10px
  }
}
</style>
