import PaginationControl from './PaginationControl.js';

const optionsChangeHandler = Symbol(),
			pageSizeChangeHandler = Symbol(),
			selectChangeHandler = Symbol();
export default class PageSize extends PaginationControl {
	constructor(){
		super();

		/* Private Methods */
		this[optionsChangeHandler] = () => {
			const $perPage = this.shadowRoot.getElementById('perPage');
			const options = new Set(this.options.map(n=>parseInt(n)));
			if(this.$pagination){
				options.add(parseInt(this.$pagination.pageSize))
			}
			$perPage.innerHTML = [...options].sort((a,b)=>a-b).map( n => `<option>${n}</option>`).join('');
			$perPage.value = this.$pagination.pageSize;
		}
		this[pageSizeChangeHandler] = () => {

		}
		this[selectChangeHandler] = ({target: {value}}) => {
			if(this.$pagination){
				this.$pagination.pageSize = parseInt(value);
			}
		}
	}

	/* Lifecycle Callbacks */
	connectedCallback(){
		super.connectedCallback();
		(async()=>{
			await window.customElements.whenDefined('ev-pagination');
			this[optionsChangeHandler]();
		})();
		this.shadowRoot.getElementById('perPage').addEventListener('change', this[selectChangeHandler]);
	}
	disconnectedCallback(){
		super.disconnectedCallback();
		this.shadowRoot.getElementById('perPage').removeEventListener('change', this[selectChangeHandler]);
	}
	attributeChangedCallback(n, oV, nV){
		super.attributeChangedCallback(n, oV, nV);
		if(n === 'options'){
			this[optionsChangeHandler]();
		}
	}

	/* Protected Members */
	get options(){
		return (this.getAttribute('options') || '25 50 100 200').split(' ');
	}
	set options(v){
		if(v){
			this.setAttribute('options', v.join(' '));
		} else {
			this.removeAttribute('options');
		}
	}

	/* Shadow DOM */
	get shadowTemplate(){
		return /*html*/`
			<slot>Items</slot> per page
			<select id="perPage"></select>
		`;
	}
	get shadowStyles(){
		return /*css*/`
			${super.shadowStyles}
			:host {
				margin: calc(0.25 * var(--spacer));
			}
			#perPage {
				display: inline-block;
				border: none;
				padding: calc(0.125 * var(--spacer));
				width: min-content;
			}
		`;
	}

	/* Static Members */
	static get observedAttributes(){
		return [
			'options'
		];
	}
}
window.customElements.define('ev-pagination-control-pagesize', PageSize);
