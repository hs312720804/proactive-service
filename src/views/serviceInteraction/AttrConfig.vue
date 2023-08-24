<template>
  <el-dialog
    title="属性配置"
    :visible.sync="attrConfigDialog"
    width="1000px"
    :close-on-click-modal="false"
    @close="handleClose"
    @open="initTagAttrsList"
  >
    <div><span style="color: red">*</span> 添加属性：</div>
    <el-form
      class="attrConfigForm"
      :model="attrConfigForm"
      :rules="attrConfigRule"
      ref="attrConfigRef"
      :inline="true"
      :hide-required-asterisk="true"
    >
      <el-form-item label="属性key" prop="attrKey">
        <el-input v-model="attrConfigForm.attrKey" style="width: 100px"></el-input>
      </el-form-item>
      <el-form-item label="属性名" prop="attrName">
        <el-input v-model="attrConfigForm.attrName" style="width: 100px"></el-input>
      </el-form-item>
      <el-form-item label="参数类型" prop="attrType">
        <el-select v-model="attrConfigForm.attrType" placeholder="请选择" @change="handleTypeChange" style="width: 120px">
          <el-option
            v-for="item in attrConfigTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="默认值" prop="defValue">
        <el-radio-group v-if="showDefaultValItem(1)" v-model="attrConfigForm.defValue" style="width: 168px">
          <el-radio label="1">开</el-radio>
          <el-radio label="0">关</el-radio>
        </el-radio-group>
        <el-input v-if="showDefaultValItem(2)" v-model="attrConfigForm.defValue" @input="handleIntInput" style="width: 168px"></el-input>
        <el-time-picker
          v-if="showDefaultValItem(3)"
          v-model="attrConfigForm.defValue"
          placeholder="请选择时间"
          format="HH:mm"
          value-format="HH:mm"
          :editable="false"
          style="width: 168px"
        >
        </el-time-picker>
        <el-input
          v-if="showDefaultValItem(4)"
          v-model="attrConfigForm.defValue"
          @input="handleVolumeInput"
          style="width: 168px"
        >
        </el-input>
        <el-input v-if="showDefaultValItem(5)" v-model="attrConfigForm.defValue" style="width: 168px"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleAddAttr">添加</el-button>
      </el-form-item>
    </el-form>
    <!-- 已添加监控表格 -->
    <div><span style="color: red">*</span> 已添加监控：</div>
    <el-table :data="attrConfigData" style="width: 100%; margin-top: 30px;">
      <el-table-column prop="attrId" label="ID" width="80"></el-table-column>
      <el-table-column prop="attrKey" label="key"></el-table-column>
      <el-table-column prop="attrName" label="属性名"></el-table-column>
      <el-table-column prop="defValue" label="默认值"></el-table-column>
      <el-table-column prop="attrType" label="类型" :formatter="typeFormatter"></el-table-column>
      <el-table-column prop="createrUserName" label="创建人" width="200"></el-table-column>
      <el-table-column label="操作" width="80">
        <template slot-scope="scope">
          <span v-if="!scope.row.canDelFlag" class="disableDel">不可删除</span>
          <el-popconfirm
            v-if="scope.row.canDelFlag"
            confirm-button-text='确认'
            cancel-button-text='取消'
            @confirm="handleAttrDel(scope.row)"
            icon="el-icon-info"
            icon-color="red"
            title="确认删除吗？"
          >
            <span slot="reference" class="enableDel">删除</span>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <span slot="footer" class="dialog-footer">
      <el-button @click="compete" type="primary">完成</el-button>
    </span>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, defineProps, defineEmits, computed, onMounted, getCurrentInstance } from 'vue'
import { getTagAttrsList, addTagAttrs, delTagAttrs } from '@/services/attr.js'

// 获取绑定到vue实例对象上的 proxy.$message
const { proxy } = getCurrentInstance()

const props = defineProps({
  value: {
    type: Boolean
  },
  serId: {
    type: Number
  }
})

const emit = defineEmits(['input'])

const attrConfigDialog = computed({
  get () {
    return props.value
  },
  set (newVal) {
    console.log(newVal, 'set')
    emit('input', newVal)
  }
})

