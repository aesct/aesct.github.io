var E;
if (typeof exports === 'undefined') {
  E = {};
} else {
  E = exports;
}

// =============================================================================
//  类型
// =============================================================================
types = {
  // 实体
  entity: {
    player:            0,
    player2:           1,
    player3:           2,
    player4:           3,
    bomb:              4,
    wave:              5,
    block:             6,
    box:               7,
    loot:              8,
    player_downed:     9,
    stone:            10 
  },
  // 方向
  dir: {
    up:                1,
    right:             2,
    down:              3,
    left:              4
  },
  // 键
  key: {
    up:               73,
    right:            76,
    down:             75,
    left:             74,
    space:            32
  },
  // 声
  sound: {
    ship:              0,
    put_bomb:          1,
    explode:           2,
    pickup_loot:       3,
    resident:          4,
    x:                 5
  },
  // 加强
  loot: {
    speed:             1,
    power:             2,
    bombs:             3
  },
  // 操作代码
  opcode: {
    move:             14,
    new_player:       17,
    new_map:          18,
  }
};

// =============================================================================
//  全局配置 / 坐标转换
// =============================================================================
URL = 'http://aesct.github.io';
FRAME_RATE = 40;
SERVER_FRAME = 10;
INFINITE = Number.MAX_VALUE;
MAX_ID = 131071;
MAX_QUEUE_SIZE = 1023;
MAX_ROW = 13;
MAX_COL = 15;
UNIT = 64;
WIDTH = UNIT * MAX_COL;
HEIGHT = UNIT * MAX_ROW;
MAX_PLAYERS = 4;
numPlayers = 0;
// 硬编码地图
maps = [
  [
    [0,0,1,1,0,0,0,1,0,0,0,1,1,0,0],
    [0,2,1,0,1,1,1,0,1,1,1,0,1,2,0],
    [1,1,0,1,0,1,0,1,0,1,0,1,0,1,1],
    [1,0,1,0,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,1,1,1,1,2,2,2,1,1,1,1,0,1],
    [1,1,0,1,0,1,1,1,1,1,0,1,0,1,1],
    [1,1,1,0,1,1,1,1,1,1,1,0,1,1,1],
    [1,1,1,1,0,1,0,1,0,1,0,1,1,1,1],
    [1,1,0,1,1,0,1,1,1,0,1,1,0,1,1],
    [1,2,0,1,1,1,0,0,0,1,1,1,0,2,1],
    [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0],
  ],
  [
    [0,0,1,1,1,1,0,0,0,1,1,1,1,0,0],
    [0,2,1,2,1,2,0,2,0,2,1,2,1,2,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,1,2,1,2,1,2,1,2,1,2,1,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,2,1,2,1,2,1,2,1,2,1,2,1,2,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,2,1,2,1,2,1,2,1,2,1,2,1,2,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,1,2,1,2,1,2,1,2,1,2,1,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,2,1,2,1,2,0,2,0,2,1,2,1,2,0],
    [0,0,1,1,1,1,0,0,0,1,1,1,1,0,0],
  ],
  [
    [0,1,1,1,1,0,0,0,1,0,2,1,2,0,2],
    [0,2,1,2,1,2,1,0,0,2,1,1,0,0,0],
    [0,0,1,1,1,0,0,1,1,0,2,1,2,1,2],
    [1,2,1,2,1,2,1,0,0,2,1,1,1,1,1],
    [1,1,1,1,1,0,0,0,1,0,2,1,2,1,2],
    [1,2,1,2,1,2,1,1,0,0,1,1,1,1,1],
    [2,0,2,0,2,0,0,0,1,0,2,0,2,0,2],
    [1,1,1,1,1,0,1,0,0,2,1,2,1,2,1],
    [2,1,2,1,2,0,0,1,1,0,1,1,1,1,1],
    [1,1,1,1,1,2,1,0,0,2,1,2,1,2,1],
    [2,0,2,1,2,0,0,0,1,0,1,1,1,1,0],
    [0,0,1,1,1,2,1,1,0,2,1,2,1,2,0],
    [2,0,2,1,2,0,0,0,1,0,1,1,1,0,0],
  ],
]

