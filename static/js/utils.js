/**
 * Shared utility functions for College Admission Portal
 */

/**
 * Make a POST request to an API endpoint with JSON body.
 * @param {string} url - API endpoint
 * @param {object} data - Request payload
 * @returns {Promise<object>} Parsed JSON response
 * @throws {Error} If response is not ok
 */
async function apiPost(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.error || 'Request failed');
    }
    return result;
}

/**
 * Show a message in a designated message div.
 * @param {string} elementId - ID of the message element
 * @param {string} text - Message text to display
 * @param {'success'|'error'} type - Message type
 */
function showMessage(elementId, text, type) {
    const messageDiv = document.getElementById(elementId);
    messageDiv.textContent = text;
    messageDiv.className = 'msg ' + type;
    messageDiv.style.display = 'block';
}

/**
 * Hide a message div.
 * @param {string} elementId - ID of the message element
 */
function hideMessage(elementId) {
    const messageDiv = document.getElementById(elementId);
    messageDiv.style.display = 'none';
}

/**
 * Collect form field values by their element IDs.
 * @param {string[]} fieldIds - Array of input element IDs
 * @returns {object} Key-value pairs of field ID to value
 */
function collectFormData(fieldIds) {
    const data = {};
    fieldIds.forEach(id => {
        data[id] = document.getElementById(id).value;
    });
    return data;
}

/**
 * Attach a submit handler to a form that posts data to an API.
 * @param {string} formId - ID of the form element
 * @param {string} apiUrl - API endpoint URL
 * @param {string[]} fieldIds - IDs of form fields to collect
 * @param {function} onSuccess - Callback on successful response (receives result)
 * @param {string} messageId - ID of the message element (default: 'message')
 */
function setupFormSubmit(formId, apiUrl, fieldIds, onSuccess, messageId = 'message') {
    document.getElementById(formId).addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessage(messageId);

        const formData = collectFormData(fieldIds);

        try {
            const result = await apiPost(apiUrl, formData);
            onSuccess(result);
        } catch (err) {
            showMessage(messageId, 'Error: ' + err.message, 'error');
        }
    });
}
