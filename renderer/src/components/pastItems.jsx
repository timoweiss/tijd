
// eslint-disable-next-line
import React from 'react';
import * as moment from 'moment';
import { groupBySameday } from '../helper/zeit';

import PastItem from './pastItem';

import DelimiterItem from './helper';

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

    days.forEach((day) => {
      const creationDate = moment().dayOfYear(day);
      elems.push(
        <DelimiterItem key={`delimiter_${day}`} dateString={creationDate.format('dddd, MMMM Do YYYY')} />,
        ...itemsGroupedByDay[day].map(item => (
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
