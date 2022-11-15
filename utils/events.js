import equal from './equal.js';
import {
	getSetting,
	saveSetting
} from './settings.js';

export const getEvents = async (origin, source) => {
	const { events } = await chrome.storage.local.get({events:{}});
	if(origin){
		if(source){
			return events[origin]?events[origin].filter(e=>e.source===source||e.type==='pageload'):[];
		}
		return events[origin] || [];
	} else return events;
}
export const getAllEvents = async () => {
	const { events } = await chrome.storage.local.get({events:{}});
	return Object.keys(events).reduce( (p, o) => [...p, ...events[o]], []);
}
export const getEvent = async (id) => {
	return (await getAllEvents()).find( ({id: eid}) => id == eid);
}

const allEventsWatchers = new Set();
const originEventWatchers = new Map();
const sourceEventWatchers = new Map();
export const watchAllEvents = async callback => {
	allEventsWatchers.add(callback);
	callback(await getEvents());
}
export const unwatchAllEvents = callback => {
	allEventsWatchers.delete(callback);
}
export const watchEventsByOrigin = async (origin, callback) => {
	if(!originEventWatchers.has(origin)) originEventWatchers.set(origin, new Set());
	originEventWatchers.get(origin).add(callback);
	callback(await getEvents(origin));
}
export const unwatchEventsByOrigin = (origin, callback) => {
	if(originEventWatchers.has(origin)) originEventWatchers.delete(callback);
}
export const watchEventsByOriginSource = async (origin, source, callback) => {
	if(!sourceEventWatchers.has(origin)) sourceEventWatchers.set(origin, new Map());
	if(!sourceEventWatchers.get(origin).has(source)) sourceEventWatchers.get(origin).set(source, new Set());
	sourceEventWatchers.get(origin).get(source).add(callback);
	callback(await getEvents(origin, source));
}
export const unwatchEventsByOriginSource = (origin, source, callback) => {
	if(
		sourceEventWatchers.has(origin) &&
		sourceEventWatchers.get(origin).has(source)
	) {
		sourceEventWatchers.get(origin).get(source).delete(callback);
	}
}
export const watchEvents = async (...args) => {
	if(args.length == 3) await watchEventsByOriginSource(...args);
	else if(args.length == 2) await watchEventsByOrigin(...args);
	else if(args.length == 1) await watchAllEvents(...args);
}
export const unwatchEvents = (...args) => {
	if(args.length == 3) unwatchEventsByOriginSource(...args);
	else if(args.length == 2) unwatchEventsByOrigin(...args);
	else if(args.length == 3) unwatchAllEvents(...args);
}

export const getOrigins = async () => {
	return Object.keys(await getEvents());
}
const originWatchers = new Set();
export const watchOrigins = async callback => {
	originWatchers.add(callback);
	callback(await getOrigins());
}
export const unwatchOrigins = callback => {
	originWatchers.delete(callback);
}

const getSourcesFromEvents = (events = []) => {
	const sources = new Set();
	events.forEach( ({type, source}) => {
		if(type == 'event') sources.add(source);
	});
	return sources;
}
export const getSources = async origin => {
	const events = await getEvents();
	if(!events[origin]) return [];
	return getSourcesFromEvents(events[origin]);
}
const sourceWatchers = new Map();
export const watchSources = async (origin, callback) => {
	if(!sourceWatchers.has(origin)) sourceWatchers.set(origin, new Set());
	sourceWatchers.get(origin).add(callback);
	callback(await getSources(origin));
}
export const unwatchSources = (origin, callback) => {
	if(!sourceWatchers.has(origin)) sourceWatchers.get(origin).delete(callback);
}

export const deleteEvent = async (_id) => {
	const event = await getEvent(_id);
	if(!event) return false;
	const { origin } = event;
	if(!origin) return false;
	const events = await getEvents();
	if(!events) return false;
	const index = events[origin].findIndex( ({id}) => id == _id);
	if(index === -1) return false;
	events[origin].splice(index, 1);
	await chrome.storage.local.set({events});
	const viewEvent = await getSetting('viewEvent');
	if(viewEvent === _id){
		await saveSetting('viewEvent', false);
	}
	return true;
}

export const deleteSourceEvents = async (origin, _source) => {
	const events = await getEvents();
	if(!events[origin]) return false;
	let nextSourceEventIndex = events[origin].findIndex(({source})=>source===_source);
	let removedSome = false;
	while(nextSourceEventIndex !== -1){
		events[origin].splice(nextSourceEventIndex, 1);
		nextSourceEventIndex = events[origin].findIndex(({source})=>source===_source);
		removedSome = true;
	}
	if(removedSome){
		await chrome.storage.local.set({events});
		const [ originSetting, sourceSetting ] = await getSetting('source');
		if(
			originSetting === origin &&
			sourceSetting === _source
		){
			saveSetting('source', []);
		}
		if(!(await getEvent(await getSetting('viewEvent')))){
			await saveSetting('viewEvent', false);
		}
		return true;
	}
	return false;
}
export const deleteOriginEvents = async (origin) => {
	const events = await getEvents();
	if(!events[origin]) return false;
	delete events[origin];
	await chrome.storage.local.set({events});
	const [ originSetting ] = await getSetting('source');
	if(originSetting === origin){
		await saveSetting('source', []);
	}
	if(!(await getEvent(await getSetting('viewEvent')))){
		await saveSetting('viewEvent', false);
	}
	return true;
}
export const deleteEvents = async (origin = false, source = false) => {
	if(origin && source) return await deleteSourceEvents(origin, source);
	else if(origin) return await deleteOriginEvents(origin);
	else {
		chrome.storage.local.set({events: {}});
		await saveSetting('source', []);
		await saveSetting('viewEvent', false);
	}
}

chrome.storage.local.onChanged.addListener( changes => {
	if(!changes.events) return;
	const oldEvents = changes.events.oldValue;
	const newEvents = changes.events.newValue;

	allEventsWatchers.forEach(cb=>cb(newEvents));

	originEventWatchers.forEach( (callbacks, origin) => {
		if(!equal(oldEvents[origin], newEvents[origin])){
			callbacks.forEach(cb => cb(newEvents[origin]));
		}
	});
	sourceEventWatchers.forEach( (sources, origin) => {
		sources.forEach( (callbacks, _source) => {
			const oldSourceEvents = (oldEvents[origin] || []).filter(({source, type})=>source === _source || type=='pageload');
			const newSourceEvents = (newEvents[origin] || []).filter(({source, type})=>source === _source || type=='pageload');
			if(!equal(oldSourceEvents, newSourceEvents)){
				callbacks.forEach(cb => cb(newSourceEvents));
			}
		});
	});

	const oldOrigins = Object.keys(oldEvents);
	const newOrigins = Object.keys(newEvents);
	if(!equal(oldOrigins, newOrigins)) originWatchers.forEach( cb => cb(newOrigins) );

	sourceWatchers.forEach( (callbacks, origin) => {
		const oldOriginSources = getSourcesFromEvents(oldEvents[origin] || []);
		const newOriginSources = getSourcesFromEvents(newEvents[origin] || []);
		if(!equal(oldOriginSources, newOriginSources)){
			callbacks.forEach( cb => cb(newOriginSources));
		}
	});
});
