
var headerComponent = function(props) {
    var headerStyle = {height: '2em', backgroundColor: 'blue', borderRadius: '15px 15px 0 0', borderBottom: '1px', 
                           borderBottomColor: 'cyan', color: 'white'};
    return (
        React.createElement('div', {className: 'header col-xs-12', style: headerStyle}, props.header)
    );
};

var TextComponent = function(props) {    
    return React.createElement('div', {className: 'boxContent col-xs-12'}, props.content);
};


var BoxContainer = function(props) {
    // TODO: extract content from state object!
    var header = props.header,
        content = props.content,
        boxStyle = {top: props.x, left: props.y},
        contentStyle = {},
        signStyle = {};        

    return (React.createElement('div', null, null,
                React.createElement('div', {className: 'row'}, null,
                     React.createElement('div', {className: 'boxContainer col-xs-offset-5 col-xs-2', style: boxStyle}, null,
                        // COMPONENTS!
                        React.createElement(headerComponent, {header: header, className: 'header col-xs-12'}, null),
                        React.createElement(TextComponent, {content: content, className: 'content col-xs-12'}, null)
                     )
                 )
            )            
      );
};



class HOC extends React.Component {
    constructor(props) {
        super(props);
        this.state = {tree: this.props.stateObject};
    }
    handleDrag() {

    }

    render() {
       console.log(this.state.tree);
        return (
            React.createElement('div', {className: 'container'}, null,
                this.state.tree.map(function(boxElemenet) {
                    console.log(boxElemenet);
                    return React.createElement(BoxContainer, {header: boxElemenet.header, content: boxElemenet.content, x: boxElemenet.position.x, y: boxElemenet.position.y}, null);
                })
            )
        );
    }
}

var stateObject = [
    {
        id: 0,
        header:"header1", 
        content: "option",
        expanded: true,
        position: {x: '10px', y: '10px'}
     },
     {
        id: 1,
        header:"row 1", 
        content: "option 1",
        expanded: true,
        position: {x: '30px', y: '30px'}
     }, 
     { 
        id: 2,
        header:"row 1", 
        content: "option 2",
        expanded: true,
        position: {x: '60px', y: '60px'}
     }, 
     { 
        id: 3,
        header:"row 1", 
        content: "option 3",
        expanded: true,
        position: {x: '100px', y: '100px'}
     }];

document.addEventListener("DOMContentLoaded", function(event) {
    ReactDOM.render(React.createElement(HOC, {stateObject: stateObject}, null), document.getElementById('root'));
}); 
