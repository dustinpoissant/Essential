import PaginationControl from './PaginationControl.js';
import GoToPage from './GoToPage.js';
import { bound } from '../../utils/number.js';

const renderButtons = Symbol();
export default class GoToPages extends PaginationControl {
	constructor(){
		super();

		/* Private Methods */
		this[renderButtons] = () => {
			const start = (Math.floor((this.$pagination.page-1)/this.show)*this.show)+1;
			const end = bound(start + (this.show-1), 1, this.$pagination.pageCount);
			this.innerHTML = '';
			for(let i=start; i<=end; i++){
				this.appendChild(new GoToPage(i));
			}
		}
	}

	/* Lifecycle Callbacks */
	connectedCallback(){
		super.connectedCallback();
		(async()=>{
			await window.customElements.whenDefined('ev-pagination');
			this.$pagination.on('pagechange pagesizechange', this[renderButtons]);
			this[renderButtons]();
		})();
	}
	disconnectedCallback(){
		super.disconnectedCallback();
		if(this.$pagination) this.$pagination.off('pagechange pagesizechange', this[renderButtons]);
	}
	attributeChangedCallback(n, oV, nV){
		super.attributeChangedCallback(n, oV, nV);
		if(n === 'show') this[renderButtons]();
	}

	/* Protected Members */
	get show(){
		return Math.max(2, parseInt(this.getAttribute('show') || '5'));
	}
	set show(v){
		if(v){
			this.setAttribute('show', v);
		} else {
			this.removeAttribute('show');
		}
	}

	/* Shadow DOM */
	get shadowTemplate(){
		return /*html*/`
			${super.shadowTemplate}
			<slot name="controls"></slot>
		`;
	}
	get shadowStyles(){
		return /*css*/`
			:host {
				display: inline-block;
				margin: 0 calc(0.125 * var(--spacer));
			}
		`;
	}

	/* Static Members */
	static get observedAttributes(){
		return [
			'show'
		];
	}
}
window.customElements.define('ev-pagination-control-gotopages', GoToPages);
