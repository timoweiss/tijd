
// eslint-disable-next-line
import React from 'react';

export const DelimiterItem = ({ dateString, totalTime }) => (
  <div className="delimiter-item">
    <span>{dateString}</span>
    {totalTime && <span className="total-time">{totalTime}</span>}
  </div>
);

export const BottomItem = ({ inputRef }) => (
  <div key="bottom_item" style={{ float: 'left', clear: 'both' }} ref={inputRef} />
);
