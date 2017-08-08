'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _arguments = arguments;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactActionStatePath = require('./react-action-state-path');

var _reactProactiveAccordion = require('react-proactive-accordion');

var _reactProactiveAccordion2 = _interopRequireDefault(_reactProactiveAccordion);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

window.logger = {};
logger.info = function () {
    var _console;

    return (_console = console).info.apply(_console, _arguments);
};
logger.error = function () {
    var _console2;

    (_console2 = console).info.apply(_console2, ["logger.error called"].concat(Array.prototype.slice.call(_arguments)));
};
logger.trace = function () {};

var demoData = [{ subject: "The Constitution of the United States",
    text: "We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the general Welfare, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the United States of America.",
    parent: null,
    id: '1'
}, { subject: "Article. I. [Congress of the United States]",
    text: "",
    parent: '1',
    id: '2'
}, { subject: "Section. 1.",
    text: "All legislative Powers herein granted shall be vested in a Congress of the United States, which shall consist of a Senate and House of Representatives.",
    parent: '2',
    id: '3'
}, { subject: "Section. 2.",
    text: "The House of Representatives shall be composed of Members chosen every second Year by the People of the several States, and the Electors in each State shall have the Qualifications requisite for Electors of the most numerous Branch of the State Legislature.\n\nNo Person shall be a Representative who shall not have attained to the Age of twenty five Years, and been seven Years a Citizen of the United States, and who shall not, when elected, be an Inhabitant of that State in which he shall be chosen.\n\nRepresentatives and direct Taxes shall be apportioned among the several States which may be included within this Union, according to their respective Numbers, which shall be determined by adding to the whole Number of free Persons, including those bound to Service for a Term of Years, and excluding Indians not taxed, three fifths of all other Persons. The actual Enumeration shall be made within three Years after the first Meeting of the Congress of the United States, and within every subsequent Term of ten Years, in such Manner as they shall by Law direct. The Number of Representatives shall not exceed one for every thirty Thousand, but each State shall have at Least one Representative; and until such enumeration shall be made, the State of New Hampshire shall be entitled to chuse three, Massachusetts eight, Rhode-Island and Providence Plantations one, Connecticut five, New-York six, New Jersey four, Pennsylvania eight, Delaware one, Maryland six, Virginia ten, North Carolina five, South Carolina five, and Georgia three.\n\nWhen vacancies happen in the Representation from any State, the Executive Authority thereof shall issue Writs of Election to fill such Vacancies.\n\nThe House of Representatives shall chuse their Speaker and other Officers; and shall have the sole Power of Impeachment",
    parent: '2',
    id: '4'
}, { subject: "Article. II. [President of the United States of America]",
    text: "",
    parent: '1',
    id: '5'
}, { subject: "Section. 1.",
    text: 'The executive Power shall be vested in a President of the United States of America. He shall hold his Office during the Term of four Years, and, together with the Vice President, chosen for the same Term, be elected, as follows\n\nEach State shall appoint, in such Manner as the Legislature thereof may direct, a Number of Electors, equal to the whole Number of Senators and Representatives to which the State may be entitled in the Congress: but no Senator or Representative, or Person holding an Office of Trust or Profit under the United States, shall be appointed an Elector.\n\nThe Electors shall meet in their respective States, and vote by Ballot for two Persons, of whom one at least shall not be an Inhabitant of the same State with themselves. And they shall make a List of all the Persons voted for, and of the Number of Votes for each; which List they shall sign and certify, and transmit sealed to the Seat of the Government of the United States, directed to the President of the Senate. The President of the Senate shall, in the Presence of the Senate and House of Representatives, open all the Certificates, and the Votes shall then be counted. The Person having the greatest Number of Votes shall be the President, if such Number be a Majority of the whole Number of Electors appointed; and if there be more than one who have such Majority, and have an equal Number of Votes, then the House of Representatives shall immediately chuse by Ballot one of them for President; and if no Person have a Majority, then from the five highest on the List the said House shall in like Manner chuse the President. But in chusing the President, the Votes shall be taken by States, the Representation from each State having one Vote; A quorum for this Purpose shall consist of a Member or Members from two thirds of the States, and a Majority of all the States shall be necessary to a Choice. In every Case, after the Choice of the President, the Person having the greatest Number of Votes of the Electors shall be the Vice President. But if there should remain two or more who have equal Votes, the Senate shall chuse from them by Ballot the Vice President.\n\nThe Congress may determine the Time of chusing the Electors, and the Day on which they shall give their Votes; which Day shall be the same throughout the United States.\n\nNo Person except a natural born Citizen, or a Citizen of the United States, at the time of the Adoption of this Constitution, shall be eligible to the Office of President; neither shall any Person be eligible to that Office who shall not have attained to the Age of thirty five Years, and been fourteen Years a Resident within the United States.\n\nIn Case of the Removal of the President from Office, or of his Death, Resignation, or Inability to discharge the Powers and Duties of the said Office, the Same shall devolve on the Vice President, and the Congress may by Law provide for the Case of Removal, Death, Resignation or Inability, both of the President and Vice President, declaring what Officer shall then act as President, and such Officer shall act accordingly, until the Disability be removed, or a President shall be elected.\n\nThe President shall, at stated Times, receive for his Services, a Compensation, which shall neither be encreased nor diminished during the Period for which he shall have been elected, and he shall not receive within that Period any other Emolument from the United States, or any of them.\n\nBefore he enter on the Execution of his Office, he shall take the following Oath or Affirmation:—"I do solemnly swear (or affirm) that I will faithfully execute the Office of President of the United States, and will to the best of my Ability, preserve, protect and defend the Constitution of the United States."',
    parent: '5',
    id: '6'
}];

