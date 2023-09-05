import { Link } from 'react-router-dom';

export default function HomeFooter() {
  return (
    <div className="section pt-6 mt-6">
      <div className="container">
        <div className="columns">
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
    </div>
  );
}
