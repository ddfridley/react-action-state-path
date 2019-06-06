'use strict';

import React from 'react';
import union from 'lodash/union';
import shallowequal from 'shallowequal';
import clone from 'clone';


// for comparing rasp states, we use equaly.  If a property in two objects is logically false in both, the property is equal.  This means that undefined, null, false, 0, and '' are all the same.
// and we make a deep compare
var equaly=function(a,b){
            if(!a && !b) return true; //if both are false, they are the same
            if(a && !b) return false; //if one is false and the other is not - they are not the same
            if(!a && b) return false;
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

var unwrap=function(s){
    if(typeof s!== 'string') return undefined;
    var a=[]; // the array to return
    var e=''; // an element in the array.
    let l=s.length;
    let i=0;
    if(s[0]==='/')i++; // strip off any leading /
    let d=0; // depth of ()'s
    let c;
    while(i<l){
        c=s[i];
        if(!d){
            if(c==='/'){
                a.push(e);
                e='';
            }else if(c==='('){
                if(e) a.push(e);
                e='';
                d++
            }else // at the level a ) is just added to the e
                e+=c;
        }else if(d===1){
            if(c===')'){
                a.push(e);
                e='';
                d--;
            }else if(c==='('){
                e+=c;
                d++;
            }else // at this level ) is just added to the e
                e+=c;
        } else {
            if(c===')')
                d--;
            else if(c==='(')
                d++;
            e+=c;
        }
        i++;
    }
    if(e) a.push(e);
    return a;
}

// separates a string by '/'. '/' within '()' are not separated, but an ending ')' is a saparator
var separate=function(s){
    if(typeof s!== 'string') return undefined;
    var a=[]; // the array to return
    var e=''; // an element in the array.
    let l=s.length;
    let i=0;
    if(s[0]==='/')i++; // strip off any leading /
    let d=0; // depth of ()'s
    let c;
    while(i<l){
        c=s[i];
        if(!d){
            if(c==='/'){
                a.push(e);
                e='';
            }else if(c==='('){
                e+=c;
                d++
            }else // at the level a ) is just added to the e
                e+=c;
        }else if(d===1){
            if(c===')'){
                e+=c;
                a.push(e);
                e='';
                d--;
            }else if(c==='('){
                e+=c;
                d++;
            }else // at this level ) is just added to the e
                e+=c;
        } else {
            if(c===')')
                d--;
            else if(c==='(')
                d++;
            e+=c;
        }
        i++;
    }
    if(e) a.push(e);
    return a;
}

var queue=0;

var qaction=function(func){
    queue+=1;
    //console.info("qaction queueing", queue);
    setTimeout(()=>{
        //console.info("qaction continuing", queue);
        queue--;
        func();
        if(queue===0 && UpdateHistory && !ReactActionStatePath.topState) {
            //console.info("qaction updating history");
            UpdateHistory();
        } else 
            //console.info("qaction after continuing", queue)
            ;
    },0);
}

var queueAction=function(action){ // called by a client, with it's this
    //console.info("queueAction", this.props.rasp.raspId, this.props.rasp.depth, this.constructor.name, action)
    qaction(()=>this.props.rasp.toParent(action))
}

var qhistory=function(func,delay){
    console.info("qhistory", queue, this.id, this.childName, this.childTitle);
    if(queue>0) {
        //console.info("qhistory put off"); 
        return;
    } else 
        setTimeout(func, delay);
}

// not being used yet
var qfuncPair=(updateHistory)=>{
    var queue=0;
    var qaction=(func)=>{
        queue+=1;
        setTimeout(()=>{
            queue--;
            func();
            if(queue===0 && updateHistory)
                updateHistory();
        },0)
    }
    var qhistory=(func,delay)=>{
        console.info("qhistory", queue);
        if(queue>0) {
            //console.info("qhistory put off"); 
            return;
        } else 
            setTimeout(func, delay);

    }
    return({qaction, qhistory});
}

var UpdateHistory;

export class ReactActionStatePath extends React.Component {

    constructor(props) {
        super(props);
        //if(this.debug.noop) console.log("ReactActionStatePath.constructor", this.constructor.name, this.props.rasp);
        this.toChild=null;
        this.childName='';
        this.childTitle='';
        this.debug=this.props.debugObject || {noop: false, near: false};
        this.waitingOn=false;
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
             if(queue!==0) {
                 console.error("ReactActionStatePath module scope queue was not 0, was:", queue, "resetting.")
                 queue=0;
             }
             ReactActionStatePath.topState=null;
             var pathSegments=[];
             if(this.props.path && this.props.path !== '/'){
                pathSegments= separate(this.props.path);
                while(pathSegments.length && !pathSegments[0]) pathSegments.shift(); // an initial '/' turns into an empty element at the beginning
                while(pathSegments.length && !pathSegments[pathSegments.length-1]) pathSegments.pop(); // '/'s at the end translate to null elements, remove them
                let root=separate(this.props.RASPRoot || '/h/');
                while(root.length && !root[0]) root.shift(); // shift off leading empty's caused by leading '/'s
                while(root.length && !root[root.length-1]) root.pop(); // '/'s at the end translate to null elements, remove them
                if(root.some(segment=>segment!==pathSegments.shift())) {console.error("ReactActionStatePath.componentDidMount path didn't match props", root, pathSegments )}

                if(pathSegments.length)
                    this.waitingOn={nextFunc: ()=>{
                        if(this.debug.SET_PATH) console.log("ReactActionStatePath.constructor will SET_PATH to",this.pathSegments);
                        if(ReactActionStatePath.topState) console.error("ReactActionStatePath.constructor expected topState null got:", ReactActionStatePath.topState);
                        this.completionCheck=setTimeout(()=>{
                            if(ReactActionStatePath.topState==="SET_PATH"){
                                console.error("ReactActionStatePath.toMeFromChild SET_PATH did not complete, topState:", ReactActionStatePath.topState, "this:",this);
                                ReactActionStatePath.topState=null;
                            }
                        },30000);
                        qaction(()=>{
                            ReactActionStatePath.topState="SET_PATH";
                            this.toMeFromParent({type: "SET_PATH", pathSegments, onSetPathComplete: ()=>{
                                if(this.debug.noop) console.log("ReactActionStatePath.constructor SET PATH COMPLETED, updateHistory");
                                ReactActionStatePath.topState=null;
                                clearTimeout(this.completionCheck);
                                return this.updateHistory();
                            }
                        });
                        }); // this starts after the return toChild so it completes.
                    }}
             }

             if(!pathSegments.length){
                this.waitingOn={nextFunc: ()=>{
                    qhistory.call(this,()=>this.updateHistory(),0); // after things have settled down, update history for the first time
                }}
             }

             if(typeof window !== 'undefined'){ // if we are running on the browser
                ReactActionStatePath.thiss=[];
                top.onpopstate=this.onpopstate.bind(this);  // top rather than window incase in iFrame like in storybook
                window.ReactActionStatePath={thiss: ReactActionStatePath.thiss};
                UpdateHistory=this.updateHistory.bind(this);
             }

            console.info("ReactActionStatePath.thiss", ReactActionStatePath.thiss);
        }
        this.id=ReactActionStatePath.nextId++; // get the next id
        this.initialRASP=Object.assign({},
            {   shape: this.props.rasp && this.props.rasp.shape ? this.props.rasp.shape : 'truncated',
                depth: this.props.rasp ? this.props.rasp.depth +1 : 0,  // for debugging  - this is my depth to check
                raspId: this.id,
                toParent: this.toMeFromChild.bind(this)
            },
            this.props.initialRASP
        );

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
            if(this.debug.onpopstate) console.log("ReactActionStatePath.onpopstate: returned.")
            ReactActionStatePath.topState=null;
            clearTimeout(completionCheck);
        }
    }

    setStateIfChanged(nextRASP,nextFunc){
        var _rasp=Object.assign({},this.state.rasp);
        var _nextRASP=Object.assign({},nextRASP);
        delete _rasp.toParent;
        delete _nextRASP.toParent; // functions can't be in pushState - may or may not be there
        if(_rasp.raspId !== _nextRASP.raspId) {console.error("setStateIfChanged mismatch id's", this.state.rasp,nextRASP); delete _nextRASP.raspId};
        if(_rasp.depth !== _nextRASP.depth) {console.error("setStateIfChanged mismatch in depth", this.state.rasp,nextRASP); delete _nextRASP.depth}
        if(equaly(_rasp, _nextRASP)){
            if(nextFunc) return nextFunc();
            else return; // don't change state and possible cause rerender
        } else
            return this.setState({rasp: Object.assign({},this.state.rasp, _nextRASP)},nextFunc);        
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
            if(this.waitingOn){
                var nextFunc=this.waitingOn.nextFunc;
                this.waitingOn=null;
                qaction(nextFunc);
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
        }else if (action.type==="SET_STATE"){
            if(this.debug.noop) console.log("ReactActionStatePath.toMeFromChild SET_STATE", this.id, this.props.rasp && this.props.rasp.depth, action.nextRASP);
            return this.setStateIfChanged(action.nextRASP, action.nextFunc)
        }else if (action.type==="SET_TITLE"){
            if(this.debug.noop) console.log("ReactActionStatePath.toMeFromChild SET_TITLE", this.id, this.props.rasp && this.props.rasp.depth, action.nextRASP);
            this.childTitle=action.title; // this is only for pretty debugging
        }else if (action.type==="SET_PATH_SKIP"){ // this child will not consume the path segment, so pass the path segment to the next child, but reset the state if it isn't
            var pathSegments=this.pathSegments;
            this.pathSegments=undefined;
            // we did not consume the segment
            if(shallowequal(this.state.rasp, this.initialRASP)) {
                if(this.debug.noop) console.log("ReactActionStatePath.toMeFromChild SET_PATH_SKIP", this.id, this.props.rasp && this.props.rasp.depth, this.initialRASP);
                qaction(()=>action.function({type: 'SET_PATH', pathSegments}));  // if the child is this child's parent RASP, then it will reset initialRASP
            } else {
                if(this.debug.noop) console.log("ReactActionStatePath.toMeFromChild SET_PATH_SKIP setState first", this.id, this.props.rasp && this.props.rasp.depth, action.nextRASP);
                this.setState({rasp: this.initialRASP}, ()=>qaction(()=>action.function({type: 'SET_PATH', pathSegments})));  // if the child is this child's parent RASP, then it will reset initialRASP)
            }
        }else if (action.type==="CONTINUE_SET_PATH"){
            var pathSegments=this.pathSegments;
            this.pathSegments=undefined;
            pathSegments.shift(); // setting the segment was completed so discard it
            if(pathSegments.length) {
                if(this.debug.noop) console.log("ReactActionStatePath.toMeFromChild CONTINUE to SET_PATH", this.id, this.props.rasp && this.props.rasp.depth, this.initialRASP);
                qaction(()=>action.function({type: 'SET_PATH', pathSegments}));
            } else {
                if(this.debug.noop) console.log("ReactActionStatePath.toMeFromChild CONTINUE to SET_PATH last one", this.id, this.props.rasp && this.props.rasp.depth, this.state.rasp);
                if(this.id!==0) this.props.rasp.toParent({type: "SET_PATH_COMPLETE"}); 
                else { 
                    if(this.debug.noop) console.log("ReactActionStatePath.toMeFromChild CONTINUE_SET_PATH updateHistory"); 
                    ReactActionStatePath.topState=null;
                    clearTimeout(this.completionCheck);
                    this.updateHistory()
                }
            }
        }else if (action.type==="SET_STATE_AND_CONTINUE"){
            var pathSegments=this.pathSegments || [];
            this.pathSegments=undefined;
            pathSegments.shift(); // setting the segment was completed so discard it
            if(pathSegments.length) {
                if(this.debug.noop) console.log("ReactActionStatePath.toMeFromChild SET_STATE_AND_CONTINUE to SET_PATH", this.id, this.props.rasp && this.props.rasp.depth, action.nextRASP);
                if(action.function)
                    this.setState({rasp: Object.assign({},this.state.rasp, action.nextRASP)},()=>qaction(()=>action.function({type: 'SET_PATH', pathSegments})));
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
            if(this.pathSegments){
                console.error("ReactActionStatePath.toMeFromChild SET_PATH_COMPLETE but pathSegments remain", this.pathSegments);
                this.pathSegments=undefined;
            }
            if(this.onSetPathComplete) {
                let func=this.onSetPathComplete;
                this.onSetPathComplete=undefined;
                return func();
            } if(this.id!==0) 
                return this.props.rasp.toParent({type: "SET_PATH_COMPLETE"});
            else 
                console.error("id is 0 but no onSetPathComplete");
        }else if(action.type==="RESET") {
            this.setState(this.getDefaultState()); // after clearing the children clear this state
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

            const rasp=Object.assign({},this.state.rasp,nextRASP)
            if(this.id!==0 && !ReactActionStatePath.topState && (action.type==="DESCENDANT_FOCUS" || action.type==="DESCENDANT_UNFOCUS" || action.duration) ){
                if(typeof action.duration==='number') action.duration-=1;
                action.distance+=1;
                this.setState({rasp}, ()=>action.direction==='ASCEND' ? this.props.rasp.toParent(action) : (action.direction==='DESCEND' ? this.toChild(action) : console.error("ReactActionStatePath direction unknown", action, this.id, this.childName, this.childTitle)));
            } else if(this.id!==0){
                this.setState({rasp});
            }else { // this is the root, after changing shape, remind me so I can update the window.histor
                if(equaly(this.state.rasp,rasp)) { 
                    if(this.debug.noop) console.info("ReactActionStatePath.toMeFromChild actionToState equaly updateHistory", action); 
                    this.updateHistory()
                } // updateHistory now!
                else this.setState({rasp},()=>{ 
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
                if((typeof window === 'undefined' && this.props.rasp && this.props.rasp.toParent)) qaction(()=>this.props.rasp.toParent(action)); // on server, send action to server renderer
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
            if(stateStack[stackDepth].depth !== this.initialRASP.depth) console.error("ReactActionStatePath.toMeFromParent ONPOPSTATE state depth not equal to component depth",action.stateStack[stackDepth], this.props.rasp.depth); // debugging info
            if(stackDepth < stateStack.length){
                if(this.toChild) this.toChild({type: "ONPOPSTATE", stateStack: stateStack, stackDepth: stackDepth});
                else console.error("ReactActionStatePath.toMeFromParent ONPOPSTATE more stack but no toChild", {action}, {rasp: this.props.rasp});
            }else if(this.toChild) this.toChild({type: "CLEAR_PATH"}); // at the end of the new state, deeper states should be reset
            return;
        } else if (action.type==="GET_STATE") {
            // return the array of all RASP States from the top down - with the top at 0 and the bottom at the end
            // it works by recursivelly calling GET_STATE from here to the end and then unshifting the RASP state of each component onto an array
            // the top RASP state of the array is the root component
            if(!this.toChild) {
                console.error("ReactActionStatePath.toMeFromParetn GET_STATE child not ready", this.id, this.props.rasp && this.props.rasp.depth, this.state.rasp);
                var {toParent, ...rasp}=this.state.rasp;
                return [rasp];
            } else 
                return this.toChild(action);
        } else if(action.type==="RESET") {
            if(this.toChild) this.toChild(action); // reset children first, then reset parent (depth first)
            this.setState(this.getDefaultState()); // now reset my state
            return null;
        } else if(
                ((this.actionFilters[action.type] && this.actionFilters[action.type].forEach(filter=>filter.function(action, delta))), true) // process any action filters and always evaluate to true
                && this.actionToState
                && ((nextRASP=this.actionToState(action, this.state.rasp, "PARENT", this.getDefaultState().rasp, delta))!==null)
        )
        {
            // no change, nothing to do
            const nextFunc=()=>{ 
                if(this.debug.noop) console.log("ReactActionStatePath.toMeFromParent CONTINUE_SET_PATH updateHistory");
                qhistory.call(this,()=>this.updateHistory,0); // update history after statechage events are processed
            };
            return this.setStateIfChanged(nextRASP, this.id && nextFunc)
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
            if(this.pathSegments) console.error("ReactActionStatePath.toMeFromParent SET_PATH called, but previous SET_PATH was not complete",action,this.pathSegments)
            this.pathSegments=action.pathSegments; // save the list of segments until SET_PATH_COMPLETE, ... cleans it up. 
            if(action.onSetPathComplete) this.onSetPathComplete=action.onSetPathComplete;
            var childAction={type: "SET_PATH", pathSegments: action.pathSegments, segment: action.pathSegments[0], initialRASP: this.initialRASP};
            if(this.toChild) return this.toChild(childAction);
            else this.waitingOn={nextFunc: ()=>{this.toChild(childAction)}}
            return;
        }else {
            if(this.debug.noop) console.info("ReactActionStatePath.toMeFromParent: passing action to child", this.id, this.props.rasp && this.props.rasp.depth, this.childName, this.childTitle, action, this.state.rasp );
            return this.toChild(action);
        }
    }

    updateHistory() {
        if(this.debug.noop) console.info("ReactActionStatePath.updateHistory",  this.id);
        if(this.id!==0) console.error("ReactActionStatePath.updateHistory called but not from root", this.props.rasp);
        if(ReactActionStatePath.topState==='SET_PATH') {
            console.info("Won't update History during SET_PATH");
            return;
        } else if(ReactActionStatePath.topState) 
            console.error("ReactActionStatePath.updateHistory, expected topState null, got:", ReactActionStatePath.topState);
        if(queue) { 
            if(this.debug.noop) console.info("ReactActionStatePath.updateHistory waiting, queue is", queue);
            return;
        }
        if(typeof window === 'undefined') { 
            if(this.debug.noop) console.info("ReactActionStatePath.updateHistory called on server side"); 
            if(!(this.props.rasp && this.props.rasp.toParent)) // don't get history on server side if no toParent to send it to
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
        var curPath = stateStack.stateStack.reduce((acc, cur) => { // parse the state to build the current path
            if (cur.pathSegment) acc.push(cur.pathSegment);
            return acc;
        }, []);
        curPath=separate(this.props.RASPRoot || '/h/').concat(curPath)
        curPath = curPath.join('/');
        if(typeof window !== 'undefined'){
            let parts=separate(top.location.href);
            if(parts[0]==="http:" || parts[0]==="https:"){
                parts.shift() // http:
                parts.shift() // 
                parts.shift() // localhost:6006
            }
            parts=parts.join('/');
            if (curPath !== parts && stateStack.stateStack[stateStack.stateStack.length-1].shape !== 'redirect') { // push the new state and path onto history
                if(this.debug.noop) console.log("ReactActionStatePath.toMeFromParent pushState", { stateStack }, { curPath });
                top.history.pushState(stateStack, '', '/'+curPath); // history on top in case in iframe like in storybook
            } else { // update the state of the current historys
                if(this.debug.noop) console.log("ReactActionStatePath.toMeFromParent replaceState", { stateStack }, { curPath });
                top.history.replaceState(stateStack, '', '/'+curPath); //update the history after changes have propagated among the children -- history on top in case in iframe like in storybook
            }
        } else {
            if(this.debug.noop) console.info("ReactActionStatePath.updateHistory called on server side"); 
            if(this.props.rasp && this.props.rasp.toParent)
                this.props.rasp.toParent({type: "UPDATE_HISTORY", stateStack, curPath });
            return;             
        }
        return null;
    }

    /***  don't rerender if no change in state or props, use a logically equivalent check for state so that undefined and null are equivalent. Make it a deep compare in case apps want deep objects in their state ****/
    shouldComponentUpdate(newProps, newState) {
        if(!equaly(this.state,newState)) {if(this.debug.noop) console.log("ReactActionStatePath.shouldComponentUpdate yes state", this.id, this.props.rasp && this.props.rasp.depth, this.childName,  this.state,newState); return true;}
        var a=Object.assign({},newProps);
        var b=Object.assign({},this.props);
        delete a.children;
        delete b.children;
        if(!equaly(a.rasp,b.rasp)) {if(this.debug.noop) console.log("ReactActionStatePath.shouldComponentUpdate yes props.rasp", this.id, this.props.rasp && this.props.rasp.depth, this.childName, this.props, newProps); return true;}
        delete a.rasp;
        delete b.rasp;
        if(!shallowequal(a, b)) {if(this.debug.noop) console.log("ReactActionStatePath.shouldComponentUpdate yes props", this.id, this.props.rasp && this.props.rasp.depth, this.childName, this.props, newProps); return true;}
        if(this.debug.noop) console.log("ReactActionStatePath.shouldComponentUpdate no", this.id, this.props.rasp && this.props.rasp.depth, this.childName,  this.props, newProps, this.state, newState);
        return false;
    }

    renderChildren() {
        var {children, initialRASP, RASPRoot, ...newProps}=this.props; // don't propogate initialRASP or RASPRoot
        return React.Children.map(React.Children.only(children), child =>{
            newProps.rasp=Object.assign({},this.state.rasp);
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
        if(key[0]==='_') return;  // React16 is adding properties to the class, after it was constructed. such as  _reactInternalFiber and _reactInternalInstance since we can't guess what future will bring we will use _ as the designator
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
            if(nextFunc) qaction(nextFunc);
            else qaction(() => this.props.rasp.toParent({ type: "SET_STATE_AND_CONTINUE", nextRASP: nextRASP, function: this.toChild[key] }));
          } else if((typeof nextRASP[this.keyField]==='undefined' || nextRASP[this.keyField]===null) && key==='default' && this.toChild['default']){
            if(this.debug.noop) console.log("ReactActionStatePathClient.toMeFromParent got waitingOn nextRASP default");
            var nextFunc=this.waitingOn.nextFunc;
            this.waitingOn = null;
            if(nextFunc) qaction(nextFunc);
            else qaction(() => this.props.rasp.toParent({ type: "SET_PATH_SKIP", function: this.toChild[key] }));              
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
        /*
        let { stateStack, stackDepth } = action;
        var key = stateStack[stackDepth][this.keyField];
        let sent = false;
        if(stackDepth >= (stateStack.length-1)){ // this is the last one on the stack
            Object.keys(this.toChild).forEach(child => { // only child panels with RASP managers will have entries in this list. 
                this.toChild[child]({ type: "CLEAR_PATH" }); // only one button panel is open, any others are truncated (but inactive)
            });
            return this.props.rasp.toParent({ type: "SET_STATE", nextRASP: stateStack[stackDepth] });
        } else {
            Object.keys(this.toChild).forEach(child => { // only child panels with RASP managers will have entries in this list. 
                if (child === key) { sent = true; this.toChild[child]({ type: "ONPOPSTATE", stateStack: stateStack, stackDepth: stackDepth + 1 }); }
                else if ((typeof key === 'undefined' || key === null) && child === 'default') { sent = true; this.toChild[child]({ type: "ONPOPSTATE", stateStack, stackDepth: stackDepth + 1 }); }
                else this.toChild[child]({ type: "CLEAR_PATH" }); // only one button panel is open, any others are truncated (but inactive)
            });
            if (key && !sent) {
                console.info("ReactActionStatePathClient.toMeFromParent ONPOPSTATE more state but child not found", { depth: this.props.rasp.depth }, { action });
                this.waitingOn = { nextRASP: stateStack[stackDepth], nextFunc: () => this.toChild[child]({ type: "ONPOPSTATE", stateStack, stackDepth: stackDepth + 1 }) }
                return;
            } else
                return this.props.rasp.toParent({ type: "SET_STATE", nextRASP: stateStack[stackDepth] });
        }*/
        if (this.debug.noop) console.log("ReactActionStatePathClient.toMeFromParent ONPOPSTATE", this.props.rasp.depth, action);
        var { stackDepth, stateStack } = action;
        var keepChild = [];
        Object.keys(this.toChild).forEach(child => keepChild[child] = false);
        var nextRASP=stateStack[stackDepth];
        var {raspChildren}=nextRASP;
        delete nextRASP.raspChildren;
        delete keepChild['default']; // don't delete default if it is there
        var unwrapChildren=()=>{
            if(raspChildren && raspChildren.length){
                const{key, stateStack}=raspChildren.shift();
                keepChild[key]=true;
                const childRASP=Object.assign({},nextRASP,{[this.keyField]: key})
                if(this.toChild[key]) {
                    this.toChild[key]({type: "ONPOPSTATE", stateStack, stackDepth: 0}); 
                    return unwrapChildren();
                } else {
                    this.waitingOn={nextRASP: childRASP, nextFunc: ()=>{this.toChild[key]({type: "ONPOPSTATE", stateStack, stackDepth: 0}); unwrapChildren();}}
                    return this.props.rasp.toParent({type: "SET_STATE", nextRASP: childRASP});
                }
            } else {
                /* Don't clear the children - it doesn't reset the parent's state and you won't have to reload data
                keepChild.forEach((keep, child) => { // child id is the index
                    if (!keep) {
                        console.info("ReactActionStatePathMulti.toMeFromParent ONPOPSTATE child not kept", child);
                        this.toChild[child]({ type: "CLEAR_PATH" });
                    }
                })*/
                if(stackDepth+1 >= stateStack.length) { // end of the line
                    return this.props.rasp.toParent({ type: "SET_STATE", nextRASP });
                } 
                var key = nextRASP[this.keyField];
                var nextFunc=()=>this.toChild[key]({type: "ONPOPSTATE", stateStack, stackDepth: stackDepth+1 });
                if (typeof key !== 'undefined' && key !== null) {
                    if(this.toChild[key]) {
                        nextFunc();
                        this.props.rasp.toParent({type: "SET_STATE", nextRASP, nextFunc});
                    } else {
                        this.waitingOn={nextRASP, nextFunc};
                        this.props.rasp.toParent({type: "SET_STATE", nextRASP});     
                    }
                } else if(this.toChild[key='default']) {
                    nextFunc();
                } else {
                    console.error("ReactActionStatePathMulti.toMeFromParent ONPOPSTATE but no child", action )
                }
            }
        }
        unwrapChildren();
        return;

    } else if (action.type === "GET_STATE") {
        /*
      var key = this.props.rasp[this.keyField];
      var {toParent, ...rasp}=this.props.rasp; // exclude the function which can not be saved as part of the state
      if (typeof key !== 'undefined' && key !== null){
          if( this.toChild[key]) return [rasp].concat(this.toChild[key](action)); // pass the action to the child put this state on top of the list and return to parent          
          else {
              console.error("ReactActionStatePathClien.toMeFromParent GET_STATE key set by child not there",this.constructor.name, this.childTitle, this.props.rasp.raspId, this.props.rasp.depth, key, this.props.rasp);
              return [rasp];
          }
      } else if(this.toChild['default']) {
          return [rasp].concat(this.toChild['default'](action)); // pass the action to the default child
      } else return [rasp]; // end of the line
      */
        // get the state info from all the children and combind them into one Object

        if (this.debug.noop) console.log("ReactActionStatePathMulti.toMeFromParent GET_STATE", this.props.rasp.depth, action);
        var key = this.props.rasp[this.keyField];
        var {toParent, ...rasp}=this.props.rasp; // exclude the function which can not be saved as part of the state
        var childState=[];
        var raspChildren= Object.keys(this.toChild).reduce((acc,child) => {
            if((typeof key !== 'undefined' && key !== null && child===key)||(child==='default' && !childState.length)){  // if this child isis the key, or of there is no key and some child is named 'default'
                childState=this.toChild[child]({ type: "GET_STATE" })
            } else {
                acc.push({
                    stateStack: this.toChild[child]({ type: "GET_STATE" }),
                    key: child
                })
            }
            return acc;
        },[]);
        if (raspChildren.length && !(raspChildren.length==1 && !raspChildren[0].stateStack)) // if there is a child list, and it is not a list of one child with no state
            rasp.raspChildren=raspChildren; // inactive children are stored in the parents structure,
        return [rasp].concat(childState) // state of the active child is in the list
    } else if (action.type === "CLEAR_PATH") {  // clear the path and reset the RASP state back to what the const
        var key = this.props.rasp[this.keyField];
        if (typeof key !== 'undefined' && key !== null){
            if( this.toChild[key]) return this.toChild[key](action); // pass the action to the child
            else console.error("ReactActionStatePathClient.toMeFromParent CLEAR_PATH key set by child not there",this.constructor.name, this.childTitle, this.props.rasp.raspId, this.props.rasp.depth, key, this.props.rasp)
        } else if(this.toChild['default']) {
            return this.toChild['default'](action); // pass the action to the default childelse return null; // end of the line
        } else return null; // end of the line
    } else if (action.type === "RESET") {  // clear the path and reset the RASP state back to what the const
        var delta={};
        // reset all the children first (depth first)
        Object.keys(this.toChild).forEach(child => { // send the action to every child
            this.toChild[child](action)
          });
        if(this._defaults) this.restoreDefaults(); 
        if(this.actionToState) this.actionToState(action, this.props.rasp, "PARENT", this.initialRASP, delta);
        return null; // end of the line
    } else if (action.type === "SET_PATH") {
        var nextRASP, setBeforeWait;
        let obj = this.segmentToState && this.segmentToState(action, action.initialRASP);
        if (typeof obj === 'object') { nextRASP=obj.nextRASP; setBeforeWait=obj.setBeforeWait};
        if(typeof nextRASP === 'object') {
            var key = nextRASP[this.keyField];
            if (typeof key !== 'undefined' && key !== null) {
                if (this.toChild[key]) this.props.rasp.toParent({ type: 'SET_STATE_AND_CONTINUE', nextRASP, function: this.toChild[key] }); // note: toChild of button might be undefined becasue ItemStore hasn't loaded it yet
                else if (setBeforeWait) {
                    this.waitingOn={nextRASP, nextFunc: ()=>this.props.rasp.toParent({type: "CONTINUE_SET_PATH", function: this.toChild[key]})};
                    this.props.rasp.toParent({type: "SET_STATE", nextRASP});       
                } else {
                    if(this.debug.noop) console.log("ReactActionStatePathClient.toMeFromParent SET_PATH waitingOn", nextRASP);
                    this.waitingOn = {nextRASP};
                }
            } else if(this.toChild['default']) {
                this.props.rasp.toParent({ type: 'SET_STATE_AND_CONTINUE', nextRASP, function: this.toChild['default'] });
            } else {
                this.props.rasp.toParent({ type: 'SET_STATE_AND_CONTINUE', nextRASP, function: null });
            }
        } else {
            var key = action.initialRASP[this.keyField];
            if (typeof key !== 'undefined' && key !== null && this.toChild[key]) {
                this.props.rasp.toParent({ type: 'SET_PATH_SKIP', function: this.toChild[key] }); // note: toChild of button might be undefined becasue ItemStore hasn't loaded it yet
            } else {
                if(this.toChild['default']){
                    this.props.rasp.toParent({ type: 'SET_PATH_SKIP', function: this.toChild['default']}); // we assume there is only 1, if there are others they are ignored
                } else {
                    let keys=Object.keys(this.toChild);
                    if(keys.length)
                        this.props.rasp.toParent({ type: 'SET_PATH_SKIP', function: this.toChild[keys[0]] }); // we assume there is only 1, if there are others they are ignored
                    else {
                        if(this.debug.noop) console.log("ReactActionStatePathClient.toMeFromParent SET_PATH_SKIP waitingOn", action.initialRASP);
                        this.waitingOn = {nextRASP: action.initialRASP, function: ()=>this.props.rasp.toParent({type: "SET_PATH_SKIP", function: this.toChild[Object.keys(this.toChild)[0]]})};
                    }
                }
            }
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
        } else if(this.toChild['default']) {
            return this.toChild['default'](action); // pass the action to the default child
        } else {
            if(this.debug.noop) console.info("ReactActionStatePathClient.toMeFromParent unknown action and not active child", this.constructor.name, this.childTitle, this.props.rasp.raspId, action);
        }
    }
}

  // a consistent way to set the rasp for children
  childRASP(shape, childKey='default') {
      return (
          Object.assign({}, this.props.rasp, { shape, toParent: this.toMeFromChild.bind(this, childKey) })
      );
  }

  // when using actionFilers all you need is this actionToState - or you can replace it
  actionToState(action, rasp, source, initialRASP, delta) {
    if (this.debug.noop) console.info("ReactActionStatePath.actionToState", ...arguments);
    var nextRASP = {};

    if (this.vM && this.vM.actionToState(action, rasp, source, initialRASP, delta)) {
      ; //then do nothing - it's been done if (action.type==="DESCENDANT_FOCUS") {
    } else if(Object.keys(delta).length) {
      ; // no need to do anything, but do continue to calculate nextRASP
    } else
      return null; // don't know this action, null so the default methods can have a shot at it

    Object.assign(nextRASP, rasp, delta);
    if(this.vM && this.vM.deriveRASP)
        this.vM.deriveRASP(nextRASP, initialRASP);
    else if(this.deriveRASP)
        this.deriveRASP(nextRASP, initialRASP);
    return nextRASP;
  }

  componentWillMount(){
    if(this.actionFilters) Object.keys(this.actionFilters).forEach(filterType=>
        this.props.rasp.toParent({type: "SET_ACTION_FILTER", filterType, name: this.constructor.name, function: this.actionFilters[filterType].bind(this)}) 
    );
    }

}

// for PathMulti the keyField should be a number
// when SET_PATH is used to set the state, the state for all toChild[]s with key's less than the one specified in the pathSegment/ action.segment will have SET_STATE called on them first.
// setting the next toChild[]'s state will continue when the RASP Component calls this.waitingOnResults.nextFunc.  
// Make sure to check .waitingOnResults[this.keyField] to ensure you are calling .nextFunc for the child/key that is being waited on, and not a previous one that is setting results again.
//

export class ReactActionStatePathMulti extends ReactActionStatePathClient{
    constructor(props,keyfield,debug){
        super(props,keyfield,debug);
        if(typeof debug==='object') this.debug=debug;
        else this.debug={noop: debug};
        
    }


    toMeFromParent(action) {
        if(this.debug.noop) console.info("ReactActionStatePathMulti.toMeFromParent", this.props.rasp.depth, action);
        if (action.type === "ONPOPSTATE") {
            if (this.debug.noop) console.log("ReactActionStatePathMulti.toMeFromParent ONPOPSTATE", this.props.rasp.depth, action);
            var { stackDepth, stateStack } = action;
            var keepChild = [];
            Object.keys(this.toChild).forEach(child => keepChild[child] = false);
            var nextRASP=stateStack[stackDepth];
            var {raspChildren}=nextRASP;
            delete nextRASP.raspChildren;
            delete keepChild['default']; // don't delete default if it is there
            var unwrapChildren=()=>{
                if(raspChildren && raspChildren.length){
                    const{key, stateStack}=raspChildren.shift();
                    keepChild[key]=true;
                    const childRASP=Object.assign({},nextRASP,{[this.keyField]: key})
                    if(this.toChild[key]) {
                        this.toChild[key]({type: "ONPOPSTATE", stateStack, stackDepth: 0}); 
                        return unwrapChildren();
                    } else {
                        this.waitingOn={nextRASP: childRASP, nextFunc: ()=>{this.toChild[key]({type: "ONPOPSTATE", stateStack, stackDepth: 0}); unwrapChildren();}}
                        return this.props.rasp.toParent({type: "SET_STATE", nextRASP: childRASP});
                    }
                } else {
                    /* Don't clear the children - it doesn't reset the parent's state and you won't have to reload data
                    keepChild.forEach((keep, child) => { // child id is the index
                        if (!keep) {
                            console.info("ReactActionStatePathMulti.toMeFromParent ONPOPSTATE child not kept", child);
                            this.toChild[child]({ type: "CLEAR_PATH" });
                        }
                    })*/
                    if(stackDepth+1 >= stateStack.length) { // end of the line
                        return this.props.rasp.toParent({ type: "SET_STATE", nextRASP });
                    } 
                    var key = nextRASP[this.keyField];
                    var nextFunc=()=>this.toChild[key]({type: "ONPOPSTATE", stateStack, stackDepth: stackDepth+1 });
                    if (typeof key !== 'undefined' && key !== null) {
                        if(this.toChild[key]) {
                            nextFunc();
                            this.props.rasp.toParent({type: "SET_STATE", nextRASP, nextFunc});
                        } else {
                            this.waitingOn={nextRASP, nextFunc};
                            this.props.rasp.toParent({type: "SET_STATE", nextRASP});     
                        }
                    } else if(this.toChild[key='default']) {
                        nextFunc();
                    } else {
                        console.error("ReactActionStatePathMulti.toMeFromParent ONPOPSTATE but no child", action )
                    }
                }
            }
            unwrapChildren();
            return;
        } else if (action.type === "GET_STATE") {
        // get the state info from all the children and combind them into one Object
            if (this.debug.noop) console.log("ReactActionStatePathMulti.toMeFromParent GET_STATE", this.props.rasp.depth, action);
            var {toParent, ...rasp}=this.props.rasp; // exclude the function which can not be saved as part of the pushstate
            var raspChildren = Object.keys(this.toChild).map(child => {
                return {
                    stateStack: this.toChild[child]({ type: "GET_STATE" }),
                    key: child
                }
            });
            if (raspChildren.length === 0 || (raspChildren.length === 1 && !raspChildren[0].stateStack)) return [rasp]; // if the only child doesn't really exist yet (because it returns null) just return null
            // curPath= child1(pathSegment1/pathSegment2/pathSegment...pathSegmentN)child2(pathSegment1/pathSegment2/...pathSegmentN)
            var curPath = raspChildren.reduce((acc, ch) => acc + ch.key
                + '(' + ch.stateStack.reduce((acc, s) => s.pathSegment ? (acc ? acc + '/' + s.pathSegment : s.pathSegment) : acc, '')
                + ')'
                , '');
            rasp.raspChildren=raspChildren;
            rasp.pathSegment = this.props.rasp.pathSegment+ '('+curPath+')';
            if (this.debug.noop) console.log("ReactActionStatePathMulti.toMeFromParent GET_STATE returns", rasp);
            return [rasp];
        } else if (action.type === "CLEAR_PATH") {  // clear the path and reset the RASP state back to what the const
          Object.keys(this.toChild).forEach(child => { // send the action to every child
            this.toChild[child](action)
          });
        } else if (action.type === "RESET") {  // clear the path and reset the RASP state back to what the const
            var delta={};
            // reset children first
            Object.keys(this.toChild).forEach(child => { // send the action to every child
                this.toChild[child](action)
              });
            if(this._defaults) this.restoreDefaults(); 
            if(this.actionToState) this.actionToState(action, this.props.rasp, "PARENT", this.initialRASP, delta);
            return null; // end of the line
        } else if (action.type === "SET_PATH") {
            if(this.debug.noop) console.info("ReactActionStatePathMulti.toMeFromParent SET_PATH", action);
            const parts=unwrap(action.segment);
            const { nextRASP, setBeforeWait} = this.segmentToState({type: "SET_PATH", segment: parts[0], initialRASP: action.initialRASP});
            var raspChildren=unwrap(parts[1]); // undefined if undefined
            if(raspChildren && raspChildren.length & 1) {console.error("ReactActionStatePathMulti.toMeFromParent SET_PATH expected an even number in unwrap", raspChildren )}
            var unwrapChildren=()=>{
                if(raspChildren.length){
                    var key=raspChildren.shift();
                    if(parseInt(key,10)==key) key=parseInt(key,10); // if key could be an int, convert it to one. otherwise leave it alone.
                    var pathSegments=unwrap(raspChildren.shift());
                    var childRASP=Object.assign({},nextRASP,{[this.keyField]: key})
                    if(raspChildren.length) this.waitingOnResults={ [this.keyField]: key, nextFunc: ()=>{// only advance to next child if there is one, waitingOnResults and waitingOn may happen in any order
                        if(!this.waitingOnSetPath) unwrapChildren()
                    }} 
                    this.waitingOn={nextRASP: childRASP, nextFunc: ()=>{
                        if(pathSegments.length){
                            this.waitingOnSetPath=true;
                            this.toChild[key]({type: "SET_PATH", pathSegments, onSetPathComplete: ()=>{
                                this.waitingOnSetPath=undefined;
                                if(!this.waitingOnResults) return unwrapChildren();
                            }})
                        } else { // the child is in the path but has no state to set ex  0()
                            if(!raspChildren.length){
                                unwrapChildren();
                            }
                        }
                    }};
                    this.props.rasp.toParent({type: "SET_STATE", nextRASP: childRASP})
                } else {
                    var key = nextRASP[this.keyField];
                    if (typeof key !== 'undefined' && key !== null) {
                        if (this.toChild[key]) this.props.rasp.toParent({ type: 'SET_STATE_AND_CONTINUE', nextRASP, function: this.toChild[key] }); // note: toChild of button might be undefined becasue ItemStore hasn't loaded it yet
                        else if (setBeforeWait) {
                            this.waitingOn={nextRASP, nextFunc: ()=>this.props.rasp.toParent({type: "CONTINUE_SET_PATH", function: this.toChild[key]})};
                            this.props.rasp.toParent({type: "SET_STATE", nextRASP});       
                        } else {
                            if(this.debug.noop) console.log("ReactActionStatePathClient.toMeFromParent SET_PATH waitingOn", nextRASP);
                            this.waitingOn = {nextRASP};
                        }
                    } else if(this.toChild['default']) {
                        this.props.rasp.toParent({ type: 'SET_STATE_AND_CONTINUE', nextRASP, function: this.toChild['default'] });
                    } else {
                        this.props.rasp.toParent({ type: 'SET_STATE_AND_CONTINUE', nextRASP, function: null });
                    }
                }
            }
            unwrapChildren();
        } else {
            // is there a key in the action
            let key=action[this.keyField];
            if(typeof key!=='undefined' && this.toChild[key]){
                if(this.debug.noop) console.info("ReactActionStatePathClient.toMeFromParent passing action to child based on action keyField", this.constructor.name, this.childTitle, this.props.rasp.raspId, action, key);
                return this.toChild[key](action);
            }
            
            let keys=Object.keys(this.toChild);
            if(keys.length) {
                var rasp;
                keys.forEach(key => { // send the action to every child
                    if(this.debug.noop) console.info("ReactActionStatePathMulti.toMeFromParent passing action to child", this.constructor.name, this.childTitle, this.props.rasp.raspId, action, key);
                    rasp=this.toChild[key](action);
                });
                return rasp;
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
        this.createDefaults = createDefaults.bind(this);
        this.restoreDefaults = restoreDefaults.bind(this);
        var _staticKeys = Object.keys(this); // the react keys that we aren't going to touch when resetting
        this._staticKeys = _staticKeys.concat(['state', '_reactInternalInstance', '_defaults', '_staticKeys']); // also don't touch these
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
