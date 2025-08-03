import { Action, ActionPanel, Form, showToast, Toast, useNavigation } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import * as fs from "fs";
import * as path from "path";
import { homedir } from "os";
import { useState, useEffect } from "react";

interface Provider {
  name: string;
  api_base_url: string;
  api_key: string;
  models: string[];
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
  const { data: config, isLoading } = usePromise(getClaudeCodeRouterConfig);
  const [providers, setProviders] = useState<Provider[]>([]);
  const { pop } = useNavigation();

  useEffect(() => {
    if (config?.Providers) {
      setProviders(config.Providers);
    }
  }, [config]);

  const handleAddProvider = () => {
    setProviders([...providers, { name: "", api_base_url: "", api_key: "", models: [] }]);
  };

  const handleRemoveProvider = (index: number) => {
    const newProviders = [...providers];
    newProviders.splice(index, 1);
    setProviders(newProviders);
  };

  const handleProviderChange = (index: number, field: keyof Provider, value: string | string[]) => {
    const newProviders = [...providers];
    newProviders[index] = { ...newProviders[index], [field]: value };
    setProviders(newProviders);
  };

  const handleSubmit = (values: Record<string, string | boolean | string[]>) => {
    const newConfig: ClaudeCodeRouterConfig = {
      PROXY_URL: values.PROXY_URL,
      LOG: values.LOG,
      APIKEY: values.APIKEY,
      HOST: values.HOST,
      API_TIMEOUT_MS: values.API_TIMEOUT_MS,
      Providers: providers,
      Router: {
        default: values["Router.default"],
      },
    };
    saveClaudeCodeRouterConfig(newConfig);
    pop();
  };

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save Configuration" onSubmit={handleSubmit} />
          <Action title="Add Provider" onAction={handleAddProvider} />
        </ActionPanel>
      }
    >
      <Form.Description text="General Settings" />
      <Form.TextField id="PROXY_URL" title="Proxy URL" defaultValue={config?.PROXY_URL || ""} />
      <Form.Checkbox id="LOG" label="Enable Logging" defaultValue={config?.LOG || false} />
      <Form.TextField id="APIKEY" title="API Key" defaultValue={config?.APIKEY || ""} />
      <Form.TextField id="HOST" title="Host" defaultValue={config?.HOST || ""} />
      <Form.TextField id="API_TIMEOUT_MS" title="API Timeout (ms)" defaultValue={config?.API_TIMEOUT_MS || ""} />

      <Form.Description text="Providers" />
      {providers.map((provider, index) => (
        <div key={index}>
          <Form.TextField
            id={`provider-name-${index}`}
            title={`Provider ${index + 1} Name`}
            value={provider.name}
            onChange={(value) => handleProviderChange(index, "name", value)}
          />
          <Form.TextField
            id={`provider-api-base-url-${index}`}
            title="API Base URL"
            value={provider.api_base_url}
            onChange={(value) => handleProviderChange(index, "api_base_url", value)}
          />
          <Form.TextField
            id={`provider-api-key-${index}`}
            title="API Key"
            value={provider.api_key}
            onChange={(value) => handleProviderChange(index, "api_key", value)}
          />
          <Form.TagPicker
            id={`provider-models-${index}`}
            title="Models"
            value={provider.models}
            onChange={(value) => handleProviderChange(index, "models", value)}
          />
          <Action title="Remove Provider" onAction={() => handleRemoveProvider(index)} />
        </div>
      ))}

      <Form.Description text="Router" info="Used to set up routing rules." />
      <Form.TextField
        id="Router.default"
        title="Default Route"
        placeholder="openrouter,anthropic/claude-3.5-sonnet"
        info="Specifies the default model, which will be used for all requests if no other route is configured."
        defaultValue={config?.Router?.default || ""}
      />
    </Form>
  );
}
