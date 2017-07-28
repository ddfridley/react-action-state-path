'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import ClassNames from 'classnames';
import union from 'lodash/union';
import shallowequal from 'shallowequal';


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
export class ReactActionStatePath extends React.Component {

    constructor(props) {
        super(props);
        //logger.trace("ReactActionStatePath.constructor", this.constructor.name, this.props.rasp);
        this.toChild=null;
        this.childName='';
        this.childTitle='';
        this.debug=0;
        this.waitingOn=false;
        this.initialRASP=Object.assign({},
                    {   shape: this.props.rasp && this.props.rasp.shape ? this.props.rasp.shape : 'truncated',
                        depth: this.props.rasp ? this.props.rasp.depth : 0  // for debugging  - this is my depth to check
                    },
                    this.props.initialRASP
                );
        if(!(this.props.rasp && this.props.rasp.toParent)){
            if(typeof ReactActionStatePath.nextId !== 'undefined') console.error("ReactActionStatePath.constructor no parent, but not root!");
        }else{
            this.props.rasp.toParent({type: "SET_TO_CHILD", function: this.toMeFromParent.bind(this), name: "ReactActionStatePath"});
        }
        // not an else of above because of the possibility that one might want to put a rasp and toParent before the first component
        if(typeof ReactActionStatePath.nextId === 'undefined') { // this is the root ReactActionStatePath
             ReactActionStatePath.nextId= 0;
             ReactActionStatePath.topState=null;
             ReactActionStatePath.thiss=[];
             if(this.props.path && this.props.path !== '/'){
                ReactActionStatePath.pathSegments= this.props.path.split('/');
                var root=(this.props.RASPRoot || '/h/').split('/');
                while(!ReactActionStatePath.pathSegments[ReactActionStatePath.pathSegments.length-1]) ReactActionStatePath.pathSegments.pop(); // '/'s at the end translate to null elements, remove them
                while(!root[root.length-1]) root.pop(); // '/'s at the end translate to null elements, remove them
                if(root.some(segment=>segment!==ReactActionStatePath.pathSegments.shift())) {console.error("ReactActionStatePath.componentDidMount path didn't match props", root, ReactActionStatePath.pathSegments )}
             }else ReactActionStatePath.pathSegments=[];
             if(typeof window !== 'undefined'){ // if we are running on the browser
                window.onpopstate=this.onpopstate.bind(this);
                window.ReactActionStatePath={thiss: ReactActionStatePath.thiss};
                if(ReactActionStatePath.pathSegments.length===0) setTimeout(()=>this.updateHistory(),0); // aftr things have settled down, update history for the first time
             }
            console.info("ReactActionStatePath.thiss", ReactActionStatePath.thiss);
        }
        this.id=ReactActionStatePath.nextId++; // get the next id

        this.state=this.getDefaultState();
        ReactActionStatePath.thiss[this.id]={parent: this, client: null};
    }

    // consistently get the default state from multiple places
    getDefaultState(){
        return {rasp: Object.assign({},this.initialRASP)}
    }

