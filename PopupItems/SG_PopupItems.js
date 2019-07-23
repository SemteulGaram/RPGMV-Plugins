//=============================================================================
// SemteulGaram Plugins - Popup Items
// SG_PopupItems.js
//=============================================================================

var Imported = Imported || {};
Imported.SG_PopupItems = true;

window.Sg = window.Sg || {};
window.Sg.PoIt = window.Sg.PoIt || {};
window.Sg.PoIt.version = 1;

//=============================================================================
 /*:
 * @plugindesc v1.00 메뉴창을 열지 않고 아이템을 확인할 수 있게 해 줌
 * @author SemteulGaram
 *
 * @param Item Window Key
 * @desc 아이템창을 열 키 (예. a, Control, ArrowUp...)
 * @type string
 * @default a
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * 메뉴창을 열지 않고 아이템을 확인할 수 있게 해 줌
 *
 * ============================================================================
 * How to Use
 * ============================================================================
 *
 * 해당하는 명령어를 복사해서 [이벤트 명령] -> [스크립트]에 붙여넣기해서 사용
 *
 * window.Sg.PoIt.showItemWindow();       팝업을 띄움
 * window.Sg.PoIt.hideItemWindow();       팝업을 닫음
 * window.Sg.PoIt.hideItemWindowNow();    페이드 아웃 없이 팝업을 즉시 닫음
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

(function() {
  const poit = window.Sg.PoIt;

  const TAG = 'Sg.SG_PopupItems';
  Sg.PoIt.TAG = TAG;
  console.info(poit.TAG, 'load');

  poit.Parameters = PluginManager.parameters('SG_PopupItems');
  poit.param = poit.param || {};
  poit.param.itemWindowKey = poit.Parameters['Item Window Key'];

  poit.isShow = false;
  poit.lastTiming = null;
  // 0: disappear, 1: appearing, 2: appear, 3: disappering
  poit.step = 0;

  // Scene ticking
  poit.SceneManager_update = SceneManager.update;
  SceneManager.update = function() {
    const poit = window.Sg.PoIt;
    poit.SceneManager_update.apply(this, arguments);
    try {
      // handle ticking
      if (!poit.isShow) return;
      // TODO
      // switch (poit.step) {}
    } catch (err) {
      console.error(poit.TAG, err);
    }
  }

  // key handle
  poit.onKeyDown = function(event) {
    const poit = window.Sg.PoIt;
    if (event.key === poit.param.itemWindowKey) {
      console.debug(poit.TAG, 'itemWindowKey down');
      poit.showItemWindow();
    }
  }

  if (poit.param.itemWindowKey != null) {
    console.debug(poit.TAG, 'itemWindowKey registered> key:',
      poit.param.itemWindowKey);
    window.addEventListener('keydown', poit.onKeyDown, { capture: true });
  }

  // internal function
  poit._getPlayerItemList = function () {
    const items = [];
    if (!$gameParty || !$dataItems || !$gameParty._items
      || $gameParty._items.length === 0) return items;

    Object.keys($gameParty._items).forEach(key => {
      items.push({
        id: key,
        count: $gameParty._items[key],
        data: $dataItems[key]
      });
    });

    return items;
  }

  poit._getIconSpriteFromIndex = function (index) {
    const bitmap = new Bitmap(Window_Base._iconWidth, Window_Base._iconHeight);
    const iconSet = ImageManager.loadSystem('IconSet');
    const pw = Window_Base._iconWidth;
    const ph = Window_Base._iconHeight;
    const iconInRow = parseInt(iconSet.width / pw);
    const sx = index % iconInRow * pw;
    const sy = Math.floor(index / iconInRow) * ph;
    bitmap.blt(iconSet, sx, sy, pw, ph, 0, 0);

    return new Sprite(bitmap);
  };

  // window handle function
  poit.showItemWindow = function() {
    // check current scene available
    if (!SceneManager._scene) {
      console.debug(poit.TAG, 'scene not ready. skipped');
      return false;
    }

    var container = null
    // Create item window create
    if (!SceneManager._scene._SG_item) {
      console.debug(poit.TAG, 'sprite creating');
      container = new Sprite();
      SceneManager._scene._SG_item = container;
    } else {
      container = SceneManager._scene._SG_item;
      container.removeChildren();
    }

    const items = poit._getPlayerItemList();
    for (var i = 0; i < items.length; i++) {
      const itemSprite = poit._getIconSpriteFromIndex(items[i].data.iconIndex);
      itemSprite.x = i * 48;
      container.addChild(itemSprite);
    }

    // TODO: location
    // TODO: dynamic location change
    container.width = 200;
    container.height = 200;

    SceneManager._scene.addChild(container);

    // TODO: block key event
  };

  poit.hideItemWindow = function() {

  };

  poit.hideItemWindowNow = function() {}
})();
