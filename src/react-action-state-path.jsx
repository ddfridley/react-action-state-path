'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import ClassNames from 'classnames';
import union from 'lodash/union';
import shallowequal from 'shallowequal';
import clone from 'clone';


// for comparing rasp states, we use equaly.  If a property in two objects is logically false in both, the property is equal.  This means that undefined, null, false, 0, and '' are all the same.
// and we make a deep compare
var equaly=function(a,b){
            if(!a && !b) return true; //if both are false, they are the same
            let t=typeof a;
            if(t !== typeof b) return false; // if not falsy and types are not equal, they are not equal
            if(t === 'object') return union(Object.keys(a),Object.keys(b)).every(k=>equaly(a[k],b[k])); // they are both objects, break them down and compare them
            if(t === 'function') return true; //treat functions are equal no matter what they are
            if(a && b) return a==b; // if both are truthy are they equal
            return false;
        }


//React Action State Path - manages the state of react components that interact with each other and change state based user interactions and interactions between stateful components.
//Components communicate through the rasp object, which is passed between them.  The basic component is
//rasp={shape: a string representing a shape.  You can have any shapes you want, this is using 'truncated', 'open' and 'collapsed' but this can be upto the implementation.  But all components will need to understand these shapes
//     depth: the distance of the component from the root (first) component.
//     toParent: the function to call to send 'actions' to the parent function
//     each child component can add more properties to it's state, through the actionToState function
//     }
//

var queue=0;

var qaction=function(func,delay){
    queue+=1;
    console.info("qaction queueing", queue);
    setTimeout(()=>{
        console.info("qaction continuing", queue);
        queue--;
        func();
        if(queue===0 && UpdateHistory) {
            console.info("qaction updating history");
            UpdateHistory();
        } else 
            console.info("qaction after continuing", queue)
            ;
    },0);
}

var queueAction=function(action){ // called by a client, with it's this
    console.info("queueAction", this.props.rasp.raspId, this.props.rasp.depth, this.constructor.name, action)
    qaction(()=>this.props.rasp.toParent(action),0)
}

var qhistory=function(func,delay){
    console.info("qhistory", queue, this.id, this.childName, this.childTitle);
    if(ReactActionStatePath.queue) console.info("ReactActionStatePath queue - would have been put off")
    if(queue>0) {
        console.info("qhistory put off"); 
        return;
    } else 
        setTimeout(func, delay);
}

var UpdateHistory;

export class ReactActionStatePath extends React.Component {

    constructor(props) {
        super(props);
        //if(this.debug.noop) console.log("ReactActionStatePath.constructor", this.constructor.name, this.props.rasp);
        this.toChild=null;
        this.childName='';
        this.childTitle='';
        this.debug=this.props.debugObject || {noop: false, near: true};
        this.waitingOn=false;
        this.initialRASP=Object.assign({},
                    {   shape: this.props.rasp && this.props.rasp.shape ? this.props.rasp.shape : 'truncated',
                        depth: this.props.rasp ? this.props.rasp.depth : 0  // for debugging  - this is my depth to check
                    },
                    this.props.initialRASP
                );
        if(typeof window !== 'undefined'){ // browser side, there should be no rasp
            if(!(this.props.rasp && this.props.rasp.toParent)){
                if(typeof ReactActionStatePath.nextId !== 'undefined') console.error("ReactActionStatePath.constructor no parent, but not root!");
            }else{
                this.props.rasp.toParent({type: "SET_TO_CHILD", function: this.toMeFromParent.bind(this), name: "ReactActionStatePath"});
            }
        } else { // server side, rasp is how we get the data out
            if(!this.props.rasp || (typeof this.props.rasp.depth === 'undefined')  || this.props.RASPRoot) {// this is this root
                if(this.debug.constructor) console.info("ReactActionStatePath.construction at root");
                if(typeof ReactActionStatePath.nextId !== 'undefined') {
                    if(this.debug.constructor) console.info("ReactActionStatePath.construction at root, but nextId was", ReactActionStatePath.nextId);
                    ReactActionStatePath.nextId=undefined;
                }
            }
            if(this.props.rasp && this.props.rasp.toParent){
                this.props.rasp.toParent({type: "SET_TO_CHILD", function: this.toMeFromParent.bind(this), name: "ReactActionStatePath"});
            }
        }
        // not an else of above because of the possibility that one might want to put a rasp and toParent before the first component
        if(typeof ReactActionStatePath.nextId === 'undefined') { // this is the root ReactActionStatePath
             ReactActionStatePath.nextId= 0;
             ReactActionStatePath.queue=0;  // initialize the queue count
             ReactActionStatePath.topState=null;
             if(this.props.path && this.props.path !== '/'){
                let pathSegments= this.props.path.split('/');
                while(pathSegments.length && !pathSegments[0]) pathSegments.shift(); // an initial '/' turns into an empty element at the beginning
                while(pathSegments.length && !pathSegments[pathSegments.length-1]) pathSegments.pop(); // '/'s at the end translate to null elements, remove them
                let root=(this.props.RASPRoot || '/h/').split('/');
                while(root.length && !root[0]) root.shift(); // shift off leading empty's caused by leading '/'s
                while(root.length && !root[root.length-1]) root.pop(); // '/'s at the end translate to null elements, remove them
                if(root.some(segment=>segment!==pathSegments.shift())) {console.error("ReactActionStatePath.componentDidMount path didn't match props", root, pathSegments )}
                ReactActionStatePath.pathSegments=pathSegments;
             }else
                ReactActionStatePath.pathSegments=[];

             if(typeof window !== 'undefined'){ // if we are running on the browser
                ReactActionStatePath.thiss=[];
                window.onpopstate=this.onpopstate.bind(this);
                window.ReactActionStatePath={thiss: ReactActionStatePath.thiss};
                UpdateHistory=this.updateHistory.bind(this);
                if(ReactActionStatePath.pathSegments.length===0) qhistory.call(this,()=>this.updateHistory(),0); // aftr things have settled down, update history for the first time
             }
            console.info("ReactActionStatePath.thiss", ReactActionStatePath.thiss);
        }
        this.id=ReactActionStatePath.nextId++; // get the next id

        this.state=this.getDefaultState();
        //below are variables not restored by RESET
        if(typeof window !== 'undefined')
            ReactActionStatePath.thiss[this.id]={parent: this, client: null};
        this.actionFilters={};
    }

