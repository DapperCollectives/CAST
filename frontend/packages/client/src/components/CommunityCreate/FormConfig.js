import {
  LinksSchema,
  linksFieldsArray,
  linksInitialValues,
} from 'components/Community/CommunityEditorLinks';
import {
  ProfileSchema,
  profileFieldsArray,
  profileInitialValues,
} from 'components/Community/CommunityEditorProfile';

const StepOneSchema = LinksSchema.concat(ProfileSchema);

const StepOneFieldsArray = [...linksFieldsArray, ...profileFieldsArray];

const initialValues = { ...linksInitialValues, ...profileInitialValues };

export { StepOneSchema, StepOneFieldsArray, initialValues };