function bind(rowId, colId) {
  return rowId >= 0 && rowId < MAX_ROW && colId >= 0 && colId < MAX_COL;
}
// 转换垂直坐标到2d矩阵行
function getRowID(vertical) {
  return Math.floor(vertical / UNIT);
}
// 转换水平坐标到2d矩阵列
function getColID(horizontal) {
  return Math.floor(horizontal / UNIT);
}
// 删除
function remove(dict, id, matrix) {
  if (typeof matrix != 'undefined') {
    matrix[dict[id].rowId][dict[id].colId] = 0;
  }
  delete dict[id];
  releaseID(id);
}
function clientRemove(dict, id, matrix) {
  if (typeof matrix != 'undefined') {
    matrix[dict[id].state.rowId][dict[id].state.colId] = 0;
  }
  delete dict[id];
}

// =============================================================================
//  循环队列
// =============================================================================
class Queue {
  constructor(size) {
    this.size = size + 1;
    this.data = [this.size];
    this.queueL = 0;
    this.queueR = 0;
  }

  empty() {
    return this.queueL == this.queueR;
  }
  
  full() {
    return (this.queueR + 1) % this.size == this.queueL;
  }

  shift() {
    var d = this.data[this.queueL];
    this.queueL = (this.queueL + 1) % this.size;
    return d;
  }

  push(d) {
    if (this.full()) {
      return;
    }
    this.data[this.queueR] = d;
    this.queueR = (this.queueR + 1) % this.size;
  }

  peek() {
    return this.data[this.queueL];
  }

  peekSecond() {
    return this.data[(this.queueL + 1) % this.size];
  }

  length() {
    if (this.queueL <= this.queueR) {
      return this.queueR - this.queueL;
    } else {
      return this.size - this.queueL + this.queueR;
    }
  }

  iterate(callback) {
    var i = this.queueL;
    while (i != this.queueR) {
      callback(this.data[i]);
      i = (i + 1) % this.size;
    }
  }
}

// =============================================================================
//  实体核心
// =============================================================================
class EntityState {
  constructor(id, x, y, size) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.size = size;
    this.rowId = getRowID(y);
    this.colId = getColID(x);
    this.dir = 0;
  }

  update(delta) {
    // pass...
  }
}

// =============================================================================
//  箱子
// =============================================================================
class BoxState extends EntityState {
  constructor(id, x, y) {
    super(id, x, y);
    this.type = 1;
    if (x != -1) {
      boxMatrix[this.rowId][this.colId] = this.id;
    }
  }

  destroyBox() {
    if (!(this.id in toDestroyBoxes)) {
      toDestroyBoxes[this.id] = this;
    }
  }
}
boxes = {};
toDestroyBoxes = {}
var boxMatrix;
var stoneMatrix;

// =============================================================================
//  玩家核心
// =============================================================================
class PlayerState extends EntityState {
  constructor(id, x, y, size, playerNum){
    super(id, x, y, size);
    this.downed = false;
    this.downedFrame = 0;
    this.stackedSpeed = 0;
    this.speed = 15;
    this.maxSpeed = 30;
    this.power = 1;
    this.maxPower = 8;
    this.currentBombNumber = 0;
    this.maxBombNumber = 1;
    this.maxMaxBombNumber = 8;
    this.ackSeqId = 0; // 重建序列ID
    this.score = 0;
    this.msgQueue = new Queue(FRAME_RATE);
    this.playerNum = playerNum;
    this.justPut = false;
    this.justPick = false;
  }

  downPlayer() {
    if (!this.downed) {
      this.downed = true;
      this.downedFrame = 0;
      this.stackedSpeed = this.speed;
      this.speed = 3;
    }
  }

  revivePlayer() {
    if (this.downed) {
      this.downed = false;
      this.speed = this.stackedSpeed;
    }
  }

  pickupLoot(type) {
    this.justPick = true;
    switch(type) {
      case types.loot.speed:
        this.speed = Math.min(this.maxSpeed, this.speed + 2);
      break;
      case types.loot.power:
        this.power = Math.min(this.maxPower, this.power + 1);
      break;
      case types.loot.bombs:
        this.maxBombNumber = 
            Math.min(this.maxMaxBombNumber, this.maxBombNumber + 1);
      break;
    }
  }

