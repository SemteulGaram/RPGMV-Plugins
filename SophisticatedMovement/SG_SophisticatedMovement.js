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
  GamePlayer.prototype.moveByInput = function () {
    if (!this.isMoving() && this.canMove()) {
        var direction = this.getInputDirection();
        if (direction > 0) {
            $gameTemp.clearDestination();
        } else if ($gameTemp.isDestinationValid()){
            var x = $gameTemp.destinationX();
            var y = $gameTemp.destinationY();
            // TODO: Override findDirectionTo
            direction = this.findDirectionTo(x, y);
        }
        if (direction > 0) {
            this.executeMove(direction);
        }
    }
  }


  class SophisticatedMovement {
    constructor () {

    }
  }
})();
