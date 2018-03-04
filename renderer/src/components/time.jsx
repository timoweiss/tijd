// eslint-disable-next-line
import React from 'react';

import ReactTooltip from 'react-tooltip';

import { getDetailedTimeFromTo, getDetailedTimeToNow } from './../helper/zeit';

import TimeContent from './timeContent';


// adds an 's' to var singular if num is bigger than one
export const PluralSingular = ({ num, singular }) => {
  if (num !== undefined && num > 0) {
    return (<span>{num} {num > 1 ? `${singular}s` : singular} </span>);
  }
  return null;
};


// renders time, wrapped with detailed time as tooltip
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


// renders time on second precision
export const DetailedTime = ({ from, to }) => {
  const dt = to ? getDetailedTimeFromTo(from, to) : getDetailedTimeToNow(from);
  return (
    <div>
      <PluralSingular num={dt.days} singular="day" />
      <PluralSingular num={dt.hours} singular="hour" />
      <PluralSingular num={dt.minutes} singular="minute" />
      <PluralSingular num={dt.seconds} singular="second" />
    </div>
  );
};
