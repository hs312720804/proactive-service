module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard',
    '@vue/typescript/recommended'
  ],
  plugins: [
    'vue'
  ],
  // parser: 'vue-eslint-parser',
  parserOptions: {
    // parser: 'babel-eslint',
    ecmaVersion: 2020
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 0,
    'array-callback-return': 0,
    'vue/no-mutating-props': 0,
    // html 闭括号-换行
    'vue/html-closing-bracket-newline': [2, {
      singleline: 'never',
      multiline: 'always'
    }],

    // html 闭括号之前无空格
    'vue/html-closing-bracket-spacing': 2,

    // html 需要有结束标签，除了自闭合标签
    'vue/html-end-tags': 2,

    // 缩进
    'vue/html-indent': 2,

    // 属性-引用-默认使用双引号
    'vue/html-quotes': 0,

    // 自闭合标签只能写成这种形式  ---->   <YourComponent/>
    // 'vue/html-self-closing': 2,

    // 标签里面每行属性的个数--默认为1
    'vue/max-attributes-per-line': [2, {
      singleline: 4,
      multiline: 4
    }],

    // 内容元素为多行，对称换行
    'vue/multiline-html-element-content-newline': 0,
    // 内容元素为一行，换行
    'vue/singleline-html-element-content-newline': 0,

    // “Mustache”语法 (双大括号) 必须有前后对称的空格
    'vue/mustache-interpolation-spacing': 0,

    // 标签里面不允许多余空格
    'vue/no-multi-spaces': 2,

    // 标签内--属性赋值--等号两边不允许空格
    'vue/no-spaces-around-equal-signs-in-attribute': 0,

    // v-for指令变量命名不允许歧义，比如：变量命令为l
    'vue/no-template-shadow': 0,

    // 一个文件导出一个组件
    'vue/one-component-per-file': 0,

    // props 接收的属性名称为驼峰形式
    'vue/prop-name-casing': 0,

    // props中如果没有required，则需要提供默认属性default
    'vue/require-default-prop': 0,

    // props 属性需要声明类型type
    'vue/require-prop-types': 0,

    // 默认使用冒号：，而不是v-bind:
    'vue/v-bind-style': 2,

    // 默认使用冒号@，而不是v-on:
    'vue/v-on-style': 2,

    // 默认使用冒号#，而不是v-slot:
    'vue/v-slot-style': 0,

    /*  *************   eslint-plugin-vue  ————  Recommended    *****************  */

    // 标签里面的属性--顺序
    'vue/attributes-order': 0,

    // <script>, <template> & <style> 标签顺序，默认： [["script", "template"], "style"]
    'vue/component-tags-order': 0,

    // <template>标签中要有指令
    'vue/no-lone-template': 0,

    // 不允许使用v-html指令
    'vue/no-v-html': 0,

    // 绑定在 <slot> 的元素 ———— 插槽prop只能有一个参数
    'vue/no-multiple-slot-args': 0,

    // 组件声明属性的顺序 ———— 默认顺序：name、components、props、data、computed、watch、methods
    'vue/order-in-components': 0,

    // this 不允许出现在template中
    'vue/this-in-template': 2,

    /*  *************   eslint-plugin-vue  ————  Deprecated（已废弃）    *****************  */
    // name属性默认使用PascalCase帕斯卡命名法—— 首字母大写，比如  name: 'MyComponent'
    'vue/name-property-casing': 0,

    /*  *************   eslint-plugin-vue  ————  Essential    *****************  */

    // props --  Array 或 Object，default属性是个函数
    'vue/require-valid-default-prop': 2,

    /*  *************   新增 eslint 规则   *****************  */

    // 文件末尾保留一行空行
    'eol-last': 2,
    // 禁用行尾空白
    'no-trailing-spaces': 2,
    // 不允许多个空行
    'no-multiple-empty-lines': 2
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
}
