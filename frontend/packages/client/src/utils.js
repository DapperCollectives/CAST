import { customAlphabet } from "nanoid";
import { stateToHTML } from "draft-js-export-html";

const nanoid = customAlphabet("1234567890abcdef", 10);

export const generateSlug = nanoid;

export const parseDateFromServer = (endTime) => {
  const dateTime = new Date(endTime);
  const diffFromNow = dateTime.getTime() - Date.now();
  const diffDays = Math.ceil(Math.abs(diffFromNow) / (1000 * 60 * 60 * 24));
  return {
    date: dateTime,
    diffFromNow,
    diffDays,
  };
};

// returns date & time in one object
export const parseDateToServer = (date, time) => {
  const day = new Date(date);
  const hours = new Date(time);
  day.setHours(hours.getHours());
  day.setMinutes(hours.getMinutes());
  return day;
};

export const checkResponse = async (response) => {
  // The Promise returned from fetch() won't reject on HTTP error status even if the response is an HTTP 404 or 500.
  // Instead, as soon as the server responds with headers, the Promise will resolve normally
  // (with the ok property of the response set to false if the response isn't in the range 200–299),
  // and it will only reject on network failure or if anything prevented the request from completing.
  if (!response.ok) {
    const { status, statusText, url } = response;
    const { error } = response.json ? await response.json() : {};
    throw new Error(
      JSON.stringify({ status, statusText: error || statusText, url })
    );
  }
  return response.json();
};

export const isNotEmptyArray = (array) =>
  Array.isArray(array) && array.length > 0;

// for some reason, in emulator fcl this signature is nested two levels
// deep but on testnet fcl this is only nested one level deep
export const getSig = (sigArr) =>
  sigArr[0]?.signature?.signature ?? sigArr[0]?.signature;

export const getCompositeSigs = (sigArr) => {
  if (sigArr[0]?.signature?.signature) {
    return [sigArr[0].signature];
  }

  if (
    typeof sigArr === "string" &&
    sigArr.includes("Declined: No reason supplied")
  ) {
    return null;
  }
  return sigArr;
};

export function getReducedImg(image, newImageWidth = 150, fileName) {
  const canvas = document.createElement("canvas");
  // if image is bigger then scale
  const scale =
    image.width > newImageWidth ? (newImageWidth / image.width).toFixed(2) : 1;

  canvas.width = image.width * scale;
  canvas.height = image.height * scale;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.drawImage(
      image,
      0,
      0,
      image.width,
      image.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blobImage) => {
        if (blobImage) {
          const blobImageNoType = blobImage;
          //A Blob() is almost a File() - it's just missing the two properties below
          blobImageNoType.lastModifiedDate = new Date();
          blobImageNoType.name = fileName;
          const blobAsFile = blobImageNoType;
          return resolve({ imageFile: blobAsFile });
        }
        reject({ error: "Error while using blob" });
      },
      "image/jpeg",
      1
    );
  });
}

export const getProposalType = (choices) => {
  if (
    choices.length === 2 &&
    choices.every((choice) => choice.choiceImgUrl !== undefined)
  ) {
    return "image";
  }
  return "text-based";
};

export const customDraftToHTML = (content) => {
  const options = {
    blockRenderers: {
      "image-caption-block": (block) => {
        return (
          "<p style='font-size: 12px; color: #757575;' class='image-caption'>" +
          block.getText() +
          "</p>"
        );
      },
    },
    entityStyleFn: (entity) => {
      const entityType = entity.get("type").toLowerCase();
      if (entityType === "link") {
        const data = entity.getData();
        return {
          element: "a",
          attributes: {
            href: data.url,
            target: "_blank",
            rel: "noopener noreferrer",
          },
        };
      }
    },
  };
  return stateToHTML(content, options);
};
