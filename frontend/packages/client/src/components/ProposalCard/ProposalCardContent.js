import ProposalCardBody from "./ProposalCardBody";
import ProposalCardFooter from "./ProposalCardFooter";
import ProposalCardHeader from "./ProposalCardHeader";

export const ProposalCardContent = ({ isDesktopOnly, pr, src }) => (
  <div className={`is-flex column is-flex-direction-column p-${isDesktopOnly ? "0" : "5"}`}>
    <ProposalCardHeader creatorAddr={pr.creatorAddr} isAdminProposal={pr.isAdminProposal} />
    <ProposalCardBody name={pr.name} body={pr.body} inlineImage={Boolean(src && isDesktopOnly)} />
    <ProposalCardFooter
      isDesktopOnly={isDesktopOnly}
      id={pr.id}
      voted={pr.voted}
      endTime={pr.endTime}
      computedStatus={pr.computedStatus}
    />
  </div>
);
