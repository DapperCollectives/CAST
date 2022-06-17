import React from "react";
import { Input } from "components";

const staticPlaceholders = {
  contractAddress: "Contract Address",
  contractName: "Contract Name",
  maxWeight: "Max Weight",
  minimunBalance: "Minimum Balance",
};

export default function StrategyInformation({
  formFields = [],
  formData = {},
  setField = () => {},
  actionButton,
} = {}) {
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
      {actionButton}
    </>
  );
}
