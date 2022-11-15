import Core from './Core.js';
import { isType } from '../utils/type.js';

const prevFocus = Symbol(),
			overlayKeyDownHandler = Symbol(),
			overlayClickHandler = Symbol();
export default class Dialog extends Core {
	constructor(){
		super();

		/* Private Members */
		this[prevFocus] = false;


		/* Private Methods */
		this[overlayKeyDownHandler] = ({keyCode}) => {
			if(this.overlayClose && [13,32].includes(keyCode)){
				this.close();
			}
		}
		this[overlayClickHandler] = ({target}) => {
			if(this.overlayClose && target === this.shadowRoot.getElementById('overlay')){
				this.close();
			}
		}
		
	}

	/* Lifecycle Callbacks */
	connectedCallback(){
		super.connectedCallback();
		this.shadowRoot.getElementById('close').addEventListener('click', this.close);
		this.shadowRoot.getElementById('focusAfter').addEventListener('focus', this.focus);
		this.shadowRoot.getElementById('overlay').addEventListener('keydown', this[overlayKeyDownHandler]);
		this.shadowRoot.getElementById('overlay').addEventListener('click', this[overlayClickHandler]);
	}
	disconnectedCallback(){
		super.disconnectedCallback();
		this.shadowRoot.getElementById('close').removeEventListener('click', this.close);
		this.shadowRoot.getElementById('focusAfter').removeEventListener('focus', this.focus);
		this.shadowRoot.getElementById('overlay').removeEventListener('keydown', this[overlayKeyDownHandler]);
		this.shadowRoot.getElementById('overlay').removeEventListener('click', this[overlayClickHandler]);
	}
	attributeChangedCallback(name, oldValue, newValue){
		super.attributeChangedCallback(name, oldValue, newValue);
		if(name === 'opened'){
			this.dispatch(`openedchange ${newValue?'opened':'closed'}`);
			if(newValue){
				this.focus();
			} else {
				this.blur();
			}
		}
	}

	/* Protected Members */
	get opened(){
		return this.getAttribute('opened') !== null;
	}
	set opened(v){
		if(v){
			this.setAttribute('opened', 'true');
		} else {
			this.removeAttribute('opened');
		}
	}
	get closeButton(){
		return this.getAttribute('close-btn') !== null;
	}
	set closeButton(v){
		if(v){
			this.setAttribute('close-button', 'true');
		} else {
			this.removeAttribute('close-button');
		}
	}
	get overlayClose(){
		return this.getAttribute('overlay-close') !== null;
	}
	set overlayClose(v){
		if(v){
			this.setAttribute('overlay-close', 'true');
		} else {
			this.removeAttribute('overlya-close');
		}
	}

	/* Public Methods */
	get open(){
		return () => {
			this.opened = true;
		}
	}
	get close(){
		return () => {
			this.opened = false;
		}
	}
	get focus(){
		return () => {
			const ae = document.activeElement;
			if(ae.closest('ev-dialog') !== this){
				this[prevFocus] = ae;
			}
			this.shadowRoot.getElementById('overlay').focus();
		}
	}
	get blur(){
		return () => {
			if(this[prevFocus]) this[prevFocus].focus();
		}
	}

	/* Shadow DOM */
	get shadowTemplate(){
		return /*html*/`
			<div id="overlay" tabindex="0">
				<div id="dialog">
					<div id="header">
						<div id="title" class="pxh pyq">
							<slot name="header"></slot>
						</div>
						<button
							id="close"
							class="pq"
						>
							<svg
								class="icon"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 48 48"
							>
								<path
									fill="currentColor"
									d="m12.45 37.65-2.1-2.1L21.9 24 10.35 12.45l2.1-2.1L24 21.9l11.55-11.55 2.1 2.1L26.1 24l11.55 11.55-2.1 2.1L24 26.1Z"
								/>
							</svg>
						</button>
					</div>
					<div id="body" class="px">
						${super.shadowTemplate}
					</div>
					<div id="footer" class="pq">
						<slot name="footer"></slot>
					</div>
				</div>
			</div>
			<div id="focusAfter" tabindex="0"></div>
		`;
	}
	get shadowStyles(){
		return /*css*/`
			${super.shadowStyles}
			:host {
				display: block;
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				z-index: 999;
			}
			:host(:not([opened])) {
				display: none;
			}
			#overlay {
				display: flex;
				align-items: center;
				justify-content: center;
				background-color: rgba(128, 128, 128, 0.25);
				width: 100%;
				height: 100vh;
				outline: none;
			}
			:host([overlay-close]) #overlay:focus {
				box-shadow: inset 0 0 2px 1px var(--c_primary);
			}
			#dialog {
				display: flex;
				flex-direction: column;
				background-color: var(--c_bg);
				border-radius: var(--radius);
				box-shadow: var(--drop_shadow);
				min-width: 12rem;
				width: fit-content;
				max-width: calc(100% - (2 * var(--spacer)));
				min-height: 10rem;
				height: fit-content;
				max-height: calc(100% - (2 * var(--spacer)));
			}
			#header {
				display: flex;
				flex: 0 0;
			}
			#title {
				flex: 1 1 auto;
				font-size: 16px;
			}
			:host(:not([close-button])) #close {
				display: none;
			}
			#close {
				font-size: 12px;
			}
			#body {
				flex: 1 1 auto;
			}
			#footer {
				display: flex;
				flex: 0 0;
				justify-content: flex-end;
			}
		`;
	}

	/* Static Members */
	static get observedAttributes(){
		return [
			'opened'
		];
	}

	/* Static Methods */
	static get open(){
		return ({
			title = '',
			closeButton = true,
			overlayClose = true,
			message = '',
			falseText = false,
			falseAction = ()=>{},
			falseClass = 'danger',
			trueText = false,
			trueAction = ()=>{},
			trueClass = 'success',
			callback = () => {}
		}) => {
			const $dialog = new Dialog();
			$dialog.innerHTML = /*html*/`
				<span slot="header">${title}</span>
				${message}
			`;
			if(falseText){
				const $false = document.createElement('button');
				$false.slot = 'footer';
				$false.innerHTML = falseText;
				$false.className = `pxh pyq mrh mbh ${falseClass}`;
				$false.addEventListener('click', ()=>{
					const close1 = falseAction(false);
					const close2 = callback(false);
					// only dont close if one callback explicity returned false
					if(close1 !== false && close2 !== false){
						$dialog.close();
						$dialog.remove();
					}
				});
				$dialog.appendChild($false);
			}
			if(trueText){
				const $true = document.createElement('button');
				$true.slot = 'footer';
				$true.innerHTML = trueText;
				$true.className = `pxh pyq mrh mbh ${trueClass}`;
				$true.addEventListener('click', ()=>{
					const close1 = trueAction(true);
					const close2 = callback(true);
					// only dont close if one callback explicity returned false
					if(close1 !== false && close2 !== false){
						$dialog.close();
						$dialog.remove();
					}
				});
				$dialog.appendChild($true);
			}
			$dialog.closeButton = closeButton;
			$dialog.overlayClose = overlayClose;
			document.body.appendChild($dialog);
			$dialog.open();
		}
	}
	static get alert(){
		return (message, options) => {
			Dialog.open({
				message,
				...{
					trueText: "OK" 
				},
				...options
			});
		}
	}
	static get confirm(){
		return (message, callback, options) => {
			Dialog.open({
				message,
				callback,
				...{
					closeButton: false,
					overlayClose: false,
					trueText: "Yes",
					falseText: "No",
					title: "Confirm"
				},
				...options
			});
		}
	}
}
window.customElements.define('ev-dialog', Dialog);
