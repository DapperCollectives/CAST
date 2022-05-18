import React from "react";

export default function StartSteps({ dismissPreStep }) {
  return (
    <div className="columns is-multiline border-light rounded-sm p-6">
      <div className="column is-12">
        <h4 className="has-text-weight-bold is-size-5">
          Let's create a community
        </h4>
      </div>
      <div className="column is-12 ">
        <p className="small-text has-text-grey">
          Creating a community on CAST provides a way for members to create and
          vote on proposals in a decentralized way. Proposals can be related to
          internal governance (e.g. How to spend funds) or fan-facing, creative
          decisions. (e.g. Developing a story).
        </p>
      </div>
      <div className="column is-12">
        <button
          style={{ height: 48, width: "100%" }}
          className="button vote-button transition-all is-flex has-background-yellow rounded-sm is-enabled is-size-6"
          onClick={() => dismissPreStep()}
        >
          GET STARTED
        </button>
      </div>
    </div>
  );
}
