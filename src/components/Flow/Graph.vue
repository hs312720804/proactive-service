<template>
  <div :class="[showNodeDetail ? 'limit-graph' : '', 'graph-component']">
    <FlowComposition @drag="handleCompositionDrag"></FlowComposition>
    <!-- 解决画布resize后,节点被遮挡问题 -->
    <div style="width: 100%;height: 100%">
      <div class="graph-simply-container" :id="containerId"></div>
    </div>
    <Operate
      @add="addZoom"
      @reduce="reduceZoom"
    ></Operate>
  </div>
</template>
<script>
import store from 'cseed-frame/store/_index'
import { Graph, Shape, ObjectExt } from '@antv/x6'
import { Dnd } from '@antv/x6-plugin-dnd' // 拖拽
import { Snapline } from '@antv/x6-plugin-snapline' // 对齐线
import { Transform } from '@antv/x6-plugin-transform' // 拉动节点 显示图形转换
import { DagreLayout } from '@antv/layout' // 层次布局
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
    },
    serviceId: {
      type: Number
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
        // x: 160, // Number，必选，节点位置的 x 值
        // y: 180, // Number，必选，节点位置的 y 值
        width: 100, // Number，可选，节点大小的 width 值
        height: 50, // Number，可选，节点大小的 height 值
        // size: {
        //   width: 100,
        //   height: 50
        // },
        attrs: {
          body: {
            fill: '#eff4ff',
            stroke: '#5f95ff',
            strokeWidth: 1,
            rx: 16,
            ry: 16
          },
          label: {
            text: '开始',
            fill: '#333',
            fontSize: 16,
            fontWeight: 'normal',
            fontVariant: 'small-caps'
          }
        },
        data: {
          type: 'start'
        }
      }
    }
  },
  methods: {
    initGraph () {
      // console.debug('initGraph: ')
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const scope = this
      this.graph = new Graph({
        container: document.getElementById(this.containerId),
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
      const graphInfo = store.getters.graphList.find(item => item.serviceId === this.$props.serviceId)?.graphInfo
      console.debug('graphInfo: ', graphInfo)
      if (graphInfo) {
        this.renderGraph(graphInfo)
      } else {
        this.renderGraph({
          nodes: [this.startNode]
        })
      }
      // this.renderGraph({
      //   nodes: [this.startNode]
      // })
      this.graph.centerContent() // 居中显示画布
      this.graph.use(
        new Snapline({
          enabled: true
        })
      )
      this.dnd = new Dnd({
        target: this.graph,
        scaled: false,
        dndContainer: document.querySelector('.composition-content'),
        getDragNode: (beforeNode) => {
          console.debug('before getDragNode: ', beforeNode)
          return beforeNode.clone()
        },
        getDropNode: (afterNode) => {
          console.debug('after getDropNode: ', afterNode)
          // axios 请求生成id接口
          return afterNode.clone().setData({
            newId: '123'
          })
          // const cloneNode = afterNode.clone().size(width * 3, height * 3);
          // const id = '123123'
          // return cloneNode.setData({
          //   newId: id
          // })
        }
      })
    },
    renderGraph (data) { // 渲染画布
      this.graph.fromJSON(data)
      store.commit('flow/setGraphList', {
        serviceId: this.$props.serviceId,
        graphInfo: this.graph.toJSON()
      })
    },
    handleCompositionDrag (e) { // 拖拽组件回调
      // console.debug('handleCompositionDrag: ', e)
      const type = e.currentTarget.dataset.type
      let node = null
      if (type === 'judge') {
        node = this.graph.createNode({
          shape: 'custom-polygon',
          attrs: {
            body: {
              refPoints: '0,10 10,0 20,10 10,20'
            }
          },
          size: {
            width: 100,
            height: 50
          },
          label: '判定',
          data: {
            type
          }
          // size: {
          //   width: 100,
          //   height: 80
          // }
        })
      } else if (type === 'dialogue') {
        node = this.graph.createNode({
          shape: 'rect',
          width: 200,
          height: 80,
          label: '对话框',
          data: {
            type
          }
        })
      } else if (type === 'skill') {
        node = this.graph.createNode({
          shape: 'rect',
          width: 100,
          height: 40,
          attrs: {
            body: {
              rx: 6,
              ry: 6
            }
          },
          data: {
            type
          }
        })
      }
      this.dnd.start(node, e)
    },
    addZoom () {
      // 偏移歪了
      this.graph.zoom(0.1).centerContent()
    },
    reduceZoom () {
      this.graph.zoom(-0.1).centerContent()
    },
    initConfig () {
      this.initShapeConfig()
      this.initRhombicNode()
    },
    initShapeConfig () { // 初始化矩形图形配置
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
    initRhombicNode () { // 初始化菱形节点
      // #region 初始化图形
      const ports = {
        groups: {
          top: {
            position: 'top',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#5F95FF',
                strokeWidth: 1,
                fill: '#fff',
                style: {
                  visibility: 'hidden'
                }
              }
            }
          },
          right: {
            position: 'right',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#5F95FF',
                strokeWidth: 1,
                fill: '#fff',
                style: {
                  visibility: 'hidden'
                }
              }
            }
          },
          bottom: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#5F95FF',
                strokeWidth: 1,
                fill: '#fff',
                style: {
                  visibility: 'hidden'
                }
              }
            }
          },
          left: {
            position: 'left',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#5F95FF',
                strokeWidth: 1,
                fill: '#fff',
                style: {
                  visibility: 'hidden'
                }
              }
            }
          }
        },
        items: [
          {
            group: 'top'
          },
          {
            group: 'right'
          },
          {
            group: 'bottom'
          },
          {
            group: 'left'
          }
        ]
      }
      Graph.registerNode(
        'custom-polygon',
        {
          inherit: 'polygon',
          width: 66,
          height: 36,
          attrs: {
            body: {
              strokeWidth: 1,
              stroke: '#5F95FF',
              fill: '#EFF4FF'
            },
            text: {
              fontSize: 12,
              fill: '#262626'
            }
          },
          ports: {
            ...ports,
            items: [
              {
                group: 'top'
              },
              {
                group: 'bottom'
              }
            ]
          }
        },
        true
      )
    },
    initGraphListen () {
      this.graph.on('node:removed', ({ node, index, options }) => {
        // console.debug('node:removed: ', node, index, options)
        return false
      })
      this.graph.on('node:added', ({ node, index, options }) => {
        // console.debug('node:added: ', node, index, options)
        store.commit('flow/setGraphList', {
          serviceId: this.$props.serviceId,
          graphInfo: this.graph.toJSON()
        })
        store.commit('flow/setNodeList', {
          serviceId: this.$props.serviceId,
          nodeList: this.graph.getNodes()
        })
      })
      this.graph.on('cell:mouseenter', ({ cell }) => {
        if (cell.isNode()) {
          cell.id !== 'start' && cell.addTools([
            {
              name: 'button-remove',
              args: {
                x: '100%',
                y: '50%',
                offset: { x: -10, y: 0 }
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
      this.graph.on('node:click', ({ e, x, y, node, view }) => { // 节点点击事件
        // console.debug('node:click: ', e, x, y, node, view)
        // console.debug('node:click: ', this.graph.getConnectedEdges('start')[0]?.getTarget())
        this.$emit('updateDetail', true)
        // save to vuex
        store.commit('flow/setNodeDetailInfo', node)
        store.commit('flow/setNodeType', node.data.type)
      })
      this.graph.on('resize', ({ width, height }) => {
        this.graph.centerContent()
      })
    },
    updateNodeInfo (payload) { // 更新节点信息 连线布局
      // (1) update node data
      // (2) update whole graph data
      // (3) update vuex
      // eg: nodeData { id: 48 label: "兜底方案也不满足的情况" type: "skill" } nodeType 'start'
      const { serviceId, nodeType, nodeData } = payload
      const { id, label, type } = nodeData
      console.debug('updateNodeInfo: ', serviceId, nodeType, nodeData)
      console.debug('updateNodeInfo: ', id, label, type)
      if (serviceId !== this.$props.serviceId) return
      if (type === 'skill' && nodeType === 'start') {
        const node = {
          id: id.toString(),
          shape: 'rect',
          width: 100,
          height: 40,
          label,
          data: {
            type
          }
        }
        const edge = {
          source: 'start',
          target: id.toString()
        }
        const dagreLayout = new DagreLayout({
          type: 'dagre',
          rankDir: '',
          align: 'UL',
          rankSep: 40,
          nodeSep: 40
        })
        const data = {
          nodes: [this.startNode, node],
          edges: [edge]
        }
        const model = dagreLayout.layout(data)
        this.renderGraph(model)
        console.debug('render ok: graph: ', this.graph.toJSON())
        console.debug('渲染ok')
      }
    },
    initVuexListen () {
      store.subscribe((mutation, state) => {
        // if(mutation === 'someMutation'){
        //     doSomething()
        // }
        if (mutation.type === 'flow/updateGraphNodeInfo') {
          this.updateNodeInfo(mutation.payload)
        }
      })
    }
  },
  computed: {
    containerId () {
      return `graphContainer_${this.$props.serviceId}`
    }
  },
  mounted () {
    this.initGraph()
    this.initConfig()
    this.initGraphListen()
    this.initVuexListen()
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
