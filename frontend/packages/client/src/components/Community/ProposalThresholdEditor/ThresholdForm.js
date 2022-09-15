import { WrapperResponsive } from 'components';
import Checkbox from 'components/common/Checkbox';
import Dropdown from 'components/common/Dropdown';
import Form from 'components/common/Form';
import Input from 'components/common/Input';

export default function ThresholdForm({
  removeInnerForm = false,
  handleSubmit = () => {},
  submitComponent = null,
  errors = [],
  register = () => {},
  control = () => {},
  isSubmitting = false,
} = {}) {
  return (
    <Form removeInnerForm={removeInnerForm} onSubmit={handleSubmit}>
      <WrapperResponsive
        classNames="border-light rounded-lg columns is-flex-direction-column is-mobile m-0"
        extraClasses="p-6 mb-5"
        extraClassesMobile="p-4 mb-4"
      >
        <div className="columns is-multiline">
          <div className="column is-12">
            <h4 className="has-text-weight-bold is-size-5">
              Proposal Threshold
            </h4>
          </div>
          <div className="column is-12">
            <p className="small-text has-text-grey">
              Proposal threshold is the minimum number of tokens community
              members must hold in order to create a proposal.
            </p>
          </div>
        </div>
        <Dropdown
          label="Contract Type"
          name="contractType"
          margin="mt-4"
          options={[
            {
              label: 'Default',
              value: '',
            },
            {
              label: 'NFT',
              value: 'nft',
            },
            {
              label: 'Fungible Token',
              value: 'ft',
            },
          ]}
          disabled={isSubmitting}
          control={control}
        />
        <Input
          placeholder="Contract Address"
          register={register}
          name="contractAddress"
          disabled={isSubmitting}
          error={errors['contractAddress']}
          classNames="rounded-sm border-light p-3 column is-full is-full-mobile mt-4"
        />
        <Input
          placeholder="Contract Name"
          register={register}
          name="contractName"
          disabled={isSubmitting}
          error={errors['contractName']}
          classNames="rounded-sm border-light p-3 column is-full is-full-mobile mt-4"
        />
        <Input
          placeholder="Collection Public Path"
          name="storagePath"
          register={register}
          disabled={isSubmitting}
          error={errors['storagePath']}
          classNames="rounded-sm border-light p-3 column is-full is-full-mobile mt-4"
        />
        <Input
          placeholder="Number of Tokens"
          name="proposalThreshold"
          register={register}
          disabled={isSubmitting}
          error={errors['proposalThreshold']}
          classNames="rounded-sm border-light p-3 column is-full is-full-mobile mt-4"
        />
        <Checkbox
          type="checkbox"
          name="onlyAuthorsToSubmitProposals"
          register={register}
          disabled={isSubmitting}
          error={errors['onlyAuthorsToSubmitProposals']}
          label="Allow only designated authors to submit proposals"
          labelClassNames="has-text-grey small-text"
        />
      </WrapperResponsive>
      {submitComponent}
    </Form>
  );
}
