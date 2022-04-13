import React, { useEffect } from "react";
import millify from "millify";
import { AngleDown, AngleUp } from "./Svg";
import Blockies from "react-blockies";
import useProposalVotes from "../hooks/useProposalVotes";

const Core = () => (
  <div className="subtitle small-text p-2 rounded-sm has-background-white-ter has-text-black is-family-monospace">
    {" "}
    Core{" "}
  </div>
);

const ShowMoreOrLess = ({ showMore, showLess, enableMore, enableLess }) => (
  <>
    {enableLess && (
      <button
        className="button is-white is-text-grey small-text"
        onClick={showLess}
      >
        <AngleUp />
        View less
      </button>
    )}
    {enableMore && (
      <button
        className="button is-white is-text-grey small-text"
        onClick={showMore}
      >
        View more <AngleDown />
      </button>
    )}
  </>
);

const VotesList = ({ proposalId, castVote }) => {
  const {
    getProposalVotes,
    fetchMore,
    resetResults,
    loading: loadingVotes,
    data: votes,
    pagination: { next, totalRecords: totalVotes },
  } = useProposalVotes({ proposalId, count: 10 });

  useEffect(() => {
    (async () => {
      resetResults();
      await getProposalVotes();
    })();
  }, [castVote, getProposalVotes, resetResults]);

  const scrollToBottom = () => {
    window.scrollTo({
      left: 0,
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };
  const hasMoreThanTen = totalVotes > 10;

  const showMore = async () => {
    if (next > 0) {
      await fetchMore();
      scrollToBottom();
    }
  };
  const showLess = async () => {
    resetResults();
    await getProposalVotes();
    scrollToBottom();
  };

  return (
    <div className="border-light rounded-sm">
      <div className="pt-6 px-6 pb-5 is-hidden-mobile">
        <span className="is-size-5">
          Votes{" "}
          <span className="has-text-grey is-size-6 pl-1">({totalVotes})</span>
        </span>
      </div>
      <div
        className="pt-6 pb-5 is-hidden-tablet"
        style={{ paddingLeft: "16px" }}
      >
        <span className="is-size-5">
          Votes{" "}
          <span className="has-text-grey is-size-6 pl-1">({totalVotes})</span>
        </span>
      </div>
      <div className={`px-6 mt-5 ${!hasMoreThanTen ? "pb-5" : ""}`}>
        <div className="columns is-multiline is-mobile m-0">
          {votes &&
            votes.map((vote, i) => {
              return (
                <React.Fragment key={`column-${i}`}>
                  <div
                    className={`column is-8 py-1 px-0 is-flex is-align-items-center is-justify-content-start`}
                  >
                    <Blockies
                      seed={vote.addr}
                      size={6}
                      scale={4}
                      className="blockies"
                    />
                    <p className="mx-4 small-text">{vote.addr}</p>
                    {vote.isCore && <Core />}
                  </div>
                  <div
                    className={`column is-4 py-1 px-0 is-flex is-align-items-center is-justify-content-end small-text has-text-grey`}
                  >
                    {millify(vote.balance / Math.pow(10, 8) || "0")} FLOW
                  </div>
                  {/* last one should not show if it has less than ten elements*/}
                  {(totalVotes !== i + 1 || hasMoreThanTen) && (
                    <div className={`column p-0 is-full`}>
                      <hr />
                    </div>
                  )}
                  {loadingVotes && (
                    <div
                      className={`column p-0 is-full is-flex is-align-items-center is-justify-content-center`}
                    >
                      <h5>Loading more ...</h5>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          {hasMoreThanTen && (
            <div className="column p-0 mb-5 is-full is-flex is-align-items-center is-justify-content-center">
              <ShowMoreOrLess
                enableLess={next < 0}
                enableMore={next > 0}
                showLess={showLess}
                showMore={showMore}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VotesList;