var Article = function (_React$Component) {
    _inherits(Article, _React$Component);

    function Article() {
        _classCallCheck(this, Article);

        return _possibleConstructorReturn(this, (Article.__proto__ || Object.getPrototypeOf(Article)).apply(this, arguments));
    }

    _createClass(Article, [{
        key: 'render',
        value: function render() {
            // props plus the rasp state created by ReactActionStatePath are pased through to the RASPArticle child
            return _react2.default.createElement(
                _reactActionStatePath.ReactActionStatePath,
                this.props,
                _react2.default.createElement(RASPArticle, null)
            );
        }
    }]);

    return Article;
}(_react2.default.Component);

var RASPArticle = function (_ReactActionStatePath) {
    _inherits(RASPArticle, _ReactActionStatePath);

    // subarticles are not rendered until this component is opened. Once rendered they are kept so they don't have to be rerendered again

    function RASPArticle(props) {
        _classCallCheck(this, RASPArticle);

        // the key is [open]. If a subcomponent is selected, this.child['open'] is the child to send actions to.  debug level is 1
        var _this2 = _possibleConstructorReturn(this, (RASPArticle.__proto__ || Object.getPrototypeOf(RASPArticle)).call(this, props, 'open', 1));

        _this2.mounted = [];
        if (props.subject) {
            _this2.title = props.subject;_this2.props.rasp.toParent({ type: "SET_TITLE", title: _this2.title });
        } // used in debug messages
        return _this2;
    }

    // called by the RASP source='PARENT' or form the RASP source='CHILD' to get the new state based on the current state (rasp) and the action. initialRASP is the rasp state to reset to.


    _createClass(RASPArticle, [{
        key: 'actionToState',
        value: function actionToState(action, rasp, source, initialRASP) {
            var nextRASP = {},
                delta = {}; // nextRASP will be the next state, delta is where all the changes to state are recorded. There may be other properties in the state, only change them deliberatly  
            if (action.type === "TOGGLE") {
                // the user clicks on a subject which sends the toggle event, to either open or close the article
                if (rasp.open === 'open') {
                    // if the article was open close it, but 
                    this.toChild['open']({ type: "CLEAR_PATH" }); // first clear the state of all the sub children, so when they are reopened they are back to their initial state.
                    // this is good for 3 reasons: 1) reduces the number of items we need to save state for,
                    // 2) reduces the state information we have to encode in to the URL path
                    // 3) it fits many use cases that when something becomes visibile it consistently starts in the same state
                    delta.open = null; // closed
                    delta.minimize = null; // not minimized anymore
                } else {
                    delta.open = 'open'; // was closed, now open
                    delta.minimize = null; // not minimized
                }
            } else if (action.type === "CHILD_SHAPE_CHANGED" && action.distance > 2 && action.shape === 'open' && !rasp.minimize) {
                // a 2+ distant sub child has chanaged to open, so minimize, but don't minimize if already minimized which will change the shape of the propogating message
                delta.minimize = true;
            } else if (action.type === "CHILD_SHAPE_CHANGED" && action.distance >= 2 && action.shape !== 'open' && rasp.minimize) {
                // a 2+ distant sub child has changed from open, and we are minimized, so unminimize
                delta.minimize = false;
            } else return null; // if we don't understand the action, just pass it on
            // we did understand the action and so now calculate the computed state information
            Object.assign(nextRASP, rasp, delta); // calculate the new state based on the previous state and the delta.  There may be other properties in the previous state (like depth). Don't clobber them.
            nextRASP.shape = nextRASP.open === 'open' ? 'open' : initialRASP.shape; // shape is the piece of state information that all RASP components can understand
            // build the pathSegment out of parts for each state property
            var parts = [];
            if (nextRASP.open === 'open') parts.push('o');
            if (nextRASP.minimize) parts.push('m');
            nextRASP.pathSegment = parts.join(','); // pathSegment is be incorporated into the URL path. It should be calculated and the minimal length necessary to do the job
            return nextRASP;
        }

        // called to get the next RASP state based on what is in the action.segment.
        // also returns setBeforeWait which indicates that the new state should be set and then a match to the keyField waited on
        // otherwise, a match to the new state's keyfield will be waited on before the new state is set

    }, {
        key: 'segmentToState',
        value: function segmentToState(action, initialRASP) {
            var nextRASP = {},
                delta = {};
            // first convert the state info in the segment into real state properties
            var parts = action.segment.split(',');
            parts.forEach(function (part) {
                if (part === 'o') delta.open = 'open';
                if (part === 'm') delta.minimize = true;
            });
            Object.assign(nextRASP, initialRASP, delta);
            // then calculate the derived state information
            nextRASP.shape = nextRASP.open === 'open' ? 'open' : initialRASP.shape;
            // then recalculate the path, don't copy it and include stuff that wasn't understood. 
            parts = [];
            if (nextRASP.open === 'open') parts.push('o');
            if (nextRASP.minimize) parts.push('m');
            nextRASP.pathSegment = parts.join(',');
            return { nextRASP: nextRASP, setBeforeWait: true };
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                subject = _props.subject,
                text = _props.text,
                id = _props.id,
                rasp = _props.rasp;

            // don't render sub articles until the article is opened or it will never end. don't delete them once rendered, user may come back to them
            // Accordion is used to smooth the apperance/disappearents of components so changes are not discontinuous making it hearder for the user to understand what is happening
            // nextRASP is created for every (this) child, with a default shape, and a toParent function that calls back here. The bound argument ('open') will be included actions generated by this child
            // in this case action.open='open' 

            if (rasp.shape === 'open' && !this.mounted.length) {
                var nextRASP = Object.assign({}, rasp, { shape: 'truncated', toParent: this.toMeFromChild.bind(this, 'open') });
                this.mounted = _react2.default.createElement(
                    _reactProactiveAccordion2.default,
                    { active: !rasp.minlist },
                    _react2.default.createElement(SubArticleList, { parent: id, rasp: nextRASP })
                );
            }

            return _react2.default.createElement(
                'div',
                { className: 'rasp-article' },
                _react2.default.createElement(
                    _reactProactiveAccordion2.default,
                    { active: !rasp.minimize },
                    _react2.default.createElement(
                        'div',
                        { className: 'subject' + ' rasp-' + rasp.shape, onClick: function onClick() {
                                rasp.toParent({ type: "TOGGLE" });
                            } },
                        subject
                    )
                ),
                _react2.default.createElement(
                    _reactProactiveAccordion2.default,
                    { active: rasp.shape === 'open' },
                    _react2.default.createElement(
                        _reactProactiveAccordion2.default,
                        { active: !rasp.minimize },
                        _react2.default.createElement(
                            'div',
                            { className: 'text' + ' rasp-' + rasp.shape },
                            text
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'articles' + ' rasp-' + rasp.shape },
                        _react2.default.createElement(
                            'div',
                            { className: "subarticles" + " rasp-" + rasp.shape },
                            this.mounted
                        )
                    )
                )
            );
        }
    }]);

    return RASPArticle;
}(_reactActionStatePath.ReactActionStatePathClient);

