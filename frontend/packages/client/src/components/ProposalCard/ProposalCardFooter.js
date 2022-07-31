import React, { useMemo } from 'react';
import { StatusLabel, WrapperResponsive } from 'components';
import { Active, CheckCircle } from 'components/Svg';
import { FilterValues } from 'const';
import { useVotingResults } from 'hooks';
import millify from 'millify';
import { parseDateFromServer } from 'utils';

const IconAndText = ({ endTime, voted, status }) => {
  const { data: votingResults } = useVotingResults();

  const { textDecision, winCount } = useMemo(() => {
    if (votingResults?.results) {
      const { results } = votingResults;
      const resultsArray = Object.entries(results);
      const sortedResults = resultsArray.sort((a, b) => {
        if (Number(b[1]) < Number(a[1])) {
          return -1;
        }
        return 1;
      });

      const textDecision = sortedResults[0][0];
      const winCount = Number(sortedResults[0][1]);

      // no winner
      if (sortedResults.every((e) => Number(e[1]) === winCount)) {
        return { textDecision: '', winCount: 0 };
      }

      return {
        textDecision,
        winCount,
      };
    }
    return { textDecision: '', winCount: 0 };
  }, [votingResults]);

  const iconStatusMap = {
    [FilterValues.active]: <Active />,
    [FilterValues.closed]:
      textDecision !== '' ? <CheckCircle width="15" height="15" /> : null,
  };

  const { diffDuration } = parseDateFromServer(endTime);

  const textDescriptionMap = {
    [FilterValues.active]: `${diffDuration} left`,
    [FilterValues.closed]:
      textDecision !== ''
        ? `${textDecision} ${winCount !== 0 ? `(${millify(winCount)})` : ''}`
        : '',
  };

  return (
    <>
      <WrapperResponsive
        classNames="is-narrow is-flex is-align-items-center"
        extraClasses="column pl-4 pr-1 py-0"
        extraClassesMobile={`mr-1${voted && ' ml-3'}`}
      >
        {iconStatusMap[status] ?? null}
      </WrapperResponsive>
      <WrapperResponsive
        styles={{ flexBasis: 'content' }}
        classNames="pl-1 pr-1 is-flex is-align-items-center"
        extraClasses="column py-0"
      >
        <p className="has-text-black has-text-weight-bold p-0 is-size-7">
          {textDescriptionMap[status] ?? null}
        </p>
      </WrapperResponsive>
    </>
  );
};

const ProposalCardFooter = ({
  id,
  voted,
  endTime,
  computedStatus,
  isDesktopOnly,
}) => {
  const status = FilterValues[computedStatus] ?? FilterValues.closed;

  const statusLabelMap = {
    [FilterValues.active]: (
      <StatusLabel
        status="Active"
        voted={voted}
        rounder
        color="has-background-orange"
        className="proposal-status-label has-text-weight-bold has-text-black"
      />
    ),
    [FilterValues.pending]: (
      <StatusLabel
        status="Pending"
        voted={voted}
        rounder
        color="has-background-grey-light"
      />
    ),
    [FilterValues.closed]: (
      <StatusLabel status="Closed" voted={voted} rounder />
    ),
    [FilterValues.cancelled]: (
      <StatusLabel status="Cancelled" voted={voted} rounder />
    ),
  };

  return (
    <WrapperResponsive
      classNames="flex-1 has-text-grey m-0 px-0 pb-0 proposal-card-footer"
      extraClasses="columns"
      extraClassesMobile={voted && 'is-flex'}
    >
      <WrapperResponsive
        classNames="is-flex is-align-items-center proposal-status"
        extraClasses="p-0 is-justify-content-flex-end"
        extraStylesMobile={
          !voted && status === FilterValues.active ? { minHeight: '50px' } : {}
        }
        extraClassesMobile={
          !voted
            ? status === FilterValues.active
              ? 'px-0 pt-0 pb-3'
              : 'p-0'
            : ''
        }
      >
        <p className="has-text-grey px-0 smaller-text">
          {statusLabelMap[status] ?? null}
        </p>
      </WrapperResponsive>
      {!isDesktopOnly && !voted ? (
        <div className="is-flex">
          <IconAndText voted={voted} endTime={endTime} status={status} />
        </div>
      ) : (
        <IconAndText voted={voted} endTime={endTime} status={status} />
      )}
    </WrapperResponsive>
  );
};

export default ProposalCardFooter;
