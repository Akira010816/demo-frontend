import React from 'react'
import { RegisterNode } from 'gg-editor'

const CustomNode = () => {
  const config = {
    draw(model: any, group: any) {
      const { label } = model

      const keyShape = group.addShape('rect', {
        draggable: true,
        attrs: {
          x: 0,
          y: 0,
          width: 240,
          height: 50,
          fill: '#5487ea',
          radius: 8,
        },
      })

      group.addShape('dom', {
        draggable: true,
        attrs: {
          x: 15,
          y: 0,
          width: 270,
          height: 50,
          html: `<h1 style="color: #ffffff; line-height: 50px"}>${label}</h1>`,
        },
      })

      return keyShape
    },
    getAnchorPoints() {
      return [
        [0.5, 0],
        [0.5, 1],
        [0, 0.5],
        [1, 0.5],
      ]
    },
  }

  return <RegisterNode name="custom-node" config={config} extend={'flow-circle'} />
}

export default CustomNode
