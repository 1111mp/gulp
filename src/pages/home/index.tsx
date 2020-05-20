import React from 'react'
import BasicComponent from 'components/BasicComponent'
import Popup from 'components/global/popup'

const styles = require('./styles.styl')

export default class Home extends BasicComponent {
	state = {
		visible: false
	}

	componentDidMount() {
		fetch('/time')
	}

	render() {
		const { visible } = this.state
		return (
			<div className={styles.container}>
				Home
				{
					/** 弹窗的使用 */
					visible ? (
						<Popup
							// title="选择头像"
						// onClose={this._closeAvatarList}
						// onConfirm={this._confirmAvatar}
						// onCancel={this._closeAvatarList}
						>
							<div>我是弹窗</div>
						</Popup>
					) : null
				}
			</div>
		)
	}
}