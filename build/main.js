'use strict'
// POPUP
const Popup = function(props) {
    const popupStyle = {top: props.data.top, left: props.data.left, fontSize: '14px'};

    return (React.createElement('div', {className: 'line-popup', style: popupStyle},
                 React.createElement('div', {data: props.data.id, action: 'DESCRIBE', style: {cursor: 'pointer', color: 'green'}, className: 'popup-element', onClick: props.clickHandler}, 'DESCRIBE'),
                 React.createElement('hr',  {style: {margin: '1px'}}, null),
                 React.createElement('div', {data: props.data.id, action: 'DELETE', style: {cursor: 'pointer', color: 'red'}, className: 'popup-element', onClick: props.clickHandler}, 'DELETE')
    ));
};
// CONNECTING LINE
const Line = function(props) {
    const lineStyle = {width: props.data.w, top: props.data.top, left: props.data.left,  msTransform: "rotate(" + props.data.deg + "deg)", 
                        WebkitTransform: "rotate(" + props.data.deg + "deg)", transform: "rotate(" + props.data.deg + "deg)"};
    
    return (React.createElement('div', null, null,
                React.createElement('hr', { id: props.id, className: 'line', style: lineStyle, onClick: props.onLineClick}, null)                
    ));
}
// HEADER
const Header = function(props) {
    const headerStyle = {backgroundColor: 'blue', borderBottom: '1px', borderBottomColor: 'cyan', color: 'white'},
          closeBtnStyle = {width: '17px', height: '15px', lineHeight: '8px', border: '1px outset white', color: 'white', 
                            backgroundColor: 'red', float: 'right', margin: '5px 5px 0 0', paddingLeft: '3px'};

    return (React.createElement('div', {className: props.className, onClick: props.completeConnection, style: headerStyle}, props.header,
                React.createElement('div', {className: 'closeBtn', style: closeBtnStyle}, 'x')
    ));
};
// CONTENT
const Content = function(props) {    
    return React.createElement('div', {className: props.className}, props.content);
};
// BOX CONTAINER
const BoxContainer = function(props) {
    // TODO: extract content from state object!
    const header = props.boxElement.header,
          content = props.boxElement.content,
          { top, left } = props.boxElement.position,
          { width, height } = props.boxElement.size,
          { border } = props.boxElement.style,
          
          boxStyle = {top, left, width, height, border};
          
    return (React.createElement('div', {id: props.id, className: 'boxContainer', style: boxStyle, draggable: true, 
                                        onDragStart: props.dragStart,
                                        onDragEnter: props.dragEnter,
                                        onDragLeave: props.dragLeave,
                                        onDrop: props.dragDrop,
                                        onMouseUp: props.changeBoxSize},
                // HEADER, TEXT AND LINE COMPONENT!
                React.createElement(Header, {header: header, className: 'header', completeConnection: props.completeConnection}, null),
                React.createElement('div', {className: 'contentCont'},
                    React.createElement(Content, {content: content, className: 'content'}, null)),
                React.createElement('div', {className: 'addHr', onClick: props.connectionStart, title: 'Click to connect boxes!'},'+')
              )
     );
};

//main component: Higher Order Component - HOC
class MainContainer extends React.Component {
    constructor(props) {
        super(props);
        this.dragElementId = -1;
        this.dragElement = null;
        this.lineElement = null;        
        this.startingPos = null;
        this.startingConn = null;
        this.connectionOn = false;
        this.dropped = false;
        this.position = {};
        this.state = {tree: this.props.storage, connections: this.props.connections, popup: null};
        //helper functions
        this.deepClone = this.deepClone.bind(this);
        this.calculateConnection = this.calculateConnection.bind(this);
    }

