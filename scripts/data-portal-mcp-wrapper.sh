#!/bin/bash

# Set up environment variables for accessing Shopify's private registry
export UV_INDEX="https://registry.shopjs.com"
export UV_DEFAULT_INDEX="https://registry.shopjs.com"

# Add any authentication tokens if needed
# export UV_AUTH_TOKEN="your_auth_token_here"

# Run the data-portal MCP with proper arguments
echo "Starting data-portal MCP..."
/opt/homebrew/bin/uvx data-portal-mcp "$@" 