import { useHistory } from 'react-router-dom';
import { Svg } from '@cast/shared-components';

const Toast = ({ onClose, text, footerText, footerLink }) => {
  const history = useHistory();

  return (
    <div
      className="has-bg-white rounded-sm-br rounded-sm-tr border-left-yellow box-shadow p-2"
      style={{ position: 'relative', width: 325, top: -25 }}
    >
      <div
        className="cursor-pointer"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
        }}
      >
        <Svg name="Close" width="18" heigth="18" />
      </div>
      <div>{text}</div>
      {footerText && (
        <div
          className="mt-1"
          onClick={() => {
            if (footerLink) {
              history.push(footerLink);
              onClose();
            }
          }}
        >
          <b>
            <u>{footerText}</u>
          </b>
        </div>
      )}
    </div>
  );
};

export default Toast;
