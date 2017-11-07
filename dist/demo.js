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
}, { subject: "Article. I.",
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
}, { subject: "Section. 3.",
    text: "The Senate of the United States shall be composed of two Senators from each State, chosen by the Legislature thereof, for six Years; and each Senator shall have one Vote. Immediately after they shall be assembled in Consequence of the first Election, they shall be divided as equally as may be into three Classes. The Seats of the Senators of the first Class shall be vacated at the Expiration of the second Year, of the second Class at the Expiration of the fourth Year, and of the third Class at the Expiration of the sixth Year, so that one third may be chosen every second Year; and if Vacancies happen by Resignation, or otherwise, during the Recess of the Legislature of any State, the Executive thereof may make temporary Appointments until the next Meeting of the Legislature, which shall then fill such Vacancies. No Person shall be a Senator who shall not have attained to the Age of thirty Years, and been nine Years a Citizen of the United States, and who shall not, when elected, be an Inhabitant of that State for which he shall be chosen. The Vice President of the United States shall be President of the Senate, but shall have no Vote, unless they be equally divided. The Senate shall chuse their other Officers, and also a President pro tempore, in the Absence of the Vice President, or when he shall exercise the Office of President of the United States. The Senate shall have the sole Power to try all Impeachments. When sitting for that Purpose, they shall be on Oath or Affirmation. When the President of the United States is tried, the Chief Justice shall preside: And no Person shall be convicted without the Concurrence of two thirds of the Members present. Judgment in Cases of Impeachment shall not extend further than to removal from Office, and disqualification to hold and enjoy any Office of honor, Trust or Profit under the United States: but the Party convicted shall nevertheless be liable and subject to Indictment, Trial, Judgment and Punishment, according to Law.",
    parent: '2',
    id: '5'
}, { subject: "Section. 4.",
    text: "The Times, Places and Manner of holding Elections for Senators and Representatives, shall be prescribed in each State by the Legislature thereof; but the Congress may at any time by Law make or alter such Regulations, except as to the Places of chusing Senators.\n\nThe Congress shall assemble at least once in every Year, and such Meeting shall be on the first Monday in December, unless they shall by Law appoint a different Day.",
    id: '6',
    parent: '2'
}, { subject: "Section. 5.",
    text: "Each House shall be the Judge of the Elections, Returns and Qualifications of its own Members, and a Majority of each shall constitute a Quorum to do Business; but a smaller Number may adjourn from day to day, and may be authorized to compel the Attendance of absent Members, in such Manner, and under such Penalties as each House may provide.\n\nEach House may determine the Rules of its Proceedings, punish its Members for disorderly Behaviour, and, with the Concurrence of two thirds, expel a Member.\n\nEach House shall keep a Journal of its Proceedings, and from time to time publish the same, excepting such Parts as may in their Judgment require Secrecy; and the Yeas and Nays of the Members of either House on any question shall, at the Desire of one fifth of those Present, be entered on the Journal.\n\nNeither House, during the Session of Congress, shall, without the Consent of the other, adjourn for more than three days, nor to any other Place than that in which the two Houses shall be sitting.",
    id: '7',
    parent: '2'
}, { subject: "Section. 6.",
    text: "The Senators and Representatives shall receive a Compensation for their Services, to be ascertained by Law, and paid out of the Treasury of the United States. They shall in all Cases, except Treason, Felony and Breach of the Peace, be privileged from Arrest during their Attendance at the Session of their respective Houses, and in going to and returning from the same; and for any Speech or Debate in either House, they shall not be questioned in any other Place.\n\nNo Senator or Representative shall, during the Time for which he was elected, be appointed to any civil Office under the Authority of the United States, which shall have been created, or the Emoluments whereof shall have been encreased during such time; and no Person holding any Office under the United States, shall be a Member of either House during his Continuance in Office.",
    id: "8",
    parent: '2'
}, { subject: "Section. 7.",
    text: "All Bills for raising Revenue shall originate in the House of Representatives; but the Senate may propose or concur with Amendments as on other Bills.\n\nEvery Bill which shall have passed the House of Representatives and the Senate, shall, before it become a Law, be presented to the President of the United States; If he approve he shall sign it, but if not he shall return it, with his Objections to that House in which it shall have originated, who shall enter the Objections at large on their Journal, and proceed to reconsider it. If after such Reconsideration two thirds of that House shall agree to pass the Bill, it shall be sent, together with the Objections, to the other House, by which it shall likewise be reconsidered, and if approved by two thirds of that House, it shall become a Law. But in all such Cases the Votes of both Houses shall be determined by yeas and Nays, and the Names of the Persons voting for and against the Bill shall be entered on the Journal of each House respectively. If any Bill shall not be returned by the President within ten Days (Sundays excepted) after it shall have been presented to him, the Same shall be a Law, in like Manner as if he had signed it, unless the Congress by their Adjournment prevent its Return, in which Case it shall not be a Law.\n\nEvery Order, Resolution, or Vote to which the Concurrence of the Senate and House of Representatives may be necessary (except on a question of Adjournment) shall be presented to the President of the United States; and before the Same shall take Effect, shall be approved by him, or being disapproved by him, shall be repassed by two thirds of the Senate and House of Representatives, according to the Rules and Limitations prescribed in the Case of a Bill.",
    id: "9",
    parent: '2'
}, { subject: "Section. 8.",
    text: "The Congress shall have Power To lay and collect Taxes, Duties, Imposts and Excises, to pay the Debts and provide for the common Defence and general Welfare of the United States; but all Duties, Imposts and Excises shall be uniform throughout the United States;\n\nTo borrow Money on the credit of the United States;\n\nTo regulate Commerce with foreign Nations, and among the several States, and with the Indian Tribes;\n\nTo establish an uniform Rule of Naturalization, and uniform Laws on the subject of Bankruptcies throughout the United States;\n\nTo coin Money, regulate the Value thereof, and of foreign Coin, and fix the Standard of Weights and Measures;\n\nTo provide for the Punishment of counterfeiting the Securities and current Coin of the United States;\n\nTo establish Post Offices and post Roads;\n\nTo promote the Progress of Science and useful Arts, by securing for limited Times to Authors and Inventors the exclusive Right to their respective Writings and Discoveries;\n\nTo constitute Tribunals inferior to the supreme Court;\n\nTo define and punish Piracies and Felonies committed on the high Seas, and Offences against the Law of Nations;\n\nTo declare War, grant Letters of Marque and Reprisal, and make Rules concerning Captures on Land and Water;\n\nTo raise and support Armies, but no Appropriation of Money to that Use shall be for a longer Term than two Years;\n\nTo provide and maintain a Navy;\n\nTo make Rules for the Government and Regulation of the land and naval Forces;\n\nTo provide for calling forth the Militia to execute the Laws of the Union, suppress Insurrections and repel Invasions;\n\nTo provide for organizing, arming, and disciplining, the Militia, and for governing such Part of them as may be employed in the Service of the United States, reserving to the States respectively, the Appointment of the Officers, and the Authority of training the Militia according to the discipline prescribed by Congress;\n\nTo exercise exclusive Legislation in all Cases whatsoever, over such District (not exceeding ten Miles square) as may, by Cession of particular States, and the Acceptance of Congress, become the Seat of the Government of the United States, and to exercise like Authority over all Places purchased by the Consent of the Legislature of the State in which the Same shall be, for the Erection of Forts, Magazines, Arsenals, dock-Yards, and other needful Buildings;—And\n\nTo make all Laws which shall be necessary and proper for carrying into Execution the foregoing Powers, and all other Powers vested by this Constitution in the Government of the United States, or in any Department or Officer thereof.",
    id: '10',
    parent: '2'
}, { subject: "Section. 9.",
    text: "The Migration or Importation of such Persons as any of the States now existing shall think proper to admit, shall not be prohibited by the Congress prior to the Year one thousand eight hundred and eight, but a Tax or duty may be imposed on such Importation, not exceeding ten dollars for each Person.\n\nThe Privilege of the Writ of Habeas Corpus shall not be suspended, unless when in Cases of Rebellion or Invasion the public Safety may require it.\n\nNo Bill of Attainder or ex post facto Law shall be passed.\n\nNo Capitation, or other direct, Tax shall be laid, unless in Proportion to the Census or enumeration herein before directed to be taken.\n\nNo Tax or Duty shall be laid on Articles exported from any State.\n\nNo Preference shall be given by any Regulation of Commerce or Revenue to the Ports of one State over those of another: nor shall Vessels bound to, or from, one State, be obliged to enter, clear, or pay Duties in another.\n\nNo Money shall be drawn from the Treasury, but in Consequence of Appropriations made by Law; and a regular Statement and Account of the Receipts and Expenditures of all public Money shall be published from time to time.\n\nNo Title of Nobility shall be granted by the United States: And no Person holding any Office of Profit or Trust under them, shall, without the Consent of the Congress, accept of any present, Emolument, Office, or Title, of any kind whatever, from any King, Prince, or foreign State.",
    id: "11",
    parent: '2'
}, { subject: "Section. 10.",
    text: "No State shall enter into any Treaty, Alliance, or Confederation; grant Letters of Marque and Reprisal; coin Money; emit Bills of Credit; make any Thing but gold and silver Coin a Tender in Payment of Debts; pass any Bill of Attainder, ex post facto Law, or Law impairing the Obligation of Contracts, or grant any Title of Nobility.\n\nNo State shall, without the Consent of the Congress, lay any Imposts or Duties on Imports or Exports, except what may be absolutely necessary for executing it's inspection Laws: and the net Produce of all Duties and Imposts, laid by any State on Imports or Exports, shall be for the Use of the Treasury of the United States; and all such Laws shall be subject to the Revision and Controul of the Congress.\n\nNo State shall, without the Consent of Congress, lay any Duty of Tonnage, keep Troops, or Ships of War in time of Peace, enter into any Agreement or Compact with another State, or with a foreign Power, or engage in War, unless actually invaded, or in such imminent Danger as will not admit of delay.",
    id: "12",
    parent: '2'
}, { subject: "Article. II.",
    text: "",
    parent: '1',
    id: '13'
}, { subject: "Section. 1.",
    text: 'The executive Power shall be vested in a President of the United States of America. He shall hold his Office during the Term of four Years, and, together with the Vice President, chosen for the same Term, be elected, as follows\n\nEach State shall appoint, in such Manner as the Legislature thereof may direct, a Number of Electors, equal to the whole Number of Senators and Representatives to which the State may be entitled in the Congress: but no Senator or Representative, or Person holding an Office of Trust or Profit under the United States, shall be appointed an Elector.\n\nThe Electors shall meet in their respective States, and vote by Ballot for two Persons, of whom one at least shall not be an Inhabitant of the same State with themselves. And they shall make a List of all the Persons voted for, and of the Number of Votes for each; which List they shall sign and certify, and transmit sealed to the Seat of the Government of the United States, directed to the President of the Senate. The President of the Senate shall, in the Presence of the Senate and House of Representatives, open all the Certificates, and the Votes shall then be counted. The Person having the greatest Number of Votes shall be the President, if such Number be a Majority of the whole Number of Electors appointed; and if there be more than one who have such Majority, and have an equal Number of Votes, then the House of Representatives shall immediately chuse by Ballot one of them for President; and if no Person have a Majority, then from the five highest on the List the said House shall in like Manner chuse the President. But in chusing the President, the Votes shall be taken by States, the Representation from each State having one Vote; A quorum for this Purpose shall consist of a Member or Members from two thirds of the States, and a Majority of all the States shall be necessary to a Choice. In every Case, after the Choice of the President, the Person having the greatest Number of Votes of the Electors shall be the Vice President. But if there should remain two or more who have equal Votes, the Senate shall chuse from them by Ballot the Vice President.\n\nThe Congress may determine the Time of chusing the Electors, and the Day on which they shall give their Votes; which Day shall be the same throughout the United States.\n\nNo Person except a natural born Citizen, or a Citizen of the United States, at the time of the Adoption of this Constitution, shall be eligible to the Office of President; neither shall any Person be eligible to that Office who shall not have attained to the Age of thirty five Years, and been fourteen Years a Resident within the United States.\n\nIn Case of the Removal of the President from Office, or of his Death, Resignation, or Inability to discharge the Powers and Duties of the said Office, the Same shall devolve on the Vice President, and the Congress may by Law provide for the Case of Removal, Death, Resignation or Inability, both of the President and Vice President, declaring what Officer shall then act as President, and such Officer shall act accordingly, until the Disability be removed, or a President shall be elected.\n\nThe President shall, at stated Times, receive for his Services, a Compensation, which shall neither be encreased nor diminished during the Period for which he shall have been elected, and he shall not receive within that Period any other Emolument from the United States, or any of them.\n\nBefore he enter on the Execution of his Office, he shall take the following Oath or Affirmation:—"I do solemnly swear (or affirm) that I will faithfully execute the Office of President of the United States, and will to the best of my Ability, preserve, protect and defend the Constitution of the United States."',
    parent: '13',
    id: '14'
}, { subject: "Section. 2.",
    text: "The President shall be Commander in Chief of the Army and Navy of the United States, and of the Militia of the several States, when called into the actual Service of the United States; he may require the Opinion, in writing, of the principal Officer in each of the executive Departments, upon any Subject relating to the Duties of their respective Offices, and he shall have Power to grant Reprieves and Pardons for Offences against the United States, except in Cases of Impeachment.\n\nHe shall have Power, by and with the Advice and Consent of the Senate, to make Treaties, provided two thirds of the Senators present concur; and he shall nominate, and by and with the Advice and Consent of the Senate, shall appoint Ambassadors, other public Ministers and Consuls, Judges of the supreme Court, and all other Officers of the United States, whose Appointments are not herein otherwise provided for, and which shall be established by Law: but the Congress may by Law vest the Appointment of such inferior Officers, as they think proper, in the President alone, in the Courts of Law, or in the Heads of Departments.\n\nThe President shall have Power to fill up all Vacancies that may happen during the Recess of the Senate, by granting Commissions which shall expire at the End of their next Session.",
    parent: "13",
    id: '15'
}, { subject: "Section. 3.",
    text: "He shall from time to time give to the Congress Information of the State of the Union, and recommend to their Consideration such Measures as he shall judge necessary and expedient; he may, on extraordinary Occasions, convene both Houses, or either of them, and in Case of Disagreement between them, with Respect to the Time of Adjournment, he may adjourn them to such Time as he shall think proper; he shall receive Ambassadors and other public Ministers; he shall take Care that the Laws be faithfully executed, and shall Commission all the Officers of the United States.",
    parent: "13",
    id: "16"
}, { subject: "Section. 4.",
    text: "The President, Vice President and all civil Officers of the United States, shall be removed from Office on Impeachment for, and Conviction of, Treason, Bribery, or other high Crimes and Misdemeanors.",
    parent: "13",
    id: "17"
}, { subject: "Article III.",
    text: "",
    parent: '1',
    id: "18"
}, { subject: "Section. 1.",
    text: "The judicial Power of the United States, shall be vested in one supreme Court, and in such inferior Courts as the Congress may from time to time ordain and establish. The Judges, both of the supreme and inferior Courts, shall hold their Offices during good Behaviour, and shall, at stated Times, receive for their Services, a Compensation, which shall not be diminished during their Continuance in Office.",
    parent: "18",
    id: "19"
}, { subject: "Section. 2.",
    text: "The judicial Power shall extend to all Cases, in Law and Equity, arising under this Constitution, the Laws of the United States, and Treaties made, or which shall be made, under their Authority;—to all Cases affecting Ambassadors, other public Ministers and Consuls;—to all Cases of admiralty and maritime Jurisdiction;—to Controversies to which the United States shall be a Party;—to Controversies between two or more States;— between a State and Citizens of another State,—between Citizens of different States,—between Citizens of the same State claiming Lands under Grants of different States, and between a State, or the Citizens thereof, and foreign States, Citizens or Subjects.\n\nIn all Cases affecting Ambassadors, other public Ministers and Consuls, and those in which a State shall be Party, the supreme Court shall have original Jurisdiction. In all the other Cases before mentioned, the supreme Court shall have appellate Jurisdiction, both as to Law and Fact, with such Exceptions, and under such Regulations as the Congress shall make.\n\nThe Trial of all Crimes, except in Cases of Impeachment, shall be by Jury; and such Trial shall be held in the State where the said Crimes shall have been committed; but when not committed within any State, the Trial shall be at such Place or Places as the Congress may by Law have directed.",
    parent: "18",
    id: "20"
}, { subject: "Section. 3.",
    text: "Treason against the United States, shall consist only in levying War against them, or in adhering to their Enemies, giving them Aid and Comfort. No Person shall be convicted of Treason unless on the Testimony of two Witnesses to the same overt Act, or on Confession in open Court.\n\nThe Congress shall have Power to declare the Punishment of Treason, but no Attainder of Treason shall work Corruption of Blood, or Forfeiture except during the Life of the Person attainted.",
    parent: "18",
    id: "21"
}, { subject: "Article. IV.",
    text: "",
    parent: "1",
    id: "22"
}, { subject: "Section. 1.",
    text: "Full Faith and Credit shall be given in each State to the public Acts, Records, and judicial Proceedings of every other State. And the Congress may by general Laws prescribe the Manner in which such Acts, Records and Proceedings shall be proved, and the Effect thereof.",
    parent: "22",
    id: "23"
}, { subject: "Section. 2.",
    text: "The Citizens of each State shall be entitled to all Privileges and Immunities of Citizens in the several States.\n\nA Person charged in any State with Treason, Felony, or other Crime, who shall flee from Justice, and be found in another State, shall on Demand of the executive Authority of the State from which he fled, be delivered up, to be removed to the State having Jurisdiction of the Crime.\n\nNo Person held to Service or Labour in one State, under the Laws thereof, escaping into another, shall, in Consequence of any Law or Regulation therein, be discharged from such Service or Labour, but shall be delivered up on Claim of the Party to whom such Service or Labour may be due.",
    parent: "22",
    id: "24"
}, { subject: "Section. 3.",
    text: "New States may be admitted by the Congress into this Union; but no new State shall be formed or erected within the Jurisdiction of any other State; nor any State be formed by the Junction of two or more States, or Parts of States, without the Consent of the Legislatures of the States concerned as well as of the Congress.The Congress shall have Power to dispose of and make all needful Rules and Regulations respecting the Territory or other Property belonging to the United States; and nothing in this Constitution shall be so construed as to Prejudice any Claims of the United States, or of any particular State.",
    parent: "22",
    id: "25"
}, { subject: "Section. 4.",
    text: "The United States shall guarantee to every State in this Union a Republican Form of Government, and shall protect each of them against Invasion; and on Application of the Legislature, or of the Executive (when the Legislature cannot be convened), against domestic Violence.",
    parent: "22",
    id: "26"
}, { subject: "Article. V.",
    text: "The Congress, whenever two thirds of both Houses shall deem it necessary, shall propose Amendments to this Constitution, or, on the Application of the Legislatures of two thirds of the several States, shall call a Convention for proposing Amendments, which, in either Case, shall be valid to all Intents and Purposes, as Part of this Constitution, when ratified by the Legislatures of three fourths of the several States, or by Conventions in three fourths thereof, as the one or the other Mode of Ratification may be proposed by the Congress; Provided that no Amendment which may be made prior to the Year One thousand eight hundred and eight shall in any Manner affect the first and fourth Clauses in the Ninth Section of the first Article; and that no State, without its Consent, shall be deprived of its equal Suffrage in the Senate.",
    parent: "1",
    id: "27"
}, { subject: "Article. VI.",
    text: "All Debts contracted and Engagements entered into, before the Adoption of this Constitution, shall be as valid against the United States under this Constitution, as under the Confederation.\n\nThis Constitution, and the Laws of the United States which shall be made in Pursuance thereof; and all Treaties made, or which shall be made, under the Authority of the United States, shall be the supreme Law of the Land; and the Judges in every State shall be bound thereby, any Thing in the Constitution or Laws of any State to the Contrary notwithstanding.\n\nThe Senators and Representatives before mentioned, and the Members of the several State Legislatures, and all executive and judicial Officers, both of the United States and of the several States, shall be bound by Oath or Affirmation, to support this Constitution; but no religious Test shall ever be required as a Qualification to any Office or public Trust under the United States.",
    parent: "1",
    id: "28"
}, { subject: "Article. VII.",
    text: 'The Ratification of the Conventions of nine States, shall be sufficient for the Establishment of this Constitution between the States so ratifying the Same.\n\nThe Word, "the," being interlined between the seventh and eighth Lines of the first Page, The Word "Thirty" being partly written on an Erazure in the fifteenth Line of the first Page, The Words "is tried" being interlined between the thirty second and thirty third Lines of the first Page and the Word "the" being interlined between the forty third and forty fourth Lines of the second Page.\n\nAttest William Jackson Secretary\n\ndone in Convention by the Unanimous Consent of the States present the Seventeenth Day of September in the Year of our Lord one thousand seven hundred and Eighty seven and of the Independance of the United States of America the Twelfth In witness whereof We have hereunto subscribed our Names,\n\nG°. Washington\n\nPresidt and deputy from Virginia',
    parent: "1",
    id: "29"
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
            var _this3 = this;

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
                    this.qaction(function () {
                        return _this3.props.rasp.toParent({ type: "DECENDANT_UNFOCUS" });
                    });
                } else {
                    delta.open = 'open'; // was closed, now open
                    delta.minimize = null; // not minimized
                    this.qaction(function () {
                        return _this3.props.rasp.toParent({ type: "DECENDANT_FOCUS" });
                    });
                }
            } else if (action.type === "DECENDANT_FOCUS" && action.distance > 2 && !rasp.minimize) {
                // a 2+ distant sub child has chanaged to open, so minimize, but don't minimize if already minimized which will change the shape of the propogating message
                delta.minimize = true;
            } else if (action.type === "DECENDANT_UNFOCUS" && action.distance >= 2 && rasp.minimize) {
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
                this.mounted = _react2.default.createElement(
                    _reactProactiveAccordion2.default,
                    { active: !rasp.minlist },
                    _react2.default.createElement(SubArticleList, { parent: id, rasp: this.childRASP('truncated', 'open') })
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

        var _temp, _this4, _ret;

        _classCallCheck(this, ArticleStore);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this4 = _possibleConstructorReturn(this, (_ref = ArticleStore.__proto__ || Object.getPrototypeOf(ArticleStore)).call.apply(_ref, [this].concat(args))), _this4), _this4.state = { articles: [] }, _temp), _possibleConstructorReturn(_this4, _ret);
    }

    _createClass(ArticleStore, [{
        key: 'renderChildren',
        // retrived articles are stored here

        value: function renderChildren() {
            var _this5 = this;

            // this is how props and state are passed as props to children
            return _react2.default.Children.map(this.props.children, function (child) {
                var newProps = Object.assign({}, _this5.props, _this5.state);
                delete newProps.children; // be careful not to make the child it's child
                return _react2.default.cloneElement(child, newProps, child.props.children);
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this6 = this;

            // this simulates getting data from an external resouce/database by 
            var articles = demoData.reduce(function (acc, dat) {
                if (dat.parent === _this6.props.parent) acc.push(dat);
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
            if (action.type === "DECENDANT_FOCUS" && action.distance === 1) {
                if (rasp.id && rasp.id !== action.id) this.toChild[rasp.id]({ type: "CLEAR_PATH" }); // if some other child is open, close it
                delta.id = action.id; // open a new one
            } else if (action.type === "DECENDANT_UNFOCUS") {
                if (rasp.id) {
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
            var _this9 = this;

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
                    return _react2.default.createElement(
                        _reactProactiveAccordion2.default,
                        { active: rasp.shape !== 'open' || rasp.id === a.id, key: a.id, className: 'subarticle' },
                        _react2.default.createElement(Article, _extends({}, a, { rasp: _this9.childRASP('truncated', a.id) }))
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