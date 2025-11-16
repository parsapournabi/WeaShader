#version 330 core

//#define PURE_REFLECTION

// #define CAM_ROTATION

// #define CAM_SWING

// #define DEPTH_OF_FIELD

#define MOTION_BLUR

uniform float iTime;
uniform vec2 uResolution;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
out vec4 fragColor;


const int sampleNum = 8;


mat2 r2(float a){ return mat2(cos(a), sin(a), -sin(a), cos(a)); }


// vec2 to float hash.
float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(425.215, 714.388)))*45758.5453);
}

// vec2 to vec2 hash.
vec2 hash22(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(72.927, 98.283)), dot(p, vec2(41.295, 57.263))))
                  *vec2(43758.5453, 23421.6361));
}

// vec2 to vec3 hash.
vec3 hash23(vec2 p){
    return fract(sin(vec3(dot(p, vec2(12.989, 78.233)), dot(p, vec2(51.898, 56.273)),
                      dot(p, vec2(41.898, 57.263)))) *vec3(43758.5453, 23421.6361, 65426.6357));
}

float tick(float t, float d) {

  float m = fract(t/d);
  m = smoothstep(0., 1., m);
  m = smoothstep(0., 1., m);
  return (floor(t/d) + m)*d;
}

// NuSan's cool camera tick function.
float tickTime(float t){ return t*2. + tick(t, 4.)*.75; }


// Camera movement. Adapted from NuSan's example.
void cam(inout vec3 p, float tm, float tTime) {

    #ifdef CAM_ROTATION
    p.xy *= r2(tm/4.);
    p.xz *= r2(tm/2.);
    #endif

    #ifdef CAM_SWING
        p.xz *= r2(sin(tTime*.3)*.4);
        p.xy *= r2(sin(tTime*.1)*2.);
    #endif

}

float rayPlane(vec3 ro, vec3 rd, vec3 n, float d){


    float t = 1e8;
    //float retval = 0.; // Inside or outside the object. Not used here.

        float ndotdir = dot(rd, n);

        if (ndotdir < 0.){

                float dist = (-d - dot(ro, n) + 9e-7)/ndotdir;	// + 9e-7

                if (dist>0. && dist<t){
            t = dist;
            //retval = 1.;
                }
        }

    return t;

}

float udBox(in vec2 p, in vec2 b){
        return length(max(abs(p) - b + .1, 0.)) - .1;
}

// Used for polar mapping various shapes.
float uvShape(vec2 p){
    // Polar mapping a square wall.
    p = abs(p);
    return max(p.x, p.y);

    // Mapping hexagon walls.
    //p *= r2(-3.14159/12.);
    //p = abs(p);
    //return max(p.x*.8660254 + p.y*.5, p.y);


}

