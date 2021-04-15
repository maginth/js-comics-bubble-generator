//	                                               (\_/)
//	  /\_/\                                        (^ç^)
//	w( °u° )                                        ) (
//	|(~~~~~)        /|/|  __   _  `  __  /-/)   ___/(_)\__
//	|(")_(")~>    (/   |_(_/(_( )_|_//(_/_/\_      "w w"
//	                           / 
//	                          (_)
//
// https://github.com/maginth/js-comics-bubble-generator

"use strict"
var d = document;
var head=d.getElementsByTagName('head')[0],
body=d.getElementsByTagName('body')[0],
create = d.createElement.bind(d),
add = body.appendChild.bind(body);

/*
	type: 0->fleche droite 1->fleche courbe à base perpendiculaire 2->fleche courbe à base arrondie
	base: largeur de la base de la fleche
	marge: proportion de la longueur du bord portant la fleche laissé vide entre la base de la fleche et le coin
	contour: écart en pixel entre la pointe de la fleche et le cadre de l'élément de destination;
*/
function Bulle(type,base,marge,contour) {
	this.type=type;
	this.base=base;
	this.marge=marge;
	this.contour=contour;

	var fleche =[
	function (g,x1,y1,x2,y2,x3,y3) {
		g.moveTo(x1,y1);g.lineTo(x2,y2);g.lineTo(x3,y3);
	},
	function (g,x1,y1,x2,y2,x3,y3) {
		var vx =y1-y3 ,vy = x3-x1, mx=(x1+x3)/2, my=(y1+y3)/2;
		var scal = ((x2-mx)*vx+(y2-my)*vy)/(vx*vx+vy*vy)/2;
		vx = mx+vx*scal; vy = my+vy*scal;
		g.moveTo(x1,y1);g.quadraticCurveTo(vx,vy,x2,y2);g.quadraticCurveTo(vx,vy,x3,y3);
	},
	function (g,x1,y1,x2,y2,x3,y3) {
		var vx =y1-y3 ,vy = x3-x1, mx=(x1+x3)/2, my=(y1+y3)/2;
		var scal = ((x2-mx)*vx+(y2-my)*vy)/(vx*vx+vy*vy)/2;
		vx = mx+vx*scal; vy = my+vy*scal;
		g.moveTo(x1,y1);g.bezierCurveTo(mx,my,vx,vy,x2,y2);g.bezierCurveTo(vx,vy,mx,my,x3,y3);
	}];

	//sc: élément source; ds: élément destination; canvas (facultatif): canvas à utiliser pour dessiner la fleche ou la redessiner
	this.bulleConnect = function (sc,ds,canvas) {
		var base=this.base >> 1;
		var type=fleche[this.type];
		var marge=this.marge;
		var contour=this.contour;
		contour = contour || 10;
		if (marge != 0) marge = marge || 0.1;
		var c = canvas || create('canvas'),
		g = c.getContext('2d'),
		s = c.style; s.position = 'absolute';
		var scs = getComputedStyle(sc);
		var btw = parseFloat(scs.borderTopWidth)/2,
			bbw = parseFloat(scs.borderBottomWidth)/2,
			brw = parseFloat(scs.borderRightWidth)/2,
			blw = parseFloat(scs.borderLeftWidth)/2;
		var x0=0,y0=0,x1,x2,y1,y2,x3,y3,
		sxx=sc.offsetLeft-blw,syy=sc.offsetTop-btw,
		sw=sc.offsetWidth+blw+brw,sh=sc.offsetHeight+btw+bbw,
		dw=ds.offsetWidth,dh=ds.offsetHeight,
		dxx=ds.offsetLeft,dyy=ds.offsetTop;
		var sx = sxx-dxx-dw,sy = syy-dyy-dh,
		ssx=sxx+sw-dxx,ssy=syy+sh-dyy,
		basex=base+sw*marge,basey=base+sh*marge,
		base2=0,ox=0,oy=0,w=0,h=0,px;
		
		s.top=s.bottom=s.left=s.right='';
		var top=ssy+sy>0,left=ssx+sx>0,horiz=false;

		var rndx,rndy;
		function coin(b,bb) {
			var rd=scs['border'+(b? 'Top':'Bottom')+(bb? 'Left':'Right')+'Radius'].match(/[\d\.]+(px|%)/g);
			rndx=parseFloat(rd[0]) || 0; if (rd[0].substr(-1)=='%') rndx*=sw/100;
			rndy=parseFloat(rd[1] || rd[0]) || 0; if ((rd[1] || rd[0]).substr(-1)=='%') rndx*=sh/100;
			rndx-=bb ? blw : brw; rndy-=b ? btw : bbw;
		}
		coin(top,left);
		var rdx=rndx,rdy=rndy;
		
		function bord(i,rdi,rdj) {
			if (i<rdi) return rdj*(1-Math.sqrt(1-(rdi-i)*(rdi-i)/(rdi*rdi)));
			else return 0;
		}
		function ajusteX(x) {
			if (x>w) {x=Math.ceil(x);if(!left) x0+=w-x;w=x;}
			else if (x<0) {x=Math.floor(x);x1-=x;x2-=x;x3-=x;w-=x;if(left) x0+=x;}
		}
		function ajusteY(y) {
			if (y>h) {y=Math.ceil(y);if(!top) y0+=h-y;h=y;}
			else if (y<0) {y=Math.floor(y);y1-=y;y2-=y;y3-=y;h-=y;if(top) y0+=y;}
		}
		var sgnl = left? 1:-1, sgnt = top? 1:-1;
		if (ssy>basey+base && sy<-basey-base) {
			y0 = (top? -sy+basey : ssy+basey)>>1;
			coin(!top,left);
			if (y0>sh-rndy-base) {
				y0 = Math.min(sh-y0,sh-rdy-base);
				top = !top;
				sgnt = -sgnt;
			}
			y1=-base; y3=base;y2=0;
			x1=sgnl*bord(y0+sgnt*y1,rdy,rdx);
			x3=sgnl*bord(y0+sgnt*y3,rdy,rdx);
			if (left) x2= (sx-contour-base<0)? -base : contour-sx;
			else x2= (ssx+contour+base>0)? base : -ssx-contour;
		} else {
			horiz = true;
			if (ssx>basex+base && sx<-basex-base) {
				if (top) y2= (sy-contour-base<0)? -base : contour-sy;
				else y2= (ssy+contour+base>0)? base : -ssy-contour;
				x0 = (left? -sx+basex : ssx+basex)>>1;
				x2=0;
			} else {
				x0 = basex;
				x2=left? -sx-basex+contour: -ssx+basex-contour;
				y2 = top? -sy : -ssy;
				var ax2 = Math.abs(x2)>>1;
				if ((top? -y2:y2) <ax2) y2 = top? Math.max(-ax2,-sy-sh):Math.min(ax2,-ssy+sh);
			}
			coin(top,!left);
			if (x0>sw-rndx-base) {
				x0 = Math.min(sw-x0,sw-rdx-base);
				left = !left;
				sgnl = -sgnl;
			}
			x1=base; x3=-base;
			y1=sgnt*bord(x0+sgnl*x1,rdx,rdy);
			y3=sgnt*bord(x0+sgnl*x3,rdx,rdy);
		}

		var borderPos = 'border' + (horiz ? (top? 'Top':'Bottom') : (left? 'Left':'Right'));
		var cc = scs.backgroundColor, l = parseFloat(scs[borderPos+"Width"])||0, ll = l/2;
		
		if (scs.boxShadow != '' && scs.boxShadow.search('inset') == -1) {
			px = scs.boxShadow.match(/[\d\.]+px/g) || [0,0,0];
			base2 = (parseFloat(px[2]) || 0)+ll;
			ox = parseFloat(px[0]); oy = parseFloat(px[1]);
		}

		ajusteX(x1); ajusteX(x2); ajusteX(x3); 
		ajusteY(y1); ajusteY(y2); ajusteY(y3);
		ajusteX(ox-base2);ajusteX(w+ox+base2);
		ajusteY(oy-base2);ajusteY(h+oy+base2);
		if (this.type >= 1) {
			var vx =y1-y3 ,vy = x3-x1, mx=(x1+x3)/2, my=(y1+y3)/2;
			var scal = ((x2-mx)*vx+(y2-my)*vy)/(vx*vx+vy*vy)/2;
			ajusteX(mx+vx*scal);
			ajusteY(my+vy*scal);
		}
		c.width = w; c.height = h;
		y0-=ll;x0-=ll;
		if (top) s.top = y0+"px"; else s.bottom = y0+"px";
		if (left) s.left = x0+"px"; else s.right = x0+"px";
		
		g.lineWidth = l;
		g.lineCap = "round";
		g.lineJoin = "round";
		//g.miterLimit = 100;
		g.save();
		if (px) {
			g.shadowOffsetX=ox+10000;
			g.shadowOffsetY=oy;
			g.shadowBlur=parseFloat(px[2]);
			g.shadowColor=(scs.boxShadow.match(/(rgba?\(.*\))/) || [,"none"])[1];
			g.beginPath();
			type(g,x1-10000,y1,x2-10000,y2,x3-10000,y3);
			if (cc) g.fill();
			if (l) g.stroke();
		}
		var xc = (left)?w:0 , yc=(top)? h:0,
		xo=left?-x0+rdx:x0+w-rdx,yo=top?-y0+rdy:y0+h-rdy;
		rdx+=2*(left ? blw : brw); rdy+=2*(top ? btw : bbw);
		if (horiz) g.clearRect(xc,yc,xo-xc,yo-yc-sgnt*rdy);
		else g.clearRect(xc,yc,xo-xc-sgnl*rdx,yo-yc);
		g.save();
		g.scale(rdx,rdy);
		g.beginPath();
		g.arc(xo/rdx,yo/rdy,1,0,2*Math.PI);
		g.restore();
		g.clip();
		g.clearRect(xc,yc,xo-xc-sgnl*rdx,yo-yc-sgnt*rdy);
		
		g.restore();
		
		var vx=x3-x1,vy=y3-y1;
		var n = 1/Math.sqrt(vx*vx+vy*vy);
		var nn = n*((top&&horiz)||(left&&!horiz)?-0.5:0.5);
		var xx1=x1+vy*nn+vx*n,yy1=y1+vy*n-vx*nn,xx3=x3+vy*nn-vx*n,yy3=y3-vy*n-vx*nn;
		g.beginPath();
		g.moveTo(xx1,yy1);
		g.lineTo(xx3,yy3);
		nn*=l+4;
		g.lineTo(xx3-vy*nn,yy3+vx*nn);
		g.lineTo(xx1-vy*nn,yy1+vx*nn);
		g.fillStyle = cc;g.fill();
		
		g.beginPath();
		type(g,x1,y1,x2,y2,x3,y3);
		if (cc) {g.fillStyle = cc;g.fill();}
		if (l) {g.strokeStyle = scs[borderPos+"Color"];g.stroke();}
		
		sc.insertBefore(c,sc.firstChild);
		//console.log({base,type,marge,contour,c,g,s,scs,cc,btw,bbw,blw,brw,l,ll,x0,y0,x1,x2,y1,y2,x3,y3,sxx,syy,sw,sh,dw,dh,dxx,dyy,sx,sy,ssx,ssy,basex,basey,base2,ox,oy,w,h,px,top,left,horiz,rndx,rndy,rdx,rdy,sgnl,sgnt,xc,yc,xo,yo,vx,vy,n,nn,xx1,yy1,xx3,yy3});
		return c;
	}


	this.bulleAt = function (source,x,y,w,h,canvas) {
		return this.bulleConnect(source,{offsetLeft:x,offsetTop:y,offsetWidth:w,offsetHeight:h},canvas);
	}
}

