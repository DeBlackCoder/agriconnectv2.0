'use client';

import { useState, useCallback } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface UseConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  icon?: 'delete' | 'logout' | 'cancel' | 'warning';
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<UseConfirmOptions>({
    title: '',
    message: '',
  });
  const [resolveCallback, setResolveCallback] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: UseConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolveCallback(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (resolveCallback) {
      resolveCallback(true);
    }
    setIsOpen(false);
  }, [resolveCallback]);

  const handleCancel = useCallback(() => {
    if (resolveCallback) {
      resolveCallback(false);
    }
    setIsOpen(false);
  }, [resolveCallback]);

  const ConfirmDialog = useCallback(() => (
    <ConfirmModal
      isOpen={isOpen}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      {...options}
    />
  ), [isOpen, options, handleCancel, handleConfirm]);

  return { confirm, ConfirmDialog };
}