var ArticleStore = function (_React$Component2) {
    _inherits(ArticleStore, _React$Component2);

    function ArticleStore() {
        var _ref;

        var _temp, _this3, _ret;

        _classCallCheck(this, ArticleStore);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this3 = _possibleConstructorReturn(this, (_ref = ArticleStore.__proto__ || Object.getPrototypeOf(ArticleStore)).call.apply(_ref, [this].concat(args))), _this3), _this3.state = { articles: [] }, _temp), _possibleConstructorReturn(_this3, _ret);
    }

    _createClass(ArticleStore, [{
        key: 'renderChildren',
        // retrived articles are stored here

        value: function renderChildren() {
            var _this4 = this;

            // this is how props and state are passed as props to children
            return _react2.default.Children.map(this.props.children, function (child) {
                var newProps = Object.assign({}, _this4.props, _this4.state);
                delete newProps.children; // be careful not to make the child it's child
                return _react2.default.cloneElement(child, newProps, child.props.children);
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this5 = this;

            // this simulates getting data from an external resouce/database by 
            var articles = demoData.reduce(function (acc, dat) {
                if (dat.parent === _this5.props.parent) acc.push(dat);
                return acc;
            }, []);
            this.setState({ articles: articles });
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'section',
                null,
                this.renderChildren()
            );
        }
    }]);

    return ArticleStore;
}(_react2.default.Component);

