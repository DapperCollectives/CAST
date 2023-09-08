import { useState } from 'react';
import networks from 'networks';
import CustomScriptSelector from './CustomScriptSelector';
import StrategyInformationForm from './StrategyInformationForm';
import StrategySelector from './StrategySelector';

const networkConfig = networks[process.env.REACT_APP_FLOW_ENV];

const ModalSteps = {
  1: 'select-strategy',
  2: 'strategy-information',
};

const getFormFields = (strategy) => {
  if (strategy === 'custom-script') {
    return {
      threshold: '',
      maxWeight: '',
    };
  }

  const formFields = {
    addr: '',
    name: '',
    threshold: '',
    maxWeight: '',
    publicPath: '',
  };
  if (strategy === 'float-nfts') {
    formFields.floatEventId = '';
  }
  return formFields;
};

export default function StrategyEditorModal({
  strategies = [],
  enableDismiss = true,
  onDismiss = () => {},
  // callback to pass data collected and closed modal
  onDone = () => {},
  selectedProposalContract = {},
} = {}) {
  // handles two steps inside modal
  // 1 - strategy name
  // 2 - contract strategy info
  const [step, setSep] = useState(ModalSteps[1]);

  const [strategyData, setStrategyData] = useState({
    name: '',
    contract: {},
  });

  const setStrategy = (strategyName) => {
    //
    // STRATEGY CONFIGURATION
    //
    // If strategy selected is 'one-address-one-vote'
    // then no more information is required(FE uses strategy configuration)
    // modal should be closed and strategy should be ready to be added
    if (strategyName === 'one-address-one-vote') {
      const strategyConfig =
        networkConfig.strategiesConfig['one-address-one-vote'];
      onDone({
        name: strategyName,
        contract: {
          name: strategyConfig.name,
          addr: strategyConfig.addr,
          publicPath: strategyConfig.publicPath,
          threshold: '0',
        },
      });
      return;
    }
    setStrategyData({
      name: strategyName,
      contract: getFormFields(strategyName),
    });
    setSep(ModalSteps[2]);
  };

  const onDismissModal = () => {
    onDismiss();
  };

  const onConfirmDone = (data) => {
    onDone({ ...strategyData, contract: data });
  };

  const strategy = strategies.find((s) => s.key === strategyData.name);
  const strategyName = strategyData?.name && strategy.name;

  const getUpdatedScript = (strategy) => {
    // We know that only custom-script has the scripts so we filtering the data according to that.
    // Refer contractsAndPaths.json for Data structure.
    const allowedScripts = selectedProposalContract?.strategies.find(
      (k) => k.strategyKey === 'custom-script'
    )?.scripts;

    return strategy.scripts.filter((eachscript) => {
      return allowedScripts.includes(eachscript?.key);
    });
  };

  return (
    <div
      className="modal-card has-background-white m-0 p-5 p-1-mobile full-height"
      style={{ minHeight: '540px' }}
    >
      <header
        className="modal-card-head has-background-white columns is-mobile m-0 px-4 pt-4"
        style={{ borderBottom: 'none' }}
      >
        <div className="column p-0 is-flex flex-1">
          <h2 className="is-size-4" style={{ textTransform: 'capitalize' }}>
            {step === ModalSteps[2] && strategyData?.name
              ? strategyName
              : 'Select a Strategy'}
          </h2>
        </div>
        <div
          className={`column is-narrow px-0 has-text-right is-size-2 leading-tight cursor-pointer ${
            enableDismiss && 'has-text-grey'
          }`}
          onClick={onDismissModal}
        >
          &times;
        </div>
      </header>
      <section
        className="modal-card-body py-0 px-4"
        style={{ minHeight: '280px' }}
      >
        {step === ModalSteps[1] && (
          <StrategySelector
            onDismiss={() => {}}
            enableDismiss={true}
            strategies={strategies}
            onSelectStrategy={setStrategy}
          />
        )}
        {step === ModalSteps[2] ? (
          strategy.key === 'custom-script' ? (
            <CustomScriptSelector
              scripts={getUpdatedScript(strategy)}
              formData={strategyData.contract}
              formFields={Object.keys(getFormFields(strategyData.name))}
              onSubmit={onConfirmDone}
            />
          ) : (
            <StrategyInformationForm
              selectedProposalContract={selectedProposalContract}
              strategy={strategy}
              formData={strategyData.contract}
              formFields={Object.keys(getFormFields(strategyData.name))}
              onSubmit={onConfirmDone}
            />
          )
        ) : null}
      </section>
    </div>
  );
}
