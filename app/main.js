'use strict'

const headerComponent = function(props) {
    var headerStyle = {height: '2em', backgroundColor: 'blue', borderBottom: '1px', 
                           borderBottomColor: 'cyan', color: 'white'};
    return (
        React.createElement('div', {className: props.className, style: headerStyle}, props.header)
    );
};

const TextComponent = function(props) {    
    return React.createElement('div', {className: props.className}, props.content);
};


const BoxContainer = function(props) {
    // TODO: extract content from state object!
    var header = props.boxElement.header,
        content = props.boxElement.content,
        boxStyle = {top: props.boxElement.position.y +'px', left: props.boxElement.position.x + 'px'};     

    return (React.createElement('div', {className: 'row'}, null,
               React.createElement('div', {id: props.id, className: 'boxContainer', style: boxStyle, draggable: true, onDragStart: props.dragStart, onDragOver: props.dragOver, onMouseUp: props.resize}, null,
                  // COMPONENTS!
                  React.createElement(headerComponent, {header: header, className: 'header col-xs-12'}, null),
                  React.createElement(TextComponent, {content: content, className: 'content col-xs-12'}, null),
                  React.createElement('div', {className: 'krneki'}, '+')
               )               
           )
      );
};


//main component: Higher Order Component - HOC
class HOC extends React.Component {
    constructor(props) {
        super(props);
        this.dragElementId = -1,
        this.dragElement = null;
        this.position = {};
        this.state = {tree: this.props.stateObject};
        this.dragStart = this.dragStart.bind(this);
        this.dragOver = this.dragOver.bind(this);
        this.dragEnd = this.dragEnd.bind(this);
        this.changeSize = this.changeSize.bind(this);
    }

    changeSize(e) {
        console.log(e.currentTarget);

    }

    dragStart(e) {
        e = e || window.event;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData("text/html", e.currentTarget);   // Firefox requires calling dataTransfer.setData for the drag to properly work
        this.dragElementId = parseInt(e.currentTarget.id);
        this.dragElement = e.currentTarget;
        // calculate mouse offset points for punctual drop
        this.position.offsetX = e.pageX - this.state.tree[this.dragElementId].position.x;
        this.position.offsetY = e.pageY - this.state.tree[this.dragElementId].position.y;
    }

    dragOver(e) {
        e = e || window.event;        
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        this.position.x = e.pageX - this.position.offsetX;
        this.position.y = e.pageY - this.position.offsetY;
    }

    dragEnd(e) {

        const id = this.dragElementId,
              header = this.state.tree[id].header,
              content = this.state.tree[id].content,
              expanded = this.state.tree[id].expanded,
              newPosition = {};

        newPosition[id] = {header, content, expanded, position: {x: this.position.x, y: this.position.y}};
        this.setState({tree: Object.assign({}, this.state.tree, newPosition)});
    }

    render() {
        let elementsArr = [];
        (() => {
            for (const key in this.state.tree) {
                 const boxElement = this.state.tree[key];
                 elementsArr.push(React.createElement(BoxContainer, {key: key, id: key + '_', boxElement: boxElement, dragOver: this.dragOver, dragStart: this.dragStart, resize: this.changeSize}, null));
            }
        })();

        return React.createElement('div', {className: 'container', onDragEnd: this.dragEnd, onDragOver: this.dragOver}, null, elementsArr);
    }
}

var stateObject = {
    0: {
        id: 0,
        header:"header1", 
        content: "option",
        expanded: true,
        position: {x: 10, y: 10}
     },
     1: {
        id: 1,
        header:"row 1", 
        content: "option 1",
        expanded: true,
        position: {x: 30, y: 30}
     }, 
     2: { 
        id: 2,
        header:"row 1", 
        content: "option 2",
        expanded: true,
        position: {x: 60, y: 60}
     }, 
     3: { 
        id: 3,
        header:"row 1", 
        content: 'option 3',
        expanded: true,
        position: {x: 100, y: 100}
     }
};

document.addEventListener("DOMContentLoaded", function(event) {
    ReactDOM.render(React.createElement(HOC, {stateObject: stateObject}, null), document.getElementById('root'));
}); 
