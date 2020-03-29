/* global $SD, OBSWebSocket, lox */
import React, { useState, useEffect, useReducer } from "react";

import {
  createUseSDAction,
  SDSelectInput,
  SDListMultiSelect,
  createUsePluginSettings
} from "react-streamdeck";

// Slightly modified sdpi.css file. Adds 'data-' prefixes where needed.
import "react-streamdeck/dist/css/sdpi.css";

const createGetSettings = _sd => () => {
  if (_sd.api.getSettings) {
    _sd.api.getSettings(_sd.uuid);
  } else {
    _sd.api.common.getSettings(_sd.uuid);
  }
};

const useSDAction = createUseSDAction({
  useState,
  useEffect
});

export default function App() {
  const getSettings = createGetSettings($SD);
  useEffect(getSettings, []);

  const connectedResult = useSDAction("connected");

  const [settings, setSettings] = createUsePluginSettings({
    useState,
    useEffect,
    useReducer
  })(
    {
      selectedSource: "",
      selectedFilters: []
    },
    connectedResult
  );

  const [obs, setOBS] = useState(null);

  const [sourcesList, setSourcesList] = useState([]);
  const [filtersList, setFiltersList] = useState([]);

  useEffect(() => {
    const obsInstance = new OBSWebSocket();
    obsInstance.connect().then(result => {
      setOBS(obsInstance);

      obsInstance.send("GetSourcesList").then(fetchedSourcesList => {
        setSourcesList(fetchedSourcesList.sources);
      });
    });
  }, []);

  useEffect(() => {
    if (settings.selectedSource) {
      obs
        .send("GetSourceFilters", { sourceName: settings.selectedSource })
        .then(fetchedFiltersList => {
          setFiltersList(fetchedFiltersList.filters);
        });
    }
  }, [obs, settings.selectedSource]);

  return (
    <div>
      <SDSelectInput
        label={lox("Sources")}
        selectedOption={settings.selectedSource}
        options={sourcesList.map(source => {
          return { label: source.name, value: source.name };
        })}
        onChange={event => {
          const newState = {
            ...settings,
            selectedSource: event
          };
          setSettings(newState);
        }}
      />

      {settings.selectedSource !== "" && (
        <SDListMultiSelect
          label={lox("Filters")}
          selectedOptions={settings.selectedFilters}
          options={filtersList.map(filter => {
            return { label: filter.name, value: filter.name };
          })}
          onChange={event => {
            const newState = {
              ...settings,
              selectedFilters: event
            };
            setSettings(newState);
          }}
        />
      )}
    </div>
  );
}
