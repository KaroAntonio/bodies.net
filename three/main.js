
//using three.js r.52

var camera, scene, renderer, controls;
var bgCam, bgScene, bgcomposer;
var rgbParams, rgbPass;
var kaleidoParams, kaleidoPass;
var liquidParams, liquidPass;
var materialGradientParams ;
var bokehPass, bokeh_params;
var postprocessing = {};
var composer;
var cubeHolder, body_geometry;
var updateFcts	= [];
var material, vmaterial;
var mouseX = window.innerWidth/2;
var mouseY = window.innerHeight/2;

function loadImage(path) {
  var canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  //document.body.appendChild(canvas);

  var texture = new THREE.Texture(canvas);

  var img = new Image();
  img.crossOrigin = '' 
  img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;

      var context = canvas.getContext('2d');
      context.drawImage(img, 0, 0);

      texture.needsUpdate = true;
  };
  img.src = path;
  return texture;
};

init();
animate(0);

function init() {
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 20, 3000);
    camera.position.z = 1000;

    scene = new THREE.Scene();

    //add light
    var light = new THREE.PointLight(0xFFFFFF, 1);
    light.position = new THREE.Vector3(1000, 1000, 1000);
    scene.add(light);

    //create video material
    /*
    var url	= 'assets/mountains.webm'
    var videoTexture= new THREEx.VideoTexture(url)
    var video = videoTexture.video
    video.volume = 0;
    updateFcts.push(function(delta, now){
        videoTexture.update(delta, now)
    })
    */

    //Gradient Shader
    materialGradientParams = { 
        tDiffuse: { type: "t", value: null },
        time: { type: "f", value: 1.0 }, };
    var parameters = {
        fragmentShader: THREE.GradientMaterialShader.fragmentShader,
        vertexShader: THREE.GradientMaterialShader.vertexShader,
        uniforms: materialGradientParams,
        blending: THREE.NormalBlending,
        side: THREE.DoubleSide,
        transparent: true,
        depthTest: true
    };

    material = new THREE.ShaderMaterial( parameters );

    /*
    materialGradientParams = { 
        "tDiffuse": { type: "t", value: null },
        "mode": {type: "i", value: 0 },
        "depth": {type: "f", value: 0.3 },
        "size": {type: "f", value: 0.5 },
        "mxy": {type: "v2", value: new THREE.Vector2( 0.5, 0.5 ) }, //Mouse position
        "c1":  { type: "v4", value: new THREE.Vector4( 0.4, 0.7, 0.9, 1 ) }, //0.5, 0.4, 0.8, 1 is really pretty 
        //"c2":  { type: "v4", value: new THREE.Vector4( 0.9, 0.4, 0.4, 0 ) },
        "c2":  { type: "v4", value: new THREE.Vector4( 0, 0, 0, 0 ) },
    }
    var material = new THREE.ShaderMaterial( {
        uniforms: materialGradientParams,
        vertexShader: THREE.CircleGradientShader.vertexShader,
        fragmentShader: THREE.CircleGradientShader.fragmentShader
    } );
    */

    //Img from url texture
    var path = "assets/flowers.jpg";
    /*
    var geo = new THREE.PlaneGeometry(200, 200);
    var material = new THREE.MeshBasicMaterial({ map: loadImage(path) });*/
    //Video Texture
    /*
    vmaterial = new THREE.MeshBasicMaterial({
        map	: videoTexture.texture,
        transparent: true, 
        opacity: 0.5
    });
    */

    //BACKGROUND

    var bg = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2, 0),
      new THREE.MeshBasicMaterial()
    );


    // The bg plane shouldn't care about the z-buffer.
    bg.material.depthTest = false;
    bg.material.depthWrite = false;

    bgScene = new THREE.Scene();
    bgCam = new THREE.Camera();
    bgScene.add(bgCam);
    bgScene.add(bg);

    cubeHolder = new THREE.Object3D();
    scene.add(cubeHolder);
    //composeGeometry(cubeHolder, material, 700, {nested : true, dims : [50,300,50], spread : 2000, randRot: true});
    //Load Objects
    var manager = new THREE.LoadingManager();
    var loader = new THREE.OBJLoader( manager );
    loader.load( 'assets/human.obj', function ( object ) {

        object.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {
                child.material = material;
                body_geometry = child.geometry;
                composeGeometry(cubeHolder, material, 30, {geometry: child.geometry, nested : false, dims : [50,300,50], spread : 1000, randRot: false, scale: 1});
            }
        } );

        var s = 10;
        object.scale.set(s,s,s)
        object.rotation.y = Math.PI/2;
        object.position.y = -300;
        //scene.add( object );
    });

    //init renderer
    renderer = new THREE.WebGLRenderer({
        alpha: true,
    });
    renderer.setClearColor( 0xffffff, 1);
    renderer.autoClear = false;
    renderer.setSize( window.innerWidth, window.innerHeight );
    //add stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    //container.appendChild( stats.domElement );

    $('#background')[0].appendChild( renderer.domElement );

    //POST PROCESSING
    //Create Shader Passes
    //render pass renders scene into effects composer

    var renderPass = new THREE.RenderPass( scene, camera );
    var bgrenderPass = new THREE.RenderPass( bgScene, bgCam );
    liquidPass = new THREE.ShaderPass( THREE.LiquidShader );
    rgbPass = new THREE.ShaderPass( THREE.RGBShiftShader );
    kaleidoPass = new THREE.ShaderPass( THREE.KaleidoShader );
    circleGradientPass = new THREE.ShaderPass( THREE.CircleGradientShader )

    //COMPOSER BLENDING:
    //http://www.instructables.com/id/Instructables-Universe-in-Threejs/step12/Threejs-Post-processing-Effects-Dimming-Blurring/
    //Add Shader Passes to Composer
    //order is important
    composer = new THREE.EffectComposer( renderer);
    bgcomposer = new THREE.EffectComposer( renderer);

    //bgcomposer.addPass( bgrenderPass );
    composer.addPass( renderPass );
    composer.addPass( liquidPass );
    //composer.addPass( circleGradientPass );
    composer.addPass( kaleidoPass );
    composer.addPass( rgbPass );
    //bgcomposer.addPass( rgbPass );

    //set last pass in composer chain to renderToScreen
    rgbPass.renderToScreen = true;
    //bgrenderPass.renderToScreen =  true;

    //Init DAT GUI control panel
    rgbParams = {
        amount: 0.1,
        angle: 0.1,
    }

    kaleidoParams = {
        sides: 0,
        angle: 0.0
    }

    gradientParams = {
        mxy: new THREE.Vector2 (0.5, 0.5),
        size: 0.0,
    }

    liquidParams = {
        mxy: new THREE.Vector2 (0.5, 0.5),
        size: 0.0,
    }

    onParamsChange();

    controls = new THREE.TrackballControls( camera );

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    controls.keys = [ 65, 83, 68 ];
}

