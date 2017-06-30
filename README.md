# react-action-state-path
An alternative to redux for use when: 
* components choose children dynamically based on user input
* the URL should update based on user actions and take a user back to where they left off
* the state that's in the URL should be simplified so the URL is not impossibly long and doesn't contain sensitive stuff
* users want the back and forward buttons of the browser to work
* child components send actions to parents
* parent state may change based on child actions
* you want to use something like the redux action -> state pattern to make code simplier to follow (it really does)

I created this as I was building in support for the back and forward keys of the browser in a repo for Synaccord that already had a lot going on.  (Children dynamicly selecting children). I looked at redux and react-router but it seemed like a big change and I didn't see an easy way to encode state info in the URL so the user could send a link to the same spot.  react-action-state-path is what evolved and I'm pleased by the simplicity of it and how it's worked in so many components in my code.  

I am sharing it on github in case its useful for anyone else, and I welcome any critical discussion of the concept. It is still evolving.  


6/15/2017: I've just started moving this out of the code base and into this separate repository, so don't start using this yet.

# Usage
component-name.jsx:
    'use strict';

    import React from 'react';
    import {ReactActionStatePath, ReactActionStatePathClient} from 'react-action-state-path';

    export default class ComponentName extends React.Component {
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
            this.initialRASP={ stateVar: 0, stateVar1: 1, ...}; // if you need to initialize the state.  Kf you don't you don't need this.
            super(raspProps, 'key', this.initialRASP);    // the 'key' property name can be specified here to make your code easier to understand. 
                                        // If left out it will be 'key'. key is the index into this.toChild where each rasp child's 
                                        // function is.  this.toChild[key]({type: "ACTION_NAME"})
                                        
        }

        segmentToState(action) {  // this is optional. confert a 

            ...

            action.segment // has the info for this instance, convert it to a nextRASP

            return { nextRASP, setBeforeWait: false };  //setBeforeWait means set the new state and then wait for the key child to appear, otherwise wait for the key child to appear and then set the new state.
        }
        
        actionToState(action, rasp) {   // this is required, it should be a pure function on input parameters only
                                        // this is called from the <ReactActionState /> component, so 'this' is in that context.
            var nextRASP = {}, delta={};

            if(action.type==="ACTION_NAME"){
                toChild[key]({type: "ACTION_NAME"}) // toChild is an Array of functions to call to send action's to children.  'key' is the index name, but it can be defined in the constructor.  
                
            } else if (...)

            } else 
            return null;

            delta.shape= // compute shape
            delta.pathSegment = // compute segment
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

## action
{   type: "ACTION_NAME"
    distance: undefined when generated an event by default (like a button click)
              0 : action applies to this component
              1 : action applied to the immediate child
             -n: ignore the action and send it to parent component
    toBeContinued: false/undefined - default
                   true : do not generate a CHILD_SHAP_CHANGED action yet, another action will follow
}

These are the inherent actions:

RESET_STATE:  Reset the state of a component, can be sent to a child or a parent
CHILD_SHAPE_CHANGED:  If a child's shape changes, this action is generated and propgated up, with distance increasing each time.  You would use this to reduce, or hide, or change components that are far from the action



# Guidelines

* render children first, then self, then return to parent
* component children that are not in the active path will get their rasp state reset to initialRASP on user navigation
* when sending an action to a parent use setTimeout(()=>this.props.rasp.toParent({type: "ACTION_NAME", distance: -1, ...})) so that the action will take place after the children and the current component have rendered. distance: -2 will skip the immediate parent and go to the grandparent, etc.


# To Do
* allow and collect state from orpan components. Right now there can be only one RASP that has no parent. But it could be possible to have orphan components that still use the action to state model, and even collect state from them.  Not sure if they could be in the path though.

* updateHistory should be a direct call to the root rather than a peer to peer call up to the root.

* fold segmentToState into actionToPath it doesn't need to be separate

