(function() {
    var a = false, b = /xyz/.test(function() {
        xyz
    }) ? /\b_super\b/ : /.*/;
    this.Class = function() {
    };
    Class.extend = function(h) {
        var g = this.prototype;
        a = true;
        var f = new this();
        a = false;
        for (var e in h) {
            f[e] = typeof h[e] == "function" && typeof g[e] == "function" && b.test(h[e]) ? (function(i, j) {
                return function() {
                    var l = this._super;
                    this._super = g[i];
                    var k = j.apply(this, arguments);
                    this._super = l;
                    return k
                }
            })(e, h[e]) : h[e]
        }
        function d() {
            if (!a && this.init) {
                this.init.apply(this, arguments)
            }
        }
        d.prototype = f;
        d.constructor = d;
        d.extend = arguments.callee;
        return d
    }
})();
(function(a) {
    a.plugin = function(d, b) {
        a.fn[d] = function(f) {
            var e = Array.prototype.slice.call(arguments, 1);
            return this.each(function() {
                var g = a.data(this, d);
                if (g) {
                    g[f].apply(g, e)
                } else {
                    g = a.data(this, d, new b(f, this))
                }
            })
        }
    }
}(jQuery));