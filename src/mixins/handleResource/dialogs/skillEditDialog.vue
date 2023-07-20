<template>
  <div style="width:60%;margin:20px auto">
    <el-form
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm"
      label-width="120px"
      class="demo-ruleForm"
    >
      <div>
        <el-form-item label="技能名称" prop="skillName">
          <el-input v-model="ruleForm.skillName"
                    maxlength="50"
                    show-word-limit
          ></el-input>
        </el-form-item>
        <el-form-item label="启动动作" prop="startAction">
          <el-select v-model="ruleForm.startAction" placeholder="请选择启动动作" @change="handleStartActionChange">
            <el-option label="activity" :value="100001"></el-option>
            <el-option label="broadcast" :value="100002"></el-option>
            <el-option label="service" :value="100003"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="启动方式" prop="startMethod">
          <el-select v-model="ruleForm.startMethod" placeholder="请选择启动方式" @change="handleStartMethodChange">
            <el-option label="uri" :value="200001"></el-option>
            <el-option label="action" :value="200002"></el-option>
            <el-option label="className" :value="200003"></el-option>
          </el-select>
        </el-form-item>
        <div v-if="(ruleForm.startAction !== 100002 & ruleForm.startMethod !== 200001)||ruleForm.startAction === ''">
          <el-form-item label="应用包名" prop="appPkg" v-show="showAppPkg">
            <el-input v-model="ruleForm.appPkg"
                      maxlength="50"
                      show-word-limit
            ></el-input>
          </el-form-item>
          <el-form-item label="应用版本号" prop="appVer" v-show="showAppVer">
            <el-input v-model="ruleForm.appVer"
                      maxlength="10"
                      show-word-limit
            ></el-input>
          </el-form-item>
        </div>
        <el-form-item label="启动参数" prop="startParam">
          <el-input v-model="ruleForm.startParam"
                    maxlength="200"
                    show-word-limit
          ></el-input>
        </el-form-item>
        <el-form-item label="拓展参数" prop="extendParam">
          <div v-for="(item,index) in ruleForm.extendParam" :key="index+'item'" style="margin:5px 0">
            <el-input v-model="item.key" placeholder="请填写key" style="width:calc(50% - 5px);margin-right:10px"
                      maxlength="50"
                      show-word-limit
            ></el-input>
            <el-input v-model="item.value" placeholder="请填写value" style="width:calc(50% - 5px)"
                      maxlength="50"
                      show-word-limit
            ></el-input>
          </div>
          <div class="addextendParamMapping" @click="addextendParam(ruleForm.extendParam)">
            + 添加参数
          </div>
        </el-form-item>
        <el-form-item label="扩展参数映射" prop="extendParamMapping">
          <div v-for="(item,index) in ruleForm.extendParamMapping" :key="index+'item'" style="margin:5px 0">
            <el-input v-model="item.skillKey"
                      maxlength="50"
                      show-word-limit placeholder="请填写技能key" style="width:calc(50% - 25px);"
            ></el-input>
            <div style="display:inline-block;width:50px;text-align:center">对应</div>
            <el-input v-model="item.eventKey"
                      maxlength="50"
                      show-word-limit placeholder="请填写事件key" style="width:calc(50% - 25px)"
            ></el-input>
          </div>
          <div class="addextendParamMapping" @click="addextendParamMapping(ruleForm.extendParamMapping)">
            + 添加参数
          </div>
        </el-form-item>
        <el-form-item label="入参" prop="extendParamThird">
          <div v-for="(item,index) in ruleForm.extendParamThird" :key="index+'item'" style="margin:5px 0">
            <el-input v-model="item.key"
                      maxlength="50"
                      show-word-limit placeholder="请填写参数别名" style="width:calc(50% - 50px);margin-right:10px"
            ></el-input>
            <el-input v-model="item.name"
                      maxlength="50"
                      show-word-limit placeholder="请填写code" style="width:calc(50% - 50px);margin-right:10px"
            ></el-input>
            <el-select v-model="item.dataType" placeholder="请选择类型" style="width: 80px;">
              <el-option label="数值" :value="1"></el-option>
              <el-option label="字符" :value="2"></el-option>
            </el-select>
          </div>
          <div class="addextendParamMapping" @click="addextendParamThird(ruleForm.extendParamThird)">
            + 添加参数
          </div>
        </el-form-item>
        <el-form-item label="技能描述" prop="skillDesc">
          <el-input type="textarea" v-model="ruleForm.skillDesc"
                    maxlength="200"
                    show-word-limit
          ></el-input>
        </el-form-item>
        <el-form-item label="是否做异常处理" prop="errorActionFlag">
          <el-radio-group v-model="ruleForm.errorActionFlag" @input="addErrorActionInfo">
            <el-radio :label="0">否</el-radio>
            <el-radio :label="1">是</el-radio>
          </el-radio-group>
        </el-form-item>
        <div v-if="ruleForm.errorActionFlag">
          <el-form
            :model="ruleForm.errorActionInfo"
            :rules="rules"
            ref="ruleForm2"
            label-width="120px"
            class="demo-ruleForm"
          >
            <el-form-item label="启动动作" prop="startAction">
              <el-select v-model="ruleForm.errorActionInfo.startAction" placeholder="请选择启动动作" @change="handleErrorStartActionChange">
                <el-option label="activity" :value="100001"></el-option>
                <el-option label="broadcast" :value="100002"></el-option>
                <el-option label="service" :value="100003"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="启动方式" prop="startMethod">
              <el-select v-model="ruleForm.errorActionInfo.startMethod" placeholder="请选择启动方式" @change="handleErrorStartMethodChange">
                <el-option label="uri" :value="200001"></el-option>
                <el-option label="action" :value="200002"></el-option>
                <el-option label="className" :value="200003"></el-option>
              </el-select>
            </el-form-item>
            <div v-if="(ruleForm.errorActionInfo.startAction !== 100002 & ruleForm.errorActionInfo.startMethod !== 200001)||ruleForm.errorActionInfo.startAction === ''">
              <el-form-item label="应用包名" prop="appPkg">
                <el-input v-model="ruleForm.errorActionInfo.appPkg"
                          maxlength="50"
                          show-word-limit
                ></el-input>
              </el-form-item>
              <el-form-item label="应用版本号" prop="appVer">
                <el-input v-model="ruleForm.errorActionInfo.appVer"
                          maxlength="10"
                          show-word-limit
                ></el-input>
              </el-form-item>
            </div>
            <el-form-item label="启动参数" prop="startParam">
              <el-input v-model="ruleForm.errorActionInfo.startParam"
                        maxlength="200"
                        show-word-limit
              ></el-input>
            </el-form-item>
            <el-form-item label="拓展参数" prop="extendParam">
              <div v-for="(item,index) in ruleForm.errorActionInfo.extendParam" :key="index+'item'" style="margin:5px 0">
                <el-input v-model="item.key" placeholder="请填写key"
                          maxlength="50"
                          show-word-limit style="width:calc(50% - 5px);margin-right:10px"
                ></el-input>
                <el-input v-model="item.value" placeholder="请填写value"
                          maxlength="50"
                          show-word-limit style="width:calc(50% - 5px)"
                ></el-input>
              </div>
              <div class="addextendParamMapping" @click="addextendParam(ruleForm.errorActionInfo.extendParam)">
                + 添加参数
              </div>
            </el-form-item>
            <el-form-item label="扩展参数映射" prop="extendParamMapping">
              <div v-for="(item,index) in ruleForm.errorActionInfo.extendParamMapping" :key="index+'item'" style="margin:5px 0">
                <el-input v-model="item.skillKey"
                          maxlength="50"
                          show-word-limit placeholder="请填写技能key" style="width:calc(50% - 25px);"
                ></el-input>
                <div style="display:inline-block;width:50px;text-align:center">对应</div>
                <el-input v-model="item.eventKey"
                          maxlength="50"
                          show-word-limit placeholder="请填写事件key" style="width:calc(50% - 25px)"
                ></el-input>
              </div>
              <div class="addextendParamMapping" @click="addextendParamMapping(ruleForm.errorActionInfo.extendParamMapping)">
                + 添加参数
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <el-form-item>
        <el-button type="primary" @click="submitForm">保存</el-button>
        <el-button @click="$emit('go-back')">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ApiRequest } from '@/framework/services/CustomApi'
