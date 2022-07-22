import React from 'react';
import { Input } from 'components';

const staticPlaceholders = {
  addr: 'Contract Address',
  name: 'Contract Name',
  publicPath: 'CollectionPublicPath',
  maxWeight: 'Max Weight',
  threshold: 'Minimum Balance',
};

export default function StrategyInformationForm({
  formFields = [],
  formData = {},
  setField = () => {},
  actionButton = null,
} = {}) {
  return (
    <>
      <div className="columns is-flex-direction-column is-mobile m-0">
        <div className="small-text" style={{ color: '#757575' }}>
          Need help finding this information?{' '}
          <a
            href="https://docs.cast.fyi"
            target="_blank"
            rel="noopener noreferrer"
          >
            Check our Getting Started Guide.
          </a>
        </div>
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
