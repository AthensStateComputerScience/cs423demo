var orbitControls = null;
var container, camera, scene, renderer, loader;
var cameraIndex = 0;
var cameras = [];
var cameraNames = [];
var defaultCamera = null;
var gltf = null;

function onload() {
	  window.addEventListener( 'resize', onWindowResize, false );
 	  document.addEventListener(
        'keypress', 
      	function(e) { onKeyPress(e); },
        false);
    buildSceneList();
    switchScene(0);
    animate();
}

function initScene(index) {
    container = document.getElementById( 'container' );
    scene = new THREE.Scene();
    defaultCamera = new THREE.PerspectiveCamera(
        45,
        container.offsetWidth / container.offsetHeight,
        1,
        10000 );
    //defaultCamera.up = new THREE.Vector3( 0, 1, 0 );
    scene.add( defaultCamera );
    camera = defaultCamera;
    var sceneInfo = sceneList[index];
    if (sceneInfo.addLights) {
        var ambient = new THREE.AmbientLight( 0x111111 );
        scene.add( ambient );
        var directionalLight = new THREE.DirectionalLight( 0xdddddd );
        directionalLight.position.set( 0, -1, 1 ).normalize();
        scene.add( directionalLight );
        
        var spot1   = new THREE.SpotLight( 0x888888, 2 );
        spot1.position.set( -100, 200, 100 );
        spot1.target.position.set( 0, 0, 0 );

        if (sceneInfo.shadows) {
            spot1.shadowCameraNear      = 1;
            spot1.shadowCameraFar      = 1024;
            spot1.castShadow            = true;
            spot1.shadowDarkness        = 0.3;
            spot1.shadowBias = 0.0001;
            spot1.shadowMapWidth = 2048;
            spot1.shadowMapHeight = 2048;
        }
        scene.add( spot1 );
    }
	  
    // RENDERER
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize( container.offsetWidth, container.offsetHeight );
    if (sceneInfo.shadows) {
        renderer.shadowMapEnabled = true;
        renderer.shadowMapSoft = true;
    		renderer.shadowMapType = THREE.PCFSoftShadowMap;
    }
    container.appendChild( renderer.domElement );

	  if (sceneInfo.addGround) {
        var groundMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            ambient: 0x888888,
            shading: THREE.SmoothShading,
        });
        var ground = new THREE.Mesh(
            new THREE.PlaneGeometry(1024, 1024),
            groundMaterial);

        if (sceneInfo.shadows) {
            ground.receiveShadow = true;
        }
        
        ground.position.z = -70;
        ground.rotation.x = -Math.PI / 2;
        
        scene.add(ground);
	  }
	  
    loader = new THREE.glTFLoader( container );
    loader.useBufferGeometry = useBufferGeometry;
    var loadStartTime = Date.now();
    var status = document.getElementById("status");
    status.innerHTML = "Loading...";
    loader.load(
        sceneInfo.url,
        function(data) {
            gltf = data;
            var object = gltf.scene;
            var loadEndTime = Date.now();
            var loadTime = (loadEndTime - loadStartTime) / 1000;
            status.innerHTML = "Load time: " +
                loadTime.toFixed(2) +
                " seconds.";
            if (sceneInfo.cameraPos)
                defaultCamera.position.copy(sceneInfo.cameraPos);
            if (sceneInfo.objectPosition)
                object.position.copy(sceneInfo.objectPosition);
            if (sceneInfo.objectRotation)
                object.rotation.copy(sceneInfo.objectRotation);
            if (sceneInfo.objectScale)
                object.scale.copy(sceneInfo.objectScale);
            cameraIndex = 0;
            cameras = [];
            cameraNames = [];
            if (gltf.cameras && gltf.cameras.length)
            {
                var i, len = gltf.cameras.length;
                for (i = 0; i < len; i++)
                {
                    var addCamera = true;
                    var cameraName = gltf.cameras[i].parent.name;
                    if (sceneInfo.cameras &&
                        !(cameraName in sceneInfo.cameras)) {
                        addCamera = false;
                    }
                    if (addCamera) {
                        cameraNames.push(cameraName);
                        cameras.push(gltf.cameras[i]);
                    }
                }
            updateCamerasList();
            switchCamera(1);
            }
            else
            {
                updateCamerasList();
                switchCamera(0);
            }
            scene.add( object );
            onWindowResize();
        });
  	orbitControls = new THREE.OrbitControls(defaultCamera, renderer.domElement);
}

function onWindowResize() {
	  var i, len = cameras.length;
	  for (i = 0; i < 0; i++) // just do it for default
	  {
		    cameras[i].aspect = container.offsetWidth / container.offsetHeight;
		    cameras[i].updateProjectionMatrix();
	  }
	  renderer.setSize( container.offsetWidth, container.offsetHeight );
}

