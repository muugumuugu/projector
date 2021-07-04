function cubeV(side,center,stylus,rotn,digi,store){
	let pen=Pen(7);
	if(stylus){pen=stylus;}
	let faces=[];
	for (let i=0; i<3;i++){
		let verticesF=[];
		let verticesB=[];
		let fac=[[-1,1,1,-1],[-1,-1,1,1],[1,1,1,1]]
		for(let k=0; k<4; k++){
			let v=[ side*fac[i][k], side*fac[(i+1)%3][k], side*fac[(i+2)%3][k]];
			v=vecSum(v,center);
			if (digi){v=vecDigitize(v);}
			verticesF.push(v);
			verticesB.push(vecDot(v,[-1,-1,-1]));
		}
		faces.push(verticesF);
		faces.push(verticesB);
	}
	if (store){return ({faces:faces,pens:pen,rotors:rotn,closeit:true})}
	return solidV(faces,true,pen,rotn);
}
function cuboidV(dimensions,center,stylus,rotn,digi,store){
	let pen=Pen(7);
	if(stylus){pen=stylus;}
	let sides;
	if (Array.isArray(dimensions)){sides=arrCopy(dimensions);}
	else{sides=vec2arr(sides);}
	let faces=[];
	for (let i=0; i<3;i++){
		let verticesF=[];
		let verticesB=[];
		let fac=[[-1,1,1,-1],[-1,-1,1,1],[1,1,1,1]]
		for(let k=0; k<4; k++){
			let v=[ sides[0]*fac[i][k], sides[1]*fac[(i+1)%3][k], sides[2]*fac[(i+2)%3][k]];
			v=vecSum(v,center);
			if (digi){v=vecDigitize(v);}
			verticesF.push(v);
			verticesB.push(vecDot(v,[-1,-1,-1]));
		}
		faces.push(verticesF);
		faces.push(verticesB);
	}
	if (store){return ({faces:faces,pens:pen,rotors:rotn,closeit:true})}
	return solidV(faces,true,pen,rotn);
}