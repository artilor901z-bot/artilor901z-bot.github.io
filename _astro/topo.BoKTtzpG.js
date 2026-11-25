import{Box3 as e,BoxGeometry as t,BufferAttribute as n,BufferGeometry as r,Color as i,Float32BufferAttribute as a,Group as o,InstancedBufferGeometry as s,InstancedInterleavedBuffer as c,InstancedMesh as l,InterleavedBufferAttribute as u,Line as d,Line3 as f,LineBasicMaterial as ee,LineDashedMaterial as te,LineSegments as ne,MathUtils as p,Matrix4 as re,Mesh as m,MeshBasicMaterial as h,OrthographicCamera as ie,Quaternion as ae,Scene as oe,ShaderLib as g,ShaderMaterial as _,Sphere as v,SphereGeometry as se,UniformsLib as y,UniformsUtils as b,Vector2 as x,Vector3 as S,Vector4 as C,WebGLRenderer as ce,WireframeGeometry as le}from"./three.module.CZwSHvn9.js";var w=new e,T=new S,E=class extends s{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type=`LineSegmentsGeometry`,this.setIndex([0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5]),this.setAttribute(`position`,new a([-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],3)),this.setAttribute(`uv`,new a([-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],2))}applyMatrix4(e){let t=this.attributes.instanceStart,n=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),n.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let n=new c(t,6,1);return this.setAttribute(`instanceStart`,new u(n,3,0)),this.setAttribute(`instanceEnd`,new u(n,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let n=new c(t,6,1);return this.setAttribute(`instanceColorStart`,new u(n,3,0)),this.setAttribute(`instanceColorEnd`,new u(n,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new le(e.geometry)),this}fromLineSegments(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new e);let t=this.attributes.instanceStart,n=this.attributes.instanceEnd;t!==void 0&&n!==void 0&&(this.boundingBox.setFromBufferAttribute(t),w.setFromBufferAttribute(n),this.boundingBox.union(w))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new v),this.boundingBox===null&&this.computeBoundingBox();let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){let n=this.boundingSphere.center;this.boundingBox.getCenter(n);let r=0;for(let i=0,a=e.count;i<a;i++)T.fromBufferAttribute(e,i),r=Math.max(r,n.distanceToSquared(T)),T.fromBufferAttribute(t,i),r=Math.max(r,n.distanceToSquared(T));this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error(`THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.`,this)}}toJSON(){}};y.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new x},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}},g.line={uniforms:b.merge([y.common,y.fog,y.line]),vertexShader:`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		float trimSegmentAlpha( const in vec4 start, const in vec4 end ) {

			// compute the interpolation factor needed to trim the segment so it terminates
			// between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column

			// we need different nearEstimate formula for reversed and default depth buffer
			// a is positive with a reversed depth buffer so it can be used for controlling the code flow
			float nearEstimate = ( a > 0.0 ) ? ( - b / ( a + 1.0 ) ) : ( - 0.5 * b / a );

			return ( nearEstimate - start.z ) / ( end.z - start.z );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef USE_DASH

				float lineDistanceStart = dashScale * instanceDistanceStart;
				float lineDistanceEnd = dashScale * instanceDistanceEnd;

			#endif

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					float alpha = trimSegmentAlpha( start, end );
					end.xyz = mix( start.xyz, end.xyz, alpha );

					#ifdef USE_DASH

						lineDistanceEnd = mix( lineDistanceStart, lineDistanceEnd, alpha );

					#endif

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					float alpha = trimSegmentAlpha( end, start );
					start.xyz = mix( end.xyz, start.xyz, alpha );

					#ifdef USE_DASH

						lineDistanceStart = mix( lineDistanceEnd, lineDistanceStart, alpha );

					#endif

				}

			}

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? lineDistanceStart : lineDistanceEnd;
				vUv = uv;

			#endif

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = perspective ? normalize( mix( start.xyz, end.xyz, 0.5 ) ) : vec3( 0.0, 0.0, - 1.0 );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;

				// only shift the depth of vertices in front of the camera (#35137)
				if ( clip.w > 0.0 ) clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,fragmentShader:`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			float alpha = opacity;
			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			#ifdef WORLD_UNITS

				float len;

				if ( isOrthographic ) {

					// View rays are parallel to the z axis so the distance reduces to camera-space XY
					vec2 lineDir = worldEnd.xy - worldStart.xy;
					float t = clamp( dot( worldPos.xy - worldStart.xy, lineDir ) / dot( lineDir, lineDir ), 0.0, 1.0 );
					len = length( worldStart.xy + lineDir * t - worldPos.xy );

				} else {

					// Find the closest points on the view ray and the line segment
					vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
					vec3 lineDir = worldEnd - worldStart;
					vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

					vec3 p1 = worldStart + lineDir * params.x;
					vec3 p2 = rayEnd * params.y;
					vec3 delta = p1 - p2;
					len = length( delta );

				}

				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`};var D=class extends _{constructor(e){super({type:`LineMaterial`,uniforms:b.clone(g.line.uniforms),vertexShader:g.line.vertexShader,fragmentShader:g.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return`WORLD_UNITS`in this.defines}set worldUnits(e){e===!0!==this.worldUnits&&(this.needsUpdate=!0),e===!0?this.defines.WORLD_UNITS=``:delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return`USE_DASH`in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH=``:delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return`USE_ALPHA_TO_COVERAGE`in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE=``:delete this.defines.USE_ALPHA_TO_COVERAGE)}},O=new C,k=new S,A=new S,j=new C,M=new C,N=new C,P=new S,F=new re,I=new f,L=new S,R=new e,z=new v,B=new C,V,H;function U(e,t,n){return B.set(0,0,-t,1).applyMatrix4(e.projectionMatrix),B.multiplyScalar(1/B.w),B.x=H/n.width,B.y=H/n.height,B.applyMatrix4(e.projectionMatrixInverse),B.multiplyScalar(1/B.w),Math.abs(Math.max(B.x,B.y))}function W(e,t){let n=e.matrixWorld,r=e.geometry,i=r.attributes.instanceStart,a=r.attributes.instanceEnd,o=Math.min(r.instanceCount,i.count);for(let r=0,s=o;r<s;r++){I.start.fromBufferAttribute(i,r),I.end.fromBufferAttribute(a,r),I.applyMatrix4(n);let o=new S,s=new S;V.distanceSqToSegment(I.start,I.end,s,o),s.distanceTo(o)<H*.5&&t.push({point:s,pointOnLine:o,distance:V.origin.distanceTo(s),object:e,face:null,faceIndex:r,uv:null,uv1:null})}}function G(e,t,n){let r=t.projectionMatrix,i=e.material.resolution,a=e.matrixWorld,o=e.geometry,s=o.attributes.instanceStart,c=o.attributes.instanceEnd,l=Math.min(o.instanceCount,s.count),u=-t.near;V.at(1,N),N.w=1,N.applyMatrix4(t.matrixWorldInverse),N.applyMatrix4(r),N.multiplyScalar(1/N.w),N.x*=i.x/2,N.y*=i.y/2,N.z=0,P.copy(N),F.multiplyMatrices(t.matrixWorldInverse,a);for(let t=0,o=l;t<o;t++){if(j.fromBufferAttribute(s,t),M.fromBufferAttribute(c,t),j.w=1,M.w=1,j.applyMatrix4(F),M.applyMatrix4(F),j.z>u&&M.z>u)continue;if(j.z>u){let e=j.z-M.z,t=(j.z-u)/e;j.lerp(M,t)}else if(M.z>u){let e=M.z-j.z,t=(M.z-u)/e;M.lerp(j,t)}j.applyMatrix4(r),M.applyMatrix4(r),j.multiplyScalar(1/j.w),M.multiplyScalar(1/M.w),j.x*=i.x/2,j.y*=i.y/2,M.x*=i.x/2,M.y*=i.y/2,I.start.copy(j),I.start.z=0,I.end.copy(M),I.end.z=0;let o=I.closestPointToPointParameter(P,!0);I.at(o,L);let l=p.lerp(j.z,M.z,o),d=l>=-1&&l<=1,f=P.distanceTo(L)<H*.5;if(d&&f){I.start.fromBufferAttribute(s,t),I.end.fromBufferAttribute(c,t),I.start.applyMatrix4(a),I.end.applyMatrix4(a);let r=new S,i=new S;V.distanceSqToSegment(I.start,I.end,i,r),n.push({point:i,pointOnLine:r,distance:V.origin.distanceTo(i),object:e,face:null,faceIndex:t,uv:null,uv1:null})}}}var K=class extends m{constructor(e=new E,t=new D({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type=`LineSegments2`}computeLineDistances(){let e=this.geometry,t=e.attributes.instanceStart,n=e.attributes.instanceEnd,r=new Float32Array(2*t.count);for(let e=0,i=0,a=t.count;e<a;e++,i+=2)k.fromBufferAttribute(t,e),A.fromBufferAttribute(n,e),r[i]=i===0?0:r[i-1],r[i+1]=r[i]+k.distanceTo(A);let i=new c(r,2,1);return e.setAttribute(`instanceDistanceStart`,new u(i,1,0)),e.setAttribute(`instanceDistanceEnd`,new u(i,1,1)),this}raycast(e,t){let n=this.material.worldUnits,r=e.camera;if(r===null&&!n&&console.error(`LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.`),n===!1&&(this.material.resolution.x===0||this.material.resolution.y===0))return;let i=e.params.Line2===void 0?0:e.params.Line2.threshold||0;V=e.ray;let a=this.matrixWorld,o=this.geometry,s=this.material;H=s.linewidth+i,o.boundingSphere===null&&o.computeBoundingSphere(),z.copy(o.boundingSphere).applyMatrix4(a);let c;if(c=n?H*.5:U(r,Math.max(r.near,z.distanceToPoint(V.origin)),s.resolution),z.radius+=c,V.intersectsSphere(z)===!1)return;o.boundingBox===null&&o.computeBoundingBox(),R.copy(o.boundingBox).applyMatrix4(a);let l;l=n?H*.5:U(r,Math.max(r.near,R.distanceToPoint(V.origin)),s.resolution),R.expandByScalar(l),V.intersectsBox(R)!==!1&&(n?W(this,t):G(this,r,t))}onBeforeRender(e){let t=this.material.uniforms;t&&t.resolution&&(e.getViewport(O),this.material.uniforms.resolution.value.set(O.z,O.w))}},ue=class extends E{constructor(){super(),this.isLineGeometry=!0,this.type=`LineGeometry`}setPositions(e){let t=e.length-3,n=new Float32Array(2*t);for(let r=0;r<t;r+=3)n[2*r]=e[r],n[2*r+1]=e[r+1],n[2*r+2]=e[r+2],n[2*r+3]=e[r+3],n[2*r+4]=e[r+4],n[2*r+5]=e[r+5];return super.setPositions(n),this}setColors(e){let t=e.length-3,n=new Float32Array(2*t);for(let r=0;r<t;r+=3)n[2*r]=e[r],n[2*r+1]=e[r+1],n[2*r+2]=e[r+2],n[2*r+3]=e[r+3],n[2*r+4]=e[r+4],n[2*r+5]=e[r+5];return super.setColors(n),this}setFromPoints(e){let t=e.length-1,n=new Float32Array(6*t);for(let r=0;r<t;r++)n[6*r]=e[r].x,n[6*r+1]=e[r].y,n[6*r+2]=e[r].z||0,n[6*r+3]=e[r+1].x,n[6*r+4]=e[r+1].y,n[6*r+5]=e[r+1].z||0;return super.setPositions(n),this}fromLine(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}},de=class extends K{constructor(e=new ue,t=new D({color:Math.random()*16777215})){super(e,t),this.isLine2=!0,this.type=`Line2`}},fe={main:15754285,short:15906565,dead:4037609,check:15017515,start:1053462,end:1053462,poi:1053462,lamp:15906565},pe=`
varying vec3 vLocal; varying vec3 vScale; varying vec3 vN;
void main(){
  vLocal = position;
  vScale = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
  vN = normalize(mat3(instanceMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}`,me=`
uniform float uEdge; uniform vec3 uInk; uniform float uAlpha;
varying vec3 vLocal; varying vec3 vScale; varying vec3 vN;
void main(){
  vec3 d = (0.5 - abs(vLocal)) * vScale;           // 到三组面的距离（米）
  float a = min(d.x, min(d.y, d.z));
  float c = max(d.x, max(d.y, d.z));
  float mid = d.x + d.y + d.z - a - c;              // 第二小的：小于线宽就是棱
  float edge = 1.0 - smoothstep(uEdge * 0.6, uEdge, mid);
  float shade = vN.y > 0.5 ? 1.0 : (abs(vN.x) > abs(vN.z) ? 0.9 : 0.8);
  vec3 col = mix(vec3(shade), uInk, edge * 0.85);
  gl_FragColor = vec4(col, uAlpha);
}`;async function q(a){let s=a.querySelector(`canvas`),c=a.querySelector(`[data-labels]`),u=await fetch(a.dataset.src);if(!u.ok)throw Error(`topo data `+u.status);let f=await u.json(),p=new ce({canvas:s,antialias:!0,alpha:!0});p.setPixelRatio(Math.min(devicePixelRatio,2));let g=new oe,v=new ie(-1,1,1,-1,-5e3,5e3),y=new _({vertexShader:pe,fragmentShader:me,uniforms:{uEdge:{value:.3},uInk:{value:new i(2764595)},uAlpha:{value:1}}}),b=new l(new t(1,1,1),y,f.boxes.length),x=new re,C=new ae,le=new S(0,1,0);f.boxes.forEach((e,t)=>{C.setFromAxisAngle(le,(e[6]||0)*Math.PI/180),x.compose(new S(e[0],e[1],e[2]),C,new S(e[3],e[4],e[5])),b.setMatrixAt(t,x)}),b.frustumCulled=!1,g.add(b);let w=null,T=null;if(f.mesh){let e=new Float32Array(f.mesh.v),t=new r;t.setAttribute(`position`,new n(e,3)),t.setIndex(new n(new Uint32Array(f.mesh.i),1)),w=new _({vertexShader:`varying vec3 vW; void main(){ vW = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,fragmentShader:`uniform float uAlpha; varying vec3 vW; void main(){ vec3 n = normalize(cross(dFdx(vW), dFdy(vW))); float s = abs(n.y) > 0.6 ? 1.0 : (abs(n.x) > abs(n.z) ? 0.9 : 0.8); gl_FragColor = vec4(vec3(s), uAlpha); }`,uniforms:{uAlpha:{value:1}},side:2,polygonOffset:!0,polygonOffsetFactor:1.5,polygonOffsetUnits:2});let i=new m(t,w);i.frustumCulled=!1,g.add(i);let a=new r;a.setAttribute(`position`,new n(e,3)),a.setIndex(new n(new Uint32Array(f.mesh.e),1)),T=new ee({color:2764595,transparent:!0,opacity:.9});let o=new ne(a,T);o.frustumCulled=!1,g.add(o)}let E=new e;f.routes.forEach(e=>e.pts.forEach(e=>E.expandByPoint(new S(...e)))),f.zones.forEach(e=>E.expandByPoint(new S(e.rect[0],e.y,e.rect[1])).expandByPoint(new S(e.rect[2],e.y,e.rect[3])));let O=E.getCenter(new S),k=Math.max(20,E.getSize(new S).length()/2),A={},j=e=>(A[e]||g.add(A[e]=new o),A[e]),M=[];for(let e of f.routes){let t=new ue;t.setPositions(e.pts.flat());let n=new D({color:fe[e.kind]??1053462,linewidth:e.kind===`main`?3.4:2.6,dashed:e.kind!==`main`,dashSize:k*.018,gapSize:k*.012,depthTest:!1,transparent:!0});M.push(n);let r=new de(t,n);r.computeLineDistances(),r.renderOrder=e.kind===`main`?6:5,j(e.kind).add(r)}let N=new te({color:1053462,dashSize:k*.012,gapSize:k*.01,depthTest:!1,transparent:!0,opacity:.75});for(let e of f.zones){let[t,n,i,a]=e.rect,o=new r().setFromPoints([[t,n],[i,n],[i,a],[t,a],[t,n]].map(([t,n])=>new S(t,e.y+.2,n))),s=new d(o,N);s.computeLineDistances(),s.renderOrder=4,j(`zone`).add(s)}let P=[],F=new se(1,20,12);for(let e of f.points){let t=e.kind===`check`||e.kind===`start`||e.kind===`end`,n=new m(F,new h({color:fe[e.kind]??1053462,depthTest:!1,transparent:!0}));n.position.set(...e.p),n.renderOrder=8,P.push({mesh:n,base:t?1:.62}),j(e.kind===`start`||e.kind===`end`?`main`:e.kind).add(n)}let I=new m(F,new h({color:16777215,depthTest:!1})),L=new m(F,new h({color:15754285,depthTest:!1}));I.renderOrder=11,L.renderOrder=10,I.visible=L.visible=!1,g.add(L,I);let R=[],z=(e,t,n,r)=>{let i=document.createElement(`span`);i.className=e,i.innerHTML=t,c.append(i),R.push({el:i,p:new S(...n),layer:r})},B=e=>e.replace(/[&<>]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`})[e]);f.zones.forEach(e=>z(`tp-zone`,`<b>${B(e.label)}</b>${e.sub?`<i>/ ${B(e.sub)}</i>`:``}`,[e.rect[2],e.y,e.rect[3]],`zone`)),f.points.filter(e=>e.kind!==`lamp`&&e.kind!==`check`).forEach(e=>z(`tp-pt`+(e.kind===`start`||e.kind===`end`?` is-key`:``),B(e.label),e.p,e.kind===`start`||e.kind===`end`?`main`:e.kind)),f.labels.forEach(e=>z(`tp-pt`,B(e.text)+(e.sub?` <i>${B(e.sub)}</i>`:``),e.p,`poi`));let V={az:Math.PI/4,el:.62,zoom:1,w:1,h:1,dirty:!0,walk:-1},H=new S,U=()=>{let e=new S(Math.cos(V.el)*Math.sin(V.az),Math.sin(V.el),Math.cos(V.el)*Math.cos(V.az));v.position.copy(O).addScaledVector(e,1e3),v.lookAt(O);let t=k*1.08/V.zoom,n=V.w/V.h,r=n>1?t/Math.min(n,1.5):t/n;v.left=-r*n,v.right=r*n,v.top=r,v.bottom=-r,v.updateProjectionMatrix();let i=r*2/V.h;y.uniforms.uEdge.value=i*1.15;let a=i*7;P.forEach(e=>e.mesh.scale.setScalar(a*e.base)),I.scale.setScalar(a*.75),L.scale.setScalar(a*1.35)},W=()=>{let e=s.getBoundingClientRect();e.width&&e.height&&(V.w=e.width,V.h=e.height,p.setSize(e.width,e.height,!1),M.forEach(t=>t.resolution.set(e.width,e.height)),V.dirty=!0)},G=new ResizeObserver(W);G.observe(s),W();let K=f.routes.filter(e=>e.kind===`main`).flatMap(e=>e.pts.map(e=>new S(...e))),q=[0];for(let e=1;e<K.length;e++)q.push(q[e-1]+K[e].distanceTo(K[e-1]));let he=q[q.length-1]||1,J=0,Y=performance.now(),ge=!0,X=!0,_e=e=>{if(J=0,!ge)return;let t=Math.min(.05,(e-Y)/1e3);if(Y=e,V.walk>=0){if(V.walk+=t*he/14,V.walk>=he)V.walk=-1;else{let e=1;for(;e<q.length-1&&q[e]<V.walk;)e++;let t=(V.walk-q[e-1])/Math.max(1e-6,q[e]-q[e-1]);I.position.lerpVectors(K[e-1],K[e],t),L.position.copy(I.position)}I.visible=L.visible=V.walk>=0,V.dirty=!0}if(V.dirty){V.dirty=!1,U(),p.render(g,v);for(let e of R){H.copy(e.p).project(v);let t=A[e.layer]?.visible!==!1;e.el.style.display=t?``:`none`,e.el.style.transform=`translate(${(H.x+1)/2*V.w}px,${(1-H.y)/2*V.h}px)`}}X&&(V.walk>=0||V.dirty)&&(J=requestAnimationFrame(_e))},Z=()=>{V.dirty=!0,!J&&X&&(Y=performance.now(),J=requestAnimationFrame(_e))},ve=new IntersectionObserver(([e])=>{X=e.isIntersecting,X&&Z()});ve.observe(a);let Q=null,ye=e=>{Q={x:e.clientX,y:e.clientY,az:V.az,el:V.el},s.setPointerCapture(e.pointerId),a.classList.add(`is-drag`)},be=e=>{Q&&(V.az=Q.az-(e.clientX-Q.x)*.006,V.el=Math.min(1.45,Math.max(.25,Q.el+(e.clientY-Q.y)*.004)),Z())},$=()=>{Q=null,a.classList.remove(`is-drag`)};s.addEventListener(`pointerdown`,ye),s.addEventListener(`pointermove`,be),s.addEventListener(`pointerup`,$),s.addEventListener(`pointercancel`,$);let xe=e=>{let t=e.target.closest(`[data-act],[data-layer]`);if(!t)return;let n=t.dataset.act;if(n===`in`&&(V.zoom=Math.min(6,V.zoom*1.35)),n===`out`&&(V.zoom=Math.max(.5,V.zoom/1.35)),n===`reset`&&Object.assign(V,{az:Math.PI/4,el:.62,zoom:1}),n===`top`&&Object.assign(V,{az:0,el:1.45}),n===`walk`&&(V.walk=0),n===`solid`){let e=t.getAttribute(`aria-pressed`)!==`true`;t.setAttribute(`aria-pressed`,String(e)),y.transparent=e,y.depthWrite=!e,y.uniforms.uAlpha.value=e?.28:1,y.needsUpdate=!0,w&&T&&(w.transparent=e,w.depthWrite=!e,w.uniforms.uAlpha.value=e?.22:1,w.needsUpdate=!0,T.opacity=e?.45:.9)}let r=t.dataset.layer;if(r){let e=t.getAttribute(`aria-pressed`)!==`true`;t.setAttribute(`aria-pressed`,String(e)),r.split(` `).forEach(t=>A[t]&&(A[t].visible=e))}Z()};return a.addEventListener(`click`,xe),f.boxes.length>300&&a.querySelector(`[data-act="solid"]`)?.click(),a.classList.add(`is-ready`),Z(),()=>{ge=!1,cancelAnimationFrame(J),G.disconnect(),ve.disconnect(),a.removeEventListener(`click`,xe),s.removeEventListener(`pointerdown`,ye),s.removeEventListener(`pointermove`,be),s.removeEventListener(`pointerup`,$),s.removeEventListener(`pointercancel`,$),c.innerHTML=``,p.dispose()}}export{q as mountTopo};