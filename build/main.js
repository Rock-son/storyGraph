'use strict'

// ONCLICK CONTENT POPUP
const ContentPopup = function (props) {
      const container = {top: props.data.top, left: props.data.left, fontSize: '14px', position: 'absolute', zIndex: 100, width: props.data.width, height: props.data.height},
            header  = {height: '1.7em', border: 'none', color: '#333', backgroundColor: 'lightgrey'},
            content = {position: 'absolute', minHeight: '80%', top: '1.8em', bottom: '1.1em'},
            footer  = {height: '1em'},
            hr = {color: 'lightgrey'},
            // if props.data.target doesn't exist, it's box, else description
            headVal = props.data.target == null ? props.header : "",
            contentVal = props.data.target == null ? props.content : props.description;

      
      return React.createElement('div', {className: 'contentPopup', style: container}, 
                React.createElement('input', {className: 'col-xs-12', style: header, onChange: props.onHeaderChange, value: headVal}, null),
                React.createElement('hr', {style: hr}, null),
                React.createElement('textArea', {className: 'col-xs-12', style: content, onChange: props.onContentChange, value: contentVal}, null),
                React.createElement('hr', {style: hr}, null),
                React.createElement('footer', {style: footer}, null)
             );
};





// CLICK-LINE POPUP
const LinePopup = function(props) {
    const linePopupStyle = {top: props.data.top, left: props.data.left, fontSize: '14px'};

    return (React.createElement('div', {className: 'linePopup', style: linePopupStyle, onMouseEnter: props.onLineEnter, onMouseLeave: props.onLineLeave},
                 React.createElement('div', {action: 'DESCRIBE', style: {cursor: 'pointer', color: 'green'}, className: 'popup-element', onClick: props.onPopupClick}, 'DESCRIBE'),
                 React.createElement('hr',  {style: {margin: '1px'}}, null),
                 React.createElement('div', {action: 'DELETE', style: {cursor: 'pointer', color: 'red'}, className: 'popup-element', onClickCapture: props.onPopupClick}, 'DELETE')
    ));
};
// CONNECTING LINES
const Line = function(props) {
    const lineStyle = {width: props.data.w, top: props.data.top, left: props.data.left, position: 'absolute', zIndex: 0, msTransform: "rotate(" + props.data.deg + "deg)", 
                        WebkitTransform: "rotate(" + props.data.deg + "deg)", transform: "rotate(" + props.data.deg + "deg)"};
    let descriptionElement = null;

    if (props.data.description != null) {
        descriptionElement = React.createElement('div',
                                        {key: props.id + '_desc',
                                         className: 'desc-element',
                                         onClick: props.onContentClick,
                                         title: props.data.description.text,
                                         style: {top: props.data.description.top,
                                                 left: props.data.description.left,
                                                 position: 'absolute',
                                                 zIndex: 1,
                                                 width: '100px',
                                                 maxHeight: '100px',
                                                 minHeight:'20px',
                                                 borderRadius: '5px'}
                                        }, props.data.description.text);
    } else {
        descriptionElement = null;
    }
        
    return (React.createElement('div', null, null,
                React.createElement('hr', {className: 'line', style: lineStyle, onClick: props.onLineClick, onMouseEnter: props.onLineEnter, onMouseLeave: props.onLineLeave}, null),
                descriptionElement
    ));
}
// HEADER
const Header = function(props) {
    const headerStyle = {backgroundColor: 'blue', borderBottom: '1px', borderBottomColor: 'cyan', color: 'white'},
          closeBtnStyle = {width: '17px', height: '15px', lineHeight: '8px', border: '1px outset white', color: 'white', 
                            backgroundColor: 'red', float: 'right', paddingLeft: '3px'}; // if not changing, maybe put it in the style.css file

    return (React.createElement('div', {className: props.className, onClick: props.completeConnection, style: headerStyle}, props.header,
                React.createElement('div', {className: 'closeBtn', style: closeBtnStyle, onClick: props.deleteContainer}, 'x')
    ));
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
          
    return (React.createElement('div', {id: props.id + '_',
                                        className: 'boxContainer', 
                                        style: boxStyle, 
                                        draggable: true, 
                                        onDragStart: props.dragStart,
                                        onDragEnter: props.dragEnter,
                                        onDragLeave: props.dragLeave,
                                        onDrop: props.dragDrop,
                                        onMouseUp: props.changeBoxSize},
                // HEADER, TEXT AND LINE COMPONENT!
                React.createElement(Header, {header: header, className: 'header', completeConnection: props.completeConnection, deleteContainer: props.deleteContainer}, null),
                React.createElement('div', {className: 'contentCont'},
                    React.createElement('div', {className: 'content', onClick: props.onContentClick}, content)),
                React.createElement('div', {className: 'addHr', onClick: props.connectionStart, title: 'Click to connect boxes!'},'+')
              )
     );
};

