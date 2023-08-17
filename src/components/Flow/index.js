//   1: 'c-ellipse', // 椭圆（开始）
//   2: 'er-rect', // 对话框  type: 'dialogue'
//   3: 'custom-polygon', // 菱形（判断）type: 'judge'
//   4: 'c-rect', // 标准矩形（技能） type: 'skill'
//   5: 'end' // 结束  type: 'end'
//   6: 'implement' // 连线

function initRegister (Graph) {
  const LINE_HEIGHT = 24
  const NODE_WIDTH = 150
  // 自定义连线
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
  // 注册弹窗
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
        },
        {
          tagName: 'text',
          selector: 'title'
        }
      ],
      attrs: {
        rect: {
          strokeWidth: 1,
          stroke: '#5F95FF',
          fill: '#5F95FF',
          height: 30
        },
        label: {
          fontWeight: 'bold',
          fill: '#000',
          fontSize: 14
        },
        title: {
          fill: '#999',
          fontSize: 12,
          refY: -12,
          refX: 0,
          // textAlign: 'left'
          textAnchor: 'start'
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
  // 初始化菱形的 port
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
  // 初始化菱形节点
  Graph.registerNode(
    'custom-polygon',
    {
      inherit: 'polygon',
      width: 70,
      height: 70,
      markup: [
        {
          tagName: 'polygon',
          selector: 'body'
        },
        {
          tagName: 'text',
          selector: 'text'
        },
        {
          tagName: 'text',
          selector: 'title'
        }
      ],

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
        },
        title: {
          fill: '#999',
          fontSize: 12,
          refY: -12,
          refX: 0,
          // textAlign: 'left'
          textAnchor: 'start'
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

  // 初始化矩形(技能的样式)图形配置
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

  // 初始化 开始 图形配置
  Graph.registerNode(
    'c-ellipse',
    {
      inherit: 'ellipse',
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
          fill: '#333',
          fontSize: 16,
          fontWeight: 'normal',
          fontVariant: 'small-caps'
        }
      }
    },
    true
  )

  // 初始化矩形(技能的样式)图形配置
  Graph.registerNode(
    'end',
    {
      inherit: 'circle',
      width: 60,
      height: 60,
      label: '结束',
      markup: [
        {
          tagName: 'circle',
          selector: 'body'
        },
        {
          tagName: 'text',
          selector: 'text'
        },
        {
          tagName: 'text',
          selector: 'title'
        }
      ],
      attrs: {
        body: {
          fill: '#feebe7',
          stroke: '#ff645a'
        },
        text: {
          fill: '#262626',
          fontSize: 12
        },
        title: {
          fill: '#999',
          fontSize: 12,
          refY: -12,
          refX: 0,
          // textAlign: 'left'
          textAnchor: 'start'
        }
      }
    },
    true
  )

  return Graph
}

export default initRegister
