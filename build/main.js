'use strict'
// LINE POPUP
const LinePopup = function(props) {
    const linePopupStyle = {top: props.data.top, left: props.data.left, fontSize: '14px'};

    return (React.createElement('div', {id: props.data.id + '_linePop', className: 'line-popup', style: linePopupStyle, onMouseEnter: props.onLineEnter},
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
                React.createElement('hr', { id: props.id, className: 'line', style: lineStyle, onClick: props.onLineClick, onMouseEnter: props.onLineEnter, onMouseLeave: props.onLineLeave}, null)                
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
    // TODO: Should Component Update?
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
        this.state = {tree: this.props.storage, connections: this.props.connections, linePopup: null, popup: null};
        //helper functions
        this.deepClone = this.deepClone.bind(this);
        this.getLinesCoord = this.getLinesCoord.bind(this);
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
    lineClick(e) {
        e = e || window.event;
        e.stopPropagation();        
        this.setState({linePopup: Object.assign({}, {id: e.currentTarget.id, top: (e.pageY - 10) + 'px', left:(e.pageX - 50) + 'px'})});
    }
    onLineEnter(e) {
        e = e || window.event;
        
        const parentId = parseInt(e.target.id[0] || e.target.getAttribute('data')[0]),
              childId = parseInt(e.target.id[1]  || e.target.getAttribute('data')[1]),
              newStateTree = Object.assign({}, this.state.tree, 
                                    {[parentId]: Object.assign({}, this.state.tree[parentId], {style: {border: '3px solid blue'}})},
                                    {[childId]:  Object.assign({}, this.state.tree[childId],  {style: {border: '3px solid blue'}})
            });
        this.setState({tree: Object.assign({}, newStateTree)});
    }
    onLineLeave(e) {
        e = e || window.event;
        e.stopPropagation();
        const parentId = parseInt(e.target.id[0]),
              childId = parseInt(e.target.id[1]),
              newStateTree = Object.assign({}, this.state.tree, 
                                    {[parentId]: Object.assign({}, this.state.tree[parentId], {style: {border: '1px solid blue'}})},
                                    {[childId]: Object.assign({},  this.state.tree[childId],  {style: {border: '1px solid blue'}})
            });
        this.setState({tree: Object.assign({}, newStateTree)});
    }
    onPopupClick(e) {
        e = e || window.event;
        const parentId = parseInt(e.currentTarget.getAttribute('data')[0]),
              childId = parseInt(e.currentTarget.getAttribute('data')[1]),
              lineId = parseInt(e.currentTarget.getAttribute('data')[2]),
              action = e.currentTarget.getAttribute('action');
              
        switch(action) {
            case 'DELETE':
                const updateConnections = Object.assign({}, this.state.connections, {[parentId]: Object.assign({}, this.state.connections[parentId], {[childId]: null })}),
                      childsParents = this.state.tree[childId].parents,
                      parentsChildren = this.state.tree[parentId].children,
                      updateTree = Object.assign({}, this.state.tree, 
                                        {[parentId]: Object.assign({}, this.state.tree[parentId], {children: parentsChildren.filter((child) => child !== childId)})},  // parent looses a child
                                        {[childId] : Object.assign({}, this.state.tree[childId],  {parents: childsParents.filter((parent) => parent !== parentId)})   // child looses a parent
                                   });

                this.setState({linePopup: null, connections: updateConnections, tree: updateTree});
                break;
            case 'DESCRIBE':
                // TODO
                break;
            default:
                this.setState({linePopup: null});
        } 
    }
    onPopupOutClick(e) {
        this.setState({LinePopup: null});
    }
    changeBoxSize(e) {
        if (this.connectionOn) {return;}

        e = e || window.event;
        const targetId = parseInt(e.currentTarget.id),
              newStateTree = Object.assign({}, this.state.tree, 
                            {[targetId]: Object.assign({}, this.state.tree[targetId],
                                        {size: Object.assign({}, this.state.tree[targetId].size, {width: e.currentTarget.getBoundingClientRect().width, height: e.currentTarget.getBoundingClientRect().height})})
        });
        
        this.setState({tree: Object.assign({}, newStateTree), connections: Object.assign({}, this.getLinesCoord(targetId, newStateTree))});
    }
    getLinesCoord(targetId, newStateTree) {

        let   newStateConnections = Object.assign({}, this.state.connections);
        const children = this.state.tree[targetId].children,
              parents = this.state.tree[targetId].parents;  

        children.forEach((childId) => {
            const parentEl = Object.assign({}, newStateTree[targetId]),
                  childEl  = Object.assign({}, newStateTree[childId]);
            newStateConnections = Object.assign({}, this.state.connections || {}, 
                                        {[targetId]: Object.assign({}, this.state.connections[targetId] || {}, 
                                                {[childId]: Object.assign({}, (this.state.connections[targetId] || {})[childId] || {},
                                                        this.calculateConnection(parentEl, childEl, newStateTree))}
                                        )});
        });
        parents.forEach((parentId) => {
            const parentEl = newStateTree[parentId],
                    childEl = newStateTree[targetId];
            newStateConnections = Object.assign({}, newStateConnections || {}, 
                                        {[parentId]: Object.assign({}, newStateConnections[parentId] || {}, 
                                                {[targetId]: Object.assign({}, (newStateConnections[parentId] || {})[targetId] || {},
                                                        this.calculateConnection(parentEl, childEl, newStateTree))}
                                        )});
        });
        return newStateConnections;
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
        this.startingPos = Object.assign({}, this.state.tree);
        this.startingConn = Object.assign({}, this.state.connections);
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

        const newStateTree = Object.assign({}, this.state.tree, 
                                    {[targetId]: Object.assign({}, this.state.tree[targetId], 
                                                {style: Object.assign({}, this.state.tree[targetId].style, {border: '3px solid green'})})});
        this.setState({tree: newStateTree});
    }
    dragLeave(e) {
        e = e || window.event;
        e.dataTransfer.dropEffect = 'move';
        e.preventDefault();

        const targetId = parseInt(e.currentTarget.id),
              dragId = parseInt(e.target.id);
        if (targetId === this.dragElementId || targetId !== dragId) {return;}

        const newStateTree = Object.assign({}, this.state.tree, 
                                    {[targetId]: Object.assign({}, this.state.tree[targetId], 
                                            {style: Object.assign({}, this.state.tree[targetId].style, {border: '1px solid blue'})})});
        this.lineElement = null;
        this.setState({tree: newStateTree});
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
        
        const targetId = this.dragElementId,
              newStateTree = Object.assign({}, this.state.tree, 
                            {[targetId]: Object.assign({}, this.state.tree[targetId],
                                    {position: Object.assign({}, this.state.tree[targetId].position, 
                                            {left: this.position.left, top: this.position.top})})
        });
        this.dragElement = null;
        this.setState({tree: Object.assign({}, newStateTree), connections: Object.assign({}, this.getLinesCoord(targetId, newStateTree))});
    }
    connectionStart(e) {
        
        e = e || window.event;
        const currentElementId = parseInt(e.currentTarget.parentNode.id),
              previousElementId = this.lineElement == null ? -1 : parseInt(this.lineElement.id);
        let   newStateTree = null;
        this.connectionOn = true;

        // IF FIRST CLICK - opening the line connection
        if (previousElementId === -1) {
            this.lineElement = e.currentTarget.parentNode;
            newStateTree = Object.assign({}, this.state.tree, 
                                    {[currentElementId]: Object.assign({}, this.state.tree[currentElementId], 
                                            {style: {border: '3px solid green'}})
            });
        // IF CLICKED ON THE SAME BOX AGAIN
        } else if (currentElementId === previousElementId) {
            newStateTree = Object.assign({}, this.state.tree, 
                                    {[currentElementId]: Object.assign({}, this.state.tree[currentElementId], 
                                            {style: {border: '1px solid blue'}})
            });
            this.lineElement = null;
        }
        this.setState({tree: newStateTree});
    }
    completeConnection(e) {
        
        if (this.lineElement == null || parseInt(this.lineElement.id) === parseInt(e.currentTarget.parentNode.id)) {return;}
        e = e || window.event;

        let   newStateTree = null,
              newConnections = null;
        const parentId = parseInt(this.lineElement.id),
              parentEl = this.state.tree[parentId],
              childId = parseInt(e.currentTarget.parentNode.id),  
              targetEl = this.state.tree[childId],
              childrenOfParent = this.state.tree[parentId].children,
              parentsOfChild = this.state.tree[childId].parents,
              calcConnectionsObj = this.calculateConnection(parentEl, targetEl);
              
        // update or add children (check for object existance)
        newStateTree = Object.assign({}, this.state.tree, 
                            {[parentId]: Object.assign({}, this.state.tree[parentId], {children: childrenOfParent.indexOf(childId) > -1 ? childrenOfParent : childrenOfParent.concat([childId]), style: {border: '1px solid blue'}})},
                            {[childId]: Object.assign({}, this.state.tree[childId],   {parents:  parentsOfChild.indexOf(parentId) > -1 ?   parentsOfChild   : parentsOfChild.concat([parentId])})
                       });
        // update or add connections (check for object existance)        
        newConnections = Object.assign({}, this.state.connections, 
                                     {[parentId]: Object.assign({}, this.state.connections[parentId] || {},
                                            {[childId]: Object.assign({}, (this.state.connections[parentId] || {})[childId] || {},
                                                    calcConnectionsObj)})}
        );
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
    render() {
        let elementsArr = [];
        //events for boxContainers - move it in WillComponentUpdate
        (() => {
            // BOX CONTAINERS
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
            // LINES
            Object.keys(this.state.connections).forEach((key)=> {
                Object.keys(this.state.connections[key]).forEach((key_)=> {
                    if (this.state.connections[key][key_]) {
                        Object.keys(this.state.connections[key][key_]).forEach((key__)=> {
                        const id = key+key_+key__;
                        elementsArr.push(React.createElement(Line, {key: id, id: id,
                                                                    onLineClick: this.lineClick.bind(this),
                                                                    onLineEnter: this.onLineEnter.bind(this),
                                                                    onLineLeave: this.onLineLeave.bind(this),
                                                                    data: this.state.connections[key][key_][key__]
                                                                    }
                                                            )
                                        )
                        });
                    }
                    
                });
            });            
            // POPUP
            if (this.state.linePopup) {
                elementsArr.push(React.createElement(LinePopup, {key: this.state.linePopup + '_linePopup',
                                                                 data: this.state.linePopup,
                                                                 onLineEnter: this.onLineEnter.bind(this),
                                                                 onLineLeave: this.onLineLeave.bind(this),
                                                                 clickHandler: this.onPopupClick.bind(this)
                                                                }
                                                    )
                                )
            }
        })();

        return React.createElement('div', {className: 'container', 
                                           onDragEnd: this.dragEnd.bind(this), 
                                           onDragOver: this.dragOver.bind(this), 
                                           onClick: this.onPopupOutClick.bind(this), 
                                           onContextMenu: this.rightClick.bind(this)}, null, 
                                    elementsArr);
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
