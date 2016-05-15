var visitorColors = ["#EC2FB7", "#D9BE7A", "white"];
var	visitorLoc = [{x:319, y:177}, {x:654, y:177}, {x:654, y:487}, {x:319, y:487}, // galleries
				  {x:389, y:237}, {x:604, y:237}, {x:604, y:441}, {x:389, y:441}, // lobbies
				  {x:1092, y:117}, {x:1092, y:257}, {x:1092, y:391}, {x:1092, y:528}, // art
				  {x:979, y:27}, {x:979, y:167}, {x:979, y:301}, {x:979, y:438}, // red artists
                  {x:497, y:346}, // plaza
				  {x:1099, y:644}];	// bag

var VLOCgallery = 0;   // + player
var VLOClobby = 4;      // + player
var VLOCart = 8;        // + artType
var VLOCartist = 12;    // + artist % 4 (only red ever have any)
var VLOCplaza = 16;
var VLOCbag = 17;
var VLOCdiscard = 18;

var vcSize = 34;

var vText = ["Yellow gallery", "Purple gallery", "Orange gallery", "Blue gallery", 
            "Yellow lobby", "Purple lobby", "Orange lobby", "Blue lobby",
            "digital art", "painting", "sculpture", "photograph",
            "red digital artist",  "red painter", "red sculptor", "red photographer",
            "plaza",
            "bag"];

var Vall = 3;
var VpinkBrown = 2;
	
function Visitors(loc) {
	this.num = [0,0,0];
    this.anum = [0,0,0];
    if (loc == VLOCbag) {
        for (var col=0; col<3; col++) {
            this.num[col] = 8 + 2*(col != TCOLwhite);
        }
    }
       
	this.loc = loc;
}

Visitors.prototype.draw = function() {
    if (this.loc != VLOCdiscard) {
        if (this.loc == VLOCbag) {
            ctx.fillStyle = "black";
            ctx.fillText("Bag", visitorLoc[VLOCbag].x - 35, visitorLoc[VLOCbag].y - 4);
        }
        var x = visitorLoc[this.loc].x - (1.5 * vcSize);
        var y = visitorLoc[this.loc].y;
        for (var v=0; v<3; v++) {
            var tmpN = this.num[v];
            if (animate) {
                tmpN -= this.anum[v];
            } else {
                this.anum[v] = 0;
            }
            if (tmpN) {
                //~ ctx.fillStyle = visitorColors[v];
                //~ ctx.fillRect(x+v*vcSize, y, vcSize, vcSize);
                ctx.font = 'bold 16pt Helvetica';
                ctx.drawImage(pieceImage, 48*(v+12), 0,48,48, x+(vcSize*v)-13,y-13,48,48); 
                if (tmpN > 1) {
                    ctx.fillStyle = "black";
                    ctx.fillText(tmpN, x+v*vcSize+4, y+23);
                }
            }
        }
    }
    ctx.font = 'bold 20pt Helvetica';
}

Visitors.prototype.setClick = function(colSelect) {
    var x = visitorLoc[this.loc].x - (1.5 * vcSize);
    var y = visitorLoc[this.loc].y;
    var anySet = 0;
    for (var v=0; v<colSelect; v++) {
        var tmp = clickSection.visitor[0] + v;
        if (this.num[v] &&
            ((v != TCOLwhite) ||
             (peeps[activePlayer].maxCollectors  > peeps[activePlayer].gallery.num[TCOLwhite]))) {
            clickLocations[tmp].x = x+v*vcSize;
            clickLocations[tmp].xx = x+v*vcSize + vcSize;
            clickLocations[tmp].y = y;
            clickLocations[tmp].yy = y + vcSize;
            allowableClicks[tmp] = 1;
            anySet = 1;
        }
    }
    return anySet;
}

Visitors.prototype.setLeaveClick = function() {
    var x = visitorLoc[this.loc].x - (1.5 * vcSize);
    var y = visitorLoc[this.loc].y;
    var anySet = 0;
    for (var v=0; v<3; v++) {
        var tmp = clickSection.visitor[0] + v;
        if (this.num[v]) {
            clickLocations[tmp].x = x+v*vcSize;
            clickLocations[tmp].xx = x+v*vcSize + vcSize;
            clickLocations[tmp].y = y;
            clickLocations[tmp].yy = y + vcSize;
            allowableClicks[tmp] = 1;
            anySet = 1;
        }
    }
    return anySet;
}

