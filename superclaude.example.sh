#!/bin/bash
# Filename: superclaude.example.sh
#
# This is an example of a script that is compatible with the agent-companion.
# To use it, make it executable (`chmod +x superclaude.example.sh`) and
# place it in a directory that is in your system's $PATH as `superclaude`.

# --- Define Your Commands as Functions ---
function lint() {
  echo "Running linter on the project..."
  # Replace with your actual linting command
  npm run lint
}

function test() {
  echo "Running tests for the project..."
  # Replace with your actual test command
  npm run test
}

# --- Main Script Logic (Command Router) ---
case "$1" in
  lint)
    lint
    ;;
  test)
    test
    ;;
  --help)
    # This part is crucial for command discovery
    echo "Usage: superclaude <command>"
    echo ""
    echo "Available commands:"
    echo "  lint      Run the linter"
    echo "  test      Run tests"
    echo ""
    ;;
  *)
    echo "Unknown command: $1"
    echo "Use 'superclaude --help' for a list of available commands."
    exit 1
    ;;
esac
