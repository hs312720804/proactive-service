(self["webpackJsonp_proactiveServiceSaas"]=self["webpackJsonp_proactiveServiceSaas"]||[]).push([[139],{36852:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return u}});var a=function(){var e=this,t=e._self._c;return t("div",[e._v("暂无对应的弹窗组件")])},l=[],o={},i=o,n=r(1001),s=(0,n.Z)(i,a,l,!1,null,null,null),u=s.exports},4733:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return p}});var a=function(){var e=this,t=e._self._c;return t("div",{staticStyle:{width:"60%",margin:"20px auto"}},[t("el-form",{ref:"ruleForm",staticClass:"demo-ruleForm",attrs:{model:e.ruleForm,rules:e.rules,"label-width":"120px"}},[t("div",[t("el-form-item",{attrs:{label:"技能名称",prop:"skillName"}},[t("el-input",{attrs:{maxlength:"50","show-word-limit":""},model:{value:e.ruleForm.skillName,callback:function(t){e.$set(e.ruleForm,"skillName",t)},expression:"ruleForm.skillName"}})],1),t("el-form-item",{attrs:{label:"启动动作",prop:"startAction"}},[t("el-select",{attrs:{placeholder:"请选择启动动作"},on:{change:e.handleStartActionChange},model:{value:e.ruleForm.startAction,callback:function(t){e.$set(e.ruleForm,"startAction",t)},expression:"ruleForm.startAction"}},[t("el-option",{attrs:{label:"activity",value:100001}}),t("el-option",{attrs:{label:"broadcast",value:100002}}),t("el-option",{attrs:{label:"service",value:100003}})],1)],1),t("el-form-item",{attrs:{label:"启动方式",prop:"startMethod"}},[t("el-select",{attrs:{placeholder:"请选择启动方式"},on:{change:e.handleStartMethodChange},model:{value:e.ruleForm.startMethod,callback:function(t){e.$set(e.ruleForm,"startMethod",t)},expression:"ruleForm.startMethod"}},[t("el-option",{attrs:{label:"uri",value:200001}}),t("el-option",{attrs:{label:"action",value:200002}}),t("el-option",{attrs:{label:"className",value:200003}})],1)],1),100002!==e.ruleForm.startAction&200001!==e.ruleForm.startMethod||""===e.ruleForm.startAction?t("div",[t("el-form-item",{directives:[{name:"show",rawName:"v-show",value:e.showAppPkg,expression:"showAppPkg"}],attrs:{label:"应用包名",prop:"appPkg"}},[t("el-input",{attrs:{maxlength:"50","show-word-limit":""},model:{value:e.ruleForm.appPkg,callback:function(t){e.$set(e.ruleForm,"appPkg",t)},expression:"ruleForm.appPkg"}})],1),t("el-form-item",{directives:[{name:"show",rawName:"v-show",value:e.showAppVer,expression:"showAppVer"}],attrs:{label:"应用版本号",prop:"appVer"}},[t("el-input",{attrs:{maxlength:"10","show-word-limit":""},model:{value:e.ruleForm.appVer,callback:function(t){e.$set(e.ruleForm,"appVer",t)},expression:"ruleForm.appVer"}})],1)],1):e._e(),t("el-form-item",{attrs:{label:"启动参数",prop:"startParam"}},[t("el-input",{attrs:{maxlength:"200","show-word-limit":""},model:{value:e.ruleForm.startParam,callback:function(t){e.$set(e.ruleForm,"startParam",t)},expression:"ruleForm.startParam"}})],1),t("el-form-item",{attrs:{label:"拓展参数",prop:"extendParam"}},[e._l(e.ruleForm.extendParam,(function(r,a){return t("div",{key:a+"item",staticStyle:{margin:"5px 0"}},[t("el-input",{staticStyle:{width:"calc(50% - 5px)","margin-right":"10px"},attrs:{placeholder:"请填写key",maxlength:"50","show-word-limit":""},model:{value:r.key,callback:function(t){e.$set(r,"key",t)},expression:"item.key"}}),t("el-input",{staticStyle:{width:"calc(50% - 5px)"},attrs:{placeholder:"请填写value",maxlength:"50","show-word-limit":""},model:{value:r.value,callback:function(t){e.$set(r,"value",t)},expression:"item.value"}})],1)})),t("div",{staticClass:"addextendParamMapping",on:{click:function(t){return e.addextendParam(e.ruleForm.extendParam)}}},[e._v(" + 添加参数 ")])],2),t("el-form-item",{attrs:{label:"扩展参数映射",prop:"extendParamMapping"}},[e._l(e.ruleForm.extendParamMapping,(function(r,a){return t("div",{key:a+"item",staticStyle:{margin:"5px 0"}},[t("el-input",{staticStyle:{width:"calc(50% - 25px)"},attrs:{maxlength:"50","show-word-limit":"",placeholder:"请填写技能key"},model:{value:r.skillKey,callback:function(t){e.$set(r,"skillKey",t)},expression:"item.skillKey"}}),t("div",{staticStyle:{display:"inline-block",width:"50px","text-align":"center"}},[e._v("对应")]),t("el-input",{staticStyle:{width:"calc(50% - 25px)"},attrs:{maxlength:"50","show-word-limit":"",placeholder:"请填写事件key"},model:{value:r.eventKey,callback:function(t){e.$set(r,"eventKey",t)},expression:"item.eventKey"}})],1)})),t("div",{staticClass:"addextendParamMapping",on:{click:function(t){return e.addextendParamMapping(e.ruleForm.extendParamMapping)}}},[e._v(" + 添加参数 ")])],2),t("el-form-item",{attrs:{label:"技能描述",prop:"skillDesc"}},[t("el-input",{attrs:{type:"textarea",maxlength:"200","show-word-limit":""},model:{value:e.ruleForm.skillDesc,callback:function(t){e.$set(e.ruleForm,"skillDesc",t)},expression:"ruleForm.skillDesc"}})],1),t("el-form-item",{attrs:{label:"是否做异常处理",prop:"errorActionFlag"}},[t("el-radio-group",{on:{input:e.addErrorActionInfo},model:{value:e.ruleForm.errorActionFlag,callback:function(t){e.$set(e.ruleForm,"errorActionFlag",t)},expression:"ruleForm.errorActionFlag"}},[t("el-radio",{attrs:{label:0}},[e._v("否")]),t("el-radio",{attrs:{label:1}},[e._v("是")])],1)],1),e.ruleForm.errorActionFlag?t("div",[t("el-form",{ref:"ruleForm2",staticClass:"demo-ruleForm",attrs:{model:e.ruleForm.errorActionInfo,rules:e.rules,"label-width":"120px"}},[t("el-form-item",{attrs:{label:"启动动作",prop:"startAction"}},[t("el-select",{attrs:{placeholder:"请选择启动动作"},on:{change:e.handleErrorStartActionChange},model:{value:e.ruleForm.errorActionInfo.startAction,callback:function(t){e.$set(e.ruleForm.errorActionInfo,"startAction",t)},expression:"ruleForm.errorActionInfo.startAction"}},[t("el-option",{attrs:{label:"activity",value:100001}}),t("el-option",{attrs:{label:"broadcast",value:100002}}),t("el-option",{attrs:{label:"service",value:100003}})],1)],1),t("el-form-item",{attrs:{label:"启动方式",prop:"startMethod"}},[t("el-select",{attrs:{placeholder:"请选择启动方式"},on:{change:e.handleErrorStartMethodChange},model:{value:e.ruleForm.errorActionInfo.startMethod,callback:function(t){e.$set(e.ruleForm.errorActionInfo,"startMethod",t)},expression:"ruleForm.errorActionInfo.startMethod"}},[t("el-option",{attrs:{label:"uri",value:200001}}),t("el-option",{attrs:{label:"action",value:200002}}),t("el-option",{attrs:{label:"className",value:200003}})],1)],1),100002!==e.ruleForm.errorActionInfo.startAction&200001!==e.ruleForm.errorActionInfo.startMethod||""===e.ruleForm.errorActionInfo.startAction?t("div",[t("el-form-item",{attrs:{label:"应用包名",prop:"appPkg"}},[t("el-input",{attrs:{maxlength:"50","show-word-limit":""},model:{value:e.ruleForm.errorActionInfo.appPkg,callback:function(t){e.$set(e.ruleForm.errorActionInfo,"appPkg",t)},expression:"ruleForm.errorActionInfo.appPkg"}})],1),t("el-form-item",{attrs:{label:"应用版本号",prop:"appVer"}},[t("el-input",{attrs:{maxlength:"10","show-word-limit":""},model:{value:e.ruleForm.errorActionInfo.appVer,callback:function(t){e.$set(e.ruleForm.errorActionInfo,"appVer",t)},expression:"ruleForm.errorActionInfo.appVer"}})],1)],1):e._e(),t("el-form-item",{attrs:{label:"启动参数",prop:"startParam"}},[t("el-input",{attrs:{maxlength:"200","show-word-limit":""},model:{value:e.ruleForm.errorActionInfo.startParam,callback:function(t){e.$set(e.ruleForm.errorActionInfo,"startParam",t)},expression:"ruleForm.errorActionInfo.startParam"}})],1),t("el-form-item",{attrs:{label:"拓展参数",prop:"extendParam"}},[e._l(e.ruleForm.errorActionInfo.extendParam,(function(r,a){return t("div",{key:a+"item",staticStyle:{margin:"5px 0"}},[t("el-input",{staticStyle:{width:"calc(50% - 5px)","margin-right":"10px"},attrs:{placeholder:"请填写key",maxlength:"50","show-word-limit":""},model:{value:r.key,callback:function(t){e.$set(r,"key",t)},expression:"item.key"}}),t("el-input",{staticStyle:{width:"calc(50% - 5px)"},attrs:{placeholder:"请填写value",maxlength:"50","show-word-limit":""},model:{value:r.value,callback:function(t){e.$set(r,"value",t)},expression:"item.value"}})],1)})),t("div",{staticClass:"addextendParamMapping",on:{click:function(t){return e.addextendParam(e.ruleForm.errorActionInfo.extendParam)}}},[e._v(" + 添加参数 ")])],2),t("el-form-item",{attrs:{label:"扩展参数映射",prop:"extendParamMapping"}},[e._l(e.ruleForm.errorActionInfo.extendParamMapping,(function(r,a){return t("div",{key:a+"item",staticStyle:{margin:"5px 0"}},[t("el-input",{staticStyle:{width:"calc(50% - 25px)"},attrs:{maxlength:"50","show-word-limit":"",placeholder:"请填写技能key"},model:{value:r.skillKey,callback:function(t){e.$set(r,"skillKey",t)},expression:"item.skillKey"}}),t("div",{staticStyle:{display:"inline-block",width:"50px","text-align":"center"}},[e._v("对应")]),t("el-input",{staticStyle:{width:"calc(50% - 25px)"},attrs:{maxlength:"50","show-word-limit":"",placeholder:"请填写事件key"},model:{value:r.eventKey,callback:function(t){e.$set(r,"eventKey",t)},expression:"item.eventKey"}})],1)})),t("div",{staticClass:"addextendParamMapping",on:{click:function(t){return e.addextendParamMapping(e.ruleForm.errorActionInfo.extendParamMapping)}}},[e._v(" + 添加参数 ")])],2)],1)],1):e._e()],1),t("el-form-item",[t("el-button",{attrs:{type:"primary"},on:{click:e.submitForm}},[e._v("保存")]),t("el-button",{on:{click:function(t){return e.$emit("go-back")}}},[e._v("取消")])],1)],1)],1)},l=[],o=(r(57658),r(56414));const i={getSkill:{url:"/proactive_admin_api/scene/skill/get"},updateSkill:{url:"/proactive_admin_api/scene/skill/update",method:"post"},addSkill:{url:"/proactive_admin_api/scene/skill/add",method:"post"}};function n(e,t){const r=i[e].method||"get",a={method:r,url:`${i[e].url}`},l=i[e].isFile;return l&&(a.isFile=l),"post"===r?a.data=t:a.params=t,i[e].isAllData?(0,o.Z)(a).then((e=>e)):(0,o.Z)(a).then((({data:e})=>e))}var s={props:{row:{type:Object,default(){return{}}},mode:{type:String,default:""}},data(){return{ruleForm:{skillName:"",extendParam:[{key:"",value:""}],extendParamMapping:[{eventKey:"",skillKey:""}],errorActionFlag:0,startAction:"",appPkg:"",appVer:1},showAppPkg:!0,showAppVer:!0,rules:{skillName:[{required:!0,pattern:/^(?!\s+$).*/,message:"请输入技能名称"}],appPkg:[{required:!0,pattern:/^(?!\s+$).*/,message:"请输入应用包名",trigger:"blur"}],appVer:[{required:!0,message:"请输入应用版本号",trigger:"blur"},{pattern:/^[0-9]*$/,message:"只能输入数字",trigger:"blur"}],startAction:[{required:!0,message:"请选择启动动作",trigger:"change"}],startMethod:[{required:!0,message:"请选择启动方式"}],startParam:[{required:!0,pattern:/^(?!\s+$).*/,message:"请输入启动参数"}]}}},methods:{handleStartActionChange(e){100002===e&&(this.$set(this.ruleForm,"appPkg",""),this.$set(this.ruleForm,"appVer",""))},handleStartMethodChange(e){200001===e&&(this.$set(this.ruleForm,"appPkg",""),this.$set(this.ruleForm,"appVer",""))},handleErrorStartActionChange(e){if(100002===e){const{verCode:e,...t}=this.ruleForm.errorActionInfo;this.$set(this.ruleForm,"errorActionInfo",{...t,appPkg:"",appVer:""})}},handleErrorStartMethodChange(e){if(200001===e){const{verCode:e,...t}=this.ruleForm.errorActionInfo;this.$set(this.ruleForm,"errorActionInfo",{...t,appPkg:"",appVer:""})}},addErrorActionInfo(e){1===e?this.$set(this.ruleForm,"errorActionInfo",{appVer:1,extendParam:[{key:"",value:""}],extendParamMapping:[{eventKey:"",skillKey:""}]}):this.$set(this.ruleForm,"errorActionInfo",{})},addextendParam(e){e.push({key:"",value:""})},addextendParamMapping(e){e.push({eventKey:"",skillKey:""})},submitForm(){this.$refs.ruleForm.validate((e=>{if(this.ruleForm.errorActionFlag)this.$refs.ruleForm2.validate((t=>{if(!e||!t)return!1;n("edit"===this.mode?"updateSkill":"addSkill",this.ruleForm).then((e=>{this.$emit("go-back",!0),this.$message({type:"success",message:"保存成功！"})}))}));else{if(!e)return!1;n("edit"===this.mode?"updateSkill":"addSkill",this.ruleForm).then((e=>{this.$emit("go-back",!0),this.$message({type:"success",message:"保存成功！"})}))}}))}},created(){"edit"===this.mode&&n("getSkill",{id:this.row.id}).then((e=>{this.ruleForm=e}))}},u=s,m=r(1001),c=(0,m.Z)(u,a,l,!1,null,"25caecf2",null),p=c.exports},97711:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return u}});var a=function(){var e=this,t=e._self._c;return t("div",[e._v("暂无对应的页面组件")])},l=[],o={},i=o,n=r(1001),s=(0,n.Z)(i,a,l,!1,null,null,null),u=s.exports},30019:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return w}});var a=function(){var e=this,t=e._self._c;return e.menuDetail?t("LowcodeEngine",{attrs:{"menu-id":e.menuId,menuDetail:e.menuDetail,"fetch-method":e.commonFetch,_headers:e.headers,"page-detail-method":e.getLowerDetail,"handle-resource":e.handleResource}}):e._e()},l=[],o=r(51755),i=r(56414);function n(e){return(0,i.Z)({method:"get",url:"auth/menu/detail",params:e})}function s(e){return(0,i.Z)({method:"get",url:"admin/pageConfiguation/detail",params:e})}const u=r(72386),m={};u.keys().forEach((e=>{m[e.replace(/(^\.\/|\.vue$)/g,"")]=u(e).default}));var c=m;const p=r(9614),d={};p.keys().forEach((e=>{d[e.replace(/(^\.\/|\.vue$)/g,"")]=p(e).default}));var h=d,f={exampleTodo(e){console.log("example to do ",e)}},g={exampleString(e){return(t,{row:r})=>t("span",{},r[e])}},v={props:["menuId"],data(){return{handleResource:{pages:c,dialogs:h,todo:f,renderMethods:g}}}},k={name:"lowerEngine",props:["menuId"],mixins:[v],components:{LowcodeEngine:o.ZW},data(){return{commonFetch:i.Z,getMenusDetail:n,getLowerDetail:s,menuDetail:"",headers:()=>this.$store.getters.httpHeaders}},created(){this.getMenusDetail({id:this.menuId}).then((e=>{this.menuDetail=e.data}))}},x=k,F=r(1001),b=(0,F.Z)(x,a,l,!1,null,null,null),w=b.exports},9614:function(e,t,r){var a={"./AAADialog.vue":36852,"./skillEditDialog.vue":4733};function l(e){var t=o(e);return r(t)}function o(e){if(!r.o(a,e)){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}return a[e]}l.keys=function(){return Object.keys(a)},l.resolve=o,e.exports=l,l.id=9614},72386:function(e,t,r){var a={"./AAAPage.vue":97711};function l(e){var t=o(e);return r(t)}function o(e){if(!r.o(a,e)){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}return a[e]}l.keys=function(){return Object.keys(a)},l.resolve=o,e.exports=l,l.id=72386}}]);
//# sourceMappingURL=LowcodeEngine.5763f276.js.map