//=============================================================================
// SemteulGaram Plugins - Popup HP
// SG_PopupHP.js
//=============================================================================

var Imported = Imported || {};
Imported.SG_PopupHP = true;

var Sg = window.Sg || {};
window.Sg = Sg;
Sg.PoHp = Sg.PoHp || {};
var pohp = Sg.PoHp;
Sg.PoHp.version = 1.02;

const TAG = 'Sg.SG_PopupHp';
Sg.PoHp.TAG = TAG;

//=============================================================================
 /*:
 * @plugindesc v1.02 메뉴창을 열지 않고 체력을 확인할 수 있게 해 줌
 * @author SemteulGaram
 *
 * @param Horizontal Align
 * @type boolean
 * @on 좌
 * @off 우
 * @desc 이미지 수평 위치
 * @default true
 *
 * @param Hp Image
 * @type string
 * @desc "img/pictures" 폴더에 있는 hp 이미지 시퀸스 프리픽스
 * (예. "popup-hp-" 는 popup-hp-1.png, popup-hp-2.png... 로 바뀜)
 * @default popup-hp-
 *
 * @param Automatic Popup
 * @type boolean
 * @on ON
 * @off OFF
 * @desc 체력이 바뀔때마다 자동으로 팝업 띄우기
 * @default true
 *
 * @param Popup Duration
 * @type number
 * @desc 팝업 보여주는 시간 (밀리초 단위)
 * @min 0
 * @default 500
 *
 * @param Fadeout Duration
 * @type number
 * @desc 팝업이 페이드 아웃되는 시간 (밀리초 단위)
 * @min 0
 * @default 500
 *
 * @param Popup Key
 * @type string
 * @desc 팝업을 수동으로 띄울 단축키 (빈칸으로 하면 꺼짐)
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * 메뉴창을 열지 않고 체력을 확인할 수 있게 해 줌
 *
 * ============================================================================
 * How to Use
 * ============================================================================
 *
 * 해당하는 명령어를 복사해서 [이벤트 명령] -> [스크립트]에 붙여넣기해서 사용
 *
 * window.Sg.PoHp.showPopup();    강제로 팝업을 띄움
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version 1.00:
 * - 첫 제작
 *
 * Version 1.01:
 * - 수동으로 팝업을 띄우는 방법 추가
 *
 * Version 1.02:
 * - 단축키로 팝업을 지정할 수 있음
 *
 * ============================================================================
 * End of Helpfile
 * ============================================================================
 */
//=============================================================================

pohp.Parameters = PluginManager.parameters('SG_PopupHP');
pohp.param = pohp.param || {};
pohp.param.horizontalAlign = Boolean(pohp.Parameters['Horizontal Align']);
pohp.param.hpImage = pohp.Parameters['Hp Image'];
pohp.param.automaticPopup = Boolean(pohp.Parameters['Automatic Popup']);
pohp.param.popupDuration = Number(pohp.Parameters['Popup Duration']);
pohp.param.fadeoutDuration = Number(pohp.Parameters['Fadeout Duration']);
pohp.param.popupKey = ('' + pohp.Parameters['Popup Key']).toLowerCase();

pohp.isShow = false;
pohp.popupExpire1At = null;
pohp.popupExpire2At = null;
pohp.now = null;
pohp.hpImage = {};

// fadeout, timeout handle
pohp.SceneManager_update = SceneManager.update;
SceneManager.update = function() {
  pohp.SceneManager_update.apply(this, arguments);
  try {
    // handle timeout & fadeout
    if (!pohp.isShow) return;
    if (!SceneManager._scene._SG_hpContainer) pohp.hidePopup();
    pohp.now = Date.now();
    if (pohp.popupExpire2At < pohp.now) {
      console.debug(TAG, 'popup expired');
      pohp.hidePopup()
    } else if (pohp.popupExpire1At < pohp.now) {
      SceneManager._scene._SG_hpContainer.alpha
        = (pohp.popupExpire2At - pohp.now)/pohp.param.fadeoutDuration;
    }
  } catch (err) {
    console.error(TAG, err);
  }
};

// polyfill
pohp.getHp = function() {
  return $gameActors.actor(1).hp;
};

// hp image cache
pohp.getHpImage = function(hp) {
  if (!pohp.hpImage[hp]) {
    console.debug(TAG, 'img/pictures load:', (pohp._ = pohp.param.hpImage + hp));
    pohp.hpImage[hp] = new PIXI.Texture(ImageManager.loadPicture(pohp._)._baseTexture);
  }
  return pohp.hpImage[hp];
}

// show popup
pohp.showPopup = function() {
  if (!SceneManager._scene) {
    console.debug(TAG, 'scene not ready. skipped');
    return;
  }

  // Create hp popup if not exists
  if (!SceneManager._scene._SG_hpContainer) {
    console.debug(TAG, 'sprite creating')
    var container = new Sprite();
    SceneManager._scene._SG_hpContainer = container;
    if (pohp.param.horizontalAlign) {   // LEFT
      container.x = 0;
    } else {                            // RIGHT
      container.x = Graphics.width - container.width;
    }
  }
  // change image
  SceneManager._scene._SG_hpContainer.texture = pohp.getHpImage(pohp.getHp())
  SceneManager._scene._SG_hpContainer.alpha = 1;
  // show on screen
  if (!pohp.isShow) SceneManager._scene.addChild(SceneManager._scene._SG_hpContainer);
  pohp.isShow = true;
  pohp.popupExpire1At = Date.now() + pohp.param.popupDuration;
  pohp.popupExpire2At = pohp.popupExpire1At + pohp.param.fadeoutDuration;
};

// (force) hide popup
pohp.hidePopup = function() {
  if (!pohp.isShow) return;
  pohp.isShow = false;
  if (!SceneManager._scene || !SceneManager._scene._SG_hpContainer) return;
  SceneManager._scene.removeChild(SceneManager._scene._SG_hpContainer);
}

// Popup Key handle
pohp.onKeyPress = function(event) {
  var pohp = window.Sg.PoHp;
  if (event.key === pohp.param.popupKey) {
    console.debug(pohp.TAG, 'popupKey pressed')
    pohp.showPopup();
  }
}
if (pohp.param.popupKey != null) {
  window.addEventListener('keypress', pohp.onKeyPress);
}

// Automatic Popup handle
if (pohp.param.automaticPopup) {
  // @Override
  pohp.Game_Player_update = Game_Player.prototype.update;
  Game_Player.prototype.update = function () {
    pohp.Game_Player_update.apply(this, arguments);

    // detect hp change
    const hp = pohp.getHp();
    if (pohp.lastHp === undefined) {
      pohp.lastHp = hp;
    } else if (pohp.lastHp != hp) {
      pohp.lastHp = hp;
      try {
        pohp.showPopup();
      } catch (err) {
        console.error(TAG, err);
      }
    }
  }
}
