<template>
  <el-dialog
    :title="diglogConfig.title"
    :visible.sync="FormDialog"
    width="900px"
    @open="initServeData"
    @close="handleClose"
    :close-on-click-modal="false"
  >
    <el-form
      class="form"
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="80px"
    >
      <el-form-item label="服务名" prop="serviceName">
        <el-input v-model="form.serviceName" placeholder="请输入"></el-input>
      </el-form-item>
      <el-form-item label="服务ID" prop="serviceKey">
        <el-input
          v-model="form.serviceKey"
          placeholder="服务的唯一标识，仅支持字母、数字、下划线，首字符必须为字母"
          :disabled="diglogConfig.diglogType === 'edit'"
        ></el-input>
      </el-form-item>
      <el-form-item class="upload-icon" label="图标" prop="imageUrl">
        <el-upload
          action="#"
          :http-request="handleIconUpload"
          name="icon"
          list-type="picture-card"
          :file-list="fileList"
          :onbefore-upload="beforeIconUpload"
          :on-preview="handleIconPreview"
          :on-remove="handleIconRemove"
          :on-exceed="handleUploadExceed"
          :limit="1"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible" append-to-body>
          <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
      </el-form-item>
      <el-form-item label="描述" prop="remark">
        <el-input type="textarea" :rows="3" placeholder="请输入备注" v-model="form.remark"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleComplete">完成</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, defineProps, defineEmits, computed, getCurrentInstance } from 'vue'
import { getServiceAPI, uploadServiceIcon, updateServiceAPI, addServicesAPI } from '@/services/services.js'

// 获取绑定到vue实例对象上的 proxy.$message
const { proxy } = getCurrentInstance()

const props = defineProps({
  value: {
    type: Boolean
  },
  diglogConfig: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['input', 'updateServeList'])

const FormDialog = computed({
  get () {
    return props.value
  },
  set (newVal) {
    emit('input', newVal)
  }
})

// 编辑表单的参数
const form = ref({
  serviceName: '', // 服务名称
  serviceKey: '', // 服务唯一标识
  imageUrl: '', // 图标地址
  remark: '' // 备注
})

// 展示图标
const fileList = ref([])

// 定义展示icon的diglog展示以及展示的icon图片地址
const dialogVisible = ref(false)
const dialogImageUrl = ref('')

// 定义校验serviceKey的规则规则
const validateEven = (rule, value, callback) => {
  const reg = /^[a-zA-Z][a-zA-Z0-9_]*$/
  if (value && !reg.test(value)) {
    callback(new Error('输入格式不正确，请输入字母、数字或下划线，首字符必须为字母'))
  } else {
    callback()
  }
}

// 服务编辑表单校验规则
const rules = {
  serviceName: [
    { required: true, message: '服务名不能为空', trigger: 'blur' },
    { max: 50, message: '服务名不可超过50个字符' }
  ],
  serviceKey: [
    { required: true, message: '服务ID不能为空', trigger: 'blur' },
    { validator: validateEven, trigger: 'blur' }
  ],
  imageUrl: [
    { required: true, message: '图标不能为空', trigger: 'blur' }
  ]
}

// formRef用于关闭diglog时候清空校验以及重置为初始值
const formRef = ref(null)

// 关闭会话框处理函数
const handleClose = () => {
  formRef.value.resetFields()
  formRef.value.clearValidate()
  fileList.value = []
}

// 打开会话框处理函数
const initServeData = async () => {
  // 如果是新增服务，则对话框不用请求初始值
  console.log(props.diglogConfig)
  if (props.diglogConfig.diglogType === 'edit') {
    // 如果是编辑服务，则请求初始值
    const { data } = await getServiceAPI({ id: props.diglogConfig.serId })
    form.value.serviceName = data.serviceName
    form.value.serviceKey = data.serviceKey
    form.value.remark = data.remark
    form.value.imageUrl = data.imageUrl
    data.imageUrl && fileList.value.push({ name: 'icon', url: data.imageUrl })
  }
}

// 请求接口上传图标
const handleIconUpload = async ({ file }) => {
  console.log('请求上传')
  const fileObj = new FormData()
  fileObj.append('file', file)
  // 获取服务器返回的图标url
  const res = await uploadServiceIcon(fileObj)
  if (res.result === 'success') {
    form.value.imageUrl = res.data
    console.log(fileList.value)
  } else {
    fileList.value = []
    proxy.$message({
      message: res?.msg || '上传失败',
      type: 'error',
      duration: 1000
    })
  }
}

// 点击完成，分别对 编辑弹窗 和 新增弹窗 处理
const handleComplete = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return null
  const { diglogType, serId } = props.diglogConfig
  if (diglogType === 'edit') {
    // 请求修改接口
    const data = await updateServiceAPI({ ...form.value, id: serId })
    if (data.result === 'success') {
      proxy.$message({
        message: '修改成功',
        type: 'success',
        duration: 1000
      })
      // 关闭对话框
      FormDialog.value = false
      // 重新请求服务列表数据
      emit('updateServeList')
    } else {
      proxy.$message({
        message: data.msg,
        type: 'error',
        duration: 1000
      })
    }
  } else if (diglogType === 'add') {
    // 请求新增接口
    const data = await addServicesAPI({ ...form.value })
    if (data.result === 'success') {
      proxy.$message({
        message: '新增成功',
        type: 'success',
        duration: 1000
      })
      // 关闭对话框
      FormDialog.value = false
      // 重新请求服务列表数据
      emit('updateServeList')
    } else {
      proxy.$message({
        message: data.msg,
        type: 'error',
        duration: 1000
      })
    }
  }
}

// 限制上传icon的类型和大小
const beforeIconUpload = (file) => {
  // console.log(file)
  // let typeLimit = file.type
}

// 点击移除icon图标
const handleIconRemove = (removeFile, fileList) => {
  // removeFile被移除的图片对象
  // fileList即最新的fileList
  fileList.value = []
  form.value.imageUrl = ''
}

// 文件最多上传一个，上传超过最大限制弹窗提醒
const handleUploadExceed = () => {
  proxy.$message({
    type: 'error',
    message: '最多上传一个图标，请先删除原有图标再上传',
    duration: 1000
  })
}

// 点击上传图标的预览图片
const handleIconPreview = (file) => {
  dialogImageUrl.value = file.url
  dialogVisible.value = true
}
</script>

<style lang="stylus" scoped>
.form
  width: 700px
  .upload-icon
    /deep/ .el-form-item__content > div:first-child
      display flex
      .el-upload-list
        order 1
        margin-left 20px
        height: 148px
</style>
