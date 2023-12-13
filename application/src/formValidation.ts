/**
 * Checks if a value is required.
 *
 * @param {string | null} value - The value to be checked.
 * @return {true | string} - Returns true if the value is not null, undefined or empty string, otherwise returns an error message string.
 */
export function isRequired(value: string | null): true | string {
    if (value === null || value === undefined || value.trim() === '') {
        return 'This field is required';
    }
    return true;
}

/**
 * Removes special characters (/\\*.?":|<> =) from a given string or returns true if no special characters found.
 *
 * @param {string | null} value - The value to check for special characters.
 * @return {true | string} - Returns true if no special characters found, otherwise returns an error message string.
 */
export function noSpecialCharacters(value: string | null): true | string {
    if (value && /[/\\*.?":|<>]/.test(value)) {
        return 'Special characters (/\\*.?":|<>=) are not allowed';
    }
    return true;
}
