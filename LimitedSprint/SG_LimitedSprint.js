//=============================================================================
// SemteulGaram Plugins - Limited Sprint
// SG_LimitedSprint.js
//=============================================================================

var Imported = Imported || {};
Imported.SG_LimitedSprint = true;

window.Sg = window.Sg || {};
window.Sg.LiSp = window.Sg.LiSp || {};
window.Sg.LiSp.version = 1;

//=============================================================================
 /*:
 * @plugindesc v1.00 주어진 체력만큼만 달릴 수 있음
 * @author SemteulGaram
 *
 * @param Sprint Fitness
 * @desc 달리기 체력 (예: 5000 이면 5초동안 달릴 수 있음)
 * @type number
 * @min 0
 * @default 5000
 *
 * @param Sprint Fitness Regen Speed
 * @desc 달리기 체력 초당 회복 속도
 * @type number
 * @min 0
 * @default 1000
 *
 * @param Exhausted Duration
 * @desc 체력 모두 소모시 멈추는 시간(밀리초)
 * @type number
 * @min 0
 * @default 3000
 *
 * @param Exhausted Switch
 * @desc 체력 모두 소모시 작동시킬 스위치 번호 (0: 꺼짐)
 * @type number
 * @min 0
 * @default 0
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * 메뉴창을 열지 않고 아이템을 확인할 수 있게 해 줌
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
  const lisp = window.Sg.LiSp;

  const TAG = 'Sg.SG_LimitedSprint';
  window.Sg.LiSp.TAG = TAG;
  console.info(lisp.TAG, 'load');

  lisp.Parameters = PluginManager.parameters('SG_LimitedSprint');
  lisp.param = lisp.param || {};
  lisp.param.sprintFitness = parseInt(lisp.Parameters['Sprint Fitness']);
  lisp.param.sprintFitnessRegenSpeed = parseInt(lisp.Parameters['Sprint Fitness Regen Speed']);
  lisp.param.exhaustedDuration = parseInt(lisp.Parameters['Exhausted Duration']);
  lisp.param.exhaustedSwitch = parseInt(lisp.Parameters['Exhausted Switch']);

  class LimitedSprint {
    constructor(options) {
      this.options = options;
      this.lastUpdateAt = null;
      this.currentSprintFitness = this.options.sprintFitness;
      this.exhaust = false;
    }

    update(isDashing) {
      // 아직 초기화 되지 않았을 경우 처리
      if (!this.lastUpdateAt) {
        this.lastUpdateAt = Date.now();
        return;
      }

      // 지친 상태일경우 처리
      if (this.exhaust) {
        const now = Date.now();

        this.currentSprintFitness += (now - this.lastUpdateAt)
          *(this.options.sprintFitnessRegenSpeed/1000);
        // TODO: performance enhance
        this.lastUpdateAt = now;

        // 최대치인 경우
        if (this.currentSprintFitness >= this.options.sprintFitness) {
          console.debug(lisp.TAG, 'fitness restore');
          this.currentSprintFitness = this.options.sprintFitness;
          // 고갈 상태 해제
          this.exhaust = false;
          if (this.options.exhaustedSwitch != 0) {
            $gameSwitches.setValue(this.options.exhaustedSwitch, false);
          }
        }
      // 지치지 않고 달리는 중일 경우 처리
      } else if (isDashing) {
        const now = Date.now();

        this.currentSprintFitness -= now - this.lastUpdateAt;
        this.lastUpdateAt = now;

        // 체력을 모두 소진한 경우
        if (this.currentSprintFitness < 0) {
          console.debug(lisp.TAG, 'fitness exhausted');
          this.currentSprintFitness = 0;
          // 고갈 상태
          this.exhaust = true;
          if (this.options.exhaustedSwitch != 0) {
            $gameSwitches.setValue(this.options.exhaustedSwitch, true);
          }
        }
      // 지치지도 않고 달리지도 않고 체력이 최고치가 아닐경우 처리
      } else if (this.currentSprintFitness !== this.options.sprintFitness) {
        const now = Date.now();

        this.currentSprintFitness += (now - this.lastUpdateAt)
          *(this.options.sprintFitnessRegenSpeed/1000);
        // TODO: performance enhance
        this.lastUpdateAt = now;

        // 최대치인 경우
        if (this.currentSprintFitness > this.options.sprintFitness) {
          this.currentSprintFitness = this.options.sprintFitness;
        }
      }
    }
  }

  lisp._instance = new LimitedSprint(lisp.param);

  // Override
  // 플레이어 움직임 허용여부 오버라이드
  lisp.GamePlayer_canMove = Game_Player.prototype.canMove;
  Game_Player.prototype.canMove = function() {
    const result = window.Sg.LiSp.GamePlayer_canMove.apply(this, arguments);

    if (window.Sg.LiSp._instance.exhaust) return false;

    return result;
  };

  // Override
  // 플레이어 업데이트 오버라이드
  lisp.GamePlayer_update = Game_Player.prototype.update;
  Game_Player.prototype.update = function() {
    window.Sg.LiSp.GamePlayer_update.apply(this, arguments);

    window.Sg.LiSp._instance.update(this._dashing);
  }

})();
