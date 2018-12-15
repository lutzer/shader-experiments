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
#define TWO_PI 6.28318530718

uniform float time;
varying vec2 vUv;
uniform float aspect;

uniform vec3 background;
uniform vec3 foreground;

float polygon(vec2 c, float s, int n, vec2 st){
	// Remap the space to -1. to 1.
	st = (c-st) *2.;

	// Angle and radius from the current pixel
	float a = atan(st.x,st.y)+PI;
	float r = TWO_PI/float(n);

	// Shaping function that modulate the distance
	float d = cos(floor(.5+a/r)*r-a)*length(st);

	return 1.0-smoothstep(s,s+0.01,d);
}

float circle(vec2 center, float radius, vec2 st) {
    vec2 toCenter = center-st;
    return step(length(toCenter), radius);
}

void main(){
	vec3 color = background;

	float t = polygon(vec2(0.5), 0.4, 3, vUv);
	color= mix(color, vec3(255,0,0),t);

	vec2 c = abs(fract(vUv * 16.) - 0.5);
	float r = sin(vUv.y*PI) * 0.2 * (sin(vUv.x*PI) + 1.0);
	// r *= step(0.25,length(vUv - 0.5));
	float d = step(r,length(c));

 	color= mix(color, foreground,1.-d);

	gl_FragColor = vec4(color, 1.0);
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
			background: () => rgbToVec3(245, 241, 232),
			foreground: () => rgbToVec3(0, 0, 0)
		}
	});
};

canvasSketch(sketch, settings);

function rgbToVec3(r,g,b) { return [ r / 255, g / 255, b / 255 ] };
