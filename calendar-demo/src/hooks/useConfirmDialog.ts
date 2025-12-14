/**
 * useConfirmDialog Hook
 */

import { useState } from 'react';

type ConfirmOptions = {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

export const useConfirmDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (options?.onConfirm) {
      options.onConfirm();
    }
    setIsOpen(false);
    setOptions(null);
  };

  const handleCancel = () => {
    if (options?.onCancel) {
      options.onCancel();
    }
    setIsOpen(false);
    setOptions(null);
  };

  return {
    isOpen,
    options,
    confirm,
    handleConfirm,
    handleCancel,
    close: handleCancel
  };
};
