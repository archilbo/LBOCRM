import { useCallback, useState } from 'react';

export type DrawerMode = 'create' | 'edit';

type UseDrawerOptions<T> = {
  onBeforeOpen?: (mode: DrawerMode) => void;
  onAfterClose?: () => void;
};

export function useDrawer<T = never>(options?: UseDrawerOptions<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<DrawerMode>('create');
  const [record, setRecord] = useState<T | null>(null);

  const openForCreate = useCallback(() => {
    setRecord(null);
    setMode('create');
    setIsOpen(true);
    options?.onBeforeOpen?.('create');
  }, [options]);

  const openForEdit = useCallback((record: T) => {
    setRecord(record);
    setMode('edit');
    setIsOpen(true);
    options?.onBeforeOpen?.('edit');
  }, [options]);

  const close = useCallback(() => {
    setIsOpen(false);
    options?.onAfterClose?.();
  }, [options]);

  return { isOpen, mode, record, openForCreate, openForEdit, close, setRecord };
}
