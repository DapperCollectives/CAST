import React, { useEffect, useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { Editor } from "react-draft-wysiwyg";
import DatePicker from "react-datepicker";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import { StepByStep, WalletConnect, Error } from "../components";
import { useWebContext } from "../contexts/Web3";
import { useModalContext } from "../contexts/NotificationModal";
import { useProposal } from "../hooks";
import { ProposalStatus, VoteOptions } from "./Proposal";
import { Plus, Bin, Calendar, CaretDown } from "../components/Svg";
import { parseDateToServer } from "../utils";

const detectTimeZone = () =>
  new window.Intl.DateTimeFormat().resolvedOptions().timeZone;

const StepOne = ({ stepData, setStepValid, onDataChange }) => {
  useEffect(() => {
    const requiredFields = {
      title: (text) => text?.trim().length > 0,
      description: (body) => body?.getCurrentContent().hasText(),
      choices: (opts) => {
        const getLabel = (o) => o?.label?.trim();
        const moreThanOne = Array.isArray(opts) && opts.length > 1;

        const optLabels = (opts || []).map((opt) => getLabel(opt));

        const haveLabels =
          moreThanOne && optLabels.every((opt) => opt.length > 0);

        const eachUnique =
          moreThanOne &&
          optLabels.every((opt, idx) => optLabels.indexOf(opt) === idx);

        return haveLabels && eachUnique;
      },
    };
    const isValid = Object.keys(requiredFields).every(
      (field) => stepData && requiredFields[field](stepData[field])
    );
    setStepValid(isValid);
  }, [stepData, setStepValid, onDataChange]);

  const onEditorChange = (changes) => {
    onDataChange({ description: changes });
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

  const editorState = stepData?.description || EditorState.createEmpty();
  const choices = stepData?.choices || [];

  const onCreateChoice = () => {
    onDataChange({
      choices: choices.concat([
        {
          id: choices.length + 1,
          label: "",
        },
      ]),
    });
  };

  const onDestroyChoice = (choiceIdx) => {
    const newChoices = choices.slice(0);
    newChoices.splice(choiceIdx, 1);
    onDataChange({ choices: newChoices });
  };

  const onChoiceChange = (event, choiceIdx) => {
    const newChoices = choices.map((choice, idx) => {
      if (idx === choiceIdx) {
        return {
          ...choice,
          label: event.target.value,
        };
      }

      return choice;
    });

    onDataChange({ choices: newChoices });
  };

  return (
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
          details of what’s being voted on; background information for context;
          the expected costs and benefits of this collective decision.
        </p>
        <Editor
          toolbar={{ options, inline, list, link }}
          editorState={editorState}
          toolbarClassName="toolbarClassName"
          wrapperClassName="border-light rounded-sm"
          editorClassName="px-4"
          onEditorStateChange={onEditorChange}
        />
      </div>
      <div className="border-light rounded-lg columns is-flex-direction-column is-mobile m-0 p-6 mb-6">
        <h4 className="title is-5 mb-2">
          Choices <span className="has-text-danger">*</span>
        </h4>
        <p className="has-text-grey mb-4">
          Add each of the choices being voted on and distinguish each one
          clearly with a custom name.
        </p>
        {choices.map((choice, i) => (
          <div
            key={i}
            className="columns is-mobile p-0 m-0"
            style={{ position: "relative" }}
          >
            <input
              type="text"
              placeholder="Enter choice name"
              value={choice.label}
              className="border-light rounded-sm p-3 mb-4 column is-full"
              key={i}
              onChange={(event) => onChoiceChange(event, i)}
              autoFocus
            />
            <div
              className="cursor-pointer"
              style={{
                position: "absolute",
                right: 15,
                top: 7,
              }}
              onClick={() => onDestroyChoice(i)}
            >
              <Bin />
            </div>
          </div>
        ))}
        <div
          className="mt-2 cursor-pointer is-flex is-align-items-centered"
          onClick={onCreateChoice}
        >
          <Plus />{" "}
          <span className="ml-2">
            Add {`${choices?.length >= 1 ? "Another " : ""}`}Choice
          </span>
        </div>
      </div>
    </div>
  );
};

const StepTwo = ({ stepData, setStepValid, onDataChange }) => {
  const [isStartTimeOpen, setStartTimeOpen] = useState(false);
  const [isEndTimeOpen, setEndTimeOpen] = useState(false);

  useEffect(() => {
    const isDate = (d) => Object.prototype.toString.call(d) === "[object Date]";
    const requiredFields = {
      startDate: isDate,
      endDate: isDate,
      startTime: isDate,
      endTime: isDate,
    };
    const isValid = Object.keys(requiredFields).every(
      (field) => stepData && requiredFields[field](stepData[field])
    );
    setStepValid(isValid);
  }, [stepData, setStepValid, onDataChange]);

  const closeStartOnBlur = () => {
    setStartTimeOpen(false);
  };

  const closeEndOnBlur = () => {
    setEndTimeOpen(false);
  };

  const getTimeIntervals = (cutOffDate = 0) => {
    const timeIntervals = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 4; j++) {
        let time = new Date();
        time.setHours(i);
        time.setMinutes(j * 15);
        time.setSeconds(0);
        if (time.getTime() >= cutOffDate) {
          timeIntervals.push(time);
        }
      }
    }

    // push now if date is today and not already in time interval
    if (cutOffDate) {
      const nowDate = new Date();
      nowDate.setSeconds(0);
      const doesntExist = timeIntervals.every((ti) => ti !== nowDate);
      if (doesntExist) {
        timeIntervals.unshift(nowDate);
      }
    }

    return timeIntervals;
  };

  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return hours + ":" + minutes + " " + ampm;
  };

  const addDays = (date, days) => {
    date.setDate(date.getDate() + days);
    return date;
  };

  const timeZone = detectTimeZone();

  const isToday = (date) => {
    return date?.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0);
  };

  const startDateIsToday = isToday(stepData?.startDate);
  const timeIntervals = getTimeIntervals(startDateIsToday ? Date.now() : 0);

  return (
    <div>
      <div className="border-light rounded-lg is-flex-direction-column is-mobile m-0 p-6 mb-6">
        <h4 className="title is-5 mb-5">
          Start date and time <span className="has-text-danger">*</span>
        </h4>
        <div className="columns p-0 m-0">
          <div
            className="columns is-mobile p-0 pr-2 p-0-mobile mb-4-mobile m-0 column is-half"
            style={{ position: "relative" }}
          >
            <DatePicker
              required
              placeholderText="Choose date"
              selected={stepData?.startDate}
              minDate={new Date()}
              onChange={(date) => {
                onDataChange({
                  startDate: date,
                  // resets time in case user has selected a future date and comes back to present with a non valid hour
                  startTime: isToday(date) ? null : stepData?.startTime,
                });
              }}
              className="border-light rounded-sm column is-full is-full-mobile p-3"
            />
            <div
              style={{
                position: "absolute",
                right: 15,
                top: 7,
                pointerEvents: "none",
              }}
            >
              <Calendar />
            </div>
          </div>
          <div className="columns is-mobile p-0 pl-2 p-0-mobile m-0 column is-half">
            <div
              className={`dropdown columns is-mobile p-0 m-0 is-right is-flex is-flex-grow-1${
                isStartTimeOpen ? " is-active" : ""
              } ${stepData?.startDate ? "" : " is-disabled"}`}
              onBlur={closeStartOnBlur}
              aria-haspopup="true"
              aria-controls="dropdown-menu"
            >
              <div className="dropdown-trigger columns m-0 is-flex-grow-1">
                <button
                  className="button rounded-sm is-outlined border-light column m-0 py-0 px-3 is-full-mobile"
                  aria-haspopup="true"
                  aria-controls="dropdown-menu"
                  onClick={() => setStartTimeOpen(true)}
                >
                  <div className="is-flex is-flex-grow-1 is-align-items-center is-justify-content-space-between has-text-grey small-text">
                    {stepData?.startTime
                      ? formatTime(stepData.startTime)
                      : "Select Time"}
                    <CaretDown className="has-text-black" />
                  </div>
                </button>
              </div>
              <div
                className="dropdown-menu column p-0 is-full"
                id="dropdown-menu"
                role="menu"
              >
                <div
                  className="dropdown-content"
                  style={{ maxHeight: 300, overflow: "auto" }}
                >
                  {timeIntervals.map((itemValue, index) => (
                    <button
                      className={`button is-white dropdown-item has-text-grey${
                        itemValue === stepData?.startTime ? " is-active" : ""
                      }`}
                      onMouseDown={() =>
                        onDataChange({
                          startTime: itemValue,
                        })
                      }
                      key={`drop-down-${index}`}
                    >
                      {formatTime(itemValue)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-light rounded-lg columns is-flex-direction-column is-mobile m-0 p-6 mb-6">
        <h4 className="title is-5 mb-5">
          End date and time <span className="has-text-danger">*</span>
        </h4>
        <div className="columns p-0 m-0">
          <div
            className="columns is-mobile p-0 pr-2 p-0-mobile mb-4-mobile m-0 column is-half"
            style={{ position: "relative" }}
          >
            <DatePicker
              required
              placeholderText="Choose date"
              selected={stepData?.endDate}
              minDate={addDays(new Date(stepData?.startDate), 1)}
              disabled={
                !Boolean(stepData?.startDate) || !Boolean(stepData?.startTime)
              }
              onChange={(date) => {
                onDataChange({ endDate: date });
              }}
              className="border-light rounded-sm column is-full is-full-mobile p-3"
            />
            <div
              style={{
                position: "absolute",
                right: 15,
                top: 7,
                pointerEvents: "none",
              }}
            >
              <Calendar />
            </div>
          </div>
          <div className="columns is-mobile p-0 pl-2 p-0-mobile m-0 column is-half">
            <div
              className={`dropdown columns is-mobile p-0 m-0 is-right is-flex is-flex-grow-1${
                isEndTimeOpen ? " is-active" : ""
              } ${stepData?.endDate ? "" : "is-disabled"}`}
              onBlur={closeEndOnBlur}
              aria-haspopup="true"
              aria-controls="dropdown-menu"
            >
              <div className="dropdown-trigger columns m-0 is-flex-grow-1">
                <button
                  className="button rounded-sm is-outlined border-light column m-0 py-0 px-3 is-full-mobile"
                  aria-haspopup="true"
                  aria-controls="dropdown-menu"
                  onClick={() => setEndTimeOpen(true)}
                >
                  <div className="is-flex is-flex-grow-1 is-align-items-center is-justify-content-space-between has-text-grey small-text">
                    {stepData?.endTime
                      ? formatTime(stepData.endTime)
                      : "Select Time"}
                    <CaretDown className="has-text-black" />
                  </div>
                </button>
              </div>
              <div
                className="dropdown-menu column p-0 is-full"
                id="dropdown-menu"
                role="menu"
              >
                <div
                  className="dropdown-content"
                  style={{ maxHeight: 300, overflow: "auto" }}
                >
                  {getTimeIntervals().map((itemValue, index) => (
                    <button
                      className={`button is-white dropdown-item has-text-grey${
                        itemValue === stepData?.endTime ? " is-active" : ""
                      }`}
                      onMouseDown={() =>
                        onDataChange({
                          endTime: itemValue,
                        })
                      }
                      key={`drop-down-${index}`}
                    >
                      {formatTime(itemValue)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {timeZone && (
        <div className="has-text-grey mt-6">
          <span alt="globe with meridians">🌐</span> We've detected your time
          zone as: {timeZone}
        </div>
      )}
    </div>
  );
};

const StepThree = ({ stepsData, setStepValid }) => {
  const setPreviewValid = useCallback(() => {
    setStepValid(true);
  }, [setStepValid]);

  useEffect(() => {
    setPreviewValid();
  }, [setPreviewValid]);

  const proposal = {
    endTime: parseDateToServer(stepsData[1].endDate, stepsData[1].endTime),
    startTime: parseDateToServer(
      stepsData[1].startDate,
      stepsData[1].startTime
    ),
    winCount: 0,
    choices: stepsData[0]?.choices?.map((choice) => ({
      ...choice,
      value: choice.label,
    })),
  };

  const rawContentState = convertToRaw(
    stepsData[0]?.description?.getCurrentContent()
  );

  const markup = draftToHtml(rawContentState);

  const htmlBody = markup
    .replace(/target="_self"/g, 'target="_blank" rel="noopener noreferrer"')
    .replace(/(?:\r\n|\r|\n)/g, "<br>");

  return (
    <div>
      <ProposalStatus proposal={proposal} />
      <h1 className="title mt-5 is-3">{stepsData[0]?.title}</h1>
      <div
        className="mt-6 mb-5 proposal-copy"
        dangerouslySetInnerHTML={{
          __html: htmlBody,
        }}
      />
      <VoteOptions proposal={proposal} readOnly />
    </div>
  );
};

export default function ProposalCreate() {
  const { createProposal, data, loading } = useProposal();
  const [proposalError, setProposalError] = useState(null);
  const {
    user: { addr: creatorAddr },
    injectedProvider,
  } = useWebContext();
  const history = useHistory();

  const modalContext = useModalContext();

  useEffect(() => {
    if (data?.id) {
      history.push(`/proposal/${data.id}`);
    }
  }, [data, history]);

  useEffect(() => {
    if (modalContext.isOpen && creatorAddr && !proposalError) {
      modalContext.closeModal();
    }
  }, [modalContext, creatorAddr, proposalError]);

  const onSubmit = async (stepsData) => {
    if (!creatorAddr) {
      modalContext.openModal(
        React.createElement(Error, {
          error: (
            <div className="mt-5">
              <WalletConnect />
            </div>
          ),
          errorTitle: "Please connect a wallet to create a proposal.",
        })
      );
      return;
    }

    const name = stepsData[0].title;

    const rawContentState = convertToRaw(
      stepsData[0]?.description?.getCurrentContent()
    );
    const body = draftToHtml(rawContentState)
      .replace(/target="_self"/g, 'target="_blank" rel="noopener noreferrer"')
      .replace(/(?:\r\n|\r|\n)/g, "<br>");

    const startTime = parseDateToServer(
      stepsData[1].startDate,
      stepsData[1].startTime
    ).toISOString();

    const endTime = parseDateToServer(
      stepsData[1].endDate,
      stepsData[1].endTime
    ).toISOString();

    const choices = stepsData[0].choices.map((c) => c.label);

    const proposalData = {
      name,
      body,
      choices,
      creatorAddr,
      endTime,
      startTime,
      strategy: "token-weighted-default",
      status: "published",
    };

    const response = await createProposal(injectedProvider, proposalData);
    if (response.error) {
      setProposalError(response.error);
      modalContext.openModal(
        React.createElement(Error, {
          error: (
            <p className="has-text-red">
              <b>{response.error}</b>
            </p>
          ),
          errorTitle: "Something went wrong with your proposal.",
        })
      );
    }
  };

  const props = {
    finalLabel: "Publish",
    onSubmit,
    creatingProposal: loading,
    steps: [
      {
        label: "Draft Proposal",
        description:
          "Some description of what you can write here that is useful.",
        component: <StepOne />,
      },
      {
        label: "Set Date & Time",
        description:
          "Some description of what you can write here that is useful.",
        component: <StepTwo stepData={{ test: "ok" }} />,
      },
      {
        label: "Preview Proposal",
        description:
          "Some description of what you can write here that is useful.",
        component: <StepThree stepData={{ test: "ok" }} />,
      },
    ],
  };

  return <StepByStep {...props} />;
}
