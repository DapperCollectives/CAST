import { useState, useEffect, useCallback } from "react";

export const urlPatternValidation = (url) => {
  const regex = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  );
  return url === "" || !!regex.test(url);
};
const twitterValidator = (url) => {
  const regex = new RegExp(
    "^(?:https://)?(?:www\\.)?twitter\\.com/(\\w+)",
    "i"
  );
  return url === "" || !!regex.test(url);
};
const instagramValidator = (url) => {
  return (
    url === "" ||
    /(?:(?:http|https):\/\/)?(?:www.)?(?:instagram.com|instagr.am|instagr.com)\/(\w+)/gim.test(
      url
    )
  );
};
const discordValidator = (url) => {
  return (
    url === "" ||
    /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|com)|discordapp\.com\/invite)\/.+[a-z]/gim.test(
      url
    )
  );
};
const githubValidator = (url) => {
  return url === "" || /https?:\/\/github\.com\/(?:[^/\s]+)/gim.test(url);
};

export default function useLinkValidator({ links, initialValues }) {
  const [isValid, setIsValid] = useState(false);
  const urlLinkNotRepeated = useCallback(() => {
    const values = Object.values(links).filter((link) => link !== "");

    const valuesSet = new Set(values);

    if (valuesSet.size === values.length) {
      return true;
    }
    return false;
  }, [links]);

  useEffect(() => {
    const commonValidation =
      urlPatternValidation(links["websiteUrl"]) &&
      twitterValidator(links["twitterUrl"]) &&
      instagramValidator(links["instagramUrl"]) &&
      discordValidator(links["discordUrl"]) &&
      githubValidator(links["githubUrl"]) &&
      urlLinkNotRepeated();

    if (
      initialValues &&
      Object.keys(links).some(
        (key) => links[key] !== (initialValues[key] ?? "")
      ) &&
      commonValidation
    ) {
      setIsValid(true);
    } else if (commonValidation) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [links, initialValues, urlLinkNotRepeated]);

  return { isValid };
}
