import React, { useEffect, useRef, useState } from "react";

import {
  Camera,
  RotateCcw,
  Undo,
  Redo,
  Box,
  Grid3x3,
  Eye,
  EyeOff,
  Plus,
  Trash2,
} from "lucide-react";
import * as THREE from "three";


const TubeJointVisualizer = () => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const [tubeType, setTubeType] = useState("rectangular");
  const [width, setWidth] = useState(50);
  const [height, setHeight] = useState(30);
  const [thickness, setThickness] = useState(3);
  const [length, setLength] = useState(100);
  const [angle, setAngle] = useState(90);
  const [wireframe, setWireframe] = useState(false);
  const [tubes, setTubes] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedTube, setSelectedTube] = useState(null);
  const [draggedTube, setDraggedTube] = useState(null);
  const [showJointPreview, setShowJointPreview] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(200, 150, 200);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(
      canvasRef.current.clientWidth,
      canvasRef.current.clientHeight
    );
    renderer.shadowMap.enabled = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 200, 100);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x4a90e2, 0.5);
    pointLight.position.set(-100, 100, -100);
    scene.add(pointLight);

    // Grid
    const gridHelper = new THREE.GridHelper(400, 20, 0x444444, 0x222222);
    scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(150);
    scene.add(axesHelper);

    sceneRef.current = { scene, camera, renderer, tubes: [] };

    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let isRotating = false;
    let isPanning = false;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (e) => {
      if (e.button === 0) {
        // Left click
        mouse.x = (e.clientX / canvasRef.current.clientWidth) * 2 - 1;
        mouse.y = -(e.clientY / canvasRef.current.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(
          sceneRef.current.tubes.map((t) => t.mesh)
        );

        if (intersects.length > 0) {
          const tubeIndex = sceneRef.current.tubes.findIndex(
            (t) => t.mesh === intersects[0].object
          );
          if (tubeIndex !== -1) {
            setSelectedTube(tubeIndex);
            setDraggedTube(tubeIndex);
          }
        }
      } else if (e.button === 1) {
        // Middle click
        isPanning = true;
      } else if (e.button === 2) {
        // Right click
        isRotating = true;
      }
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) {
        // Check for joint preview
        mouse.x = (e.clientX / canvasRef.current.clientWidth) * 2 - 1;
        mouse.y = -(e.clientY / canvasRef.current.clientHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(
          sceneRef.current.tubes.map((t) => t.mesh)
        );
        setShowJointPreview(intersects.length > 0);
        return;
      }

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      if (isRotating) {
        camera.position.x =
          camera.position.x * Math.cos(deltaX * 0.01) -
          camera.position.z * Math.sin(deltaX * 0.01);
        camera.position.z =
          camera.position.z * Math.cos(deltaX * 0.01) +
          camera.position.x * Math.sin(deltaX * 0.01);

        const radius = Math.sqrt(
          camera.position.x ** 2 + camera.position.z ** 2
        );
        camera.position.y = Math.max(
          10,
          Math.min(300, camera.position.y - deltaY)
        );

        camera.lookAt(0, 0, 0);
      } else if (isPanning) {
        const panSpeed = 0.5;
        camera.position.x -= deltaX * panSpeed;
        camera.position.z += deltaY * panSpeed;
      } else if (draggedTube !== null) {
        const tube = sceneRef.current.tubes[draggedTube];
        if (tube) {
          tube.mesh.position.x += deltaX * 0.3;
          tube.mesh.position.z += deltaY * 0.3;

          setTubes((prev) => {
            const updated = [...prev];
            updated[draggedTube] = {
              ...updated[draggedTube],
              position: [
                tube.mesh.position.x,
                tube.mesh.position.y,
                tube.mesh.position.z,
              ],
            };
            return updated;
          });
        }
      }

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
      isRotating = false;
      isPanning = false;
      if (draggedTube !== null) {
        saveToHistory();
      }
      setDraggedTube(null);
    };

    const onWheel = (e) => {
      e.preventDefault();
      const zoomSpeed = 0.1;
      const distance = camera.position.length();
      const newDistance = distance + (e.deltaY > 0 ? 20 : -20);
      const scale = Math.max(50, Math.min(500, newDistance)) / distance;

      camera.position.multiplyScalar(scale);
      camera.lookAt(0, 0, 0);
    };

    canvasRef.current.addEventListener("mousedown", onMouseDown);
    canvasRef.current.addEventListener("mousemove", onMouseMove);
    canvasRef.current.addEventListener("mouseup", onMouseUp);
    canvasRef.current.addEventListener("wheel", onWheel);
    canvasRef.current.addEventListener("contextmenu", (e) =>
      e.preventDefault()
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      canvasRef.current?.removeEventListener("mousedown", onMouseDown);
      canvasRef.current?.removeEventListener("mousemove", onMouseMove);
      canvasRef.current?.removeEventListener("mouseup", onMouseUp);
      canvasRef.current?.removeEventListener("wheel", onWheel);
      renderer.dispose();
    };
  }, [draggedTube]);

  // Update tubes when wireframe changes
  useEffect(() => {
    if (!sceneRef.current) return;

    sceneRef.current.tubes.forEach((tubeObj) => {
      tubeObj.mesh.material.wireframe = wireframe;
    });
  }, [wireframe]);

  const createTubeGeometry = (w, h, t, l) => {
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2, -h / 2);
    shape.lineTo(w / 2, -h / 2);
    shape.lineTo(w / 2, h / 2);
    shape.lineTo(-w / 2, h / 2);
    shape.lineTo(-w / 2, -h / 2);

    const hole = new THREE.Path();
    hole.moveTo(-(w - t * 2) / 2, -(h - t * 2) / 2);
    hole.lineTo((w - t * 2) / 2, -(h - t * 2) / 2);
    hole.lineTo((w - t * 2) / 2, (h - t * 2) / 2);
    hole.lineTo(-(w - t * 2) / 2, (h - t * 2) / 2);
    hole.lineTo(-(w - t * 2) / 2, -(h - t * 2) / 2);
    shape.holes.push(hole);

    const extrudeSettings = {
      steps: 1,
      depth: l,
      bevelEnabled: false,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  };

  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(tubes)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const addTube = () => {
    if (!sceneRef.current) return;

    const tubeWidth = tubeType === "square" ? width : width;
    const tubeHeight = tubeType === "square" ? width : height;

    const geometry = createTubeGeometry(
      tubeWidth,
      tubeHeight,
      thickness,
      length
    );
    const material = new THREE.MeshStandardMaterial({
      color: Math.random() * 0xffffff,
      metalness: 0.5,
      roughness: 0.5,
      wireframe: wireframe,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      (Math.random() - 0.5) * 100,
      tubeHeight / 2,
      (Math.random() - 0.5) * 100
    );
    mesh.rotation.z = Math.PI / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    sceneRef.current.scene.add(mesh);
    sceneRef.current.tubes.push({ mesh, geometry, material });

    const newTube = {
      id: Date.now(),
      width: tubeWidth,
      height: tubeHeight,
      thickness,
      length,
      angle,
      position: [mesh.position.x, mesh.position.y, mesh.position.z],
      rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
    };

    setTubes((prev) => [...prev, newTube]);
    saveToHistory();
  };

  const deleteTube = () => {
    if (selectedTube === null || !sceneRef.current) return;

    const tubeObj = sceneRef.current.tubes[selectedTube];
    sceneRef.current.scene.remove(tubeObj.mesh);
    tubeObj.geometry.dispose();
    tubeObj.material.dispose();

    sceneRef.current.tubes.splice(selectedTube, 1);
    setTubes((prev) => prev.filter((_, i) => i !== selectedTube));
    setSelectedTube(null);
    saveToHistory();
  };

  const rotateTube = (axis) => {
    if (selectedTube === null || !sceneRef.current) return;

    const tube = sceneRef.current.tubes[selectedTube];
    const snapAngle = (angle * Math.PI) / 180;

    if (axis === "x") tube.mesh.rotation.x += snapAngle;
    if (axis === "y") tube.mesh.rotation.y += snapAngle;
    if (axis === "z") tube.mesh.rotation.z += snapAngle;

    setTubes((prev) => {
      const updated = [...prev];
      updated[selectedTube] = {
        ...updated[selectedTube],
        rotation: [
          tube.mesh.rotation.x,
          tube.mesh.rotation.y,
          tube.mesh.rotation.z,
        ],
      };
      return updated;
    });
    saveToHistory();
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      restoreFromHistory(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      restoreFromHistory(history[historyIndex + 1]);
    }
  };

  const restoreFromHistory = (state) => {
    if (!sceneRef.current) return;

    // Clear current tubes
    sceneRef.current.tubes.forEach((tubeObj) => {
      sceneRef.current.scene.remove(tubeObj.mesh);
      tubeObj.geometry.dispose();
      tubeObj.material.dispose();
    });
    sceneRef.current.tubes = [];

    // Restore tubes
    state.forEach((tube) => {
      const geometry = createTubeGeometry(
        tube.width,
        tube.height,
        tube.thickness,
        tube.length
      );
      const material = new THREE.MeshStandardMaterial({
        color: Math.random() * 0xffffff,
        metalness: 0.5,
        roughness: 0.5,
        wireframe: wireframe,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...tube.position);
      mesh.rotation.set(...tube.rotation);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      sceneRef.current.scene.add(mesh);
      sceneRef.current.tubes.push({ mesh, geometry, material });
    });

    setTubes(state);
  };

  const resetView = () => {
    if (!sceneRef.current) return;
    sceneRef.current.camera.position.set(200, 150, 200);
    sceneRef.current.camera.lookAt(0, 0, 0);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-80 bg-gray-800 p-6 overflow-y-auto shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-blue-400">
          Tube Joint Visualizer
        </h1>

        {/* Tube Type */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2 text-gray-300">
            Tube Type
          </label>
          <select
            value={tubeType}
            onChange={(e) => setTubeType(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="rectangular">Rectangular</option>
            <option value="square">Square</option>
          </select>
        </div>

        {/* Dimensions */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-300">
              Width: {width}mm
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {tubeType === "rectangular" && (
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-300">
                Height: {height}mm
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-300">
              Thickness: {thickness}mm
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={thickness}
              onChange={(e) => setThickness(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-300">
              Length: {length}mm
            </label>
            <input
              type="range"
              min="20"
              max="200"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Joint Angle */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2 text-gray-300">
            Joint Angle: {angle}°
          </label>
          <input
            type="range"
            min="0"
            max="180"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setAngle(30)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-sm"
            >
              30°
            </button>
            <button
              onClick={() => setAngle(45)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-sm"
            >
              45°
            </button>
            <button
              onClick={() => setAngle(90)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-sm"
            >
              90°
            </button>
            <button
              onClick={() => setAngle(135)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-sm"
            >
              135°
            </button>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={addTube}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded mb-4 flex items-center justify-center gap-2 transition"
        >
          <Plus size={20} /> Add Tube
        </button>

        {/* Tube List */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2 text-gray-300">
            Tubes ({tubes.length})
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {tubes.map((tube, i) => (
              <div
                key={tube.id}
                onClick={() => setSelectedTube(i)}
                className={`p-2 rounded cursor-pointer transition ${
                  selectedTube === i
                    ? "bg-blue-600"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                <div className="text-sm">Tube {i + 1}</div>
                <div className="text-xs text-gray-400">
                  {tube.width}×{tube.height}×{tube.length}mm
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rotation Controls */}
        {selectedTube !== null && (
          <div className="mb-6 p-4 bg-gray-700 rounded">
            <h3 className="font-semibold mb-2">Rotate Selected</h3>
            <div className="flex gap-2">
              <button
                onClick={() => rotateTube("x")}
                className="flex-1 bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded text-sm"
              >
                X
              </button>
              <button
                onClick={() => rotateTube("y")}
                className="flex-1 bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded text-sm"
              >
                Y
              </button>
              <button
                onClick={() => rotateTube("z")}
                className="flex-1 bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded text-sm"
              >
                Z
              </button>
            </div>
          </div>
        )}

        {/* Delete */}
        {selectedTube !== null && (
          <button
            onClick={deleteTube}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded mb-4 flex items-center justify-center gap-2 transition"
          >
            <Trash2 size={18} /> Delete Selected
          </button>
        )}

        {/* View Controls */}
        <div className="space-y-2">
          <button
            onClick={() => setWireframe(!wireframe)}
            className="w-full bg-gray-700 hover:bg-gray-600 py-2 rounded flex items-center justify-center gap-2 transition"
          >
            {wireframe ? <Eye size={18} /> : <EyeOff size={18} />}
            {wireframe ? "Solid View" : "Wireframe"}
          </button>

          <button
            onClick={resetView}
            className="w-full bg-gray-700 hover:bg-gray-600 py-2 rounded flex items-center justify-center gap-2 transition"
          >
            <Camera size={18} /> Reset View
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ width: "100%", height: "100%" }}
        />

        {/* Top Controls */}
        <div className="absolute top-4 left-4 flex gap-2">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 p-2 rounded shadow-lg transition"
            title="Undo"
          >
            <Undo size={20} />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 p-2 rounded shadow-lg transition"
            title="Redo"
          >
            <Redo size={20} />
          </button>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 bg-gray-800 bg-opacity-90 p-4 rounded shadow-lg max-w-md">
          <h3 className="font-semibold mb-2 text-blue-400">Controls</h3>
          <ul className="text-sm space-y-1 text-gray-300">
            <li>
              • <strong>Left Click + Drag:</strong> Move tube
            </li>
            <li>
              • <strong>Right Click + Drag:</strong> Rotate view
            </li>
            <li>
              • <strong>Middle Click + Drag:</strong> Pan view
            </li>
            <li>
              • <strong>Scroll:</strong> Zoom in/out
            </li>
            <li>• Select tube from sidebar to rotate/delete</li>
          </ul>
        </div>

        {showJointPreview && (
          <div className="absolute top-4 right-4 bg-green-600 bg-opacity-90 px-4 py-2 rounded shadow-lg">
            Joint Preview Active
          </div>
        )}
      </div>
    </div>
  );
};

export default TubeJointVisualizer;