    // handler for the window onpop state
    // only the root ReactActionStatePath will set this 
    // it works by recursively passing the ONPOPSTATE action to each child RASP component starting with the root
    onpopstate(event){
        if(this.debug) console.info("ReactActionStatePath.onpopstate", this.id, {event})
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
            logger.trace("ReactActionStatePath.onpopsate: returned.")
            ReactActionStatePath.topState=null;
            clearTimeout(completionCheck);
        }
    }

    toMeFromChild(action) {
        if(this.debug) console.info("ReactActionStatePath.toMeFromChild", this.id, this.props.rasp && this.props.rasp.depth, this.childName, this.childTitle, action, this.state.rasp);
        var  nextRASP={};
        if(!action.distance) action.distance=0; // action was from component so add distance
        if(action.distance < 0) {action.distance +=1; if(this.id) return this.props.rasp.toParent(action); else return }
        if(action.type==="SET_TO_CHILD") { // child is passing up her func
            this.debug=action.debug;
            if(this.debug) console.info("ReactActionStatePath.toMeFromChild debug set", this.debug, this.id, this.props.rasp && this.props.rasp.depth, this.childName, this.childTitle, action, this.state.rasp);
            this.toChild = action.function;
            if(action.name) this.childName=action.name;
            if(action.actionToState) this.actionToState=action.actionToState; 
            if(action.clientThis) ReactActionStatePath.thiss[this.id].client=action.clientThis;
            else console.error("ReactActionStatePath.toMeFromChild SET_TO_CHILD clientThis missing", this.id, this.props.rasp && this.props.rasp.depth, this.childName, this.childTitle, action);
            if((typeof window !== 'undefined') && this.id===0 && ReactActionStatePath.pathSegments.length ){ // this is the root and we are on the browser and there is at least one pathSegment
                logger.trace("ReactActionStatePath.toMeFromChild will SET_PATH to",ReactActionStatePath.pathSegments);
                if(ReactActionStatePath.topState) console.error("ReactActionStatePath.toMeFromChild SET_TO_CHILD, expected topState null got:", ReactActionStatePath.topState);
                this.completionCheck=setTimeout(()=>{
                    if(ReactActionStatePath.topState==="SET_PATH"){
                        console.error("ReactActionStatePath.toMeFromChild SET_PATH did not complete", this);
                        ReactActionStatePath.topState=null;
                    }
                },10000);
                setTimeout(()=>{
                    ReactActionStatePath.topState="SET_PATH";
                    this.toChild({type: "SET_PATH", segment: ReactActionStatePath.pathSegments.shift()});
                },0); // this starts after the return toChild so it completes.
            } else if(this.waitingOn){
                var nextFunc=this.waitingOn.nextFunc;
                this.waitingOn=null;
                setTimeout(nextFunc,0);
                return;
            }
        } else if (action.type==="SET_STATE"){
            logger.trace("ReactActionStatePath.toMeFromChild SET_STATE", this.id, this.props.rasp && this.props.rasp.depth, action.nextRASP);
            this.setState({rasp: Object.assign({},this.state.rasp, action.nextRASP)});
        }else if (action.type==="SET_TITLE"){
            logger.trace("ReactActionStatePath.toMeFromChild SET_TITLE", this.id, this.props.rasp && this.props.rasp.depth, action.nextRASP);
            this.childTitle=action.title; // this is only for pretty debugging
        }else if (action.type==="CONTINUE_SET_PATH"){
            if(ReactActionStatePath.pathSegments.length) {
                logger.trace("ReactActionStatePath.toMeFromChild CONTINUE to SET_PATH", this.id, this.props.rasp && this.props.rasp.depth, action.nextRASP);
                setTimeout(()=>action.function({type: 'SET_PATH', segment: ReactActionStatePath.pathSegments.shift()}),0);
            } else {
                logger.trace("ReactActionStatePath.toMeFromChild CONTINUE to SET_PATH last one", this.id, this.props.rasp && this.props.rasp.depth, this.state.rasp);
                if(this.id!==0) this.props.rasp.toParent({type: "SET_PATH_COMPLETE"}); else { logger.trace("ReactActionStatePath.toMeFromChild CONTINUE_SET_PATH updateHistory"); this.updateHistory()};
            }
        }else if (action.type==="SET_STATE_AND_CONTINUE"){
            if(ReactActionStatePath.pathSegments.length) {
                logger.trace("ReactActionStatePath.toMeFromChild SET_STATE_AND_CONTINUE to SET_PATH", this.id, this.props.rasp && this.props.rasp.depth, action.nextRASP);
                if(action.function)
                    this.setState({rasp: Object.assign({},this.state.rasp, action.nextRASP)},()=>action.function({type: 'SET_PATH', segment: ReactActionStatePath.pathSegments.shift()}));
                else {
                    console.error("ReactActionStatePath.toMeFromChild SET_STATE_AND_CONTINUE pathSegments remain, but no next function", this.id, this.childTitle, action, ReactActionStatePath.pathSegments);
                    this.setState({rasp: Object.assign({},this.state.rasp, action.nextRASP)});
                }
            } else {
                logger.trace("ReactActionStatePath.toMeFromChild SET_STATE_AND_CONTINUE last one", this.id, this.props.rasp && this.props.rasp.depth, this.state.rasp, action.nextRASP);
                this.setState({rasp: Object.assign({},this.state.rasp, action.nextRASP)}, ()=>{ 
                    if(this.id!==0) this.props.rasp.toParent({type: "SET_PATH_COMPLETE"}); 
                    else { 
                        logger.trace("ReactActionStatePath.toMeFromChild  SET_STATE_AND_CONTINUE last one updateHistory");
                        ReactActionStatePath.topState=null;
                        clearTimeout(this.completionCheck);
                        this.updateHistory()} 
                    });
            }
        }else if(action.type==="SET_PATH_COMPLETE") {
            if(this.id!==0) return this.props.rasp.toParent({type: "SET_PATH_COMPLETE"});
            else {
                logger.trace("ReactActionStatePath.toMeFromChild SET PATH COMPLETED, updateHistory");
                ReactActionStatePath.topState=null;
                clearTimeout(this.completionCheck);
                return this.updateHistory();
            }
        }else if(this.actionToState && ((nextRASP=this.actionToState(action, this.state.rasp, "CHILD", this.getDefaultState().rasp)))!==null) {
            if((this.state.rasp.pathSegment) && !(nextRASP.pathSegment)) {  // path has been removed
                logger.trace("ReactActionStatePath.toChildFromParent child changed state and path being removed so reset children", this.id, this.state.rasp.pathSegment)
                //this.toChild({type:"CLEAR_PATH"}); // if toChild is not set let there be an error
            } else if(!(this.state.rasp.pathSegment) && (nextRASP.pathSegment)) { // path being added
                logger.trace("ReactActionStatePath.toChildFromParent path being added", this.id, nextRASP.pathSegment)
            }                 
            if(this.id!==0 && !ReactActionStatePath.topState && !action.toBeContinued ){ // if this is not the root and this is not a root driven state change
                //if(equaly(this.state.rasp,nextRASP)) return null; // nothing has changed so don't kick off a CHILD_SHAPE_CHANGED chain
                const distance= (action.type === "CHILD_SHAPE_CHANGED") ? action.distance+1 : 1; // 1 tells parent RASP it came from this RASP 
                this.setState({rasp: nextRASP}, ()=>this.props.rasp.toParent({type: "CHILD_SHAPE_CHANGED", shape: nextRASP.shape, distance: distance}));
            }else if(this.id!==0){
                this.setState({rasp: nextRASP});
            } else { // this is the root, after changing shape, remind me so I can update the window.histor
                if(equaly(this.state.rasp,nextRASP)) { if(this.debug) console.info("ReactActionStatePath.toMeFromChild actionToState equaly updateHistory", action); this.updateHistory()} // updateHistory now!
                else this.setState({rasp: nextRASP},()=>{ if(this.debug) console.info("ReactActionStatePath.toMeFromChild actionToState setState updateHistory", action); this.updateHistory()}); // otherwise, set the state and let history update on componentDidUpdate
            }
        } 
        // these actions are overridden by the component's actonToState if either there is and it returns a new RASP to set (not null)
        else if(action.type ==="CHANGE_SHAPE"){  
            if(this.state.rasp.shape!==action.shape){ // really the shape changed
                var nextRASP=Object.assign({}, this.state.rasp, {shape: action.shape});
                if(this.id!==0 && !ReactActionStatePath.topState  && !action.toBeContinued ) {// if there's a parent to tell of the change and we are not inhibiting shape_changed
                    this.setState({rasp: nextRASP}, ()=>this.props.rasp.toParent({type: "CHILD_SHAPE_CHANGED", shape: action.shape, distance: 1})); 
                }if(this.id!==0){ // don't propogate a change
                    this.setState({rasp: nextRASP});
                }else // this is the root, change state and then update history
                    this.setState({rasp: nextRASP}, ()=>{ logger.trace("ReactActionStatePath.toMeFromChild CHANGE_SHAPE updateHistory");this.updateHistory()});
            } // no change, nothing to do
        } else if(action.type==="CHILD_SHAPE_CHANGED"){
            logger.trace("ReactActionStatePath.toMeFromChild CHILD_SHAPE_CHANGED not handled by actionToState",this.id, this.props.rasp && this.props.rasp.depth);
            if(this.id!==0) {   
                logger.trace("ReactActionStatePath.toMeFromChild CHILD_SHAPE_CHANGED not handled by actionToState not root",this.id, this.props.rasp && this.props.rasp.depth);
                this.props.rasp.toParent({type: "CHILD_SHAPE_CHANGED", shape: this.state.rasp.shape, distance: action.distance+1}); // pass a new action, not a copy including internal properties like itemId. This shape hasn't changed
            } else { // this is the root RASP, update history.state
                logger.trace("ReactActionStatePath.toMeFromChild CHILD_SHAPE_CHANGED not handled by actionToState at root",this.id, this.props.rasp && this.props.rasp.depth);
                setTimeout(()=>{ logger.trace("ReactActionStatePath.toMeFromChild CHILD_SHAPE_CHANGED default updateHistory");this.updateHistory()},0);
            }
        } else { // the action was not understood, send it up
            if(this.id) { action.distance+=1; return this.props.rasp.toParent(action); }
            else return;
        }
        return null;
    }

    toMeFromParent(action) {
        if(this.debug) console.info("ReactActionStatePath.toMeFromParent", this.id, this.props.rasp && this.props.rasp.depth, this.childName, this.childTitle, action, this.state.rasp);
        var nextRASP={};
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
        } else if(this.actionToState && ((nextRASP=this.actionToState(action, this.state.rasp, "PARENT", this.getDefaultState().rasp))!==null)){
            if(!equaly(this.state.rasp, nextRASP)) { // really the shape changed
                if(this.id!==0 && !action.toBeContinued) {// if there's a parent to tell of the change
                    this.setState({rasp: nextRASP}, ()=>this.props.rasp.toParent({type: "CHILD_SHAPE_CHANGED", shape: nextRASP.shape, distance: 1}));
                }if(this.id!==0){
                    this.setState({rasp: nextRASP}); // inhibit CHILD_SHAPE_CHANGED
                }else // no parent to tell of the change
                    this.setState({rasp: nextRASP}, ()=>{ logger.trace("ReactActionStatePath.toMeFromParent CONTINUE_SET_PATH updateHistory");this.updateHistory()});
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
            console.error("ReactActionStatePath.toMeFromParent: Unknown Action",{action}, {state: this.state});
            return this.toChild(action);
        }
    }

    updateHistory() {
        if(this.debug) console.info("ReactActionStatePath.updateHistory",  this.id);
        if(typeof window === 'undefined') { logger.trace("ReactActionStatePath.updateHistory called on servr side, ignoring"); return; }
        if(this.id!==0) console.error("ReactActionStatePath.updateHistory called but not from root", this.props.rasp);
        if(ReactActionStatePath.topState) console.error("ReactActionStatePath.updateHistory, expected topState null, got:", ReactActionStatePath.topState);
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
            logger.trace("ReactActionStatePath.toMeFromParent pushState", { stateStack }, { curPath });
            window.history.pushState(stateStack, '', curPath);
        } else { // update the state of the current history
            logger.trace("ReactActionStatePath.toMeFromParent replaceState", { stateStack }, { curPath });
            window.history.replaceState(stateStack, '', curPath); //update the history after changes have propogated among the children
        }
        return null;
    }

    /***  don't rerender if no change in state or props, use a logically equivalent check for state so that undefined and null are equivalent. Make it a deep compare in case apps want deep objects in their state ****/
    shouldComponentUpdate(newProps, newState) {
        if(!equaly(this.state,newState)) {logger.trace("ReactActionStatePath.shouldComponentUpdate yes state", this.id, this.props.rasp && this.props.rasp.depth, this.childName,  this.state,newState); return true;}
        if(!shallowequal(this.props, newProps)) {logger.trace("ReactActionStatePath.shouldComponentUpdate yes props", this.id, this.props.rasp && this.props.rasp.depth, this.childName, this.props, newProps); return true;}
        logger.trace("ReactActionStatePath.shouldComponentUpdate no", this.id, this.props.rasp && this.props.rasp.depth, this.childName,  this.props, newProps, this.state, newState);
        return false;
    }

    renderChildren() {
        return React.Children.map(this.props.children, child =>{
            var newProps= Object.assign({}, 
                this.props, 
                {rasp:  Object.assign({}, 
                        this.state.rasp, 
                        {depth: this.props.rasp && this.props.rasp.depth ? this.props.rasp.depth +1 : 1,
                        toParent: this.toMeFromChild.bind(this)})
                }  //rasp in state override rasp in props
            );
            delete newProps.children;
            delete newProps.initialRASP; // don't let this propogate down to the next RASP with no initialization required
            return React.cloneElement(child, newProps, child.props.children)
        });
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    render() {
        const children = this.renderChildren();
        if(this.debug >1) console.info("ReactActionStatePath.render", this.childName, this.childTitle, this.id, this.props, this.state);
        return (
            <section id={`rasp-${this.id}`} >
                {children}
            </section>
        );
    }
}

