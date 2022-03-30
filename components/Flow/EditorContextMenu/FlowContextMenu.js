import React from 'react';
import {  EdgeMenu, CanvasMenu, ContextMenu } from 'gg-editor';
import MenuItem from './MenuItem';
import styles from './index.less';

const FlowContextMenu = () => {
  return (
    <ContextMenu className={styles.contextMenu}>
        <MenuItem command="copy" />
        <MenuItem command="delete" />
    </ContextMenu>
  );
};

export default FlowContextMenu;