function onParamsChange() {
    //copy gui params into shader uniforms
    liquidPass.uniforms[ "mxy" ].value = liquidParams.mxy;
    liquidPass.uniforms[ "size" ].value = liquidParams.size;
    circleGradientPass.uniforms[ "mxy" ].value = gradientParams.mxy;
    circleGradientPass.uniforms[ "size" ].value = gradientParams.size;
    circleGradientPass.uniforms[ "mode" ].value = gradientParams.mode;
    rgbPass.uniforms[ "angle" ].value = rgbParams.angle*3.1416;
    rgbPass.uniforms[ "amount" ].value = rgbParams.amount;
    kaleidoPass.uniforms[ "sides" ].value = kaleidoParams.sides;
    kaleidoPass.uniforms[ "angle" ].value = kaleidoParams.angle*3.1416;
}
window.addEventListener('mousemove', function(event) { 
    //mouseX = ( ( event.clientX - canvas.offsetLeft ) / canvas.clientWidth ) * 2 - 1;
    //mouseY = ( ( event.clientY - canvas.offsetTop ) / canvas.clientHeight ) * 2 + 1;
    mouseX = event.clientX;
    mouseY = event.clientY;
}, true);
var clicks = 0;
var now;
window.addEventListener('mousedown', function(event) { 
    if (now/1000 > 28 && now/1000 < 48) { 
        if (clicks < 10) clicks++;
        //console.log(clicks)
    }
}, true);

