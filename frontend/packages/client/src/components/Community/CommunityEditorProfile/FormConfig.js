import * as yup from 'yup';
import {
  COMMUNITY_DESCRIPTION_MAX_LENGTH,
  COMMUNITY_NAME_MAX_LENGTH,
} from 'const';

const ProfileSchema = yup.object().shape({
  communityName: yup
    .string()
    .max(
      COMMUNITY_NAME_MAX_LENGTH,
      // eslint-disable-next-line no-template-curly-in-string
      'The maximum length for Community Name is ${max} characters'
    )
    .required('Please provide a Communiy Name'),
  communityDescription: yup.string().max(
    COMMUNITY_DESCRIPTION_MAX_LENGTH,
    // eslint-disable-next-line no-template-curly-in-string
    'The maximum length for Community Description is ${max} characters'
  ),
  communityTerms: yup.string().url('Community Terms must be a valid URL'),
  communityCategory: yup
    .string()
    .required('Please provide a Communiy Category'),
  logo: yup
    .object({
      file: yup.string().optional(),
      imageUrl: yup.string().optional(),
    })
    .nullable(),
  banner: yup
    .object()
    .shape({
      file: yup.string().optional(),
      imageUrl: yup.string().optional(),
    })
    .nullable(),
});

const FormFieldsConfig = [
  {
    fieldName: 'communityName',
  },
  {
    fieldName: 'communityDescription',
  },
  {
    fieldName: 'communityTerms',
  },
  {
    fieldName: 'communityCategory',
  },
  {
    fieldName: 'logo',
  },
  {
    fieldName: 'banner',
  },
];

const profileFieldsArray = FormFieldsConfig.map((field) => field.fieldName);

const initialValues = Object.assign(
  {},
  ...profileFieldsArray.map((key) => ({ [key]: '' }))
);

export { ProfileSchema, FormFieldsConfig, profileFieldsArray, initialValues };
