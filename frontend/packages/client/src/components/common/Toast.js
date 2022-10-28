import { Svg } from '@cast/shared-components';

const TOAST_PROPS = {
  loading: {
    bgColor: 'white',
    borderColor: 'black',
    icon: <img src="/spinner.gif" alt="loading spinner" />,
  },
  success: {
    bgColor: '#F5FBF6',
    borderColor: '#2BA148',
    icon: <Svg name="CheckMark" />,
  },
  info: {
    bgColor: '#FEF4CD',
    borderColor: '#C8A104',
    icon: null,
  },
};

const Toast = ({
  onClose,
  message,
  messageType = 'info',
  actionText,
  actionFn,
}) => {
  const { bgColor, borderColor, icon } = TOAST_PROPS[messageType];

  return (
    <div
      className="rounded-sm box-shadow p-4"
      style={{
        position: 'relative',
        maxWidth: 350,
        top: -25,
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
      }}
    >
      <div className="is-flex">
        <div className="is-flex flex-1">
          {icon && (
            <div className="is-flex is-align-items-center mr-4">{icon} </div>
          )}
          <div className="flex-1">
            <div>{message}</div>
            {actionText && actionFn && (
              <div
                className="mt-1 cursor-pointer"
                onClick={() => {
                  actionFn();
                  onClose();
                }}
              >
                <b>
                  <u>{actionText}</u>
                </b>
              </div>
            )}
          </div>
        </div>
        <div
          className="is-flex is-align-items-center cursor-pointer ml-4"
          onClick={onClose}
        >
          <Svg name="Close" width="18" heigth="18" />
        </div>
      </div>
    </div>
  );
};

export default Toast;
