import GGEditor, { Mind, Command, EditableLabel, constants, RegisterNode } from 'gg-editor'
import React from 'react'

import { Button, Row, Col, Divider } from 'antd'
import CustomCommand from './customCommand'

const WRAPPER_CLASS_NAME = 'node-wrapper'
const CONTENT_CLASS_NAME = 'node-content'
const LABEL_CLASS_NAME = 'node-label'
const WRAPPER_BORDER_WIDTH = 2
const WRAPPER_HORIZONTAL_PADDING = 10
const { EditorCommand } = constants
const MIND_COMMAND_LIST = [
  EditorCommand.Undo,
  EditorCommand.Redo,
  '|',
  EditorCommand.Copy,
  EditorCommand.Paste,
  EditorCommand.Remove,
  '|',
  EditorCommand.Topic,
  EditorCommand.Subtopic,
  '|',
  EditorCommand.Fold,
  EditorCommand.Unfold,
  '|',
  EditorCommand.ZoomIn,
  EditorCommand.ZoomOut,
]
const JpCommand = {
  undo: 'アンドゥ',
  redo: 'リドゥ',
  copy: 'コピー',
  paste: 'ペースト',
  remove: '削除',
  topic: '兄弟ノード追加',
  subtopic: '子ノード追加',
  fold: '閉じる',
  unfold: '展開',
  zoomIn: 'ズームイン',
  zoomOut: 'ズームアウト',
}

const getKeyValue = function <T extends object, U extends keyof T>(obj: T, key: U) {
  return obj[key]
}

const testData = {
  label: 'Central Topic',
  children: [
    {
      label: 'Main Topic 1',
    },
    {
      label: 'Main Topic 2',
    },
  ],
}

const nodeSelectBehavior = (page: any) => {
  console.log('behavier')
  page.on('node:click', (ev: any) => {
    console.log('Here is an example behavior')
  })
}

const styleAbs = {
  position: 'absolute' as const,
  left: '100px',
  top: '150px',
  width: '300px',
  height: '50px',
  border: '3px solid #73AD21',
  //zIndex: '530000'
}

const styleButton = {
  backgroundColor: '#fafafa',
  marginTop: '10px',
  marginLeft: '10px',
  marginRight: '10px',
  color: 'black',
}

const removeButton = {
  ...styleButton,
  backgroundColor: 'rgb(204,71,71)',
  color: '#fff',
}

const mousePos = { x: '0px', y: '0px' }

export default class FlowDiagram extends React.Component<any, any> {
  constructor(props: any) {
    super(props)

    this.state = {
      valueStyle: { ...styleAbs },
      valueHidden: true,
      valueX: '0px',
      valueY: '0px',
      valueData: this.props.data,
      valueNodeKey: -1,
    }

    console.log(this.props.data)
  }

  updateMouse(x: number, y: number) {
    const mx = Math.floor(x).toString() + 'px'
    const my = Math.floor(y).toString() + 'px'
    mousePos.x = mx
    mousePos.y = my
    this.setState({ valueX: mousePos.x })
    this.setState({ valueY: mousePos.y })

    console.log(this.state.valueX, this.state.valueY)
  }

  findKeyObj(src: any, dst: any, key: number) {
    console.log('find obj', src)
    if (src.key == key) {
      dst = src
      console.log('FIND======>', dst)
      src['children'] = { label: 'test', key: 100 }

      return
    }
    if ('children' in src) {
      const ch = src['children']
      for (let i = 0; i < ch.length; i++) this.findKeyObj(ch[i], dst, key)
    }
  }

  clickAddNode(e: any) {
    console.log('click add node', e)
    this.setState({ valueHidden: true })

    console.log('this.props.data', this.props.data)
    const lastKey = parseInt(this.state.valueNodeKey)
    console.log('last node key:', lastKey)

    const maxID = -1
    const lastX = 0
    const lastY = 0

    const srcNodes = { ...this.state.valueData }
    //let srcNodes = this.state.valueData;
    let dst: any
    //this.findKeyObj(srcNodes, dst, 3);
    console.log('find', dst)
    console.log('srcNodes:', srcNodes)

    srcNodes['children'].push({ label: 'test', key: 100 })
    /*

    Object.entries(srcNodes).map((e:any)=>
    {
      console.log("e:", e);
      if( maxID < e.key )
      {
        maxID = e.key;
      }
      return e;
    })
    maxID++;

    console.log("lastKEY:", lastKey);
    Object.entries(srcNodes).map((e:any)=>
    {
      console.log("iterate:", e);
      if(e.key == lastKey)
      {
        if (!('children' in e))
          e['children'] = [];

        console.log("!!!!!!!!!!!!!!!!!");
        e['children'].push({label:'test', key:maxID})
      }
      return e;
    })
    */
    console.log('After:srcNodes:', srcNodes)

    //this.setState({valueData:srcNodes});
    this.setState({ valueData: testData })
  }