  move(delta, dir, isServer) {
    this.dir = dir;
    var diff = this.speed * delta / 100;
    var edge = this.size >> 1;
    var to = [[],
      [this.x, this.y - edge - diff],
      [this.x + edge + diff, this.y],
      [this.x, this.y + edge + diff],
      [this.x - edge - diff, this.y],
    ];
    var toX = Math.round(to[dir][0]);
    var toY = Math.round(to[dir][1]);
    var toColId = getColID(toX);
    var toRowId = getRowID(toY);

    var adjust = [[], [0, edge], [-edge, 0], [0, -edge], [edge, 0],];
    toX += adjust[dir][0];
    toY += adjust[dir][1];

    if (!bind(toRowId, toColId)) {
      return;
    }
    if ((toRowId != this.rowId || toColId != this.colId) &&
        (bombMatrix[toRowId][toColId] || boxMatrix[toRowId][toColId] ||
        stoneMatrix[toRowId][toColId])) {
      if (!isServer) {
        return;
      }

      var bombId = bombMatrix[toRowId][toColId];
      if (bombId) {
        var bomb = bombs[bombId];
        bomb.previousPushCtr = bomb.pushCtr++;
        if (bomb.pushCtr >= SERVER_FRAME) {
          bomb.push(dir);
        }
      }
      return;
    }

    this.x = toX;
    this.y = toY;
    this.rowId = getRowID(this.y);
    this.colId = getColID(this.x);

    if (!isServer) {
      return;
    }

    if (waveMatrix[this.rowId][this.colId]) {
      this.downPlayer();
    } 

    for (var id in playerMatrix[this.rowId][this.colId]) {
      if (id == this.id) {
        continue;
      }
      if (id in players && players[id].downed) {
        players[id].revivePlayer();
        this.score++;
      }
    }

    var lootId = lootMatrix[this.rowId][this.colId];
    if (lootId) {
      this.pickupLoot(loots[lootId].type);
      remove(loots, lootId, lootMatrix)
    }
  }

  putBomb() {
    if (this.downed) {
      return;
    }
    if (bombMatrix[this.rowId][this.colId] ||
      boxMatrix[this.rowId][this.colId] ||
      stoneMatrix[this.rowId][this.colId]) {
      return;
    }

    if (this.currentBombNumber >= this.maxBombNumber) {
      return;
    }
    this.currentBombNumber++;
    this.justPut = true;

    var id = getID();
    bombs[id] = new BombState(id, this.x, this.y, this.power, this.id, UNIT);
    bombs[id].doChain();
  }

  applyInput(input, isServer) {
    this.ackSeqId = input.seqId;
    var key = input.key >> 1;
    var delta = input.delta;

    switch (key) {
    case types.key.up:
      this.move(delta, types.dir.up, isServer);
      break;
    case types.key.right:
      this.move(delta, types.dir.right, isServer);
      break;
    case types.key.down:
      this.move(delta, types.dir.down, isServer);
      break;
    case types.key.left:
      this.move(delta, types.dir.left, isServer);
      break;
    }
  }
}
players = {};
var playerMatrix;

// =============================================================================
//  炸弹核心
// =============================================================================
class BombState extends EntityState {
  constructor(id, x, y, power, owner, size) {
    super(id, x, y);
    this.x = this.colId * UNIT + (UNIT >> 1);
    this.y = this.rowId * UNIT + (UNIT >> 1);
    this.chain = [];
    this.power = power;
    this.putTime = 0;
    this.ttl = SERVER_FRAME * 3; // 3秒
    this.owner = owner;
    if (x != -1) {
      bombMatrix[this.rowId][this.colId] = id;
    }
    this.previousPushCtr = 0;
    this.pushCtr = 0;
    this.dir = 0;
    this.speed = UNIT + UNIT >> 1;
    this.size = size;
  }

  blocked(rowId, colId) {
    return bind(rowId, colId) &&
        (boxMatrix[rowId][colId] || stoneMatrix[rowId][colId]);
  }