var SubArticleList = function (_React$Component3) {
    _inherits(SubArticleList, _React$Component3);

    function SubArticleList() {
        _classCallCheck(this, SubArticleList);

        return _possibleConstructorReturn(this, (SubArticleList.__proto__ || Object.getPrototypeOf(SubArticleList)).apply(this, arguments));
    }

    _createClass(SubArticleList, [{
        key: 'render',
        value: function render() {
            // this.prop is passed through the ArticleStore with the found articles[] being added, after a delay
            // that information is passed through ReactActionStatePath which adds the rasp state.
            // all those props (this.props, articles[], and rasp) are passed to RASPSubArticles
            return _react2.default.createElement(
                ArticleStore,
                this.props,
                _react2.default.createElement(
                    _reactActionStatePath.ReactActionStatePath,
                    null,
                    _react2.default.createElement(RASPSubArticleList, null)
                )
            );
        }
    }]);

    return SubArticleList;
}(_react2.default.Component);

var RASPSubArticleList = function (_ReactActionStatePath2) {
    _inherits(RASPSubArticleList, _ReactActionStatePath2);

    function RASPSubArticleList(props) {
        _classCallCheck(this, RASPSubArticleList);

        return _possibleConstructorReturn(this, (RASPSubArticleList.__proto__ || Object.getPrototypeOf(RASPSubArticleList)).call(this, props, 'id', 1)); // the keyField for toChild is the 'id' of the article, debug level is 1 so we can see some actions travel between components
    }

    _createClass(RASPSubArticleList, [{
        key: 'actionToState',
        value: function actionToState(action, rasp, source, initialRASP) {
            var nextRASP = {},
                delta = {};
            // if the immediate child of this list (an article) changes shape to open, 
            // close all the other articles in the list, to focus on just this one.
            // if the article changes out of open, then show the list again
            if (action.type === "CHILD_SHAPE_CHANGED" && action.distance === 1) {
                if (action.shape === 'open') {
                    if (rasp.id && rasp.id !== action.id) this.toChild[rasp.id]({ type: "CLEAR_PATH" }); // if some other child is open, close it
                    delta.id = action.id; // open a new one
                } else {
                    delta.id = null;
                }
            } else return null;
            if (delta.id) delta.shape = 'open';else delta.shape = initialRASP.shape;
            Object.assign(nextRASP, rasp, delta);
            if (nextRASP.id) nextRASP.pathSegment = nextRASP.id;else nextRASP.pathSegment = null;
            return nextRASP;
        }
    }, {
        key: 'segmentToState',
        value: function segmentToState(action, initialRASP) {
            // if an article is open, the article id is the path segment
            var nextRASP = {},
                delta = {};
            var id = action.segment;
            if (id) delta.id = id;
            Object.assign(nextRASP, initialRASP, delta);
            if (nextRASP.id) nextRASP.shape = 'open';
            if (nextRASP.id) nextRASP.pathSegment = id;
            return { nextRASP: nextRASP, setBeforeWait: true };
        }
    }, {
        key: 'render',
        value: function render() {
            var _this8 = this;

            var _props2 = this.props,
                articles = _props2.articles,
                rasp = _props2.rasp;

            // Accordion is used to smooth the apperance/disappearents of components so changes are not discontinuous making it hearder for the user to understand what is happening
            // The Accordion, showing each subarticle in a list, is open when the component is truncated.  But when on sub article opens, the Accordion of all the subarticles is closed,
            // until no subarticle is open.
            //
            // nextRASP is created for every child, with a default shape (truncated), and a toParent function that calls back here. The bound argument ('a.id') will be included in actions generated by each child
            // in this case action.id=a.id  or action[this.keyField]=a.id where this.keyField was set to 'id' in the constructor. 
            // this way every child will have a unique index that can be used in this.toChild[id](action) to send actions to the child.  The super component and this component (can) both acess this.toChild

            return _react2.default.createElement(
                'div',
                { className: "articles" + " rasp-" + rasp.shape },
                articles.map(function (a) {
                    var nextRASP = Object.assign({}, rasp, { shape: 'truncated', toParent: _this8.toMeFromChild.bind(_this8, a.id) });
                    return _react2.default.createElement(
                        _reactProactiveAccordion2.default,
                        { active: rasp.shape !== 'open' || rasp.id === a.id, key: a.id, className: 'subarticle' },
                        _react2.default.createElement(Article, _extends({}, a, { rasp: nextRASP }))
                    );
                })
            );
        }
    }]);

    return RASPSubArticleList;
}(_reactActionStatePath.ReactActionStatePathClient);

var App = function (_React$Component4) {
    _inherits(App, _React$Component4);

    function App() {
        _classCallCheck(this, App);

        return _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).apply(this, arguments));
    }

    _createClass(App, [{
        key: 'render',
        value: function render() {
            var path = window.location.href;
            var root = path.split('?');
            var RASPRoot = root[0] + '?/';
            if (root.length === 1 && path[path.length - 1] !== '?') path += '?'; // append a ? to the end if it's just the file name
            // only the first instance of ReactActionStatePath looks at path and RASPRoot. 
            // in this demo '?' is used to separate the file name from the rest of the URL because when you are opening demo.html on a file system, and the file system does not like demo.html/anything
            // but demo.html? works, and so does demo.html?/
            // if you are strictly serving from a server, the ? is not required
            return _react2.default.createElement(
                'div',
                { className: 'rasp-demo' },
                _react2.default.createElement(SubArticleList, { path: path, parent: null, RASPRoot: RASPRoot })
            );
        }
    }]);

    return App;
}(_react2.default.Component);

_reactDom2.default.render(_react2.default.createElement(App, null), document.getElementById('root'));