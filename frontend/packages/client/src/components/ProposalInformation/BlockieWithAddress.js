import { forwardRef, useEffect, useState } from 'react';
import Blockies from 'react-blockies';
import { Svg } from '@cast/shared-components';
import { useWindowDimensions } from 'hooks';
import { truncateAddress as truncate } from 'utils';

const BlockieWithAddress = forwardRef(({ creatorAddr }, ref) => {
  const [addr, setAdd] = useState(creatorAddr);

  const { width } = useWindowDimensions();

  useEffect(() => {
    if (ref?.current.clientWidth <= 270 && creatorAddr === addr) {
      setAdd(truncate(creatorAddr, 4, 4));
    } else if (ref?.current.clientWidth > 270 && creatorAddr !== addr) {
      setAdd(creatorAddr);
    }
  }, [ref, width, creatorAddr, addr]);

  return (
    <div className="columns is-mobile m-0 mr-2">
      <div className="column is-narrow is-flex is-align-items-center p-0 pr-2">
        <Blockies seed={creatorAddr} size={10} scale={2} className="blockies" />
      </div>
      <div className="column p-0 is-flex flex-1 is-align-items-center">
        <a
          href={`https://flowscan.org/account/${addr}`}
          rel="noopener noreferrer"
          target="_blank"
          className="button is-text p-0 small-text"
          style={{ height: '2rem !important' }}
        >
          <div className="is-flex is-align-items-center">
            <span className="pr-2">{addr}</span>
            <Svg name="LinkOut" width="12" height="12" />
          </div>
        </a>
      </div>
    </div>
  );
});

export default BlockieWithAddress;
