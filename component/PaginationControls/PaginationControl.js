import Core from '../Core.js';

const $pagination = Symbol();
export default class PaginationControl extends Core {
	constructor(){
		super();

		/* Private Members */
		this[$pagination] = false;
		
		/* Init */
		this.slot = 'controls';
	}

	/* Lifecycle Callbacks */
	connectedCallback(){
		super.connectedCallback();
		(async()=>{
			this[$pagination] = this.closest('ev-pagination');
		})();
	}
	
	/* Protected Members */
	get $pagination(){
		return this[$pagination];
	}
}
window.customElements.define('ev-pagination-control', PaginationControl);
