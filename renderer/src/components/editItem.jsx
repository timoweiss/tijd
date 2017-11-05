// eslint-disable-next-line
import React from 'react';

import InputRange from 'react-input-range';

import 'react-input-range/lib/css/index.css';

export default class EditItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      min: props.value.min,
      max: props.value.max,
    };
  }
  render() {
    return (
      <div style={{ width: '100%' }}>
        <hr />
        <InputRange
          maxValue={this.props.maxValue || 0}
          minValue={this.props.minValue || 100}
          value={{ min: 2, max: 10 }}
          onChange={value => this.setState({ value })}
        />
        edit view</div>
    );
  }
}
