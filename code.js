// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).
// This shows the HTML page in "ui.html".
figma.showUI(__html__);
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = (msg) => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    // if (msg.type === 'create-rectangles') {
    //   const nodes: SceneNode[] = [];
    //   for (let i = 0; i < msg.count; i++) {
    //     const rect = figma.createRectangle();
    //     rect.x = i * 150;
    //     rect.fills = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];
    //     figma.currentPage.appendChild(rect);
    //     nodes.push(rect);
    //   }
    //   figma.currentPage.selection = nodes;
    //   figma.viewport.scrollAndZoomIntoView(nodes);
    // }
    if (msg.type === "randomize") {
        if (msg.shouldConfine) {
            for (const node of figma.currentPage.selection) {
                if ("x" in node && "y" in node && "width" in node && "height" in node) {
                    const options = Object.assign(Object.assign({}, msg), { confineX: { min: node.x, max: node.x + node.width }, confineY: { min: node.y, max: node.y + node.height } });
                    console.log(options);
                    randomizeAll([node], options);
                }
            }
        }
        else {
            const options = Object.assign(Object.assign({}, msg), { confineX: {
                    min: Number.NEGATIVE_INFINITY,
                    max: Number.POSITIVE_INFINITY,
                }, confineY: {
                    min: Number.NEGATIVE_INFINITY,
                    max: Number.POSITIVE_INFINITY,
                } });
            randomizeAll(figma.currentPage.selection, options);
        }
    }
    if (msg.type === "done") {
        figma.closePlugin();
    }
};
function randomizeAll(nodeArray, options) {
    for (const node of nodeArray) {
        if (node.type === "VECTOR") {
            randomize(node, options);
        }
        else if ("children" in node) {
            randomizeAll(node.children, options);
        }
    }
}
function randomize(node, options) {
    const vectorNetwork = clone(node.vectorNetwork);
    const relConfineX = {
        min: options.confineX.min - node.x,
        max: options.confineX.max - node.x,
    };
    const relConfineY = {
        min: options.confineY.min - node.y,
        max: options.confineY.max - node.y,
    };
    vectorNetwork.vertices.forEach((vectorVertex) => {
        console.log(vectorVertex.y, relConfineY, options.yDelta);
        vectorVertex.x = Math.max(Math.min(vectorVertex.x + (Math.random() * 2 - 1) * options.xDelta, relConfineX.max), relConfineX.min);
        vectorVertex.y = Math.max(Math.min(vectorVertex.y + (Math.random() * 2 - 1) * options.yDelta, relConfineY.max), relConfineY.min);
        console.log(vectorVertex.y);
    });
    node.vectorNetwork = vectorNetwork;
}
function clone(val) {
    return JSON.parse(JSON.stringify(val));
}
