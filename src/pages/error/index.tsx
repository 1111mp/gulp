import React, { Component } from 'react'

const styles = require('./styles.styl')

interface ErrorProps {
	statusCode?: number;
}

export default class Error extends Component<ErrorProps> {
	render() {
		const { statusCode } = this.props
		return (
			<div className={styles.error}>Error: {statusCode}</div>
		)
	}
}