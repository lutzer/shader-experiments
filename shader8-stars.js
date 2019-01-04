const canvasSketch = require('canvas-sketch');
const createShader = require('canvas-sketch-util/shader');
const glsl = require('glslify');

// Setup our sketch
const settings = {
	context: 'webgl',
	animate: true,
	dimensions: [1024, 1024]
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

#pragma glslify: noise = require('glsl-noise/simplex/4d');

vec3 hsb2rgb( in vec3 c ){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix( vec3(1.0), rgb, c.y);
}

mat2 r2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

float distanceToLine(vec2 p1, vec2 p2, vec2 st) {
    float a = p1.y-p2.y;
    float b = p2.x-p1.x;
    return abs(a * st.x + b * st.y + 
		p1.x * p2.y - p2.x * p1.y) / sqrt(a*a + b*b);
}

void main(){
	vec3 color = background;

	float shift = noise(vec4(vUv, time * 0.5 , 1.0));

	vec2 st = r2d(time * PI * 0.01 + shift * 0.01) * vUv;

	float p1 = noise(vec4(st * 20., time * 0.1, 0.0));

	// create stars
	float s = 0.83 + sin(time) * 0.015;
	float f1 = smoothstep(s, s + 0.2, p1);
	color = mix(color,vec3(0.7), f1);

	// create overbright areas
	float f2 = smoothstep(s + 0.13, s + 0.16, p1);
	color = mix(color, vec3(1.), f2);

	// add some star discovering lines
	vec2 st2 = r2d(noise(vec4(st*.1,0.0,time * .5)) * PI) * st;
	float f = distanceToLine(vec2(0.,0.5), vec2(1.0,0.5), st2);
	float l = step(0.1 - 0.1, 1.0-f) * step(1.0-f, 0.1 + 0.1) * 0.1;
	color = mix(color,vec3(1.0,0.,0.),l * p1);

	

	//when a line crosses a star
	// color = mix(color,vec3(255.),l*f1);
		

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
			background: () => rgbToVec3(0, 0, 0)
		}
	});
};

canvasSketch(sketch, settings);

function rgbToVec3(r,g,b) { return [ r / 255, g / 255, b / 255 ] };
