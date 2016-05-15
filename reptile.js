var repPile = [];

var RLOCpile = 0;
var RLOCintlMarket = 1;
var RLOCplayer = 2;
var RLOCdisplay = 3;
var RLOCstartTile = 4;
	
function RepTile(tNum) {
	this.tNum = tNum;
    this.pType = 4;
	this.locType = RLOCpile;
	this.locNum = tNum;
	this.currX = 492;
	this.currY = 260;
	this.destX = this.currX;
	this.destY = this.currY;
	this.anime = 0;
}

RepTile.prototype.draw = function() {
	if (animate) {
		this.currX = calcAnime(this.currX, this.destX, this.anime);
		this.currY = calcAnime(this.currY, this.destY, this.anime);
	}
	ctx.fillStyle = 'black';
	if (this.locType != RLOCpile) {
        ctx.fillRect(this.currX-17, this.currY-17, 38, 38);
        ctx.drawImage(reptileImage, this.tNum*83, 0, 83, 83, this.currX-19, this.currY-19, 38, 38 );
        //~ ctx.fillText(this.tNum, this.currX - 15, this.currY + 10);
    }
}

RepTile.prototype.setLoc = function(newLocNum, newLocType) {
	this.locNum = newLocNum;
	this.locType = newLocType;
    
    switch (newLocType) {
        case RLOCintlMarket:
            var tmpR = Math.floor(newLocNum / 3);
            var tmpC = newLocNum % 3;
            this.destX = 62 + 48 * tmpC;
            this.destY = 246 + 41 * tmpR;
            //~ this.currX = this.destX;
            //~ this.currY = this.destY;
            intlMkt[tmpR][tmpC] = this;
//            intlMkt[tmpR][tmpC] = allReputation[this.tNum];
            break;
        case RLOCplayer:
            this.destX = 68 + 38 * (newLocNum % 3);
            this.destY = 842 + 68 * Math.floor(newLocNum / 3);
            //~ this.currX = this.destX;    // Change this for animation
            //~ this.currY = this.destY;
            peeps[activePlayer].repTiles[newLocNum] = this;
            break;
         case RLOCdisplay:
			peeps[activePlayer].rep = this;
            this.destX = 274;
            this.destY = 771;
            //~ this.currX = this.destX;
            //~ this.currY = this.destY;
           break;
       case RLOCstartTile:
            this.destX = xy[0][newLocNum].x;
            this.destY = xy[0][newLocNum].y;
            //~ this.currX = this.destX;
            //~ this.currY = this.destY;
           break;
    }
		var diffX = this.destX-this.currX;
		var diffY = this.destY-this.currY;
		if (!animate) {
			mTimer = setInterval(moveIt,30);
		}
		this.anime = Math.floor(Math.sqrt(Math.sqrt(diffX*diffX + diffY*diffY))) + 1;
		animate = Math.max(animate, this.anime);
	
}

RepTile.prototype.discard = function() {
	this.locNum = 0;
	this.locType = RLOCpile;
};
	

