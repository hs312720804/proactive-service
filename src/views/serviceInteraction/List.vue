<template>
  <div class="list-page-wrapper">
    <ul class="services-list-wrapper">
      <li
        class="list-item-wrapper"
        v-for="(item, index) in listArr"
        :key="index"
        @click="handleCommand('open_' + index)"
      >
        <img
          class="list-img"
          :src="item.img"
          alt=""
        />
        <div class="content-wrapper">
          <p class="title">{{ item.serviceName }}</p>
          <p class="desc">{{ item.remark }}</p>
        </div>
        <div
          class="more"
          @click.stop
        >
          <el-dropdown
            placement="bottom-end"
            trigger="click"
            :hide-on-click="true"
            @command="handleCommand"
          >
            <i class="el-icon-more"></i>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="'open_' + index">打开</el-dropdown-item>
              <el-dropdown-item :command="'anylise_' + index">分析</el-dropdown-item>
              <el-dropdown-item :command="'edit_' + index">编辑</el-dropdown-item>
              <el-dropdown-item :command="'attrConfig_' + index">属性配置</el-dropdown-item>
              <!-- status 1上架 0下架 -->
              <!-- v-permission="accessMap.offShell" -->
              <el-dropdown-item
                v-if="item.status === 1"
                :command="'withDraw_' + index"
                :disabled="!accessMap.offShell"
              >下架</el-dropdown-item>
              <el-dropdown-item
                v-else-if="item.status === 0"
                :command="'onShelve_' + index"
                :disabled="!accessMap.interaction_onshell"
              >上架</el-dropdown-item>
              <el-dropdown-item
                :command="'delete_' + index"
                :disabled="!accessMap.delete"
              >删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </li>
      <li
        class="list-item-wrapper add-wrapper"
        @click="add"
        v-if="accessMap.add"
      >
        <i class="el-icon-plus add-icon"></i>
        <p class="add-desc">添加服务</p>
      </li>
    </ul>
    <!-- 属性配置会话框 -->
    <AttrConfig
      v-model="attrConfigDialog"
      :serId="listArr[activeIndex]?.id"
    ></AttrConfig>
    <!-- 编辑服务 || 新增服务 会话框 -->
    <DiglogType
      v-model="editDialog"
      :diglogConfig="diglogConfig"
      @updateServeList="initList"
    ></DiglogType>
  </div>
