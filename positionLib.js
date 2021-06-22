class position{
  constructor(coors,scene,phys){
    //..........................
    this.scene=Scene();
    if (scene){this.scene=scene;}
    //.........................
    this.phys=null;
    if(phys){this.phys=phys}
    //........................
    if (Array.isArray(coors)){
      this.coors=coors;
      this.dim=coors.length;
      this.pos=arr2vec(coors);
      this.origin=new position(this.dim,this.scene,this.phys);
    }
    else if (typeof(coors)=='object'){
      this.coors=vec2arr(coors);
      this.dim=coors.length;
      this.pos=arr2vec(coors);
      this.origin=new position(this.dim,this.scene,this.phys);
    }
    else {
      let dim=1;
      if (coors){dim=coors;}
      this.coors=[];
      for (let i=0; i<dim; i++){this.coors.push(0);}
      this.dim=dim;
      //
      this.pos=vec3();
      this.origin=null;
    }
    this.upd();
  }
  //
  copy(){
    return (new position(this.coors,this.scene,this.phys));
  }
  log(){
    this.upd();
    let raster='pixel '+nf(this.screen.x)+','+nf(this.screen.y)+'\n@depth' +this.screen.z;
    console.log(raster)
    return (this);
  }
  upd(){
    this.dim=this.coors.length;
    this.pos=arr2vec(this.coors);
    //------------------------------------------------
    if (globalT){this.pos=applyTrans(this.pos,globalT);}
    //------------------------------------------------
    if      (this.scene.mode==0){this.screen=this.orthoproject();}
    else if (this.scene.mode==1){this.screen=this.stereoproject();}
    //.....................
    else if (this.scene.mode==2){this.screen=this.fisheyeview();}
    else if (this.scene.mode==3){this.screen=this.humanview();}
    //
    else if (this.scene.mode==4){this.screen=this.isoproject();}
    //.....................
    else if (this.scene.mode==5){this.screen=this.customproject();}
    //------------------------------------------------
    return this.screen;
  }
  digitize(){
    if(this.scene.cnv){
      this.scene.stretches=[1,-1,1];
      this.shift([this.scene.cnv.width/2,this.scene.cnv.height/2,0]);
    }
    else{
      this.scene.stretches=[1,-1,1];
      this.shift([width/2,height/2,0]);  
    }
    if (this.origin){this.origin.digitize();}
    return this.upd();
  }
  //
  column(){
    let col=[];
    for (let i=0; i<this.dim;i++){col.push([this.coors[i]]);}
    return col;
  }
  row(){
    return([this.coors]);
  }
  depth(){
    let zlim,alphalim;
    if(this.scene.cnv){
      zlim=(this.scene.cnv.width+this.scene.cnv.height)/2;
      if(this.scene.cnv.DEPTH){zlim=this.scene.cnv.DEPTH;}
      alphalim=this.scene.cnv._colorMaxes[this.scene.cnv._colorMode][3]
    }
    else{
      zlim=(width+height)/2;
      if (DEPTH){zlim=DEPTH;}
      alphalim=_colorMaxes[_colorMode][3]
    }
    return ((this.screen.z+zlim/2)*alphalim/zlim);
  }
  //
  magsq(){
    let magsqr=arrSquash(arrProd(this.coors,this.coors));
    return magsqr;
  }
  mag(){
    let magn=Math.sqrt(this.magsq());
    return magn;
  }
  direc(){
    let uV=this.unitV();
    let angs=[];
    for (let i=0; i<this.dim;i++){
      angs.push(Math.acos(dircosine));
    }    
    return angs;
  }
  unitV(){
    let uV=[];
    let mag=this.mag();
    for (let i=0; i<this.dim;i++){
      let dircosine=this.coors[i]/mag;
      uV.push(dircosine);
    }    
    return (new position(uV,this.scene,this.phys));
  }
  polar(){
    let polarcoors={r:0,theta:0};
    let rr=Math.sqrt(this.pos.x*this.pos.x+this.pos.y*this.pos.y);
    let ang=Math.atan(this.pos.y/this.pos.x);
    polarcoors={r:rr,theta:ang};
    return polarcoors;
  }
  //
  connect(ngbr,clr,stk){
    this.upd();
    let neighbour;
    if (Array.isArray(ngbr)){neighbour=new position(ngbr,this.scene,this.phys) }
    else{neighbour=ngbr;}
    neighbour.upd();
    if (this.scene.cnv){
      this.scene.cnv.push();
      if (clr){this.scene.cnv.stroke(clr);}
      if (stk){this.scene.cnv.strokeWeight(stk);}
      this.scene.cnv.line(this.screen.x,this.screen.y,neighbour.screen.x,neighbour.screen.y);
      this.scene.cnv.pop();
    }
    else{
      push();
      if (clr){stroke(clr);}
      if (stk){strokeWeight(stk);}
      line(this.screen.x,this.screen.y,neighbour.screen.x,neighbour.screen.y)
      pop();
    }
    return vecMag(vecDiff(this.screen,neighbour.screen));
  }
  dist(ngbr){
    let neighbour;
    if (Array.isArray(ngbr)){neighbour=ngbr}
    else{neighbour=ngbr.coors;}
    return Math.sqrt(arrDiff(this.coors,ngbr));
  }
  diff(ngbr){
    let neighbour;
    if (Array.isArray(ngbr)){neighbour=ngbr }
    else{neighbour=ngbr.coors;}
    let diffn=arrDiff(this.coors,ngbr.coors)
    return (new position(diffn,this.scene,this.phys));
  }
  sum(ngbr){
    let neighbour;
    if (Array.isArray(ngbr)){neighbour=ngbr;}
    else{neighbour=ngbr.coors;}
    let sumn=arrSum(this.coors,ngbr.coors)
    return (new position(sumn,this.scene,this.phys));
  }
  add(vec){
    let v2;
    if (Array.isArray(vec)){v2=vec; }
    else{v2=vec.coors;}
    this.coors=arrSum(this.coors,v2);
    this.upd();
    return this;
  }
  sub(vec){
    let v2;
    if (Array.isArray(vec)){v2=vec; }
    else{v2=vec.coors;}
    this.coors=arrDiff(this.coors,v2);
    this.upd();
    return this;
  }
  dot2V(vec){
    let dat;
    if (Array.isArray(vec)){dat=vec;}
    else {dat=vec.coors}
    let dotarr=arrProd(this.coors,dat);
    return (new position(dotarr,this.scene,this.phys));
  }
  dot(vec){
    let dat;
    if (Array.isArray(vec)){dat=vec;}
    else {dat=vec.coors}
    let dotarr=arrProd(this.coors,dat);
    return arrSquash(dotarr);
  }
  cross(vec){
    let v2;
    if (Array.isArray(vec)){v2=vec}
    else{v2=vec.coors;}
    let matreece=[[1,1,1],[...this.coors],[...v2]]
    let crossCors=[];
    for(let i=0; i<3;i++){crossCors.push(cofactor(matreece,0,i)); }
    return (new position(crossCors,this.scene,this.phys));
  }
  //
  inc(k,comp){
    if (typeof(k)!='number'){k=1;}
    if (typeof(comp)=='number'){this.coors[comp]+=k;}
    else{this.coors=arrInc(this.coors,k);}
    this.upd();
    return this;
  }
  dec(k,comp){
    if (typeof(k)!='number'){k=1;}
    if (typeof(comp)=='number'){this.coors[comp]-=k;}
    else{this.coors=arrInc(this.coors,-k);}
    this.upd();
    return this;
  }
  scale(k,axis){
    if(axis){this.coors[axis]*=k;}
    else{this.coors=scaledArr(this.coors,k);}
    this.upd();
    return this;
  }
  scaled(k,axis){
    let scaledV=[...this.coors];
    if(axis){scaledV[axis]*=k;}
    else{scaledV=scaledArr(this.coors,k);}
    return (new position(scaledV,this.scene,this.phys));
  }
  normalize(){
    let r=this.mag();
    if(r!=0){this.coors=scaledArr(this.coors,1/r);}
    this.upd();
    return this;
  }
  //
  disp(clr,stk){
    this.upd();
    if (this.scene.cnv){
      this.scene.cnv.push();
      if (clr){this.scene.cnv.stroke(clr);}
      if (stk){this.scene.cnv.strokeWeight(stk);}
      this.scene.cnv.point(this.screen.x,this.screen.y);
      this.scene.cnv.pop();
    }
    else{
      push();
      if (clr){stroke(clr);}
      if (stk){strokeWeight(stk);}
      point(this.screen.x,this.screen.y);
      pop();
    }
    return (this.screen)
  }
  pVec(clr,stk){
    this.connect(this.origin,clr,stk)
    return (this.origin.pos,this.pos)
  }
  //
  shiftO(origin){
    if (this.origin){this.origin.add(origin);}
    else{
      if (Array.isArray(origin)){this.origin=new position(origin,this.scene,this.phys)}
      else{this.origin=origin;}
    }
    this.upd();
    return this;
  }
  rot(rotn){
    let rx;
    if(rotn.x){rx=this.rotated(rotn.x,'X')}else{rx=this.copy()}
    let ry;
    if(rotn.y){ry=rx.rotated(rotn.y,'Y')}else{ry=rx;}
    let rz;
    if(rotn.z){rz=ry.rotated(rotn.z,'Z')}else{rz=ry;}
    return rz;
   }
  rotate(angle,axis){
    this.coors=transposed(matMult(rotMatrix(axis,angle),this.column()))[0];
    this.upd();
    return this;
  }
  rotated(angle,axis){
    return (new position(transposed(matMult(rotMatrix(axis,angle),this.column()))[0],this.scene,this.phys));
  }
  transform(T){
    this.pos=applyTrans(this.pos,TransMatrix);
    this.coors=vec2arr(this.pos);
    this.upd();
    return this;
  }
  transformed(TransMatrix){
    return (new position(vec2arr(applyTrans(this.pos,TransMatrix)),this.scene,this.phys))
  }
  //
  stretch(k,axis){
    if (axis){this.scene.stretches[axis]*=k;}
    else{this.scene.stretches=vecScale(this.scene.stretches,k)}
    if(this.origin){this.origin.stretch(k,axis);}
    this.upd();
    return this;
  }
  shift(center_){
    if(Array.isArray(center_)){this.scene.center=arr2vec(center_);}
    else{this.scene.center=center_;}
    if (this.origin){this.origin.shift(center_);}
    return this;
  }
  shiftModify(center_){
    this.scene.center=vecSum(this.scene.center,center_);
    if (this.origin){this.origin.shiftModify(center_);}
    return this;
  }
  //==================================================
  //parallel
  orthoproject(){
    return this.fix(this.pos);
  }
  stereoproject(){
    let zlim;
    if(this.scene.cnv){
      zlim=(this.scene.cnv.width+this.scene.cnv.height)/2;
      if(this.scene.cnv.DEPTH){zlim=this.scene.cnv.DEPTH;}
    }
    else{
      zlim=(width+height)/2;
      if(DEPTH){zlim=DEPTH;}
    }
    let postempp=this.fix(this.pos,2);
    let camdist=(zlim-postempp.z)/zlim;
    if (camdist==0){camdist=1.0;}
    let postemp=vecScale(postempp,1/camdist)    
    return this.fix(postemp,3);
  }
  //curvilinear
  fisheyeview(){
    let fac=1/5;
    let R;
    if(this.scene.cnv){
      R=Math.min(this.scene.cnv.width,this.scene.cnv.height);
      if(this.scene.cnv.DEPTH){R=Math.min(this.scene.cnv.DEPTH,R);}
    }
    else{
      R=Math.min(width,height);
      if(DEPTH){R=Math.min(DEPTH,R);}
    }
    let pos_=this.fix(this.pos,2)//get origin fixed, screen scaled, uncentered positions
    let d =vecMag(pos_);
    if(d!=0){pos_=vecScale(pos_,R*fac/d)}
    return this.fix(pos_,3)  
  }
  humanview(){
    let fac=1;
    let vanishx,vanishy,vanishz;
    if(this.scene.cnv){
      vanishx=this.scene.cnv.width;
      vanishy=this.scene.cnv.height;
      vanishz=(this.scene.cnv.width+this.scene.cnv.height)/2;
      if(this.scene.cnv.DEPTH){vanishz=this.scene.cnv.DEPTH;}
    }
    else{
      vanishx=width;
      vanishy=height;
      vanishz=(height+width)/2;
      if(DEPTH){vanishz=DEPTH;}
    }
    let pos_=this.fix(this.pos,2)//get origin fixed, screen scaled, uncentered positions
    let fx=Math.abs(vanishx*fac-pos_.x);
    if (fx!=0){pos_.x*=(1/fx)}
    let fy=Math.abs(vanishy*fac-pos_.y);
    if (fy!=0){pos_.y*=(1/fy)}
    let d =Math.abs(vanishz*fac-pos_.z);
    if(d!=0){
      pos_.x*=(vanishz*fac/d);
      pos_.y*=(vanishz*fac/d);
    }
    return this.fix(pos_,3)
  }
  //axonometric
  isoproject(){
    let tocam=[[this.pos.x],[this.pos.y],[this.pos.z]];
    let fromcam=transposed(matMult(isocam,tocam))[0];
    let postemp=arr2vec(fromcam);
    return this.fix(postemp);
  }
  //custom
  customproject(){
    let postemp={};
    let tocam=homogenize2Mat(this.pos);//homogenized coors as row
    let fromcam=matMult(tocam,this.scene.cam)[0];
    postemp=arr2vec(fromcam);
    return this.fix(postemp);
  }
  //fixer
  fix(pos_,modal_){
    //mode 1 for just getting absolute vector,
    //mode 2 for getting stretched vector just pre screen centering.
    //mode 3 for using pre stretched and origin translated vector
    let pos=pos_;
    let modal=0;
    if (modal_){modal=modal_;}
    if (modal==1){return pos;}
    if (modal<3){
      let origin_=null;
      if (this.origin){origin_=this.origin.pos}
      pos=vecDot(vecSum(pos,origin_),this.scene.stretches)
      if(modal==2){return pos;}
    }
    if (this.scene.center){
      pos=vecSum(pos,this.scene.center)
    }
    return pos;
  }
  //==================================================
  //
}