  clickRemoveNode(e: any) {
    const srcNodes = this.state.valueData.nodes
    const srcEdges = this.state.valueData.edges

    const lastKey = parseInt(this.state.valueNodeKey)

    const nodes = srcNodes.filter((e: any, i: number) => {
      return e.id != lastKey
    })

    const edges = srcEdges.filter((e: any, i: number) => {
      return e.target != lastKey
    })

    const data = {
      nodes: nodes,
      edges: edges,
    }
    this.setState({ valueData: data })
  }

  render() {
    //let pos = {left:mousePos.x, top:mousePos.y}
    const pos = { left: this.state.valueX, top: this.state.valueY }
    const style = { ...pos, ...styleAbs }
    //console.log("render", pos)
    //console.log("render:", this.state.valueData)

    const _this = this
    return (
      <GGEditor>
        <div className={'toolbar'}>
          {MIND_COMMAND_LIST.map((name: any, index: number) => {
            const jpName = getKeyValue(JpCommand, name)

            if (name === '|') {
              return <Divider key={index} type="vertical" />
            }

            return (
              <Command
                key={name}
                className={'command'}
                disabledClassName={'commandDisabled'}
                name={name}
              >
                {jpName}
              </Command>
            )
          })}
        </div>

        <div
          style={{
            zIndex: 1000,
            position: 'absolute',
            width: '226px',
            height: '50px',
            border: '1px solid #aaa',
            borderRadius: '3px 3px',
            backgroundColor: 'rgb(220,240,240)',
            boxShadow: '5px 5px 5px #ddd',
            left: this.state.valueX,
            top: this.state.valueY,
          }}
          hidden={this.state.valueHidden}
        >
          <Row>
            <Col>
              <Button style={styleButton} onClick={this.clickAddNode.bind(_this)}>
                ノードを追加
              </Button>
            </Col>
            <Col>
              <Button style={removeButton} onClick={this.clickRemoveNode.bind(_this)}>
                削除
              </Button>
            </Col>
          </Row>
        </div>
        <Mind
          className={'graph'}
          data={this.state.valueData}
          onNodeMouseEnter={(e: any) => {
            const key = e.item._cfg.model.key
            console.log('--- enter node --- id:', key, e)
            /*
            _this.updateMouse(e.clientX, e.clientY)
            _this.setState({ valueNodeKey: key })
            _this.setState({ valueHidden: false });*/
          }}
          onNodeMouseLeave={(e: any) => {
            console.log('--- leave node ---')
            //_this.setState({ valueHidden: true });
          }}
          onNodeDoubleClick={(e: any) => {
            //_this.setState({ valueHidden: true });
          }}
          onNodeDragStart={(e: any) => {
            //_this.setState({ valueHidden: true });
          }}
          onNodeDragEnter={(e: any) => {
            //_this.setState({ valueHidden: true });
          }}
          onCanvasMouseMove={(e: any) => {
            //console.log(e);
            /*
            let mx = Math.floor(e.x.toString()) + 'px';
            let my = Math.floor(e.y).toString() + 'px';
            mousePos.x = mx;
            mousePos.y = my;*/
            //_this.updateMouse(e.x, e.y)
          }}
          onKeyDown={(e: any) => {
            console.log('key down!!')
          }}
          /*
          onMouseMove={(e:any)=>{
            let mx = e.x.toString() + 'px';
            let my = Math.floor(e.y).toString() + 'px';
            mousePos.x = mx;
            mousePos.y = my;
            //console.log("update:", valueUpdateFlag, "mx:", mx, " my:", my);
            //if(valueUpdateFlag)
            //console.log("pos:", mousePos);
            //setX(mx)
           // setY(my)
           // console.log("valueX:", mx, valueX);

           //let pos = {left:mousePos.x, top:mousePos.y}
           //let stylePop ={...pos, ...styleAbs, };
           //_this.setState({valueStyle:stylePop});
           _this.setState({valueX:mousePos.x});
           _this.setState({valueY:mousePos.y});

           console.log("valueX:", this.state.valueX);
           console.log("valueY:", this.state.valueY);


          }}*/
          graphConfig={{
            defaultNode: {
              //type: 'flow-circle' ,
              shape: 'bizFlowNode',
            },

            defaultEdge: {
              shape: 'bizFlowEdge',
              //size:[100,100],
            },
          }}
        />
        {/* <CustomCommand /> */}
        {/*コンテキストメニュー
        <ContextMenu
          renderContent={(item, position, hide) => {
            const { x: left, y: top } = position;

            return (
              <div style={{ position: 'absolute', top, left }}>
                <Menu mode="vertical" selectable={false} onClick={hide}>
                  <Menu.Item>Option 1</Menu.Item>
                  <Menu.Item>Option 2</Menu.Item>
                  <Menu.Item>Option 3</Menu.Item>
                  <Menu.Item><Command name="undo">Undo</Command></Menu.Item>

                  <Menu.Item><Command name="append">append</Command></Menu.Item>
                  <Menu.Item><Command name="appendChild">append Child</Command></Menu.Item>

                </Menu>
              </div>
            );
          }}
        />*/}

        {/* ポップアップ
        <ItemPopover renderContent={(item: any, position: any) => {
          const { minY: top, centerX: left } = position;

          return (
            <Popover visible={true} title="Title" content="Content">
              <div style={{ position: 'absolute', top, left }} />
            </Popover>
          );
        }} />
    */}
        <EditableLabel />
        {/*<RegisterBehavior  name="zoom-canvas" config={nodeSelectBehavior} />*/}
        <RegisterNode
          name="model-card"
          extend="bizFlowNode"
          config={{
            draw(model: any, group: any) {
              const width = 120
              const height = 50
              const x = -width / 2
              const y = -height / 2
              const borderRadius = 4
              const keyShape = group.addShape('rect', {
                attrs: {
                  x,
                  y,
                  width,
                  height,
                  radius: borderRadius,
                  fill: '#82d3e9',
                  stroke: '#ddd',
                  lineWidth: '1',
                },
              })
              // Name text
              const label = model.label ? model.label : 'Execution Module'

              group.addShape('text', {
                attrs: {
                  text: label,
                  x: 0,
                  y: 0,
                  textAlign: 'center',
                  textBaseline: 'middle',
                  fill: 'rgba(0,0,0,0.65)',
                  className: 'node-label',
                },
                className: 'node-label',
              })
              return keyShape
            },
            setState(name: any, value: any, item: any) {
              const px = item._cfg.model.x.toString() + 'px'
              const py = item._cfg.model.y.toString() + 'px'
              //console.log("px:", px);
              //console.log("py:", py);
              //console.log(item);

              //console.log(item._cfg.model);

              const group = item.getContainer()

              const shape = group.get('children')[0] // Find the first graphics shape of the node. It is determined by the order of being added

              if (name == 'activeAnchorPoints') {
                if (value) {
                  const style = {
                    stroke: '#00aad4',
                    lineWidth: '2',
                  }
                  shape.attr(style) // Update
                  _this.setState({ valueHidden: false })
                  //setUpdateFlag(false);

                  //_this.setState({valueX:mousePos.x});
                  //_this.setState({valueY:mousePos.y});

                  //styleAbs.left = mousePos.x
                  //styleAbs.top = mousePos.y
                  console.log('STYLE', styleAbs)

                  //_this.setState({valueStyle:styleAbs});
                } else {
                  const style = {
                    stroke: '#ddd',
                    lineWidth: '1',
                  }
                  //  setHidden(true);
                  //   setUpdateFlag(true);
                  //setDspX(valueX);
                  //setDspY(valueY);
                  // console.log("X:",valueX);
                  //  console.log("Y:",valueY);
                  shape.attr(style) // Update

                  _this.setState({ valueHidden: true })

                  //let pos = {left:mousePos.x, top:mousePos.y}
                  // let stylePop ={...pos, ...styleAbs, };

                  //_this.setState({valueX:mousePos.x});
                  //_this.setState({valueY:mousePos.y});

                  //styleAbs.left = mousePos.x
                  //styleAbs.top = mousePos.y
                  //onsole.log("STYLE",styleAbs);

                  //_this.setState({valueStyle:styleAbs});
                  //console.log("STYLE",styleAbs);
                }
              }
              const model = item.getModel()
            },
          }}
        />
        <CustomCommand />
      </GGEditor>
    )
  }
}
