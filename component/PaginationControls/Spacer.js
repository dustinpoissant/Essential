import PaginationControl from './PaginationControl.js';

export default class Spacer extends PaginationControl {
	/* Shadow DOM */
	get shadowStyles(){
		return /*css*/`
			${super.shadowStyles}
			:host {
				display: inline-block;
				flex: 1 1 auto;
			}
		`;
	}
}
window.customElements.define('ev-pagination-control-spacer', Spacer);
