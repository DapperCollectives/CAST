import { Svg } from '@cast/shared-components';
import classnames from 'classnames';

const StepNumber = ({ stepIdx, status }) => {
  // status can be active - pending - done
  if (status === 'done') {
    return <Svg name="CheckMark" circleFill="#2EAE4F" />;
  }

  const classNames = classnames(
    'rounded-full has-text-black is-flex is-align-items-center is-justify-content-center',
    { 'has-background-yellow': status === 'active' },
    { 'border-light': status === 'pending' }
  );
  return (
    <div
      className={classNames}
      style={{
        width: 32,
        height: 32,
      }}
    >
      <b>{stepIdx + 1}</b>
    </div>
  );
};

export default StepNumber;
