import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { useFileUploader } from 'hooks';
import { getCompositeSigs } from 'utils';
import { useMutation } from '@tanstack/react-query';
import { createCommunityApiReq } from 'api/community';

export default function useCommunityCreator() {
  const { notifyError } = useErrorHandlerContext();
  // for now not using modal notification if there was an error uploading image
  const { uploadFile } = useFileUploader({ useModalNotifications: false });

  const {
    mutate: createCommunity,
    isLoading,
    isError,
    isSuccess,
    data,
    error,
  } = useMutation(async ({ injectedProvider, communityData }) => {
    const timestamp = Date.now().toString();
    const hexTime = Buffer.from(timestamp).toString('hex');
    const _compositeSignatures = await injectedProvider
      .currentUser()
      .signUserMessage(hexTime);

    const compositeSignatures = getCompositeSigs(_compositeSignatures);

    if (!compositeSignatures) {
      const statusText = 'No valid user signature found.';
      // modal error will open
      notifyError({
        status: 'Something went wrong with creating the community.',
        statusText,
      });
      return;
    }

    const { logo, banner, ...otherProps } = communityData;

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
    });
  });

  if (isError) {
    notifyError(error);
  }
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    createCommunity,
  };
}
