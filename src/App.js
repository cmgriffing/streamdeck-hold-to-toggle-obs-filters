/* global $SD, OBSWebSocket */
import React, { useState, useEffect, useReducer } from "react";

import {
	ExampleComponent,
	createUseSDAction,
	SDNumberInput,
	SDTextInput,
	SDSelectInput,
	SDList,
	SDListSelect,
	SDListMultiSelect,
	createUsePluginSettings
} from "react-streamdeck";

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
	const sendToPropertyInspectorResult = useSDAction("sendToPropertyInspector");

	// const globalSettings = useSDAction("didReceiveGlobalSettings");

	const [settings, setSettings] = createUsePluginSettings({
		useState,
		useEffect,
		useReducer
	})(
		{
			buttonState: "",
			textState: "",
			numberState: 0,
			selectedSource: "",
			selectedFilters: []
		},
		connectedResult
	);

	const [obsEvents, setOBSEvents] = useState([]);
	const [obs, setOBS] = useState(null);

	const [sourcesList, setSourcesList] = useState([]);
	const [filtersList, setFiltersList] = useState([]);

	useEffect(() => {
		const obsInstance = new OBSWebSocket();
		obsInstance.connect().then(result => {
			setOBS(obsInstance);

			obsInstance.send("GetSourcesList").then(fetchedSourcesList => {
				console.log("OBS:send<promise>", { fetchedSourcesList });
				setSourcesList(fetchedSourcesList.sources);
			});
		});
	}, []);

	useEffect(() => {
		console.log("FETCHING FILTERS");
		if (settings.selectedSource) {
			obs
				.send("GetSourceFilters", { sourceName: settings.selectedSource })
				.then(fetchedFiltersList => {
					console.log("OBS:send<promise>", { fetchedFiltersList });
					setFiltersList(fetchedFiltersList.filters);
				});
		}
	}, [obs, settings.selectedSource]);

	// useEffect(() => {
	// 	if (obs) {
	// 		obs.on("SwitchScenes", (err, rawEvent) => {
	// 			console.log({ err, rawEvent });
	// 		});
	// 	} else {
	// 		console.log("OBS as not connected yet");
	// 	}
	// }, [obs]);

	const handleClick = event => {
		obs.sendCallback("GetCurrentScene", (err, currentScene) => {
			console.log("OBS:sendCallback", { currentScene, err });
		});
		obs.send("GetCurrentScene").then(currentScene => {
			console.log("OBS:send<promise>", { currentScene });
		});
	};

	console.log({
		connectedResult,
		sendToPropertyInspectorResult,
		settings
	});

	return (
		<div>
			<SDSelectInput
				label="Sources"
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
					label="Filters"
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
