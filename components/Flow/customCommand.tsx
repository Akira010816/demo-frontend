import React from 'react'
import { RegisterCommand, Util } from 'gg-editor'

class CustomCommand extends React.Component {
  componentDidMount() {
    document.addEventListener('keydown', (event) => {
      event.preventDefault()
    })
  }

  canExecute() {
    return true
  }
  render() {
    return [
      // Enter 添加同级 case
      <RegisterCommand
        key="customAppendCase"
        name="customAppendCase"
        config={{
          enable(editor: any) {
            const currentPage = editor.getCurrentPage()
            const selected = currentPage.getSelected()
            return currentPage.isMind && selected.length === 1
          },
          getItem(editor: any) {
            const currentPage = editor.getCurrentPage()
            const graph = currentPage.getGraph()
            const items: any = []
            Util.setSelectedItems(graph, items)
            return items[0].id ? graph.find(items[0].id) : currentPage.getSelected()[0]
          },
          execute(graph: any) {
            const node: any = Util.getSelectedNodes(graph)[0]
            if (node == undefined) return

            // Util.getNodeSide(node)
            const parentId = node._cfg.id
            console.log('id', parentId)
            const model = node.getModel()
            console.log('model', model)
            console.log('hierarchy', model)
            console.log('side', model.side)

            //const parent = node.getParent();
            const nodeId = Util.guid()
            console.log('new id:', nodeId)
          },
          back() {
            /*
            const currentPage = editor.getCurrentPage();
            currentPage.getGraph().remove(this.addItemId),
              currentPage.clearSelected(),
              currentPage.clearActived(),
              currentPage.setSelected(this.selectedItemId, true);*/
          },
          canExecute() {
            console.log('can execute')
            return true
          },
          canUndo() {
            return true
          },

          shouldExecute(graph: any) {
            console.log('shoud execute ', graph)
            return true
          },

          init(graph: any) {
            console.log('init', graph)
          },

          shortcutCodes: ['a'],
          shortcuts: ['a'],
        }}
      />,

      // ⌘ + B 展开
    ]
  }
}

export default CustomCommand
