export type FormErrors = Record<string, string>;

export function firstError(errors: FormErrors | undefined, ...keys: string[]) {
    if (!errors) {
        return undefined;
    }

    for (const key of keys) {
        if (errors[key]) {
            return errors[key];
        }
    }

    return undefined;
}

export function hasErrors(errors: FormErrors | undefined) {
    return Boolean(errors && Object.keys(errors).length > 0);
}