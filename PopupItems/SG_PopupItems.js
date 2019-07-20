//=============================================================================
// SemteulGaram Plugins - Popup Items
// SG_PopupItems.js
//=============================================================================

var Imported = Imported || {};
Imported.SG_PopupItems = true;

var Sg = window.Sg || {};
window.Sg = Sg;
Sg.PoIt = Sg.PoIt || {};
var poit = Sg.PoIt;
Sg.PoIt.version = 1;

const TAG = 'Sg.SG_PopupItems';
Sg.PoIt.TAG = TAG;

//=============================================================================
 /*:
 * @plugindesc v1.00 메뉴창을 열지 않고 아이템을 확인할 수 있게 해 줌
 * @author SemteulGaram
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
 * window.Sg.PoIt.showPopup();      팝업을 띄움
 * window.Sg.PoIt.hidePopup();      팝업을 닫음
 * window.Sg.PoIt.forceHidePopup(); 페이드 아웃 없이 팝업을 즉시 닫음
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

poit.Parameters = PluginManager.parameters('SG_PopupItems');
poit.param = poit.param || {};
poit.param._ = Boolean(poit.Parameters['NULL']);


var bitmap = ImageManager.loadSystem('IconSet');
    var pw = Window_Base._iconWidth;
    var ph = Window_Base._iconHeight;
    var sx = iconIndex % 16 * pw;
    var sy = Math.floor(iconIndex / 16) * ph;
    this.contents.blt(bitmap, sx, sy, pw, ph, x, y);

    /**
 * Performs a block transfer.
 *
 * @method blt
 * @param {Bitmap} source The bitmap to draw
 * @param {Number} sx The x coordinate in the source
 * @param {Number} sy The y coordinate in the source
 * @param {Number} sw The width of the source image
 * @param {Number} sh The height of the source image
 * @param {Number} dx The x coordinate in the destination
 * @param {Number} dy The y coordinate in the destination
 * @param {Number} [dw=sw] The width to draw the image in the destination
 * @param {Number} [dh=sh] The height to draw the image in the destination
 */
Bitmap.prototype.blt = function(source, sx, sy, sw, sh, dx, dy, dw, dh) {
    dw = dw || sw;
    dh = dh || sh;
    if (sx >= 0 && sy >= 0 && sw > 0 && sh > 0 && dw > 0 && dh > 0 &&
            sx + sw <= source.width && sy + sh <= source.height) {
        this._context.globalCompositeOperation = 'source-over';
        this._context.drawImage(source._canvas, sx, sy, sw, sh, dx, dy, dw, dh);
        this._setDirty();
    }
};
