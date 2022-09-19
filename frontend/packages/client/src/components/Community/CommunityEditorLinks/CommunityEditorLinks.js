import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ActionButton } from 'components';
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

  const { register, handleSubmit, formState, reset } = useForm({
    defaultValues: {
      websiteUrl,
      twitterUrl,
      instagramUrl,
      discordUrl,
      githubUrl,
    },
    resolver: yupResolver(LinksSchema),
  });

  const { errors, isSubmitting, isDirty, isValid, isSubmitSuccessful } =
    formState;

  const onSubmit = async (data) => {
    await updateCommunity(data);
  };

  // this triggers updating the form after
  useEffect(() => {
    if (isSubmitSuccessful) {
      reset({}, { keepValues: true, keepDirty: false });
    }
  }, [isSubmitSuccessful, reset]);

  return (
    <EditorForm
      submitComponent={
        <ActionButton
          label="Save"
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
