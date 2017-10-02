$(document).foundation();

/* Main nav */
;(function () {
  function MobNav(o) {
    var cfg = extend({
        menu: '.mob-nav',
        activeClass: 'mob-nav-opened',
        opener: '.mob-nav-opener',
        swipe: 'swiperight',
        overlayClass: 'overlay',
        closeOnOutsideClick: true,
        onInit: function () {},
        onOpen: function () {},
        onClose: function () {}
      }, o),
      menu = document.querySelector(cfg.menu),
      openers = Array.prototype.slice.call(document.querySelectorAll(cfg.opener)),
      body = document.body,
      isOpened = false,
      busy = false,
      overlayElement, hm;

    function init() {
      // prepare overlay
      typeof cfg.overlayClass === 'string' && (overlayElement = createOverlay(cfg.overlayClass));

      // init events
      openers.forEach(function (opener) {
        opener.addEventListener('click', openerHandler, false);
      });

      hm = new Hammer(menu, {});
      hm.on(cfg.swipe, close);

      cfg.onInit(menu);
    }

    if(MobNav.transitionEndEvent) {
      var open = function () {
        if(isOpened || busy) return;

        menu.addEventListener(MobNav.transitionEndEvent, function f() {
          isOpened = true;
          menu.removeEventListener(MobNav.transitionEndEvent, f);
          cfg.closeOnOutsideClick && document.addEventListener('click', docHandler, false);
          busy = false;
          cfg.onOpen(menu);
        }, false);

        overlayElement && body.appendChild(overlayElement);
        addClass(body, cfg.activeClass);
        busy = true;
      },
      close = function () {
        if(!isOpened || busy) return;

        menu.addEventListener(MobNav.transitionEndEvent, function f() {
          isOpened = false;
          overlayElement && body.removeChild(overlayElement);
          menu.removeEventListener(MobNav.transitionEndEvent, f);
          cfg.closeOnOutsideClick && document.removeEventListener('click', docHandler);
          busy = false;
          cfg.onClose(menu);
        }, false);

        removeClass(body, cfg.activeClass);
        busy = true;
      };
    }
    else {
      var open = function () {
        if(isOpened) return;
        isOpened = true;

        overlayElement && body.appendChild(overlayElement);
        addClass(body, cfg.activeClass);
        setTimeout(function () {
          cfg.closeOnOutsideClick && document.addEventListener('click', docHandler, false);
        }, 25);
        cfg.onOpen(menu);
      },
      close = function () {
        if(!isOpened) return;
        isOpened = false;

        overlayElement && body.removeChild(overlayElement);
        removeClass(body, cfg.activeClass);
        cfg.closeOnOutsideClick && document.removeEventListener('click', docHandler);
        cfg.onClose(menu);
      };
    }

    function toggle() {
      isOpened ? close() : open();
    }

    function destroy() {
      openers.forEach(function (opener) {
        opener.removeEventListener('click', openerHandler);
      });

      hm.off(cfg.swipe, close);

      overlayElement && body.removeChild(overlayElement);
      cfg.closeOnOutsideClick && document.removeEventListener('click', docHandler);
      removeClass(body, cfg.activeClass);
    }

    function createOverlay(cls) {
      var el = document.createElement('div');
      el.className = cls;
      return el;
    }

    function docHandler(e) {
      !menu.contains(e.target) && close();
    }

    function openerHandler(e) {
      e.preventDefault();
      toggle();
    }

    // utils

    function addClass(el, cls) {
      var c = el.className ? el.className.split(' ') : [];
      for(var i = c.length - 1; i >= 0; i--) if(c[i] === cls) return;
      c.push(cls);
      el.className = c.join(' ');
    }

    function removeClass(el, cls) {
      var c = el.className.split(' ');
      for(var i = 0; i < c.length; i++) if(c[i] === cls) c.splice(i--, 1);
      el.className = c.join(' ');
    }

    function extend(obj1, obj2) {
      for(var key in obj2) {
        obj1[key] = obj2[key];
      }
      return obj1;
    }

    init();

    // public

    return {
      open: open,
      close: close,
      toggle: toggle,
      destroy: destroy
    }
  }

  MobNav.transitionEndEvent = (function () {
    var t;
    var el = document.createElement('div');
    var transitions = {
      'transition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd'
    }

    for(t in transitions) {
      if(el.style[t] !== undefined) {
        return transitions[t];
      }
    }

    return false;
  })();

  window.MobNav = MobNav;

  new MobNav({
    menu: '.main-menu',
    opener: '.main-menu-opener',
    activeClass: 'menu-opened',
    overlayClass: 'page-overlay'
  });

  var accMobMenu, accDropMenu;
  initAccMenu();

  function initAccMenu() {
    if(Foundation.MediaQuery.current === 'small' || Foundation.MediaQuery.current === 'medium') {
      accMobMenu = new Foundation.AccordionMenu($('.main-menu .menu'));
      accDropMenu = new Foundation.AccordionMenu($('.menu-drop'));
    }
    else {
      if(accMobMenu) {
        accMobMenu.$element.foundation('destroy');
        accMobMenu = null;

        accDropMenu = new Foundation.AccordionMenu($('.menu-drop'));
      }
      else if(!accDropMenu) {
        accDropMenu = new Foundation.AccordionMenu($('.menu-drop'));
      }
    }
  }

  $(window).on('changed.zf.mediaquery', initAccMenu);
})();