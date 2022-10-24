import { useHistory } from 'react-router-dom';
import Toast from 'components/common/Toast';
import { useToast } from '@chakra-ui/react';

export default function useToastHook() {
  const toast = useToast();
  const history = useHistory();

  const popToast = (text, toastProps = {}) => {
    toast({
      position: 'bottom',
      duration: 5000,
      render: ({ onClose }) => (
        <Toast
          text={text}
          history={history}
          onClose={onClose}
          {...toastProps}
        />
      ),
    });
  };

  return {
    popToast,
  };
}