const attrConfigForm = reactive({
  attrKey: '', // 属性key
  attrName: '', // 属性名
  attrType: 2, // 参数类型，默认为整数类型
  defValue: '' // 默认值
})

// 获取attrConfig表单的DOM，用于数据校验和清除
const attrConfigRef = ref(null)

// 表单校验规则
const attrConfigRule = {
  attrName: [
    { required: true, message: '属性名不能为空', trigger: 'blur' }
  ],
  attrType: [
    { required: true, message: '参数类型不能为空', trigger: 'blur' }
  ],
  attrKey: [
    { required: true, message: 'key值不能为空', trigger: 'blur' }
  ]
}

const attrConfigTypes = [
  {
    value: 1,
    label: '开关'
  },
  {
    value: 2,
    label: '整数'
  },
  {
    value: 3,
    label: '时间'
  },
  {
    value: 4,
    label: '音量'
  },
  {
    value: 5,
    label: '字符'
  }
]

const attrConfigData = ref([])

const initTagAttrsList = async () => {
  console.log(props.serId)
  console.log('打开会话框')
  // 打开会话框就请求服务属性列表
  const { data } = await getTagAttrsList({ serId: props.serId })
  attrConfigData.value = data
  console.log(data, 'data')
}

// 添加属性 - 处理函数
const handleAddAttr = async () => {
  const valid = await attrConfigRef.value.validate().catch(() => false)
  if (!valid) return null
  const data = await addTagAttrs({ serviceId: props.serId, ...attrConfigForm })
  console.log(data)
  if (data.result === 'success') {
    proxy.$message({
      message: '添加成功',
      type: 'success',
      duration: 1000
    })
    // 重置添加属性的表单为初始值
    attrConfigRef.value.resetFields()
    // 重新初始化属性表格数据
    initTagAttrsList()
  } else {
    proxy.$message({
      message: data.msg,
      type: 'error',
      duration: 1000
    })
  }
}

// 属性配置对话框中点击删除已添加属性处理事件
const handleAttrDel = async (row) => {
  console.log('删除', row.attrId)
  const data = await delTagAttrs({ id: row.attrId })
  if (data.result === 'success') {
    proxy.$message({
      message: '删除成功',
      type: 'success',
      duration: 1000
    })
    // 重新初始化属性表格数据
    initTagAttrsList()
  } else {
    proxy.$message({
      message: data.msg,
      type: 'error',
      duration: 1000
    })
  }
}

// 点击完成处理函数
const compete = () => { attrConfigDialog.value = false }

// 选择参数类型后切换默认值的form-item展示，如选择时间类型，defVal的form-item展示time-picker
const showDefaultValItem = computed(() => {
  return function (type) {
    return attrConfigForm.attrType === type
  }
})

// 限制音量类型的默认值输入
const handleVolumeInput = (value) => {
  const reg = /^(100|[1-9]\d|\d)$/ // 定义正则表达式
  if (!reg.test(value)) {
    attrConfigForm.defValue = value.replace(/[^\d]/g, '') // 替换非数字字符为''
    if (+attrConfigForm.defValue > 100) {
      attrConfigForm.defValue = '100'
    }
  }
}

// 限制整数类型的默认值输入
const handleIntInput = (value) => {
  const reg = /^-?\d+$/ // 定义只能输入正负整数正则表达式
  if (!reg.test(value)) {
    attrConfigForm.defValue = value.replace(/[^\d-]/g, '') // 替换非数字和非负号字符为''
  }
}

// 属性配置对话框关闭，清空状态
const handleClose = (formName) => {
  attrConfigRef.value.resetFields()
  attrConfigRef.value.clearValidate()
}

// 属性类型格式化
const typeFormatter = (row) => {
  return attrConfigTypes.find((option) => option.value === row.attrType).label
}

// 属性配置参数类型选择器改变时的处理函数
const handleTypeChange = () => {
  // 清空已填写的默认值
  attrConfigForm.defValue = ''
}

</script>

<style lang="stylus" scoped>
.attrConfigForm {
  display flex
  justify-content center
  margin 20px
  .el-form-item {
    margin-right 18px
  }
}
.enableDel {
  color #1890ff
  cursor pointer
}
.disableDel{
  color #d1d1d1
  cursor not-allowed
}
.el-table /deep/ th.el-table__cell {
  background #f1f3f4
}

</style>