  push(dir) {
    var check = [[], [-1, 0], [0, 1], [1, 0], [0, -1],];
    var checkRowId = this.rowId + check[dir][0];
    var checkColId = this.colId + check[dir][1];

    if (!bind(checkRowId, checkColId) ||
        bombMatrix[checkRowId][checkColId] ||
        this.blocked(checkRowId, checkColId)) {
      return;
    }

    this.dir = dir;
    for (var i in this.chain) {
      var c = bombs[this.chain[i]].chain;
      for (var j in c) {
        if (c[j] == this.id) {
          c.splice(j, 1);
          break;
        }
      }
    }
    this.chain = [];
    bombMatrix[this.rowId][this.colId] = 0;
  }

  doBomb() {
    remove(bombs, this.id, bombMatrix);
    if (this.owner in players) {
      var player = players[this.owner];
      player.currentBombNumber--;
      if (player.currentBombNumber < 0) {
        player.currentBombNumber = 0;
      }
    }

    // [direction, start_i, start_j, end_i, end_j, step_i, step_j, dir_type]
    var directions = [
      [0,this.rowId + 1, this.colId, this.rowId + this.power, this.colId + this.power,  1,  0, types.dir.down],
      [1, this.rowId - 1, this.colId, this.rowId - this.power, this.colId - this.power, -1,  0, types.dir.up],
      [0, this.rowId, this.colId + 1, this.rowId + this.power, this.colId + this.power,  0,  1, types.dir.right],
      [1, this.rowId, this.colId - 1, this.rowId - this.power, this.colId - this.power,  0, -1, types.dir.left],
    ];

    for (var dir = 0; dir < directions.length; dir++) {
      var d = directions[dir];
      var len = 0;

      for (var i = d[1], j = d[2];
          (d[0] ? i >= d[3] && j >= d[4] : i <= d[3] && j <= d[4]);) {
        if (!bind(i, j) || stoneMatrix[i][j]) {
          break;
        }
        if (boxMatrix[i][j]) {
          var id = boxMatrix[i][j];
          boxes[id].destroyBox();
          break;
        }

        var lootId = lootMatrix[i][j];
        if (lootId) {
          remove(loots, lootId, lootMatrix);
        }

        var playerIds = Object.keys(playerMatrix[i][j]);
        if (playerIds.length) {
          for (var id in playerIds) {
            players[playerIds[id]].downPlayer();
          }
        }

        waveMatrix[i][j] = 1;
        i += d[5];
        j += d[6];
        len++;
      }

      if (len) {
        var id = getID();
        waves[id] = new WaveState(id, d[1], d[2], d[7], len);
        wavesToBroadcast.push(id);
      }
    }
  }

  // 链爆
  chainBomb(currentBomb) {
    bombsVisited[currentBomb.id] = 1;
    currentBomb.doBomb();
    for (var i in currentBomb.chain) {
      if (bombsVisited[currentBomb.chain[i]]) {
        continue;
      }
      bombsVisited[currentBomb.chain[i]] = 1;
      this.chainBomb(bombs[currentBomb.chain[i]]);
    }
  }

  tryChain(rowId, colId) {
    var otherId = bombMatrix[rowId][colId];
    if (otherId && bind(rowId, colId)) {
      bombs[this.id].chain.push(otherId);
      bombs[otherId].chain.push(this.id);
      return true;
    }
    return false;
  }

  // 放置炸弹时, 尝试链接其他炸弹, 达到链爆效果
  doChain() {
    // [direction, start_i, start_j, end_i, end_j, step_i, step_j]
    var directions = [
      [0, this.rowId + 1, this.colId, this.rowId + this.power, this.colId + this.power,  1,  0],
      [1, this.rowId - 1, this.colId, this.rowId - this.power, this.colId - this.power, -1,  0],
      [0, this.rowId, this.colId + 1, this.rowId + this.power, this.colId + this.power,  0,  1],
      [1, this.rowId, this.colId - 1, this.rowId - this.power, this.colId - this.power,  0, -1],
    ];

    for (var dir = 0; dir < directions.length; dir++) {
      var d = directions[dir];
      for (var i = d[1], j = d[2];
          (d[0] ? i >= d[3] && j >= d[4] : i <= d[3] && j <= d[4]);) {
        if (!bind(i, j) || this.blocked(i, j)) {
          break;
        }
        if (this.tryChain(i, j)) {
          break;
        }
        i += d[5];
        j += d[6];
      }
    }
  }

