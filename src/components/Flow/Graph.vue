<template>
  <div :class="[showNodeDetail ? 'limit-graph' : '', 'graph-component']">
    <FlowComposition v-if="isEdit" @drag="handleCompositionDrag"></FlowComposition>
    <!-- 解决画布resize后,节点被遮挡问题 -->
    <div style="width: 100%;height: 100%">
      <div class="graph-simply-container" :id="containerId"></div>
    </div>
    <Operate
      v-if="isEdit"
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
import { addJudgeNodeAPI, addDialogueNodeAPI, deleteNodeAPI, getVersionIdAPI, getTreeDataAPI } from '@/services/flow'
import { getStatuTitleAPI } from '@/services/services'
import { getAnyliseTreeAPI } from '@/services/anylise'
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
  inject: ['serviceId'],
  data () {
    return {
      LINE_HEIGHT: 24,
      NODE_WIDTH: 150,
      showAnylise: false,
      versionId: '',
      graph: null, // 画布
      dnd: null, // 拖拽
      tree: [], // 后台给的树形结构
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
        id: '', // String，节点的唯一标识
        shape: 'ellipse', // 使用 ellipse 渲染
        x: 50, // Number，必选，节点位置的 x 值
        y: 50, // Number，必选，节点位置的 y 值
        width: 100, // Number，可选，节点大小的 width 值
        height: 50, // Number，可选，节点大小的 height 值
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
    layout () { // 按照树级结构，重新渲染节点
      const dagreLayout = new DagreLayout({
        type: 'dagre',
        rankdir: 'LR',
        // align: 'UR',
        // ranksep: 55,
        // nodesep: 25,
        nodesepFunc: (d) => { // 纵向间距
          if (d.data.nodeType === 2) { // 对话框
            return 0 + 20 * d.data.buttonDataList.length
          } else if (d.data.nodeType === 4) { // 普通方框
            return 1
          } else {
            return 1
          }
        },
        ranksepFunc: (d) => { // 横向间距
          if (d.data.nodeType === 2) { // 对话框
            return 55
          } else if (d.data.nodeType === 4) { // 普通方框
            return 1
          } else {
            return 1
          }
        }
      })
      //   // this.startNode
      const cells = this.graph.toJSON().cells
      const data = {
        nodes: [], edges: []
      }
      cells.forEach(item => {
        if (item.shape === 'implement') {
          data.edges.push(item)
        } else {
          data.nodes.push(item)
        }
      })

      const model = dagreLayout.layout(data)

      this.graph.fromJSON(model)
    },
    generateRenderTree (treeData) { // 生成渲染树 x6 cell 格式树
      const graph = this.graph
      console.log('generateRenderTree: ', treeData)
      if (graph && graph.getCellCount() > 0) {
        graph.clearCells()
      }

      const cells2 = []
      const cells = []
      let allCellList = []
      treeData.map((item, index) => {
        if (item.buttonDataList) {
          const arr = item.buttonDataList.map(obj => {
            return {
              nodeId: obj.buttonId,
              type: obj.type,
              title: obj.title,
              parentId: item.nodeId
            }
          })
          allCellList = allCellList.concat(arr).concat(item)
        } else {
          allCellList.push(item)
        }
      })
      treeData.forEach((item, index) => {
        const commonObj = {
          id: item.nodeId,
          label: `${item.context}--${item.nodeId}`,
          width: 150,
          height: 24,
          ports: [],
          nodeType: item.nodeType
        }
        let obj = {}
        if (item.nodeType === 1) {
          obj = {
            ...commonObj,
            id: item.nodeId.toString(), // String，节点的唯一标识
            shape: 'ellipse', // 使用 ellipse 渲染
            x: 0, // Number，必选，节点位置的 x 值
            y: 0, // Number，必选，节点位置的 y 值
            width: 100, // Number，可选，节点大小的 width 值
            height: 50, // Number，可选，节点大小的 height 值
            attrs: {
              body: {
                fill: '#eff4ff',
                stroke: '#5f95ff',
                strokeWidth: 1,
                rx: 16,
                ry: 16
              },
              label: {
                text: item.title,
                fill: '#333',
                fontSize: 16,
                fontWeight: 'normal',
                fontVariant: 'small-caps'
              }
            },
            data: {
              type: 'start',
              ...item
            }
          }
          cells.push(obj)
        } else if (item.nodeType === 2) { // 对话框
          const ports = item.buttonDataList.map(obj => {
            const a = {
              id: obj.buttonId,
              group: 'list',
              attrs: {
                portNameLabel: {
                  text: obj.title
                },
                portTypeLabel: {
                  text: obj.buttonId
                }
              }
            }
            return a
          })
          // ports.unshift({
          //   id: item.nodeId,
          //   group: 'list',
          //   attrs: {
          //     portNameLabel: {
          //       text: `${item.context}--${item.nodeId}`
          //     },
          //     portTypeLabel: {
          //       text: item.nodeId
          //     }
          //   }
          // })
          obj = {
            ...commonObj,
            shape: 'er-rect',
            ports,
            data: {
              type: 'dialogue',
              ctype: '对话框',
              ...item
            }
          }
          cells.push(obj)
        } else if (item.nodeType === 3) {
          const obj = {
            nodeId: item.nodeId,
            id: item.nodeId,
            nodeType: item.nodeType,
            shape: 'custom-polygon',
            data: {
              ...item
            }
          }
          cells.push(obj)
        } else if (item.nodeType === 4) {
          const obj = {
            id: item.nodeId,
            nodeType: item.nodeType,
            shape: 'c-rect',
            // size: {
            //   width: 100,
            //   height: 40
            // },
            attrs: {
              text: {
                text: item.title
              }
            },
            data: {
              ...item,
              type: 'skill'
            }
          }
          cells.push(obj)
        } else if (item.nodeType === 5) {
          const { source, target } = item

          // eslint-disable-next-line no-case-declarations
          let sourceData = {}
          // eslint-disable-next-line no-case-declarations
          let targetData = {}
          const aaa = allCellList.find(obj => {
            return obj.nodeId === source || obj.id === target
          })
          const bbb = allCellList.find(obj => {
            return obj.nodeId === target || obj.id === target
          })
          console.log('allCellList---->', allCellList)
          console.log('aaa', aaa, source)
          console.log('bbb', bbb, target)
          if (aaa && bbb) {
            sourceData = {
              cell: aaa.parentId ? aaa.parentId : aaa.nodeId,
              port: aaa.parentId ? aaa.nodeId : null
            }
            targetData = {
              cell: bbb.parentId ? bbb.parentId : bbb.nodeId,
              port: bbb.parentId ? bbb.nodeId : null
            }
            console.log('sourceData', sourceData)
            console.log('targetData', targetData)
            const obj = {
              nodeType: item.nodeType,
              shape: 'implement',
              source: {
                ...sourceData
              },
              target: {
                ...targetData
              },
              label: item?.lineText
            }
            cells.push(obj)
          }
          console.log('-------------------------------------', index)
        }
      })
      // 222222222222222222222
      console.log('cells========>', cells)

      cells.forEach((treeItem, treeIndex) => {
        switch (treeItem.nodeType) {
          // default:
          //   break
          case 1: // 'start'
            cells2.push(this.graph.createNode(treeItem))
            break
          case 2: // 'dialogue'
            cells2.push(this.graph.createNode(treeItem))
            break
          case 3: // judge 判断
            cells2.push(this.graph.createNode(treeItem))
            break
          case 4: // skill节点 技能
            cells2.push(this.graph.createNode(treeItem))
            break
          case 5: // 连线
            cells2.push(this.graph.createEdge(treeItem))
            break
        }
        // 1111111111111111
        graph.resetCells(cells2)
        graph.centerContent()
        // graph.zoomToFit({ padding: 10, maxScale: 1 })
        // this.graph.zoomToFit({ padding: 10, maxScale: 1 })
      })
      this.layout()
    },
    getNodeId (node) {
      const data = node.getData()
      if (data.nodeType === 3 || data.nodeType === 2 || data.nodeType === 1 || data.nodeType === 4) {
        return data.nodeId
      } else if (data.type === 1 && data['button-type'] === 'dialogue-button') {
        return data.buttonId
      }
      return ''
    },
    logGraph () {
      console.debug('logGraph: ', this.graph.toJSON())
    },
    // testLinkPort () { // 测试连接桩 连接对话框底部按钮能力
    //   // 获取页面节点
    //   const nodeList = this.graph.getNodes()
    //   const dialogNode = nodeList.find((node, index) => {
    //     return node.getData().nodeType === 2
    //   })
    //   // 获取连接桩id
    //   const childrenId = dialogNode.getChildren()[0].id
    //   const firstPortId = dialogNode.getChildren()[0].getPorts()[0].id
    //   // 获取开始节点
    //   const startNode = nodeList.find((node, index) => {
    //     return node.id === 'start'
    //   })
    //   // 建立连接线
    //   this.graph.addEdge({
    //     shape: 'org-edge',
    //     source: {
    //       cell: childrenId,
    //       port: firstPortId
    //     },
    //     target: { cell: startNode },
    //     router: {
    //       name: 'manhattan',
    //       args: {
    //         startDirections: ['top'],
    //         endDirections: ['bottom']
    //       }
    //     }
    //   })
    //   console.debug('graph: ', this.graph.toJSON())
    // },
    initGraph () {
      const LINE_HEIGHT = this.LINE_HEIGHT
      const NODE_WIDTH = this.NODE_WIDTH
      // 自定义边（需要）
      Graph.registerEdge(
        'implement',
        {
          inherit: 'edge',
          attrs: {
            line: {
              strokeWidth: 1,
              strokeDasharray: '3,3',
              targetMarker: {
                name: 'path',
                d: 'M 20 0 L 0 10 L 20 20 z',
                fill: 'white',
                offsetX: -10
              }
            }
          }
        },
        true
      )
      Graph.registerPortLayout(
        'erPortPosition',
        (portsPositionArgs) => {
          return portsPositionArgs.map((_, index) => {
            return {
              position: {
                x: 0,
                y: (index + 1) * LINE_HEIGHT
              },
              angle: 0
            }
          })
        },
        true
      )
      // #region 注册基础图形
      Graph.registerNode(
        'er-rect',
        {
          inherit: 'rect',
          width: NODE_WIDTH,
          height: LINE_HEIGHT,
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
            rect: {
              strokeWidth: 1,
              stroke: '#5F95FF',
              fill: '#5F95FF'

            },
            label: {
              fontWeight: 'bold',
              fill: '#000',
              fontSize: 14
            }
          },
          ports: {
            groups: {
              list: {
                markup: [
                  {
                    tagName: 'rect',
                    selector: 'portBody'
                  },
                  {
                    tagName: 'text',
                    selector: 'portNameLabel'
                  },
                  {
                    tagName: 'text',
                    selector: 'portTypeLabel'
                  },
                  // {
                  //   tagName: 'circle',
                  //   selector: 'portCircle'
                  // },
                  {
                    tagName: 'circle',
                    selector: 'portCircle2'
                  }
                ],
                attrs: {
                  portBody: {
                    width: NODE_WIDTH,
                    height: LINE_HEIGHT,
                    strokeWidth: 1,
                    stroke: '#5F95FF',
                    fill: '#EFF4FF'
                    // magnet: true
                  },
                  portNameLabel: {
                    ref: 'portBody',
                    refX: 6,
                    refY: 6,
                    fontSize: 10
                  },
                  portTypeLabel: {
                    ref: 'portBody',
                    refX: 95,
                    refY: 6,
                    fontSize: 10
                  },
                  // portCircle: {
                  //   r: 4,
                  //   refY: 12,
                  //   fill: '#5F95FF',
                  //   stroke: '#5F95FF'
                  // },
                  portCircle2: {
                    r: 4,
                    refX: NODE_WIDTH,
                    refY: 12,
                    fill: '#5F95FF',
                    stroke: '#000'
                  }
                },
                position: 'erPortPosition'
              }
            }
          }
        },
        true
      )

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const scope = this
      this.graph = new Graph({

        container: document.getElementById(this.containerId),
        interacting: function (cellView) {
          if (cellView.cell.hasParent()) { // 子节点 不允许移动 （比如对话框内的节点）
            return { nodeMovable: false }
          }
          return true
        }, // 交互 是否允许
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
        mousewheel: true,
        connecting: {
          connector: 'rounded',
          snap: true,
          allowBlank: false,
          allowLoop: false,
          highlight: true,
          allowPort: false,
          allowEdge: false,
          router: {
            name: 'er',
            args: {
              offset: 25,
              direction: 'H'
            }
          }
          // createEdge () {
          //   return new Shape.Edge({
          //     attrs: {
          //       line: {
          //         stroke: '#A2B1C3',
          //         strokeWidth: 2
          //       }
          //     }
          //   })
          // }
        }
        // connecting: {
        //   snap: true,
        //   allowBlank: false,
        //   allowLoop: false,
        //   highlight: true,
        //   allowPort: false,
        //   allowEdge: false,
        //   connector: 'rounded',
        //   connectionPoint: 'boundary'

        // }
      })
      this.graph.use( // 拉动节点 显示图形转换 初始化
        new Transform({
          resizing: this.resizingOptions
        })
      )
      const graphInfo = store.getters.graphList.find(item => item.serviceId === this.serviceId)?.graphInfo
      // console.debug('graphInfo renderdata: ', graphInfo)
      // console.debug('graphInfo renderdata: ', this.tree)

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
          // const targetType = afterNode.getData().type
          // const targetCtype = afterNode.getData().ctype
          // const nodeList = this.graph.getNodes().filter((item) => item.getData().type === targetType)
          return afterNode.clone()
          // return afterNode.clone().setAttrByPath('text/text', `${targetCtype}${nodeList.length + 1}`)
        },
        validateNode: async (node, options) => {
          const { type, ctype } = node.getData()
          const nodeList = this.graph.getNodes().filter((item) => item.getData().type === type)
          const nodeTitle = `${ctype}${nodeList.length + 1}`
          // const titleNode = {
          //   shape: 'er-rect',
          //   x: node.getBBox().x - 30,
          //   y: node.getBBox().y - 30,
          //   label: `${nodeTitle}`,
          //   width: 150,
          //   height: 24,
          //   nodeType: 2
          //   // attrs: {
          //   //   text: {
          //   //     text: nodeTitle
          //   //   }
          //   // }
          // }

          // this.graph.addNode(titleNode)
          // node.addChild(titleNode)
          if (type === 'judge') {
            try {
              const res = await addJudgeNodeAPI({
                title: nodeTitle,
                versionId: this.versionId
              })
              // console.debug('addJudgeNodeAPI res: ', res)
              if (res.code === 1000) {
                const { nodeId } = res.data
                node.setData({
                  nodeId: nodeId.toString()
                })
                return true
              }
            } catch (error) {
              return false
            }
          } else if (type === 'dialogue') {
            try {
              const res = await addDialogueNodeAPI({
                title: nodeTitle,
                versionId: this.versionId
              })
              if (res.code === 1000) {
                // console.debug('addDialogueNodeAPI res: ', res)
                const { nodeId } = res.data
                node.setData({
                  nodeId: nodeId.toString()
                })
                return true
              }
            } catch (error) {
              console.error('add dialogue api error: ', error)
              return false
            } finally {
              this.logGraph()
            }
          }
        }
      })
    },
    treeToGraph () {
      // console.debug('renderGraph: ', this.tree)
      if (this.tree.length > 0) {
        this.generateRenderTree(this.tree)
      }
      this.logGraph()
    },
    jsonToGraph (data) { // 渲染画布
      console.debug('jsonToGraph data :', data)
      this.graph.fromJSON(data)
      store.commit('flow/setGraphList', {
        serviceId: this.serviceId,
        graphInfo: this.graph.toJSON()
      })
      store.commit('flow/setNodeList', {
        serviceId: this.serviceId,
        nodeList: this.graph.getNodes()
      })
    },
    handleCompositionDrag (e) { // 拖拽组件回调
      const LINE_HEIGHT = this.LINE_HEIGHT
      const NODE_WIDTH = this.NODE_WIDTH
      const type = e.currentTarget.dataset.type
      const ctype = e.currentTarget.dataset.ctype
      console.debug('handleCompositionDrag: ', type, ctype)
      let node = null
      if (type === 'judge') {
        node = this.graph.createNode({
          shape: 'custom-polygon',
          label: '',
          data: {
            type,
            ctype
          }
        })
      } else if (type === 'dialogue') {
        node = this.graph.createNode({
          shape: 'er-rect',

          label: ctype,
          text: {
            textAnchor: 'left', // 左对齐
            refX: -5, // x 轴偏移量
            refY: -5,
            text: ctype
          },
          data: {
            type,
            ctype
          }
        })
      } else if (type === 'skill') {
        node = this.graph.createNode({
          shape: 'c-rect',
          // width: 100,
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
          width: 70,
          height: 70,
          attrs: {
            body: {
              strokeWidth: 1,
              stroke: '#C4C4C4',
              fill: '#E4E4E4',
              rx: 5,
              ry: 5,
              refPoints: '0,10 10,0 20,10 10,20'
            },
            text: {
              fontSize: 12,
              fill: '#262626',
              textAnchor: 'middle',
              // refX: -5, // x 轴偏移量
              // refY: -5,
              text: '判定'
            }
          },
          data: {
            type: 'judge',
            ctype: '判定'
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
    initConfig () {
      this.initShapeConfig()
      this.initRhombicNode() // 初始化菱形节点
      // this.initCustomNode()
    },
    initShapeConfig () { // 初始化矩形图形配置
      Graph.registerNode(
        'c-rect',
        {
          inherit: 'rect',
          width: 130,
          height: 50,
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
            body: {
              strokeWidth: 1,
              fill: '#BFE8E2',
              stroke: '#A8D7CD',
              rx: 10, // 圆角矩形
              ry: 10
            },
            label: {
              textWrap: {
                // ellipsis: true
                // width: -10
              },
              breakWord: false,
              textAnchor: 'middle',
              textVerticalAnchor: 'middle',
              // refX: '50%',
              // refY: '50%',
              // refRCircumscribed: '100%', // 圆半径为节点宽度/高度中较大的那个值的一半
              // refCx: '50%', // 圆中心 x 坐标位于节点中心
              // refCy: '50%', // 圆中心 y 坐标位于节点中心
              fontSize: 12
            }

          }
        },
        true
      )
      // // https://x6.antv.antgroup.com/tutorial/basic/node#:~:text=%7D-,%E5%AE%9A%E5%88%B6%E8%8A%82%E7%82%B9,-%E6%88%91%E4%BB%AC%E5%8F%AF%E4%BB%A5%E9%80%9A%E8%BF%87
      // Shape.Rect.config({ // config 改变rect默认设置 ， 同修改全局的有个regiserNode
      //   width: '100%',
      //   height: '100%',
      //   markup: [
      //     {
      //       tagName: 'rect',
      //       selector: 'body'
      //     },
      //     {
      //       tagName: 'text',
      //       selector: 'label'
      //     }
      //   ],
      //   attrs: {
      //     body: { // 对应selector css
      //       fill: '#eff4ff',
      //       stroke: '#5f95ff',
      //       strokeWidth: 1
      //     },
      //     label: {
      //       fontSize: 14,
      //       fill: '#000',
      //       fontFamily: 'Pingfang-medium, Arial, helvetica, sans-serif',
      //       textAnchor: 'middle', // 左对齐
      //       textVerticalAnchor: 'middle',
      //       textWrap: {
      //         width: 180,
      //         height: 50,
      //         ellipsis: true
      //       }
      //       // refX: -10, // x 轴偏移量
      //       // refY: -10
      //     }
      //   },
      //   propHooks: { // 自定义选项
      //     label (metadata) {
      //       const { label, ...others } = metadata
      //       if (label) {
      //         ObjectExt.setByPath(others, 'attrs/text/text', label)
      //       }
      //       return others
      //     },
      //     rx (metadata) {
      //       const { rx, ...others } = metadata
      //       if (rx != null) {
      //         ObjectExt.setByPath(others, 'attrs/body/rx', rx)
      //       }
      //       return others
      //     },
      //     ry (metadata) {
      //       const { ry, ...others } = metadata
      //       if (ry != null) {
      //         ObjectExt.setByPath(others, 'attrs/body/ry', ry)
      //       }
      //       return others
      //     }
      //   }
      // })
      // Graph.registerNode('self-node', {
      //   draw (cfg, group) {
      //     const labelObj = group.addShape('text', {
      //       attrs: {
      //         x: 10,
      //         y: 10,
      //         text: '121212',
      //         textAlign: 'left',
      //         textBaseline: 'top',
      //         lineHeight: 1
      //       }
      //     })
      //     // 根据label，计算宽高，需要自己实现
      //     const { width, height } = caclWH(label)

      //     const rect = group.addShape('rect', {
      //       attrs: {
      //         width,
      //         height,
      //         x: -width / 2,
      //         y: -height / 2,
      //         radius: 4,
      //         ...nodeStyle
      //       }
      //     })
      //     return rect
      //   }
      // })
    },
    initGraphListen () {
      this.graph.on('node:removed', ({ node, index, options }) => {
        // console.debug('node:removed: ', node, index, options)
        return false
      })
      this.graph.on('node:added', ({ node, index, options }) => {
        // console.debug('node:added: ', node, index, options)
        store.commit('flow/setGraphList', {
          serviceId: this.serviceId,
          graphInfo: this.graph.toJSON()
        })
        store.commit('flow/setNodeList', {
          serviceId: this.serviceId,
          nodeList: this.graph.getNodes()
        })
      })
      // this.graph.on('cell:mouseenter', ({ cell }) => {
      //   // console.debug('mouseenter cell: ', cell)
      //   if (cell.isNode()) {
      //     cell.getData().nodeType !== 1 && cell.id !== 'start' && !cell.hasParent() && this.isEdit && cell.addTools([
      //       {
      //         name: 'button-remove',
      //         args: {
      //           x: '100%',
      //           y: '50%',
      //           offset: { x: -10, y: 0 },
      //           onClick: async (payload) => {
      //             const { cell, e } = payload
      //             // console.debug('button-remove: ', e, cell)
      //             try {
      //               const res = await deleteNodeAPI({
      //                 nodeId: cell.getData().nodeId
      //               })
      //               if (res.code === 1000) {
      //                 cell.remove()
      //                 // console.debug('graph: ', this.graph.toJSON())
      //                 this.jsonToGraph(this.graph.toJSON())
      //                 return true
      //               }
      //             } catch (error) {
      //               console.error('delete node error: ', error)
      //               return false
      //             }
      //           }
      //         }
      //       }
      //     ])
      //   } else {
      //     cell.addTools(['vertices', 'segments']) // 线段工具
      //   }
      // })
      this.graph.on('cell:mouseleave', ({ cell }) => {
        cell.removeTools()
      })
      this.graph.on('node:click', ({ e, x, y, node, view }) => { // 节点点击事件
        // const aaa = this.graph.getCellById(node.id)
        console.log('node-->', node)
        const { type, nodeId, nodeType } = node.getData()
        console.debug('click: node.getData(): ', node.getData())
        if ((type !== 'skill' || nodeType !== 4) && !node.hasParent()) {
          this.$emit('updateDetail', true)
          // save to vuex
          store.commit('flow/setCellRenderData', node)
          store.commit('flow/setNodeType', type)
          store.commit('flow/setNodeId', nodeId)
        }
      })
      this.graph.on('resize', ({ width, height }) => {
        this.graph.centerContent()
      })
    },
    normalizeNodePosition (nodes) { // 格式化节点位置
      nodes.forEach((node) => {
        node.x -= node.size.width / 2
        node.y -= node.size.height / 2
      })
    },
    updateStartNodeLink (payload) { // 更新节点信息 连线布局
      // console.debug('updateStartNodeLink: ')
      if (payload.serviceId !== this.serviceId) return
      setTimeout(() => {
        this.getTreeData()
        store.commit('flow/updateStatuTitle', {
          serviceId: this.serviceId
        })
      }, 500)
    },
    updateJudgeNodeRender (formInfo) {
      // console.debug('updateJudgeNodeRender: ')
      setTimeout(() => {
        this.getTreeData()
        store.commit('flow/updateStatuTitle', {
          serviceId: this.serviceId
        })
      }, 500)
    },
    updateDialogueNodeRender (formInfo) { // 更新画布中 刚更新过的对话框节点 渲染
      // console.debug('updateDialogueNodeRender: ')
      setTimeout(() => {
        this.getTreeData()
        store.commit('flow/updateStatuTitle', {
          serviceId: this.serviceId
        })
      }, 500)
      this.$nextTick(() => {
        this.logGraph()
      })
    },
    async getAnyliseTreeData (formData) {
      try {
        delete formData.time
        const res = await getAnyliseTreeAPI(formData)
        if (res.code === 1000) {
          // console.debug('getAnyliseTreeData')
          this.tree = res.data
          this.treeToGraph()
          this.showAnylise = true
        }
      } catch (error) {
        console.error('getAnyliseTreeData error: ', error)
      }
    },
    initVuexListen () {
      store.subscribe((mutation, state) => {
        if (mutation.type === 'flow/updateStartNodeLink') {
          // console.debug('mutation type triggle,', mutation.type)
          if (mutation.payload.serviceId !== this.serviceId) return
          this.updateStartNodeLink(mutation.payload)
        }
        if (mutation.type === 'flow/updateDialogueDetail') {
          this.updateDialogueNodeRender(mutation.payload)
        }
        if (mutation.type === 'flow/updateJudgeNodeDetail') {
          this.updateJudgeNodeRender(mutation.payload)
        }
        if (mutation.type === 'flow/updateGraphTree') {
          if (mutation.payload.serviceId !== this.serviceId) return
          console.debug('mutation updateGraphTree getTreeData')
          this.getTreeData().then(() => {
            setTimeout(() => {
              this.getVersionId()
            }, 800)
          })
          setTimeout(() => {
            store.commit('flow/updateVersionId', {
              serviceId: this.serviceId
            })
          })
        }
        if (mutation.type === 'flow/setAnyliseFilterForm') {
          // console.debug('setAnyliseFilterForm: ', mutation.payload)
          if (mutation.payload.serviceId !== this.serviceId) return
          this.getAnyliseTreeData(mutation.payload)
        }
      })
    },
    async getVersionId () {
      try {
        const res = await getVersionIdAPI({
          serviceId: this.serviceId
        })
        if (res.code === 1000) {
          this.versionId = res.data
        }
      } catch (error) {
        console.error('getVersionId error: ', error)
      }
    },
    async getTreeData () {
      try {
        const res = await getTreeDataAPI({
          serviceId: Number(this.serviceId)
        })
        console.debug('getTreeData res: ', res)
        if (res.code === 1000) {
          this.tree = res.data
        }
      } catch (error) {
        console.error('getTreeData error: ', error)
      }
    }
  },
  computed: {
    containerId () {
      return `graphContainer_${this.serviceId}`
    },
    isEdit () {
      return this.$route.query.mode === 'edit'
    }
  },
  watch: {
    tree: {
      handler (newVal, oldVal) {
        // console.debug('tree watch: ', newVal, oldVal)
        this.treeToGraph()
      },
      deep: true
    }
  },
  created () {
    if (this.isEdit) {
      this.getVersionId()
      // console.debug('created getTreeData')
      this.getTreeData()
    }
  },
  mounted () {
    this.initConfig()
    this.initGraph()
    this.initGraphListen()
    this.initVuexListen()
    store.commit('flow/updateStatuTitle', {
      serviceId: this.serviceId
    })
  },
  activated () {
    if (this.graph && this.graph.getCellCount() > 0) {
      this.graph.clearCells()
    }
    if (!this.isEdit) {
      store.commit('flow/initAnyliseData', {
        serviceId: this.serviceId
      })
    } else {
      // console.debug('activated isEdit getTreeData')
      this.getVersionId()
      this.getTreeData()
      store.commit('flow/updateStatuTitle', {
        serviceId: this.serviceId
      })
    }
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
    // &.limit-graph {
    //     width calc(100% - 400px)
    // }
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
