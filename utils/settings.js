import equal from './equal.js';

export const getSettings = async () => {
	const { settings } = await chrome.storage.local.get({ settings: {} });
	return settings;
}
export const getSetting = async (name, fallback = null) => {
	const settings = await getSettings();
	return settings?.[name] || fallback;
}
export const saveSetting = async (name, value) => {
	const settings = await getSettings();
	if(settings[name] !== value){
		settings[name] = value;
		await chrome.storage.local.set({ settings });
	}
	return;
}
const watchers = new Map();
export const watchSetting = async (name, watcher) => {
	if(!watchers.has(name)) watchers.set(name, new Set());
	watchers.get(name).add(watcher);
	const settings = await getSettings();
	watcher(name, settings[name], settings[name]);
}
export const unwatchSetting = (name, watcher) => {
	if(watchers.has(name)){
		watchers.get(name).delete(watcher);
	}
}
chrome.storage.local.onChanged.addListener( changes => {
	if(!changes.settings) return;
	new Set([...Object.keys(changes.settings.oldValue), ...Object.keys(changes.settings.newValue)]).forEach( name => {
		if(watchers.has(name) && !equal(changes.settings.oldValue[name], changes.settings.newValue[name])){
			watchers.get(name).forEach( watcher => watcher(name, changes.settings.newValue[name], changes.settings.oldValue[name]));
		}
	});
});
