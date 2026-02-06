/**
 * Shared utility functions
 */

/**
 * Convert a name/title to a URL-safe slug (ID)
 * @example slugify("My Service Name") => "my-service-name"
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Debounce a function call
 * @param fn Function to debounce
 * @param ms Delay in milliseconds
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
    fn: T,
    ms: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), ms);
    };
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}
