import{A as O,X as T,Y as j,f as _,k as s,m as y,n as P,o as R,r as W,y as F}from"./chunk-QNRWHD26.js";var C=class A extends O{constructor(D,o={}){super(D),this.isReflector=!0,this.type="Reflector",this.forceUpdate=!1,this._reflectionCameras=new WeakMap;let c=this,z=o.color!==void 0?new W(o.color):new W(8355711),V=o.textureWidth||512,k=o.textureHeight||512,U=o.clipBias||0,m=o.shader||A.ReflectorShader,B=o.multisample!==void 0?o.multisample:4,d=new F,i=new s,u=new s,w=new s,p=new R,v=new s(0,0,-1),r=new y,x=new s,g=new s,n=new y,h=new R,b=new P(V,k,{samples:B,type:_}),M=new j({name:m.name!==void 0?m.name:"unspecified",uniforms:T.clone(m.uniforms),fragmentShader:m.fragmentShader,vertexShader:m.vertexShader});M.uniforms.tDiffuse.value=b.texture,M.uniforms.color.value=z,M.uniforms.textureMatrix.value=h,this.material=M,this.onBeforeRender=function(e,f,l){let a=this.getReflectionCamera(l);if(u.setFromMatrixPosition(c.matrixWorld),w.setFromMatrixPosition(l.matrixWorld),p.extractRotation(c.matrixWorld),i.set(0,0,1),i.applyMatrix4(p),x.subVectors(u,w),x.dot(i)>0===!0&&this.forceUpdate===!1)return;x.reflect(i).negate(),x.add(u),p.extractRotation(l.matrixWorld),v.set(0,0,-1),v.applyMatrix4(p),v.add(w),g.subVectors(u,v),g.reflect(i).negate(),g.add(u),a.position.copy(x),a.up.set(0,1,0),a.up.applyMatrix4(p),a.up.reflect(i),a.lookAt(g),a.far=l.far,a.updateMatrixWorld(),a.projectionMatrix.copy(l.projectionMatrix),h.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),h.multiply(a.projectionMatrix),h.multiply(a.matrixWorldInverse),h.multiply(c.matrixWorld),d.setFromNormalAndCoplanarPoint(i,u),d.applyMatrix4(a.matrixWorldInverse),r.set(d.normal.x,d.normal.y,d.normal.z,d.constant);let t=a.projectionMatrix;a.isOrthographicCamera?(n.x=(Math.sign(r.x)+t.elements[8])/t.elements[0],n.y=(Math.sign(r.y)+t.elements[9])/t.elements[5],n.z=-l.far,n.w=1):(n.x=(Math.sign(r.x)+t.elements[8])/t.elements[0],n.y=(Math.sign(r.y)+t.elements[9])/t.elements[5],n.z=-1,n.w=(1+t.elements[10])/t.elements[14]),r.multiplyScalar(2/r.dot(n)),t.elements[2]=r.x,t.elements[6]=r.y,a.isOrthographicCamera?(t.elements[10]=r.z-U,t.elements[14]=r.w-1):(t.elements[10]=r.z+1-U,t.elements[14]=r.w),c.visible=!1;let H=e.getRenderTarget(),I=e.xr.enabled,q=e.shadowMap.autoUpdate;e.xr.enabled=!1,e.shadowMap.autoUpdate=!1,e.setRenderTarget(b),e.state.buffers.depth.setMask(!0),e.autoClear===!1&&e.clear(),e.render(f,a),e.xr.enabled=I,e.shadowMap.autoUpdate=q,e.setRenderTarget(H);let S=l.viewport;S!==void 0&&e.state.viewport(S),c.visible=!0,this.forceUpdate=!1},this.getRenderTarget=function(){return b},this.dispose=function(){b.dispose(),c.material.dispose()},this.getReflectionCamera=function(e){let f=this._reflectionCameras.get(e);return f===void 0&&(f=e.clone(),this._reflectionCameras.set(e,f)),f}}};C.ReflectorShader={name:"ReflectorShader",uniforms:{color:{value:null},tDiffuse:{value:null},textureMatrix:{value:null}},vertexShader:`
		uniform mat4 textureMatrix;
		varying vec4 vUv;

		#include <common>
		#include <logdepthbuf_pars_vertex>

		void main() {

			vUv = textureMatrix * vec4( position, 1.0 );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

			#include <logdepthbuf_vertex>

		}`,fragmentShader:`
		uniform vec3 color;
		uniform sampler2D tDiffuse;
		varying vec4 vUv;

		#include <logdepthbuf_pars_fragment>

		float blendOverlay( float base, float blend ) {

			return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );

		}

		vec3 blendOverlay( vec3 base, vec3 blend ) {

			return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );

		}

		void main() {

			#include <logdepthbuf_fragment>

			vec4 base = texture2DProj( tDiffuse, vUv );
			gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>

		}`};export{C as a};
