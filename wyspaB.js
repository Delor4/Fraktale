/**
 * Created by Delor on 2015-03-25.
 */
var canvas;
var gl;

var cubeVerticesBuffer;
var cubeVerticesColorBuffer;
//var cubeVerticesIndexBuffer;
var cubeVerticesIndexBuffer;
var cubeRotation = 0.0;
var cubeXOffset = 0.0;
var cubeYOffset = 0.0;
var cubeZOffset = 0.0;
var lastCubeUpdateTime = 0;
var xIncValue = 0.2;
var yIncValue = -0.4;
var zIncValue = 0.3;

var mvMatrix;
var shaderProgram;
var vertexPositionAttribute;
var vertexColorAttribute;
var perspectiveMatrix;

var S=0.8;
var Stopien=5;
var tab2;
var numWierzch;
var obrot=0;
var woda=0;
//
// start
//
// Called when the canvas is created to get the ball rolling.
//
function start() {
    canvas = document.getElementById("glcanvas");

    initWebGL(canvas);      // Initialize the GL context

    // Only continue if WebGL is available and working

    if (gl) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        gl.clearDepth(1.0);                 // Clear everything
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

        // Initialize the shaders; this is where all the lighting for the
        // vertices and so forth is established.

        initShaders();

        // Here's where we call the routine that builds all the objects
        // we'll be drawing.

        initBuffers();

        // Set up to draw the scene periodically.

        setInterval(drawScene, 15);
    }
}

//
// initWebGL
//
// Initialize WebGL, returning the GL context or null if
// WebGL isn't available or could not be initialized.
//
function initWebGL() {
    gl = null;

    try {
        gl = canvas.getContext("experimental-webgl");
    }
    catch(e) {
    }

    // If we don't have a GL context, give up now

    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
    }
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just have
// one object -- a simple two-dimensional cube.
//
function initBuffers() {

    // Create a buffer for the cube's vertices.

    cubeVerticesBuffer = gl.createBuffer();

    // Select the cubeVerticesBuffer as the one to apply vertex
    // operations to from here out.

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);

    // Now create an array of vertices for the cube.

    var vertices = [];
    var generatedColors = [];
    var cubeVertexIndices = [];
    var points=0;

    var maxst=Math.pow(2,Stopien-1);
    var maxz=0;
    var minz=0;

    for(var x=0;x<=(maxst);x++){
        for(var y=0;y<=(maxst);y++){
            if(maxz<tab2[x][y]) maxz=tab2[x][y];
            if(minz>tab2[x][y]) minx=tab2[x][y];
        }

    }
    var zmin=maxz*woda/100;
    var delta=maxz-zmin;
    for(var x=0;x<(maxst);x++){
        for(var y=0;y<(maxst);y++){

            var wart=tab2[x][y];
            wart=wart>zmin?(wart-zmin):0;
            vertices.push((x/maxst)-0.5,(y/maxst)-0.5,wart);

            var wart2=tab2[x+1][y];
            wart2=wart2>zmin?(wart2-zmin):0;
//            wart2=wart2>0?wart2:0;
            vertices.push(((x+1)/maxst)-0.5,(y/maxst)-0.5,wart2);

            var wart3=tab2[x+1][y+1];
            wart3=wart3>zmin?(wart3-zmin):0;
            //wart3=wart3>0?wart3:0;
            vertices.push(((x+1)/maxst)-0.5,((y+1)/maxst)-0.5,wart3);

            var wart4=tab2[x][y+1];
            wart4=wart4>zmin?(wart4-zmin):0;

//            wart4=wart4>0?wart4:0;
            vertices.push((x/maxst)-0.5,(y/maxst)-0.5,wart);
            vertices.push(((x+1)/maxst)-0.5,((y+1)/maxst)-0.5,wart3);
            vertices.push((x/maxst)-0.5,((y+1)/maxst)-0.5,wart4);

            if(wart==0 && wart2==0 && wart3==0 ){
                generatedColors.push(0.0,0.0,1.0,1.0);
                generatedColors.push(0.0,0.0,1.0,1.0);
                generatedColors.push(0.0,0.0,1.0,1.0);
            }else{
                var cz=wart/delta;
                generatedColors.push(cz,cz,cz,1.0);
                cz=wart2/delta;
                generatedColors.push(cz,cz,cz,1.0);
                cz=wart3/delta;
                generatedColors.push(cz,cz,cz,1.0);
            }
            if(wart==0 && wart3==0 && wart4==0 ){
                generatedColors.push(0.0,0.0,1.0,1.0);
                generatedColors.push(0.0,0.0,1.0,1.0);
                generatedColors.push(0.0,0.0,1.0,1.0);
            }else{
                var cz=wart/delta;
                generatedColors.push(cz,cz,cz,1.0);
                cz=wart3/delta;
                generatedColors.push(cz,cz,cz,1.0);
                cz=wart4/delta;
                generatedColors.push(cz,cz,cz,1.0);
            }

            cubeVertexIndices.push(points+0, points+1, points+2,   points+3, points+4, points+5);
            points+=6;

        }
    }
    numWierzch=cubeVertexIndices.length;
    // Now pass the list of vertices into WebGL to build the shape. We
    // do this by creating a Float32Array from the JavaScript array,
    // then use it to fill the current vertex buffer.

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Now set up the colors for the faces. We'll use solid colors
    // for each face.

    cubeVerticesColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(generatedColors), gl.STATIC_DRAW);

    // Build the element array buffer; this specifies the indices
    // into the vertex array for each face's vertices.

    cubeVerticesIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.

    // Now send the element array to GL

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
}

