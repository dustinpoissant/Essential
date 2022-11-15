import ButtonControl from './ButtonControl.js';

const pageChangeHandler = Symbol();
export default class First extends ButtonControl {
	constructor(){
		super(()=>{
			const $pagination = this.$pagination;
			if($pagination){
				$pagination.page = 1;
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
					d="M12 36V12h3v24Zm22.35-.15-11.7-11.7 11.7-11.7 2.15 2.15-9.55 9.55 9.55 9.55Z"
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
window.customElements.define('ev-pagination-control-first', First);