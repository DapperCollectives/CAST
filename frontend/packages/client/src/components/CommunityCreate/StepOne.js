import React, { useEffect, useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "components/Svg";
import { WrapperResponsive, Dropdown } from "components";
import { CommunityLinksForm } from "components/Community/CommunityEditorLinks";
import useLinkValidator from "../Community/hooks/useLinkValidator";
import { getReducedImg } from "utils";
import { useErrorHandlerContext } from "contexts/ErrorHandler";
import { MAX_FILE_SIZE } from "const";
import { pick } from "lodash";

const linksFields = [
  "websiteUrl",
  "twitterUrl",
  "instagramUrl",
  "discordUrl",
  "githubUrl",
];

const initialValues = Object.assign(
  {},
  ...linksFields.map((key) => ({ [key]: "" }))
);
export default function StepOne({
  stepData,
  setStepValid,
  onDataChange,
  moveToNextStep,
  isStepValid,
}) {
  const { notifyError } = useErrorHandlerContext();

  const setData = (data) => {
    onDataChange(data);
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      acceptedFiles.forEach((imageFile) => {
        // validate type
        if (
          !["image/png", "image/jpeg", "image/jpg"].includes(imageFile.type)
        ) {
          notifyError({
            status: "Image Type not supported",
            statusText: "Please upload a .png or .jpeg file type extension",
          });
          return;
        }
        // validate size
        if (imageFile.size > MAX_FILE_SIZE) {
          notifyError({
            status: "Image file size not allowed",
            statusText: "Please upload a new file (smaller than 5mb)",
          });
          return;
        }
        const imageAsURL = URL.createObjectURL(imageFile);

        const img = new Image();
        img.onload = function (e) {
          // reduce image if necessary before upload
          if (e.target.width > 150) {
            getReducedImg(e.target, 150, "community_image").then((result) => {
              onDataChange({
                logo: { imageUrl: imageAsURL, file: result.imageFile },
              });
            });
          } else {
            onDataChange({ logo: { imageUrl: imageAsURL, file: imageFile } });
          }
        };
        img.src = imageAsURL;
      });
    },
    [onDataChange, notifyError]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: "image/jpeg,image/png",
  });

  const { communityName, communityDescription, logo, communityTerms } =
    stepData || {};

  // handle links form
  const linksFieldsObj = Object.assign(
    {},
    initialValues,
    pick(stepData || {}, linksFields)
  );

  const changeHandlers = useMemo(
    () =>
      Object.assign(
        {},
        ...linksFields.map((field) => ({
          [field]: (value) =>
            onDataChange({
              [field]: value,
            }),
        }))
      ),
    [onDataChange]
  );

  const { isValid: isCommunityLinksValid } = useLinkValidator({
    links: linksFieldsObj,
  });

  useEffect(() => {
    const requiredFields = {
      communityName: (name) => name?.trim().length > 0,
      communityDescription: (desc) => desc?.trim().length > 0,
      logo: (logo) => logo?.file && logo?.imageUrl,
    };
    const isValid = Object.keys(requiredFields).every(
      (field) => stepData && requiredFields[field](stepData[field])
    );
    setStepValid(isValid && isCommunityLinksValid);
  }, [stepData, setStepValid, onDataChange, isCommunityLinksValid]);

  return (
    <>
      <WrapperResponsive
        classNames="border-light rounded-lg columns is-flex-direction-column is-mobile m-0"
        extraClasses="p-6 mb-5"
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
                Community Profile
              </WrapperResponsive>
            </div>
            <div className="is-flex flex-1 mt-5">
              <p className="has-text-grey small-text">
                These details are publicly visible and will help people know
                what your community is all about.
              </p>
            </div>
          </div>
          <div className="column is-narrow">
            <div
              className={`is-flex is-flex-direction-column is-align-items-center is-justify-content-center ${
                !logo ? "cursor-pointer" : ""
              }`}
              style={{
                borderRadius: "50px",
                border: "1px dashed #757575",
                height: "90px",
                width: "90px",
                overflow: "hidden",
                position: "relative",
              }}
              {...getRootProps()}
            >
              {!logo && (
                <>
                  <Upload />
                  <span className="smaller-text">Avatar</span>
                  <input {...getInputProps()} />
                </>
              )}
              {logo && (
                <div
                  className="is-flex flex-1 is-flex-direction-column is-align-items-center is-justify-content-center"
                  style={{
                    backgroundImage: `url(${logo.imageUrl})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    width: "100%",
                    opacity: 0.5,
                  }}
                />
              )}
              {logo?.file ? (
                <div
                  className="is-flex is-flex-direction-column is-align-items-center is-justify-content-center"
                  style={{
                    borderRadius: "50px",
                    height: "40px",
                    width: "40px",
                    position: "absolute",
                    backgroundColor: "#4a4a4a",
                  }}
                >
                  <Upload className="has-text-white" />
                  <input {...getInputProps()} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <input
          type="text"
          placeholder="Community Name"
          name="community_name"
          className="rounded-sm border-light p-3 column is-full mt-2"
          value={communityName || ""}
          onChange={(event) => setData({ communityName: event.target.value })}
        />
        <textarea
          className="text-area rounded-sm border-light p-3 column is-full mt-4"
          type="text"
          placeholder="About (short description)"
          value={communityDescription || ""}
          name="community_details"
          rows="3"
          cols="30"
          onChange={(event) =>
            setData({
              communityDescription: event.target.value,
            })
          }
        />
        <Dropdown
          margin="mt-4"
          label="Category"
          values={[
            { label: "Category One", value: "category_one" },
            { label: "Category Two", value: "category_two" },
          ]}
          onSelectValue={(value) => setData({ category: value })}
        />
        <input
          type="text"
          placeholder="Terms  (e.g. https://example.com/terms)"
          name="terms"
          className="rounded-sm border-light p-3 column is-full mt-4"
          value={communityTerms || ""}
          onChange={(event) => setData({ communityTerms: event.target.value })}
        />
      </WrapperResponsive>
      <CommunityLinksForm
        onChangeHandlers={changeHandlers}
        fields={linksFieldsObj}
        wrapperMargin="mb-4"
        wrapperMarginMobile="mb-3"
      />

      <div className="columns mb-5">
        <div className="column is-12">
          <button
            style={{ height: 48, width: "100%" }}
            className={`button vote-button transition-all is-flex has-background-yellow rounded-sm is-size-6 is-uppercase is-${
              isStepValid ? "enabled" : "disabled"
            }`}
            onClick={isStepValid ? () => moveToNextStep() : () => {}}
          >
            Next: COMMUNITY DETAILS
          </button>
        </div>
      </div>
    </>
  );
}