</template>
<script>
import DiglogType from './DiglogType'
import AttrConfig from './AttrConfig'
import { getServicesListAPI, deleteServicesAPI, onlineServiceAPI, offlineServiceAPI, getServiceAPI } from '@/services/services'
export default {
  components: {
    DiglogType,
    AttrConfig
  },
  data () {
    return {
      editDialog: false,
      attrConfigDialog: false,
      diglogConfig: {}, // 传入新增和编辑的对象
      showAddServiceDialog: false,
      listArr: [],
      activeIndex: -1
    }
  },
  computed: {
    // 所有权限
    accessMap () {
      return this.$store.getters.getAccessMap()
    }
  },
  methods: {
    async initList () {
      try {
        const res = await getServicesListAPI()
        if (res.code === 1000 && res.data) {
          this.listArr = res.data.map((item) => {
            return {
              ...item,
              img: item.imageUrl || 'https://images.pexels.com/photos/4321069/pexels-photo-4321069.jpeg?auto=compress&cs=tinysrgb&w=800'
            }
          })
        }
      } catch (error) {
        console.error('initList error', error)
      }
    },
    openService () {
      console.log('openService')
      const targetTabInfo = this.listArr[this.activeIndex]
      this.$store.commit('services/addTab', targetTabInfo)
      let router = this.$router
      if (window.__POWERED_BY_QIANKUN__) {
        router = this.$mainState.router
      }
      router.push({
        name: 'interaction-detail',
        query: {
          mode: 'edit'
        }
      })
    },
    anylise () {
      // console.log('anylise')
      const targetTabInfo = this.listArr[this.activeIndex]
      // console.debug('anylise targetTabInfo', targetTabInfo)
      this.$store.commit('services/addTab', targetTabInfo)
      let router = this.$router
      if (window.__POWERED_BY_QIANKUN__) {
        router = this.$mainState.router
      }
      router.push({
        name: 'interaction-detail',
        query: {
          mode: 'anylise'
        }
      })
    },
    async onShelve () { // 上架
      try {
        const res = await onlineServiceAPI({
          id: Number(this.listArr[this.activeIndex].id)
        })
        if (res.code === 1000) {
          this.initList()
          this.$message({
            type: 'success',
            message: res.msg
          })
        }
      } catch (error) {
        console.error('onShelve error', error)
      }
    },
    // 服务编辑
    edit () {
      this.editDialog = true
      this.diglogConfig = {
        title: '服务编辑',
        diglogType: 'edit',
        serId: this.listArr[this.activeIndex]?.id
      }
    },
    // 属性配置
    attrConfig () {
      this.attrConfigDialog = true
    },
    async withDraw () { // 下架
      try {
        const res = await offlineServiceAPI({
          id: Number(this.listArr[this.activeIndex].id)
        })
        console.debug('withDraw res', res)
        if (res.code === 1000) {
          this.initList()
          this.$message({
            type: 'success',
            message: res.msg
          })
        } else {
          console.error('withDraw code !== 0', res)
        }
      } catch (error) {
        console.error('withDraw error', error)
      }
    },
    async deleteService () {
      try {
        const res = await deleteServicesAPI({
          id: Number(this.listArr[this.activeIndex].id)
        })
        console.debug('deleteServicesAPI res', res)
        if (res.code === 1000) {
          this.initList()
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        } else {
          console.error('deleteServicesAPI code !== 0', res)
        }
      } catch (error) {
        console.error('deleteServicesAPI error', error)
      }
      // confirm
      // const h = this.$createElement
      // this.$msgbox({
      //   title: '提示',
      //   closeOnClickModal: false,
      //   message: h('div', null, [
      //     h('p', null, [
      //       h('i', { class: 'el-icon-warning', style: 'color: #faad14;margin-right: 5px' }, ''),
      //       h('span', null, '该服务包含以下版本, 不能删除。 ')
      //     ]),
      //     h('p', null, 'v1 '),
      //     h('p', null, 'v2'),
      //     h('p', null, 'v3 ')
      //   ]),
      //   showCancelButton: true,
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消'
      // }).then(async action => {
      //   this.$message({
      //     type: 'info',
      //     message: 'action: ' + action
      //   })
      // })
    },
    handleCommand (commandStr) {
      console.debug('handleCommand', commandStr)
      this.activeIndex = commandStr.split('_')[1]
      const command = commandStr.split('_')[0]
      switch (command) {
        case 'open':
          this.openService()
          break
        case 'anylise':
          this.anylise()
          break
        case 'edit':
          this.edit()
          break
        case 'attrConfig':
          this.attrConfig()
          break
        case 'withDraw':
          this.withDraw()
          break
        case 'onShelve':
          this.onShelve()
          break
        case 'delete':
          this.deleteService()
          break
        default:
          this.openService()
          break
      }
    },
    add () {
      this.editDialog = true
      this.diglogConfig = {
        title: '新增服务',
        diglogType: 'add'
      }
    }
    // async getFirstService (payload) {
    //   try {
    //     const res = await getServiceAPI(payload)
    //     console.debug('getFirstService res', res)
    //   } catch (error) {
    //     console.error('getFirstService error', error)
    //   }
    // }
  },
  async created () {
    await this.initList()
  }
}
</script>
<style lang="stylus" scoped>
ul
  margin-block-start 0
  margin-block-end 0
  padding-inline-start 0
  padding-inline-end 0
  li
    list-style none
.list-page-wrapper
  width 100%
  min-height 100%
  background-color #fff
  padding 20px
  box-sizing border-box
  position relative
  .services-list-wrapper
    display flex
    flex-wrap wrap
    flex-direction row
    .list-item-wrapper
      width 250px
      height 300px
      box-shadow 0 2px 12px 0 rgba(0, 0, 0, 0.1)
      margin-right 30px
      margin-bottom 30px
      display flex
      flex-direction column
      position relative
      cursor pointer
      &.add-wrapper
        border 1px dotted #999
        display flex
        justify-content center
        align-items center
        flex-direction column
        cursor pointer
        .add-icon
          font-size 60px
          color #999
          margin-bottom 20px
        .add-desc
          font-size 15px
          color #999
      .list-img
        width 100%
        height 150px
      .content-wrapper
        width 100%
        flex 1
        padding 20px
        box-sizing border-box
        .title
          font-size 15px
          color #000
          font-family PingFangSC-Medium
          font-weight 500
        .desc
          font-size 12px
          color #999
          font-family PingFangSC-Regular
          font-weight 400
      .more
        position absolute
        right 10px
        bottom 10px
        width 20px
        height 20px
        display block
        cursor pointer
        i
          font-size 20px
          color #999
          transform rotate(90deg)
</style>
