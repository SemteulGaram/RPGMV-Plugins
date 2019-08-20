//=============================================================================
// SemteulGaram Plugins - Sophisticated Movement
// SG_SophisticatedMovement.js
//=============================================================================

var Imported = Imported || {};
Imported.SG_SophisticatedMovement = true;

window.Sg = window.Sg || {};
window.Sg.SoMo = window.Sg.SoMo || {};
window.Sg.SoMo.version = 1;

//=============================================================================
 /*:
 * @plugindesc v1.00 플레이어가 격자이동 대신 더 세밀하게 움직임
 * @author SemteulGaram
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * 플레이어가 격자이동 대신 더 세밀하게 움직임
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version 1.00:
 * - 첫 제작
 *
 * ============================================================================
 * End of Helpfile
 * ============================================================================
 */
//=============================================================================

;(function() {
  const somo = window.Sg.SoMo;

  const TAG = 'Sg.SG_SophisticatedMovement';
  window.Sg.SoMo.TAG = TAG;
  console.log(somo.TAG, 'load');

  // Skip parameters: no options

  // Override methods
  somo.Game_Player_getInputDirection = Game_Player.prototype.getInputDirection;
  Game_Player.prototype.getInputDirection = function () {
    window.Sg.SoMo.Game_Player_getInputDirection.apply(this, arguments);
    return Input.dir8;
  };

  somo.Game_Player_moveByInput = Game_Player.prototype.moveByInput;
  Game_Player.prototype.moveByInput = function () {
    if (!this.isMoving() && this.canMove()) {
      var direction = this.getInputDirection();
      if (direction > 0) {
        $gameTemp.clearDestination();
      } else if ($gameTemp.isDestinationValid()){
        var x = $gameTemp.destinationX();
        var y = $gameTemp.destinationY();
        // TODO: Override findDirectionTo?
        direction = this.findDirectionTo(x, y);
      }
      if (direction > 0) {
        this.executeMove(direction);
      }
    }
  }

  somo.Game_Player_executeMove = Game_Player.prototype.executeMove;

  somo.Game_Player_moveStraight = Game_Player.prototype.moveStraight;
  somo.Game_CharacterBase_moveStraight = Game_CharacterBase.prototype.moveStraight;
  // Override Game_CharacterBase.moveStraight
  Game_Player.prototype.moveStraight = function(d) {
    this.setMovementSuccess(this.canPass(this._x, this._y, d));
    if (this.isMovementSucceeded()) {
      this.setDirection(d);
      this._x = $gameMap.roundXWithDirection(this._x, d);
      this._y = $gameMap.roundYWithDirection(this._y, d);
      this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(d));
      this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(d));
      this.increaseSteps();
    } else {
      this.setDirection(d);
      this.checkEventTriggerTouchFront(d);
    }
  };

  // Override Game_CharacterBase.canPass
  Game_Player.prototype.canPass = function(x, y, d) {
    // for micro movement
    switch (d) {
      default:
        console.error(TAG +'>Game_Player.canPass> Unknown direction: ' + d);
      break; case 2:
        x = parseInt(Math.round(x));
        y = parseInt(Math.ceil(y));
      break; case 4:
        x = parseInt(Math.ceil(x));
        y = parseInt(Math.round(y));
      break; case 6:
        x = parseInt(Math.floor(x));
        y = parseInt(Math.round(y));
      break; case 8:
        x = parseInt(Math.round(x));
        y = parseInt(Math.floor(y));
    }

    var x2 = $gameMap.roundXWithDirection(x, d);
    var y2 = $gameMap.roundYWithDirection(y, d);
    if (!$gameMap.isValid(x2, y2)) {
      return false;
    }
    if (this.isThrough() || this.isDebugThrough()) {
      return true;
    }
    if (!this.isMapPassable(x, y, d)) {
      return false;
    }
    if (this.isCollidedWithCharacters(x2, y2)) {
      return false;
    }
    return true;
  };

  // Override Game_CharacterBase.isMoving
  Game_Player.prototype.isMoving = function() {
    // TODO
    return this._realX !== this._x || this._realY !== this._y;
  }

  // Override Game_CharacterBase.updateMove
  Game_Player.prototype.updateMove = function() {
    if (this._x < this._realX) {
        this._realX = Math.max(this._realX - this.distancePerFrame(), this._x);
    }
    if (this._x > this._realX) {
        this._realX = Math.min(this._realX + this.distancePerFrame(), this._x);
    }
    if (this._y < this._realY) {
        this._realY = Math.max(this._realY - this.distancePerFrame(), this._y);
    }
    if (this._y > this._realY) {
        this._realY = Math.min(this._realY + this.distancePerFrame(), this._y);
    }
    if (!this.isMoving()) {
        this.refreshBushDepth();
    }
  }


  somo.Game_Player_updateDashing = Game_Player.prototype.updateDashing;

  somo.Game_Player_updateDashing = Game_Player.prototype.updateDashing;

  somo.Game_Character_update = Game_Character.prototype.update;



  class SophisticatedMovement {
    constructor () {

    }
  }
})();
