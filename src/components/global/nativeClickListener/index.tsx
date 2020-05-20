import React, { Component } from 'react'

interface Props {
	onClick?: (e: any) => void;
	target?: any
}

export default class NativeClickListener extends Component<Props> {
	_container: any = null

	clickHandler = (event: any) => {
		// console.log('NativeClickListener click')
		if (this._container.contains(event.target)) return

		const { onClick } = this.props
		onClick && onClick(event)
	}

	componentDidMount() {
		document.addEventListener('mousedown', this.clickHandler, false)
	}

	componentWillUnmount() {
		this._container = null
		document.removeEventListener('mousedown', this.clickHandler, false)
	}

	render() {
		return (
			<div ref={ref => this._container = ref}>
				{this.props.children}
			</div>
		)
	}
}

// _onClick = (e: any) => {
// 	let target: any = e.target
// 	let relate = [this._context]
// 	const container = document

// 	while (target) {
// 		if (/^(?:html|body)$/i.test(target.tagName) || (container && target === container)) {
// 			this.setState({ visible: false })
// 			break;
// 		}

// 		if (relate && relate.length) {
// 			let isMatch = false;

// 			for (let i = 0, len = relate.length; i < len; i++) {
// 				if (target === relate[i]) {
// 					isMatch = true;
// 					break;
// 				}
// 			}

// 			if (isMatch) break;
// 		}

// 		// if (target === this.refs.friend) break;

// 		target = target.parentNode;
// 	}
// }
