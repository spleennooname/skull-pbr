var rstats_obj = {
    values: {
        frame: {
            caption: 'Total frame time (ms)',
            over: 16.67
        },
        raf: {
            caption: 'since last rAF (ms)'
        },
        fps: {
            caption: 'Framerate (FPS)',
            below: 30
        }
    }
}

/* vars */

var canvas, engine, scene, assets, material, mesh, light, light2, camera, assets, light3, mesh, angle = 0,

    tx_box, tx_gold, tx_mat, tx_n, tx_sp,

    box, box_mat,

    use_pbr = true,

    base_textures = "https://dl.dropboxusercontent.com/u/1358781/lab/webgl/textures/",

    base_url = "https://dl.dropboxusercontent.com/u/1358781/lab/webgl/skull";


/* functions */


function render() {
    stats('frame').start();
    stats('rAF').tick();
    stats('FPS').frame();

    scene.render();

    stats('frame').end();
    stats().update();

    TWEEN.update();
}

function resize() {

    //https://en.wikipedia.org/wiki/Aspect_ratio_(image)
    var aspect = 1.77; //w/h

    var c = document.getElementById("webgl-demo");

    var h = .90 * window.innerHeight;
    var w = window.innerWidth < h * 1.77 ? window.innerWidth : h * 1.77;

    var mr = (window.innerHeight - h) / 2;
    c.style.height = h + "px";
    c.style.width = w + "px";

    c.style.marginTop = mr + "px"
    c.style.marginBottom = mr + "px"

    engine.resize();
}



function on_progress_scene(progress) {

}

function on_init_scene() {

    camera = new BABYLON.ArcRotateCamera("Camera", 1, .75, 100, BABYLON.Vector3.Zero(), scene);

    scene.activeCamera = camera;
    camera.attachControl(canvas, true);
    camera.minZ = 20;
    camera.maxZ = 800;
    camera.setTarget(BABYLON.Vector3.Zero());

    assets = new BABYLON.AssetsManager(scene);

    tx_box = new BABYLON.CubeTexture(base_url + "/textures/obsidian/ob", scene);

   
    var tx_gold_task = assets.addTextureTask("tx-gold", base_url + "/textures/gold/gold_texture_1024.jpg");
    tx_gold_task.onSuccess = function(task) {
        tx_gold = task.texture;
    }

    var tx_sp_task = assets.addTextureTask("tx-gold-sp", base_url + "/textures/gold/gold_sp.png")
    tx_sp_task.onSuccess = function(task) {
        tx_sp = task.texture;
    }

    var tx_n_task = assets.addTextureTask("tx-gold-n", base_url + "/textures/gold/gold_n.png")
    tx_n_task.onSuccess = function(task) {
        tx_n = task.texture;
    }

    assets.onFinish = function(tasks) {

        mesh = scene.meshes[0];
        mesh.position.x = 0;
        mesh.position.y = 0;
        mesh.position.z = 0;
        mesh.rotation.y=Math.PI;

        /*** https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/src/Shaders/pbr.fragment.fx
         *
         * check extension supported
         * #ifdef BUMP# extension GL_OES_standard_derivatives: enable# endif
         * # ifdef LODBASEDMICROSFURACE# extension GL_EXT_shader_texture_lod: enable# endif
         * # ifdef LOGARITHMICDEPTH# extension GL_EXT_frag_depth: enable# endif
         */
 
        var ext_a = getWebGLExtensions(canvas);
        console.log(ext_a);
        var pbr_a = ["OES_texture_float_linear", "OES_standard_derivatives"];
        var i = 0;
        while (i <= pbr_a.length - 1) {
            if (ext_a.indexOf(pbr_a[i]) < 0) {
                console.log(pbr_a[i], " not ok");
                use_pbr = false;
                break;
            }
            i++;
        }
        //use_pbr  = true
        if (use_pbr === true) {
            mesh.optimizeIndices(function() {
                mesh.simplify([
                        { quality: 0.20, distance: 200 },
                        { quality: 0.20, distance: 175 },
                         { quality: 0.25, distance: 150 },
                        { quality: 0.35, distance: 125 },
                        { quality: 0.45, distance: 100 },
                        { quality: 0.65, distance: 85 },
                        { quality: 0.75, distance: 70 },
                        { quality: 0.85, distance: 50 }

                    ],
                    false,
                    BABYLON.SimplificationType.QUADRATIC,
                    function() {

                    });
            });

        }

 
        start_scene();

    };

    assets.load();

}