    deepClone(obj) {
        let newObj,
        i;
            // if object property is a primitive
        if (typeof obj !== 'object' || !obj) {
        return obj;
        }
            // if object property is an array
        if ('[object Array]' === Object.prototype.toString.apply(obj)) {
        newObj = [];
        for (i = 0; i < obj.length; i++) {
            newObj[i] = this.deepClone(obj[i]);
        }
        return newObj;
        } 
            // if object property is an object
        newObj = {};
        for (i in obj) {
        if (obj.hasOwnProperty(i)) {
            newObj[i] = this.deepClone(obj[i]);
        }
        }
        return newObj;
    }
    // stops dragging the element and puts it back in the original position, TODO: context menu?
    rightClick(e) {
        if (this.dragElementId === -1 || this.startingPos == null) {
            e.stopPropagation();
            e.preventDefault();
            return;
        } 
        e.stopPropagation();
        e.preventDefault();
        this.setState({tree: Object.assign({}, this.startingPos), connections: Object.assign({}, this.startingConn)});
    }
    onPopupClick(e) {
        e = e || window.event;
        for (let key in e.target) {
            //console.log(e.target[key]);
        }
        console.log(e.currentTarget.getAttribute('action'));
        this.setState({popup: null});
    }
    changeBoxSize(e) {
        if (this.connectionOn) {return;}

        e = e || window.event;
        const targetId = parseInt(e.currentTarget.id),
              newStateTree = this.deepClone(this.state.tree),
              newStateConnections = this.deepClone(this.state.connections),              
              children = newStateTree[targetId].children,
              parents = newStateTree[targetId].parents;
        
        newStateTree[targetId].size = {width: e.currentTarget.getBoundingClientRect().width, height: e.currentTarget.getBoundingClientRect().height};
        children.forEach((childId) => {
            const parentEl = newStateTree[targetId],
                  childEl = newStateTree[childId];
            if (newStateConnections[targetId][childId] != null) {
                newStateConnections[targetId][childId] = Object.assign({}, this.state.connections[targetId][childId], this.calculateConnection(parentEl, childEl, newStateTree));
            }
        });
        parents.forEach((parentId) => {
            const parentEl = newStateTree[parentId],
                  childEl = newStateTree[targetId];                  
            if (newStateConnections[parentId][targetId] != null) {
                newStateConnections[parentId][targetId] = Object.assign({}, this.state.connections[parentId][targetId], this.calculateConnection(parentEl, childEl, newStateTree));
            }            
        });
        this.setState({tree: Object.assign({}, newStateTree), connections: Object.assign({}, newStateConnections)});
    }
    dragStart(e) {
        e = e || window.event;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData("text/html", e.currentTarget);   // Firefox requires calling dataTransfer.setData for the drag to properly work
        this.dragElementId = parseInt(e.currentTarget.id);
        this.dragElement = e.currentTarget;
        this.dropped = false;
        // calculate mouse offset points for punctual drop
        this.position.offsetX = e.pageX - parseInt(this.state.tree[this.dragElementId].position.left);
        this.position.offsetY = e.pageY - parseInt(this.state.tree[this.dragElementId].position.top);
        this.startingPos = this.deepClone(this.state.tree);
        this.startingConn = this.deepClone(this.state.connections);
    }
    dragOver(e) {
        e = e || window.event;
        e.dataTransfer.dropEffect = 'move';
        e.preventDefault();
        this.position.left = e.pageX - this.position.offsetX;
        this.position.top = e.pageY - this.position.offsetY;
    }
    dragEnter(e) {
        e = e || window.event;
        e.dataTransfer.dropEffect = 'move';
        
        const targetId = parseInt(e.currentTarget.id);
        if (targetId === this.dragElementId) {return;}

        const cloneState = this.deepClone(this.state.tree);
        cloneState[targetId].style = Object.assign({}, this.state.tree[targetId].style, {border: '3px solid green'});
        
        this.setState({tree: cloneState});
    }
    dragLeave(e) {
        e = e || window.event;
        e.dataTransfer.dropEffect = 'move';
        e.preventDefault();

        const targetId = parseInt(e.currentTarget.id),
              dragId = parseInt(e.target.id);
        if (targetId === this.dragElementId || targetId !== dragId) {return;}

        const cloneState = this.deepClone(this.state.tree);
        cloneState[targetId].style = Object.assign({}, cloneState[targetId].style, {border: '1px solid blue'});
        this.lineElement = null;
        this.setState({tree: cloneState});
    }
    //for switching boxContainers positions
    switchContainers(e) {
        
        const cloneState = this.deepClone(this.state.tree),
              cloneState_ = this.deepClone(this.state.tree),
              draggedId = this.dragElementId,
              targetId = parseInt(e.currentTarget.id);
              
        cloneState_[targetId] = Object.assign({}, cloneState[targetId], {header: cloneState[draggedId].header, content: cloneState[draggedId].content, style: {border: '1px solid blue'}});
        cloneState_[draggedId] = Object.assign({}, cloneState[draggedId], {header: cloneState[targetId].header, content: cloneState[targetId].content});
        this.dropped = true;
        this.dragElement = null;
        this.setState({tree: Object.assign({}, cloneState, cloneState_)});
    }
    // for moving boxContainers elements
    dragEnd(e) {
        if (this.dropped) {return;}
        
        const newStateTree = this.deepClone(this.state.tree),
              newStateConnections = this.deepClone(this.state.connections),
              targetId = this.dragElementId,
              children = newStateTree[this.dragElementId].children,
              parents = newStateTree[this.dragElementId].parents;

        newStateTree[this.dragElementId].position = {left: this.position.left, top: this.position.top};
        // update connections for concerning box containers (children and parents)
        children.forEach((childId) => {
            const targetEl = newStateTree[childId],
                  parentEl = newStateTree[targetId];
            newStateConnections[targetId][childId] = this.calculateConnection(parentEl, targetEl, newStateTree);
        });
        parents.forEach((parentId) => {
            const parentEl = newStateTree[parentId],
                  childEl = newStateTree[targetId];
            newStateConnections[parentId][targetId] = this.calculateConnection(parentEl, childEl, newStateTree);
        });
        this.dragElement = null;
        this.setState({tree: newStateTree, connections: newStateConnections});
    }
    connectionStart(e) {
        
        e = e || window.event;
        const currentElementId = parseInt(e.currentTarget.parentNode.id),
              previousElementId = this.lineElement == null ? -1 : parseInt(this.lineElement.id),
              newStateTree = this.deepClone(this.state.tree);
        this.connectionOn = true;

        // IF FIRST CLICK - opening the line connection
        if (previousElementId === -1) {
            this.lineElement = e.currentTarget.parentNode;
            newStateTree[parseInt(this.lineElement.id)].style = Object.assign({}, newStateTree[parseInt(this.lineElement.id)].style, {border: '3px solid green'});
        // IF CLICKED ON THE SAME BOX AGAIN
        } else if (currentElementId === previousElementId) {
            newStateTree[parseInt(this.lineElement.id)].style = Object.assign({}, newStateTree[parseInt(this.lineElement.id)].style, {border: '1px solid blue'});
            this.lineElement = null;
        } 
        this.setState({tree: newStateTree});
    }
    completeConnection(e) {
        
        if (this.lineElement == null || parseInt(this.lineElement.id) === parseInt(e.currentTarget.parentNode.id)) {return;}
        e = e || window.event;

        let   newStateTree = this.deepClone(this.state.tree) || {},
              newConnections = this.deepClone(this.state.connections) || {};
        const parentId = parseInt(this.lineElement.id),
              parentEl = newStateTree[parentId],
              targetId = parseInt(e.currentTarget.parentNode.id),  
              targetEl = newStateTree[targetId],     
              calcConnectionsObj = this.calculateConnection(parentEl, targetEl);
              
        // update or add children
        newStateTree[parentId].children.indexOf(targetId) > -1 ? void 0 : newStateTree[parentId].children.push(targetId);
        newStateTree[targetId].parents.indexOf(parentId) > -1 ? void 0 : newStateTree[targetId].parents.push(parentId);
        // update or add connections
        newConnections[parentId] = newConnections[parentId] || {};
        newConnections[parentId][targetId] = calcConnectionsObj;
        // change border to normal        
        newStateTree[parseInt(this.lineElement.id)].style = Object.assign({}, newStateTree[parseInt(this.lineElement.id)].style, {border: '1px solid blue'});
        this.lineElement = null;
        this.connectionOn = false;

        this.setState({tree: newStateTree, connections: newConnections});
    }
    calculateConnection(parent, target, newStateTree = this.state.tree) {

        const parentRect = Object.assign({}, newStateTree[parent.id].position, newStateTree[parent.id].size),
              targetRect = Object.assign({}, newStateTree[target.id].position, newStateTree[target.id].size),
              aLen = 20,
              bLen = - (parseInt(parentRect.left) + (parseInt(parentRect.width) / 2)) + (parseInt(targetRect.left) + (parseInt(targetRect.width) / 2)),
              cLen = - (parseInt(parentRect.top) + parseInt(parentRect.height) + aLen) + parseInt(targetRect.top),

              a = { top:  (parseInt(parentRect.top) + parseInt(parentRect.height)) + 'px',
                    left: (parseInt(parentRect.left) + (parseInt(parentRect.width) / 2) - (aLen / 2)) + 'px',
                    w: aLen,
                    deg: 90 },
              b = { top:  (parseInt(parentRect.top) + parseInt(parentRect.height) + (aLen / 2)) + 'px',
                    left: (parseInt(parentRect.left) + (parseInt(parentRect.width) / 2) + (bLen < 0 ? bLen : 0)) + 'px',
                    w: (Math.abs(bLen) + 2) + 'px',
                    deg: 0},
              c = { top:  (parseInt(parentRect.top) + parseInt(parentRect.height) + (aLen/2) + (cLen / 2)) + 'px',
                    left: (parseInt(b.left) + ((bLen < 0 ? 0 : bLen)) - (cLen < 0 ? (-cLen/2) : (cLen/2))) + 'px',
                    w: (Math.abs(cLen) + 5) + 'px',
                    deg: 90};
        return {a, b, c};
    }
    lineClick(e) {
        e = e || window.event;
        this.setState({popup: {id: e.currentTarget.id, top: (e.pageY - 10) + 'px', left:(e.pageX - 50) + 'px'}});
    }
    render() {
        let elementsArr = [];
        //events for boxContainers - move it in WillComponentUpdate
        (() => {
            for (const key in this.state.tree) {
                 if (this.state.tree.hasOwnProperty(key)) {
                    const boxElement = this.state.tree[key];
                    elementsArr.push(React.createElement(BoxContainer, {key: key,
                                                                        id: key + '_', 
                                                                        boxElement: boxElement, 
                                                                        dragStart: this.dragStart.bind(this),
                                                                        dragEnter: this.dragEnter.bind(this),
                                                                        dragLeave: this.dragLeave.bind(this),
                                                                        dragDrop: this.switchContainers.bind(this),
                                                                        changeBoxSize: this.changeBoxSize.bind(this),
                                                                        connectionStart: this.connectionStart.bind(this),
                                                                        completeConnection: this.completeConnection.bind(this),
                                                                        rightClick: this.rightClick.bind(this)}, null));
                 }
            }
            Object.keys(this.state.connections).forEach((key)=> {
                Object.keys(this.state.connections[key]).forEach((key_)=> {
                    Object.keys(this.state.connections[key][key_]).forEach((key__)=> {
                        const id = key+key_+key__;
                        elementsArr.push(React.createElement(Line, {key: id, id: id,
                                                                    onLineClick: this.lineClick.bind(this),
                                                                    data: this.state.connections[key][key_][key__]
                                                                    }
                                        )
                        )
                    });
                });
            });            

            if (this.state.popup) {
                elementsArr.push(React.createElement(Popup, {key: this.state.popup + '_popup',
                                                             data: this.state.popup,
                                                             clickHandler: this.onPopupClick.bind(this)
                                                            }
                                )
                )
            }
        })();

        return React.createElement('div', {className: 'container', onDragEnd: this.dragEnd.bind(this), onDragOver: this.dragOver.bind(this), onContextMenu: this.rightClick.bind(this)}, null, elementsArr);
    }
}
let connections = {
    /*
    0: {
        1: {
            a: {top: "150px", left: "250px", w: "20px",  deg: 90, description: {top: calcTop, left: calcLeft}},
            b: {top: "250px", left: "150px", w: "200px", deg: 0, description:  {top: calcTop, left: calcLeft}},
            c: {top: "350px", left: "170px", w: "220px", deg: 90, description: {top: calcTop, left: calcLeft}}
        }
    }
    */
};

