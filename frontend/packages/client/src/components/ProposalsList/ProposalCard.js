import { useMediaQuery } from "hooks";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ProposalCardBody from "./ProposalCardBody";
import ProposalCardFooter from "./ProposalCardFooter";
import ProposalCardHeader from "./ProposalCardHeader";
import { mediaMatchers } from "hooks/useMediaQuery"
import { parseHTML } from "utils";

const ProposalCard = ({ pr, style = {} }) => {
  const isNotMobile = useMediaQuery();
  const isTabletOnly = useMediaQuery(mediaMatchers.tabletOnly);
  const isDesktopOnly = isNotMobile && !isTabletOnly;

  const cardRef = useRef();
  const [cardWidth, setCardWidth] = useState();
  useEffect(() => {
    // used for wrapping proposal body text
    if (cardRef.current) {
      setCardWidth(cardRef.current.offsetWidth);
    }
  }, [cardRef])

  const { body } = pr;
  const imgProps = useMemo(() => parseHTML(body, "img"), [body]);
  const { src, alt } = imgProps;

  const ImageContentDesktop = () => (
    <div className="is-flex column p-0 is-align-items-center rounded-sm"
      style={{
        marginLeft: "10px", maxHeight: "190px", maxWidth: "190px",
        minHeight: "190px", minWidth: "190px", overflow: "hidden"
      }}
    >
      <img src={src} alt={alt || ""} style={{ height: "100%", objectFit: "cover" }} />
    </div>
  );

  const ImageContentMobileAndTablet = () => (
    <div className="is-flex column p-0 is-align-items-center"
      style={{ maxHeight: "200px", minHeight: "190px", overflow: "hidden" }}
    >
      <img src={src} alt={alt || ""}
        style={{ maxHeight: "100%", objectFit: "cover", width: "100%" }}
      />
    </div>
  );

  const MainContent = () => (
    <div className={`is-flex column is-flex-direction-column p-${isDesktopOnly ? "0" : "5"}`}>
      <ProposalCardHeader {...pr} />
      <ProposalCardBody {...pr} cardWidth={cardWidth}
        inlineImage={Boolean(src && isDesktopOnly)}
      />
      <ProposalCardFooter {...pr} isDesktopOnly={isDesktopOnly} />
    </div>
  );

  const DesktopCard = () => (
    <Link to={`/proposal/${pr.id}`}>
      <div
        className="border-light rounded-sm mb-5 proposal-card transition-all is-flex columns p-5"
        style={style}
        ref={cardRef}
      >
        <MainContent />
        {src && <ImageContentDesktop />}
      </div>
    </Link>
  );

  const MobileTabletCard = () => (
    <Link to={`/proposal/${pr.id}`}>
      <div
        className="border-light rounded-sm mb-5 proposal-card transition-all"
        style={{ overflow: "hidden", ...style }}
      >
        {src && <ImageContentMobileAndTablet />}
        <MainContent />
      </div>
    </Link>
  );

  return isDesktopOnly ? <DesktopCard /> : <MobileTabletCard />;
};

export default ProposalCard;
