(function() {
"use strict";

var deleteDb = function() {
  window.indexedDB.deleteDatabase("async_local_storage");
};

var t = doh;
var storage = navigator.storage;
var log = console.log.bind(console);

t.registerGroup("async-local-storage", [
  function sanity() {
    t.is("object",   typeof storage);
    t.is("function", typeof storage.has);
    t.is("function", typeof storage.set);
    t.is("function", typeof storage.delete);
    t.is("function", typeof storage.clear);
    t.is("function", typeof storage.forEach);
  },

  function clear() {
    var d = new doh.Deferred();
    storage.clear().done(function() { d.callback(); });
    return d;
  },

  function set() {
    var d = new doh.Deferred();
    storage.set("foo", "bar").
      then(storage.get.bind(storage, "foo")).
      done(d.callback.bind(d));
    return d;
  },

  function clear_with_items() {
    var d = new doh.Deferred();
    storage.set("foo", "bar").
      then(function() {
        storage.has("foo").done(function(v) {
          t.t(!!v);
          storage.clear().then(function() {
            storage.count().then(function(c) {
              storage.has("foo").done(function(value) {
                t.is(false, value);
                d.callback();
              });
            })
          });
        });
      });
    return d;
  },

  function get() {
    var d = new doh.Deferred();
    var key = "thinger";
    var value = "blarg";
    storage.set(key, value).then(function() {
      storage.get(key).done(function(v) {
        t.is(value, v);
        d.callback();
      });
    });
    return d;
  },

  function has() {
    var d = new doh.Deferred();
    var key = "thinger";
    var value = "blarg";
    storage.clear().done(function() {
      storage.set(key, value).then(function() {
        storage.has(key).done(function(v) {
          t.is("boolean", typeof v);
          t.is(true, v);
        });
      }).
      then(function() {
        storage.has("thing that doesn't exist").done(function(v) {
          t.is("boolean", typeof v);
          t.is(false, v);
          d.callback();
        });
      });
    });
    return d;
  },

  function del() {
    var d = new doh.Deferred();
    var key = "thinger";
    var value = "blarg";
    storage.clear().done(function() {
      storage.set(key, value).then(function() {
        storage.has(key).done(function(v) {
          t.is("boolean", typeof v);
          t.is(true, v);
        });
      }).
      then(function() { return storage.delete(key); }).
      then(function() {
        storage.has(key).done(function(v) {
          t.is("boolean", typeof v);
          t.is(false, v);
          d.callback();
        });
      });
    });
    return d;
  },

  function forEach() {
    var d = new doh.Deferred();
    storage.clear().then(function() {
      storage.set("foo", "bar");
      return storage.set("thinger", "blarg");
    }).then(function() {
      return storage.count().then(function(c) {
        t.is(2, c);
      });
    }).then(function() {
      var count = 0;
      return storage.forEach(function() {
        count++;
      }).then(function() {
        t.is(count, 2);
        d.callback();
      });
    });
    return d;
  },

  function forEachThrows() {
    var d = new doh.Deferred();
    storage.clear().then(function() {
      storage.set("foo", "bar");
      return storage.set("thinger", "blarg");
    }).then(function() {
      return storage.count().then(function(c) {
        t.is(2, c);
      });
    }).then(function() {
      return storage.forEach(function() {
        throw new Error("synthetic");
      }).catch(function(e) {
        t.t(e instanceof Error);
      }).then(function() {
        storage.get("foo").done(function(v) {
          t.is("bar", v);
          d.callback();
        });
      });
    });
    return d;
  },
], deleteDb, deleteDb);

})();
