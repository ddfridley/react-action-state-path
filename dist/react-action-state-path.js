'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ReactActionStatePathClient = exports.ReactActionStatePath = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _union = require('lodash/union');

var _union2 = _interopRequireDefault(_union);

var _shallowequal = require('shallowequal');

var _shallowequal2 = _interopRequireDefault(_shallowequal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// for comparing rasp states, we use equaly.  If a property in two objects is logically false in both, the property is equal.  This means that undefined, null, false, 0, and '' are all the same.
// and we make a deep compare
var equaly = function equaly(a, b) {
    if (!a && !b) return true; //if both are false, they are the same
    var t = typeof a === 'undefined' ? 'undefined' : _typeof(a);
    if (t !== (typeof b === 'undefined' ? 'undefined' : _typeof(b))) return false; // if not falsy and types are not equal, they are not equal
    if (t === 'object') return (0, _union2.default)(Object.keys(a), Object.keys(b)).every(function (k) {
        return equaly(a[k], b[k]);
    }); // they are both objects, break them down and compare them
    if (t === 'function') return true; //treat functions are equal no matter what they are
    if (a && b) return a == b; // if both are truthy are they equal
    return false;
};

//React Action State Path - manages the state of react components that interact with each other and change state based user interactions and interactions between stateful components.
//Components communicate through the rasp object, which is passed between them.  The basic component is
//rasp={shape: a string representing a shape.  You can have any shapes you want, this is using 'truncated', 'open' and 'collapsed' but this can be upto the implementation.  But all components will need to understand these shapes
//     depth: the distance of the component from the root (first) component.
//     toParent: the function to call to send 'actions' to the parent function
//     each child component can add more properties to it's state, through the actionToState function
//     }
//

var queue = 0;

var qaction = function qaction(func, delay) {
    queue += 1;
    console.info("qaction queueing", queue);
    setTimeout(function () {
        //        if((--ReactActionStatePath)<0)console.error("ReactActionStatePath.queue should not be negative, got",ReactActionStatePath.queue); 
        console.info("qaction continuing", --queue);
        func();
        if (queue === 0 && UpdateHistory) {
            console.info("qaction updating history");
            UpdateHistory();
        } else console.info("qaction after continuing", queue);
    }, 0);
};

var qhistory = function qhistory(func, delay) {
    console.info("qhistory", queue);
    //    if(ReactActionStatePath.queue) console.info("ReactActionStatePath queue - would have been put off")
    setTimeout(func, delay);
};

var UpdateHistory;

var ReactActionStatePath = exports.ReactActionStatePath = function (_React$Component) {
    _inherits(ReactActionStatePath, _React$Component);

    function ReactActionStatePath(props) {
        _classCallCheck(this, ReactActionStatePath);

        //logger.trace("ReactActionStatePath.constructor", this.constructor.name, this.props.rasp);
        var _this = _possibleConstructorReturn(this, (ReactActionStatePath.__proto__ || Object.getPrototypeOf(ReactActionStatePath)).call(this, props));

        _this.toChild = null;
        _this.childName = '';
        _this.childTitle = '';
        _this.debug = 0;
        _this.waitingOn = false;
        _this.initialRASP = Object.assign({}, { shape: _this.props.rasp && _this.props.rasp.shape ? _this.props.rasp.shape : 'truncated',
            depth: _this.props.rasp ? _this.props.rasp.depth : 0 // for debugging  - this is my depth to check
        }, _this.props.initialRASP);
        if (typeof window !== 'undefined') {
            // browser side, there should be no rasp
            if (!(_this.props.rasp && _this.props.rasp.toParent)) {
                if (typeof ReactActionStatePath.nextId !== 'undefined') console.error("ReactActionStatePath.constructor no parent, but not root!");
            } else {
                _this.props.rasp.toParent({ type: "SET_TO_CHILD", function: _this.toMeFromParent.bind(_this), name: "ReactActionStatePath" });
            }
        } else {
            // server side, rasp is how we get the data out
            if (!_this.props.rasp || typeof _this.props.rasp.depth === 'undefined' || _this.props.RASPRoot) {
                // this is this root
                console.info("ReactActionStatePath.construction at root");
                if (typeof ReactActionStatePath.nextId !== 'undefined') {
                    console.info("ReactActionStatePath.construction at root, but nextId was", ReactActionStatePath.nextId);
                    ReactActionStatePath.nextId = undefined;
                }
            }
            if (_this.props.rasp && _this.props.rasp.toParent) {
                _this.props.rasp.toParent({ type: "SET_TO_CHILD", function: _this.toMeFromParent.bind(_this), name: "ReactActionStatePath" });
            }
        }
        // not an else of above because of the possibility that one might want to put a rasp and toParent before the first component
        if (typeof ReactActionStatePath.nextId === 'undefined') {
            // this is the root ReactActionStatePath
            ReactActionStatePath.nextId = 0;
            ReactActionStatePath.queue = 0; // initialize the queue count
            ReactActionStatePath.topState = null;
            if (_this.props.path && _this.props.path !== '/') {
                var pathSegments = _this.props.path.split('/');
                while (pathSegments.length && !pathSegments[0]) {
                    pathSegments.shift();
                } // an initial '/' turns into an empty element at the beginning
                while (pathSegments.length && !pathSegments[pathSegments.length - 1]) {
                    pathSegments.pop();
                } // '/'s at the end translate to null elements, remove them
                var root = (_this.props.RASPRoot || '/h/').split('/');
                while (root.length && !root[0]) {
                    root.shift();
                } // shift off leading empty's caused by leading '/'s
                while (root.length && !root[root.length - 1]) {
                    root.pop();
                } // '/'s at the end translate to null elements, remove them
                if (root.some(function (segment) {
                    return segment !== pathSegments.shift();
                })) {
                    console.error("ReactActionStatePath.componentDidMount path didn't match props", root, pathSegments);
                }
                ReactActionStatePath.pathSegments = pathSegments;
            } else ReactActionStatePath.pathSegments = [];

            if (typeof window !== 'undefined') {
                // if we are running on the browser
                ReactActionStatePath.thiss = [];
                window.onpopstate = _this.onpopstate.bind(_this);
                window.ReactActionStatePath = { thiss: ReactActionStatePath.thiss };
                UpdateHistory = _this.updateHistory.bind(_this);
                if (ReactActionStatePath.pathSegments.length === 0) qhistory(function () {
                    return _this.updateHistory();
                }, 0); // aftr things have settled down, update history for the first time
            }
            console.info("ReactActionStatePath.thiss", ReactActionStatePath.thiss);
        }
        _this.id = ReactActionStatePath.nextId++; // get the next id

        _this.state = _this.getDefaultState();
        if (typeof window !== 'undefined') ReactActionStatePath.thiss[_this.id] = { parent: _this, client: null };
        return _this;
    }

    _createClass(ReactActionStatePath, [{
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this.debug) console.info("ReactActionStatePath.componentWillUnmount", this.id, this.childTitle);
            if (typeof window !== 'undefined') {
                ReactActionStatePath.thiss[this.id] = undefined;
                var id = this.id;
                if (id === ReactActionStatePath.nextId - 1) {
                    while (id && typeof ReactActionStatePath.thiss[id] === 'undefined') {
                        id--;
                    }if (!id && typeof ReactActionStatePath.thiss[id] === 'undefined') ReactActionStatePath.nextId = undefined;else ReactActionStatePath.nextId = id + 1;
                }
            }
        }

        // consistently get the default state from multiple places

    }, {
        key: 'getDefaultState',
        value: function getDefaultState() {
            return { rasp: Object.assign({}, this.initialRASP) };
        }

        // handler for the window onpop state
        // only the root ReactActionStatePath will set this 
        // it works by recursively passing the ONPOPSTATE action to each child RASP component starting with the root

    }, {
        key: 'onpopstate',
        value: function onpopstate(event) {
            var _this2 = this;

            if (this.debug) console.info("ReactActionStatePath.onpopstate", this.id, { event: event });
            if (event.state && event.state.stateStack) {
                if (ReactActionStatePath.topState) console.error("ReactActionStatePath.onpopstate expected topState null, got:", ReactActionStatePath.topState);
                ReactActionStatePath.topState = "ONPOPSTATE";
                var completionCheck = setTimeout(function () {
                    if (ReactActionStatePath.topState === "ONPOPSTATE") {
                        console.error("ReactActionStatePath.onpopstate ONPOPSTATE did not complete.", _this2);
                        ReactActionStatePath.topState = null;
                    }
                }, 10000);
                this.toMeFromParent({ type: "ONPOPSTATE", stateStack: event.state.stateStack, stackDepth: 0 });
                logger.trace("ReactActionStatePath.onpopsate: returned.");
                ReactActionStatePath.topState = null;
                clearTimeout(completionCheck);
            }
        }
    }, {
        key: 'toMeFromChild',
        value: function toMeFromChild(action) {
            var _this3 = this;

            if (this.debug) console.info("ReactActionStatePath.toMeFromChild", this.id, this.props.rasp && this.props.rasp.depth, this.childName, this.childTitle, action, this.state.rasp);
            var nextRASP = {};
            if (!action.distance) action.distance = 0; // action was from component so add distance
            if (action.distance < 0) {
                action.distance += 1;if (this.id) return this.props.rasp.toParent(action);else return;
            }
            if (action.type === "SET_TO_CHILD") {
                // child is passing up her func
                this.debug = action.debug;
                if (this.debug) console.info("ReactActionStatePath.toMeFromChild debug set", this.debug, this.id, this.props.rasp && this.props.rasp.depth, this.childName, this.childTitle, action, this.state.rasp);
                this.toChild = action.function;
                if (action.name) this.childName = action.name;
                if (action.actionToState) this.actionToState = action.actionToState;
                if (action.clientThis && typeof window !== 'undefined') ReactActionStatePath.thiss[this.id].client = action.clientThis;else {
                    if (typeof window !== 'undefined') console.error("ReactActionStatePath.toMeFromChild SET_TO_CHILD clientThis missing on browser", this.id, this.props.rasp && this.props.rasp.depth, this.childName, this.childTitle, action);
                }if (typeof window !== 'undefined' && this.id === 0 && ReactActionStatePath.pathSegments.length) {
                    // this is the root and we are on the browser and there is at least one pathSegment
                    logger.trace("ReactActionStatePath.toMeFromChild will SET_PATH to", ReactActionStatePath.pathSegments);
                    if (ReactActionStatePath.topState) console.error("ReactActionStatePath.toMeFromChild SET_TO_CHILD, expected topState null got:", ReactActionStatePath.topState);
                    this.completionCheck = setTimeout(function () {
                        if (ReactActionStatePath.topState === "SET_PATH") {
                            console.error("ReactActionStatePath.toMeFromChild SET_PATH did not complete", _this3);
                            ReactActionStatePath.topState = null;
                        }
                    }, 10000);
                    qaction(function () {
                        ReactActionStatePath.topState = "SET_PATH";
                        _this3.toChild({ type: "SET_PATH", segment: ReactActionStatePath.pathSegments.shift(), initialRASP: _this3.initialRASP });
                    }, 0); // this starts after the return toChild so it completes.
                } else if (this.waitingOn) {
                    var nextFunc = this.waitingOn.nextFunc;
                    this.waitingOn = null;
                    qaction(nextFunc, 0);
                    return;
                }
            } else if (action.type === "SET_DATA") {
                logger.trace("ReactActionStatePath.toMeFromChild SET_DATA", this.id, this.props.rasp && this.props.rasp.depth, action.nextRASP);
                this.setState({ rasp: Object.assign({}, this.state.rasp, { data: action.data }) });
            } else if (action.type === "SET_STATE") {
                logger.trace("ReactActionStatePath.toMeFromChild SET_STATE", this.id, this.props.rasp && this.props.rasp.depth, action.nextRASP);
                this.setState({ rasp: Object.assign({}, this.state.rasp, action.nextRASP) });
            } else if (action.type === "SET_TITLE") {
                logger.trace("ReactActionStatePath.toMeFromChild SET_TITLE", this.id, this.props.rasp && this.props.rasp.depth, action.nextRASP);
                this.childTitle = action.title; // this is only for pretty debugging
            } else if (action.type === "CONTINUE_SET_PATH") {
                if (ReactActionStatePath.pathSegments.length) {
                    logger.trace("ReactActionStatePath.toMeFromChild CONTINUE to SET_PATH", this.id, this.props.rasp && this.props.rasp.depth, action.nextRASP);
                    qaction(function () {
                        return action.function({ type: 'SET_PATH', segment: ReactActionStatePath.pathSegments.shift(), initialRASP: _this3.initialRASP });
                    }, 0);
                } else {
                    logger.trace("ReactActionStatePath.toMeFromChild CONTINUE to SET_PATH last one", this.id, this.props.rasp && this.props.rasp.depth, this.state.rasp);
                    if (this.id !== 0) this.props.rasp.toParent({ type: "SET_PATH_COMPLETE" });else {
                        logger.trace("ReactActionStatePath.toMeFromChild CONTINUE_SET_PATH updateHistory");this.updateHistory();
                    };
                }
            } else if (action.type === "SET_STATE_AND_CONTINUE") {
                if (ReactActionStatePath.pathSegments.length) {
                    logger.trace("ReactActionStatePath.toMeFromChild SET_STATE_AND_CONTINUE to SET_PATH", this.id, this.props.rasp && this.props.rasp.depth, action.nextRASP);
                    if (action.function) this.setState({ rasp: Object.assign({}, this.state.rasp, action.nextRASP) }, function () {
                        return action.function({ type: 'SET_PATH', segment: ReactActionStatePath.pathSegments.shift(), initialRASP: _this3.initialRASP });
                    });else {
                        console.error("ReactActionStatePath.toMeFromChild SET_STATE_AND_CONTINUE pathSegments remain, but no next function", this.id, this.childTitle, action, ReactActionStatePath.pathSegments);
                        this.setState({ rasp: Object.assign({}, this.state.rasp, action.nextRASP) });
                    }
                } else {
                    logger.trace("ReactActionStatePath.toMeFromChild SET_STATE_AND_CONTINUE last one", this.id, this.props.rasp && this.props.rasp.depth, this.state.rasp, action.nextRASP);
                    this.setState({ rasp: Object.assign({}, this.state.rasp, action.nextRASP) }, function () {
                        if (_this3.id !== 0) _this3.props.rasp.toParent({ type: "SET_PATH_COMPLETE" });else {
                            logger.trace("ReactActionStatePath.toMeFromChild  SET_STATE_AND_CONTINUE last one updateHistory");
                            ReactActionStatePath.topState = null;
                            clearTimeout(_this3.completionCheck);
                            _this3.updateHistory();
                        }
                    });
                }
            } else if (action.type === "SET_PATH_COMPLETE") {
                if (this.id !== 0) return this.props.rasp.toParent({ type: "SET_PATH_COMPLETE" });else {
                    logger.trace("ReactActionStatePath.toMeFromChild SET PATH COMPLETED, updateHistory");
                    ReactActionStatePath.topState = null;
                    clearTimeout(this.completionCheck);
                    return this.updateHistory();
                }
            } else if (this.actionToState && (nextRASP = this.actionToState(action, this.state.rasp, "CHILD", this.getDefaultState().rasp)) !== null) {
                if (this.state.rasp.pathSegment && !nextRASP.pathSegment) {
                    // path has been removed
                    logger.trace("ReactActionStatePath.toChildFromParent child changed state and path being removed so reset children", this.id, this.state.rasp.pathSegment
                    //this.toChild({type:"CLEAR_PATH"}); // if toChild is not set let there be an error
                    );
                } else if (!this.state.rasp.pathSegment && nextRASP.pathSegment) {
                    // path being added
                    logger.trace("ReactActionStatePath.toChildFromParent path being added", this.id, nextRASP.pathSegment);
                }
                if (this.id !== 0 && !ReactActionStatePath.topState && (action.type === "DECENDANT_FOCUS" || action.type === "DECENDANT_UNFOCUS")) {
                    this.setState({ rasp: nextRASP }, function () {
                        return _this3.props.rasp.toParent({ type: action.type, distance: action.distance + 1, shape: _this3.state.rasp.shape });
                    });
                } else if (this.id !== 0) {
                    this.setState({ rasp: nextRASP });
                } else {
                    // this is the root, after changing shape, remind me so I can update the window.histor
                    if (equaly(this.state.rasp, nextRASP)) {
                        if (this.debug) console.info("ReactActionStatePath.toMeFromChild actionToState equaly updateHistory", action);
                        this.updateHistory();
                    } // updateHistory now!
                    else this.setState({ rasp: nextRASP }, function () {
                            if (_this3.debug) console.info("ReactActionStatePath.toMeFromChild actionToState setState updateHistory", action);
                            qhistory(function () {
                                return _this3.updateHistory();
                            }, 0); // update history after the queue of chanages from this state change is processed);
                        }); // otherwise, set the state and let history update on componentDidUpdate
                }
            }
            // these actions are overridden by the component's actonToState if either there is and it returns a new RASP to set (not null)
            else if (action.type === "DECENDANT_FOCUS" || action.type === "DECENDANT_UNFOCUS") {
                    if (this.id) {
                        action.distance += 1;action.shape = this.state.rasp.shape;return this.props.rasp.toParent(action);
                    } else return qhistory(function () {
                        if (_this3.debug) console.info("ReactActionStatePath.toMeFromChild ", action.type, " updateHistory");_this3.updateHistory();
                    }, 0);;
                } else if (action.type === "CHANGE_SHAPE") {
                    if (this.state.rasp.shape !== action.shape) {
                        // really the shape changed
                        var nextRASP = Object.assign({}, this.state.rasp, { shape: action.shape });
                        if (this.id !== 0) {
                            // don't propogate a change
                            this.setState({ rasp: nextRASP });
                        } else // this is the root, change state and then update history
                            this.setState({ rasp: nextRASP }, function () {
                                logger.trace("ReactActionStatePath.toMeFromChild CHANGE_SHAPE updateHistory");
                                qhistory(function () {
                                    return _this3.updateHistory;
                                }, 0); // update history after changes from setstate have been processed
                            });
                    } // no change, nothing to do
                } else if (action.type === "CHILD_SHAPE_CHANGED") {
                    if (this.debug) console.info("ReactActionStatePath.toMeFromChild CHILD_SHAPE_CHANGED not handled by actionToState", this.id, this.props.rasp && this.props.rasp.depth);
                    if (this.id !== 0) {
                        if (this.debug) console.info("ReactActionStatePath.toMeFromChild CHILD_SHAPE_CHANGED not handled by actionToState, not root", this.id, this.props.rasp && this.props.rasp.depth, this.childTitle);
                        this.props.rasp.toParent({ type: "CHILD_SHAPE_CHANGED", shape: action.shape, distance: action.distance + 1 }); // pass a new action, not a copy including internal properties like itemId. This shape hasn't changed
                    } else {
                        // this is the root RASP, update history.state
                        if (this.debug) console.info("ReactActionStatePath.toMeFromChild CHILD_SHAPE_CHANGED not handled by actionToState at root", this.id, this.props.rasp && this.props.rasp.depth, this.childTitle);
                        qhistory(function () {
                            if (_this3.debug) console.info("ReactActionStatePath.toMeFromChild CHILD_SHAPE_CHANGED default updateHistory");_this3.updateHistory();
                        }, 0);
                    }
                } else if (action.type === "CHILD_STATE_CHANGED") {
                    if (this.debug) console.info("ReactActionStatePath.toMeFromChild CHILD_STATE_CHANGED not handled by actionToState", this.id, this.props.rasp && this.props.rasp.depth);
                    action.distance += 1;
                    if (this.id !== 0) {
                        if (this.debug) console.info("ReactActionStatePath.toMeFromChild CHILD_STATE_CHANGED not handled by actionToState, not root", this.id, this.props.rasp && this.props.rasp.depth, this.childTitle);
                        this.props.rasp.toParent(action); // passs the original action, with incremented distance
                    } else {
                        // this is the root RASP, update history.state
                        if (this.debug) console.info("ReactActionStatePath.toMeFromChild CHILD_STATE_CHANGED not handled by actionToState at root", this.id, this.props.rasp && this.props.rasp.depth, this.childTitle);
                        if (typeof window === 'undefined' && this.props.rasp && this.props.rasp.toParent) qaction(function () {
                            return _this3.props.rasp.toParent(action);
                        }, 0); // on server, send action to server renderer
                        qhistory(function () {
                            if (_this3.debug) console.info("ReactActionStatePath.toMeFromChild CHILD_STATE_CHANGED default updateHistory");_this3.updateHistory();
                        }, 0);
                    }
                } else {
                    // the action was not understood, send it up
                    if (this.id) {
                        action.distance += 1;return this.props.rasp.toParent(action);
                    } else return;
                }
            return null;
        }
    }, {
        key: 'toMeFromParent',
        value: function toMeFromParent(action) {
            var _this4 = this;

            if (this.debug) console.info("ReactActionStatePath.toMeFromParent", this.id, this.props.rasp && this.props.rasp.depth, this.childName, this.childTitle, action, this.state.rasp);
            var nextRASP = {};
            if (action.type === "ONPOPSTATE") {
                var stackDepth = action.stackDepth,
                    stateStack = action.stateStack;

                if (stateStack[stackDepth].depth !== (this.id ? this.props.rasp.depth : 0)) console.error("ReactActionStatePath.toMeFromParent ONPOPSTATE state depth not equal to component depth", action.stateStack[stackDepth], this.props.rasp.depth); // debugging info
                if (stateStack.length > stackDepth + 1) {
                    if (this.toChild) this.toChild({ type: "ONPOPSTATE", stateStack: stateStack, stackDepth: stackDepth });else console.error("ReactActionStatePath.toMeFromParent ONPOPSTATE more stack but no toChild", { action: action }, { rasp: this.props.rasp });
                } else if (this.toChild) this.toChild({ type: "CLEAR_PATH" }); // at the end of the new state, deeper states should be reset
                this.setState({ rasp: stateStack[stackDepth] });
                return;
            } else if (action.type === "GET_STATE") {
                // return the array of all RASP States from the top down - with the top at 0 and the bottom at the end
                // it works by recursivelly calling GET_STATE from here to the end and then unshifting the RASP state of each component onto an array
                // the top RASP state of the array is the root component
                var stack = void 0;
                if (!this.toChild) {
                    console.error("ReactActionStatePath.toMeFromParetn GET_STATE child not ready", this.id, this.props.rasp && this.props.rasp.depth, this.state.rasp);
                    return [Object.assign({}, this.state.rasp)];
                } else stack = this.toChild(action);
                if (stack) stack.unshift(Object.assign({}, this.state.rasp)); // if non-rasp child is at the end, it returns null
                else stack = [Object.assign({}, this.state.rasp)];
                return stack;
            } else if (this.actionToState && (nextRASP = this.actionToState(action, this.state.rasp, "PARENT", this.getDefaultState().rasp)) !== null) {
                if (!equaly(this.state.rasp, nextRASP)) {
                    // really the shape changed
                    if (this.id !== 0) {
                        this.setState({ rasp: nextRASP });
                    } else // no parent to tell of the change
                        this.setState({ rasp: nextRASP }, function () {
                            logger.trace("ReactActionStatePath.toMeFromParent CONTINUE_SET_PATH updateHistory");
                            qhistory(function () {
                                return _this4.updateHistory;
                            }, 0); // update history after statechage events are processed
                        });
                } // no change, nothing to do
                return null;
            } else if (action.type === "CLEAR_PATH") {
                // clear the path and reset the RASP state back to what the constructor would
                if (this.toChild) this.toChild(action); // clear children first
                this.setState(this.getDefaultState()); // after clearing thechildren clear this state
                return null;
            } else if (action.type === "RESET_SHAPE") {
                // clear the path and reset the RASP state back to what the constructor would
                this.setState(this.getDefaultState()); //
                return null;
            } else if (action.type === "CHANGE_SHAPE") {
                // change the shape if it needs to be changed
                nextRASP = Object.assign({}, this.getDefaultState().rasp, { shape: action.shape }); // 
                this.setState({ rasp: nextRASP });
                return null;
            } else if (action.type === "SET_PATH") {
                // let child handle this one without complaint
                action.initialRASP = this.initialRASP; // segmentToState needs to apply this
                if (this.toChild) return this.toChild(action);else this.waitingOn = { nextFunc: function nextFunc() {
                        _this4.toChild(action);
                    } };
                return;
            } else {
                console.error("ReactActionStatePath.toMeFromParent: Unknown Action", { action: action }, { state: this.state });
                return this.toChild(action);
            }
        }
    }, {
        key: 'updateHistory',
        value: function updateHistory() {
            var _this5 = this;

            if (this.debug) console.info("ReactActionStatePath.updateHistory", this.id);
            if (this.id !== 0) console.error("ReactActionStatePath.updateHistory called but not from root", this.props.rasp);
            if (ReactActionStatePath.topState) console.error("ReactActionStatePath.updateHistory, expected topState null, got:", ReactActionStatePath.topState);
            if (queue) {
                console.info("ReactActionStatePath.updateHistory waiting, queue is", queue);
                return null;
            }
            if (typeof window === 'undefined') {
                console.info("ReactActionStatePath.updateHistory called on servr side");
                if (this.props.rasp && this.props.rasp.toParent) this.props.rasp.toParent({ type: "UPDATE_HISTORY" });
                return;
            }
            var completionCheck = setTimeout(function () {
                if (ReactActionStatePath.topState === "GET_STATE") {
                    console.error("ReactActionStatePath.updateHistory GET_STATE did not complete.", _this5);
                    ReactActionStatePath.topState = null;
                }
            }, 100);
            ReactActionStatePath.topState = "GET_STATE";
            var stateStack = { stateStack: this.toMeFromParent({ type: "GET_STATE" }) }; // recursively call me to get my state stack
            ReactActionStatePath.topState = null;
            clearTimeout(completionCheck);
            var curPath = stateStack.stateStack.reduce(function (acc, cur) {
                // parse the state to build the curreent path
                if (cur.pathSegment) acc.push(cur.pathSegment);
                return acc;
            }, []);
            curPath = (this.props.RASPRoot || '/h/') + curPath.join('/');
            if (curPath !== window.location.pathname) {
                // push the new state and path onto history
                logger.trace("ReactActionStatePath.toMeFromParent pushState", { stateStack: stateStack }, { curPath: curPath });
                window.history.pushState(stateStack, '', curPath);
            } else {
                // update the state of the current history
                logger.trace("ReactActionStatePath.toMeFromParent replaceState", { stateStack: stateStack }, { curPath: curPath });
                window.history.replaceState(stateStack, '', curPath); //update the history after changes have propogated among the children
            }
            return null;
        }

        /***  don't rerender if no change in state or props, use a logically equivalent check for state so that undefined and null are equivalent. Make it a deep compare in case apps want deep objects in their state ****/

    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(newProps, newState) {
            if (!equaly(this.state, newState)) {
                logger.trace("ReactActionStatePath.shouldComponentUpdate yes state", this.id, this.props.rasp && this.props.rasp.depth, this.childName, this.state, newState);return true;
            }
            if (!(0, _shallowequal2.default)(this.props, newProps)) {
                logger.trace("ReactActionStatePath.shouldComponentUpdate yes props", this.id, this.props.rasp && this.props.rasp.depth, this.childName, this.props, newProps);return true;
            }
            logger.trace("ReactActionStatePath.shouldComponentUpdate no", this.id, this.props.rasp && this.props.rasp.depth, this.childName, this.props, newProps, this.state, newState);
            return false;
        }
    }, {
        key: 'renderChildren',
        value: function renderChildren() {
            var _this6 = this;

            return _react2.default.Children.map(this.props.children, function (child) {
                var newProps = Object.assign({}, _this6.props, { rasp: Object.assign({}, _this6.state.rasp, { depth: _this6.props.rasp && _this6.props.rasp.depth ? _this6.props.rasp.depth + 1 : 1,
                        raspId: _this6.id,
                        toParent: _this6.toMeFromChild.bind(_this6)
                    }) //rasp in state override rasp in props
                });
                delete newProps.children;
                delete newProps.initialRASP; // don't let this propogate down to the next RASP with no initialization required
                delete newProps.RASPRoot; // don't let this propogate down, it tags the root
                return _react2.default.cloneElement(child, newProps, child.props.children);
            });
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    }, {
        key: 'render',
        value: function render() {
            var children = this.renderChildren();
            if (this.debug > 1) console.info("ReactActionStatePath.render", this.childName, this.childTitle, this.id, this.props, this.state);
            return _react2.default.createElement(
                'section',
                { id: 'rasp-' + this.id },
                children
            );
        }
    }]);

    return ReactActionStatePath;
}(_react2.default.Component);