function animate() {
    requestAnimationFrame( animate );
    THREE.glTFAnimator.update();
    if (cameraIndex == 0)
        orbitControls.update();
    render();
}

function render() {
    renderer.render( scene, camera );
}

function onKeyPress(event) {
	  var chr = String.fromCharCode(event.keyCode);
	  if (chr == ' ') {
		    index = cameraIndex + 1;
		    if (index > cameras.length)
			      index = 0;
		    switchCamera(index);
	  }
	  else {
		    var index = parseInt(chr);
		    if (!isNaN(index)  && (index <= cameras.length)) {
			      switchCamera(index);
		    }
	  }
}

var sceneList = 
	  [
        { name : "Virtual City", url : "../assets/models/vc/vc.json", 
          cameraPos: new THREE.Vector3(0, 3, 10),
          objectRotation: new THREE.Vector3(-Math.PI / 2, 0, 0), 
          cameras: {"Camera02" : "", "Camera05" : "", "Camera11" : "", "Camera15" : ""}},
        { name : "Duck", url : "../assets/models/duck/duck.json", 
          cameraPos: new THREE.Vector3(0, 30, -50),
          objectScale: new THREE.Vector3(0.1, 0.1, 0.1),
          addLights:false,
          addGround:false,
          shadows:false },
        { name : "Rambler", url : "../assets/models/rambler/Rambler.json", 
      		cameraPos: new THREE.Vector3(0, 10, 50), 
      		objectRotation: new THREE.Vector3(-Math.PI / 2, 0, 0),
      		objectPosition: new THREE.Vector3(0, 1, 0),
      		objectScale: new THREE.Vector3(0.1, 0.1, 0.1),
      		addLights:true,
      		addGround:true,
      		shadows:true },		             
 		];

function buildSceneList()
{
	  var elt = document.getElementById('scenes_list');
	  while( elt.hasChildNodes() ){
	      elt.removeChild(elt.lastChild);
	  }
	  var i, len = sceneList.length;
	  for (i = 0; i < len; i++)
	  {
		    option = document.createElement("option");
		    option.text=sceneList[i].name;
		    elt.add(option);
	  }		
}

function switchScene(index)
{
	  cleanup();
	  initScene(index);
	  var elt = document.getElementById('scenes_list');
	  elt.selectedIndex = index;
}

function selectScene()
{
    var select = document.getElementById("scenes_list");
    var index = select.selectedIndex;
	  if (index >= 0)
	  {
		    switchScene(index);
	  }
}

function switchCamera(index)
{
	  cameraIndex = index;
	  
	  if (cameraIndex == 0) {
		    camera = defaultCamera;
	  }
	  if (cameraIndex >= 1 && cameraIndex <= cameras.length) {
		    camera = cameras[cameraIndex - 1];
	  }

	  var elt = document.getElementById('cameras_list');
	  elt.selectedIndex = cameraIndex;				
}

function updateCamerasList() {
	  var elt = document.getElementById('cameras_list');
	  while( elt.hasChildNodes() ){
	      elt.removeChild(elt.lastChild);
	  }

	  option = document.createElement("option");
	  option.text="[default]";
	  elt.add(option);
	  
	  var i, len = cameraNames.length;
	  for (i = 0; i < len; i++)
	  {
		    option = document.createElement("option");
		    option.text=cameraNames[i];
		    elt.add(option);
	  }		
}

function selectCamera() {
    var select = document.getElementById("cameras_list");
    var index = select.selectedIndex;
	  if (index >= 0)
	  {
		    switchCamera(index);
	  }
}

function toggleAnimations() {
	  var i, len = gltf.animations.length;
	  for (i = 0; i < len; i++) {
		    var animation = gltf.animations[i];
		    if (animation.running) {
			      animation.stop();
		    }
		    else {
			      animation.play();
		    }
	  }
}

var useBufferGeometry = true;
function toggleBufferGeometry()
{
	  useBufferGeometry = !useBufferGeometry;
	  selectScene();
}

function cleanup() {

	  if (container && renderer)
	  {
		    container.removeChild(renderer.domElement);
	  }

    cameraIndex = 0;
	  cameras = [];
	  cameraNames = [];
	  defaultCamera = null;
	  
	  if (!loader || !gltf.animations)
		    return;
	  
	  var i, len = gltf.animations.length;
	  for (i = 0; i < len; i++) {
		    var animation = gltf.animations[i];
		    if (animation.running) {
			      animation.stop();
		    }
	  }
}

onload();
