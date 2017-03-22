define([

    "domready",

    "tween",

    "detector",

    "datgui",

    "rstats",

    "babylon"

    /*"require"*/

], function (

	domReady,

	TWEEN,

	Detector,

	GUI,

	rStats,

	BABYLON

	/*, require*/
) {

	"use strict";

	function Skull() {


	}

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
	};

	var delta, now,
		then = Date.now(),
		fps = 60,
		fr = 1000 / fps;

	var time;

	/* vars */

	var canvas, engine, scene, assets, material, mesh, light, light2, camera, assets, light3, mesh, angle = 0,

		tx_box, tx_gold, tx_mat, tx_n, tx_sp,

		box, box_mat,

		use_pbr = true,

		base_url = "https://spleennooname.github.io/skull-pbr/assets";


	var ready = function () {

			if (Detector.webgl) {
				if (BABYLON.Engine.isSupported()) {

					canvas = document.getElementById("webgl-canvas");
					engine = new BABYLON.Engine(canvas, false, null, true);

					BABYLON.SceneLoader.Load("", base_url + "/skull-ok.babylon", engine, function (loaded_scene) {
						scene = loaded_scene;
						scene.executeWhenReady(oninit);
					}, onprogress);

				}
			} else {
				Detector.addGetWebGLMessage();
			}

		},

		oninit = function () {

			camera = new BABYLON.ArcRotateCamera("Camera", 1, .75, 100, BABYLON.Vector3.Zero(), scene);

			scene.activeCamera = camera;
			camera.attachControl(canvas, true);
			camera.minZ = 20;
			camera.maxZ = 800;
			camera.setTarget(BABYLON.Vector3.Zero());

			assets = new BABYLON.AssetsManager(scene);

			tx_box = new BABYLON.CubeTexture(base_url + "/textures/obsidian/ob", scene);

			var tx_gold_task = assets.addTextureTask("tx-gold", base_url + "/textures/gold/gold_texture_1024.jpg");
			tx_gold_task.onSuccess = function (task) {
				tx_gold = task.texture;
			}

			var tx_sp_task = assets.addTextureTask("tx-gold-sp", base_url + "/textures/gold/gold_sp.png")
			tx_sp_task.onSuccess = function (task) {
				tx_sp = task.texture;
			}

			var tx_n_task = assets.addTextureTask("tx-gold-n", base_url + "/textures/gold/gold_n.png")
			tx_n_task.onSuccess = function (task) {
				tx_n = task.texture;
			}

			assets.load();
			assets.onFinish = function (tasks) {


				mesh = scene.meshes[0];
				mesh.position.x = 0;
				mesh.position.y = 0;
				mesh.position.z = 0;
				mesh.rotation.y = Math.PI;

				mesh.optimizeIndices(function () {
					mesh.simplify([
							{
								quality: 0.20,
								distance: 200
							},
							{
								quality: 0.20,
								distance: 175
							},
							{
								quality: 0.25,
								distance: 150
							},
							{
								quality: 0.35,
								distance: 125
							},
							{
								quality: 0.45,
								distance: 100
							},
							{
								quality: 0.65,
								distance: 85
							},
							{
								quality: 0.75,
								distance: 70
							},
							{
								quality: 0.85,
								distance: 50
							}

                        ],
						false,
						BABYLON.SimplificationType.QUADRATIC);
				});

				// Fog

				scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
				scene.fogColor = new BABYLON.Color3(0, 0, 0);
				scene.fogDensity = 0.05;
				scene.fogStart = 20.0;
				scene.fogEnd = 500.0;

				//skull pbr material

				material = new BABYLON.PBRMaterial("skull-mat", scene);

				//0..1
				material.microSurface = 0.76;

				//The albedo value, also known as diffuse in standard material, controls the main color of the material. It sets up the surface color of the object.
				material.albedoColor = new BABYLON.Color3(0.9 * .5, 0.8 * .5, 0.1 * .5); //color or textures

				//the reflectivity color is the PBR equivalent of the specular color in the standard material. This controls the surface reflectivity of the material
				material.reflectivityColor = new BABYLON.Color3(0.9, 0.8, 0.1);
				material.reflectivityTexture = tx_gold;

				material.environmentIntensity = .45;
				material.directIntensity = .65;
				material.cameraExposure = 5.5;
				material.cameraContrast = 2.75

				//reflection
				material.reflectionTexture = tx_box;

				material.reflectionTexture.coordinatesMode = BABYLON.Texture.SPHERICAL_MODE;
				material.reflectionFresnelParameters = new BABYLON.FresnelParameters();
				material.reflectionFresnelParameters.power = .96;
				material.reflectionFresnelParameters.bias = .20;
				material.reflectionFresnelParameters.leftColor = BABYLON.Color3.Black();
				material.reflectionFresnelParameters.rightColor = BABYLON.Color3.White();

				mesh.material = material;


				light = scene.getLightByID("Lamp");
				light.intensity = 1;
				light.position = new BABYLON.Vector3(0, 0, -100);

				console.log(light.diffuse, light.specular, light.range)

				light2 = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0), scene);
				light2.groundColor = new BABYLON.Color3(0, 0.03, 0.01);
				light2.intensity = .95;

				light3 = new BABYLON.PointLight("point", new BABYLON.Vector3(0, -100, 0), scene);

				angle = 0;
				then = Date.now();
				scene.beforeRender = before_render;
				engine.runRenderLoop(render);

				var t1 = new TWEEN.Tween({
						z: 150
					})
					.to({
						z: 200
					}, 3500)
					.easing(TWEEN.Easing.Exponential.InOut)
					.onUpdate(function () {
						camera.setPosition(new BABYLON.Vector3(0, 0, this.z));
					});

				t1.start();

				window.addEventListener('resize', resize, false);
				resize();


			};
		},

		onprogress = function () {

		},

		onload = function () {

			window.addEventListener('resize', resize, false);
			render();

		},

		resize = function () {
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

		},

		before_render = function (camera) {
			mesh.rotation.y -= 0.015;
			light3.position = new BABYLON.Vector3(60 * Math.sin(angle), 60 * Math.cos(angle), 0);
			angle += 0.025;
		},

		render = function () {

			now = Date.now();
			delta = now - then;

			if (delta > fr) {
				scene.render();
				TWEEN.update();
			}

		}

	domReady(ready);

	return Skull;

});
