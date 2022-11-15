import Core from './Core.js';
import bound from '../utils/bound.js';
import PaginationControl from './PaginationControls/PaginationControl.js';

const items = Symbol(),
			sorter = Symbol(),
			renderItems = Symbol();
export default class Pagination extends Core {
	constructor(){
		super();

		/* Private Members */
		this[items] = new Set();
		this[sorter] = ()=>0;

		/* Private Methods */
		this[renderItems] = () => {
			[...this.children]
				.filter(el=>!(el instanceof PaginationControl))
				.forEach(el=>el.remove());
			const items = this.items;
			items.sort(this.sorter);
			const start = this.pageSize * (this.page - 1);
			const end = start + this.pageSize;
			items.slice(start, end).forEach( item => {
				this.appendChild(item)
			});
		}

		/* Init */
		if(this.children.length){
			const children = [...this.children];
			const items = children
				.filter( el => {
					const io =	el instanceof PaginationControl;
					return !io;
				});
			this.addItem(...items);
		}
	}

	/* Lifecycle Callbacks */
	connectedCallback(){
		super.connectedCallback();
		
	}
	disconnectedCallback(){
		super.disconnectedCallback();

	}
	attributeChangedCallback(n, oV, nV){
		super.attributeChangedCallback(n, oV, nV);
		if(
			(n === 'page-size' && parseInt(oV) !== this.pageSize) ||
			(n === 'page' && parseInt(oV) !== this.page)
		) this[renderItems]();
		if(n === 'page' && oV !== nV){
			this.dispatch('pagechange', {
				oldValue: parseInt(oV),
				newValue: parseInt(nV)
			});
		}
		if(n === 'page-size' && oV !== nV){
			this.dispatch('pagesizechange', {
				oldValue: parseInt(oV),
				newValue: parseInt(nV)
			});
		}
	}

	/* Protected Members */
	get items(){
		return [...this[items]];
	}
	get pageSize(){
		return parseInt(this.getAttribute('page-size') || '50');
	}
	set pageSize(v){
		const n = parseInt(v);
		if(this.pageSize !== n){
			if(v){
				this.setAttribute('page-size', v);
			} else {
				this.removeAttribute('page-size');
			}
		}
	}
	get length(){
		return this.items.length;
	}
	get pageCount(){
		return Math.ceil(this.length / this.pageSize);
	}
	get page(){
		return parseInt(this.getAttribute('page') || '1');
	}
	set page(v){
		const n = parseInt(v);
		if(this.page !== n){
			if(n){
				this.setAttribute('page', bound(v, 0, this.pageCount));
			} else {
				this.removeAttribute('page');
			}
		}
	}
	get sorter(){
		return this[sorter];
	}
	set sorter(v){
		if(v !== this[sorter]){
			if(v){
				this[sorter] = v;
			} else {
				this[sorter] = ()=>0;
			}
			this[renderItems]();
		}
	}

	/* Public Methods */
	get addItem(){
		return (...i) => {
			i.forEach(item=>this[items].add(item));
			this.dispatch('change itemchange additem', { items: i });
			this[renderItems]();
		}
	}
	get removeItem(){
		return (...i) => {
			i.forEach(item=>this[items].add(item));
			this.dispatch('change itemchange removeitem', { items: i });
			this[renderItems]();
		}
	}

	/* Shadow DOM */
	get shadowTemplate(){
		return /*html*/`
			<div id="items">
				${super.shadowTemplate}
			</div>
			<div id="controls"><slot name="controls"></slot></div>
		`;
	}
	get shadowStyles(){
		return /*css*/`
			${super.shadowStyles}
			#controls {
				display: flex;
				flex-wrap: wrap;
				align-items: flex-start;
			}
		`;
	}

	/* Static Members */
	static get observedAttributes(){
		return [
			'page-size',
			'page'
		];
	}
}
window.customElements.define('ev-pagination', Pagination);
