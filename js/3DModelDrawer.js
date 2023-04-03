/* Follow the tutorial here:
https://tympanus.net/codrops/2019/10/14/how-to-create-an-interactive-3d-character-with-three-js/
*/

(function() {
	// Set our main variables
	let scene,
		renderer,
		canvas,
		camera,
		model,                              // Our character
		textObject,
		modelScreenCoordinate,
		textObjectScreenCoordinate,
		neck,                               // Reference to the neck bone in the skeleton
		waist,                               // Reference to the waist bone in the skeleton
		onModelClickAnimations,              // Animations when click the model
		onTextClickAnimations,               // Animations when click the text
		lastModelClickAnimationID,
		mixer,                              // THREE.js animations mixer
		textObjectMixer,
		idle,                               // Idle, the default state our character returns to
		minFOV = 50,
		maxFOV = 105,
		clock = new THREE.Clock(),          // Used for anims, which run to a clock instead of frame rate
		textAnimationClock = new THREE.Clock(),
		textAnimationAction,
		currentlyAnimating = false,         // Used to check whether characters neck is being used in another anim
		raycaster = new THREE.Raycaster();

	init();
	update();


	function init() {

		const MODEL_PATH = './assets/aknbb.glb';
		canvas = document.getElementById('resume');
		const backgroundColor = 0xdbdbdb;

		// Init the scene
		scene = new THREE.Scene();
		scene.background = new THREE.Color(backgroundColor);
		scene.fog = new THREE.Fog(backgroundColor, 60, 100);

		// Init the renderer
		renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
		renderer.shadowMap.enabled = true;
		renderer.setPixelRatio(window.devicePixelRatio);

		// Add a camera
		camera = new THREE.PerspectiveCamera(
			50,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.z = 30;

		// let stacy_txt = new THREE.TextureLoader().load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy.jpg');
		// stacy_txt.flipY = false;

		// const stacy_mtl = new THREE.MeshPhongMaterial({
		// 	map: stacy_txt,
		// 	color: 0xffffff,
		// 	skinning: true
		// });


		var loader = new THREE.GLTFLoader();

		loader.load(
			MODEL_PATH,
			function(gltf) {
				model = gltf.scene;
				let fileAnimations = gltf.animations;

				model.traverse(o => {

					if (o.isMesh) {
						o.castShadow = true;
						o.receiveShadow = true;
						// o.material = stacy_mtl;
					}
					// Reference the neck and waist bones
					if (o.isBone && o.name === 'Neck') {
						neck = o;
					}
					if (o.isBone && o.name === 'Spine') {
						waist = o;
					}
				});

				model.scale.set(7, 7, 7);
				model.position.y = -10;
				model.position.x = 12;
				scene.add(model);

				const vector = new THREE.Vector3();
				const canvas = renderer.domElement;
				model.updateMatrixWorld();
				vector.setFromMatrixPosition(model.matrixWorld);
				vector.project(camera);
				const x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
				const y = Math.round((0.5 - vector.y / 4) * (canvas.height / window.devicePixelRatio));
				modelScreenCoordinate = {x, y};

				mixer = new THREE.AnimationMixer(model);

				let animationClips = fileAnimations.filter(val => val.name !== 'idle');
				onModelClickAnimations = animationClips.map(val => {
						let clip = THREE.AnimationClip.findByName(animationClips, val.name);

						clip.tracks.splice(3, 3);
						clip.tracks.splice(9, 3);

						clip = mixer.clipAction(clip);
						return clip;
					}
				);
				onTextClickAnimations = onModelClickAnimations.filter(anim => anim._clip.name === 'dance');
				onModelClickAnimations = onModelClickAnimations.filter(anim => anim._clip.name !== 'dance');

				let idleAnim = THREE.AnimationClip.findByName(fileAnimations, 'idle');

				idleAnim.tracks.splice(3, 3);
				idleAnim.tracks.splice(9, 3);

				idle = mixer.clipAction(idleAnim);
				idle.play();

			},
			undefined, // We don't need this function
			function(error) {
				console.error(error);
			}
		);

		const fontLoader = new THREE.FontLoader();
		fontLoader.load( 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/fonts/helvetiker_bold.typeface.json', function ( font ) {

			var textGeometry = new THREE.TextGeometry( "Click to see \n    Resume", {

				font: font,

				size: 2,
				height: 1,
				curveSegments: 3,

				bevelThickness: 0.2,
				bevelSize: 0.2,
				bevelEnabled: true

			});

			var textMaterial = new THREE.MeshPhongMaterial(
				{ color: 0x0284ad, specular: 0xd1d1d1 }
			);

			textObject = new THREE.Mesh( textGeometry, textMaterial );
			textObject.position.x = -16;
			textObject.name = "resumeText";
			var bbox = new THREE.BoundingBoxHelper(textObject, 0xffffff);
			bbox.name = "resumeTextBBOX";
			bbox.material.visible = false;
			bbox.update();
			scene.add(textObject);
			scene.add(bbox);

			const vector = new THREE.Vector3();
			textObject.updateMatrixWorld();
			vector.setFromMatrixPosition(textObject.matrixWorld);
			vector.project(camera);
			const x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
			const y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio));
			textObjectScreenCoordinate = {x, y};

			textObjectMixer = new THREE.AnimationMixer(textObject);
			let track = new THREE.VectorKeyframeTrack(
				'.position',
				[0, 1, 2],
				[
					textObject.position.x,
					textObject.position.y,
					textObject.position.z,
					textObject.position.x,
					textObject.position.y,
					textObject.position.z - 6,
					textObject.position.x,
					textObject.position.y,
					textObject.position.z,
				]
			);
			const animationClip = new THREE.AnimationClip(null, 0.15, [track]);
			textAnimationAction = textObjectMixer.clipAction(animationClip);
			textAnimationAction.setLoop(THREE.LoopOnce);
		} );

		let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
		hemiLight.position.set(0, 50, 0);
		scene.add(hemiLight);

		let dirLight = new THREE.DirectionalLight(0xffffff, 0.3);
		dirLight.position.set(0, 50, 8);
		scene.add(dirLight);

		const light = new THREE.PointLight( backgroundColor, 0.6, 100 );
		light.position.set(0, 24, 8);
		light.castShadow = true;
		scene.add(light);
		light.shadow.mapSize.width = 1024;
		light.shadow.mapSize.height = 1024;
		light.shadow.camera.near = 0.5;
		light.shadow.camera.far = 500;



		// Floor
		let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
		let floorMaterial = new THREE.MeshPhongMaterial({
			color: backgroundColor,
			shininess: 0
		});
		let floor = new THREE.Mesh(floorGeometry, floorMaterial);
		floor.rotation.x = -0.5 * Math.PI;
		floor.receiveShadow = true;
		floor.position.y = -10;
		scene.add(floor);

		let geometry = new THREE.SphereGeometry(8, 32, 32);
		let material = new THREE.MeshBasicMaterial({ color: 0xd6bc02 });
		let sphere = new THREE.Mesh(geometry, material);
		sphere.position.x = 20;
		sphere.position.y = -2;
		sphere.position.z = -24;
		scene.add(sphere);
	}

	function update() {
		if (mixer) {
			mixer.update(clock.getDelta());
		}

		if (textObjectMixer) {
			textObjectMixer.update(textAnimationClock.getDelta());
		}

		if (resizeRendererToDisplaySize(renderer)) {
			const aspect = canvas.clientWidth / canvas.clientHeight;
			camera.aspect = aspect;
			const fov = Math.min(maxFOV, Math.max(minFOV, (((1.5 - aspect) * 55) + 50)));
			camera.fov = fov;
			camera.updateProjectionMatrix();
		}

		renderer.render(scene, camera);
		requestAnimationFrame(update);
	}


	function resizeRendererToDisplaySize(renderer) {
		const width = Math.min(document.documentElement.clientWidth, window.innerWidth);
		const height = Math.min(document.documentElement.clientHeight, window.innerHeight);
		let canvasPixelWidth = canvas.width / window.devicePixelRatio;
		let canvasPixelHeight = canvas.height / window.devicePixelRatio;

		const needResize =
			canvasPixelWidth !== width || canvasPixelHeight !== height;
		if (needResize) {
			renderer.setSize(width, height, false);
		}
		return needResize;
	}

	if ('ontouchend' in document) {
		canvas.addEventListener('touchend', e => raycast(e, true));
	} else {
		canvas.addEventListener('click', e => raycast(e));
	}
	function raycast(e, touch = false) {
		var mouse = {};
		if (touch) {
			mouse.x = 2 * (e.changedTouches[0].clientX / window.innerWidth) - 1;
			mouse.y = 1 - 2 * (e.changedTouches[0].clientY / window.innerHeight);
		} else {
			mouse.x = 2 * (e.clientX / window.innerWidth) - 1;
			mouse.y = 1 - 2 * (e.clientY / window.innerHeight);
		}
		// update the picking ray with the camera and mouse position
		raycaster.setFromCamera(mouse, camera);

		// calculate objects intersecting the picking ray
		var intersects = raycaster.intersectObjects(scene.children, true);

		if (intersects[0]) {
			var object = intersects[0].object;

			if (object.parent && object.parent.name === 'akin') {
				if (!currentlyAnimating) {
					currentlyAnimating = true;
					lastModelClickAnimationID = randomize(lastModelClickAnimationID, onModelClickAnimations.length-1);
					console.log("last :" + lastModelClickAnimationID);
					playModifierAnimation(idle, 0.25,  onModelClickAnimations[lastModelClickAnimationID], 0.25);
				}
			}

			if (object.name === 'resumeText' || object.name === 'resumeTextBBOX') {
				if (!currentlyAnimating) {
					currentlyAnimating = true;
					playModifierAnimation(idle, 0.25, onTextClickAnimations[0], 0.25);
				}
				textAnimationAction.reset().play();
				setTimeout(function () {
					window.location.href = 'https://drive.google.com/file/d/1bA2PTs19gqXZ-metpnV9LutfgBZ7K-v8/view?usp=sharing';
				}, 2500);
			}
		}
	}

	function playModifierAnimation(from, fSpeed, to, tSpeed) {
		to.setLoop(THREE.LoopOnce);
		to.reset();
		to.play();
		from.crossFadeTo(to, fSpeed, true);
		setTimeout(function() {
			from.enabled = true;
			to.crossFadeTo(from, tSpeed, true);
			currentlyAnimating = false;
		}, to._clip.duration * 1000 - ((tSpeed + fSpeed) * 1000));
	}

	document.addEventListener('mousemove', function(e) {
		var mousecoords = getMousePos(e);
		if (neck && waist) {
			moveJoint(mousecoords, neck, 50, modelScreenCoordinate);
			moveJoint(mousecoords, waist, 10, modelScreenCoordinate);
		}
		if (textObject) {
			moveJoint(mousecoords, textObject, 5, textObjectScreenCoordinate);
		}
	});

	function getMousePos(e) {
		return { x: e.clientX, y: e.clientY };
	}

	function moveJoint(mouse, joint, degreeLimit, targetScreenCoordinate) {
		let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit, targetScreenCoordinate);
		joint.rotation.y = THREE.Math.degToRad(degrees.x);
		joint.rotation.x = THREE.Math.degToRad(degrees.y);
	}

	function getMouseDegrees(x, y, degreeLimit, targetScreenCoordinate) {
		let dx = 0,
			dy = 0,
			xdiff,
			xPercentage,
			ydiff,
			yPercentage;


		// Left (Rotates neck left between 0 and -degreeLimit)
		// 1. If cursor is in the left half of screen
		if (x <= targetScreenCoordinate.x) {
			// 2. Get the difference between middle of screen and cursor position
			xdiff = targetScreenCoordinate.x - x;
			// 3. Find the percentage of that difference (percentage toward edge of screen)
			xPercentage = (xdiff / targetScreenCoordinate.x) * 100;
			// 4. Convert that to a percentage of the maximum rotation we allow for the neck
			dx = ((degreeLimit * 1.6 * xPercentage) / 100) * -1;
		}

		// Right (Rotates neck right between 0 and degreeLimit)
		if (x >= targetScreenCoordinate.x) {
			xdiff = x - targetScreenCoordinate.x;
			xPercentage = (xdiff / targetScreenCoordinate.x) * 100;
			dx = (degreeLimit * xPercentage) / 100;
		}
		// Up (Rotates neck up between 0 and -degreeLimit)
		if (y <= targetScreenCoordinate.y) {
			ydiff = targetScreenCoordinate.y - y;
			yPercentage = (ydiff / targetScreenCoordinate.y) * 100;
			// Note that I cut degreeLimit in half when she looks up
			dy = (((degreeLimit * 0.25) * yPercentage) / 100) * -1;
		}
		// Down (Rotates neck down between 0 and degreeLimit)
		if (y >= targetScreenCoordinate.y) {
			ydiff = y - targetScreenCoordinate.y;
			yPercentage = (ydiff / targetScreenCoordinate.y) * 100;
			dy = (degreeLimit * 1.1 * yPercentage) / 100;
		}

		return { x: dx, y: dy };
	}

	function randomize(previousNumber, maxNumber) {
		let result = Math.floor(Math.random() * maxNumber);
		console.log("random:" + result);
		return result === previousNumber ? (previousNumber === maxNumber ? result - 1 : result + 1) : result;
	}

})();
