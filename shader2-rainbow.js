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


  vec3 colorA = vec3(0.961,0.596,0.259);
  vec3 colorB = vec3(0.373,0.447,0.620);
  vec3 colorC = vec3(0.749,0.635,0.490);
  vec3 colorNight = vec3(0.0);

  vec3 mapRainbowColor(float val) {
    float red = sin(val * PI);
    float green = sin(val * PI + 0.3 * PI);
    float blue = sin(val * PI + 0.6 * PI);
    return vec3(red,green,blue);
  }


#pragma glslify: noise = require('glsl-noise/simplex/3d');

  void main () {

      float d = noise(vec3(time * 0.2,1.0,1.0));
      d *= PI;
    
      vec3 color = vec3(0.0);

      vec2 middle = vec2(cos(d) * 0.5 + 0.5,sin(d)* 0.5 + 0.5);
      vec2 sub = middle - vUv;

      float y = sqrt(sub.x * sub.x + sub.y * sub.y) * 6.0;

      // gl_FragColor = vec4(vec3(smoothstep(0.1, 0.15, y)),1.0);
      gl_FragColor = vec4(mapRainbowColor( mod(y + time * 5.,2.*PI) ),1.0);
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
