
var headerComponent = function(props) {
    var headerStyle = {height: '2em', backgroundColor: 'blue', borderRadius: '15px 15px 0 0', borderBottom: '1px', 
                           borderBottomColor: 'cyan', color: 'white'};
    return (
        React.createElement('div', {className: 'header col-xs-12', style: headerStyle}, props.header)
    );
};

var TextComponent = function(props) {
    var boxStyle = {height: '10em', padding: '0', backgrondColor: 'lightgrey', border: '1px solid blue', borderRadius: '15px'};
    return (
        React.createElement('div', {className: 'boxContent col-xs-12', style: boxStyle}, props.content)
    );
};


var BoxContainer = function(props) {
    // TODO: extract content from state object!
    var header = props.header,
        content = props.content;

     
         
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
    constructor() {
        super();
        this.state = {tree: {}};
    }
    
    // TODO: create array.map style of rendering
    // this.state.object.map
    render() {
       
        return (
            React.createElement(BoxContainer, {}, null)
        );
    }
}





var context = {};

document.addEventListener("DOMContentLoaded", function(event) {
    ReactDOM.render(React.createElement(HOC, context, null), document.getElementById('root'));
}); 
