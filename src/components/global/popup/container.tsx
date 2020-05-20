import React, { PureComponent, ReactElement, cloneElement } from 'react';

import Popup from './Popup';

let instance: Contianer;
let POPUP_ID = 1;
interface State {
	children: { [id: string]: ReactElement<Popup> };
}
export default class Contianer extends PureComponent<any> {
	static getInstance() {
		return instance;
	}

	state: State = {
		children: {}
	};

	popups: { [id: string]: Popup } = {};

	constructor(props: any) {
		super(props);
		instance = this;
	}

	componentDidUpdate() { }

	update(id: any, props: any) {
		const { children } = this.state;
		const child = children[id];
		// child.props = {...child.props,...props}
		children[id] = cloneElement(child, { ...child.props, ...props });
		this.forceUpdate();
	}

	insert(props: any) {
		const { children } = this.state;
		const id = POPUP_ID++;
		children[id] = (
			<Popup
				key={id}
				{...props}
				onLayout={popup => {
					this.popups[id] = popup;
				}}
			/>
		);
		this.setState({ children });
		this.forceUpdate();
		return id;
	}

	remove(id: string) {
		this.popups[id] &&
			this.popups[id].destory().then(() => {
				delete this.popups[id];
				delete this.state.children[id];
				this.setState({ children: this.state.children });
				this.forceUpdate();
			});
	}

	render() {
		const { children = {} } = this.state;
		const nodes: any[] = [];
		for (const o in children) {
			if (children[o]) {
				nodes.push(children[o]);
			}
		}

		if (nodes.length <= 0) {
			return null;
		}
		return (
			<div
				style={{
					height: '100%',
					width: '100%',
					position: 'fixed',
					top: '0',
					left: '0',
					zIndex: 999999
				}}
			>
				{nodes}
			</div>
		);
	}

	_popupLayout(popup: Popup) {
		popup.init();
	}

	_popupRemoved(popup: Popup) {
		popup.init();
	}
}
