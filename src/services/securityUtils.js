// Check if a given string is a valid date in YYYY-MM-DD format
export const isValidDate = (dateString) => {
  // Check format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  
  // Parse the date parts and create a date object
  const parts = dateString.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  // Create a date object and check if it's valid
  const date = new Date(year, month, day);
  
  // Check if the date is valid and the parts match what we set
  return date.getFullYear() === year &&
         date.getMonth() === month &&
         date.getDate() === day;
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
  if (!input) return '';
  // Basic HTML sanitization for strings
  return String(input)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Securely handle API responses
 * @param {Object} response - API response object
 * @param {Function} onSuccess - Function to call on success
 * @param {Function} onError - Function to call on error
 */
export const handleApiResponse = (response, onSuccess, onError) => {
  try {
    // Check for proper API response format
    if (!response || typeof response !== 'object') {
      onError('Invalid API response format');
      return;
    }
    
    // Check for success status
    if (response.success || response.status === 'success') {
      onSuccess(response.data);
    } else {
      // Handle API error
      const errorMessage = response.message || 'Operation failed';
      onError(errorMessage);
    }
  } catch (err) {
    onError('An unexpected error occurred while processing the response');
    console.error('API Response Error:', err);
  }
};
