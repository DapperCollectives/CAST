import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, AtomicBlockUtils } from "draft-js";
import { useVotingStrategies } from "hooks";
import { useModalContext } from "contexts/NotificationModal";
import { Dropdown, Error } from "components";
import TextBasedChoices from "./TextBasedChoices";
import ImageChoices from "./ImageChoices";
import { Image } from "components/Svg";

function AddImageOption({ addImage }) {
  return (
    <>
      <div
        className="rdw-image-wrapper"
        aria-haspopup="true"
        aria-label="rdw-image-control"
        aria-expanded="false"
        onClick={() => addImage()}
      >
        <div className="rdw-option-wrapper" title="Image">
          <Image />
        </div>
      </div>
    </>
  );
}

const StepOne = ({
  stepData,
  setStepValid,
  onDataChange,
  setPreCheckStepAdvance,
}) => {
  const dropDownRef = useRef();
  const { data: votingStrategies, loading: loadingStrategies } =
    useVotingStrategies();

  const { openModal, closeModal } = useModalContext();

  const tabOption = useMemo(
    () => stepData?.proposalType || "text-based",
    [stepData?.proposalType]
  );
  const [localEditorState, setLocalEditorState] = useState(
    stepData?.description || EditorState.createEmpty()
  );

  const [showUploadImagesModal, setShowUploadImagesModal] = useState(false);

  useEffect(() => {
    const requiredFields = {
      title: (text) => text?.trim().length > 0,
      description: (body) => body?.getCurrentContent().hasText(),
      choices: (opts) => {
        const getLabel = (o) => o?.value?.trim();
        const getImageUrl = (o) => o?.choiceImgUrl?.trim();
        const moreThanOne = Array.isArray(opts) && opts.length > 1;

        const optLabels = (opts || []).map((opt) => getLabel(opt));

        const haveLabels =
          moreThanOne && optLabels.every((opt) => opt.length > 0);

        const eachUnique =
          moreThanOne &&
          optLabels.every((opt, idx) => optLabels.indexOf(opt) === idx);

        if (tabOption === "text-based") return haveLabels && eachUnique;

        const imagesUrl = (opts || []).map((opt) => getImageUrl(opt));

        const validImageOpts = imagesUrl.every(
          (imgUrl) => imgUrl && imgUrl.length > 0
        );

        return haveLabels && eachUnique && validImageOpts;
      },
    };
    const isValid = Object.keys(requiredFields).every(
      (field) => stepData && requiredFields[field](stepData[field])
    );
    setStepValid(isValid);
  }, [stepData, setStepValid, onDataChange, tabOption]);

  useEffect(() => {
    onDataChange({ description: localEditorState });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localEditorState]);

  const setTab = (option) => () => {
    onDataChange({
      proposalType: option,
    });
  };

  const onEditorChange = (changes) => {
    setLocalEditorState(changes);
  };

  const options = ["blockType", "inline", "list", "link", "emoji"];
  const inline = {
    options: ["bold", "italic", "underline"],
  };
  const list = {
    options: ["unordered"],
  };
  const link = {
    options: ["link"],
    defaultTargetOption: "_blank",
  };

  const { strategy } = stepData ?? {};

  useEffect(() => {
    setPreCheckStepAdvance(() => {
      if (!strategy) {
        openModal(
          React.createElement(Error, {
            error: (
              <div className="mt-5">
                <button
                  className="button"
                  onClick={() => {
                    closeModal();
                    dropDownRef.current.focus();
                  }}
                >
                  Select Strategy
                </button>
              </div>
            ),
            errorTitle: "Please select a strategy",
          }),
          { classNameModalContent: "rounded-sm" }
        );
        return false;
      }
      return true;
    });
  }, [strategy, setPreCheckStepAdvance, openModal, closeModal]);

  const choices = useMemo(() => stepData?.choices || [], [stepData?.choices]);

  const onCreateChoice = useCallback(() => {
    onDataChange({
      choices: choices.concat([
        {
          id: choices.length + 1,
          value: "",
        },
      ]),
    });
  }, [onDataChange, choices]);

  const onDestroyChoice = useCallback(
    (choiceIdx) => {
      const newChoices = choices.slice(0);
      newChoices.splice(choiceIdx, 1);
      onDataChange({ choices: newChoices });
    },
    [choices, onDataChange]
  );

  const onChoiceChange = useCallback(
    (choiceUpdate, choiceIdx) => {
      const newChoices = choices.map((choice, idx) => {
        if (idx === choiceIdx) {
          return {
            ...choice,
            ...choiceUpdate,
          };
        }

        return choice;
      });

      onDataChange({ choices: newChoices });
    },
    [choices, onDataChange]
  );

  const initChoices = useCallback(
    (choices) => {
      onDataChange({
        choices,
      });
    },
    [onDataChange]
  );

  const onSelectStrategy = (strategy) => {
    const strategySelected = votingStrategies?.find(
      (vs) => vs.key === strategy
    );
    onDataChange({
      strategy: { label: strategySelected.name, value: strategySelected.key },
    });
  };

  const addImage = () => {
    setShowUploadImagesModal(true);
  };
  const onDismissModal = () => {
    setShowUploadImagesModal(false);
  };

  // function to update editor state
  // used to insert more than one image at the time
  function updateEditorState(editorState, { src, height, width, alt }) {
    const entityKey = editorState
      .getCurrentContent()
      .createEntity("IMAGE", "MUTABLE", {
        src,
        height,
        width,
        alt,
      })
      .getLastCreatedEntityKey();
    // new Editor State
    const newEditorState = AtomicBlockUtils.insertAtomicBlock(
      editorState,
      entityKey,
      " "
    );
    return newEditorState;
  }

  const addImagesToEditor = (images, captionValue) => {
    let tempEditorState = localEditorState;

    for (let index = 0; index < images.length; index++) {
      const image = images[index];
      tempEditorState = updateEditorState(tempEditorState, {
        src: image.imageUrl,
        height: "auto",
        width: "auto",
        alt: captionValue,
      });
    }
    setLocalEditorState(tempEditorState);
    setShowUploadImagesModal(false);
  };

  const defaultValueStrategy = stepData?.strategy;

  return (
    <>
      {showUploadImagesModal && (
        <UploadImageModal
          onDismiss={onDismissModal}
          onDone={addImagesToEditor}
        />
      )}
      <div className="is-flex-direction-column">
        <div className="border-light rounded-lg columns is-flex-direction-column is-mobile m-0 p-6 mb-6">
          <h4 className="title is-5 mb-2">
            Title <span className="has-text-danger">*</span>
          </h4>
          <p className="has-text-grey mb-4">
            Give your proposal a title based on the decision or initiative being
            voted on. Best to keep it simple and specific.
          </p>
          <input
            type="text"
            className="rounded-sm border-light p-3 column is-full"
            value={stepData?.title || ""}
            maxLength={128}
            onChange={(event) =>
              onDataChange({
                title: event.target.value,
              })
            }
          />
        </div>
        <div className="border-light rounded-lg columns is-flex-direction-column is-mobile m-0 p-6 mb-6">
          <h4 className="title is-5 mb-2">
            Description <span className="has-text-danger">*</span>
          </h4>
          <p className="has-text-grey mb-4">
            This is where you build the key information for the proposal: the
            details of what’s being voted on; background information for
            context; the expected costs and benefits of this collective
            decision.
          </p>
          <Editor
            toolbar={{ options, inline, list, link }}
            editorState={localEditorState}
            toolbarClassName="toolbarClassName"
            wrapperClassName="border-light rounded-sm word-break-all"
            editorClassName="px-4"
            onEditorStateChange={onEditorChange}
            toolbarCustomButtons={[<AddImageOption addImage={addImage} />]}
          />
        </div>
        <div className="border-light rounded-lg columns is-flex-direction-column is-mobile m-0 p-6 mb-6">
          <h4 className="title is-5 mb-2">Voting Strategy</h4>
          <p className="has-text-grey mb-5">
            Select a strategy for how voting power is calculated.
          </p>
          <Dropdown
            defaultValue={defaultValueStrategy}
            label="Select from drop-down menu"
            values={
              votingStrategies?.map((vs) => ({
                label: vs.name,
                value: vs.key,
              })) ?? []
            }
            disabled={loadingStrategies}
            onSelectValue={onSelectStrategy}
            ref={dropDownRef}
          />
        </div>
        <div className="border-light rounded-lg columns is-flex-direction-column is-mobile m-0 p-6 mb-6">
          <h4 className="title is-5 mb-2">
            Choices <span className="has-text-danger">*</span>
          </h4>
          <p className="has-text-grey mb-4">
            Provide the specific options you’d like to cast votes for. Use
            Text-based presentation for choices that described in words. Use
            Visual for side-by-side visual options represented by images.
          </p>
          <div className="tabs choice-option is-toggle mt-2 mb-4">
            <ul>
              <li>
                <button
                  className={`button left ${
                    tabOption === "text-based" ? "is-black" : "outlined"
                  }`}
                  onClick={setTab("text-based")}
                >
                  <span>Text-based</span>
                </button>
              </li>
              <li>
                <button
                  className={`button right ${
                    tabOption === "visual" ? "is-black" : "outlined"
                  }`}
                  onClick={setTab("visual")}
                >
                  <span>Visual</span>
                </button>
              </li>
            </ul>
          </div>
          {tabOption === "text-based" && (
            <TextBasedChoices
              choices={choices}
              onChoiceChange={onChoiceChange}
              onDestroyChoice={onDestroyChoice}
              onCreateChoice={onCreateChoice}
              initChoices={initChoices}
            />
          )}
          {tabOption === "visual" && (
            <ImageChoices
              choices={choices}
              onChoiceChange={onChoiceChange}
              initChoices={initChoices}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default StepOne;
