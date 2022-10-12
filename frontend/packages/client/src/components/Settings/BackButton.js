import { Svg } from '@cast/shared-components';
import { useMediaQuery } from 'hooks';

export default function BackButton() {
  const notMobile = useMediaQuery();
  return (
    <div
      className={`column is-one-third ${notMobile ? 'p-6' : 'px-5 pt-5 pb-3'}`}
    >
      <button className="button rounded-lg has-text-weight-bold">
        <Svg name="ArrowLeft"></Svg>
        <span className="ml-2">Back</span>
      </button>
    </div>
  );
}
