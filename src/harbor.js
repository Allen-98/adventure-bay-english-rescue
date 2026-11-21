import Phaser from 'phaser';

// The harbor stays visible during the radio call. The launch button sets the boat in motion.
export function harborView(host, art, reduced) {
  let scene;
  let disposed = false;
  let leaving = false;
  const backdrop = new Image();
  backdrop.src = art('harbor');
  const boat = new Image();
  boat.src = art('zuma-boat');
  boat.className = 'hero-boat';
  boat.alt = '路马驾驶橙色救援艇';
  host.append(boat);
  host.style.backgroundImage = 'url("' + backdrop.src + '")';
  class Water extends Phaser.Scene {
    create() {
      scene = this;
      this.ink = this.add.graphics();
      this.timeOrigin = this.time.now;
      this.scale.on('resize', () => this.paint(this.time.now));
      this.paint(this.time.now);
    }
    paint(now) {
      const g = this.ink;
      const {width:w,height:h} = this.scale;
      const time = reduced ? 0 : (now - this.timeOrigin) / 1000;
      g.clear();
      // Sunlit ripples form short broken lines; depth changes their length and speed.
      for (let i=0;i<28;i++) {
        const depth = ((i*13)%29)/30;
        const x = ((i*0.381966 + time*(0.002+depth*0.0035))%1)*w;
        const y = h*(0.61 + depth*0.37) + Math.sin(time*0.7+i)*1.6;
        g.lineStyle(0.8+depth,0xfff8dc,0.13+0.06*Math.sin(time+i));
        g.beginPath(); g.moveTo(x,y); g.lineTo(x+w*(0.007+0.018*depth),y);g.strokePath();
      }
      // Anchor the hull to the water even when the responsive layout changes its scale.
      const boatRect = boat.getBoundingClientRect(), stageRect = host.getBoundingClientRect();
      const craftWidth = Math.min(boatRect.width, boatRect.height*1200/850);
      const craftHeight = craftWidth*850/1200;
      const waterX=boatRect.x-stageRect.x+boatRect.width*.51;
      const waterY=boatRect.y-stageRect.y+(boatRect.height-craftHeight)/2+craftHeight*.86;
      g.save();g.translateCanvas(waterX,waterY);g.rotateCanvas(.055);
      for(let layer=0;layer<5;layer++){
        g.fillStyle(0x07647a,0.045);
        g.fillEllipse(0,2,craftWidth*(.99-layer*.045),craftHeight*(.12-layer*.012));
      }
      for(let i=0;i<3;i++){
        g.lineStyle(Math.max(1,craftHeight*.004),0xdbfffc,.32-i*.06);
        g.beginPath();
        for(let j=0;j<=20;j++){
          const angle=(.08+j*.045)*Math.PI;
          const x=Math.cos(angle)*craftWidth*(.47+i*.012);
          const y=Math.sin(angle)*craftHeight*(.058+i*.012)+Math.sin(j*1.8+time)*1.1;
          if(j===0)g.moveTo(x,y);else g.lineTo(x,y);
        }
        g.strokePath();
      }
      g.restore();
      const gullX=w*(0.48+Math.sin(time*0.08)*0.05), gullY=h*0.17;
      for(let i=0;i<3;i++) {
        const x=gullX+i*21, y=gullY+Math.sin(i*2)*9;
        const wing=2.4+Math.sin(time*1.8+i);
        g.lineStyle(1.5,0x486e74,0.72);
        g.beginPath();g.moveTo(x-5,y-wing);g.lineTo(x,y);g.lineTo(x+5,y-wing);g.strokePath();
      }
    }
    update(now) { if(!reduced) this.paint(now); }
  }
  const config = {
    type:Phaser.CANVAS, parent:host, transparent:true, scene:Water,
    scale:{mode:Phaser.Scale.RESIZE,width:host.clientWidth || 1,height:host.clientHeight || 1},
    audio:{noAudio:true}, banner:false, fps:{target:30,forceSetTimeOut:true}
  };
  const game = new Phaser.Game(config);
  const observer = new ResizeObserver(() => {
    if (!disposed && scene && host.clientWidth && host.clientHeight) game.scale.resize(host.clientWidth,host.clientHeight);
  });
  observer.observe(host);
  return {
    sail() { if(!leaving) {leaving=true;host.classList.add('sailing');} },
    dispose() {disposed=true;observer.disconnect();game.destroy(true);boat.remove();}
  };
}
