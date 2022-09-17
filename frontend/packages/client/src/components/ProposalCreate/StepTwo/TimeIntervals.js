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

const isTomorrow = (date) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return date?.setHours(0, 0, 0, 0) === tomorrow.getTime();
};

// this function check if the user
// is in the last hour of the day
// to return the correct interval
// otherwise returns all intervals
const getIntervalForTomorrow = () => {
  const now = new Date();
  // In the last hour of the day
  if (now > new Date().setHours(23, 0, 0, 0)) {
    return new Date().setHours(0, now.getMinutes(), 0, 0);
  }
  return 0;
};

const getStartTimeIngerval = (startDateIsToday) => {
  return startDateIsToday ? Date.now() : 0;
};

const getStartTimeIntervalWithDelay = (date, startDateIsToday) => {
  if (startDateIsToday) {
    return new Date(Date.now() + 60 * 60 * 1000);
  }

  const startDateIsTomorrow = date ? isTomorrow(date) : false;

  if (startDateIsTomorrow) {
    return getIntervalForTomorrow();
  }

  return 0;
};

export default function TimeIntervals({ date, time, setTime, type } = {}) {
  const startDateIsToday = date ? isToday(date) : false;

  const startTimeInterval = HAS_DELAY_ON_START_TIME
    ? getStartTimeIntervalWithDelay(date, startDateIsToday)
    : getStartTimeIngerval(startDateIsToday);

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
