var CLOCpile = 0,
	CLOCdeal = 1,
	CLOCplayer = 2,
	CLOCdiscard = 3,
	CDIRmoneyUp = true,
	CDIRInflUp = false;
var CArtTypes = ["digit", "paint", "sculp", "photo"];
	
function Contract(artType, bonusType) {
	this.cNum = artType * 6 + bonusType;
	this.artType = artType;
	this.bonusType = bonusType;
    this.bonusAvailable = 0;
	this.locType = CLOCpile;
	this.locNum = this.cNum;
	this.faceUp = false;	// show back or front?
	this.moneyUp = false;	// if showing back, is money on top or infl?
	this.currX = 50;
	this.currY = 65;
	this.destX = this.currX;
	this.destY = this.currY;
	this.anime = 0;
}

Contract.prototype.draw = function() {
	ctx.fillStyle = 'white';
	switch (this.locType) {
		case CLOCpile:
			break;
		case CLOCdeal:
			ctx.fillText(CArtTypes[this.artType], this.currX - 25, this.currY - 12);
			ctx.fillText(bonusTypes[this.bonusType], this.currX - 25, this.currY + 38);
			break;
		case CLOCplayer:
			if (this.faceUp) {
				// contract is face up (unfilled)
				ctx.fillText("t:" + this.artType, this.currX - 25, this.currY - 12);
				ctx.fillText(bonusTypes[this.bonusType], this.currX - 25, this.currY + 38);
			} else if (this.moneyUp) {
				ctx.fillText("$", this.currX - 25, this.currY);
			} else {
				ctx.fillText("Inf", this.currX - 25, this.currY);
			}
			break;
	}
}

Contract.prototype.sold = function(moneyUp) {
	this.faceUp = false;
	this.moneyUp = moneyUp;
    this.bonusAvailable = 1;
}

Contract.prototype.dealCard = function(newLocNum) {
	this.locNum = newLocNum;
	this.locType = CLOCdeal;
	this.faceUp = true;
	
	contractDisplay[newLocNum].unshift(contractPile.shift());
	this.destX = 127;
	this.destY = 65;
	this.destX += 79*newLocNum;
	this.currX = this.destX;
	this.currY = this.destY;
}

function dealMore() {
    if (contractPile.length < 4) {
        contractPile = [];
        for (var c=0; c<4; c++) {
            contractDisplay[c] = [];
        }
        for (c=0; c<24; c++) {
            if (allContracts[c].locType != CLOCplayer) {
                contractPile.push(allContracts[c]);
            }
        }
        contractPile = shuffle(contractPile);
    }
    for (var c=0; c<4; c++) {
        contractPile[0].dealCard(c);
    }
}

Contract.prototype.getCard = function(plNum, newLocNum) {
	this.locNum = newLocNum;
	this.locType = CLOCplayer;
	
	peeps[plNum].contract[newLocNum] = allContracts[this.cNum];
    this.bonusAvailable = 1;
	this.destX = 200;
	this.destY = 876;
	this.destX += 80*newLocNum;
	this.currX = this.destX;
	this.currY = this.destY;
}

Contract.prototype.discard = function() {
	this.locNum = 0;
	this.locType = CLOCdiscard;
};
	

