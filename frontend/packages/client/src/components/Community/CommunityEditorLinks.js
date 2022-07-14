import React, { useState } from 'react';
import { Website, Instagram, Twitter, Discord, Github } from 'components/Svg';
import { WrapperResponsive, Loader } from 'components';
import useLinkValidator from './hooks/useLinkValidator';

const FormFieldsConfig = [
  {
    fieldName: 'websiteUrl',
    placeHolder: 'https://www.community-site-name.com',
    iconComponent: <Website width="16px" height="16px" />,
  },
  {
    fieldName: 'twitterUrl',
    placeHolder: 'https://www.twitter.com/account',
    iconComponent: <Twitter width="16px" height="16px" />,
  },
  {
    fieldName: 'githubUrl',
    placeHolder: 'https://www.github.com/repository-name',
    iconComponent: <Github width="16px" height="16px" />,
  },
  {
    fieldName: 'discordUrl',
    placeHolder: 'https://www.discord.com/channel-name',
    iconComponent: <Discord width="16px" height="16px" />,
  },
  {
    fieldName: 'instagramUrl',
    placeHolder: 'https://www.instagram.com/profile-name',
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
            placeHolder={formField?.placeHolder}
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
export default function CommunityEditorLinks(props = {}) {
  const { updateCommunity, ...fields } = props;
  const {
    websiteUrl = '',
    twitterUrl = '',
    instagramUrl = '',
    discordUrl = '',
    githubUrl = '',
  } = fields;
  const [isUpdating, setIsUpdating] = useState(false);
  const [links, setLinks] = useState({
    websiteUrl,
    twitterUrl,
    instagramUrl,
    discordUrl,
    githubUrl,
  });

  const saveData = async () => {
    setIsUpdating(true);
    const updatedKeys = Object.keys(links).filter(
      (key) => links[key] !== (fields[key] ?? '')
    );

    const updatedFields = Object.assign(
      {},
      ...updatedKeys.map((key) => ({ [key]: links[key] }))
    );
    await updateCommunity(updatedFields);
    setIsUpdating(false);
  };

  const { isValid, hasChangedFromOriginal } = useLinkValidator({
    links,
    initialValues: fields,
  });

  const enableSave = isValid && hasChangedFromOriginal;

  const changeHandler = (field) => (value) =>
    setLinks((state) => ({
      ...state,
      [field]: value,
    }));

  return (
    <CommunityLinksForm
      submitComponent={
        <button
          style={{ height: 48, width: '100%' }}
          className={`button vote-button transition-all is-flex has-background-yellow rounded-sm mt-5 is-uppercase is-${
            enableSave && !isUpdating ? 'enabled' : 'disabled'
          }`}
          onClick={!enableSave ? () => {} : saveData}
        >
          {!isUpdating && <>Save</>}
          {isUpdating && <Loader size={18} spacing="mx-button-loader" />}
        </button>
      }
      onChangeHandler={changeHandler}
      fields={links}
      isUpdating={isUpdating}
    />
  );
}
