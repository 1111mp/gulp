import React, { Fragment } from "react";
import * as H from "history";
import { Prompt } from "react-router-dom";
import { withRouter, RouteComponentProps } from "react-router";
import MsgBox from './index'

export interface PromptProps extends RouteComponentProps {
	message: string | ((location: H.Location) => string | boolean);
	when?: boolean;
}

export class RouteLeavingGuard extends React.Component<
	PromptProps,
	{
		modalVisible: boolean;
		lastLocation: H.Location | null;
		confirmedNavigation: boolean;
	}
	> {

	constructor(props: PromptProps) {
		super(props);
		this.state = {
			modalVisible: false,
			lastLocation: null,
			confirmedNavigation: false
		};
	}

	showModal = (location: H.Location) =>
		this.setState({
			modalVisible: true,
			lastLocation: location
		});

	closeModal = (callback?: () => void) =>
		this.setState(
			{
				modalVisible: false
			},
			callback
		);

	handleBlockedNavigation = (nextLocation: H.Location) => {
		const { confirmedNavigation } = this.state;
		if (!confirmedNavigation) {
			this.showModal(nextLocation);
			return false;
		}

		return true;
	};

	handleConfirmNavigationClick = () =>
		this.closeModal(() => {
			const { lastLocation } = this.state;
			const { history } = this.props;
			if (lastLocation) {
				this.setState(
					{
						confirmedNavigation: true
					},
					() => {
            /**
             * 走跳转
             */
						history.push(lastLocation.pathname + lastLocation.search);
					}
				);
			}
		});

	render() {
		const { when, message } = this.props;
		// @ts-ignore: 忽略编译报错
		const { modalVisible, lastLocation } = this.state;
		return (
			<>
				<Prompt when={when} message={this.handleBlockedNavigation} />
				<MsgBox
					type="custom"
					title="提示"
					visible={modalVisible}
					close={() => this.closeModal()}
				>
					<Fragment>
						<div className="msg_box-content" style={{ width: 'calc(100% - 48px)', justifyContent: 'center' }}>
							<p className="msg_box-desc">{message}</p>
						</div>
						<footer className={'msg_box-footer'}>
							<p className="msg_box-btn" style={{ marginRight: '20px', borderRadius: '16px' }} onClick={() => this.closeModal()}>取消</p>
							<p className="msg_box-btn" style={{ borderRadius: '16px' }} onClick={this.handleConfirmNavigationClick}>确定</p>
						</footer>
					</Fragment>
				</MsgBox>
			</>
		);
	}
}
export default withRouter(RouteLeavingGuard)