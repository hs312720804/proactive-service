<template>
  <div class="example" v-example>{{ $t('1.example') }}</div>
</template>
<script>
import { exampleFn } from '@/utils/common'
import { EXAMPLE } from '@/utils/consts'
export default {
  data () {
    return {
      isExample: EXAMPLE
    }
  },
  created () {
    exampleFn()
  }
}
</script>
<style lang="stylus" scoped>
.example
  color $textAccentColor
</style>
