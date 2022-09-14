import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export default function useQueryParams(arrayParams) {
  const { search } = useLocation();
  return useMemo(() => {
    const params = new URLSearchParams(search);
    const mapKeyValue = Object.keys(arrayParams).map((key) => {
      return {
        [key]: params.get(arrayParams[key]),
      };
    });
    return Object.assign({}, ...mapKeyValue);
  }, [search, arrayParams]);
}
