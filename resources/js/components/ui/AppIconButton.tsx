import { Button, type ButtonProps } from 'react-aria-components';
import { cn } from '@/lib/cn';

type AppIconButtonProps = ButtonProps & {
    label: string;
};

export function AppIconButton({ label, className, children, ...props }: AppIconButtonProps) {
    return (
        <Button
            {...props}
            aria-label={label}
            className={cn('react-aria-Button size-8 px-0', className)}
        >
            {children}
        </Button>
    );
}
