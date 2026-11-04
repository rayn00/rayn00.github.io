// A time-domain stick/release effect. No spatial gain or accumulated offset.
export const TEXTURE = {left:320,right:704,top:115,bottom:445,width:32,holdMs:55};
export class TextureCursor {
  constructor(point){this.reset(point);}
  reset(point){this.position={...point};this.until=0;this.edge=null;this.direction=0;this.recover=false;}
  update(target,now,dt,enabled=true){
    if(!enabled){this.reset(target);return {...this.position};}
    const p=this.position, dx=target.x-p.x, dy=target.y-p.y;
    if(this.until){
      // Moving back away from a ridge cancels the pending collision.
      if(dx*this.direction<0){this.until=0;this.recover=true;}
      else if(now<this.until)return {...p};
      else {this.until=0;this.recover=true;}
    }
    // After release, smoothly catch up to the actual pointer position.
    // Ordinary movement outside recovery is mapped directly, at 1:1.
    const distance=Math.hypot(dx,dy);
    const fraction=this.recover&&distance>0?Math.min(1,1200*Math.max(0,Math.min(dt,40))/1000/distance):1;
    const next={x:p.x+dx*fraction,y:p.y+dy*fraction};
    let collision=null;
    if(Math.abs(next.x-p.x)>1e-8){
      for(let x=TEXTURE.left;x<=TEXTURE.right;x+=TEXTURE.width){
        if(x===this.edge&&Math.abs(p.x-x)<1e-6)continue;
        const t=(x-p.x)/(next.x-p.x);
        const y=p.y+(next.y-p.y)*t;
        if(t>1e-8&&t<=1&&y>=TEXTURE.top&&y<=TEXTURE.bottom&&(!collision||t<collision.t))collision={x,y,t};
      }
    }
    if(collision){this.position={x:collision.x,y:collision.y};this.edge=collision.x;this.direction=Math.sign(dx);this.until=now+TEXTURE.holdMs;this.recover=true;}
    else {this.position=next;if(this.edge!==null&&Math.abs(next.x-this.edge)>1e-6)this.edge=null;if(fraction===1)this.recover=false;}
    return {...this.position};
  }
}
