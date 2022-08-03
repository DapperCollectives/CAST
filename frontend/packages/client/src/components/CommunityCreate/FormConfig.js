import * as yup from 'yup';
import { Website, Instagram, Twitter, Discord, Github } from 'components/Svg';
import {
  COMMUNITY_DESCRIPTION_MAX_LENGTH,
  COMMUNITY_NAME_MAX_LENGTH,
} from 'const';

const LinksSchema = yup
  .object()
  .shape({
    websiteUrl: yup.string().matches(
      new RegExp(
        '^(https?:\\/\\/)?' + // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
          '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
          '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
          '(\\#[-a-z\\d_]*)?$',
        'i'
      ),
      { message: 'Invalid Website URL', excludeEmptyString: true }
    ),
    twitterUrl: yup
      .string()
      .matches(new RegExp('(https://)(www\\.)?twitter\\.com/(\\w+)', 'i'), {
        message: 'Invalid Twitter URL',
        excludeEmptyString: true,
      }),
    instagramUrl: yup
      .string()
      .matches(
        /(https:\/\/)(www\.)?(?:instagram.com|instagr.am|instagr.com)\/(\w+)/gim,
        {
          message: 'Invalid Instragram URL',
          excludeEmptyString: true,
        }
      ),
    discordUrl: yup
      .string()
      .matches(
        /(https:\/\/)(www\.)?(discord\.(gg|io|me|li|com)|discordapp\.com\/invite)\/.+[a-zA-Z0-9]/gim,
        {
          message: 'Invalid Discord URL',
          excludeEmptyString: true,
        }
      ),
    githubUrl: yup
      .string()
      .matches(/(https:\/\/)(www\.)?(github\.com)\/(?:[^/\s]+)/gim, {
        message: 'Invalid Github URL',
        excludeEmptyString: true,
      }),
  })
  .required();

const StepOneSchema = LinksSchema.shape({
  communityName: yup.string().required('Please provide a Communiy Name').max(
    COMMUNITY_NAME_MAX_LENGTH,
    // eslint-disable-next-line no-template-curly-in-string
    'The maximum length for Community Name is ${max} characters'
  ),
  communityDescription: yup.string().max(
    COMMUNITY_DESCRIPTION_MAX_LENGTH,
    // eslint-disable-next-line no-template-curly-in-string
    'The maximum length for Community Description is ${max} characters'
  ),
  communityTerms: yup.string().url('Community Terms must be a valid URL'),
}).required();

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

const linksFieldsArray = FormFieldsConfig.map((field) => field.fieldName);

const StepOneFieldsArray = [
  ...linksFieldsArray,
  'communityName',
  'communityDescription',
  'communityTerms',
];

const initialValues = Object.assign(
  {},
  ...StepOneFieldsArray.map((key) => ({ [key]: '' }))
);

export {
  StepOneSchema,
  LinksSchema,
  FormFieldsConfig,
  StepOneFieldsArray,
  linksFieldsArray,
  initialValues,
};
