import * as React from 'react'
import { Component, Fragment } from 'react'
import { Provider } from 'mobx-react'
import { Router } from 'react-router-dom'
import { renderRoutes } from "react-router-config"
import { createBrowserHistory, createHashHistory } from 'history'
import { syncHistoryWithStore } from 'mobx-react-router'
import Config from './config'
import allRoutes from '@/routes/route.config'
import Error from 'pages/error'
import PopupContainer from 'components/global/popup/container'

const History = Config.isBorwserHistory
	? createBrowserHistory({
		basename: window.location.pathname
	})
	: createHashHistory()

type Props = {
	stores: any,
	statusCode: number
};

export default class Root extends Component<Props> {
	render() {
		const { stores, statusCode } = this.props
		return (
			<Fragment>
				<PopupContainer />
				{
					statusCode === 200 ? (
						<Provider {...stores}>
							<Router history={syncHistoryWithStore(History, stores.routerStore)} >
								{renderRoutes(allRoutes)}
							</Router>
						</Provider>
					) : (
							<Error statusCode={statusCode} />
						)
				}
			</Fragment>
		);
	}
}
