// eslint-disable-next-line
import React from 'react';
import EditItem from './editItem';

import { Time } from './time';

const typeEmojiMap = {
  break: '☕',
  hi: 'hi 👋',
  bye: '👋 bye',
};

export default class PastItem extends React.Component {
  shouldComponentUpdate(nextProps) {
    if (!nextProps.item.finished) {
      return true;
    }
    if (this.props.item.finished !== nextProps.item.finished) {
      console.log('update', this.props.item.finished, nextProps.item.finished);
      return true;
    }
    return false;
  }
  render() {
    const { item, showEdit } = this.props;
    return (
      <div className="past-item">
        <span>{typeEmojiMap[item.type] ? typeEmojiMap[item.type] : item.name}</span>
        <Time item={item} />
        {showEdit && <EditItem value={{ min: 2, max: 10 }} />}
      </div>
    );
  }
}

