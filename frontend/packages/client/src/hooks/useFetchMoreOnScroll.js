import { useEffect } from 'react';
import { debounce } from 'utils';

export function useFetchMOreOnScroll({
  fetchNextPage,
  enabled: scrollToFetchMore,
  isLoading = false,
  hasMore = false,
  debounceTime = 500,
}) {
  useEffect(() => {
    if (scrollToFetchMore) {
      document.hasMore = hasMore;
      document.loadingProposals = isLoading;
      document.fetchNextPage = fetchNextPage;
    }
  }, [hasMore, isLoading, fetchNextPage, scrollToFetchMore]);

  function pullDataFromApi() {
    return debounce(() => {
      if (
        document.documentElement.scrollHeight <=
        window.pageYOffset + window.innerHeight
      ) {
        if (document.hasMore && !document.loadingProposals) {
          document.fetchNextPage();
        }
      }
    }, debounceTime);
  }

  useEffect(() => {
    if (scrollToFetchMore) {
      document.addEventListener('scroll', pullDataFromApi());
    }
    return () =>
      scrollToFetchMore &&
      document.removeEventListener('scroll', pullDataFromApi());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToFetchMore]);
}
