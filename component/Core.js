export default class Core extends HTMLElement {
	constructor(){
		super();
		this.attachShadow({mode: 'open'});
		this.render();
	}

	/* Lifecycle Callbacks */
	connectedCallback(){}
	disconnectedCallback(){}
	attributeChangedCallback(){}

	/* Public Methods */
	get render(){
		return () => {
			this.shadowRoot.innerHTML = `${this.shadowTemplate}<link href="essential.css" rel="stylesheet" /><style>${this.shadowStyles}<style>`;
		};
	}
	get dispatch(){
		return (events, data, options) => {
			events.split(' ').forEach( event =>  this.dispatchEvent(new CustomEvent(event, { ...options, detail: data })));
		}
	}
	get on(){
		return (events, handler) => {
			events.split(' ').forEach(event => this.addEventListener(event, handler));
		}
	}
	get off(){
		return (events, handler) => {
			events.split(' ').forEach(event => this.removeEventListener(event, handler));
		}
	}

	/* Shadow DOM */
	get shadowTemplate(){
		return /*html*/`
			<slot></slot>
		`;
	}
	get shadowStyles(){
		return /*css*/`
			:host {
				display: block;
			}
		`;
	}
}