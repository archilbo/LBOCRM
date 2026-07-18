import type { ReactNode } from 'react';
import { drawerStyles } from './shared';

type DrawerSectionProps = {
  icon?: ReactNode;
  title: string;
  children: ReactNode;
};

export function DrawerSection({ icon, title, children }: DrawerSectionProps) {
  return (
    <div>
      <p className={drawerStyles.heading}>
        {icon}
        {title}
      </p>
      {children}
    </div>
  );
}
