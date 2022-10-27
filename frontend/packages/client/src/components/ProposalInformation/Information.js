import { Svg } from '@cast/shared-components';
import { parseDateFromServer } from 'utils';
import Tooltip from '../Tooltip';
import BlockieWithAddress from './BlockieWithAddress';
import CommunityName from './CommunityName';
import InfoBlock from './InfoBlock';

const isVisible = (value) => Boolean(value && value !== '' && value !== 0);

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
  communityId,
  contractAddr,
  tokenName,
  maxWeight,
  minBalance,
  customStrategy,
}) {
  return (
    <div
      className={`has-background-white-ter rounded p-1-mobile p-5-tablet p-5_5-desktop`}
    >
      <p className="mb-5 medium-text has-text-weight-bold">Proposal Details</p>
      <InfoBlock
        title="Community"
        component={
          <>
            <CommunityName communityId={communityId} />
          </>
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
          customStrategy ? (
            <div
              className="has-text-grey is-flex"
              style={{ textAlign: 'right' }}
            >
              {customStrategy.name}
            </div>
          ) : (
            <div className="is-flex" onClick={openStrategyModal}>
              <div className="cursor-pointer has-text-grey">{strategyName}</div>
            </div>
          )
        }
      />
      {customStrategy ? (
        <InfoBlock
          title={'Description'}
          component={
            <span className="has-text-grey" style={{ textAlign: 'right' }}>
              {customStrategy.description}
            </span>
          }
        />
      ) : (
        <InfoBlock
          title={'Token required'}
          component={
            contractAddr ? (
              <a
                href={`https://flowscan.org/account/${contractAddr}`}
                rel="noopener noreferrer"
                target="_blank"
                className="is-underlined has-text-grey p-0 small-text is-inline-flex is-align-items-center"
                style={{ height: '2rem !important' }}
              >
                <span className="mr-2">{`$${tokenName?.toUpperCase()}`}</span>
                <Svg name="LinkOut" width="12" height="12" />
              </a>
            ) : (
              <div
                className="has-text-grey p-0 small-text"
                style={{ height: '2rem !important' }}
              >
                {tokenName?.toUpperCase()}
              </div>
            )
          }
        />
      )}
      {isVisible(maxWeight) && (
        <InfoBlock
          title={'Max Weight'}
          component={<span className="has-text-grey">{maxWeight}</span>}
        />
      )}
      {isVisible(minBalance) && (
        <InfoBlock
          title={'Min Required'}
          component={<span className="has-text-grey">{minBalance}</span>}
        />
      )}

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
