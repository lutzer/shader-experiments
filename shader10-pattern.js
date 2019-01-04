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
#define DIVISIONS 4.


uniform float time;
varying vec2 vUv;
uniform float aspect;

uniform vec3 background;
uniform vec3 foreground;

vec2 rotate2D(vec2 _st, float _angle){
    _st -= 0.5;
    _st =  mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle)) * _st;
    _st += 0.5;
    return _st;
}

vec2 tile(vec2 _st, float _zoom){
    _st *= _zoom;
    return fract(_st);
}

float box(vec2 _st, vec2 _size, float _smoothEdges){
    _size = vec2(0.5)-_size*0.5;
    vec2 aa = vec2(_smoothEdges*0.5);
    vec2 uv = smoothstep(_size,_size+aa,_st);
    uv *= smoothstep(_size,_size+aa,vec2(1.0)-_st);
    return uv.x*uv.y;
}

mat2 scale(vec2 _scale){
    return mat2(_scale.x,0.0, 0.0,_scale.y);
}

void main(){
    vec2 st = vUv;
    vec3 color = vec3(0.0);

    float col = floor(st.x * DIVISIONS);
    float row = floor(st.y * DIVISIONS);

    // Divide the space in 4
    st = tile(st,DIVISIONS);


    // Use a matrix to rotate the space 45 degrees

    st *= vec2(sin(col + row + time) + 2.0);
    // st += vec2(sin(col + row + time) + 2.0);
    st = rotate2D(st,PI*sin(time));


    // Draw a square
    color = vec3(box(st,vec2(0.5),0.01));
    // color = vec3(st,0.0);

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
			background: () => rgbToVec3(0, 0, 0),
			foreground: () => rgbToVec3(255, 255, 255)
		}
	});
};

canvasSketch(sketch, settings);

function rgbToVec3(r,g,b) { return [ r / 255, g / 255, b / 255 ] };
