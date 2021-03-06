//coordinates in screen system.
function intrinsicM(fx,fy,px,py,skew){
	let fx_=1,fy_=1,px_=0,py_=0,s=0;
	//scaling.
	if(fx){fx_=fx;fy_=fx;}
	if(fy){fy_=fy;}
	//transln
	if(px){px_=px;py_=px;}
	if(py){py_=py;}
	//shear.
	if(skew){s=skew;}
	return [
		[fx_,0  , 0  ,0],
		[s  ,fy_, 0  ,0],
		[px_,py_, 1  ,0],
		[  0,  0, 0  ,1]
	]
}
function poseM(CamRot,CamCenter){
	let CamC=identityMatrix(4);
	let R=identityMatrix(4);
	if (CamCenter){CamC=transM(vecScale(CamCenter,-1));}
	if (CamRot){R=transposed(CamRot);}
	return matMult(CamC,R);
}
function lookAtM(posV,lookPoint,upD){
	let CamC=vec3();
	if (posV){CamC=posV;}
	let upp=vec3(0,1,0)
	if(upD){upp=upD;}
	let looking=vec3();
	if(lookPoint){looking=lookPoint;}
	let zz=vecDiff(looking,CamC);
	zz=vecNormalize(zz);
	let xx=vecNormalize(vecCross(zz,upp));
	let yy=vecCross(xx,zz);
	zz=vecScale(zz,-1);
	return poseM([vec2arr(xx),vec2arr(yy),vec2arr(zz)],vec2arr(CamC));
}
//----------------------------------------------
function Camera(intrinsic,extrinsic){//PRE MULTIPLIER
	let int_=intrinsicM();
	let ext_=poseM();
	if (intrinsic){int_=intrinsic;}
	if (extrinsic){ext_=extrinsic;}
	return matMult(ext_,int_);
}
//================================================================
function decomposeCam(camMatrix){
	camMatrix=camMatrix||scene.cam;
	if(!camMatrix){return {ROT:identityMatrix(4),INTRINSIC:identityMatrix(4),POS:nullMatrix(1,3)};}
	let t=[getrow(camMatrix,4)];
	transpose(t);transpose(camMatrix);
	let decomp=QRdecompose(minor(camMatrix,3,3));
	if(det(decomp.Q)<0){scaleMatrix(decomp.Q,-1);decomp.R[2]=scaledArr(decomp.R[2],-1);}
	let posn=matMult(decomp.Q,t);
	transpose(decomp.R);
	//transpose(decomp.Q);
	transpose(posn);
	decomp.R=swapMinor(identityMatrix(4),decomp.R,0,0);
	decomp.Q=swapMinor(identityMatrix(4),decomp.Q,0,0);
	scaleMatrix(posn,-1);
	let res={ROT:decomp.Q,INTRINSIC:decomp.R,POS:posn[0]}
	if(scene.cam){scene.camComponents=res;}
	transpose(camMatrix);//restore.
	return res;
}