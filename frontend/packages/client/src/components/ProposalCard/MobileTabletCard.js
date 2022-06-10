import { useMemo } from "react";
import { Link } from "react-router-dom";
import { parseHTML } from "utils";
import { ProposalCardContent } from "./ProposalCardContent";

export const MobileTabletCard = ({ pr, style }) => {
  const { body } = pr;
  const imgProps = useMemo(() => parseHTML(body, "img"), [body]);
  const { src, alt } = imgProps;

  return (
    <Link to={`/proposal/${pr.id}`}>
      <div
        className="border-light rounded-sm mb-5 proposal-card transition-all"
        style={{ overflow: "hidden", ...style }}
      >
        {src && (
          <div className="is-flex column p-0 is-align-items-center"
            style={{ maxHeight: "200px", minHeight: "190px", overflow: "hidden" }}
          >
            <img src={src} alt={alt}
              style={{ maxHeight: "100%", objectFit: "cover", width: "100%" }}
            />
          </div>
        )}
        <ProposalCardContent pr={pr} src={src} />
      </div>
    </Link>
  );
};
