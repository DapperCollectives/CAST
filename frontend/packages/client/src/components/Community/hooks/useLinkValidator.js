import { useState, useEffect, useCallback } from 'react';
import isEqual from 'lodash/isEqual';
import pickBy from 'lodash/pickBy';
import pick from 'lodash/pick';

export const urlPatternValidation = (url) => {
  const regex = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  );
  return url === '' || !!regex.test(url);
};
const twitterValidator = (url) => {
  const regex = new RegExp(
    '^(?:https://)?(?:www\\.)?twitter\\.com/(\\w+)',
    'i'
  );
  return url === '' || !!regex.test(url);
};
const instagramValidator = (url) => {
  return (
    url === '' ||
    /(?:(?:http|https):\/\/)?(?:www.)?(?:instagram.com|instagr.am|instagr.com)\/(\w+)/gim.test(
      url
    )
  );
};
const discordValidator = (url) => {
  return (
    url === '' ||
    /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|com)|discordapp\.com\/invite)\/.+[a-zA-Z0-9]/gim.test(
      url
    )
  );
};
const githubValidator = (url) => {
  return url === '' || /https?:\/\/github\.com\/(?:[^/\s]+)/gim.test(url);
};

const removeUndefinedProps = (obj) => pickBy(obj, (e) => e !== undefined);

export default function useLinkValidator({ links, initialValues }) {
  const [validations, setValidations] = useState({
    isValid: false,
    hasChangedFromOriginal: false,
  });

  const urlLinkNotRepeated = useCallback(() => {
    const values = Object.values(links).filter((link) => link !== '');
    const valuesSet = new Set(values);
    if (valuesSet.size === values.length) {
      return true;
    }
    return false;
  }, [links]);

  const { isValid, hasChangedFromOriginal } = validations;

  useEffect(() => {
    const baseValidation =
      urlPatternValidation(links['websiteUrl']) &&
      twitterValidator(links['twitterUrl']) &&
      instagramValidator(links['instagramUrl']) &&
      discordValidator(links['discordUrl']) &&
      githubValidator(links['githubUrl']) &&
      urlLinkNotRepeated();

    // get an object with valid props to copare
    // this object contains inital props !== undefined
    const initialProps = removeUndefinedProps(initialValues);

    // fields are initialized with '' if they come as undefined from the backend
    // this object represents fields updated
    // by user with initual values !== undefined
    const linksObjUpdated = pick(
      links,
      Object.keys(links).filter(
        (key) => !(links[key] === '' && initialProps[key] === undefined)
      )
    );
    // chech if object fields has changed from original one
    const hasChanged = !isEqual(linksObjUpdated, initialProps);

    console.log('initialProps ->', initialProps);
    console.log('hasChanged', hasChanged);
    console.log('linksObjUpdated', linksObjUpdated);

    if (isValid !== baseValidation || hasChangedFromOriginal !== hasChanged) {
      setValidations({
        isValid: baseValidation,
        hasChangedFromOriginal: hasChanged,
      });
    }
  }, [
    links,
    initialValues,
    urlLinkNotRepeated,
    hasChangedFromOriginal,
    isValid,
  ]);

  return validations;
}
