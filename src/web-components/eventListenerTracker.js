(function () {
  const originalAddEventListener = Element.prototype.addEventListener;
  const eventListenerMap = new WeakMap();

  Element.prototype.addEventListener = function (type, listener, options) {
    if (!eventListenerMap.has(this)) {
      eventListenerMap.set(this, []);
    }
    eventListenerMap.get(this).push({ type, listener, options });
    originalAddEventListener.call(this, type, listener, options);
  };

  Element.prototype.getEventListeners = function () {
    return eventListenerMap.get(this) || [];
  };
})();
