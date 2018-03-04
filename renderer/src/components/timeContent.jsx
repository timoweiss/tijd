/* eslint-disable */
import React from 'react';

import { ta } from './../helper/zeit';

// shows something like 'started 20 minutes ago' or, if finished 20 minutes
export default class TimeContent extends React.Component {
  // shouldComponentUpdate(nextProps) {
  //   return nextProps.item.finished !== this.props.item.finished;
  // }

  render() {
    const { item } = this.props;
    return (
      <div data-tip data-for={`${item.k}tt`}>
        <span>{item.finished ? ta.duration(item.created, item.finished) : `started ${ta.ago(item.created)}`}</span>
      </div>
    );
  }
}
