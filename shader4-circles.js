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
  uniform vec3 yellow;
  uniform vec3 blue;

  float circle(vec2 center, float radius, vec2 st) {
    vec2 toCenter = center-st;
    return step(length(toCenter), radius);
  }

  	
    float sinc( float x, float k ) {
        float a = PI * ((float(k)*x-1.0));
        return sin(a)/a;
    }

  void main () {

    vec3 color = background;

    float radius = sinc(time, 3.0) * 5.0 + 0.15;
    float c1 = circle(vec2(0.25), radius, vUv);
    color = mix(color, red , c1);

    float c2 = circle(vec2(0.75, sin(time * 0.5) * 0.5 + 0.5), 0.2, vUv);
    color = mix(color, yellow , c2);

    float s3 = pow(distance(vUv,vec2(0.5,sin(time))),distance(vUv,vec2(sin(time) * 0.5,0.5)));
    color = mix(color, blue , step(mod(s3,0.04),sin(time * 1.) * 0.01 + 0.02));

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
      yellow: () => rgbToVec3(245, 200, 93),
      blue: () => rgbToVec3(12, 95, 153)
    }
  });
};

canvasSketch(sketch, settings);

function rgbToVec3(r,g,b) { return [ r / 255, g / 255, b / 255 ] };
