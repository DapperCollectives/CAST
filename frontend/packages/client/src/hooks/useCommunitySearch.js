import { useEffect } from 'react';
import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { checkResponse, getPagination } from 'utils';
import { debounce } from 'utils';
import { useInfiniteQuery } from '@tanstack/react-query';
import { PAGINATION_INITIAL_STATE } from 'reducers';

const getPaginationFromPagesCustom = (pages) => {
  if (!pages) {
    return [];
  }
  const lastPage = [...pages].pop();
  const { results } = lastPage;
  return [
    results?.start ?? 0,
    results?.count ?? 0,
    results?.totalRecords ?? 0,
    results?.next ?? -1,
  ];
};

export const getPlainDataCustom = (data) => {
  const results = data?.pages?.reduce(
    (prev, current) =>
      current.results.data ? [...prev, ...current.results.data] : prev,
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

        const queryParams = new URLSearchParams({
          ...(filters ? { filters: filters } : undefined),
          start,
          count,
        }).toString();

        const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/communities/search/${searchText}?${queryParams}`;

        const response = await fetch(url);
        return checkResponse(response);
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

  const pagination = getPagination(
    data,
    countParam,
    getPaginationFromPagesCustom
  );

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
