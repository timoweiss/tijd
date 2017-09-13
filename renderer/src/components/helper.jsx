
// eslint-disable-next-line
import React from 'react';

const DelimiterItem = ({ dateString, totalTime }) => (
  <div className="delimiter-item">
    <span>{dateString}</span>
    {totalTime && <span className="total-time">{totalTime}</span>}
  </div>
);
export default DelimiterItem;
