var	pTypes = {asst:0, infl:1, pawn:2};

var inflValue =    [0,1,1,1,2,2,2,2,3,3,3,3,4, 4, 4, 5, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9,10,11,12,13,14,15,16,17,18,20];
var inflDiscount = [0,1,2,2,2,3,3,3,3,4,4,4,4, 5, 5, 5, 6, 6, 6, 7, 7, 8, 8, 9, 9,10,10,11,12,13,14,15,16,17,18,19];
var inflNextMark = [0,0,1,1,1,4,4,4,4,8,8,8,8,12,12,12,15,15,15,18,18,20,20,22,22,24,24,26,27,28,29,30,31,32,33,34];
			
function Player(pNum) {
	this.pawn = new Piece(pNum, 0, pTypes.pawn, pNum, locs.home);
    this.asst = [];
    this.infl = new Piece(pNum, 0, pTypes.infl, 10, locs.influence);
    this.money = 10;
    this.comm = -1;
    this.displayArt = [];
    this.maxCollectors = 1;
    this.rep = 0;
    this.repTiles = [0,0,0,0,0,0];
	for (var a=0; a < 10; a++) {
		// start all in pile
		this.asst[a] = new Piece(pNum, a, pTypes.asst, 0, locs.pile);
	}
	this.contract = [];
	for (var a=0; a < 3; a++) {
		this.contract[a] = 0;
	}
    this.everHad = [0,0,0,0];
    this.tix = [];
	this.tix[TCOLpink] = new TixPile(0, TCOLpink, TLOCplayer);
	this.tix[TCOLbrown] = new TixPile(0, TCOLbrown, TLOCplayer);
	this.tix[TCOLwhite] = new TixPile(0, TCOLwhite, TLOCplayer);
    this.gallery = new Visitors(VLOCgallery + pNum);
    this.lobby = new Visitors(VLOClobby + pNum);
}

Player.prototype.moneyBonus = function() {
	var mBonus = (this.gallery.num[TCOLbrown] * 2 + this.gallery.num[TCOLwhite]);
    msgLog("Money bonus earned:" + mBonus);
	this.money += mBonus;
}

Player.prototype.influenceBonus = function() {
    var iBonus = (this.gallery.num[TCOLpink] * 2 + this.gallery.num[TCOLwhite]);
    msgLog("Influence bonus earned:" + iBonus);
    this.addInfluence(iBonus);
}

Player.prototype.addInfluence = function(toAdd) {
     var newI = toAdd + this.infl.locNum;
     if (newI > 35) {
         msgLog("Max Influence capped to 35");
     }
     this.infl.setLoc(Math.min(35, newI), locs.influence);
}

Player.prototype.useInfluence = function(toUse) {
     this.infl.setLoc(this.infl.locNum  - toUse, locs.influence);
}

Player.prototype.inflForDisc = function() {
    msgLog("Influence reduced to " + inflNextMark[this.infl.locNum] + " for discount of 1");
    this.infl.setLoc(inflNextMark[this.infl.locNum], locs.influence);
}

Player.prototype.inflForFameOrKo = function() {
    this.infl.setLoc(Math.floor((this.infl.locNum-1)/5)*5, locs.influence);
}

Player.prototype.nextHire = function() {
    var tmp = -1;
    for (var a=0; a < 8; a++) {
        if (this.asst[a].locType == locs.unemp) {
            tmp = a;
        }
    }
    return tmp;
}

