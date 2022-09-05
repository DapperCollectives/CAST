import React, { useState } from 'react';
import { FadeInOut } from 'components';
import { Close, InfoOutLine } from 'components/Svg';
import { useMediaQuery } from 'hooks';
import classnames from 'classnames';

export default function TooltipMesssage({ onClose = () => {} } = {}) {
  const notMobile = useMediaQuery();

  const [closeToolTip, setCloseToolTip] = useState(false);

  const styles = notMobile
    ? { fontSize: '16px', height: '68px', lineHeight: '22.4px' }
    : { fontSize: '14px', lineHeight: '22.4px' };

  const classesInfoOutLine = classnames(
    'is-flex is-justify-content-center pl-2 pr-3',
    { 'is-align-flex-center is-align-items-center': notMobile },
    { 'is-align-flex-start pt-2': !notMobile }
  );
  const classesClose = classnames(
    'is-flex flex-1 is-justify-content-flex-end',
    { 'is-align-flex-center is-align-items-center pl-2 pr-3': notMobile },
    { 'is-align-flex-start pt-2 pl-4 pr-3': !notMobile }
  );

  return (
    <FadeInOut
      hide={closeToolTip}
      onTransitionend={() => {
        onClose();
      }}
    >
      <div className="container message-container has-background-white-ter rounded-sm">
        <div className="columns is-mobile m-0 p-0">
          <div className="column is-flex is-flex-grow-1 pl-3" style={styles}>
            <div className={classesInfoOutLine}>
              <InfoOutLine />
            </div>
            <div className="py-2 is-flex is-align-items-center">
              <p>
                CAST now supports Dapper Wallet!
                <a
                  target="_blank"
                  rel="noreferrer noopener"
                  href="https://dapper-collectives-1.gitbook.io/cast-docs/getting-started#connecting-your-wallet"
                  className="pl-1 is-underlined has-text-black"
                >
                  Click here for important information about using Dapper Wallet
                  with CAST.
                </a>
              </p>
            </div>
            <div className={classesClose}>
              <div
                className="cursor-pointer"
                onClick={() => setCloseToolTip(true)}
              >
                <Close width="15" height="15" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </FadeInOut>
  );
}
