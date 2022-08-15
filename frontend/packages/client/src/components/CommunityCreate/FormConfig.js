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
import { Schema as StepThreeSchema } from 'components/Community/ProposalThresholdEditor';

const StepOneSchema = LinksSchema.concat(ProfileSchema);

const StepOneFieldsArray = [...linksFieldsArray, ...profileFieldsArray];

const initialValues = { ...linksInitialValues, ...profileInitialValues };

const stepOne = {
  Schema: StepOneSchema,
};
const stepThree = {
  Schema: StepThreeSchema,
};

export { stepOne, stepThree, StepOneSchema, StepOneFieldsArray, initialValues };
