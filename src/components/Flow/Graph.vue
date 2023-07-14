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
// import { register } from '@antv/x6-vue-shape'
import { Dnd } from '@antv/x6-plugin-dnd' // 拖拽
import { Snapline } from '@antv/x6-plugin-snapline' // 对齐线
import { Transform } from '@antv/x6-plugin-transform' // 拉动节点 显示图形转换
import { DagreLayout } from '@antv/layout' // 层次布局
import FlowComposition from '@/components/Flow/Composition'
import Operate from '@/components/Flow/Operate'
import { addJudgeNodeAPI, addDialogueNodeAPI, deleteNodeAPI, getVersionIdAPI, getTreeDataAPI } from '@/services/flow'
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
    generateRenderTree (treeData) { // 生成渲染树 x6 cell 格式树
      console.debug('generateRenderTree: ', treeData)
      this.graph.clearCells()
      treeData.forEach((treeItem, treeIndex) => {
        switch (treeItem.nodeType) {
          case 1: // 'start'
            // eslint-disable-next-line no-case-declarations
            const node = { // 开始节点
              id: treeItem.nodeId.toString(), // String，节点的唯一标识
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
                  text: treeItem.title,
                  fill: '#333',
                  fontSize: 16,
                  fontWeight: 'normal',
                  fontVariant: 'small-caps'
                }
              },
              data: {
                type: 'start',
                ...treeItem
              }
            }
            this.graph.addNode(node)
            break
          case 2: // 'dialogue'
            // eslint-disable-next-line no-case-declarations
            const dialogNode = {
              shape: 'rect',
              width: 320,
              height: 80,
              x: 200 + 200 * treeIndex,
              y: 200 + 100 * treeIndex,
              label: '',
              attrs: {
                text: {
                  // textAnchor: 'left', // 左对齐
                  // refX: -10, // x 轴偏移量
                  // refY: -10,
                  textAnchor: 'center',
                  text: treeItem?.context || ''
                }
              },
              data: {
                type: 'dialogue',
                ctype: '对话框',
                ...treeItem
              }
            }
            // eslint-disable-next-line no-case-declarations
            const parentNode = this.graph.addNode(dialogNode)
            // eslint-disable-next-line no-case-declarations
            const titleNode = this.graph.addNode({
              shape: 'title-node',
              x: parentNode.getBBox().x - 30,
              y: parentNode.getBBox().y - 30,
              attrs: {
                text: {
                  text: treeItem?.title
                }
              }
            })
            parentNode.addChild(titleNode)
            if (treeItem?.buttonDataList) { // 渲染底部按钮 包括动态按钮 和 静态按钮
              const staticButtons = treeItem.buttonDataList.filter((item, index) => {
                return item.type === 2 || item.type === 3
              })
              const dynamicButtons = treeItem.buttonDataList.filter((item, index) => {
                return item.type === 1
              })
              dynamicButtons.forEach((buttonItem, buttonIndex) => {
                const node = this.graph.addNode({
                  shape: 'dynamic-button',
                  x: parentNode.getBBox().x + 10 + 60 * buttonIndex,
                  y: parentNode.getBBox().y + parentNode.size().height - 30,
                  attrs: {
                    text: {
                      text: buttonItem.title
                    }
                  },
                  ports: {
                    items: [
                      {
                        id: `${parentNode.id}_${buttonIndex}`,
                        group: 'bottom',
                        zIndex: 20
                      }
                    ]
                  },
                  data: {
                    'button-type': 'dialogue-button',
                    ...buttonItem
                  }
                })
                parentNode.addChild(node)
              })
              staticButtons.forEach((buttonItem, buttonIndex) => {
                const node = this.graph.addNode({
                  shape: 'dotted-button',
                  x: parentNode.getBBox().x + parentNode.size().width - 60 - 10,
                  y: parentNode.getBBox().y + parentNode.size().height / 2 - 20 + 30 * buttonIndex,
                  attrs: {
                    text: {
                      text: buttonItem.title
                    }
                  },
                  data: {
                    'button-type': 'dialogue-static-button',
                    ...buttonItem
                  }
                })
                parentNode.addChild(node)
              })
            }
            break
          case 3: // judge
            // eslint-disable-next-line no-case-declarations
            const judgeParentNode = this.graph.addNode({
              shape: 'custom-polygon',
              data: {
                ...treeItem
              },
              x: 50 + 100 * treeIndex,
              y: 50 + 100 * treeIndex
            })
            // eslint-disable-next-line no-case-declarations
            const juidgeTitleNode = this.graph.addNode({
              shape: 'title-node',
              x: judgeParentNode.getBBox().x - 30,
              y: judgeParentNode.getBBox().y - 30,
              attrs: {
                text: {
                  text: treeItem?.title
                }
              }
            })
            judgeParentNode.addChild(juidgeTitleNode)
            break
          case 4: // skill节点
            // eslint-disable-next-line no-case-declarations
            const skillNode = this.graph.addNode({
              shape: 'rect',
              size: {
                width: 100,
                height: 40
              },
              x: -200 + 100 * treeIndex,
              y: 300 + 100 * treeIndex,
              attrs: {
                text: {
                  text: treeItem.title
                }
              },
              data: {
                ...treeItem,
                type: 'skill'
              }
            })
            break
          case 5:
            // eslint-disable-next-line no-case-declarations
            const { source, target } = treeItem
            // eslint-disable-next-line no-case-declarations
            let sourceData = {}
            // eslint-disable-next-line no-case-declarations
            let targetData = {}
            console.debug('source: ', source, target)
            // eslint-disable-next-line no-case-declarations
            const sourceCell = this.graph.getNodes().find((node, index) => {
              return this.getNodeId(node) === source
            })
            // eslint-disable-next-line no-case-declarations
            const targetCell = this.graph.getNodes().find((node, index) => {
              return this.getNodeId(node) === target
            })
            if (sourceCell.hasPorts()) {
              console.debug('sourceCell ports: ', sourceCell.getPorts())
              const bottomPort = sourceCell.getPorts().find((port, index) => {
                return port.group === 'bottom'
              })
              sourceData = {
                cell: sourceCell.id,
                port: bottomPort.id
              }
            } else {
              sourceData = {
                cell: sourceCell.id
              }
            }
            if (targetCell.hasPorts()) {
              const bottomPort = targetCell.getPorts().find((port, index) => {
                return port.group === 'bottom'
              })
              targetData = {
                cell: targetCell.id,
                port: bottomPort.id
              }
            } else {
              targetData = {
                cell: targetCell.id
              }
            }
            // console.debug('sourceCell: ', sourceCell)
            // console.debug('targetCell: ', targetCell)
            this.graph.addEdge({
              source: {
                ...sourceData
              },
              target: {
                ...targetData
              },
              router: {
                name: 'manhattan',
                // name: 'er',
                args: {
                  startDirections: ['bottom'],
                  endDirections: ['top']
                }
              }
            })
            break
          default:
            break
        }
      })
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
    testLinkPort () { // 测试连接桩 连接对话框底部按钮能力
      // 获取页面节点
      const nodeList = this.graph.getNodes()
      const dialogNode = nodeList.find((node, index) => {
        return node.getData().nodeType === 2
      })
      // 获取连接桩id
      const childrenId = dialogNode.getChildren()[0].id
      const firstPortId = dialogNode.getChildren()[0].getPorts()[0].id
      // 获取开始节点
      const startNode = nodeList.find((node, index) => {
        return node.id === 'start'
      })
      // 建立连接线
      this.graph.addEdge({
        source: {
          cell: childrenId,
          port: firstPortId
        },
        target: { cell: startNode },
        router: {
          name: 'manhattan',
          args: {
            startDirections: ['top'],
            endDirections: ['bottom']
          }
        }
      })
      console.debug('graph: ', this.graph.toJSON())
    },
    initGraph () {
      // console.debug('initGraph: ')
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
        mousewheel: true
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
          const targetType = afterNode.getData().type
          const targetCtype = afterNode.getData().ctype
          const nodeList = this.graph.getNodes().filter((item) => item.getData().type === targetType)
          return afterNode.clone()
          // return afterNode.clone().setAttrByPath('text/text', `${targetCtype}${nodeList.length + 1}`)
        },
        validateNode: async (node, options) => {
          const { type, ctype } = node.getData()
          const nodeList = this.graph.getNodes().filter((item) => item.getData().type === type)
          const nodeTitle = `${ctype}${nodeList.length + 1}`
          const titleNode = this.graph.addNode({
            shape: 'title-node',
            x: node.getBBox().x - 30,
            y: node.getBBox().y - 30,
            attrs: {
              text: {
                text: nodeTitle
              }
            }
          })
          node.addChild(titleNode)
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

      // setTimeout(() => { // render graph
      //   if (this.tree.length > 0) {
      //     this.generateRenderTree(this.tree)
      //   // this.testLinkPort()
      //   } else {
      //     if (graphInfo) {
      //       this.jsonToGraph(graphInfo)
      //     } else {
      //       this.jsonToGraph({ cells: [this.startNode] })
      //     }
      //   }
      //   this.logGraph()
      // }, 2000)
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
      const type = e.currentTarget.dataset.type
      const ctype = e.currentTarget.dataset.ctype
      // console.debug('handleCompositionDrag: ', type, ctype)
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
          shape: 'rect',
          width: 300,
          height: 80,
          label: '',
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
      // this.initCustomNode()
    },
    initCustomNode () {
      // Graph.registerVueComponent('dialogue', Dialogue, ['testArr']) // 注册dialogue的自定义vue组件
      // register({
      //   shape: 'dialogue',
      //   width: 350,
      //   height: 150,
      //   component: Dialogue,
      //   data: {
      //     type: 'dialogue',
      //     ctype: '对话框'
      //   }
      // })
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
            textAnchor: 'middle', // 左对齐
            textVerticalAnchor: 'middle'
            // refX: -10, // x 轴偏移量
            // refY: -10
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
      Graph.registerNode( // 对话框内的动态按钮 底部需要有连接桩
        'dynamic-button',
        {
          inherit: 'rect',
          width: 50,
          height: 20,
          attrs: {
            body: {
              fill: '#eff4ff',
              stroke: '#5f95ff',
              strokeWidth: 1,
              rx: 6,
              ry: 6
            },
            text: {
              fontSize: 12,
              fill: '#000',
              fontFamily: 'Pingfang-medium, Arial, helvetica, sans-serif',
              textAnchor: 'middle', // 左对齐
              textVerticalAnchor: 'middle'
            }
          },
          ports: { // 连接桩
            groups: {
              bottom: {
                position: 'bottom',
                attrs: {
                  circle: {
                  // magnet: true,
                    stroke: '#5f95ff',
                    r: 3
                  }
                }
              }
            }
          }
        },
        true
      )
      Graph.registerNode( // 对话框内的虚线边框静态按钮
        'dotted-button',
        {
          inherit: 'rect', // 继承于 rect 节点
          width: 60,
          height: 25,
          attrs: {
            body: {
            // rx: 6,
            // ry: 6,
              fill: '#eff4ff',
              stroke: '#b8b0b0',
              strokeWidth: 1,
              strokeDasharray: 8
            },
            text: {
              fontSize: 12,
              fill: '#b8b0b0',
              fontFamily: 'Pingfang-medium, Arial, helvetica, sans-serif',
              textAnchor: 'middle', // 左对齐
              textVerticalAnchor: 'middle'
            }
          }
        },
        true
      )
      Graph.registerNode( // 节点左上方的标题节点
        'title-node',
        {
          inherit: 'rect',
          attrs: {
            body: {
              fill: 'transparent',
              stroke: ''
            },
            label: {
              fill: '#000',
              fontSize: 12
            }
          },
          data: {
            type: 'title-node'
          }
        },
        true
      )
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
          width: 100,
          height: 50,
          attrs: {
            body: {
              strokeWidth: 1,
              stroke: '#5F95FF',
              fill: '#EFF4FF',
              refPoints: '0,10 10,0 20,10 10,20'
            },
            // text: {
            //   fontSize: 12,
            //   fill: '#262626',
            //   textAnchor: 'left', // 左对齐
            //   refX: -5, // x 轴偏移量
            //   refY: -5,
            //   text: '判定'
            // }
            text: {
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
      this.graph.on('cell:mouseenter', ({ cell }) => {
        // console.debug('mouseenter cell: ', cell)
        if (cell.isNode()) {
          cell.getData().nodeType !== 1 && cell.id !== 'start' && !cell.hasParent() && cell.addTools([
            {
              name: 'button-remove',
              args: {
                x: '100%',
                y: '50%',
                offset: { x: -10, y: 0 },
                onClick: async (payload) => {
                  const { cell, e } = payload
                  // console.debug('button-remove: ', e, cell)
                  try {
                    const res = await deleteNodeAPI({
                      nodeId: cell.getData().nodeId
                    })
                    if (res.code === 1000) {
                      cell.remove()
                      // console.debug('graph: ', this.graph.toJSON())
                      this.jsonToGraph(this.graph.toJSON())
                      return true
                    }
                  } catch (error) {
                    console.error('delete node error: ', error)
                    return false
                  }
                }
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
      const { serviceId, targetNodeInfo, sourceNodeId, type } = payload
      console.debug('updateStartNodeLink: ', serviceId, targetNodeInfo, sourceNodeId, type)
      if (serviceId !== this.serviceId) return
      setTimeout(() => {
        this.getTreeData()
      }, 500)
      // if (type === 'skill') {
      //   const { id, label } = targetNodeInfo
      //   const skillNode = {
      //     id: id.toString(),
      //     shape: 'rect',
      //     size: {
      //       width: 100,
      //       height: 40
      //     },
      //     position: {
      //       x: 0,
      //       y: 0
      //     },
      //     label,
      //     data: {
      //       type
      //     }
      //   }
      //   const edge = {
      //     source: sourceNodeId,
      //     target: id.toString()
      //   }
      //   const dagreLayout = new DagreLayout({
      //     type: 'dagre',
      //     begin: [100, 60],
      //     rankDir: 'TB',
      //     rankSep: 40,
      //     nodeSep: 40
      //   })
      //   // this.startNode
      //   console.debug(this.graph.toJSON())
      //   const cells = this.graph.toJSON().cells
      //   const edges = cells.filter((cellItem, cellIndex) => {
      //     return cellItem.shape === 'edge'
      //   })
      //   const parentNodes = cells.filter((cellItem, cellIndex) => {
      //     return cellItem.shape !== 'edge' && !cellItem.parent
      //   })
      //   const childNodes = cells.filter((cellItem, cellIndex) => {
      //     return cellItem.shape !== 'edge' && cellItem.parent
      //   })
      //   console.debug('childNodes: ', childNodes)
      //   console.debug('parentNodes: ', parentNodes)
      //   console.debug('test: ', {
      //     nodes: [skillNode, ...parentNodes],
      //     edges: [edge, ...edges]
      //   })
      //   const firstLayers = dagreLayout.layout({
      //     nodes: [skillNode, ...parentNodes],
      //     edges: [edge, ...edges]
      //   })
      //   // this.normalizeNodePosition(firstLayers.nodes)
      //   const secondLayers = [] // 第二层布局 { nodes: [], edges: [] }
      //   parentNodes.forEach((parentNode, parentIndex) => {
      //     console.debug('foreach get children: ', parentNode.children)
      //     if (parentNode.children) {
      //       const secondLevelLayout = new DagreLayout({ // 子节点 布局
      //         type: 'dagre',
      //         align: '',
      //         rankSep: 40,
      //         nodeSep: 40,
      //         width: parentNode.size.width,
      //         height: parentNode.size.heigh,
      //         begin: [parentNode.x, parentNode.y]
      //       })
      //       const childGroups = parentNode.children.map((childId, childIndex) => {
      //         return childNodes.find((childItem) => {
      //           return childItem.id === childId
      //         })
      //       })
      //       console.debug('childGroups: ', childGroups)
      //       const secondLayout = secondLevelLayout.layout({
      //         nodes: [...childGroups],
      //         edges: []
      //       })
      //       this.normalizeNodePosition(secondLayout.nodes)
      //       secondLayers.push(secondLayout)
      //     }
      //   })
      //   const allSecondNodes = secondLayers.map((item) => {
      //     return item.nodes
      //   })
      //   const allSecondEdges = secondLayers.map((item) => {
      //     return item.edges !== []
      //   })
      //   console.debug('allSecondNodes: ', allSecondNodes)
      //   console.debug('allSecondEdges: ', allSecondEdges)
      //   // this.jsonToGraph(firstLayers)
      //   this.jsonToGraph({
      //     nodes: [...firstLayers.nodes, ...childNodes],
      //     edges: [...firstLayers.edges]
      //   })
      //   // console.debug('render ok: graph: ', this.graph.toJSON())
      //   // console.debug('渲染ok')
      // } else if (type === 'node') {
      //   const { id } = targetNodeInfo
      //   const targetNodeType = targetNodeInfo.getData().type
      //   const edge = {
      //     source: 'start',
      //     target: id.toString()
      //   }
      //   const dagreLayout = new DagreLayout({
      //     type: 'dagre',
      //     rankDir: '',
      //     align: 'UL',
      //     rankSep: 40,
      //     nodeSep: 40
      //   })
      //   if (targetNodeType === 'judge') { // 区分是什么节点 judge dialogue
      //     const data = {
      //       nodes: [this.startNode, {
      //         id: id.toString(),
      //         shape: 'custom-polygon',
      //         attrs: {
      //           body: {
      //             refPoints: '0,10 10,0 20,10 10,20'
      //           }
      //         },
      //         size: {
      //           width: 100,
      //           height: 50
      //         },
      //         label: targetNodeInfo.getAttrByPath('text/text'),
      //         data: {
      //           type: targetNodeType,
      //           ctype: targetNodeInfo.getAttrByPath('text/text')
      //         }
      //       }],
      //       edges: [edge]
      //     }
      //     const model = dagreLayout.layout(data)
      //     this.jsonToGraph(model)
      //   } else if (targetNodeType === 'dialogue') {
      //     const data = {
      //       // this.startNode,
      //       nodes: [this.startNode, {
      //         id: id.toString(),
      //         shape: 'rect',
      //         width: 200,
      //         height: 80,
      //         label: targetNodeInfo.getAttrByPath('text/text'),
      //         data: {
      //           type: targetNodeType,
      //           ctype: targetNodeInfo.getData().ctype
      //         }
      //       }],
      //       edges: [edge]
      //     }
      //     const model = dagreLayout.layout(data)
      //     this.jsonToGraph(model)
      //   }
      // }
    },
    updateJudgeNodeRender (formInfo) {
      // console.debug('updateJudgeNodeRender: ', formInfo)
      setTimeout(() => {
        this.getTreeData()
      }, 500)
      // const { nodeId, interActifyAssertsList, content, title } = formInfo
      // const nodeList = this.graph.getNodes()
      // const target = nodeList.find((node) => {
      //   return node.getData().nodeId === nodeId
      // })
      // target.setAttrByPath('text/text', content) // 更新文案
      // const childNodes = target.getChildren() || []
      // if (childNodes && childNodes?.length > 0) {
      //   const titleNode = childNodes.find(item => item.getData().type === 'title-node')
      //   titleNode.setAttrByPath('text/text', formInfo.title) // 获取并更新对话框标题
      // }
    },
    updateDialogueNodeRender (formInfo) { // 更新画布中 刚更新过的对话框节点 渲染
      console.debug('updateDialogueNodeRender: ', formInfo)
      setTimeout(() => {
        this.getTreeData()
      }, 500)
      // payload 是节点详情 form 数据 里面已经有节点id了
      // const { nodeId, interActifyButtonsList, content } = formInfo
      // 匹配对应节点 并更新里面的 title content buttonList 试试看吧
      // const nodeList = this.graph.getNodes()
      // const target = nodeList.find((node) => {
      //   return node.getData().nodeId === nodeId
      // })
      // target.setAttrByPath('text/text', content) // 更新对话框文案
      // const childNodes = target.getChildren() || []
      // if (childNodes && childNodes?.length > 0) {
      //   const titleNode = childNodes.find(item => item.getData().type === 'title-node')
      //   titleNode.setAttrByPath('text/text', formInfo.title) // 获取并更新对话框标题
      // }
      // // 先清空所有 动态和静态的按钮
      // childNodes.forEach((node) => {
      //   if (node.getData().type === 1) {
      //     target.removeChild(node) // this.graph.removeNode(node) 也可以实现画布删除节点
      //   }
      // })
      // // 把按钮加回来
      // if (interActifyButtonsList && interActifyButtonsList.length > 0) {
      //   interActifyButtonsList.forEach((buttonItem, buttonIndex) => {
      //     if (buttonItem.type === 1) { // 动态按钮
      //       const newButtonNode = this.graph.addNode({
      //         shape: 'dynamic-button',
      //         x: target.getBBox().x + 10 + 60 * buttonIndex,
      //         y: target.getBBox().y + target.size().height - 30,
      //         attrs: {
      //           text: {
      //             text: buttonItem.name
      //           }
      //         },
      //         ports: { // @todo 连接桩 这里要看后台树形结构是怎么返回
      //           items: [
      //             {
      //               id: `${target.id}_${buttonIndex}`,
      //               group: 'bottom',
      //               zIndex: 20
      //             }
      //           ]
      //         },
      //         data: {
      //           type: 'dialogue-button',
      //           ...buttonItem
      //         }
      //       })
      //       target.addChild(newButtonNode)
      //     }
      //   })
      // }
      this.$nextTick(() => {
        this.logGraph()
      })
    },
    initVuexListen () {
      store.subscribe((mutation, state) => {
        if (mutation.type === 'flow/updateStartNodeLink') {
          // console.debug('mutation type triggle,', mutation.type)
          this.updateStartNodeLink(mutation.payload)
        }
        if (mutation.type === 'flow/updateDialogueDetail') {
          this.updateDialogueNodeRender(mutation.payload)
        }
        if (mutation.type === 'flow/updateJudgeNodeDetail') {
          this.updateJudgeNodeRender(mutation.payload)
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
    // console.debug('graph created: ', this.serviceId)
    this.getVersionId()
    this.getTreeData()
  },
  mounted () {
    this.initConfig()
    this.initGraph()
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
