//اسکریپت دیبباگ کننده زنده



import {loadGLTF} from "../../libs/loader.js";
// import {mockWithVideo} from '../../libs/camera-mock.js';
const THREE = window.MINDAR.FACE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {
    // mockWithVideo('../../assets/mock-videos/face1.mp4');

    const mindarThree = new window.MINDAR.FACE.MindARThree({
      container: document.body,
    });
    const {renderer, scene, camera} = mindarThree;

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    const model = await loadGLTF('../../../GLASSES/GLASSES4/glasses.glb');

    // --- ساخت یک Rig تا تغییرات را از مدل اصلی جدا کنیم
    const rig = new THREE.Group();
    rig.name = 'glassesRig';
    // اندازهٔ اولیه
    rig.scale.set(0.08866535105013076, 0.08866535105013076, 0.08866535105013076);
    rig.position.set(0.02999999999999999, -0.4275000000000003, -2.4024999999999);
    rig.rotation.set(0, -90.49999999999969 * Math.PI / 180, 0);
    /*{
 
}*/
    // مدل را داخل Rig بگذار
    rig.add(model.scene);

    // اگر مدل offset داخلی دارد و مرکز نیست، می‌توانی یک بار مرکزدهی کنی (اختیاری):
    // new THREE.Box3().setFromObject(model.scene).getCenter(model.scene.position).multiplyScalar(-1);

    // Anchor شیار 168 (بین چشم‌ها برای عینک)
    const anchor = mindarThree.addAnchor(168);
    anchor.group.add(rig);

    // --- Helper محورها (برای دیدن جهت‌ها)
    const axes = new THREE.AxesHelper(0.2); // طول محور‌ها در مترهای نسبی به مقیاس صورت
    axes.visible = false;
    rig.add(axes);

    // --- پنل شناور روی صفحه برای نمایش و کنترل
    const hud = document.createElement('div');
    hud.style.cssText = `
      position: fixed; left: 12px; bottom: 12px; z-index: 9999;
      background: rgba(0,0,0,0.55); color: #fff; font: 12px/1.5 monospace;
      padding: 10px 12px; border-radius: 10px; backdrop-filter: blur(4px);
      max-width: 42ch; user-select: text; white-space: pre;
    `;
    document.body.appendChild(hud);

    const fmt = (n, f=3) => Number(n).toFixed(f);
    const deg = (r) => r * 180 / Math.PI;
    const rad = (d) => d * Math.PI / 180;

    const state = {
      // گام‌ها
      moveStep: 0.0025,     // متر تقریبی نسبت به اسکال صورت
      rotStepDeg: 0.5,      // درجه
      scaleStep: 0.005,     // ضریب
      // کلیدهای میانبر
      help: `
[WebAR Live Tuner]
حرکت: ←/→ = X   ↑/↓ = Y   PgUp/PgDn = Z
چرخش: Q/E = حول X   A/D = حول Y   W/S = حول Z
مقیاس: +/- = یکنواخت | [ و ] = X/Y | { و } = Z  (Shift = ریزتر)
ذخیره/لود: 1 = Save   2 = Load   3 = Copy JSON
سایر: H = نمایش محورها  0 = Reset مقادیر
`
    };

    const storageKey = 'mindar-glasses-tweak-v1';

    function refreshHUD() {
      hud.textContent =
        `${state.help}

pos: x=${fmt(rig.position.x)}  y=${fmt(rig.position.y)}  z=${fmt(rig.position.z)}
rot: x=${fmt(deg(rig.rotation.x),1)}°  y=${fmt(deg(rig.rotation.y),1)}°  z=${fmt(deg(rig.rotation.z),1)}°
scl: x=${fmt(rig.scale.x)}  y=${fmt(rig.scale.y)}  z=${fmt(rig.scale.z)}
steps: move=${state.moveStep}  rot=${state.rotStepDeg}°  scale=${state.scaleStep}
axes: ${axes.visible ? 'ON' : 'OFF'}
`;
    }

    function saveToLocal() {
      const payload = {
        position: {x: rig.position.x, y: rig.position.y, z: rig.position.z},
        rotationDeg: {x: deg(rig.rotation.x), y: deg(rig.rotation.y), z: deg(rig.rotation.z)},
        scale: {x: rig.scale.x, y: rig.scale.y, z: rig.scale.z},
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
      console.log('[Tuner] Saved:', payload);
    }

    function loadFromLocal() {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      try {
        const p = JSON.parse(raw);
        rig.position.set(p.position.x, p.position.y, p.position.z);
        rig.rotation.set(rad(p.rotationDeg.x), rad(p.rotationDeg.y), rad(p.rotationDeg.z));
        rig.scale.set(p.scale.x, p.scale.y, p.scale.z);
        console.log('[Tuner] Loaded:', p);
      } catch (e) {
        console.warn('[Tuner] Load failed:', e);
      }
    }

    async function copyJSON() {
      const payload = {
        position: {x: rig.position.x, y: rig.position.y, z: rig.position.z},
        rotationDeg: {x: deg(rig.rotation.x), y: deg(rig.rotation.y), z: deg(rig.rotation.z)},
        scale: {x: rig.scale.x, y: rig.scale.y, z: rig.scale.z},
      };
      const text = JSON.stringify(payload, null, 2);
      try {
        await navigator.clipboard.writeText(text);
        console.log('[Tuner] Copied to clipboard:\n', text);
      } catch {
        // در بعضی مرورگرها نیاز به تعامل کاربر دارد
        console.log('[Tuner] Copy failed. Here is JSON:\n', text);
        alert('JSON روی کنسول چاپ شد (اجازهٔ Clipboard لازم بود).');
      }
    }

    function resetValues() {
      rig.position.set(0, 0, 0);
      rig.rotation.set(0, 0, 0);
      rig.scale.set(0.1, 0.1, 0.1);
    }

    function nudgePosition(axis, sgn, fine) {
      const step = state.moveStep * (fine ? 0.25 : 1);
      rig.position[axis] += sgn * step;
    }
    function nudgeRotation(axis, sgn, fine) {
      const step = rad(state.rotStepDeg * (fine ? 0.25 : 1));
      rig.rotation[axis] += sgn * step;
    }
    function nudgeScaleUniform(sgn, fine) {
      const step = state.scaleStep * (fine ? 0.25 : 1);
      const f = 1 + sgn * step;
      rig.scale.set(rig.scale.x * f, rig.scale.y * f, rig.scale.z * f);
    }
    function nudgeScaleAxis(axis, sgn, fine) {
      const step = state.scaleStep * (fine ? 0.25 : 1);
      rig.scale[axis] *= (1 + sgn * step);
    }

    window.addEventListener('keydown', (ev) => {
      const fine = ev.shiftKey; // نگه داشتن Shift = ریزتر
      switch (ev.key) {
        // حرکت
        case 'ArrowLeft':  nudgePosition('x', -1, fine); break;
        case 'ArrowRight': nudgePosition('x', +1, fine); break;
        case 'ArrowUp':    nudgePosition('y', +1, fine); break;
        case 'ArrowDown':  nudgePosition('y', -1, fine); break;
        case 'PageUp':     nudgePosition('z', -1, fine); break;   // Z دور/نزدیک: در MindAR معمولاً جلو = مقدار منفی
        case 'PageDown':   nudgePosition('z', +1, fine); break;

        // چرخش (درجه)
        case 'q': case 'Q': nudgeRotation('x', +1, fine); break;
        case 'e': case 'E': nudgeRotation('x', -1, fine); break;
        case 'a': case 'A': nudgeRotation('y', +1, fine); break;
        case 'd': case 'D': nudgeRotation('y', -1, fine); break;
        case 'w': case 'W': nudgeRotation('z', +1, fine); break;
        case 's': case 'S': nudgeRotation('z', -1, fine); break;

        // مقیاس
        case '+': case '=': nudgeScaleUniform(+1, fine); break;
        case '-': case '_': nudgeScaleUniform(-1, fine); break;
        case '[': nudgeScaleAxis('x', -1, fine); break;
        case ']': nudgeScaleAxis('x', +1, fine); break;
        case '{': nudgeScaleAxis('y', -1, fine); break; // روی کیبورد فارسی ممکنه AltGr+[] لازم باشه
        case '}': nudgeScaleAxis('y', +1, fine); break;
        case '\\': nudgeScaleAxis('z', -1, fine); break; // در صورت نبود { } می‌توان از \ برای Z- استفاده کرد
        case '|':  nudgeScaleAxis('z', +1, fine); break;

        // ذخیره/لود/کپی
        case '1': saveToLocal(); break;
        case '2': loadFromLocal(); break;
        case '3': copyJSON(); break;

        // کمک‌ها
        case 'h': case 'H': axes.visible = !axes.visible; break;
        case '0': resetValues(); break;

        default: return;
      }
      ev.preventDefault();
      refreshHUD();
    });

    // اگر قبلاً چیزی ذخیره شده، خودکار لود کن
    loadFromLocal();
    refreshHUD();

    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  };
  start();
});





