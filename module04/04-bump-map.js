// once everything is loaded, we run our Three.js stuff.
function init() {
    var stats = initStats();
    // create a scene, that will hold all our elements such as objects, cameras and lights.
    var scene = new THREE.Scene();
    var assetsLocation = "../assets/textures/general";
    // create a camera, which defines where we're looking at.
    var aspectRatio = window.innerWidth / window.innerHeight;
    var camera = new THREE.PerspectiveCamera(45,
                                             aspectRatio,
                                             0.1,
                                             1000);
    // create a render and set the size
    var webGLRenderer = new THREE.WebGLRenderer();
    webGLRenderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
    webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    webGLRenderer.shadowMapEnabled = true;
    
    var wallNoBump = createMesh(new THREE.BoxGeometry(15, 15, 2),
                                "stone.jpg");
    wallNoBump.rotation.y = -0.5;
    wallNoBump.position.x = 12;
    scene.add(wallNoBump);

    var wallBump = createMesh(new THREE.BoxGeometry(15, 15, 2),
                              "stone.jpg",
                              "stone-bump.jpg");
    wallBump.rotation.y = 0.5;
    wallBump.position.x = -12;
    scene.add(wallBump);
    console.log(wallBump.geometry.faceVertexUvs);

    var floorTex = THREE.ImageUtils.loadTexture(assetsLocation + "/floor-wood.jpg");
    var plane = new THREE.Mesh(new THREE.BoxGeometry(200, 100, 0.1, 30),
                               new THREE.MeshPhongMaterial({
                                   color: 0x3c3c3c,
                                   map: floorTex
                               }));
    plane.position.y = -7.5;
    plane.rotation.x = -0.5 * Math.PI;
    scene.add(plane);

    // position and point the camera to the center of the scene
    camera.position.x = 00;
    camera.position.y = 12;
    camera.position.z = 28;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    var ambiLight = new THREE.AmbientLight(0x242424);
    scene.add(ambiLight);

    var light = new THREE.SpotLight();
    light.position.set(0, 30, 30);
    light.intensity = 1.2;
    scene.add(light);

    // add the output of the renderer to the html element
    document.getElementById("WebGL-output").appendChild(webGLRenderer.domElement);

    // call the render function
    var step = 0;
    // setup the control gui
    var controls = new function () {
        this.bumpScale = 0.2;
        this.changeTexture = "weave";
        this.rotate = false;

        this.changeTexture = function (e) {
            var texture = THREE.ImageUtils.loadTexture(assetsLocation + e + ".jpg");
            wallBump.material.map = texture;
            wallNoBump.material.map = texture;

            var bump = THREE.ImageUtils.loadTexture(assetsLocation + e + "-bump.jpg");
            wallBump.material.bumpMap = bump;
        };

        this.updateBump = function (e) {
            console.log(wallBump.material.bumpScale);
            wallBump.material.bumpScale = e;
        }
    };


    var gui = new dat.GUI();
    gui.add(controls, "bumpScale", -2, 2).onChange(controls.updateBump);
    gui.add(controls, "changeTexture", ['stone', 'weave']).onChange(controls.changeTexture);
    gui.add(controls, "rotate");


    render();

    function createMesh(geom, imageFile, bump) {
        var texture = THREE.ImageUtils.loadTexture(assetsLocation + imageFile);
        geom.computeVertexNormals();
        var mat = new THREE.MeshPhongMaterial();
        mat.map = texture;

        if (bump) {
            var bump = THREE.ImageUtils.loadTexture(assetsLocation + bump);
            mat.bumpMap = bump;
            mat.bumpScale = 0.2;
            console.log('d');
        }
        // create a multimaterial
        var mesh = new THREE.Mesh(geom, mat);

        return mesh;
    }

    function render() {
        stats.update();

        if (controls.rotate) {
            wallNoBump.rotation.y -= 0.01;
            wallBump.rotation.y += 0.01;
        }
        // render using requestAnimationFrame
        requestAnimationFrame(render);
        webGLRenderer.render(scene, camera);
    }
    function initStats() {
        var stats = new Stats();
        stats.setMode(0); // 0: fps, 1: ms
        // Align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        document.getElementById("Stats-output").appendChild(stats.domElement);
        return stats;
    }
}
window.onload = init;
