import React from 'react';
import { ActionButton } from 'components';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { LinksSchema } from './FormConfig';
import EditorForm from './LinksForm';

export default function CommunityEditorLinks(props = {}) {
  const { updateCommunity, ...fields } = props;
  const {
    websiteUrl = '',
    twitterUrl = '',
    instagramUrl = '',
    discordUrl = '',
    githubUrl = '',
  } = fields;

  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      websiteUrl,
      twitterUrl,
      instagramUrl,
      discordUrl,
      githubUrl,
    },
    resolver: yupResolver(LinksSchema),
  });

  const { errors, isSubmitting, isDirty, isValid } = formState;

  const onSubmit = async (data) => {
    await updateCommunity(data);
  };

  return (
    <EditorForm
      submitComponent={
        <ActionButton
          label="save"
          enabled={isValid && isDirty && !isSubmitting}
          loading={isSubmitting}
          classNames="vote-button transition-all has-background-yellow mt-5"
        />
      }
      errors={errors}
      register={register}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit(onSubmit)}
    />
  );
}