//
// drawScene
//
// Draw the scene.
//
function drawScene() {
    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Establish the perspective with which we want to view the
    // scene. Our field of view is 45 degrees, with a width/height
    // ratio of 640:480, and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    perspectiveMatrix = makePerspective(45, 640.0/480.0, 0.1, 100.0);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.

    loadIdentity();

    // Now move the drawing position a bit to where we want to start
    // drawing the cube.

    mvTranslate([-0.0, 0.0, -2.0]);

    mvRotate(-45, [1, 0, 0]);
    //mvTranslate([-0.5, -0.5, 0.0]);
    // Save the current matrix, then rotate before we draw.

    mvPushMatrix();
    //mvRotate(cubeRotation, [1, 0, 1]);
    //mvTranslate([cubeXOffset, cubeYOffset, cubeZOffset]);
    mvRotate(obrot, [0, 0, 1]);



    // Draw the cube by binding the array buffer to the cube's vertices
    // array, setting attributes, and pushing it to GL.

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    // Set the colors attribute for the vertices.

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesColorBuffer);
    gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

    // Draw the cube.

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, numWierzch, gl.UNSIGNED_SHORT, 0);

    // Restore the original matrix

    mvPopMatrix();

    // Update the rotation for the next draw, if it's time to do so.

    var currentTime = (new Date).getTime();
    if (lastCubeUpdateTime) {
        var delta = currentTime - lastCubeUpdateTime;

        cubeRotation += (30 * delta) / 1000.0;
        //cubeXOffset += xIncValue * ((30 * delta) / 1000.0);
        //cubeYOffset += yIncValue * ((30 * delta) / 1000.0);
        //cubeZOffset += zIncValue * ((30 * delta) / 1000.0);

        if (Math.abs(cubeYOffset) > 2.5) {
            xIncValue = -xIncValue;
            yIncValue = -yIncValue;
            zIncValue = -zIncValue;
        }
    }

    lastCubeUpdateTime = currentTime;
}

//
// initShaders
//
// Initialize the shaders, so WebGL knows how to light our scene.
//
function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    // Create the shader program

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
    }

    gl.useProgram(shaderProgram);

    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);

    vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(vertexColorAttribute);
}

