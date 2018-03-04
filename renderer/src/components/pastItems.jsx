
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
function getTotalTime(items = []) {
  return items.reduce((prev, current) => {
    const newVal = prev + (new Date(current.finished) - new Date(current.created));
    return newVal;
  }, 0);
}
const dayOfYearCache = {};
function momorizedDayOfYear(day) {
  if (dayOfYearCache[day]) {
    return dayOfYearCache[day];
  }
  const formattedDayOfYear = moment().dayOfYear(day).format('dddd, MMMM Do YYYY');
  dayOfYearCache[day] = formattedDayOfYear;

  return formattedDayOfYear;
}

console.log(getTotalTime([{ finished: 100, created: 10 }, { finished: 100, created: 10 }]));

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
      const formattedCreationDate = momorizedDayOfYear(day);
      const itemsOnThatDay = itemsGroupedByDay[day];

      const { first, last } = getFirstAndLast(itemsOnThatDay);

      // get all break items
      const breaks = itemsOnThatDay.filter(item => item.type === 'break');
      const totalBreakTime = getTotalTime(breaks);

      // this date parsing thing is due to inconsistent created and finished data
      const to = last.type === 'bye' ? new Date(last.created) : new Date(last.finished);

      elems.push(
        <DelimiterItem
          key={`delimiter_${day}`}
          totalTime={<DetailedTime from={first.created} to={to - totalBreakTime} />}
          dateString={formattedCreationDate}
        />,
        ...itemsOnThatDay.map(item => (
          <span
            role="presentation"
            key={item.k}
          >
            <PastItem showEdit={false && this.state.selectedItemId === item.k} item={item} />
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