function start_scene() {

    if (use_pbr === true) {

        // Fog

        scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        scene.fogColor = new BABYLON.Color3(0, 0, 0);
        scene.fogDensity = 0.05;
        scene.fogStart = 20.0;
        scene.fogEnd = 500.0;

        //skull pbr material    

        mat = new BABYLON.PBRMaterial("skull-mat", scene);

        //0..1 
        mat.microSurface = 0.76;

        //The albedo value, also known as diffuse in standard material, controls the main color of the material. It sets up the surface color of the object.
        mat.albedoColor = new BABYLON.Color3(0.9*.5, 0.8*.5, 0.1*.5); //color or textures

        //the reflectivity color is the PBR equivalent of the specular color in the standard material. This controls the surface reflectivity of the material
        mat.reflectivityColor = new BABYLON.Color3(0.9, 0.8, 0.1);
        mat.reflectivityTexture = tx_gold;

        mat.environmentIntensity = .45;
        mat.directIntensity = .65;
        mat.cameraExposure = 5.5;
        mat.cameraContrast = 2.75

        //reflection
        mat.reflectionTexture = tx_box;

        mat.reflectionTexture.coordinatesMode = BABYLON.Texture.SPHERICAL_MODE;
        mat.reflectionFresnelParameters = new BABYLON.FresnelParameters();
        mat.reflectionFresnelParameters.power = .96;
        mat.reflectionFresnelParameters.bias = .20;
        mat.reflectionFresnelParameters.leftColor = BABYLON.Color3.Black();
        mat.reflectionFresnelParameters.rightColor = BABYLON.Color3.White();

    } else {

        mat = new BABYLON.StandardMaterial("skull-mat", scene);
        mat.diffuseColor = new BABYLON.Color3(0.9, 0.8, 0.1);
        //mat.diffuseTexture = tx_gold;

        mat.bumpTexture = tx_n;

        mat.specularColor = new BABYLON.Color3(1, 1, 1);
        mat.specularTexture = tx_sp;

        mat.specularPower = 50;

        //reflection
        mat.reflectionTexture = tx_box;
        mat.reflectionTexture.coordinatesMode = BABYLON.Texture.SPHERICAL_MODE;
        mat.reflectionFresnelParameters = new BABYLON.FresnelParameters();
        mat.reflectionFresnelParameters.power = .10;
        mat.reflectionFresnelParameters.bias = .10;
        mat.reflectionFresnelParameters.leftColor = BABYLON.Color3.White();
        mat.reflectionFresnelParameters.rightColor = BABYLON.Color3.Black();
    }

    mesh.material = mat;


    light = scene.getLightByID("Lamp")
    light.intensity = 1;
    light.position = new BABYLON.Vector3(0, 0, -100);
    console.log( light.diffuse, light.specular, light.range)

    light2 = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0), scene);
    light2.groundColor = new BABYLON.Color3(0, 0.03, 0.01);
    light2.intensity = .95;
    

    light3 = new BABYLON.PointLight("point", new BABYLON.Vector3(0, -100, 0), scene);

    angle = 0;
    scene.beforeRender = before_render;
    engine.runRenderLoop(render);


    var t1 = new TWEEN.Tween({ z: 150 })
        .to({ z: 200 }, 3500)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onUpdate(function() {
            camera.setPosition(new BABYLON.Vector3(0, 0, this.z));
        });

    t1.start();

   // scene.debugLayer.show();

    window.addEventListener('resize', resize, false);
    resize();
}

function before_render(camera) {
    mesh.rotation.y -= 0.015;
    light3.position = new BABYLON.Vector3( 60 * Math.sin(angle), 60 * Math.cos(angle), 0);
    angle += 0.025;
}


function getWebGLExtensions(canvas) {
    try {
        var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        return gl != null && !!window.WebGLRenderingContext ? gl.getSupportedExtensions() : [];
    } catch (e) {
        return []
    }
}


function init() {
    if (Detector.webgl) {
        if (BABYLON.Engine.isSupported()) {

            stats = new rStats(rstats_obj);
            canvas = document.getElementById("webgl-canvas");
            engine = new BABYLON.Engine(canvas, false, null, true);
            BABYLON.SceneLoader.Load("", base_url + "/skull/skull-ok.babylon", engine, function(loaded_scene) {
                scene = loaded_scene;
                scene.executeWhenReady(on_init_scene);
            }, on_progress_scene);

        }
    } else {
        Detector.addGetWebGLMessage();
    }
}
//   /init

document.onselectstart = function() {
    return false;
}

onDomReady(init);