import ButtonControl from './ButtonControl.js';

const	pageChangeHandler = Symbol();
export default class GoToPage extends ButtonControl {
	constructor(_page){
		super(()=>{
			const $pagination = this.$pagination;
			if($pagination){
				$pagination.page = this.page;
			}
		});

		/* Private Methods */
		this[pageChangeHandler] = () => {
			this.disabled = this.$pagination.page === this.page;
		}

		/* Init */
		if(_page){
			this.page = _page;
			this.innerHTML = _page;
		}
	}
	connectedCallback(){
		super.connectedCallback();
		(async()=>{
			await window.customElements.whenDefined('ev-pagination');
			this.$pagination.on('pagechange', this[pageChangeHandler]);
			this[pageChangeHandler]();
		})();
	}
	disconnectedCallback(){
		this.$pagination.off('pagechange', this[pageChangeHandler]);
	}

	/* Protected Members */
	get page(){
		return Math.max(1, parseInt(this.getAttribute('page') || '1'));
	}
	set page(v){
		if(v){
			this.setAttribute('page', v);
		} else {
			this.removeAttribute('page');
		}
	}
}
window.customElements.define('ev-pagination-control-gotopage', GoToPage);