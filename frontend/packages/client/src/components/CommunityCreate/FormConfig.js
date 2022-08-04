import {
  LinksSchema,
  linksInitialValues,
  linksFieldsArray,
} from 'components/Community/CommunityEditorLinks';
import {
  ProfileSchema,
  profileInitialValues,
  profileFieldsArray,
} from 'components/Community/CommunityEditorProfile';

const StepOneSchema = LinksSchema.concat(ProfileSchema);

const StepOneFieldsArray = [...linksFieldsArray, ...profileFieldsArray];

const initialValues = { ...linksInitialValues, ...profileInitialValues };

export { StepOneSchema, StepOneFieldsArray, initialValues };
