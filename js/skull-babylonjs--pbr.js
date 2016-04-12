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

  
    var c = document.getElementById("webgl-demo");

    var h = .90*window.innerHeight;
    var mr = (window.innerHeight -  h)/2;
    c.style.height = h + "px";
    c.style.marginTop=mr+"px"
    c.style.marginBottom=mr+"px"

    engine.resize();
}

function before_render(camera) {

    mesh.rotation.y -= 0.015;
  
    light.position = new BABYLON.Vector3(20 * Math.sin(angle), 20 * Math.cos(angle), 0);
    angle += 0.025;
    /*scene.lights.forEach(function(l) {        
    });*/
}


function on_progress_scene(progress) {

}

function on_init_scene() {

    camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, BABYLON.Vector3.Zero(), scene);

    scene.activeCamera = camera;
    camera.attachControl(canvas, true);    
    camera.minZ = 20;
    camera.maxZ = 400;
    camera.radius = 100;

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
        start_scene();
    };

    assets.load();
}

function start_scene() {

    box = BABYLON.Mesh.CreateBox("sky-box", 800.0, scene);

    box_mat = new BABYLON.PBRMaterial("skull-box-mat", scene);
    box_mat.reflectionTexture = tx_box;
    box_mat.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    box_mat.microSurface = 1.0;
    box_mat.cameraExposure = 1;
    box_mat.cameraContrast = 3.0;
    box_mat.diffuseColor = new BABYLON.Color3(0, 0, 0);
    box_mat.specularColor = new BABYLON.Color3(1, 1, 1);

    box_mat.disableLighting = true;
    box_mat.infiniteDistance = true;
    box_mat.backFaceCulling = false;

    box.material = box_mat;

    /*** https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/src/Shaders/pbr.fragment.fx
    *
    *
    * #ifdef BUMP# extension GL_OES_standard_derivatives: enable# endif
    * # ifdef LODBASEDMICROSFURACE# extension GL_EXT_shader_texture_lod: enable# endif
    * # ifdef LOGARITHMICDEPTH# extension GL_EXT_frag_depth: enable# endif
    */

    var use_pbr = true;
    var ext_a = getWebGLExtensions(canvas);
    var pbr_a = ["GL_EXT_shader_texture_lod", "GL_EXT_frag_depth", "GL_OES_standard_derivatives"];
    var i = 0;
    while (i <= pbr_a.length - 1) {
        if (ext_a.indexOf(pbr_a[i]) !== -1) {
            use_pbr = false;
            break;
        }
        /*else{
            console.log(pbr_a[i]," ok");

        }*/
        i++;
    }

    //use_pbr = false;

    if (use_pbr === true){

         // Fog
        scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        scene.fogColor = new BABYLON.Color3(0, 0, 0);
        scene.fogStart = 20.0;
        scene.fogEnd = 400.0;

         //skull pbr material    

        mat = new BABYLON.PBRMaterial("skull-mat", scene);

        //0..1 
        mat.microSurface = .90;

        //The albedo value, also known as diffuse in standard material, controls the main color of the material. It sets up the surface color of the object.
        mat.albedoColor = new BABYLON.Color3(0.25, 0.23, 0.11); //color or textures

       //the reflectivity color is the PBR equivalent of the specular color in the standard material. This controls the surface reflectivity of the material
        mat.reflectivityColor = new BABYLON.Color3(0.9, 0.8, 0.1);
        mat.reflectivityTexture = tx_gold;
        
        mat.environmentIntensity = .15;
        mat.directIntensity = .85;

        mat.cameraExposure = 10.0;
        mat.cameraContrast = 2.66;
       
        //reflection
        mat.reflectionTexture = tx_box;
        mat.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

        mat.reflectionFresnelParameters = new BABYLON.FresnelParameters();
        mat.reflectionFresnelParameters.power = .10;
        mat.reflectionFresnelParameters.bias = .15;
        mat.reflectionFresnelParameters.leftColor = BABYLON.Color3.White();
        mat.reflectionFresnelParameters.rightColor = BABYLON.Color3.Black()
       
    }
    else{


        mat = new BABYLON.StandardMaterial("skull-mat", scene);
        //mat.diffuseColor = new BABYLON.Color3(0.9, 0.8, 0.1);
        mat.diffuseTexture = tx_gold;

        mat.specularColor = new BABYLON.Color3(1, 1, 1);
        mat.specularTexture = tx_sp;

        mat.bumpTexture = tx_n;

        mat.specularPower = 50;
   
        //reflection
        mat.reflectionTexture = tx_box;
        mat.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

        mat.reflectionFresnelParameters = new BABYLON.FresnelParameters();
        mat.reflectionFresnelParameters.power = .10;
        mat.reflectionFresnelParameters.bias = .15;
        mat.reflectionFresnelParameters.leftColor = BABYLON.Color3.White();
        mat.reflectionFresnelParameters.rightColor = BABYLON.Color3.Black()

   }

    mesh = scene.meshes[0];
    mesh.material = mat;
    mesh.position.x = 0;
    mesh.position.y = 0;
    mesh.position.z = 0; 
    mesh.optimizeIndices(function() {
        mesh.simplify([
                { quality: 0.15, distance: 200 },
                { quality: 0.15, distance: 100 },
                { quality: 0.35, distance: 50 },
                { quality: 0.75, distance: 20 }
            ],
            false,
            BABYLON.SimplificationType.QUADRATIC);
    });


    light = scene.lights[0];
    light.diffuseColor = new BABYLON.Color3(1, 1, 1);
    light.specularColor = new BABYLON.Color3(1, 1, 1);
    light.intensity = .95;
    light.position = new BABYLON.Vector3(0, 0, 0);

    light2 = new BABYLON.HemisphericLight("hemi-2", new BABYLON.Vector3(0, 0, 30), scene);
    light2.diffuse = new BABYLON.Color3(1, 1, 1);
    light2.specular = new BABYLON.Color3(1, 1, 1);
    light2.groundColor = new BABYLON.Color3(0.05, 0.03, 0.01);
    light2.intensity = .95;

    angle = 0;
    scene.beforeRender = before_render;
    engine.runRenderLoop(render);

    //scene.debugLayer.show();

    window.addEventListener('resize', resize, false);
    resize();

    var t1 = new TWEEN.Tween({ z: 150 })
        .to({ z: 200 }, 3500)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onUpdate(function() {
            camera.setPosition(new BABYLON.Vector3(0, 0, this.z));
        });

    t1.start();
}


function getWebGLExtensions(canvas) {
    var gl;
    try {
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        return gl != null && !!window.WebGLRenderingContext ? gl.getSupportedExtensions() : [];
    } catch (e) {
        return []
    }
}


function init() {
    if (Detector.webgl) {
        if (BABYLON.Engine.isSupported()) {

            document.onselectstart = function() {
                return false;
            }

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

onDomReady(init);
