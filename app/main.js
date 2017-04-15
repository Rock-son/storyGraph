
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
        boxStyle = {height: '10em', padding: '0', backgrondColor: 'lightgrey', border: '1px solid blue', borderRadius: '15px'},
        contentStyle = {},
        bottomLineStyle = {width: '10px', transform: 'rotate(90deg)', borderTopColor: 'blue'},
        signStyle = {};

    return (
            React.createElement('div', {className: 'row'}, null,
               React.createElement('div', {className: 'container'}, null,
                  React.createElement('div', {className: 'row'}, null,
                     React.createElement('div', {className: 'boxContainer col-xs-offset-5 col-xs-2', style: boxStyle}, null,
                        // COMPONENTS!
                        React.createElement(headerComponent, {header: header}, null),
                        React.createElement(TextComponent, {content: content}, null)
                     )
                  ),
                  React.createElement('div', {className: 'row'}, null,
                    React.createElement('hr', {className: 'bootomLine col-xs-offset-5 col-xs-2', style: bottomLineStyle}, null),
                    React.createElement('div', {className: 'sign col-xs-1', style: signStyle}, null)
                  )
               )
            )
      );
};



class HOC extends React.Component {
    constructor(props) {
        super(props);
        // TODO: populate state object with all the data needed for a tree
        this.state = {tree: {header: "Hello", content: "- Yello!"}};
    }
    
    // TODO: create array.map style of rendering
    // this.state.object.map
    render() {
       
        return (
            React.createElement(BoxContainer, {header: this.state.tree.header, content: this.state.tree.content}, null)
        );
    }
}


var context = {header: "Hello", content: "- Yello!"};

document.addEventListener("DOMContentLoaded", function(event) {
    ReactDOM.render(React.createElement(HOC, context, null), document.getElementById('root'));
}); 