  update(delta) {
    if (!this.dir && this.putTime++ == this.ttl) {
      bombsVisited = {};
      this.chainBomb(this);
    }

    if (this.pushCtr == this.previousPushCtr) { // 重置
      this.pushCtr = 0;
    }

    if (!this.dir) {
      return;
    }

    var diff = this.speed * delta / 100;
    var edge = this.size >> 1;
    var to = [[],
      [this.x, this.y - diff],
      [this.x + diff, this.y],
      [this.x, this.y + diff],
      [this.x - diff, this.y],
    ];
    var toX = Math.round(to[this.dir][0]);
    var toY = Math.round(to[this.dir][1]);
    var toColId = getColID(toX);
    var toRowId = getRowID(toY);

    if (!bind(toRowId, toColId) ||
        ((toRowId != this.rowId || toColId != this.colId) &&
        (bombMatrix[toRowId][toColId] || boxMatrix[toRowId][toColId] ||
        stoneMatrix[toRowId][toColId]))) {
      // re-chain, reset put time, remove from moving bomb, reset dir
      this.doChain();
      this.putTime = 0;
      this.dir = 0;
      bombMatrix[this.rowId][this.colId] = this.id;
      return;
    }

    this.rowId = toRowId;
    this.colId = toColId;
    this.x = toX;
    this.y = toY;
  }
}
bombs = {};
bombsVisited = {};
var bombMatrix;

// =============================================================================
//  爆波
// =============================================================================
class WaveState extends EntityState {
  constructor(id, rowId, colId, dir, len) {
    super(id, colId * UNIT, rowId * UNIT);
    this.dir = dir;
    this.type = dir;
    this.rowId = rowId;
    this.colId = colId;
    this.len = len;
    this.createTime = 0;
    this.ttl = SERVER_FRAME >> 1; // 0.5秒
  }

  update(delta) {
    if (this.createTime++ == this.ttl) {
      remove(waves, this.id);

      var directions = [ // [[end_i, end_j, step_i, step_j]]
        [1, this.rowId - this.len, this.colId - this.len, -1,  0],
        [0, this.rowId + this.len, this.colId + this.len,  0,  1],
        [0, this.rowId + this.len, this.colId + this.len,  1,  0],
        [1, this.rowId - this.len, this.colId - this.len,  0, -1],
      ];

      var d = directions[this.dir - 1];
      for (var i = this.rowId, j = this.colId;
          (d[0] ? i > d[1] && j > d[2] : i < d[1] && j < d[2]);) {
        waveMatrix[i][j] = 0;
        i += d[3];
        j += d[4];
      }

      return;
    }
  }
}
waves = {};
wavesToBroadcast = [];
wavesClient = {};
var waveMatrix;

// =============================================================================
//  强化
// =============================================================================
class LootState extends EntityState {
  constructor(id, x, y) {
    super(id, x, y);

    var possibleTypes = [
      types.loot.speed,
      types.loot.power,
      types.loot.bombs,
    ];
    this.type = possibleTypes[getRandomInt(3)];
  }
}
loots = {};
var lootMatrix;

// =============================================================================
//  网络
// =============================================================================
msgQueue = new Queue(MAX_QUEUE_SIZE); // 客户端
clients = {};
function recvMessage(id, msg) {
  if (!(id in players)) {
    return;
  }
  players[id].msgQueue.push(msg);
}

// =============================================================================
//  UTIL
// =============================================================================
idQueue = new Queue(MAX_ID);

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function prepID(howMany) {
  for (var i = 1; i <= howMany; i++) {
    idQueue.push(i);
  }
}
function getID() {
  return idQueue.shift();
}
function releaseID(id) {
  idQueue.push(id);
}

function matrixToIntArray(m, objects) {
  var array = [];

  for (var i = 0; i < MAX_ROW; i++) {
    var rowMask = 0;
    var d = 1;
    for (var j = 0; j < MAX_COL; j++) {
      rowMask += d * (m[i][j] ? objects[m[i][j]].type : 0);
      d *= 4;
    }
    array.push(rowMask);
  }

  return array;
}

function intArrayToMatrix(array) {
  var ret = {};

  for (var i = 0; i < MAX_ROW; i++) {
    ret[i] = {};
    var j = 0;
    while (array[i]) {
      ret[i][j++] = array[i] % 4;
      array[i] = Math.floor(array[i] / 4);
    }
    while (j < MAX_COL) {
      ret[i][j++] = 0;
    }
  }

  return ret;
}