    componentWillUnmount(){
        if(this.debug.componentWillUnmount) console.info("ReactActionStatePath.componentWillUnmount", this.id, this.childTitle);
        if(typeof window !== 'undefined'){
            ReactActionStatePath.thiss[this.id]=undefined;
            let id=this.id;
            if(id === (ReactActionStatePath.nextId -1)) {
                while(id && typeof ReactActionStatePath.thiss[id] === 'undefined') id--;
                if(!id && typeof ReactActionStatePath.thiss[id]==='undefined') ReactActionStatePath.nextId=undefined;
                else ReactActionStatePath.nextId=id+1;
            }
        }
    }

    // consistently get the default state from multiple places
    getDefaultState(){
        return {rasp: Object.assign({},this.initialRASP)}
    }

    // handler for the window onpop state
    // only the root ReactActionStatePath will set this 
    // it works by recursively passing the ONPOPSTATE action to each child RASP component starting with the root
    onpopstate(event){
        if(this.debug.onpopstate) console.info("ReactActionStatePath.onpopstate", this.id, {event})
        if(event.state && event.state.stateStack) {
            if(ReactActionStatePath.topState) console.error("ReactActionStatePath.onpopstate expected topState null, got:", ReactActionStatePath.topState);
            ReactActionStatePath.topState="ONPOPSTATE";
            let completionCheck=setTimeout(()=>{
                if(ReactActionStatePath.topState==="ONPOPSTATE"){
                    console.error("ReactActionStatePath.onpopstate ONPOPSTATE did not complete.", this);
                    ReactActionStatePath.topState=null;
                }
            },10000);
            this.toMeFromParent({type: "ONPOPSTATE", stateStack: event.state.stateStack, stackDepth: 0});
            if(this.debug.onpopstate) console.log("ReactActionStatePath.onpopsate: returned.")
            ReactActionStatePath.topState=null;
            clearTimeout(completionCheck);
        }
    }

