# react-action-state-path
An alternative to redux for use when: 
* components choose children dynamically based on user input
* the URL should update based on user actions and take a user back to where they left off
* the state that's in the URL should be simplified so the URL is not impossibly long and doesn't contain sensitive stuff
* users want the back and forward buttons of the browser to work
* child components send actions to parents
* parent state may change based on child actions
* you want to use something like the redux action -> state pattern to make code simplier to follow (it really does)

I created this as I was working build in support for the back and forward keys of the browser a repo for Synaccord that already had a lot going on.  (Children dynamicly selecting children). I looked at redux and react-router but it seemed like a big change.  react-action-state-path is what evolved and I'm pleased by the simplicity of it and how it's worked in so many components in my code.  

I am sharing it on github in case its useful for anyone else, and I welcome any critical discussion of the concept.  


6/15/2017: I've just started moving this out of the code base and into this separate repository, so don't start using this yet.

# Usage

export default class ComponentName extends React.Component {
    this.initialRASP={ left: 0, right: 1, cursor: 1, key: ''};
    render() {
        return (
            <ReactActionStatePath {...this.props} initialRASP={this.initialRASP} >
                <RASPComponentName />
            </ReactActionStatePath>
        )
    }
}

class RASPComponentName extends ReactActionStatePathClient {
    constructor(props) {
        var raspProps = { rasp: props.rasp };
        super(raspProps, 'key');  // the 'key' property name can be specified here to make your code easier to understand. If left out it will be 'key'
    }

    segmentToState(action) {

        ...

        return { nextRASP, setBeforeWait: false };  //setBeforeWait means set the new state and then wait for the key child to appear, otherwise wait for the key child to appear and then set the new state.
    }
    
    actionToState(action, rasp) {
        var nextRASP = {}, delta={};

        if(action.type==="ACTION_NAME"){
            
        }

        ...

        Object.assign(nextRASP, rasp, delta);
        return nextRASP; // return the new state
    }

    render(){
        const {rasp, items, ... } = this.props;
        return(
            {items.map(item->{
                <Item item={item} rasp={shape: rasp.shape, depth: rasp.depth, toParent: this.toMeFromChild.bind(this,item.id)}>{/* action.key will be item.id in actionToState() */}
            })}
        )
    }
}



# To Do
* allow and collect state from orpan components. Right now there can be only one RASP that has no parent. But it could be possible to have orphan components that still use the action to state model, and even collect state from them.  Not sure if they could be in the path though.

* updateHistory should be a direct call to the root rather than a peer to peer call up to the root.