function clearMatrix(obj) {
  var matrix = new Array(MAX_ROW);
  for (var i = 0; i < MAX_ROW; i++) {
    matrix[i] = new Array(MAX_COL);
    for (var j = 0; j < MAX_COL; j++) {
      if (typeof obj != 'undefined') {
        matrix[i][j] = obj;
      } else {
        matrix[i][j] = 0;
      }
    }
  }

  return matrix;
}

function init() {
  boxMatrix = clearMatrix();
  stoneMatrix = clearMatrix();
  bombMatrix = clearMatrix();
  lootMatrix = clearMatrix();
  waveMatrix = clearMatrix();
  playerMatrix = clearMatrix({});

  for (var i in loots) {
    remove(loots, i);
  }
  for (var i in boxes) {
    remove(boxes, i);
  }

  var map = maps[currentMap];
  for (var i = 0; i < MAX_ROW; i++) {
    for (var j = 0; j < MAX_COL; j++) {
      if (map[i][j] == 1) {
        var id = getID();
        boxes[id] = new BoxState(id, j * UNIT, i * UNIT);
        boxMatrix[i][j] = id;
      } else if (map[i][j] == 2) {
        stoneMatrix[i][j] = 1;
      } else {
        boxMatrix[i][j] = 0;
      }
    }
  }
}

function handleClientMessage(msg, player) {
  switch (msg.o) {
  case types.opcode.move:
    msg.i.delta = 1000.0 / FRAME_RATE;
    if (msg.i.key & 1) {
      player.putBomb();
    }
    player.applyInput(msg.i, true);
  break;
  }
}

function playerStateToInt(state) {
  var r1 = state.dir;
  r1 = r1 << 1 | state.downed;
  r1 = r1 << 4 | state.score;
  r1 = r1 << 2 | state.playerNum;
  r1 = r1 << 1 | state.justPut;
  r1 = r1 << 1 | state.justPick;

  var r2 = state.x;
  r2 = r2 << 10 | state.y;
  r2 = r2 << 5 | state.speed;
  return [r1, r2];
}

function intToPlayerState(state) {
  var s1 = state[0];
  var s2 = state[1];

  var ret = {};
  ret.speed = s2 & 0b11111; s2 >>= 5;
  ret.y = s2 & 0b1111111111; s2 >>= 10;
  ret.x = s2;

  ret.justPick = s1 & 0b1; s1 >>= 1;
  ret.justPut = s1 & 0b1; s1 >>= 1;
  ret.playerNum = s1 & 0b11; s1 >>= 2;
  ret.score = s1 & 0b1111; s1 >>= 4;
  ret.downed = s1 & 0b1; s1 >>= 1;
  ret.dir = s1;
  return ret;
}

function waveStateToInt(state) {
  var ret = state.rowId;
  ret = ret << 4 | state.colId;
  ret = ret << 3 | state.dir;
  ret = ret << 4 | state.len;
  return ret;
}

function intToWaveState(state) {
  var ret = {};
  ret.len = state & 0b1111; state >>= 4;
  ret.dir = state & 0b111; state >>= 3;
  ret.colId = state & 0b1111; state >>= 4;
  ret.rowId = state;
  return ret;
}

function broadcastState() {
  var playerStates = [];
  for (var id in players) {
    var p = players[id];
    playerStates.push({
      id: id,
      aid: p.ackSeqId,
      s: playerStateToInt(p),
    });
    p.justPut = false;
    p.justPick = false;
  }

  var waveStates = [];
  for (var id in wavesToBroadcast) {
    var w = waves[wavesToBroadcast[id]];
    waveStates.push({
      s: waveStateToInt(w),
    });
  }
  wavesToBroadcast = [];

  var bombStates = [];
  for (var id in bombs) {
    bombStates.push({
      id: id,
      s: bombs[id].x << 10 | bombs[id].y,
    })
  }

  for (var id in players) {
    clients[id].volatile.emit('opcode', {
      o: types.opcode.move,
      p: playerStates,
      w: waveStates,
      b: bombStates,
      l: matrixToIntArray(lootMatrix, loots),
      bo: matrixToIntArray(boxMatrix, boxes),
    });
  }
}