    toMeFromChild(action) {
        if(this.debug.toMeFromChild) console.info("ReactActionStatePath.toMeFromChild", this.id, this.props.rasp && this.props.rasp.depth, this.childName, this.childTitle, action, this.state.rasp);
        if(this.debug.near && (action.distance===0 || action.distance===1)) console.info("ReactActionStatePath.toMeFromChild near", this.id, this.props.rasp && this.props.rasp.depth, this.childName, this.childTitle, action, this.state.rasp);
        var  nextRASP={}, delta={};
        if(!action.distance) action.distance=0; // action was from component so add distance
        if(action.distance < 0) {action.distance +=1; if(this.id) return this.props.rasp.toParent(action); else return }
        if(action.direction==="DESCEND") return this.toChild(action);
        else action.direction="ASCEND";
        if(action.type==="SET_TO_CHILD") { // child is passing up her func
            if(typeof action.debug === 'number') this.debug.noop=action.debug;
            else if(typeof action.debug==='object') Object.assign(this.debug,action.debug);
            else if(action.debug) console.error("ReactActionStatePath.toMeFromChild unexpected debug in action",  this.id, this.props.rasp && this.props.rasp.depth, this.childName, this.childTitle, action, this.state.rasp);
            if(this.debug.SET_TO_CHILD) console.info("ReactActionStatePath.toMeFromChild debug set", this.debug.noop, this.id, this.props.rasp && this.props.rasp.depth, this.childName, this.childTitle, action, this.state.rasp);
            if(!(this.toChild = action.function)){
                this.childName=undefined;
                this.actionToState=undefined;
                if(typeof window!=='undefined' && ReactActionStatePath.thiss[this.id] && ReactActionStatePath.thiss[this.id].client) ReactActionStatePath.thiss[this.id].client=undefined;
                return;
            }
            if(action.name) this.childName=action.name;
            if(action.actionToState) this.actionToState=action.actionToState; 
            if(action.clientThis && (typeof window !== 'undefined')) 
                ReactActionStatePath.thiss[this.id].client=action.clientThis;
            else {
                if(typeof window !== 'undefined')
                    console.error("ReactActionStatePath.toMeFromChild SET_TO_CHILD clientThis missing on browser", this.id, this.props.rasp && this.props.rasp.depth, this.childName, this.childTitle, action);
            }
            if((typeof window !== 'undefined') && this.id===0 && ReactActionStatePath.pathSegments.length ){ // this is the root and we are on the browser and there is at least one pathSegment
                if(this.debug.SET_PATH) console.log("ReactActionStatePath.toMeFromChild will SET_PATH to",ReactActionStatePath.pathSegments);
                if(ReactActionStatePath.topState) console.error("ReactActionStatePath.toMeFromChild SET_TO_CHILD, expected topState null got:", ReactActionStatePath.topState);
                this.completionCheck=setTimeout(()=>{
                    if(ReactActionStatePath.topState==="SET_PATH"){
                        console.error("ReactActionStatePath.toMeFromChild SET_PATH did not complete", this);
                        ReactActionStatePath.topState=null;
                    }
                },10000);
                qaction(()=>{
                    ReactActionStatePath.topState="SET_PATH";
                    this.toChild({type: "SET_PATH", segment: ReactActionStatePath.pathSegments.shift(), initialRASP: this.initialRASP });
                },0); // this starts after the return toChild so it completes.
            } else if(this.waitingOn){
                var nextFunc=this.waitingOn.nextFunc;
                this.waitingOn=null;
                qaction(nextFunc,0);
                return;
            }
        }else if (action.type==="SET_ACTION_FILTER"){
            if(this.actionFilters[action.filterType]) this.actionFilters[action.filterType].push({name: action.name, function: action.function});
            else this.actionFilters[action.filterType]=[{name: action.name, function: action.function}];
            return;
        } else if (action.type==="RESET_ACTION_FILTER"){
            Object.keys(this.actionFilters).forEach(key=>{
                this.actionFilters[key]=this.actionFilters[key].filter(filter=>filter.name !== action.name); // remove all action filters from that constructor based on it's name
                if(!this.actionFilters[key].length) delete this.actionFilters[key];
            })
            return;
        } else if (action.type==="SET_DATA"){
            if(this.debug.noop) console.log("ReactActionStatePath.toMeFromChild SET_DATA", this.id, this.props.rasp && this.props.rasp.depth, action.nextRASP);
            this.setState({rasp: Object.assign({},this.state.rasp, {data: action.data})});
        }else if (action.type==="SET_STATE"){
            if(this.debug.noop) console.log("ReactActionStatePath.toMeFromChild SET_STATE", this.id, this.props.rasp && this.props.rasp.depth, action.nextRASP);
            this.setState({rasp: Object.assign({},this.state.rasp, action.nextRASP)});
        }else if (action.type==="SET_TITLE"){
            if(this.debug.noop) console.log("ReactActionStatePath.toMeFromChild SET_TITLE", this.id, this.props.rasp && this.props.rasp.depth, action.nextRASP);
            this.childTitle=action.title; // this is only for pretty debugging
        }else if (action.type==="CONTINUE_SET_PATH"){
            if(ReactActionStatePath.pathSegments.length) {
                if(this.debug.noop) console.log("ReactActionStatePath.toMeFromChild CONTINUE to SET_PATH", this.id, this.props.rasp && this.props.rasp.depth, action.nextRASP);
                qaction(()=>action.function({type: 'SET_PATH', segment: ReactActionStatePath.pathSegments.shift(), initialRASP: this.initialRASP}),0);
            } else {
                if(this.debug.noop) console.log("ReactActionStatePath.toMeFromChild CONTINUE to SET_PATH last one", this.id, this.props.rasp && this.props.rasp.depth, this.state.rasp);
                if(this.id!==0) this.props.rasp.toParent({type: "SET_PATH_COMPLETE"}); else { if(this.debug.noop) console.log("ReactActionStatePath.toMeFromChild CONTINUE_SET_PATH updateHistory"); this.updateHistory()};
            }
        }else if (action.type==="SET_STATE_AND_CONTINUE"){
            if(ReactActionStatePath.pathSegments.length) {
                if(this.debug.noop) console.log("ReactActionStatePath.toMeFromChild SET_STATE_AND_CONTINUE to SET_PATH", this.id, this.props.rasp && this.props.rasp.depth, action.nextRASP);
                if(action.function)
                    this.setState({rasp: Object.assign({},this.state.rasp, action.nextRASP)},()=>action.function({type: 'SET_PATH', segment: ReactActionStatePath.pathSegments.shift(), initialRASP: this.initialRASP}));
                else {
                    console.error("ReactActionStatePath.toMeFromChild SET_STATE_AND_CONTINUE pathSegments remain, but no next function", this.id, this.childTitle, action, ReactActionStatePath.pathSegments);
                    this.setState({rasp: Object.assign({},this.state.rasp, action.nextRASP)});
                }
            } else {
                if(this.debug.noop) console.log("ReactActionStatePath.toMeFromChild SET_STATE_AND_CONTINUE last one", this.id, this.props.rasp && this.props.rasp.depth, this.state.rasp, action.nextRASP);
                this.setState({rasp: Object.assign({},this.state.rasp, action.nextRASP)}, ()=>{ 
                    if(this.id!==0) this.props.rasp.toParent({type: "SET_PATH_COMPLETE"}); 
                    else { 
                        if(this.debug.noop) console.log("ReactActionStatePath.toMeFromChild  SET_STATE_AND_CONTINUE last one updateHistory");
                        ReactActionStatePath.topState=null;
                        clearTimeout(this.completionCheck);
                        this.updateHistory()} 
                    });
            }
        }else if(action.type==="SET_PATH_COMPLETE") {
            if(this.id!==0) return this.props.rasp.toParent({type: "SET_PATH_COMPLETE"});
            else {
                if(this.debug.noop) console.log("ReactActionStatePath.toMeFromChild SET PATH COMPLETED, updateHistory");
                ReactActionStatePath.topState=null;
                clearTimeout(this.completionCheck);
                return this.updateHistory();
            }
        }else if(action.type==="RESET") {
            this.setState(this.getDefaultState()); // after clearing thechildren clear this state
            return null;
        }
        else if(
                ((this.actionFilters[action.type] && this.actionFilters[action.type].every(filter=>filter.function(action, delta))), true) // process action filters until on returns false and always evaluate to true
            &&  (this.actionToState && ((nextRASP=this.actionToState(action, this.state.rasp, "CHILD", this.getDefaultState().rasp, delta)))!==null) // if no actionToState or actionToState returns NULL propogate the action on, otherwise the action ends here
        )
        {
            if((this.state.rasp.pathSegment) && !(nextRASP.pathSegment)) {  // path has been removed
                if(this.debug.noop) console.log("ReactActionStatePath.toChildFromParent child changed state and path being removed so reset children", this.id, this.state.rasp.pathSegment)
                //this.toChild({type:"CLEAR_PATH"}); // if toChild is not set let there be an error
            } else if(!(this.state.rasp.pathSegment) && (nextRASP.pathSegment)) { // path being added
                if(this.debug.noop) console.log("ReactActionStatePath.toChildFromParent path being added", this.id, nextRASP.pathSegment)
            }             

            if(this.id!==0 && !ReactActionStatePath.topState && (action.type==="DESCENDANT_FOCUS" || action.type==="DESCENDANT_UNFOCUS" || action.duration) ){
                if(typeof action.duration==='number') action.duration-=1;
                action.distance+=1;
                this.setState({rasp: nextRASP}, ()=>action.direction==='ASCEND' ? this.props.rasp.toParent(action) : (action.direction==='DESCEND' ? this.toChild(action) : console.error("ReactActionStatePath direction unknown", action, this.id, this.childName, this.childTitle)));
            } else if(this.id!==0){
                this.setState({rasp: nextRASP});
            }else { // this is the root, after changing shape, remind me so I can update the window.histor
                if(equaly(this.state.rasp,nextRASP)) { 
                    if(this.debug.noop) console.info("ReactActionStatePath.toMeFromChild actionToState equaly updateHistory", action); 
                    this.updateHistory()
                } // updateHistory now!
                else this.setState({rasp: nextRASP},()=>{ 
                    if(this.debug.noop) console.info("ReactActionStatePath.toMeFromChild actionToState setState updateHistory", action); 
                    qhistory.call(this,()=>this.updateHistory(),0); // update history after the queue of chanages from this state change is processed);
                }); // otherwise, set the state and let history update on componentDidUpdate
            }
        } 
        // these actions are overridden by the component's actonToState if either there is and it returns a new RASP to set (not null)
        else if(action.type === "DESCENDANT_FOCUS" || action.type ==="DESCENDANT_UNFOCUS"){
            if(this.id) { action.distance+=1; action.shape=this.state.rasp.shape; return this.props.rasp.toParent(action); }
            else return qhistory.call(this,()=>{ if(this.debug.noop) console.info("ReactActionStatePath.toMeFromChild ",action.type," updateHistory");this.updateHistory()},0);;
        } else if(action.type ==="CHANGE_SHAPE"){
            if(this.state.rasp.shape!==action.shape){ // really the shape changed
                var nextRASP=Object.assign({}, this.state.rasp, {shape: action.shape});
                if(this.id!==0){ // don't propogate a change
                    this.setState({rasp: nextRASP});
                }else // this is the root, change state and then update history
                    this.setState({rasp: nextRASP}, ()=>{ 
                        if(this.debug.noop) console.log("ReactActionStatePath.toMeFromChild CHANGE_SHAPE updateHistory");
                        qhistory.call(this,()=>this.updateHistory,0);// update history after changes from setstate have been processed
                    });
            } // no change, nothing to do
        } else if(action.type==="CHILD_SHAPE_CHANGED"){
            if(this.debug.noop) console.info("ReactActionStatePath.toMeFromChild CHILD_SHAPE_CHANGED not handled by actionToState",this.id, this.props.rasp && this.props.rasp.depth);
            if(this.id!==0) {   
                if(this.debug.noop) console.info("ReactActionStatePath.toMeFromChild CHILD_SHAPE_CHANGED not handled by actionToState, not root",this.id, this.props.rasp && this.props.rasp.depth, this.childTitle);
                this.props.rasp.toParent({type: "CHILD_SHAPE_CHANGED", shape: action.shape, distance: action.distance+1}); // pass a new action, not a copy including internal properties like itemId. This shape hasn't changed
            } else { // this is the root RASP, update history.state
                if(this.debug.noop) console.info("ReactActionStatePath.toMeFromChild CHILD_SHAPE_CHANGED not handled by actionToState at root", this.id, this.props.rasp && this.props.rasp.depth, this.childTitle);
                qhistory.call(this,()=>{ if(this.debug.noop) console.info("ReactActionStatePath.toMeFromChild CHILD_SHAPE_CHANGED default updateHistory");this.updateHistory()},0);
            }
        } else if(action.type==="CHILD_STATE_CHANGED"){
            if(this.debug.noop) console.info("ReactActionStatePath.toMeFromChild CHILD_STATE_CHANGED not handled by actionToState",this.id, this.props.rasp && this.props.rasp.depth);
            action.distance+=1;
            if(this.id!==0) {   
                if(this.debug.noop) console.info("ReactActionStatePath.toMeFromChild CHILD_STATE_CHANGED not handled by actionToState, not root",this.id, this.props.rasp && this.props.rasp.depth, this.childTitle);
                this.props.rasp.toParent(action); // passs the original action, with incremented distance
            } else { // this is the root RASP, update history.state
                if(this.debug.noop) console.info("ReactActionStatePath.toMeFromChild CHILD_STATE_CHANGED not handled by actionToState at root",this.id, this.props.rasp && this.props.rasp.depth, this.childTitle);
                if((typeof window === 'undefined' && this.props.rasp && this.props.rasp.toParent)) qaction(()=>this.props.rasp.toParent(action),0); // on server, send action to server renderer
                qhistory.call(this,()=>{ if(this.debug.noop) console.info("ReactActionStatePath.toMeFromChild CHILD_STATE_CHANGED default updateHistory");this.updateHistory()},0);
            }
        } else { // the action was not understood, send it up
            if(this.id) { action.distance+=1; return this.props.rasp.toParent(action); }
            else return;
        }
        return null;
    }

