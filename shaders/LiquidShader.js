
THREE.LiquidShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
        "mode": {type: "i", value: 0 },
        "depth": {type: "f", value: 0.3 },
        "size": {type: "f", value: 0.5 },
        "time": { type: "f", value: 1.0 },
        "mxy": {type: "v2", value: new THREE.Vector2( 0.5, 0.5 ) }, //Mouse position
		"c1":  { type: "v4", value: new THREE.Vector4( 0.4, 0.7, 0.9, 1 ) }, //0.5, 0.4, 0.8, 1 is really pretty 
		//"c2":  { type: "v4", value: new THREE.Vector4( 0.9, 0.4, 0.4, 0 ) },
        "c2":  { type: "v4", value: new THREE.Vector4( 0.1, 0.1, 0.1, 0 ) },
	},

	vertexShader: [
		"varying vec2 vUv;",
        "varying float noise;",
		"void main() {",
			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"

	].join("\n"),

	fragmentShader: [
        
        "uniform int mode;",
        "uniform vec4 c1;",
        "uniform vec4 c2;",
        "uniform vec2 mxy;",
        "uniform float size;",
        "uniform float time;",
        "uniform float depth;",
		"uniform sampler2D tDiffuse;",
		"varying vec2 vUv;",
        "varying float noise;",

        "float ds = min(mod(size,1.0), 1.0) ;",
        //"float ds = 0.01 ;",
		"void main() {",
            "vec2 f2 = vec2(mxy.x + (mxy.x - 0.5) * depth, mxy.y + (mxy.y - 0.5) * depth);",
            "vec2 f3 = vec2(mxy.x + (mxy.x - 0.5) * depth * 3.0, mxy.y + (mxy.y - 0.5) * depth * 3.0);",
            "float d = 1.0/(distance(mxy, vUv)) * ds;",
            "float d2 = 1.0/(distance(f2, vUv)) * ds/2.0;",
            "float d3 = 1.0/(distance(f3, vUv)) * ds/4.0;",
            "vec4 gradient;",
            "if (mode == 0) { gradient = c1 * d + max(1.0-d, 0.0)*c2",
            " + c1 * d2 ",
            " + c1 * d3 ; }",
            "else if (mode == 1) { gradient = c1 * d + (1.0-d/ds)*c2; }", //Super Pretty!
            //"gradient = gradient + c2 * d2 + max(1.0-d2, 0.0)*c1;", //Also super pretty!!
            "vec4 color = texture2D(tDiffuse, vUv);", //Original color before the gradient overlay is applied
            "float red = abs( sin( d + time / 5.0 ) ) + noise;",
            "float green = abs( sin( d2 + time / 4.0 ) ) + noise;",
            "float blue = abs( sin( d3 + time / 3.0 ) ) + noise;",
            "gradient = vec4( red, green, blue, 0.5 );",
            "gl_FragColor = color + gradient;",
		"}"

	].join("\n")

};
