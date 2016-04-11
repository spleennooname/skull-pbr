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

    var aspect = 4 / 3;

    var c = document.getElementById("webgl-demo");
    var h = (3 / 4) * c.clientWidth;

    c.style.height = h + "px";
    //c.style.width = (aspect * h) + "px"

    engine.resize();
}

function before_render(camera) {

    mesh.rotation.y -= 0.015;

    camera.parent = light; //light.position = new BABYLON.Vector3(60 * Math.sin(angle), 0, 60 * Math.cos(angle));

    light3.position = new BABYLON.Vector3(20 * Math.sin(angle), 20 * Math.cos(angle), 0);
    //light.position = camera.position;

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

    mesh = scene.meshes[0];

    camera.target = mesh;
    camera.minZ = 10;
    //camera.maxZ = 200;
    camera.setPosition(new BABYLON.Vector3(0, 0, 100));
    camera.radius = 100;

    assets = new BABYLON.AssetsManager(scene);

    // Fog
    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
    scene.fogColor = new BABYLON.Color3(0, 0, 0);
    scene.fogStart = 20.0;
    scene.fogEnd = 1000.0;

    mesh.position.x = 0;
    mesh.position.y = 0;
    mesh.position.z = 0;
    //mesh.rotation.y = 2.0;

    mesh.optimizeIndices(function() {
        mesh.simplify([
                { quality: 0.15, distance: 200 },
                { quality: 0.25, distance: 100 },
                { quality: 0.25, distance: 50 },
                { quality: 0.25, distance: 10 }
            ],
            false,
            BABYLON.SimplificationType.QUADRATIC);
    });

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

    var box = BABYLON.Mesh.CreateBox("sky-box", 800.0, scene);

    var box_mat = new BABYLON.PBRMaterial("skull-box-mat", scene);

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
    # ifdef LODBASEDMICROSFURACE# extension GL_EXT_shader_texture_lod: enable# endif
    # ifdef LOGARITHMICDEPTH# extension GL_EXT_frag_depth: enable# endif
    */

    var use_pbr = true;
    var ext_a =  getWebGLExtensions(canvas) ;
    var pbr_a = ["GL_EXT_shader_texture_lod","GL_EXT_frag_depth","GL_OES_standard_derivatives"];
    var i = 0;
    while( i <= pbr_a.length-1 ){
        if ( ext_a.indexOf(pbr_a[i]) !== -1 ){
            use_pbr = false;
            break;
        }
        else{
            console.log(pbr_a[i]," ok");

        }
        i++;
    }

    //ext_a.every(function( el ){ return item.length > 0 });
    // true


    /**var shader_mat = new BABYLON.ShaderMaterial("amiga", scene, "./shaders",{
            attributes: ["position", "normal", "uv"],
            uniforms: ["world", "worldView", "worldViewProjection"]
        });
    shader_mat.setTexture("textureSampler", tx_gold);*/

    /**var standardPipeline = new BABYLON.PostProcessRenderPipeline(engine, "standardPipeline");    
    var blackAndWhiteEffect = new BABYLON.PostProcessRenderEffect(engine, "blackAndWhiteEffect",  function() {return new BABYLON.BlackAndWhitePostProcess("bw", 1.0, null, null, engine, true)});  
      
    standardPipeline.addEffect(blackAndWhiteEffect);   
    scene.postProcessRenderPipelineManager.addPipeline(standardPipeline);*/

    //shader_mat.setTexture("refSampler", refTexture);
    //shader_mat.setFloat("time", 0);
    //shader_mat.setVector3("cameraPosition", BABYLON.Vector3.Zero());


    //  post fx
    // BlackAndWhitePostProcess(name, ratio, camera, samplingMode, engine, reusable)
    //var postProcess = new BlackAndWhitePostProcess("wb", 1.0, true, engine, true)

    // attach post fx
    //camera.attachPostProcess(postProcess);

    if (use_pbr === true) {

        //skull pbr material    

        mat = new BABYLON.PBRMaterial("skull-mat", scene);

        mat.microSurface = .76;
        mat.albedoColor = new BABYLON.Color3(0.05, 0.03, 0.01);
        mat.albedoTexture = tx_n;

        mat.reflectivityColor = new BABYLON.Color3(0.9, 0.8, 0.1);
        mat.reflectivityTexture = tx_gold;

        mat.environmentIntensity = .5;
        mat.directIntensity = 1.25;

        mat.cameraExposure = 5.0;
        mat.cameraContrast = 2.25;

        mat.emissiveColor = new BABYLON.Color3(0.05, 0.03, 0.01);

        //reflection
        mat.reflectionTexture = tx_box;
        mat.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        mat.reflectionFresnelParameters = new BABYLON.FresnelParameters();
        mat.reflectionFresnelParameters.power = .10;
        mat.reflectionFresnelParameters.bias = .15;
        mat.reflectionFresnelParameters.leftColor = BABYLON.Color3.White();
        mat.reflectionFresnelParameters.rightColor = BABYLON.Color3.Black()

        //refraction
        mat.refractionTexture = tx_box;
        mat.refractionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        mat.refractionFresnelParameters = new BABYLON.FresnelParameters();
        mat.refractionFresnelParameters.leftColor = BABYLON.Color3.White();
        mat.refractionFresnelParameters.rightColor = BABYLON.Color3.Black();
        mat.refractionFresnelParameters.bias = .15;
        mat.refractionFresnelParameters.power = .10;

    } else     {

           //skull standard material
           mat = new BABYLON.StandardMaterial("skull-mat", scene);

           mat.diffuseColor = new BABYLON.Color3(0.9, 0.8, 0.1);
           mat.diffuseTexture = tx_gold;

           mat.specularColor = new BABYLON.Color3(0.9, 0.8, 0.1);
           mat.specularTexture =  tx_sp;

           mat.ambientColor = new BABYLON.Color3(0.0, 0.0, 0.0);
           mat.emissiveColor = new BABYLON.Color3(0.0, 0.0, 0.0);
           mat.specularPower = 30;
           mat.alpha = 1.0;

           //emissive
           mat.emissiveTexture =  tx_gold;  
           mat.emissiveFresnelParameters = new BABYLON.FresnelParameters();
           mat.emissiveFresnelParameters.bias = 0.25;
           mat.emissiveFresnelParameters.power = .25;
           mat.emissiveFresnelParameters.leftColor = BABYLON.Color3.White();
           mat.emissiveFresnelParameters.rightColor = BABYLON.Color3.Black();

           //reflection
           /*mat.reflectionTexture = tx_box;        
           mat.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
           mat.reflectionFresnelParameters = new BABYLON.FresnelParameters();
           mat.reflectionFresnelParameters.power = .25;
           mat.reflectionFresnelParameters.bias = .25;
           mat.reflectionFresnelParameters.leftColor = BABYLON.Color3.White();
           mat.reflectionFresnelParameters.rightColor = BABYLON.Color3.Black()

       

           //refraction
           mat.refractionTexture = tx_box;
           mat.refractionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
           mat.refractionFresnelParameters = new BABYLON.FresnelParameters();
           mat.refractionFresnelParameters.leftColor = BABYLON.Color3.White();
           mat.refractionFresnelParameters.rightColor = BABYLON.Color3.Black();
           mat.refractionFresnelParameters.bias = .25;
           mat.refractionFresnelParameters.power = .25;*/

    }

    mesh.material = mat;

    light = scene.lights[0];
    light.diffuseColor = new BABYLON.Color3(1, 1, 1);
    light.specularColor = new BABYLON.Color3(1, 1, 1);
    light.intensity = .95;
    light.position = new BABYLON.Vector3(0, 0, 0);

    light2 = new BABYLON.HemisphericLight("hemi-2", new BABYLON.Vector3(0, 0, 30), scene);
    light2.diffuse = new BABYLON.Color3(1, 1, 1);
    light2.specular = new BABYLON.Color3(1, 1, 1);
    light2.groundColor = new BABYLON.Color3(0.05, 0.03, 0.01);
    light2.intensity = .75;

    light3 = new BABYLON.PointLight("point-3", new BABYLON.Vector3(0, 0, -100), scene);
    light3.diffuse = new BABYLON.Color3(1, 1, 1);
    light3.specular = new BABYLON.Color3(1, 1, 1);
    light3.intensity = .75;

    angle = 0;
    scene.beforeRender = before_render;
    engine.runRenderLoop(render);

    //scene.debugLayer.show();

    window.addEventListener('resize', resize, false);
    resize();

    var t1 = new TWEEN.Tween({ z: 150 })
        .to({ z: 200 }, 4000)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onUpdate(function() {
            camera.setPosition(new BABYLON.Vector3(0, 0, this.z));
        });

    t1.start();
}


function getWebGLExtensions(canvas) {
    var gl ;
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
            engine.enableOfflineSupport = true;

          
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