var currentMap = 1;
function restartGame() {
  currentMap = (currentMap + 1) % maps.length;
  init();
  numPlayers = 0;
  for (var spawn in playerSpawns) {
    playerSpawns[spawn].spawn = true;
  }
  spawnedPlayers = {};
  for (var i in players) {
    doSpawn(i);
  }
  for (var id in players) {
    clients[id].emit('opcode', {o: types.opcode.new_map, m: currentMap});
  }
}

function serverUpdate(delta, callback) {
  for (var id in players) {
    var player = players[id];
    var queue = player.msgQueue;
    var ctr = 0;
    while (ctr < FRAME_RATE / SERVER_FRAME && !queue.empty()) {
      ctr++;
      handleClientMessage(queue.shift(), player);
    }
  }

  var shouldRestart = false;
  for (var id in players) {
    var player = players[id];
    shouldRestart |= player.score >= 5;

    if (player.downed) {
      player.downedFrame++;
      if (player.downedFrame == SERVER_FRAME * 5) { // 5秒
        player.revivePlayer();
      }
    }
  }

  if (shouldRestart) {
    restartGame();
  }

  // 更新其他
  for (var i in waves) { waves[i].update(delta); }

  for (var id in toDestroyBoxes) {
    var rand = getRandomInt(100);
    if (rand <= 50) { // 50%掉强化
      var lootId = getID();
      var x = boxes[id].x;
      var y = boxes[id].y;
      var rowId = boxes[id].rowId;
      var colId = boxes[id].colId;
      loots[lootId] = new LootState(lootId, x, y);
      lootMatrix[rowId][colId] = lootId;
    }

    remove(boxes, id, boxMatrix);
  }
  toDestroyBoxes = {};

  broadcastState();
}

function update(delta) {
  for (var i = 0; i < MAX_ROW; i++) {
    for (var j = 0; j < MAX_COL; j++) {
      playerMatrix[i][j] = {};
    }
  }
  for (var id in players) {
    var player = players[id];
    var rowId = 
        typeof player.state == 'undefined' ? player.rowId : player.state.rowId;
    var colId = 
        typeof player.state == 'undefined' ? player.colId : player.state.colId;
    playerMatrix[rowId][colId][id] = 1;
  }
  for (var i in bombs) { bombs[i].update(delta); }
}

playerSpawns = [
  {spawn: true, where: [UNIT >> 1, UNIT * (MAX_ROW - 1) + (UNIT >> 1)]},
  {spawn: true, where: [UNIT >> 1, UNIT >> 1]},
  {spawn: true, where: [UNIT * (MAX_COL - 1) + (UNIT >> 1), UNIT >> 1]},
  {spawn: true, where: 
      [UNIT * (MAX_COL - 1) + (UNIT >> 1), UNIT * (MAX_ROW - 1) + (UNIT >> 1)]},
];
spawnedPlayers = {};

function doSpawn(id) {
  for (var i = 0; i < playerSpawns.length; i++) {
    var spawn = playerSpawns[i];
    if (!spawn.spawn) {
      continue;
    }
    var spawnX = spawn.where[0];
    var spawnY = spawn.where[1];
    players[id] = new PlayerState(id, spawnX, spawnY, UNIT, i);
    spawnedPlayers[id] = i;
    spawn.spawn = false;
    numPlayers++;
    clients[id].emit(
        'opcode', {o: types.opcode.new_player, id: id, m: currentMap});
    break;
  }
}

function spawnPlayer(id, socket) {
  if (!(id in clients) && numPlayers < MAX_PLAYERS) {
    clients[id] = socket;
    doSpawn(id);
  } else {
    socket.disconnect();
  }
}

function disconnectPlayer(id) {
  if (id in clients) {
    delete clients[id];
    delete players[id];
    numPlayers--;
    playerSpawns[spawnedPlayers[id]].spawn = true;
    delete spawnedPlayers[id];
  }
}

// =============================================================================
//  SERVER EXPORTS
// =============================================================================
E.init = init;
E.update = update;
E.spawnPlayer = spawnPlayer;
E.recvMessage = recvMessage;
E.serverUpdate = serverUpdate;
E.prepID = prepID;
E.disconnectPlayer = disconnectPlayer;
