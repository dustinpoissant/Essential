import ButtonControl from './ButtonControl.js';

const pageChangeHandler = Symbol();
export default class Next extends ButtonControl {
	constructor(){
		super(()=>{
			const $pagination = this.$pagination;
			if($pagination){
				$pagination.page = $pagination.page + 1;
			}
		});

		/* Private Methods */
		this[pageChangeHandler] = () => {
			this.disabled = this.$pagination.page === this.$pagination.pageCount;
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
					d="m18.75 36-2.15-2.15 9.9-9.9-9.9-9.9 2.15-2.15L30.8 23.95Z"
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
window.customElements.define('ev-pagination-control-next', Next);