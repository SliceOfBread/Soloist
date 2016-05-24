// case 4: 3 fame + 1 per collector
// case 3: 2 fame + 1 per collector
// case 2: 1 fame + 1 per collector
// case 1: 0 fame + 1 per collector
// case 0: no fame added
var ALOCpile = 4;
var ALOCplayer = 0;
var ALOCauction = 5;
var	artLoc = [{x:1048, y:16},
				{x:1048, y:159},
				{x:1048, y:289},
				{x:1048, y:427},
				{x:50, y:728}
				];
		

// art tix
// 0=1 pink
// 1=1 brown
// 2=1 any
// 3=1 pink + 1 brown/white
// 4=1 brown + 1 pink/white
// 5=any 2 different
var artTixNum = [1, 1, 1, 2, 2, 2];

function Art(type, fame, tix) {
	this.type = type;
	this.fame = fame;
    this.byArtist = 0;
    this.tix = tix;
	this.locType = ALOCpile;
	this.locNum = type;
	this.currX = artLoc[type].x;
	this.currY = artLoc[type].y;
	this.destX = this.currX;
	this.destY = this.currY;
	this.anime = 0;
}
	//~ // draw artwork on board
	//~ for (var a=0; a<4; a++) {
		//~ ctx.fillStyle = 'white';
		//~ if (allArt[a].length == 0) continue;
		//~ var tmpArt = allArt[a][0];
		//~ ctx.fillText(fameTypes[tmpArt.fame], artLoc[a].x, artLoc[a].y + 25);
		//~ ctx.fillText(artTixTypes[tmpArt.tix], artLoc[a].x, artLoc[a].y + 90);
		//~ artVisitors[a].draw();
	//~ }
        //~ // draw displayed art
        //~ for (var a=0; a<displayArt[p].length; a++) {
            //~ ctx.fillText(displayArt[p][a], 77 + a*89, 777);
            //~ ctx.fillText("$" + artValue(displayArt[p][a]), 77 + a*89, 807);
        //~ }

Art.prototype.draw = function() {
	switch (this.locType) {
		case ALOCpile:
            ctx.fillStyle = 'white';
            ctx.fillText(fameTypes[this.fame], this.currX, this.currY + 25);
            ctx.fillText(artTixTypes[this.tix], this.currX, this.currY + 90);
			break;
		case ALOCplayer:
            if (this.byArtist.iAmBlue) {    
                ctx.fillStyle = 'blue';
            } else {
                ctx.fillStyle = 'red';
            }
			ctx.fillText(CArtTypes[this.type], this.currX-25, this.currY-20);
			ctx.fillText("$" + artValue(this.byArtist), this.currX-25, this.currY+20);
			break;
	}
}

Art.prototype.bought = function(pl) {
    var newArtLoc = peeps[pl].displayArt.length;
    this.locType = ALOCplayer;
    this.locNum = newArtLoc;
    this.byArtist = gobjArtist;
    this.currX = 77 + 89 * newArtLoc;
    this.currY = 777;
	this.destX = this.currX;
	this.destY = this.currY;
    // add to player display
    peeps[pl].displayArt.push(this);
    // remove from pile
    artPiles[this.type].shift();
    // move signature token
    gobjArtist.tokens--;
}

Art.prototype.slide = function(newArtLoc) {
    this.locNum = newArtLoc;
    this.currX = 77 + 89 * newArtLoc;
    this.currY = 777;
	this.destX = this.currX;
	this.destY = this.currY;    
}

