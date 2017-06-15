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