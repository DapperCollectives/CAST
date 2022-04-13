import React from "react";
import millify from "millify";
import { Active, CheckCircle } from "../Svg";
import { parseDateFromServer } from "../../utils";
import { FilterValues } from "./Proposals";
import StatusLabel from "./StatusLabel";

export const getStatus = (startDiff, endDiff, status) => {
  // get status from backend
  if (FilterValues[status]) {
    return FilterValues[status];
  }
  // create status based on dates
  if (startDiff > 0) {
    return FilterValues.pending;
  }
  if (endDiff > 0) {
    return FilterValues.active;
  }
  // defaults to closed
  return FilterValues.closed;
};

const ProposalHeader = ({
  textDecision,
  winCount,
  voted,
  endTime,
  computedStatus,
}) => {
  const { diffDays } = parseDateFromServer(endTime);

  const status = FilterValues[computedStatus] ?? FilterValues.closed;
  const isClosedOrCancelled =
    status === FilterValues.closed || status === FilterValues.cancelled;

  const iconStatusMap = {
    [FilterValues.active]: <Active />,
    [FilterValues.closed]: <CheckCircle width="15" height="15" />,
  };

  const textDescriptionMap = {
    [FilterValues.active]: `Active: Ends in ${diffDays} days`,
    [FilterValues.closed]: textDecision
      ? `${textDecision} ${winCount ? `(${millify(winCount)})` : ""}`
      : "",
  };

  const statusLabelMap = {
    [FilterValues.active]: voted && (
      <StatusLabel status={"Voted"} color={"has-background-orange"} />
    ),
    [FilterValues.pending]: (
      <StatusLabel status={"Pending"} color="has-background-grey-light" />
    ),
    [FilterValues.closed]: <StatusLabel status={"Closed"} />,
    [FilterValues.cancelled]: <StatusLabel status={"Cancelled"} />,
  };

  return (
    <>
      <div
        className={`is-flex proposal-header-spacing ${
          isClosedOrCancelled ? "has-background-white-ter rounded-top" : ""
        }`}
      >
        <div className="columns flex-1 is-mobile has-text-grey m-0 p-0">
          <div className="column is-narrow is-flex is-align-items-center pl-0">
            {iconStatusMap[status] ?? null}
          </div>
          <div
            className="column pl-1 pr-1 is-flex is-align-items-center"
            style={{ flexBasis: "content" }}
          >
            <code className="has-text-grey">
              {textDescriptionMap[status] ?? null}
            </code>
          </div>
          <div className="column is-flex is-align-items-center is-justify-content-end proposal-status p-0">
            <code className="has-text-grey px-0 smaller-text">
              {statusLabelMap[status] ?? null}
            </code>
          </div>
        </div>
      </div>
      {!isClosedOrCancelled && <hr className="my-0" />}
    </>
  );
};

export default ProposalHeader;
