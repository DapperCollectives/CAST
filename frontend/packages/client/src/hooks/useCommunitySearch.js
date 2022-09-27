import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { checkResponse, getPagination, getPlainData } from 'utils';
import { useInfiniteQuery } from '@tanstack/react-query';
import { PAGINATION_INITIAL_STATE } from 'reducers';

export default function useCommunitySearch({
  count: countParam = PAGINATION_INITIAL_STATE.count,
  searchText,
} = {}) {
  const initialPageParam = [0, countParam, 0, -1];

  const { notifyError } = useErrorHandlerContext();

  const queryUniqueKey = [
    'search-community',
    encodeURIComponent(String(searchText)),
  ];

  const { isLoading, isError, data, error, fetchNextPage } = useInfiniteQuery(
    queryUniqueKey,
    async ({ pageParam = initialPageParam, queryKey }) => {
      const [start, count] = pageParam;
      const searchText = queryKey[1];
      const filters = queryKey[2];
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/search/${searchText}?filters=${filters}count=${count}&start=${start}`;

      // use 
      const response = await fetch(url);
      // return checkResponse(response);
      return {
        data: {
          filters: [
            { text: 'All', amount: 22 },
            { text: 'DAO', amount: 3 },
            { text: 'Creator', amount: 4 },
            { text: 'NFT', amount: 8 },
            { text: 'Collector', amount: 0 },
          ],
          results: [
            {
              id: 1,
              name: 'Flow',
              body: 'Vote on Flow Validators',
              logo: 'https://gateway.pinata.cloud/ipfs/QmZBsiJPi6ZWiqPjcftVCYqdgU81i2oBrNmw3XXE1Q3zg7',
              category: 'dao',
            },
            {
              id: 8,
              name: 'Dapper Collectives',
              category: 'dao',
              logo: 'https://gateway.pinata.cloud/ipfs/QmZBsiJPi6ZWiqPjcftVCYqdgU81i2oBrNmw3XXE1Q3zg7',
              body: 'Build better, together.',
              slug: '8af17484ca',
            },
            {
              id: 28,
              name: 'test community',
              category: 'dao',
              logo: 'https://dappercollectives.mypinata.cloud/ipfs/QmZrVBCn8Ta7ALn93U5zGGexpLhN9JoSg1BSCjKwb9zjVj',

              slug: 'bcd906ef4c',
            },
            {
              id: 23,
              name: 'erer',
              category: 'dao',
              logo: 'https://dappercollectives.mypinata.cloud/ipfs/QmZrVBCn8Ta7ALn93U5zGGexpLhN9JoSg1BSCjKwb9zjVj',
              body: 'erer',
            },
            {
              id: 39,
              name: 'CommunityD',
              category: 'dao',
              slug: '96fae5cb46',
            },
            {
              id: 68,
              name: 'test for voting proposals',
              category: 'dao',
              body: 'ss',
              slug: '5980ce5a08',
              contractName: 'FlowToken',
            },
            {
              id: 32,
              name: 'Community For Testing - updated',
              category: 'dao',
              logo: 'https://dappercollectives.mypinata.cloud/ipfs/QmPrki3jEHoYfrKQd3FWZcBvHUGXYc2R16yuPmTW2ULUxU',
            },
          ],
          start: 0,
          count: 10,
          totalRecords: 8,
          next: -1,
        },
      };
    },
    {
      getNextPageParam: (lastPage) => {
        const { next, start, count, totalRecords } = lastPage;
        return [start + count, count, totalRecords, next];
      },
      onError: (error) => {
        notifyError(error);
      },
    }
  );

  return {
    isLoading,
    isError,
    data: getPlainData(data),
    error,
    pagination: getPagination(data),
    fetchNextPage,
    queryKey: queryUniqueKey,
  };
}
