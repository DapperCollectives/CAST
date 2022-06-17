import React, { useState } from "react";
import { Input, ActionButton } from "components";

const staticPlaceholders = {
  contractAddress: "Contract Address",
  contractName: "Contact Name",
  maxWeight: "Max Weight",
  minimunBalance: "Minimum Balance",
};

export default function StrategyInformation({ onDone = () => {} } = {}) {
  const [formData, setFormData] = useState({
    contractAddress: "",
    contractName: "",
    maxWeight: "",
    minimunBalance: "",
  });

  const formFields = Object.keys(formData);

  const setField = (field) => (value) =>
    setFormData((state) => ({ ...state, [field]: value }));

  const _onDone = () => {
    onDone(formData);
  };

  return (
    <>
      <div className="columns is-flex-direction-column is-mobile m-0">
        {formFields.map((field, index) => (
          <Input
            key={index}
            placeholder={staticPlaceholders[field]}
            name={field}
            value={formData[field]}
            onChange={setField(field)}
          />
        ))}
      </div>
      <ActionButton
        label="done"
        enabled={true}
        onClick={_onDone}
        classNames="mt-5"
      />
    </>
  );
}
