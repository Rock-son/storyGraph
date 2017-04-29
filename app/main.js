'use strict'

const headerComponent = function(props) {
    var headerStyle = {backgroundColor: 'blue', borderBottom: '1px', 
                           borderBottomColor: 'cyan', color: 'white'};
    return (
        React.createElement('div', {className: props.className, onClick: props.lineConnect, onMouseDown: props.mouseDown, onMouseUpCapture: props.mouseUp, style: headerStyle}, props.header)
    );
};

const TextComponent = function(props) {    
    return React.createElement('div', {className: props.className}, props.content);
};


const BoxContainer = function(props) {
    // TODO: extract content from state object!
    var header = props.boxElement.header,
        content = props.boxElement.content,
        boxStyle = {top: props.boxElement.position.y, left: props.boxElement.position.x, width: props.boxElement.size.w, height: props.boxElement.size.h};     

    return (React.createElement('div', {id: props.id, className: 'boxContainer', style: boxStyle, draggable: true, 
                                        onDragStart: props.dragStart, 
                                        onDragOver: props.dragOver,
                                        onMouseUp: props.resize},
                // HEADER, TEXT AND LINE COMPONENT!
                React.createElement(headerComponent, {header: header, className: 'header col-xs-12', mouseUp: props.mouseUp, 
                                                                                                     mouseDown: props.mouseDown, 
                                                                                                     lineConnect: props.lineConnect}, null),
                React.createElement('div', {className: 'contentCont'},
                    React.createElement(TextComponent, {content: content, className: 'content col-xs-12'}, null)),                  
                React.createElement('div', {className: 'addHr', onDragStart: props.mouseUp, onClick: props.lineStart, title: 'Click to connect boxes!'},'+')

              )
     );
};


//main component: Higher Order Component - HOC
class HOC extends React.Component {
    constructor(props) {
        super(props);
        this.dragElementId = -1;
        this.dragElement = null;
        this.lineElement = null;
        this.upElement = null;
        this.position = {};
        this.state = {tree: this.props.elementsObject};
        // for box dragging event listeners - but no need if not using "this" keyword inside
        this.dragStart = this.dragStart.bind(this);
        this.dragOver = this.dragOver.bind(this);
        this.dragEnd = this.dragEnd.bind(this);        
        this.changeBoxSize = this.changeBoxSize.bind(this);
        // for connecting lines
        this.lineStart = this.lineStart.bind(this);
        this.lineConnect = this.lineConnect.bind(this);
        this.mouseUp = this.mouseUp.bind(this);
        this.mouseDown = this.mouseDown.bind(this);
    }

    mouseDown(e) {
        e = e || window.event;
        e.currentTarget.style.cursor = 'grabbing';
        this.upElement = e.currentTarget;
    }
    mouseUp(e) {
        e = e || window.event;        
        e.currentTarget.style.cursor = 'grab';
        this.upElement = null;
    }

    changeBoxSize(e) {
        e = e || window.event;        
        const id = parseInt(e.currentTarget.id),
              header = this.state.tree[id].header,
              content = this.state.tree[id].content,
              expanded = this.state.tree[id].expanded,
              position = this.state.tree[id].position,
              newSize = {};
              
        newSize[id] = {header, content, expanded, position, size: {w: e.currentTarget.style.width, h: e.currentTarget.style.height}};
        this.setState({tree: Object.assign({}, this.state.tree, newSize)});
    }

    dragStart(e) {
        e = e || window.event;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData("text/html", e.currentTarget);   // Firefox requires calling dataTransfer.setData for the drag to properly work
        this.dragElementId = parseInt(e.currentTarget.id);
        this.dragElement = e.currentTarget;
        // calculate mouse offset points for punctual drop
        this.position.offsetX = e.pageX - parseInt(this.state.tree[this.dragElementId].position.x);
        this.position.offsetY = e.pageY - parseInt(this.state.tree[this.dragElementId].position.y);
    }

    dragOver(e) {
        e = e || window.event;
        e.dataTransfer.dropEffect = 'move';
        this.position.x = e.pageX - this.position.offsetX;
        this.position.y = e.pageY - this.position.offsetY;
        e.stopPropagation();
        e.preventDefault();
    }

    dragEnd(e) {
        
        const id = this.dragElementId,
              header = this.state.tree[id].header,
              content = this.state.tree[id].content,
              expanded = this.state.tree[id].expanded,
              size = this.state.tree[id].size,
              newPosition = {};
        
        this.upElement == null ? void 0 : (this.upElement.style.cursor = 'grab');
        this.dragElement = null;
        this.upElement = null;
        newPosition[id] = {header, content, expanded, position: {x: this.position.x, y: this.position.y}, size};
        this.setState({tree: Object.assign({}, this.state.tree, newPosition)});
 
    }
    // for plus sign event listener
    lineStart(e) {
        e = e || window.event;
        const currentElementid = parseInt(e.currentTarget.parentNode.id),
              previousElementId = this.lineElement == null ? -1 : parseInt(this.lineElement.id);

        // IF FIRST CLICK - opening the line connection
        if (previousElementId === -1) {
            this.lineElement = e.currentTarget.parentNode;
            this.lineElement.style.border = '3px solid green';
        // IF CLICKED ON THE SAME BOX AGAIN
        } else if (currentElementid === previousElementId) {
            this.lineElement.style.border = '1px solid blue';
            this.lineElement = null;
        } 
    }
    // for header event listener
    lineConnect(e) {
        if (this.lineElement == null) {return;}
        e = e || window.event;
        alert('Connected!');
        this.lineElement.style.border = '1px solid blue';
        this.lineElement = null;

    }
    onBoxHover(e) {


    }

    render() {
        let elementsArr = [];
        //events for boxContainers
        (() => {
            for (const key in this.state.tree) {
                 const boxElement = this.state.tree[key];
                 elementsArr.push(React.createElement(BoxContainer, {key: key, id: key + '_', boxElement, 
                                                                        dragStart: this.dragStart,
                                                                        dragOver: this.dragOver, 
                                                                        resize: this.changeBoxSize,
                                                                        lineStart: this.lineStart,
                                                                        lineConnect: this.lineConnect,
                                                                        mouseDown: this.mouseDown,
                                                                        mouseUp: this.mouseUp}, null));
            }
        })();

        return React.createElement('div', {className: 'container', onDragEnd: this.dragEnd, onDragOver: this.dragOver}, null, elementsArr);
    }
}

var elementsObject = {
    0: {
        id: 0,
        header:"header1", 
        content: "option",
        expanded: true,
        position: {x: '10px', y: '10px'},
        size: {w: '100px', h: '100px'}
     },
     1: {
        id: 1,
        header:"row 1", 
        content: "option 1",
        expanded: true,
        position: {x: '30px', y: '30px'},
        size: {w: '100px', h: '100px'}
     }, 
     2: { 
        id: 2,
        header:"row 1", 
        content: "option 2",
        expanded: true,
        position: {x: '60px', y: '60px'},
        size: {w: '100px', h: '100px'}
     }, 
     3: { 
        id: 3,
        header:"row 1", 
        content: 'option 3',
        expanded: true,
        position: {x: '100px', y: '100px'},
        size: {w: '100px', h: '100px'}
     }
};

document.addEventListener("DOMContentLoaded", function(e) {
    ReactDOM.render(React.createElement(HOC, {elementsObject}, null), document.getElementById('root'));
}); 
