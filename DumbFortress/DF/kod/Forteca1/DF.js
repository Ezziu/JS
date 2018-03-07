 /*
    MAP
 */

var plan = ["############################",
			"#******#*****#***********B##",
			"#**************************#",
			"#**********#####***********#",
			"##********o#  #****##******#",
			"###*******o   ##****#******#",
			"# ********oG###o*****#*****#",
			"#oo*####oo     o***********#",
			"# o ##         oo**********#",
			"#  %*#          o******###*#",
			"#   *#          *oo********#",
			"# %             * o********#",
			"#%    %       % % ooo******#",
			"#  %          %     o******#",
			"#%%%       %    %%% oo*****#",
			"#B%  %        %  % % o*****#",
			"############################"];


 /*
    SPACE
 */
 
function Vector(x, y) {
  this.x = x;
  this.y = y;
}
Vector.prototype.plus = function(other) {
  return new Vector(this.x + other.x, this.y + other.y);
};

function Grid(width, height) {
  this.space = new Array(width * height);
  this.width = width;
  this.height = height;
}
Grid.prototype.isInside = function(vector) {
  return vector.x >= 0 && vector.x < this.width &&
         vector.y >= 0 && vector.y < this.height;
};
Grid.prototype.get = function(vector) {
  return this.space[vector.x + this.width * vector.y];
};
Grid.prototype.set = function(vector, value) {
  this.space[vector.x + this.width * vector.y] = value;
};
 
 var directions = {
  "n":  new Vector( 0, -1),
  "ne": new Vector( 1, -1),
  "e":  new Vector( 1,  0),
  "se": new Vector( 1,  1),
  "s":  new Vector( 0,  1),
  "sw": new Vector(-1,  1),
  "w":  new Vector(-1,  0),
  "nw": new Vector(-1, -1)
};

 /*
    CRIT
 */

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

var directionNames = "n ne e se s sw w nw".split(" ");


function BouncingCritter() {
  this.direction = randomElement(directionNames);
  this.energy = 30;	
};

BouncingCritter.prototype.act = function(view) {
    var pred = view.find("B")
	var space = view.find(" ");
	var wall = view.find("#");
	var plant = view.find("*");
	if (pred) 
        return {type: "move", direction: space};
	if (this.energy > 40 && space)
        return {type: "reproduce", direction: space};
    if (plant)
        return {type: "decompose", direction: plant};
	if (space) 
        return {type: "move", direction: space};
	if (wall) 
        return {type: "move", direction: "s"};
	
};

function BouncyHunter() {
  this.direction = randomElement(directionNames);
  this.energy = 100;
};

BouncyHunter.prototype.act = function(view) {
  var prey = view.find("o");
  var space = view.find(" ");
  var corpse = view.find("%");
  var tree = view.find("*");
    if (prey)
        return {type: "eat", direction: prey};
    //if (this.energy >120 && space)
     //     return {type: "reproduce", direction: space};
	if (this.energy <= 10 && corpse)
        return {type: "decompose", direction: corpse};
	if (space) 
        return {type: "move", direction: space};
	if (corpse)
        return {type: "decompose", direction: corpse};
	if (tree)
        return {type: "decompose", direction: tree};
	
};

function TreeTrunk() {
  this.energy = 3 + Math.random() * 4;
};
	
TreeTrunk.prototype.act = function(view) {
    
	if (this.energy > 15) {
    	var space = view.find(" ");
        if (space)
          return {type: "reproduce", direction: space};
	};
	if (this.energy < 20) {
	    return {type: "grow"};
		
    };		
	var corpse = view.find("%");
	if (corpse && this.energy <10){
        return {type: "decompose", direction: corpse};
	};	
	
};

function Ghoul() {
  this.direction = randomElement(directionNames);
  this.energy = 200;
};

Ghoul.prototype.act = function(view) {
  var space = view.find(" ");
  var corpse = view.find("%");
  var prey = view.find("o");
	if (corpse)
        return {type: "decompose", direction: corpse};
	if (this.energy <= 100 && prey)
        return {type: "eat", direction: prey};
	if (space) 
        return {type: "move", direction: space};
	if (prey) 
        return {type: "move", direction: prey};
};

/*
    GENERATING WORLD (MAP(plan) + LEGEND => GRID)
*/

function elementFromChar(legend, ch) {
  if (ch == " ")
    return null;
  var element = new legend[ch]();
  element.originChar = ch;
  return element;
}

