import { typeOf } from './type.js';
import {
	equalObjs
} from './object.js';

export default (...items) => {
	if(items.length < 2) return true;
	const first = items[0];
	return items.splice(1).every( item => {
		if( [
			'object',
			'array'
		].includes(typeOf(first))){
			return equalObjs(first, item);
		} else {
			return first === item;
		}
	});
}