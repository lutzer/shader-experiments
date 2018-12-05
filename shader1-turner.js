const canvasSketch = require('canvas-sketch');
const createShader = require('canvas-sketch-util/shader');

// Setup our sketch
const settings = {
  context: 'webgl',
  animate: true,
  dimensions: [512, 512]
};

// Your glsl code
// for code hoghliting install shader language support and comment tagged templates
const frag = require('./shader1-turner.frag');

// Your sketch, which simply returns the shader
const sketch =  ({ gl }) => {
  // Create the shader and return it
  return createShader({
    // Pass along WebGL context
    gl,
    // Specify fragment and/or vertex shader strings
    frag,
    clearColor: "white",
    // Specify additional uniforms to pass down to the shaders
    uniforms: {
      // Expose props from canvas-sketch
      aspect: ({ width, height}) => width/height,
      time: ({ time }) => time
    }
  });
};

canvasSketch(sketch, settings);