//main component: Higher Order Component - HOC
class MainComponent extends React.Component {
    constructor(props) {
        super(props);
        this.dragElementId = -1;
        this.lineElementId = -1;
        this.dragElement = null;        
        this.startingPos = null;
        this.startingConn = null;
        this.connectionOn = false;
        this.dropped = false;
        this.position = {};
        this.state = {tree: this.props.storage, connections: this.props.connections, linePopup: null, popup: null, contentPopup: null};
        //helper functions
        this.deepClone = this.deepClone.bind(this);
        this.getLinesCoord = this.getLinesCoord.bind(this);
        this.calculateConnection = this.calculateConnection.bind(this);
    }
    componentDidMount () {
        document.getElementsByClassName('container')[0].focus();
    }
    componentWillUnmount() {
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
    onHeaderChange(parent, target, e) {
               
        if (target == null) {
            this.setState({tree: Object.assign({}, this.state.tree,  
                                            {[parent]: Object.assign({}, this.state.tree[parent], 
                                                    {header: e.target.value})})                                                
                          });
        }
    }
    onContentChange(parent, target, e) {
        // if target is null, change content
        if (target == null) {
            this.setState({tree: Object.assign({}, this.state.tree,  
                                            {[parent]: Object.assign({}, this.state.tree[parent], 
                                                    {content: e.target.value})
                          })
            })            
        // if target not null, change description!
        } else if (target != null) {
            const parentEl = this.state.tree[parent],
                  childEl  = this.state.tree[target],            
                  treeUpdate = Object.assign({}, this.state.tree,  
                                            {[parent]: Object.assign({}, this.state.tree[parent], 
                                                    {description: Object.assign({}, this.state.tree[parent].description, 
                                                            {[target]: Object.assign({}, this.state.tree[parent].description[target], {text: e.target.value})})                                                
                                            }
                            )}
                );
                this.setState({tree: treeUpdate, 
                               connections: Object.assign({}, this.state.connections, 
                                          {[parent]: Object.assign({}, this.state.connections[parent], 
                                                    {[target]: this.calculateConnection(parentEl, childEl, treeUpdate)})})
            });
        }
    }
    deleteContainer(delete_Id, e) {
        // pure functions exercise
        console.log(this.state.tree[delete_Id].parents.reduce((cummulative, parentId) => Object.assign(cummulative, 
                                                        {[parentId]: Object.assign({}, Object.keys(this.state.connections[parentId]) // get all parent connections
                                                                                   .filter(id => id !== delete_Id)                // filter the deleted one
                                                                                   .reduce((cummulative, parents_Id) => Object.assign(cummulative, {[parents_Id]: this.state.tree[parentId][parents_Id]}), {})                                                                                    
                                                                                  )}, {})));
                                                                                  return;

        this.setState(
            
            {tree: Object.assign({}, Object.keys(this.state.tree)
                                                .filter(id => +id !== +delete_Id)
                                                .reduce((cummulative, parentId) => Object.assign(cummulative, {[parentId]: this.state.tree[parentId]}), {})
                                                            
                                                            
                                                            
                                                            ),
            // delete children connections (by deleting main connection) and check and delete all parent ones too!
            connections: Object.assign({}, Object.keys(this.state.connections)
                                                .filter(id => +id !== +delete_Id)
                                                .reduce((cummulative, parentId) => Object.assign(cummulative, {[parentId]: this.state.connections[parentId]}), {}),
                                            this.state.tree[delete_Id].parents
                                                .reduce((cummulative, parentId) => Object.assign(cummulative, 
                                                        {[parentId]: Object.assign({}, Object.keys(this.state.connections[parentId]) // get all parent connections
                                                                                   .filter(id => id !== delete_Id)                // filter the deleted one
                                                                                   .reduce((cummulative, parents_Id) => Object.assign(cummulative, {[parents_Id]: this.state.tree[parentId][parents_Id]}), {})                                                                                    
                                                                                  )}, {})))
                                    
        });        
    }
    lineClick(parent, target, e) {
        e = e || window.event;
        e.preventDefault();
        e.stopPropagation();

        this.setState({linePopup: Object.assign({}, {parent, target, top: (e.pageY - 10) + 'px', left:(e.pageX - 50) + 'px'})});
        /*
        if (this.state.connections[parent][target]['b'].description == null) {            
            this.setState({linePopup: Object.assign({}, {parent, target, top: (e.pageY - 10) + 'px', left:(e.pageX - 50) + 'px'})});
        } else {
             
        }*/
    }
    onLineEnter(parent, child, e) {
        if (this.connectionOn) {return;}

        const parentId = parseInt(parent),
              childId = parseInt(child),
              newStateTree = Object.assign({}, this.state.tree, 
                                    {[parentId]: Object.assign({}, this.state.tree[parentId], {style: {border: '3px solid blue'}})},
                                    {[childId]:  Object.assign({}, this.state.tree[childId],  {style: {border: '3px solid blue'}})
            });
        this.setState({tree: Object.assign({}, newStateTree)});
    }
    onLineLeave(parent, target, e) {
        if (this.connectionOn) {return;}
        e = e || window.event;
        e.stopPropagation();
        const parentId = parseInt(parent),
              targetId = parseInt(target),
              newStateTree = Object.assign({}, this.state.tree, 
                                    {[parentId]: Object.assign({}, this.state.tree[parentId], {style: {border: '1px solid blue'}})},
                                    {[targetId]: Object.assign({},  this.state.tree[targetId],  {style: {border: '1px solid blue'}})
            });
        this.setState({tree: Object.assign({}, newStateTree)});
    }
    onContentClick(obj, e) {
        e = e || window.event;
        e.stopPropagation();
        if (obj.description != null) {
            this.setState({contentPopup: Object.assign({}, {parent: obj.description[0], target: obj.description[1], data: this.state.tree[obj.description[0]], top: (e.pageY) + 'px', left:(e.pageX - 50) + 'px', width: '20vw', height: '10vh'})});
        } else {
            this.setState({contentPopup: Object.assign({}, {parent: obj.content, target: null, data: this.state.tree[obj.content], top: (e.pageY - 10) + 'px', left:(e.pageX - 250) + 'px', width: '60vw', height: '40vh'})});
        }
    }
    // TODO: no need yet
    onKeyDown(e) {
        e = e || window.event;
        //console.log(e.shiftKey);
    }
    // DESCRIBE, DELETE actions
    onPopupClick(parent, target, e) {
        e = e || window.event;

        const parentId = parseInt(parent),
              childId = parseInt(target),
              action = e.currentTarget.getAttribute('action');
              
        switch(action) {
            case 'DELETE':
                const updateConnections = Object.assign({}, this.state.connections, {[parentId]: Object.assign({}, this.state.connections[parentId], {[childId]: null})}),
                      childsParents = this.state.tree[childId].parents,
                      parentsChildren = this.state.tree[parentId].children,
                      updateTree = Object.assign({}, this.state.tree, 
                                        {[parentId]: Object.assign({}, this.state.tree[parentId], 
                                                    {children: parentsChildren.filter((child) => child !== childId),  // parent looses a child
                                                     description: Object.assign({}, this.state.tree[parentId].description, {[childId]: null}), // lose description for a child
                                                     style: {border: '1px solid blue'}})},
                                        {[childId] : Object.assign({}, this.state.tree[childId], {parents: childsParents.filter((parent) => parent !== parentId), style: {border: '1px solid blue'}})   // child looses a parent
                                   });
                                   
                this.setState({linePopup: null, connections: updateConnections, tree: updateTree});
                break;
            case 'DESCRIBE':
                const contentPopup = Object.assign({}, {parent: parentId, target: childId, data: this.state.tree[parentId], top: (e.pageY) + 'px', left:(e.pageX - 50) + 'px', width: '20vw', height: '10vh'});
       
                this.setState({linePopup: null, contentPopup});
                break;
            default:
                this.setState({linePopup: null});
        } 
    }
    onPopupOutClick(e) {
        if (e.target.getAttribute('class') === 'container') {
            this.setState({linePopup: null, contentPopup: null});
        }        
    }
    changeBoxSize(target, e) {
        if (this.connectionOn || this.dragElement != null) {return;}

        e = e || window.event;
        const targetId = parseInt(target),
              newStateTree = Object.assign({}, this.state.tree, 
                            {[targetId]: Object.assign({}, this.state.tree[targetId],
                                        {size: Object.assign({}, this.state.tree[targetId].size, {width: e.currentTarget.getBoundingClientRect().width, height: e.currentTarget.getBoundingClientRect().height})})
        });
        
        this.setState({tree: Object.assign({}, newStateTree), connections: Object.assign({}, this.getLinesCoord(targetId, newStateTree))});
    }
    // update lines after moving a boxContainer
    getLinesCoord(targetId, stateTree) {

        let   newStateConnections = Object.assign({}, this.state.connections);
        const children = this.state.tree[targetId].children,
              parents = this.state.tree[targetId].parents;  

        children.forEach((childId) => {
            const parentEl = Object.assign({}, stateTree[targetId]),
                  childEl  = Object.assign({}, stateTree[childId]);
            newStateConnections = Object.assign({}, newStateConnections || {}, 
                                        {[targetId]: Object.assign({}, (newStateConnections || {})[targetId] || {}, 
                                                {[childId]: Object.assign({}, ((newStateConnections || {})[targetId] || {})[childId] || {},
                                                        this.calculateConnection(parentEl, childEl, stateTree))}
                                        )});           
        });
        parents.forEach((parentId) => {
            const parentEl = stateTree[parentId],
                  childEl = stateTree[targetId];
            newStateConnections = Object.assign({}, newStateConnections || {}, 
                                        {[parentId]: Object.assign({}, (newStateConnections|| {})[parentId] || {}, 
                                                {[targetId]: Object.assign({}, ((newStateConnections || {})[parentId] || {})[targetId] || {},
                                                        this.calculateConnection(parentEl, childEl, stateTree))}
                                        )});            
        });
        return newStateConnections;
    }
    dragStart(parent, e) {
        e = e || window.event;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData("text/html", e.currentTarget);   // Firefox requires calling dataTransfer.setData for the drag to properly work

        this.dragElementId = parseInt(parent);
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
    dragEnter(target, e) {
        e = e || window.event;
        e.dataTransfer.dropEffect = 'move';
        
        const targetId = parseInt(target);
        if (targetId === this.dragElementId) {return;}

        const newStateTree = Object.assign({}, this.state.tree, 
                                    {[targetId]: Object.assign({}, this.state.tree[targetId], 
                                                {style: Object.assign({}, this.state.tree[targetId].style, {border: '3px solid green'})})});
        this.setState({tree: newStateTree});
    }
    dragLeave(target, e) {
        e = e || window.event;
        e.dataTransfer.dropEffect = 'move';
        e.preventDefault();
        
        const targetId = parseInt(target),
              dragId = parseInt(e.target.id);
        if (targetId === this.dragElementId || targetId !== dragId) {return;}
        
        const newStateTree = Object.assign({}, this.state.tree, 
                                    {[targetId]: Object.assign({}, this.state.tree[targetId], 
                                            {style: Object.assign({}, this.state.tree[targetId].style, {border: '1px solid blue'})})});                                            
        this.lineElementId = -1;
        this.setState({tree: newStateTree});
    }
    //for switching boxContainers positions *** TODO - pure function!
    switchContainers(target, e) {
        
        const cloneState = this.deepClone(this.state.tree),
              cloneState_ = this.deepClone(this.state.tree),
              draggedId = this.dragElementId,
              targetId = parseInt(target);
              
        cloneState_[targetId] = Object.assign({}, cloneState[targetId], {header: cloneState[draggedId].header, content: cloneState[draggedId].content, style: {border: '1px solid blue'}});
        cloneState_[draggedId] = Object.assign({}, cloneState[draggedId], {header: cloneState[targetId].header, content: cloneState[targetId].content});
        this.dropped = true;
        this.dragElement = null;
        this.setState({tree: Object.assign({}, cloneState, cloneState_)});
    }
    // for moving boxContainers elements
    dragEnd(e) {
        if (this.dropped) {return;}
        e.stopPropagation();
        const targetId = this.dragElementId,
              newStateTree = Object.assign({}, this.state.tree, 
                            {[targetId]: Object.assign({}, this.state.tree[targetId],
                                    {position: Object.assign({}, this.state.tree[targetId].position, 
                                            {left: this.position.left, top: this.position.top})})
        });

        this.dragElement = null;
        this.setState({tree: Object.assign({}, newStateTree), connections: Object.assign({}, this.getLinesCoord(targetId, newStateTree))});
    }
    connectionStart(currentElId, e) {
        
        e = e || window.event;
        const currentElementId = parseInt(currentElId),
              previousElementId = parseInt(this.lineElementId);
        let   newStateTree = null;
        this.connectionOn = true;

        // IF FIRST CLICK - opening the line connection
        if (previousElementId === -1) {
            this.lineElementId = currentElementId;
            newStateTree = Object.assign({}, this.state.tree, 
                                    {[currentElementId]: Object.assign({}, this.state.tree[currentElementId], 
                                    {style: Object.assign({}, this.state.tree[currentElementId].style, {border: '3px solid green'})})
            });
        // IF CLICKED ON THE SAME BOX AGAIN
        } else if (currentElementId === previousElementId) {
            newStateTree = Object.assign({}, this.state.tree, 
                                    {[currentElementId]: Object.assign({}, this.state.tree[currentElementId], 
                                            {style: Object.assign({}, this.state.tree[currentElementId].style, {border: '1px solid blue'})})
            });
            this.lineElementId = -1;
        }
        this.setState({tree: newStateTree});
    }
    completeConnection(currentElId, e) {
        
        if (this.lineElementId === -1 || parseInt(this.lineElementId) === parseInt(currentElId)) {return;}
        e = e || window.event;

        let   newStateTree = null,
              newConnections = null;
        const parentId = parseInt(this.lineElementId),
              parentEl = this.state.tree[parentId],
              childId = parseInt(currentElId),  
              targetEl = this.state.tree[childId],
              childrenOfParent = this.state.tree[parentId].children,
              parentsOfChild = this.state.tree[childId].parents,
              calcConnectionsObj = this.calculateConnection(parentEl, targetEl);
              
        // update or add children (check for object existance)
        newStateTree = Object.assign({}, this.state.tree, 
                            {[parentId]: Object.assign({}, this.state.tree[parentId], 
                                    {children: childrenOfParent.indexOf(childId) > -1 ? childrenOfParent : [].concat([], childrenOfParent, [childId]), 
                                            style: Object.assign({}, this.state.tree[parentId].style, {border: '1px solid blue'})})},
                            {[childId]: Object.assign({}, this.state.tree[childId],   {parents:  parentsOfChild.indexOf(parentId) > -1 ?   parentsOfChild   : [].concat([], parentsOfChild, [parentId])})
                       });
        // update or add connections (check for object existance)        
        newConnections = Object.assign({}, this.state.connections, 
                                     {[parentId]: Object.assign({}, this.state.connections[parentId] || {},
                                            {[childId]: Object.assign({}, (this.state.connections[parentId] || {})[childId] || {},
                                                    calcConnectionsObj)})}
        );
        this.lineElementId = -1;
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
                    deg: 90 };
        let   b = { top:  (parseInt(parentRect.top) + parseInt(parentRect.height) + (aLen / 2)) + 'px',
                    left: (parseInt(parentRect.left) + (parseInt(parentRect.width) / 2) + (bLen < 0 ? bLen : 0)) + 'px',
                    w: (Math.abs(bLen) + 2) + 'px',
                    deg: 0 };
        const c = { top:  (parseInt(parentRect.top) + parseInt(parentRect.height) + (aLen/2) + (cLen / 2)) + 'px',
                    left: (parseInt(b.left) + ((bLen < 0 ? 0 : bLen)) - (cLen < 0 ? (-cLen/2) : (cLen/2))) + 'px',
                    w: (Math.abs(cLen) + 5) + 'px',
                    deg: 90 };
            
        if ((newStateTree[parent.id].description || {})[target.id] != null) {
            // add the description object location data
            b = Object.assign({}, b, {description: {top: b.top,
                                                    left: bLen > 0 ? ((parseInt(b.left) + (parseInt(b.w)) - 50) +'px') : ((parseInt(b.left) - 50) +'px'),
                                                    text: newStateTree[parent.id].description[target.id].text
                                                    }
            });
        }        
        return {a, b, c};
    }
    render() {
        let elementsArr = [];
        (() => {
            // BOX CONTAINERS
            for (const parentId in this.state.tree) {
                 if (this.state.tree.hasOwnProperty( parentId )) {
                    const boxElement = this.state.tree[parentId];
                    elementsArr.push(React.createElement(BoxContainer, {key: parentId,
                                                                        id: parentId,
                                                                        boxElement: boxElement,
                                                                        dragStart: this.dragStart.bind(this, parentId),
                                                                        dragEnter: this.dragEnter.bind(this, parentId),
                                                                        dragLeave: this.dragLeave.bind(this, parentId),
                                                                        dragDrop: this.switchContainers.bind(this, parentId),
                                                                        changeBoxSize: this.changeBoxSize.bind(this, parentId),
                                                                        onContentClick: this.onContentClick.bind(this, {content: parentId}),
                                                                        connectionStart: this.connectionStart.bind(this, parentId),                                                                        
                                                                        completeConnection: this.completeConnection.bind(this, parentId),
                                                                        deleteContainer: this.deleteContainer.bind(this, parentId),
                                                                        rightClick: this.rightClick.bind(this)}, null));
                 }
            }
            // LINES
            Object.keys(this.state.connections || []).forEach(( parentId )=> {
                Object.keys(this.state.connections[ parentId ] || []).forEach(( targetId )=> {
                        Object.keys(this.state.connections[ parentId ][ targetId ] || []).forEach(( lineNr )=> {
                        const id = parentId + targetId + lineNr;
                        elementsArr.push(React.createElement(Line, {key: id,
                                                                    onLineClick: this.lineClick.bind(this, parentId, targetId),
                                                                    onLineEnter: this.onLineEnter.bind(this, parentId, targetId),
                                                                    onLineLeave: this.onLineLeave.bind(this, parentId, targetId),
                                                                    onContentClick: this.onContentClick.bind(this, {description: [ parentId, targetId ]}),
                                                                    data: this.state.connections[ parentId ][ targetId ][ lineNr ]
                                                                    }
                                                            )
                                        )
                        });
                });
            });            
            // LINE_POPUP
            if (this.state.linePopup) {
                const parent = this.state.linePopup.parent,
                      target = this.state.linePopup.target;
                elementsArr.push(React.createElement(LinePopup, {key: 'linePopup',
                                                                 data: this.state.linePopup,
                                                                 onLineEnter: this.onLineEnter.bind(this, parent, target),
                                                                 onLineLeave: this.onLineLeave.bind(this, parent, target),
                                                                 onPopupClick: this.onPopupClick.bind(this, parent, target)
                                                                }
                                                    )
                                )
            }
            // CONTENT_POPUP
            if (this.state.contentPopup) {
                const parentId = this.state.contentPopup.parent,
                      targetId = this.state.contentPopup.target;                      
                elementsArr.push(React.createElement(ContentPopup, {key: 'contentPopup',
                                                                    data: this.state.contentPopup,
                                                                    header: this.state.tree[ parentId ].header,
                                                                    content: this.state.tree[ parentId ].content,
                                                                    description: this.state.tree[ parentId ].description[ targetId ] == null ? null : this.state.tree[ parentId ].description[ targetId ].text,
                                                                    onHeaderChange: this.onHeaderChange.bind(this, parentId, targetId),                                                                    
                                                                    onContentChange: this.onContentChange.bind(this, parentId, targetId)
                                                                    }
                                                    )
                                )
            }
        })();
        // CONTAINER
        return React.createElement('div', {className: 'container',
                                           tabIndex: 1,
                                           onDragEnd: this.dragEnd.bind(this),
                                           onDragOver: this.dragOver.bind(this),
                                           onClick: this.onPopupOutClick.bind(this),
                                           onKeyDown: this.onKeyDown.bind(this),
                                           onContextMenu: this.rightClick.bind(this)}, null,
                                    elementsArr );
    }
}
let connections = {
    
    0: {
        1: {
            a: {top: "150px", left: "750px", w: "20px",  deg: 90},
            b: {top: "160px", left: "760px", w: "280px", deg:  0, description: {top: '160px', left: '990px', text: 'testiranje'}},
            c: {top: "218.5px", left: "979.5px", w: "122px", deg: 90}
        }
    }
    
};

let storage = {
    0: {
        id: 0,
        parents: [],
        children: [1],
        header:"header0", 
        content: "option",
        style: {border: '1px solid blue'},
        position: {left: '700px', top: '50px'},
        size: {width: '120px', height: '100px'},
        description: {1: {text: "testiranje"}}
     },
     1: {
        id: 1,
        parents: [0],
        children: [],
        header:"header1", 
        content: "option 1",
        style: {border: '1px solid blue'},
        position: {left: '978px', top: '287px'},
        size: {width: '120px', height: '100px'},
        description: {}
     }, 
     2: { 
        id: 2,
        parents: [],
        children: [],
        header:"header2", 
        content: "option 2",
        style: {border: '1px solid blue'},
        position: {left: '390px', top: '260px'},
        size: {width: '120px', height: '100px'},
        description: {}
     }, 
     3: { 
        id: 3,
        parents: [],
        children: [],
        header:"header3", 
        content: 'option 3',
        style: {border: '1px solid blue'},
        position: {left: '250px', top: '260px'},
        size: {width: '120px', height: '100px'},
        description: {}
     }
};


document.addEventListener("DOMContentLoaded", function(e) {
    ReactDOM.render(React.createElement(MainComponent, {storage, connections}, null), document.getElementById('root'));
}); 

/*{storage: JSON.parse(<?php json_encode($php_storage_object)) ?>), connections: JSON.parse(<?php json_encode($php_storage_object)) ?>)}*/