    toMeFromParent(action) {
        if(this.debug.noop) console.info("ReactActionStatePath.toMeFromParent", this.id, this.props.rasp && this.props.rasp.depth, this.childName, this.childTitle, action, this.state.rasp);
        if(this.debug.near && (action.distance===0 || action.distance==1)) console.info("ReactActionStatePath.toMeFromParent near", this.id, this.props.rasp && this.props.rasp.depth, this.childName, this.childTitle, action, this.state.rasp);
        if(typeof action.distance=== 'undefined') { 
            action.distance=0;
            action.direction="DESCEND";
        }
        var nextRASP={}, delta={};
        if (action.type==="ONPOPSTATE") {
            let {stackDepth, stateStack} = action;
            if(stateStack[stackDepth].depth !== (this.id ? this.props.rasp.depth : 0 )) console.error("ReactActionStatePath.toMeFromParent ONPOPSTATE state depth not equal to component depth",action.stateStack[stackDepth], this.props.rasp.depth); // debugging info
            if(stateStack.length > (stackDepth+1)){
                if(this.toChild) this.toChild({type: "ONPOPSTATE", stateStack: stateStack, stackDepth: stackDepth});
                else console.error("ReactActionStatePath.toMeFromParent ONPOPSTATE more stack but no toChild", {action}, {rasp: this.props.rasp});
            }else if(this.toChild) this.toChild({type: "CLEAR_PATH"}); // at the end of the new state, deeper states should be reset
            this.setState({rasp: stateStack[stackDepth]});
            return;
        } else if (action.type==="GET_STATE") {
            // return the array of all RASP States from the top down - with the top at 0 and the bottom at the end
            // it works by recursivelly calling GET_STATE from here to the end and then unshifting the RASP state of each component onto an array
            // the top RASP state of the array is the root component
            let stack;
            if(!this.toChild) {
                console.error("ReactActionStatePath.toMeFromParetn GET_STATE child not ready", this.id, this.props.rasp && this.props.rasp.depth, this.state.rasp);
                return [Object.assign({},this.state.rasp)];
            } else stack=this.toChild(action);
            if(stack) stack.unshift(Object.assign({},this.state.rasp)); // if non-rasp child is at the end, it returns null
            else stack=[Object.assign({},this.state.rasp)];
            return stack;
        } else if(action.type==="RESET") {
            this.setState(this.getDefaultState()); // reset my state first, then send RESET to child, because it will effect which childs child gets the reset.
            if(this.toChild) this.toChild(action); // this needs to be processed by the child, before actionToState is processed.
            return null;
        } else if(
                ((this.actionFilters[action.type] && this.actionFilters[action.type].forEach(filter=>filter.function(action, delta))), true) // process any action filters and always evaluate to true
                && this.actionToState
                && ((nextRASP=this.actionToState(action, this.state.rasp, "PARENT", this.getDefaultState().rasp, delta))!==null)
        )
        {
            if(!equaly(this.state.rasp, nextRASP)) { // really something changed
                if(this.id!==0){
                    this.setState({rasp: nextRASP});
                }else // no parent to tell of the change
                    this.setState({rasp: nextRASP}, ()=>{ 
                        if(this.debug.noop) console.log("ReactActionStatePath.toMeFromParent CONTINUE_SET_PATH updateHistory");
                        qhistory.call(this,()=>this.updateHistory,0); // update history after statechage events are processed
                    });
            } // no change, nothing to do
            return null;
        } else if(action.type==="CLEAR_PATH") {  // clear the path and reset the RASP state back to what the constructor would
            if(this.toChild) this.toChild(action); // clear children first
            this.setState(this.getDefaultState()); // after clearing thechildren clear this state
            return null;
        } else if(action.type==="RESET_SHAPE") {  // clear the path and reset the RASP state back to what the constructor would
            this.setState(this.getDefaultState()); //
            return null;
        }else if(action.type==="CHANGE_SHAPE"){ // change the shape if it needs to be changed
            nextRASP=Object.assign({},this.getDefaultState().rasp,{shape: action.shape}); // 
            this.setState({rasp: nextRASP});
            return null;
        }else if(action.type==="SET_PATH"){ // let child handle this one without complaint
            action.initialRASP=this.initialRASP; // segmentToState needs to apply this
            if(this.toChild) return this.toChild(action);
            else this.waitingOn={nextFunc: ()=>{this.toChild(action)}}
            return;
        }else {
            if(this.debug.noop) console.info("ReactActionStatePath.toMeFromParent: passing action to child", this.id, this.props.rasp && this.props.rasp.depth, this.childName, this.childTitle, action, this.state.rasp );
            return this.toChild(action);
        }
    }

