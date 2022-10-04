import { useEffect, useRef, useState } from 'react';
import {
  useCommunityDetails,
  useVotingResults,
  useWindowDimensions,
} from 'hooks';
import Information from './Information';
import ResultsPanel from './ResultsPanel';

const ProposalInformation = ({
  creatorAddr = '',
  strategyName = '',
  isCoreCreator = false,
  ipfs = '',
  ipfsUrl = '',
  startTime = '',
  endTime = '',
  proposalId = '',
  computedStatus,
  communityId,
  proposalStrategy,
  proposalMaxWeight,
  proposalMinBalance,
  openStrategyModal = () => {},
}) => {
  // stores navbar height calculated after component is mounted
  const [navbarHeight, setNavbarHeight] = useState(0);

  useEffect(() => {
    setNavbarHeight(document.querySelector('header').offsetHeight);
  }, []);

  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  // stores when user scrolls
  const [scroll, setScroll] = useState(0);

  // stores style to apply when info bar needs to be fixed
  const [fixedStyle, setFixedStyle] = useState(null);
  // ref of the panel info component
  const ref = useRef(null);
  // ref of the parent component
  const parentRef = useRef(null);
  // used to store return point
  const topRef = useRef({ pointStatic: null });

  const { data: votingResults } = useVotingResults(proposalId);

  const { data: community } = useCommunityDetails(communityId);
  const { strategies: commnunityStrategies } = community ?? {};

  // Find contract information on community
  const contract =
    commnunityStrategies?.find((st) => st.name === proposalStrategy)
      ?.contract ?? {};

  const {
    name: tokenName,
    maxWeight: maxWeightFromContract,
    minBancale: minBalancefromContract,
  } = contract;

  // get maxWeight and minBalance from proposal or default to community settings
  const maxWeight = proposalMaxWeight ?? maxWeightFromContract;
  const minBalance = proposalMinBalance ?? minBalancefromContract;

  // this effect watches for user scroll to make info panel fixed to navbar
  useEffect(() => {
    if (ref?.current && parentRef?.current) {
      const { top, height: infoPanelHeightSize } =
        ref?.current.getBoundingClientRect() || {};

      const { width } = parentRef?.current.getBoundingClientRect() || {};

      const winScroll =
        document.body.scrollTop || document.documentElement.scrollTop;

      // if window size is bigger that navbar size + info panel then apply fixed
      if (windowHeight > navbarHeight + infoPanelHeightSize) {
        // user scrolled down and panel is next to navbar
        // adding 4px so the nav bar sticks more smoothly
        if (top < navbarHeight + 4 && !fixedStyle) {
          // save reference where the element needs to go back
          if (!topRef.current.returnTop) {
            topRef.current.pointStatic = winScroll;
          }
          setFixedStyle({
            className: ' is-panel-fixed',
            // use width of parent component
            style: {
              width,
              top: navbarHeight,
            },
          });
        }
      }

      if (
        fixedStyle &&
        topRef.current.pointStatic &&
        topRef.current.pointStatic > winScroll
      ) {
        topRef.current.pointStatic = null;
        setFixedStyle(null);
      }
    }
  }, [scroll, fixedStyle, windowHeight, navbarHeight]);

  // this effect watches for window width resizes to change info panel width
  useEffect(() => {
    if (parentRef?.current) {
      const { width } = parentRef?.current.getBoundingClientRect() || {};

      // window was resized then change width of the component if fixed style was applied
      if (fixedStyle && fixedStyle.windowWidth !== windowWidth) {
        setFixedStyle((state) => ({
          ...state,
          windowWidth,
          style: { ...(state?.style ?? {}), width },
        }));
      }
    }
  }, [fixedStyle, windowWidth, navbarHeight]);

  function handleScroll() {
    setScroll(document.body.scrollTop || document.documentElement.scrollTop);
  }

  // this effect watches for window scrolling
  useEffect(() => {
    document.addEventListener('scroll', handleScroll);
    return () => document.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={parentRef}>
      <div
        className={`${fixedStyle?.className ?? ''}`}
        ref={ref}
        style={fixedStyle?.style || {}}
      >
        <div className="mb-5">
          <ResultsPanel
            results={votingResults?.results}
            endTime={endTime}
            computedStatus={computedStatus}
          />
        </div>
        <Information
          creatorAddr={creatorAddr}
          strategyName={strategyName}
          isCoreCreator={isCoreCreator}
          ipfs={ipfs}
          ipfsUrl={ipfsUrl}
          startTime={startTime}
          endTime={endTime}
          communityId={communityId}
          tokenName={tokenName}
          maxWeight={maxWeight}
          minBalance={minBalance}
          openStrategyModal={openStrategyModal}
        />
      </div>
    </div>
  );
};

export default ProposalInformation;