Visitors.prototype.move = function(col, fromthat) {
    fromthat.num[col]--;
    this.num[col]++; 
    this.anum[col]++;
    
    var fLoc = fromthat.loc;
    var tLoc = this.loc;
    msgLog(tixText[col] + " moves from " + vText[fLoc] + " to " + vText[tLoc]);
    
    if ((aVisitors[avPtr].fromLoc != fLoc) || (aVisitors[avPtr].toLoc != tLoc)) {
        avPtr = (avPtr + 1) % aVisitors.length;
    }
    if (state[0] != st.Start) {
        aVisitors[avPtr].setUp(fLoc, this, col);
    }

}

Visitors.prototype.grabBag = function() {
    // move a random visitor from the bag to 'this'
	var tmpB = bagVisitors.num[0] + bagVisitors.num[1] + bagVisitors.num[2];
	if (!tmpB) return;
	var tmp = Math.floor(Math.random()*tmpB);	// tmp random number from 0 to visitors in bag minus 1
	var tmpC;
    if (tmp < bagVisitors.num[0]) {
		// pink visitor pulled
		//~ bagVisitors.num[0]--;
		tmpC = 0;
	} else if (tmp < (bagVisitors.num[0] + bagVisitors.num[1])) {
		// brown visitor pulled
		//~ bagVisitors.num[1]--;
		tmpC = 1;
	} else {
        // white visitor pulled
        //~ bagVisitors.num[2]--;
        tmpC = 2;
    }
    //~ this.num[tmpC]++;
    this.move(tmpC, bagVisitors);
    //  check if bag is empty (was only 1 visitor in bag) as that is endGame factor
    if ((tmpB==1) && (numPlayers > 1)) {
       addEOG(1);
    }
    return;
}

var aVisitors = [];
var avPtr = 0;

function AnimeVisitors() {
    this.avCurrX = 0;
    this.avCurrY = 0;
    this.avDestX = 0;
    this.avDestY = 0;
    this.avFromLoc;
    this.avToLoc;
    this.avToObj;
    this.avNum = [0,0,0];
    this.avAnime = 0;
}
    
AnimeVisitors.prototype.setUp = function(fromLoc, toObj, col) {
    var toLoc = toObj.loc;
    this.avNum[col]++;
    this.avCurrX = visitorLoc[fromLoc].x - (1.5 * vcSize);
    this.avCurrY = visitorLoc[fromLoc].y;
    this.avDestX = visitorLoc[toLoc].x - (1.5 * vcSize);
    this.avDestY = visitorLoc[toLoc].y;
    this.avFromLoc = fromLoc;
    this.avToLoc = toLoc;
    this.avToObj = toObj;
    var diffX = this.avDestX-this.avCurrX;
    var diffY = this.avDestY-this.avCurrY;
    if (!animate) {
        mTimer = setInterval(moveIt,30);
    }
    this.avAnime = Math.floor(Math.sqrt(Math.sqrt(diffX*diffX + diffY*diffY))) + 1;
    animate = Math.max(animate, this.avAnime);
    
}

AnimeVisitors.prototype.draw = function() {
    this.avCurrX = calcAnime(this.avCurrX, this.avDestX, this.avAnime);
    this.avCurrY = calcAnime(this.avCurrY, this.avDestY, this.avAnime);
    for (var v=0; v<3; v++) {
        if (this.avNum[v]) {
            ctx.font = 'bold 16pt Helvetica';
            ctx.drawImage(pieceImage, 48*(v+12), 0,48,48, this.avCurrX+(vcSize*v)-13,this.avCurrY-13,48,48); 
            if (this.avNum[v] > 1) {
                ctx.fillStyle = "black";
                ctx.fillText(this.avNum[v], this.avCurrX+v*vcSize+2, this.avCurrY+23);
            }
        }
        if (animate < 2) {
            this.avNum[v] = 0;
        }
    } 
        
}

