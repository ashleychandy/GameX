import { toast } from 'react-toastify';

const DEFAULT_OPTIONS = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true
};

export const notify = {
  success: (message, options = {}) => {
    toast.success(message, { ...DEFAULT_OPTIONS, ...options });
  },

  error: (message, options = {}) => {
    toast.error(message, { ...DEFAULT_OPTIONS, ...options });
  },

  warning: (message, options = {}) => {
    toast.warning(message, { ...DEFAULT_OPTIONS, ...options });
  },

  info: (message, options = {}) => {
    toast.info(message, { ...DEFAULT_OPTIONS, ...options });
  },

  custom: (message, options = {}) => {
    toast(message, { ...DEFAULT_OPTIONS, ...options });
  },

  transaction: {
    pending: (message = 'Transaction Pending...') => {
      return toast.loading(message, {
        ...DEFAULT_OPTIONS,
        autoClose: false
      });
    },

    success: (toastId, message = 'Transaction Confirmed!') => {
      toast.update(toastId, {
        render: message,
        type: 'success',
        isLoading: false,
        autoClose: 5000
      });
    },

    error: (toastId, message = 'Transaction Failed') => {
      toast.update(toastId, {
        render: message,
        type: 'error',
        isLoading: false,
        autoClose: 5000
      });
    }
  }
}; 