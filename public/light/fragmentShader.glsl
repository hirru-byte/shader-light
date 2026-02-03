uniform float uIorR;
uniform float uIorG;
uniform float uIorB;
uniform float uSaturation;
uniform float uChromaticAberration;
uniform float uRefractPower;
uniform vec2 winResolution;
uniform sampler2D uTexture;

varying vec3 worldNormal;
varying vec3 eyeVector;

const int LOOP = 16;

vec3 sat(vec3 rgb, float intensity) {
  vec3 L = vec3(0.2125, 0.7154, 0.0721);
  vec3 grayscale = vec3(dot(rgb, L));
  return mix(grayscale, rgb, intensity);

}


void main() {
  float iorRatioR = 1.0/uIorR;
  float iorRatioG = 1.0/uIorG;
  float iorRatioB = 1.0/uIorB;
  
  vec3 color = vec3(1.0);

  vec2 uv = gl_FragCoord.xy / winResolution.xy;
  vec3 normal = worldNormal;

  for (int i = 0; i < LOOP; i++) {
    float slide = float(i) / float(LOOP) * 0.1;

    vec3 refractVecR = refract(eyeVector, normal, iorRatioR);
    vec3 refractVecG = refract(eyeVector, normal, iorRatioG);
    vec3 refractVecB = refract(eyeVector, normal, iorRatioB);

    color.r += texture2D(uTexture, uv + refractVecR.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).r;
    color.g += texture2D(uTexture, uv + refractVecG.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).g;
    color.b += texture2D(uTexture, uv + refractVecB.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).b;

    color = sat(color, uSaturation);
  }

  color /= float(LOOP);

  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
