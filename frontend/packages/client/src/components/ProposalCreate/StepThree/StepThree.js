import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Svg } from '@cast/shared-components';
import { FadeIn } from 'components';
import CustomDatePicker from 'components/common/CustomDatePicker';
import Form from 'components/common/Form';
import { useMediaQuery } from 'hooks';
import { HAS_DELAY_ON_START_TIME } from 'const';
import { formatTime } from 'utils';
import { yupResolver } from '@hookform/resolvers/yup';
import pick from 'lodash/pick';
import { stepThree } from '../FormConfig';
import TimeIntervals from './TimeIntervals';

const detectTimeZone = () =>
  new window.Intl.DateTimeFormat().resolvedOptions().timeZone;

const addDays = (date, days) => {
  date.setDate(date.getDate() + days);
  return date;
};

const subtractDays = (date, days) => {
  date.setDate(date.getDate() - days);
  return date;
};

const isToday = (date) => {
  return date?.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0);
};

const StepThree = ({
  stepData,
  setStepValid,
  onDataChange,
  formId,
  isStepValid,
  onSubmit: onSubmitParam = () => {},
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

  const fieldsObj = Object.assign(
    {},
    stepThree.initialValues,
    pick(stepData || {}, stepThree.formFields)
  );

  const { handleSubmit, formState, control, setValue, clearErrors } = useForm({
    defaultValues: fieldsObj,
    resolver: yupResolver(stepThree.Schema),
  });

  const setTime = (field) => (itemValue) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setValue(field, itemValue);
    field === 'startTime' ? setStartTimeOpen(false) : setEndTimeOpen(false);
  };

  const { errors, isValid, isDirty, isSubmitting } = formState;

  const onSubmit = () => {
    onSubmitParam();
  };

  const onSetStartTimeOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearErrors('startTime');
    setStartTimeOpen(true);
  };

  const onSetEndTimeOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearErrors('endTime');
    setEndTimeOpen(true);
  };

  const startDate = useWatch({ control, name: 'startDate' });
  const startTime = useWatch({ control, name: 'startTime' });
  const endDate = useWatch({ control, name: 'endDate' });
  const endTime = useWatch({ control, name: 'endTime' });

  useEffect(() => {
    setStepValid((isValid || isDirty) && !isSubmitting);
  }, [isValid, isDirty, isSubmitting, setStepValid]);

  // pre saves data so when submit
  // is triggered onDataChange has been already executed
  useEffect(() => {
    if (startDate && startTime && endDate && endTime) {
      onDataChange({ startDate, startTime, endDate, endTime });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, startTime, endDate, endTime]);

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
    <Form
      onSubmit={handleSubmit(onSubmit)}
      formId={formId}
      formClasses="mb-6-mobile"
    >
      <div className="border-light-tablet rounded-lg is-flex-direction-column is-mobile m-0 p-6 p-0-mobile mb-6">
        <h4 className="title is-5 mb-5">
          Start date and time <span className="has-text-danger">*</span>
        </h4>
        <div className="columns p-0 m-0">
          <CustomDatePicker
            control={control}
            fieldName="startDate"
            notMobile={notMobile}
            placeholderText="Choose date"
            minDate={minDateForStartDate}
            maxDate={maxDateForStartDate}
          />
          <div className="columns is-mobile p-0 pl-2 p-0-mobile m-0 column is-half">
            <div
              className={`dropdown columns is-mobile p-0 m-0 is-right is-flex is-flex-grow-1${
                isStartTimeOpen ? ' is-active' : ''
              } ${startDate ? '' : ' is-disabled'}`}
              onBlur={closeStartOnBlur}
              aria-haspopup="true"
              aria-controls="dropdown-menu"
            >
              <div className="dropdown-trigger columns is-multiline m-0 p-0 is-flex-grow-1">
                <div className="column p-0 is-12">
                  <button
                    className="button rounded-sm is-outlined border-light column m-0 py-0 px-3 is-fullwidth"
                    aria-haspopup="true"
                    aria-controls="dropdown-menu"
                    onClick={onSetStartTimeOpen}
                  >
                    <div className="is-flex is-flex-grow-1 is-align-items-center is-justify-content-space-between has-text-grey small-text">
                      {startTime ? formatTime(startTime) : 'Select Time'}
                      <Svg name="CaretDown" className="has-text-black" />
                    </div>
                  </button>
                </div>
                {errors?.startTime?.message && (
                  <div className="column p-0 is-12">
                    <FadeIn>
                      <div className="pl-1 mt-2 mb-4">
                        <p className="smaller-text has-text-danger">
                          {errors?.startTime?.message}
                        </p>
                      </div>
                    </FadeIn>
                  </div>
                )}
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
      <div className="border-light-tablet rounded-lg columns is-flex-direction-column is-mobile m-0 p-6 p-0-mobile mb-6">
        <h4 className="title is-5 mb-5">
          End date and time <span className="has-text-danger">*</span>
        </h4>
        <div className="columns p-0 m-0">
          <CustomDatePicker
            placeholderText="Choose date"
            control={control}
            fieldName="endDate"
            notMobile={notMobile}
            minDate={addDays(new Date(startDate), 1)}
            disabled={!Boolean(startDate) || !Boolean(startTime)}
            errorMessage={errors?.endTime?.message}
          />
          <div className="columns is-mobile p-0 pl-2 p-0-mobile m-0 column is-half">
            <div
              className={`dropdown columns is-mobile p-0 m-0 is-right is-flex is-flex-grow-1${
                isEndTimeOpen ? ' is-active' : ''
              } ${endDate ? '' : 'is-disabled'}`}
              onBlur={closeEndOnBlur}
              aria-haspopup="true"
              aria-controls="dropdown-menu"
            >
              <div className="dropdown-trigger columns is-multiline m-0 p-0 is-flex-grow-1">
                <div className="column p-0 is-12">
                  <button
                    className="button rounded-sm is-outlined border-light column m-0 py-0 px-3 is-fullwidth"
                    aria-haspopup="true"
                    aria-controls="dropdown-menu"
                    onClick={onSetEndTimeOpen}
                  >
                    <div className="is-flex is-flex-grow-1 is-align-items-center is-justify-content-space-between has-text-grey small-text">
                      {endTime ? formatTime(endTime) : 'Select Time'}
                      <Svg name="CaretDown" className="has-text-black" />
                    </div>
                  </button>
                </div>
                {errors?.endTime?.message && (
                  <div className="column p-0 is-12">
                    <FadeIn>
                      <div className="pl-1 mt-2 mb-4">
                        <p className="smaller-text has-text-danger">
                          {errors?.endTime?.message}
                        </p>
                      </div>
                    </FadeIn>
                  </div>
                )}
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

export default StepThree;
