'use strict'

const lineComponent = function(props) {
    const lineStyle = {width: props.data.w, top: props.data.top, left: props.data.left,  msTransform: "rotate(" + props.data.deg + "deg)", 
                        WebkitTransform: "rotate(" + props.data.deg + "deg)", transform: "rotate(" + props.data.deg + "deg)"};

    return (
        React.createElement('hr', {key: props.data.id, id: props.data.id, className: 'line', style: lineStyle}, null)
    );
}

const headerComponent = function(props) {
    const headerStyle = {backgroundColor: 'blue', borderBottom: '1px', 
                           borderBottomColor: 'cyan', color: 'white'};
    return (
        React.createElement('div', {className: props.className, onClick: props.lineConnect, style: headerStyle}, props.header)
    );
};

const TextComponent = function(props) {    
    return React.createElement('div', {className: props.className}, props.content);
};


const BoxContainer = function(props) {
    // TODO: extract content from state object!
    const header = props.boxElement.header,
        content = props.boxElement.content,
        boxStyle = {top: props.boxElement.position.y, left: props.boxElement.position.x, width: props.boxElement.size.w, height: props.boxElement.size.h};     

    return (React.createElement('div', {id: props.id, className: 'boxContainer', style: boxStyle, draggable: true, 
                                        onDragStart: props.dragStart, 
                                        onDragOver: props.dragOver,
                                        onMouseUp: props.resize},
                // HEADER, TEXT AND LINE COMPONENT!
                React.createElement(headerComponent, {header: header, className: 'header col-xs-12', lineConnect: props.lineConnect}, null),
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
        
        this.dragElement = null;
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
                 elementsArr.push(React.createElement(BoxContainer, {key: key, id: key + '_', 
                                                                        boxElement: boxElement, 
                                                                        dragStart: this.dragStart,
                                                                        dragOver: this.dragOver, 
                                                                        resize: this.changeBoxSize,
                                                                        lineStart: this.lineStart,
                                                                        lineConnect: this.lineConnect}, null));
                if (boxElement.lines == null) {
                    continue;
                } else {
                    for (const lineId in boxElement.lines) {
                        elementsArr.push(React.createElement(lineComponent, {id: lineId, data: boxElement.lines[lineId]}, null));
                    }
                }
            }
        })();

        return React.createElement('div', {className: 'container', onDragEnd: this.dragEnd, onDragOver: this.dragOver}, null, elementsArr);
    }
}

var elementsObject = {
    0: {
        id: 0,
        parent: -1,
        header:"header1", 
        content: "option",
        expanded: true,
        position: {x: '610px', y: '10px'},
        size: {w: '100px', h: '100px'},
        lines: {1000: {top: '110px', left: '660px', w: '100px', deg: 45}}
     },
     1: {
        id: 1,
        parent: -1,
        header:"row 1", 
        content: "option 1",
        expanded: true,
        position: {x: '470px', y: '110px'},
        size: {w: '100px', h: '100px'},
        lines: null
     }, 
     2: { 
        id: 2,
        parent: -1,
        header:"row 1", 
        content: "option 2",
        expanded: true,
        position: {x: '360px', y: '260px'},
        size: {w: '100px', h: '100px'},
        lines: null
     }, 
     3: { 
        id: 3,
        parent: -1,
        header:"row 1", 
        content: 'option 3',
        expanded: true,
        position: {x: '260px', y: '260px'},
        size: {w: '100px', h: '100px'},
        lines: null
     }
};

document.addEventListener("DOMContentLoaded", function(e) {
    ReactDOM.render(React.createElement(HOC, {elementsObject}, null), document.getElementById('root'));
}); 
