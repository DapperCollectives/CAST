import React, { useEffect, useState, useCallback } from "react";
import { Website, Instagram, Twitter, Discord, Github } from "components/Svg";
import { WrapperResponsive, Loader } from "components";

export default function CommunityEditorLinks(props = {}) {
  const {
    websiteUrl = "",
    twitterUrl = "",
    instagramUrl = "",
    discordUrl = "",
    githubUrl = "",
    updateCommunity,
  } = props;
  const [enableSave, setEnableSave] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [links, setLinks] = useState({
    websiteUrl,
    twitterUrl,
    instagramUrl,
    discordUrl,
    githubUrl,
  });

  const saveData = async () => {
    setIsUpdating(true);
    const updatedKeys = Object.keys(links).filter(
      (key) => links[key] !== (props[key] ?? "")
    );

    const updatedFields = Object.assign(
      {},
      ...updatedKeys.map((key) => ({ [key]: links[key] }))
    );
    await updateCommunity(updatedFields);
    setIsUpdating(false);
  };

  const urlPatternValidation = (url) => {
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

  const urlLinkNotRepeated = useCallback(() => {
    const values = Object.values(links).filter((link) => link !== "");

    const valuesSet = new Set(values);

    if (valuesSet.size === values.length) {
      return true;
    }
    return false;
  }, [links]);

  useEffect(() => {
    if (
      Object.keys(links).some((key) => links[key] !== (props[key] ?? "")) &&
      urlPatternValidation(links["websiteUrl"]) &&
      twitterValidator(links["twitterUrl"]) &&
      instagramValidator(links["instagramUrl"]) &&
      discordValidator(links["discordUrl"]) &&
      githubValidator(links["githubUrl"]) &&
      urlLinkNotRepeated()
    ) {
      setEnableSave(true);
    } else {
      setEnableSave(false);
    }
  }, [links, props, urlLinkNotRepeated]);

  return (
    <WrapperResponsive
      classNames="border-light rounded-lg columns is-flex-direction-column is-mobile m-0"
      extraClasses="p-6 mb-6"
      extraClassesMobile="p-4 mb-4"
    >
      <div className="columns flex-1">
        <div className="column">
          <div className="is-flex flex-1">
            <WrapperResponsive
              tag="h5"
              classNames="title is-6 mb-2"
              extraClassesMobile="mt-4"
            >
              Community Links
            </WrapperResponsive>
          </div>
          <div className="is-flex flex-1 mt-5">
            <p className="has-text-grey small-text">
              Let’s fill out your Community profile. These details will be
              publicly available and will help people know what your community
              is all about.
            </p>
          </div>
        </div>
      </div>
      <div
        style={{ position: "relative" }}
        className="is-flex is-align-items-center mt-2"
      >
        <input
          type="text"
          name="web"
          className="rounded-sm border-light py-3 pr-3  column is-full"
          value={links?.websiteUrl}
          maxLength={200}
          onChange={(event) =>
            setLinks((state) => ({ ...state, websiteUrl: event.target.value }))
          }
          style={{
            paddingLeft: "34px",
          }}
          disabled={isUpdating}
        />
        <div
          className="pl-3"
          style={{
            position: "absolute",
            height: 18,
            opacity: 0.3,
          }}
        >
          <Website width="16px" height="16px" />
        </div>
      </div>
      <div
        style={{ position: "relative" }}
        className="is-flex is-align-items-center mt-2"
      >
        <input
          type="text"
          name="twitter"
          className="rounded-sm border-light py-3 pr-3  column is-full"
          value={links?.twitterUrl}
          maxLength={200}
          onChange={(event) =>
            setLinks((state) => ({ ...state, twitterUrl: event.target.value }))
          }
          style={{
            paddingLeft: "34px",
          }}
          disabled={isUpdating}
        />
        <div
          className="pl-3"
          style={{
            position: "absolute",
            height: 18,
            opacity: 0.3,
          }}
        >
          <Twitter width="16px" height="16px" />
        </div>
      </div>
      <div
        style={{ position: "relative" }}
        className="is-flex is-align-items-center mt-2"
      >
        <input
          type="text"
          name="github"
          className="rounded-sm border-light py-3 pr-3 column is-full"
          value={links?.githubUrl}
          maxLength={200}
          onChange={(event) =>
            setLinks((state) => ({ ...state, githubUrl: event.target.value }))
          }
          style={{
            paddingLeft: "34px",
          }}
          disabled={isUpdating}
        />
        <div
          className="pl-3"
          style={{
            position: "absolute",
            height: 18,
            opacity: 0.3,
          }}
        >
          <Github width="16px" height="16px" />
        </div>
      </div>
      <div
        style={{ position: "relative" }}
        className="is-flex is-align-items-center mt-2"
      >
        <input
          type="text"
          name="discord"
          className="rounded-sm border-light py-3 pr-3  column is-full"
          value={links?.discordUrl}
          maxLength={200}
          onChange={(event) =>
            setLinks((state) => ({ ...state, discordUrl: event.target.value }))
          }
          style={{
            paddingLeft: "34px",
          }}
          disabled={isUpdating}
        />
        <div
          className="pl-3"
          style={{
            position: "absolute",
            height: 18,
            opacity: 0.3,
          }}
        >
          <Discord width="16px" height="16px" />
        </div>
      </div>
      <div
        style={{ position: "relative" }}
        className="is-flex is-align-items-center mt-2"
      >
        <input
          type="text"
          name="instagram"
          className="rounded-sm border-light py-3 pr-3 column is-full "
          value={links?.instagramUrl}
          maxLength={200}
          onChange={(event) =>
            setLinks((state) => ({
              ...state,
              instagramUrl: event.target.value,
            }))
          }
          style={{
            paddingLeft: "34px",
          }}
          disabled={isUpdating}
        />
        <div
          className="pl-3"
          style={{
            position: "absolute",
            height: 18,
            opacity: 0.3,
          }}
        >
          <Instagram width="16px" height="16px" />
        </div>
      </div>
      <button
        style={{ height: 48, width: "100%" }}
        className={`button vote-button transition-all is-flex has-background-yellow rounded-sm mt-5 is-${
          enableSave && !isUpdating ? "enabled" : "disabled"
        }`}
        onClick={!enableSave ? () => {} : saveData}
      >
        {!isUpdating && <>Save</>}
        {isUpdating && <Loader size={18} spacing="mx-button-loader" />}
      </button>
    </WrapperResponsive>
  );
}
