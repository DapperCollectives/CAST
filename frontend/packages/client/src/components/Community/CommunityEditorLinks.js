import React from 'react';
import { Website, Instagram, Twitter, Discord, Github } from 'components/Svg';
import { WrapperResponsive, ActionButton } from 'components';
import useLinkValidator from './hooks/useLinkValidator';
import { useForm } from 'react-hook-form';
import { wait } from 'utils';

const FormFieldsConfig = [
  {
    fieldName: 'websiteUrl',
    placeholder: 'https://www.community-site-name.com',
    iconComponent: <Website width="16px" height="16px" />,
  },
  {
    fieldName: 'twitterUrl',
    placeholder: 'https://www.twitter.com/account',
    iconComponent: <Twitter width="16px" height="16px" />,
  },
  {
    fieldName: 'githubUrl',
    placeholder: 'https://www.github.com/repository-name',
    iconComponent: <Github width="16px" height="16px" />,
  },
  {
    fieldName: 'discordUrl',
    placeholder: 'https://www.discord.com/channel-name',
    iconComponent: <Discord width="16px" height="16px" />,
  },
  {
    fieldName: 'instagramUrl',
    placeholder: 'https://www.instagram.com/profile-name',
    iconComponent: <Instagram width="16px" height="16px" />,
  },
];
export const CommunityLinksForm = ({
  formFields = FormFieldsConfig,
  submitComponent,
  onChangeHandler,
  fields,
  isUpdating = false,
  wrapperMargin = 'mb-6',
  wrapperMarginMobile = 'mb-4',
}) => {
  return (
    <WrapperResponsive
      classNames="border-light rounded-lg columns is-flex-direction-column is-mobile m-0"
      extraClasses={`p-6 ${wrapperMargin}`}
      extraClassesMobile={`p-4 ${wrapperMarginMobile}`}
    >
      <div className="columns flex-1">
        <div className="column">
          <div className="is-flex flex-1">
            <WrapperResponsive
              tag="h5"
              classNames="title is-6 mb-2"
              extraClassesMobile="mt-4"
            >
              Community Links
            </WrapperResponsive>
          </div>
          <div className="is-flex flex-1 mt-5">
            <p className="has-text-grey small-text">
              Let’s fill out your Community profile. These details will be
              publicly available and will help people know what your community
              is all about.
            </p>
          </div>
        </div>
      </div>
      {formFields.map((formField, index) => (
        <div
          style={{ position: 'relative' }}
          className="is-flex is-align-items-center mt-4"
          key={`form-field-${index}`}
        >
          <input
            type="text"
            name={formField.fieldName}
            className="rounded-sm border-light py-3 pr-3 column is-full"
            placeholder={formField?.placeholder}
            value={fields[formField.fieldName]}
            maxLength={200}
            onChange={(event) =>
              onChangeHandler(formField.fieldName)(event.target.value)
            }
            style={{
              paddingLeft: '34px',
            }}
            disabled={isUpdating}
          />
          <div
            className="pl-3"
            style={{
              position: 'absolute',
              height: 18,
              opacity: 0.3,
            }}
          >
            {formField.iconComponent}
          </div>
        </div>
      ))}
      {submitComponent}
    </WrapperResponsive>
  );
};
const CommunityLinksInternal = ({
  formFields = FormFieldsConfig,
  submitComponent,
  wrapperMargin = 'mb-6',
  wrapperMarginMobile = 'mb-4',
  handleSubmit,
  register,
  errors,
  isSubmitting,
}) => {
  return (
    <WrapperResponsive
      classNames="border-light rounded-lg columns is-flex-direction-column is-mobile m-0"
      extraClasses={`p-6 ${wrapperMargin}`}
      extraClassesMobile={`p-4 ${wrapperMarginMobile}`}
    >
      <div className="columns flex-1">
        <div className="column">
          <div className="is-flex flex-1">
            <WrapperResponsive
              tag="h5"
              classNames="title is-6 mb-2"
              extraClassesMobile="mt-4"
            >
              Community Links
            </WrapperResponsive>
          </div>
          <div className="is-flex flex-1 mt-5">
            <p className="has-text-grey small-text">
              Let’s fill out your Community profile. These details will be
              publicly available and will help people know what your community
              is all about.
            </p>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        {formFields.map((formField, index) => (
          <div
            style={{ position: 'relative' }}
            className="is-flex is-align-items-center mt-4"
            key={`form-field-${index}`}
          >
            <input
              type="text"
              placeholder={formField?.placeholder}
              {...register(formField.fieldName, { disabled: isSubmitting })}
              className="rounded-sm border-light py-3 pr-3 column is-full"
              style={{
                paddingLeft: '34px',
              }}
            />
            <div
              className="pl-3"
              style={{
                position: 'absolute',
                height: 18,
                opacity: 0.3,
              }}
            >
              {formField.iconComponent}
            </div>
            {errors[formField.fieldName] && (
              <p>{errors[formField.fieldName]?.message}</p>
            )}
          </div>
        ))}
        {submitComponent}
      </form>
    </WrapperResponsive>
  );
};

export default function CommunityEditorLinks(props = {}) {
  const { updateCommunity, ...fields } = props;
  const {
    websiteUrl = '',
    twitterUrl = '',
    instagramUrl = '',
    discordUrl = '',
    githubUrl = '',
  } = fields;

  const { register, handleSubmit, watch, formState } = useForm({
    defaultValues: {
      websiteUrl,
      twitterUrl,
      instagramUrl,
      discordUrl,
      githubUrl,
    },
  });
  const { errors, isSubmitting, isDirty, isValid } = formState;

  const onSubmit = async (data) => {
    await updateCommunity(data);
  };
  return (
    <CommunityLinksInternal
      submitComponent={
        <ActionButton
          label="save"
          enabled={isValid && isDirty && !isSubmitting}
          loading={isSubmitting}
          classNames="vote-button transition-all  has-background-yellow mt-5"
        />
      }
      errors={errors}
      register={register}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit(onSubmit)}
    />
  );
}
