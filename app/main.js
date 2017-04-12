






// TODO: HOC will not be a Component, but an empty container
class HOC extends React.Component {
    constructor() {
        super();

    }

    render() {
        var boxStyle = {height: '10em', padding: '0', backgrondColor: 'lightgrey', border: '1px solid blue', borderRadius: '15px'};
        var headerStyle = {height: '2em', backgroundColor: 'blue', borderRadius: '15px 15px 0 0', borderBottom: '1px', 
                           borderBottomColor: 'cyan', color: 'white'};
        var contentStyle = {};
        var bottomLineStyle = {width: '10px', transform: 'rotate(90deg)', borderTopColor: 'blue'}
        var signStyle = {};

        // TODO: this will be a component (Box), called by HOC
        return (
            React.createElement('div', {className: 'row'}, null,
               React.createElement('div', {className: 'container'}, null,
                  React.createElement('div', {className: 'row'}, null,
                     React.createElement('div', {className: 'boxContainer col-xs-offset-5 col-xs-2', style: boxStyle}, null,
                        React.createElement('div', {className: 'header col-xs-12', style: headerStyle}, 'Hello!'),
                           React.createElement('div', {className: 'boxContent col-xs-12', style: contentStyle}, '- Yello!')
                     ),
                  ),
                  React.createElement('div', {className: 'row'}, null,
                    React.createElement('hr', {className: 'bootomLine col-xs-offset-5 col-xs-2', style: bottomLineStyle}, null),
                       React.createElement('div', {className: 'sign col-xs-1', style: signStyle}, null),
                  )
               )
            )
        );
    }
}








document.addEventListener("DOMContentLoaded", function(event) {      
    ReactDOM.render(React.createElement(HOC, null, null), document.getElementById('root'));
}); 
