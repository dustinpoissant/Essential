import ButtonControl from './ButtonControl.js';

const pageChangeHandler = Symbol();
export default class Last extends ButtonControl {
	constructor(){
		super(()=>{
			const $pagination = this.$pagination;
			if($pagination){
				$pagination.page = 9999999999;
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
					d="m13.6 35.75-2.15-2.15 9.6-9.6-9.6-9.6 2.15-2.15L25.35 24ZM33 36V12h3v24Z"
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
window.customElements.define('ev-pagination-control-last', Last);