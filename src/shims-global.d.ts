import Vue, { VNode } from 'vue'
import Router from 'vue-router'
import Store from 'vuex'

declare global {
  namespace JSX {
    type Element = VNode
    type ElementClass = Vue
    interface IntrinsicElements {
      [elem: string]: any
    }
  }
  interface Window {
    /**
     * 当前应用是否由qiankun主应用加载
     */
    __POWERED_BY_QIANKUN__?: boolean
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    /**
     * qiankun 主应用传递过来的对象
     */
    $mainState: {
      fetch: Promise
      router: Router
      store: Store
    }
  }
}