    updateHistory() {
        if(this.debug.noop) console.info("ReactActionStatePath.updateHistory",  this.id);
        if(this.id!==0) console.error("ReactActionStatePath.updateHistory called but not from root", this.props.rasp);
        if(ReactActionStatePath.topState) console.error("ReactActionStatePath.updateHistory, expected topState null, got:", ReactActionStatePath.topState);
        if(queue) { 
            if(this.debug.noop) console.info("ReactActionStatePath.updateHistory waiting, queue is", queue);
            return null;
        }
        if(typeof window === 'undefined') { 
            if(this.debug.noop) console.info("ReactActionStatePath.updateHistory called on servr side"); 
            if(this.props.rasp && this.props.rasp.toParent)
                this.props.rasp.toParent({type: "UPDATE_HISTORY"});
            return; 
        }
        let completionCheck=setTimeout(()=>{
            if(ReactActionStatePath.topState==="GET_STATE"){
                console.error("ReactActionStatePath.updateHistory GET_STATE did not complete.", this);
                ReactActionStatePath.topState=null;
            }
        },100);
        ReactActionStatePath.topState="GET_STATE";
        var stateStack = { stateStack: this.toMeFromParent({ type: "GET_STATE" }) };  // recursively call me to get my state stack
        ReactActionStatePath.topState=null;
        clearTimeout(completionCheck);
        var curPath = stateStack.stateStack.reduce((acc, cur) => { // parse the state to build the curreent path
            if (cur.pathSegment) acc.push(cur.pathSegment);
            return acc;
        }, []);
        curPath = (this.props.RASPRoot || '/h/') + curPath.join('/');
        if (curPath !== window.location.pathname) { // push the new state and path onto history
            if(this.debug.noop) console.log("ReactActionStatePath.toMeFromParent pushState", { stateStack }, { curPath });
            window.history.pushState(stateStack, '', curPath);
        } else { // update the state of the current history
            if(this.debug.noop) console.log("ReactActionStatePath.toMeFromParent replaceState", { stateStack }, { curPath });
            window.history.replaceState(stateStack, '', curPath); //update the history after changes have propogated among the children
        }
        return null;
    }

    /***  don't rerender if no change in state or props, use a logically equivalent check for state so that undefined and null are equivalent. Make it a deep compare in case apps want deep objects in their state ****/
    shouldComponentUpdate(newProps, newState) {
        if(!equaly(this.state,newState)) {if(this.debug.noop) console.log("ReactActionStatePath.shouldComponentUpdate yes state", this.id, this.props.rasp && this.props.rasp.depth, this.childName,  this.state,newState); return true;}
        if(!shallowequal(this.props, newProps)) {if(this.debug.noop) console.log("ReactActionStatePath.shouldComponentUpdate yes props", this.id, this.props.rasp && this.props.rasp.depth, this.childName, this.props, newProps); return true;}
        if(this.debug.noop) console.log("ReactActionStatePath.shouldComponentUpdate no", this.id, this.props.rasp && this.props.rasp.depth, this.childName,  this.props, newProps, this.state, newState);
        return false;
    }

