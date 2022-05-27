import React from "react";
import { stripHtml } from "string-strip-html";

const ProposalCardBody = ({ name, body, cardWidth, inlineImage }) => {
  const cardPaddingOnly = 48;
  const aLittleExtra = 2;
  const noImageDefault = cardPaddingOnly + aLittleExtra;
  const imageBoxWidth = 190;
  const imageSpacing = 10;
  const inlineImageDefault = noImageDefault + imageBoxWidth + imageSpacing;

  let maxWidth = 0;
  if (!cardWidth) {
    // default so initial result is 0 until actual width is known
    maxWidth = inlineImage ? inlineImageDefault : noImageDefault;
  } else {
    maxWidth = cardWidth;
  }
  if (inlineImage) {
    maxWidth -= inlineImageDefault;
  } else {
    maxWidth -= noImageDefault;
  }

  return (
    <div className="proposal-body-spacing mr-0 pt-1">
      <div className="pr-0 pb-0 proposal-body-text">
        <h4 className="proposal-title is-4 mt-1 mb-4 has-text-black has-text-weight-bold">
          {name}
        </h4>
        <p className="has-text-grey proposal-text-truncated is-size-7" style={{ maxWidth }}>
          {stripHtml(body || "").result}
        </p>
      </div>
    </div>
  );
};

export default ProposalCardBody;
