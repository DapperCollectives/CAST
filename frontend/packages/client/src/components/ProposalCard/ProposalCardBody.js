import { stripHtml } from 'string-strip-html';

const ProposalCardBody = ({ name, body }) => (
  <div className="proposal-body-spacing mr-0 pt-1">
    <div className="pr-0 pb-0 proposal-body-text">
      <h4 className="proposal-title is-4 mt-1 mb-4 has-text-black has-text-weight-bold">
        {name}
      </h4>
      <p className="has-text-grey proposal-text-truncated is-size-7">
        {stripHtml(body || '').result}
      </p>
    </div>
  </div>
);

export default ProposalCardBody;
