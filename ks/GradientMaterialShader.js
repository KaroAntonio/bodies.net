
THREE.GradientMaterialShader = {

	uniforms: {
        "tDiffuse": { type: "t", value: null },
		"time": { type: "f", value: 1.0 },
        "resolution": { type: "v2", value: new THREE.Vector2() }
	},

	vertexShader: [
		"varying vec2 vUv;",
        "varying float vAlpha;",
        "varying vec3 vColor;",
		"void main() {",
			"vUv = uv;",
            "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
            "gl_Position = projectionMatrix * mvPosition;",
		"}"

	].join("\n"),

	fragmentShader: [
        
        "uniform float time;",
        "uniform vec2 resolution;",
        "varying vec2 vUv;",
        "varying float vAlpha;",
        "varying vec3 vColor;",
        "uniform sampler2D tDiffuse;",
		"void main(void) {",
            "vec2 position = -1.0 + 2.0 * vUv;",
            "float red = abs( sin( position.x * position.y + time / 5.0 ) );",
            "float green = abs( sin( position.x * position.y + time / 4.0 ) );",
            "float blue = abs( sin( position.x * position.y + time / 3.0 ) );",
            "vec4 color = vec4( vColor, 0 );", //Original color before the gradient overlay is applied
            "vec4 gradient = vec4( red, green, blue, 0.5 );",
            "gl_FragColor = gradient;",
		"}"

	].join("\n")

};
