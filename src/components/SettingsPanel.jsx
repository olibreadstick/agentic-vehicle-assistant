import { useState } from "react";
import { saveSettings } from "../api/settingsClient";

function SettingsPanel({ settings, setSettings, sessionId, onClose }) {
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  if (!settings) {
    return (
      <div className="settings-panel">
        <h2>Settings</h2>
        <p>No settings loaded yet.</p>
      </div>
    );
  }

  function updateSetting(path, value) {
    setSettings((prev) => {
      const updated = structuredClone(prev);
      let current = updated;

      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }

      current[path[path.length - 1]] = value;
      return updated;
    });
  }

  function updateArrayItem(path, index, field, value) {
  setSettings((prev) => {
    const updated = structuredClone(prev);
    let current = updated;

    for (const key of path) {
      current = current[key];
    }

    current[index][field] = value;
    return updated;
  });
}

function addArrayItem(path, newItem) {
  setSettings((prev) => {
    const updated = structuredClone(prev);
    let current = updated;

    for (const key of path) {
      current = current[key];
    }

    current.push(newItem);
    return updated;
  });
}

function removeArrayItem(path, index) {
  setSettings((prev) => {
    const updated = structuredClone(prev);
    let current = updated;

    for (const key of path) {
      current = current[key];
    }

    current.splice(index, 1);
    return updated;
  });
}

  async function handleSave() {
    try {
      setSaving(true);
      setSaveMessage("");

      await saveSettings(sessionId, settings);

      setSaveMessage("Settings saved.");
    } catch (error) {
      console.error(error);
      setSaveMessage("Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2>Settings</h2>

        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>

      <section className="settings-section">
        <h3>Family</h3>

        <label>
          Home address
          <input
            value={settings.family.home_location.address}
            onChange={(e) =>
              updateSetting(
                ["family", "home_location", "address"],
                e.target.value
              )
            }
          />
        </label>

        <label>
          Childcare buffer minutes
          <input
            type="number"
            value={settings.family.childcare_buffer_minutes}
            onChange={(e) =>
              updateSetting(
                ["family", "childcare_buffer_minutes"],
                Number(e.target.value)
              )
            }
          />
        </label>

        <label>
          Medical buffer minutes
          <input
            type="number"
            value={settings.family.medical_buffer_minutes}
            onChange={(e) =>
              updateSetting(
                ["family", "medical_buffer_minutes"],
                Number(e.target.value)
              )
            }
          />
        </label>

        <label>
          Work buffer minutes
          <input
            type="number"
            value={settings.family.work_buffer_minutes}
            onChange={(e) =>
              updateSetting(
                ["family", "work_buffer_minutes"],
                Number(e.target.value)
              )
            }
          />
        </label>

        <div className="location-list">
  <h4>Default job locations</h4>

  {(settings.family.default_job_locations || []).map((job, index) => (
    <div className="location-card" key={index}>
      <label>
        Person
        <input
          value={job.person || ""}
          onChange={(e) =>
            updateArrayItem(
              ["family", "default_job_locations"],
              index,
              "person",
              e.target.value
            )
          }
        />
      </label>

      <label>
        Label
        <input
          value={job.label || ""}
          onChange={(e) =>
            updateArrayItem(
              ["family", "default_job_locations"],
              index,
              "label",
              e.target.value
            )
          }
        />
      </label>

      <label>
        Address
        <input
          value={job.address || ""}
          onChange={(e) =>
            updateArrayItem(
              ["family", "default_job_locations"],
              index,
              "address",
              e.target.value
            )
          }
        />
      </label>

      <button
        type="button"
        onClick={() =>
          removeArrayItem(["family", "default_job_locations"], index)
        }
      >
        Remove job location
      </button>
    </div>
  ))}

  <button
    type="button"
    onClick={() =>
      addArrayItem(["family", "default_job_locations"], {
        person: "Parent1",
        label: "Work",
        address: "",
        lat: null,
        lng: null,
      })
    }
  >
    Add job location
  </button>
</div>

<div className="location-list">
  <h4>Default school locations</h4>

  {(settings.family.default_school_locations || []).map((school, index) => (
    <div className="location-card" key={index}>
      <label>
        Person
        <input
          value={school.person || ""}
          onChange={(e) =>
            updateArrayItem(
              ["family", "default_school_locations"],
              index,
              "person",
              e.target.value
            )
          }
        />
      </label>

      <label>
        Label
        <input
          value={school.label || ""}
          onChange={(e) =>
            updateArrayItem(
              ["family", "default_school_locations"],
              index,
              "label",
              e.target.value
            )
          }
        />
      </label>

      <label>
        Address
        <input
          value={school.address || ""}
          onChange={(e) =>
            updateArrayItem(
              ["family", "default_school_locations"],
              index,
              "address",
              e.target.value
            )
          }
        />
      </label>

      <button
        type="button"
        onClick={() =>
          removeArrayItem(["family", "default_school_locations"], index)
        }
      >
        Remove school location
      </button>
    </div>
  ))}

  <button
    type="button"
    onClick={() =>
      addArrayItem(["family", "default_school_locations"], {
        person: "Child1",
        label: "School",
        address: "",
        lat: null,
        lng: null,
      })
    }
  >
    Add school location
  </button>
</div>
      </section>

      <section className="settings-section">
        <h3>Vehicle</h3>

        <label className="checkbox-label">
        <input
            type="checkbox"
            checked={settings.vehicle.enabled}
            onChange={(e) =>
            updateSetting(["vehicle", "enabled"], e.target.checked)
            }
        />
        <span>Enable vehicle features</span>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.vehicle.allow_charging}
            onChange={(e) =>
              updateSetting(["vehicle", "allow_charging"], e.target.checked)
            }
          />
          Allow self-charging
        </label>

        <label>
          Preferred minimum battery %
          <input
            type="number"
            value={settings.vehicle.preferred_min_battery_percent}
            onChange={(e) =>
              updateSetting(
                ["vehicle", "preferred_min_battery_percent"],
                Number(e.target.value)
              )
            }
          />
        </label>

        <label>
          Critical battery %
          <input
            type="number"
            value={settings.vehicle.critical_battery_percent}
            onChange={(e) =>
              updateSetting(
                ["vehicle", "critical_battery_percent"],
                Number(e.target.value)
              )
            }
          />
        </label>

        <label>
          Charger search radius meters
          <input
            type="number"
            value={settings.vehicle.charger_search_radius_meters}
            onChange={(e) =>
              updateSetting(
                ["vehicle", "charger_search_radius_meters"],
                Number(e.target.value)
              )
            }
          />
        </label>
      </section>

      <section className="settings-section">
        <h3>Display</h3>

        <label>
          Time format
          <select
            value={settings.display.time_format}
            onChange={(e) =>
              updateSetting(["display", "time_format"], e.target.value)
            }
          >
            <option value="12-hour">12-hour</option>
            <option value="24-hour">24-hour</option>
          </select>
        </label>

        <label>
          Detail level
          <select
            value={settings.display.detail_level}
            onChange={(e) =>
              updateSetting(["display", "detail_level"], e.target.value)
            }
          >
            <option value="short">Short</option>
            <option value="normal">Normal</option>
            <option value="detailed">Detailed</option>
          </select>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.display.show_vehicle_notes}
            onChange={(e) =>
              updateSetting(
                ["display", "show_vehicle_notes"],
                e.target.checked
              )
            }
          />
          Show vehicle notes
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.display.show_construction_details}
            onChange={(e) =>
              updateSetting(
                ["display", "show_construction_details"],
                e.target.checked
              )
            }
          />
          Show construction details
        </label>
      </section>

      <div className="settings-actions">
        <button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save settings"}
        </button>

        {saveMessage && <p>{saveMessage}</p>}
      </div>
    </div>
  );
}

export default SettingsPanel;