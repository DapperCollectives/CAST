import React, { useEffect, useMemo, useState } from "react";
import millify from "millify";
import { Active, CheckCircle } from "../Svg";
import { parseDateFromServer } from "utils";
import StatusLabel from "../StatusLabel";
import { useVotingResults } from "hooks";
import { FilterValues } from "const";

const ProposalCardFooter = ({ id, voted, endTime, computedStatus, isDesktopOnly }) => {
  const [justMounted, setJustMounted] = useState(true);

  const { getVotingResults, data: votingResults } = useVotingResults();

  const { diffDuration } = parseDateFromServer(endTime);

  const status = FilterValues[computedStatus] ?? FilterValues.closed;

  useEffect(() => {
    if (justMounted && (FilterValues[computedStatus] === FilterValues.closed)) {
      async function _getVotingResults() {
        return getVotingResults(id);
      }
      _getVotingResults();
    }
  }, [computedStatus, getVotingResults, id, justMounted]);

  // prevents memory leak in above useEffect for getVotingResults
  useEffect(() => () => { setJustMounted(false) }, []);

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
        return { textDecision: "", winCount: 0 };
      }

      return {
        textDecision,
        winCount,
      };
    }
    return { textDecision: "", winCount: 0 };
  }, [votingResults]);

  const iconStatusMap = {
    [FilterValues.active]: <Active />,
    [FilterValues.closed]:
      textDecision !== "" ? <CheckCircle width="15" height="15" /> : null,
  };

  const textDescriptionMap = {
    [FilterValues.active]: `${diffDuration} left`,
    [FilterValues.closed]:
      textDecision !== ""
        ? `${textDecision} ${winCount !== 0 ? `(${millify(winCount)})` : ""}`
        : "",
  };

  const statusLabelMap = {
    [FilterValues.active]: <StatusLabel status="Active" voted={voted} rounder
      color="has-background-orange"
      className="proposal-status-label has-text-weight-bold has-text-black"
    />,
    [FilterValues.pending]: <StatusLabel status="Pending" voted={voted} rounder
      color="has-background-grey-light"
    />,
    [FilterValues.closed]: <StatusLabel status="Cancelled" voted={voted} rounder />,
    [FilterValues.cancelled]: <StatusLabel status="Cancelled" voted={voted} rounder />,
  };

  // gross section to handle styling
  let extraClasses1 = "";
  let extraClasses2 = "";
  let extraStyles1 = {};
  let extraClasses3 = "";
  let extraClasses4 = "";

  if (isDesktopOnly) {
    extraClasses1 = "columns ";
    extraClasses2 = "p-0 is-justify-content-flex-end";
    extraClasses3 = "column is-narrow is-flex is-align-items-center pl-4 pr-1 py-0";
    extraClasses4 = "column pl-1 pr-1 is-flex is-align-items-center py-0";
  } else {
    extraClasses4 = "pl-1 pr-1 is-flex is-align-items-center"
    if (voted) {
      extraClasses1 = "is-flex ";
      extraClasses3 = "is-narrow is-flex is-align-items-center ml-3 mr-1";
    } else {
      extraClasses3 = "is-narrow is-flex is-align-items-center mr-1";
      if (status === FilterValues.active) {
        extraClasses2 = "px-0 pt-0 pb-3";
        extraStyles1 = { minHeight: "50px" };
      } else {
        extraClasses2 = "p-0";
      }
    }
  }

  const IconAndText = () => (
    <>
      <div className={extraClasses3}>
        {iconStatusMap[status] ?? null}
      </div>
      <div
        className={extraClasses4}
        style={{ flexBasis: "content" }}
      >
        <p className="has-text-black has-text-weight-bold p-0 is-size-7">
          {textDescriptionMap[status] ?? null}
        </p>
      </div>
    </>
  );

  return (
    <div className={`${extraClasses1}flex-1 has-text-grey m-0 px-0 pb-0 proposal-card-footer`}>
      <div className={`is-flex is-align-items-center proposal-status ${extraClasses2}`}
        style={extraStyles1}
      >
        <p className="has-text-grey px-0 smaller-text">
          {statusLabelMap[status] ?? null}
        </p>
      </div>
      {(!isDesktopOnly && !voted)
        ? <div className="is-flex">
          <IconAndText />
        </div>
        : <IconAndText />
      }
    </div>
  );
};

export default ProposalCardFooter;
