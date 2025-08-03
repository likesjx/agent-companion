#!/bin/bash

PROJECT_PATH="$1"
AGENT="$2"
EDITOR="$3"

# Open the selected editor in the background
if [[ "$EDITOR" && "$EDITOR" != "Ghostty" ]]; then
  if [[ "$EDITOR" == "VSCode" ]]; then
    code "$PROJECT_PATH" &
  elif [[ "$EDITOR" == "Cursor" ]]; then
    cursor "$PROJECT_PATH" &
  fi
fi

# Open terminal with agent
AGENT_COMMAND="cd \"$PROJECT_PATH\" && clear"
if [[ "$AGENT" ]]; then
  case "$AGENT" in
    "Gemini")
      AGENT_COMMAND+=" && gemini-cli"
      ;;
    "Claude")
      AGENT_COMMAND+=" && claude-cli"
      ;;
    "SuperClaude")
      AGENT_COMMAND+=" && superclaude"
      ;;
    "OpenRouter")
      AGENT_COMMAND+=" && openrouter-cli"
      ;;
    "Claude Code Router")
      osascript -e 'tell application "Ghostty" to create window with profile "Default"' -e 'tell current session of front window to write text "claude-code-router"'
      AGENT_COMMAND+=" && claude-cli"
      ;;
  esac
fi

osascript -e "
  tell application \"Ghostty\"
    create window with profile \"Default\"
    tell current session of front window
      write text \"$AGENT_COMMAND\"
    end tell
  end tell
"
