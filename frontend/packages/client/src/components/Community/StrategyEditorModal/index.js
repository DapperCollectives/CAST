import React, { useEffect, useState } from "react";
import StrategySelector from "./StrategySelector";
import StrategyInformation from "./StrategyInformation";

const ModalSteps = {
  1: "select-strategy",
  2: "strategy-information",
};

export default function StrategyEditorModal({
  strategies = [],
  enableDismiss = true,
  onDismiss = () => {},
  onDone = () => {},
} = {}) {
  const [step, setSep] = useState(ModalSteps[1]);

  const [data, setData] = useState({});

  const setStrategy = (strategy) => {
    setData({ strategy });
    setSep(ModalSteps[2]);
  };

  useEffect(() => {
    return setSep(ModalSteps[1]);
  }, []);

  const _onDismiss = () => {
    setSep(ModalSteps[1]);
    onDismiss();
  };

  const _onDone = (fields) => {
    onDone({ ...data, ...fields });
  };
  return (
    <div
      className="modal-card has-background-white m-0 p-5 p-1-mobile"
      style={{ minHeight: "467px" }}
    >
      <header
        className="modal-card-head has-background-white columns is-mobile m-0 px-4 pt-4"
        style={{ borderBottom: "none" }}
      >
        <div className="column p-0 is-flex flex-1">
          <h2 className="is-size-4">Select a Strategy</h2>
        </div>
        <div
          className={`column is-narrow px-0 has-text-right is-size-2 leading-tight cursor-pointer ${
            enableDismiss && "has-text-grey"
          }`}
          onClick={_onDismiss}
        >
          &times;
        </div>
      </header>
      <section
        className="modal-card-body py-0 px-4"
        style={{ minHeight: "280px" }}
      >
        {step === ModalSteps[1] && (
          <StrategySelector
            onDismiss={() => {}}
            enableDismiss={true}
            strategies={strategies}
            onSelectStrategy={setStrategy}
          />
        )}
        {step === ModalSteps[2] && <StrategyInformation onDone={_onDone} />}
      </section>
    </div>
  );
}
