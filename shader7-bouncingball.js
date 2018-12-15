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

float circle(vec2 center, float radius, vec2 st) {
    vec2 toCenter = center-st;
    return step(length(toCenter), radius);
}

float box(in vec2 _st, in vec2 _size){
    _size = vec2(0.5) - _size*0.5;
    vec2 uv = smoothstep(_size,
                        _size+vec2(0.001),
                        _st);
    uv *= smoothstep(_size,
                    _size+vec2(0.001),
                    vec2(1.0)-_st);
    return uv.x*uv.y;
}

float cross(vec2 center, float _size, vec2 st ){
	vec2 pos = st - center;
    return  box(st, vec2(_size,_size/4.)) +
            box(st, vec2(_size/4.,_size));
}


void main(){
	vec3 color = background;

	float t = mod(time,1.0);
	vec2 pos = vec2(t,abs(cos(t*TWO_PI) * pow(1.0-t,0.3)));
	//vec2 pos = vec2(0.5);
     
	float f = circle(pos, 0.05, vUv);

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