export default {
  props: {
    row: {
      type: Object,
      default () {
        return {}
      }
    },
    mode: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      ruleForm: {
        skillName: '',
        extendParam: [
          {
            key: '',
            value: ''
          }
        ],
        extendParamMapping: [{
          eventKey: '',
          skillKey: ''
        }],
        extendParamThird: [{
          key: '',
          name: '',
          dataType: 1
        }],
        errorActionFlag: 0,
        startAction: '',
        appPkg: '',
        appVer: 1
      },
      showAppPkg: true,
      showAppVer: true,
      rules: {
        skillName: [
          { required: true, pattern: /^(?!\s+$).*/, message: '请输入技能名称' }
        ],
        appPkg: [
          { required: true, pattern: /^(?!\s+$).*/, message: '请输入应用包名', trigger: 'blur' }
        ],
        appVer: [
          { required: true, message: '请输入应用版本号', trigger: 'blur' },
          { pattern: /^[0-9]*$/, message: '只能输入数字', trigger: 'blur' }
        ],
        startAction: [
          { required: true, message: '请选择启动动作', trigger: 'change' }
        ],
        startMethod: [
          { required: true, message: '请选择启动方式' }
        ],
        startParam: [
          { required: true, pattern: /^(?!\s+$).*/, message: '请输入启动参数' }
        ]
      }
    }
  },
  methods: {
    handleStartActionChange (value) {
      if (value === 100002) {
        this.$set(this.ruleForm, 'appPkg', '')
        this.$set(this.ruleForm, 'appVer', '')
      }
    },
    handleStartMethodChange (value) {
      if (value === 200001) {
        this.$set(this.ruleForm, 'appPkg', '')
        this.$set(this.ruleForm, 'appVer', '')
      }
    },
    handleErrorStartActionChange (value) {
      if (value === 100002) {
        const { verCode, ...rest } = this.ruleForm.errorActionInfo
        this.$set(this.ruleForm, 'errorActionInfo', {
          ...rest,
          appPkg: '',
          appVer: ''
        })
      }
    },
    handleErrorStartMethodChange (value) {
      if (value === 200001) {
        const { verCode, ...rest } = this.ruleForm.errorActionInfo
        this.$set(this.ruleForm, 'errorActionInfo', {
          ...rest,
          appPkg: '',
          appVer: ''
        })
      }
    },
    addErrorActionInfo (flag) {
      if (flag === 1) {
        this.$set(this.ruleForm, 'errorActionInfo', {
          appVer: 1,
          extendParam: [
            {
              key: '',
              value: ''
            }
          ],
          extendParamMapping: [{
            eventKey: '',
            skillKey: ''
          }]
        })
      } else {
        this.$set(this.ruleForm, 'errorActionInfo', {})
      }
    },
    addextendParam (data) {
      data.push({
        key: '',
        value: ''
      })
    },
    addextendParamMapping (data) {
      data.push({
        eventKey: '',
        skillKey: ''
      })
    },
    addextendParamThird (data) {
      data.push({
        key: '',
        name: '',
        dataType: 1
      })
    },
    submitForm () {
      this.$refs.ruleForm.validate((valid) => {
        if (this.ruleForm.errorActionFlag) {
          this.$refs.ruleForm2.validate((valid2) => {
            if (valid && valid2) {
              ApiRequest(this.mode === 'edit' ? 'updateSkill' : 'addSkill', this.ruleForm).then(res => {
                this.$emit('go-back', true)
                this.$message({
                  type: 'success',
                  message: '保存成功！'
                })
              })
            } else {
              return false
            }
          })
        } else {
          if (valid) {
            ApiRequest(this.mode === 'edit' ? 'updateSkill' : 'addSkill', this.ruleForm).then(res => {
              this.$emit('go-back', true)
              this.$message({
                type: 'success',
                message: '保存成功！'
              })
            })
          } else {
            return false
          }
        }
      })
    }
  },
  created () {
    if (this.mode === 'edit') {
      ApiRequest('getSkill', { id: this.row.id }).then(data => {
        this.ruleForm = data
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.addextendParamMapping
  border: 1px dashed #ccc
  border-radius: 5px
  text-align center
  margin-top 10px
</style>
