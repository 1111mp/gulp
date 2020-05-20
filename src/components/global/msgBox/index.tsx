import './styles.styl'

import React, { Component, Fragment } from 'react'
import ReactDOM from 'react-dom'
import { CSSTransition } from 'react-transition-group'

export function Portal(WrappedComponent: Component) {
	return class extends Component<IAnyObject> {
		node: any = null

		constructor(props: IAnyObject) {
			super(props);
			//直接插入dom节点到body下
			/**
			 * 不支持同一节点重复createPortal 会被覆盖
			 * https://github.com/facebook/react/issues/10713
			 */
			if (!this.node) {
				let root = document.getElementById('msg_box') || null
				if (!root) {
					root = document.createElement("div")
					root.id = "msg_box"
					document.body.appendChild(root)
				}
				this.node = document.createElement("div")
				root.appendChild(this.node)
			}
		}
		//组件即将卸载时候删除dom节点
		componentWillUnmount() {
			this.node && this.node.remove();
		}
		//渲染内容
		renderContent() {
			return (
				<Fragment>
					{/*给WrappedComponent传递props*/}
					// @ts-ignore: 忽略编译报错
					<WrappedComponent {...this.props} />
				</Fragment>
			)
		}
		render() {
			return (
				this.node && ReactDOM.createPortal(this.renderContent(), this.node)
			)
		}
	}
}

interface Props {
	title?: string;
	type?: string;
	noticeType?: number;
	visible?: boolean;
	friend?: any;
	submit?: VoidFunction;
	cancle?: VoidFunction;
	close?: VoidFunction;
}

class MsgBox extends Component<Props> {
	state = {
		visible: false,
		noticeVisible: false
	}

	timer: any = null

	static defaultProps = {
		title: '好友邀请',
		friend: {}
	}

	static getDerivedStateFromProps(props: any, state: any) {
		return {
			visible: props.visible
		}
	}

	componentDidMount() {
		if (this.props.type === 'notice') {
			this.timer = setTimeout(() => {
				this.setState({ noticeVisible: true })
			}, 200)
		}
	}

	componentWillUnmount() {
		this.timer = null
	}

	closeHandle = () => {
		this.props.close && this.props.close()
	}

	render() {
		const { visible, noticeVisible } = this.state
		const { title, type, noticeType, friend, submit, cancle } = this.props
		if (type === 'delete') {
			return (
				<Fragment>
					<CSSTransition
						in={visible}
						timeout={200}
						unmountOnExit
					>
						<Fragment>
							<div className="delete-wrapper-bg"></div>
							<div className="delete-wrapper">
								<header className="msg_box-header">
									{title}
									<p className="msg_box-container-close" onClick={this.closeHandle}>
										<i className="iconfont icontop-close"></i>
									</p>
								</header>
								<div className="msg_box-content">
									<p className="msg_box-avatar" style={{ backgroundImage: `url(${friend.avatarUrl})` }}></p>
									{
										type === 'delete' ? (
											<Fragment>
												<p className="msg_box-name">{friend.remark || friend.nickName}</p>
												<p className="msg_box-desc">删除好友后你将从对方联系人列表中消失，若要恢复好友需要再次添加。</p>
											</Fragment>
										) : null
									}
								</div>
								<footer className="msg_box-footer">
									{
										type === 'delete' ? (
											<Fragment>
												<p className="msg_box-btn" onClick={() => submit && submit()}>确定</p>
												<p className="msg_box-btn" style={{ marginLeft: '20px' }} onClick={() => cancle && cancle()}>取消</p>
											</Fragment>
										) : null
									}
								</footer>
							</div>
						</Fragment>
					</CSSTransition>
				</Fragment>
			)
		}
		if (type === 'custom') {
			return (
				<Fragment>
					<CSSTransition
						in={visible}
						timeout={200}
						unmountOnExit
						classNames="msg_box"
					>
						<Fragment>
							<div className="delete-wrapper-bg"></div>
							<div className="delete-wrapper custom-wrapper">
								<header className="msg_box-header">
									<p className="title">{title}</p>
									<p className="msg_box-container-close" onClick={this.closeHandle}>
										<i className="iconfont icontop-close"></i>
									</p>
								</header>
								{this.props.children && this.props.children}
							</div>
						</Fragment>
					</CSSTransition>
				</Fragment>
			)
		}
		if (type === 'notice') {
			return (
				<Fragment>
					<CSSTransition
						in={noticeVisible}
						timeout={200}
						unmountOnExit
						classNames="notice_box"
					>
						<div className="msg_box-wrapper">
							<header className="msg_box-header">
								{title}
								<p className="msg_box-container-close" onClick={this.closeHandle}>
									<i className="iconfont icontop-close"></i>
								</p>
							</header>
							<div className="msg_box-content">
								<p className="msg_box-avatar" style={friend.avatarUrl ? { backgroundImage: `url(${friend.avatarUrl})` } : {}}></p>
								{
									/** noticeType为0时 申请添加好友通知 */
									noticeType === 0 ? (
										<Fragment>
											<p className="msg_box-name">{friend.nickName || ''}</p>
											<p className="msg_box-desc">请求添加你为好友</p>
										</Fragment>
									) : null
								}
								{/* <p className="msg_box-desc">删除好友后你将从对方联系人列表中消失，若要恢复好友需要再次添加。</p> */}
								{
									noticeType === 2 ? (
										<Fragment>
											<p className="msg_box-name">{friend.nickName || ''}</p>
											<p className="msg_box-desc">拒绝了你的好友邀请</p>
										</Fragment>
									) : null
								}
								{/* {
									type === 'delete' ? (
										<Fragment>
											<p className="msg_box-name">名字可以七个字</p>
											<p className="msg_box-desc">删除好友后你将从对方联系人列表中消失，若要恢复好友需要再次添加。</p>
										</Fragment>
									) : null
								} */}
							</div>
							<footer className="msg_box-footer">
								{
									/** noticeType为0时 申请添加好友通知 */
									noticeType === 0 ? (
										<Fragment>
											<p className="msg_box-btn" onClick={() => submit && submit()}>同意</p>
											<p className="msg_box-btn" style={{ marginLeft: '20px' }} onClick={() => cancle && cancle()}>拒绝</p>
										</Fragment>
									) : null
								}
								{/* <p className="msg_box-btn">确定</p>
								<p className="msg_box-btn" style={{marginLeft: '20px'}}>取消</p> */}
								{
									noticeType === 2 ? (
										<p className="msg_box-btn" style={{ width: '120px' }} onClick={() => submit && submit()}>知道了</p>
									) : null
								}
								{/* {
									type === 'delete' ? (
										<Fragment>
											<p className="msg_box-btn" onClick={() => submit && submit()}>确定</p>
											<p className="msg_box-btn" style={{ marginLeft: '20px' }} onClick={() => cancle && cancle()}>取消</p>
										</Fragment>
									) : null
								} */}
							</footer>
						</div>
					</CSSTransition>
				</Fragment>
			)
		}
	}
}
// @ts-ignore: 忽略编译报错
export default Portal(MsgBox)