Player.prototype.hasArtSpace = function() {
    if (this.displayArt.length < 3) {
        // have 2 or less, must have room
        return true;
    }
    if (this.displayArt.length > 3) {
        // have 4 already, no room
        return false;
    }
    // check if we have a masterpiece, which allows us to display 4th
    for (var a=0; a < this.displayArt.length; a++) {
        if (this.displayArt[a].byArtist.fame > 18) {
            return true;
        }
    }
    // last, check if we can buy something and turn artist into Celebrity
    var tmpI = this.infl.locNum;
    if (state[0] == st.KoPickAction) {
        tmpI = Math.floor((tmpI-1)/5)*5; // infl after picking ko action
    }
    for (var a=0; a<8; a++) {
        if (artist[a].disc && // artist is discovered
        (artPiles[a % 4].length) && // there is art
        ((artist[a].fame < 19) || (this.comm == a)) && // artist is not celebrity or we have a commission for artist
        ((artist[a].fame + artPiles[a % 4][0].fame - 1 + this.gallery.num[TCOLwhite] + (tmpI/5)) >= 19)) {  // we have enough influence to boost artist to celebrity
            var tmpP = artist[a].fame;
            if (this.comm == a) {
                tmpP = artist[a]. initFame;
            }
            if (this.money >= tmpP) {
                return true; // we have the money and enough influence
            }
            // Not enough money, check if we can discount price using influence
            var px = tmpP;
            var ix = tmpI;
            while (ix > 0) {
                px--;
                ix = inflNextMark[ix];
                if (this.money >= px) {
                    if ((artist[a].fame + artPiles[a % 4][0].fame - 1 + this.gallery.num[TCOLwhite] + (ix/5)) >= 19) {
                        return true;
                    } else {
                        break;
                    }
                }
            }
        }
    }
            
    return false;
}

Player.prototype.canAfford = function(aNum) {
    var checkPrice;
    if (this.comm == aNum) {
        // we have commission, check vs. comm price
        checkPrice = artist[aNum].initFame;
    } else {
        checkPrice = artist[aNum].fame;
    }
    if ((this.money + inflDiscount[this.infl.locNum]) >= checkPrice) {
        return true;
    }
    return false;
}

Player.prototype.draw = function(p) {
    if (player[p].enabled) {
        this.pawn.draw();

        //draw assistant
        for (var a=0; a<10; a++) {
            this.asst[a].draw();
        }
        // draw lobby/gallery visitors
        this.gallery.draw();
        this.lobby.draw();
        
    }
    if (player[p].enabled==1) {
        // draw player tix
        ctx.fillStyle = "black";
        for (var t=0; t<3; t++) {
            this.tix[t].draw();
        }
        // draw displayed art
        for (var a=0; a<this.displayArt.length; a++) {
            this.displayArt[a].draw();
            //~ ctx.fillText(this.displayArt[a], 77 + a*89, 777);
            //~ ctx.fillText("$" + artValue(this.displayArt[a]), 77 + a*89, 807);
        }
        // indicate if have commission
        ctx.fillStyle = "white";
        if (this.comm != -1) {
            ctx.fillText(this.comm, 490, 918);
        }
        // draw player contracts
        for (var c=0; c<3; c++) {
            if (this.contract[c]) {
                this.contract[c].draw();
            }
        }
        
        // draw repTiles
        for (var t=0; t<6; t++) {
            if (this.repTiles[t]) {
                this.repTiles[t].draw();
            }
        }
        
        var playInfoOut = "Player <br>";
        // draw money
        //~ ctx.fillStyle = "green";
        //~ ctx.fillText("$" + this.money, 405, 820);
        playInfoOut += "$" + this.money + "<br>";
        
        // draw sold art
        ctx.fillStyle = 'white';
        //~ ctx.fillText("Sold:" + this.everHad[0] + "/" + this.everHad[1] + "/" + this.everHad[2] + "/" + this.everHad[3], 525, 839);
        for (var t=0; t<4; t++) {
            //~ ctx.fillText("Sold " + artTypes[t] + ":" + soldArt[this.pawn.plNum][t], 525, 749 + t * 25);
            playInfoOut += "Sold " + artTypes[t] + ":" + soldArt[this.pawn.plNum][t] + "<br>";
        }
        document.getElementById("playerinfo").innerHTML = playInfoOut;
                
            
        // draw influence marker
        this.infl.draw();
        
        ctx.fillStyle = "black";
        // display curator/dealer cards
        ctx.drawImage(dcCardsImage, 138*curator[p], 0, 138, 210, 525, 720, 138, 210 );
        ctx.drawImage(dcCardsImage, 138*dealer[p], 210,138, 210, 663, 720, 138, 210 );
        //~ ctx.fillText("Curator:" + curator[p], 525, 889);
        //~ ctx.fillText("Dealer:" + dealer[p], 525, 920);
        //~ ctx.drawImage(pieceImage, ((this.plNum*3)+this.pType)*48, 0, 48, 48, this.currX-24, this.currY-24, 48, 48 );
        if (state[0] != st.Start) {
            if (this.rep) {
                this.rep.draw();
            }
        } else {
        }
            
    }
    
}

