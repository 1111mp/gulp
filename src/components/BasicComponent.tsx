import * as React from 'react'
import { Component, Fragment } from 'react'
import EventBus from 'utils/eventBus'

/**
 * @description: 检测组件是否已经销毁，防止setState内存溢出 https://segmentfault.com/a/1190000017186299
 * @param {any} target  当前组件实例
 */
function injectUnmount(target: any) {
	/** 改装componentWillUnmount，销毁的时候记录一下 */
	const next = target.prototype.componentWillUnmount;

	target.prototype.componentWillUnmount = function (...args: any[]) {
		next && next.apply(this, args);
		this._unmount = true;
	}

	/** 对setState的改装，setState查看目前是否已经销毁 */
	const setState = target.prototype.setState;
	target.prototype.setState = function (...args: any[]) {
		if (this._unmount) return;
		setState.apply(this, args);
	}
}

@injectUnmount
export default class BasicComponent<Props = {}, State = {}, Other = any> extends Component<Props, State, Other> {

	/** 重命名componentDidMount 让BasicComponent与React的Component生命周期区分开 */
	componentDidMount(...args: any) {
		return this.didMount.apply(this, args);
	}

	didMount(...args: any[]) { }

	/** 重命名componentDidUpdate 让BasicComponent与React的Component生命周期区分开 */
	componentDidUpdate(...args: any) {
		return this.didUpdate.apply(this, args);
	}

	didUpdate(...args: any[]) { }

	/** 改造componentWillUnmount */
	componentWillUnmount(...args: any) {
		/** 这里可以做一些通过的操作 */
		return this.willUnmount.apply(this, args)
	}

	willUnmount(...args: any[]) { }

	/** 重命名render 让BasicComponent与React的Component render分开 */
	render() {
		return this.$render.apply(this)
	}

	$render() {
		return (
			<Fragment>
				$render
			</Fragment>
		)
	}

	/** react组件中加载js脚本
   * 参考：https://github.com/threepointone/react-loadscript/blob/master/src/index.js
   */
	$loadScript(url: string) {
		let timeout: number;

		return new Promise((resolve, reject) => {
			const head = document.querySelector('head');
			const elScript = document.createElement('script');
			let loadFinished = false;
			elScript.src = url;
			elScript.onload = () => {
				head && head.removeChild(elScript);
				clearTimeout(timeout);
				if (loadFinished) {
					return;
				}
				loadFinished = true;
				resolve();
			};
			head && head.appendChild(elScript);

			timeout = (window as any).setTimeout(() => {
				if (loadFinished) {
					return;
				}
				reject();
				loadFinished = true;
			}, 10 * 1e3); // 10秒超时
		});
	}

	/** EventBus 注册事件 */
	$addListener = (event: string, listener: Function) => {
		EventBus.addListener(event, listener)
	}

	/** EventBus 触发事件 */
	$emit = (event: string, ...args: any[]) => {
		EventBus.emit(event, args)
	}

	/** EventBus 移除事件 */
	$removeListener = (event: string, listener: Function) => {
		EventBus.removeListener(event, listener)
	}

	/** EventBus 移除所有的listener */
	$removeAllListeners = (event: string) => {
		EventBus.removeAllListeners(event)
	}

}