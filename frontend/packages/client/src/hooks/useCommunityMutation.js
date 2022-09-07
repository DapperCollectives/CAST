import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useWebContext } from 'contexts/Web3';
import { useFileUploader } from 'hooks';
import { CREATE_COMMUNITY_TX } from 'const';
import { useMutation } from '@tanstack/react-query';
import { createCommunityApiReq } from 'api/community';

export default function useCommunityMutation() {
  const { notifyError } = useErrorHandlerContext();
  // for now not using modal notification if there was an error uploading image
  const { uploadFile } = useFileUploader({ useModalNotifications: false });
  const { user, signMessageByWalletProvider } = useWebContext();
  const {
    mutate: createCommunity,
    isLoading,
    isError,
    isSuccess,
    data,
    error,
  } = useMutation(
    async ({ logo, banner, ...otherProps }) => {
      const timestamp = Date.now().toString();
      const hexTime = Buffer.from(timestamp).toString('hex');

      const [compositeSignatures, voucher] = await signMessageByWalletProvider(
        user?.services[0].uid,
        CREATE_COMMUNITY_TX,
        hexTime
      );

      if (!compositeSignatures && !voucher) {
        throw new Error('No valid user signature found.');
      }

      // check for logo / banner uploads
      // admins can edit later the images
      let communityLogo;
      let communityBanner;
      if (logo?.file) {
        try {
          communityLogo = await uploadFile(logo.file);
        } catch (err) {
          communityLogo = undefined;
        }
      }
      if (banner?.file) {
        try {
          communityBanner = await uploadFile(banner.file);
        } catch (err) {
          communityBanner = undefined;
        }
      }
      return createCommunityApiReq({
        payload: {
          ...otherProps,
          logo: communityLogo?.fileUrl,
          bannerImgUrl: communityBanner?.fileUrl,
        },
        timestamp,
        compositeSignatures,
        voucher,
      });
    },
    {
      onError: (error) => {
        notifyError({
          status: 'Something went wrong with creating the community.',
          statusText: error.message,
        });
      },
    }
  );

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    createCommunity,
  };
}
