<template>
  <div :class="[showNodeDetail ? 'limit-graph' : '', 'graph-component']">
    <FlowComposition @drag="handleDrag"></FlowComposition>
    <!-- 解决画布resize后,节点被遮挡问题 -->
    <div style="width: 100%;height: 100%">
      <div class="graph-simply-container" id="graphContainer"></div>
    </div>
    <Operate
      @add="addZoom"
      @reduce="reduceZoom"
    ></Operate>
  </div>
</template>
<script>
import { Graph, Shape, ObjectExt } from '@antv/x6'
import { Dnd } from '@antv/x6-plugin-dnd' // 拖拽
import { Snapline } from '@antv/x6-plugin-snapline' // 对齐线
import { Transform } from '@antv/x6-plugin-transform' // 拉动节点 显示图形转换
import FlowComposition from '@/components/Flow/Composition'
import Operate from '@/components/Flow/Operate'
export default {
  components: {
    FlowComposition,
    Operate
  },
  props: {
    showNodeDetail: { // 显示节点详情
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      graph: null, // 画布
      dnd: null, // 拖拽
      resizingOptions: {
        enabled: true,
        minWidth: 80,
        maxWidth: 200,
        minHeight: 40,
        maxHeight: 150,
        orthogonal: true,
        restrict: false,
        preserveAspectRatio: true
      },
      startNode: { // 开始节点
        id: 'start', // String，节点的唯一标识
        shape: 'ellipse', // 使用 ellipse 渲染
        x: 160, // Number，必选，节点位置的 x 值
        y: 180, // Number，必选，节点位置的 y 值
        width: 80, // Number，可选，节点大小的 width 值
        height: 40, // Number，可选，节点大小的 height 值
        attrs: {
          body: {
            fill: '#F39C12',
            stroke: '#000',
            rx: 16,
            ry: 16
          },
          label: {
            text: 'World',
            fill: '#333',
            fontSize: 18,
            fontWeight: 'bold',
            fontVariant: 'small-caps'
          }
        },
        // tools: [
        //   {
        //     name: 'button-remove',
        //     args: {
        //       x: '100%',
        //       y: 0,
        //       offset: { x: -10, y: 10 }
        //     }
        //   }
        // ],
        data: {
          type: 'start'
        }
      }
    }
  },
  methods: {
    initGraph () {
      console.debug('initGraph: ')
      this.graph = new Graph({
        container: document.getElementById('graphContainer'),
        interacting: true, // 交互 是否允许
        width: '100%',
        height: '100%',
        autoResize: true,
        grid: {
          visible: true,
          type: 'doubleMesh',
          args: [
            {
              color: '#eee', // 主网格线颜色
              thickness: 1 // 主网格线宽度
            },
            {
              color: '#ddd', // 次网格线颜色
              thickness: 1, // 次网格线宽度
              factor: 4 // 主次网格线间隔
            }
          ]
        },
        panning: true, // 是否启用画布平移
        mousewheel: true
      })
      this.graph.use( // 拉动节点 显示图形转换 初始化
        new Transform({
          resizing: this.resizingOptions
        })
      )
      this.graph.fromJSON({
        nodes: [this.startNode]
      }) // render draw
      this.graph.centerContent() // 居中显示画布
      this.graph.use(
        new Snapline({
          enabled: true
        })
      )
      this.dnd = new Dnd({
        target: this.graph,
        scaled: false,
        dndContainer: document.querySelector('.composition-content')
      })
    },
    initShapeConfig () {
      // https://x6.antv.antgroup.com/tutorial/basic/node#:~:text=%7D-,%E5%AE%9A%E5%88%B6%E8%8A%82%E7%82%B9,-%E6%88%91%E4%BB%AC%E5%8F%AF%E4%BB%A5%E9%80%9A%E8%BF%87
      Shape.Rect.config({ // config 改变rect默认设置 ， 同修改全局的有个regiserNode
        width: 80,
        height: 40,
        markup: [
          {
            tagName: 'rect',
            selector: 'body'
          },
          {
            tagName: 'text',
            selector: 'label'
          }
        ],
        attrs: {
          body: { // 对应selector css
            fill: '#eff4ff',
            stroke: '#5f95ff',
            strokeWidth: 1
          },
          label: {
            fontSize: 14,
            fill: '#000',
            fontFamily: 'Pingfang-medium, Arial, helvetica, sans-serif',
            textAnchor: 'middle',
            textVerticalAnchor: 'middle'
          }
        },
        propHooks: { // 自定义选项
          label (metadata) {
            const { label, ...others } = metadata
            if (label) {
              ObjectExt.setByPath(others, 'attrs/text/text', label)
            }
            return others
          },
          rx (metadata) {
            const { rx, ...others } = metadata
            if (rx != null) {
              ObjectExt.setByPath(others, 'attrs/body/rx', rx)
            }
            return others
          },
          ry (metadata) {
            const { ry, ...others } = metadata
            if (ry != null) {
              ObjectExt.setByPath(others, 'attrs/body/ry', ry)
            }
            return others
          }
        }
      })
    },
    handleDrag (e) {
      console.debug('handleDrag: ', e)
      const type = e.currentTarget.dataset.type
      const node =
        type === 'rect'
          ? this.graph.createNode({
            shape: 'rect',
            width: 100,
            height: 40
          })
          : this.graph.createNode({
            width: 60,
            height: 60,
            shape: 'circle',
            label: 'Circle',
            attrs: {
              body: {
                stroke: '#8f8f8f',
                strokeWidth: 1,
                fill: '#fff'
              }
            }
          })
      this.dnd.start(node, e)
    },
    addZoom () {
      // 偏移歪了
      this.graph.zoom(0.1).centerContent()
    },
    reduceZoom () {
      this.graph.zoom(-0.1).centerContent()
    },
    initGraphListen () {
      this.graph.on('node:removed', ({ node, index, options }) => {
        console.debug('node:removed: ', node, index, options)
        return false
      })
      this.graph.on('cell:mouseenter', ({ cell }) => {
        // console.debug('cell:mouseenter: ', cell)
        if (cell.isNode()) {
          cell.id !== 'start' && cell.addTools([
            // {
            //   name: 'boundary',
            //   args: {
            //     attrs: {
            //       fill: '#7c68fc',
            //       stroke: '#333',
            //       'stroke-width': 1,
            //       'fill-opacity': 0.2
            //     }
            //   }
            // },
            {
              name: 'button-remove',
              args: {
                x: '100%',
                y: 0,
                offset: { x: -10, y: 10 }
              }
            }
          ])
        } else {
          cell.addTools(['vertices', 'segments']) // 线段工具
        }
      })
      this.graph.on('cell:mouseleave', ({ cell }) => {
        cell.removeTools()
      })
      this.graph.on('node:click', ({ e, x, y, node, view }) => {
        console.debug('node:click: ', e, x, y, node, view)
        this.$emit('updateDetail', true)
      })
      this.graph.on('resize', ({ width, height }) => {
        console.debug('resize: ', width, height)
        this.graph.centerContent()
      })
    }
  },
  //   watch: {
  //     showNodeDetail (newval, oldval) {
  //     //   console.debug('newval: ', newval)
  //     //   console.debug('oldval: ', oldval)
  //     //   if (newval) {}
  //     }
  //   },
  mounted () {
    this.initShapeConfig()
    this.initGraph()
    this.initGraphListen()
  }
}
</script>
<style lang="stylus" scoped>
.graph-component {
    position relative
    display flex
    flex-direction row
    justify-content flex-end
    width 100%
    height 100%
    &.limit-graph {
        width calc(100% - 400px)
    }
    .graph-simply-container {
        width 100%
        height 100%
    }
}

// transform
>>>.x6-widget-transform {
    // margin: -1px 0 0 -1px;
    // padding: 0;
    border: 1px solid #239edd;
    // border-radius: 6px;
  }

  >>>.x6-widget-transform > div {
    border: 1px solid #239edd;
  }

  >>>.x6-widget-transform > div:hover {
    background-color: #3dafe4;
  }

  >>>.x6-widget-transform-active-handle {
    background-color: #3dafe4;
  }

//   >>>.x6-widget-transform-resize {
//     border-radius: 0;
//   }
</style>
