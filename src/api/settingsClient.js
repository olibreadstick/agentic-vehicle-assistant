const SETTINGS_WEBHOOK_URL =
  "https://jbyutse.app.n8n.cloud/webhook/vehicle-settings";

export async function getSettings(sessionId) {
  const response = await fetch(SETTINGS_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "get_settings",
      sessionId,
    }),
  });

  const text = await response.text();

  console.log("Settings API status:", response.status);
  console.log("Settings API raw response:", text);

  if (!response.ok) {
    throw new Error(`Failed to load settings: ${response.status} ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Settings API did not return valid JSON: ${text}`);
  }
}

export async function saveSettings(sessionId, settings) {
  const response = await fetch(SETTINGS_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "save_settings",
      sessionId,
      settings,
    }),
  });

  const text = await response.text();

  console.log("Save settings status:", response.status);
  console.log("Save settings raw response:", text);

  if (!response.ok) {
    throw new Error(`Failed to save settings: ${response.status} ${text}`);
  }

  return JSON.parse(text);
}