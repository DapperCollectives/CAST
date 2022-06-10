import React from "react";
import Loader from "./Loader";
import Blockies from "react-blockies";
import FadeIn from "../components/FadeIn";
import WrapperResponsive from "./WrapperResponsive";

const Row = ({ index, addr, votingStreak, score }) => {
  const smallRowStyle = { width: "20%" };
  return (
    <tr className="table-row">
      <td className="has-background-white-ter index-cell">{index}</td>
      <td>{addr}</td>
      <td style={smallRowStyle} className="is-hidden-mobile">
        {votingStreak}
      </td>
      <td style={smallRowStyle}>{score}</td>
    </tr>
  );
};

const InitialLoader = () => {
  return (
    <tr>
      <td colSpan="4">
        <Loader fullHeight />
      </td>
    </tr>
  );
};

const EmptyTable = ({ emptyTableMessage }) => {
  return (
    <tr>
      <td colSpan="4">
        <div className="is-flex flex-1 is-justify-content-center smaller-text">
          {emptyTableMessage}
        </div>
      </td>
    </tr>
  );
};

export default function TableMembers({
  data = [],
  initialLoading = false,
  loading = false,
  minTableHeight = "450px",
} = {}) {
  const isEmpty = data?.length === 0;
  const style =
    initialLoading || loading || isEmpty ? { height: minTableHeight } : {};

  const smallRowStyle = { width: "20%" };

  return (
    <table className="table is-fullwidth">
      <thead className="is-hidden-mobile">
        <tr>
          <th className="has-background-white-ter rounded-sm-tl index-cell"></th>
          <th className="smaller-text has-text-weight-bold is-uppercase">
            Member
          </th>
          <th
            className="smaller-text has-text-weight-bold is-uppercase"
            style={smallRowStyle}
          >
            Voting Streak
          </th>
          <th
            className="smaller-text has-text-weight-bold is-uppercase"
            style={smallRowStyle}
          >
            Score
          </th>
        </tr>
      </thead>
      <tbody className="is-scrollable-table" style={style}>
        {initialLoading && <InitialLoader />}
        {isEmpty && (
          <EmptyTable emptyTableMessage={"No members in this community yet"} />
        )}
        {data?.map((datum, index) => {
          const userIndex = index + 1;
          return (
            <Row
              key={`table-row-${index}`}
              index={
                <div className="smaller-text has-text-weight-bold">
                  {userIndex}
                </div>
              }
              addr={
                <div className="is-flex is-align-items-center">
                  <Blockies
                    seed={datum?.addr}
                    size={8}
                    scale={4}
                    className="blockies"
                  />
                  <span className="ml-4 is-hidden-mobile">{datum?.addr}</span>
                  <span className="ml-4 is-hidden-tablet">{`${
                    datum?.addr.length > 15
                      ? `${datum?.addr.substring(
                          0,
                          4
                        )}...${datum?.addr.substring(12)}`
                      : datum?.addr
                  }`}</span>
                </div>
              }
              score={
                <WrapperResponsive
                  commonClasses="has-text-weight-bold"
                  extraClassesMobile="smaller-text"
                >
                  {datum?.score}
                </WrapperResponsive>
              }
              votingStreak={
                <div className="has-text-weight-bold">
                  {datum?.votingStreak}
                </div>
              }
            />
          );
        })}
      </tbody>
      {loading && (
        <FadeIn as="tfoot" style={{ display: "table-footer-group" }}>
          <tr>
            <td colSpan="4">
              <div className="is-flex flex-1 is-justify-content-center smaller-text">
                Loading more...
              </div>
            </td>
          </tr>
        </FadeIn>
      )}
    </table>
  );
}
