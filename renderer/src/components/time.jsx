// eslint-disable-next-line
import React from 'react';

import ReactTooltip from 'react-tooltip';

import { getDetailedTimeFromTo, getDetailedTimeToNow, ta } from './../helper/zeit';


export const TimeContent = ({ item }) => (
  <div data-tip data-for={`${item.k}tt`}>
    <span>{item.finished ? ta.duration(item.created, item.finished) : `started ${ta.ago(item.created)}`}</span>
  </div>
);

export const PluralSingular = ({ num, singular }) =>
  (num && <span>{num} {num > 1 ? `${singular}s` : singular} </span>);


export const Time = ({ item }) => (
  <div style={{ fontSize: '10px' }}>
    <ReactTooltip
      place="left"
      effect="solid"
      id={`${item.k}tt`}
    >
      <DetailedTime from={item.created} to={item.finished} />
    </ReactTooltip>
    <TimeContent item={item} />
  </div>
);

export const DetailedTime = ({ from, to }) => {
  const dt = to ? getDetailedTimeFromTo(from, to) : getDetailedTimeToNow(from);
  return (
    <div>
      <PluralSingular num={dt.days} singular="day" />
      <PluralSingular num={dt.hours} singular="hour" />
      <PluralSingular num={dt.days} singular="day" />
      <PluralSingular num={dt.minutes} singular="minute" />
      <PluralSingular num={dt.seconds} singular="second" />
    </div>
  );
};
