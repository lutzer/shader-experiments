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

float circle(float radius, vec2 st) {
    return step(radius, length(st));
}

float box(vec2 size, vec2 st){
	vec2 bl = step(-size/2., st);
	vec2 ul = step(st,size/2.);
	return bl.x * bl.y * ul.x * ul.y;
}

float cross(float size, vec2 st ){
    return box(vec2(size,size/4.), st) +
		box(vec2(size/4.,size), st);
}

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

void main(){
	vec3 color = background;

	float t = mod(time,1.0);
	vec2 translate = vec2(t,abs(cos(t*TWO_PI) * pow(1.0-t,0.3)));
	//translate = vec2(0.5,0.5);
	//translate = fract(translate * vec2(2.,1.));
    
	// shift coordinate to center
	vec2 st = vUv - translate;

	// rotate
	st = rotate2d( -t*2.*PI ) * st;
	float f = cross(0.1, st);
	f += circle(0.04, st) - circle(0.06, st);

	color = mix(color,vec3(0.),f);

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
