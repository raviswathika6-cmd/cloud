"""Shared utility functions for Flask API responses and request handling."""

from flask import jsonify, request


def success_response(data, status_code=200):
    """Return a JSON success response.

    Args:
        data: Dictionary payload or message string.
        status_code: HTTP status code (default 200).

    Returns:
        Flask Response tuple.
    """
    if isinstance(data, str):
        data = {"message": data}
    return jsonify(data), status_code


def error_response(message, status_code=400):
    """Return a JSON error response.

    Args:
        message: Error description string.
        status_code: HTTP status code (default 400).

    Returns:
        Flask Response tuple.
    """
    return jsonify({"error": message}), status_code


def get_json_data():
    """Extract JSON data from the current request.

    Returns:
        Parsed JSON dictionary from the request body.
    """
    return request.json


def get_required_fields(data, fields):
    """Validate that required fields are present in data.

    Args:
        data: Dictionary to validate.
        fields: List of required field names.

    Returns:
        Tuple of (values_dict, error_message). error_message is None if valid.
    """
    values = {}
    for field in fields:
        if field not in data or not data[field]:
            return None, f"Missing required field: {field}"
        values[field] = data[field]
    return values, None
