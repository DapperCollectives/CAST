import { useMemo } from 'react';
import { Svg } from '@cast/shared-components';
import { StatusPill } from 'components';
import { FilterValues } from 'const';
import { parseDateFromServer } from 'utils';
import Results from './Results';

export default function ResultsPanel({
  results = [],
  endTime,
  startTime,
  computedStatus,
} = {}) {
  const status = FilterValues[computedStatus] ?? FilterValues.closed;

  const pillForStatus = useMemo(
    () => ({
      [FilterValues.active]: (
        <StatusPill
          status="Active"
          backgroundColorClass="has-background-warning"
        />
      ),
      [FilterValues.pending]: (
        <StatusPill
          status="Upcoming"
          backgroundColorClass="has-background-orange"
        />
      ),
      [FilterValues.closed]: (
        <StatusPill
          status={
            <span>
              Complete <Svg name="CheckOutlined" />
            </span>
          }
          backgroundColorClass="has-background-success"
        />
      ),
      [FilterValues.cancelled]: (
        <StatusPill
          status="Canceled"
          backgroundColorClass="has-background-danger"
        />
      ),
    }),
    []
  );

  const iconStatusMap = {
    [FilterValues.active]: <Svg name="Active" />,
  };

  const { diffDuration } = parseDateFromServer(
    status === FilterValues.pending ? startTime : endTime
  );

  const textDescriptionMap = {
    [FilterValues.active]: `${diffDuration} remaining`,
    [FilterValues.pending]: `Starting in ${diffDuration}`,
    [FilterValues.closed]: null,
    [FilterValues.cancelled]: null,
  };

  return (
    <div
      className={`has-background-white-ter rounded p-1-mobile p-5-tablet p-5_5-desktop`}
    >
      <div className="columns is-mobile m-0 p-0 mb-5">
        <div className="column is-flex is-align-items-center pl-0 py-0 is-narrow">
          {pillForStatus[status]}
        </div>
        <div className="column is-flex is-align-items-center p-0 py-0 pl-1">
          {iconStatusMap?.[status] ?? null}
          <span className="pl-2 smaller-text has-text-weight-bold">
            {textDescriptionMap?.[status]}
          </span>
        </div>
      </div>
      <Results voteResults={results} computedStatus={computedStatus} />
    </div>
  );
}
