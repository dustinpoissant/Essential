import PaginationControl from './PaginationControl.js';

const pageChangeHandler = Symbol(),
			itemChangeHandler = Symbol(),
			pageInputChangeHandler = Symbol();
export default class PageSelect extends PaginationControl {
	constructor(){
		super();

		/* Private Methods */
		this[pageChangeHandler] = () => {
			const $pagination = this.$pagination;
			if($pagination){
				const $page = this.shadowRoot.getElementById('page');
				$page.max = this.$pagination.pageCount;
				$page.value = $pagination.page;
			}
		}
		this[itemChangeHandler] = () => {
			this.shadowRoot.getElementById('pageCount').innerHTML = this.$pagination.pageCount;
		}
		this[pageInputChangeHandler] = ({target: { value }}) => {
			const $pagination = this.$pagination;
			if($pagination){
				$pagination.page = value;
			}
		}
	}

	/* Lifecycle Callbacks */
	connectedCallback(){
		super.connectedCallback();
		(async()=>{
			await window.customElements.whenDefined('ev-pagination');
			this.$pagination.on('pagechange pagesizechange', this[pageChangeHandler]);
			this.$pagination.on('itemchange pagesizechange', this[itemChangeHandler]);
			this.shadowRoot.getElementById('page').addEventListener('change', this[pageInputChangeHandler]);
			this[pageChangeHandler]();
			this[itemChangeHandler]();
		})();
	}
	disconnectedCallback(){
		super.disconnectedCallback();
		if(this.$pagination){
			this.$pagination.off('pagechange pagesizechange', this[pageChangeHandler]);
			this.$pagination.off('itemchange pagesizechange', this[itemChangeHandler]);
			this.shadowRoot.getElementById('page').removeEventListener('change', this[pageInputChangeHandler]);
		}
	}
	attributeChangedCallback(n, oV, nV){
		super.attributeChangedCallback(n, oV, nV);

	}

	/* Protected Members */


	/* Shadow DOM */
	get shadowTemplate(){
		return /*html*/`
			${super.shadowTemplate}
			Page
			<input
				id="page"
				type="number"
				min="1"
				step="1"
			/>
			of <span id="pageCount"></span>
		`;
	}
	get shadowStyles(){
		return /*css*/`
			:host {
				padding: calc(0.25 * var(--spacer));
			}
			#page {
				display: inline-block;
				padding: calc(0.125 * var(--spacer));
				border: none;
				width: min-content;
			}
		`;
	}
}
window.customElements.define('ev-pagination-control-pageselect', PageSelect);
