#version 130

/** Macros **/
#define EPS 1e-6
#define PI 3.14159
#define T iTime
#define M iMouse

#define sat(x) clamp(x, .0, 1.)
#define S smoothstep


/** Defintions **/
uniform highp vec2 uResolution;

out vec4 fragColor;

/** Utils Functions **/
vec2 initUV(vec2 fragCoord)
{
    // Normalize between -0.5~0.5
    vec2 uv = (fragCoord.xy / uResolution.xy) - 0.5;
    // Aspect Ratio
    uv.x *= uResolution.x / uResolution.y;
    return uv;
}

/** Shapes Functions **/
float circle(vec2 uv, vec2 pos, float radius, float blur)
{
    float d = length(uv - pos);
    return S(radius + blur + EPS, radius - blur - EPS, d);
}
float band(float t, float start, float end, float blur)
{
    float step1 = S(start - blur - EPS, start + blur + EPS, t);
    float step2 = S(end + blur + EPS, end - blur - EPS, t);
    return step1 * step2;
}
float rect(vec2 uv, float left, float right, float bottom, float top, float blur)
{
    float h = band(uv.x, left, right, blur);
    float v = band(uv.y, bottom, top, blur);
    return h * v;
}

void main(void)
{
    /** Global Variables **/
    vec2 uv = initUV(gl_FragCoord.xy);
    vec3 col = vec3(.3);
    float alpha = 1.0;

    /** Main Logic **/
    col += circle(uv, vec2(.0), .3, .1);
    col += rect(uv, .3, .4, .3, .4, .001);


    fragColor = vec4(col, alpha);
}
