"use strict";

function main() {
  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  const vertexShader = document.querySelector("#vertex-shader").innerHTML;
  const fragmentShader = document.querySelector("#fragment-shader").innerHTML;

  // setup GLSL program
  const program = webglUtils.createProgramFromSources(gl, [vertexShader, fragmentShader]);

  // look up where the vertex data needs to go.
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // look up uniform locations
  const resolutionLocation = gl.getUniformLocation(program, "iResolution");
  const timeLocation = gl.getUniformLocation(program, "iTime");

  // Create a buffer to put three 2d clip space points in
  const positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // fill it with a 2 triangles that cover clipspace
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,  // first triangle
     1, -1,
    -1,  1,
    -1,  1,  // second triangle
     1, -1,
     1,  1,
  ]), gl.STATIC_DRAW);

  const inputElem = document.getElementById('root');
  inputElem.addEventListener('mouseover', requestFrame);
  inputElem.addEventListener("scroll", handleScroll);

  let mouseX = 0;
  let mouseY = 0;

  function setMousePosition(e) {
    const rect = inputElem.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = rect.height - (e.clientY - rect.top) - 1;  // bottom is 0 in WebGL
  }

  inputElem.addEventListener('mousemove', setMousePosition);
  inputElem.addEventListener('touchstart', (e) => {
    e.preventDefault();
    requestFrame();
  }, {passive: false});
  inputElem.addEventListener('touchmove', (e) => {
    e.preventDefault();
    setMousePosition(e.touches[0]);
  }, {passive: false});
  inputElem.addEventListener('touchend', (e) => {
    e.preventDefault();
  }, {passive: false});

  let requestId;
  function requestFrame() {
    if (!requestId) {
      requestId = requestAnimationFrame(render);
    }
  }

  let then = 0;
  function render(now) {
    requestId = undefined;
    now *= 0.0003;  // convert to seconds
    const elapsedTime = Math.min(now - then, 0.1);
    if (autoAnimationMode) {
      time += elapsedTime;
    }
    then = now;

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    gl.vertexAttribPointer(
        positionAttributeLocation,
        2,          // 2 components per iteration
        gl.FLOAT,   // the data is 32bit floats
        false,      // don't normalize the data
        0,          // 0 = move forward size * sizeof(type) each iteration to get the next position
        0,          // start at the beginning of the buffer
    );

    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(timeLocation, time);

    gl.drawArrays(
        gl.TRIANGLES,
        0,     // offset
        6,     // num vertices to process
    );

    requestFrame();
  }

  requestFrame();
}

main();
var time = 5;
var autoAnimationMode = true;

function handleScroll(event) {
  time = time + 0.06;
}

function setAutoAnimationMode(value) {
  // if (typeof value === "boolean" && value !== autoAnimationMode) {
  //   autoAnimationMode = value;
  //   if (autoAnimationMode === false) {
  //     time = 0;
  //   }
  // }
}