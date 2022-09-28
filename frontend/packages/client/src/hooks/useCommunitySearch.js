import { useEffect } from 'react';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { checkResponse, getPagination, wait } from 'utils';
import { debounce } from 'utils';
import { useInfiniteQuery } from '@tanstack/react-query';
import queryString from 'query-string';
import { PAGINATION_INITIAL_STATE } from 'reducers';

const mockedData = [
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
];

export const getPlainDataCustom = (data) => {
  const results = data?.pages?.reduce(
    (prev, current) => (current.data ? [...prev, ...current.data] : prev),
    []
  );

  const [{ filters = [] } = {}] = data?.pages ?? [];

  return { filters, results };
};

export default function useCommunitySearch({
  count: countParam = PAGINATION_INITIAL_STATE.count,
  searchText,
  filters,
} = {}) {
  const initialPageParam = [0, countParam, 0, -1];

  const { notifyError } = useErrorHandlerContext();

  const queryUniqueKey = [
    'search-community',
    encodeURIComponent(String(searchText)),
    filters,
  ];

  const { isLoading, isError, data, error, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      queryUniqueKey,
      async ({ pageParam = initialPageParam, queryKey }) => {
        const [start, count] = pageParam;
        const searchText = queryKey[1];
        const filters = queryKey[2];

        const queryParams = queryString.stringify(
          {
            filters: filters,
            start,
            count,
          },
          { arrayFormat: 'comma' }
        );

        const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/search/${searchText}?${queryParams}`;

        // use \default when search is for all
        const response = await fetch(url);
        return checkResponse(response);

        // return {
        //   ...resp,
        //   filters: [
        //     { text: 'All', amount: 22 },
        //     { text: 'DAO', amount: 3 },
        //     { text: 'Creator', amount: 4 },
        //     { text: 'NFT', amount: 8 },
        //     { text: 'Collector', amount: 0 },
        //   ],
        //   data: mockedData,
        // };
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

  const pagination = getPagination(data);
  const hasMore = pagination.next > 0;

  // handles scrolling and fetching more data
  useEffect(() => {
    document.hasMore = hasMore;
    document.isLoading = isLoading || isFetchingNextPage;
    document.fetchNextPage = fetchNextPage;
  }, [hasMore, isLoading, isFetchingNextPage, fetchNextPage]);

  function pullDataFromApi() {
    return debounce(() => {
      if (
        document.documentElement.scrollHeight <=
        window.pageYOffset + window.innerHeight
      ) {
        if (document.hasMore && !document.isLoading) {
          console.log('is fetching more ');
          document.fetchNextPage();
        }
      }
    }, 500);
  }

  useEffect(() => {
    document.addEventListener('scroll', pullDataFromApi());
    return () => document.removeEventListener('scroll', pullDataFromApi());
  }, []);

  return {
    isLoading,
    isError,
    data: getPlainDataCustom(data),
    error,
    pagination,
    fetchNextPage,
    queryKey: queryUniqueKey,
    isFetchingNextPage,
  };
}
