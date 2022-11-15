import Core from './Core.js';

/* Symbols (Keys available in this file only... private) */
const privateMember = Symbol(),
			privateMethod = Symbol();
export default class ComponentTemplate extends Core {
	constructor(){
		super();

		/* Private Members */
		this[privateMember] = 'Hello World';

		/* Private Methods */
		this[privateMethod] = (...args) => {
			// Do something
		}
	}

	/* Lifecycle Callbacks */
	connectedCallback(){
		super.connectedCallback();
		// Init Things
	}
	disconnectedCallback(){
		super.disconnectedCallback();
		// Cleanup Things
	}
	attributeChangedCallback(name, oldValue, newValue){
		super.attributeChangedCallback(name, oldValue, newValue);
		// Update things when Attributes Change
	}

	/* Protected Members */
	get attrMem(){
		return this.getAttribute('attr-mem') || 'fallback';
	}
	set attrMem(v){
		if(v){
			this.setAttribute('attr-mem', v);
		} else {
			this.removeAttribute('attr-mem');
		}
	}
	get protected(){
		return this[privateMember];
	}
	set protected(value){
		const processed = value; // transform/validate v
		this[privateMember] = processed;
		// Maybe trigger some update
	}

	/* Shadow DOM */
		/* Install the VSCode "es6-string-html" extention to add proper syntax highlighting to the html/css below */
	get shadowTemplate(){
		return /*html*/`
			${super.shadowTemplate} <!-- contains default slot -->
			<!--
				Custom Markup
			-->
		`;
	}
	get shadowStyles(){
		return /*css*/`
			${super.shadowStyles}
			/* Custom Styles Here */
		`;
	}

	/* Static Members */
	static get observedAttributes(){
		return [ /* An Array of attributes (strings) that when changed will trigger the attributeChangedCallback */
			'attr-mem'
		];
	}
}
window.customElements.define('ev-component-template', ComponentTemplate); // Assign this Class to an HTML Tag
