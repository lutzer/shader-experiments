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

float stroke(vec2 st, float pct){
	return  smoothstep( pct-0.05, pct, st.y) -
	smoothstep( pct, pct+0.05, st.y);
}

float func(float x) {
	return abs(cos(x*3.));
}

void main(){
	vec3 color = vec3(0.0);
	
	vec2 pos = vec2(0.25)-vUv;
	
	float r = length(pos)*1.0;
	float a = atan(pos.y,pos.x);
	
	// FIRST SNOWFLAKE
	float f = a;
	float f1 = abs(cos(a*3. +time * 10.));
	float f2 = step(r,0.2) - step(r, 0.1);
	f = min(f1,f2);
	float f3 = abs(cos(a*12.*sin(time))*sin(a*3.))*.8+.1;
	f = min(f,f3);
	//f = smoothstep(-1.5,1., cos(a*10.))*0.2+0.5;
	
	
	color = vec3( 1.-smoothstep(f,f+0.02,r) );


	// plot function
	// float s = stroke(vec2(f),r);
	// color = mix(color, vec3(1.,1.,1.), s);
	
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
			background: () => rgbToVec3(242, 235, 218),
			red: () => rgbToVec3(164, 33, 39),
			yellow: () => rgbToVec3(245, 200, 93),
			blue: () => rgbToVec3(12, 95, 153)
		}
	});
};

canvasSketch(sketch, settings);

function rgbToVec3(r,g,b) { return [ r / 255, g / 255, b / 255 ] };
