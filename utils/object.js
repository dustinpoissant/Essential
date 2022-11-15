import {
	typeOf,
} from './type.js';

export const toJson = (obj) => {
	return JSON.stringify(obj, (key, value) => {
		if (key !== '' && value === obj) {
			return '<<Circular Reference>>';
		} else if (typeof(Element) !== 'undefined' && value instanceof Element) {
			return value.outerHTML;
		} else if(typeOf(value) === 'function'){
			return `<<Function ${key}>>`;
		}
		return value;
	});
};

export const flattenObject = (
	obj,
	maxDepth = 100,
	prevDepth = 0,
	parentKeys = []
) => {
	const thisDepth = prevDepth + 1;
	if (obj === null) return {};
	return Object.keys(obj).reduce((o, k) => {
		const v = obj[k];
		const key = [...parentKeys, k].join('.');
		if (typeOf(Element) !== 'undefined' && v instanceof Element) {
			return {
				...o,
				[key]: v.outerHTML
			};
		} else if (v === null) {
			return {
				...o,
				[key]: null
			};
		} else if (typeof v === 'object') {
			if (maxDepth <= thisDepth) {
				return {
					...o,
					[key]: '<<Max Depth Reached>>'
				};
			} else {
				return {
					...o,
					...flattenObject(v, maxDepth, thisDepth, [...parentKeys, k])
				};
			}
		} else {
			return {
				...o,
				[key]: v
			};
		}
	}, {});
};

export const objectSummary = (object, maxLength = 100) => {
	if (typeof object === 'object') {
		const flatObject = flattenObject(object);
		const kvp = []; // key value pairs
		Object.keys(flatObject).forEach((key) => {
			kvp.push(`${key} = ${objectSummary(flatObject[key])}`);
		});
		return kvp.join(', ').substring(0, maxLength);
	} else {
		return `${object}`.substring(0, maxLength);
	}
};

export const clone = (obj) => {
	const type = typeof obj;
	const Element =
		typeof window === 'undefined' ? class Element {} : window.Element; // So this can run in Node
	if (obj instanceof Element) {
		return obj.outerHTML;
	} else if (obj === null) {
		return null;
	} else if (
		['string', 'number', 'boolean', 'undefined', 'bigint'].includes(type)
	) {
		return obj;
	} else if (type === 'symbol') {
		return '<<SYMBOL>>';
	} else if (type === 'function') {
		return '<<function>>';
	} else if (obj instanceof Array) {
		return obj.map((item) => clone(item));
	} else if (type === 'object') {
		return Object.keys(obj).reduce((r, k) => {
			return {
				...r,
				[k]: clone(obj[k])
			};
		}, {});
	} else {
		return obj;
	}
};

export const equalObjs = (...objs) => {
	if (objs.length < 2) return true;
	const first = toJson(objs[0]);
	for (let i = 1; i < objs.length; i++) {
		if (first !== toJson(objs[i])) return false;
	}
	return true;
};

const pruneVar = (value) => {
	if (typeof value === 'undefined') {
		return [undefined, true];
	} else if (typeof value === 'string') {
		return [value, value === ''];
	} else if (value instanceof Array) {
		return [value, value.length === 0];
	} else if (value === null) {
		return [value, false];
	} else if (typeof value === 'object') {
		// eslint-disable-next-line no-use-before-define
		return pruneObject(value);
	}
	return [value, false];
};
const pruneObject = (object) => {
	const results = {};
	Object.keys(object).forEach((key) => {
		const [pruned, isBlank] = pruneVar(object[key]);
		if (!isBlank) {
			results[key] = pruned;
		}
	});
	return [results, Object.keys(results).length === 0];
};
export const prune = (object) => {
	return pruneObject(object)[0]
}