var rstats_obj = {
    values: {
        frame: {
            caption: 'Total frame time (ms)',
            over: 16.67
        },
        raf: {
            caption: 'Time since last rAF (ms)'
        },
        fps: {
            caption: 'Framerate (FPS)',
            below: 30
        }
    }
}

/* vars */

var canvas, engine, scene, assets, material, mesh, light, camera, assets, light3, mesh, angle = 0,
    tx_box, tx_gold, tx_mat;


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

    var h = window.innerHeight;
    c.style.height = h + "px";
    c.style.width = (aspect * h) + "px"

    engine.resize();
}

function before_render(camera) {


    mesh.rotation.y -= 0.015;
    light.position = new BABYLON.Vector3(60 * Math.sin(angle), 0, 60 * Math.cos(angle));
    light3.position = new BABYLON.Vector3(60 * Math.sin(angle), 60 * Math.cos(angle), 0);
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

    mesh.optimizeIndices(function() {
        mesh.simplify([
                { quality: 0.55, distance: 200 },
                { quality: 0.65, distance: 100 },
                { quality: 0.75, distance: 50 },
                { quality: 0.95, distance: 10 }
            ],
            false,
            BABYLON.SimplificationType.QUADRATIC);
    });
    mesh.position.x = 0;
    mesh.position.y = 0;
    mesh.position.z = 0;

    tx_box = new BABYLON.CubeTexture("textures/obsidian/ob", scene);

    var tx_gold_task= assets.addTextureTask("tx-gold", "textures/gold/gold_texture_1024.jpg");
    tx_gold_task.onSuccess = function(task) {
        tx_gold = task.texture;
    }

    var tx_sp_task= assets.addTextureTask("tx-gold-sp", "textures/gold/gold_texture_1024_sp.jpg");
    tx_sp_task.onSuccess = function(task) {
        tx_sp = task.texture;
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
    box_mat.cameraExposure = 0.66;
    box_mat.cameraContrast = 1.66;
    box_mat.diffuseColor = new BABYLON.Color3(0, 0, 0);
    box_mat.specularColor = new BABYLON.Color3(0, 0, 0);
    box_mat.disableLighting = true;
    box_mat.infiniteDistance = true;
    box_mat.backFaceCulling = false;
    box.material = box_mat;

    var use_pbr = true;

    if (use_pbr == true) {
        //skull pbr material    
        mat = new BABYLON.PBRMaterial("skull-mat", scene);

        mat.microSurface = .75;
        mat.albedoColor = new BABYLON.Color3(0.05, 0.03, 0.01);
        mat.albedoTexture = tx_gold

        mat.reflectivityColor = new BABYLON.Color3(0.9, 0.8, 0.2);
        //mat.reflectivityTexture =  tx_sp;

        mat.environmentIntensity = .5;
        mat.directIntensity = .5;
        mat.cameraExposure = 1.66;
        mat.cameraContrast = 1.66;
        mat.usePhysicalLightFalloff = true;

        //reflection
        mat.reflectionTexture = tx_box;
        mat.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        mat.reflectionFresnelParameters = new BABYLON.FresnelParameters();
        mat.reflectionFresnelParameters.power = .55;
        mat.reflectionFresnelParameters.bias = .25;
        mat.reflectionFresnelParameters.leftColor = BABYLON.Color3.White();
        mat.reflectionFresnelParameters.rightColor = BABYLON.Color3.Black()
            //refraction

        mat.refractionTexture = tx_box;
        mat.refractionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        mat.refractionFresnelParameters = new BABYLON.FresnelParameters();
        mat.refractionFresnelParameters.leftColor = BABYLON.Color3.White();
        mat.refractionFresnelParameters.rightColor = BABYLON.Color3.Black();
        mat.refractionFresnelParameters.bias = .2;
        mat.refractionFresnelParameters.power = .55;

        mat.linkRefractionWithTransparency = true;


    } else {

        //skull standard material
        var mat = new BABYLON.StandardMaterial("skull-mat", scene);

        mat.diffuseColor = new BABYLON.Color3(0.9, 0.8, 0.2);
        //mat.bumpTexture = tx_gold;

        mat.specularColor = new BABYLON.Color3(1, 1, 1);

        mat.ambientColor = new BABYLON.Color3(0.0, 0.0, 0.0);
        mat.emissiveColor = new BABYLON.Color3(0.0, 0.0, 0.0);
        mat.specularPower = 20;
        mat.alpha = 1.0;

        //reflection
        mat.reflectionTexture = tx_box;
        mat.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        mat.reflectionFresnelParameters = new BABYLON.FresnelParameters();
        mat.reflectionFresnelParameters.power = .85;
        mat.reflectionFresnelParameters.bias = .15;
        mat.reflectionFresnelParameters.leftColor = BABYLON.Color3.White();
        mat.reflectionFresnelParameters.rightColor = BABYLON.Color3.Black();

        mat.emissiveFresnelParameters = new BABYLON.FresnelParameters();
        mat.emissiveFresnelParameters.bias = 0.15;
        mat.emissiveFresnelParameters.power = .85;
        mat.emissiveFresnelParameters.leftColor = BABYLON.Color3.White();
        mat.emissiveFresnelParameters.rightColor = BABYLON.Color3.Black();

        //refraction
        mat.refractionTexture = tx_box;
        mat.refractionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        mat.refractionFresnelParameters = new BABYLON.FresnelParameters();
        mat.refractionFresnelParameters.leftColor = BABYLON.Color3.White();
        mat.refractionFresnelParameters.rightColor = BABYLON.Color3.Black();
        mat.refractionFresnelParameters.bias = 0;
        mat.refractionFresnelParameters.power = .35;

    }

    mesh.material = mat;

    light = scene.lights[0];
    light.diffuseColor = new BABYLON.Color3(1, 1, 1);
    light.specularColor = new BABYLON.Color3(1, 1, 1);
    light.intensity = .5;

    var light2 = new BABYLON.HemisphericLight("hemi-2", new BABYLON.Vector3(0, 0, 30), scene);
    light2.diffuse = new BABYLON.Color3(1, 1, 1);
    light2.specular = new BABYLON.Color3(1, 1, 1);
    light2.groundColor = new BABYLON.Color3(0, 0, 0);
    light2.intensity = .7;

    light3 = new BABYLON.PointLight("point-3", new BABYLON.Vector3(0, 0, -100), scene);
    light3.diffuse = new BABYLON.Color3(1, 1, 1);
    light3.specular = new BABYLON.Color3(1, 1, 1);
    light3.intensity = .5;


    window.addEventListener('resize', resize, false);
    resize();

    angle = 0;
    scene.beforeRender = before_render;
    engine.runRenderLoop(render);

    scene.debugLayer.show();

    var t1 = new TWEEN.Tween({ z: 150 })
        .to({ z: 200 }, 5000)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onUpdate(function() {
            camera.setPosition(new BABYLON.Vector3(0, 0, this.z));
        });

    t1.start();
}

function init() {
    if (Detector.webgl) {
        if (BABYLON.Engine.isSupported()) {

            document.onselectstart = function() {
                return false;
            }

            stats = new rStats(rstats_obj);
            canvas = document.getElementById("webgl-canvas");
            engine = new BABYLON.Engine(canvas, true);

            engine.loadingUIText = "loading";

            BABYLON.SceneLoader.Load("", "skull/skull-ok.babylon", engine, function(loaded_scene) {
                
                scene = loaded_scene;
                scene.executeWhenReady(on_init_scene);

            }, on_progress_scene);

        }
    } else {
        Detector.addGetWebGLMessage();
    }
}
//   /init
head.ready(document, init);
