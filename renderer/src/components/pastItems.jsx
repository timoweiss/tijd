
// eslint-disable-next-line
import React from 'react';
import * as moment from 'moment';
import { groupBySameday } from '../helper/zeit';
import { DetailedTime } from './time';

import PastItem from './pastItem';

import { DelimiterItem } from './helper';

function getFirstAndLast(items) {
  return {
    first: items[0],
    last: items[items.length - 1],
  };
}

export default class PastItems extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedItemId: '',
    };
  }
  render() {
    const { items, bottomitem } = this.props;

    const itemsGroupedByDay = groupBySameday(items);
    const days = Object.keys(itemsGroupedByDay);
    const elems = [];

    // render PastItems grouped by day, delimited by DelimiterItems
    days.forEach((day) => {
      const creationDate = moment().dayOfYear(day);
      const itemsOnThatDay = itemsGroupedByDay[day];

      const { first, last } = getFirstAndLast(itemsOnThatDay);


      elems.push(
        <DelimiterItem
          key={`delimiter_${day}`}
          totalTime={<DetailedTime from={first.created} to={last.finished} />}
          dateString={creationDate.format('dddd, MMMM Do YYYY')}
        />,
        ...itemsOnThatDay.map(item => (
          <span
            role="presentation"
            key={item.k}
            onClick={() => this.setState({ selectedItemId: item.k })}
          >
            <PastItem showEdit={this.state.selectedItemId === item.k} item={item} />
          </span>
        )),
      );
    });

    return (
      <div style={{
        height: 'calc(100vh - 54px)',
        marginTop: '10px',
        background: 'white',
      }}
      >
        <div style={{
          overflow: 'scroll',
          position: 'absolute',
          bottom: '33px',
          width: '100%',

          maxHeight: 'calc(100vh - 78px)',
        }}
        >{elems}
          {bottomitem}
        </div>
      </div>
    );
  }
}
