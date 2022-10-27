import { useErrorHandlerContext } from 'contexts/ErrorHandler';
import { Link } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { checkCanUserCreateProposal } from 'api/proposals';

export default function useProposalCreateCheck({ communityId, addr } = {}) {
  const { notifyError } = useErrorHandlerContext();

  const { isLoading, isError, data, error } = useQuery(
    ['check-user-can-create-proposal', String(communityId), addr],
    async () => {
      return checkCanUserCreateProposal({ communityId, addr });
    },
    {
      enabled: !!(communityId && addr),
      onError: (error) => {
        notifyError(error);
      },
    }
  );

  // Check reason why not user can not crate a proposal
  let response = {
    isBlocked: false,
  };

  const {
    onlyAuthorsToSubmit,
    isAuthor,
    hasPermission,
    reason,
    balance,
    threshold,
    name,
    contractType,
  } = data ?? {};

  // Check if user onlyAuthorsToSubmit is on and user is not an author
  if (onlyAuthorsToSubmit && !isAuthor && !hasPermission) {
    response = {
      isBlocked: true,
      title: 'Only Authors can submit proposals',
      description: (
        <>
          In order to create a proposal for this community, you must be an
          author of the community.{' '}
          <Link
            href="https://dapper-collectives-1.gitbook.io/cast-docs/"
            variant="underlined"
          >
            Learn More
          </Link>
        </>
      ),
    };
  }

  const footerText =
    'Note: These tokens/NFTs are ONLY used for verification and will not be debited from your wallet.';

  // Token amount restriction check
  if (
    reason === 'Insufficient token balance to create proposal.' &&
    contractType === 'nft'
  ) {
    response = {
      isBlocked: true,
      title: 'Insufficient NFT balance to create proposal',
      description: (
        <>
          {`In order to create a proposal for this community, you must have the required NFT in your wallet or be an author of the community.`}{' '}
          <Link
            href="https://dapper-collectives-1.gitbook.io/cast-docs/"
            variant="underlined"
          >
            Learn More
          </Link>
        </>
      ),
      footerText,
      contractType,
      contractName: name,
      balance,
      threshold,
    };
  }
  if (
    reason === 'Insufficient token balance to create proposal.' &&
    contractType === 'ft'
  ) {
    response = {
      isBlocked: true,
      title: 'Minimum Balance Required',
      description: (
        <>
          {`In order to create a proposal for this community, you must have a
          minimum of ${threshold} ${name?.toUpperCase()} tokens in your wallet.`}{' '}
          <Link
            href="https://dapper-collectives-1.gitbook.io/cast-docs/"
            variant="underlined"
          >
            Learn More
          </Link>
        </>
      ),
      footerText,
      contractName: name,
      contractType,
      balance,
      threshold,
    };
  }

  return {
    isLoading,
    isError,
    data: response,
    error,
  };
}
