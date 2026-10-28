import { Button, Spin } from 'antd';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

type ModelCtx = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  container: HTMLElement;
  loader: GLTFLoader;
};

type ModelEntry = {
  key: string;
  label: string;
  /** 返回 cleanup，切换或卸载时调用；可额外返回当前模型用到的 mixer */
  setup(ctx: ModelCtx): Promise<{
    cleanup: () => void;
    mixer?: THREE.AnimationMixer;
    /** 每帧被调用，传入 delta 秒数 */
    tick?: (delta: number) => void;
  }>;
};

/** 统一释放 mesh 的 geometry / material */
const disposeMesh = (obj: THREE.Object3D) => {
  const mesh = obj as THREE.Mesh;
  if (mesh.geometry) mesh.geometry.dispose();
  const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
  if (mat) {
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
    else mat.dispose();
  }
};

/** 从 scene 移除一组对象并释放资源 */
const removeAndDispose = (scene: THREE.Scene, objs: THREE.Object3D[]) => {
  objs.forEach((o) => {
    scene.remove(o);
    o.traverse((c) => {
      if ((c as THREE.Mesh).isMesh) disposeMesh(c);
    });
  });
};

// ---------- 模型：Nemetona ----------
// 来源：three.js 官方示例 models/gltf/nemetona.glb
// 作者：JOJObrush  授权：Creative Commons Attribution 4.0
const nemetonaModel = {
  key: 'nemetona',
  label: 'Nemetona',
  async setup({ scene, camera, controls, loader }: ModelCtx) {
    scene.background = new THREE.Color(0xa0a0a0);
    camera.position.set(1, 2.5, 4);
    controls.target.set(0, 2, 0);
    controls.maxPolarAngle = Math.PI / 2 - 0.05;

    const toRemove: THREE.Object3D[] = [];

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 1.2);
    scene.add(hemiLight);
    toRemove.push(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(-3, 10, -10);
    dirLight.castShadow = true;
    dirLight.shadow.bias = -0.001;
    dirLight.shadow.radius = 2;
    dirLight.shadow.mapSize.set(1024, 1024);
    dirLight.shadow.camera.top = 4;
    dirLight.shadow.camera.bottom = -4;
    dirLight.shadow.camera.left = -4;
    dirLight.shadow.camera.right = 4;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    scene.add(dirLight);
    toRemove.push(dirLight);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({
        color: 0xcbcbcb,
        depthWrite: false,
        roughness: 1.0,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    toRemove.push(ground);

    // 加载 GLB
    const gltf = await loader.loadAsync('/models/nemetona.glb');
    const model = gltf.scene;
    model.rotation.y = Math.PI;
    model.scale.setScalar(10);
    model.position.y = 0.45;
    model.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    scene.add(model);
    toRemove.push(model);

    // 自动播放模型自带动画（如有）
    let mixer: THREE.AnimationMixer | undefined;
    if (gltf.animations?.length) {
      mixer = new THREE.AnimationMixer(scene);
      gltf.animations.forEach((clip) => mixer!.clipAction(clip, model).play());
    }

    return {
      mixer,
      cleanup: () => {
        mixer?.stopAllAction();
        removeAndDispose(scene, toRemove);
      },
      tick: (delta: number) => {
        model.rotation.y += delta * 0.4;
      },
    };
  },
};

// ---------- 模型：示例 ----------
const exampleModel = {
  key: 'example',
  label: '示例',
  async setup({ scene, camera, controls }: ModelCtx) {
    scene.background = new THREE.Color(0xf0f2f5);
    camera.position.set(0, 6, 14);
    controls.target.set(0, 1, 0);
    controls.maxPolarAngle = Math.PI / 2 - 0.05;

    const toRemove: THREE.Object3D[] = [];

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    toRemove.push(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(8, 12, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    dirLight.shadow.camera.left = -15;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.top = 15;
    dirLight.shadow.camera.bottom = -15;
    scene.add(dirLight);
    toRemove.push(dirLight);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: 0xe4e7ed }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    toRemove.push(ground);

    const grid = new THREE.GridHelper(40, 40, 0xc0c4cc, 0xd4d7de);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.6;
    scene.add(grid);
    toRemove.push(grid);

    const duration = 4;

    const makeBox = (color: number, x: number) => {
      const geo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.35,
        metalness: 0.1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, 0.75, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    const makeSphere = (color: number, z: number) => {
      const geo = new THREE.SphereGeometry(0.8, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.25,
        metalness: 0.15,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, 0.8, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    const boxA = makeBox(0x1890ff, -3);
    const boxB = makeBox(0x52c41a, 3);
    const sphereA = makeSphere(0xfa8c16, -3);
    const sphereB = makeSphere(0xeb2f96, 3);
    scene.add(boxA, boxB, sphereA, sphereB);
    toRemove.push(boxA, boxB, sphereA, sphereB);

    const boxAYTrack = new THREE.NumberKeyframeTrack(
      '.position[y]',
      [0, duration / 2, duration],
      [0.75, 3.5, 0.75],
    );
    const boxARotTrack = new THREE.NumberKeyframeTrack(
      '.rotation[y]',
      [0, duration],
      [0, Math.PI],
    );
    const boxAClip = new THREE.AnimationClip('boxA-bounce', duration, [
      boxAYTrack,
      boxARotTrack,
    ]);

    const boxBXTrack = new THREE.NumberKeyframeTrack(
      '.position[x]',
      [0, duration / 2, duration],
      [3, 1, 3],
    );
    const boxBRotTrack = new THREE.NumberKeyframeTrack(
      '.rotation[y]',
      [0, duration],
      [0, -Math.PI * 2],
    );
    const boxBClip = new THREE.AnimationClip('boxB-swing', duration, [
      boxBXTrack,
      boxBRotTrack,
    ]);

    const sphereAXTrack = new THREE.NumberKeyframeTrack(
      '.position[x]',
      [0, duration / 2, duration],
      [0, 1.5, 0],
    );
    const sphereAZTrack = new THREE.NumberKeyframeTrack(
      '.position[z]',
      [0, duration / 2, duration],
      [-3, -1.5, -3],
    );
    const sphereAYTrack = new THREE.NumberKeyframeTrack(
      '.position[y]',
      [0, duration / 2, duration],
      [0.8, 1.6, 0.8],
    );
    const sphereAClip = new THREE.AnimationClip('sphereA-orbit', duration, [
      sphereAXTrack,
      sphereAZTrack,
      sphereAYTrack,
    ]);

    const sphereBScaleTrack = new THREE.NumberKeyframeTrack(
      '.scale',
      [0, duration / 4, duration / 2, (duration * 3) / 4, duration],
      [1, 1.3, 1, 0.85, 1],
    );
    const sphereBRotTrack = new THREE.NumberKeyframeTrack(
      '.rotation[x]',
      [0, duration],
      [0, Math.PI * 2],
    );
    const sphereBClip = new THREE.AnimationClip('sphereB-pulse', duration, [
      sphereBScaleTrack,
      sphereBRotTrack,
    ]);

    const mixer = new THREE.AnimationMixer(scene);
    mixer.clipAction(boxAClip, boxA).play();
    mixer.clipAction(boxBClip, boxB).play();
    mixer.clipAction(sphereAClip, sphereA).play();
    mixer.clipAction(sphereBClip, sphereB).play();

    return {
      cleanup: () => {
        mixer.stopAllAction();
        removeAndDispose(scene, toRemove);
      },
      mixer,
      tick: (delta: number) => {
        const speed = delta * 0.8;
        boxA.rotation.y += speed;
        boxB.rotation.y -= speed;
        sphereA.rotation.y += speed;
        sphereB.rotation.y -= speed;
      },
    };
  },
};

// ---------- 模型注册表（在此追加新模型） ----------
const models: ModelEntry[] = [nemetonaModel, exampleModel];

const Index = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeKey, setActiveKey] = useState<string>(models[0].key);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 0.5;
    controls.maxDistance = 40;

    // GLB 加载器 + DRACO 解码
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      'https://www.gstatic.com/draco/versioned/decoders/1.5.6/',
    );
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    const clock = new THREE.Clock();
    let animationId = 0;
    let stopModel: (() => void) | null = null;
    let modelTick: ((delta: number) => void) | null = null;
    let modelMixer: THREE.AnimationMixer | null = null;
    let disposed = false;

    const ctx: ModelCtx = { scene, camera, controls, container, loader };

    let currentLoadToken = 0;
    const loadModel = async (key: string) => {
      const model = models.find((m) => m.key === key);
      if (!model) return;
      const token = ++currentLoadToken;
      setLoading(true);
      if (stopModel) stopModel();
      try {
        const { cleanup, mixer, tick } = await model.setup(ctx);
        if (token !== currentLoadToken || disposed) {
          cleanup();
          return;
        }
        stopModel = cleanup;
        modelMixer = mixer ?? null;
        modelTick = tick ?? null;
      } finally {
        if (token === currentLoadToken) setLoading(false);
      }
    };

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      modelTick?.(delta);
      modelMixer?.update(delta);
      controls.update();
      renderer.render(scene, camera);
    };

    loadModel(activeKey);
    animate();

    (container as any).__loadModel = loadModel;

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      stopModel?.();
      renderer.dispose();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) disposeMesh(obj as THREE.Mesh);
      });
      dracoLoader.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const container = containerRef.current as any;
    if (container?.__loadModel) container.__loadModel(activeKey);
  }, [activeKey]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
    >
      <div style={{ position: 'absolute', top: 8, right: 12, zIndex: 10 }}>
        {models.map((m) => (
          <Button
            key={m.key}
            type={activeKey === m.key ? 'link' : 'text'}
            onClick={() => setActiveKey(m.key)}
            style={{
              fontWeight: activeKey === m.key ? 600 : 400,
              paddingInline: 12,
            }}
          >
            {m.label}
          </Button>
        ))}
      </div>
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        >
          <Spin size="large" />
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default Index;
