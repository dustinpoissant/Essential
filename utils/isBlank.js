import {
	isType
} from './type.js';

export default v => {
	return (
		v === '' ||
		(isType(v, 'object') && Object.keys(v).length === 0) ||
		(isType(v, 'array') && v.length === 0) ||
		(typeof(v) === 'undefined')
	);
}