/**
 * Utility functions for handling errors and validations
 */

/**
 * Validates if a string is a proper email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Creates a standardized flash message object
 * @param {string} message - Main message title
 * @param {string} description - Detailed description
 * @param {string} type - Message type ('success', 'error', 'warning', 'info')
 * @param {Object} COLORS - Colors object from constants
 * @returns {Object} Formatted flash message object
 */
export const createFlashMessage = (message, description, type, COLORS) => {
    let color = COLORS.primary;
    let icon = 'info-circle';

    switch (type) {
        case 'success':
            color = COLORS.green;
            icon = 'check-circle';
            break;
        case 'error':
            color = COLORS.red;
            icon = 'times-circle';
            break;
        case 'warning':
            color = COLORS.yellow;
            icon = 'exclamation-circle';
            break;
        case 'info':
        default:
            color = COLORS.primary;
            icon = 'info-circle';
            break;
    }

    return {
        message,
        description,
        type,
        color,
        icon,
    };
};

/**
 * Handles API errors consistently
 * @param {Error} error - Error object from API call
 * @param {string} fallbackMessage - Default message to show if error is unclear
 * @param {Function} showMessage - Function to display error message
 */
export const handleApiError = (error, fallbackMessage = 'Something went wrong', showMessage = console.error) => {
    // Check if we have a response with error details
    if (error.response && error.response.data) {
        const errorData = error.response.data;
        const errorMessage = errorData.message || errorData.error || errorData.msg || fallbackMessage;
        showMessage('Error', errorMessage, 'error');
    } else if (error.message) {
        showMessage('Error', error.message, 'error');
    } else {
        showMessage('Error', fallbackMessage, 'error');
    }

    // Also log to console for debugging
    console.error('API Error:', error);
};

/**
 * Validates a password meets requirements
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid flag and message
 */
export const validatePassword = (password) => {
    if (!password || password.length < 6) {
        return {
            isValid: false,
            message: 'Password must be at least 6 characters long'
        };
    }

    return { isValid: true };
};

export default {
    validateEmail,
    createFlashMessage,
    handleApiError,
    validatePassword
};