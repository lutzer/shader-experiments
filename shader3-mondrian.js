const canvasSketch = require('canvas-sketch');
const createShader = require('canvas-sketch-util/shader');
const glsl = require('glslify');

// Setup our sketch
const settings = {
  context: 'webgl',
  animate: true,
  dimensions: [512, 512]
};

// Your glsl code
// for code hoghliting install shader language support and comment tagged templates
const frag = glsl(/* glsl */`
  precision highp float;

  #define PI 3.14159265359

  uniform float time;
  varying vec2 vUv;
  uniform float aspect;

  uniform vec3 background;
  uniform vec3 red;
  uniform vec3 black;
  uniform vec3 yellow;
  uniform vec3 blue;

  float rect(vec2 p1, vec2 p2, vec2 st) {
    vec2 bl = step(p1,st);
    vec2 tr = 1.0 - step(p2,st);
    return bl.x * bl.y * tr.x * tr.y;
  }

  float rect(vec2 p1, vec2 p2, float stroke, vec2 st) {
    float outer = rect(p1,p2,st);
    float inner = 1.0 - rect(p1+stroke,p2-stroke,st);
    return inner * outer;
  }

  void main () {

      vec3 color = background;
      
      float redFill = rect(vec2(0.3,0.),vec2(0.5),vUv);
      color = mix(color,red,redFill);

      float yellowFill = rect(vec2(0.69,0.39), vec2(1.0,0.6), vUv);
      color = mix(color, yellow, yellowFill);

      float blueFill = rect(vec2(0.49,0.69), vec2(0.7,1.0), vUv);
      color = mix(color, blue, blueFill);

      float outline = rect(vec2(0.), vec2(0.3), 0.01, vUv)
        + rect(vec2(0.,0.29), vec2(0.3,1.0), 0.01, vUv)
        + rect(vec2(0.29,0.), vec2(0.5), 0.01, vUv)
        + rect(vec2(0.29,0.49), vec2(0.5,1.0), 0.01, vUv)
        + rect(vec2(0.29,0.49), vec2(0.5,1.0), 0.01, vUv)
        + rect(vec2(0.49,0.), vec2(0.7,0.2), 0.01, vUv)
        + rect(vec2(0.49,0.19), vec2(0.7,0.7), 0.01, vUv)
        + rect(vec2(0.49,0.69), vec2(0.7,1.0), 0.01, vUv)
        + rect(vec2(0.69,0.0), vec2(1.0,0.4), 0.01, vUv)
        + rect(vec2(0.69,0.39), vec2(1.0,0.6), 0.01, vUv)
        + rect(vec2(0.69,0.59), vec2(1.0,1.0), 0.01, vUv);
      color = mix(color,black,outline);

      gl_FragColor = vec4(color,1.0);
    
  }
`);

// Your sketch, which simply returns the shader
const sketch =  ({ gl }) => {
  // Create the shader and return it
  return createShader({
    // Pass along WebGL context
    gl,
    // Specify fragment and/or vertex shader strings
    frag,
    // Specify additional uniforms to pass down to the shaders
    uniforms: {
      // Expose props from canvas-sketch
      aspect: ({ width, height}) => width/height,
      time: ({ time }) => time,
      background: () => rgbToVec3(242, 235, 218),
      red: () => rgbToVec3(164, 33, 39),
      black: () => rgbToVec3(0, 0, 0),
      yellow: () => rgbToVec3(245, 200, 93),
      blue: () => rgbToVec3(12, 95, 153)
    }
  });
};

canvasSketch(sketch, settings);

function rgbToVec3(r,g,b) { return [ r / 255, g / 255, b / 255 ] };
