import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Calendar, CaretDown } from 'components/Svg';
import CustomDatePicker from 'components/common/CustomDatePicker';
import Form from 'components/common/Form';
import { useMediaQuery } from 'hooks';
import { HAS_DELAY_ON_START_TIME } from 'const';
import { yupResolver } from '@hookform/resolvers/yup';
import pick from 'lodash/pick';
import { stepTwo } from './FormConfig';

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

const isToday = (date) => {
  return date?.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0);
};

const TimeIntervals = ({ date, time, setTime, type } = {}) => {
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
};

const StepTwo = ({
  stepData,
  setStepValid,
  onDataChange,
  formId,
  moveToNextStep,
}) => {
  const [isStartTimeOpen, setStartTimeOpen] = useState(false);
  const [isEndTimeOpen, setEndTimeOpen] = useState(false);

  const notMobile = useMediaQuery();

  const closeStartOnBlur = () => {
    setStartTimeOpen(false);
  };

  const closeEndOnBlur = () => {
    setEndTimeOpen(false);
  };

  const timeZone = detectTimeZone();

  const onSetStartTimeOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setStartTimeOpen(true);
  };
  const onSetEndTimeOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEndTimeOpen(true);
  };

  const fieldsObj = Object.assign(
    {},
    stepTwo.initialValues,
    pick(stepData || {}, stepTwo.formFields)
  );

  const { handleSubmit, formState, control, setValue } = useForm({
    defaultValues: fieldsObj,
    resolver: yupResolver(stepTwo.Schema),
  });

  const setTime = (field) => (itemValue) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setValue(field, itemValue);
    field === 'startTime' ? setStartTimeOpen(false) : setEndTimeOpen(false);
  };

  const { errors, isValid, isDirty, isSubmitting } = formState;

  console.log('errors ', errors);

  const onSubmit = (data) => {
    onDataChange(data);
    moveToNextStep();
  };

  const startDate = useWatch({ control, name: 'startDate' });
  const startTime = useWatch({ control, name: 'startTime' });
  const endDate = useWatch({ control, name: 'endDate' });
  const endTime = useWatch({ control, name: 'endTime' });

  useEffect(() => {
    setStepValid((isValid || isDirty) && !isSubmitting);
  }, [isValid, isDirty, isSubmitting, setStepValid]);

  useEffect(() => {
    if (
      isToday(startDate) &&
      startTime &&
      new Date().setHours(startTime.getHours(), startTime.getMinutes(), 0, 0) <
        new Date().setHours(1, 0, 0, 0)
    ) {
      setValue('startTime', '');
    }
  }, [startDate, startTime, setValue]);

  const minDateForStartDate = new Date(
    HAS_DELAY_ON_START_TIME ? Date.now() + 60 * 60 * 1000 : Date.now()
  );

  const maxDateForStartDate = endDate
    ? subtractDays(new Date(endDate), 1)
    : undefined;

  return (
    <Form onSubmit={handleSubmit(onSubmit)} formId={formId}>
      <div className="border-light rounded-lg is-flex-direction-column is-mobile m-0 p-6 mb-6">
        <h4 className="title is-5 mb-5">
          Start date and time <span className="has-text-danger">*</span>
        </h4>
        <div className="columns p-0 m-0">
          <div
            className="columns is-mobile p-0 pr-2 p-0-mobile mb-4-mobile m-0 column is-half"
            style={{ position: 'relative' }}
          >
            <CustomDatePicker
              control={control}
              fieldName="startDate"
              notMobile={notMobile}
              placeholderText="Choose date"
              minDate={minDateForStartDate}
              maxDate={maxDateForStartDate}
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
              } ${startDate ? '' : ' is-disabled'}`}
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
                    {startTime ? formatTime(startTime) : 'Select Time'}
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
                  <TimeIntervals
                    type="start"
                    date={startDate}
                    time={startTime}
                    setTime={setTime('startTime')}
                  />
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
            <CustomDatePicker
              placeholderText="Choose date"
              control={control}
              fieldName="endDate"
              notMobile={notMobile}
              minDate={addDays(new Date(startDate), 1)}
              disabled={!Boolean(startDate) || !Boolean(startTime)}
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
              } ${endDate ? '' : 'is-disabled'}`}
              onBlur={closeEndOnBlur}
              aria-haspopup="true"
              aria-controls="dropdown-menu"
            >
              <div className="dropdown-trigger columns m-0 is-flex-grow-1">
                <button
                  className="button rounded-sm is-outlined border-light column m-0 py-0 px-3 is-full-mobile"
                  aria-haspopup="true"
                  aria-controls="dropdown-menu"
                  onClick={onSetEndTimeOpen}
                >
                  <div className="is-flex is-flex-grow-1 is-align-items-center is-justify-content-space-between has-text-grey small-text">
                    {endTime ? formatTime(endTime) : 'Select Time'}
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
                  <TimeIntervals
                    type="end"
                    time={endTime}
                    setTime={setTime('endTime')}
                  />
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
    </Form>
  );
};

export default StepTwo;
