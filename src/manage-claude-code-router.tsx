import { Action, ActionPanel, Form, showToast, Toast, useNavigation, Icon } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import * as fs from "fs";
import * as path from "path";
import { homedir } from "os";
import { useState, useEffect } from "react";
import React from "react";
import { exec } from "child_process";

interface Provider {
  name: string;
  api_base_url: string;
  api_key: string;
  models: string[];
  transformer?: Record<string, any>;
  markedForDeletion?: boolean;
}

interface ClaudeCodeRouterConfig {
  PROXY_URL?: string;
  LOG?: boolean;
  APIKEY?: string;
  HOST?: string;
  API_TIMEOUT_MS?: string;
  Providers?: Provider[];
  Router?: {
    default?: string;
    background?: string;
    think?: string;
    longContext?: string;
    longContextThreshold?: number;
    webSearch?: string;
  };
}

const configPath = path.join(homedir(), ".claude-code-router", "config.json");

async function getClaudeCodeRouterConfig(): Promise<ClaudeCodeRouterConfig> {
  if (!fs.existsSync(configPath)) {
    return {};
  }
  const configData = fs.readFileSync(configPath, "utf-8");
  return JSON.parse(configData) as ClaudeCodeRouterConfig;
}

async function saveClaudeCodeRouterConfig(config: ClaudeCodeRouterConfig) {
  try {
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    await showToast({
      style: Toast.Style.Success,
      title: "Configuration Saved",
    });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to save configuration",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export default function Command() {
  const { data: config, isLoading, revalidate } = usePromise(getClaudeCodeRouterConfig);
  const [formData, setFormData] = useState<ClaudeCodeRouterConfig>({});
  const [status, setStatus] = useState<string>("Checking...");
  const { pop } = useNavigation();

  const checkStatus = () => {
    exec("ccr status", (error, stdout) => {
      if (error) {
        setStatus("Not running");
        return;
      }
      setStatus(stdout.trim());
    });
  };

  const startService = () => {
    exec("ccr start", (error) => {
      if (error) {
        showToast(Toast.Style.Failure, "Failed to start service", error.message);
        return;
      }
      showToast(Toast.Style.Success, "Service started");
      checkStatus();
    });
  };

  const stopService = () => {
    exec("ccr stop", (error) => {
      if (error) {
        showToast(Toast.Style.Failure, "Failed to stop service", error.message);
        return;
      }
      showToast(Toast.Style.Success, "Service stopped");
      checkStatus();
    });
  };

  useEffect(() => {
    checkStatus();
  }, []);

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleAddProvider = () => {
    const newProviders = [...(formData.Providers || []), { name: "", api_base_url: "", api_key: "", models: [] }];
    setFormData({ ...formData, Providers: newProviders });
  };

  const handleRemoveProvider = (index: number) => {
    const newProviders = [...(formData.Providers || [])];
    newProviders.splice(index, 1);
    setFormData({ ...formData, Providers: newProviders });
  };

  const handleProviderChange = (index: number, field: keyof Provider, value: string | string[] | boolean) => {
    const newProviders = [...(formData.Providers || [])];
    newProviders[index] = { ...newProviders[index], [field]: value };
    setFormData({ ...formData, Providers: newProviders });
  };

  const handleSubmit = () => {
    const newConfig: ClaudeCodeRouterConfig = {
      ...formData,
    };
    saveClaudeCodeRouterConfig(newConfig);
    revalidate();
    pop();
  };

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save Configuration" onSubmit={handleSubmit} />
          <Action title="Add Provider" onAction={handleAddProvider} shortcut={{ modifiers: ["cmd"], key: "n" }} />
          <ActionPanel.Section title="Service">
            <Action title="Start Service" onAction={startService} icon={Icon.Play} />
            <Action title="Stop Service" onAction={stopService} icon={Icon.Stop} />
            <Action title="Refresh Status" onAction={checkStatus} icon={Icon.ArrowClockwise} />
          </ActionPanel.Section>
        </ActionPanel>
      }
    >
      <Form.Description text={`Status: ${status}`} />
      <Form.Description text="General Settings" />
      <Form.TextField
        id="PROXY_URL"
        title="Proxy URL"
        info="You can set a proxy for API requests, for example: 'http://127.0.0.1:7890'"
        value={formData.PROXY_URL || ""}
        onChange={(value) => setFormData({ ...formData, PROXY_URL: value })}
      />
      <Form.Checkbox
        id="LOG"
        label="Enable Logging"
        info="You can enable logging by setting it to true. The log file will be located at $HOME/.claude-code-router.log"
        value={formData.LOG || false}
        onChange={(value) => setFormData({ ...formData, LOG: value })}
      />
      <Form.TextField
        id="APIKEY"
        title="API Key"
        info="You can set a secret key to authenticate requests. When set, clients must provide this key in the Authorization header (e.g., Bearer your-secret-key) or the x-api-key header."
        value={formData.APIKEY || ""}
        onChange={(value) => setFormData({ ...formData, APIKEY: value })}
      />
      <Form.TextField
        id="HOST"
        title="Host"
        info="You can set the host address for the server. If APIKEY is not set, the host will be forced to 127.0.0.1 for security reasons to prevent unauthorized access."
        value={formData.HOST || "127.0.0.1"}
        onChange={(value) => setFormData({ ...formData, HOST: value })}
      />
      <Form.TextField
        id="API_TIMEOUT_MS"
        title="API Timeout (ms)"
        info="Specifies the timeout for API calls in milliseconds."
        value={formData.API_TIMEOUT_MS || "10000"}
        onChange={(value) => setFormData({ ...formData, API_TIMEOUT_MS: value })}
      />

      <Form.Separator />
      <Form.Description text="Providers" />

      {(formData.Providers || []).map((provider, index) => (
        <React.Fragment key={index}>
          <Form.TextField
            id={`provider-${index}-name`}
            title={`Provider ${index + 1} Name`}
            value={provider.name}
            onChange={(value) => handleProviderChange(index, "name", value)}
          />
          <Form.TextField
            id={`provider-${index}-api_base_url`}
            title="API Base URL"
            value={provider.api_base_url}
            onChange={(value) => handleProviderChange(index, "api_base_url", value)}
          />
          <Form.TextField
            id={`provider-${index}-api_key`}
            title="API Key"
            value={provider.api_key}
            onChange={(value) => handleProviderChange(index, "api_key", value)}
          />
          <Form.TagPicker
            id={`provider-${index}-models`}
            title="Models"
            value={provider.models}
            onChange={(value) => handleProviderChange(index, "models", value)}
          >
            {/* You can add static Form.TagPicker.Item here if you have a predefined list */}
          </Form.TagPicker>
          <Form.TextField
            id={`provider-${index}-transformer`}
            title="Transformer"
            placeholder='{"use": ["openrouter"]}'
            value={provider.transformer ? JSON.stringify(provider.transformer) : ""}
            onChange={(value) => handleProviderChange(index, "transformer", value)}
          />
          <Form.Checkbox
            id={`provider-${index}-markedForDeletion`}
            label="Mark for Deletion"
            value={provider.markedForDeletion || false}
            onChange={(value) => handleProviderChange(index, "markedForDeletion", value)}
          />
          <Form.Separator />
        </React.Fragment>
      ))}

      <Form.Description text="Router" info="Used to set up routing rules." />
      <Form.TextField
        id="Router.default"
        title="Default Route"
        placeholder="openrouter,anthropic/claude-3.5-sonnet"
        info="The default model for general tasks."
        value={formData.Router?.default || ""}
        onChange={(value) => setFormData({ ...formData, Router: { ...formData.Router, default: value } })}
      />
      <Form.TextField
        id="Router.background"
        title="Background Route"
        placeholder="openrouter,anthropic/claude-3.5-sonnet"
        info="A model for background tasks. This can be a smaller, local model to save costs."
        value={formData.Router?.background || ""}
        onChange={(value) => setFormData({ ...formData, Router: { ...formData.Router, background: value } })}
      />
      <Form.TextField
        id="Router.think"
        title="Think Route"
        placeholder="openrouter,anthropic/claude-3.5-sonnet"
        info="A model for reasoning-heavy tasks, like Plan Mode."
        value={formData.Router?.think || ""}
        onChange={(value) => setFormData({ ...formData, Router: { ...formData.Router, think: value } })}
      />
      <Form.TextField
        id="Router.longContext"
        title="Long Context Route"
        placeholder="openrouter,anthropic/claude-3.5-sonnet"
        info="A model for handling long contexts (e.g., > 60K tokens)."
        value={formData.Router?.longContext || ""}
        onChange={(value) => setFormData({ ...formData, Router: { ...formData.Router, longContext: value } })}
      />
      <Form.TextField
        id="Router.longContextThreshold"
        title="Long Context Threshold"
        placeholder="60000"
        info="The token count threshold for triggering the long context model. Defaults to 60000 if not specified."
        value={formData.Router?.longContextThreshold?.toString() || "60000"}
        onChange={(value) =>
          setFormData({
            ...formData,
            Router: { ...formData.Router, longContextThreshold: parseInt(value, 10) },
          })
        }
      />
      <Form.TextField
        id="Router.webSearch"
        title="Web Search Route"
        placeholder="openrouter,anthropic/claude-3.5-sonnet:online"
        info="Used for handling web search tasks and this requires the model itself to support the feature. If you're using openrouter, you need to add the :online suffix after the model name."
        value={formData.Router?.webSearch || ""}
        onChange={(value) => setFormData({ ...formData, Router: { ...formData.Router, webSearch: value } })}
      />
    </Form>
  );
}