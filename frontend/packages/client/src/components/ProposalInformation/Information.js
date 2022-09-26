import { Link } from 'react-router-dom';
import { Svg } from '@cast/shared-components';
import { parseDateFromServer } from 'utils';
import Tooltip from '../Tooltip';
import AvatarBloquies from './AvatarBloquies';
import BlockieWithAddress from './BlockieWithAddress';
import InfoBlock from './InfoBlock';

const dateFormatConf = {
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  month: 'short',
  year: 'numeric',
  hour12: true,
};

export default function Information({
  openStrategyModal,
  strategyName,
  creatorAddr,
  isCoreCreator,
  ipfs,
  startTime,
  endTime,
  ipfsUrl,
  communityName,
  communityLogo,
  communitySlug,
  communityId,
  tokenName,
  maxWeight,
  minBalance,
}) {
  return (
    <div
      className={`has-background-white-ter rounded p-1-mobile p-5-tablet p-5_5-desktop`}
    >
      <p className="mb-5 has-text-weight-bold">Proposal Details</p>
      <InfoBlock
        title="Community"
        component={
          <div className="is-flex">
            <AvatarBloquies
              slug={communitySlug}
              id={communityId}
              logo={communityLogo}
            />
            <Link to={`/community/${communityId}`}>
              <p className="small-text px-2 is-underlined has-text-grey">
                {communityName}
              </p>
            </Link>
          </div>
        }
      />

      <InfoBlock
        title={'Proposed by'}
        component={
          <BlockieWithAddress
            creatorAddr={creatorAddr}
            isCoreCreator={isCoreCreator}
          />
        }
      />
      <InfoBlock
        title="Voting strategy"
        component={
          <div className="is-flex" onClick={openStrategyModal}>
            <div className="pr-2 cursor-pointer has-text-grey">
              {strategyName}
            </div>
          </div>
        }
      />
      <InfoBlock
        title={'Token required'}
        component={
          <a
            href={'https://flowscan.org/'}
            rel="noopener noreferrer"
            target="_blank"
            className="is-underlined has-text-grey p-0 small-text"
            style={{ height: '2rem !important' }}
          >
            <span className="mr-2">{`$${tokenName?.toUpperCase()}`}</span>
            <Svg name="LinkOut" width="12" height="12" />
          </a>
        }
      />
      <InfoBlock
        title={'Max tokens'}
        component={<span className="has-text-grey">{maxWeight}</span>}
      />
      <InfoBlock
        title={'Min tokens'}
        component={<span className="has-text-grey">{minBalance}</span>}
      />

      <InfoBlock
        title={'Start date'}
        component={
          <span className="has-text-grey">
            {parseDateFromServer(startTime).date.toLocaleString(
              undefined,
              dateFormatConf
            )}
          </span>
        }
      />
      <InfoBlock
        title={'End date'}
        component={
          <span className="has-text-grey">
            {parseDateFromServer(endTime).date.toLocaleString(
              undefined,
              dateFormatConf
            )}
          </span>
        }
        isLastElement={!ipfs}
      />
      {ipfs && (
        <InfoBlock
          title={'IPFS'}
          component={
            <a
              href={ipfsUrl}
              rel="noopener noreferrer"
              target="_blank"
              className="is-underlined has-text-grey is-text p-0 small-text"
              style={{ height: '2rem !important' }}
            >
              <Tooltip
                classNames="is-flex is-flex-grow-1 is-align-items-center"
                position="top"
                text="Open Ipfs link"
              >
                <p className="mr-2">{`${ipfs.substring(0, 8)}`}</p>
                <Svg name="LinkOut" width="12" height="12" />
              </Tooltip>
            </a>
          }
          isLastElement
        />
      )}
    </div>
  );
}
