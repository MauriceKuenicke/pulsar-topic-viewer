/**
 * Checks if a value is required.
 *
 * @param {string | null} value - The value to be checked.
 * @return {true | string} - Returns true if the value is not null, undefined or empty string, otherwise returns 'This field is required'.
 */
export function isRequired(value: string | null): true | string {
    if (value === null || value === undefined || value.trim() === '') {
        return 'This field is required';
    }
    return true;
}

export function noSpecialCharacters(value: string | null): true | string {
    if (value && /[/\\*.?":|<>]/.test(value)) {
        return 'Special characters (/\\*.?":|<>=) are not allowed';
    }
    return true;
}