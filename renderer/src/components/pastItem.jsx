// eslint-disable-next-line
import React from 'react';

import InputRange from 'react-input-range';

import { Time } from './time';

const PastItem = ({ item, showEdit }) => (
  <div className="past-item">
    <span>{item.name}</span>
    <Time item={item} />
    {showEdit && <div style={{ width: '100%' }}>
      <hr />
      <InputRange
        maxValue={20}
        minValue={0}
        value={{ min: 2, max: 10 }}
        onChange={value => this.setState({ value })}
      />
      edit view</div>}
  </div>
);

export default PastItem;
