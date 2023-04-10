<template>
  <div>
    <el-form
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm"
      label-width="100px"
      class="demo-ruleForm"
    >
      <div>
        <el-form-item label="技能名称" prop="skillName">
          <el-input v-model="ruleForm.skillName"></el-input>
        </el-form-item>
        <el-form-item label="应用包名" prop="appPkg">
          <el-input v-model="ruleForm.appPkg"></el-input>
        </el-form-item>
        <el-form-item label="应用版本号" prop="appVer">
          <el-input v-model="ruleForm.appVer"></el-input>
        </el-form-item>
        <el-form-item label="启动动作" prop="startAction">
          <el-select v-model="ruleForm.startAction" placeholder="请选择启动动作">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="启动方式" prop="startMethod">
          <el-select v-model="ruleForm.startMethod" placeholder="请选择启动方式">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="启动参数" prop="startParam">
          <el-input v-model="ruleForm.startParam"></el-input>
        </el-form-item>
        <el-form-item label="拓展参数" prop="extendParam">
        </el-form-item>
        <el-form-item label="扩展参数映射" prop="extendParamMapping">
        </el-form-item>
        <el-form-item label="技能描述" prop="desc">
          <el-input type="textarea" v-model="ruleForm.desc"></el-input>
        </el-form-item>
        <el-form-item label="是否做异常处理" prop="isErrorAction">
          <el-radio-group v-model="ruleForm.resource">
            <el-radio label="否"></el-radio>
            <el-radio label="是"></el-radio>
          </el-radio-group>
        </el-form-item>
      </div>

      <el-form-item>
        <el-button type="primary" @click="submitForm('ruleForm')">立即创建</el-button>
        <el-button @click="resetForm('ruleForm')">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {

}
</script>

<style>

</style>
