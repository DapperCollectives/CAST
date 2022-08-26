import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar, CaretDown } from 'components/Svg';
import { useMediaQuery } from 'hooks';

const HAS_DELAY_ON_START_TIME =
  process.env.REACT_APP_APP_ENV?.toUpperCase() === 'PRODUCTION';

const detectTimeZone = () =>
  new window.Intl.DateTimeFormat().resolvedOptions().timeZone;

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

const addDays = (date, days) => {
  date.setDate(date.getDate() + days);
  return date;
};

const subtractDays = (date, days) => {
  date.setDate(date.getDate() - days);
  return date;
};

const formatTime = (date) => {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return hours + ':' + minutes + ' ' + ampm;
};

const isStartTimeValid = (startTime, startDate) => {
  const dateNow = new Date();

  const startDateAndTime = new Date(startDate);

  startDateAndTime.setHours(startTime.getHours(), startTime.getMinutes());

  const dif = (startDateAndTime - dateNow) / (60 * 60 * 1000);

  return dif > 1;
};

const isToday = (date) => {
  return date?.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0);
};

const StepTwo = ({ stepData, setStepValid, onDataChange }) => {
  const [isStartTimeOpen, setStartTimeOpen] = useState(false);
  const [startTimeIntervals, setStartTimeIntervals] = useState([]);
  const [isEndTimeOpen, setEndTimeOpen] = useState(false);

  const notMobile = useMediaQuery();

  useEffect(() => {
    const isDate = (d) => Object.prototype.toString.call(d) === '[object Date]';
    const requiredFields = {
      startDate: isDate,
      endDate: isDate,
      startTime: isDate,
      endTime: isDate,
    };

    const isValid =
      Object.keys(requiredFields).every(
        (field) => stepData && requiredFields[field](stepData[field])
      ) && isStartTimeValid(stepData?.startTime, stepData?.startDate);

    setStepValid(isValid);
  }, [stepData, setStepValid, onDataChange]);

  const closeStartOnBlur = () => {
    setStartTimeOpen(false);
  };

  const closeEndOnBlur = () => {
    setEndTimeOpen(false);
  };

  const { startDate } = stepData ?? {};

  // on open dropdown set time intervals
  useEffect(() => {
    if (isStartTimeOpen && startDate && startTimeIntervals.length === 0) {
      const startDateIsToday = isToday(startDate);

      const startTimeInterval = startDateIsToday
        ? HAS_DELAY_ON_START_TIME
          ? new Date(Date.now() + 60 * 60 * 1000)
          : Date.now()
        : 0;

      const timeIntervals = getTimeIntervals(startTimeInterval);
      setStartTimeIntervals(timeIntervals);
    }
  }, [isStartTimeOpen, startTimeIntervals, startDate]);

  // clear intervals
  useEffect(() => {
    if (!isStartTimeOpen && startTimeIntervals.length !== 0) {
      setStartTimeIntervals([]);
    }
  }, [isStartTimeOpen, startTimeIntervals]);

  const timeZone = detectTimeZone();

  const onSetStartTimeOpen = () => setStartTimeOpen(true);

  const setStartTime = (itemValue) => () => {
    onDataChange({
      startTime: itemValue,
    });
    setStartTimeOpen(false);
  };

  const setEndTime = (itemValue) => () => {
    onDataChange({
      endTime: itemValue,
    });
    setEndTimeOpen(false);
  };

  const minDateForStartDate = new Date(
    HAS_DELAY_ON_START_TIME ? Date.now() + 60 * 60 * 1000 : Date.now()
  );

  const maxDateForStartDate = stepData?.endDate
    ? subtractDays(new Date(stepData?.endDate), 1)
    : undefined;

  return (
    <div>
      <div className="border-light rounded-lg is-flex-direction-column is-mobile m-0 p-6 mb-6">
        <h4 className="title is-5 mb-5">
          Start date and time <span className="has-text-danger">*</span>
        </h4>
        <div className="columns p-0 m-0">
          <div
            className="columns is-mobile p-0 pr-2 p-0-mobile mb-4-mobile m-0 column is-half"
            style={{ position: 'relative' }}
          >
            <DatePicker
              required
              placeholderText="Choose date"
              selected={stepData?.startDate}
              minDate={minDateForStartDate}
              maxDate={maxDateForStartDate}
              onFocus={(e) => !notMobile && e.target.blur()}
              onChange={(date) => {
                onDataChange({
                  startDate: date,
                  // resets time in case user has selected a future date and comes back to present with a non valid hour
                  startTime: isToday(date) ? null : stepData?.startTime,
                });
              }}
              className="border-light rounded-sm column is-full is-full-mobile p-3"
            />
            <div
              style={{
                position: 'absolute',
                right: 15,
                top: 7,
                pointerEvents: 'none',
              }}
            >
              <Calendar />
            </div>
          </div>
          <div className="columns is-mobile p-0 pl-2 p-0-mobile m-0 column is-half">
            <div
              className={`dropdown columns is-mobile p-0 m-0 is-right is-flex is-flex-grow-1${
                isStartTimeOpen ? ' is-active' : ''
              } ${stepData?.startDate ? '' : ' is-disabled'}`}
              onBlur={closeStartOnBlur}
              aria-haspopup="true"
              aria-controls="dropdown-menu"
            >
              <div className="dropdown-trigger columns m-0 is-flex-grow-1">
                <button
                  className="button rounded-sm is-outlined border-light column m-0 py-0 px-3 is-full-mobile"
                  aria-haspopup="true"
                  aria-controls="dropdown-menu"
                  onClick={onSetStartTimeOpen}
                >
                  <div className="is-flex is-flex-grow-1 is-align-items-center is-justify-content-space-between has-text-grey small-text">
                    {stepData?.startTime
                      ? formatTime(stepData.startTime)
                      : 'Select Time'}
                    <CaretDown className="has-text-black" />
                  </div>
                </button>
              </div>
              <div
                className="dropdown-menu column p-0 is-full"
                id="dropdown-menu"
                role="menu"
              >
                <div
                  className="dropdown-content"
                  style={{ maxHeight: 300, overflow: 'auto' }}
                >
                  {startTimeIntervals.map((itemValue, index) => (
                    <button
                      className={`button is-white dropdown-item has-text-grey${
                        itemValue === stepData?.startTime ? ' is-active' : ''
                      }`}
                      onMouseDown={setStartTime(itemValue)}
                      key={`drop-down-${index}`}
                    >
                      {formatTime(itemValue)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-light rounded-lg columns is-flex-direction-column is-mobile m-0 p-6 mb-6">
        <h4 className="title is-5 mb-5">
          End date and time <span className="has-text-danger">*</span>
        </h4>
        <div className="columns p-0 m-0">
          <div
            className="columns is-mobile p-0 pr-2 p-0-mobile mb-4-mobile m-0 column is-half"
            style={{ position: 'relative' }}
          >
            <DatePicker
              required
              placeholderText="Choose date"
              selected={stepData?.endDate}
              minDate={addDays(new Date(stepData?.startDate), 1)}
              disabled={
                !Boolean(stepData?.startDate) || !Boolean(stepData?.startTime)
              }
              onFocus={(e) => !notMobile && e.target.blur()}
              onChange={(date) => {
                onDataChange({ endDate: date });
              }}
              className="border-light rounded-sm column is-full is-full-mobile p-3"
            />
            <div
              style={{
                position: 'absolute',
                right: 15,
                top: 7,
                pointerEvents: 'none',
              }}
            >
              <Calendar />
            </div>
          </div>
          <div className="columns is-mobile p-0 pl-2 p-0-mobile m-0 column is-half">
            <div
              className={`dropdown columns is-mobile p-0 m-0 is-right is-flex is-flex-grow-1${
                isEndTimeOpen ? ' is-active' : ''
              } ${stepData?.endDate ? '' : 'is-disabled'}`}
              onBlur={closeEndOnBlur}
              aria-haspopup="true"
              aria-controls="dropdown-menu"
            >
              <div className="dropdown-trigger columns m-0 is-flex-grow-1">
                <button
                  className="button rounded-sm is-outlined border-light column m-0 py-0 px-3 is-full-mobile"
                  aria-haspopup="true"
                  aria-controls="dropdown-menu"
                  onClick={() => setEndTimeOpen(true)}
                >
                  <div className="is-flex is-flex-grow-1 is-align-items-center is-justify-content-space-between has-text-grey small-text">
                    {stepData?.endTime
                      ? formatTime(stepData.endTime)
                      : 'Select Time'}
                    <CaretDown className="has-text-black" />
                  </div>
                </button>
              </div>
              <div
                className="dropdown-menu column p-0 is-full"
                id="dropdown-menu"
                role="menu"
              >
                <div
                  className="dropdown-content"
                  style={{ maxHeight: 300, overflow: 'auto' }}
                >
                  {getTimeIntervals().map((itemValue, index) => (
                    <button
                      className={`button is-white dropdown-item has-text-grey${
                        itemValue === stepData?.endTime ? ' is-active' : ''
                      }`}
                      onMouseDown={setEndTime(itemValue)}
                      key={`drop-down-${index}`}
                    >
                      {formatTime(itemValue)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {timeZone && (
        <div className="has-text-grey mt-6">
          <span alt="globe with meridians">🌐</span> We've detected your time
          zone as: {timeZone}
        </div>
      )}
    </div>
  );
};

export default StepTwo;
