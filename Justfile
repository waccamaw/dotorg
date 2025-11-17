# Load environment variables from .env file
set dotenv-load

# Default recipe (list available recipes)
default:
    @just --list

# Install and configure git from .env variables
git-setup:
    #!/usr/bin/env bash
    set -euo pipefail
    
    if [ -z "${GIT_USER_NAME:-}" ] || [ -z "${GIT_USER_EMAIL:-}" ]; then
        echo "Error: GIT_USER_NAME and GIT_USER_EMAIL must be set in .env file"
        exit 1
    fi
    
    echo "Configuring git..."
    git config --global user.name "${GIT_USER_NAME}"
    git config --global user.email "${GIT_USER_EMAIL}"
    
    echo "Git configuration complete:"
    echo "  Name: $(git config --global user.name)"
    echo "  Email: $(git config --global user.email)"

install: git-setup
    @echo "Installation complete."

serve: 
    hugo server --watch --bind="0.0.0.0" --port="1313" --baseURL="http://localhost:1313/"