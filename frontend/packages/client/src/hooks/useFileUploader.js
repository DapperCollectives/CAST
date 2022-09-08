import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { checkResponse } from 'utils';
import { useMutation } from '@tanstack/react-query';

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
      const formData = new FormData();
      formData.append('file', image);
      const url = `${process.env.REACT_APP_BACK_END_SERVER_API}/upload`;
      const fetchOptions = {
        method: 'POST',
        body: formData,
      };
      const response = await fetch(url, fetchOptions);
      const upload = await checkResponse(response);
      // complete url on IPFS
      const fileUrl = `${process.env.REACT_APP_IPFS_GATEWAY}${upload.cid}`;
      return { ...upload, fileUrl };
    },
    {
      onError: (error) => {
        if (useModalNotifications) {
          notifyError({
            status: 'Image file was not uploaded',
            statusText: error.message,
          });
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
