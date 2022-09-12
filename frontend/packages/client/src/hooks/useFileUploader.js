import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useMutation } from '@tanstack/react-query';
import { uploadFileApiReq } from 'api/file';

export default function useFileUploader({ useModalNotifications = true } = {}) {
  const { notifyError } = useErrorHandlerContext();

  const {
    mutateAsync: uploadFile,
    isLoading,
    isError,
    isSuccess,
    data,
    error,
  } = useMutation(
    async (image) => {
      return uploadFileApiReq({ image });
    },
    {
      onError: (error) => {
        if (useModalNotifications) {
          notifyError(error);
        }
      },
    }
  );

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    uploadFile,
  };
}
