import { Link } from 'react-router-dom';

export default function BrowseButton({ path, label, styles }) {
  return (
    <div className="mt-5" style={styles}>
      <div className="is-flex flex-1">
        <Link to={path}>
          <div
            className="button is-fullwidth rounded-xl is-flex has-text-weight-bold has-background-white px-5"
            style={{ height: '48px', maxWidth: '220px' }}
          >
            {label}
          </div>
        </Link>
      </div>
    </div>
  );
}
