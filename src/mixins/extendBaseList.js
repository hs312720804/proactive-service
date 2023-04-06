import listPages from './handleResource/pages'
import listDialogs from './handleResource/dialogs'
import todo from './handleResource/todo'
import renderMethods from './handleResource/renderMethods'

export default {
  props: ['menuId'],
  data () {
    return {
      handleResource: {
        pages: listPages,
        dialogs: listDialogs,
        todo,
        renderMethods
      }
    }
  }
}
