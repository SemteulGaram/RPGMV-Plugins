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

  class ItemList {
    constructor(options = {}) {
      this._currentPage = 0;
      this._pageCount = 0;

      this._currentCursor = 0;
      this._maxItemPerPage = options.maxItemPerPage || 6;

      this._list = [];

      this._containerSprite = options.containerSprite || new Sprite();
    }

    _createItemInstance(item) {
      const frameSprite = new Sprite();
      frameSprite.width = 64;
      frameSprite.height = 64;

      const bgBitmap = new Bitmap(64, 64);
      const bgContext = bgBitmap.context;
      const bgSprite = new Sprite(bgBitmap);
      bgSprite.anchor.x = 0.5;
      bgSprite.anchor.y = 0.5;
      frameSprite.addChild(bgSprite);

      const itemSprite = poit._getIconSpriteFromIndex(item.data.iconIndex);
      itemSprite.anchor.x = 0.5;
      itemSprite.anchor.y = 0.5;
      frameSprite.addChild(itemSprite);

      const coverBitmap = new Bitmap(64, 64);
      const coverContext = coverBitmap.context;
      if (item.count !== 1) {   // 아이템 갯수가 1이 아닐경우에만 화면에 표시
        coverContext.fillStyle = 'white';
        coverContext.shadowColor = 'black';
        coverContext.shadowBlur = 5;
        coverContext.textAlign = 'center';
        coverContext.textBaseline = 'middle';
        coverContext.font = '16px GameFont';
        coverContext.fillText('' + item.count, 48, 48);
      }
      const coverSprite = new Sprite(coverBitmap);
      coverSprite.anchor.x = 0.5;
      coverSprite.anchor.y = 0.5;
      frameSprite.addChild(coverSprite);

      return {
        item,
        frameSprite,
        bgBitmap,
        bgContext,
        bgSprite,
        itemSprite,
        coverBitmap,
        coverContext,
        coverSprite
      };
    }

    _cursorDraw(index) {
      console.debug(poit.TAG, 'cursorDraw:', index);
      const item = this._list[index];
      if (!item) return;
      item.bgContext.fillStyle = '#FF0000';
      item.bgContext.fillRect(8, 8, item.bgBitmap.width - 16, item.bgBitmap.height - 16);
      item.bgBitmap.baseTexture.update();
    }

    _cursorErase(index) {
      console.debug(poit.TAG, 'cursorErase:', index);
      const item = this._list[index];
      if (!item) return;
      item.bgContext.clearRect(0, 0, item.bgBitmap.width, item.bgBitmap.height);
      item.bgBitmap.baseTexture.update();
    }

    _pageDraw() {
      console.debug(poit.TAG, 'pageDraw:', this._currentPage);
      this._containerSprite.removeChildren();
      const currentPageIndex = this._currentPage * this._maxItemPerPage;
      var itemSprite = null;
      var i = null;
      for (i = 0; i < this._maxItemPerPage; i++) {
        if (currentPageIndex + i >= this._list.length) break;
        itemSprite = this._list[currentPageIndex + i].frameSprite;
        itemSprite.anchor.x = 0.5;
        itemSprite.anchor.y = 0.5;
        itemSprite.x = i * 64 + 100 + 16;
        itemSprite.y = 32 + 16;
        this._containerSprite.addChild(itemSprite);
      }

      // 아이템 개수가 한 페이지를 넘어가면 무조건 최대 크기로 그리기
      poit._drawWindow(this._list.length >= this._maxItemPerPage
        ? this._maxItemPerPage*64 : (i*64), 96);
    }

    getCursorItem() {
      return this._list[this.getIndex()];
    }

    getIndex() {
      return this._currentPage*this._maxItemPerPage + this._currentCursor;
    }

    setIndex(index) {
      console.debug(poit.TAG, 'setIndex:', index);
      if (this.getLength() === 0) return;
      if (index >= this.getLength()) {
        const err = new Error('Invalid index: ' + index);
        err.code = 'ERR_INVALID_INDEX';
        throw err;
      }
      const newPage = this.getPageFromIndex(index);
      const newCursor = this.getCursorFromIndex(index);

      this._cursorErase(this.getIndex());
      this._cursorDraw(index);
      this._currentCursor = this.getCursorFromIndex(index);

      if (newPage !== this._currentPage) {
        this._currentPage = newPage;
        this._pageDraw();
      }
    }

    getLength() {
      return this._list.length;
    }

    getPageFromIndex(index) {
      return parseInt(index/this._maxItemPerPage);
    }

    getCursorFromIndex(index) {
      return index % this._maxItemPerPage;
    }

    cursorSelect(index) {
      return this.setIndex(index);
    }

    cursorNext() {
      if (this.getLength() === 0) return;

      var nextIndex = this.getIndex() + 1;
      if (nextIndex >= this.getLength()) nextIndex = 0;

      this.setIndex(nextIndex);
    }

    cursorPrev() {
      if (this.getLength() === 0) return;

      var nextIndex = this.getIndex() - 1;
      if (nextIndex < 0) nextIndex = this.getLength() - 1;

      this.setIndex(nextIndex);
    }

    cursorUse() {
      if (this.getLength() === 0) return;
      // TODO: use item
    }

    pageNext() {
      this._currentPage++;
      if (this._currentPage >= this._pageCount) this._currentPage = 0;
      this._pageDraw();
    }

    pagePrev() {
      this._currentPage--;
      if (this._currentPage < 0) this._currentPage = this._pageCount - 1;
      this._pageDraw();
    }

    update() {
      const items = poit._getPlayerItemList();

      this._pageCount = parseInt(Math.ceil(items.length/this._maxItemPerPage));
      if (this._currentPage >= this._pageCount) this._currentPage = this._pageCount - 1;

      this._list = [];
      for (var i = 0; i < items.length; i++) {
        this._list[i] = this._createItemInstance(items[i]);
      }
      this._pageDraw();
      this.setIndex(this.getIndex());
    }
  }

  // is sprite on scene (untrustable)
  poit.isShow = false;
  // temp variable
  poit.lastTiming = null;
  // temp variable
  poit.lastAfter = null;
  // temp variable
  poit.lastPct = null;
  /* status:
   * - 0(0b00): disappear
   * - 1(0b01): disappering
   * - 2(0b10): appear
   * - 3(0b11): appearing
   */
  poit.step = 0;
  // sprite data container
  poit.container = {};
  poit.itemList = new ItemList({
    // TODO: max item per page
  });

  poit.SHOW_DURATION = 250;
  poit.HIDE_DURATION = 250;

  // Scene ticking
  poit.SceneManager_update = SceneManager.update;
  SceneManager.update = function() {
    const poit = window.Sg.PoIt;
    poit.SceneManager_update.apply(this, arguments);
    try {
      // handle ticking
      if (!poit.isShow || !SceneManager._scene._SG_item) return;
      switch (poit.step) {
        default:
          console.error(poit.TAG, 'WILL NOT HAPPEN> unknown step:', poit.step);
          poit.hideItemWindowNow();
        break; case 0:
          // do nothing
        break; case 3:
          poit.lastAfter = Date.now() - poit.lastTiming;
          if (poit.lastAfter < poit.SHOW_DURATION) {
            poit.lastPct = 1 - Math.pow(1 - poit.lastAfter/poit.SHOW_DURATION, 3);
            poit.container.sprite.x = Graphics.width
              - poit.container.sprite.width*poit.lastPct;
            poit.container.sprite.alpha = poit.lastPct;
          } else {
            poit.container.sprite.x = Graphics.width
              - poit.container.sprite.width;
            poit.container.sprite.alpha = 1;
            poit.step = 2;
          }
        break; case 2:
          // do nothing
        break; case 1:
          poit.lastAfter = Date.now() - poit.lastTiming;
          if (poit.lastAfter < poit.HIDE_DURATION) {
            poit.lastPct = 1 - Math.pow(poit.lastAfter/poit.HIDE_DURATION, 3);
            poit.container.sprite.x = Graphics.width
              - poit.container.sprite.width*poit.lastPct;
            poit.container.sprite.alpha = poit.lastPct;
          } else {
            poit.hideItemWindowNow();
          }
        break;
      }
      // TODO
      // switch (poit.step) {}
    } catch (err) {
      console.error(poit.TAG, err);
    }
  }

  // key handle
  poit.onKeyDown = function(event) {
    const poit = window.Sg.PoIt;
    switch (event.key) {
      default:
        if (poit.step & 0b10) {
          event.stopImmediatePropagation();
        }
      break; case poit.param.itemWindowKey:
        console.debug(poit.TAG, 'itemWindowKey down');
        if (poit.step & 0b10) {
          if (poit.hideItemWindow()) {
            poit.showItemWindow();
          }
        } else {
          poit.showItemWindow();
        }
        event.stopImmediatePropagation();
      break; case 'Escape':
        if (poit.step & 0b10) {
          poit.hideItemWindow();
          event.stopImmediatePropagation();
        }
      break; case 'ArrowLeft':
        if (poit.step & 0b10) {
          poit.itemList.cursorPrev();
          event.stopImmediatePropagation();
        }
      break; case 'ArrowRight':
        if (poit.step & 0b10) {
          poit.itemList.cursorNext();
          event.stopImmediatePropagation();
        }
      break; case 'Enter':
        if (poit.step & 0b10) {
          poit.itemList.cursorUse();
          event.stopImmediatePropagation();
        }
      break;
    }
  }

  if (poit.param.itemWindowKey != null) {
    console.debug(poit.TAG, 'itemWindowKey registered> key:',
      poit.param.itemWindowKey);
    window.addEventListener('keydown', poit.onKeyDown, { capture: true });
  }

  // internal function
  poit._getPlayerItemList = function() {
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

  poit._getIconSpriteFromIndex = function(index) {
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

  poit._ensureWindowTextureCanvas = function() {
    if (!poit.container.canvas) {
      console.debug(poit.TAG, 'create window texture canvas');
      poit.container.canvas = document.createElement('canvas');
      poit.container.canvas.style.display = 'none';
      poit.container.ctx = poit.container.canvas.getContext('2d');
    }
    return poit.container.canvas;
  };

  poit._drawWindowTextureCanvas = function(width, height) {
    const canvas = poit._ensureWindowTextureCanvas();
    const ctx = poit.container.ctx;
    const fadeWidth = 100;

    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    if (fadeWidth + width > Graphics.width) { // draw fullwidth
      canvas.width = Graphics.width;
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, Graphics.width, height);
      return true;
    } else {
      canvas.width = width + fadeWidth;
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#000000';
      const grd = ctx.createLinearGradient(0, 0, fadeWidth, 0);
      grd.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grd.addColorStop(1, 'rgba(0, 0, 0, 1)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, fadeWidth, height);

      ctx.fillStyle = '#000000';
      ctx.fillRect(fadeWidth, 0, width, height);
      return false;
    }
  };

  poit._ensureWindowTexture = function() {
    if (!poit.container.texture) {
      poit.container.texture
        = PIXI.Texture.fromCanvas(poit._ensureWindowTextureCanvas());
    }
    return poit.container.texture;
  };

  poit._drawWindow = function(width, height) {
    poit.container.sprite.width = width + 100;
    poit.container.sprite.height = height;
    const result = poit._drawWindowTextureCanvas(width, height);
    poit._ensureWindowTexture().baseTexture.update();
    return result;
  };

  // window handle function
  poit.showItemWindow = function() {
    // check current scene available
    if (!SceneManager._scene) {
      console.debug(poit.TAG, 'scene not ready. skipped');
      return false;
    }

    var containerSprite = null
    // Create item window create
    if (!SceneManager._scene._SG_item) {
      console.debug(poit.TAG, 'sprite creating');
      poit.isShow = false;
      containerSprite = poit.itemList._containerSprite;
      poit.container.sprite = containerSprite;
      SceneManager._scene._SG_item = containerSprite;
      containerSprite.texture = poit._ensureWindowTexture();
    } else {
      containerSprite = SceneManager._scene._SG_item;
    }
    poit.itemList.update();

    if (!poit.isShow){
      containerSprite.x = Graphics.width;
      containerSprite.y = Graphics.height - containerSprite.height;
      SceneManager._scene.addChild(containerSprite);
    }
    poit.isShow = true;
    // animation start
    poit.lastTiming = Date.now();
    poit.step = 3;
  };

  poit.hideItemWindow = function() {
    if (!(poit.step & 0b10)) return false;
    if (!SceneManager._scene._SG_item) {
      poit.hideItemWindowNow();
      return true;
    }
    // animation start
    poit.lastTiming = Date.now();
    poit.step = 1;
    return false;
  };

  poit.hideItemWindowNow = function() {
    poit.step = 0;
    if (!poit.isShow) return;
    poit.isShow = false;
    if (!SceneManager._scene._SG_item) return;
    SceneManager._scene.removeChild(SceneManager._scene._SG_item);
  }

})();
