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
    if (nextProps.item.checked !== this.props.item.checked) {
      return true;
    }
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
    const { item, showEdit, onCheck } = this.props;
    return (
      <div
        role="presentation"
        onClick={() => onCheck(item)}
        className="past-item"
      >
        <span>{typeEmojiMap[item.type] ? typeEmojiMap[item.type] : item.name}</span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        >
          <Time item={item} />
          <input type="checkbox" checked={this.props.item.checked} />
        </div>
        {showEdit && <EditItem value={{ min: 2, max: 10 }} />}
      </div>
    );
  }
}

