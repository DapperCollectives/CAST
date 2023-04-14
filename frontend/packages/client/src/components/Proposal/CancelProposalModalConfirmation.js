import { useCallback, useState } from 'react';
import { CancelProposalModal } from 'components';

const CancelProposalModalConfirmation = ({
  proposalName,
  onDismiss = () => {},
  onCancelProposal = () => {},
}) => {
  const [isCancelling, setIsCancelling] = useState(false);

  const _onCancelProposal = useCallback(async () => {
    setIsCancelling(true);
    await onCancelProposal();
    setIsCancelling(false);
    onDismiss();
  }, [onCancelProposal, onDismiss]);

  const _onDismiss = useCallback(() => {
    if (!isCancelling) {
      return onDismiss();
    }
  }, [isCancelling, onDismiss]);

  return (
    <CancelProposalModal
      onDismiss={_onDismiss}
      proposalName={proposalName}
      isCancelling={isCancelling}
      onCancelProposal={_onCancelProposal}
    />
  );
};

export default CancelProposalModalConfirmation;
