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

  const { onlyAuthorsToSubmit, isAuthor, hasPermission, reason } = data ?? {};

  // Check if user onlyAuthorsToSubmit is on and user is not an author
  if (onlyAuthorsToSubmit && !isAuthor && !hasPermission) {
    response = {
      isBlocked: true,
      title: 'Only Authors can submit proposals',
      description: (
        <>
          {reason}{' '}
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

  // Token amount restriction check
  if (data?.reason === 'Insufficient token balance to create proposal.') {
    const { balance, threshold, name } = data;
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
      footerText:
        'Note: These tokens are ONLY used for verification and will not be debited from your wallet.',
      balance,
      threshold,
    };
  }

  // TODO: NFT restriction
  // Implement check based on backend response

  return {
    isLoading,
    isError,
    data: response,
    error,
  };
}