let storage = {
    0: {
        id: 0,
        parents: [],
        children: [],
        header:"header0", 
        content: "option",
        postscript: "",
        expanded: true,
        type: "",
        style: {border: '1px solid blue'},
        position: {left: '700px', top: '50px'},
        size: {width: '120px', height: '100px'}
     },
     1: {
        id: 1,
        parents: [],
        children: [],
        header:"header1", 
        content: "option 1",
        postscript: "",
        expanded: true,
        type: "",
        style: {border: '1px solid blue'},
        position: {left: '978px', top: '287px'},
        size: {width: '120px', height: '100px'}
     }, 
     2: { 
        id: 2,
        parents: [],
        children: [],
        header:"header2", 
        content: "option 2",
        postscript: "",
        expanded: true,
        type: "",
        style: {border: '1px solid blue'},
        position: {left: '390px', top: '260px'},
        size: {width: '120px', height: '100px'}
     }, 
     3: { 
        id: 3,
        parents: [],
        children: [],
        header:"header3", 
        content: 'option 3',
        postscript: "",
        expanded: true,
        type: "",
        style: {border: '1px solid blue'},
        position: {left: '250px', top: '260px'},
        size: {width: '120px', height: '100px'}
     }
};



document.addEventListener("DOMContentLoaded", function(e) {
    ReactDOM.render(React.createElement(MainContainer, {storage, connections}, null), document.getElementById('root'));
}); 
