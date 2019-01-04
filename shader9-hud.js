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
#define SMOOTHING 0.003
#define STROKE_WIDTH 0.0002

uniform float time;
varying vec2 vUv;
uniform float aspect;

uniform vec3 background;
uniform vec3 foreground;

float circle(float radius, const vec2 st) {
    return smoothstep(length(st), length(st) + SMOOTHING, radius);
}

float line(const vec2 p1,const vec2 p2, float thickness, const vec2 st) {
    float a = p1.y-p2.y;
    float b = p2.x-p1.x;

    // distance to line
    float dist = abs(a * st.x + b * st.y + 
        p1.x * p2.y - p2.x * p1.y) / sqrt(a*a + b*b);
    
    // check with endpoints
    float d = dot(st-p1,p2-p1);
    float l = (p2.x - p1.x)*(p2.x - p1.x) + (p2.y - p1.y)*(p2.y - p1.y);
    dist = (d <= 0.0 || d >= l) ? 1.0 : dist;

    return smoothstep(thickness + SMOOTHING, thickness, dist - SMOOTHING);
}

float arc(float radius, float start, float end, float thickness, const vec2 st) {
    float f = circle(radius + thickness, st) - circle(radius, st);
    float a = atan(st.y,st.x);
    a = mod(a+TWO_PI, TWO_PI);
    f =  (a > start && (a < end) || (start > end) && ((a > start) || (a < end) )) ? f : 0.0;
    // f =  (a > start && (a < end) || (end > TWO_PI) && (a < end - TWO_PI) ) ? f : 0.0;
    return f;
}

float pie(float radius, float start, float end, const vec2 st) {
    float f = circle(radius, st);
    float a = atan(st.y,st.x);
    a = mod(a+TWO_PI, TWO_PI);
    // f = (a > start && (a < end) || (start > end) && ((a > start) || (a < end) )) ? f : 0.0;
    f = f * abs(start-a) / (end-start);
    return f;
}

mat2 r2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

void main(){
	vec3 color = background;

    // translate to center
    vec2 st = vUv;
    // vec2 st = fract(vUv * 3.0);
    st -= vec2(0.5);

    float f = circle(0.41, st) - circle(0.4, st);

    color = mix(color, foreground, f);

    // radar line
    float a = mod(-time,TWO_PI);
    // f = line(vec2(0.0), vec2(cos(a),sin(a)) * 0.4, STROKE_WIDTH, st);
    // color = mix(color, foreground, f);

    //radar pie
    f = pie(0.41, a, mod(a + 0.9,TWO_PI), st);
    color = mix(color, foreground, f);

    // two circling lines
    a = mod(time,TWO_PI);
    f = arc(0.45, a, mod(a + 0.5,TWO_PI), 0.01, st);
    color = mix(color, foreground, f);
    a = mod(time + PI,TWO_PI);
    f = arc(0.45, a, mod(a + 0.5,TWO_PI), 0.01, st);
    color = mix(color, foreground, f);

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
			background: () => rgbToVec3(0, 0, 0),
			foreground: () => rgbToVec3(255, 255, 255)
		}
	});
};

canvasSketch(sketch, settings);

function rgbToVec3(r,g,b) { return [ r / 255, g / 255, b / 255 ] };
