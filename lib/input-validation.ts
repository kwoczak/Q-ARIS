
export function sanitizeInput(input: string, maxLength: number): string {
    if (!input) return '';
    return input.trim().slice(0, maxLength);
}

export function validateUsername(username: string): { isValid: boolean; error?: string } {
    const safePattern = /^[a-zA-Z0-9 _-]+$/;

    if (!username) {
        return { isValid: false, error: 'Username is required' };
    }

    if (username.length < 3) {
        return { isValid: false, error: 'Username must be at least 3 characters long' };
    }

    if (username.length > 50) {
        return { isValid: false, error: 'Username must be at most 50 characters long' };
    }

    if (!safePattern.test(username)) {
        return { isValid: false, error: 'Username can only contain letters, numbers, spaces, underscores, and hyphens' };
    }

    return { isValid: true };
}