export default ReactActionStatePath;

export class ReactActionStatePathClient extends React.Component {

  constructor(props, keyField='key', debug=0) {
    super(props);
    this.toChild = [];
    this.waitingOn=null;
    this.keyField=keyField;
    this.debug=debug;
    if(!this.props.rasp) console.error("ReactActionStatePathClient no rasp",this.constructor.name, this.props);
    if (this.props.rasp.toParent) {
      this.props.rasp.toParent({ type: "SET_TO_CHILD", function: this.toMeFromParent.bind(this), name: this.constructor.name, actionToState: this.actionToState.bind(this), debug, clientThis: this })
    }else console.error("ReactActionStatePathClient no rasp.toParent",this.props);
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // this is a one to many pattern for the RASP, insert yourself between the RASP and each child
  // send all unhandled actions to the parent RASP
  //
  toMeFromChild(key, action) {
    if(this.debug) console.info("ReactActionStatePathClient.toMeFromChild", this.constructor.name, this.childTitle, this.props.rasp.depth, key, action);
    if (action.type === "SET_TO_CHILD") { // child is passing up her func
      this.toChild[key] = action.function; // don't pass this to parent
      if (this.waitingOn) {
        if (this.waitingOn.nextRASP) {
          let nextRASP = this.waitingOn.nextRASP;
          if (key === nextRASP[this.keyField] && this.toChild[key]) {
            logger.trace("ReactActionStatePathClient.toMeFromParent got waitingOn nextRASP", nextRASP);
            var nextFunc=this.waitingOn.nextFunc;
            this.waitingOn = null;
            if(nextFunc) setTimeout(nextFunc,0);
            else setTimeout(() => this.props.rasp.toParent({ type: "SET_STATE_AND_CONTINUE", nextRASP: nextRASP, function: this.toChild[key] }), 0);
          }
        }
      }
    } else {
        action[this.keyField] = key; // actionToState may need to know the child's id
        var result =this.props.rasp.toParent(action);
        // logger.trace(this.constructor.name, this.title, action,'->', this.props.rasp);
        return result;
    }
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // this can handle a one to many pattern for the RASP, handle each action  appropriatly
  //
  toMeFromParent(action) {
    if(this.debug) console.info("ReactActionStatePathClient.toMeFromParent", this.constructor.name, this.childTitle, this.props.rasp.depth, action);
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
          else console.error("ReactActionStatePathClien.toMeFromParent GET_STATE key set by child not there",this.constructor.name, this.childTitle, this.props.rasp.depth, key, this.props.rasp)
      } else return null; // end of the line
    } else if (action.type === "CLEAR_PATH") {  // clear the path and reset the RASP state back to what the const
        var key = this.props.rasp[this.keyField];
        if (typeof key !== 'undefined' && key !== null){
            if( this.toChild[key]) return this.toChild[key](action); // pass the action to the child
            else console.error("ReactActionStatePathClient.toMeFromParent CLEAR_PATH key set by child not there",this.constructor.name, this.childTitle, this.props.rasp.depth, key, this.props.rasp)
        } else return null; // end of the line
    } else if (action.type === "SET_PATH") {
      const { nextRASP, setBeforeWait } = this.segmentToState(action);
      var key = nextRASP[this.keyField];
      if (typeof key !== 'undefined' && key !== null) {
        if (this.toChild[key]) this.props.rasp.toParent({ type: 'SET_STATE_AND_CONTINUE', nextRASP: nextRASP, function: this.toChild[key] }); // note: toChild of button might be undefined becasue ItemStore hasn't loaded it yet
        else if (setBeforeWait) {
            this.waitingOn={nextRASP, nextFunc: ()=>this.props.rasp.toParent({type: "CONTINUE_SET_PATH", function: this.toChild[key]})};
            this.props.rasp.toParent({type: "SET_STATE", nextRASP});       
        } else {
          logger.trace("ReactActionStatePathClient.toMeFromParent SET_PATH waitingOn", nextRASP);
          this.waitingOn = {nextRASP};
        }
      } else {
        this.props.rasp.toParent({ type: 'SET_STATE_AND_CONTINUE', nextRASP: nextRASP, function: null });
      }
    } else console.error("ReactActionStatePathClient.toMeFromParent action type unknown not handled", action)
  }
}
