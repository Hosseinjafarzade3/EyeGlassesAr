import {loadGLTF} from "./libs/loader.js";
//import {mockWithVideo} from '../../libs/camera-mock.js';
const THREE = window.MINDAR.FACE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {
    //mockWithVideo('../../assets/mock-videos/face1.mp4');









    const mindarThree = new window.MINDAR.FACE.MindARThree({
      container: document.body,
      });





    const {renderer, scene, camera} = mindarThree;

    const light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
    scene.add(light);

    
    const glasses1 = await loadGLTF('./GLASSES/GLASSES1/glasses.glb');
    glasses1.scene.scale.set(0.08866535105013076, 0.08866535105013076, 0.08866535105013076);
    glasses1.scene.position.set(0.02999999999999999, -0.4275000000000003, -2.4024999999999);
    glasses1.scene.rotation.set(0, -90.49999999999969 * Math.PI / 180, 0);
   
    
     const glasses4 = await loadGLTF('./GLASSES/GLASSES4/glasses.glb');
    glasses4.scene.scale.set(0.22290916391346535, 0.22290916391346535, 0.22290916391346535);
    glasses4.scene.position.set(0.004999999999999994, -0.22500000000000014, -2.0924999999998852);
    glasses4.scene.rotation.set(1.987846675914698e-16, -0.4999999999999927 * Math.PI / 180, 0);
    
    
 


    
    const anchor = mindarThree.addAnchor(168);
    anchor.group.add(glasses1.scene);
    anchor.group.add(glasses4.scene);



    glasses1.scene.visible = true;
    glasses4.scene.visible = false;




 document.getElementById("btn1").addEventListener("click", () => {
  glasses1.scene.visible = true;
  glasses4.scene.visible = false;
});

  document.getElementById("btn2").addEventListener("click", () => {
  glasses1.scene.visible = false;
  glasses4.scene.visible = true;
});




    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  }
  start();
});