function Piece(plNum, pieceNum, pType, locNum, locType) {
	this.plNum = plNum;
	this.pieceNum = pieceNum;
	this.pType = pType;
	switch (pType) {
		case pTypes.pawn :
		case pTypes.asst :
			this.currX = xy[locType][locNum].x;
			this.currY = xy[locType][locNum].y;
			break;
		case pTypes.infl :
			this.currX = xy[locType][0].x + Math.floor((1114/35)*locNum);
			this.currY = xy[locType][0].y + 4*plNum;
			break;
			
	}
	this.destX = this.currX;
	this.destY = this.currY;
	this.anime = 0;
	this.locNum = locNum;
	this.locType = locType;
}

Piece.prototype.locNum = function() {
	return (this.loc & 0xff);
}

Piece.prototype.setLoc = function(newLocNum, newLocType) {
	if ((this.locNum != newLocNum) || (this.locType != newLocType)) {
		if (newLocType != locs.ko) {
			// change locNum unless KO
			this.locNum = newLocNum;
		}
		this.locType = newLocType;
	
		switch (newLocType) {
			case locs.action:
			case locs.ko:
                actSpots[newLocType][this.locNum] = this;
			case locs.home:
			case locs.desk:
            case locs.pile:
                this.destX = xy[newLocType][this.locNum].x;
                this.destY = xy[newLocType][this.locNum].y;
                break;
			case locs.unemp:
                this.destX = xy[newLocType][0].x;
                this.destY = xy[newLocType][0].y;
				this.destY -=  this.locNum * ((915-756)/7);
				break;
			case locs.influence: // Y never changes
                this.destX = xy[newLocType][0].x;
				this.destX += Math.floor(this.locNum * (1114/35));
				break;
            case locs.intlMkt:
                var tmpR = Math.floor(newLocNum / 3);
                var tmpC = newLocNum % 3;
                this.destX = 62 + 48 * tmpC;
                this.destY = 246 + 41 * tmpR;
                intlMkt[tmpR][tmpC] = this;
                break;
            case locs.contr:
                this.destX = 184 + 80 * newLocNum;
                this.destY = 879;
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
}

Piece.prototype.draw = function() {
	if (animate) {
		this.currX = calcAnime(this.currX, this.destX, this.anime);
		this.currY = calcAnime(this.currY, this.destY, this.anime);
	}
	switch (this.pType) {
		case pTypes.pawn:
		case pTypes.asst:
		case pTypes.infl:
			ctx.drawImage(pieceImage, ((this.plNum*3)+this.pType)*48, 0, 48, 48, this.currX-24, this.currY-24, 48, 48 );
			break;
	}
		
}

Piece.prototype.goHome = function() {
    if ((this.locType == locs.action) || (this.locType == locs.ko)) {
        actSpots[this.locType][this.locNum] = 0;
    }
	if (this.pType == pTypes.asst) {
        if (player[this.plNum].enabled == 1) {
            var desks = [0,0,0,0];
            for (var a=0; a<10; a++) {
                if (peeps[this.plNum].asst[a].locType == locs.desk) {
                    desks[peeps[this.plNum].asst[a].locNum] = 1;
                }
            }
            for (var d=0; d<4; d++) {
                if (!desks[d]) {
                    this.setLoc(d, locs.desk);
                    if (this.pType == pTypes.asst) {
                        msgLog("Player asst. returns to desk");
                    }
                    return;
                }
            }
            msgLog("Player asst. tossed due to lack of desk space.");
        }
        // no desk space, then asst. discarded to pile
        // lacerda also returned to pile
        this.setLoc(0, locs.pile);
        
    } else { // assume pawn
        if (player[this.plNum].enabled == 1) {
            msgLog("Player returns home.");
        }
        this.setLoc(this.plNum, locs.home);
    }
	return;
}



