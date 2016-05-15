var tixRemain = [];
var tixMove = []; // TODO use to show tix movement
var tixText = ["VIP", "investor", "collector"];
var tixColors = ["pink", "brown", "white"];

var TCOLpink = 0;
var TCOLbrown = 1;
var TCOLwhite = 2;

var TLOCremain = 0;
var TLOCplayer = 1;
	
function TixPile(numTix, tixColor, loc) {
	this.numTix = numTix;
	this.color = tixColor;
    if (loc == TLOCremain) {
        this.currX = 858 + 112*tixColor;
        this.currY = 590;
    } else {
        // assume TLOCplayer
        this.currX = 430;
        this.currY = 840 + 32*tixColor;
    }
       
	this.anime = 0;
}

TixPile.prototype.draw = function() {
	ctx.fillStyle = 'black';
    ctx.fillText(this.numTix, this.currX - 10+2, this.currY + 10+2);
	ctx.fillStyle = 'yellow';
    ctx.fillText(this.numTix, this.currX - 10, this.currY + 10);
}

TixPile.prototype.pile2player = function(pl) {    
    peeps[pl].tix[this.color].numTix++;
	if (this.numTix != 0) {
		this.numTix--;
		if (!this.numTix && !intermediateScoring) {
			intermediateScoring = 1;
		}
        if (!this.numTix) {
            checkTixEOG();
        }
	} else {
		// ticket color already at 0
		// decrement another ticket color
		for (var c=0; c<3; c++) {
			if (tixRemain[c].numTix) {
				tixRemain[c].numTix--;
                checkTixEOG();
				break;
			}
		}
	}
    // TODO add animation stuff
    //~ this.destX = 430;
    //~ this.destY = 840 + 32*this.color;	
}

TixPile.prototype.playerUse = function() {
    if (this.numTix) {
        this.numTix--;
    }  
    // TODO add stuff for animation
}

TixPile.prototype.lacerda = function() {
    if (this.numTix) {
        this.numTix--;
        if (!this.numTix && !intermediateScoring) {
            intermediateScoring = 1;
        }
        if (!this.numTix) {
            checkTixEOG();
        }
    }
    // TODO add stuff for animation
};
	
function checkTixEOG() {
    if ((tixRemain[TCOLpink].numTix + tixRemain[TCOLbrown].numTix + tixRemain[TCOLwhite].numTix) == 0) {
        addEOG(0);
    }
}
