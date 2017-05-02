'use strict'
// CONNECTING LINE
const lineComponent = function(props) {
    const lineStyle = {width: props.data.w, top: props.data.top, left: props.data.left,  msTransform: "rotate(" + props.data.deg + "deg)", 
                        WebkitTransform: "rotate(" + props.data.deg + "deg)", transform: "rotate(" + props.data.deg + "deg)"};

    return (
        React.createElement('hr', { id: props.id, className: 'line', style: lineStyle}, null)
    );
}
// HEADER
const headerComponent = function(props) {
    const headerStyle = {backgroundColor: 'blue', borderBottom: '1px', borderBottomColor: 'cyan', color: 'white'},
          closeBtnStyle = {width: '17px', height: '15px', lineHeight: '8px', border: '1px outset white', color: 'white', 
                            backgroundColor: 'red', float: 'right', margin: '5px 5px 0 0', paddingLeft: '3px'};

    return (
        React.createElement('div', {className: props.className, onClick: props.makeConnection, style: headerStyle}, props.header,
            React.createElement('div', {className: 'closeBtn', style: closeBtnStyle}, 'x')
        )
    );
};
// CONTENT
const TextComponent = function(props) {    
    return React.createElement('div', {className: props.className}, props.content);
};

// BOX CONTAINER
const BoxContainer = function(props) {
    // TODO: extract content from state object!
    const header = props.boxElement.header,
        content = props.boxElement.content,
        boxStyle = {top: props.boxElement.position.y, left: props.boxElement.position.x, width: props.boxElement.size.w, height: props.boxElement.size.h};     

    return (React.createElement('div', {id: props.id, className: 'boxContainer', style: boxStyle, draggable: true, 
                                        onDragStart: props.dragStart, 
                                        onDragOver: props.dragOver,
                                        onMouseUp: props.resize,
                                        onContextMenu: props.rightClick},
                // HEADER, TEXT AND LINE COMPONENT!
                React.createElement(headerComponent, {header: header, className: 'header', makeConnection: props.makeConnection}, null),
                React.createElement('div', {className: 'contentCont'},
                    React.createElement(TextComponent, {content: content, className: 'content'}, null)),                  
                React.createElement('div', {className: 'addHr', onClick: props.connectionStart, title: 'Click to connect boxes!'},'+')
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
        this.startingPos = null;
        this.position = {};
        this.state = {tree: this.props.elementsObj, connections: this.props.connectionsObj};
        // for box dragging event listeners
        this.dragStart = this.dragStart.bind(this);
        this.dragOver = this.dragOver.bind(this);
        this.dragEnd = this.dragEnd.bind(this);        
        this.changeBoxSize = this.changeBoxSize.bind(this);
        this.rightClick = this.rightClick.bind(this);
        // for connecting lines
        this.connectionStart = this.connectionStart.bind(this);
        this.makeConnection = this.makeConnection.bind(this);
        this.calculateConnection = this.calculateConnection.bind(this);
    }

    // stops dragging the element and puts it back in the original position, TODO: context menu?
    rightClick(e) {
        if (this.dragElementId === -1 || this.startingPos == null) {
            e.stopPropagation();
            e.preventDefault();
            return;
        }
        
        this.setState({tree: Object.assign({}, this.state.tree, this.startingPos)});
        e.stopPropagation();
        e.preventDefault();
    }

    changeBoxSize(e) {
        e = e || window.event;        
        const id = parseInt(e.currentTarget.id),
              el = this.state.tree[id],
              parent = el.parent,
              children = el.children,
              header = el.header,
              content = el.content,
              expanded = el.expanded,
              position = el.position,
              newSize = {};
              
        newSize[id] = {id, parent, children, header, content, expanded, position, size: {w: e.currentTarget.style.width, h: e.currentTarget.style.height}};
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
        this.startingPos = JSON.parse(JSON.stringify(this.state.tree));
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
              el = this.state.tree[id],
              parent = el.parent,
              children = el.children,
              header = el.header,
              content = el.content,
              expanded = el.expanded,
              size = el.size,
              newPosition = {};
        
        this.dragElement = null;
        newPosition[id] = {id, parent, children, header, content, expanded, position: {x: this.position.x, y: this.position.y}, size};
        this.setState({tree: Object.assign({}, this.state.tree, newPosition)}); 
    }

    connectionStart(e) {
        e = e || window.event;
        const currentElementId = parseInt(e.currentTarget.parentNode.id),
              previousElementId = this.lineElement == null ? -1 : parseInt(this.lineElement.id);

        // IF FIRST CLICK - opening the line connection
        if (previousElementId === -1) {
            this.lineElement = e.currentTarget.parentNode;
            this.lineElement.style.border = '3px solid green';
        // IF CLICKED ON THE SAME BOX AGAIN
        } else if (currentElementId === previousElementId) {
            this.lineElement.style.border = '1px solid blue';
            this.lineElement = null;
        } 
    }

    makeConnection(e) {
        if (this.lineElement == null) {return;}
        e = e || window.event;        

        const id = parseInt(this.lineElement.id),
              el = this.state.tree[id],  // parent
              idConn = parseInt(e.currentTarget.parentNode.id),     // id from child element
              returnedConnObj = this.calculateConnection(el, this.state.tree[idConn]);
        let newConnection = {};
        this.lineElement.style.border = '1px solid blue';
        this.lineElement = null; 

        newConnection[id] = {id: el.id, parent: el.parent, children: el.children, header: el.header, content: el.content, expanded: el.expanded, position: el.position, size: el.size, connections: returnedConnObj};
        //newConnection = Object.assign({}, newConnection, returnedConnObj); // adds or changes new connections
        this.setState({tree: Object.assign({}, this.state.tree, newConnection)}); 
    }

    calculateConnection(el1, el2) {
        
        const el2_Id = parseInt(el2.id),
              a = parseInt(el1.position.y) + parseInt(el1.size.h) - parseInt(el2.position.y),
              b = parseInt(el1.position.x) + (parseInt(el1.size.w)/2) - parseInt(el2.position.x),
              c = Math.round(Math.sqrt(Math.pow(Math.abs(a),2) + Math.pow(Math.abs(b), 2)));
        let deg = Math.asin(Math.abs(b)/c);
        deg = 90 - Math.round(deg * (180/Math.PI)); // convert from radians to degrees
        
        let connections = {};

        connections[el2_Id] = {top: ((Math.abs(a) / 2) + parseInt(el1.position.y)  + parseInt(el1.size.h)) + 'px', left: (parseInt(el1.position.x) + (parseInt(el1.size.w)/2)) + 'px', w: c + 'px', deg: deg};
        return connections;
   }

    render() {
        let elementsArr = [];
        //events for boxContainers - move it in WillComponentUpdate
        (() => {
            for (const key in this.state.tree) {
                 const boxElement = this.state.tree[key];
                 elementsArr.push(React.createElement(BoxContainer, {key: key, id: key + '_', 
                                                                        boxElement: boxElement, 
                                                                        dragStart: this.dragStart,
                                                                        dragOver: this.dragOver, 
                                                                        resize: this.changeBoxSize,
                                                                        connectionStart: this.connectionStart,
                                                                        makeConnection: this.makeConnection,
                                                                        rightClick: this.rightClick}, null));                
            }
            if (Object.keys(this.state.connections).length < 1) {return;}
            for (const key in this.state.connections) {
                for (const key_ in this.state.connections[key]) {
                    for (const key__ in this.state.connections[key][key_]) {
                        const id = key+key_+key__;
                        //TODO: add event listeners!
                        elementsArr.push(React.createElement(lineComponent, {key: id, 
                                                                             id: id, 
                                                                             data: this.state.connections[key][key_][key__]
                                                                            }
                                                            )
                        )
                    }
                }
            }
        })();

        return React.createElement('div', {className: 'container', onDragEnd: this.dragEnd, onDragOver: this.dragOver}, null, elementsArr);
    }
}
let connectionsObj = {
    // id from parent and id from child
    0: {
        1: {
            a: {top: '152px', left: '755px', w: '20px',  deg: 90},
            b: {top: '162px', left: '765px', w: '100px', deg: 0},
            c: {top: '212px', left: '815px', w: '100px', deg: 90}
        }
    }
}

let elementsObj = {
    0: {
        id: 0,
        parent: -1,
        children: [],
        header:"header0", 
        content: "option",
        expanded: true,
        position: {x: '700px', y: '50px'},
        size: {w: '100px', h: '100px'}
     },
     1: {
        id: 1,
        parent: 0,
        children: [],
        header:"header1", 
        content: "option 1",
        expanded: true,
        position: {x: '978px', y: '287px'},
        size: {w: '100px', h: '100px'}
     }, 
     2: { 
        id: 2,
        parent: -1,
        children: [],
        header:"header2", 
        content: "option 2",
        expanded: true,
        position: {x: '360px', y: '260px'},
        size: {w: '100px', h: '100px'}
     }, 
     3: { 
        id: 3,
        parent: -1,
        children: [],
        header:"header3", 
        content: 'option 3',
        expanded: true,
        position: {x: '250px', y: '260px'},
        size: {w: '100px', h: '100px'}
     }
};


document.addEventListener("DOMContentLoaded", function(e) {
    ReactDOM.render(React.createElement(HOC, {elementsObj, connectionsObj}, null), document.getElementById('root'));
}); 
