import ButtonControl from './ButtonControl.js';

const pageChangeHandler = Symbol();
export default class Previous extends ButtonControl {
	constructor(){
		super(()=>{
			const $pagination = this.$pagination;
			if($pagination){
				$pagination.page = $pagination.page - 1;
			}
		});

		/* Private Methods */
		this[pageChangeHandler] = () => {
			this.disabled = this.$pagination.page === 1;
		}

		/* Init */
		this.innerHTML = /*svg*/`
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 48 48"
				class="icon"
			>
				<path
					fill="currentColor"
					d="M28.05 36 16 23.95 28.05 11.9l2.15 2.15-9.9 9.9 9.9 9.9Z"
				/>
			</svg>
		`;
	}
	connectedCallback(){
		super.connectedCallback();
		(async()=>{
			await window.customElements.whenDefined('ev-pagination');
			this.$pagination.on('pagechange pagesizechange', this[pageChangeHandler]);
		})();
	}
	disconnectedCallback(){
		this.$pagination.off('pagechange pagesizechange', this[pageChangeHandler]);
	}
}
window.customElements.define('ev-pagination-control-previous', Previous);