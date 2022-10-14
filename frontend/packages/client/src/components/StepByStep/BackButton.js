import { Svg } from '@cast/shared-components';

const BackButton = ({ isSubmitting, onClick }) => (
  <div
    className="is-flex is-align-items-center has-text-grey cursor-pointer"
    onClick={!isSubmitting ? onClick : () => {}}
  >
    <Svg name="ArrowLeft" />
    <span className="ml-4">Back</span>
  </div>
);

export default BackButton;
