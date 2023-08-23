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
import { addJudgeNodeAPI, addDialogueNodeAPI, addEndNodeAPI, deleteNodeAPI, getVersionIdAPI, getTreeDataAPI } from '@/services/flow'
// import { getStatuTitleAPI } from '@/services/services'
import { getAnyliseTreeAPI } from '@/services/anylise'
import initRegister from './index.js'
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
      needToLayout: true,
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
      }
      // startNode: { // 开始节点
      //   id: '', // String，节点的唯一标识
      //   shape: 'ellipse', // 使用 ellipse 渲染
      //   x: 50, // Number，必选，节点位置的 x 值
      //   y: 50, // Number，必选，节点位置的 y 值
      //   width: 100, // Number，可选，节点大小的 width 值
      //   height: 50, // Number，可选，节点大小的 height 值
      //   attrs: {
      //     body: {
      //       fill: '#eff4ff',
      //       stroke: '#5f95ff',
      //       strokeWidth: 1,
      //       rx: 16,
      //       ry: 16
      //     },
      //     label: {
      //       text: '开始',
      //       fill: '#333',
      //       fontSize: 16,
      //       fontWeight: 'normal',
      //       fontVariant: 'small-caps'
      //     }
      //   },
      //   data: {
      //     type: 'start'
      //   }
      // }
    }
  },
  methods: {
    // 按照树级结构，重新渲染节点
    layout () {
      const graph = this.graph
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

      graph.fromJSON(model)

      if (this.needToLayout) {
        graph.scaleContentToFit().centerContent() // 居中显示画布
      }

      // graph.on('render:done', () => {
      //   graph.centerContent().scaleContentToFit() // 居中显示画布
      // })
    },
    // 生成渲染树 x6 cell 格式树
    // treeData - 后端返回的所有节点、连线的数据
    generateRenderTree (treeData) {
      const graph = this.graph
      console.log('generateRenderTree: ', treeData)
      if (graph && graph.getCellCount() > 0) {
        graph.clearCells()
      }

      const cells = []
      treeData.forEach((item, index) => {
        let obj
        const keyV = {
          1: 'c-ellipse', // 椭圆（开始）
          2: 'er-rect', // 对话框
          3: 'custom-polygon', // 菱形（判断）
          4: 'c-rect', // 标准矩形（技能）
          5: 'end', // 结束  type: 'end'
          6: 'implement', // 连线
          8: 'c-attrs' // 属性节点
        }
        const commonObj = {
          id: item.nodeId, // String，节点的唯一标识
          nodeType: item.nodeType,
          shape: keyV[item.nodeType] // 使用 ellipse 渲染
        }

        if (item.nodeType === 1) { // 开始
          obj = {
            ...commonObj,
            label: item.title,
            data: {
              type: 'start',
              ...item
            }
          }
          cells.push(obj)
        } else if (item.nodeType === 2) { // 对话框
          const ports = item.buttonDataList.map((obj, index) => {
            // 判断是否有连线
            const hasEdge = treeData.find(node => {
              return node.nodeType === 6 && node.source === obj.buttonId
            })
            return {
              id: obj.buttonId,
              group: 'list',
              attrs: {
                portNameLabel: {
                  text: obj.title
                },
                portTypeLabel: {
                  text: obj.buttonId
                },
                portCircle2: {
                  text: hasEdge ? '.' : '' // 节点右侧的圆点，有连线时就显示，没有就不显示
                },
                portFan: obj.isActive === 1 // 节点左侧的三角形，只有勾选了【设为默认落焦】的按钮才显示
                  ? {
                      fill: 'rgba(0,0,0,0.38)',
                      refX: 0,
                      refY: 14,
                      refPoints: '0,0 0,10 10,10 0,0'
                    }
                  : undefined
              }
            }
          })

          obj = {
            ...commonObj,
            label: item.context ? `${item.context}--${item.nodeId}` : item.title,
            attrs: {
              title: {
                text: item.title
              }
            },
            ports,
            data: {
              type: 'dialogue',
              ctype: '对话框',
              ...item
            }
          }
          cells.push(obj)
        } else if (item.nodeType === 3) { // 菱形
          const obj = {
            ...commonObj,
            attrs: {
              title: {
                text: item.title
              }
            },
            data: {
              ...item
            }
          }
          cells.push(obj)
        } else if (item.nodeType === 4) { // 技能
          const obj = {
            ...commonObj,
            label: item.title,
            data: {
              ...item,
              type: 'skill'
            }
          }
          cells.push(obj)
        } else if (item.nodeType === 8) { // 属性
          const obj = {
            ...commonObj,
            label: item.title,
            data: {
              ...item,
              type: 'attr'
            }
          }
          cells.push(obj)
        } else if (item.nodeType === 5) { // 结束 end
          const obj = {
            ...commonObj,
            attrs: {
              title: {
                text: item.title
              }
            },
            data: {
              ...item
            }
          }
          cells.push(obj)
        } else if (item.nodeType === 6) { // 连线
          const { source, target } = item

          let sourceData = {}
          let targetData = {}

          let allCellList = []
          // 将 buttonDataList 中的数组也拉平到数组当中
          treeData.forEach((item, index) => {
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

          const aaa = allCellList.find(obj => {
            return obj.nodeId === source || obj.id === target
          })
          const bbb = allCellList.find(obj => {
            return obj.nodeId === target || obj.id === target
          })
          // console.log('allCellList---->', allCellList)
          // console.log('aaa', aaa, source)
          // console.log('bbb', bbb, target)
          if (aaa && bbb) {
            sourceData = {
              cell: aaa.parentId ? aaa.parentId : aaa.nodeId,
              port: aaa.parentId ? aaa.nodeId : null
            }
            targetData = {
              cell: bbb.parentId ? bbb.parentId : bbb.nodeId,
              port: bbb.parentId ? bbb.nodeId : null
            }
            // console.log('sourceData', sourceData)
            // console.log('targetData', targetData)
            const obj = {
              ...commonObj,
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
        }
      })

      const createCells = []
      cells.forEach((treeItem, treeIndex) => {
        if (treeItem.nodeType) {
          if (treeItem.nodeType === 6) {
            createCells.push(this.graph.createEdge(treeItem)) // 连线
          } else {
            createCells.push(this.graph.createNode(treeItem))// 节点
          }
        }

        graph.resetCells(createCells)
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
    // 打印
    logGraph () {
      console.debug('logGraph: ', this.graph.toJSON())
    },

    initGraph () {
      // 注册节点，连线等
      const RegisterGraph = initRegister(Graph)
      // eslint-disable-next-line @typescript-eslint/no-this-alias

      this.graph = new RegisterGraph({
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
      const graph = this.graph
      graph.use( // 拉动节点 显示图形转换 初始化
        new Transform({
          resizing: this.resizingOptions
        })
      )
      const graphInfo = store.getters.graphList.find(item => item.serviceId === this.serviceId)?.graphInfo
      // console.debug('graphInfo renderdata: ', graphInfo)
      // console.debug('graphInfo renderdata: ', this.tree)

      graph.use(
        new Snapline({
          enabled: true
        })
      )
      this.dnd = new Dnd({
        target: graph,
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
          const keyV = {
            judge: addJudgeNodeAPI,
            dialogue: addDialogueNodeAPI,
            // skill: 'c-rect',
            end: addEndNodeAPI
          }

          try {
            const res = await keyV[type]({
              title: nodeTitle,
              versionId: this.versionId
            })
            if (res.code === 1000) {
              const { nodeId } = res.data
              node.setData({
                nodeId: nodeId.toString()
              })
              // 设置title，更新属性
              node.setAttrs({
                title: { text: nodeTitle }
              })
              return true
            }
          } catch (error) {
            return false // 不创建
          }

          // if (type === 'judge') {
          //   try {
          //     const res = await addJudgeNodeAPI({
          //       title: nodeTitle,
          //       versionId: this.versionId
          //     })
          //     // console.debug('addJudgeNodeAPI res: ', res)
          //     if (res.code === 1000) {
          //       const { nodeId } = res.data
          //       node.setData({
          //         nodeId: nodeId.toString()
          //       })
          //       // 设置title，更新属性
          //       node.setAttrs({
          //         title: { text: nodeTitle }
          //       })
          //       return true
          //     }
          //   } catch (error) {
          //     return false
          //   }
          // } else if (type === 'dialogue') {
          //   try {
          //     const res = await addDialogueNodeAPI({
          //       title: nodeTitle,
          //       versionId: this.versionId
          //     })
          //     if (res.code === 1000) {
          //       // console.debug('addDialogueNodeAPI res: ', res)
          //       const { nodeId } = res.data
          //       // 设置title，更新属性
          //       node.setData({
          //         nodeId: nodeId.toString()
          //       })
          //       node.setAttrs({
          //         title: { text: nodeTitle }
          //       })
          //       // node.attrs.title.text = nodeTitle
          //       return true
          //     }
          //   } catch (error) {
          //     console.error('add dialogue api error: ', error)
          //     return false
          //   } finally {
          //     this.logGraph()
          //   }
          // }
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
      const type = e.currentTarget.dataset.type
      const ctype = e.currentTarget.dataset.ctype
      console.debug('handleCompositionDrag: ', type, ctype)
      // console.log('e.currentTarget=====> ', e)
      let node = null
      const keyV = {
        judge: 'custom-polygon',
        dialogue: 'er-rect',
        end: 'end'
      }

      node = this.graph.createNode({
        shape: keyV[type],
        label: ctype,
        data: {
          type,
          ctype
        }
      })
      this.dnd.start(node, e)
      // if (type === 'judge') {
      //   node = this.graph.createNode({
      //     shape: 'custom-polygon',
      //     label: '',
      //     data: {
      //       type,
      //       ctype
      //     }
      //   })
      // } else if (type === 'dialogue') {
      //   node = this.graph.createNode({
      //     shape: 'er-rect',
      //     label: ctype,
      //     data: {
      //       type,
      //       ctype
      //     }
      //   })
      // } else if (type === 'skill') {
      //   node = this.graph.createNode({
      //     shape: 'c-rect',
      //     data: {
      //       type
      //     }
      //   })
      // }
    },
    addZoom () {
      // 偏移歪了
      this.graph.zoom(0.1).centerContent()
    },
    reduceZoom () {
      this.graph.zoom(-0.1).centerContent()
    },

    // initConfig () {
    //   this.initShapeConfig()
    //   this.initRhombicNode() // 初始化菱形节点
    //   // this.initCustomNode()
    // },

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
      // 鼠标hover 时，添加删除按钮
      this.graph.on('cell:mouseenter', ({ cell }) => {
        // console.debug('mouseenter cell: ', cell)
        if (cell.isNode()) {
          cell.getData().nodeType !== 1 && cell.id !== 'start' && !cell.hasParent() && this.isEdit && cell.addTools([
            {
              name: 'button-remove',
              args: {
                x: '100%',
                y: '50%',
                offset: { x: -5, y: 0 },
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
        // const aaa = this.graph.getCellById(node.id)
        const { type, nodeId, nodeType } = node.data
        // console.debug('click: node.getData(): ', node.getData())
        // 【技能】、【结束】 节点不能点击打开详情
        if ((type !== 'skill' || nodeType !== 4) && !node.hasParent() && type !== 'end' && type !== 'attr') {
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
    // async updateStartNodeLink (payload) { // 更新节点信息 连线布局
    //   // console.debug('updateStartNodeLink: ')
    //   if (payload.serviceId !== this.serviceId) return
    //   // setTimeout(() => {
    //   await this.getTreeData()
    //   store.commit('flow/updateStatuTitle', {
    //     serviceId: this.serviceId
    //   })
    //   this.$message.success('更新成功1')
    //   this.$nextTick(() => {
    //     this.logGraph()
    //   })
    //   // }, 500)
    // },
    // async updateJudgeNodeRender (formInfo) {
    //   // console.debug('updateJudgeNodeRender: ')
    //   // setTimeout(() => {
    //   await this.getTreeData()
    //   store.commit('flow/updateStatuTitle', {
    //     serviceId: this.serviceId
    //   })
    //   this.$message.success('更新成功2')
    //   this.$nextTick(() => {
    //     this.logGraph()
    //   })
    //   // }, 500)
    // },
    // async updateDialogueNodeRender (formInfo) { // 更新画布中 刚更新过的对话框节点 渲染
    //   // console.debug('updateDialogueNodeRender: ')
    //   // setTimeout(() => {
    //   await this.getTreeData()
    //   store.commit('flow/updateStatuTitle', {
    //     serviceId: this.serviceId
    //   })
    //   this.$message.success('更新成功3')
    //   // }, 500)
    //   this.$nextTick(() => {
    //     this.logGraph()
    //   })
    // },
    async getAnyliseTreeData (formData) {
      try {
        delete formData.time
        const res = await getAnyliseTreeAPI(formData)
        if (res.code === 1000) {
          // console.debug('getAnyliseTreeData')
          this.tree = res.data
          this.showAnylise = true
          this.treeToGraph()
        }
      } catch (error) {
        console.error('getAnyliseTreeData error: ', error)
      }
    },
    initVuexListen () {
      store.subscribe(async (mutation, state) => {
        const payload = mutation.payload
        const type = mutation.type
        const layoutType = 'notNeedToLayout'
        // 只处理当前tab中的数据，其他tab中的监听，直接返回，不处理
        if (payload.serviceId && payload.serviceId !== this.serviceId) return

        if (type === 'flow/updateStartNodeLink' ||
        type === 'flow/updateDialogueDetail' ||
        type === 'flow/updateJudgeNodeDetail') {
          await this.getTreeData(layoutType)
          store.commit('flow/updateStatuTitle', {
            serviceId: this.serviceId
          })
          // this.$message.success('更新成功')
          console.log('更新成功1----type-------', mutation.type)
          this.$nextTick(() => {
            this.logGraph()
          })
        } else if (type === 'flow/updateGraphTree') {
          // console.debug('mutation updateGraphTree getTreeData')
          await this.getTreeData(layoutType).then(() => {
            // setTimeout(() => {
            this.getVersionId()
            // }, 800)
            return store.commit('flow/updateVersionId', {
              serviceId: this.serviceId
            })
          })

          this.$nextTick(() => {
            this.logGraph()
          })
        } else if (mutation.type === 'flow/setAnyliseFilterForm') {
          // console.debug('setAnyliseFilterForm: ', mutation.payload)
          this.getAnyliseTreeData(mutation.payload)
        }
      })
    },
    // initVuexListen2 () {
    //   store.subscribe(async (mutation, state) => {
    //     const payload = mutation.payload
    //     console.log('mutation.payload.serviceId', mutation.payload.serviceId)
    //     console.log('this.serviceId', this.serviceId)
    //     console.log('----------------------------------------')
    //     if (mutation.type === 'flow/updateStartNodeLink') {
    //       // console.debug('mutation type triggle,', mutation.type)
    //       if (mutation.payload.serviceId !== this.serviceId) return
    //       // this.updateStartNodeLink(mutation.payload)
    //       // ------------------
    //       if (payload.serviceId !== this.serviceId) return
    //       // setTimeout(() => {
    //       await this.getTreeData()
    //       store.commit('flow/updateStatuTitle', {
    //         serviceId: this.serviceId
    //       })
    //       this.$message.success('更新成功')
    //       console.log('更新成功1')
    //       this.$nextTick(() => {
    //         this.logGraph()
    //       })
    //     }
    //     if (mutation.type === 'flow/updateDialogueDetail') {
    //       // this.updateDialogueNodeRender(mutation.payload)
    //       // console.debug('updateDialogueNodeRender: ')
    //       // setTimeout(() => {
    //       await this.getTreeData()
    //       store.commit('flow/updateStatuTitle', {
    //         serviceId: this.serviceId
    //       })
    //       this.$message.success('更新成功')
    //       console.log('更新成功2')
    //       // }, 500)
    //       this.$nextTick(() => {
    //         this.logGraph()
    //       })
    //     }
    //     if (mutation.type === 'flow/updateJudgeNodeDetail') {
    //       // this.updateJudgeNodeRender(mutation.payload)
    //       // console.debug('updateJudgeNodeRender: ')
    //       // setTimeout(() => {
    //       await this.getTreeData()
    //       store.commit('flow/updateStatuTitle', {
    //         serviceId: this.serviceId
    //       })
    //       this.$message.success('更新成功3')
    //       this.$nextTick(() => {
    //         this.logGraph()
    //       })
    //     }
    //     if (mutation.type === 'flow/updateGraphTree') {
    //       if (mutation.payload.serviceId !== this.serviceId) return
    //       console.debug('mutation updateGraphTree getTreeData')
    //       await this.getTreeData().then(() => {
    //         // setTimeout(() => {
    //         this.getVersionId()
    //         // }, 800)
    //         return store.commit('flow/updateVersionId', {
    //           serviceId: this.serviceId
    //         })
    //       })

    //       this.$nextTick(() => {
    //         this.logGraph()
    //       })
    //       // setTimeout(() => {
    //       // })
    //     }
    //     if (mutation.type === 'flow/setAnyliseFilterForm') {
    //       // console.debug('setAnyliseFilterForm: ', mutation.payload)
    //       if (mutation.payload.serviceId !== this.serviceId) return
    //       this.getAnyliseTreeData(mutation.payload)
    //     }
    //   })
    // },
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
    async getTreeData (type) {
      try {
        const res = await getTreeDataAPI({
          serviceId: Number(this.serviceId)
        })

        if (res.code === 1000) {
          this.tree = res.data
          this.needToLayout = type !== 'notNeedToLayout'
          this.treeToGraph()
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
    // tree: {
    //   handler (newVal, oldVal) {
    //     // console.debug('tree watch: ', newVal, oldVal)
    //     this.treeToGraph()
    //   },
    //   deep: true
    // }
  },
  created () {
    if (this.isEdit) {
      this.getVersionId()
      this.getTreeData()
    }
  },
  mounted () {
    // this.initConfig()
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
    if (this.isEdit) {
      this.getVersionId()
      this.getTreeData()
      store.commit('flow/updateStatuTitle', {
        serviceId: this.serviceId
      })
    } else {
      store.commit('flow/initAnyliseData', {
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