function World(map, legend) {
  var grid = new Grid(map[0].length, map.length);
  this.grid = grid;
  this.legend = legend;

  map.forEach(function(line, y) {
    for (var x = 0; x < line.length; x++)
      grid.set(new Vector(x, y),
               elementFromChar(legend, line[x]));
  });
}

function charFromElement(element) {
  if (element == null)
    return " ";
  else
    return element.originChar;
}

World.prototype.toString = function() {
  var output = "";
  for (var y = 0; y < this.grid.height; y++) {
    for (var x = 0; x < this.grid.width; x++) {
      var element = this.grid.get(new Vector(x, y));
      output += charFromElement(element);
    }
    output += "\n";
  }
  return output;
};

// first iteration world
var world = new World(plan, {"#": Wall,
                             "o": BouncingCritter,
                             "B": BouncyHunter,
							 "%": Corpse,
							 "*": TreeTrunk,
							 "G": Ghoul});

/*
    INANIMA
*/

function Wall() {}
function Corpse() {
	this.energy = 10;
}

/*
    ANIMA
*/

Grid.prototype.forEach = function(f, context) {
  for (var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      var value = this.space[x + y * this.width];
      if (value != null)
        f.call(context, value, new Vector(x, y));
    }
  }
};

World.prototype.turn = function() {
  var acted = [];
  this.grid.forEach(function(critter, vector) {
    if (critter.act && acted.indexOf(critter) == -1) {
      acted.push(critter);
      this.letAct(critter, vector);
    }
  }, this);
};

var actionTypes = Object.create(null);

World.prototype.letAct = function(critter, vector) {
  var corpse = elementFromChar(this.legend,"%");
  var action = critter.act(new View(this, vector));
  var handled = action &&
  action.type in actionTypes &&
  actionTypes[action.type].call(this, critter,
                                vector, action);
  if (!handled) {
    critter.energy -= 0.2;
    if (critter.energy <= 0)
      this.grid.set(vector, corpse);
  };
	
  /*if (action && action.type == "move") {
    var dest = this.checkDestination(action, vector);
    if (dest && this.grid.get(dest) == null) {
      this.grid.set(vector, null);
      this.grid.set(dest, critter); 
    }
  } */
};

actionTypes.move = function(critter, vector, action) {
  var dest = this.checkDestination(action, vector);
  if (dest == null ||
      critter.energy <= 1 ||
      this.grid.get(dest) != null)
    return false;
  critter.energy -= 1;
  this.grid.set(vector, null);
  this.grid.set(dest, critter);
  return true;
};


actionTypes.decompose = function(critter, vector, action) {
  var dest = this.checkDestination(action, vector);
  var atDest = dest != null && this.grid.get(dest);
  if (!atDest || atDest.energy == null)
    return false;
  critter.energy += atDest.energy;
  this.grid.set(dest, null);
  return true;
};

actionTypes.eat = function(critter, vector, action) {
  var corpse = elementFromChar(this.legend,
                            "%");
  var dest = this.checkDestination(action, vector);
  var atDest = dest != null && this.grid.get(dest);
  if (!atDest || atDest.energy == null)
    return false;
  critter.energy += atDest.energy;
  this.grid.set(dest, corpse);
  return true;
};
	
actionTypes.grow = function(critter) {
  critter.energy += 0.3;
  return true;
};
	
actionTypes.reproduce = function(critter, vector, action) {
  var baby = elementFromChar(this.legend,
                             critter.originChar);
  var dest = this.checkDestination(action, vector);
  if (dest == null ||
      critter.energy <= 2 * baby.energy ||
      this.grid.get(dest) != null)
    return false;
  critter.energy -= 2 * baby.energy;
  this.grid.set(dest, baby);
  return true;
};

World.prototype.checkDestination = function(action, vector) {
  if (directions.hasOwnProperty(action.direction)) {
    var dest = vector.plus(directions[action.direction]);
    if (this.grid.isInside(dest))
      return dest;
  }
};

// (...)




function View(world, vector) {
  this.world = world;
  this.vector = vector;
}
	
View.prototype.look = function(dir) {
  var target = this.vector.plus(directions[dir]);
  if (this.world.grid.isInside(target))
    return charFromElement(this.world.grid.get(target));
  else
    return "#";
};

View.prototype.findAll = function(ch) {
  var found = [];
  for (var dir in directions)
    if (this.look(dir) == ch)
      found.push(dir);
  return found;
};
View.prototype.find = function(ch) {
  var found = this.findAll(ch);
  if (found.length == 0) return null;
  return randomElement(found);
};

