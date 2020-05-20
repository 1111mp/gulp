'use strict'

class EventBus {
	static _instance: EventBus
	events: IAnyObject;

	/** 单例 仅适用于单线程语言 */
	static getInstance(): EventBus {
		if (!this._instance) {
			this._instance = new EventBus()
		}
		return this._instance
	}

	constructor() {
		/** init一次 */
		this.events = new Object()
	}

	/** 触发事件 */
	emit(event: string, ...args: any[]): void {
		if (typeof this.events[event] === 'undefined') {
			throw new Error(`${event} not registered yet!`)
		}
		this.events[event].length && this.events[event].forEach((listener: any) => {
			listener.apply(this, args)
		})
	}

	/** 注册事件 */
	addListener(event: string, listener: Function): void {
		if (typeof this.events[event] !== 'undefined') {
			this.events[event].push(listener)
		} else {
			this.events[event] = [listener]
		}
	}

	/** 移除事件 */
	removeListener(event: string, listener: Function): void {
		if (typeof this.events[event] === 'undefined') return
		let position: number = -1, list = this.events[event]
		for (let i = list.length - 1; i >= 0; i--) {
			if (list === listener) {
				position = i
				break;
			}
		}
		if (position < 0) return
		if (position === 0) {
			list.shift()
		} else {
			list.splice(position, 1)
		}
		this.events[event] = list
		if (this.events[event].length === 0) {
			delete this.events[event]
		}
	}

	/** 移除所有的listener */
	removeAllListeners(event: string): void {
		if (typeof this.events[event] === 'undefined') return
		delete this.events[event]
	}

}

export default EventBus.getInstance()
