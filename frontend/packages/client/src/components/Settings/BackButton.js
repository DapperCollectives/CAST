import { Link } from 'react-router-dom';
import { Svg } from '@cast/shared-components';

export default function BackButton() {
  return (
    <Link to="/">
      <button className="button rounded-lg has-text-weight-bold">
        <Svg name="ArrowLeft"></Svg>
        <span className="ml-2">Back</span>
      </button>
    </Link>
  );
}
