'use client'
// pages/game.js
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { color, instancedMesh } from "three/tsl";

export default function Game() {

  useEffect(() => {

    

    
    // Setup scene, camera, and renderer
    
    const scene = new THREE.Scene() ;

    
    
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xa8def0)
    document.body.appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true;
    

    //lights
    const ambientLight = new THREE.DirectionalLight( 'white', 0.6 ); // soft white light
    scene.add( ambientLight );

    const directLight = new THREE.DirectionalLight('white', 1);
        directLight.position.x = 20;
        directLight.position.y = 30;
        directLight.castShadow = true;
        directLight.shadow.mapSize.width = 4096;
        directLight.shadow.mapSize.height = 4096;
        const d = 35;
        directLight.shadow.camera.left = - d;
        directLight.shadow.camera.right = d;
        directLight.shadow.camera.top = d;
        directLight.shadow.camera.bottom = - d;

      const busheTexture = new THREE.TextureLoader().load('busheMatcap.jpg');




    // Create player (a cube)
    const pp = new THREE.CapsuleGeometry();
    const material = new THREE.MeshMatcapMaterial({ 
      matcap: busheTexture
     });
    const player = new THREE.Mesh(pp, material);
    scene.add(player);

    // Create ground

    // Ground tiles with elevations
    const tileSize = 5; // Size of each tile // Size of each tile
    const renderDistance = 50; // Distance in which tiles are visible
    const tiles = new Map(); // Store active tiles
    const groundTexture = new THREE.TextureLoader().load("ground.jpg");
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(1, 1);

    const tileMaterial = new THREE.MeshToonMaterial({ map:groundTexture});

    const createTile = (x: number, z: number) => {
      const geometry = new THREE.PlaneGeometry(tileSize, tileSize, 16, 16);
      const vertices = geometry.attributes.position.array;

      // Modify vertices to create elevations
      

      const tile = new THREE.Mesh(geometry, tileMaterial);
      tile.rotation.x = -Math.PI / 2;
      tile.position.set(x, -1.5, z);
      tile.receiveShadow = true;
      scene.add(tile);
      return tile;
    };


    const updateTiles = () => {
      const playerTileX = Math.floor(player.position.x / tileSize);
      const playerTileZ = Math.floor(player.position.z / tileSize);

      // Generate tiles within the visible area
      for (let x = playerTileX - renderDistance / tileSize; x <= playerTileX + renderDistance / tileSize; x++) {
        for (let z = playerTileZ - renderDistance / tileSize; z <= playerTileZ + renderDistance / tileSize; z++) {
          const key = `${x},${z}`;
          if (!tiles.has(key)) {
            tiles.set(key, createTile(x * tileSize, z * tileSize));
          }
        }
      }

      // Remove tiles outside the visible area
      for (const [key, tile] of tiles) {
        const [tileX, tileZ] = key.split(",").map(Number);
        if (
          Math.abs(tileX - playerTileX) > renderDistance / tileSize ||
          Math.abs(tileZ - playerTileZ) > renderDistance / tileSize
        ) {
          scene.remove(tile);
          tiles.delete(key);
        }
      }
    };

    // bunshes //

    const count = 80;
    const planes = [];

    for(let i  = 0; i < count; i++)
    {
      const planeGeometry = new THREE.PlaneGeometry(1, 1)
      

      //texture for bushe
      const busheTexture = new THREE.TextureLoader().load('busheMatcap2.jpg');
      const alphaMapBushe = new THREE.TextureLoader().load('alphamap.jpg');

      const planeMaterial = new THREE.MeshMatcapMaterial({
        matcap: busheTexture,
        alphaMap: alphaMapBushe,
        transparent: true,
      });

      const plane = new THREE.Mesh(planeGeometry, planeMaterial)
      plane.position.set(0, -0.5, 0);
      scene.add(plane)


      //position
      const spherical = new THREE.Spherical(
        1 - Math.pow(Math.random(), 3),
        Math.PI * 2 * Math.random(),
        Math.PI * Math.random()
      )
      const position = new THREE.Vector3().setFromSpherical(spherical)
      planeGeometry.rotateX(Math.random() * 9999)
      planeGeometry.rotateY(Math.random() * 9999)
      planeGeometry.rotateZ(Math.random() * 9999)
      planeGeometry.translate(
        position.x,
        position.y,
        position.z
      )

      //normal
      const normal = position.clone().normalize()
      const normalArray = new Float32Array(12)
      for(let i =0; i< 4; i++)
      {
        const i3 = i * 3

        const position = new THREE.Vector3(
          planeGeometry.attributes.position.array[i3    ],
          planeGeometry.attributes.position.array[i3 + 1],
          planeGeometry.attributes.position.array[i3 + 2],
        )

        const mixedNormal = position.lerp(normal, 0.4)

        normalArray[i3    ] = mixedNormal.x
        normalArray[i3 + 1] = mixedNormal.y
        normalArray[i3 + 2] = mixedNormal.z
      }

      planes.push(plane)






      planeGeometry.setAttribute('normal', new THREE.BufferAttribute(normalArray, 3))
    };


    //instanced mesh
    
    

    //this.geometry = mergeGeometries(planes)

    
  



    
    /*const planeGeometry = new THREE.PlaneGeometry(100, 100 );
    const groundTexture = new THREE.TextureLoader().load('ground.jpg');
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(10, 10 );


    
    
    
    const planeMaterial = new THREE.MeshToonMaterial({
      side: THREE.DoubleSide,
      map: groundTexture,
      
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2; // Rotate to lay flat
    plane.position.y = -0.5 ;
    scene.add(plane);*/

    // Position camera
    camera.position.set(0, 5, 10);

  

    // Movement and jump state
    const keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
    };
    const speed = 0.1;
    let isJumping = false;
    let velocityY = 0;
    const gravity = 0.01;

    // Mouse rotation state
    let rotation = { x: 0, y: 0 };
    let isMousePressed = false;

    const handleKeyDown = (event: { key: any; }) => {
      switch (event.key) {
        case "ArrowUp":
        case "w":
          keys.forward = true;
          break;
        case "ArrowDown":
        case "s":
          keys.backward = true;
          break;
        case "ArrowLeft":
        case "a":
          keys.left = true;
          break;
        case "ArrowRight":
        case "d":
          keys.right = true;
          break;
        case " ":
          if (!isJumping) {
            isJumping = true;
            velocityY = 0.2; // Set initial jump velocity
          }
          break;
      }
    };

    const handleKeyUp = (event: { key: any; }) => {
      switch (event.key) {
        case "ArrowUp":
        case "w":
          keys.forward = false;
          break;
        case "ArrowDown":
        case "s":
          keys.backward = false;
          break;
        case "ArrowLeft":
        case "a":
          keys.left = false;
          break;
        case "ArrowRight":
        case "d":
          keys.right = false;
          break;
      }
    };

    const handleMouseMove = (event: { movementY: number; movementX: number; }) => {
      if (isMousePressed) {
        const sensitivity = 0.002;
        rotation.x -= event.movementY * sensitivity;
        rotation.y -= event.movementX * sensitivity;

        // Limit vertical rotation to avoid flipping
        rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.x));
      }
    };

    const handleMouseDown = (event: { button: number; }) => {
      if (event.button === 0) {
        isMousePressed = true;
      }
    };

    const handleMouseUp = (event: { button: number; }) => {
      if (event.button === 0) {
        isMousePressed = false;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    // Animation loop
    const animate = () => {
      updateTiles();
      // Calculate movement direction
      const direction = new THREE.Vector3();
      if (keys.forward) direction.z += 1;
      if (keys.backward) direction.z -= 1;
      if (keys.left) direction.x -= 1;
      if (keys.right) direction.x += 1;

      if (direction.length() > 0) {
        direction.normalize();

        // Rotate player to face movement direction
        const angle = Math.atan2(direction.x, direction.z);

        // Adjust player position based on camera direction
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);

        player.position.x += cameraDirection.x * direction.z * speed;
        player.position.z += cameraDirection.z * direction.z * speed;

        const moveDirection = Math.atan2(cameraDirection.x, cameraDirection.z);
        player.rotation.y = angle;
        player.rotation.y = moveDirection;
        
        

        // Side movement
        const perpendicular = new THREE.Vector3(
          -cameraDirection.z,
          0,
          cameraDirection.x
        );
        player.position.x += perpendicular.x * direction.x * speed;
        player.position.z += perpendicular.z * direction.x * speed;
      }

      // Handle jumping
      if (isJumping) {
        velocityY -= gravity; // Apply gravity
        player.position.y += velocityY;

        // Check if the player lands
        if (player.position.y <= 0) {
          player.position.y = 0;
          isJumping = false;
          velocityY = 0;
        }
      }

      // Update camera position
      const offset = new THREE.Vector3(
        -Math.sin(rotation.y) * 10,
        5 + Math.sin(rotation.x) * 5,
        -Math.cos(rotation.y) * 10
      );
      scene.add(directLight);
      camera.position.copy(player.position.clone().add(offset));
      camera.lookAt(player.position);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
  

    animate();
    

    // Cleanup on component unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.removeChild(renderer.domElement);
    };
  },
  
  []);
}
