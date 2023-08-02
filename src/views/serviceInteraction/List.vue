<template>
  <div class="list-page-wrapper">
    <ul class="services-list-wrapper">
      <li
        class="list-item-wrapper"
        v-for="(item, index) in listArr"
        :key="index"
        @click="handleCommand('open_' + index)"
      >
        <img class="list-img" :src="item.img" alt="" />
        <div class="content-wrapper">
          <p class="title">{{ item.serviceName }}</p>
          <p class="desc">{{ item.remark }}</p>
        </div>
        <div class="more" @click.stop>
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
              <!-- status 1上架 0下架 -->
              <!-- v-permission="accessMap.offShell" -->
              <el-dropdown-item v-if="item.status === 1" :command="'withDraw_' + index">下架</el-dropdown-item>
              <el-dropdown-item v-else-if="item.status === 0" :command="'onShelve_' + index">上架</el-dropdown-item>
              <el-dropdown-item :command="'delete_' + index">删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </li>
      <li class="list-item-wrapper add-wrapper" @click="add">
        <i class="el-icon-plus add-icon"></i>
        <p class="add-desc">添加服务</p>
      </li>
    </ul>
    <el-dialog
      title="新建服务"
      :visible.sync="showAddServiceDialog"
      width="50%"
      :close-on-click-modal="false"
      @close="closeAddServiceDialog"
    >
      <el-form :model="servicesForm" :rules="rule" ref="servicesForm">
        <el-form-item label="服务名" label-width="150" prop="serviceName">
          <el-input v-model="servicesForm.serviceName" placeholder="请输入" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="服务标识" label-width="150" prop="serviceKey">
          <el-input v-model="servicesForm.serviceKey" placeholder="请输入" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="描述" label-width="150">
          <el-input
            autocomplete="off"
            :rows="5"
            v-model="servicesForm.remark"
            placeholder="请输入备注"
            type="textarea"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAddServiceDialog = false">取 消</el-button>
        <el-button type="primary" @click="confirmAddService">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getServicesListAPI, addServicesAPI, deleteServicesAPI, onlineServiceAPI, offlineServiceAPI, getServiceAPI } from '@/services/services'
export default {
  data () {
    return {
      showAddServiceDialog: false,
      listArr: [],
      activeIndex: -1,
      servicesForm: {
        serviceName: '',
        serviceKey: '',
        remark: ''
      },
      rule: {
        serviceName: [
          { required: true, message: '请输入服务名', trigger: 'blur' },
          { min: 1, max: 50, message: '不可超过50字符', trigger: 'blur' }
        ],
        serviceKey: [
          { required: true, message: '请输入服务标识', trigger: 'blur' },
          { pattern: /^[a-zA-Z][\w]{0,49}$/, message: '仅支持字母、数字、下划线,首字符必须为字母,不可超过50字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    accessMap () { // 所有权限
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
              img: 'https://images.pexels.com/photos/4321069/pexels-photo-4321069.jpeg?auto=compress&cs=tinysrgb&w=800'
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
      this.$router.push({
        path: '/interaction-detail',
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
      this.$router.push({
        path: '/interaction-detail',
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
      this.showAddServiceDialog = true
    },
    confirmAddService () {
      this.$refs.servicesForm.validate(async valid => {
        if (valid) {
          this.showAddServiceDialog = false
          const res = await addServicesAPI(this.servicesForm)
          console.debug('addServicesAPI res', res)
          if (res.code === 1000) {
            this.initList()
            this.$message({
              type: 'success',
              message: '添加成功!'
            })
          }
        } else {
          return false
        }
      })
    },
    closeAddServiceDialog () {
      this.servicesForm = {
        serviceName: '',
        remark: ''
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
ul {
    margin-block-start 0
    margin-block-end 0
    padding-inline-start 0
    padding-inline-end 0
    li {
        list-style none
    }
}
.list-page-wrapper {
    width 100%
    min-height 100%
    background-color #fff
    padding 20px
    box-sizing border-box
    position relative
    .services-list-wrapper {
        display flex
        flex-wrap wrap
        flex-direction row
        .list-item-wrapper {
            width 250px
            height 300px
            box-shadow 0 2px 12px 0 rgba(0,0,0,.1)
            margin-right 30px
            margin-bottom 30px
            display flex
            flex-direction column
            position relative
            cursor pointer
            &.add-wrapper {
                border 1px dotted #999
                display flex
                justify-content center
                align-items center
                flex-direction column
                cursor pointer
                .add-icon {
                    font-size 60px
                    color #999
                    margin-bottom 20px
                }
                .add-desc {
                    font-size 15px
                    color #999
                }
            }
            .list-img {
                width 100%
                height 150px
            }
            .content-wrapper {
                width 100%
                flex 1
                padding 20px
                box-sizing border-box
                .title {
                    font-size 15px
                    color #000
                    font-family PingFangSC-Medium
                    font-weight 500
                }
                .desc {
                    font-size 12px
                    color #999
                    font-family PingFangSC-Regular
                    font-weight 400
                }
            }
            .more {
                position absolute
                right 10px
                bottom 10px
                width 20px
                height 20px
                display block
                cursor pointer
                i {
                    font-size 20px
                    color #999
                    transform rotate(90deg)
                }
            }
        }
    }
}
</style>
