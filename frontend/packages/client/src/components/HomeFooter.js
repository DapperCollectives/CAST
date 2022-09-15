import { Link } from 'react-router-dom';

export default function HomeFooter() {
  return (
    <div className="container pt-7 mt-7">
      <div className="columns">
        <div className="column">
          <p className="has-text-grey small-text is-flex">
            Built by
            <a
              target="_blank"
              rel="noreferrer noopener"
              href="https://dappercollectives.fyi"
              className="pl-1 is-underlined has-text-grey"
            >
              Dapper Collectives
            </a>
          </p>
        </div>
        <div className="column is-narrow px-4-desktop">
          <p className="has-text-grey small-text">
            <a
              target="_blank"
              rel="noreferrer noopener"
              href="https://docs.cast.fyi"
              className="is-underlined has-text-grey"
            >
              FAQ
            </a>
          </p>
        </div>
        <div className="column is-narrow px-4-desktop">
          <p className="has-text-grey small-text">
            <Link to={'/privacy-policy'}>
              <span className="is-underlined has-text-grey">
                Privacy Policy
              </span>
            </Link>
          </p>
        </div>
        <div className="column is-narrow px-4-desktop">
          <p className="has-text-grey small-text">
            <Link to={'/terms-of-service'}>
              <span className="is-underlined has-text-grey">
                Terms of Service
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