exports.default = ReactActionStatePath;

var ReactActionStatePathClient = exports.ReactActionStatePathClient = function (_React$Component2) {
    _inherits(ReactActionStatePathClient, _React$Component2);

    function ReactActionStatePathClient(props) {
        var keyField = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'key';
        var debug = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

        _classCallCheck(this, ReactActionStatePathClient);

        var _this7 = _possibleConstructorReturn(this, (ReactActionStatePathClient.__proto__ || Object.getPrototypeOf(ReactActionStatePathClient)).call(this, props));

        _this7.toChild = [];
        _this7.waitingOn = null;
        _this7.keyField = keyField;
        _this7.debug = debug;
        if (!_this7.props.rasp) console.error("ReactActionStatePathClient no rasp", _this7.constructor.name, _this7.props);
        if (_this7.props.rasp.toParent) {
            _this7.props.rasp.toParent({ type: "SET_TO_CHILD", function: _this7.toMeFromParent.bind(_this7), name: _this7.constructor.name, actionToState: _this7.actionToState.bind(_this7), debug: debug, clientThis: _this7 });
        } else console.error("ReactActionStatePathClient no rasp.toParent", _this7.props);
        _this7.qaction = qaction; // make the module specific funtion available
        return _this7;
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // this is a one to many pattern for the RASP, insert yourself between the RASP and each child
    // send all unhandled actions to the parent RASP
    //


    _createClass(ReactActionStatePathClient, [{
        key: 'toMeFromChild',
        value: function toMeFromChild(key, action) {
            var _this8 = this;

            if (this.debug) console.info("ReactActionStatePathClient.toMeFromChild", this.constructor.name, this.childTitle, this.props.rasp.raspId, this.props.rasp.depth, key, action);
            if (action.type === "SET_TO_CHILD") {
                // child is passing up her func
                this.toChild[key] = action.function; // don't pass this to parent
                if (this.waitingOn) {
                    if (this.waitingOn.nextRASP) {
                        var nextRASP = this.waitingOn.nextRASP;
                        if (key === nextRASP[this.keyField] && this.toChild[key]) {
                            logger.trace("ReactActionStatePathClient.toMeFromParent got waitingOn nextRASP", nextRASP);
                            var nextFunc = this.waitingOn.nextFunc;
                            this.waitingOn = null;
                            if (nextFunc) qaction(nextFunc, 0);else qaction(function () {
                                return _this8.props.rasp.toParent({ type: "SET_STATE_AND_CONTINUE", nextRASP: nextRASP, function: _this8.toChild[key] });
                            }, 0);
                        }
                    }
                }
            } else {
                action[this.keyField] = key; // actionToState may need to know the child's id
                var result = this.props.rasp.toParent(action);
                // logger.trace(this.constructor.name, this.title, action,'->', this.props.rasp);
                return result;
            }
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // this can handle a one to many pattern for the RASP, handle each action appropriatly
        //

    }, {
        key: 'toMeFromParent',
        value: function toMeFromParent(action) {
            var _this9 = this;

            if (this.debug) console.info("ReactActionStatePathClient.toMeFromParent", this.constructor.name, this.childTitle, this.props.rasp.raspId, this.props.rasp.depth, action);
            if (action.type === "ONPOPSTATE") {
                var stateStack = action.stateStack,
                    stackDepth = action.stackDepth;

                var key = stateStack[stackDepth][this.keyField];
                var sent = false;
                Object.keys(this.toChild).forEach(function (child) {
                    // only child panels with RASP managers will have entries in this list. 
                    if (child === key) {
                        sent = true;_this9.toChild[child]({ type: "ONPOPSTATE", stateStack: stateStack, stackDepth: stackDepth + 1 });
                    } else _this9.toChild[child]({ type: "CLEAR_PATH" }); // only one button panel is open, any others are truncated (but inactive)
                });
                if (key && !sent) console.error("ReactActionStatePathClient.toMeFromParent ONPOPSTATE more state but child not found", { depth: this.props.rasp.depth }, { action: action });
                return; // this was the end of the lines
            } else if (action.type === "GET_STATE") {
                var key = this.props.rasp[this.keyField];
                if (typeof key !== 'undefined' && key !== null) {
                    if (this.toChild[key]) return this.toChild[key](action); // pass the action to the child
                    else console.error("ReactActionStatePathClien.toMeFromParent GET_STATE key set by child not there", this.constructor.name, this.childTitle, this.props.rasp.raspId, this.props.rasp.depth, key, this.props.rasp);
                } else return null; // end of the line
            } else if (action.type === "CLEAR_PATH") {
                // clear the path and reset the RASP state back to what the const
                var key = this.props.rasp[this.keyField];
                if (typeof key !== 'undefined' && key !== null) {
                    if (this.toChild[key]) return this.toChild[key](action); // pass the action to the child
                    else console.error("ReactActionStatePathClient.toMeFromParent CLEAR_PATH key set by child not there", this.constructor.name, this.childTitle, this.props.rasp.raspId, this.props.rasp.depth, key, this.props.rasp);
                } else return null; // end of the line
            } else if (action.type === "SET_PATH") {
                var _segmentToState = this.segmentToState(action, action.initialRASP),
                    nextRASP = _segmentToState.nextRASP,
                    setBeforeWait = _segmentToState.setBeforeWait;

                var key = nextRASP[this.keyField];
                if (typeof key !== 'undefined' && key !== null) {
                    if (this.toChild[key]) this.props.rasp.toParent({ type: 'SET_STATE_AND_CONTINUE', nextRASP: nextRASP, function: this.toChild[key] }); // note: toChild of button might be undefined becasue ItemStore hasn't loaded it yet
                    else if (setBeforeWait) {
                            this.waitingOn = { nextRASP: nextRASP, nextFunc: function nextFunc() {
                                    return _this9.props.rasp.toParent({ type: "CONTINUE_SET_PATH", function: _this9.toChild[key] });
                                } };
                            this.props.rasp.toParent({ type: "SET_STATE", nextRASP: nextRASP });
                        } else {
                            logger.trace("ReactActionStatePathClient.toMeFromParent SET_PATH waitingOn", nextRASP);
                            this.waitingOn = { nextRASP: nextRASP };
                        }
                } else {
                    this.props.rasp.toParent({ type: 'SET_STATE_AND_CONTINUE', nextRASP: nextRASP, function: null });
                }
            } else console.error("ReactActionStatePathClient.toMeFromParent action type unknown not handled", action);
        }

        // a consistent way to set the rasp for children

    }, {
        key: 'childRASP',
        value: function childRASP(shape, childKey) {
            return Object.assign({}, this.props.rasp, { shape: shape, toParent: this.toMeFromChild.bind(this, childKey) });
        }
    }]);

    return ReactActionStatePathClient;
}(_react2.default.Component);