import PaginationControl from './PaginationControl.js';

const action = Symbol(),
			clickHandler = Symbol(),
			keyDownHandler = Symbol();
export default class ButtonControl extends PaginationControl {
	constructor(_action = ()=>{}, _disabled = false){
		super();

		/* Private Members */
		this[action] = _action;

		/* Private Methods */
		this[clickHandler] = () => {
			if(!this.disabled){
				this[action]();
			}
		}
		this[keyDownHandler] = ({keyCode}) => {
			if([13,32].includes(keyCode) && !this.disabled) this[clickHandler]();
		}

		/* Init */
		this.tabIndex = 0;
		this.role = 'button';
	}
	
	/* Lifecycle Callbacks */
	connectedCallback(){
		super.connectedCallback();
		this.on('click', this[clickHandler]);
		this.on('keydown', this[keyDownHandler]);
	}
	disconnectedCallback(){
		super.disconnectedCallback();
		this.off('click', this[clickHandler]);
		this.off('keydown', this[keyDownHandler]);
	}
	

	/* Protected Members */
	get disabled(){
		return this.getAttribute('disabled') !== null;
	}
	set disabled(v){
		if(v){
			this.setAttribute('disabled', 'true');
		} else {
			this.removeAttribute('disabled');
		}
	}

	/* Shadow DOM */
	get shadowStyles(){
		return /*css*/`
			${super.shadowStyles}
			:host {
				display: inline-block;
				cursor: pointer;
				padding: calc(0.25 * var(--spacer));
				margin: calc(0.125 * var(--spacer));
				border: 1px solid var(--c_border);
				border-radius: var(--radius);
				min-width: 28px;
				min-height: 28px;
				text-align: center;
				line-height: 28px;
				vertical-align: top;
			}
			:host([disabled]){
				opacity: 0.6;
				pointer-events: none;
			}
		`;
	}
}
window.customElements.define('ev-pagination-control-button', ButtonControl);