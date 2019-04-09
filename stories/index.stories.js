'use strict';

import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';
import { ReactActionStatePath, ReactActionStatePathClient } from '../src/react-action-state-path'

import { Button, Welcome } from '@storybook/react/demo';

storiesOf('Welcome', module).add('to Storybook', () => <Welcome showApp={linkTo('Button')} />);

storiesOf('Button', module)
	.add('with text', () => <Button onClick={action('clicked')}>Hello Button</Button>)
	.add('with some emoji', () => (
		<Button onClick={action('clicked')}>
			<span role="img" aria-label="so cool">
				😀 😎 👍 💯
      </span>
		</Button>
	));

class PassiveClient extends React.Component {
	render (){
		return (
			<ReactActionStatePath {...this.props}>
				<RASPPassiveClient />
			</ReactActionStatePath>
		)
	}
}

class RASPPassiveClient extends ReactActionStatePathClient {
	constructor(props){
		super(props);
	}
	render(){
		const {children, ...newProps}=this.props;
		return (
			<div>
				<div>Passive Client</div>
				<Client rasp={this.childRASP('truncated','default')}/>
			</div>
		)
	}
}

class Client extends React.Component{
	render(){
		return(
			<ReactActionStatePath {...this.props} >
				<RASPClient />
			</ReactActionStatePath>
		)
	}
}

class RASPClient extends ReactActionStatePathClient {
	constructor(props){
		super(props,"hello",1)
		this.createDefaults();
	}

	actionFilters = {
		"HELLO": (action, delta) => { delta.hello = '1'; return true }
	}

	deriveRASP = (rasp, initialRASP) => {
		let parts = [];
		if (rasp.hello) parts.push('h');
		rasp.pathSegment = parts.join(',');
	}

	segmentToState(action, initialRASP) {
		var nextRASP = {};
		var parts = action.segment.split(',');
		parts.forEach(part => {
			if (part === 'h') nextRASP.hello = '1';
			else console.error("PanelItems.segmentToState unexpected part:", part);
		})
		this.deriveRASP(nextRASP,initialRASP);
		if (nextRASP.pathSegment !== action.segment) console.error("segmentToAction calculated path did not match", action.segment, nextRASP.pathSegment)
		return { nextRASP, setBeforeWait: true };  //setBeforeWait means set the new state and then wait for the key child to appear, otherwise wait for the key child to appear and then set the new state.
	}

	renderChildren (newProps) {
		return React.Children.map(this.props.children, child =>
		  React.cloneElement(child, newProps)
		);
	  }

	render() {
		const { children, path, rasp, ...newProps } = this.props;
		newProps.rasp=this.childRASP('truncated','1')
		return (
			<section>
				<div style={{ fontSize: rasp.hello ? "2rem" : "1rem" }} onClick={() => this.queueAction({ type: "HELLO" })}>Hello World!</div>
				{rasp.hello && (
						<Client rasp={this.childRASP("truncated",'1')} />
				)}
			</section>
		)
	}
}

storiesOf("RASP", module)
	.add("root", () => {
		var href=top.location.href;
		var parts=href.split('/');
		if(parts[0]==="http:" || parts[0]==='https:'){
			parts.shift(); //http:
			parts.shift(); //
			parts.shift(); //localhost:6006
		}
		return (
		<ReactActionStatePath RASPRoot="/?path=/story/rasp--root/" path={parts.join('/')}>
			<Client />
		</ReactActionStatePath>
	)})
	.add("2 deep", () => {
		var href=top.location.href;
		var parts=href.split('/');
		if(parts[0]==="http:" || parts[0]==='https:'){
			parts.shift(); //http:
			parts.shift(); //
			parts.shift(); //localhost:6006
		}
		return (
			<PassiveClient RASPRoot="/?path=/story/rasp--2-deep/" path={parts.join('/')} >
			</PassiveClient>
		)
	})