import React from 'react';
import WrapperResponsive from './WrapperResponsive';

const Label = ({ labelText }) => {
  return (
    <span className="has-background-black has-text-white rounded-sm px-3 py-2 mr-2">
      {labelText}
    </span>
  );
};

const Message = ({ messageText = '', labelText = null, icon = null } = {}) => {
  const labelComponent = labelText ? <Label labelText={labelText} /> : null;
  return (
    <div className="container message-container">
      <div className="has-background-white-ter rounded-sm">
        <div className="columns is-mobile m-0 p-0">
          {labelText && (
            <WrapperResponsive
              classNames="column is-flex is-flex-grow-0 is-align-items-center pr-2"
              extraClasses="pl-3 py-3"
              extraStylesMobile={{
                fontSize: '12px',
              }}
            >
              {labelComponent}
            </WrapperResponsive>
          )}

          <WrapperResponsive
            classNames="column is-flex is-flex-grow-1 is-align-items-center pl-2"
            extraClasses="pr-3 py-3"
            extraStylesMobile={{
              fontSize: '12px',
            }}
            extraStyles={{
              fontSize: '14px',
            }}
          >
            {icon && (
              <div className="is-flex-inline is-align-items-center is-justify-content-center pt-3 pb-2 pl-2 pr-3">
                {icon}
              </div>
            )}{' '}
            {messageText}
          </WrapperResponsive>
        </div>
      </div>
    </div>
  );
};

export default Message;
