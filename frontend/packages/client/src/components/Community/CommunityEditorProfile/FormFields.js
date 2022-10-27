import Dropdown from 'components/common/Dropdown';
import Input from 'components/common/Input';
import TextArea from 'components/common/TextArea';
import { useCommunityCategory } from 'hooks';

export default function FormFields({
  register,
  isSubmitting,
  errors,
  control,
} = {}) {
  const { data: communityCategories } = useCommunityCategory();

  return (
    <>
      <Input
        placeholder="Community Name"
        register={register}
        name="communityName"
        disabled={isSubmitting}
        error={errors['communityName']}
        classNames="mt-2"
      />
      <TextArea
        placeholder="Short Description"
        register={register}
        name="communityDescription"
        disabled={isSubmitting}
        error={errors['communityDescription']}
        classNames="text-area rounded-sm border-light p-3 column is-full mt-4"
      />
      <Dropdown
        label="Community Type"
        name="communityCategory"
        margin="mt-4"
        options={(communityCategories ?? []).map((cat) => ({
          label: cat.name,
          value: cat.key,
        }))}
        disabled={isSubmitting}
        control={control}
      />
      <Input
        placeholder="Terms  (e.g. https://example.com/terms)"
        register={register}
        name="communityTerms"
        disabled={isSubmitting}
        error={errors['communityTerms']}
        classNames="mt-4"
      />
    </>
  );
}
