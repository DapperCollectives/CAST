import React, { useEffect } from 'react';
import { useWebContext } from 'contexts/Web3';
import { useCommunityMembers } from 'hooks';
import TableMembers from './TableMembers';
import { debounce } from 'utils';
import WrapperResponsive from './WrapperResponsive';

export default function CommunityMembersList({ communityId } = {}) {
  // number of users brought at each pull based on design
  const pageSize = 18;

  const { data, pagination, isLoading, fetchNextPage } = useCommunityMembers({
    communityId,
    count: pageSize,
  });

  const hasMore = pagination.next > 0;

  const {
    user: { addr: userAddr },
  } = useWebContext();

  useEffect(() => {
    document.hasMore = hasMore;
    document.loadingProposals = isLoading;
    document.fetchMore = fetchNextPage;
  }, [hasMore, isLoading, fetchNextPage]);

  // this hook takes care of fetching more members when user scrolls to bottom of the page
  useEffect(() => {
    const pullDataFromApi = () =>
      debounce(() => {
        if (
          document.documentElement.scrollHeight <=
          window.pageYOffset + window.innerHeight
        ) {
          if (document.hasMore && !document.loadingProposals) {
            document.fetchMore();
          }
        }
      }, 500);
    document.addEventListener('scroll', pullDataFromApi());
    return () => document.removeEventListener('scroll', pullDataFromApi());
  }, []);

  return (
    <div className="is-flex is-flex-direction-column">
      <WrapperResponsive
        classNames="is-flex flex-1 mb-3"
        extraStyles={{ marginTop: '40px' }}
        extraStylesMobile={{ marginTop: '24px' }}
      >
        <p className="has-text-weight-bold is-uppercase small-text">
          {pagination?.totalRecords ?? '...'}{' '}
          {`member${pagination?.totalRecords > 1 ? 's' : ''}`}
        </p>
      </WrapperResponsive>
      <p style={{ color: '#757575', marginBottom: '20px' }}>
        Anyone can join a community to follow its progress. You must hold the
        community’s token or NFT in your wallet to cast votes.
      </p>
      <div className="is-flex flex-1">
        <TableMembers
          data={data}
          loading={isLoading && Array.isArray(data)}
          initialLoading={isLoading && !data}
          userAddr={userAddr}
        />
      </div>
    </div>
  );
}
