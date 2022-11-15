import Core from './Core.js';
import {
	getSetting,
	saveSetting
} from '../utils/settings.js';

const onMouseDown = Symbol(),
			onMouseMove = Symbol(),
			onMouseUp = Symbol();
export default class Split extends Core {
	constructor(){
		super();

		/* Constructor Scoped Variables */
		let startX,
				startW,
				startS,
				totalW;
		const $aside = this.shadowRoot.getElementById('aside'),
					$main = this.shadowRoot.getElementById('main');

		/* Private Methods */
		this[onMouseDown] = (event) => {
			totalW = this.getBoundingClientRect().width;
			startX = event.pageX;
			startW = $aside.getBoundingClientRect().width;
			startS = $aside.scrollLeft;
			window.addEventListener('mousemove', this[onMouseMove]);
			window.addEventListener('mouseup', this[onMouseUp]);
		}
		this[onMouseMove] = (event) => {
			const w = startW + (event.pageX - startX);
			this.style.setProperty('--aside_width', `${w}px`);
			$aside.scrollLeft = startS;
			return w;
		}
		this[onMouseUp] = (event) => {
			const w = this[onMouseMove](event);
			if(this.id){
				saveSetting(`split:${this.id}`, w)
			}
			window.removeEventListener('mousemove', this[onMouseMove]);
			window.removeEventListener('mouseup', this[onMouseUp]);
		}
	}

	/* Lifecycle Callbacks */
	connectedCallback(){
		super.connectedCallback();
		if(this.id){
			(async ()=>{
				const w = await getSetting(`split:${this.id}`, 220);
				this.style.setProperty('--aside_width', `${w}px`);
			})();
		}
		this.shadowRoot.getElementById('divider').addEventListener('mousedown', this[onMouseDown]);
	}
	disconnectedCallback(){
		super.disconnectedCallback();
		this.shadowRoot.getElementById('divider').removeEventListener('mousedown', this[onMouseDown]);
	}


	/* Shadow DOM */
	get shadowTemplate(){
		return /*html*/`
			<aside id="aside">
				<slot name="sidebar"></slot>
			</aside>
			<div id="divider"></div>
			<div id="main">
				${super.shadowTemplate}
			</div>
		`;
	}
	get shadowStyles(){
		return /*css*/`
			${super.shadowStyles}
			:host {
				--aside_width: 220px;

				display: block;
				height: 100%;
			}
			aside {
				display: inline-block;
				height: 100%;
				overflow: auto;
				width: var(--aside_width);
				vertical-align: top;
			}
			#divider {
				display: inline-block;
				width: 4px;
				height: 100%;
				cursor: ew-resize;
				vertical-align: top;
			}
			#divider::before {
				content: '';
				display: block;
				width: 1px;
				height: 100%;
				background-color: var(--c_border);
				vertical-align: top;
			}
			#main {
				display: inline-block;
				height: 100%;
				min-height: 0;
				max-height: 100%;
				overflow-y: auto;
				width: calc(100% - var(--aside_width) - 11px);
				vertical-align: top;
			}
		`;
	}
}
window.customElements.define('ev-split', Split);
