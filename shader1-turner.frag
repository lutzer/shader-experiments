precision highp float;

#define PI 3.14159265359

uniform float time;
varying vec2 vUv;
uniform float aspect;

vec3 colorA = vec3(0.961,0.596,0.259);
vec3 colorB = vec3(0.373,0.447,0.620);
vec3 colorC = vec3(0.749,0.635,0.490);
vec3 colorNight = vec3(0.0);

void main () {
   
    vec3 color = vec3(0.0);

    float y = abs(vUv.y - 0.3)/ 0.7;

    color = mix(colorB, colorA, y + 0.5 * sin(time));

    color = mix(color, colorC, 0.3 - vUv.x );

    color = mix(color, colorNight, sin(time) * 0.5 + 0.3 );

    // animate sunset
    // float red = 0.1 + 0.0 * sin(time);
    // color = mix(color, vec3(1.0,0.0,0.0), red);


    gl_FragColor = vec4(color,1.0);
}