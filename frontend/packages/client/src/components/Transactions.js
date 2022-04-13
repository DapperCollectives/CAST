import React, { useState, useEffect } from "react";
import { Web3Consumer } from "../contexts/Web3";

function Transaction({ web3 }) {
  const { id, status, errorMessage } = web3.transaction;
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    setMinimized(false);
  }, [id, status]);

  if (!id && !status) {
    return null;
  }

  const Approval = () => {
    return (
      <>
        <div>
          <div className="is-size-5 mb-2">
            <code>Initializing</code>
          </div>
          <div className="is-size-6 mb-2">
            Waiting for transaction approval.
          </div>
        </div>
        <progress className="progress" indeterminate="true">
          Initializing...
        </progress>
      </>
    );
  };

  const Pending = () => {
    return (
      <>
        <div className="is-size-5 mb-2">
          {id && (
            <span className="mr-2">
              <a href={`https://testnet.flowscan.org/transaction/${id}`}>
                {id.slice(0, 8)}
              </a>
            </span>
          )}
          <code>Pending</code>
        </div>
        <div className="is-size-6 mb-2">
          The transaction has been received by a collector but not yet finalized
          in a block.
        </div>
        <progress className="progress" indeterminate="true">
          Executing
        </progress>
      </>
    );
  };

  const Finalized = () => {
    return (
      <>
        <div className="is-size-5 mb-2">
          {id && (
            <span className="mr-2">
              <a href={`https://testnet.flowscan.org/transaction/${id}`}>
                {id.slice(0, 8)}
              </a>
            </span>
          )}
          <code>Finalized</code>
        </div>
        <div className="is-size-6 mb-2">
          The consensus nodes have finalized the block that the transaction is
          included in.
        </div>
        <progress className="progress" min="0" max="100" value="80">
          Executing...
        </progress>
      </>
    );
  };

  const Executed = () => {
    return (
      <>
        <div className="is-size-5 mb-2">
          {id && (
            <span className="mr-2">
              <a href={`https://testnet.flowscan.org/transaction/${id}`}>
                {id.slice(0, 8)}
              </a>
            </span>
          )}
          <code>Executed</code>
        </div>
        <div className="is-size-6 mb-2">
          The execution nodes have produced a result for the transaction.
        </div>
        <progress className="progress" min="0" max="100" value="80">
          Sealing...
        </progress>
      </>
    );
  };

  const Sealed = () => {
    return (
      <>
        <div className="is-size-5 mb-2">
          {id && (
            <span className="mr-2">
              <a href={`https://testnet.flowscan.org/transaction/${id}`}>
                {id.slice(0, 8)}
              </a>
            </span>
          )}
          <code>✓ Sealed</code>
        </div>
        <div className="is-size-6 mb-2">
          The verification nodes have verified the transaction, and the seal is
          included in the latest block.
        </div>
      </>
    );
  };

  const Expired = () => {
    return (
      <>
        <div className="is-size-5 mb-2">
          {id && (
            <span className="mr-2">
              <a href={`https://testnet.flowscan.org/transaction/${id}`}>
                {id.slice(0, 8)}
              </a>
            </span>
          )}
          <code>Expired</code>
        </div>
        <div className="is-size-6 mb-2">
          The transaction was submitted past its expiration block height.
        </div>
      </>
    );
  };

  const Error = () => {
    return (
      <>
        <div className="is-size-5 mb-2">
          {id && (
            <span className="mr-2">
              <a href={`https://testnet.flowscan.org/transaction/${id}`}>
                {id.slice(0, 8)}
              </a>
            </span>
          )}
          <code>{errorMessage}</code>
        </div>
      </>
    );
  };

  let response;

  if (status < 0) {
    response = <Approval />;
  } else if (status < 2) {
    response = <Pending />;
  } else if (status === 2) {
    response = <Finalized />;
  } else if (status === 3) {
    response = <Executed />;
  } else if (status === 4) {
    response = <Sealed />;
  } else if (status === 5) {
    response = <Expired />;
  } else if (status === 500) {
    response = <Error />;
  }

  if (minimized) {
    return null;
  }

  return (
    <div className="px-4">
      <div className="container tx p-4">
        <div
          className="close py-2 px-4 is-"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            color: "white",
            cursor: "pointer",
          }}
          onClick={() => setMinimized(true)}
        >
          <b>X</b>
        </div>
        <div>{response}</div>
        <div className="mt-2 is-size-7">
          <a href="https://docs.onflow.org/access-api/">More Info</a>
        </div>
      </div>
    </div>
  );
}

export default Web3Consumer(Transaction);
