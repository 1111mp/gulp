// @ts-ignore: 忽略编译报错
import React, { PureComponent } from 'react'

/**
 * 跨平台的弹窗封装思想 所有弹窗放在指定的根目录下
 */

import PopupContainer from './container'

export default class PopupWrapper extends PureComponent {
	private _id

	componentDidUpdate() {
		PopupContainer.getInstance().update(this._id, this.props);
	}

	componentDidMount() {
		this._id = PopupContainer.getInstance().insert(this.props)
	}

	componentWillUnmount() {
		PopupContainer.getInstance().remove(this._id)
	}

	render() {
		return null
	}
}