var lastTimeMsec= null;
var check = [
    false,
    false,
]
function animate(nowMsec) {
    nowMsec = nowMsec%60000
    now = nowMsec;
    requestAnimationFrame( animate );

    //Move Camera to mouse
    camera.position.x += ( mouseX - camera.position.x ) * .05;
    camera.position.z += ( - mouseY - camera.position.z ) * .05;

    //Circle Gradient
    if (nowMsec/1000 < 28) { //28
        gradientParams = {
            mxy: new THREE.Vector2 (mouseX/window.innerWidth, 1-mouseY/window.innerHeight),
            size: nowMsec/40000.0,
            mode: 2,
        }
    } else if (nowMsec/1000 > 28 && nowMsec/1000 < 48) {
        gradientParams = {
            mxy: new THREE.Vector2 (mouseX/window.innerWidth, 1-mouseY/window.innerHeight),
            size: (nowMsec/1000.0 - 28) / 200,
            mode: 1,
        }
    } else {
        gradientParams = {
            mxy: new THREE.Vector2 (mouseX/window.innerWidth, 1-mouseY/window.innerHeight),
            size: 0,
            mode: 0,
        }
    }

    //Kscope
    if (nowMsec/1000 > 0 && nowMsec/1000 < 48) { 
        kaleidoParams = {
        //sides: 10 - clicks,
        sides: 0,
        //angle: nowMsec/-9000,
        angle: 0,
        }
    } else {
        kaleidoParams = {
        sides: 0,
        angle: 0
        }
    }

    //RGB
    if (nowMsec/1000 > 52 && nowMsec/1000 < 60) { //28
        rgbParams = {
            amount: 0.03,
            angle: nowMsec/-3000,
        }
    } else {
        rgbParams = {
            amount: 0.002,
            angle: nowMsec/-3000,
        }
    }

    //Re-Compose
    /*
    if (nowMsec/1000 > 0 && nowMsec/1000 < 48) { //28
        if (check[0] == false) {
            check[0] = true;
            composeGeometry(cubeHolder, material, 700, {nested : true, dims : [50,300,50], spread : 2000, randRot: true});
        }

    } else if (nowMsec/1000 > 48 && nowMsec/1000 < 60) {
       if (check[1] == false) {
            check[1] = true;
            composeGeometry(cubeHolder, vmaterial, 10, {nested : true, dims : [700,700,700], randRot : false});
        }
    } else {

    }
    */

    //Rotate
    if (true) { //28
        cubeHolder.rotation.y -= 0.002;
        cubeHolder.rotation.x += 0.000;
        cubeHolder.rotation.z += 0.000;
    } else {

    }

    //cubeHolder.scale.x = Math.sin(nowMsec/1000);
    //cubeHolder.scale.y = Math.sin(nowMsec/1000);
    //cubeHolder.scale.z = Math.sin(nowMsec/1000);
    //cubeHolder.rotation.z += 0.002;
    //cubeHolder.position.z += 1;

    /*
    //Doesn't Really Work?
    var mouse3D = new THREE.Vector3( 
         0.5,
        mouseX,
        mouseY );
    console.log(mouseX, mouseY);
    cubeHolder.lookAt( mouse3D );
    */

    bgcomposer.render( 0.1);
    composer.render( 0.1);
    stats.update();
    controls.update();

    // measure time
    lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
    var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
    lastTimeMsec	= nowMsec
    // call each update function
    updateFcts.forEach(function(updateFn){
        updateFn(deltaMsec/1000, nowMsec/1000)
    })

    materialGradientParams.time.value = nowMsec/400.0;
    //materialGradientParams.mxy.value = new THREE.Vector2 (mouseX/window.innerWidth, 1-mouseY/window.innerHeight);
    //materialGradientParams.size.value = nowMsec/40000.0;

    liquidParams = {
        mxy: new THREE.Vector2 (mouseX/window.innerWidth, 1-mouseY/window.innerHeight),
        size: 0.01,
        time: 0
    }

    onParamsChange();

}
