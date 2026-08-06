export type PasswordRequirementKey = 'length' | 'uppercase' | 'lowercase' | 'number' | 'symbol';

export type PasswordRequirementState = Record<PasswordRequirementKey, boolean>;

/**
 * Pure, user-guidance-only password checks mirroring the Laravel rule
 * Password::min(12)->mixedCase()->numbers()->symbols().
 *
 * These checks never replace Laravel validation; they only drive the live
 * checklist and block obviously invalid submissions.
 */
export function checkPasswordRequirements(password: string): PasswordRequirementState {
    return {
        length: password.length >= 12,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        symbol: /[^A-Za-z0-9]/.test(password),
    };
}

export function allPasswordRequirementsMet(password: string): boolean {
    return Object.values(checkPasswordRequirements(password)).every(Boolean);
}
