import React, { PureComponent } from 'react'

interface Props {
	onLayout?: (inst: Popup) => void;
	mask?: boolean;
	position?:
	| 'center'
	| 'top-left'
	| 'top-right'
	| 'bottom-right'
	| 'bottom-left'
	| 'top-center'
	| 'bottom-center';
	animitionType?:
	| 'none'
	| 'slideUp'
	| 'slideDown'
	| 'slideLeft'
	| 'slideRight'
	| 'fade';
	title?: string;
	onClose?: () => void;
	onConfirm?: () => void;
	onCancel?: () => void;
}
export default class Popup extends PureComponent<Props> {
	static defaultProps = {
		mask: true
	};

	componentDidMount() {
		this.init();
	}

	componentWillUnmount() {
		this.destory();
	}

	init() {
		this.props.onLayout && this.props.onLayout(this);
	}

	destory() {
		return new Promise(resolve => {
			resolve();
		});
	}

	render() {
		const { children, mask } = this.props;
		return (
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%'
				}}
			>
				{mask ? (
					<div
						style={{
							position: 'absolute',
							width: '100%',
							height: '100%',
							top: 0,
							left: 0,
							backgroundColor: 'rgba(0,0,0,0.9)'
						}}
					/>
				) : null}
				<div
					style={{
						position: 'absolute',
						top: '50%',
						left: ' 50%',
						transform: 'translate(-50%, -50%)',
						border: '1px solid #000000'
					}}
				>
					{this._renderHeader()}
					{children}
					{this._renderFooter()}
				</div>
			</div>
		);
	}
	
	_renderHeader() {
		const { title, onClose } = this.props;
		if (!title && !onClose) {
			return null;
		}
		return (
			<header
				style={{
					height: '40px',
					lineHeight: '40px',
					backgroundColor: '#252529',
					color: '#ccc',
					padding: '0 15px',
					position: 'relative'
				}}
			>
				<span>{title}</span>
				{onClose ? <span /> : null}
			</header>
		);
	}

	_renderFooter() {
		const { onCancel, onConfirm } = this.props;
		if (!onCancel && !onConfirm) {
			return null;
		}
		return (
			<footer
				style={{
					textAlign: 'center',
					height: '68px',
					lineHeight: '68px',
					backgroundColor: '#252529'
				}}
			>

			</footer>
		);
	}
}
