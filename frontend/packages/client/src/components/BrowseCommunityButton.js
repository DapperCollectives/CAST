import { Link } from 'react-router-dom';

export default function BrowseCommunityButton() {
  return (
    <div className="mt-5">
      <div className="is-flex flex-1">
        <Link to={`/browse-communities`}>
          <div
            className="button is-fullwidth rounded-xl is-flex has-text-weight-bold has-background-white px-5"
            style={{ height: '48px', maxWidth: '220px' }}
          >
            Browse All Communities
          </div>
        </Link>
      </div>
    </div>
  );
}
