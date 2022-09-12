import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useMutation } from '@tanstack/react-query';
import { addFungibleTokenApiReq } from 'api/fungibleToken';

export default function useAddFungibleToken() {
  const { notifyError } = useErrorHandlerContext();

  const {
    mutate: addFungibleToken,
    isLoading,
    isError,
    isSuccess,
    data,
    error,
  } = useMutation(
    async (addr, name, path) => {
      return addFungibleTokenApiReq({
        addr,
        name,
        path,
      });
    },
    {
      onError: (error) => {
        notifyError(error);
      },
    }
  );

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    addFungibleToken,
  };
}
