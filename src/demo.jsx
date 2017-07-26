'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import {ReactActionStatePath, ReactActionStatePathClient} from './react-action-state-path';

var demoData=[
    {   subject: "Demo Data",
        text: "This is the demo data, you can expand or contract it by tapping on the subject.",
        parent: null,
        id: 1
    },
    {   subject: "SubArticle 1",
        text: "This is the first sub article of the parent Demo data",
        parent: 1,
        id: 2
    },
    {   subject: "SubArticle 2",
        text: "This is the second sub article of the parent Demo data",
        parent: 1,
        id: 3
    },
    {   subject: "SubArticle 1 or SubArticle 1 ",
        text: "This is the first sub article of the first sub article of the parent Demo data",
        parent: 2,
        id: 4
    }
];

var renderChildren=function () {
    return React.Children.map(this.props.children, child =>{
        var newProps= Object.assign({}, 
            this.props,
            this.state 
        );
        delete newProps.children;
        return React.cloneElement(child, newProps, child.props.children)
    });
}

class ArticleStore extends ReactComponent {
    constructor(props){
        super(props)
    }

    state={articles: []};

    renderChildren(){
        return React.Children.map(this.props.children, child =>{
            var newProps= Object.assign({}, 
                this.props,
                this.state 
            );
            delete newProps.children;
            return React.cloneElement(child, newProps, child.props.children)
        });
    }

    componentDidMount(){
        var articles=demoData.reduce((acc,dat)=>{
            if(dat.parent===this.props.parent) acc.push(a);
        },[]);
        this.setState({articles})
    }

    render(){
        return <section>{this.renderChildren()}</section>;
    }
}

class Article extends React.Component {
  render() {
    return (
      <ReactActionStatePath {...this.props} >
          <RASPArticle />
      </ReactActionStatePath>
    );
  }
}

class RASPArticle extends ReactActionStatePathClient {

    constructor(props){
        super(props,'id');
    }

    actionToState(action,rasp,source,initialRASP){
        var nextRASP, delta;
        if(action.type==="TOGGLE") {
            if(rasp.id) rasp.id=null;
            else delta.id=action.id;
        } else
            return null;
        if(delta.id) delta.shape='open'; else delta.shape=initialRASP.shape;
        Object.assign(nextRASP,rasp,delta);
        if(nextRASP.tap) nextRASP.pathSegment=id;
        return nextRASP;
    }

    segmentToState(action){
        var nextRASP;
        let id=parseInt(action.segment,10); 
        if(id) nextRASP.id=id;
        if(nextRASP.id) nextRASP.shape='open'; else nextRASP.shape=action.initialRASP.shape;
        if(nextRASP.id) nextRASP.pathSegment=id;
        return {nextRASP, setBeforeWait: true};
    }

    mounted=[];
    render(){
        const {subject, text, id, rasp}=props;

        if(rasp.shape==='open'){ // don't render sub articles until the list is opened or it will never end. don't delete them once rendered
            var nextRASP=Object.assign({},{shape: 'truncated', toParent: this.toMeFromParent.bind(this,)})
            mounted=<SubArticleList parent={id} rasp={rasp}/ >
        }

        return(
            <div className={'rasp-article'}>
                <div className={'subject'+' rasp-'+rasp.shape} onClick={this.props.toParent({type: "TOGGLE"})}>{subject}</div>
                <div className={'text'+' rasp-'+rasp.shape}>{text}</div>
                <div className={'articles'+' rasp-'+rasp.shape}>
                    {mounted}
                </div>
            </div>
        )
    }
}

class SubArticleList extends React.Component {
  render() {
    return (
        <ArticleStore {...this.props}>
            <ReactActionStatePath {...this.props} >
                <RASPSubArticleList />
            </ReactActionStatePath>
      </ArticleStore>
    );
  }
}

class RASPSubArticleList extends ReactActionStatePathClient {
    render(){
        const {articles, rasp}=this.props;
        
        return(
            <div className={"articles"+" rasp-"+rasp.shape}>
                { articles.map(a=>{
                    var nextRASP=Object.assign({},{shape: 'truncated', parent: this.toMeFromChild.bind(this,a.id)})
                    return <Article {...a} rasp={nextRASP}/>
                })}
            </div>
        )
    }
}

class App extends React.Component {
    render(){
        return (
            <div className="rasp-demo">
                <ArticleStore parent={null}>
                    <Article />
                </ArticleStore>
            </div>
        );
    }
}


ReactDOM.render(

  <App />,

  document.getElementById('root')

);
