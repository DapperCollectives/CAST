import React from 'react';
import { HAS_DELAY_ON_START_TIME } from 'const';
import { formatTime } from 'utils';

const getTimeIntervals = (cutOffDate = 0) => {
  const timeIntervals = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 4; j++) {
      let time = new Date();
      time.setHours(i);
      time.setMinutes(j * 15);
      time.setSeconds(0);
      if (time.getTime() >= cutOffDate) {
        timeIntervals.push(time);
      }
    }
  }
  return timeIntervals;
};

const isToday = (date) => {
  return date?.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0);
};

export default function TimeIntervals({ date, time, setTime, type } = {}) {
  const startDateIsToday = date ? isToday(date) : false;

  const startTimeInterval = startDateIsToday
    ? HAS_DELAY_ON_START_TIME
      ? new Date(Date.now() + 60 * 60 * 1000)
      : Date.now()
    : 0;

  const timeIntervals = getTimeIntervals(startTimeInterval);

  // this enables setting start time inmediatly
  if (startDateIsToday && !HAS_DELAY_ON_START_TIME) {
    // push date now to the top of timeIntervals
    timeIntervals[0] !== new Date() && timeIntervals.unshift(new Date());
  }
  return (
    <>
      {timeIntervals.map((itemValue, index) => (
        <button
          className={`button is-white dropdown-item has-text-grey${
            itemValue === time ? ' is-active' : ''
          }`}
          onMouseDown={setTime(itemValue)}
          key={`drop-down-${type}-${index}`}
        >
          {formatTime(itemValue)}
        </button>
      ))}
    </>
  );
}
