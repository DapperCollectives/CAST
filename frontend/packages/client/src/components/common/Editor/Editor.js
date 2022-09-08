import React from 'react';
import { Controller } from 'react-hook-form';
import FadeIn from 'components/FadeIn';
import DraftjsEditor from './DraftjsEditor';

export default function Editor({ control, error, name } = {}) {
  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange, ref } }) => {
          return <DraftjsEditor value={value} onChange={onChange} ref={ref} />;
        }}
      />
      {error && (
        <FadeIn>
          <div className="pl-1 mt-2">
            <p className="smaller-text has-text-danger">{error?.message}</p>
          </div>
        </FadeIn>
      )}
    </>
  );
}
