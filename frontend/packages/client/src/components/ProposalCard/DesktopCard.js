import { useMemo } from "react";
import { Link } from "react-router-dom";
import { parseHTML } from "utils";
import { ProposalCardContent } from "./ProposalCardContent";

export const DesktopCard = ({ pr, style, isDesktopOnly }) => {
  const { body } = pr;
  const imgProps = useMemo(() => parseHTML(body, "img"), [body]);
  const { src, alt } = imgProps;

  return (
    <Link to={`/proposal/${pr.id}`}>
      <div
        className="border-light rounded-sm mb-5 proposal-card transition-all is-flex columns p-5"
        style={style}
      >
        <ProposalCardContent isDesktopOnly={isDesktopOnly} pr={pr} src={src} />
        {src && (
          <div className="is-flex column p-0 is-align-items-center rounded-sm"
            style={{
              marginLeft: "10px", maxHeight: "190px", maxWidth: "190px",
              minHeight: "190px", minWidth: "190px", overflow: "hidden"
            }}
          >
            <img src={src} alt={alt} style={{ height: "100%", objectFit: "cover" }} />
          </div>
        )}
      </div>
    </Link>
  );
};