void main(void){


    vec2 uv = (gl_FragCoord.xy - uResolution.xy*.5)/uResolution.y;

    const float DOF = .05, DOFDist = 3.;

    float tm = iTime;
    float tickTm = tickTime(tm);

    vec3 ca = vec3(0, 0, tickTm);


     vec3 col = vec3(0);


    for(int j = 0; j<sampleNum; j++) {

        // Pixel offset.
        vec2 offs = hash22(uv + float(j)*74.542 + 35.877) - .5;

        #ifdef MOTION_BLUR
        tm = iTime + float(j)*.05/float(sampleNum);
        tickTm = tickTime(tm);
        #endif

        vec3 ro = vec3(0);
        #ifdef DEPTH_OF_FIELD
        ro.xy += offs*DOF;
        vec3 r = normalize(vec3(uv - offs*DOF/DOFDist, 1));
        #else
        vec3 r = normalize(vec3(uv - offs/uResolution.y, 1));
        #endif

        cam(ro, tm, tickTm);
        cam(r, tm, tickTm);


        ro.z += ca.z;

        float alpha = 1.;

        float fogD = 1e5;


        for(int i = 0; i<3; i++) {


            vec4 pl; // Vector storage for the four planes.
            pl.x = rayPlane(ro, r, vec3(0, 1, 0), 1.); // Bottom.
            pl.y = rayPlane(ro, r, vec3(0, -1, 0), 1.); // Top.
            pl.z = rayPlane(ro, r, vec3(1, 0, 0), 1.); // Left.
            pl.w = rayPlane(ro, r, vec3(-1, 0, 0), 1.); // Right.

            float d = min(min(pl.x, pl.y), min(pl.z, pl.w));

            if(i==0) fogD = d;

            vec3 p = ro + r*d;
            vec3 n = vec3(0,  pl.x<pl.y? 1 : -1, 0);
            vec2 tuv = p.xz + vec2(0, n.y);

            if(min(pl.z, pl.w)<min(pl.x, pl.y)) {

                n = vec3(pl.z<pl.w? 1 : -1, 0, 0);

                tuv = p.yz + vec2(n.x, 0); // Left walls.
            }

            const float sc = 12.;
            tuv *= sc;


            vec3 sampleCol = vec3(1);

            vec2 id = floor(tuv);
            tuv -= id + .5;


            float patDist = udBox(tuv, vec2(.4));
            float sh = clamp(.5 - patDist/.2, 0., 1.);

            vec3 sqCol = .85 + .3*cos((hash21(id + .2)*2.)*6.2831 + vec3(0, 1, 2));
            sampleCol = mix(vec3(0), sqCol*sh, (1. - smoothstep(0., .005, patDist)));

            const vec2 txSc = vec2(2, 1./2.); // Texture scale.
            vec3 ip3 = (floor(p*sc) + .0)/sc; // Quantizing... as opposed to continuous values.
            float ang = atan(ip3.x, ip3.y)/6.2831; // Angle of grid cell from the tube center.
            vec2 tnuv = vec2(uvShape(ip3.xy)*ang*txSc.x, ip3.z*txSc.y); // Square polar UVs.
            const vec2 txSc2 = vec2(1, 1./4.); // Texture scale.
            vec3 p3 = mix(p, (floor(p*sc) + .0)/sc, .8); // Slightly smooth quantized values.
            float ang2 = atan(p3.x, p3.y)/6.2831; // Angle of grid cell from the tube center.
            vec2 tnuv2 = vec2(uvShape(p3.xy)*ang2*txSc2.x + p3.z*.075, p3.z*txSc2.y);  // Square polar UVs.

            vec3 tx = texture(iChannel0, fract(tnuv - .5 - vec2(iTime/(sc)/2., 0))).xyz; tx *= tx;
            tx = mix(tx, vec3(dot(tx, vec3(.299, .587, .114))), .75);
            tx = smoothstep(.1, .55, tx);

            vec3 tx2 = texture(iChannel1, fract(tnuv2 - .5 - vec2(iTime/(sc)/2., 0))).xyz; tx2 *= tx2;
            tx2 = smoothstep(.18, .5, tx2);//*vec3(1.1, 1, .9);

            sampleCol *= tx*tx2*4.;

            vec3 ld = normalize(ca + vec3(0, 0, 3) - p);
            float dif = max(dot(ld, n), 0.); // Diffuse.
            float spe = pow(max(dot(reflect(ld, -n), -r), 0.), 8.); // Specular.
            float fre = pow(max(1. - abs(dot(r, n))*.5, 0.), 1.); // Fresnel.

            sampleCol *= (dif + vec3(1, .9, .7)*spe*4. + vec3(.5, .7, 1)*fre);

            sampleCol *= 1.35/(1. + fogD*fogD*.05);



            col += sampleCol*alpha*fre;

            alpha *= .9;

            #ifdef PURE_REFLECTION

            r = reflect(r,n);

            #else

            float h = hash21(id)*smoothstep(0., .005, -patDist + .15);

            vec3 ref = reflect(r,n);
            r = normalize(hash23(uv + float(j)*74.524 + float(i)*35.712) - .5);
            r = normalize(mix(ref, r, (hash21(tuv)*.0 + h*.1*sh)*exp(-fogD*.05)));
            r = dot(r, n)<0.? -r : r;
            #endif

            ro = p + n*.0011;
        }

    }

    col /= float(sampleNum);


    fragColor = vec4(pow(max(col, 0.), vec3(0.4545)), 1);

}


