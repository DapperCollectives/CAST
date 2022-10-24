import { useErrorHandlerContext } from 'contexts/ErrorHandler';
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

  // reasons for not being able to create a proposal
  // Premissions: user needs to be an author to be able to create
  // Token amount restriction
  // NFT restriction

  const dataMocked = {
    isBlocked: true,
    title: 'Minimum Balance Required',
    description:
      'In order to create a proposal for this community, you must have a minimum of 100 FLOW tokens in your wallet. Learn More',
    footerText:
      'Note: These tokens are ONLY used for verification and will not be debited from your wallet.',
  };

  return {
    isLoading,
    isError,
    data: dataMocked,
    error,
  };
}
