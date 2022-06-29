import React, { useEffect, useState } from 'react';
import networks from 'networks';
import StrategySelector from './StrategySelector';
import StrategyInformationForm from './StrategyInformationForm';
import { ActionButton } from 'components';
import { isValidAddress } from 'utils';

const networkConfig = networks[process.env.REACT_APP_FLOW_ENV];

const ModalSteps = {
  1: 'select-strategy',
  2: 'strategy-information',
};

const initialFormFields = {
  contractAddress: '',
  contractName: '',
  maxWeight: '',
  minimunBalance: '',
};

const formFields = Object.keys(initialFormFields);

export default function StrategyEditorModal({
  strategies = [],
  enableDismiss = true,
  onDismiss = () => {},
  // callback to pass data collected and closed modal
  onDone = () => {},
} = {}) {
  // handles two steps inside modal
  // 1 - strategy name
  // 2 - contract strategy info
  const [step, setSep] = useState(ModalSteps[1]);
  const [formIsValid, setIsFormValid] = useState(false);

  const [strategyData, setStrategyData] = useState({
    name: '',
    contract: { ...initialFormFields },
  });

  // this useEffect validates form on second step
  useEffect(() => {
    const requiredFields = {
      contractAddress: (addr) =>
        addr?.trim().length > 0 && isValidAddress(addr),
      contractName: (name) =>
        name?.trim().length > 0 && name?.trim().length <= 150,
      maxWeight: (maxWeight) =>
        maxWeight?.trim().length > 0 && /^[0-9]+$/.test(maxWeight),
      minimunBalance: (minimunBalance) =>
        minimunBalance?.trim().length > 0 && /^[0-9]+$/.test(minimunBalance),
    };
    const isValid = Object.keys(requiredFields).every((field) =>
      requiredFields[field](strategyData.contract[field])
    );
    setIsFormValid(isValid);
  }, [strategyData]);

  // user selected strategy move to second step to enter information
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
          contractName: strategyConfig.name,
          contractAddress: strategyConfig.addr,
          publicPath: strategyConfig.publicPath,
          minimunBalance: '0',
        },
      });
      return;
    }
    setStrategyData((state) => ({ ...state, name: strategyName }));
    // else go to second step
    setSep(ModalSteps[2]);
  };

  const onDismissModal = () => {
    onDismiss();
  };

  const onConfirmDone = () => {
    onDone(strategyData);
  };

  const setContractInfoField = (field) => (value) =>
    setStrategyData((state) => ({
      ...state,
      contract: {
        ...state.contract,
        [field]: value,
      },
    }));

  return (
    <div
      className="modal-card has-background-white m-0 p-5 p-1-mobile"
      style={{ minHeight: '467px' }}
    >
      <header
        className="modal-card-head has-background-white columns is-mobile m-0 px-4 pt-4"
        style={{ borderBottom: 'none' }}
      >
        <div className="column p-0 is-flex flex-1">
          <h2 className="is-size-4">Select a Strategy</h2>
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
        {step === ModalSteps[2] && (
          <StrategyInformationForm
            setField={setContractInfoField}
            formData={strategyData.contract}
            formFields={formFields}
            actionButton={
              <ActionButton
                label="done"
                enabled={formIsValid}
                onClick={onConfirmDone}
                classNames="mt-5"
              />
            }
          />
        )}
      </section>
    </div>
  );
}