    renderChildren() {
        var {children, initialRASP, RASPRoot, ...newProps}=this.props; // don't propogate initialRASP or RASPRoot
        return React.Children.map(React.Children.only(children), child =>{
            newProps.rasp=Object.assign({},
                this.state.rasp, 
                { depth: this.props.rasp && this.props.rasp.depth ? this.props.rasp.depth +1 : 1,
                  raspId: this.id,
                  toParent: this.toMeFromChild.bind(this)
                });
            Object.keys(child.props).forEach(childProp=>delete newProps[childProp]); // allow child props to overwrite parent props
            return React.cloneElement(child, newProps, child.props.children)
        });
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    render() {
        const children = this.renderChildren();
        if(this.debug.render) console.info("ReactActionStatePath.render", this.childName, this.childTitle, this.id, this.props, this.state);
        return (
            <section id={`rasp-${this.id}`} >
                {children}
            </section>
        );
    }
}

export default ReactActionStatePath;

function createDefaults () { // to be called at the end of the constructor extending this component
    var _defaults={that: {}};
    Object.keys(this).forEach(key=>{if(this._staticKeys.indexOf(key)===-1) _defaults.that[key]=clone(this[key])});
    if(typeof this.state !== 'undefined') {
        _defaults.state=this.state; // because setState always makes a new copy of the state
    }
    this._defaults=_defaults;
}

function restoreDefaults() {
    if(!this._defaults) return;
    let currentKeys=Object.keys(this);
    let defaultKeys=Object.keys(this._defaults.that);
    let undefinedKeys=[];
    currentKeys.forEach(key=>{
        if(this._staticKeys.indexOf(key)!==-1) return;
        if(defaultKeys.indexOf(key)!==-1) return;
        undefinedKeys.push(key);
    });
    undefinedKeys.forEach(key=>this[key]=undefined);
    Object.keys(this._defaults.that).forEach(key=>{this[key]=clone(this._defaults.that[key])});
    if(this._defaults.state){
        const state=this._defaults.state;
        this.setState(state);
    }
}

export class ReactActionStatePathClient extends React.Component {

  constructor(props, keyField='key', debug={noop: false}) {
    super(props);
    this.toChild = [];
    this.waitingOn=null;
    this.keyField=keyField;
    if(typeof debug==='object') this.debug=debug;
    else this.debug={noop: debug};
    if(!this.props.rasp) console.error("ReactActionStatePathClient no rasp",this.constructor.name, this.props);
    if (this.props.rasp.toParent) {
      this.props.rasp.toParent({ type: "SET_TO_CHILD", function: this.toMeFromParent.bind(this), name: this.constructor.name, actionToState: this.actionToState.bind(this), debug, clientThis: this })
    }else console.error("ReactActionStatePathClient no rasp.toParent",this.props);
    this.qaction=qaction;  // make the module specific funtion available
    this.queueAction=queueAction.bind(this);
    this.queueFocus=(action)=>queueAction.call(this,{type: "DESCENDANT_FOCUS", wasType: action.type, [this.keyField]: action[this.keyField]});
    this.queueUnfocus=(action)=>queueAction.call(this,{type: "DESCENDANT_UNFOCUS", wasType: action.type, [this.keyField]: action[this.keyField]});
    this.initialRASP=clone(this.props.rasp);
    var _staticKeys=Object.keys(this); // the react keys that we aren't going to touch when resetting
    this._staticKeys=_staticKeys.concat(['state','_reactInternalInstance','_defaults','_staticKeys']); // also don't touch these
    this.createDefaults=createDefaults.bind(this);
    this.restoreDefaults=restoreDefaults.bind(this);
  }

