import type { ReactNode } from 'react';
import { drawerStyles, DrawerError } from './shared';

type DrawerFieldProps = {
  label: string;
  children: ReactNode;
  error?: string;
  className?: string;
};

export function DrawerField({ label, children, error, className }: DrawerFieldProps) {
  return (
    <div className={drawerStyles.fieldGroup}>
      <label className={drawerStyles.label}>{label}</label>
      {children}
      <DrawerError error={error} />
    </div>
  );
}