//
// getShader
//
// Loads a shader program by scouring the current document,
// looking for a script with the specified ID.
//
function getShader(gl, id) {
    var shaderScript = document.getElementById(id);

    // Didn't find an element with the specified ID; abort.

    if (!shaderScript) {
        return null;
    }

    // Walk through the source element's children, building the
    // shader source string.

    var theSource = "";
    var currentChild = shaderScript.firstChild;

    while(currentChild) {
        if (currentChild.nodeType == 3) {
            theSource += currentChild.textContent;
        }

        currentChild = currentChild.nextSibling;
    }

    // Now figure out what type of shader script we have,
    // based on its MIME type.

    var shader;

    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;  // Unknown shader type
    }

    // Send the source to the shader object

    gl.shaderSource(shader, theSource);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

//
// Matrix utility functions
//

function loadIdentity() {
    mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
    mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
    multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
    var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

    var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}

var mvMatrixStack = [];

function mvPushMatrix(m) {
    if (m) {
        mvMatrixStack.push(m.dup());
        mvMatrix = m.dup();
    } else {
        mvMatrixStack.push(mvMatrix.dup());
    }
}

function mvPopMatrix() {
    if (!mvMatrixStack.length) {
        throw("Can't pop from an empty matrix stack.");
    }

    mvMatrix = mvMatrixStack.pop();
    return mvMatrix;
}

function mvRotate(angle, v) {
    var inRadians = angle * Math.PI / 180.0;

    var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
    multMatrix(m);
}
function LiczeChmurke(stopien, krok, maxst){
    stopien--;
    if(stopien>0){
        //liczymy chmurkę
        //faza 1
        for (var x = krok; x < maxst; x += krok*2) {
            for (var y = krok; y < maxst; y += krok*2) {
                var d = S * Math.sqrt(krok / maxst);
                var r = Math.random() + Math.random() + Math.random() - 1.5;
                tab[x][y] = d * r + (tab[x - krok][y - krok] + tab[x - krok][y + krok] + tab[x + krok][y - krok] + tab[x + krok][y + krok]) / 4;
            }
        }
        //faza 2
        for (var x = 0; x <= maxst; x += krok) {
            for (var y = 0; y <= maxst; y += krok) {
                if(tab[x][y]!==undefined) continue;
                var d = S * Math.sqrt(krok / maxst);
                var r = Math.random() + Math.random() + Math.random() - 1.5;
                var val = 0;
                var ile = 0;
                if ((x - krok) >= 0 ) {
                    val += tab[x - krok][y];
                    ile++;
                }
                if ((x + krok) <= maxst ) {
                    val += tab[x + krok][y];
                    ile++;
                }
                if ( (y + krok) <= maxst) {
                    val += tab[x][y + krok];
                    ile++;
                }
                if ((y - krok) >= 0) {
                    val += tab[x][y - krok];
                    ile++;
                }
                val /= ile;
                val += d * r;

                tab[x][y]=val;
            }
        }
        LiczeChmurke(stopien,krok/2,maxst);
    }
}

 function LiczChmurke(){

    tab=[];
    for(var i=0;i<=Math.pow(2,Stopien-1);i++){
        tab[i]=[];
    }
    tab[0][0]=0;
    tab[0][Math.pow(2,Stopien-1)]=0;
    tab[Math.pow(2,Stopien-1)][0]=0;
    tab[Math.pow(2,Stopien-1)][Math.pow(2,Stopien-1)]=0;
    LiczeChmurke(Stopien, Math.pow(2,Stopien-2), Math.pow(2,Stopien-1));
    tab2=tab;
}
window.onload = function(){

    document.getElementById("sval").onchange = function(){
        S=this.value;
    };
    document.getElementById("stval").onchange = function(){
        Stopien=this.value;
    };
    document.getElementById("oval").onchange = function(){
        obrot=this.value;
    };
    document.getElementById("wval").onchange = function(){
        woda=this.value;
        initBuffers();
    };

    LiczChmurke();
    start();
};
function Oblicz(){
    LiczChmurke();
    initBuffers();
}