    componentWillUnmount(){
        console.info("ReactActionStatePathClient.componentWillUnmount", this.constructor.name, this.childTitle, this.props.rasp.raspId, this.props.rasp.depth);
            if (this.props.rasp.toParent) {
                this.props.rasp.toParent({ type: "SET_TO_CHILD", function: undefined })
            }
    }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // this is a one to many pattern for the RASP, insert yourself between the RASP and each child
  // send all unhandled actions to the parent RASP
  //
  toMeFromChild(key, action) {
    if(this.debug.noop) console.info("ReactActionStatePathClient.toMeFromChild", this.constructor.name, this.childTitle, this.props.rasp.raspId, this.props.rasp.depth, key, action);
    if (action.type === "SET_TO_CHILD") { // child is passing up her func
      this.toChild[key] = action.function; // don't pass this to parent
      if (this.waitingOn) {
        if (this.waitingOn.nextRASP) {
          let nextRASP = this.waitingOn.nextRASP;
          if (key === nextRASP[this.keyField] && this.toChild[key]) {
            if(this.debug.noop) console.log("ReactActionStatePathClient.toMeFromParent got waitingOn nextRASP", nextRASP);
            var nextFunc=this.waitingOn.nextFunc;
            this.waitingOn = null;
            if(nextFunc) qaction(nextFunc,0);
            else qaction(() => this.props.rasp.toParent({ type: "SET_STATE_AND_CONTINUE", nextRASP: nextRASP, function: this.toChild[key] }), 0);
          }
        }
      }
    } else {
        action[this.keyField] = key; // actionToState may need to know the child's id
        var result =this.props.rasp.toParent(action);
        // if(this.debug.noop) console.log(this.constructor.name, this.title, action,'->', this.props.rasp);
        return result;
    }
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // this can handle a one to many pattern for the RASP, handle each action appropriatly
  //
  toMeFromParent(action) {
    if(this.debug.noop) console.info("ReactActionStatePathClient.toMeFromParent", this.constructor.name, this.childTitle, this.props.rasp.raspId, this.props.rasp.depth, action);
    if (action.type === "ONPOPSTATE") {
      let {stateStack, stackDepth} = action;
      var key = stateStack[stackDepth][this.keyField];
      let sent = false;
      Object.keys(this.toChild).forEach(child => { // only child panels with RASP managers will have entries in this list. 
        if (child === key) { sent = true; this.toChild[child]({type: "ONPOPSTATE", stateStack: stateStack, stackDepth: stackDepth+1}); }
        else this.toChild[child]({ type: "CLEAR_PATH" }); // only one button panel is open, any others are truncated (but inactive)
      });
      if (key && !sent) console.error("ReactActionStatePathClient.toMeFromParent ONPOPSTATE more state but child not found", { depth: this.props.rasp.depth }, { action });
      return;// this was the end of the lines
    } else if (action.type === "GET_STATE") {
      var key = this.props.rasp[this.keyField];
      if (typeof key !== 'undefined' && key !== null){
          if( this.toChild[key]) return this.toChild[key](action); // pass the action to the child
          else console.error("ReactActionStatePathClien.toMeFromParent GET_STATE key set by child not there",this.constructor.name, this.childTitle, this.props.rasp.raspId, this.props.rasp.depth, key, this.props.rasp)
      } else return null; // end of the line
    } else if (action.type === "CLEAR_PATH") {  // clear the path and reset the RASP state back to what the const
        var key = this.props.rasp[this.keyField];
        if (typeof key !== 'undefined' && key !== null){
            if( this.toChild[key]) return this.toChild[key](action); // pass the action to the child
            else console.error("ReactActionStatePathClient.toMeFromParent CLEAR_PATH key set by child not there",this.constructor.name, this.childTitle, this.props.rasp.raspId, this.props.rasp.depth, key, this.props.rasp)
        } else return null; // end of the line
    } else if (action.type === "RESET") {  // clear the path and reset the RASP state back to what the const
        var delta={};
        if(this._defaults) this.restoreDefaults(); 
        if(this.actionToState) this.actionToState(action, this.props.rasp, "PARENT", this.initialRASP, delta);
        Object.keys(this.toChild).forEach(child => { // send the action to every child
            this.toChild[child](action)
          });
        return null; // end of the line
    } else if (action.type === "SET_PATH") {
      const { nextRASP, setBeforeWait } = this.segmentToState(action, action.initialRASP);
      var key = nextRASP[this.keyField];
      if (typeof key !== 'undefined' && key !== null) {
        if (this.toChild[key]) this.props.rasp.toParent({ type: 'SET_STATE_AND_CONTINUE', nextRASP: nextRASP, function: this.toChild[key] }); // note: toChild of button might be undefined becasue ItemStore hasn't loaded it yet
        else if (setBeforeWait) {
            this.waitingOn={nextRASP, nextFunc: ()=>this.props.rasp.toParent({type: "CONTINUE_SET_PATH", function: this.toChild[key]})};
            this.props.rasp.toParent({type: "SET_STATE", nextRASP});       
        } else {
          if(this.debug.noop) console.log("ReactActionStatePathClient.toMeFromParent SET_PATH waitingOn", nextRASP);
          this.waitingOn = {nextRASP};
        }
      } else {
        this.props.rasp.toParent({ type: 'SET_STATE_AND_CONTINUE', nextRASP: nextRASP, function: null });
      }
    } else {
        // if the key is in the action 
        let key=action[this.keyField];
        if(typeof key!=='undefined' && this.toChild[key]){
            if(this.debug.noop) console.info("ReactActionStatePathClient.toMeFromParent passing action to child based on action keyField", this.constructor.name, this.childTitle, this.props.rasp.raspId, action, key);
            return this.toChild[key](action);
        }
        // if there is an active child
        key = this.props.rasp[this.keyField];
        if (typeof key !== 'undefined' && key !== null){
            if( this.toChild[key]) {
                if(this.debug.noop) console.info("ReactActionStatePathClient.toMeFromParent passing action to child based on active child of rasp", this.constructor.name, this.childTitle, this.props.rasp.raspId, action, key);
                return this.toChild[key](action); // pass the action to the child
            }
        } else {
            if(this.debug.noop) console.info("ReactActionStatePathClient.toMeFromParent unknown action and not active child", this.constructor.name, this.childTitle, this.props.rasp.raspId, action);
        }
    }
}

  // a consistent way to set the rasp for children
  childRASP(shape, childKey) {
      return (
          Object.assign({}, this.props.rasp, { shape, toParent: this.toMeFromChild.bind(this, childKey) })
      );
  }
}

export class ReactActionStatePathMulti extends ReactActionStatePathClient{
    constructor(props,keyfield,debug){
        super(props,keyfield,debug);
        if(typeof debug==='object') this.debug=debug;
        else this.debug={noop: debug};
        
    }

