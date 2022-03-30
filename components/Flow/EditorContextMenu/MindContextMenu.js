import React from 'react';
import { ContextMenu } from 'gg-editor';
import MenuItem from './MenuItem';
import styles from './index.less';

const MindContextMenu = () => {
  return (
    <ContextMenu className={styles.contextMenu}>
        <MenuItem command="append" text="Topic" />
        <MenuItem command="appendChild" icon="append-child" text="Subtopic" />
        <MenuItem command="collapse" text="Fold" />
        <MenuItem command="expand" text="Unfold" />
        <MenuItem command="delete" />
    </ContextMenu>
  );
};

export default MindContextMenu;