    toMeFromParent(action) {
        if(this.debug.noop) console.info("ReactActionStatePathMulti.toMeFromParent", this.props.rasp.depth, action);
        if (action.type === "ONPOPSTATE") {
          if(this.debug.noop) console.log("ReactActionStatePathMulti.toMeFromParent ONPOPSTATE", this.props.rasp.depth, action);
          let { stackDepth, stateStack } = action;
    
          let keepChild = [];
          Object.keys(this.toChild).forEach(child => keepChild[child] = false);
    
          stateStack[stackDepth+1].raspChildren.forEach(child => {
            if (this.toChild[child.key]) {
              this.toChild[child.key]({ type: "ONPOPSTATE", stateStack: child.stateStack, stackDepth: 0 });
              keepChild[child.key] = true;
            } else console.error("ReactActionStatePathMulti.toMeFromParent ONPOPSTATE no child:", child.key);
          })
    
          keepChild.forEach((keep, child) => { // child id is the index
            if (!keep) {
              console.error("ReactActionStatePathMulti.toMeFromParent ONPOPSTATE child not kept", child);
              this.toChild[child]({ type: "CLEAR_PATH" }); // only one button panel is open, any others are truncated (but inactive)
            }
          })
          return;// this was the end of the line
        } else if (action.type === "GET_STATE") {
          // get the state info from all the children and combind them into one Object
          if(this.debug.noop) console.log("ReactActionStatePathMulti.toMeFromParent GET_STATE", this.props.rasp.depth, action);
          var raspChildren = Object.keys(this.toChild).map(child => {
            return {
              stateStack: this.toChild[child]({ type: "GET_STATE" }),
              key: child
            }
          });
          if(raspChildren.length===1 && !raspChildren[0].stateStack) return null; // if the only child doesn't really exist yet (because it returns null) just return null
          var curPath = raspChildren.reduce((acc, cur, i) => { // parse the state to build the curreent path
            if (cur.stateStack && cur.stateStack[i] && cur.stateStack[i].pathSegment) acc.push(cur.stateStack[i].pathSegment);
            return acc;
          }, []);
          if (raspChildren.length) {
            var result = { raspChildren: raspChildren, depth: this.props.rasp.depth + 1, shape: 'multichild' };
            if (curPath.length) result.pathSegment = curPath.join(':');
            if(this.debug.noop) console.log("ReactActionStatePathMulti.toMeFromParent GET_STATE returns", result);
            return [result];
          } else
            return null;
        } else if (action.type === "CLEAR_PATH") {  // clear the path and reset the RASP state back to what the const
          Object.keys(this.toChild).forEach(child => { // send the action to every child
            this.toChild[child](action)
          });
        } else if (action.type === "RESET") {  // clear the path and reset the RASP state back to what the const
            var delta={};
            if(this._defaults) this.restoreDefaults(); 
            if(this.actionToState) this.actionToState(action, this.props.rasp, "PARENT", this.initialRASP, delta);
            Object.keys(this.toChild).forEach(child => { // send the action to every child
                this.toChild[child](action)
              });
            return null; // end of the line
        } else if (action.type === "SET_PATH") {
          const { nextRASP, setBeforeWait } = this.segmentToState(action);
          if(this.debug.noop) console.info("ReactActionStatePathMulti.toMeFromParent SET_PATH", action);
          if (nextRASP[this.keyField]) {
            let key = nextRASP[this.keyField];
            /*if (this.toChild[key]) this.props.rasp.toParent({ type: 'SET_STATE_AND_CONTINUE', nextRASP: nextRASP, function: this.toChild[key] }); // note: toChild of button might be undefined becasue ItemStore hasn't loaded it yet
            else */ if (setBeforeWait) {
              var that=this;
              var setPredicessors=()=>{
                let predicessors=that.toChild.length;
                if(this.debug.noop) console.info("ReactActionStatePathMulti.toMeFromParent.setPredicessors", key, predicessors);
                if(predicessors < key) {
                  var predicessorRASP=Object.assign({},nextRASP,{[that.keyField]: predicessors});
                  that.waitingOnResults={ nextFunc: setPredicessors.bind(this)};
                  that.props.rasp.toParent({ type: "SET_STATE", nextRASP: predicessorRASP });
                }else {
                  that.waitingOn={ nextRASP, nextFunc: () => that.props.rasp.toParent({ type: "CONTINUE_SET_PATH", function: that.toChild[key] }) };
                  that.props.rasp.toParent({ type: "SET_STATE", nextRASP });
                }
              }
              setPredicessors();
            } else {
                if(this.debug.noop) console.log("ReactActionStatePathMulti.toMeFromParent SET_PATH waitingOn", nextRASP);
                this.waitingOn = { nextRASP };
            }
          } else {
            this.props.rasp.toParent({ type: 'SET_STATE_AND_CONTINUE', nextRASP: nextRASP, function: null });
          }
        } else {
            // is there a key in the action
            let key=action[this.keyField];
            if(typeof key!=='undefined' && this.toChild[key]){
                if(this.debug.noop) console.info("ReactActionStatePathClient.toMeFromParent passing action to child based on action keyField", this.constructor.name, this.childTitle, this.props.rasp.raspId, action, key);
                return this.toChild[key](action);
            }
            
            let keys=Object.keys(this.toChild);
            if(keys.length) {
                var result;
                keys.forEach(key => { // send the action to every child
                    if(this.debug.noop) console.info("ReactActionStatePathMulti.toMeFromParent passing action to child", this.constructor.name, this.childTitle, this.props.rasp.raspId, action, key);
                    result=this.toChild[key](action);
                });
                return result;
            } else {
                if(this.debug.noop) console.info("ReactActionStatePathMulti.toMeFromParent no children to pass action to", this.constructor.name, this.childTitle, this.props.rasp.raspId, action);
            }
        }
    }
}

export class ReactActionStatePathFilter extends React.Component {

    constructor(props, keyField, debug) {
        super(props);
        this.keyField=keyField;
        if(typeof debug==='object') this.debug=debug;
        else this.debug={noop: debug};
        this.qaction = qaction;  // make the module specific funtion available
        this.queueAction = queueAction.bind(this);
        this.queueFocus = (action) => queueAction.call(this, { type: "DESCENDANT_FOCUS", wasType: action.type, [this.keyField]: action[this.keyField] });
        this.queueUnfocus = (action) => queueAction.call(this, { type: "DESCENDANT_UNFOCUS", wasType: action.type, [this.keyField]: action[this.keyField] });
        this.initialRASP = clone(this.props.rasp);
        var _staticKeys = Object.keys(this); // the react keys that we aren't going to touch when resetting
        this._staticKeys = _staticKeys.concat(['state', '_reactInternalInstance', '_defaults', '_staticKeys']); // also don't touch these
        this.createDefaults = createDefaults.bind(this);
        this.restoreDefaults = restoreDefaults.bind(this);
    }

    componentWillMount(){
        if(this.actionFilters) Object.keys(this.actionFilters).forEach(filterType=>
            this.props.rasp.toParent({type: "SET_ACTION_FILTER", filterType, name: this.constructor.name, function: this.actionFilters[filterType].bind(this)}) 
        );
    }

    componentWillUnmount() {
        if(this.debug.noop) console.info("ReactActionStatePathFilter.componentWillUnmount", this.constructor.name, this.props.rasp.raspId, this.props.rasp.depth);
        if (this.props.rasp.toParent) { // parent might already be unmounted
            this.props.rasp.toParent({ type: "RESET_ACTION_FILTER", name: this.constructor.name })
        }
    }
}
