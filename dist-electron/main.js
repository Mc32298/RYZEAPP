import * as He from "fs";
import St from "fs";
import kd from "constants";
import Ur from "stream";
import $o from "util";
import Dc from "assert";
import * as lt from "path";
import Le from "path";
import dn from "child_process";
import Oc from "events";
import tt from "crypto";
import Pc from "tty";
import kr from "os";
import Ot, { fileURLToPath as $d } from "url";
import * as cn from "electron";
import Ht from "electron";
import Fc from "zlib";
import Mo from "http";
import Md from "better-sqlite3";
var dt = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, $t = {}, bn = {}, Yr = {}, Ta;
function it() {
  return Ta || (Ta = 1, Yr.fromCallback = function(e) {
    return Object.defineProperty(function(...t) {
      if (typeof t[t.length - 1] == "function") e.apply(this, t);
      else
        return new Promise((r, n) => {
          t.push((o, s) => o != null ? n(o) : r(s)), e.apply(this, t);
        });
    }, "name", { value: e.name });
  }, Yr.fromPromise = function(e) {
    return Object.defineProperty(function(...t) {
      const r = t[t.length - 1];
      if (typeof r != "function") return e.apply(this, t);
      t.pop(), e.apply(this, t).then((n) => r(null, n), r);
    }, "name", { value: e.name });
  }), Yr;
}
var Cn, _a;
function qd() {
  if (_a) return Cn;
  _a = 1;
  var e = kd, t = process.cwd, r = null, n = process.env.GRACEFUL_FS_PLATFORM || process.platform;
  process.cwd = function() {
    return r || (r = t.call(process)), r;
  };
  try {
    process.cwd();
  } catch {
  }
  if (typeof process.chdir == "function") {
    var o = process.chdir;
    process.chdir = function(i) {
      r = null, o.call(process, i);
    }, Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, o);
  }
  Cn = s;
  function s(i) {
    e.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && d(i), i.lutimes || a(i), i.chown = l(i.chown), i.fchown = l(i.fchown), i.lchown = l(i.lchown), i.chmod = h(i.chmod), i.fchmod = h(i.fchmod), i.lchmod = h(i.lchmod), i.chownSync = f(i.chownSync), i.fchownSync = f(i.fchownSync), i.lchownSync = f(i.lchownSync), i.chmodSync = c(i.chmodSync), i.fchmodSync = c(i.fchmodSync), i.lchmodSync = c(i.lchmodSync), i.stat = p(i.stat), i.fstat = p(i.fstat), i.lstat = p(i.lstat), i.statSync = g(i.statSync), i.fstatSync = g(i.fstatSync), i.lstatSync = g(i.lstatSync), i.chmod && !i.lchmod && (i.lchmod = function(m, _, I) {
      I && process.nextTick(I);
    }, i.lchmodSync = function() {
    }), i.chown && !i.lchown && (i.lchown = function(m, _, I, N) {
      N && process.nextTick(N);
    }, i.lchownSync = function() {
    }), n === "win32" && (i.rename = typeof i.rename != "function" ? i.rename : (function(m) {
      function _(I, N, O) {
        var R = Date.now(), b = 0;
        m(I, N, function A(w) {
          if (w && (w.code === "EACCES" || w.code === "EPERM" || w.code === "EBUSY") && Date.now() - R < 6e4) {
            setTimeout(function() {
              i.stat(N, function(C, T) {
                C && C.code === "ENOENT" ? m(I, N, A) : O(w);
              });
            }, b), b < 100 && (b += 10);
            return;
          }
          O && O(w);
        });
      }
      return Object.setPrototypeOf && Object.setPrototypeOf(_, m), _;
    })(i.rename)), i.read = typeof i.read != "function" ? i.read : (function(m) {
      function _(I, N, O, R, b, A) {
        var w;
        if (A && typeof A == "function") {
          var C = 0;
          w = function(T, U, L) {
            if (T && T.code === "EAGAIN" && C < 10)
              return C++, m.call(i, I, N, O, R, b, w);
            A.apply(this, arguments);
          };
        }
        return m.call(i, I, N, O, R, b, w);
      }
      return Object.setPrototypeOf && Object.setPrototypeOf(_, m), _;
    })(i.read), i.readSync = typeof i.readSync != "function" ? i.readSync : /* @__PURE__ */ (function(m) {
      return function(_, I, N, O, R) {
        for (var b = 0; ; )
          try {
            return m.call(i, _, I, N, O, R);
          } catch (A) {
            if (A.code === "EAGAIN" && b < 10) {
              b++;
              continue;
            }
            throw A;
          }
      };
    })(i.readSync);
    function d(m) {
      m.lchmod = function(_, I, N) {
        m.open(
          _,
          e.O_WRONLY | e.O_SYMLINK,
          I,
          function(O, R) {
            if (O) {
              N && N(O);
              return;
            }
            m.fchmod(R, I, function(b) {
              m.close(R, function(A) {
                N && N(b || A);
              });
            });
          }
        );
      }, m.lchmodSync = function(_, I) {
        var N = m.openSync(_, e.O_WRONLY | e.O_SYMLINK, I), O = !0, R;
        try {
          R = m.fchmodSync(N, I), O = !1;
        } finally {
          if (O)
            try {
              m.closeSync(N);
            } catch {
            }
          else
            m.closeSync(N);
        }
        return R;
      };
    }
    function a(m) {
      e.hasOwnProperty("O_SYMLINK") && m.futimes ? (m.lutimes = function(_, I, N, O) {
        m.open(_, e.O_SYMLINK, function(R, b) {
          if (R) {
            O && O(R);
            return;
          }
          m.futimes(b, I, N, function(A) {
            m.close(b, function(w) {
              O && O(A || w);
            });
          });
        });
      }, m.lutimesSync = function(_, I, N) {
        var O = m.openSync(_, e.O_SYMLINK), R, b = !0;
        try {
          R = m.futimesSync(O, I, N), b = !1;
        } finally {
          if (b)
            try {
              m.closeSync(O);
            } catch {
            }
          else
            m.closeSync(O);
        }
        return R;
      }) : m.futimes && (m.lutimes = function(_, I, N, O) {
        O && process.nextTick(O);
      }, m.lutimesSync = function() {
      });
    }
    function h(m) {
      return m && function(_, I, N) {
        return m.call(i, _, I, function(O) {
          y(O) && (O = null), N && N.apply(this, arguments);
        });
      };
    }
    function c(m) {
      return m && function(_, I) {
        try {
          return m.call(i, _, I);
        } catch (N) {
          if (!y(N)) throw N;
        }
      };
    }
    function l(m) {
      return m && function(_, I, N, O) {
        return m.call(i, _, I, N, function(R) {
          y(R) && (R = null), O && O.apply(this, arguments);
        });
      };
    }
    function f(m) {
      return m && function(_, I, N) {
        try {
          return m.call(i, _, I, N);
        } catch (O) {
          if (!y(O)) throw O;
        }
      };
    }
    function p(m) {
      return m && function(_, I, N) {
        typeof I == "function" && (N = I, I = null);
        function O(R, b) {
          b && (b.uid < 0 && (b.uid += 4294967296), b.gid < 0 && (b.gid += 4294967296)), N && N.apply(this, arguments);
        }
        return I ? m.call(i, _, I, O) : m.call(i, _, O);
      };
    }
    function g(m) {
      return m && function(_, I) {
        var N = I ? m.call(i, _, I) : m.call(i, _);
        return N && (N.uid < 0 && (N.uid += 4294967296), N.gid < 0 && (N.gid += 4294967296)), N;
      };
    }
    function y(m) {
      if (!m || m.code === "ENOSYS")
        return !0;
      var _ = !process.getuid || process.getuid() !== 0;
      return !!(_ && (m.code === "EINVAL" || m.code === "EPERM"));
    }
  }
  return Cn;
}
var Nn, Ia;
function Bd() {
  if (Ia) return Nn;
  Ia = 1;
  var e = Ur.Stream;
  Nn = t;
  function t(r) {
    return {
      ReadStream: n,
      WriteStream: o
    };
    function n(s, i) {
      if (!(this instanceof n)) return new n(s, i);
      e.call(this);
      var d = this;
      this.path = s, this.fd = null, this.readable = !0, this.paused = !1, this.flags = "r", this.mode = 438, this.bufferSize = 64 * 1024, i = i || {};
      for (var a = Object.keys(i), h = 0, c = a.length; h < c; h++) {
        var l = a[h];
        this[l] = i[l];
      }
      if (this.encoding && this.setEncoding(this.encoding), this.start !== void 0) {
        if (typeof this.start != "number")
          throw TypeError("start must be a Number");
        if (this.end === void 0)
          this.end = 1 / 0;
        else if (typeof this.end != "number")
          throw TypeError("end must be a Number");
        if (this.start > this.end)
          throw new Error("start must be <= end");
        this.pos = this.start;
      }
      if (this.fd !== null) {
        process.nextTick(function() {
          d._read();
        });
        return;
      }
      r.open(this.path, this.flags, this.mode, function(f, p) {
        if (f) {
          d.emit("error", f), d.readable = !1;
          return;
        }
        d.fd = p, d.emit("open", p), d._read();
      });
    }
    function o(s, i) {
      if (!(this instanceof o)) return new o(s, i);
      e.call(this), this.path = s, this.fd = null, this.writable = !0, this.flags = "w", this.encoding = "binary", this.mode = 438, this.bytesWritten = 0, i = i || {};
      for (var d = Object.keys(i), a = 0, h = d.length; a < h; a++) {
        var c = d[a];
        this[c] = i[c];
      }
      if (this.start !== void 0) {
        if (typeof this.start != "number")
          throw TypeError("start must be a Number");
        if (this.start < 0)
          throw new Error("start must be >= zero");
        this.pos = this.start;
      }
      this.busy = !1, this._queue = [], this.fd === null && (this._open = r.open, this._queue.push([this._open, this.path, this.flags, this.mode, void 0]), this.flush());
    }
  }
  return Nn;
}
var Dn, Sa;
function Hd() {
  if (Sa) return Dn;
  Sa = 1, Dn = t;
  var e = Object.getPrototypeOf || function(r) {
    return r.__proto__;
  };
  function t(r) {
    if (r === null || typeof r != "object")
      return r;
    if (r instanceof Object)
      var n = { __proto__: e(r) };
    else
      var n = /* @__PURE__ */ Object.create(null);
    return Object.getOwnPropertyNames(r).forEach(function(o) {
      Object.defineProperty(n, o, Object.getOwnPropertyDescriptor(r, o));
    }), n;
  }
  return Dn;
}
var Xr, Aa;
function rt() {
  if (Aa) return Xr;
  Aa = 1;
  var e = St, t = qd(), r = Bd(), n = Hd(), o = $o, s, i;
  typeof Symbol == "function" && typeof Symbol.for == "function" ? (s = /* @__PURE__ */ Symbol.for("graceful-fs.queue"), i = /* @__PURE__ */ Symbol.for("graceful-fs.previous")) : (s = "___graceful-fs.queue", i = "___graceful-fs.previous");
  function d() {
  }
  function a(m, _) {
    Object.defineProperty(m, s, {
      get: function() {
        return _;
      }
    });
  }
  var h = d;
  if (o.debuglog ? h = o.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (h = function() {
    var m = o.format.apply(o, arguments);
    m = "GFS4: " + m.split(/\n/).join(`
GFS4: `), console.error(m);
  }), !e[s]) {
    var c = dt[s] || [];
    a(e, c), e.close = (function(m) {
      function _(I, N) {
        return m.call(e, I, function(O) {
          O || g(), typeof N == "function" && N.apply(this, arguments);
        });
      }
      return Object.defineProperty(_, i, {
        value: m
      }), _;
    })(e.close), e.closeSync = (function(m) {
      function _(I) {
        m.apply(e, arguments), g();
      }
      return Object.defineProperty(_, i, {
        value: m
      }), _;
    })(e.closeSync), /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && process.on("exit", function() {
      h(e[s]), Dc.equal(e[s].length, 0);
    });
  }
  dt[s] || a(dt, e[s]), Xr = l(n(e)), process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !e.__patched && (Xr = l(e), e.__patched = !0);
  function l(m) {
    t(m), m.gracefulify = l, m.createReadStream = me, m.createWriteStream = Z;
    var _ = m.readFile;
    m.readFile = I;
    function I(Q, de, we) {
      return typeof de == "function" && (we = de, de = null), Se(Q, de, we);
      function Se(De, Ne, Ie, v) {
        return _(De, Ne, function(E) {
          E && (E.code === "EMFILE" || E.code === "ENFILE") ? f([Se, [De, Ne, Ie], E, v || Date.now(), Date.now()]) : typeof Ie == "function" && Ie.apply(this, arguments);
        });
      }
    }
    var N = m.writeFile;
    m.writeFile = O;
    function O(Q, de, we, Se) {
      return typeof we == "function" && (Se = we, we = null), De(Q, de, we, Se);
      function De(Ne, Ie, v, E, q) {
        return N(Ne, Ie, v, function(P) {
          P && (P.code === "EMFILE" || P.code === "ENFILE") ? f([De, [Ne, Ie, v, E], P, q || Date.now(), Date.now()]) : typeof E == "function" && E.apply(this, arguments);
        });
      }
    }
    var R = m.appendFile;
    R && (m.appendFile = b);
    function b(Q, de, we, Se) {
      return typeof we == "function" && (Se = we, we = null), De(Q, de, we, Se);
      function De(Ne, Ie, v, E, q) {
        return R(Ne, Ie, v, function(P) {
          P && (P.code === "EMFILE" || P.code === "ENFILE") ? f([De, [Ne, Ie, v, E], P, q || Date.now(), Date.now()]) : typeof E == "function" && E.apply(this, arguments);
        });
      }
    }
    var A = m.copyFile;
    A && (m.copyFile = w);
    function w(Q, de, we, Se) {
      return typeof we == "function" && (Se = we, we = 0), De(Q, de, we, Se);
      function De(Ne, Ie, v, E, q) {
        return A(Ne, Ie, v, function(P) {
          P && (P.code === "EMFILE" || P.code === "ENFILE") ? f([De, [Ne, Ie, v, E], P, q || Date.now(), Date.now()]) : typeof E == "function" && E.apply(this, arguments);
        });
      }
    }
    var C = m.readdir;
    m.readdir = U;
    var T = /^v[0-5]\./;
    function U(Q, de, we) {
      typeof de == "function" && (we = de, de = null);
      var Se = T.test(process.version) ? function(Ie, v, E, q) {
        return C(Ie, De(
          Ie,
          v,
          E,
          q
        ));
      } : function(Ie, v, E, q) {
        return C(Ie, v, De(
          Ie,
          v,
          E,
          q
        ));
      };
      return Se(Q, de, we);
      function De(Ne, Ie, v, E) {
        return function(q, P) {
          q && (q.code === "EMFILE" || q.code === "ENFILE") ? f([
            Se,
            [Ne, Ie, v],
            q,
            E || Date.now(),
            Date.now()
          ]) : (P && P.sort && P.sort(), typeof v == "function" && v.call(this, q, P));
        };
      }
    }
    if (process.version.substr(0, 4) === "v0.8") {
      var L = r(m);
      k = L.ReadStream, z = L.WriteStream;
    }
    var $ = m.ReadStream;
    $ && (k.prototype = Object.create($.prototype), k.prototype.open = G);
    var F = m.WriteStream;
    F && (z.prototype = Object.create(F.prototype), z.prototype.open = ee), Object.defineProperty(m, "ReadStream", {
      get: function() {
        return k;
      },
      set: function(Q) {
        k = Q;
      },
      enumerable: !0,
      configurable: !0
    }), Object.defineProperty(m, "WriteStream", {
      get: function() {
        return z;
      },
      set: function(Q) {
        z = Q;
      },
      enumerable: !0,
      configurable: !0
    });
    var x = k;
    Object.defineProperty(m, "FileReadStream", {
      get: function() {
        return x;
      },
      set: function(Q) {
        x = Q;
      },
      enumerable: !0,
      configurable: !0
    });
    var j = z;
    Object.defineProperty(m, "FileWriteStream", {
      get: function() {
        return j;
      },
      set: function(Q) {
        j = Q;
      },
      enumerable: !0,
      configurable: !0
    });
    function k(Q, de) {
      return this instanceof k ? ($.apply(this, arguments), this) : k.apply(Object.create(k.prototype), arguments);
    }
    function G() {
      var Q = this;
      ge(Q.path, Q.flags, Q.mode, function(de, we) {
        de ? (Q.autoClose && Q.destroy(), Q.emit("error", de)) : (Q.fd = we, Q.emit("open", we), Q.read());
      });
    }
    function z(Q, de) {
      return this instanceof z ? (F.apply(this, arguments), this) : z.apply(Object.create(z.prototype), arguments);
    }
    function ee() {
      var Q = this;
      ge(Q.path, Q.flags, Q.mode, function(de, we) {
        de ? (Q.destroy(), Q.emit("error", de)) : (Q.fd = we, Q.emit("open", we));
      });
    }
    function me(Q, de) {
      return new m.ReadStream(Q, de);
    }
    function Z(Q, de) {
      return new m.WriteStream(Q, de);
    }
    var ye = m.open;
    m.open = ge;
    function ge(Q, de, we, Se) {
      return typeof we == "function" && (Se = we, we = null), De(Q, de, we, Se);
      function De(Ne, Ie, v, E, q) {
        return ye(Ne, Ie, v, function(P, Te) {
          P && (P.code === "EMFILE" || P.code === "ENFILE") ? f([De, [Ne, Ie, v, E], P, q || Date.now(), Date.now()]) : typeof E == "function" && E.apply(this, arguments);
        });
      }
    }
    return m;
  }
  function f(m) {
    h("ENQUEUE", m[0].name, m[1]), e[s].push(m), y();
  }
  var p;
  function g() {
    for (var m = Date.now(), _ = 0; _ < e[s].length; ++_)
      e[s][_].length > 2 && (e[s][_][3] = m, e[s][_][4] = m);
    y();
  }
  function y() {
    if (clearTimeout(p), p = void 0, e[s].length !== 0) {
      var m = e[s].shift(), _ = m[0], I = m[1], N = m[2], O = m[3], R = m[4];
      if (O === void 0)
        h("RETRY", _.name, I), _.apply(null, I);
      else if (Date.now() - O >= 6e4) {
        h("TIMEOUT", _.name, I);
        var b = I.pop();
        typeof b == "function" && b.call(null, N);
      } else {
        var A = Date.now() - R, w = Math.max(R - O, 1), C = Math.min(w * 1.2, 100);
        A >= C ? (h("RETRY", _.name, I), _.apply(null, I.concat([O]))) : e[s].push(m);
      }
      p === void 0 && (p = setTimeout(y, 0));
    }
  }
  return Xr;
}
var Ra;
function rr() {
  return Ra || (Ra = 1, (function(e) {
    const t = it().fromCallback, r = rt(), n = [
      "access",
      "appendFile",
      "chmod",
      "chown",
      "close",
      "copyFile",
      "fchmod",
      "fchown",
      "fdatasync",
      "fstat",
      "fsync",
      "ftruncate",
      "futimes",
      "lchmod",
      "lchown",
      "link",
      "lstat",
      "mkdir",
      "mkdtemp",
      "open",
      "opendir",
      "readdir",
      "readFile",
      "readlink",
      "realpath",
      "rename",
      "rm",
      "rmdir",
      "stat",
      "symlink",
      "truncate",
      "unlink",
      "utimes",
      "writeFile"
    ].filter((o) => typeof r[o] == "function");
    Object.assign(e, r), n.forEach((o) => {
      e[o] = t(r[o]);
    }), e.exists = function(o, s) {
      return typeof s == "function" ? r.exists(o, s) : new Promise((i) => r.exists(o, i));
    }, e.read = function(o, s, i, d, a, h) {
      return typeof h == "function" ? r.read(o, s, i, d, a, h) : new Promise((c, l) => {
        r.read(o, s, i, d, a, (f, p, g) => {
          if (f) return l(f);
          c({ bytesRead: p, buffer: g });
        });
      });
    }, e.write = function(o, s, ...i) {
      return typeof i[i.length - 1] == "function" ? r.write(o, s, ...i) : new Promise((d, a) => {
        r.write(o, s, ...i, (h, c, l) => {
          if (h) return a(h);
          d({ bytesWritten: c, buffer: l });
        });
      });
    }, typeof r.writev == "function" && (e.writev = function(o, s, ...i) {
      return typeof i[i.length - 1] == "function" ? r.writev(o, s, ...i) : new Promise((d, a) => {
        r.writev(o, s, ...i, (h, c, l) => {
          if (h) return a(h);
          d({ bytesWritten: c, buffers: l });
        });
      });
    }), typeof r.realpath.native == "function" ? e.realpath.native = t(r.realpath.native) : process.emitWarning(
      "fs.realpath.native is not a function. Is fs being monkey-patched?",
      "Warning",
      "fs-extra-WARN0003"
    );
  })(bn)), bn;
}
var Kr = {}, On = {}, ba;
function jd() {
  if (ba) return On;
  ba = 1;
  const e = Le;
  return On.checkPath = function(r) {
    if (process.platform === "win32" && /[<>:"|?*]/.test(r.replace(e.parse(r).root, ""))) {
      const o = new Error(`Path contains invalid characters: ${r}`);
      throw o.code = "EINVAL", o;
    }
  }, On;
}
var Ca;
function Gd() {
  if (Ca) return Kr;
  Ca = 1;
  const e = /* @__PURE__ */ rr(), { checkPath: t } = /* @__PURE__ */ jd(), r = (n) => {
    const o = { mode: 511 };
    return typeof n == "number" ? n : { ...o, ...n }.mode;
  };
  return Kr.makeDir = async (n, o) => (t(n), e.mkdir(n, {
    mode: r(o),
    recursive: !0
  })), Kr.makeDirSync = (n, o) => (t(n), e.mkdirSync(n, {
    mode: r(o),
    recursive: !0
  })), Kr;
}
var Pn, Na;
function yt() {
  if (Na) return Pn;
  Na = 1;
  const e = it().fromPromise, { makeDir: t, makeDirSync: r } = /* @__PURE__ */ Gd(), n = e(t);
  return Pn = {
    mkdirs: n,
    mkdirsSync: r,
    // alias
    mkdirp: n,
    mkdirpSync: r,
    ensureDir: n,
    ensureDirSync: r
  }, Pn;
}
var Fn, Da;
function jt() {
  if (Da) return Fn;
  Da = 1;
  const e = it().fromPromise, t = /* @__PURE__ */ rr();
  function r(n) {
    return t.access(n).then(() => !0).catch(() => !1);
  }
  return Fn = {
    pathExists: e(r),
    pathExistsSync: t.existsSync
  }, Fn;
}
var xn, Oa;
function xc() {
  if (Oa) return xn;
  Oa = 1;
  const e = rt();
  function t(n, o, s, i) {
    e.open(n, "r+", (d, a) => {
      if (d) return i(d);
      e.futimes(a, o, s, (h) => {
        e.close(a, (c) => {
          i && i(h || c);
        });
      });
    });
  }
  function r(n, o, s) {
    const i = e.openSync(n, "r+");
    return e.futimesSync(i, o, s), e.closeSync(i);
  }
  return xn = {
    utimesMillis: t,
    utimesMillisSync: r
  }, xn;
}
var Ln, Pa;
function nr() {
  if (Pa) return Ln;
  Pa = 1;
  const e = /* @__PURE__ */ rr(), t = Le, r = $o;
  function n(f, p, g) {
    const y = g.dereference ? (m) => e.stat(m, { bigint: !0 }) : (m) => e.lstat(m, { bigint: !0 });
    return Promise.all([
      y(f),
      y(p).catch((m) => {
        if (m.code === "ENOENT") return null;
        throw m;
      })
    ]).then(([m, _]) => ({ srcStat: m, destStat: _ }));
  }
  function o(f, p, g) {
    let y;
    const m = g.dereference ? (I) => e.statSync(I, { bigint: !0 }) : (I) => e.lstatSync(I, { bigint: !0 }), _ = m(f);
    try {
      y = m(p);
    } catch (I) {
      if (I.code === "ENOENT") return { srcStat: _, destStat: null };
      throw I;
    }
    return { srcStat: _, destStat: y };
  }
  function s(f, p, g, y, m) {
    r.callbackify(n)(f, p, y, (_, I) => {
      if (_) return m(_);
      const { srcStat: N, destStat: O } = I;
      if (O) {
        if (h(N, O)) {
          const R = t.basename(f), b = t.basename(p);
          return g === "move" && R !== b && R.toLowerCase() === b.toLowerCase() ? m(null, { srcStat: N, destStat: O, isChangingCase: !0 }) : m(new Error("Source and destination must not be the same."));
        }
        if (N.isDirectory() && !O.isDirectory())
          return m(new Error(`Cannot overwrite non-directory '${p}' with directory '${f}'.`));
        if (!N.isDirectory() && O.isDirectory())
          return m(new Error(`Cannot overwrite directory '${p}' with non-directory '${f}'.`));
      }
      return N.isDirectory() && c(f, p) ? m(new Error(l(f, p, g))) : m(null, { srcStat: N, destStat: O });
    });
  }
  function i(f, p, g, y) {
    const { srcStat: m, destStat: _ } = o(f, p, y);
    if (_) {
      if (h(m, _)) {
        const I = t.basename(f), N = t.basename(p);
        if (g === "move" && I !== N && I.toLowerCase() === N.toLowerCase())
          return { srcStat: m, destStat: _, isChangingCase: !0 };
        throw new Error("Source and destination must not be the same.");
      }
      if (m.isDirectory() && !_.isDirectory())
        throw new Error(`Cannot overwrite non-directory '${p}' with directory '${f}'.`);
      if (!m.isDirectory() && _.isDirectory())
        throw new Error(`Cannot overwrite directory '${p}' with non-directory '${f}'.`);
    }
    if (m.isDirectory() && c(f, p))
      throw new Error(l(f, p, g));
    return { srcStat: m, destStat: _ };
  }
  function d(f, p, g, y, m) {
    const _ = t.resolve(t.dirname(f)), I = t.resolve(t.dirname(g));
    if (I === _ || I === t.parse(I).root) return m();
    e.stat(I, { bigint: !0 }, (N, O) => N ? N.code === "ENOENT" ? m() : m(N) : h(p, O) ? m(new Error(l(f, g, y))) : d(f, p, I, y, m));
  }
  function a(f, p, g, y) {
    const m = t.resolve(t.dirname(f)), _ = t.resolve(t.dirname(g));
    if (_ === m || _ === t.parse(_).root) return;
    let I;
    try {
      I = e.statSync(_, { bigint: !0 });
    } catch (N) {
      if (N.code === "ENOENT") return;
      throw N;
    }
    if (h(p, I))
      throw new Error(l(f, g, y));
    return a(f, p, _, y);
  }
  function h(f, p) {
    return p.ino && p.dev && p.ino === f.ino && p.dev === f.dev;
  }
  function c(f, p) {
    const g = t.resolve(f).split(t.sep).filter((m) => m), y = t.resolve(p).split(t.sep).filter((m) => m);
    return g.reduce((m, _, I) => m && y[I] === _, !0);
  }
  function l(f, p, g) {
    return `Cannot ${g} '${f}' to a subdirectory of itself, '${p}'.`;
  }
  return Ln = {
    checkPaths: s,
    checkPathsSync: i,
    checkParentPaths: d,
    checkParentPathsSync: a,
    isSrcSubdir: c,
    areIdentical: h
  }, Ln;
}
var Un, Fa;
function Wd() {
  if (Fa) return Un;
  Fa = 1;
  const e = rt(), t = Le, r = yt().mkdirs, n = jt().pathExists, o = xc().utimesMillis, s = /* @__PURE__ */ nr();
  function i(U, L, $, F) {
    typeof $ == "function" && !F ? (F = $, $ = {}) : typeof $ == "function" && ($ = { filter: $ }), F = F || function() {
    }, $ = $ || {}, $.clobber = "clobber" in $ ? !!$.clobber : !0, $.overwrite = "overwrite" in $ ? !!$.overwrite : $.clobber, $.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
      `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
      "Warning",
      "fs-extra-WARN0001"
    ), s.checkPaths(U, L, "copy", $, (x, j) => {
      if (x) return F(x);
      const { srcStat: k, destStat: G } = j;
      s.checkParentPaths(U, k, L, "copy", (z) => z ? F(z) : $.filter ? a(d, G, U, L, $, F) : d(G, U, L, $, F));
    });
  }
  function d(U, L, $, F, x) {
    const j = t.dirname($);
    n(j, (k, G) => {
      if (k) return x(k);
      if (G) return c(U, L, $, F, x);
      r(j, (z) => z ? x(z) : c(U, L, $, F, x));
    });
  }
  function a(U, L, $, F, x, j) {
    Promise.resolve(x.filter($, F)).then((k) => k ? U(L, $, F, x, j) : j(), (k) => j(k));
  }
  function h(U, L, $, F, x) {
    return F.filter ? a(c, U, L, $, F, x) : c(U, L, $, F, x);
  }
  function c(U, L, $, F, x) {
    (F.dereference ? e.stat : e.lstat)(L, (k, G) => k ? x(k) : G.isDirectory() ? O(G, U, L, $, F, x) : G.isFile() || G.isCharacterDevice() || G.isBlockDevice() ? l(G, U, L, $, F, x) : G.isSymbolicLink() ? C(U, L, $, F, x) : G.isSocket() ? x(new Error(`Cannot copy a socket file: ${L}`)) : G.isFIFO() ? x(new Error(`Cannot copy a FIFO pipe: ${L}`)) : x(new Error(`Unknown file: ${L}`)));
  }
  function l(U, L, $, F, x, j) {
    return L ? f(U, $, F, x, j) : p(U, $, F, x, j);
  }
  function f(U, L, $, F, x) {
    if (F.overwrite)
      e.unlink($, (j) => j ? x(j) : p(U, L, $, F, x));
    else return F.errorOnExist ? x(new Error(`'${$}' already exists`)) : x();
  }
  function p(U, L, $, F, x) {
    e.copyFile(L, $, (j) => j ? x(j) : F.preserveTimestamps ? g(U.mode, L, $, x) : I($, U.mode, x));
  }
  function g(U, L, $, F) {
    return y(U) ? m($, U, (x) => x ? F(x) : _(U, L, $, F)) : _(U, L, $, F);
  }
  function y(U) {
    return (U & 128) === 0;
  }
  function m(U, L, $) {
    return I(U, L | 128, $);
  }
  function _(U, L, $, F) {
    N(L, $, (x) => x ? F(x) : I($, U, F));
  }
  function I(U, L, $) {
    return e.chmod(U, L, $);
  }
  function N(U, L, $) {
    e.stat(U, (F, x) => F ? $(F) : o(L, x.atime, x.mtime, $));
  }
  function O(U, L, $, F, x, j) {
    return L ? b($, F, x, j) : R(U.mode, $, F, x, j);
  }
  function R(U, L, $, F, x) {
    e.mkdir($, (j) => {
      if (j) return x(j);
      b(L, $, F, (k) => k ? x(k) : I($, U, x));
    });
  }
  function b(U, L, $, F) {
    e.readdir(U, (x, j) => x ? F(x) : A(j, U, L, $, F));
  }
  function A(U, L, $, F, x) {
    const j = U.pop();
    return j ? w(U, j, L, $, F, x) : x();
  }
  function w(U, L, $, F, x, j) {
    const k = t.join($, L), G = t.join(F, L);
    s.checkPaths(k, G, "copy", x, (z, ee) => {
      if (z) return j(z);
      const { destStat: me } = ee;
      h(me, k, G, x, (Z) => Z ? j(Z) : A(U, $, F, x, j));
    });
  }
  function C(U, L, $, F, x) {
    e.readlink(L, (j, k) => {
      if (j) return x(j);
      if (F.dereference && (k = t.resolve(process.cwd(), k)), U)
        e.readlink($, (G, z) => G ? G.code === "EINVAL" || G.code === "UNKNOWN" ? e.symlink(k, $, x) : x(G) : (F.dereference && (z = t.resolve(process.cwd(), z)), s.isSrcSubdir(k, z) ? x(new Error(`Cannot copy '${k}' to a subdirectory of itself, '${z}'.`)) : U.isDirectory() && s.isSrcSubdir(z, k) ? x(new Error(`Cannot overwrite '${z}' with '${k}'.`)) : T(k, $, x)));
      else
        return e.symlink(k, $, x);
    });
  }
  function T(U, L, $) {
    e.unlink(L, (F) => F ? $(F) : e.symlink(U, L, $));
  }
  return Un = i, Un;
}
var kn, xa;
function Vd() {
  if (xa) return kn;
  xa = 1;
  const e = rt(), t = Le, r = yt().mkdirsSync, n = xc().utimesMillisSync, o = /* @__PURE__ */ nr();
  function s(A, w, C) {
    typeof C == "function" && (C = { filter: C }), C = C || {}, C.clobber = "clobber" in C ? !!C.clobber : !0, C.overwrite = "overwrite" in C ? !!C.overwrite : C.clobber, C.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
      `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
      "Warning",
      "fs-extra-WARN0002"
    );
    const { srcStat: T, destStat: U } = o.checkPathsSync(A, w, "copy", C);
    return o.checkParentPathsSync(A, T, w, "copy"), i(U, A, w, C);
  }
  function i(A, w, C, T) {
    if (T.filter && !T.filter(w, C)) return;
    const U = t.dirname(C);
    return e.existsSync(U) || r(U), a(A, w, C, T);
  }
  function d(A, w, C, T) {
    if (!(T.filter && !T.filter(w, C)))
      return a(A, w, C, T);
  }
  function a(A, w, C, T) {
    const L = (T.dereference ? e.statSync : e.lstatSync)(w);
    if (L.isDirectory()) return _(L, A, w, C, T);
    if (L.isFile() || L.isCharacterDevice() || L.isBlockDevice()) return h(L, A, w, C, T);
    if (L.isSymbolicLink()) return R(A, w, C, T);
    throw L.isSocket() ? new Error(`Cannot copy a socket file: ${w}`) : L.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${w}`) : new Error(`Unknown file: ${w}`);
  }
  function h(A, w, C, T, U) {
    return w ? c(A, C, T, U) : l(A, C, T, U);
  }
  function c(A, w, C, T) {
    if (T.overwrite)
      return e.unlinkSync(C), l(A, w, C, T);
    if (T.errorOnExist)
      throw new Error(`'${C}' already exists`);
  }
  function l(A, w, C, T) {
    return e.copyFileSync(w, C), T.preserveTimestamps && f(A.mode, w, C), y(C, A.mode);
  }
  function f(A, w, C) {
    return p(A) && g(C, A), m(w, C);
  }
  function p(A) {
    return (A & 128) === 0;
  }
  function g(A, w) {
    return y(A, w | 128);
  }
  function y(A, w) {
    return e.chmodSync(A, w);
  }
  function m(A, w) {
    const C = e.statSync(A);
    return n(w, C.atime, C.mtime);
  }
  function _(A, w, C, T, U) {
    return w ? N(C, T, U) : I(A.mode, C, T, U);
  }
  function I(A, w, C, T) {
    return e.mkdirSync(C), N(w, C, T), y(C, A);
  }
  function N(A, w, C) {
    e.readdirSync(A).forEach((T) => O(T, A, w, C));
  }
  function O(A, w, C, T) {
    const U = t.join(w, A), L = t.join(C, A), { destStat: $ } = o.checkPathsSync(U, L, "copy", T);
    return d($, U, L, T);
  }
  function R(A, w, C, T) {
    let U = e.readlinkSync(w);
    if (T.dereference && (U = t.resolve(process.cwd(), U)), A) {
      let L;
      try {
        L = e.readlinkSync(C);
      } catch ($) {
        if ($.code === "EINVAL" || $.code === "UNKNOWN") return e.symlinkSync(U, C);
        throw $;
      }
      if (T.dereference && (L = t.resolve(process.cwd(), L)), o.isSrcSubdir(U, L))
        throw new Error(`Cannot copy '${U}' to a subdirectory of itself, '${L}'.`);
      if (e.statSync(C).isDirectory() && o.isSrcSubdir(L, U))
        throw new Error(`Cannot overwrite '${L}' with '${U}'.`);
      return b(U, C);
    } else
      return e.symlinkSync(U, C);
  }
  function b(A, w) {
    return e.unlinkSync(w), e.symlinkSync(A, w);
  }
  return kn = s, kn;
}
var $n, La;
function qo() {
  if (La) return $n;
  La = 1;
  const e = it().fromCallback;
  return $n = {
    copy: e(/* @__PURE__ */ Wd()),
    copySync: /* @__PURE__ */ Vd()
  }, $n;
}
var Mn, Ua;
function zd() {
  if (Ua) return Mn;
  Ua = 1;
  const e = rt(), t = Le, r = Dc, n = process.platform === "win32";
  function o(g) {
    [
      "unlink",
      "chmod",
      "stat",
      "lstat",
      "rmdir",
      "readdir"
    ].forEach((m) => {
      g[m] = g[m] || e[m], m = m + "Sync", g[m] = g[m] || e[m];
    }), g.maxBusyTries = g.maxBusyTries || 3;
  }
  function s(g, y, m) {
    let _ = 0;
    typeof y == "function" && (m = y, y = {}), r(g, "rimraf: missing path"), r.strictEqual(typeof g, "string", "rimraf: path should be a string"), r.strictEqual(typeof m, "function", "rimraf: callback function required"), r(y, "rimraf: invalid options argument provided"), r.strictEqual(typeof y, "object", "rimraf: options should be object"), o(y), i(g, y, function I(N) {
      if (N) {
        if ((N.code === "EBUSY" || N.code === "ENOTEMPTY" || N.code === "EPERM") && _ < y.maxBusyTries) {
          _++;
          const O = _ * 100;
          return setTimeout(() => i(g, y, I), O);
        }
        N.code === "ENOENT" && (N = null);
      }
      m(N);
    });
  }
  function i(g, y, m) {
    r(g), r(y), r(typeof m == "function"), y.lstat(g, (_, I) => {
      if (_ && _.code === "ENOENT")
        return m(null);
      if (_ && _.code === "EPERM" && n)
        return d(g, y, _, m);
      if (I && I.isDirectory())
        return h(g, y, _, m);
      y.unlink(g, (N) => {
        if (N) {
          if (N.code === "ENOENT")
            return m(null);
          if (N.code === "EPERM")
            return n ? d(g, y, N, m) : h(g, y, N, m);
          if (N.code === "EISDIR")
            return h(g, y, N, m);
        }
        return m(N);
      });
    });
  }
  function d(g, y, m, _) {
    r(g), r(y), r(typeof _ == "function"), y.chmod(g, 438, (I) => {
      I ? _(I.code === "ENOENT" ? null : m) : y.stat(g, (N, O) => {
        N ? _(N.code === "ENOENT" ? null : m) : O.isDirectory() ? h(g, y, m, _) : y.unlink(g, _);
      });
    });
  }
  function a(g, y, m) {
    let _;
    r(g), r(y);
    try {
      y.chmodSync(g, 438);
    } catch (I) {
      if (I.code === "ENOENT")
        return;
      throw m;
    }
    try {
      _ = y.statSync(g);
    } catch (I) {
      if (I.code === "ENOENT")
        return;
      throw m;
    }
    _.isDirectory() ? f(g, y, m) : y.unlinkSync(g);
  }
  function h(g, y, m, _) {
    r(g), r(y), r(typeof _ == "function"), y.rmdir(g, (I) => {
      I && (I.code === "ENOTEMPTY" || I.code === "EEXIST" || I.code === "EPERM") ? c(g, y, _) : I && I.code === "ENOTDIR" ? _(m) : _(I);
    });
  }
  function c(g, y, m) {
    r(g), r(y), r(typeof m == "function"), y.readdir(g, (_, I) => {
      if (_) return m(_);
      let N = I.length, O;
      if (N === 0) return y.rmdir(g, m);
      I.forEach((R) => {
        s(t.join(g, R), y, (b) => {
          if (!O) {
            if (b) return m(O = b);
            --N === 0 && y.rmdir(g, m);
          }
        });
      });
    });
  }
  function l(g, y) {
    let m;
    y = y || {}, o(y), r(g, "rimraf: missing path"), r.strictEqual(typeof g, "string", "rimraf: path should be a string"), r(y, "rimraf: missing options"), r.strictEqual(typeof y, "object", "rimraf: options should be object");
    try {
      m = y.lstatSync(g);
    } catch (_) {
      if (_.code === "ENOENT")
        return;
      _.code === "EPERM" && n && a(g, y, _);
    }
    try {
      m && m.isDirectory() ? f(g, y, null) : y.unlinkSync(g);
    } catch (_) {
      if (_.code === "ENOENT")
        return;
      if (_.code === "EPERM")
        return n ? a(g, y, _) : f(g, y, _);
      if (_.code !== "EISDIR")
        throw _;
      f(g, y, _);
    }
  }
  function f(g, y, m) {
    r(g), r(y);
    try {
      y.rmdirSync(g);
    } catch (_) {
      if (_.code === "ENOTDIR")
        throw m;
      if (_.code === "ENOTEMPTY" || _.code === "EEXIST" || _.code === "EPERM")
        p(g, y);
      else if (_.code !== "ENOENT")
        throw _;
    }
  }
  function p(g, y) {
    if (r(g), r(y), y.readdirSync(g).forEach((m) => l(t.join(g, m), y)), n) {
      const m = Date.now();
      do
        try {
          return y.rmdirSync(g, y);
        } catch {
        }
      while (Date.now() - m < 500);
    } else
      return y.rmdirSync(g, y);
  }
  return Mn = s, s.sync = l, Mn;
}
var qn, ka;
function fn() {
  if (ka) return qn;
  ka = 1;
  const e = rt(), t = it().fromCallback, r = /* @__PURE__ */ zd();
  function n(s, i) {
    if (e.rm) return e.rm(s, { recursive: !0, force: !0 }, i);
    r(s, i);
  }
  function o(s) {
    if (e.rmSync) return e.rmSync(s, { recursive: !0, force: !0 });
    r.sync(s);
  }
  return qn = {
    remove: t(n),
    removeSync: o
  }, qn;
}
var Bn, $a;
function Yd() {
  if ($a) return Bn;
  $a = 1;
  const e = it().fromPromise, t = /* @__PURE__ */ rr(), r = Le, n = /* @__PURE__ */ yt(), o = /* @__PURE__ */ fn(), s = e(async function(a) {
    let h;
    try {
      h = await t.readdir(a);
    } catch {
      return n.mkdirs(a);
    }
    return Promise.all(h.map((c) => o.remove(r.join(a, c))));
  });
  function i(d) {
    let a;
    try {
      a = t.readdirSync(d);
    } catch {
      return n.mkdirsSync(d);
    }
    a.forEach((h) => {
      h = r.join(d, h), o.removeSync(h);
    });
  }
  return Bn = {
    emptyDirSync: i,
    emptydirSync: i,
    emptyDir: s,
    emptydir: s
  }, Bn;
}
var Hn, Ma;
function Xd() {
  if (Ma) return Hn;
  Ma = 1;
  const e = it().fromCallback, t = Le, r = rt(), n = /* @__PURE__ */ yt();
  function o(i, d) {
    function a() {
      r.writeFile(i, "", (h) => {
        if (h) return d(h);
        d();
      });
    }
    r.stat(i, (h, c) => {
      if (!h && c.isFile()) return d();
      const l = t.dirname(i);
      r.stat(l, (f, p) => {
        if (f)
          return f.code === "ENOENT" ? n.mkdirs(l, (g) => {
            if (g) return d(g);
            a();
          }) : d(f);
        p.isDirectory() ? a() : r.readdir(l, (g) => {
          if (g) return d(g);
        });
      });
    });
  }
  function s(i) {
    let d;
    try {
      d = r.statSync(i);
    } catch {
    }
    if (d && d.isFile()) return;
    const a = t.dirname(i);
    try {
      r.statSync(a).isDirectory() || r.readdirSync(a);
    } catch (h) {
      if (h && h.code === "ENOENT") n.mkdirsSync(a);
      else throw h;
    }
    r.writeFileSync(i, "");
  }
  return Hn = {
    createFile: e(o),
    createFileSync: s
  }, Hn;
}
var jn, qa;
function Kd() {
  if (qa) return jn;
  qa = 1;
  const e = it().fromCallback, t = Le, r = rt(), n = /* @__PURE__ */ yt(), o = jt().pathExists, { areIdentical: s } = /* @__PURE__ */ nr();
  function i(a, h, c) {
    function l(f, p) {
      r.link(f, p, (g) => {
        if (g) return c(g);
        c(null);
      });
    }
    r.lstat(h, (f, p) => {
      r.lstat(a, (g, y) => {
        if (g)
          return g.message = g.message.replace("lstat", "ensureLink"), c(g);
        if (p && s(y, p)) return c(null);
        const m = t.dirname(h);
        o(m, (_, I) => {
          if (_) return c(_);
          if (I) return l(a, h);
          n.mkdirs(m, (N) => {
            if (N) return c(N);
            l(a, h);
          });
        });
      });
    });
  }
  function d(a, h) {
    let c;
    try {
      c = r.lstatSync(h);
    } catch {
    }
    try {
      const p = r.lstatSync(a);
      if (c && s(p, c)) return;
    } catch (p) {
      throw p.message = p.message.replace("lstat", "ensureLink"), p;
    }
    const l = t.dirname(h);
    return r.existsSync(l) || n.mkdirsSync(l), r.linkSync(a, h);
  }
  return jn = {
    createLink: e(i),
    createLinkSync: d
  }, jn;
}
var Gn, Ba;
function Jd() {
  if (Ba) return Gn;
  Ba = 1;
  const e = Le, t = rt(), r = jt().pathExists;
  function n(s, i, d) {
    if (e.isAbsolute(s))
      return t.lstat(s, (a) => a ? (a.message = a.message.replace("lstat", "ensureSymlink"), d(a)) : d(null, {
        toCwd: s,
        toDst: s
      }));
    {
      const a = e.dirname(i), h = e.join(a, s);
      return r(h, (c, l) => c ? d(c) : l ? d(null, {
        toCwd: h,
        toDst: s
      }) : t.lstat(s, (f) => f ? (f.message = f.message.replace("lstat", "ensureSymlink"), d(f)) : d(null, {
        toCwd: s,
        toDst: e.relative(a, s)
      })));
    }
  }
  function o(s, i) {
    let d;
    if (e.isAbsolute(s)) {
      if (d = t.existsSync(s), !d) throw new Error("absolute srcpath does not exist");
      return {
        toCwd: s,
        toDst: s
      };
    } else {
      const a = e.dirname(i), h = e.join(a, s);
      if (d = t.existsSync(h), d)
        return {
          toCwd: h,
          toDst: s
        };
      if (d = t.existsSync(s), !d) throw new Error("relative srcpath does not exist");
      return {
        toCwd: s,
        toDst: e.relative(a, s)
      };
    }
  }
  return Gn = {
    symlinkPaths: n,
    symlinkPathsSync: o
  }, Gn;
}
var Wn, Ha;
function Qd() {
  if (Ha) return Wn;
  Ha = 1;
  const e = rt();
  function t(n, o, s) {
    if (s = typeof o == "function" ? o : s, o = typeof o == "function" ? !1 : o, o) return s(null, o);
    e.lstat(n, (i, d) => {
      if (i) return s(null, "file");
      o = d && d.isDirectory() ? "dir" : "file", s(null, o);
    });
  }
  function r(n, o) {
    let s;
    if (o) return o;
    try {
      s = e.lstatSync(n);
    } catch {
      return "file";
    }
    return s && s.isDirectory() ? "dir" : "file";
  }
  return Wn = {
    symlinkType: t,
    symlinkTypeSync: r
  }, Wn;
}
var Vn, ja;
function Zd() {
  if (ja) return Vn;
  ja = 1;
  const e = it().fromCallback, t = Le, r = /* @__PURE__ */ rr(), n = /* @__PURE__ */ yt(), o = n.mkdirs, s = n.mkdirsSync, i = /* @__PURE__ */ Jd(), d = i.symlinkPaths, a = i.symlinkPathsSync, h = /* @__PURE__ */ Qd(), c = h.symlinkType, l = h.symlinkTypeSync, f = jt().pathExists, { areIdentical: p } = /* @__PURE__ */ nr();
  function g(_, I, N, O) {
    O = typeof N == "function" ? N : O, N = typeof N == "function" ? !1 : N, r.lstat(I, (R, b) => {
      !R && b.isSymbolicLink() ? Promise.all([
        r.stat(_),
        r.stat(I)
      ]).then(([A, w]) => {
        if (p(A, w)) return O(null);
        y(_, I, N, O);
      }) : y(_, I, N, O);
    });
  }
  function y(_, I, N, O) {
    d(_, I, (R, b) => {
      if (R) return O(R);
      _ = b.toDst, c(b.toCwd, N, (A, w) => {
        if (A) return O(A);
        const C = t.dirname(I);
        f(C, (T, U) => {
          if (T) return O(T);
          if (U) return r.symlink(_, I, w, O);
          o(C, (L) => {
            if (L) return O(L);
            r.symlink(_, I, w, O);
          });
        });
      });
    });
  }
  function m(_, I, N) {
    let O;
    try {
      O = r.lstatSync(I);
    } catch {
    }
    if (O && O.isSymbolicLink()) {
      const w = r.statSync(_), C = r.statSync(I);
      if (p(w, C)) return;
    }
    const R = a(_, I);
    _ = R.toDst, N = l(R.toCwd, N);
    const b = t.dirname(I);
    return r.existsSync(b) || s(b), r.symlinkSync(_, I, N);
  }
  return Vn = {
    createSymlink: e(g),
    createSymlinkSync: m
  }, Vn;
}
var zn, Ga;
function ef() {
  if (Ga) return zn;
  Ga = 1;
  const { createFile: e, createFileSync: t } = /* @__PURE__ */ Xd(), { createLink: r, createLinkSync: n } = /* @__PURE__ */ Kd(), { createSymlink: o, createSymlinkSync: s } = /* @__PURE__ */ Zd();
  return zn = {
    // file
    createFile: e,
    createFileSync: t,
    ensureFile: e,
    ensureFileSync: t,
    // link
    createLink: r,
    createLinkSync: n,
    ensureLink: r,
    ensureLinkSync: n,
    // symlink
    createSymlink: o,
    createSymlinkSync: s,
    ensureSymlink: o,
    ensureSymlinkSync: s
  }, zn;
}
var Yn, Wa;
function Bo() {
  if (Wa) return Yn;
  Wa = 1;
  function e(r, { EOL: n = `
`, finalEOL: o = !0, replacer: s = null, spaces: i } = {}) {
    const d = o ? n : "", a = JSON.stringify(r, s, i);
    if (a === void 0)
      throw new TypeError(`Converting ${typeof r} value to JSON is not supported`);
    return a.replace(/\n/g, n) + d;
  }
  function t(r) {
    return Buffer.isBuffer(r) && (r = r.toString("utf8")), r.replace(/^\uFEFF/, "");
  }
  return Yn = { stringify: e, stripBom: t }, Yn;
}
var Xn, Va;
function tf() {
  if (Va) return Xn;
  Va = 1;
  let e;
  try {
    e = rt();
  } catch {
    e = St;
  }
  const t = it(), { stringify: r, stripBom: n } = Bo();
  async function o(c, l = {}) {
    typeof l == "string" && (l = { encoding: l });
    const f = l.fs || e, p = "throws" in l ? l.throws : !0;
    let g = await t.fromCallback(f.readFile)(c, l);
    g = n(g);
    let y;
    try {
      y = JSON.parse(g, l ? l.reviver : null);
    } catch (m) {
      if (p)
        throw m.message = `${c}: ${m.message}`, m;
      return null;
    }
    return y;
  }
  const s = t.fromPromise(o);
  function i(c, l = {}) {
    typeof l == "string" && (l = { encoding: l });
    const f = l.fs || e, p = "throws" in l ? l.throws : !0;
    try {
      let g = f.readFileSync(c, l);
      return g = n(g), JSON.parse(g, l.reviver);
    } catch (g) {
      if (p)
        throw g.message = `${c}: ${g.message}`, g;
      return null;
    }
  }
  async function d(c, l, f = {}) {
    const p = f.fs || e, g = r(l, f);
    await t.fromCallback(p.writeFile)(c, g, f);
  }
  const a = t.fromPromise(d);
  function h(c, l, f = {}) {
    const p = f.fs || e, g = r(l, f);
    return p.writeFileSync(c, g, f);
  }
  return Xn = {
    readFile: s,
    readFileSync: i,
    writeFile: a,
    writeFileSync: h
  }, Xn;
}
var Kn, za;
function rf() {
  if (za) return Kn;
  za = 1;
  const e = tf();
  return Kn = {
    // jsonfile exports
    readJson: e.readFile,
    readJsonSync: e.readFileSync,
    writeJson: e.writeFile,
    writeJsonSync: e.writeFileSync
  }, Kn;
}
var Jn, Ya;
function Ho() {
  if (Ya) return Jn;
  Ya = 1;
  const e = it().fromCallback, t = rt(), r = Le, n = /* @__PURE__ */ yt(), o = jt().pathExists;
  function s(d, a, h, c) {
    typeof h == "function" && (c = h, h = "utf8");
    const l = r.dirname(d);
    o(l, (f, p) => {
      if (f) return c(f);
      if (p) return t.writeFile(d, a, h, c);
      n.mkdirs(l, (g) => {
        if (g) return c(g);
        t.writeFile(d, a, h, c);
      });
    });
  }
  function i(d, ...a) {
    const h = r.dirname(d);
    if (t.existsSync(h))
      return t.writeFileSync(d, ...a);
    n.mkdirsSync(h), t.writeFileSync(d, ...a);
  }
  return Jn = {
    outputFile: e(s),
    outputFileSync: i
  }, Jn;
}
var Qn, Xa;
function nf() {
  if (Xa) return Qn;
  Xa = 1;
  const { stringify: e } = Bo(), { outputFile: t } = /* @__PURE__ */ Ho();
  async function r(n, o, s = {}) {
    const i = e(o, s);
    await t(n, i, s);
  }
  return Qn = r, Qn;
}
var Zn, Ka;
function of() {
  if (Ka) return Zn;
  Ka = 1;
  const { stringify: e } = Bo(), { outputFileSync: t } = /* @__PURE__ */ Ho();
  function r(n, o, s) {
    const i = e(o, s);
    t(n, i, s);
  }
  return Zn = r, Zn;
}
var ei, Ja;
function af() {
  if (Ja) return ei;
  Ja = 1;
  const e = it().fromPromise, t = /* @__PURE__ */ rf();
  return t.outputJson = e(/* @__PURE__ */ nf()), t.outputJsonSync = /* @__PURE__ */ of(), t.outputJSON = t.outputJson, t.outputJSONSync = t.outputJsonSync, t.writeJSON = t.writeJson, t.writeJSONSync = t.writeJsonSync, t.readJSON = t.readJson, t.readJSONSync = t.readJsonSync, ei = t, ei;
}
var ti, Qa;
function sf() {
  if (Qa) return ti;
  Qa = 1;
  const e = rt(), t = Le, r = qo().copy, n = fn().remove, o = yt().mkdirp, s = jt().pathExists, i = /* @__PURE__ */ nr();
  function d(f, p, g, y) {
    typeof g == "function" && (y = g, g = {}), g = g || {};
    const m = g.overwrite || g.clobber || !1;
    i.checkPaths(f, p, "move", g, (_, I) => {
      if (_) return y(_);
      const { srcStat: N, isChangingCase: O = !1 } = I;
      i.checkParentPaths(f, N, p, "move", (R) => {
        if (R) return y(R);
        if (a(p)) return h(f, p, m, O, y);
        o(t.dirname(p), (b) => b ? y(b) : h(f, p, m, O, y));
      });
    });
  }
  function a(f) {
    const p = t.dirname(f);
    return t.parse(p).root === p;
  }
  function h(f, p, g, y, m) {
    if (y) return c(f, p, g, m);
    if (g)
      return n(p, (_) => _ ? m(_) : c(f, p, g, m));
    s(p, (_, I) => _ ? m(_) : I ? m(new Error("dest already exists.")) : c(f, p, g, m));
  }
  function c(f, p, g, y) {
    e.rename(f, p, (m) => m ? m.code !== "EXDEV" ? y(m) : l(f, p, g, y) : y());
  }
  function l(f, p, g, y) {
    r(f, p, {
      overwrite: g,
      errorOnExist: !0
    }, (_) => _ ? y(_) : n(f, y));
  }
  return ti = d, ti;
}
var ri, Za;
function lf() {
  if (Za) return ri;
  Za = 1;
  const e = rt(), t = Le, r = qo().copySync, n = fn().removeSync, o = yt().mkdirpSync, s = /* @__PURE__ */ nr();
  function i(l, f, p) {
    p = p || {};
    const g = p.overwrite || p.clobber || !1, { srcStat: y, isChangingCase: m = !1 } = s.checkPathsSync(l, f, "move", p);
    return s.checkParentPathsSync(l, y, f, "move"), d(f) || o(t.dirname(f)), a(l, f, g, m);
  }
  function d(l) {
    const f = t.dirname(l);
    return t.parse(f).root === f;
  }
  function a(l, f, p, g) {
    if (g) return h(l, f, p);
    if (p)
      return n(f), h(l, f, p);
    if (e.existsSync(f)) throw new Error("dest already exists.");
    return h(l, f, p);
  }
  function h(l, f, p) {
    try {
      e.renameSync(l, f);
    } catch (g) {
      if (g.code !== "EXDEV") throw g;
      return c(l, f, p);
    }
  }
  function c(l, f, p) {
    return r(l, f, {
      overwrite: p,
      errorOnExist: !0
    }), n(l);
  }
  return ri = i, ri;
}
var ni, es;
function cf() {
  if (es) return ni;
  es = 1;
  const e = it().fromCallback;
  return ni = {
    move: e(/* @__PURE__ */ sf()),
    moveSync: /* @__PURE__ */ lf()
  }, ni;
}
var ii, ts;
function Pt() {
  return ts || (ts = 1, ii = {
    // Export promiseified graceful-fs:
    .../* @__PURE__ */ rr(),
    // Export extra methods:
    .../* @__PURE__ */ qo(),
    .../* @__PURE__ */ Yd(),
    .../* @__PURE__ */ ef(),
    .../* @__PURE__ */ af(),
    .../* @__PURE__ */ yt(),
    .../* @__PURE__ */ cf(),
    .../* @__PURE__ */ Ho(),
    .../* @__PURE__ */ jt(),
    .../* @__PURE__ */ fn()
  }), ii;
}
var lr = {}, Mt = {}, oi = {}, qt = {}, rs;
function jo() {
  if (rs) return qt;
  rs = 1, Object.defineProperty(qt, "__esModule", { value: !0 }), qt.CancellationError = qt.CancellationToken = void 0;
  const e = Oc;
  let t = class extends e.EventEmitter {
    get cancelled() {
      return this._cancelled || this._parent != null && this._parent.cancelled;
    }
    set parent(o) {
      this.removeParentCancelHandler(), this._parent = o, this.parentCancelHandler = () => this.cancel(), this._parent.onCancel(this.parentCancelHandler);
    }
    // babel cannot compile ... correctly for super calls
    constructor(o) {
      super(), this.parentCancelHandler = null, this._parent = null, this._cancelled = !1, o != null && (this.parent = o);
    }
    cancel() {
      this._cancelled = !0, this.emit("cancel");
    }
    onCancel(o) {
      this.cancelled ? o() : this.once("cancel", o);
    }
    createPromise(o) {
      if (this.cancelled)
        return Promise.reject(new r());
      const s = () => {
        if (i != null)
          try {
            this.removeListener("cancel", i), i = null;
          } catch {
          }
      };
      let i = null;
      return new Promise((d, a) => {
        let h = null;
        if (i = () => {
          try {
            h != null && (h(), h = null);
          } finally {
            a(new r());
          }
        }, this.cancelled) {
          i();
          return;
        }
        this.onCancel(i), o(d, a, (c) => {
          h = c;
        });
      }).then((d) => (s(), d)).catch((d) => {
        throw s(), d;
      });
    }
    removeParentCancelHandler() {
      const o = this._parent;
      o != null && this.parentCancelHandler != null && (o.removeListener("cancel", this.parentCancelHandler), this.parentCancelHandler = null);
    }
    dispose() {
      try {
        this.removeParentCancelHandler();
      } finally {
        this.removeAllListeners(), this._parent = null;
      }
    }
  };
  qt.CancellationToken = t;
  class r extends Error {
    constructor() {
      super("cancelled");
    }
  }
  return qt.CancellationError = r, qt;
}
var Jr = {}, ns;
function hn() {
  if (ns) return Jr;
  ns = 1, Object.defineProperty(Jr, "__esModule", { value: !0 }), Jr.newError = e;
  function e(t, r) {
    const n = new Error(t);
    return n.code = r, n;
  }
  return Jr;
}
var Je = {}, Qr = { exports: {} }, Zr = { exports: {} }, ai, is;
function uf() {
  if (is) return ai;
  is = 1;
  var e = 1e3, t = e * 60, r = t * 60, n = r * 24, o = n * 7, s = n * 365.25;
  ai = function(c, l) {
    l = l || {};
    var f = typeof c;
    if (f === "string" && c.length > 0)
      return i(c);
    if (f === "number" && isFinite(c))
      return l.long ? a(c) : d(c);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(c)
    );
  };
  function i(c) {
    if (c = String(c), !(c.length > 100)) {
      var l = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        c
      );
      if (l) {
        var f = parseFloat(l[1]), p = (l[2] || "ms").toLowerCase();
        switch (p) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return f * s;
          case "weeks":
          case "week":
          case "w":
            return f * o;
          case "days":
          case "day":
          case "d":
            return f * n;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return f * r;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return f * t;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return f * e;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return f;
          default:
            return;
        }
      }
    }
  }
  function d(c) {
    var l = Math.abs(c);
    return l >= n ? Math.round(c / n) + "d" : l >= r ? Math.round(c / r) + "h" : l >= t ? Math.round(c / t) + "m" : l >= e ? Math.round(c / e) + "s" : c + "ms";
  }
  function a(c) {
    var l = Math.abs(c);
    return l >= n ? h(c, l, n, "day") : l >= r ? h(c, l, r, "hour") : l >= t ? h(c, l, t, "minute") : l >= e ? h(c, l, e, "second") : c + " ms";
  }
  function h(c, l, f, p) {
    var g = l >= f * 1.5;
    return Math.round(c / f) + " " + p + (g ? "s" : "");
  }
  return ai;
}
var si, os;
function Lc() {
  if (os) return si;
  os = 1;
  function e(t) {
    n.debug = n, n.default = n, n.coerce = h, n.disable = d, n.enable = s, n.enabled = a, n.humanize = uf(), n.destroy = c, Object.keys(t).forEach((l) => {
      n[l] = t[l];
    }), n.names = [], n.skips = [], n.formatters = {};
    function r(l) {
      let f = 0;
      for (let p = 0; p < l.length; p++)
        f = (f << 5) - f + l.charCodeAt(p), f |= 0;
      return n.colors[Math.abs(f) % n.colors.length];
    }
    n.selectColor = r;
    function n(l) {
      let f, p = null, g, y;
      function m(..._) {
        if (!m.enabled)
          return;
        const I = m, N = Number(/* @__PURE__ */ new Date()), O = N - (f || N);
        I.diff = O, I.prev = f, I.curr = N, f = N, _[0] = n.coerce(_[0]), typeof _[0] != "string" && _.unshift("%O");
        let R = 0;
        _[0] = _[0].replace(/%([a-zA-Z%])/g, (A, w) => {
          if (A === "%%")
            return "%";
          R++;
          const C = n.formatters[w];
          if (typeof C == "function") {
            const T = _[R];
            A = C.call(I, T), _.splice(R, 1), R--;
          }
          return A;
        }), n.formatArgs.call(I, _), (I.log || n.log).apply(I, _);
      }
      return m.namespace = l, m.useColors = n.useColors(), m.color = n.selectColor(l), m.extend = o, m.destroy = n.destroy, Object.defineProperty(m, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => p !== null ? p : (g !== n.namespaces && (g = n.namespaces, y = n.enabled(l)), y),
        set: (_) => {
          p = _;
        }
      }), typeof n.init == "function" && n.init(m), m;
    }
    function o(l, f) {
      const p = n(this.namespace + (typeof f > "u" ? ":" : f) + l);
      return p.log = this.log, p;
    }
    function s(l) {
      n.save(l), n.namespaces = l, n.names = [], n.skips = [];
      const f = (typeof l == "string" ? l : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const p of f)
        p[0] === "-" ? n.skips.push(p.slice(1)) : n.names.push(p);
    }
    function i(l, f) {
      let p = 0, g = 0, y = -1, m = 0;
      for (; p < l.length; )
        if (g < f.length && (f[g] === l[p] || f[g] === "*"))
          f[g] === "*" ? (y = g, m = p, g++) : (p++, g++);
        else if (y !== -1)
          g = y + 1, m++, p = m;
        else
          return !1;
      for (; g < f.length && f[g] === "*"; )
        g++;
      return g === f.length;
    }
    function d() {
      const l = [
        ...n.names,
        ...n.skips.map((f) => "-" + f)
      ].join(",");
      return n.enable(""), l;
    }
    function a(l) {
      for (const f of n.skips)
        if (i(l, f))
          return !1;
      for (const f of n.names)
        if (i(l, f))
          return !0;
      return !1;
    }
    function h(l) {
      return l instanceof Error ? l.stack || l.message : l;
    }
    function c() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return n.enable(n.load()), n;
  }
  return si = e, si;
}
var as;
function df() {
  return as || (as = 1, (function(e, t) {
    t.formatArgs = n, t.save = o, t.load = s, t.useColors = r, t.storage = i(), t.destroy = /* @__PURE__ */ (() => {
      let a = !1;
      return () => {
        a || (a = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
      };
    })(), t.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function r() {
      if (typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs))
        return !0;
      if (typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))
        return !1;
      let a;
      return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && (a = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(a[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function n(a) {
      if (a[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + a[0] + (this.useColors ? "%c " : " ") + "+" + e.exports.humanize(this.diff), !this.useColors)
        return;
      const h = "color: " + this.color;
      a.splice(1, 0, h, "color: inherit");
      let c = 0, l = 0;
      a[0].replace(/%[a-zA-Z%]/g, (f) => {
        f !== "%%" && (c++, f === "%c" && (l = c));
      }), a.splice(l, 0, h);
    }
    t.log = console.debug || console.log || (() => {
    });
    function o(a) {
      try {
        a ? t.storage.setItem("debug", a) : t.storage.removeItem("debug");
      } catch {
      }
    }
    function s() {
      let a;
      try {
        a = t.storage.getItem("debug") || t.storage.getItem("DEBUG");
      } catch {
      }
      return !a && typeof process < "u" && "env" in process && (a = process.env.DEBUG), a;
    }
    function i() {
      try {
        return localStorage;
      } catch {
      }
    }
    e.exports = Lc()(t);
    const { formatters: d } = e.exports;
    d.j = function(a) {
      try {
        return JSON.stringify(a);
      } catch (h) {
        return "[UnexpectedJSONParseError]: " + h.message;
      }
    };
  })(Zr, Zr.exports)), Zr.exports;
}
var en = { exports: {} }, li, ss;
function ff() {
  return ss || (ss = 1, li = (e, t = process.argv) => {
    const r = e.startsWith("-") ? "" : e.length === 1 ? "-" : "--", n = t.indexOf(r + e), o = t.indexOf("--");
    return n !== -1 && (o === -1 || n < o);
  }), li;
}
var ci, ls;
function hf() {
  if (ls) return ci;
  ls = 1;
  const e = kr, t = Pc, r = ff(), { env: n } = process;
  let o;
  r("no-color") || r("no-colors") || r("color=false") || r("color=never") ? o = 0 : (r("color") || r("colors") || r("color=true") || r("color=always")) && (o = 1), "FORCE_COLOR" in n && (n.FORCE_COLOR === "true" ? o = 1 : n.FORCE_COLOR === "false" ? o = 0 : o = n.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(n.FORCE_COLOR, 10), 3));
  function s(a) {
    return a === 0 ? !1 : {
      level: a,
      hasBasic: !0,
      has256: a >= 2,
      has16m: a >= 3
    };
  }
  function i(a, h) {
    if (o === 0)
      return 0;
    if (r("color=16m") || r("color=full") || r("color=truecolor"))
      return 3;
    if (r("color=256"))
      return 2;
    if (a && !h && o === void 0)
      return 0;
    const c = o || 0;
    if (n.TERM === "dumb")
      return c;
    if (process.platform === "win32") {
      const l = e.release().split(".");
      return Number(l[0]) >= 10 && Number(l[2]) >= 10586 ? Number(l[2]) >= 14931 ? 3 : 2 : 1;
    }
    if ("CI" in n)
      return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((l) => l in n) || n.CI_NAME === "codeship" ? 1 : c;
    if ("TEAMCITY_VERSION" in n)
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(n.TEAMCITY_VERSION) ? 1 : 0;
    if (n.COLORTERM === "truecolor")
      return 3;
    if ("TERM_PROGRAM" in n) {
      const l = parseInt((n.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (n.TERM_PROGRAM) {
        case "iTerm.app":
          return l >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    return /-256(color)?$/i.test(n.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(n.TERM) || "COLORTERM" in n ? 1 : c;
  }
  function d(a) {
    const h = i(a, a && a.isTTY);
    return s(h);
  }
  return ci = {
    supportsColor: d,
    stdout: s(i(!0, t.isatty(1))),
    stderr: s(i(!0, t.isatty(2)))
  }, ci;
}
var cs;
function pf() {
  return cs || (cs = 1, (function(e, t) {
    const r = Pc, n = $o;
    t.init = c, t.log = d, t.formatArgs = s, t.save = a, t.load = h, t.useColors = o, t.destroy = n.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), t.colors = [6, 2, 3, 4, 5, 1];
    try {
      const f = hf();
      f && (f.stderr || f).level >= 2 && (t.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ]);
    } catch {
    }
    t.inspectOpts = Object.keys(process.env).filter((f) => /^debug_/i.test(f)).reduce((f, p) => {
      const g = p.substring(6).toLowerCase().replace(/_([a-z])/g, (m, _) => _.toUpperCase());
      let y = process.env[p];
      return /^(yes|on|true|enabled)$/i.test(y) ? y = !0 : /^(no|off|false|disabled)$/i.test(y) ? y = !1 : y === "null" ? y = null : y = Number(y), f[g] = y, f;
    }, {});
    function o() {
      return "colors" in t.inspectOpts ? !!t.inspectOpts.colors : r.isatty(process.stderr.fd);
    }
    function s(f) {
      const { namespace: p, useColors: g } = this;
      if (g) {
        const y = this.color, m = "\x1B[3" + (y < 8 ? y : "8;5;" + y), _ = `  ${m};1m${p} \x1B[0m`;
        f[0] = _ + f[0].split(`
`).join(`
` + _), f.push(m + "m+" + e.exports.humanize(this.diff) + "\x1B[0m");
      } else
        f[0] = i() + p + " " + f[0];
    }
    function i() {
      return t.inspectOpts.hideDate ? "" : (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function d(...f) {
      return process.stderr.write(n.formatWithOptions(t.inspectOpts, ...f) + `
`);
    }
    function a(f) {
      f ? process.env.DEBUG = f : delete process.env.DEBUG;
    }
    function h() {
      return process.env.DEBUG;
    }
    function c(f) {
      f.inspectOpts = {};
      const p = Object.keys(t.inspectOpts);
      for (let g = 0; g < p.length; g++)
        f.inspectOpts[p[g]] = t.inspectOpts[p[g]];
    }
    e.exports = Lc()(t);
    const { formatters: l } = e.exports;
    l.o = function(f) {
      return this.inspectOpts.colors = this.useColors, n.inspect(f, this.inspectOpts).split(`
`).map((p) => p.trim()).join(" ");
    }, l.O = function(f) {
      return this.inspectOpts.colors = this.useColors, n.inspect(f, this.inspectOpts);
    };
  })(en, en.exports)), en.exports;
}
var us;
function mf() {
  return us || (us = 1, typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? Qr.exports = df() : Qr.exports = pf()), Qr.exports;
}
var cr = {}, ds;
function Uc() {
  if (ds) return cr;
  ds = 1, Object.defineProperty(cr, "__esModule", { value: !0 }), cr.ProgressCallbackTransform = void 0;
  const e = Ur;
  let t = class extends e.Transform {
    constructor(n, o, s) {
      super(), this.total = n, this.cancellationToken = o, this.onProgress = s, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.nextUpdate = this.start + 1e3;
    }
    _transform(n, o, s) {
      if (this.cancellationToken.cancelled) {
        s(new Error("cancelled"), null);
        return;
      }
      this.transferred += n.length, this.delta += n.length;
      const i = Date.now();
      i >= this.nextUpdate && this.transferred !== this.total && (this.nextUpdate = i + 1e3, this.onProgress({
        total: this.total,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.total * 100,
        bytesPerSecond: Math.round(this.transferred / ((i - this.start) / 1e3))
      }), this.delta = 0), s(null, n);
    }
    _flush(n) {
      if (this.cancellationToken.cancelled) {
        n(new Error("cancelled"));
        return;
      }
      this.onProgress({
        total: this.total,
        delta: this.delta,
        transferred: this.total,
        percent: 100,
        bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
      }), this.delta = 0, n(null);
    }
  };
  return cr.ProgressCallbackTransform = t, cr;
}
var fs;
function gf() {
  if (fs) return Je;
  fs = 1, Object.defineProperty(Je, "__esModule", { value: !0 }), Je.DigestTransform = Je.HttpExecutor = Je.HttpError = void 0, Je.createHttpError = h, Je.parseJson = f, Je.configureRequestOptionsFromUrl = y, Je.configureRequestUrl = m, Je.safeGetHeader = N, Je.configureRequestOptions = R, Je.safeStringifyJson = b;
  const e = tt, t = mf(), r = St, n = Ur, o = Ot, s = jo(), i = hn(), d = Uc(), a = (0, t.default)("electron-builder");
  function h(A, w = null) {
    return new l(A.statusCode || -1, `${A.statusCode} ${A.statusMessage}` + (w == null ? "" : `
` + JSON.stringify(w, null, "  ")) + `
Headers: ` + b(A.headers), w);
  }
  const c = /* @__PURE__ */ new Map([
    [429, "Too many requests"],
    [400, "Bad request"],
    [403, "Forbidden"],
    [404, "Not found"],
    [405, "Method not allowed"],
    [406, "Not acceptable"],
    [408, "Request timeout"],
    [413, "Request entity too large"],
    [500, "Internal server error"],
    [502, "Bad gateway"],
    [503, "Service unavailable"],
    [504, "Gateway timeout"],
    [505, "HTTP version not supported"]
  ]);
  class l extends Error {
    constructor(w, C = `HTTP error: ${c.get(w) || w}`, T = null) {
      super(C), this.statusCode = w, this.description = T, this.name = "HttpError", this.code = `HTTP_ERROR_${w}`;
    }
    isServerError() {
      return this.statusCode >= 500 && this.statusCode <= 599;
    }
  }
  Je.HttpError = l;
  function f(A) {
    return A.then((w) => w == null || w.length === 0 ? null : JSON.parse(w));
  }
  class p {
    constructor() {
      this.maxRedirects = 10;
    }
    request(w, C = new s.CancellationToken(), T) {
      R(w);
      const U = T == null ? void 0 : JSON.stringify(T), L = U ? Buffer.from(U) : void 0;
      if (L != null) {
        a(U);
        const { headers: $, ...F } = w;
        w = {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": L.length,
            ...$
          },
          ...F
        };
      }
      return this.doApiRequest(w, C, ($) => $.end(L));
    }
    doApiRequest(w, C, T, U = 0) {
      return a.enabled && a(`Request: ${b(w)}`), C.createPromise((L, $, F) => {
        const x = this.createRequest(w, (j) => {
          try {
            this.handleResponse(j, w, C, L, $, U, T);
          } catch (k) {
            $(k);
          }
        });
        this.addErrorAndTimeoutHandlers(x, $, w.timeout), this.addRedirectHandlers(x, w, $, U, (j) => {
          this.doApiRequest(j, C, T, U).then(L).catch($);
        }), T(x, $), F(() => x.abort());
      });
    }
    // noinspection JSUnusedLocalSymbols
    // eslint-disable-next-line
    addRedirectHandlers(w, C, T, U, L) {
    }
    addErrorAndTimeoutHandlers(w, C, T = 60 * 1e3) {
      this.addTimeOutHandler(w, C, T), w.on("error", C), w.on("aborted", () => {
        C(new Error("Request has been aborted by the server"));
      });
    }
    handleResponse(w, C, T, U, L, $, F) {
      var x;
      if (a.enabled && a(`Response: ${w.statusCode} ${w.statusMessage}, request options: ${b(C)}`), w.statusCode === 404) {
        L(h(w, `method: ${C.method || "GET"} url: ${C.protocol || "https:"}//${C.hostname}${C.port ? `:${C.port}` : ""}${C.path}

Please double check that your authentication token is correct. Due to security reasons, actual status maybe not reported, but 404.
`));
        return;
      } else if (w.statusCode === 204) {
        U();
        return;
      }
      const j = (x = w.statusCode) !== null && x !== void 0 ? x : 0, k = j >= 300 && j < 400, G = N(w, "location");
      if (k && G != null) {
        if ($ > this.maxRedirects) {
          L(this.createMaxRedirectError());
          return;
        }
        this.doApiRequest(p.prepareRedirectUrlOptions(G, C), T, F, $).then(U).catch(L);
        return;
      }
      w.setEncoding("utf8");
      let z = "";
      w.on("error", L), w.on("data", (ee) => z += ee), w.on("end", () => {
        try {
          if (w.statusCode != null && w.statusCode >= 400) {
            const ee = N(w, "content-type"), me = ee != null && (Array.isArray(ee) ? ee.find((Z) => Z.includes("json")) != null : ee.includes("json"));
            L(h(w, `method: ${C.method || "GET"} url: ${C.protocol || "https:"}//${C.hostname}${C.port ? `:${C.port}` : ""}${C.path}

          Data:
          ${me ? JSON.stringify(JSON.parse(z)) : z}
          `));
          } else
            U(z.length === 0 ? null : z);
        } catch (ee) {
          L(ee);
        }
      });
    }
    async downloadToBuffer(w, C) {
      return await C.cancellationToken.createPromise((T, U, L) => {
        const $ = [], F = {
          headers: C.headers || void 0,
          // because PrivateGitHubProvider requires HttpExecutor.prepareRedirectUrlOptions logic, so, we need to redirect manually
          redirect: "manual"
        };
        m(w, F), R(F), this.doDownload(F, {
          destination: null,
          options: C,
          onCancel: L,
          callback: (x) => {
            x == null ? T(Buffer.concat($)) : U(x);
          },
          responseHandler: (x, j) => {
            let k = 0;
            x.on("data", (G) => {
              if (k += G.length, k > 524288e3) {
                j(new Error("Maximum allowed size is 500 MB"));
                return;
              }
              $.push(G);
            }), x.on("end", () => {
              j(null);
            });
          }
        }, 0);
      });
    }
    doDownload(w, C, T) {
      const U = this.createRequest(w, (L) => {
        if (L.statusCode >= 400) {
          C.callback(new Error(`Cannot download "${w.protocol || "https:"}//${w.hostname}${w.path}", status ${L.statusCode}: ${L.statusMessage}`));
          return;
        }
        L.on("error", C.callback);
        const $ = N(L, "location");
        if ($ != null) {
          T < this.maxRedirects ? this.doDownload(p.prepareRedirectUrlOptions($, w), C, T++) : C.callback(this.createMaxRedirectError());
          return;
        }
        C.responseHandler == null ? O(C, L) : C.responseHandler(L, C.callback);
      });
      this.addErrorAndTimeoutHandlers(U, C.callback, w.timeout), this.addRedirectHandlers(U, w, C.callback, T, (L) => {
        this.doDownload(L, C, T++);
      }), U.end();
    }
    createMaxRedirectError() {
      return new Error(`Too many redirects (> ${this.maxRedirects})`);
    }
    addTimeOutHandler(w, C, T) {
      w.on("socket", (U) => {
        U.setTimeout(T, () => {
          w.abort(), C(new Error("Request timed out"));
        });
      });
    }
    static prepareRedirectUrlOptions(w, C) {
      const T = y(w, { ...C }), U = T.headers;
      if (U?.authorization) {
        const L = p.reconstructOriginalUrl(C), $ = g(w, C);
        p.isCrossOriginRedirect(L, $) && (a.enabled && a(`Given the cross-origin redirect (from ${L.host} to ${$.host}), the Authorization header will be stripped out.`), delete U.authorization);
      }
      return T;
    }
    static reconstructOriginalUrl(w) {
      const C = w.protocol || "https:";
      if (!w.hostname)
        throw new Error("Missing hostname in request options");
      const T = w.hostname, U = w.port ? `:${w.port}` : "", L = w.path || "/";
      return new o.URL(`${C}//${T}${U}${L}`);
    }
    static isCrossOriginRedirect(w, C) {
      if (w.hostname.toLowerCase() !== C.hostname.toLowerCase())
        return !0;
      if (w.protocol === "http:" && // This can be replaced with `!originalUrl.port`, but for the sake of clarity.
      ["80", ""].includes(w.port) && C.protocol === "https:" && // This can be replaced with `!redirectUrl.port`, but for the sake of clarity.
      ["443", ""].includes(C.port))
        return !1;
      if (w.protocol !== C.protocol)
        return !0;
      const T = w.port, U = C.port;
      return T !== U;
    }
    static retryOnServerError(w, C = 3) {
      for (let T = 0; ; T++)
        try {
          return w();
        } catch (U) {
          if (T < C && (U instanceof l && U.isServerError() || U.code === "EPIPE"))
            continue;
          throw U;
        }
    }
  }
  Je.HttpExecutor = p;
  function g(A, w) {
    try {
      return new o.URL(A);
    } catch {
      const C = w.hostname, T = w.protocol || "https:", U = w.port ? `:${w.port}` : "", L = `${T}//${C}${U}`;
      return new o.URL(A, L);
    }
  }
  function y(A, w) {
    const C = R(w), T = g(A, w);
    return m(T, C), C;
  }
  function m(A, w) {
    w.protocol = A.protocol, w.hostname = A.hostname, A.port ? w.port = A.port : w.port && delete w.port, w.path = A.pathname + A.search;
  }
  class _ extends n.Transform {
    // noinspection JSUnusedGlobalSymbols
    get actual() {
      return this._actual;
    }
    constructor(w, C = "sha512", T = "base64") {
      super(), this.expected = w, this.algorithm = C, this.encoding = T, this._actual = null, this.isValidateOnEnd = !0, this.digester = (0, e.createHash)(C);
    }
    // noinspection JSUnusedGlobalSymbols
    _transform(w, C, T) {
      this.digester.update(w), T(null, w);
    }
    // noinspection JSUnusedGlobalSymbols
    _flush(w) {
      if (this._actual = this.digester.digest(this.encoding), this.isValidateOnEnd)
        try {
          this.validate();
        } catch (C) {
          w(C);
          return;
        }
      w(null);
    }
    validate() {
      if (this._actual == null)
        throw (0, i.newError)("Not finished yet", "ERR_STREAM_NOT_FINISHED");
      if (this._actual !== this.expected)
        throw (0, i.newError)(`${this.algorithm} checksum mismatch, expected ${this.expected}, got ${this._actual}`, "ERR_CHECKSUM_MISMATCH");
      return null;
    }
  }
  Je.DigestTransform = _;
  function I(A, w, C) {
    return A != null && w != null && A !== w ? (C(new Error(`checksum mismatch: expected ${w} but got ${A} (X-Checksum-Sha2 header)`)), !1) : !0;
  }
  function N(A, w) {
    const C = A.headers[w];
    return C == null ? null : Array.isArray(C) ? C.length === 0 ? null : C[C.length - 1] : C;
  }
  function O(A, w) {
    if (!I(N(w, "X-Checksum-Sha2"), A.options.sha2, A.callback))
      return;
    const C = [];
    if (A.options.onProgress != null) {
      const $ = N(w, "content-length");
      $ != null && C.push(new d.ProgressCallbackTransform(parseInt($, 10), A.options.cancellationToken, A.options.onProgress));
    }
    const T = A.options.sha512;
    T != null ? C.push(new _(T, "sha512", T.length === 128 && !T.includes("+") && !T.includes("Z") && !T.includes("=") ? "hex" : "base64")) : A.options.sha2 != null && C.push(new _(A.options.sha2, "sha256", "hex"));
    const U = (0, r.createWriteStream)(A.destination);
    C.push(U);
    let L = w;
    for (const $ of C)
      $.on("error", (F) => {
        U.close(), A.options.cancellationToken.cancelled || A.callback(F);
      }), L = L.pipe($);
    U.on("finish", () => {
      U.close(A.callback);
    });
  }
  function R(A, w, C) {
    C != null && (A.method = C), A.headers = { ...A.headers };
    const T = A.headers;
    return w != null && (T.authorization = w.startsWith("Basic") || w.startsWith("Bearer") ? w : `token ${w}`), T["User-Agent"] == null && (T["User-Agent"] = "electron-builder"), (C == null || C === "GET" || T["Cache-Control"] == null) && (T["Cache-Control"] = "no-cache"), A.protocol == null && process.versions.electron != null && (A.protocol = "https:"), A;
  }
  function b(A, w) {
    return JSON.stringify(A, (C, T) => C.endsWith("Authorization") || C.endsWith("authorization") || C.endsWith("Password") || C.endsWith("PASSWORD") || C.endsWith("Token") || C.includes("password") || C.includes("token") || w != null && w.has(C) ? "<stripped sensitive data>" : T, 2);
  }
  return Je;
}
var ur = {}, hs;
function Ef() {
  if (hs) return ur;
  hs = 1, Object.defineProperty(ur, "__esModule", { value: !0 }), ur.MemoLazy = void 0;
  let e = class {
    constructor(n, o) {
      this.selector = n, this.creator = o, this.selected = void 0, this._value = void 0;
    }
    get hasValue() {
      return this._value !== void 0;
    }
    get value() {
      const n = this.selector();
      if (this._value !== void 0 && t(this.selected, n))
        return this._value;
      this.selected = n;
      const o = this.creator(n);
      return this.value = o, o;
    }
    set value(n) {
      this._value = n;
    }
  };
  ur.MemoLazy = e;
  function t(r, n) {
    if (typeof r == "object" && r !== null && (typeof n == "object" && n !== null)) {
      const i = Object.keys(r), d = Object.keys(n);
      return i.length === d.length && i.every((a) => t(r[a], n[a]));
    }
    return r === n;
  }
  return ur;
}
var Xt = {}, ps;
function yf() {
  if (ps) return Xt;
  ps = 1, Object.defineProperty(Xt, "__esModule", { value: !0 }), Xt.githubUrl = e, Xt.githubTagPrefix = t, Xt.getS3LikeProviderBaseUrl = r;
  function e(i, d = "github.com") {
    return `${i.protocol || "https"}://${i.host || d}`;
  }
  function t(i) {
    var d;
    return i.tagNamePrefix ? i.tagNamePrefix : !((d = i.vPrefixedTagName) !== null && d !== void 0) || d ? "v" : "";
  }
  function r(i) {
    const d = i.provider;
    if (d === "s3")
      return n(i);
    if (d === "spaces")
      return s(i);
    throw new Error(`Not supported provider: ${d}`);
  }
  function n(i) {
    let d;
    if (i.accelerate == !0)
      d = `https://${i.bucket}.s3-accelerate.amazonaws.com`;
    else if (i.endpoint != null)
      d = `${i.endpoint}/${i.bucket}`;
    else if (i.bucket.includes(".")) {
      if (i.region == null)
        throw new Error(`Bucket name "${i.bucket}" includes a dot, but S3 region is missing`);
      i.region === "us-east-1" ? d = `https://s3.amazonaws.com/${i.bucket}` : d = `https://s3-${i.region}.amazonaws.com/${i.bucket}`;
    } else i.region === "cn-north-1" ? d = `https://${i.bucket}.s3.${i.region}.amazonaws.com.cn` : d = `https://${i.bucket}.s3.amazonaws.com`;
    return o(d, i.path);
  }
  function o(i, d) {
    return d != null && d.length > 0 && (d.startsWith("/") || (i += "/"), i += d), i;
  }
  function s(i) {
    if (i.name == null)
      throw new Error("name is missing");
    if (i.region == null)
      throw new Error("region is missing");
    return o(`https://${i.name}.${i.region}.digitaloceanspaces.com`, i.path);
  }
  return Xt;
}
var tn = {}, ms;
function wf() {
  if (ms) return tn;
  ms = 1, Object.defineProperty(tn, "__esModule", { value: !0 }), tn.retry = t;
  const e = jo();
  async function t(r, n) {
    var o;
    const { retries: s, interval: i, backoff: d = 0, attempt: a = 0, shouldRetry: h, cancellationToken: c = new e.CancellationToken() } = n;
    try {
      return await r();
    } catch (l) {
      if (await Promise.resolve((o = h?.(l)) !== null && o !== void 0 ? o : !0) && s > 0 && !c.cancelled)
        return await new Promise((f) => setTimeout(f, i + d * a)), await t(r, { ...n, retries: s - 1, attempt: a + 1 });
      throw l;
    }
  }
  return tn;
}
var rn = {}, gs;
function vf() {
  if (gs) return rn;
  gs = 1, Object.defineProperty(rn, "__esModule", { value: !0 }), rn.parseDn = e;
  function e(t) {
    let r = !1, n = null, o = "", s = 0;
    t = t.trim();
    const i = /* @__PURE__ */ new Map();
    for (let d = 0; d <= t.length; d++) {
      if (d === t.length) {
        n !== null && i.set(n, o);
        break;
      }
      const a = t[d];
      if (r) {
        if (a === '"') {
          r = !1;
          continue;
        }
      } else {
        if (a === '"') {
          r = !0;
          continue;
        }
        if (a === "\\") {
          d++;
          const h = parseInt(t.slice(d, d + 2), 16);
          Number.isNaN(h) ? o += t[d] : (d++, o += String.fromCharCode(h));
          continue;
        }
        if (n === null && a === "=") {
          n = o, o = "";
          continue;
        }
        if (a === "," || a === ";" || a === "+") {
          n !== null && i.set(n, o), n = null, o = "";
          continue;
        }
      }
      if (a === " " && !r) {
        if (o.length === 0)
          continue;
        if (d > s) {
          let h = d;
          for (; t[h] === " "; )
            h++;
          s = h;
        }
        if (s >= t.length || t[s] === "," || t[s] === ";" || n === null && t[s] === "=" || n !== null && t[s] === "+") {
          d = s - 1;
          continue;
        }
      }
      o += a;
    }
    return i;
  }
  return rn;
}
var Bt = {}, Es;
function Tf() {
  if (Es) return Bt;
  Es = 1, Object.defineProperty(Bt, "__esModule", { value: !0 }), Bt.nil = Bt.UUID = void 0;
  const e = tt, t = hn(), r = "options.name must be either a string or a Buffer", n = (0, e.randomBytes)(16);
  n[0] = n[0] | 1;
  const o = {}, s = [];
  for (let l = 0; l < 256; l++) {
    const f = (l + 256).toString(16).substr(1);
    o[f] = l, s[l] = f;
  }
  class i {
    constructor(f) {
      this.ascii = null, this.binary = null;
      const p = i.check(f);
      if (!p)
        throw new Error("not a UUID");
      this.version = p.version, p.format === "ascii" ? this.ascii = f : this.binary = f;
    }
    static v5(f, p) {
      return h(f, "sha1", 80, p);
    }
    toString() {
      return this.ascii == null && (this.ascii = c(this.binary)), this.ascii;
    }
    inspect() {
      return `UUID v${this.version} ${this.toString()}`;
    }
    static check(f, p = 0) {
      if (typeof f == "string")
        return f = f.toLowerCase(), /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-([a-f0-9]{12})$/.test(f) ? f === "00000000-0000-0000-0000-000000000000" ? { version: void 0, variant: "nil", format: "ascii" } : {
          version: (o[f[14] + f[15]] & 240) >> 4,
          variant: d((o[f[19] + f[20]] & 224) >> 5),
          format: "ascii"
        } : !1;
      if (Buffer.isBuffer(f)) {
        if (f.length < p + 16)
          return !1;
        let g = 0;
        for (; g < 16 && f[p + g] === 0; g++)
          ;
        return g === 16 ? { version: void 0, variant: "nil", format: "binary" } : {
          version: (f[p + 6] & 240) >> 4,
          variant: d((f[p + 8] & 224) >> 5),
          format: "binary"
        };
      }
      throw (0, t.newError)("Unknown type of uuid", "ERR_UNKNOWN_UUID_TYPE");
    }
    // read stringified uuid into a Buffer
    static parse(f) {
      const p = Buffer.allocUnsafe(16);
      let g = 0;
      for (let y = 0; y < 16; y++)
        p[y] = o[f[g++] + f[g++]], (y === 3 || y === 5 || y === 7 || y === 9) && (g += 1);
      return p;
    }
  }
  Bt.UUID = i, i.OID = i.parse("6ba7b812-9dad-11d1-80b4-00c04fd430c8");
  function d(l) {
    switch (l) {
      case 0:
      case 1:
      case 3:
        return "ncs";
      case 4:
      case 5:
        return "rfc4122";
      case 6:
        return "microsoft";
      default:
        return "future";
    }
  }
  var a;
  (function(l) {
    l[l.ASCII = 0] = "ASCII", l[l.BINARY = 1] = "BINARY", l[l.OBJECT = 2] = "OBJECT";
  })(a || (a = {}));
  function h(l, f, p, g, y = a.ASCII) {
    const m = (0, e.createHash)(f);
    if (typeof l != "string" && !Buffer.isBuffer(l))
      throw (0, t.newError)(r, "ERR_INVALID_UUID_NAME");
    m.update(g), m.update(l);
    const I = m.digest();
    let N;
    switch (y) {
      case a.BINARY:
        I[6] = I[6] & 15 | p, I[8] = I[8] & 63 | 128, N = I;
        break;
      case a.OBJECT:
        I[6] = I[6] & 15 | p, I[8] = I[8] & 63 | 128, N = new i(I);
        break;
      default:
        N = s[I[0]] + s[I[1]] + s[I[2]] + s[I[3]] + "-" + s[I[4]] + s[I[5]] + "-" + s[I[6] & 15 | p] + s[I[7]] + "-" + s[I[8] & 63 | 128] + s[I[9]] + "-" + s[I[10]] + s[I[11]] + s[I[12]] + s[I[13]] + s[I[14]] + s[I[15]];
        break;
    }
    return N;
  }
  function c(l) {
    return s[l[0]] + s[l[1]] + s[l[2]] + s[l[3]] + "-" + s[l[4]] + s[l[5]] + "-" + s[l[6]] + s[l[7]] + "-" + s[l[8]] + s[l[9]] + "-" + s[l[10]] + s[l[11]] + s[l[12]] + s[l[13]] + s[l[14]] + s[l[15]];
  }
  return Bt.nil = new i("00000000-0000-0000-0000-000000000000"), Bt;
}
var Kt = {}, ui = {}, ys;
function _f() {
  return ys || (ys = 1, (function(e) {
    (function(t) {
      t.parser = function(v, E) {
        return new n(v, E);
      }, t.SAXParser = n, t.SAXStream = l, t.createStream = h, t.MAX_BUFFER_LENGTH = 64 * 1024;
      var r = [
        "comment",
        "sgmlDecl",
        "textNode",
        "tagName",
        "doctype",
        "procInstName",
        "procInstBody",
        "entity",
        "attribName",
        "attribValue",
        "cdata",
        "script"
      ];
      t.EVENTS = [
        "text",
        "processinginstruction",
        "sgmldeclaration",
        "doctype",
        "comment",
        "opentagstart",
        "attribute",
        "opentag",
        "closetag",
        "opencdata",
        "cdata",
        "closecdata",
        "error",
        "end",
        "ready",
        "script",
        "opennamespace",
        "closenamespace"
      ];
      function n(v, E) {
        if (!(this instanceof n))
          return new n(v, E);
        var q = this;
        s(q), q.q = q.c = "", q.bufferCheckPosition = t.MAX_BUFFER_LENGTH, q.encoding = null, q.opt = E || {}, q.opt.lowercase = q.opt.lowercase || q.opt.lowercasetags, q.looseCase = q.opt.lowercase ? "toLowerCase" : "toUpperCase", q.opt.maxEntityCount = q.opt.maxEntityCount || 512, q.opt.maxEntityDepth = q.opt.maxEntityDepth || 4, q.entityCount = q.entityDepth = 0, q.tags = [], q.closed = q.closedRoot = q.sawRoot = !1, q.tag = q.error = null, q.strict = !!v, q.noscript = !!(v || q.opt.noscript), q.state = T.BEGIN, q.strictEntities = q.opt.strictEntities, q.ENTITIES = q.strictEntities ? Object.create(t.XML_ENTITIES) : Object.create(t.ENTITIES), q.attribList = [], q.opt.xmlns && (q.ns = Object.create(m)), q.opt.unquotedAttributeValues === void 0 && (q.opt.unquotedAttributeValues = !v), q.trackPosition = q.opt.position !== !1, q.trackPosition && (q.position = q.line = q.column = 0), L(q, "onready");
      }
      Object.create || (Object.create = function(v) {
        function E() {
        }
        E.prototype = v;
        var q = new E();
        return q;
      }), Object.keys || (Object.keys = function(v) {
        var E = [];
        for (var q in v) v.hasOwnProperty(q) && E.push(q);
        return E;
      });
      function o(v) {
        for (var E = Math.max(t.MAX_BUFFER_LENGTH, 10), q = 0, P = 0, Te = r.length; P < Te; P++) {
          var _e = v[r[P]].length;
          if (_e > E)
            switch (r[P]) {
              case "textNode":
                G(v);
                break;
              case "cdata":
                k(v, "oncdata", v.cdata), v.cdata = "";
                break;
              case "script":
                k(v, "onscript", v.script), v.script = "";
                break;
              default:
                ee(v, "Max buffer length exceeded: " + r[P]);
            }
          q = Math.max(q, _e);
        }
        var Pe = t.MAX_BUFFER_LENGTH - q;
        v.bufferCheckPosition = Pe + v.position;
      }
      function s(v) {
        for (var E = 0, q = r.length; E < q; E++)
          v[r[E]] = "";
      }
      function i(v) {
        G(v), v.cdata !== "" && (k(v, "oncdata", v.cdata), v.cdata = ""), v.script !== "" && (k(v, "onscript", v.script), v.script = "");
      }
      n.prototype = {
        end: function() {
          me(this);
        },
        write: Ie,
        resume: function() {
          return this.error = null, this;
        },
        close: function() {
          return this.write(null);
        },
        flush: function() {
          i(this);
        }
      };
      var d;
      try {
        d = require("stream").Stream;
      } catch {
        d = function() {
        };
      }
      d || (d = function() {
      });
      var a = t.EVENTS.filter(function(v) {
        return v !== "error" && v !== "end";
      });
      function h(v, E) {
        return new l(v, E);
      }
      function c(v, E) {
        if (v.length >= 2) {
          if (v[0] === 255 && v[1] === 254)
            return "utf-16le";
          if (v[0] === 254 && v[1] === 255)
            return "utf-16be";
        }
        return v.length >= 3 && v[0] === 239 && v[1] === 187 && v[2] === 191 ? "utf8" : v.length >= 4 ? v[0] === 60 && v[1] === 0 && v[2] === 63 && v[3] === 0 ? "utf-16le" : v[0] === 0 && v[1] === 60 && v[2] === 0 && v[3] === 63 ? "utf-16be" : "utf8" : E ? "utf8" : null;
      }
      function l(v, E) {
        if (!(this instanceof l))
          return new l(v, E);
        d.apply(this), this._parser = new n(v, E), this.writable = !0, this.readable = !0;
        var q = this;
        this._parser.onend = function() {
          q.emit("end");
        }, this._parser.onerror = function(P) {
          q.emit("error", P), q._parser.error = null;
        }, this._decoder = null, this._decoderBuffer = null, a.forEach(function(P) {
          Object.defineProperty(q, "on" + P, {
            get: function() {
              return q._parser["on" + P];
            },
            set: function(Te) {
              if (!Te)
                return q.removeAllListeners(P), q._parser["on" + P] = Te, Te;
              q.on(P, Te);
            },
            enumerable: !0,
            configurable: !1
          });
        });
      }
      l.prototype = Object.create(d.prototype, {
        constructor: {
          value: l
        }
      }), l.prototype._decodeBuffer = function(v, E) {
        if (this._decoderBuffer && (v = Buffer.concat([this._decoderBuffer, v]), this._decoderBuffer = null), !this._decoder) {
          var q = c(v, E);
          if (!q)
            return this._decoderBuffer = v, "";
          this._parser.encoding = q, this._decoder = new TextDecoder(q);
        }
        return this._decoder.decode(v, { stream: !E });
      }, l.prototype.write = function(v) {
        if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(v))
          v = this._decodeBuffer(v, !1);
        else if (this._decoderBuffer) {
          var E = this._decodeBuffer(Buffer.alloc(0), !0);
          E && (this._parser.write(E), this.emit("data", E));
        }
        return this._parser.write(v.toString()), this.emit("data", v), !0;
      }, l.prototype.end = function(v) {
        if (v && v.length && this.write(v), this._decoderBuffer) {
          var E = this._decodeBuffer(Buffer.alloc(0), !0);
          E && (this._parser.write(E), this.emit("data", E));
        } else if (this._decoder) {
          var q = this._decoder.decode();
          q && (this._parser.write(q), this.emit("data", q));
        }
        return this._parser.end(), !0;
      }, l.prototype.on = function(v, E) {
        var q = this;
        return !q._parser["on" + v] && a.indexOf(v) !== -1 && (q._parser["on" + v] = function() {
          var P = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          P.splice(0, 0, v), q.emit.apply(q, P);
        }), d.prototype.on.call(q, v, E);
      };
      var f = "[CDATA[", p = "DOCTYPE", g = "http://www.w3.org/XML/1998/namespace", y = "http://www.w3.org/2000/xmlns/", m = { xml: g, xmlns: y }, _ = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, I = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, N = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, O = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function R(v) {
        return v === " " || v === `
` || v === "\r" || v === "	";
      }
      function b(v) {
        return v === '"' || v === "'";
      }
      function A(v) {
        return v === ">" || R(v);
      }
      function w(v, E) {
        return v.test(E);
      }
      function C(v, E) {
        return !w(v, E);
      }
      var T = 0;
      t.STATE = {
        BEGIN: T++,
        // leading byte order mark or whitespace
        BEGIN_WHITESPACE: T++,
        // leading whitespace
        TEXT: T++,
        // general stuff
        TEXT_ENTITY: T++,
        // &amp and such.
        OPEN_WAKA: T++,
        // <
        SGML_DECL: T++,
        // <!BLARG
        SGML_DECL_QUOTED: T++,
        // <!BLARG foo "bar
        DOCTYPE: T++,
        // <!DOCTYPE
        DOCTYPE_QUOTED: T++,
        // <!DOCTYPE "//blah
        DOCTYPE_DTD: T++,
        // <!DOCTYPE "//blah" [ ...
        DOCTYPE_DTD_QUOTED: T++,
        // <!DOCTYPE "//blah" [ "foo
        COMMENT_STARTING: T++,
        // <!-
        COMMENT: T++,
        // <!--
        COMMENT_ENDING: T++,
        // <!-- blah -
        COMMENT_ENDED: T++,
        // <!-- blah --
        CDATA: T++,
        // <![CDATA[ something
        CDATA_ENDING: T++,
        // ]
        CDATA_ENDING_2: T++,
        // ]]
        PROC_INST: T++,
        // <?hi
        PROC_INST_BODY: T++,
        // <?hi there
        PROC_INST_ENDING: T++,
        // <?hi "there" ?
        OPEN_TAG: T++,
        // <strong
        OPEN_TAG_SLASH: T++,
        // <strong /
        ATTRIB: T++,
        // <a
        ATTRIB_NAME: T++,
        // <a foo
        ATTRIB_NAME_SAW_WHITE: T++,
        // <a foo _
        ATTRIB_VALUE: T++,
        // <a foo=
        ATTRIB_VALUE_QUOTED: T++,
        // <a foo="bar
        ATTRIB_VALUE_CLOSED: T++,
        // <a foo="bar"
        ATTRIB_VALUE_UNQUOTED: T++,
        // <a foo=bar
        ATTRIB_VALUE_ENTITY_Q: T++,
        // <foo bar="&quot;"
        ATTRIB_VALUE_ENTITY_U: T++,
        // <foo bar=&quot
        CLOSE_TAG: T++,
        // </a
        CLOSE_TAG_SAW_WHITE: T++,
        // </a   >
        SCRIPT: T++,
        // <script> ...
        SCRIPT_ENDING: T++
        // <script> ... <
      }, t.XML_ENTITIES = {
        amp: "&",
        gt: ">",
        lt: "<",
        quot: '"',
        apos: "'"
      }, t.ENTITIES = {
        amp: "&",
        gt: ">",
        lt: "<",
        quot: '"',
        apos: "'",
        AElig: 198,
        Aacute: 193,
        Acirc: 194,
        Agrave: 192,
        Aring: 197,
        Atilde: 195,
        Auml: 196,
        Ccedil: 199,
        ETH: 208,
        Eacute: 201,
        Ecirc: 202,
        Egrave: 200,
        Euml: 203,
        Iacute: 205,
        Icirc: 206,
        Igrave: 204,
        Iuml: 207,
        Ntilde: 209,
        Oacute: 211,
        Ocirc: 212,
        Ograve: 210,
        Oslash: 216,
        Otilde: 213,
        Ouml: 214,
        THORN: 222,
        Uacute: 218,
        Ucirc: 219,
        Ugrave: 217,
        Uuml: 220,
        Yacute: 221,
        aacute: 225,
        acirc: 226,
        aelig: 230,
        agrave: 224,
        aring: 229,
        atilde: 227,
        auml: 228,
        ccedil: 231,
        eacute: 233,
        ecirc: 234,
        egrave: 232,
        eth: 240,
        euml: 235,
        iacute: 237,
        icirc: 238,
        igrave: 236,
        iuml: 239,
        ntilde: 241,
        oacute: 243,
        ocirc: 244,
        ograve: 242,
        oslash: 248,
        otilde: 245,
        ouml: 246,
        szlig: 223,
        thorn: 254,
        uacute: 250,
        ucirc: 251,
        ugrave: 249,
        uuml: 252,
        yacute: 253,
        yuml: 255,
        copy: 169,
        reg: 174,
        nbsp: 160,
        iexcl: 161,
        cent: 162,
        pound: 163,
        curren: 164,
        yen: 165,
        brvbar: 166,
        sect: 167,
        uml: 168,
        ordf: 170,
        laquo: 171,
        not: 172,
        shy: 173,
        macr: 175,
        deg: 176,
        plusmn: 177,
        sup1: 185,
        sup2: 178,
        sup3: 179,
        acute: 180,
        micro: 181,
        para: 182,
        middot: 183,
        cedil: 184,
        ordm: 186,
        raquo: 187,
        frac14: 188,
        frac12: 189,
        frac34: 190,
        iquest: 191,
        times: 215,
        divide: 247,
        OElig: 338,
        oelig: 339,
        Scaron: 352,
        scaron: 353,
        Yuml: 376,
        fnof: 402,
        circ: 710,
        tilde: 732,
        Alpha: 913,
        Beta: 914,
        Gamma: 915,
        Delta: 916,
        Epsilon: 917,
        Zeta: 918,
        Eta: 919,
        Theta: 920,
        Iota: 921,
        Kappa: 922,
        Lambda: 923,
        Mu: 924,
        Nu: 925,
        Xi: 926,
        Omicron: 927,
        Pi: 928,
        Rho: 929,
        Sigma: 931,
        Tau: 932,
        Upsilon: 933,
        Phi: 934,
        Chi: 935,
        Psi: 936,
        Omega: 937,
        alpha: 945,
        beta: 946,
        gamma: 947,
        delta: 948,
        epsilon: 949,
        zeta: 950,
        eta: 951,
        theta: 952,
        iota: 953,
        kappa: 954,
        lambda: 955,
        mu: 956,
        nu: 957,
        xi: 958,
        omicron: 959,
        pi: 960,
        rho: 961,
        sigmaf: 962,
        sigma: 963,
        tau: 964,
        upsilon: 965,
        phi: 966,
        chi: 967,
        psi: 968,
        omega: 969,
        thetasym: 977,
        upsih: 978,
        piv: 982,
        ensp: 8194,
        emsp: 8195,
        thinsp: 8201,
        zwnj: 8204,
        zwj: 8205,
        lrm: 8206,
        rlm: 8207,
        ndash: 8211,
        mdash: 8212,
        lsquo: 8216,
        rsquo: 8217,
        sbquo: 8218,
        ldquo: 8220,
        rdquo: 8221,
        bdquo: 8222,
        dagger: 8224,
        Dagger: 8225,
        bull: 8226,
        hellip: 8230,
        permil: 8240,
        prime: 8242,
        Prime: 8243,
        lsaquo: 8249,
        rsaquo: 8250,
        oline: 8254,
        frasl: 8260,
        euro: 8364,
        image: 8465,
        weierp: 8472,
        real: 8476,
        trade: 8482,
        alefsym: 8501,
        larr: 8592,
        uarr: 8593,
        rarr: 8594,
        darr: 8595,
        harr: 8596,
        crarr: 8629,
        lArr: 8656,
        uArr: 8657,
        rArr: 8658,
        dArr: 8659,
        hArr: 8660,
        forall: 8704,
        part: 8706,
        exist: 8707,
        empty: 8709,
        nabla: 8711,
        isin: 8712,
        notin: 8713,
        ni: 8715,
        prod: 8719,
        sum: 8721,
        minus: 8722,
        lowast: 8727,
        radic: 8730,
        prop: 8733,
        infin: 8734,
        ang: 8736,
        and: 8743,
        or: 8744,
        cap: 8745,
        cup: 8746,
        int: 8747,
        there4: 8756,
        sim: 8764,
        cong: 8773,
        asymp: 8776,
        ne: 8800,
        equiv: 8801,
        le: 8804,
        ge: 8805,
        sub: 8834,
        sup: 8835,
        nsub: 8836,
        sube: 8838,
        supe: 8839,
        oplus: 8853,
        otimes: 8855,
        perp: 8869,
        sdot: 8901,
        lceil: 8968,
        rceil: 8969,
        lfloor: 8970,
        rfloor: 8971,
        lang: 9001,
        rang: 9002,
        loz: 9674,
        spades: 9824,
        clubs: 9827,
        hearts: 9829,
        diams: 9830
      }, Object.keys(t.ENTITIES).forEach(function(v) {
        var E = t.ENTITIES[v], q = typeof E == "number" ? String.fromCharCode(E) : E;
        t.ENTITIES[v] = q;
      });
      for (var U in t.STATE)
        t.STATE[t.STATE[U]] = U;
      T = t.STATE;
      function L(v, E, q) {
        v[E] && v[E](q);
      }
      function $(v) {
        var E = v && v.match(/(?:^|\s)encoding\s*=\s*(['"])([^'"]+)\1/i);
        return E ? E[2] : null;
      }
      function F(v) {
        return v ? v.toLowerCase().replace(/[^a-z0-9]/g, "") : null;
      }
      function x(v, E) {
        const q = F(v), P = F(E);
        return !q || !P ? !0 : P === "utf16" ? q === "utf16le" || q === "utf16be" : q === P;
      }
      function j(v, E) {
        if (!(!v.strict || !v.encoding || !E || E.name !== "xml")) {
          var q = $(E.body);
          q && !x(v.encoding, q) && Z(
            v,
            "XML declaration encoding " + q + " does not match detected stream encoding " + v.encoding.toUpperCase()
          );
        }
      }
      function k(v, E, q) {
        v.textNode && G(v), L(v, E, q);
      }
      function G(v) {
        v.textNode = z(v.opt, v.textNode), v.textNode && L(v, "ontext", v.textNode), v.textNode = "";
      }
      function z(v, E) {
        return v.trim && (E = E.trim()), v.normalize && (E = E.replace(/\s+/g, " ")), E;
      }
      function ee(v, E) {
        return G(v), v.trackPosition && (E += `
Line: ` + v.line + `
Column: ` + v.column + `
Char: ` + v.c), E = new Error(E), v.error = E, L(v, "onerror", E), v;
      }
      function me(v) {
        return v.sawRoot && !v.closedRoot && Z(v, "Unclosed root tag"), v.state !== T.BEGIN && v.state !== T.BEGIN_WHITESPACE && v.state !== T.TEXT && ee(v, "Unexpected end"), G(v), v.c = "", v.closed = !0, L(v, "onend"), n.call(v, v.strict, v.opt), v;
      }
      function Z(v, E) {
        if (typeof v != "object" || !(v instanceof n))
          throw new Error("bad call to strictFail");
        v.strict && ee(v, E);
      }
      function ye(v) {
        v.strict || (v.tagName = v.tagName[v.looseCase]());
        var E = v.tags[v.tags.length - 1] || v, q = v.tag = { name: v.tagName, attributes: {} };
        v.opt.xmlns && (q.ns = E.ns), v.attribList.length = 0, k(v, "onopentagstart", q);
      }
      function ge(v, E) {
        var q = v.indexOf(":"), P = q < 0 ? ["", v] : v.split(":"), Te = P[0], _e = P[1];
        return E && v === "xmlns" && (Te = "xmlns", _e = ""), { prefix: Te, local: _e };
      }
      function Q(v) {
        if (v.strict || (v.attribName = v.attribName[v.looseCase]()), v.attribList.indexOf(v.attribName) !== -1 || v.tag.attributes.hasOwnProperty(v.attribName)) {
          v.attribName = v.attribValue = "";
          return;
        }
        if (v.opt.xmlns) {
          var E = ge(v.attribName, !0), q = E.prefix, P = E.local;
          if (q === "xmlns")
            if (P === "xml" && v.attribValue !== g)
              Z(
                v,
                "xml: prefix must be bound to " + g + `
Actual: ` + v.attribValue
              );
            else if (P === "xmlns" && v.attribValue !== y)
              Z(
                v,
                "xmlns: prefix must be bound to " + y + `
Actual: ` + v.attribValue
              );
            else {
              var Te = v.tag, _e = v.tags[v.tags.length - 1] || v;
              Te.ns === _e.ns && (Te.ns = Object.create(_e.ns)), Te.ns[P] = v.attribValue;
            }
          v.attribList.push([v.attribName, v.attribValue]);
        } else
          v.tag.attributes[v.attribName] = v.attribValue, k(v, "onattribute", {
            name: v.attribName,
            value: v.attribValue
          });
        v.attribName = v.attribValue = "";
      }
      function de(v, E) {
        if (v.opt.xmlns) {
          var q = v.tag, P = ge(v.tagName);
          q.prefix = P.prefix, q.local = P.local, q.uri = q.ns[P.prefix] || "", q.prefix && !q.uri && (Z(
            v,
            "Unbound namespace prefix: " + JSON.stringify(v.tagName)
          ), q.uri = P.prefix);
          var Te = v.tags[v.tags.length - 1] || v;
          q.ns && Te.ns !== q.ns && Object.keys(q.ns).forEach(function(ne) {
            k(v, "onopennamespace", {
              prefix: ne,
              uri: q.ns[ne]
            });
          });
          for (var _e = 0, Pe = v.attribList.length; _e < Pe; _e++) {
            var Me = v.attribList[_e], qe = Me[0], Xe = Me[1], u = ge(qe, !0), B = u.prefix, W = u.local, ie = B === "" ? "" : q.ns[B] || "", V = {
              name: qe,
              value: Xe,
              prefix: B,
              local: W,
              uri: ie
            };
            B && B !== "xmlns" && !ie && (Z(
              v,
              "Unbound namespace prefix: " + JSON.stringify(B)
            ), V.uri = B), v.tag.attributes[qe] = V, k(v, "onattribute", V);
          }
          v.attribList.length = 0;
        }
        v.tag.isSelfClosing = !!E, v.sawRoot = !0, v.tags.push(v.tag), k(v, "onopentag", v.tag), E || (!v.noscript && v.tagName.toLowerCase() === "script" ? v.state = T.SCRIPT : v.state = T.TEXT, v.tag = null, v.tagName = ""), v.attribName = v.attribValue = "", v.attribList.length = 0;
      }
      function we(v) {
        if (!v.tagName) {
          Z(v, "Weird empty close tag."), v.textNode += "</>", v.state = T.TEXT;
          return;
        }
        if (v.script) {
          if (v.tagName !== "script") {
            v.script += "</" + v.tagName + ">", v.tagName = "", v.state = T.SCRIPT;
            return;
          }
          k(v, "onscript", v.script), v.script = "";
        }
        var E = v.tags.length, q = v.tagName;
        v.strict || (q = q[v.looseCase]());
        for (var P = q; E--; ) {
          var Te = v.tags[E];
          if (Te.name !== P)
            Z(v, "Unexpected close tag");
          else
            break;
        }
        if (E < 0) {
          Z(v, "Unmatched closing tag: " + v.tagName), v.textNode += "</" + v.tagName + ">", v.state = T.TEXT;
          return;
        }
        v.tagName = q;
        for (var _e = v.tags.length; _e-- > E; ) {
          var Pe = v.tag = v.tags.pop();
          v.tagName = v.tag.name, k(v, "onclosetag", v.tagName);
          var Me = {};
          for (var qe in Pe.ns)
            Me[qe] = Pe.ns[qe];
          var Xe = v.tags[v.tags.length - 1] || v;
          v.opt.xmlns && Pe.ns !== Xe.ns && Object.keys(Pe.ns).forEach(function(u) {
            var B = Pe.ns[u];
            k(v, "onclosenamespace", { prefix: u, uri: B });
          });
        }
        E === 0 && (v.closedRoot = !0), v.tagName = v.attribValue = v.attribName = "", v.attribList.length = 0, v.state = T.TEXT;
      }
      function Se(v) {
        var E = v.entity, q = E.toLowerCase(), P, Te = "";
        return v.ENTITIES[E] ? v.ENTITIES[E] : v.ENTITIES[q] ? v.ENTITIES[q] : (E = q, E.charAt(0) === "#" && (E.charAt(1) === "x" ? (E = E.slice(2), P = parseInt(E, 16), Te = P.toString(16)) : (E = E.slice(1), P = parseInt(E, 10), Te = P.toString(10))), E = E.replace(/^0+/, ""), isNaN(P) || Te.toLowerCase() !== E || P < 0 || P > 1114111 ? (Z(v, "Invalid character entity"), "&" + v.entity + ";") : String.fromCodePoint(P));
      }
      function De(v, E) {
        E === "<" ? (v.state = T.OPEN_WAKA, v.startTagPosition = v.position) : R(E) || (Z(v, "Non-whitespace before first tag."), v.textNode = E, v.state = T.TEXT);
      }
      function Ne(v, E) {
        var q = "";
        return E < v.length && (q = v.charAt(E)), q;
      }
      function Ie(v) {
        var E = this;
        if (this.error)
          throw this.error;
        if (E.closed)
          return ee(
            E,
            "Cannot write after close. Assign an onready handler."
          );
        if (v === null)
          return me(E);
        typeof v == "object" && (v = v.toString());
        for (var q = 0, P = ""; P = Ne(v, q++), E.c = P, !!P; )
          switch (E.trackPosition && (E.position++, P === `
` ? (E.line++, E.column = 0) : E.column++), E.state) {
            case T.BEGIN:
              if (E.state = T.BEGIN_WHITESPACE, P === "\uFEFF")
                continue;
              De(E, P);
              continue;
            case T.BEGIN_WHITESPACE:
              De(E, P);
              continue;
            case T.TEXT:
              if (E.sawRoot && !E.closedRoot) {
                for (var _e = q - 1; P && P !== "<" && P !== "&"; )
                  P = Ne(v, q++), P && E.trackPosition && (E.position++, P === `
` ? (E.line++, E.column = 0) : E.column++);
                E.textNode += v.substring(_e, q - 1);
              }
              P === "<" && !(E.sawRoot && E.closedRoot && !E.strict) ? (E.state = T.OPEN_WAKA, E.startTagPosition = E.position) : (!R(P) && (!E.sawRoot || E.closedRoot) && Z(E, "Text data outside of root node."), P === "&" ? E.state = T.TEXT_ENTITY : E.textNode += P);
              continue;
            case T.SCRIPT:
              P === "<" ? E.state = T.SCRIPT_ENDING : E.script += P;
              continue;
            case T.SCRIPT_ENDING:
              P === "/" ? E.state = T.CLOSE_TAG : (E.script += "<" + P, E.state = T.SCRIPT);
              continue;
            case T.OPEN_WAKA:
              if (P === "!")
                E.state = T.SGML_DECL, E.sgmlDecl = "";
              else if (!R(P)) if (w(_, P))
                E.state = T.OPEN_TAG, E.tagName = P;
              else if (P === "/")
                E.state = T.CLOSE_TAG, E.tagName = "";
              else if (P === "?")
                E.state = T.PROC_INST, E.procInstName = E.procInstBody = "";
              else {
                if (Z(E, "Unencoded <"), E.startTagPosition + 1 < E.position) {
                  var Te = E.position - E.startTagPosition;
                  P = new Array(Te).join(" ") + P;
                }
                E.textNode += "<" + P, E.state = T.TEXT;
              }
              continue;
            case T.SGML_DECL:
              if (E.sgmlDecl + P === "--") {
                E.state = T.COMMENT, E.comment = "", E.sgmlDecl = "";
                continue;
              }
              E.doctype && E.doctype !== !0 && E.sgmlDecl ? (E.state = T.DOCTYPE_DTD, E.doctype += "<!" + E.sgmlDecl + P, E.sgmlDecl = "") : (E.sgmlDecl + P).toUpperCase() === f ? (k(E, "onopencdata"), E.state = T.CDATA, E.sgmlDecl = "", E.cdata = "") : (E.sgmlDecl + P).toUpperCase() === p ? (E.state = T.DOCTYPE, (E.doctype || E.sawRoot) && Z(
                E,
                "Inappropriately located doctype declaration"
              ), E.doctype = "", E.sgmlDecl = "") : P === ">" ? (k(E, "onsgmldeclaration", E.sgmlDecl), E.sgmlDecl = "", E.state = T.TEXT) : (b(P) && (E.state = T.SGML_DECL_QUOTED), E.sgmlDecl += P);
              continue;
            case T.SGML_DECL_QUOTED:
              P === E.q && (E.state = T.SGML_DECL, E.q = ""), E.sgmlDecl += P;
              continue;
            case T.DOCTYPE:
              P === ">" ? (E.state = T.TEXT, k(E, "ondoctype", E.doctype), E.doctype = !0) : (E.doctype += P, P === "[" ? E.state = T.DOCTYPE_DTD : b(P) && (E.state = T.DOCTYPE_QUOTED, E.q = P));
              continue;
            case T.DOCTYPE_QUOTED:
              E.doctype += P, P === E.q && (E.q = "", E.state = T.DOCTYPE);
              continue;
            case T.DOCTYPE_DTD:
              P === "]" ? (E.doctype += P, E.state = T.DOCTYPE) : P === "<" ? (E.state = T.OPEN_WAKA, E.startTagPosition = E.position) : b(P) ? (E.doctype += P, E.state = T.DOCTYPE_DTD_QUOTED, E.q = P) : E.doctype += P;
              continue;
            case T.DOCTYPE_DTD_QUOTED:
              E.doctype += P, P === E.q && (E.state = T.DOCTYPE_DTD, E.q = "");
              continue;
            case T.COMMENT:
              P === "-" ? E.state = T.COMMENT_ENDING : E.comment += P;
              continue;
            case T.COMMENT_ENDING:
              P === "-" ? (E.state = T.COMMENT_ENDED, E.comment = z(E.opt, E.comment), E.comment && k(E, "oncomment", E.comment), E.comment = "") : (E.comment += "-" + P, E.state = T.COMMENT);
              continue;
            case T.COMMENT_ENDED:
              P !== ">" ? (Z(E, "Malformed comment"), E.comment += "--" + P, E.state = T.COMMENT) : E.doctype && E.doctype !== !0 ? E.state = T.DOCTYPE_DTD : E.state = T.TEXT;
              continue;
            case T.CDATA:
              for (var _e = q - 1; P && P !== "]"; )
                P = Ne(v, q++), P && E.trackPosition && (E.position++, P === `
` ? (E.line++, E.column = 0) : E.column++);
              E.cdata += v.substring(_e, q - 1), P === "]" && (E.state = T.CDATA_ENDING);
              continue;
            case T.CDATA_ENDING:
              P === "]" ? E.state = T.CDATA_ENDING_2 : (E.cdata += "]" + P, E.state = T.CDATA);
              continue;
            case T.CDATA_ENDING_2:
              P === ">" ? (E.cdata && k(E, "oncdata", E.cdata), k(E, "onclosecdata"), E.cdata = "", E.state = T.TEXT) : P === "]" ? E.cdata += "]" : (E.cdata += "]]" + P, E.state = T.CDATA);
              continue;
            case T.PROC_INST:
              P === "?" ? E.state = T.PROC_INST_ENDING : R(P) ? E.state = T.PROC_INST_BODY : E.procInstName += P;
              continue;
            case T.PROC_INST_BODY:
              if (!E.procInstBody && R(P))
                continue;
              P === "?" ? E.state = T.PROC_INST_ENDING : E.procInstBody += P;
              continue;
            case T.PROC_INST_ENDING:
              if (P === ">") {
                const Xe = {
                  name: E.procInstName,
                  body: E.procInstBody
                };
                j(E, Xe), k(E, "onprocessinginstruction", Xe), E.procInstName = E.procInstBody = "", E.state = T.TEXT;
              } else
                E.procInstBody += "?" + P, E.state = T.PROC_INST_BODY;
              continue;
            case T.OPEN_TAG:
              w(I, P) ? E.tagName += P : (ye(E), P === ">" ? de(E) : P === "/" ? E.state = T.OPEN_TAG_SLASH : (R(P) || Z(E, "Invalid character in tag name"), E.state = T.ATTRIB));
              continue;
            case T.OPEN_TAG_SLASH:
              P === ">" ? (de(E, !0), we(E)) : (Z(
                E,
                "Forward-slash in opening tag not followed by >"
              ), E.state = T.ATTRIB);
              continue;
            case T.ATTRIB:
              if (R(P))
                continue;
              P === ">" ? de(E) : P === "/" ? E.state = T.OPEN_TAG_SLASH : w(_, P) ? (E.attribName = P, E.attribValue = "", E.state = T.ATTRIB_NAME) : Z(E, "Invalid attribute name");
              continue;
            case T.ATTRIB_NAME:
              P === "=" ? E.state = T.ATTRIB_VALUE : P === ">" ? (Z(E, "Attribute without value"), E.attribValue = E.attribName, Q(E), de(E)) : R(P) ? E.state = T.ATTRIB_NAME_SAW_WHITE : w(I, P) ? E.attribName += P : Z(E, "Invalid attribute name");
              continue;
            case T.ATTRIB_NAME_SAW_WHITE:
              if (P === "=")
                E.state = T.ATTRIB_VALUE;
              else {
                if (R(P))
                  continue;
                Z(E, "Attribute without value"), E.tag.attributes[E.attribName] = "", E.attribValue = "", k(E, "onattribute", {
                  name: E.attribName,
                  value: ""
                }), E.attribName = "", P === ">" ? de(E) : w(_, P) ? (E.attribName = P, E.state = T.ATTRIB_NAME) : (Z(E, "Invalid attribute name"), E.state = T.ATTRIB);
              }
              continue;
            case T.ATTRIB_VALUE:
              if (R(P))
                continue;
              b(P) ? (E.q = P, E.state = T.ATTRIB_VALUE_QUOTED) : (E.opt.unquotedAttributeValues || ee(E, "Unquoted attribute value"), E.state = T.ATTRIB_VALUE_UNQUOTED, E.attribValue = P);
              continue;
            case T.ATTRIB_VALUE_QUOTED:
              if (P !== E.q) {
                P === "&" ? E.state = T.ATTRIB_VALUE_ENTITY_Q : E.attribValue += P;
                continue;
              }
              Q(E), E.q = "", E.state = T.ATTRIB_VALUE_CLOSED;
              continue;
            case T.ATTRIB_VALUE_CLOSED:
              R(P) ? E.state = T.ATTRIB : P === ">" ? de(E) : P === "/" ? E.state = T.OPEN_TAG_SLASH : w(_, P) ? (Z(E, "No whitespace between attributes"), E.attribName = P, E.attribValue = "", E.state = T.ATTRIB_NAME) : Z(E, "Invalid attribute name");
              continue;
            case T.ATTRIB_VALUE_UNQUOTED:
              if (!A(P)) {
                P === "&" ? E.state = T.ATTRIB_VALUE_ENTITY_U : E.attribValue += P;
                continue;
              }
              Q(E), P === ">" ? de(E) : E.state = T.ATTRIB;
              continue;
            case T.CLOSE_TAG:
              if (E.tagName)
                P === ">" ? we(E) : w(I, P) ? E.tagName += P : E.script ? (E.script += "</" + E.tagName + P, E.tagName = "", E.state = T.SCRIPT) : (R(P) || Z(E, "Invalid tagname in closing tag"), E.state = T.CLOSE_TAG_SAW_WHITE);
              else {
                if (R(P))
                  continue;
                C(_, P) ? E.script ? (E.script += "</" + P, E.state = T.SCRIPT) : Z(E, "Invalid tagname in closing tag.") : E.tagName = P;
              }
              continue;
            case T.CLOSE_TAG_SAW_WHITE:
              if (R(P))
                continue;
              P === ">" ? we(E) : Z(E, "Invalid characters in closing tag");
              continue;
            case T.TEXT_ENTITY:
            case T.ATTRIB_VALUE_ENTITY_Q:
            case T.ATTRIB_VALUE_ENTITY_U:
              var Pe, Me;
              switch (E.state) {
                case T.TEXT_ENTITY:
                  Pe = T.TEXT, Me = "textNode";
                  break;
                case T.ATTRIB_VALUE_ENTITY_Q:
                  Pe = T.ATTRIB_VALUE_QUOTED, Me = "attribValue";
                  break;
                case T.ATTRIB_VALUE_ENTITY_U:
                  Pe = T.ATTRIB_VALUE_UNQUOTED, Me = "attribValue";
                  break;
              }
              if (P === ";") {
                var qe = Se(E);
                E.opt.unparsedEntities && !Object.values(t.XML_ENTITIES).includes(qe) ? ((E.entityCount += 1) > E.opt.maxEntityCount && ee(
                  E,
                  "Parsed entity count exceeds max entity count"
                ), (E.entityDepth += 1) > E.opt.maxEntityDepth && ee(
                  E,
                  "Parsed entity depth exceeds max entity depth"
                ), E.entity = "", E.state = Pe, E.write(qe), E.entityDepth -= 1) : (E[Me] += qe, E.entity = "", E.state = Pe);
              } else w(E.entity.length ? O : N, P) ? E.entity += P : (Z(E, "Invalid character in entity name"), E[Me] += "&" + E.entity + P, E.entity = "", E.state = Pe);
              continue;
            default:
              throw new Error(E, "Unknown state: " + E.state);
          }
        return E.position >= E.bufferCheckPosition && o(E), E;
      }
      String.fromCodePoint || (function() {
        var v = String.fromCharCode, E = Math.floor, q = function() {
          var P = 16384, Te = [], _e, Pe, Me = -1, qe = arguments.length;
          if (!qe)
            return "";
          for (var Xe = ""; ++Me < qe; ) {
            var u = Number(arguments[Me]);
            if (!isFinite(u) || // `NaN`, `+Infinity`, or `-Infinity`
            u < 0 || // not a valid Unicode code point
            u > 1114111 || // not a valid Unicode code point
            E(u) !== u)
              throw RangeError("Invalid code point: " + u);
            u <= 65535 ? Te.push(u) : (u -= 65536, _e = (u >> 10) + 55296, Pe = u % 1024 + 56320, Te.push(_e, Pe)), (Me + 1 === qe || Te.length > P) && (Xe += v.apply(null, Te), Te.length = 0);
          }
          return Xe;
        };
        Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
          value: q,
          configurable: !0,
          writable: !0
        }) : String.fromCodePoint = q;
      })();
    })(e);
  })(ui)), ui;
}
var ws;
function If() {
  if (ws) return Kt;
  ws = 1, Object.defineProperty(Kt, "__esModule", { value: !0 }), Kt.XElement = void 0, Kt.parseXml = i;
  const e = _f(), t = hn();
  class r {
    constructor(a) {
      if (this.name = a, this.value = "", this.attributes = null, this.isCData = !1, this.elements = null, !a)
        throw (0, t.newError)("Element name cannot be empty", "ERR_XML_ELEMENT_NAME_EMPTY");
      if (!o(a))
        throw (0, t.newError)(`Invalid element name: ${a}`, "ERR_XML_ELEMENT_INVALID_NAME");
    }
    attribute(a) {
      const h = this.attributes === null ? null : this.attributes[a];
      if (h == null)
        throw (0, t.newError)(`No attribute "${a}"`, "ERR_XML_MISSED_ATTRIBUTE");
      return h;
    }
    removeAttribute(a) {
      this.attributes !== null && delete this.attributes[a];
    }
    element(a, h = !1, c = null) {
      const l = this.elementOrNull(a, h);
      if (l === null)
        throw (0, t.newError)(c || `No element "${a}"`, "ERR_XML_MISSED_ELEMENT");
      return l;
    }
    elementOrNull(a, h = !1) {
      if (this.elements === null)
        return null;
      for (const c of this.elements)
        if (s(c, a, h))
          return c;
      return null;
    }
    getElements(a, h = !1) {
      return this.elements === null ? [] : this.elements.filter((c) => s(c, a, h));
    }
    elementValueOrEmpty(a, h = !1) {
      const c = this.elementOrNull(a, h);
      return c === null ? "" : c.value;
    }
  }
  Kt.XElement = r;
  const n = new RegExp(/^[A-Za-z_][:A-Za-z0-9_-]*$/i);
  function o(d) {
    return n.test(d);
  }
  function s(d, a, h) {
    const c = d.name;
    return c === a || h === !0 && c.length === a.length && c.toLowerCase() === a.toLowerCase();
  }
  function i(d) {
    let a = null;
    const h = e.parser(!0, {}), c = [];
    return h.onopentag = (l) => {
      const f = new r(l.name);
      if (f.attributes = l.attributes, a === null)
        a = f;
      else {
        const p = c[c.length - 1];
        p.elements == null && (p.elements = []), p.elements.push(f);
      }
      c.push(f);
    }, h.onclosetag = () => {
      c.pop();
    }, h.ontext = (l) => {
      c.length > 0 && (c[c.length - 1].value = l);
    }, h.oncdata = (l) => {
      const f = c[c.length - 1];
      f.value = l, f.isCData = !0;
    }, h.onerror = (l) => {
      throw l;
    }, h.write(d), a;
  }
  return Kt;
}
var vs;
function Ge() {
  return vs || (vs = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CURRENT_APP_PACKAGE_FILE_NAME = e.CURRENT_APP_INSTALLER_FILE_NAME = e.XElement = e.parseXml = e.UUID = e.parseDn = e.retry = e.githubTagPrefix = e.githubUrl = e.getS3LikeProviderBaseUrl = e.ProgressCallbackTransform = e.MemoLazy = e.safeStringifyJson = e.safeGetHeader = e.parseJson = e.HttpExecutor = e.HttpError = e.DigestTransform = e.createHttpError = e.configureRequestUrl = e.configureRequestOptionsFromUrl = e.configureRequestOptions = e.newError = e.CancellationToken = e.CancellationError = void 0, e.asArray = l;
    var t = jo();
    Object.defineProperty(e, "CancellationError", { enumerable: !0, get: function() {
      return t.CancellationError;
    } }), Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
      return t.CancellationToken;
    } });
    var r = hn();
    Object.defineProperty(e, "newError", { enumerable: !0, get: function() {
      return r.newError;
    } });
    var n = gf();
    Object.defineProperty(e, "configureRequestOptions", { enumerable: !0, get: function() {
      return n.configureRequestOptions;
    } }), Object.defineProperty(e, "configureRequestOptionsFromUrl", { enumerable: !0, get: function() {
      return n.configureRequestOptionsFromUrl;
    } }), Object.defineProperty(e, "configureRequestUrl", { enumerable: !0, get: function() {
      return n.configureRequestUrl;
    } }), Object.defineProperty(e, "createHttpError", { enumerable: !0, get: function() {
      return n.createHttpError;
    } }), Object.defineProperty(e, "DigestTransform", { enumerable: !0, get: function() {
      return n.DigestTransform;
    } }), Object.defineProperty(e, "HttpError", { enumerable: !0, get: function() {
      return n.HttpError;
    } }), Object.defineProperty(e, "HttpExecutor", { enumerable: !0, get: function() {
      return n.HttpExecutor;
    } }), Object.defineProperty(e, "parseJson", { enumerable: !0, get: function() {
      return n.parseJson;
    } }), Object.defineProperty(e, "safeGetHeader", { enumerable: !0, get: function() {
      return n.safeGetHeader;
    } }), Object.defineProperty(e, "safeStringifyJson", { enumerable: !0, get: function() {
      return n.safeStringifyJson;
    } });
    var o = Ef();
    Object.defineProperty(e, "MemoLazy", { enumerable: !0, get: function() {
      return o.MemoLazy;
    } });
    var s = Uc();
    Object.defineProperty(e, "ProgressCallbackTransform", { enumerable: !0, get: function() {
      return s.ProgressCallbackTransform;
    } });
    var i = yf();
    Object.defineProperty(e, "getS3LikeProviderBaseUrl", { enumerable: !0, get: function() {
      return i.getS3LikeProviderBaseUrl;
    } }), Object.defineProperty(e, "githubUrl", { enumerable: !0, get: function() {
      return i.githubUrl;
    } }), Object.defineProperty(e, "githubTagPrefix", { enumerable: !0, get: function() {
      return i.githubTagPrefix;
    } });
    var d = wf();
    Object.defineProperty(e, "retry", { enumerable: !0, get: function() {
      return d.retry;
    } });
    var a = vf();
    Object.defineProperty(e, "parseDn", { enumerable: !0, get: function() {
      return a.parseDn;
    } });
    var h = Tf();
    Object.defineProperty(e, "UUID", { enumerable: !0, get: function() {
      return h.UUID;
    } });
    var c = If();
    Object.defineProperty(e, "parseXml", { enumerable: !0, get: function() {
      return c.parseXml;
    } }), Object.defineProperty(e, "XElement", { enumerable: !0, get: function() {
      return c.XElement;
    } }), e.CURRENT_APP_INSTALLER_FILE_NAME = "installer.exe", e.CURRENT_APP_PACKAGE_FILE_NAME = "package.7z";
    function l(f) {
      return f == null ? [] : Array.isArray(f) ? f : [f];
    }
  })(oi)), oi;
}
var Qe = {}, nn = {}, Ct = {}, Ts;
function $r() {
  if (Ts) return Ct;
  Ts = 1;
  function e(i) {
    return typeof i > "u" || i === null;
  }
  function t(i) {
    return typeof i == "object" && i !== null;
  }
  function r(i) {
    return Array.isArray(i) ? i : e(i) ? [] : [i];
  }
  function n(i, d) {
    var a, h, c, l;
    if (d)
      for (l = Object.keys(d), a = 0, h = l.length; a < h; a += 1)
        c = l[a], i[c] = d[c];
    return i;
  }
  function o(i, d) {
    var a = "", h;
    for (h = 0; h < d; h += 1)
      a += i;
    return a;
  }
  function s(i) {
    return i === 0 && Number.NEGATIVE_INFINITY === 1 / i;
  }
  return Ct.isNothing = e, Ct.isObject = t, Ct.toArray = r, Ct.repeat = o, Ct.isNegativeZero = s, Ct.extend = n, Ct;
}
var di, _s;
function Mr() {
  if (_s) return di;
  _s = 1;
  function e(r, n) {
    var o = "", s = r.reason || "(unknown reason)";
    return r.mark ? (r.mark.name && (o += 'in "' + r.mark.name + '" '), o += "(" + (r.mark.line + 1) + ":" + (r.mark.column + 1) + ")", !n && r.mark.snippet && (o += `

` + r.mark.snippet), s + " " + o) : s;
  }
  function t(r, n) {
    Error.call(this), this.name = "YAMLException", this.reason = r, this.mark = n, this.message = e(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
  }
  return t.prototype = Object.create(Error.prototype), t.prototype.constructor = t, t.prototype.toString = function(n) {
    return this.name + ": " + e(this, n);
  }, di = t, di;
}
var fi, Is;
function Sf() {
  if (Is) return fi;
  Is = 1;
  var e = $r();
  function t(o, s, i, d, a) {
    var h = "", c = "", l = Math.floor(a / 2) - 1;
    return d - s > l && (h = " ... ", s = d - l + h.length), i - d > l && (c = " ...", i = d + l - c.length), {
      str: h + o.slice(s, i).replace(/\t/g, "→") + c,
      pos: d - s + h.length
      // relative position
    };
  }
  function r(o, s) {
    return e.repeat(" ", s - o.length) + o;
  }
  function n(o, s) {
    if (s = Object.create(s || null), !o.buffer) return null;
    s.maxLength || (s.maxLength = 79), typeof s.indent != "number" && (s.indent = 1), typeof s.linesBefore != "number" && (s.linesBefore = 3), typeof s.linesAfter != "number" && (s.linesAfter = 2);
    for (var i = /\r?\n|\r|\0/g, d = [0], a = [], h, c = -1; h = i.exec(o.buffer); )
      a.push(h.index), d.push(h.index + h[0].length), o.position <= h.index && c < 0 && (c = d.length - 2);
    c < 0 && (c = d.length - 1);
    var l = "", f, p, g = Math.min(o.line + s.linesAfter, a.length).toString().length, y = s.maxLength - (s.indent + g + 3);
    for (f = 1; f <= s.linesBefore && !(c - f < 0); f++)
      p = t(
        o.buffer,
        d[c - f],
        a[c - f],
        o.position - (d[c] - d[c - f]),
        y
      ), l = e.repeat(" ", s.indent) + r((o.line - f + 1).toString(), g) + " | " + p.str + `
` + l;
    for (p = t(o.buffer, d[c], a[c], o.position, y), l += e.repeat(" ", s.indent) + r((o.line + 1).toString(), g) + " | " + p.str + `
`, l += e.repeat("-", s.indent + g + 3 + p.pos) + `^
`, f = 1; f <= s.linesAfter && !(c + f >= a.length); f++)
      p = t(
        o.buffer,
        d[c + f],
        a[c + f],
        o.position - (d[c] - d[c + f]),
        y
      ), l += e.repeat(" ", s.indent) + r((o.line + f + 1).toString(), g) + " | " + p.str + `
`;
    return l.replace(/\n$/, "");
  }
  return fi = n, fi;
}
var hi, Ss;
function Ze() {
  if (Ss) return hi;
  Ss = 1;
  var e = Mr(), t = [
    "kind",
    "multi",
    "resolve",
    "construct",
    "instanceOf",
    "predicate",
    "represent",
    "representName",
    "defaultStyle",
    "styleAliases"
  ], r = [
    "scalar",
    "sequence",
    "mapping"
  ];
  function n(s) {
    var i = {};
    return s !== null && Object.keys(s).forEach(function(d) {
      s[d].forEach(function(a) {
        i[String(a)] = d;
      });
    }), i;
  }
  function o(s, i) {
    if (i = i || {}, Object.keys(i).forEach(function(d) {
      if (t.indexOf(d) === -1)
        throw new e('Unknown option "' + d + '" is met in definition of "' + s + '" YAML type.');
    }), this.options = i, this.tag = s, this.kind = i.kind || null, this.resolve = i.resolve || function() {
      return !0;
    }, this.construct = i.construct || function(d) {
      return d;
    }, this.instanceOf = i.instanceOf || null, this.predicate = i.predicate || null, this.represent = i.represent || null, this.representName = i.representName || null, this.defaultStyle = i.defaultStyle || null, this.multi = i.multi || !1, this.styleAliases = n(i.styleAliases || null), r.indexOf(this.kind) === -1)
      throw new e('Unknown kind "' + this.kind + '" is specified for "' + s + '" YAML type.');
  }
  return hi = o, hi;
}
var pi, As;
function kc() {
  if (As) return pi;
  As = 1;
  var e = Mr(), t = Ze();
  function r(s, i) {
    var d = [];
    return s[i].forEach(function(a) {
      var h = d.length;
      d.forEach(function(c, l) {
        c.tag === a.tag && c.kind === a.kind && c.multi === a.multi && (h = l);
      }), d[h] = a;
    }), d;
  }
  function n() {
    var s = {
      scalar: {},
      sequence: {},
      mapping: {},
      fallback: {},
      multi: {
        scalar: [],
        sequence: [],
        mapping: [],
        fallback: []
      }
    }, i, d;
    function a(h) {
      h.multi ? (s.multi[h.kind].push(h), s.multi.fallback.push(h)) : s[h.kind][h.tag] = s.fallback[h.tag] = h;
    }
    for (i = 0, d = arguments.length; i < d; i += 1)
      arguments[i].forEach(a);
    return s;
  }
  function o(s) {
    return this.extend(s);
  }
  return o.prototype.extend = function(i) {
    var d = [], a = [];
    if (i instanceof t)
      a.push(i);
    else if (Array.isArray(i))
      a = a.concat(i);
    else if (i && (Array.isArray(i.implicit) || Array.isArray(i.explicit)))
      i.implicit && (d = d.concat(i.implicit)), i.explicit && (a = a.concat(i.explicit));
    else
      throw new e("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
    d.forEach(function(c) {
      if (!(c instanceof t))
        throw new e("Specified list of YAML types (or a single Type object) contains a non-Type object.");
      if (c.loadKind && c.loadKind !== "scalar")
        throw new e("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
      if (c.multi)
        throw new e("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }), a.forEach(function(c) {
      if (!(c instanceof t))
        throw new e("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    });
    var h = Object.create(o.prototype);
    return h.implicit = (this.implicit || []).concat(d), h.explicit = (this.explicit || []).concat(a), h.compiledImplicit = r(h, "implicit"), h.compiledExplicit = r(h, "explicit"), h.compiledTypeMap = n(h.compiledImplicit, h.compiledExplicit), h;
  }, pi = o, pi;
}
var mi, Rs;
function $c() {
  if (Rs) return mi;
  Rs = 1;
  var e = Ze();
  return mi = new e("tag:yaml.org,2002:str", {
    kind: "scalar",
    construct: function(t) {
      return t !== null ? t : "";
    }
  }), mi;
}
var gi, bs;
function Mc() {
  if (bs) return gi;
  bs = 1;
  var e = Ze();
  return gi = new e("tag:yaml.org,2002:seq", {
    kind: "sequence",
    construct: function(t) {
      return t !== null ? t : [];
    }
  }), gi;
}
var Ei, Cs;
function qc() {
  if (Cs) return Ei;
  Cs = 1;
  var e = Ze();
  return Ei = new e("tag:yaml.org,2002:map", {
    kind: "mapping",
    construct: function(t) {
      return t !== null ? t : {};
    }
  }), Ei;
}
var yi, Ns;
function Bc() {
  if (Ns) return yi;
  Ns = 1;
  var e = kc();
  return yi = new e({
    explicit: [
      $c(),
      Mc(),
      qc()
    ]
  }), yi;
}
var wi, Ds;
function Hc() {
  if (Ds) return wi;
  Ds = 1;
  var e = Ze();
  function t(o) {
    if (o === null) return !0;
    var s = o.length;
    return s === 1 && o === "~" || s === 4 && (o === "null" || o === "Null" || o === "NULL");
  }
  function r() {
    return null;
  }
  function n(o) {
    return o === null;
  }
  return wi = new e("tag:yaml.org,2002:null", {
    kind: "scalar",
    resolve: t,
    construct: r,
    predicate: n,
    represent: {
      canonical: function() {
        return "~";
      },
      lowercase: function() {
        return "null";
      },
      uppercase: function() {
        return "NULL";
      },
      camelcase: function() {
        return "Null";
      },
      empty: function() {
        return "";
      }
    },
    defaultStyle: "lowercase"
  }), wi;
}
var vi, Os;
function jc() {
  if (Os) return vi;
  Os = 1;
  var e = Ze();
  function t(o) {
    if (o === null) return !1;
    var s = o.length;
    return s === 4 && (o === "true" || o === "True" || o === "TRUE") || s === 5 && (o === "false" || o === "False" || o === "FALSE");
  }
  function r(o) {
    return o === "true" || o === "True" || o === "TRUE";
  }
  function n(o) {
    return Object.prototype.toString.call(o) === "[object Boolean]";
  }
  return vi = new e("tag:yaml.org,2002:bool", {
    kind: "scalar",
    resolve: t,
    construct: r,
    predicate: n,
    represent: {
      lowercase: function(o) {
        return o ? "true" : "false";
      },
      uppercase: function(o) {
        return o ? "TRUE" : "FALSE";
      },
      camelcase: function(o) {
        return o ? "True" : "False";
      }
    },
    defaultStyle: "lowercase"
  }), vi;
}
var Ti, Ps;
function Gc() {
  if (Ps) return Ti;
  Ps = 1;
  var e = $r(), t = Ze();
  function r(a) {
    return 48 <= a && a <= 57 || 65 <= a && a <= 70 || 97 <= a && a <= 102;
  }
  function n(a) {
    return 48 <= a && a <= 55;
  }
  function o(a) {
    return 48 <= a && a <= 57;
  }
  function s(a) {
    if (a === null) return !1;
    var h = a.length, c = 0, l = !1, f;
    if (!h) return !1;
    if (f = a[c], (f === "-" || f === "+") && (f = a[++c]), f === "0") {
      if (c + 1 === h) return !0;
      if (f = a[++c], f === "b") {
        for (c++; c < h; c++)
          if (f = a[c], f !== "_") {
            if (f !== "0" && f !== "1") return !1;
            l = !0;
          }
        return l && f !== "_";
      }
      if (f === "x") {
        for (c++; c < h; c++)
          if (f = a[c], f !== "_") {
            if (!r(a.charCodeAt(c))) return !1;
            l = !0;
          }
        return l && f !== "_";
      }
      if (f === "o") {
        for (c++; c < h; c++)
          if (f = a[c], f !== "_") {
            if (!n(a.charCodeAt(c))) return !1;
            l = !0;
          }
        return l && f !== "_";
      }
    }
    if (f === "_") return !1;
    for (; c < h; c++)
      if (f = a[c], f !== "_") {
        if (!o(a.charCodeAt(c)))
          return !1;
        l = !0;
      }
    return !(!l || f === "_");
  }
  function i(a) {
    var h = a, c = 1, l;
    if (h.indexOf("_") !== -1 && (h = h.replace(/_/g, "")), l = h[0], (l === "-" || l === "+") && (l === "-" && (c = -1), h = h.slice(1), l = h[0]), h === "0") return 0;
    if (l === "0") {
      if (h[1] === "b") return c * parseInt(h.slice(2), 2);
      if (h[1] === "x") return c * parseInt(h.slice(2), 16);
      if (h[1] === "o") return c * parseInt(h.slice(2), 8);
    }
    return c * parseInt(h, 10);
  }
  function d(a) {
    return Object.prototype.toString.call(a) === "[object Number]" && a % 1 === 0 && !e.isNegativeZero(a);
  }
  return Ti = new t("tag:yaml.org,2002:int", {
    kind: "scalar",
    resolve: s,
    construct: i,
    predicate: d,
    represent: {
      binary: function(a) {
        return a >= 0 ? "0b" + a.toString(2) : "-0b" + a.toString(2).slice(1);
      },
      octal: function(a) {
        return a >= 0 ? "0o" + a.toString(8) : "-0o" + a.toString(8).slice(1);
      },
      decimal: function(a) {
        return a.toString(10);
      },
      /* eslint-disable max-len */
      hexadecimal: function(a) {
        return a >= 0 ? "0x" + a.toString(16).toUpperCase() : "-0x" + a.toString(16).toUpperCase().slice(1);
      }
    },
    defaultStyle: "decimal",
    styleAliases: {
      binary: [2, "bin"],
      octal: [8, "oct"],
      decimal: [10, "dec"],
      hexadecimal: [16, "hex"]
    }
  }), Ti;
}
var _i, Fs;
function Wc() {
  if (Fs) return _i;
  Fs = 1;
  var e = $r(), t = Ze(), r = new RegExp(
    // 2.5e4, 2.5 and integers
    "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
  );
  function n(a) {
    return !(a === null || !r.test(a) || // Quick hack to not allow integers end with `_`
    // Probably should update regexp & check speed
    a[a.length - 1] === "_");
  }
  function o(a) {
    var h, c;
    return h = a.replace(/_/g, "").toLowerCase(), c = h[0] === "-" ? -1 : 1, "+-".indexOf(h[0]) >= 0 && (h = h.slice(1)), h === ".inf" ? c === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : h === ".nan" ? NaN : c * parseFloat(h, 10);
  }
  var s = /^[-+]?[0-9]+e/;
  function i(a, h) {
    var c;
    if (isNaN(a))
      switch (h) {
        case "lowercase":
          return ".nan";
        case "uppercase":
          return ".NAN";
        case "camelcase":
          return ".NaN";
      }
    else if (Number.POSITIVE_INFINITY === a)
      switch (h) {
        case "lowercase":
          return ".inf";
        case "uppercase":
          return ".INF";
        case "camelcase":
          return ".Inf";
      }
    else if (Number.NEGATIVE_INFINITY === a)
      switch (h) {
        case "lowercase":
          return "-.inf";
        case "uppercase":
          return "-.INF";
        case "camelcase":
          return "-.Inf";
      }
    else if (e.isNegativeZero(a))
      return "-0.0";
    return c = a.toString(10), s.test(c) ? c.replace("e", ".e") : c;
  }
  function d(a) {
    return Object.prototype.toString.call(a) === "[object Number]" && (a % 1 !== 0 || e.isNegativeZero(a));
  }
  return _i = new t("tag:yaml.org,2002:float", {
    kind: "scalar",
    resolve: n,
    construct: o,
    predicate: d,
    represent: i,
    defaultStyle: "lowercase"
  }), _i;
}
var Ii, xs;
function Vc() {
  return xs || (xs = 1, Ii = Bc().extend({
    implicit: [
      Hc(),
      jc(),
      Gc(),
      Wc()
    ]
  })), Ii;
}
var Si, Ls;
function zc() {
  return Ls || (Ls = 1, Si = Vc()), Si;
}
var Ai, Us;
function Yc() {
  if (Us) return Ai;
  Us = 1;
  var e = Ze(), t = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
  ), r = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
  );
  function n(i) {
    return i === null ? !1 : t.exec(i) !== null || r.exec(i) !== null;
  }
  function o(i) {
    var d, a, h, c, l, f, p, g = 0, y = null, m, _, I;
    if (d = t.exec(i), d === null && (d = r.exec(i)), d === null) throw new Error("Date resolve error");
    if (a = +d[1], h = +d[2] - 1, c = +d[3], !d[4])
      return new Date(Date.UTC(a, h, c));
    if (l = +d[4], f = +d[5], p = +d[6], d[7]) {
      for (g = d[7].slice(0, 3); g.length < 3; )
        g += "0";
      g = +g;
    }
    return d[9] && (m = +d[10], _ = +(d[11] || 0), y = (m * 60 + _) * 6e4, d[9] === "-" && (y = -y)), I = new Date(Date.UTC(a, h, c, l, f, p, g)), y && I.setTime(I.getTime() - y), I;
  }
  function s(i) {
    return i.toISOString();
  }
  return Ai = new e("tag:yaml.org,2002:timestamp", {
    kind: "scalar",
    resolve: n,
    construct: o,
    instanceOf: Date,
    represent: s
  }), Ai;
}
var Ri, ks;
function Xc() {
  if (ks) return Ri;
  ks = 1;
  var e = Ze();
  function t(r) {
    return r === "<<" || r === null;
  }
  return Ri = new e("tag:yaml.org,2002:merge", {
    kind: "scalar",
    resolve: t
  }), Ri;
}
var bi, $s;
function Kc() {
  if ($s) return bi;
  $s = 1;
  var e = Ze(), t = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
  function r(i) {
    if (i === null) return !1;
    var d, a, h = 0, c = i.length, l = t;
    for (a = 0; a < c; a++)
      if (d = l.indexOf(i.charAt(a)), !(d > 64)) {
        if (d < 0) return !1;
        h += 6;
      }
    return h % 8 === 0;
  }
  function n(i) {
    var d, a, h = i.replace(/[\r\n=]/g, ""), c = h.length, l = t, f = 0, p = [];
    for (d = 0; d < c; d++)
      d % 4 === 0 && d && (p.push(f >> 16 & 255), p.push(f >> 8 & 255), p.push(f & 255)), f = f << 6 | l.indexOf(h.charAt(d));
    return a = c % 4 * 6, a === 0 ? (p.push(f >> 16 & 255), p.push(f >> 8 & 255), p.push(f & 255)) : a === 18 ? (p.push(f >> 10 & 255), p.push(f >> 2 & 255)) : a === 12 && p.push(f >> 4 & 255), new Uint8Array(p);
  }
  function o(i) {
    var d = "", a = 0, h, c, l = i.length, f = t;
    for (h = 0; h < l; h++)
      h % 3 === 0 && h && (d += f[a >> 18 & 63], d += f[a >> 12 & 63], d += f[a >> 6 & 63], d += f[a & 63]), a = (a << 8) + i[h];
    return c = l % 3, c === 0 ? (d += f[a >> 18 & 63], d += f[a >> 12 & 63], d += f[a >> 6 & 63], d += f[a & 63]) : c === 2 ? (d += f[a >> 10 & 63], d += f[a >> 4 & 63], d += f[a << 2 & 63], d += f[64]) : c === 1 && (d += f[a >> 2 & 63], d += f[a << 4 & 63], d += f[64], d += f[64]), d;
  }
  function s(i) {
    return Object.prototype.toString.call(i) === "[object Uint8Array]";
  }
  return bi = new e("tag:yaml.org,2002:binary", {
    kind: "scalar",
    resolve: r,
    construct: n,
    predicate: s,
    represent: o
  }), bi;
}
var Ci, Ms;
function Jc() {
  if (Ms) return Ci;
  Ms = 1;
  var e = Ze(), t = Object.prototype.hasOwnProperty, r = Object.prototype.toString;
  function n(s) {
    if (s === null) return !0;
    var i = [], d, a, h, c, l, f = s;
    for (d = 0, a = f.length; d < a; d += 1) {
      if (h = f[d], l = !1, r.call(h) !== "[object Object]") return !1;
      for (c in h)
        if (t.call(h, c))
          if (!l) l = !0;
          else return !1;
      if (!l) return !1;
      if (i.indexOf(c) === -1) i.push(c);
      else return !1;
    }
    return !0;
  }
  function o(s) {
    return s !== null ? s : [];
  }
  return Ci = new e("tag:yaml.org,2002:omap", {
    kind: "sequence",
    resolve: n,
    construct: o
  }), Ci;
}
var Ni, qs;
function Qc() {
  if (qs) return Ni;
  qs = 1;
  var e = Ze(), t = Object.prototype.toString;
  function r(o) {
    if (o === null) return !0;
    var s, i, d, a, h, c = o;
    for (h = new Array(c.length), s = 0, i = c.length; s < i; s += 1) {
      if (d = c[s], t.call(d) !== "[object Object]" || (a = Object.keys(d), a.length !== 1)) return !1;
      h[s] = [a[0], d[a[0]]];
    }
    return !0;
  }
  function n(o) {
    if (o === null) return [];
    var s, i, d, a, h, c = o;
    for (h = new Array(c.length), s = 0, i = c.length; s < i; s += 1)
      d = c[s], a = Object.keys(d), h[s] = [a[0], d[a[0]]];
    return h;
  }
  return Ni = new e("tag:yaml.org,2002:pairs", {
    kind: "sequence",
    resolve: r,
    construct: n
  }), Ni;
}
var Di, Bs;
function Zc() {
  if (Bs) return Di;
  Bs = 1;
  var e = Ze(), t = Object.prototype.hasOwnProperty;
  function r(o) {
    if (o === null) return !0;
    var s, i = o;
    for (s in i)
      if (t.call(i, s) && i[s] !== null)
        return !1;
    return !0;
  }
  function n(o) {
    return o !== null ? o : {};
  }
  return Di = new e("tag:yaml.org,2002:set", {
    kind: "mapping",
    resolve: r,
    construct: n
  }), Di;
}
var Oi, Hs;
function Go() {
  return Hs || (Hs = 1, Oi = zc().extend({
    implicit: [
      Yc(),
      Xc()
    ],
    explicit: [
      Kc(),
      Jc(),
      Qc(),
      Zc()
    ]
  })), Oi;
}
var js;
function Af() {
  if (js) return nn;
  js = 1;
  var e = $r(), t = Mr(), r = Sf(), n = Go(), o = Object.prototype.hasOwnProperty, s = 1, i = 2, d = 3, a = 4, h = 1, c = 2, l = 3, f = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, p = /[\x85\u2028\u2029]/, g = /[,\[\]\{\}]/, y = /^(?:!|!!|![a-z\-]+!)$/i, m = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
  function _(u) {
    return Object.prototype.toString.call(u);
  }
  function I(u) {
    return u === 10 || u === 13;
  }
  function N(u) {
    return u === 9 || u === 32;
  }
  function O(u) {
    return u === 9 || u === 32 || u === 10 || u === 13;
  }
  function R(u) {
    return u === 44 || u === 91 || u === 93 || u === 123 || u === 125;
  }
  function b(u) {
    var B;
    return 48 <= u && u <= 57 ? u - 48 : (B = u | 32, 97 <= B && B <= 102 ? B - 97 + 10 : -1);
  }
  function A(u) {
    return u === 120 ? 2 : u === 117 ? 4 : u === 85 ? 8 : 0;
  }
  function w(u) {
    return 48 <= u && u <= 57 ? u - 48 : -1;
  }
  function C(u) {
    return u === 48 ? "\0" : u === 97 ? "\x07" : u === 98 ? "\b" : u === 116 || u === 9 ? "	" : u === 110 ? `
` : u === 118 ? "\v" : u === 102 ? "\f" : u === 114 ? "\r" : u === 101 ? "\x1B" : u === 32 ? " " : u === 34 ? '"' : u === 47 ? "/" : u === 92 ? "\\" : u === 78 ? "" : u === 95 ? " " : u === 76 ? "\u2028" : u === 80 ? "\u2029" : "";
  }
  function T(u) {
    return u <= 65535 ? String.fromCharCode(u) : String.fromCharCode(
      (u - 65536 >> 10) + 55296,
      (u - 65536 & 1023) + 56320
    );
  }
  function U(u, B, W) {
    B === "__proto__" ? Object.defineProperty(u, B, {
      configurable: !0,
      enumerable: !0,
      writable: !0,
      value: W
    }) : u[B] = W;
  }
  for (var L = new Array(256), $ = new Array(256), F = 0; F < 256; F++)
    L[F] = C(F) ? 1 : 0, $[F] = C(F);
  function x(u, B) {
    this.input = u, this.filename = B.filename || null, this.schema = B.schema || n, this.onWarning = B.onWarning || null, this.legacy = B.legacy || !1, this.json = B.json || !1, this.listener = B.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = u.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
  }
  function j(u, B) {
    var W = {
      name: u.filename,
      buffer: u.input.slice(0, -1),
      // omit trailing \0
      position: u.position,
      line: u.line,
      column: u.position - u.lineStart
    };
    return W.snippet = r(W), new t(B, W);
  }
  function k(u, B) {
    throw j(u, B);
  }
  function G(u, B) {
    u.onWarning && u.onWarning.call(null, j(u, B));
  }
  var z = {
    YAML: function(B, W, ie) {
      var V, ne, te;
      B.version !== null && k(B, "duplication of %YAML directive"), ie.length !== 1 && k(B, "YAML directive accepts exactly one argument"), V = /^([0-9]+)\.([0-9]+)$/.exec(ie[0]), V === null && k(B, "ill-formed argument of the YAML directive"), ne = parseInt(V[1], 10), te = parseInt(V[2], 10), ne !== 1 && k(B, "unacceptable YAML version of the document"), B.version = ie[0], B.checkLineBreaks = te < 2, te !== 1 && te !== 2 && G(B, "unsupported YAML version of the document");
    },
    TAG: function(B, W, ie) {
      var V, ne;
      ie.length !== 2 && k(B, "TAG directive accepts exactly two arguments"), V = ie[0], ne = ie[1], y.test(V) || k(B, "ill-formed tag handle (first argument) of the TAG directive"), o.call(B.tagMap, V) && k(B, 'there is a previously declared suffix for "' + V + '" tag handle'), m.test(ne) || k(B, "ill-formed tag prefix (second argument) of the TAG directive");
      try {
        ne = decodeURIComponent(ne);
      } catch {
        k(B, "tag prefix is malformed: " + ne);
      }
      B.tagMap[V] = ne;
    }
  };
  function ee(u, B, W, ie) {
    var V, ne, te, se;
    if (B < W) {
      if (se = u.input.slice(B, W), ie)
        for (V = 0, ne = se.length; V < ne; V += 1)
          te = se.charCodeAt(V), te === 9 || 32 <= te && te <= 1114111 || k(u, "expected valid JSON character");
      else f.test(se) && k(u, "the stream contains non-printable characters");
      u.result += se;
    }
  }
  function me(u, B, W, ie) {
    var V, ne, te, se;
    for (e.isObject(W) || k(u, "cannot merge mappings; the provided source object is unacceptable"), V = Object.keys(W), te = 0, se = V.length; te < se; te += 1)
      ne = V[te], o.call(B, ne) || (U(B, ne, W[ne]), ie[ne] = !0);
  }
  function Z(u, B, W, ie, V, ne, te, se, ue) {
    var Re, be;
    if (Array.isArray(V))
      for (V = Array.prototype.slice.call(V), Re = 0, be = V.length; Re < be; Re += 1)
        Array.isArray(V[Re]) && k(u, "nested arrays are not supported inside keys"), typeof V == "object" && _(V[Re]) === "[object Object]" && (V[Re] = "[object Object]");
    if (typeof V == "object" && _(V) === "[object Object]" && (V = "[object Object]"), V = String(V), B === null && (B = {}), ie === "tag:yaml.org,2002:merge")
      if (Array.isArray(ne))
        for (Re = 0, be = ne.length; Re < be; Re += 1)
          me(u, B, ne[Re], W);
      else
        me(u, B, ne, W);
    else
      !u.json && !o.call(W, V) && o.call(B, V) && (u.line = te || u.line, u.lineStart = se || u.lineStart, u.position = ue || u.position, k(u, "duplicated mapping key")), U(B, V, ne), delete W[V];
    return B;
  }
  function ye(u) {
    var B;
    B = u.input.charCodeAt(u.position), B === 10 ? u.position++ : B === 13 ? (u.position++, u.input.charCodeAt(u.position) === 10 && u.position++) : k(u, "a line break is expected"), u.line += 1, u.lineStart = u.position, u.firstTabInLine = -1;
  }
  function ge(u, B, W) {
    for (var ie = 0, V = u.input.charCodeAt(u.position); V !== 0; ) {
      for (; N(V); )
        V === 9 && u.firstTabInLine === -1 && (u.firstTabInLine = u.position), V = u.input.charCodeAt(++u.position);
      if (B && V === 35)
        do
          V = u.input.charCodeAt(++u.position);
        while (V !== 10 && V !== 13 && V !== 0);
      if (I(V))
        for (ye(u), V = u.input.charCodeAt(u.position), ie++, u.lineIndent = 0; V === 32; )
          u.lineIndent++, V = u.input.charCodeAt(++u.position);
      else
        break;
    }
    return W !== -1 && ie !== 0 && u.lineIndent < W && G(u, "deficient indentation"), ie;
  }
  function Q(u) {
    var B = u.position, W;
    return W = u.input.charCodeAt(B), !!((W === 45 || W === 46) && W === u.input.charCodeAt(B + 1) && W === u.input.charCodeAt(B + 2) && (B += 3, W = u.input.charCodeAt(B), W === 0 || O(W)));
  }
  function de(u, B) {
    B === 1 ? u.result += " " : B > 1 && (u.result += e.repeat(`
`, B - 1));
  }
  function we(u, B, W) {
    var ie, V, ne, te, se, ue, Re, be, he = u.kind, S = u.result, H;
    if (H = u.input.charCodeAt(u.position), O(H) || R(H) || H === 35 || H === 38 || H === 42 || H === 33 || H === 124 || H === 62 || H === 39 || H === 34 || H === 37 || H === 64 || H === 96 || (H === 63 || H === 45) && (V = u.input.charCodeAt(u.position + 1), O(V) || W && R(V)))
      return !1;
    for (u.kind = "scalar", u.result = "", ne = te = u.position, se = !1; H !== 0; ) {
      if (H === 58) {
        if (V = u.input.charCodeAt(u.position + 1), O(V) || W && R(V))
          break;
      } else if (H === 35) {
        if (ie = u.input.charCodeAt(u.position - 1), O(ie))
          break;
      } else {
        if (u.position === u.lineStart && Q(u) || W && R(H))
          break;
        if (I(H))
          if (ue = u.line, Re = u.lineStart, be = u.lineIndent, ge(u, !1, -1), u.lineIndent >= B) {
            se = !0, H = u.input.charCodeAt(u.position);
            continue;
          } else {
            u.position = te, u.line = ue, u.lineStart = Re, u.lineIndent = be;
            break;
          }
      }
      se && (ee(u, ne, te, !1), de(u, u.line - ue), ne = te = u.position, se = !1), N(H) || (te = u.position + 1), H = u.input.charCodeAt(++u.position);
    }
    return ee(u, ne, te, !1), u.result ? !0 : (u.kind = he, u.result = S, !1);
  }
  function Se(u, B) {
    var W, ie, V;
    if (W = u.input.charCodeAt(u.position), W !== 39)
      return !1;
    for (u.kind = "scalar", u.result = "", u.position++, ie = V = u.position; (W = u.input.charCodeAt(u.position)) !== 0; )
      if (W === 39)
        if (ee(u, ie, u.position, !0), W = u.input.charCodeAt(++u.position), W === 39)
          ie = u.position, u.position++, V = u.position;
        else
          return !0;
      else I(W) ? (ee(u, ie, V, !0), de(u, ge(u, !1, B)), ie = V = u.position) : u.position === u.lineStart && Q(u) ? k(u, "unexpected end of the document within a single quoted scalar") : (u.position++, V = u.position);
    k(u, "unexpected end of the stream within a single quoted scalar");
  }
  function De(u, B) {
    var W, ie, V, ne, te, se;
    if (se = u.input.charCodeAt(u.position), se !== 34)
      return !1;
    for (u.kind = "scalar", u.result = "", u.position++, W = ie = u.position; (se = u.input.charCodeAt(u.position)) !== 0; ) {
      if (se === 34)
        return ee(u, W, u.position, !0), u.position++, !0;
      if (se === 92) {
        if (ee(u, W, u.position, !0), se = u.input.charCodeAt(++u.position), I(se))
          ge(u, !1, B);
        else if (se < 256 && L[se])
          u.result += $[se], u.position++;
        else if ((te = A(se)) > 0) {
          for (V = te, ne = 0; V > 0; V--)
            se = u.input.charCodeAt(++u.position), (te = b(se)) >= 0 ? ne = (ne << 4) + te : k(u, "expected hexadecimal character");
          u.result += T(ne), u.position++;
        } else
          k(u, "unknown escape sequence");
        W = ie = u.position;
      } else I(se) ? (ee(u, W, ie, !0), de(u, ge(u, !1, B)), W = ie = u.position) : u.position === u.lineStart && Q(u) ? k(u, "unexpected end of the document within a double quoted scalar") : (u.position++, ie = u.position);
    }
    k(u, "unexpected end of the stream within a double quoted scalar");
  }
  function Ne(u, B) {
    var W = !0, ie, V, ne, te = u.tag, se, ue = u.anchor, Re, be, he, S, H, Y = /* @__PURE__ */ Object.create(null), X, K, ae, re;
    if (re = u.input.charCodeAt(u.position), re === 91)
      be = 93, H = !1, se = [];
    else if (re === 123)
      be = 125, H = !0, se = {};
    else
      return !1;
    for (u.anchor !== null && (u.anchorMap[u.anchor] = se), re = u.input.charCodeAt(++u.position); re !== 0; ) {
      if (ge(u, !0, B), re = u.input.charCodeAt(u.position), re === be)
        return u.position++, u.tag = te, u.anchor = ue, u.kind = H ? "mapping" : "sequence", u.result = se, !0;
      W ? re === 44 && k(u, "expected the node content, but found ','") : k(u, "missed comma between flow collection entries"), K = X = ae = null, he = S = !1, re === 63 && (Re = u.input.charCodeAt(u.position + 1), O(Re) && (he = S = !0, u.position++, ge(u, !0, B))), ie = u.line, V = u.lineStart, ne = u.position, _e(u, B, s, !1, !0), K = u.tag, X = u.result, ge(u, !0, B), re = u.input.charCodeAt(u.position), (S || u.line === ie) && re === 58 && (he = !0, re = u.input.charCodeAt(++u.position), ge(u, !0, B), _e(u, B, s, !1, !0), ae = u.result), H ? Z(u, se, Y, K, X, ae, ie, V, ne) : he ? se.push(Z(u, null, Y, K, X, ae, ie, V, ne)) : se.push(X), ge(u, !0, B), re = u.input.charCodeAt(u.position), re === 44 ? (W = !0, re = u.input.charCodeAt(++u.position)) : W = !1;
    }
    k(u, "unexpected end of the stream within a flow collection");
  }
  function Ie(u, B) {
    var W, ie, V = h, ne = !1, te = !1, se = B, ue = 0, Re = !1, be, he;
    if (he = u.input.charCodeAt(u.position), he === 124)
      ie = !1;
    else if (he === 62)
      ie = !0;
    else
      return !1;
    for (u.kind = "scalar", u.result = ""; he !== 0; )
      if (he = u.input.charCodeAt(++u.position), he === 43 || he === 45)
        h === V ? V = he === 43 ? l : c : k(u, "repeat of a chomping mode identifier");
      else if ((be = w(he)) >= 0)
        be === 0 ? k(u, "bad explicit indentation width of a block scalar; it cannot be less than one") : te ? k(u, "repeat of an indentation width identifier") : (se = B + be - 1, te = !0);
      else
        break;
    if (N(he)) {
      do
        he = u.input.charCodeAt(++u.position);
      while (N(he));
      if (he === 35)
        do
          he = u.input.charCodeAt(++u.position);
        while (!I(he) && he !== 0);
    }
    for (; he !== 0; ) {
      for (ye(u), u.lineIndent = 0, he = u.input.charCodeAt(u.position); (!te || u.lineIndent < se) && he === 32; )
        u.lineIndent++, he = u.input.charCodeAt(++u.position);
      if (!te && u.lineIndent > se && (se = u.lineIndent), I(he)) {
        ue++;
        continue;
      }
      if (u.lineIndent < se) {
        V === l ? u.result += e.repeat(`
`, ne ? 1 + ue : ue) : V === h && ne && (u.result += `
`);
        break;
      }
      for (ie ? N(he) ? (Re = !0, u.result += e.repeat(`
`, ne ? 1 + ue : ue)) : Re ? (Re = !1, u.result += e.repeat(`
`, ue + 1)) : ue === 0 ? ne && (u.result += " ") : u.result += e.repeat(`
`, ue) : u.result += e.repeat(`
`, ne ? 1 + ue : ue), ne = !0, te = !0, ue = 0, W = u.position; !I(he) && he !== 0; )
        he = u.input.charCodeAt(++u.position);
      ee(u, W, u.position, !1);
    }
    return !0;
  }
  function v(u, B) {
    var W, ie = u.tag, V = u.anchor, ne = [], te, se = !1, ue;
    if (u.firstTabInLine !== -1) return !1;
    for (u.anchor !== null && (u.anchorMap[u.anchor] = ne), ue = u.input.charCodeAt(u.position); ue !== 0 && (u.firstTabInLine !== -1 && (u.position = u.firstTabInLine, k(u, "tab characters must not be used in indentation")), !(ue !== 45 || (te = u.input.charCodeAt(u.position + 1), !O(te)))); ) {
      if (se = !0, u.position++, ge(u, !0, -1) && u.lineIndent <= B) {
        ne.push(null), ue = u.input.charCodeAt(u.position);
        continue;
      }
      if (W = u.line, _e(u, B, d, !1, !0), ne.push(u.result), ge(u, !0, -1), ue = u.input.charCodeAt(u.position), (u.line === W || u.lineIndent > B) && ue !== 0)
        k(u, "bad indentation of a sequence entry");
      else if (u.lineIndent < B)
        break;
    }
    return se ? (u.tag = ie, u.anchor = V, u.kind = "sequence", u.result = ne, !0) : !1;
  }
  function E(u, B, W) {
    var ie, V, ne, te, se, ue, Re = u.tag, be = u.anchor, he = {}, S = /* @__PURE__ */ Object.create(null), H = null, Y = null, X = null, K = !1, ae = !1, re;
    if (u.firstTabInLine !== -1) return !1;
    for (u.anchor !== null && (u.anchorMap[u.anchor] = he), re = u.input.charCodeAt(u.position); re !== 0; ) {
      if (!K && u.firstTabInLine !== -1 && (u.position = u.firstTabInLine, k(u, "tab characters must not be used in indentation")), ie = u.input.charCodeAt(u.position + 1), ne = u.line, (re === 63 || re === 58) && O(ie))
        re === 63 ? (K && (Z(u, he, S, H, Y, null, te, se, ue), H = Y = X = null), ae = !0, K = !0, V = !0) : K ? (K = !1, V = !0) : k(u, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), u.position += 1, re = ie;
      else {
        if (te = u.line, se = u.lineStart, ue = u.position, !_e(u, W, i, !1, !0))
          break;
        if (u.line === ne) {
          for (re = u.input.charCodeAt(u.position); N(re); )
            re = u.input.charCodeAt(++u.position);
          if (re === 58)
            re = u.input.charCodeAt(++u.position), O(re) || k(u, "a whitespace character is expected after the key-value separator within a block mapping"), K && (Z(u, he, S, H, Y, null, te, se, ue), H = Y = X = null), ae = !0, K = !1, V = !1, H = u.tag, Y = u.result;
          else if (ae)
            k(u, "can not read an implicit mapping pair; a colon is missed");
          else
            return u.tag = Re, u.anchor = be, !0;
        } else if (ae)
          k(u, "can not read a block mapping entry; a multiline key may not be an implicit key");
        else
          return u.tag = Re, u.anchor = be, !0;
      }
      if ((u.line === ne || u.lineIndent > B) && (K && (te = u.line, se = u.lineStart, ue = u.position), _e(u, B, a, !0, V) && (K ? Y = u.result : X = u.result), K || (Z(u, he, S, H, Y, X, te, se, ue), H = Y = X = null), ge(u, !0, -1), re = u.input.charCodeAt(u.position)), (u.line === ne || u.lineIndent > B) && re !== 0)
        k(u, "bad indentation of a mapping entry");
      else if (u.lineIndent < B)
        break;
    }
    return K && Z(u, he, S, H, Y, null, te, se, ue), ae && (u.tag = Re, u.anchor = be, u.kind = "mapping", u.result = he), ae;
  }
  function q(u) {
    var B, W = !1, ie = !1, V, ne, te;
    if (te = u.input.charCodeAt(u.position), te !== 33) return !1;
    if (u.tag !== null && k(u, "duplication of a tag property"), te = u.input.charCodeAt(++u.position), te === 60 ? (W = !0, te = u.input.charCodeAt(++u.position)) : te === 33 ? (ie = !0, V = "!!", te = u.input.charCodeAt(++u.position)) : V = "!", B = u.position, W) {
      do
        te = u.input.charCodeAt(++u.position);
      while (te !== 0 && te !== 62);
      u.position < u.length ? (ne = u.input.slice(B, u.position), te = u.input.charCodeAt(++u.position)) : k(u, "unexpected end of the stream within a verbatim tag");
    } else {
      for (; te !== 0 && !O(te); )
        te === 33 && (ie ? k(u, "tag suffix cannot contain exclamation marks") : (V = u.input.slice(B - 1, u.position + 1), y.test(V) || k(u, "named tag handle cannot contain such characters"), ie = !0, B = u.position + 1)), te = u.input.charCodeAt(++u.position);
      ne = u.input.slice(B, u.position), g.test(ne) && k(u, "tag suffix cannot contain flow indicator characters");
    }
    ne && !m.test(ne) && k(u, "tag name cannot contain such characters: " + ne);
    try {
      ne = decodeURIComponent(ne);
    } catch {
      k(u, "tag name is malformed: " + ne);
    }
    return W ? u.tag = ne : o.call(u.tagMap, V) ? u.tag = u.tagMap[V] + ne : V === "!" ? u.tag = "!" + ne : V === "!!" ? u.tag = "tag:yaml.org,2002:" + ne : k(u, 'undeclared tag handle "' + V + '"'), !0;
  }
  function P(u) {
    var B, W;
    if (W = u.input.charCodeAt(u.position), W !== 38) return !1;
    for (u.anchor !== null && k(u, "duplication of an anchor property"), W = u.input.charCodeAt(++u.position), B = u.position; W !== 0 && !O(W) && !R(W); )
      W = u.input.charCodeAt(++u.position);
    return u.position === B && k(u, "name of an anchor node must contain at least one character"), u.anchor = u.input.slice(B, u.position), !0;
  }
  function Te(u) {
    var B, W, ie;
    if (ie = u.input.charCodeAt(u.position), ie !== 42) return !1;
    for (ie = u.input.charCodeAt(++u.position), B = u.position; ie !== 0 && !O(ie) && !R(ie); )
      ie = u.input.charCodeAt(++u.position);
    return u.position === B && k(u, "name of an alias node must contain at least one character"), W = u.input.slice(B, u.position), o.call(u.anchorMap, W) || k(u, 'unidentified alias "' + W + '"'), u.result = u.anchorMap[W], ge(u, !0, -1), !0;
  }
  function _e(u, B, W, ie, V) {
    var ne, te, se, ue = 1, Re = !1, be = !1, he, S, H, Y, X, K;
    if (u.listener !== null && u.listener("open", u), u.tag = null, u.anchor = null, u.kind = null, u.result = null, ne = te = se = a === W || d === W, ie && ge(u, !0, -1) && (Re = !0, u.lineIndent > B ? ue = 1 : u.lineIndent === B ? ue = 0 : u.lineIndent < B && (ue = -1)), ue === 1)
      for (; q(u) || P(u); )
        ge(u, !0, -1) ? (Re = !0, se = ne, u.lineIndent > B ? ue = 1 : u.lineIndent === B ? ue = 0 : u.lineIndent < B && (ue = -1)) : se = !1;
    if (se && (se = Re || V), (ue === 1 || a === W) && (s === W || i === W ? X = B : X = B + 1, K = u.position - u.lineStart, ue === 1 ? se && (v(u, K) || E(u, K, X)) || Ne(u, X) ? be = !0 : (te && Ie(u, X) || Se(u, X) || De(u, X) ? be = !0 : Te(u) ? (be = !0, (u.tag !== null || u.anchor !== null) && k(u, "alias node should not have any properties")) : we(u, X, s === W) && (be = !0, u.tag === null && (u.tag = "?")), u.anchor !== null && (u.anchorMap[u.anchor] = u.result)) : ue === 0 && (be = se && v(u, K))), u.tag === null)
      u.anchor !== null && (u.anchorMap[u.anchor] = u.result);
    else if (u.tag === "?") {
      for (u.result !== null && u.kind !== "scalar" && k(u, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + u.kind + '"'), he = 0, S = u.implicitTypes.length; he < S; he += 1)
        if (Y = u.implicitTypes[he], Y.resolve(u.result)) {
          u.result = Y.construct(u.result), u.tag = Y.tag, u.anchor !== null && (u.anchorMap[u.anchor] = u.result);
          break;
        }
    } else if (u.tag !== "!") {
      if (o.call(u.typeMap[u.kind || "fallback"], u.tag))
        Y = u.typeMap[u.kind || "fallback"][u.tag];
      else
        for (Y = null, H = u.typeMap.multi[u.kind || "fallback"], he = 0, S = H.length; he < S; he += 1)
          if (u.tag.slice(0, H[he].tag.length) === H[he].tag) {
            Y = H[he];
            break;
          }
      Y || k(u, "unknown tag !<" + u.tag + ">"), u.result !== null && Y.kind !== u.kind && k(u, "unacceptable node kind for !<" + u.tag + '> tag; it should be "' + Y.kind + '", not "' + u.kind + '"'), Y.resolve(u.result, u.tag) ? (u.result = Y.construct(u.result, u.tag), u.anchor !== null && (u.anchorMap[u.anchor] = u.result)) : k(u, "cannot resolve a node with !<" + u.tag + "> explicit tag");
    }
    return u.listener !== null && u.listener("close", u), u.tag !== null || u.anchor !== null || be;
  }
  function Pe(u) {
    var B = u.position, W, ie, V, ne = !1, te;
    for (u.version = null, u.checkLineBreaks = u.legacy, u.tagMap = /* @__PURE__ */ Object.create(null), u.anchorMap = /* @__PURE__ */ Object.create(null); (te = u.input.charCodeAt(u.position)) !== 0 && (ge(u, !0, -1), te = u.input.charCodeAt(u.position), !(u.lineIndent > 0 || te !== 37)); ) {
      for (ne = !0, te = u.input.charCodeAt(++u.position), W = u.position; te !== 0 && !O(te); )
        te = u.input.charCodeAt(++u.position);
      for (ie = u.input.slice(W, u.position), V = [], ie.length < 1 && k(u, "directive name must not be less than one character in length"); te !== 0; ) {
        for (; N(te); )
          te = u.input.charCodeAt(++u.position);
        if (te === 35) {
          do
            te = u.input.charCodeAt(++u.position);
          while (te !== 0 && !I(te));
          break;
        }
        if (I(te)) break;
        for (W = u.position; te !== 0 && !O(te); )
          te = u.input.charCodeAt(++u.position);
        V.push(u.input.slice(W, u.position));
      }
      te !== 0 && ye(u), o.call(z, ie) ? z[ie](u, ie, V) : G(u, 'unknown document directive "' + ie + '"');
    }
    if (ge(u, !0, -1), u.lineIndent === 0 && u.input.charCodeAt(u.position) === 45 && u.input.charCodeAt(u.position + 1) === 45 && u.input.charCodeAt(u.position + 2) === 45 ? (u.position += 3, ge(u, !0, -1)) : ne && k(u, "directives end mark is expected"), _e(u, u.lineIndent - 1, a, !1, !0), ge(u, !0, -1), u.checkLineBreaks && p.test(u.input.slice(B, u.position)) && G(u, "non-ASCII line breaks are interpreted as content"), u.documents.push(u.result), u.position === u.lineStart && Q(u)) {
      u.input.charCodeAt(u.position) === 46 && (u.position += 3, ge(u, !0, -1));
      return;
    }
    if (u.position < u.length - 1)
      k(u, "end of the stream or a document separator is expected");
    else
      return;
  }
  function Me(u, B) {
    u = String(u), B = B || {}, u.length !== 0 && (u.charCodeAt(u.length - 1) !== 10 && u.charCodeAt(u.length - 1) !== 13 && (u += `
`), u.charCodeAt(0) === 65279 && (u = u.slice(1)));
    var W = new x(u, B), ie = u.indexOf("\0");
    for (ie !== -1 && (W.position = ie, k(W, "null byte is not allowed in input")), W.input += "\0"; W.input.charCodeAt(W.position) === 32; )
      W.lineIndent += 1, W.position += 1;
    for (; W.position < W.length - 1; )
      Pe(W);
    return W.documents;
  }
  function qe(u, B, W) {
    B !== null && typeof B == "object" && typeof W > "u" && (W = B, B = null);
    var ie = Me(u, W);
    if (typeof B != "function")
      return ie;
    for (var V = 0, ne = ie.length; V < ne; V += 1)
      B(ie[V]);
  }
  function Xe(u, B) {
    var W = Me(u, B);
    if (W.length !== 0) {
      if (W.length === 1)
        return W[0];
      throw new t("expected a single document in the stream, but found more");
    }
  }
  return nn.loadAll = qe, nn.load = Xe, nn;
}
var Pi = {}, Gs;
function Rf() {
  if (Gs) return Pi;
  Gs = 1;
  var e = $r(), t = Mr(), r = Go(), n = Object.prototype.toString, o = Object.prototype.hasOwnProperty, s = 65279, i = 9, d = 10, a = 13, h = 32, c = 33, l = 34, f = 35, p = 37, g = 38, y = 39, m = 42, _ = 44, I = 45, N = 58, O = 61, R = 62, b = 63, A = 64, w = 91, C = 93, T = 96, U = 123, L = 124, $ = 125, F = {};
  F[0] = "\\0", F[7] = "\\a", F[8] = "\\b", F[9] = "\\t", F[10] = "\\n", F[11] = "\\v", F[12] = "\\f", F[13] = "\\r", F[27] = "\\e", F[34] = '\\"', F[92] = "\\\\", F[133] = "\\N", F[160] = "\\_", F[8232] = "\\L", F[8233] = "\\P";
  var x = [
    "y",
    "Y",
    "yes",
    "Yes",
    "YES",
    "on",
    "On",
    "ON",
    "n",
    "N",
    "no",
    "No",
    "NO",
    "off",
    "Off",
    "OFF"
  ], j = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
  function k(S, H) {
    var Y, X, K, ae, re, le, fe;
    if (H === null) return {};
    for (Y = {}, X = Object.keys(H), K = 0, ae = X.length; K < ae; K += 1)
      re = X[K], le = String(H[re]), re.slice(0, 2) === "!!" && (re = "tag:yaml.org,2002:" + re.slice(2)), fe = S.compiledTypeMap.fallback[re], fe && o.call(fe.styleAliases, le) && (le = fe.styleAliases[le]), Y[re] = le;
    return Y;
  }
  function G(S) {
    var H, Y, X;
    if (H = S.toString(16).toUpperCase(), S <= 255)
      Y = "x", X = 2;
    else if (S <= 65535)
      Y = "u", X = 4;
    else if (S <= 4294967295)
      Y = "U", X = 8;
    else
      throw new t("code point within a string may not be greater than 0xFFFFFFFF");
    return "\\" + Y + e.repeat("0", X - H.length) + H;
  }
  var z = 1, ee = 2;
  function me(S) {
    this.schema = S.schema || r, this.indent = Math.max(1, S.indent || 2), this.noArrayIndent = S.noArrayIndent || !1, this.skipInvalid = S.skipInvalid || !1, this.flowLevel = e.isNothing(S.flowLevel) ? -1 : S.flowLevel, this.styleMap = k(this.schema, S.styles || null), this.sortKeys = S.sortKeys || !1, this.lineWidth = S.lineWidth || 80, this.noRefs = S.noRefs || !1, this.noCompatMode = S.noCompatMode || !1, this.condenseFlow = S.condenseFlow || !1, this.quotingType = S.quotingType === '"' ? ee : z, this.forceQuotes = S.forceQuotes || !1, this.replacer = typeof S.replacer == "function" ? S.replacer : null, this.implicitTypes = this.schema.compiledImplicit, this.explicitTypes = this.schema.compiledExplicit, this.tag = null, this.result = "", this.duplicates = [], this.usedDuplicates = null;
  }
  function Z(S, H) {
    for (var Y = e.repeat(" ", H), X = 0, K = -1, ae = "", re, le = S.length; X < le; )
      K = S.indexOf(`
`, X), K === -1 ? (re = S.slice(X), X = le) : (re = S.slice(X, K + 1), X = K + 1), re.length && re !== `
` && (ae += Y), ae += re;
    return ae;
  }
  function ye(S, H) {
    return `
` + e.repeat(" ", S.indent * H);
  }
  function ge(S, H) {
    var Y, X, K;
    for (Y = 0, X = S.implicitTypes.length; Y < X; Y += 1)
      if (K = S.implicitTypes[Y], K.resolve(H))
        return !0;
    return !1;
  }
  function Q(S) {
    return S === h || S === i;
  }
  function de(S) {
    return 32 <= S && S <= 126 || 161 <= S && S <= 55295 && S !== 8232 && S !== 8233 || 57344 <= S && S <= 65533 && S !== s || 65536 <= S && S <= 1114111;
  }
  function we(S) {
    return de(S) && S !== s && S !== a && S !== d;
  }
  function Se(S, H, Y) {
    var X = we(S), K = X && !Q(S);
    return (
      // ns-plain-safe
      (Y ? (
        // c = flow-in
        X
      ) : X && S !== _ && S !== w && S !== C && S !== U && S !== $) && S !== f && !(H === N && !K) || we(H) && !Q(H) && S === f || H === N && K
    );
  }
  function De(S) {
    return de(S) && S !== s && !Q(S) && S !== I && S !== b && S !== N && S !== _ && S !== w && S !== C && S !== U && S !== $ && S !== f && S !== g && S !== m && S !== c && S !== L && S !== O && S !== R && S !== y && S !== l && S !== p && S !== A && S !== T;
  }
  function Ne(S) {
    return !Q(S) && S !== N;
  }
  function Ie(S, H) {
    var Y = S.charCodeAt(H), X;
    return Y >= 55296 && Y <= 56319 && H + 1 < S.length && (X = S.charCodeAt(H + 1), X >= 56320 && X <= 57343) ? (Y - 55296) * 1024 + X - 56320 + 65536 : Y;
  }
  function v(S) {
    var H = /^\n* /;
    return H.test(S);
  }
  var E = 1, q = 2, P = 3, Te = 4, _e = 5;
  function Pe(S, H, Y, X, K, ae, re, le) {
    var fe, Ee = 0, Oe = null, ke = !1, Ce = !1, zt = X !== -1, ct = -1, Ft = De(Ie(S, 0)) && Ne(Ie(S, S.length - 1));
    if (H || re)
      for (fe = 0; fe < S.length; Ee >= 65536 ? fe += 2 : fe++) {
        if (Ee = Ie(S, fe), !de(Ee))
          return _e;
        Ft = Ft && Se(Ee, Oe, le), Oe = Ee;
      }
    else {
      for (fe = 0; fe < S.length; Ee >= 65536 ? fe += 2 : fe++) {
        if (Ee = Ie(S, fe), Ee === d)
          ke = !0, zt && (Ce = Ce || // Foldable line = too long, and not more-indented.
          fe - ct - 1 > X && S[ct + 1] !== " ", ct = fe);
        else if (!de(Ee))
          return _e;
        Ft = Ft && Se(Ee, Oe, le), Oe = Ee;
      }
      Ce = Ce || zt && fe - ct - 1 > X && S[ct + 1] !== " ";
    }
    return !ke && !Ce ? Ft && !re && !K(S) ? E : ae === ee ? _e : q : Y > 9 && v(S) ? _e : re ? ae === ee ? _e : q : Ce ? Te : P;
  }
  function Me(S, H, Y, X, K) {
    S.dump = (function() {
      if (H.length === 0)
        return S.quotingType === ee ? '""' : "''";
      if (!S.noCompatMode && (x.indexOf(H) !== -1 || j.test(H)))
        return S.quotingType === ee ? '"' + H + '"' : "'" + H + "'";
      var ae = S.indent * Math.max(1, Y), re = S.lineWidth === -1 ? -1 : Math.max(Math.min(S.lineWidth, 40), S.lineWidth - ae), le = X || S.flowLevel > -1 && Y >= S.flowLevel;
      function fe(Ee) {
        return ge(S, Ee);
      }
      switch (Pe(
        H,
        le,
        S.indent,
        re,
        fe,
        S.quotingType,
        S.forceQuotes && !X,
        K
      )) {
        case E:
          return H;
        case q:
          return "'" + H.replace(/'/g, "''") + "'";
        case P:
          return "|" + qe(H, S.indent) + Xe(Z(H, ae));
        case Te:
          return ">" + qe(H, S.indent) + Xe(Z(u(H, re), ae));
        case _e:
          return '"' + W(H) + '"';
        default:
          throw new t("impossible error: invalid scalar style");
      }
    })();
  }
  function qe(S, H) {
    var Y = v(S) ? String(H) : "", X = S[S.length - 1] === `
`, K = X && (S[S.length - 2] === `
` || S === `
`), ae = K ? "+" : X ? "" : "-";
    return Y + ae + `
`;
  }
  function Xe(S) {
    return S[S.length - 1] === `
` ? S.slice(0, -1) : S;
  }
  function u(S, H) {
    for (var Y = /(\n+)([^\n]*)/g, X = (function() {
      var Ee = S.indexOf(`
`);
      return Ee = Ee !== -1 ? Ee : S.length, Y.lastIndex = Ee, B(S.slice(0, Ee), H);
    })(), K = S[0] === `
` || S[0] === " ", ae, re; re = Y.exec(S); ) {
      var le = re[1], fe = re[2];
      ae = fe[0] === " ", X += le + (!K && !ae && fe !== "" ? `
` : "") + B(fe, H), K = ae;
    }
    return X;
  }
  function B(S, H) {
    if (S === "" || S[0] === " ") return S;
    for (var Y = / [^ ]/g, X, K = 0, ae, re = 0, le = 0, fe = ""; X = Y.exec(S); )
      le = X.index, le - K > H && (ae = re > K ? re : le, fe += `
` + S.slice(K, ae), K = ae + 1), re = le;
    return fe += `
`, S.length - K > H && re > K ? fe += S.slice(K, re) + `
` + S.slice(re + 1) : fe += S.slice(K), fe.slice(1);
  }
  function W(S) {
    for (var H = "", Y = 0, X, K = 0; K < S.length; Y >= 65536 ? K += 2 : K++)
      Y = Ie(S, K), X = F[Y], !X && de(Y) ? (H += S[K], Y >= 65536 && (H += S[K + 1])) : H += X || G(Y);
    return H;
  }
  function ie(S, H, Y) {
    var X = "", K = S.tag, ae, re, le;
    for (ae = 0, re = Y.length; ae < re; ae += 1)
      le = Y[ae], S.replacer && (le = S.replacer.call(Y, String(ae), le)), (ue(S, H, le, !1, !1) || typeof le > "u" && ue(S, H, null, !1, !1)) && (X !== "" && (X += "," + (S.condenseFlow ? "" : " ")), X += S.dump);
    S.tag = K, S.dump = "[" + X + "]";
  }
  function V(S, H, Y, X) {
    var K = "", ae = S.tag, re, le, fe;
    for (re = 0, le = Y.length; re < le; re += 1)
      fe = Y[re], S.replacer && (fe = S.replacer.call(Y, String(re), fe)), (ue(S, H + 1, fe, !0, !0, !1, !0) || typeof fe > "u" && ue(S, H + 1, null, !0, !0, !1, !0)) && ((!X || K !== "") && (K += ye(S, H)), S.dump && d === S.dump.charCodeAt(0) ? K += "-" : K += "- ", K += S.dump);
    S.tag = ae, S.dump = K || "[]";
  }
  function ne(S, H, Y) {
    var X = "", K = S.tag, ae = Object.keys(Y), re, le, fe, Ee, Oe;
    for (re = 0, le = ae.length; re < le; re += 1)
      Oe = "", X !== "" && (Oe += ", "), S.condenseFlow && (Oe += '"'), fe = ae[re], Ee = Y[fe], S.replacer && (Ee = S.replacer.call(Y, fe, Ee)), ue(S, H, fe, !1, !1) && (S.dump.length > 1024 && (Oe += "? "), Oe += S.dump + (S.condenseFlow ? '"' : "") + ":" + (S.condenseFlow ? "" : " "), ue(S, H, Ee, !1, !1) && (Oe += S.dump, X += Oe));
    S.tag = K, S.dump = "{" + X + "}";
  }
  function te(S, H, Y, X) {
    var K = "", ae = S.tag, re = Object.keys(Y), le, fe, Ee, Oe, ke, Ce;
    if (S.sortKeys === !0)
      re.sort();
    else if (typeof S.sortKeys == "function")
      re.sort(S.sortKeys);
    else if (S.sortKeys)
      throw new t("sortKeys must be a boolean or a function");
    for (le = 0, fe = re.length; le < fe; le += 1)
      Ce = "", (!X || K !== "") && (Ce += ye(S, H)), Ee = re[le], Oe = Y[Ee], S.replacer && (Oe = S.replacer.call(Y, Ee, Oe)), ue(S, H + 1, Ee, !0, !0, !0) && (ke = S.tag !== null && S.tag !== "?" || S.dump && S.dump.length > 1024, ke && (S.dump && d === S.dump.charCodeAt(0) ? Ce += "?" : Ce += "? "), Ce += S.dump, ke && (Ce += ye(S, H)), ue(S, H + 1, Oe, !0, ke) && (S.dump && d === S.dump.charCodeAt(0) ? Ce += ":" : Ce += ": ", Ce += S.dump, K += Ce));
    S.tag = ae, S.dump = K || "{}";
  }
  function se(S, H, Y) {
    var X, K, ae, re, le, fe;
    for (K = Y ? S.explicitTypes : S.implicitTypes, ae = 0, re = K.length; ae < re; ae += 1)
      if (le = K[ae], (le.instanceOf || le.predicate) && (!le.instanceOf || typeof H == "object" && H instanceof le.instanceOf) && (!le.predicate || le.predicate(H))) {
        if (Y ? le.multi && le.representName ? S.tag = le.representName(H) : S.tag = le.tag : S.tag = "?", le.represent) {
          if (fe = S.styleMap[le.tag] || le.defaultStyle, n.call(le.represent) === "[object Function]")
            X = le.represent(H, fe);
          else if (o.call(le.represent, fe))
            X = le.represent[fe](H, fe);
          else
            throw new t("!<" + le.tag + '> tag resolver accepts not "' + fe + '" style');
          S.dump = X;
        }
        return !0;
      }
    return !1;
  }
  function ue(S, H, Y, X, K, ae, re) {
    S.tag = null, S.dump = Y, se(S, Y, !1) || se(S, Y, !0);
    var le = n.call(S.dump), fe = X, Ee;
    X && (X = S.flowLevel < 0 || S.flowLevel > H);
    var Oe = le === "[object Object]" || le === "[object Array]", ke, Ce;
    if (Oe && (ke = S.duplicates.indexOf(Y), Ce = ke !== -1), (S.tag !== null && S.tag !== "?" || Ce || S.indent !== 2 && H > 0) && (K = !1), Ce && S.usedDuplicates[ke])
      S.dump = "*ref_" + ke;
    else {
      if (Oe && Ce && !S.usedDuplicates[ke] && (S.usedDuplicates[ke] = !0), le === "[object Object]")
        X && Object.keys(S.dump).length !== 0 ? (te(S, H, S.dump, K), Ce && (S.dump = "&ref_" + ke + S.dump)) : (ne(S, H, S.dump), Ce && (S.dump = "&ref_" + ke + " " + S.dump));
      else if (le === "[object Array]")
        X && S.dump.length !== 0 ? (S.noArrayIndent && !re && H > 0 ? V(S, H - 1, S.dump, K) : V(S, H, S.dump, K), Ce && (S.dump = "&ref_" + ke + S.dump)) : (ie(S, H, S.dump), Ce && (S.dump = "&ref_" + ke + " " + S.dump));
      else if (le === "[object String]")
        S.tag !== "?" && Me(S, S.dump, H, ae, fe);
      else {
        if (le === "[object Undefined]")
          return !1;
        if (S.skipInvalid) return !1;
        throw new t("unacceptable kind of an object to dump " + le);
      }
      S.tag !== null && S.tag !== "?" && (Ee = encodeURI(
        S.tag[0] === "!" ? S.tag.slice(1) : S.tag
      ).replace(/!/g, "%21"), S.tag[0] === "!" ? Ee = "!" + Ee : Ee.slice(0, 18) === "tag:yaml.org,2002:" ? Ee = "!!" + Ee.slice(18) : Ee = "!<" + Ee + ">", S.dump = Ee + " " + S.dump);
    }
    return !0;
  }
  function Re(S, H) {
    var Y = [], X = [], K, ae;
    for (be(S, Y, X), K = 0, ae = X.length; K < ae; K += 1)
      H.duplicates.push(Y[X[K]]);
    H.usedDuplicates = new Array(ae);
  }
  function be(S, H, Y) {
    var X, K, ae;
    if (S !== null && typeof S == "object")
      if (K = H.indexOf(S), K !== -1)
        Y.indexOf(K) === -1 && Y.push(K);
      else if (H.push(S), Array.isArray(S))
        for (K = 0, ae = S.length; K < ae; K += 1)
          be(S[K], H, Y);
      else
        for (X = Object.keys(S), K = 0, ae = X.length; K < ae; K += 1)
          be(S[X[K]], H, Y);
  }
  function he(S, H) {
    H = H || {};
    var Y = new me(H);
    Y.noRefs || Re(S, Y);
    var X = S;
    return Y.replacer && (X = Y.replacer.call({ "": X }, "", X)), ue(Y, 0, X, !0, !0) ? Y.dump + `
` : "";
  }
  return Pi.dump = he, Pi;
}
var Ws;
function Wo() {
  if (Ws) return Qe;
  Ws = 1;
  var e = Af(), t = Rf();
  function r(n, o) {
    return function() {
      throw new Error("Function yaml." + n + " is removed in js-yaml 4. Use yaml." + o + " instead, which is now safe by default.");
    };
  }
  return Qe.Type = Ze(), Qe.Schema = kc(), Qe.FAILSAFE_SCHEMA = Bc(), Qe.JSON_SCHEMA = Vc(), Qe.CORE_SCHEMA = zc(), Qe.DEFAULT_SCHEMA = Go(), Qe.load = e.load, Qe.loadAll = e.loadAll, Qe.dump = t.dump, Qe.YAMLException = Mr(), Qe.types = {
    binary: Kc(),
    float: Wc(),
    map: qc(),
    null: Hc(),
    pairs: Qc(),
    set: Zc(),
    timestamp: Yc(),
    bool: jc(),
    int: Gc(),
    merge: Xc(),
    omap: Jc(),
    seq: Mc(),
    str: $c()
  }, Qe.safeLoad = r("safeLoad", "load"), Qe.safeLoadAll = r("safeLoadAll", "loadAll"), Qe.safeDump = r("safeDump", "dump"), Qe;
}
var dr = {}, Vs;
function bf() {
  if (Vs) return dr;
  Vs = 1, Object.defineProperty(dr, "__esModule", { value: !0 }), dr.Lazy = void 0;
  class e {
    constructor(r) {
      this._value = null, this.creator = r;
    }
    get hasValue() {
      return this.creator == null;
    }
    get value() {
      if (this.creator == null)
        return this._value;
      const r = this.creator();
      return this.value = r, r;
    }
    set value(r) {
      this._value = r, this.creator = null;
    }
  }
  return dr.Lazy = e, dr;
}
var on = { exports: {} }, Fi, zs;
function pn() {
  if (zs) return Fi;
  zs = 1;
  const e = "2.0.0", t = 256, r = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, n = 16, o = t - 6;
  return Fi = {
    MAX_LENGTH: t,
    MAX_SAFE_COMPONENT_LENGTH: n,
    MAX_SAFE_BUILD_LENGTH: o,
    MAX_SAFE_INTEGER: r,
    RELEASE_TYPES: [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ],
    SEMVER_SPEC_VERSION: e,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  }, Fi;
}
var xi, Ys;
function mn() {
  return Ys || (Ys = 1, xi = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...t) => console.error("SEMVER", ...t) : () => {
  }), xi;
}
var Xs;
function qr() {
  return Xs || (Xs = 1, (function(e, t) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: r,
      MAX_SAFE_BUILD_LENGTH: n,
      MAX_LENGTH: o
    } = pn(), s = mn();
    t = e.exports = {};
    const i = t.re = [], d = t.safeRe = [], a = t.src = [], h = t.safeSrc = [], c = t.t = {};
    let l = 0;
    const f = "[a-zA-Z0-9-]", p = [
      ["\\s", 1],
      ["\\d", o],
      [f, n]
    ], g = (m) => {
      for (const [_, I] of p)
        m = m.split(`${_}*`).join(`${_}{0,${I}}`).split(`${_}+`).join(`${_}{1,${I}}`);
      return m;
    }, y = (m, _, I) => {
      const N = g(_), O = l++;
      s(m, O, _), c[m] = O, a[O] = _, h[O] = N, i[O] = new RegExp(_, I ? "g" : void 0), d[O] = new RegExp(N, I ? "g" : void 0);
    };
    y("NUMERICIDENTIFIER", "0|[1-9]\\d*"), y("NUMERICIDENTIFIERLOOSE", "\\d+"), y("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${f}*`), y("MAINVERSION", `(${a[c.NUMERICIDENTIFIER]})\\.(${a[c.NUMERICIDENTIFIER]})\\.(${a[c.NUMERICIDENTIFIER]})`), y("MAINVERSIONLOOSE", `(${a[c.NUMERICIDENTIFIERLOOSE]})\\.(${a[c.NUMERICIDENTIFIERLOOSE]})\\.(${a[c.NUMERICIDENTIFIERLOOSE]})`), y("PRERELEASEIDENTIFIER", `(?:${a[c.NONNUMERICIDENTIFIER]}|${a[c.NUMERICIDENTIFIER]})`), y("PRERELEASEIDENTIFIERLOOSE", `(?:${a[c.NONNUMERICIDENTIFIER]}|${a[c.NUMERICIDENTIFIERLOOSE]})`), y("PRERELEASE", `(?:-(${a[c.PRERELEASEIDENTIFIER]}(?:\\.${a[c.PRERELEASEIDENTIFIER]})*))`), y("PRERELEASELOOSE", `(?:-?(${a[c.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${a[c.PRERELEASEIDENTIFIERLOOSE]})*))`), y("BUILDIDENTIFIER", `${f}+`), y("BUILD", `(?:\\+(${a[c.BUILDIDENTIFIER]}(?:\\.${a[c.BUILDIDENTIFIER]})*))`), y("FULLPLAIN", `v?${a[c.MAINVERSION]}${a[c.PRERELEASE]}?${a[c.BUILD]}?`), y("FULL", `^${a[c.FULLPLAIN]}$`), y("LOOSEPLAIN", `[v=\\s]*${a[c.MAINVERSIONLOOSE]}${a[c.PRERELEASELOOSE]}?${a[c.BUILD]}?`), y("LOOSE", `^${a[c.LOOSEPLAIN]}$`), y("GTLT", "((?:<|>)?=?)"), y("XRANGEIDENTIFIERLOOSE", `${a[c.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), y("XRANGEIDENTIFIER", `${a[c.NUMERICIDENTIFIER]}|x|X|\\*`), y("XRANGEPLAIN", `[v=\\s]*(${a[c.XRANGEIDENTIFIER]})(?:\\.(${a[c.XRANGEIDENTIFIER]})(?:\\.(${a[c.XRANGEIDENTIFIER]})(?:${a[c.PRERELEASE]})?${a[c.BUILD]}?)?)?`), y("XRANGEPLAINLOOSE", `[v=\\s]*(${a[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${a[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${a[c.XRANGEIDENTIFIERLOOSE]})(?:${a[c.PRERELEASELOOSE]})?${a[c.BUILD]}?)?)?`), y("XRANGE", `^${a[c.GTLT]}\\s*${a[c.XRANGEPLAIN]}$`), y("XRANGELOOSE", `^${a[c.GTLT]}\\s*${a[c.XRANGEPLAINLOOSE]}$`), y("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), y("COERCE", `${a[c.COERCEPLAIN]}(?:$|[^\\d])`), y("COERCEFULL", a[c.COERCEPLAIN] + `(?:${a[c.PRERELEASE]})?(?:${a[c.BUILD]})?(?:$|[^\\d])`), y("COERCERTL", a[c.COERCE], !0), y("COERCERTLFULL", a[c.COERCEFULL], !0), y("LONETILDE", "(?:~>?)"), y("TILDETRIM", `(\\s*)${a[c.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", y("TILDE", `^${a[c.LONETILDE]}${a[c.XRANGEPLAIN]}$`), y("TILDELOOSE", `^${a[c.LONETILDE]}${a[c.XRANGEPLAINLOOSE]}$`), y("LONECARET", "(?:\\^)"), y("CARETTRIM", `(\\s*)${a[c.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", y("CARET", `^${a[c.LONECARET]}${a[c.XRANGEPLAIN]}$`), y("CARETLOOSE", `^${a[c.LONECARET]}${a[c.XRANGEPLAINLOOSE]}$`), y("COMPARATORLOOSE", `^${a[c.GTLT]}\\s*(${a[c.LOOSEPLAIN]})$|^$`), y("COMPARATOR", `^${a[c.GTLT]}\\s*(${a[c.FULLPLAIN]})$|^$`), y("COMPARATORTRIM", `(\\s*)${a[c.GTLT]}\\s*(${a[c.LOOSEPLAIN]}|${a[c.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", y("HYPHENRANGE", `^\\s*(${a[c.XRANGEPLAIN]})\\s+-\\s+(${a[c.XRANGEPLAIN]})\\s*$`), y("HYPHENRANGELOOSE", `^\\s*(${a[c.XRANGEPLAINLOOSE]})\\s+-\\s+(${a[c.XRANGEPLAINLOOSE]})\\s*$`), y("STAR", "(<|>)?=?\\s*\\*"), y("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), y("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  })(on, on.exports)), on.exports;
}
var Li, Ks;
function Vo() {
  if (Ks) return Li;
  Ks = 1;
  const e = Object.freeze({ loose: !0 }), t = Object.freeze({});
  return Li = (n) => n ? typeof n != "object" ? e : n : t, Li;
}
var Ui, Js;
function eu() {
  if (Js) return Ui;
  Js = 1;
  const e = /^[0-9]+$/, t = (n, o) => {
    if (typeof n == "number" && typeof o == "number")
      return n === o ? 0 : n < o ? -1 : 1;
    const s = e.test(n), i = e.test(o);
    return s && i && (n = +n, o = +o), n === o ? 0 : s && !i ? -1 : i && !s ? 1 : n < o ? -1 : 1;
  };
  return Ui = {
    compareIdentifiers: t,
    rcompareIdentifiers: (n, o) => t(o, n)
  }, Ui;
}
var ki, Qs;
function et() {
  if (Qs) return ki;
  Qs = 1;
  const e = mn(), { MAX_LENGTH: t, MAX_SAFE_INTEGER: r } = pn(), { safeRe: n, t: o } = qr(), s = Vo(), { compareIdentifiers: i } = eu();
  class d {
    constructor(h, c) {
      if (c = s(c), h instanceof d) {
        if (h.loose === !!c.loose && h.includePrerelease === !!c.includePrerelease)
          return h;
        h = h.version;
      } else if (typeof h != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof h}".`);
      if (h.length > t)
        throw new TypeError(
          `version is longer than ${t} characters`
        );
      e("SemVer", h, c), this.options = c, this.loose = !!c.loose, this.includePrerelease = !!c.includePrerelease;
      const l = h.trim().match(c.loose ? n[o.LOOSE] : n[o.FULL]);
      if (!l)
        throw new TypeError(`Invalid Version: ${h}`);
      if (this.raw = h, this.major = +l[1], this.minor = +l[2], this.patch = +l[3], this.major > r || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > r || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > r || this.patch < 0)
        throw new TypeError("Invalid patch version");
      l[4] ? this.prerelease = l[4].split(".").map((f) => {
        if (/^[0-9]+$/.test(f)) {
          const p = +f;
          if (p >= 0 && p < r)
            return p;
        }
        return f;
      }) : this.prerelease = [], this.build = l[5] ? l[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
    }
    toString() {
      return this.version;
    }
    compare(h) {
      if (e("SemVer.compare", this.version, this.options, h), !(h instanceof d)) {
        if (typeof h == "string" && h === this.version)
          return 0;
        h = new d(h, this.options);
      }
      return h.version === this.version ? 0 : this.compareMain(h) || this.comparePre(h);
    }
    compareMain(h) {
      return h instanceof d || (h = new d(h, this.options)), this.major < h.major ? -1 : this.major > h.major ? 1 : this.minor < h.minor ? -1 : this.minor > h.minor ? 1 : this.patch < h.patch ? -1 : this.patch > h.patch ? 1 : 0;
    }
    comparePre(h) {
      if (h instanceof d || (h = new d(h, this.options)), this.prerelease.length && !h.prerelease.length)
        return -1;
      if (!this.prerelease.length && h.prerelease.length)
        return 1;
      if (!this.prerelease.length && !h.prerelease.length)
        return 0;
      let c = 0;
      do {
        const l = this.prerelease[c], f = h.prerelease[c];
        if (e("prerelease compare", c, l, f), l === void 0 && f === void 0)
          return 0;
        if (f === void 0)
          return 1;
        if (l === void 0)
          return -1;
        if (l === f)
          continue;
        return i(l, f);
      } while (++c);
    }
    compareBuild(h) {
      h instanceof d || (h = new d(h, this.options));
      let c = 0;
      do {
        const l = this.build[c], f = h.build[c];
        if (e("build compare", c, l, f), l === void 0 && f === void 0)
          return 0;
        if (f === void 0)
          return 1;
        if (l === void 0)
          return -1;
        if (l === f)
          continue;
        return i(l, f);
      } while (++c);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(h, c, l) {
      if (h.startsWith("pre")) {
        if (!c && l === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (c) {
          const f = `-${c}`.match(this.options.loose ? n[o.PRERELEASELOOSE] : n[o.PRERELEASE]);
          if (!f || f[1] !== c)
            throw new Error(`invalid identifier: ${c}`);
        }
      }
      switch (h) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", c, l);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", c, l);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", c, l), this.inc("pre", c, l);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", c, l), this.inc("pre", c, l);
          break;
        case "release":
          if (this.prerelease.length === 0)
            throw new Error(`version ${this.raw} is not a prerelease`);
          this.prerelease.length = 0;
          break;
        case "major":
          (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
          break;
        case "minor":
          (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
          break;
        case "patch":
          this.prerelease.length === 0 && this.patch++, this.prerelease = [];
          break;
        // This probably shouldn't be used publicly.
        // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
        case "pre": {
          const f = Number(l) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [f];
          else {
            let p = this.prerelease.length;
            for (; --p >= 0; )
              typeof this.prerelease[p] == "number" && (this.prerelease[p]++, p = -2);
            if (p === -1) {
              if (c === this.prerelease.join(".") && l === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(f);
            }
          }
          if (c) {
            let p = [c, f];
            l === !1 && (p = [c]), i(this.prerelease[0], c) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = p) : this.prerelease = p;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${h}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return ki = d, ki;
}
var $i, Zs;
function ir() {
  if (Zs) return $i;
  Zs = 1;
  const e = et();
  return $i = (r, n, o = !1) => {
    if (r instanceof e)
      return r;
    try {
      return new e(r, n);
    } catch (s) {
      if (!o)
        return null;
      throw s;
    }
  }, $i;
}
var Mi, el;
function Cf() {
  if (el) return Mi;
  el = 1;
  const e = ir();
  return Mi = (r, n) => {
    const o = e(r, n);
    return o ? o.version : null;
  }, Mi;
}
var qi, tl;
function Nf() {
  if (tl) return qi;
  tl = 1;
  const e = ir();
  return qi = (r, n) => {
    const o = e(r.trim().replace(/^[=v]+/, ""), n);
    return o ? o.version : null;
  }, qi;
}
var Bi, rl;
function Df() {
  if (rl) return Bi;
  rl = 1;
  const e = et();
  return Bi = (r, n, o, s, i) => {
    typeof o == "string" && (i = s, s = o, o = void 0);
    try {
      return new e(
        r instanceof e ? r.version : r,
        o
      ).inc(n, s, i).version;
    } catch {
      return null;
    }
  }, Bi;
}
var Hi, nl;
function Of() {
  if (nl) return Hi;
  nl = 1;
  const e = ir();
  return Hi = (r, n) => {
    const o = e(r, null, !0), s = e(n, null, !0), i = o.compare(s);
    if (i === 0)
      return null;
    const d = i > 0, a = d ? o : s, h = d ? s : o, c = !!a.prerelease.length;
    if (!!h.prerelease.length && !c) {
      if (!h.patch && !h.minor)
        return "major";
      if (h.compareMain(a) === 0)
        return h.minor && !h.patch ? "minor" : "patch";
    }
    const f = c ? "pre" : "";
    return o.major !== s.major ? f + "major" : o.minor !== s.minor ? f + "minor" : o.patch !== s.patch ? f + "patch" : "prerelease";
  }, Hi;
}
var ji, il;
function Pf() {
  if (il) return ji;
  il = 1;
  const e = et();
  return ji = (r, n) => new e(r, n).major, ji;
}
var Gi, ol;
function Ff() {
  if (ol) return Gi;
  ol = 1;
  const e = et();
  return Gi = (r, n) => new e(r, n).minor, Gi;
}
var Wi, al;
function xf() {
  if (al) return Wi;
  al = 1;
  const e = et();
  return Wi = (r, n) => new e(r, n).patch, Wi;
}
var Vi, sl;
function Lf() {
  if (sl) return Vi;
  sl = 1;
  const e = ir();
  return Vi = (r, n) => {
    const o = e(r, n);
    return o && o.prerelease.length ? o.prerelease : null;
  }, Vi;
}
var zi, ll;
function ht() {
  if (ll) return zi;
  ll = 1;
  const e = et();
  return zi = (r, n, o) => new e(r, o).compare(new e(n, o)), zi;
}
var Yi, cl;
function Uf() {
  if (cl) return Yi;
  cl = 1;
  const e = ht();
  return Yi = (r, n, o) => e(n, r, o), Yi;
}
var Xi, ul;
function kf() {
  if (ul) return Xi;
  ul = 1;
  const e = ht();
  return Xi = (r, n) => e(r, n, !0), Xi;
}
var Ki, dl;
function zo() {
  if (dl) return Ki;
  dl = 1;
  const e = et();
  return Ki = (r, n, o) => {
    const s = new e(r, o), i = new e(n, o);
    return s.compare(i) || s.compareBuild(i);
  }, Ki;
}
var Ji, fl;
function $f() {
  if (fl) return Ji;
  fl = 1;
  const e = zo();
  return Ji = (r, n) => r.sort((o, s) => e(o, s, n)), Ji;
}
var Qi, hl;
function Mf() {
  if (hl) return Qi;
  hl = 1;
  const e = zo();
  return Qi = (r, n) => r.sort((o, s) => e(s, o, n)), Qi;
}
var Zi, pl;
function gn() {
  if (pl) return Zi;
  pl = 1;
  const e = ht();
  return Zi = (r, n, o) => e(r, n, o) > 0, Zi;
}
var eo, ml;
function Yo() {
  if (ml) return eo;
  ml = 1;
  const e = ht();
  return eo = (r, n, o) => e(r, n, o) < 0, eo;
}
var to, gl;
function tu() {
  if (gl) return to;
  gl = 1;
  const e = ht();
  return to = (r, n, o) => e(r, n, o) === 0, to;
}
var ro, El;
function ru() {
  if (El) return ro;
  El = 1;
  const e = ht();
  return ro = (r, n, o) => e(r, n, o) !== 0, ro;
}
var no, yl;
function Xo() {
  if (yl) return no;
  yl = 1;
  const e = ht();
  return no = (r, n, o) => e(r, n, o) >= 0, no;
}
var io, wl;
function Ko() {
  if (wl) return io;
  wl = 1;
  const e = ht();
  return io = (r, n, o) => e(r, n, o) <= 0, io;
}
var oo, vl;
function nu() {
  if (vl) return oo;
  vl = 1;
  const e = tu(), t = ru(), r = gn(), n = Xo(), o = Yo(), s = Ko();
  return oo = (d, a, h, c) => {
    switch (a) {
      case "===":
        return typeof d == "object" && (d = d.version), typeof h == "object" && (h = h.version), d === h;
      case "!==":
        return typeof d == "object" && (d = d.version), typeof h == "object" && (h = h.version), d !== h;
      case "":
      case "=":
      case "==":
        return e(d, h, c);
      case "!=":
        return t(d, h, c);
      case ">":
        return r(d, h, c);
      case ">=":
        return n(d, h, c);
      case "<":
        return o(d, h, c);
      case "<=":
        return s(d, h, c);
      default:
        throw new TypeError(`Invalid operator: ${a}`);
    }
  }, oo;
}
var ao, Tl;
function qf() {
  if (Tl) return ao;
  Tl = 1;
  const e = et(), t = ir(), { safeRe: r, t: n } = qr();
  return ao = (s, i) => {
    if (s instanceof e)
      return s;
    if (typeof s == "number" && (s = String(s)), typeof s != "string")
      return null;
    i = i || {};
    let d = null;
    if (!i.rtl)
      d = s.match(i.includePrerelease ? r[n.COERCEFULL] : r[n.COERCE]);
    else {
      const p = i.includePrerelease ? r[n.COERCERTLFULL] : r[n.COERCERTL];
      let g;
      for (; (g = p.exec(s)) && (!d || d.index + d[0].length !== s.length); )
        (!d || g.index + g[0].length !== d.index + d[0].length) && (d = g), p.lastIndex = g.index + g[1].length + g[2].length;
      p.lastIndex = -1;
    }
    if (d === null)
      return null;
    const a = d[2], h = d[3] || "0", c = d[4] || "0", l = i.includePrerelease && d[5] ? `-${d[5]}` : "", f = i.includePrerelease && d[6] ? `+${d[6]}` : "";
    return t(`${a}.${h}.${c}${l}${f}`, i);
  }, ao;
}
var so, _l;
function Bf() {
  if (_l) return so;
  _l = 1;
  class e {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(r) {
      const n = this.map.get(r);
      if (n !== void 0)
        return this.map.delete(r), this.map.set(r, n), n;
    }
    delete(r) {
      return this.map.delete(r);
    }
    set(r, n) {
      if (!this.delete(r) && n !== void 0) {
        if (this.map.size >= this.max) {
          const s = this.map.keys().next().value;
          this.delete(s);
        }
        this.map.set(r, n);
      }
      return this;
    }
  }
  return so = e, so;
}
var lo, Il;
function pt() {
  if (Il) return lo;
  Il = 1;
  const e = /\s+/g;
  class t {
    constructor(x, j) {
      if (j = o(j), x instanceof t)
        return x.loose === !!j.loose && x.includePrerelease === !!j.includePrerelease ? x : new t(x.raw, j);
      if (x instanceof s)
        return this.raw = x.value, this.set = [[x]], this.formatted = void 0, this;
      if (this.options = j, this.loose = !!j.loose, this.includePrerelease = !!j.includePrerelease, this.raw = x.trim().replace(e, " "), this.set = this.raw.split("||").map((k) => this.parseRange(k.trim())).filter((k) => k.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const k = this.set[0];
        if (this.set = this.set.filter((G) => !y(G[0])), this.set.length === 0)
          this.set = [k];
        else if (this.set.length > 1) {
          for (const G of this.set)
            if (G.length === 1 && m(G[0])) {
              this.set = [G];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let x = 0; x < this.set.length; x++) {
          x > 0 && (this.formatted += "||");
          const j = this.set[x];
          for (let k = 0; k < j.length; k++)
            k > 0 && (this.formatted += " "), this.formatted += j[k].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(x) {
      const k = ((this.options.includePrerelease && p) | (this.options.loose && g)) + ":" + x, G = n.get(k);
      if (G)
        return G;
      const z = this.options.loose, ee = z ? a[h.HYPHENRANGELOOSE] : a[h.HYPHENRANGE];
      x = x.replace(ee, L(this.options.includePrerelease)), i("hyphen replace", x), x = x.replace(a[h.COMPARATORTRIM], c), i("comparator trim", x), x = x.replace(a[h.TILDETRIM], l), i("tilde trim", x), x = x.replace(a[h.CARETTRIM], f), i("caret trim", x);
      let me = x.split(" ").map((Q) => I(Q, this.options)).join(" ").split(/\s+/).map((Q) => U(Q, this.options));
      z && (me = me.filter((Q) => (i("loose invalid filter", Q, this.options), !!Q.match(a[h.COMPARATORLOOSE])))), i("range list", me);
      const Z = /* @__PURE__ */ new Map(), ye = me.map((Q) => new s(Q, this.options));
      for (const Q of ye) {
        if (y(Q))
          return [Q];
        Z.set(Q.value, Q);
      }
      Z.size > 1 && Z.has("") && Z.delete("");
      const ge = [...Z.values()];
      return n.set(k, ge), ge;
    }
    intersects(x, j) {
      if (!(x instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((k) => _(k, j) && x.set.some((G) => _(G, j) && k.every((z) => G.every((ee) => z.intersects(ee, j)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(x) {
      if (!x)
        return !1;
      if (typeof x == "string")
        try {
          x = new d(x, this.options);
        } catch {
          return !1;
        }
      for (let j = 0; j < this.set.length; j++)
        if ($(this.set[j], x, this.options))
          return !0;
      return !1;
    }
  }
  lo = t;
  const r = Bf(), n = new r(), o = Vo(), s = En(), i = mn(), d = et(), {
    safeRe: a,
    t: h,
    comparatorTrimReplace: c,
    tildeTrimReplace: l,
    caretTrimReplace: f
  } = qr(), { FLAG_INCLUDE_PRERELEASE: p, FLAG_LOOSE: g } = pn(), y = (F) => F.value === "<0.0.0-0", m = (F) => F.value === "", _ = (F, x) => {
    let j = !0;
    const k = F.slice();
    let G = k.pop();
    for (; j && k.length; )
      j = k.every((z) => G.intersects(z, x)), G = k.pop();
    return j;
  }, I = (F, x) => (F = F.replace(a[h.BUILD], ""), i("comp", F, x), F = b(F, x), i("caret", F), F = O(F, x), i("tildes", F), F = w(F, x), i("xrange", F), F = T(F, x), i("stars", F), F), N = (F) => !F || F.toLowerCase() === "x" || F === "*", O = (F, x) => F.trim().split(/\s+/).map((j) => R(j, x)).join(" "), R = (F, x) => {
    const j = x.loose ? a[h.TILDELOOSE] : a[h.TILDE];
    return F.replace(j, (k, G, z, ee, me) => {
      i("tilde", F, k, G, z, ee, me);
      let Z;
      return N(G) ? Z = "" : N(z) ? Z = `>=${G}.0.0 <${+G + 1}.0.0-0` : N(ee) ? Z = `>=${G}.${z}.0 <${G}.${+z + 1}.0-0` : me ? (i("replaceTilde pr", me), Z = `>=${G}.${z}.${ee}-${me} <${G}.${+z + 1}.0-0`) : Z = `>=${G}.${z}.${ee} <${G}.${+z + 1}.0-0`, i("tilde return", Z), Z;
    });
  }, b = (F, x) => F.trim().split(/\s+/).map((j) => A(j, x)).join(" "), A = (F, x) => {
    i("caret", F, x);
    const j = x.loose ? a[h.CARETLOOSE] : a[h.CARET], k = x.includePrerelease ? "-0" : "";
    return F.replace(j, (G, z, ee, me, Z) => {
      i("caret", F, G, z, ee, me, Z);
      let ye;
      return N(z) ? ye = "" : N(ee) ? ye = `>=${z}.0.0${k} <${+z + 1}.0.0-0` : N(me) ? z === "0" ? ye = `>=${z}.${ee}.0${k} <${z}.${+ee + 1}.0-0` : ye = `>=${z}.${ee}.0${k} <${+z + 1}.0.0-0` : Z ? (i("replaceCaret pr", Z), z === "0" ? ee === "0" ? ye = `>=${z}.${ee}.${me}-${Z} <${z}.${ee}.${+me + 1}-0` : ye = `>=${z}.${ee}.${me}-${Z} <${z}.${+ee + 1}.0-0` : ye = `>=${z}.${ee}.${me}-${Z} <${+z + 1}.0.0-0`) : (i("no pr"), z === "0" ? ee === "0" ? ye = `>=${z}.${ee}.${me}${k} <${z}.${ee}.${+me + 1}-0` : ye = `>=${z}.${ee}.${me}${k} <${z}.${+ee + 1}.0-0` : ye = `>=${z}.${ee}.${me} <${+z + 1}.0.0-0`), i("caret return", ye), ye;
    });
  }, w = (F, x) => (i("replaceXRanges", F, x), F.split(/\s+/).map((j) => C(j, x)).join(" ")), C = (F, x) => {
    F = F.trim();
    const j = x.loose ? a[h.XRANGELOOSE] : a[h.XRANGE];
    return F.replace(j, (k, G, z, ee, me, Z) => {
      i("xRange", F, k, G, z, ee, me, Z);
      const ye = N(z), ge = ye || N(ee), Q = ge || N(me), de = Q;
      return G === "=" && de && (G = ""), Z = x.includePrerelease ? "-0" : "", ye ? G === ">" || G === "<" ? k = "<0.0.0-0" : k = "*" : G && de ? (ge && (ee = 0), me = 0, G === ">" ? (G = ">=", ge ? (z = +z + 1, ee = 0, me = 0) : (ee = +ee + 1, me = 0)) : G === "<=" && (G = "<", ge ? z = +z + 1 : ee = +ee + 1), G === "<" && (Z = "-0"), k = `${G + z}.${ee}.${me}${Z}`) : ge ? k = `>=${z}.0.0${Z} <${+z + 1}.0.0-0` : Q && (k = `>=${z}.${ee}.0${Z} <${z}.${+ee + 1}.0-0`), i("xRange return", k), k;
    });
  }, T = (F, x) => (i("replaceStars", F, x), F.trim().replace(a[h.STAR], "")), U = (F, x) => (i("replaceGTE0", F, x), F.trim().replace(a[x.includePrerelease ? h.GTE0PRE : h.GTE0], "")), L = (F) => (x, j, k, G, z, ee, me, Z, ye, ge, Q, de) => (N(k) ? j = "" : N(G) ? j = `>=${k}.0.0${F ? "-0" : ""}` : N(z) ? j = `>=${k}.${G}.0${F ? "-0" : ""}` : ee ? j = `>=${j}` : j = `>=${j}${F ? "-0" : ""}`, N(ye) ? Z = "" : N(ge) ? Z = `<${+ye + 1}.0.0-0` : N(Q) ? Z = `<${ye}.${+ge + 1}.0-0` : de ? Z = `<=${ye}.${ge}.${Q}-${de}` : F ? Z = `<${ye}.${ge}.${+Q + 1}-0` : Z = `<=${Z}`, `${j} ${Z}`.trim()), $ = (F, x, j) => {
    for (let k = 0; k < F.length; k++)
      if (!F[k].test(x))
        return !1;
    if (x.prerelease.length && !j.includePrerelease) {
      for (let k = 0; k < F.length; k++)
        if (i(F[k].semver), F[k].semver !== s.ANY && F[k].semver.prerelease.length > 0) {
          const G = F[k].semver;
          if (G.major === x.major && G.minor === x.minor && G.patch === x.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return lo;
}
var co, Sl;
function En() {
  if (Sl) return co;
  Sl = 1;
  const e = /* @__PURE__ */ Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(c, l) {
      if (l = r(l), c instanceof t) {
        if (c.loose === !!l.loose)
          return c;
        c = c.value;
      }
      c = c.trim().split(/\s+/).join(" "), i("comparator", c, l), this.options = l, this.loose = !!l.loose, this.parse(c), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, i("comp", this);
    }
    parse(c) {
      const l = this.options.loose ? n[o.COMPARATORLOOSE] : n[o.COMPARATOR], f = c.match(l);
      if (!f)
        throw new TypeError(`Invalid comparator: ${c}`);
      this.operator = f[1] !== void 0 ? f[1] : "", this.operator === "=" && (this.operator = ""), f[2] ? this.semver = new d(f[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(c) {
      if (i("Comparator.test", c, this.options.loose), this.semver === e || c === e)
        return !0;
      if (typeof c == "string")
        try {
          c = new d(c, this.options);
        } catch {
          return !1;
        }
      return s(c, this.operator, this.semver, this.options);
    }
    intersects(c, l) {
      if (!(c instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new a(c.value, l).test(this.value) : c.operator === "" ? c.value === "" ? !0 : new a(this.value, l).test(c.semver) : (l = r(l), l.includePrerelease && (this.value === "<0.0.0-0" || c.value === "<0.0.0-0") || !l.includePrerelease && (this.value.startsWith("<0.0.0") || c.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && c.operator.startsWith(">") || this.operator.startsWith("<") && c.operator.startsWith("<") || this.semver.version === c.semver.version && this.operator.includes("=") && c.operator.includes("=") || s(this.semver, "<", c.semver, l) && this.operator.startsWith(">") && c.operator.startsWith("<") || s(this.semver, ">", c.semver, l) && this.operator.startsWith("<") && c.operator.startsWith(">")));
    }
  }
  co = t;
  const r = Vo(), { safeRe: n, t: o } = qr(), s = nu(), i = mn(), d = et(), a = pt();
  return co;
}
var uo, Al;
function yn() {
  if (Al) return uo;
  Al = 1;
  const e = pt();
  return uo = (r, n, o) => {
    try {
      n = new e(n, o);
    } catch {
      return !1;
    }
    return n.test(r);
  }, uo;
}
var fo, Rl;
function Hf() {
  if (Rl) return fo;
  Rl = 1;
  const e = pt();
  return fo = (r, n) => new e(r, n).set.map((o) => o.map((s) => s.value).join(" ").trim().split(" ")), fo;
}
var ho, bl;
function jf() {
  if (bl) return ho;
  bl = 1;
  const e = et(), t = pt();
  return ho = (n, o, s) => {
    let i = null, d = null, a = null;
    try {
      a = new t(o, s);
    } catch {
      return null;
    }
    return n.forEach((h) => {
      a.test(h) && (!i || d.compare(h) === -1) && (i = h, d = new e(i, s));
    }), i;
  }, ho;
}
var po, Cl;
function Gf() {
  if (Cl) return po;
  Cl = 1;
  const e = et(), t = pt();
  return po = (n, o, s) => {
    let i = null, d = null, a = null;
    try {
      a = new t(o, s);
    } catch {
      return null;
    }
    return n.forEach((h) => {
      a.test(h) && (!i || d.compare(h) === 1) && (i = h, d = new e(i, s));
    }), i;
  }, po;
}
var mo, Nl;
function Wf() {
  if (Nl) return mo;
  Nl = 1;
  const e = et(), t = pt(), r = gn();
  return mo = (o, s) => {
    o = new t(o, s);
    let i = new e("0.0.0");
    if (o.test(i) || (i = new e("0.0.0-0"), o.test(i)))
      return i;
    i = null;
    for (let d = 0; d < o.set.length; ++d) {
      const a = o.set[d];
      let h = null;
      a.forEach((c) => {
        const l = new e(c.semver.version);
        switch (c.operator) {
          case ">":
            l.prerelease.length === 0 ? l.patch++ : l.prerelease.push(0), l.raw = l.format();
          /* fallthrough */
          case "":
          case ">=":
            (!h || r(l, h)) && (h = l);
            break;
          case "<":
          case "<=":
            break;
          /* istanbul ignore next */
          default:
            throw new Error(`Unexpected operation: ${c.operator}`);
        }
      }), h && (!i || r(i, h)) && (i = h);
    }
    return i && o.test(i) ? i : null;
  }, mo;
}
var go, Dl;
function Vf() {
  if (Dl) return go;
  Dl = 1;
  const e = pt();
  return go = (r, n) => {
    try {
      return new e(r, n).range || "*";
    } catch {
      return null;
    }
  }, go;
}
var Eo, Ol;
function Jo() {
  if (Ol) return Eo;
  Ol = 1;
  const e = et(), t = En(), { ANY: r } = t, n = pt(), o = yn(), s = gn(), i = Yo(), d = Ko(), a = Xo();
  return Eo = (c, l, f, p) => {
    c = new e(c, p), l = new n(l, p);
    let g, y, m, _, I;
    switch (f) {
      case ">":
        g = s, y = d, m = i, _ = ">", I = ">=";
        break;
      case "<":
        g = i, y = a, m = s, _ = "<", I = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (o(c, l, p))
      return !1;
    for (let N = 0; N < l.set.length; ++N) {
      const O = l.set[N];
      let R = null, b = null;
      if (O.forEach((A) => {
        A.semver === r && (A = new t(">=0.0.0")), R = R || A, b = b || A, g(A.semver, R.semver, p) ? R = A : m(A.semver, b.semver, p) && (b = A);
      }), R.operator === _ || R.operator === I || (!b.operator || b.operator === _) && y(c, b.semver))
        return !1;
      if (b.operator === I && m(c, b.semver))
        return !1;
    }
    return !0;
  }, Eo;
}
var yo, Pl;
function zf() {
  if (Pl) return yo;
  Pl = 1;
  const e = Jo();
  return yo = (r, n, o) => e(r, n, ">", o), yo;
}
var wo, Fl;
function Yf() {
  if (Fl) return wo;
  Fl = 1;
  const e = Jo();
  return wo = (r, n, o) => e(r, n, "<", o), wo;
}
var vo, xl;
function Xf() {
  if (xl) return vo;
  xl = 1;
  const e = pt();
  return vo = (r, n, o) => (r = new e(r, o), n = new e(n, o), r.intersects(n, o)), vo;
}
var To, Ll;
function Kf() {
  if (Ll) return To;
  Ll = 1;
  const e = yn(), t = ht();
  return To = (r, n, o) => {
    const s = [];
    let i = null, d = null;
    const a = r.sort((f, p) => t(f, p, o));
    for (const f of a)
      e(f, n, o) ? (d = f, i || (i = f)) : (d && s.push([i, d]), d = null, i = null);
    i && s.push([i, null]);
    const h = [];
    for (const [f, p] of s)
      f === p ? h.push(f) : !p && f === a[0] ? h.push("*") : p ? f === a[0] ? h.push(`<=${p}`) : h.push(`${f} - ${p}`) : h.push(`>=${f}`);
    const c = h.join(" || "), l = typeof n.raw == "string" ? n.raw : String(n);
    return c.length < l.length ? c : n;
  }, To;
}
var _o, Ul;
function Jf() {
  if (Ul) return _o;
  Ul = 1;
  const e = pt(), t = En(), { ANY: r } = t, n = yn(), o = ht(), s = (l, f, p = {}) => {
    if (l === f)
      return !0;
    l = new e(l, p), f = new e(f, p);
    let g = !1;
    e: for (const y of l.set) {
      for (const m of f.set) {
        const _ = a(y, m, p);
        if (g = g || _ !== null, _)
          continue e;
      }
      if (g)
        return !1;
    }
    return !0;
  }, i = [new t(">=0.0.0-0")], d = [new t(">=0.0.0")], a = (l, f, p) => {
    if (l === f)
      return !0;
    if (l.length === 1 && l[0].semver === r) {
      if (f.length === 1 && f[0].semver === r)
        return !0;
      p.includePrerelease ? l = i : l = d;
    }
    if (f.length === 1 && f[0].semver === r) {
      if (p.includePrerelease)
        return !0;
      f = d;
    }
    const g = /* @__PURE__ */ new Set();
    let y, m;
    for (const w of l)
      w.operator === ">" || w.operator === ">=" ? y = h(y, w, p) : w.operator === "<" || w.operator === "<=" ? m = c(m, w, p) : g.add(w.semver);
    if (g.size > 1)
      return null;
    let _;
    if (y && m) {
      if (_ = o(y.semver, m.semver, p), _ > 0)
        return null;
      if (_ === 0 && (y.operator !== ">=" || m.operator !== "<="))
        return null;
    }
    for (const w of g) {
      if (y && !n(w, String(y), p) || m && !n(w, String(m), p))
        return null;
      for (const C of f)
        if (!n(w, String(C), p))
          return !1;
      return !0;
    }
    let I, N, O, R, b = m && !p.includePrerelease && m.semver.prerelease.length ? m.semver : !1, A = y && !p.includePrerelease && y.semver.prerelease.length ? y.semver : !1;
    b && b.prerelease.length === 1 && m.operator === "<" && b.prerelease[0] === 0 && (b = !1);
    for (const w of f) {
      if (R = R || w.operator === ">" || w.operator === ">=", O = O || w.operator === "<" || w.operator === "<=", y) {
        if (A && w.semver.prerelease && w.semver.prerelease.length && w.semver.major === A.major && w.semver.minor === A.minor && w.semver.patch === A.patch && (A = !1), w.operator === ">" || w.operator === ">=") {
          if (I = h(y, w, p), I === w && I !== y)
            return !1;
        } else if (y.operator === ">=" && !n(y.semver, String(w), p))
          return !1;
      }
      if (m) {
        if (b && w.semver.prerelease && w.semver.prerelease.length && w.semver.major === b.major && w.semver.minor === b.minor && w.semver.patch === b.patch && (b = !1), w.operator === "<" || w.operator === "<=") {
          if (N = c(m, w, p), N === w && N !== m)
            return !1;
        } else if (m.operator === "<=" && !n(m.semver, String(w), p))
          return !1;
      }
      if (!w.operator && (m || y) && _ !== 0)
        return !1;
    }
    return !(y && O && !m && _ !== 0 || m && R && !y && _ !== 0 || A || b);
  }, h = (l, f, p) => {
    if (!l)
      return f;
    const g = o(l.semver, f.semver, p);
    return g > 0 ? l : g < 0 || f.operator === ">" && l.operator === ">=" ? f : l;
  }, c = (l, f, p) => {
    if (!l)
      return f;
    const g = o(l.semver, f.semver, p);
    return g < 0 ? l : g > 0 || f.operator === "<" && l.operator === "<=" ? f : l;
  };
  return _o = s, _o;
}
var Io, kl;
function iu() {
  if (kl) return Io;
  kl = 1;
  const e = qr(), t = pn(), r = et(), n = eu(), o = ir(), s = Cf(), i = Nf(), d = Df(), a = Of(), h = Pf(), c = Ff(), l = xf(), f = Lf(), p = ht(), g = Uf(), y = kf(), m = zo(), _ = $f(), I = Mf(), N = gn(), O = Yo(), R = tu(), b = ru(), A = Xo(), w = Ko(), C = nu(), T = qf(), U = En(), L = pt(), $ = yn(), F = Hf(), x = jf(), j = Gf(), k = Wf(), G = Vf(), z = Jo(), ee = zf(), me = Yf(), Z = Xf(), ye = Kf(), ge = Jf();
  return Io = {
    parse: o,
    valid: s,
    clean: i,
    inc: d,
    diff: a,
    major: h,
    minor: c,
    patch: l,
    prerelease: f,
    compare: p,
    rcompare: g,
    compareLoose: y,
    compareBuild: m,
    sort: _,
    rsort: I,
    gt: N,
    lt: O,
    eq: R,
    neq: b,
    gte: A,
    lte: w,
    cmp: C,
    coerce: T,
    Comparator: U,
    Range: L,
    satisfies: $,
    toComparators: F,
    maxSatisfying: x,
    minSatisfying: j,
    minVersion: k,
    validRange: G,
    outside: z,
    gtr: ee,
    ltr: me,
    intersects: Z,
    simplifyRange: ye,
    subset: ge,
    SemVer: r,
    re: e.re,
    src: e.src,
    tokens: e.t,
    SEMVER_SPEC_VERSION: t.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: t.RELEASE_TYPES,
    compareIdentifiers: n.compareIdentifiers,
    rcompareIdentifiers: n.rcompareIdentifiers
  }, Io;
}
var Jt = {}, Fr = { exports: {} };
Fr.exports;
var $l;
function Qf() {
  return $l || ($l = 1, (function(e, t) {
    var r = 200, n = "__lodash_hash_undefined__", o = 1, s = 2, i = 9007199254740991, d = "[object Arguments]", a = "[object Array]", h = "[object AsyncFunction]", c = "[object Boolean]", l = "[object Date]", f = "[object Error]", p = "[object Function]", g = "[object GeneratorFunction]", y = "[object Map]", m = "[object Number]", _ = "[object Null]", I = "[object Object]", N = "[object Promise]", O = "[object Proxy]", R = "[object RegExp]", b = "[object Set]", A = "[object String]", w = "[object Symbol]", C = "[object Undefined]", T = "[object WeakMap]", U = "[object ArrayBuffer]", L = "[object DataView]", $ = "[object Float32Array]", F = "[object Float64Array]", x = "[object Int8Array]", j = "[object Int16Array]", k = "[object Int32Array]", G = "[object Uint8Array]", z = "[object Uint8ClampedArray]", ee = "[object Uint16Array]", me = "[object Uint32Array]", Z = /[\\^$.*+?()[\]{}|]/g, ye = /^\[object .+?Constructor\]$/, ge = /^(?:0|[1-9]\d*)$/, Q = {};
    Q[$] = Q[F] = Q[x] = Q[j] = Q[k] = Q[G] = Q[z] = Q[ee] = Q[me] = !0, Q[d] = Q[a] = Q[U] = Q[c] = Q[L] = Q[l] = Q[f] = Q[p] = Q[y] = Q[m] = Q[I] = Q[R] = Q[b] = Q[A] = Q[T] = !1;
    var de = typeof dt == "object" && dt && dt.Object === Object && dt, we = typeof self == "object" && self && self.Object === Object && self, Se = de || we || Function("return this")(), De = t && !t.nodeType && t, Ne = De && !0 && e && !e.nodeType && e, Ie = Ne && Ne.exports === De, v = Ie && de.process, E = (function() {
      try {
        return v && v.binding && v.binding("util");
      } catch {
      }
    })(), q = E && E.isTypedArray;
    function P(D, M) {
      for (var J = -1, ce = D == null ? 0 : D.length, Fe = 0, ve = []; ++J < ce; ) {
        var $e = D[J];
        M($e, J, D) && (ve[Fe++] = $e);
      }
      return ve;
    }
    function Te(D, M) {
      for (var J = -1, ce = M.length, Fe = D.length; ++J < ce; )
        D[Fe + J] = M[J];
      return D;
    }
    function _e(D, M) {
      for (var J = -1, ce = D == null ? 0 : D.length; ++J < ce; )
        if (M(D[J], J, D))
          return !0;
      return !1;
    }
    function Pe(D, M) {
      for (var J = -1, ce = Array(D); ++J < D; )
        ce[J] = M(J);
      return ce;
    }
    function Me(D) {
      return function(M) {
        return D(M);
      };
    }
    function qe(D, M) {
      return D.has(M);
    }
    function Xe(D, M) {
      return D?.[M];
    }
    function u(D) {
      var M = -1, J = Array(D.size);
      return D.forEach(function(ce, Fe) {
        J[++M] = [Fe, ce];
      }), J;
    }
    function B(D, M) {
      return function(J) {
        return D(M(J));
      };
    }
    function W(D) {
      var M = -1, J = Array(D.size);
      return D.forEach(function(ce) {
        J[++M] = ce;
      }), J;
    }
    var ie = Array.prototype, V = Function.prototype, ne = Object.prototype, te = Se["__core-js_shared__"], se = V.toString, ue = ne.hasOwnProperty, Re = (function() {
      var D = /[^.]+$/.exec(te && te.keys && te.keys.IE_PROTO || "");
      return D ? "Symbol(src)_1." + D : "";
    })(), be = ne.toString, he = RegExp(
      "^" + se.call(ue).replace(Z, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    ), S = Ie ? Se.Buffer : void 0, H = Se.Symbol, Y = Se.Uint8Array, X = ne.propertyIsEnumerable, K = ie.splice, ae = H ? H.toStringTag : void 0, re = Object.getOwnPropertySymbols, le = S ? S.isBuffer : void 0, fe = B(Object.keys, Object), Ee = Yt(Se, "DataView"), Oe = Yt(Se, "Map"), ke = Yt(Se, "Promise"), Ce = Yt(Se, "Set"), zt = Yt(Se, "WeakMap"), ct = Yt(Object, "create"), Ft = Ut(Ee), Gu = Ut(Oe), Wu = Ut(ke), Vu = Ut(Ce), zu = Ut(zt), ua = H ? H.prototype : void 0, An = ua ? ua.valueOf : void 0;
    function xt(D) {
      var M = -1, J = D == null ? 0 : D.length;
      for (this.clear(); ++M < J; ) {
        var ce = D[M];
        this.set(ce[0], ce[1]);
      }
    }
    function Yu() {
      this.__data__ = ct ? ct(null) : {}, this.size = 0;
    }
    function Xu(D) {
      var M = this.has(D) && delete this.__data__[D];
      return this.size -= M ? 1 : 0, M;
    }
    function Ku(D) {
      var M = this.__data__;
      if (ct) {
        var J = M[D];
        return J === n ? void 0 : J;
      }
      return ue.call(M, D) ? M[D] : void 0;
    }
    function Ju(D) {
      var M = this.__data__;
      return ct ? M[D] !== void 0 : ue.call(M, D);
    }
    function Qu(D, M) {
      var J = this.__data__;
      return this.size += this.has(D) ? 0 : 1, J[D] = ct && M === void 0 ? n : M, this;
    }
    xt.prototype.clear = Yu, xt.prototype.delete = Xu, xt.prototype.get = Ku, xt.prototype.has = Ju, xt.prototype.set = Qu;
    function vt(D) {
      var M = -1, J = D == null ? 0 : D.length;
      for (this.clear(); ++M < J; ) {
        var ce = D[M];
        this.set(ce[0], ce[1]);
      }
    }
    function Zu() {
      this.__data__ = [], this.size = 0;
    }
    function ed(D) {
      var M = this.__data__, J = jr(M, D);
      if (J < 0)
        return !1;
      var ce = M.length - 1;
      return J == ce ? M.pop() : K.call(M, J, 1), --this.size, !0;
    }
    function td(D) {
      var M = this.__data__, J = jr(M, D);
      return J < 0 ? void 0 : M[J][1];
    }
    function rd(D) {
      return jr(this.__data__, D) > -1;
    }
    function nd(D, M) {
      var J = this.__data__, ce = jr(J, D);
      return ce < 0 ? (++this.size, J.push([D, M])) : J[ce][1] = M, this;
    }
    vt.prototype.clear = Zu, vt.prototype.delete = ed, vt.prototype.get = td, vt.prototype.has = rd, vt.prototype.set = nd;
    function Lt(D) {
      var M = -1, J = D == null ? 0 : D.length;
      for (this.clear(); ++M < J; ) {
        var ce = D[M];
        this.set(ce[0], ce[1]);
      }
    }
    function id() {
      this.size = 0, this.__data__ = {
        hash: new xt(),
        map: new (Oe || vt)(),
        string: new xt()
      };
    }
    function od(D) {
      var M = Gr(this, D).delete(D);
      return this.size -= M ? 1 : 0, M;
    }
    function ad(D) {
      return Gr(this, D).get(D);
    }
    function sd(D) {
      return Gr(this, D).has(D);
    }
    function ld(D, M) {
      var J = Gr(this, D), ce = J.size;
      return J.set(D, M), this.size += J.size == ce ? 0 : 1, this;
    }
    Lt.prototype.clear = id, Lt.prototype.delete = od, Lt.prototype.get = ad, Lt.prototype.has = sd, Lt.prototype.set = ld;
    function Hr(D) {
      var M = -1, J = D == null ? 0 : D.length;
      for (this.__data__ = new Lt(); ++M < J; )
        this.add(D[M]);
    }
    function cd(D) {
      return this.__data__.set(D, n), this;
    }
    function ud(D) {
      return this.__data__.has(D);
    }
    Hr.prototype.add = Hr.prototype.push = cd, Hr.prototype.has = ud;
    function At(D) {
      var M = this.__data__ = new vt(D);
      this.size = M.size;
    }
    function dd() {
      this.__data__ = new vt(), this.size = 0;
    }
    function fd(D) {
      var M = this.__data__, J = M.delete(D);
      return this.size = M.size, J;
    }
    function hd(D) {
      return this.__data__.get(D);
    }
    function pd(D) {
      return this.__data__.has(D);
    }
    function md(D, M) {
      var J = this.__data__;
      if (J instanceof vt) {
        var ce = J.__data__;
        if (!Oe || ce.length < r - 1)
          return ce.push([D, M]), this.size = ++J.size, this;
        J = this.__data__ = new Lt(ce);
      }
      return J.set(D, M), this.size = J.size, this;
    }
    At.prototype.clear = dd, At.prototype.delete = fd, At.prototype.get = hd, At.prototype.has = pd, At.prototype.set = md;
    function gd(D, M) {
      var J = Wr(D), ce = !J && Od(D), Fe = !J && !ce && Rn(D), ve = !J && !ce && !Fe && wa(D), $e = J || ce || Fe || ve, je = $e ? Pe(D.length, String) : [], We = je.length;
      for (var Ue in D)
        ue.call(D, Ue) && !($e && // Safari 9 has enumerable `arguments.length` in strict mode.
        (Ue == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
        Fe && (Ue == "offset" || Ue == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        ve && (Ue == "buffer" || Ue == "byteLength" || Ue == "byteOffset") || // Skip index properties.
        Rd(Ue, We))) && je.push(Ue);
      return je;
    }
    function jr(D, M) {
      for (var J = D.length; J--; )
        if (ma(D[J][0], M))
          return J;
      return -1;
    }
    function Ed(D, M, J) {
      var ce = M(D);
      return Wr(D) ? ce : Te(ce, J(D));
    }
    function ar(D) {
      return D == null ? D === void 0 ? C : _ : ae && ae in Object(D) ? Sd(D) : Dd(D);
    }
    function da(D) {
      return sr(D) && ar(D) == d;
    }
    function fa(D, M, J, ce, Fe) {
      return D === M ? !0 : D == null || M == null || !sr(D) && !sr(M) ? D !== D && M !== M : yd(D, M, J, ce, fa, Fe);
    }
    function yd(D, M, J, ce, Fe, ve) {
      var $e = Wr(D), je = Wr(M), We = $e ? a : Rt(D), Ue = je ? a : Rt(M);
      We = We == d ? I : We, Ue = Ue == d ? I : Ue;
      var nt = We == I, ut = Ue == I, Ke = We == Ue;
      if (Ke && Rn(D)) {
        if (!Rn(M))
          return !1;
        $e = !0, nt = !1;
      }
      if (Ke && !nt)
        return ve || (ve = new At()), $e || wa(D) ? ha(D, M, J, ce, Fe, ve) : _d(D, M, We, J, ce, Fe, ve);
      if (!(J & o)) {
        var at = nt && ue.call(D, "__wrapped__"), st = ut && ue.call(M, "__wrapped__");
        if (at || st) {
          var bt = at ? D.value() : D, Tt = st ? M.value() : M;
          return ve || (ve = new At()), Fe(bt, Tt, J, ce, ve);
        }
      }
      return Ke ? (ve || (ve = new At()), Id(D, M, J, ce, Fe, ve)) : !1;
    }
    function wd(D) {
      if (!ya(D) || Cd(D))
        return !1;
      var M = ga(D) ? he : ye;
      return M.test(Ut(D));
    }
    function vd(D) {
      return sr(D) && Ea(D.length) && !!Q[ar(D)];
    }
    function Td(D) {
      if (!Nd(D))
        return fe(D);
      var M = [];
      for (var J in Object(D))
        ue.call(D, J) && J != "constructor" && M.push(J);
      return M;
    }
    function ha(D, M, J, ce, Fe, ve) {
      var $e = J & o, je = D.length, We = M.length;
      if (je != We && !($e && We > je))
        return !1;
      var Ue = ve.get(D);
      if (Ue && ve.get(M))
        return Ue == M;
      var nt = -1, ut = !0, Ke = J & s ? new Hr() : void 0;
      for (ve.set(D, M), ve.set(M, D); ++nt < je; ) {
        var at = D[nt], st = M[nt];
        if (ce)
          var bt = $e ? ce(st, at, nt, M, D, ve) : ce(at, st, nt, D, M, ve);
        if (bt !== void 0) {
          if (bt)
            continue;
          ut = !1;
          break;
        }
        if (Ke) {
          if (!_e(M, function(Tt, kt) {
            if (!qe(Ke, kt) && (at === Tt || Fe(at, Tt, J, ce, ve)))
              return Ke.push(kt);
          })) {
            ut = !1;
            break;
          }
        } else if (!(at === st || Fe(at, st, J, ce, ve))) {
          ut = !1;
          break;
        }
      }
      return ve.delete(D), ve.delete(M), ut;
    }
    function _d(D, M, J, ce, Fe, ve, $e) {
      switch (J) {
        case L:
          if (D.byteLength != M.byteLength || D.byteOffset != M.byteOffset)
            return !1;
          D = D.buffer, M = M.buffer;
        case U:
          return !(D.byteLength != M.byteLength || !ve(new Y(D), new Y(M)));
        case c:
        case l:
        case m:
          return ma(+D, +M);
        case f:
          return D.name == M.name && D.message == M.message;
        case R:
        case A:
          return D == M + "";
        case y:
          var je = u;
        case b:
          var We = ce & o;
          if (je || (je = W), D.size != M.size && !We)
            return !1;
          var Ue = $e.get(D);
          if (Ue)
            return Ue == M;
          ce |= s, $e.set(D, M);
          var nt = ha(je(D), je(M), ce, Fe, ve, $e);
          return $e.delete(D), nt;
        case w:
          if (An)
            return An.call(D) == An.call(M);
      }
      return !1;
    }
    function Id(D, M, J, ce, Fe, ve) {
      var $e = J & o, je = pa(D), We = je.length, Ue = pa(M), nt = Ue.length;
      if (We != nt && !$e)
        return !1;
      for (var ut = We; ut--; ) {
        var Ke = je[ut];
        if (!($e ? Ke in M : ue.call(M, Ke)))
          return !1;
      }
      var at = ve.get(D);
      if (at && ve.get(M))
        return at == M;
      var st = !0;
      ve.set(D, M), ve.set(M, D);
      for (var bt = $e; ++ut < We; ) {
        Ke = je[ut];
        var Tt = D[Ke], kt = M[Ke];
        if (ce)
          var va = $e ? ce(kt, Tt, Ke, M, D, ve) : ce(Tt, kt, Ke, D, M, ve);
        if (!(va === void 0 ? Tt === kt || Fe(Tt, kt, J, ce, ve) : va)) {
          st = !1;
          break;
        }
        bt || (bt = Ke == "constructor");
      }
      if (st && !bt) {
        var Vr = D.constructor, zr = M.constructor;
        Vr != zr && "constructor" in D && "constructor" in M && !(typeof Vr == "function" && Vr instanceof Vr && typeof zr == "function" && zr instanceof zr) && (st = !1);
      }
      return ve.delete(D), ve.delete(M), st;
    }
    function pa(D) {
      return Ed(D, xd, Ad);
    }
    function Gr(D, M) {
      var J = D.__data__;
      return bd(M) ? J[typeof M == "string" ? "string" : "hash"] : J.map;
    }
    function Yt(D, M) {
      var J = Xe(D, M);
      return wd(J) ? J : void 0;
    }
    function Sd(D) {
      var M = ue.call(D, ae), J = D[ae];
      try {
        D[ae] = void 0;
        var ce = !0;
      } catch {
      }
      var Fe = be.call(D);
      return ce && (M ? D[ae] = J : delete D[ae]), Fe;
    }
    var Ad = re ? function(D) {
      return D == null ? [] : (D = Object(D), P(re(D), function(M) {
        return X.call(D, M);
      }));
    } : Ld, Rt = ar;
    (Ee && Rt(new Ee(new ArrayBuffer(1))) != L || Oe && Rt(new Oe()) != y || ke && Rt(ke.resolve()) != N || Ce && Rt(new Ce()) != b || zt && Rt(new zt()) != T) && (Rt = function(D) {
      var M = ar(D), J = M == I ? D.constructor : void 0, ce = J ? Ut(J) : "";
      if (ce)
        switch (ce) {
          case Ft:
            return L;
          case Gu:
            return y;
          case Wu:
            return N;
          case Vu:
            return b;
          case zu:
            return T;
        }
      return M;
    });
    function Rd(D, M) {
      return M = M ?? i, !!M && (typeof D == "number" || ge.test(D)) && D > -1 && D % 1 == 0 && D < M;
    }
    function bd(D) {
      var M = typeof D;
      return M == "string" || M == "number" || M == "symbol" || M == "boolean" ? D !== "__proto__" : D === null;
    }
    function Cd(D) {
      return !!Re && Re in D;
    }
    function Nd(D) {
      var M = D && D.constructor, J = typeof M == "function" && M.prototype || ne;
      return D === J;
    }
    function Dd(D) {
      return be.call(D);
    }
    function Ut(D) {
      if (D != null) {
        try {
          return se.call(D);
        } catch {
        }
        try {
          return D + "";
        } catch {
        }
      }
      return "";
    }
    function ma(D, M) {
      return D === M || D !== D && M !== M;
    }
    var Od = da(/* @__PURE__ */ (function() {
      return arguments;
    })()) ? da : function(D) {
      return sr(D) && ue.call(D, "callee") && !X.call(D, "callee");
    }, Wr = Array.isArray;
    function Pd(D) {
      return D != null && Ea(D.length) && !ga(D);
    }
    var Rn = le || Ud;
    function Fd(D, M) {
      return fa(D, M);
    }
    function ga(D) {
      if (!ya(D))
        return !1;
      var M = ar(D);
      return M == p || M == g || M == h || M == O;
    }
    function Ea(D) {
      return typeof D == "number" && D > -1 && D % 1 == 0 && D <= i;
    }
    function ya(D) {
      var M = typeof D;
      return D != null && (M == "object" || M == "function");
    }
    function sr(D) {
      return D != null && typeof D == "object";
    }
    var wa = q ? Me(q) : vd;
    function xd(D) {
      return Pd(D) ? gd(D) : Td(D);
    }
    function Ld() {
      return [];
    }
    function Ud() {
      return !1;
    }
    e.exports = Fd;
  })(Fr, Fr.exports)), Fr.exports;
}
var Ml;
function Zf() {
  if (Ml) return Jt;
  Ml = 1, Object.defineProperty(Jt, "__esModule", { value: !0 }), Jt.DownloadedUpdateHelper = void 0, Jt.createTempUpdateFile = d;
  const e = tt, t = St, r = Qf(), n = /* @__PURE__ */ Pt(), o = Le;
  let s = class {
    constructor(h) {
      this.cacheDir = h, this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, this._downloadedFileInfo = null;
    }
    get downloadedFileInfo() {
      return this._downloadedFileInfo;
    }
    get file() {
      return this._file;
    }
    get packageFile() {
      return this._packageFile;
    }
    get cacheDirForPendingUpdate() {
      return o.join(this.cacheDir, "pending");
    }
    async validateDownloadedPath(h, c, l, f) {
      if (this.versionInfo != null && this.file === h && this.fileInfo != null)
        return r(this.versionInfo, c) && r(this.fileInfo.info, l.info) && await (0, n.pathExists)(h) ? h : null;
      const p = await this.getValidCachedUpdateFile(l, f);
      return p === null ? null : (f.info(`Update has already been downloaded to ${h}).`), this._file = p, p);
    }
    async setDownloadedFile(h, c, l, f, p, g) {
      this._file = h, this._packageFile = c, this.versionInfo = l, this.fileInfo = f, this._downloadedFileInfo = {
        fileName: p,
        sha512: f.info.sha512,
        isAdminRightsRequired: f.info.isAdminRightsRequired === !0
      }, g && await (0, n.outputJson)(this.getUpdateInfoFile(), this._downloadedFileInfo);
    }
    async clear() {
      this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, await this.cleanCacheDirForPendingUpdate();
    }
    async cleanCacheDirForPendingUpdate() {
      try {
        await (0, n.emptyDir)(this.cacheDirForPendingUpdate);
      } catch {
      }
    }
    /**
     * Returns "update-info.json" which is created in the update cache directory's "pending" subfolder after the first update is downloaded.  If the update file does not exist then the cache is cleared and recreated.  If the update file exists then its properties are validated.
     * @param fileInfo
     * @param logger
     */
    async getValidCachedUpdateFile(h, c) {
      const l = this.getUpdateInfoFile();
      if (!await (0, n.pathExists)(l))
        return null;
      let p;
      try {
        p = await (0, n.readJson)(l);
      } catch (_) {
        let I = "No cached update info available";
        return _.code !== "ENOENT" && (await this.cleanCacheDirForPendingUpdate(), I += ` (error on read: ${_.message})`), c.info(I), null;
      }
      if (!(p?.fileName !== null))
        return c.warn("Cached update info is corrupted: no fileName, directory for cached update will be cleaned"), await this.cleanCacheDirForPendingUpdate(), null;
      if (h.info.sha512 !== p.sha512)
        return c.info(`Cached update sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${p.sha512}, expected: ${h.info.sha512}. Directory for cached update will be cleaned`), await this.cleanCacheDirForPendingUpdate(), null;
      const y = o.join(this.cacheDirForPendingUpdate, p.fileName);
      if (!await (0, n.pathExists)(y))
        return c.info("Cached update file doesn't exist"), null;
      const m = await i(y);
      return h.info.sha512 !== m ? (c.warn(`Sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${m}, expected: ${h.info.sha512}`), await this.cleanCacheDirForPendingUpdate(), null) : (this._downloadedFileInfo = p, y);
    }
    getUpdateInfoFile() {
      return o.join(this.cacheDirForPendingUpdate, "update-info.json");
    }
  };
  Jt.DownloadedUpdateHelper = s;
  function i(a, h = "sha512", c = "base64", l) {
    return new Promise((f, p) => {
      const g = (0, e.createHash)(h);
      g.on("error", p).setEncoding(c), (0, t.createReadStream)(a, {
        ...l,
        highWaterMark: 1024 * 1024
        /* better to use more memory but hash faster */
      }).on("error", p).on("end", () => {
        g.end(), f(g.read());
      }).pipe(g, { end: !1 });
    });
  }
  async function d(a, h, c) {
    let l = 0, f = o.join(h, a);
    for (let p = 0; p < 3; p++)
      try {
        return await (0, n.unlink)(f), f;
      } catch (g) {
        if (g.code === "ENOENT")
          return f;
        c.warn(`Error on remove temp update file: ${g}`), f = o.join(h, `${l++}-${a}`);
      }
    return f;
  }
  return Jt;
}
var fr = {}, an = {}, ql;
function eh() {
  if (ql) return an;
  ql = 1, Object.defineProperty(an, "__esModule", { value: !0 }), an.getAppCacheDir = r;
  const e = Le, t = kr;
  function r() {
    const n = (0, t.homedir)();
    let o;
    return process.platform === "win32" ? o = process.env.LOCALAPPDATA || e.join(n, "AppData", "Local") : process.platform === "darwin" ? o = e.join(n, "Library", "Caches") : o = process.env.XDG_CACHE_HOME || e.join(n, ".cache"), o;
  }
  return an;
}
var Bl;
function th() {
  if (Bl) return fr;
  Bl = 1, Object.defineProperty(fr, "__esModule", { value: !0 }), fr.ElectronAppAdapter = void 0;
  const e = Le, t = eh();
  let r = class {
    constructor(o = Ht.app) {
      this.app = o;
    }
    whenReady() {
      return this.app.whenReady();
    }
    get version() {
      return this.app.getVersion();
    }
    get name() {
      return this.app.getName();
    }
    get isPackaged() {
      return this.app.isPackaged === !0;
    }
    get appUpdateConfigPath() {
      return this.isPackaged ? e.join(process.resourcesPath, "app-update.yml") : e.join(this.app.getAppPath(), "dev-app-update.yml");
    }
    get userDataPath() {
      return this.app.getPath("userData");
    }
    get baseCachePath() {
      return (0, t.getAppCacheDir)();
    }
    quit() {
      this.app.quit();
    }
    relaunch() {
      this.app.relaunch();
    }
    onQuit(o) {
      this.app.once("quit", (s, i) => o(i));
    }
  };
  return fr.ElectronAppAdapter = r, fr;
}
var So = {}, Hl;
function rh() {
  return Hl || (Hl = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ElectronHttpExecutor = e.NET_SESSION_NAME = void 0, e.getNetSession = r;
    const t = Ge();
    e.NET_SESSION_NAME = "electron-updater";
    function r() {
      return Ht.session.fromPartition(e.NET_SESSION_NAME, {
        cache: !1
      });
    }
    class n extends t.HttpExecutor {
      constructor(s) {
        super(), this.proxyLoginCallback = s, this.cachedSession = null;
      }
      async download(s, i, d) {
        return await d.cancellationToken.createPromise((a, h, c) => {
          const l = {
            headers: d.headers || void 0,
            redirect: "manual"
          };
          (0, t.configureRequestUrl)(s, l), (0, t.configureRequestOptions)(l), this.doDownload(l, {
            destination: i,
            options: d,
            onCancel: c,
            callback: (f) => {
              f == null ? a(i) : h(f);
            },
            responseHandler: null
          }, 0);
        });
      }
      createRequest(s, i) {
        s.headers && s.headers.Host && (s.host = s.headers.Host, delete s.headers.Host), this.cachedSession == null && (this.cachedSession = r());
        const d = Ht.net.request({
          ...s,
          session: this.cachedSession
        });
        return d.on("response", i), this.proxyLoginCallback != null && d.on("login", this.proxyLoginCallback), d;
      }
      addRedirectHandlers(s, i, d, a, h) {
        s.on("redirect", (c, l, f) => {
          s.abort(), a > this.maxRedirects ? d(this.createMaxRedirectError()) : h(t.HttpExecutor.prepareRedirectUrlOptions(f, i));
        });
      }
    }
    e.ElectronHttpExecutor = n;
  })(So)), So;
}
var hr = {}, Qt = {}, jl;
function Gt() {
  if (jl) return Qt;
  jl = 1, Object.defineProperty(Qt, "__esModule", { value: !0 }), Qt.newBaseUrl = t, Qt.newUrlFromBase = r, Qt.getChannelFilename = n;
  const e = Ot;
  function t(o) {
    const s = new e.URL(o);
    return s.pathname.endsWith("/") || (s.pathname += "/"), s;
  }
  function r(o, s, i = !1) {
    const d = new e.URL(o, s), a = s.search;
    return a != null && a.length !== 0 ? d.search = a : i && (d.search = `noCache=${Date.now().toString(32)}`), d;
  }
  function n(o) {
    return `${o}.yml`;
  }
  return Qt;
}
var _t = {}, Ao, Gl;
function ou() {
  if (Gl) return Ao;
  Gl = 1;
  var e = "[object Symbol]", t = /[\\^$.*+?()[\]{}|]/g, r = RegExp(t.source), n = typeof dt == "object" && dt && dt.Object === Object && dt, o = typeof self == "object" && self && self.Object === Object && self, s = n || o || Function("return this")(), i = Object.prototype, d = i.toString, a = s.Symbol, h = a ? a.prototype : void 0, c = h ? h.toString : void 0;
  function l(m) {
    if (typeof m == "string")
      return m;
    if (p(m))
      return c ? c.call(m) : "";
    var _ = m + "";
    return _ == "0" && 1 / m == -1 / 0 ? "-0" : _;
  }
  function f(m) {
    return !!m && typeof m == "object";
  }
  function p(m) {
    return typeof m == "symbol" || f(m) && d.call(m) == e;
  }
  function g(m) {
    return m == null ? "" : l(m);
  }
  function y(m) {
    return m = g(m), m && r.test(m) ? m.replace(t, "\\$&") : m;
  }
  return Ao = y, Ao;
}
var Wl;
function ot() {
  if (Wl) return _t;
  Wl = 1, Object.defineProperty(_t, "__esModule", { value: !0 }), _t.Provider = void 0, _t.findFile = i, _t.parseUpdateInfo = d, _t.getFileList = a, _t.resolveFiles = h;
  const e = Ge(), t = Wo(), r = Ot, n = Gt(), o = ou();
  let s = class {
    constructor(l) {
      this.runtimeOptions = l, this.requestHeaders = null, this.executor = l.executor;
    }
    // By default, the blockmap file is in the same directory as the main file
    // But some providers may have a different blockmap file, so we need to override this method
    getBlockMapFiles(l, f, p, g = null) {
      const y = (0, n.newUrlFromBase)(`${l.pathname}.blockmap`, l);
      return [(0, n.newUrlFromBase)(`${l.pathname.replace(new RegExp(o(p), "g"), f)}.blockmap`, g ? new r.URL(g) : l), y];
    }
    get isUseMultipleRangeRequest() {
      return this.runtimeOptions.isUseMultipleRangeRequest !== !1;
    }
    getChannelFilePrefix() {
      if (this.runtimeOptions.platform === "linux") {
        const l = process.env.TEST_UPDATER_ARCH || process.arch;
        return "-linux" + (l === "x64" ? "" : `-${l}`);
      } else
        return this.runtimeOptions.platform === "darwin" ? "-mac" : "";
    }
    // due to historical reasons for windows we use channel name without platform specifier
    getDefaultChannelName() {
      return this.getCustomChannelName("latest");
    }
    getCustomChannelName(l) {
      return `${l}${this.getChannelFilePrefix()}`;
    }
    get fileExtraDownloadHeaders() {
      return null;
    }
    setRequestHeaders(l) {
      this.requestHeaders = l;
    }
    /**
     * Method to perform API request only to resolve update info, but not to download update.
     */
    httpRequest(l, f, p) {
      return this.executor.request(this.createRequestOptions(l, f), p);
    }
    createRequestOptions(l, f) {
      const p = {};
      return this.requestHeaders == null ? f != null && (p.headers = f) : p.headers = f == null ? this.requestHeaders : { ...this.requestHeaders, ...f }, (0, e.configureRequestUrl)(l, p), p;
    }
  };
  _t.Provider = s;
  function i(c, l, f) {
    var p;
    if (c.length === 0)
      throw (0, e.newError)("No files provided", "ERR_UPDATER_NO_FILES_PROVIDED");
    const g = c.filter((m) => m.url.pathname.toLowerCase().endsWith(`.${l.toLowerCase()}`)), y = (p = g.find((m) => [m.url.pathname, m.info.url].some((_) => _.includes(process.arch)))) !== null && p !== void 0 ? p : g.shift();
    return y || (f == null ? c[0] : c.find((m) => !f.some((_) => m.url.pathname.toLowerCase().endsWith(`.${_.toLowerCase()}`))));
  }
  function d(c, l, f) {
    if (c == null)
      throw (0, e.newError)(`Cannot parse update info from ${l} in the latest release artifacts (${f}): rawData: null`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    let p;
    try {
      p = (0, t.load)(c);
    } catch (g) {
      throw (0, e.newError)(`Cannot parse update info from ${l} in the latest release artifacts (${f}): ${g.stack || g.message}, rawData: ${c}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    }
    return p;
  }
  function a(c) {
    const l = c.files;
    if (l != null && l.length > 0)
      return l;
    if (c.path != null)
      return [
        {
          url: c.path,
          sha2: c.sha2,
          sha512: c.sha512
        }
      ];
    throw (0, e.newError)(`No files provided: ${(0, e.safeStringifyJson)(c)}`, "ERR_UPDATER_NO_FILES_PROVIDED");
  }
  function h(c, l, f = (p) => p) {
    const g = a(c).map((_) => {
      if (_.sha2 == null && _.sha512 == null)
        throw (0, e.newError)(`Update info doesn't contain nor sha256 neither sha512 checksum: ${(0, e.safeStringifyJson)(_)}`, "ERR_UPDATER_NO_CHECKSUM");
      return {
        url: (0, n.newUrlFromBase)(f(_.url), l),
        info: _
      };
    }), y = c.packages, m = y == null ? null : y[process.arch] || y.ia32;
    return m != null && (g[0].packageInfo = {
      ...m,
      path: (0, n.newUrlFromBase)(f(m.path), l).href
    }), g;
  }
  return _t;
}
var Vl;
function au() {
  if (Vl) return hr;
  Vl = 1, Object.defineProperty(hr, "__esModule", { value: !0 }), hr.GenericProvider = void 0;
  const e = Ge(), t = Gt(), r = ot();
  let n = class extends r.Provider {
    constructor(s, i, d) {
      super(d), this.configuration = s, this.updater = i, this.baseUrl = (0, t.newBaseUrl)(this.configuration.url);
    }
    get channel() {
      const s = this.updater.channel || this.configuration.channel;
      return s == null ? this.getDefaultChannelName() : this.getCustomChannelName(s);
    }
    async getLatestVersion() {
      const s = (0, t.getChannelFilename)(this.channel), i = (0, t.newUrlFromBase)(s, this.baseUrl, this.updater.isAddNoCacheQuery);
      for (let d = 0; ; d++)
        try {
          return (0, r.parseUpdateInfo)(await this.httpRequest(i), s, i);
        } catch (a) {
          if (a instanceof e.HttpError && a.statusCode === 404)
            throw (0, e.newError)(`Cannot find channel "${s}" update info: ${a.stack || a.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
          if (a.code === "ECONNREFUSED" && d < 3) {
            await new Promise((h, c) => {
              try {
                setTimeout(h, 1e3 * d);
              } catch (l) {
                c(l);
              }
            });
            continue;
          }
          throw a;
        }
    }
    resolveFiles(s) {
      return (0, r.resolveFiles)(s, this.baseUrl);
    }
  };
  return hr.GenericProvider = n, hr;
}
var pr = {}, mr = {}, zl;
function nh() {
  if (zl) return mr;
  zl = 1, Object.defineProperty(mr, "__esModule", { value: !0 }), mr.BitbucketProvider = void 0;
  const e = Ge(), t = Gt(), r = ot();
  let n = class extends r.Provider {
    constructor(s, i, d) {
      super({
        ...d,
        isUseMultipleRangeRequest: !1
      }), this.configuration = s, this.updater = i;
      const { owner: a, slug: h } = s;
      this.baseUrl = (0, t.newBaseUrl)(`https://api.bitbucket.org/2.0/repositories/${a}/${h}/downloads`);
    }
    get channel() {
      return this.updater.channel || this.configuration.channel || "latest";
    }
    async getLatestVersion() {
      const s = new e.CancellationToken(), i = (0, t.getChannelFilename)(this.getCustomChannelName(this.channel)), d = (0, t.newUrlFromBase)(i, this.baseUrl, this.updater.isAddNoCacheQuery);
      try {
        const a = await this.httpRequest(d, void 0, s);
        return (0, r.parseUpdateInfo)(a, i, d);
      } catch (a) {
        throw (0, e.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${a.stack || a.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    resolveFiles(s) {
      return (0, r.resolveFiles)(s, this.baseUrl);
    }
    toString() {
      const { owner: s, slug: i } = this.configuration;
      return `Bitbucket (owner: ${s}, slug: ${i}, channel: ${this.channel})`;
    }
  };
  return mr.BitbucketProvider = n, mr;
}
var Nt = {}, Yl;
function su() {
  if (Yl) return Nt;
  Yl = 1, Object.defineProperty(Nt, "__esModule", { value: !0 }), Nt.GitHubProvider = Nt.BaseGitHubProvider = void 0, Nt.computeReleaseNotes = h;
  const e = Ge(), t = iu(), r = Ot, n = Gt(), o = ot(), s = /\/tag\/([^/]+)$/;
  class i extends o.Provider {
    constructor(l, f, p) {
      super({
        ...p,
        /* because GitHib uses S3 */
        isUseMultipleRangeRequest: !1
      }), this.options = l, this.baseUrl = (0, n.newBaseUrl)((0, e.githubUrl)(l, f));
      const g = f === "github.com" ? "api.github.com" : f;
      this.baseApiUrl = (0, n.newBaseUrl)((0, e.githubUrl)(l, g));
    }
    computeGithubBasePath(l) {
      const f = this.options.host;
      return f && !["github.com", "api.github.com"].includes(f) ? `/api/v3${l}` : l;
    }
  }
  Nt.BaseGitHubProvider = i;
  let d = class extends i {
    constructor(l, f, p) {
      super(l, "github.com", p), this.options = l, this.updater = f;
    }
    get channel() {
      const l = this.updater.channel || this.options.channel;
      return l == null ? this.getDefaultChannelName() : this.getCustomChannelName(l);
    }
    async getLatestVersion() {
      var l, f, p, g, y;
      const m = new e.CancellationToken(), _ = await this.httpRequest((0, n.newUrlFromBase)(`${this.basePath}.atom`, this.baseUrl), {
        accept: "application/xml, application/atom+xml, text/xml, */*"
      }, m), I = (0, e.parseXml)(_);
      let N = I.element("entry", !1, "No published versions on GitHub"), O = null;
      try {
        if (this.updater.allowPrerelease) {
          const T = ((l = this.updater) === null || l === void 0 ? void 0 : l.channel) || ((f = t.prerelease(this.updater.currentVersion)) === null || f === void 0 ? void 0 : f[0]) || null;
          if (T === null)
            O = s.exec(N.element("link").attribute("href"))[1];
          else
            for (const U of I.getElements("entry")) {
              const L = s.exec(U.element("link").attribute("href"));
              if (L === null)
                continue;
              const $ = L[1], F = ((p = t.prerelease($)) === null || p === void 0 ? void 0 : p[0]) || null, x = !T || ["alpha", "beta"].includes(T), j = F !== null && !["alpha", "beta"].includes(String(F));
              if (x && !j && !(T === "beta" && F === "alpha")) {
                O = $;
                break;
              }
              if (F && F === T) {
                O = $;
                break;
              }
            }
        } else {
          O = await this.getLatestTagName(m);
          for (const T of I.getElements("entry"))
            if (s.exec(T.element("link").attribute("href"))[1] === O) {
              N = T;
              break;
            }
        }
      } catch (T) {
        throw (0, e.newError)(`Cannot parse releases feed: ${T.stack || T.message},
XML:
${_}`, "ERR_UPDATER_INVALID_RELEASE_FEED");
      }
      if (O == null)
        throw (0, e.newError)("No published versions on GitHub", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
      let R, b = "", A = "";
      const w = async (T) => {
        b = (0, n.getChannelFilename)(T), A = (0, n.newUrlFromBase)(this.getBaseDownloadPath(String(O), b), this.baseUrl);
        const U = this.createRequestOptions(A);
        try {
          return await this.executor.request(U, m);
        } catch (L) {
          throw L instanceof e.HttpError && L.statusCode === 404 ? (0, e.newError)(`Cannot find ${b} in the latest release artifacts (${A}): ${L.stack || L.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : L;
        }
      };
      try {
        let T = this.channel;
        this.updater.allowPrerelease && (!((g = t.prerelease(O)) === null || g === void 0) && g[0]) && (T = this.getCustomChannelName(String((y = t.prerelease(O)) === null || y === void 0 ? void 0 : y[0]))), R = await w(T);
      } catch (T) {
        if (this.updater.allowPrerelease)
          R = await w(this.getDefaultChannelName());
        else
          throw T;
      }
      const C = (0, o.parseUpdateInfo)(R, b, A);
      return C.releaseName == null && (C.releaseName = N.elementValueOrEmpty("title")), C.releaseNotes == null && (C.releaseNotes = h(this.updater.currentVersion, this.updater.fullChangelog, I, N)), {
        tag: O,
        ...C
      };
    }
    async getLatestTagName(l) {
      const f = this.options, p = f.host == null || f.host === "github.com" ? (0, n.newUrlFromBase)(`${this.basePath}/latest`, this.baseUrl) : new r.URL(`${this.computeGithubBasePath(`/repos/${f.owner}/${f.repo}/releases`)}/latest`, this.baseApiUrl);
      try {
        const g = await this.httpRequest(p, { Accept: "application/json" }, l);
        return g == null ? null : JSON.parse(g).tag_name;
      } catch (g) {
        throw (0, e.newError)(`Unable to find latest version on GitHub (${p}), please ensure a production release exists: ${g.stack || g.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    get basePath() {
      return `/${this.options.owner}/${this.options.repo}/releases`;
    }
    resolveFiles(l) {
      return (0, o.resolveFiles)(l, this.baseUrl, (f) => this.getBaseDownloadPath(l.tag, f.replace(/ /g, "-")));
    }
    getBaseDownloadPath(l, f) {
      return `${this.basePath}/download/${l}/${f}`;
    }
  };
  Nt.GitHubProvider = d;
  function a(c) {
    const l = c.elementValueOrEmpty("content");
    return l === "No content." ? "" : l;
  }
  function h(c, l, f, p) {
    if (!l)
      return a(p);
    const g = [];
    for (const y of f.getElements("entry")) {
      const m = /\/tag\/v?([^/]+)$/.exec(y.element("link").attribute("href"))[1];
      t.valid(m) && t.lt(c, m) && g.push({
        version: m,
        note: a(y)
      });
    }
    return g.sort((y, m) => t.rcompare(y.version, m.version));
  }
  return Nt;
}
var gr = {}, Xl;
function ih() {
  if (Xl) return gr;
  Xl = 1, Object.defineProperty(gr, "__esModule", { value: !0 }), gr.GitLabProvider = void 0;
  const e = Ge(), t = Ot, r = ou(), n = Gt(), o = ot();
  let s = class extends o.Provider {
    /**
     * Normalizes filenames by replacing spaces and underscores with dashes.
     *
     * This is a workaround to handle filename formatting differences between tools:
     * - electron-builder formats filenames like "test file.txt" as "test-file.txt"
     * - GitLab may provide asset URLs using underscores, such as "test_file.txt"
     *
     * Because of this mismatch, we can't reliably extract the correct filename from
     * the asset path without normalization. This function ensures consistent matching
     * across different filename formats by converting all spaces and underscores to dashes.
     *
     * @param filename The filename to normalize
     * @returns The normalized filename with spaces and underscores replaced by dashes
     */
    normalizeFilename(d) {
      return d.replace(/ |_/g, "-");
    }
    constructor(d, a, h) {
      super({
        ...h,
        // GitLab might not support multiple range requests efficiently
        isUseMultipleRangeRequest: !1
      }), this.options = d, this.updater = a, this.cachedLatestVersion = null;
      const l = d.host || "gitlab.com";
      this.baseApiUrl = (0, n.newBaseUrl)(`https://${l}/api/v4`);
    }
    get channel() {
      const d = this.updater.channel || this.options.channel;
      return d == null ? this.getDefaultChannelName() : this.getCustomChannelName(d);
    }
    async getLatestVersion() {
      const d = new e.CancellationToken(), a = (0, n.newUrlFromBase)(`projects/${this.options.projectId}/releases/permalink/latest`, this.baseApiUrl);
      let h;
      try {
        const I = { "Content-Type": "application/json", ...this.setAuthHeaderForToken(this.options.token || null) }, N = await this.httpRequest(a, I, d);
        if (!N)
          throw (0, e.newError)("No latest release found", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
        h = JSON.parse(N);
      } catch (I) {
        throw (0, e.newError)(`Unable to find latest release on GitLab (${a}): ${I.stack || I.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
      const c = h.tag_name;
      let l = null, f = "", p = null;
      const g = async (I) => {
        f = (0, n.getChannelFilename)(I);
        const N = h.assets.links.find((R) => R.name === f);
        if (!N)
          throw (0, e.newError)(`Cannot find ${f} in the latest release assets`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
        p = new t.URL(N.direct_asset_url);
        const O = this.options.token ? { "PRIVATE-TOKEN": this.options.token } : void 0;
        try {
          const R = await this.httpRequest(p, O, d);
          if (!R)
            throw (0, e.newError)(`Empty response from ${p}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
          return R;
        } catch (R) {
          throw R instanceof e.HttpError && R.statusCode === 404 ? (0, e.newError)(`Cannot find ${f} in the latest release artifacts (${p}): ${R.stack || R.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : R;
        }
      };
      try {
        l = await g(this.channel);
      } catch (I) {
        if (this.channel !== this.getDefaultChannelName())
          l = await g(this.getDefaultChannelName());
        else
          throw I;
      }
      if (!l)
        throw (0, e.newError)(`Unable to parse channel data from ${f}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
      const y = (0, o.parseUpdateInfo)(l, f, p);
      y.releaseName == null && (y.releaseName = h.name), y.releaseNotes == null && (y.releaseNotes = h.description || null);
      const m = /* @__PURE__ */ new Map();
      for (const I of h.assets.links)
        m.set(this.normalizeFilename(I.name), I.direct_asset_url);
      const _ = {
        tag: c,
        assets: m,
        ...y
      };
      return this.cachedLatestVersion = _, _;
    }
    /**
     * Utility function to convert GitlabReleaseAsset to Map<string, string>
     * Maps asset names to their download URLs
     */
    convertAssetsToMap(d) {
      const a = /* @__PURE__ */ new Map();
      for (const h of d.links)
        a.set(this.normalizeFilename(h.name), h.direct_asset_url);
      return a;
    }
    /**
     * Find blockmap file URL in assets map for a specific filename
     */
    findBlockMapInAssets(d, a) {
      const h = [`${a}.blockmap`, `${this.normalizeFilename(a)}.blockmap`];
      for (const c of h) {
        const l = d.get(c);
        if (l)
          return new t.URL(l);
      }
      return null;
    }
    async fetchReleaseInfoByVersion(d) {
      const a = new e.CancellationToken(), h = [`v${d}`, d];
      for (const c of h) {
        const l = (0, n.newUrlFromBase)(`projects/${this.options.projectId}/releases/${encodeURIComponent(c)}`, this.baseApiUrl);
        try {
          const f = { "Content-Type": "application/json", ...this.setAuthHeaderForToken(this.options.token || null) }, p = await this.httpRequest(l, f, a);
          if (p)
            return JSON.parse(p);
        } catch (f) {
          if (f instanceof e.HttpError && f.statusCode === 404)
            continue;
          throw (0, e.newError)(`Unable to find release ${c} on GitLab (${l}): ${f.stack || f.message}`, "ERR_UPDATER_RELEASE_NOT_FOUND");
        }
      }
      throw (0, e.newError)(`Unable to find release with version ${d} (tried: ${h.join(", ")}) on GitLab`, "ERR_UPDATER_RELEASE_NOT_FOUND");
    }
    setAuthHeaderForToken(d) {
      const a = {};
      return d != null && (d.startsWith("Bearer") ? a.authorization = d : a["PRIVATE-TOKEN"] = d), a;
    }
    /**
     * Get version info for blockmap files, using cache when possible
     */
    async getVersionInfoForBlockMap(d) {
      if (this.cachedLatestVersion && this.cachedLatestVersion.version === d)
        return this.cachedLatestVersion.assets;
      const a = await this.fetchReleaseInfoByVersion(d);
      return a && a.assets ? this.convertAssetsToMap(a.assets) : null;
    }
    /**
     * Find blockmap URLs from version assets
     */
    async findBlockMapUrlsFromAssets(d, a, h) {
      let c = null, l = null;
      const f = await this.getVersionInfoForBlockMap(a);
      f && (c = this.findBlockMapInAssets(f, h));
      const p = await this.getVersionInfoForBlockMap(d);
      if (p) {
        const g = h.replace(new RegExp(r(a), "g"), d);
        l = this.findBlockMapInAssets(p, g);
      }
      return [l, c];
    }
    async getBlockMapFiles(d, a, h, c = null) {
      if (this.options.uploadTarget === "project_upload") {
        const l = d.pathname.split("/").pop() || "", [f, p] = await this.findBlockMapUrlsFromAssets(a, h, l);
        if (!p)
          throw (0, e.newError)(`Cannot find blockmap file for ${h} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
        if (!f)
          throw (0, e.newError)(`Cannot find blockmap file for ${a} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
        return [f, p];
      } else
        return super.getBlockMapFiles(d, a, h, c);
    }
    resolveFiles(d) {
      return (0, o.getFileList)(d).map((a) => {
        const c = [
          a.url,
          // Original filename
          this.normalizeFilename(a.url)
          // Normalized filename (spaces/underscores → dashes)
        ].find((f) => d.assets.has(f)), l = c ? d.assets.get(c) : void 0;
        if (!l)
          throw (0, e.newError)(`Cannot find asset "${a.url}" in GitLab release assets. Available assets: ${Array.from(d.assets.keys()).join(", ")}`, "ERR_UPDATER_ASSET_NOT_FOUND");
        return {
          url: new t.URL(l),
          info: a
        };
      });
    }
    toString() {
      return `GitLab (projectId: ${this.options.projectId}, channel: ${this.channel})`;
    }
  };
  return gr.GitLabProvider = s, gr;
}
var Er = {}, Kl;
function oh() {
  if (Kl) return Er;
  Kl = 1, Object.defineProperty(Er, "__esModule", { value: !0 }), Er.KeygenProvider = void 0;
  const e = Ge(), t = Gt(), r = ot();
  let n = class extends r.Provider {
    constructor(s, i, d) {
      super({
        ...d,
        isUseMultipleRangeRequest: !1
      }), this.configuration = s, this.updater = i, this.defaultHostname = "api.keygen.sh";
      const a = this.configuration.host || this.defaultHostname;
      this.baseUrl = (0, t.newBaseUrl)(`https://${a}/v1/accounts/${this.configuration.account}/artifacts?product=${this.configuration.product}`);
    }
    get channel() {
      return this.updater.channel || this.configuration.channel || "stable";
    }
    async getLatestVersion() {
      const s = new e.CancellationToken(), i = (0, t.getChannelFilename)(this.getCustomChannelName(this.channel)), d = (0, t.newUrlFromBase)(i, this.baseUrl, this.updater.isAddNoCacheQuery);
      try {
        const a = await this.httpRequest(d, {
          Accept: "application/vnd.api+json",
          "Keygen-Version": "1.1"
        }, s);
        return (0, r.parseUpdateInfo)(a, i, d);
      } catch (a) {
        throw (0, e.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${a.stack || a.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    resolveFiles(s) {
      return (0, r.resolveFiles)(s, this.baseUrl);
    }
    toString() {
      const { account: s, product: i, platform: d } = this.configuration;
      return `Keygen (account: ${s}, product: ${i}, platform: ${d}, channel: ${this.channel})`;
    }
  };
  return Er.KeygenProvider = n, Er;
}
var yr = {}, Jl;
function ah() {
  if (Jl) return yr;
  Jl = 1, Object.defineProperty(yr, "__esModule", { value: !0 }), yr.PrivateGitHubProvider = void 0;
  const e = Ge(), t = Wo(), r = Le, n = Ot, o = Gt(), s = su(), i = ot();
  let d = class extends s.BaseGitHubProvider {
    constructor(h, c, l, f) {
      super(h, "api.github.com", f), this.updater = c, this.token = l;
    }
    createRequestOptions(h, c) {
      const l = super.createRequestOptions(h, c);
      return l.redirect = "manual", l;
    }
    async getLatestVersion() {
      const h = new e.CancellationToken(), c = (0, o.getChannelFilename)(this.getDefaultChannelName()), l = await this.getLatestVersionInfo(h), f = l.assets.find((y) => y.name === c);
      if (f == null)
        throw (0, e.newError)(`Cannot find ${c} in the release ${l.html_url || l.name}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
      const p = new n.URL(f.url);
      let g;
      try {
        g = (0, t.load)(await this.httpRequest(p, this.configureHeaders("application/octet-stream"), h));
      } catch (y) {
        throw y instanceof e.HttpError && y.statusCode === 404 ? (0, e.newError)(`Cannot find ${c} in the latest release artifacts (${p}): ${y.stack || y.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : y;
      }
      return g.assets = l.assets, g;
    }
    get fileExtraDownloadHeaders() {
      return this.configureHeaders("application/octet-stream");
    }
    configureHeaders(h) {
      return {
        accept: h,
        authorization: `token ${this.token}`
      };
    }
    async getLatestVersionInfo(h) {
      const c = this.updater.allowPrerelease;
      let l = this.basePath;
      c || (l = `${l}/latest`);
      const f = (0, o.newUrlFromBase)(l, this.baseUrl);
      try {
        const p = JSON.parse(await this.httpRequest(f, this.configureHeaders("application/vnd.github.v3+json"), h));
        return c ? p.find((g) => g.prerelease) || p[0] : p;
      } catch (p) {
        throw (0, e.newError)(`Unable to find latest version on GitHub (${f}), please ensure a production release exists: ${p.stack || p.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    get basePath() {
      return this.computeGithubBasePath(`/repos/${this.options.owner}/${this.options.repo}/releases`);
    }
    resolveFiles(h) {
      return (0, i.getFileList)(h).map((c) => {
        const l = r.posix.basename(c.url).replace(/ /g, "-"), f = h.assets.find((p) => p != null && p.name === l);
        if (f == null)
          throw (0, e.newError)(`Cannot find asset "${l}" in: ${JSON.stringify(h.assets, null, 2)}`, "ERR_UPDATER_ASSET_NOT_FOUND");
        return {
          url: new n.URL(f.url),
          info: c
        };
      });
    }
  };
  return yr.PrivateGitHubProvider = d, yr;
}
var Ql;
function sh() {
  if (Ql) return pr;
  Ql = 1, Object.defineProperty(pr, "__esModule", { value: !0 }), pr.isUrlProbablySupportMultiRangeRequests = d, pr.createClient = a;
  const e = Ge(), t = nh(), r = au(), n = su(), o = ih(), s = oh(), i = ah();
  function d(h) {
    return !h.includes("s3.amazonaws.com");
  }
  function a(h, c, l) {
    if (typeof h == "string")
      throw (0, e.newError)("Please pass PublishConfiguration object", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
    const f = h.provider;
    switch (f) {
      case "github": {
        const p = h, g = (p.private ? process.env.GH_TOKEN || process.env.GITHUB_TOKEN : null) || p.token;
        return g == null ? new n.GitHubProvider(p, c, l) : new i.PrivateGitHubProvider(p, c, g, l);
      }
      case "bitbucket":
        return new t.BitbucketProvider(h, c, l);
      case "gitlab":
        return new o.GitLabProvider(h, c, l);
      case "keygen":
        return new s.KeygenProvider(h, c, l);
      case "s3":
      case "spaces":
        return new r.GenericProvider({
          provider: "generic",
          url: (0, e.getS3LikeProviderBaseUrl)(h),
          channel: h.channel || null
        }, c, {
          ...l,
          // https://github.com/minio/minio/issues/5285#issuecomment-350428955
          isUseMultipleRangeRequest: !1
        });
      case "generic": {
        const p = h;
        return new r.GenericProvider(p, c, {
          ...l,
          isUseMultipleRangeRequest: p.useMultipleRangeRequest !== !1 && d(p.url)
        });
      }
      case "custom": {
        const p = h, g = p.updateProvider;
        if (!g)
          throw (0, e.newError)("Custom provider not specified", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
        return new g(p, c, l);
      }
      default:
        throw (0, e.newError)(`Unsupported provider: ${f}`, "ERR_UPDATER_UNSUPPORTED_PROVIDER");
    }
  }
  return pr;
}
var wr = {}, vr = {}, Zt = {}, er = {}, Zl;
function Qo() {
  if (Zl) return er;
  Zl = 1, Object.defineProperty(er, "__esModule", { value: !0 }), er.OperationKind = void 0, er.computeOperations = t;
  var e;
  (function(i) {
    i[i.COPY = 0] = "COPY", i[i.DOWNLOAD = 1] = "DOWNLOAD";
  })(e || (er.OperationKind = e = {}));
  function t(i, d, a) {
    const h = s(i.files), c = s(d.files);
    let l = null;
    const f = d.files[0], p = [], g = f.name, y = h.get(g);
    if (y == null)
      throw new Error(`no file ${g} in old blockmap`);
    const m = c.get(g);
    let _ = 0;
    const { checksumToOffset: I, checksumToOldSize: N } = o(h.get(g), y.offset, a);
    let O = f.offset;
    for (let R = 0; R < m.checksums.length; O += m.sizes[R], R++) {
      const b = m.sizes[R], A = m.checksums[R];
      let w = I.get(A);
      w != null && N.get(A) !== b && (a.warn(`Checksum ("${A}") matches, but size differs (old: ${N.get(A)}, new: ${b})`), w = void 0), w === void 0 ? (_++, l != null && l.kind === e.DOWNLOAD && l.end === O ? l.end += b : (l = {
        kind: e.DOWNLOAD,
        start: O,
        end: O + b
        // oldBlocks: null,
      }, n(l, p, A, R))) : l != null && l.kind === e.COPY && l.end === w ? l.end += b : (l = {
        kind: e.COPY,
        start: w,
        end: w + b
        // oldBlocks: [checksum]
      }, n(l, p, A, R));
    }
    return _ > 0 && a.info(`File${f.name === "file" ? "" : " " + f.name} has ${_} changed blocks`), p;
  }
  const r = process.env.DIFFERENTIAL_DOWNLOAD_PLAN_BUILDER_VALIDATE_RANGES === "true";
  function n(i, d, a, h) {
    if (r && d.length !== 0) {
      const c = d[d.length - 1];
      if (c.kind === i.kind && i.start < c.end && i.start > c.start) {
        const l = [c.start, c.end, i.start, i.end].reduce((f, p) => f < p ? f : p);
        throw new Error(`operation (block index: ${h}, checksum: ${a}, kind: ${e[i.kind]}) overlaps previous operation (checksum: ${a}):
abs: ${c.start} until ${c.end} and ${i.start} until ${i.end}
rel: ${c.start - l} until ${c.end - l} and ${i.start - l} until ${i.end - l}`);
      }
    }
    d.push(i);
  }
  function o(i, d, a) {
    const h = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map();
    let l = d;
    for (let f = 0; f < i.checksums.length; f++) {
      const p = i.checksums[f], g = i.sizes[f], y = c.get(p);
      if (y === void 0)
        h.set(p, l), c.set(p, g);
      else if (a.debug != null) {
        const m = y === g ? "(same size)" : `(size: ${y}, this size: ${g})`;
        a.debug(`${p} duplicated in blockmap ${m}, it doesn't lead to broken differential downloader, just corresponding block will be skipped)`);
      }
      l += g;
    }
    return { checksumToOffset: h, checksumToOldSize: c };
  }
  function s(i) {
    const d = /* @__PURE__ */ new Map();
    for (const a of i)
      d.set(a.name, a);
    return d;
  }
  return er;
}
var ec;
function lu() {
  if (ec) return Zt;
  ec = 1, Object.defineProperty(Zt, "__esModule", { value: !0 }), Zt.DataSplitter = void 0, Zt.copyData = i;
  const e = Ge(), t = St, r = Ur, n = Qo(), o = Buffer.from(`\r
\r
`);
  var s;
  (function(a) {
    a[a.INIT = 0] = "INIT", a[a.HEADER = 1] = "HEADER", a[a.BODY = 2] = "BODY";
  })(s || (s = {}));
  function i(a, h, c, l, f) {
    const p = (0, t.createReadStream)("", {
      fd: c,
      autoClose: !1,
      start: a.start,
      // end is inclusive
      end: a.end - 1
    });
    p.on("error", l), p.once("end", f), p.pipe(h, {
      end: !1
    });
  }
  let d = class extends r.Writable {
    constructor(h, c, l, f, p, g, y, m) {
      super(), this.out = h, this.options = c, this.partIndexToTaskIndex = l, this.partIndexToLength = p, this.finishHandler = g, this.grandTotalBytes = y, this.onProgress = m, this.start = Date.now(), this.nextUpdate = this.start + 1e3, this.transferred = 0, this.delta = 0, this.partIndex = -1, this.headerListBuffer = null, this.readState = s.INIT, this.ignoreByteCount = 0, this.remainingPartDataCount = 0, this.actualPartLength = 0, this.boundaryLength = f.length + 4, this.ignoreByteCount = this.boundaryLength - 2;
    }
    get isFinished() {
      return this.partIndex === this.partIndexToLength.length;
    }
    // noinspection JSUnusedGlobalSymbols
    _write(h, c, l) {
      if (this.isFinished) {
        console.error(`Trailing ignored data: ${h.length} bytes`);
        return;
      }
      this.handleData(h).then(() => {
        if (this.onProgress) {
          const f = Date.now();
          (f >= this.nextUpdate || this.transferred === this.grandTotalBytes) && this.grandTotalBytes && (f - this.start) / 1e3 && (this.nextUpdate = f + 1e3, this.onProgress({
            total: this.grandTotalBytes,
            delta: this.delta,
            transferred: this.transferred,
            percent: this.transferred / this.grandTotalBytes * 100,
            bytesPerSecond: Math.round(this.transferred / ((f - this.start) / 1e3))
          }), this.delta = 0);
        }
        l();
      }).catch(l);
    }
    async handleData(h) {
      let c = 0;
      if (this.ignoreByteCount !== 0 && this.remainingPartDataCount !== 0)
        throw (0, e.newError)("Internal error", "ERR_DATA_SPLITTER_BYTE_COUNT_MISMATCH");
      if (this.ignoreByteCount > 0) {
        const l = Math.min(this.ignoreByteCount, h.length);
        this.ignoreByteCount -= l, c = l;
      } else if (this.remainingPartDataCount > 0) {
        const l = Math.min(this.remainingPartDataCount, h.length);
        this.remainingPartDataCount -= l, await this.processPartData(h, 0, l), c = l;
      }
      if (c !== h.length) {
        if (this.readState === s.HEADER) {
          const l = this.searchHeaderListEnd(h, c);
          if (l === -1)
            return;
          c = l, this.readState = s.BODY, this.headerListBuffer = null;
        }
        for (; ; ) {
          if (this.readState === s.BODY)
            this.readState = s.INIT;
          else {
            this.partIndex++;
            let g = this.partIndexToTaskIndex.get(this.partIndex);
            if (g == null)
              if (this.isFinished)
                g = this.options.end;
              else
                throw (0, e.newError)("taskIndex is null", "ERR_DATA_SPLITTER_TASK_INDEX_IS_NULL");
            const y = this.partIndex === 0 ? this.options.start : this.partIndexToTaskIndex.get(this.partIndex - 1) + 1;
            if (y < g)
              await this.copyExistingData(y, g);
            else if (y > g)
              throw (0, e.newError)("prevTaskIndex must be < taskIndex", "ERR_DATA_SPLITTER_TASK_INDEX_ASSERT_FAILED");
            if (this.isFinished) {
              this.onPartEnd(), this.finishHandler();
              return;
            }
            if (c = this.searchHeaderListEnd(h, c), c === -1) {
              this.readState = s.HEADER;
              return;
            }
          }
          const l = this.partIndexToLength[this.partIndex], f = c + l, p = Math.min(f, h.length);
          if (await this.processPartStarted(h, c, p), this.remainingPartDataCount = l - (p - c), this.remainingPartDataCount > 0)
            return;
          if (c = f + this.boundaryLength, c >= h.length) {
            this.ignoreByteCount = this.boundaryLength - (h.length - f);
            return;
          }
        }
      }
    }
    copyExistingData(h, c) {
      return new Promise((l, f) => {
        const p = () => {
          if (h === c) {
            l();
            return;
          }
          const g = this.options.tasks[h];
          if (g.kind !== n.OperationKind.COPY) {
            f(new Error("Task kind must be COPY"));
            return;
          }
          i(g, this.out, this.options.oldFileFd, f, () => {
            h++, p();
          });
        };
        p();
      });
    }
    searchHeaderListEnd(h, c) {
      const l = h.indexOf(o, c);
      if (l !== -1)
        return l + o.length;
      const f = c === 0 ? h : h.slice(c);
      return this.headerListBuffer == null ? this.headerListBuffer = f : this.headerListBuffer = Buffer.concat([this.headerListBuffer, f]), -1;
    }
    onPartEnd() {
      const h = this.partIndexToLength[this.partIndex - 1];
      if (this.actualPartLength !== h)
        throw (0, e.newError)(`Expected length: ${h} differs from actual: ${this.actualPartLength}`, "ERR_DATA_SPLITTER_LENGTH_MISMATCH");
      this.actualPartLength = 0;
    }
    processPartStarted(h, c, l) {
      return this.partIndex !== 0 && this.onPartEnd(), this.processPartData(h, c, l);
    }
    processPartData(h, c, l) {
      this.actualPartLength += l - c, this.transferred += l - c, this.delta += l - c;
      const f = this.out;
      return f.write(c === 0 && h.length === l ? h : h.slice(c, l)) ? Promise.resolve() : new Promise((p, g) => {
        f.on("error", g), f.once("drain", () => {
          f.removeListener("error", g), p();
        });
      });
    }
  };
  return Zt.DataSplitter = d, Zt;
}
var Tr = {}, tc;
function lh() {
  if (tc) return Tr;
  tc = 1, Object.defineProperty(Tr, "__esModule", { value: !0 }), Tr.executeTasksUsingMultipleRangeRequests = n, Tr.checkIsRangesSupported = s;
  const e = Ge(), t = lu(), r = Qo();
  function n(i, d, a, h, c) {
    const l = (f) => {
      if (f >= d.length) {
        i.fileMetadataBuffer != null && a.write(i.fileMetadataBuffer), a.end();
        return;
      }
      const p = f + 1e3;
      o(i, {
        tasks: d,
        start: f,
        end: Math.min(d.length, p),
        oldFileFd: h
      }, a, () => l(p), c);
    };
    return l;
  }
  function o(i, d, a, h, c) {
    let l = "bytes=", f = 0, p = 0;
    const g = /* @__PURE__ */ new Map(), y = [];
    for (let I = d.start; I < d.end; I++) {
      const N = d.tasks[I];
      N.kind === r.OperationKind.DOWNLOAD && (l += `${N.start}-${N.end - 1}, `, g.set(f, I), f++, y.push(N.end - N.start), p += N.end - N.start);
    }
    if (f <= 1) {
      const I = (N) => {
        if (N >= d.end) {
          h();
          return;
        }
        const O = d.tasks[N++];
        if (O.kind === r.OperationKind.COPY)
          (0, t.copyData)(O, a, d.oldFileFd, c, () => I(N));
        else {
          const R = i.createRequestOptions();
          R.headers.Range = `bytes=${O.start}-${O.end - 1}`;
          const b = i.httpExecutor.createRequest(R, (A) => {
            A.on("error", c), s(A, c) && (A.pipe(a, {
              end: !1
            }), A.once("end", () => I(N)));
          });
          i.httpExecutor.addErrorAndTimeoutHandlers(b, c), b.end();
        }
      };
      I(d.start);
      return;
    }
    const m = i.createRequestOptions();
    m.headers.Range = l.substring(0, l.length - 2);
    const _ = i.httpExecutor.createRequest(m, (I) => {
      if (!s(I, c))
        return;
      const N = (0, e.safeGetHeader)(I, "content-type"), O = /^multipart\/.+?\s*;\s*boundary=(?:"([^"]+)"|([^\s";]+))\s*$/i.exec(N);
      if (O == null) {
        c(new Error(`Content-Type "multipart/byteranges" is expected, but got "${N}"`));
        return;
      }
      const R = new t.DataSplitter(a, d, g, O[1] || O[2], y, h, p, i.options.onProgress);
      R.on("error", c), I.pipe(R), I.on("end", () => {
        setTimeout(() => {
          _.abort(), c(new Error("Response ends without calling any handlers"));
        }, 1e4);
      });
    });
    i.httpExecutor.addErrorAndTimeoutHandlers(_, c), _.end();
  }
  function s(i, d) {
    if (i.statusCode >= 400)
      return d((0, e.createHttpError)(i)), !1;
    if (i.statusCode !== 206) {
      const a = (0, e.safeGetHeader)(i, "accept-ranges");
      if (a == null || a === "none")
        return d(new Error(`Server doesn't support Accept-Ranges (response code ${i.statusCode})`)), !1;
    }
    return !0;
  }
  return Tr;
}
var _r = {}, rc;
function ch() {
  if (rc) return _r;
  rc = 1, Object.defineProperty(_r, "__esModule", { value: !0 }), _r.ProgressDifferentialDownloadCallbackTransform = void 0;
  const e = Ur;
  var t;
  (function(n) {
    n[n.COPY = 0] = "COPY", n[n.DOWNLOAD = 1] = "DOWNLOAD";
  })(t || (t = {}));
  let r = class extends e.Transform {
    constructor(o, s, i) {
      super(), this.progressDifferentialDownloadInfo = o, this.cancellationToken = s, this.onProgress = i, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.expectedBytes = 0, this.index = 0, this.operationType = t.COPY, this.nextUpdate = this.start + 1e3;
    }
    _transform(o, s, i) {
      if (this.cancellationToken.cancelled) {
        i(new Error("cancelled"), null);
        return;
      }
      if (this.operationType == t.COPY) {
        i(null, o);
        return;
      }
      this.transferred += o.length, this.delta += o.length;
      const d = Date.now();
      d >= this.nextUpdate && this.transferred !== this.expectedBytes && this.transferred !== this.progressDifferentialDownloadInfo.grandTotal && (this.nextUpdate = d + 1e3, this.onProgress({
        total: this.progressDifferentialDownloadInfo.grandTotal,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
        bytesPerSecond: Math.round(this.transferred / ((d - this.start) / 1e3))
      }), this.delta = 0), i(null, o);
    }
    beginFileCopy() {
      this.operationType = t.COPY;
    }
    beginRangeDownload() {
      this.operationType = t.DOWNLOAD, this.expectedBytes += this.progressDifferentialDownloadInfo.expectedByteCounts[this.index++];
    }
    endRangeDownload() {
      this.transferred !== this.progressDifferentialDownloadInfo.grandTotal && this.onProgress({
        total: this.progressDifferentialDownloadInfo.grandTotal,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
        bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
      });
    }
    // Called when we are 100% done with the connection/download
    _flush(o) {
      if (this.cancellationToken.cancelled) {
        o(new Error("cancelled"));
        return;
      }
      this.onProgress({
        total: this.progressDifferentialDownloadInfo.grandTotal,
        delta: this.delta,
        transferred: this.transferred,
        percent: 100,
        bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
      }), this.delta = 0, this.transferred = 0, o(null);
    }
  };
  return _r.ProgressDifferentialDownloadCallbackTransform = r, _r;
}
var nc;
function cu() {
  if (nc) return vr;
  nc = 1, Object.defineProperty(vr, "__esModule", { value: !0 }), vr.DifferentialDownloader = void 0;
  const e = Ge(), t = /* @__PURE__ */ Pt(), r = St, n = lu(), o = Ot, s = Qo(), i = lh(), d = ch();
  let a = class {
    // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
    constructor(f, p, g) {
      this.blockAwareFileInfo = f, this.httpExecutor = p, this.options = g, this.fileMetadataBuffer = null, this.logger = g.logger;
    }
    createRequestOptions() {
      const f = {
        headers: {
          ...this.options.requestHeaders,
          accept: "*/*"
        }
      };
      return (0, e.configureRequestUrl)(this.options.newUrl, f), (0, e.configureRequestOptions)(f), f;
    }
    doDownload(f, p) {
      if (f.version !== p.version)
        throw new Error(`version is different (${f.version} - ${p.version}), full download is required`);
      const g = this.logger, y = (0, s.computeOperations)(f, p, g);
      g.debug != null && g.debug(JSON.stringify(y, null, 2));
      let m = 0, _ = 0;
      for (const N of y) {
        const O = N.end - N.start;
        N.kind === s.OperationKind.DOWNLOAD ? m += O : _ += O;
      }
      const I = this.blockAwareFileInfo.size;
      if (m + _ + (this.fileMetadataBuffer == null ? 0 : this.fileMetadataBuffer.length) !== I)
        throw new Error(`Internal error, size mismatch: downloadSize: ${m}, copySize: ${_}, newSize: ${I}`);
      return g.info(`Full: ${h(I)}, To download: ${h(m)} (${Math.round(m / (I / 100))}%)`), this.downloadFile(y);
    }
    downloadFile(f) {
      const p = [], g = () => Promise.all(p.map((y) => (0, t.close)(y.descriptor).catch((m) => {
        this.logger.error(`cannot close file "${y.path}": ${m}`);
      })));
      return this.doDownloadFile(f, p).then(g).catch((y) => g().catch((m) => {
        try {
          this.logger.error(`cannot close files: ${m}`);
        } catch (_) {
          try {
            console.error(_);
          } catch {
          }
        }
        throw y;
      }).then(() => {
        throw y;
      }));
    }
    async doDownloadFile(f, p) {
      const g = await (0, t.open)(this.options.oldFile, "r");
      p.push({ descriptor: g, path: this.options.oldFile });
      const y = await (0, t.open)(this.options.newFile, "w");
      p.push({ descriptor: y, path: this.options.newFile });
      const m = (0, r.createWriteStream)(this.options.newFile, { fd: y });
      await new Promise((_, I) => {
        const N = [];
        let O;
        if (!this.options.isUseMultipleRangeRequest && this.options.onProgress) {
          const L = [];
          let $ = 0;
          for (const x of f)
            x.kind === s.OperationKind.DOWNLOAD && (L.push(x.end - x.start), $ += x.end - x.start);
          const F = {
            expectedByteCounts: L,
            grandTotal: $
          };
          O = new d.ProgressDifferentialDownloadCallbackTransform(F, this.options.cancellationToken, this.options.onProgress), N.push(O);
        }
        const R = new e.DigestTransform(this.blockAwareFileInfo.sha512);
        R.isValidateOnEnd = !1, N.push(R), m.on("finish", () => {
          m.close(() => {
            p.splice(1, 1);
            try {
              R.validate();
            } catch (L) {
              I(L);
              return;
            }
            _(void 0);
          });
        }), N.push(m);
        let b = null;
        for (const L of N)
          L.on("error", I), b == null ? b = L : b = b.pipe(L);
        const A = N[0];
        let w;
        if (this.options.isUseMultipleRangeRequest) {
          w = (0, i.executeTasksUsingMultipleRangeRequests)(this, f, A, g, I), w(0);
          return;
        }
        let C = 0, T = null;
        this.logger.info(`Differential download: ${this.options.newUrl}`);
        const U = this.createRequestOptions();
        U.redirect = "manual", w = (L) => {
          var $, F;
          if (L >= f.length) {
            this.fileMetadataBuffer != null && A.write(this.fileMetadataBuffer), A.end();
            return;
          }
          const x = f[L++];
          if (x.kind === s.OperationKind.COPY) {
            O && O.beginFileCopy(), (0, n.copyData)(x, A, g, I, () => w(L));
            return;
          }
          const j = `bytes=${x.start}-${x.end - 1}`;
          U.headers.range = j, (F = ($ = this.logger) === null || $ === void 0 ? void 0 : $.debug) === null || F === void 0 || F.call($, `download range: ${j}`), O && O.beginRangeDownload();
          const k = this.httpExecutor.createRequest(U, (G) => {
            G.on("error", I), G.on("aborted", () => {
              I(new Error("response has been aborted by the server"));
            }), G.statusCode >= 400 && I((0, e.createHttpError)(G)), G.pipe(A, {
              end: !1
            }), G.once("end", () => {
              O && O.endRangeDownload(), ++C === 100 ? (C = 0, setTimeout(() => w(L), 1e3)) : w(L);
            });
          });
          k.on("redirect", (G, z, ee) => {
            this.logger.info(`Redirect to ${c(ee)}`), T = ee, (0, e.configureRequestUrl)(new o.URL(T), U), k.followRedirect();
          }), this.httpExecutor.addErrorAndTimeoutHandlers(k, I), k.end();
        }, w(0);
      });
    }
    async readRemoteBytes(f, p) {
      const g = Buffer.allocUnsafe(p + 1 - f), y = this.createRequestOptions();
      y.headers.range = `bytes=${f}-${p}`;
      let m = 0;
      if (await this.request(y, (_) => {
        _.copy(g, m), m += _.length;
      }), m !== g.length)
        throw new Error(`Received data length ${m} is not equal to expected ${g.length}`);
      return g;
    }
    request(f, p) {
      return new Promise((g, y) => {
        const m = this.httpExecutor.createRequest(f, (_) => {
          (0, i.checkIsRangesSupported)(_, y) && (_.on("error", y), _.on("aborted", () => {
            y(new Error("response has been aborted by the server"));
          }), _.on("data", p), _.on("end", () => g()));
        });
        this.httpExecutor.addErrorAndTimeoutHandlers(m, y), m.end();
      });
    }
  };
  vr.DifferentialDownloader = a;
  function h(l, f = " KB") {
    return new Intl.NumberFormat("en").format((l / 1024).toFixed(2)) + f;
  }
  function c(l) {
    const f = l.indexOf("?");
    return f < 0 ? l : l.substring(0, f);
  }
  return vr;
}
var ic;
function uh() {
  if (ic) return wr;
  ic = 1, Object.defineProperty(wr, "__esModule", { value: !0 }), wr.GenericDifferentialDownloader = void 0;
  const e = cu();
  let t = class extends e.DifferentialDownloader {
    download(n, o) {
      return this.doDownload(n, o);
    }
  };
  return wr.GenericDifferentialDownloader = t, wr;
}
var Ro = {}, oc;
function Wt() {
  return oc || (oc = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.UpdaterSignal = e.UPDATE_DOWNLOADED = e.DOWNLOAD_PROGRESS = e.CancellationToken = void 0, e.addHandler = n;
    const t = Ge();
    Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
      return t.CancellationToken;
    } }), e.DOWNLOAD_PROGRESS = "download-progress", e.UPDATE_DOWNLOADED = "update-downloaded";
    class r {
      constructor(s) {
        this.emitter = s;
      }
      /**
       * Emitted when an authenticating proxy is [asking for user credentials](https://github.com/electron/electron/blob/master/docs/api/client-request.md#event-login).
       */
      login(s) {
        n(this.emitter, "login", s);
      }
      progress(s) {
        n(this.emitter, e.DOWNLOAD_PROGRESS, s);
      }
      updateDownloaded(s) {
        n(this.emitter, e.UPDATE_DOWNLOADED, s);
      }
      updateCancelled(s) {
        n(this.emitter, "update-cancelled", s);
      }
    }
    e.UpdaterSignal = r;
    function n(o, s, i) {
      o.on(s, i);
    }
  })(Ro)), Ro;
}
var ac;
function Zo() {
  if (ac) return Mt;
  ac = 1, Object.defineProperty(Mt, "__esModule", { value: !0 }), Mt.NoOpLogger = Mt.AppUpdater = void 0;
  const e = Ge(), t = tt, r = kr, n = Oc, o = /* @__PURE__ */ Pt(), s = Wo(), i = bf(), d = Le, a = iu(), h = Zf(), c = th(), l = rh(), f = au(), p = sh(), g = Fc, y = uh(), m = Wt();
  let _ = class uu extends n.EventEmitter {
    /**
     * Get the update channel. Doesn't return `channel` from the update configuration, only if was previously set.
     */
    get channel() {
      return this._channel;
    }
    /**
     * Set the update channel. Overrides `channel` in the update configuration.
     *
     * `allowDowngrade` will be automatically set to `true`. If this behavior is not suitable for you, simple set `allowDowngrade` explicitly after.
     */
    set channel(R) {
      if (this._channel != null) {
        if (typeof R != "string")
          throw (0, e.newError)(`Channel must be a string, but got: ${R}`, "ERR_UPDATER_INVALID_CHANNEL");
        if (R.length === 0)
          throw (0, e.newError)("Channel must be not an empty string", "ERR_UPDATER_INVALID_CHANNEL");
      }
      this._channel = R, this.allowDowngrade = !0;
    }
    /**
     *  Shortcut for explicitly adding auth tokens to request headers
     */
    addAuthHeader(R) {
      this.requestHeaders = Object.assign({}, this.requestHeaders, {
        authorization: R
      });
    }
    // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    get netSession() {
      return (0, l.getNetSession)();
    }
    /**
     * The logger. You can pass [electron-log](https://github.com/megahertz/electron-log), [winston](https://github.com/winstonjs/winston) or another logger with the following interface: `{ info(), warn(), error() }`.
     * Set it to `null` if you would like to disable a logging feature.
     */
    get logger() {
      return this._logger;
    }
    set logger(R) {
      this._logger = R ?? new N();
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * test only
     * @private
     */
    set updateConfigPath(R) {
      this.clientPromise = null, this._appUpdateConfigPath = R, this.configOnDisk = new i.Lazy(() => this.loadUpdateConfig());
    }
    /**
     * Allows developer to override default logic for determining if an update is supported.
     * The default logic compares the `UpdateInfo` minimum system version against the `os.release()` with `semver` package
     */
    get isUpdateSupported() {
      return this._isUpdateSupported;
    }
    set isUpdateSupported(R) {
      R && (this._isUpdateSupported = R);
    }
    /**
     * Allows developer to override default logic for determining if the user is below the rollout threshold.
     * The default logic compares the staging percentage with numerical representation of user ID.
     * An override can define custom logic, or bypass it if needed.
     */
    get isUserWithinRollout() {
      return this._isUserWithinRollout;
    }
    set isUserWithinRollout(R) {
      R && (this._isUserWithinRollout = R);
    }
    constructor(R, b) {
      super(), this.autoDownload = !0, this.autoInstallOnAppQuit = !0, this.autoRunAppAfterInstall = !0, this.allowPrerelease = !1, this.fullChangelog = !1, this.allowDowngrade = !1, this.disableWebInstaller = !1, this.disableDifferentialDownload = !1, this.forceDevUpdateConfig = !1, this.previousBlockmapBaseUrlOverride = null, this._channel = null, this.downloadedUpdateHelper = null, this.requestHeaders = null, this._logger = console, this.signals = new m.UpdaterSignal(this), this._appUpdateConfigPath = null, this._isUpdateSupported = (C) => this.checkIfUpdateSupported(C), this._isUserWithinRollout = (C) => this.isStagingMatch(C), this.clientPromise = null, this.stagingUserIdPromise = new i.Lazy(() => this.getOrCreateStagingUserId()), this.configOnDisk = new i.Lazy(() => this.loadUpdateConfig()), this.checkForUpdatesPromise = null, this.downloadPromise = null, this.updateInfoAndProvider = null, this._testOnlyOptions = null, this.on("error", (C) => {
        this._logger.error(`Error: ${C.stack || C.message}`);
      }), b == null ? (this.app = new c.ElectronAppAdapter(), this.httpExecutor = new l.ElectronHttpExecutor((C, T) => this.emit("login", C, T))) : (this.app = b, this.httpExecutor = null);
      const A = this.app.version, w = (0, a.parse)(A);
      if (w == null)
        throw (0, e.newError)(`App version is not a valid semver version: "${A}"`, "ERR_UPDATER_INVALID_VERSION");
      this.currentVersion = w, this.allowPrerelease = I(w), R != null && (this.setFeedURL(R), typeof R != "string" && R.requestHeaders && (this.requestHeaders = R.requestHeaders));
    }
    //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    getFeedURL() {
      return "Deprecated. Do not use it.";
    }
    /**
     * Configure update provider. If value is `string`, [GenericServerOptions](./publish.md#genericserveroptions) will be set with value as `url`.
     * @param options If you want to override configuration in the `app-update.yml`.
     */
    setFeedURL(R) {
      const b = this.createProviderRuntimeOptions();
      let A;
      typeof R == "string" ? A = new f.GenericProvider({ provider: "generic", url: R }, this, {
        ...b,
        isUseMultipleRangeRequest: (0, p.isUrlProbablySupportMultiRangeRequests)(R)
      }) : A = (0, p.createClient)(R, this, b), this.clientPromise = Promise.resolve(A);
    }
    /**
     * Asks the server whether there is an update.
     * @returns null if the updater is disabled, otherwise info about the latest version
     */
    checkForUpdates() {
      if (!this.isUpdaterActive())
        return Promise.resolve(null);
      let R = this.checkForUpdatesPromise;
      if (R != null)
        return this._logger.info("Checking for update (already in progress)"), R;
      const b = () => this.checkForUpdatesPromise = null;
      return this._logger.info("Checking for update"), R = this.doCheckForUpdates().then((A) => (b(), A)).catch((A) => {
        throw b(), this.emit("error", A, `Cannot check for updates: ${(A.stack || A).toString()}`), A;
      }), this.checkForUpdatesPromise = R, R;
    }
    isUpdaterActive() {
      return this.app.isPackaged || this.forceDevUpdateConfig ? !0 : (this._logger.info("Skip checkForUpdates because application is not packed and dev update config is not forced"), !1);
    }
    // noinspection JSUnusedGlobalSymbols
    checkForUpdatesAndNotify(R) {
      return this.checkForUpdates().then((b) => b?.downloadPromise ? (b.downloadPromise.then(() => {
        const A = uu.formatDownloadNotification(b.updateInfo.version, this.app.name, R);
        new Ht.Notification(A).show();
      }), b) : (this._logger.debug != null && this._logger.debug("checkForUpdatesAndNotify called, downloadPromise is null"), b));
    }
    static formatDownloadNotification(R, b, A) {
      return A == null && (A = {
        title: "A new update is ready to install",
        body: "{appName} version {version} has been downloaded and will be automatically installed on exit"
      }), A = {
        title: A.title.replace("{appName}", b).replace("{version}", R),
        body: A.body.replace("{appName}", b).replace("{version}", R)
      }, A;
    }
    async isStagingMatch(R) {
      const b = R.stagingPercentage;
      let A = b;
      if (A == null)
        return !0;
      if (A = parseInt(A, 10), isNaN(A))
        return this._logger.warn(`Staging percentage is NaN: ${b}`), !0;
      A = A / 100;
      const w = await this.stagingUserIdPromise.value, T = e.UUID.parse(w).readUInt32BE(12) / 4294967295;
      return this._logger.info(`Staging percentage: ${A}, percentage: ${T}, user id: ${w}`), T < A;
    }
    computeFinalHeaders(R) {
      return this.requestHeaders != null && Object.assign(R, this.requestHeaders), R;
    }
    async isUpdateAvailable(R) {
      const b = (0, a.parse)(R.version);
      if (b == null)
        throw (0, e.newError)(`This file could not be downloaded, or the latest version (from update server) does not have a valid semver version: "${R.version}"`, "ERR_UPDATER_INVALID_VERSION");
      const A = this.currentVersion;
      if ((0, a.eq)(b, A) || !await Promise.resolve(this.isUpdateSupported(R)) || !await Promise.resolve(this.isUserWithinRollout(R)))
        return !1;
      const C = (0, a.gt)(b, A), T = (0, a.lt)(b, A);
      return C ? !0 : this.allowDowngrade && T;
    }
    checkIfUpdateSupported(R) {
      const b = R?.minimumSystemVersion, A = (0, r.release)();
      if (b)
        try {
          if ((0, a.lt)(A, b))
            return this._logger.info(`Current OS version ${A} is less than the minimum OS version required ${b} for version ${A}`), !1;
        } catch (w) {
          this._logger.warn(`Failed to compare current OS version(${A}) with minimum OS version(${b}): ${(w.message || w).toString()}`);
        }
      return !0;
    }
    async getUpdateInfoAndProvider() {
      await this.app.whenReady(), this.clientPromise == null && (this.clientPromise = this.configOnDisk.value.then((A) => (0, p.createClient)(A, this, this.createProviderRuntimeOptions())));
      const R = await this.clientPromise, b = await this.stagingUserIdPromise.value;
      return R.setRequestHeaders(this.computeFinalHeaders({ "x-user-staging-id": b })), {
        info: await R.getLatestVersion(),
        provider: R
      };
    }
    createProviderRuntimeOptions() {
      return {
        isUseMultipleRangeRequest: !0,
        platform: this._testOnlyOptions == null ? process.platform : this._testOnlyOptions.platform,
        executor: this.httpExecutor
      };
    }
    async doCheckForUpdates() {
      this.emit("checking-for-update");
      const R = await this.getUpdateInfoAndProvider(), b = R.info;
      if (!await this.isUpdateAvailable(b))
        return this._logger.info(`Update for version ${this.currentVersion.format()} is not available (latest version: ${b.version}, downgrade is ${this.allowDowngrade ? "allowed" : "disallowed"}).`), this.emit("update-not-available", b), {
          isUpdateAvailable: !1,
          versionInfo: b,
          updateInfo: b
        };
      this.updateInfoAndProvider = R, this.onUpdateAvailable(b);
      const A = new e.CancellationToken();
      return {
        isUpdateAvailable: !0,
        versionInfo: b,
        updateInfo: b,
        cancellationToken: A,
        downloadPromise: this.autoDownload ? this.downloadUpdate(A) : null
      };
    }
    onUpdateAvailable(R) {
      this._logger.info(`Found version ${R.version} (url: ${(0, e.asArray)(R.files).map((b) => b.url).join(", ")})`), this.emit("update-available", R);
    }
    /**
     * Start downloading update manually. You can use this method if `autoDownload` option is set to `false`.
     * @returns {Promise<Array<string>>} Paths to downloaded files.
     */
    downloadUpdate(R = new e.CancellationToken()) {
      const b = this.updateInfoAndProvider;
      if (b == null) {
        const w = new Error("Please check update first");
        return this.dispatchError(w), Promise.reject(w);
      }
      if (this.downloadPromise != null)
        return this._logger.info("Downloading update (already in progress)"), this.downloadPromise;
      this._logger.info(`Downloading update from ${(0, e.asArray)(b.info.files).map((w) => w.url).join(", ")}`);
      const A = (w) => {
        if (!(w instanceof e.CancellationError))
          try {
            this.dispatchError(w);
          } catch (C) {
            this._logger.warn(`Cannot dispatch error event: ${C.stack || C}`);
          }
        return w;
      };
      return this.downloadPromise = this.doDownloadUpdate({
        updateInfoAndProvider: b,
        requestHeaders: this.computeRequestHeaders(b.provider),
        cancellationToken: R,
        disableWebInstaller: this.disableWebInstaller,
        disableDifferentialDownload: this.disableDifferentialDownload
      }).catch((w) => {
        throw A(w);
      }).finally(() => {
        this.downloadPromise = null;
      }), this.downloadPromise;
    }
    dispatchError(R) {
      this.emit("error", R, (R.stack || R).toString());
    }
    dispatchUpdateDownloaded(R) {
      this.emit(m.UPDATE_DOWNLOADED, R);
    }
    async loadUpdateConfig() {
      return this._appUpdateConfigPath == null && (this._appUpdateConfigPath = this.app.appUpdateConfigPath), (0, s.load)(await (0, o.readFile)(this._appUpdateConfigPath, "utf-8"));
    }
    computeRequestHeaders(R) {
      const b = R.fileExtraDownloadHeaders;
      if (b != null) {
        const A = this.requestHeaders;
        return A == null ? b : {
          ...b,
          ...A
        };
      }
      return this.computeFinalHeaders({ accept: "*/*" });
    }
    async getOrCreateStagingUserId() {
      const R = d.join(this.app.userDataPath, ".updaterId");
      try {
        const A = await (0, o.readFile)(R, "utf-8");
        if (e.UUID.check(A))
          return A;
        this._logger.warn(`Staging user id file exists, but content was invalid: ${A}`);
      } catch (A) {
        A.code !== "ENOENT" && this._logger.warn(`Couldn't read staging user ID, creating a blank one: ${A}`);
      }
      const b = e.UUID.v5((0, t.randomBytes)(4096), e.UUID.OID);
      this._logger.info(`Generated new staging user ID: ${b}`);
      try {
        await (0, o.outputFile)(R, b);
      } catch (A) {
        this._logger.warn(`Couldn't write out staging user ID: ${A}`);
      }
      return b;
    }
    /** @internal */
    get isAddNoCacheQuery() {
      const R = this.requestHeaders;
      if (R == null)
        return !0;
      for (const b of Object.keys(R)) {
        const A = b.toLowerCase();
        if (A === "authorization" || A === "private-token")
          return !1;
      }
      return !0;
    }
    async getOrCreateDownloadHelper() {
      let R = this.downloadedUpdateHelper;
      if (R == null) {
        const b = (await this.configOnDisk.value).updaterCacheDirName, A = this._logger;
        b == null && A.error("updaterCacheDirName is not specified in app-update.yml Was app build using at least electron-builder 20.34.0?");
        const w = d.join(this.app.baseCachePath, b || this.app.name);
        A.debug != null && A.debug(`updater cache dir: ${w}`), R = new h.DownloadedUpdateHelper(w), this.downloadedUpdateHelper = R;
      }
      return R;
    }
    async executeDownload(R) {
      const b = R.fileInfo, A = {
        headers: R.downloadUpdateOptions.requestHeaders,
        cancellationToken: R.downloadUpdateOptions.cancellationToken,
        sha2: b.info.sha2,
        sha512: b.info.sha512
      };
      this.listenerCount(m.DOWNLOAD_PROGRESS) > 0 && (A.onProgress = (Z) => this.emit(m.DOWNLOAD_PROGRESS, Z));
      const w = R.downloadUpdateOptions.updateInfoAndProvider.info, C = w.version, T = b.packageInfo;
      function U() {
        const Z = decodeURIComponent(R.fileInfo.url.pathname);
        return Z.toLowerCase().endsWith(`.${R.fileExtension.toLowerCase()}`) ? d.basename(Z) : R.fileInfo.info.url;
      }
      const L = await this.getOrCreateDownloadHelper(), $ = L.cacheDirForPendingUpdate;
      await (0, o.mkdir)($, { recursive: !0 });
      const F = U();
      let x = d.join($, F);
      const j = T == null ? null : d.join($, `package-${C}${d.extname(T.path) || ".7z"}`), k = async (Z) => {
        await L.setDownloadedFile(x, j, w, b, F, Z), await R.done({
          ...w,
          downloadedFile: x
        });
        const ye = d.join($, "current.blockmap");
        return await (0, o.pathExists)(ye) && await (0, o.copyFile)(ye, d.join(L.cacheDir, "current.blockmap")), j == null ? [x] : [x, j];
      }, G = this._logger, z = await L.validateDownloadedPath(x, w, b, G);
      if (z != null)
        return x = z, await k(!1);
      const ee = async () => (await L.clear().catch(() => {
      }), await (0, o.unlink)(x).catch(() => {
      })), me = await (0, h.createTempUpdateFile)(`temp-${F}`, $, G);
      try {
        await R.task(me, A, j, ee), await (0, e.retry)(() => (0, o.rename)(me, x), {
          retries: 60,
          interval: 500,
          shouldRetry: (Z) => Z instanceof Error && /^EBUSY:/.test(Z.message) ? !0 : (G.warn(`Cannot rename temp file to final file: ${Z.message || Z.stack}`), !1)
        });
      } catch (Z) {
        throw await ee(), Z instanceof e.CancellationError && (G.info("cancelled"), this.emit("update-cancelled", w)), Z;
      }
      return G.info(`New version ${C} has been downloaded to ${x}`), await k(!0);
    }
    async differentialDownloadInstaller(R, b, A, w, C) {
      try {
        if (this._testOnlyOptions != null && !this._testOnlyOptions.isUseDifferentialDownload)
          return !0;
        const T = b.updateInfoAndProvider.provider, U = await T.getBlockMapFiles(R.url, this.app.version, b.updateInfoAndProvider.info.version, this.previousBlockmapBaseUrlOverride);
        this._logger.info(`Download block maps (old: "${U[0]}", new: ${U[1]})`);
        const L = async (G) => {
          const z = await this.httpExecutor.downloadToBuffer(G, {
            headers: b.requestHeaders,
            cancellationToken: b.cancellationToken
          });
          if (z == null || z.length === 0)
            throw new Error(`Blockmap "${G.href}" is empty`);
          try {
            return JSON.parse((0, g.gunzipSync)(z).toString());
          } catch (ee) {
            throw new Error(`Cannot parse blockmap "${G.href}", error: ${ee}`);
          }
        }, $ = {
          newUrl: R.url,
          oldFile: d.join(this.downloadedUpdateHelper.cacheDir, C),
          logger: this._logger,
          newFile: A,
          isUseMultipleRangeRequest: T.isUseMultipleRangeRequest,
          requestHeaders: b.requestHeaders,
          cancellationToken: b.cancellationToken
        };
        this.listenerCount(m.DOWNLOAD_PROGRESS) > 0 && ($.onProgress = (G) => this.emit(m.DOWNLOAD_PROGRESS, G));
        const F = async (G, z) => {
          const ee = d.join(z, "current.blockmap");
          await (0, o.outputFile)(ee, (0, g.gzipSync)(JSON.stringify(G)));
        }, x = async (G) => {
          const z = d.join(G, "current.blockmap");
          try {
            if (await (0, o.pathExists)(z))
              return JSON.parse((0, g.gunzipSync)(await (0, o.readFile)(z)).toString());
          } catch (ee) {
            this._logger.warn(`Cannot parse blockmap "${z}", error: ${ee}`);
          }
          return null;
        }, j = await L(U[1]);
        await F(j, this.downloadedUpdateHelper.cacheDirForPendingUpdate);
        let k = await x(this.downloadedUpdateHelper.cacheDir);
        return k == null && (k = await L(U[0])), await new y.GenericDifferentialDownloader(R.info, this.httpExecutor, $).download(k, j), !1;
      } catch (T) {
        if (this._logger.error(`Cannot download differentially, fallback to full download: ${T.stack || T}`), this._testOnlyOptions != null)
          throw T;
        return !0;
      }
    }
  };
  Mt.AppUpdater = _;
  function I(O) {
    const R = (0, a.prerelease)(O);
    return R != null && R.length > 0;
  }
  class N {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    info(R) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    warn(R) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error(R) {
    }
  }
  return Mt.NoOpLogger = N, Mt;
}
var sc;
function wn() {
  if (sc) return lr;
  sc = 1, Object.defineProperty(lr, "__esModule", { value: !0 }), lr.BaseUpdater = void 0;
  const e = dn, t = Zo();
  let r = class extends t.AppUpdater {
    constructor(o, s) {
      super(o, s), this.quitAndInstallCalled = !1, this.quitHandlerAdded = !1;
    }
    quitAndInstall(o = !1, s = !1) {
      this._logger.info("Install on explicit quitAndInstall"), this.install(o, o ? s : this.autoRunAppAfterInstall) ? setImmediate(() => {
        Ht.autoUpdater.emit("before-quit-for-update"), this.app.quit();
      }) : this.quitAndInstallCalled = !1;
    }
    executeDownload(o) {
      return super.executeDownload({
        ...o,
        done: (s) => (this.dispatchUpdateDownloaded(s), this.addQuitHandler(), Promise.resolve())
      });
    }
    get installerPath() {
      return this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.file;
    }
    // must be sync (because quit even handler is not async)
    install(o = !1, s = !1) {
      if (this.quitAndInstallCalled)
        return this._logger.warn("install call ignored: quitAndInstallCalled is set to true"), !1;
      const i = this.downloadedUpdateHelper, d = this.installerPath, a = i == null ? null : i.downloadedFileInfo;
      if (d == null || a == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      this.quitAndInstallCalled = !0;
      try {
        return this._logger.info(`Install: isSilent: ${o}, isForceRunAfter: ${s}`), this.doInstall({
          isSilent: o,
          isForceRunAfter: s,
          isAdminRightsRequired: a.isAdminRightsRequired
        });
      } catch (h) {
        return this.dispatchError(h), !1;
      }
    }
    addQuitHandler() {
      this.quitHandlerAdded || !this.autoInstallOnAppQuit || (this.quitHandlerAdded = !0, this.app.onQuit((o) => {
        if (this.quitAndInstallCalled) {
          this._logger.info("Update installer has already been triggered. Quitting application.");
          return;
        }
        if (!this.autoInstallOnAppQuit) {
          this._logger.info("Update will not be installed on quit because autoInstallOnAppQuit is set to false.");
          return;
        }
        if (o !== 0) {
          this._logger.info(`Update will be not installed on quit because application is quitting with exit code ${o}`);
          return;
        }
        this._logger.info("Auto install update on quit"), this.install(!0, !1);
      }));
    }
    spawnSyncLog(o, s = [], i = {}) {
      this._logger.info(`Executing: ${o} with args: ${s}`);
      const d = (0, e.spawnSync)(o, s, {
        env: { ...process.env, ...i },
        encoding: "utf-8",
        shell: !0
      }), { error: a, status: h, stdout: c, stderr: l } = d;
      if (a != null)
        throw this._logger.error(l), a;
      if (h != null && h !== 0)
        throw this._logger.error(l), new Error(`Command ${o} exited with code ${h}`);
      return c.trim();
    }
    /**
     * This handles both node 8 and node 10 way of emitting error when spawning a process
     *   - node 8: Throws the error
     *   - node 10: Emit the error(Need to listen with on)
     */
    // https://github.com/electron-userland/electron-builder/issues/1129
    // Node 8 sends errors: https://nodejs.org/dist/latest-v8.x/docs/api/errors.html#errors_common_system_errors
    async spawnLog(o, s = [], i = void 0, d = "ignore") {
      return this._logger.info(`Executing: ${o} with args: ${s}`), new Promise((a, h) => {
        try {
          const c = { stdio: d, env: i, detached: !0 }, l = (0, e.spawn)(o, s, c);
          l.on("error", (f) => {
            h(f);
          }), l.unref(), l.pid !== void 0 && a(!0);
        } catch (c) {
          h(c);
        }
      });
    }
  };
  return lr.BaseUpdater = r, lr;
}
var Ir = {}, Sr = {}, lc;
function du() {
  if (lc) return Sr;
  lc = 1, Object.defineProperty(Sr, "__esModule", { value: !0 }), Sr.FileWithEmbeddedBlockMapDifferentialDownloader = void 0;
  const e = /* @__PURE__ */ Pt(), t = cu(), r = Fc;
  let n = class extends t.DifferentialDownloader {
    async download() {
      const d = this.blockAwareFileInfo, a = d.size, h = a - (d.blockMapSize + 4);
      this.fileMetadataBuffer = await this.readRemoteBytes(h, a - 1);
      const c = o(this.fileMetadataBuffer.slice(0, this.fileMetadataBuffer.length - 4));
      await this.doDownload(await s(this.options.oldFile), c);
    }
  };
  Sr.FileWithEmbeddedBlockMapDifferentialDownloader = n;
  function o(i) {
    return JSON.parse((0, r.inflateRawSync)(i).toString());
  }
  async function s(i) {
    const d = await (0, e.open)(i, "r");
    try {
      const a = (await (0, e.fstat)(d)).size, h = Buffer.allocUnsafe(4);
      await (0, e.read)(d, h, 0, h.length, a - h.length);
      const c = Buffer.allocUnsafe(h.readUInt32BE(0));
      return await (0, e.read)(d, c, 0, c.length, a - h.length - c.length), await (0, e.close)(d), o(c);
    } catch (a) {
      throw await (0, e.close)(d), a;
    }
  }
  return Sr;
}
var cc;
function uc() {
  if (cc) return Ir;
  cc = 1, Object.defineProperty(Ir, "__esModule", { value: !0 }), Ir.AppImageUpdater = void 0;
  const e = Ge(), t = dn, r = /* @__PURE__ */ Pt(), n = St, o = Le, s = wn(), i = du(), d = ot(), a = Wt();
  let h = class extends s.BaseUpdater {
    constructor(l, f) {
      super(l, f);
    }
    isUpdaterActive() {
      return process.env.APPIMAGE == null && !this.forceDevUpdateConfig ? (process.env.SNAP == null ? this._logger.warn("APPIMAGE env is not defined, current application is not an AppImage") : this._logger.info("SNAP env is defined, updater is disabled"), !1) : super.isUpdaterActive();
    }
    /*** @private */
    doDownloadUpdate(l) {
      const f = l.updateInfoAndProvider.provider, p = (0, d.findFile)(f.resolveFiles(l.updateInfoAndProvider.info), "AppImage", ["rpm", "deb", "pacman"]);
      return this.executeDownload({
        fileExtension: "AppImage",
        fileInfo: p,
        downloadUpdateOptions: l,
        task: async (g, y) => {
          const m = process.env.APPIMAGE;
          if (m == null)
            throw (0, e.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
          (l.disableDifferentialDownload || await this.downloadDifferential(p, m, g, f, l)) && await this.httpExecutor.download(p.url, g, y), await (0, r.chmod)(g, 493);
        }
      });
    }
    async downloadDifferential(l, f, p, g, y) {
      try {
        const m = {
          newUrl: l.url,
          oldFile: f,
          logger: this._logger,
          newFile: p,
          isUseMultipleRangeRequest: g.isUseMultipleRangeRequest,
          requestHeaders: y.requestHeaders,
          cancellationToken: y.cancellationToken
        };
        return this.listenerCount(a.DOWNLOAD_PROGRESS) > 0 && (m.onProgress = (_) => this.emit(a.DOWNLOAD_PROGRESS, _)), await new i.FileWithEmbeddedBlockMapDifferentialDownloader(l.info, this.httpExecutor, m).download(), !1;
      } catch (m) {
        return this._logger.error(`Cannot download differentially, fallback to full download: ${m.stack || m}`), process.platform === "linux";
      }
    }
    doInstall(l) {
      const f = process.env.APPIMAGE;
      if (f == null)
        throw (0, e.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
      (0, n.unlinkSync)(f);
      let p;
      const g = o.basename(f), y = this.installerPath;
      if (y == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      o.basename(y) === g || !/\d+\.\d+\.\d+/.test(g) ? p = f : p = o.join(o.dirname(f), o.basename(y)), (0, t.execFileSync)("mv", ["-f", y, p]), p !== f && this.emit("appimage-filename-updated", p);
      const m = {
        ...process.env,
        APPIMAGE_SILENT_INSTALL: "true"
      };
      return l.isForceRunAfter ? this.spawnLog(p, [], m) : (m.APPIMAGE_EXIT_AFTER_INSTALL = "true", (0, t.execFileSync)(p, [], { env: m })), !0;
    }
  };
  return Ir.AppImageUpdater = h, Ir;
}
var Ar = {}, Rr = {}, dc;
function ea() {
  if (dc) return Rr;
  dc = 1, Object.defineProperty(Rr, "__esModule", { value: !0 }), Rr.LinuxUpdater = void 0;
  const e = wn();
  let t = class extends e.BaseUpdater {
    constructor(n, o) {
      super(n, o);
    }
    /**
     * Returns true if the current process is running as root.
     */
    isRunningAsRoot() {
      var n;
      return ((n = process.getuid) === null || n === void 0 ? void 0 : n.call(process)) === 0;
    }
    /**
     * Sanitizies the installer path for using with command line tools.
     */
    get installerPath() {
      var n, o;
      return (o = (n = super.installerPath) === null || n === void 0 ? void 0 : n.replace(/\\/g, "\\\\").replace(/ /g, "\\ ")) !== null && o !== void 0 ? o : null;
    }
    runCommandWithSudoIfNeeded(n) {
      if (this.isRunningAsRoot())
        return this._logger.info("Running as root, no need to use sudo"), this.spawnSyncLog(n[0], n.slice(1));
      const { name: o } = this.app, s = `"${o} would like to update"`, i = this.sudoWithArgs(s);
      this._logger.info(`Running as non-root user, using sudo to install: ${i}`);
      let d = '"';
      return (/pkexec/i.test(i[0]) || i[0] === "sudo") && (d = ""), this.spawnSyncLog(i[0], [...i.length > 1 ? i.slice(1) : [], `${d}/bin/bash`, "-c", `'${n.join(" ")}'${d}`]);
    }
    sudoWithArgs(n) {
      const o = this.determineSudoCommand(), s = [o];
      return /kdesudo/i.test(o) ? (s.push("--comment", n), s.push("-c")) : /gksudo/i.test(o) ? s.push("--message", n) : /pkexec/i.test(o) && s.push("--disable-internal-agent"), s;
    }
    hasCommand(n) {
      try {
        return this.spawnSyncLog("command", ["-v", n]), !0;
      } catch {
        return !1;
      }
    }
    determineSudoCommand() {
      const n = ["gksudo", "kdesudo", "pkexec", "beesu"];
      for (const o of n)
        if (this.hasCommand(o))
          return o;
      return "sudo";
    }
    /**
     * Detects the package manager to use based on the available commands.
     * Allows overriding the default behavior by setting the ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER environment variable.
     * If the environment variable is set, it will be used directly. (This is useful for testing each package manager logic path.)
     * Otherwise, it checks for the presence of the specified package manager commands in the order provided.
     * @param pms - An array of package manager commands to check for, in priority order.
     * @returns The detected package manager command or "unknown" if none are found.
     */
    detectPackageManager(n) {
      var o;
      const s = (o = process.env.ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER) === null || o === void 0 ? void 0 : o.trim();
      if (s)
        return s;
      for (const i of n)
        if (this.hasCommand(i))
          return i;
      return this._logger.warn(`No package manager found in the list: ${n.join(", ")}. Defaulting to the first one: ${n[0]}`), n[0];
    }
  };
  return Rr.LinuxUpdater = t, Rr;
}
var fc;
function hc() {
  if (fc) return Ar;
  fc = 1, Object.defineProperty(Ar, "__esModule", { value: !0 }), Ar.DebUpdater = void 0;
  const e = ot(), t = Wt(), r = ea();
  let n = class fu extends r.LinuxUpdater {
    constructor(s, i) {
      super(s, i);
    }
    /*** @private */
    doDownloadUpdate(s) {
      const i = s.updateInfoAndProvider.provider, d = (0, e.findFile)(i.resolveFiles(s.updateInfoAndProvider.info), "deb", ["AppImage", "rpm", "pacman"]);
      return this.executeDownload({
        fileExtension: "deb",
        fileInfo: d,
        downloadUpdateOptions: s,
        task: async (a, h) => {
          this.listenerCount(t.DOWNLOAD_PROGRESS) > 0 && (h.onProgress = (c) => this.emit(t.DOWNLOAD_PROGRESS, c)), await this.httpExecutor.download(d.url, a, h);
        }
      });
    }
    doInstall(s) {
      const i = this.installerPath;
      if (i == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      if (!this.hasCommand("dpkg") && !this.hasCommand("apt"))
        return this.dispatchError(new Error("Neither dpkg nor apt command found. Cannot install .deb package.")), !1;
      const d = ["dpkg", "apt"], a = this.detectPackageManager(d);
      try {
        fu.installWithCommandRunner(a, i, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
      } catch (h) {
        return this.dispatchError(h), !1;
      }
      return s.isForceRunAfter && this.app.relaunch(), !0;
    }
    static installWithCommandRunner(s, i, d, a) {
      var h;
      if (s === "dpkg")
        try {
          d(["dpkg", "-i", i]);
        } catch (c) {
          a.warn((h = c.message) !== null && h !== void 0 ? h : c), a.warn("dpkg installation failed, trying to fix broken dependencies with apt-get"), d(["apt-get", "install", "-f", "-y"]);
        }
      else if (s === "apt")
        a.warn("Using apt to install a local .deb. This may fail for unsigned packages unless properly configured."), d([
          "apt",
          "install",
          "-y",
          "--allow-unauthenticated",
          // needed for unsigned .debs
          "--allow-downgrades",
          // allow lower version installs
          "--allow-change-held-packages",
          i
        ]);
      else
        throw new Error(`Package manager ${s} not supported`);
    }
  };
  return Ar.DebUpdater = n, Ar;
}
var br = {}, pc;
function mc() {
  if (pc) return br;
  pc = 1, Object.defineProperty(br, "__esModule", { value: !0 }), br.PacmanUpdater = void 0;
  const e = Wt(), t = ot(), r = ea();
  let n = class hu extends r.LinuxUpdater {
    constructor(s, i) {
      super(s, i);
    }
    /*** @private */
    doDownloadUpdate(s) {
      const i = s.updateInfoAndProvider.provider, d = (0, t.findFile)(i.resolveFiles(s.updateInfoAndProvider.info), "pacman", ["AppImage", "deb", "rpm"]);
      return this.executeDownload({
        fileExtension: "pacman",
        fileInfo: d,
        downloadUpdateOptions: s,
        task: async (a, h) => {
          this.listenerCount(e.DOWNLOAD_PROGRESS) > 0 && (h.onProgress = (c) => this.emit(e.DOWNLOAD_PROGRESS, c)), await this.httpExecutor.download(d.url, a, h);
        }
      });
    }
    doInstall(s) {
      const i = this.installerPath;
      if (i == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      try {
        hu.installWithCommandRunner(i, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
      } catch (d) {
        return this.dispatchError(d), !1;
      }
      return s.isForceRunAfter && this.app.relaunch(), !0;
    }
    static installWithCommandRunner(s, i, d) {
      var a;
      try {
        i(["pacman", "-U", "--noconfirm", s]);
      } catch (h) {
        d.warn((a = h.message) !== null && a !== void 0 ? a : h), d.warn("pacman installation failed, attempting to update package database and retry");
        try {
          i(["pacman", "-Sy", "--noconfirm"]), i(["pacman", "-U", "--noconfirm", s]);
        } catch (c) {
          throw d.error("Retry after pacman -Sy failed"), c;
        }
      }
    }
  };
  return br.PacmanUpdater = n, br;
}
var Cr = {}, gc;
function Ec() {
  if (gc) return Cr;
  gc = 1, Object.defineProperty(Cr, "__esModule", { value: !0 }), Cr.RpmUpdater = void 0;
  const e = Wt(), t = ot(), r = ea();
  let n = class pu extends r.LinuxUpdater {
    constructor(s, i) {
      super(s, i);
    }
    /*** @private */
    doDownloadUpdate(s) {
      const i = s.updateInfoAndProvider.provider, d = (0, t.findFile)(i.resolveFiles(s.updateInfoAndProvider.info), "rpm", ["AppImage", "deb", "pacman"]);
      return this.executeDownload({
        fileExtension: "rpm",
        fileInfo: d,
        downloadUpdateOptions: s,
        task: async (a, h) => {
          this.listenerCount(e.DOWNLOAD_PROGRESS) > 0 && (h.onProgress = (c) => this.emit(e.DOWNLOAD_PROGRESS, c)), await this.httpExecutor.download(d.url, a, h);
        }
      });
    }
    doInstall(s) {
      const i = this.installerPath;
      if (i == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      const d = ["zypper", "dnf", "yum", "rpm"], a = this.detectPackageManager(d);
      try {
        pu.installWithCommandRunner(a, i, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
      } catch (h) {
        return this.dispatchError(h), !1;
      }
      return s.isForceRunAfter && this.app.relaunch(), !0;
    }
    static installWithCommandRunner(s, i, d, a) {
      if (s === "zypper")
        return d(["zypper", "--non-interactive", "--no-refresh", "install", "--allow-unsigned-rpm", "-f", i]);
      if (s === "dnf")
        return d(["dnf", "install", "--nogpgcheck", "-y", i]);
      if (s === "yum")
        return d(["yum", "install", "--nogpgcheck", "-y", i]);
      if (s === "rpm")
        return a.warn("Installing with rpm only (no dependency resolution)."), d(["rpm", "-Uvh", "--replacepkgs", "--replacefiles", "--nodeps", i]);
      throw new Error(`Package manager ${s} not supported`);
    }
  };
  return Cr.RpmUpdater = n, Cr;
}
var Nr = {}, yc;
function wc() {
  if (yc) return Nr;
  yc = 1, Object.defineProperty(Nr, "__esModule", { value: !0 }), Nr.MacUpdater = void 0;
  const e = Ge(), t = /* @__PURE__ */ Pt(), r = St, n = Le, o = Mo, s = Zo(), i = ot(), d = dn, a = tt;
  let h = class extends s.AppUpdater {
    constructor(l, f) {
      super(l, f), this.nativeUpdater = Ht.autoUpdater, this.squirrelDownloadedUpdate = !1, this.nativeUpdater.on("error", (p) => {
        this._logger.warn(p), this.emit("error", p);
      }), this.nativeUpdater.on("update-downloaded", () => {
        this.squirrelDownloadedUpdate = !0, this.debug("nativeUpdater.update-downloaded");
      });
    }
    debug(l) {
      this._logger.debug != null && this._logger.debug(l);
    }
    closeServerIfExists() {
      this.server && (this.debug("Closing proxy server"), this.server.close((l) => {
        l && this.debug("proxy server wasn't already open, probably attempted closing again as a safety check before quit");
      }));
    }
    async doDownloadUpdate(l) {
      let f = l.updateInfoAndProvider.provider.resolveFiles(l.updateInfoAndProvider.info);
      const p = this._logger, g = "sysctl.proc_translated";
      let y = !1;
      try {
        this.debug("Checking for macOS Rosetta environment"), y = (0, d.execFileSync)("sysctl", [g], { encoding: "utf8" }).includes(`${g}: 1`), p.info(`Checked for macOS Rosetta environment (isRosetta=${y})`);
      } catch (R) {
        p.warn(`sysctl shell command to check for macOS Rosetta environment failed: ${R}`);
      }
      let m = !1;
      try {
        this.debug("Checking for arm64 in uname");
        const b = (0, d.execFileSync)("uname", ["-a"], { encoding: "utf8" }).includes("ARM");
        p.info(`Checked 'uname -a': arm64=${b}`), m = m || b;
      } catch (R) {
        p.warn(`uname shell command to check for arm64 failed: ${R}`);
      }
      m = m || process.arch === "arm64" || y;
      const _ = (R) => {
        var b;
        return R.url.pathname.includes("arm64") || ((b = R.info.url) === null || b === void 0 ? void 0 : b.includes("arm64"));
      };
      m && f.some(_) ? f = f.filter((R) => m === _(R)) : f = f.filter((R) => !_(R));
      const I = (0, i.findFile)(f, "zip", ["pkg", "dmg"]);
      if (I == null)
        throw (0, e.newError)(`ZIP file not provided: ${(0, e.safeStringifyJson)(f)}`, "ERR_UPDATER_ZIP_FILE_NOT_FOUND");
      const N = l.updateInfoAndProvider.provider, O = "update.zip";
      return this.executeDownload({
        fileExtension: "zip",
        fileInfo: I,
        downloadUpdateOptions: l,
        task: async (R, b) => {
          const A = n.join(this.downloadedUpdateHelper.cacheDir, O), w = () => (0, t.pathExistsSync)(A) ? !l.disableDifferentialDownload : (p.info("Unable to locate previous update.zip for differential download (is this first install?), falling back to full download"), !1);
          let C = !0;
          w() && (C = await this.differentialDownloadInstaller(I, l, R, N, O)), C && await this.httpExecutor.download(I.url, R, b);
        },
        done: async (R) => {
          if (!l.disableDifferentialDownload)
            try {
              const b = n.join(this.downloadedUpdateHelper.cacheDir, O);
              await (0, t.copyFile)(R.downloadedFile, b);
            } catch (b) {
              this._logger.warn(`Unable to copy file for caching for future differential downloads: ${b.message}`);
            }
          return this.updateDownloaded(I, R);
        }
      });
    }
    async updateDownloaded(l, f) {
      var p;
      const g = f.downloadedFile, y = (p = l.info.size) !== null && p !== void 0 ? p : (await (0, t.stat)(g)).size, m = this._logger, _ = `fileToProxy=${l.url.href}`;
      this.closeServerIfExists(), this.debug(`Creating proxy server for native Squirrel.Mac (${_})`), this.server = (0, o.createServer)(), this.debug(`Proxy server for native Squirrel.Mac is created (${_})`), this.server.on("close", () => {
        m.info(`Proxy server for native Squirrel.Mac is closed (${_})`);
      });
      const I = (N) => {
        const O = N.address();
        return typeof O == "string" ? O : `http://127.0.0.1:${O?.port}`;
      };
      return await new Promise((N, O) => {
        const R = (0, a.randomBytes)(64).toString("base64").replace(/\//g, "_").replace(/\+/g, "-"), b = Buffer.from(`autoupdater:${R}`, "ascii"), A = `/${(0, a.randomBytes)(64).toString("hex")}.zip`;
        this.server.on("request", (w, C) => {
          const T = w.url;
          if (m.info(`${T} requested`), T === "/") {
            if (!w.headers.authorization || w.headers.authorization.indexOf("Basic ") === -1) {
              C.statusCode = 401, C.statusMessage = "Invalid Authentication Credentials", C.end(), m.warn("No authenthication info");
              return;
            }
            const $ = w.headers.authorization.split(" ")[1], F = Buffer.from($, "base64").toString("ascii"), [x, j] = F.split(":");
            if (x !== "autoupdater" || j !== R) {
              C.statusCode = 401, C.statusMessage = "Invalid Authentication Credentials", C.end(), m.warn("Invalid authenthication credentials");
              return;
            }
            const k = Buffer.from(`{ "url": "${I(this.server)}${A}" }`);
            C.writeHead(200, { "Content-Type": "application/json", "Content-Length": k.length }), C.end(k);
            return;
          }
          if (!T.startsWith(A)) {
            m.warn(`${T} requested, but not supported`), C.writeHead(404), C.end();
            return;
          }
          m.info(`${A} requested by Squirrel.Mac, pipe ${g}`);
          let U = !1;
          C.on("finish", () => {
            U || (this.nativeUpdater.removeListener("error", O), N([]));
          });
          const L = (0, r.createReadStream)(g);
          L.on("error", ($) => {
            try {
              C.end();
            } catch (F) {
              m.warn(`cannot end response: ${F}`);
            }
            U = !0, this.nativeUpdater.removeListener("error", O), O(new Error(`Cannot pipe "${g}": ${$}`));
          }), C.writeHead(200, {
            "Content-Type": "application/zip",
            "Content-Length": y
          }), L.pipe(C);
        }), this.debug(`Proxy server for native Squirrel.Mac is starting to listen (${_})`), this.server.listen(0, "127.0.0.1", () => {
          this.debug(`Proxy server for native Squirrel.Mac is listening (address=${I(this.server)}, ${_})`), this.nativeUpdater.setFeedURL({
            url: I(this.server),
            headers: {
              "Cache-Control": "no-cache",
              Authorization: `Basic ${b.toString("base64")}`
            }
          }), this.dispatchUpdateDownloaded(f), this.autoInstallOnAppQuit ? (this.nativeUpdater.once("error", O), this.nativeUpdater.checkForUpdates()) : N([]);
        });
      });
    }
    handleUpdateDownloaded() {
      this.autoRunAppAfterInstall ? this.nativeUpdater.quitAndInstall() : this.app.quit(), this.closeServerIfExists();
    }
    quitAndInstall() {
      this.squirrelDownloadedUpdate ? this.handleUpdateDownloaded() : (this.nativeUpdater.on("update-downloaded", () => this.handleUpdateDownloaded()), this.autoInstallOnAppQuit || this.nativeUpdater.checkForUpdates());
    }
  };
  return Nr.MacUpdater = h, Nr;
}
var Dr = {}, sn = {}, vc;
function dh() {
  if (vc) return sn;
  vc = 1, Object.defineProperty(sn, "__esModule", { value: !0 }), sn.verifySignature = s;
  const e = Ge(), t = dn, r = kr, n = Le;
  function o(h, c) {
    return ['set "PSModulePath=" & chcp 65001 >NUL & powershell.exe', ["-NoProfile", "-NonInteractive", "-InputFormat", "None", "-Command", h], {
      shell: !0,
      timeout: c
    }];
  }
  function s(h, c, l) {
    return new Promise((f, p) => {
      const g = c.replace(/'/g, "''");
      l.info(`Verifying signature ${g}`), (0, t.execFile)(...o(`"Get-AuthenticodeSignature -LiteralPath '${g}' | ConvertTo-Json -Compress"`, 20 * 1e3), (y, m, _) => {
        var I;
        try {
          if (y != null || _) {
            d(l, y, _, p), f(null);
            return;
          }
          const N = i(m);
          if (N.Status === 0) {
            try {
              const A = n.normalize(N.Path), w = n.normalize(c);
              if (l.info(`LiteralPath: ${A}. Update Path: ${w}`), A !== w) {
                d(l, new Error(`LiteralPath of ${A} is different than ${w}`), _, p), f(null);
                return;
              }
            } catch (A) {
              l.warn(`Unable to verify LiteralPath of update asset due to missing data.Path. Skipping this step of validation. Message: ${(I = A.message) !== null && I !== void 0 ? I : A.stack}`);
            }
            const R = (0, e.parseDn)(N.SignerCertificate.Subject);
            let b = !1;
            for (const A of h) {
              const w = (0, e.parseDn)(A);
              if (w.size ? b = Array.from(w.keys()).every((T) => w.get(T) === R.get(T)) : A === R.get("CN") && (l.warn(`Signature validated using only CN ${A}. Please add your full Distinguished Name (DN) to publisherNames configuration`), b = !0), b) {
                f(null);
                return;
              }
            }
          }
          const O = `publisherNames: ${h.join(" | ")}, raw info: ` + JSON.stringify(N, (R, b) => R === "RawData" ? void 0 : b, 2);
          l.warn(`Sign verification failed, installer signed with incorrect certificate: ${O}`), f(O);
        } catch (N) {
          d(l, N, null, p), f(null);
          return;
        }
      });
    });
  }
  function i(h) {
    const c = JSON.parse(h);
    delete c.PrivateKey, delete c.IsOSBinary, delete c.SignatureType;
    const l = c.SignerCertificate;
    return l != null && (delete l.Archived, delete l.Extensions, delete l.Handle, delete l.HasPrivateKey, delete l.SubjectName), c;
  }
  function d(h, c, l, f) {
    if (a()) {
      h.warn(`Cannot execute Get-AuthenticodeSignature: ${c || l}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
      return;
    }
    try {
      (0, t.execFileSync)(...o("ConvertTo-Json test", 10 * 1e3));
    } catch (p) {
      h.warn(`Cannot execute ConvertTo-Json: ${p.message}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
      return;
    }
    c != null && f(c), l && f(new Error(`Cannot execute Get-AuthenticodeSignature, stderr: ${l}. Failing signature validation due to unknown stderr.`));
  }
  function a() {
    const h = r.release();
    return h.startsWith("6.") && !h.startsWith("6.3");
  }
  return sn;
}
var Tc;
function _c() {
  if (Tc) return Dr;
  Tc = 1, Object.defineProperty(Dr, "__esModule", { value: !0 }), Dr.NsisUpdater = void 0;
  const e = Ge(), t = Le, r = wn(), n = du(), o = Wt(), s = ot(), i = /* @__PURE__ */ Pt(), d = dh(), a = Ot;
  let h = class extends r.BaseUpdater {
    constructor(l, f) {
      super(l, f), this._verifyUpdateCodeSignature = (p, g) => (0, d.verifySignature)(p, g, this._logger);
    }
    /**
     * The verifyUpdateCodeSignature. You can pass [win-verify-signature](https://github.com/beyondkmp/win-verify-trust) or another custom verify function: ` (publisherName: string[], path: string) => Promise<string | null>`.
     * The default verify function uses [windowsExecutableCodeSignatureVerifier](https://github.com/electron-userland/electron-builder/blob/master/packages/electron-updater/src/windowsExecutableCodeSignatureVerifier.ts)
     */
    get verifyUpdateCodeSignature() {
      return this._verifyUpdateCodeSignature;
    }
    set verifyUpdateCodeSignature(l) {
      l && (this._verifyUpdateCodeSignature = l);
    }
    /*** @private */
    doDownloadUpdate(l) {
      const f = l.updateInfoAndProvider.provider, p = (0, s.findFile)(f.resolveFiles(l.updateInfoAndProvider.info), "exe");
      return this.executeDownload({
        fileExtension: "exe",
        downloadUpdateOptions: l,
        fileInfo: p,
        task: async (g, y, m, _) => {
          const I = p.packageInfo, N = I != null && m != null;
          if (N && l.disableWebInstaller)
            throw (0, e.newError)(`Unable to download new version ${l.updateInfoAndProvider.info.version}. Web Installers are disabled`, "ERR_UPDATER_WEB_INSTALLER_DISABLED");
          !N && !l.disableWebInstaller && this._logger.warn("disableWebInstaller is set to false, you should set it to true if you do not plan on using a web installer. This will default to true in a future version."), (N || l.disableDifferentialDownload || await this.differentialDownloadInstaller(p, l, g, f, e.CURRENT_APP_INSTALLER_FILE_NAME)) && await this.httpExecutor.download(p.url, g, y);
          const O = await this.verifySignature(g);
          if (O != null)
            throw await _(), (0, e.newError)(`New version ${l.updateInfoAndProvider.info.version} is not signed by the application owner: ${O}`, "ERR_UPDATER_INVALID_SIGNATURE");
          if (N && await this.differentialDownloadWebPackage(l, I, m, f))
            try {
              await this.httpExecutor.download(new a.URL(I.path), m, {
                headers: l.requestHeaders,
                cancellationToken: l.cancellationToken,
                sha512: I.sha512
              });
            } catch (R) {
              try {
                await (0, i.unlink)(m);
              } catch {
              }
              throw R;
            }
        }
      });
    }
    // $certificateInfo = (Get-AuthenticodeSignature 'xxx\yyy.exe'
    // | where {$_.Status.Equals([System.Management.Automation.SignatureStatus]::Valid) -and $_.SignerCertificate.Subject.Contains("CN=siemens.com")})
    // | Out-String ; if ($certificateInfo) { exit 0 } else { exit 1 }
    async verifySignature(l) {
      let f;
      try {
        if (f = (await this.configOnDisk.value).publisherName, f == null)
          return null;
      } catch (p) {
        if (p.code === "ENOENT")
          return null;
        throw p;
      }
      return await this._verifyUpdateCodeSignature(Array.isArray(f) ? f : [f], l);
    }
    doInstall(l) {
      const f = this.installerPath;
      if (f == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      const p = ["--updated"];
      l.isSilent && p.push("/S"), l.isForceRunAfter && p.push("--force-run"), this.installDirectory && p.push(`/D=${this.installDirectory}`);
      const g = this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.packageFile;
      g != null && p.push(`--package-file=${g}`);
      const y = () => {
        this.spawnLog(t.join(process.resourcesPath, "elevate.exe"), [f].concat(p)).catch((m) => this.dispatchError(m));
      };
      return l.isAdminRightsRequired ? (this._logger.info("isAdminRightsRequired is set to true, run installer using elevate.exe"), y(), !0) : (this.spawnLog(f, p).catch((m) => {
        const _ = m.code;
        this._logger.info(`Cannot run installer: error code: ${_}, error message: "${m.message}", will be executed again using elevate if EACCES, and will try to use electron.shell.openItem if ENOENT`), _ === "UNKNOWN" || _ === "EACCES" ? y() : _ === "ENOENT" ? Ht.shell.openPath(f).catch((I) => this.dispatchError(I)) : this.dispatchError(m);
      }), !0);
    }
    async differentialDownloadWebPackage(l, f, p, g) {
      if (f.blockMapSize == null)
        return !0;
      try {
        const y = {
          newUrl: new a.URL(f.path),
          oldFile: t.join(this.downloadedUpdateHelper.cacheDir, e.CURRENT_APP_PACKAGE_FILE_NAME),
          logger: this._logger,
          newFile: p,
          requestHeaders: this.requestHeaders,
          isUseMultipleRangeRequest: g.isUseMultipleRangeRequest,
          cancellationToken: l.cancellationToken
        };
        this.listenerCount(o.DOWNLOAD_PROGRESS) > 0 && (y.onProgress = (m) => this.emit(o.DOWNLOAD_PROGRESS, m)), await new n.FileWithEmbeddedBlockMapDifferentialDownloader(f, this.httpExecutor, y).download();
      } catch (y) {
        return this._logger.error(`Cannot download differentially, fallback to full download: ${y.stack || y}`), process.platform === "win32";
      }
      return !1;
    }
  };
  return Dr.NsisUpdater = h, Dr;
}
var Ic;
function fh() {
  return Ic || (Ic = 1, (function(e) {
    var t = $t && $t.__createBinding || (Object.create ? (function(m, _, I, N) {
      N === void 0 && (N = I);
      var O = Object.getOwnPropertyDescriptor(_, I);
      (!O || ("get" in O ? !_.__esModule : O.writable || O.configurable)) && (O = { enumerable: !0, get: function() {
        return _[I];
      } }), Object.defineProperty(m, N, O);
    }) : (function(m, _, I, N) {
      N === void 0 && (N = I), m[N] = _[I];
    })), r = $t && $t.__exportStar || function(m, _) {
      for (var I in m) I !== "default" && !Object.prototype.hasOwnProperty.call(_, I) && t(_, m, I);
    };
    Object.defineProperty(e, "__esModule", { value: !0 }), e.NsisUpdater = e.MacUpdater = e.RpmUpdater = e.PacmanUpdater = e.DebUpdater = e.AppImageUpdater = e.Provider = e.NoOpLogger = e.AppUpdater = e.BaseUpdater = void 0;
    const n = /* @__PURE__ */ Pt(), o = Le;
    var s = wn();
    Object.defineProperty(e, "BaseUpdater", { enumerable: !0, get: function() {
      return s.BaseUpdater;
    } });
    var i = Zo();
    Object.defineProperty(e, "AppUpdater", { enumerable: !0, get: function() {
      return i.AppUpdater;
    } }), Object.defineProperty(e, "NoOpLogger", { enumerable: !0, get: function() {
      return i.NoOpLogger;
    } });
    var d = ot();
    Object.defineProperty(e, "Provider", { enumerable: !0, get: function() {
      return d.Provider;
    } });
    var a = uc();
    Object.defineProperty(e, "AppImageUpdater", { enumerable: !0, get: function() {
      return a.AppImageUpdater;
    } });
    var h = hc();
    Object.defineProperty(e, "DebUpdater", { enumerable: !0, get: function() {
      return h.DebUpdater;
    } });
    var c = mc();
    Object.defineProperty(e, "PacmanUpdater", { enumerable: !0, get: function() {
      return c.PacmanUpdater;
    } });
    var l = Ec();
    Object.defineProperty(e, "RpmUpdater", { enumerable: !0, get: function() {
      return l.RpmUpdater;
    } });
    var f = wc();
    Object.defineProperty(e, "MacUpdater", { enumerable: !0, get: function() {
      return f.MacUpdater;
    } });
    var p = _c();
    Object.defineProperty(e, "NsisUpdater", { enumerable: !0, get: function() {
      return p.NsisUpdater;
    } }), r(Wt(), e);
    let g;
    function y() {
      if (process.platform === "win32")
        g = new (_c()).NsisUpdater();
      else if (process.platform === "darwin")
        g = new (wc()).MacUpdater();
      else {
        g = new (uc()).AppImageUpdater();
        try {
          const m = o.join(process.resourcesPath, "package-type");
          if (!(0, n.existsSync)(m))
            return g;
          switch ((0, n.readFileSync)(m).toString().trim()) {
            case "deb":
              g = new (hc()).DebUpdater();
              break;
            case "rpm":
              g = new (Ec()).RpmUpdater();
              break;
            case "pacman":
              g = new (mc()).PacmanUpdater();
              break;
            default:
              break;
          }
        } catch (m) {
          console.warn("Unable to detect 'package-type' for autoUpdater (rpm/deb/pacman support). If you'd like to expand support, please consider contributing to electron-builder", m.message);
        }
      }
      return g;
    }
    Object.defineProperty(e, "autoUpdater", {
      enumerable: !0,
      get: () => g || y()
    });
  })($t)), $t;
}
var mt = fh(), gt = { exports: {} };
const hh = "16.6.1", ph = {
  version: hh
};
var Sc;
function mh() {
  if (Sc) return gt.exports;
  Sc = 1;
  const e = St, t = Le, r = kr, n = tt, s = ph.version, i = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
  function d(b) {
    const A = {};
    let w = b.toString();
    w = w.replace(/\r\n?/mg, `
`);
    let C;
    for (; (C = i.exec(w)) != null; ) {
      const T = C[1];
      let U = C[2] || "";
      U = U.trim();
      const L = U[0];
      U = U.replace(/^(['"`])([\s\S]*)\1$/mg, "$2"), L === '"' && (U = U.replace(/\\n/g, `
`), U = U.replace(/\\r/g, "\r")), A[T] = U;
    }
    return A;
  }
  function a(b) {
    b = b || {};
    const A = g(b);
    b.path = A;
    const w = R.configDotenv(b);
    if (!w.parsed) {
      const L = new Error(`MISSING_DATA: Cannot parse ${A} for an unknown reason`);
      throw L.code = "MISSING_DATA", L;
    }
    const C = f(b).split(","), T = C.length;
    let U;
    for (let L = 0; L < T; L++)
      try {
        const $ = C[L].trim(), F = p(w, $);
        U = R.decrypt(F.ciphertext, F.key);
        break;
      } catch ($) {
        if (L + 1 >= T)
          throw $;
      }
    return R.parse(U);
  }
  function h(b) {
    console.log(`[dotenv@${s}][WARN] ${b}`);
  }
  function c(b) {
    console.log(`[dotenv@${s}][DEBUG] ${b}`);
  }
  function l(b) {
    console.log(`[dotenv@${s}] ${b}`);
  }
  function f(b) {
    return b && b.DOTENV_KEY && b.DOTENV_KEY.length > 0 ? b.DOTENV_KEY : process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0 ? process.env.DOTENV_KEY : "";
  }
  function p(b, A) {
    let w;
    try {
      w = new URL(A);
    } catch ($) {
      if ($.code === "ERR_INVALID_URL") {
        const F = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
        throw F.code = "INVALID_DOTENV_KEY", F;
      }
      throw $;
    }
    const C = w.password;
    if (!C) {
      const $ = new Error("INVALID_DOTENV_KEY: Missing key part");
      throw $.code = "INVALID_DOTENV_KEY", $;
    }
    const T = w.searchParams.get("environment");
    if (!T) {
      const $ = new Error("INVALID_DOTENV_KEY: Missing environment part");
      throw $.code = "INVALID_DOTENV_KEY", $;
    }
    const U = `DOTENV_VAULT_${T.toUpperCase()}`, L = b.parsed[U];
    if (!L) {
      const $ = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${U} in your .env.vault file.`);
      throw $.code = "NOT_FOUND_DOTENV_ENVIRONMENT", $;
    }
    return { ciphertext: L, key: C };
  }
  function g(b) {
    let A = null;
    if (b && b.path && b.path.length > 0)
      if (Array.isArray(b.path))
        for (const w of b.path)
          e.existsSync(w) && (A = w.endsWith(".vault") ? w : `${w}.vault`);
      else
        A = b.path.endsWith(".vault") ? b.path : `${b.path}.vault`;
    else
      A = t.resolve(process.cwd(), ".env.vault");
    return e.existsSync(A) ? A : null;
  }
  function y(b) {
    return b[0] === "~" ? t.join(r.homedir(), b.slice(1)) : b;
  }
  function m(b) {
    const A = !!(b && b.debug), w = b && "quiet" in b ? b.quiet : !0;
    (A || !w) && l("Loading env from encrypted .env.vault");
    const C = R._parseVault(b);
    let T = process.env;
    return b && b.processEnv != null && (T = b.processEnv), R.populate(T, C, b), { parsed: C };
  }
  function _(b) {
    const A = t.resolve(process.cwd(), ".env");
    let w = "utf8";
    const C = !!(b && b.debug), T = b && "quiet" in b ? b.quiet : !0;
    b && b.encoding ? w = b.encoding : C && c("No encoding is specified. UTF-8 is used by default");
    let U = [A];
    if (b && b.path)
      if (!Array.isArray(b.path))
        U = [y(b.path)];
      else {
        U = [];
        for (const x of b.path)
          U.push(y(x));
      }
    let L;
    const $ = {};
    for (const x of U)
      try {
        const j = R.parse(e.readFileSync(x, { encoding: w }));
        R.populate($, j, b);
      } catch (j) {
        C && c(`Failed to load ${x} ${j.message}`), L = j;
      }
    let F = process.env;
    if (b && b.processEnv != null && (F = b.processEnv), R.populate(F, $, b), C || !T) {
      const x = Object.keys($).length, j = [];
      for (const k of U)
        try {
          const G = t.relative(process.cwd(), k);
          j.push(G);
        } catch (G) {
          C && c(`Failed to load ${k} ${G.message}`), L = G;
        }
      l(`injecting env (${x}) from ${j.join(",")}`);
    }
    return L ? { parsed: $, error: L } : { parsed: $ };
  }
  function I(b) {
    if (f(b).length === 0)
      return R.configDotenv(b);
    const A = g(b);
    return A ? R._configVault(b) : (h(`You set DOTENV_KEY but you are missing a .env.vault file at ${A}. Did you forget to build it?`), R.configDotenv(b));
  }
  function N(b, A) {
    const w = Buffer.from(A.slice(-64), "hex");
    let C = Buffer.from(b, "base64");
    const T = C.subarray(0, 12), U = C.subarray(-16);
    C = C.subarray(12, -16);
    try {
      const L = n.createDecipheriv("aes-256-gcm", w, T);
      return L.setAuthTag(U), `${L.update(C)}${L.final()}`;
    } catch (L) {
      const $ = L instanceof RangeError, F = L.message === "Invalid key length", x = L.message === "Unsupported state or unable to authenticate data";
      if ($ || F) {
        const j = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
        throw j.code = "INVALID_DOTENV_KEY", j;
      } else if (x) {
        const j = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
        throw j.code = "DECRYPTION_FAILED", j;
      } else
        throw L;
    }
  }
  function O(b, A, w = {}) {
    const C = !!(w && w.debug), T = !!(w && w.override);
    if (typeof A != "object") {
      const U = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
      throw U.code = "OBJECT_REQUIRED", U;
    }
    for (const U of Object.keys(A))
      Object.prototype.hasOwnProperty.call(b, U) ? (T === !0 && (b[U] = A[U]), C && c(T === !0 ? `"${U}" is already defined and WAS overwritten` : `"${U}" is already defined and was NOT overwritten`)) : b[U] = A[U];
  }
  const R = {
    configDotenv: _,
    _configVault: m,
    _parseVault: a,
    config: I,
    decrypt: N,
    parse: d,
    populate: O
  };
  return gt.exports.configDotenv = R.configDotenv, gt.exports._configVault = R._configVault, gt.exports._parseVault = R._parseVault, gt.exports.config = R.config, gt.exports.decrypt = R.decrypt, gt.exports.parse = R.parse, gt.exports.populate = R.populate, gt.exports = R, gt.exports;
}
var gh = mh();
function Eh(e) {
  return typeof e == "boolean" ? e : !0;
}
function yh(e) {
  return {
    comment: e.trim() || " "
  };
}
function wh(e) {
  return /^(ms|google)-[A-Za-z0-9._-]+$/.test(e);
}
function vh(e) {
  const t = e.toUpperCase();
  if (t === "ARCHIVE")
    return {
      addLabelIds: [],
      removeLabelIds: ["INBOX"]
    };
  const r = [t], n = ["INBOX", "TRASH", "SPAM"].filter(
    (o) => o !== t
  );
  return {
    addLabelIds: r,
    removeLabelIds: n
  };
}
function Th(e) {
  const t = new URLSearchParams({
    client_id: e.clientId,
    grant_type: "authorization_code",
    code: e.code,
    redirect_uri: e.redirectUri,
    code_verifier: e.codeVerifier
  });
  return e.clientSecret?.trim() && t.set("client_secret", e.clientSecret.trim()), t;
}
function _h(e) {
  const t = new URLSearchParams({
    client_id: e.clientId,
    grant_type: "refresh_token",
    refresh_token: e.refreshToken
  });
  return e.clientSecret?.trim() && t.set("client_secret", e.clientSecret.trim()), t;
}
function Ih(e) {
  return {
    clientIdSuffix: e.clientId.slice(-32),
    redirectUri: e.redirectUri,
    usesPkce: !0
  };
}
function mu(e, t, r) {
  const n = t.toLowerCase();
  let o = "";
  try {
    o = JSON.parse(t).error_description?.trim() || "";
  } catch {
    o = "";
  }
  return n.includes("client_secret is missing") || o.toLowerCase().includes("client_secret is missing") ? [
    `Google token exchange failed (${e}): the bundled Google client ID is not valid for a desktop PKCE flow.`,
    "Replace it with a Google OAuth client of type Desktop app that is configured for this Electron app's loopback redirect URI.",
    r ? `Debug: clientIdSuffix=${r.clientIdSuffix}, redirectUri=${r.redirectUri}, usesPkce=${String(r.usesPkce)}.` : ""
  ].join(" ") : o ? [
    `Google token exchange failed (${e}): ${o}`,
    r ? `Debug: clientIdSuffix=${r.clientIdSuffix}, redirectUri=${r.redirectUri}, usesPkce=${String(r.usesPkce)}.` : ""
  ].join(" ") : [
    `Google token exchange failed (${e}): ${t}`,
    r ? `Debug: clientIdSuffix=${r.clientIdSuffix}, redirectUri=${r.redirectUri}, usesPkce=${String(r.usesPkce)}.` : ""
  ].join(" ");
}
function gu(e) {
  try {
    const t = JSON.parse(e || "[]");
    return Array.isArray(t) ? t : [];
  } catch {
    return [];
  }
}
function Sh({
  bodyContent: e,
  hasAttachments: t,
  attachmentsJson: r
}) {
  return e?.trim() ? t ? gu(r).length > 0 : !0 : !1;
}
const Ah = cn.default ?? cn, { app: Ve, BrowserWindow: ft, ipcMain: pe, shell: ta, safeStorage: ze, dialog: Rh } = Ah;
Ve.isPackaged || gh.config();
const bh = $d(import.meta.url), ln = lt.dirname(bh), Eu = lt.join(Ve.getPath("userData"), "emails.db"), oe = new Md(Eu);
oe.exec(`
  CREATE TABLE IF NOT EXISTS folders (
    id               TEXT,
    accountId        TEXT,
    displayName      TEXT,
    parentFolderId   TEXT,
    wellKnownName    TEXT,
    totalItemCount   INTEGER,
    unreadItemCount  INTEGER,
    depth            INTEGER DEFAULT 0,
    path             TEXT DEFAULT '',
    PRIMARY KEY (accountId, id)
  );

  CREATE INDEX IF NOT EXISTS idx_folders_account ON folders(accountId);

  CREATE TABLE IF NOT EXISTS emails (
    id               TEXT PRIMARY KEY,
    accountId        TEXT,
    folder           TEXT,
    subject          TEXT,
    bodyPreview      TEXT,
    bodyContentType  TEXT,
    bodyContent      TEXT,
    receivedDateTime TEXT,
    isRead           INTEGER,
    hasAttachments   INTEGER,
    fromName         TEXT,
    fromAddress      TEXT,
    toRecipients     TEXT,
    ccRecipients     TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_emails_account_folder ON emails(accountId, folder);

  CREATE TABLE IF NOT EXISTS labels (
  id          TEXT PRIMARY KEY,
  accountId   TEXT NOT NULL,
  name        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#C9A84C',
  createdAt   TEXT NOT NULL,
  updatedAt   TEXT NOT NULL,
  UNIQUE(accountId, name)
);

CREATE INDEX IF NOT EXISTS idx_labels_account ON labels(accountId);

CREATE TABLE IF NOT EXISTS email_labels (
  accountId  TEXT NOT NULL,
  messageId  TEXT NOT NULL,
  labelId    TEXT NOT NULL,
  createdAt  TEXT NOT NULL,
  PRIMARY KEY (accountId, messageId, labelId),
  FOREIGN KEY(labelId) REFERENCES labels(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_email_labels_account_message
ON email_labels(accountId, messageId);

CREATE INDEX IF NOT EXISTS idx_email_labels_account_label
ON email_labels(accountId, labelId);

CREATE TABLE IF NOT EXISTS folder_sync_state (
  accountId       TEXT NOT NULL,
  folderId        TEXT NOT NULL,
  deltaLink       TEXT,
  lastFullSyncAt  TEXT,
  lastDeltaSyncAt TEXT,
  PRIMARY KEY (accountId, folderId)
);

CREATE INDEX IF NOT EXISTS idx_folder_sync_state_account
ON folder_sync_state(accountId);
`);
function Br(e, t, r) {
  oe.prepare(`PRAGMA table_info(${e})`).all().some((s) => s.name === t) || oe.exec(`ALTER TABLE ${e} ADD COLUMN ${t} ${r}`);
}
Br("folders", "depth", "INTEGER DEFAULT 0");
Br("folders", "path", "TEXT DEFAULT ''");
Br("folders", "icon", "TEXT DEFAULT ''");
Br("emails", "isStarred", "INTEGER DEFAULT 0");
Br("emails", "attachments", "TEXT DEFAULT '[]'");
const Do = lt.join(Ve.getPath("userData"), "window-state.json"), Oo = lt.join(Ve.getPath("userData"), "ryze-settings.json"), Po = lt.join(
  Ve.getPath("userData"),
  "microsoft-oauth-tokens.json"
), Fo = lt.join(
  Ve.getPath("userData"),
  "google-oauth-tokens.json"
), xo = lt.join(
  Ve.getPath("userData"),
  "ai-provider-keys.json"
);
function It(e) {
  return new Promise((t) => setTimeout(t, e));
}
function vn(e, t) {
  const r = e.headers.get("retry-after"), n = r ? Number.parseInt(r, 10) : NaN;
  return Number.isFinite(n) ? Math.max(n, 1) * 1e3 : Math.min(3e4, t * 5e3);
}
const Et = /* @__PURE__ */ new Map(), yu = 120 * 1e3, wu = 60 * 1e3, Dt = 4, Ch = /* @__PURE__ */ new Set([
  "inbox",
  "sentitems",
  "drafts",
  "archive",
  "deleteditems"
]);
mt.autoUpdater.autoDownload = !1;
mt.autoUpdater.autoInstallOnAppQuit = !0;
mt.autoUpdater.logger = console;
pe.handle("app:get-version", () => Ve.getVersion());
pe.handle("updater:check", () => (Ve.isPackaged && mt.autoUpdater.checkForUpdates(), !0));
pe.handle("updater:start-download", () => (mt.autoUpdater.downloadUpdate(), !0));
pe.handle("updater:install", () => (mt.autoUpdater.quitAndInstall(!0, !0), !0));
mt.autoUpdater.on("update-available", (e) => {
  const t = ft.getAllWindows();
  t.length > 0 && t[0].webContents.send("updater:available", e.version);
});
mt.autoUpdater.on("update-downloaded", () => {
  const e = ft.getAllWindows();
  e.length > 0 && e[0].webContents.send("updater:downloaded");
});
mt.autoUpdater.on("update-not-available", () => {
  console.log("[updater] No update available — already on latest version.");
});
mt.autoUpdater.on("error", (e) => {
  console.error("[updater] Error:", e.message);
  const t = ft.getAllWindows();
  t.length > 0 && t[0].webContents.send("updater:error", e.message);
});
function vu(e) {
  const t = (e.displayName || "").toLowerCase().trim(), r = (e.wellKnownName || "").toLowerCase().trim(), n = /* @__PURE__ */ new Set([
    "outbox",
    "syncissues",
    "conflicts",
    "localfailures",
    "serverfailures"
  ]), o = /* @__PURE__ */ new Set([
    "sync issues",
    "conflicts",
    "local failures",
    "server failures",
    "outbox"
  ]);
  return n.has(r) || o.has(t);
}
function Ac(e) {
  const t = (e.displayName || "").toLowerCase().trim(), r = (e.wellKnownName || "").toLowerCase().trim();
  return r === "inbox" || t === "inbox" ? 0 : r === "sentitems" || t === "sent items" ? 1 : r === "drafts" || t === "drafts" ? 2 : r === "archive" || t === "archive" ? 3 : r === "deleteditems" || t === "deleted items" || t === "trash" ? 4 : vu(e) ? 999 : 10;
}
function Nh(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function ra(e) {
  return [...e].filter((t) => !vu(t)).sort((t, r) => {
    const n = Ac(t) - Ac(r);
    return n !== 0 ? n : (t.path || t.displayName || "").localeCompare(
      r.path || r.displayName || ""
    );
  });
}
function Dh(e, t) {
  return oe.prepare(
    `
      SELECT deltaLink
      FROM folder_sync_state
      WHERE accountId = ? AND folderId = ?
      LIMIT 1
    `
  ).get(e, t)?.deltaLink || "";
}
function Tu(e, t, r, n) {
  const o = (/* @__PURE__ */ new Date()).toISOString();
  oe.prepare(
    `
    INSERT INTO folder_sync_state (
      accountId,
      folderId,
      deltaLink,
      lastFullSyncAt,
      lastDeltaSyncAt
    )
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(accountId, folderId) DO UPDATE SET
      deltaLink = excluded.deltaLink,
      lastFullSyncAt = CASE
        WHEN ? = 'full' THEN excluded.lastFullSyncAt
        ELSE folder_sync_state.lastFullSyncAt
      END,
      lastDeltaSyncAt = CASE
        WHEN ? = 'delta' THEN excluded.lastDeltaSyncAt
        ELSE folder_sync_state.lastDeltaSyncAt
      END
  `
  ).run(
    e,
    t,
    r,
    n === "full" ? o : null,
    n === "delta" ? o : null,
    n,
    n
  );
}
function _u(e, t, r) {
  const n = r.from?.emailAddress?.name || r.sender?.emailAddress?.name || "", o = r.from?.emailAddress?.address || r.sender?.emailAddress?.address || "", s = r.flag ? r.flag.flagStatus === "flagged" ? 1 : 0 : null, i = r.isRead !== void 0 ? r.isRead ? 1 : 0 : null, d = r.hasAttachments !== void 0 ? r.hasAttachments ? 1 : 0 : null, a = r.body?.content || r.bodyContent || "", h = r.body?.contentType || r.bodyContentType || "";
  oe.prepare(
    `
    INSERT INTO emails (
      id,
      accountId,
      folder,
      subject,
      bodyPreview,
      bodyContentType,
      bodyContent,
      receivedDateTime,
      isRead,
      hasAttachments,
      isStarred,
      fromName,
      fromAddress,
      toRecipients,
      ccRecipients
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      accountId = excluded.accountId,
      folder = excluded.folder,

      subject = CASE
        WHEN excluded.subject <> '' THEN excluded.subject
        ELSE emails.subject
      END,

      bodyPreview = CASE
        WHEN excluded.bodyPreview <> '' THEN excluded.bodyPreview
        ELSE emails.bodyPreview
      END,

      bodyContentType = CASE
        WHEN excluded.bodyContentType <> '' THEN excluded.bodyContentType
        ELSE emails.bodyContentType
      END,

      bodyContent = CASE
        WHEN excluded.bodyContent <> '' THEN excluded.bodyContent
        ELSE emails.bodyContent
      END,

      receivedDateTime = CASE
        WHEN excluded.receivedDateTime <> '' THEN excluded.receivedDateTime
        ELSE emails.receivedDateTime
      END,

      isRead = CASE
        WHEN excluded.isRead IS NOT NULL THEN excluded.isRead
        ELSE emails.isRead
      END,

      hasAttachments = CASE
        WHEN excluded.hasAttachments IS NOT NULL THEN excluded.hasAttachments
        ELSE emails.hasAttachments
      END,

      isStarred = CASE
        WHEN excluded.isStarred IS NOT NULL THEN excluded.isStarred
        ELSE emails.isStarred
      END,

      fromName = CASE
        WHEN excluded.fromName <> '' THEN excluded.fromName
        ELSE emails.fromName
      END,

      fromAddress = CASE
        WHEN excluded.fromAddress <> '' THEN excluded.fromAddress
        ELSE emails.fromAddress
      END,

      toRecipients = CASE
        WHEN excluded.toRecipients <> '[]' THEN excluded.toRecipients
        ELSE emails.toRecipients
      END,

      ccRecipients = CASE
        WHEN excluded.ccRecipients <> '[]' THEN excluded.ccRecipients
        ELSE emails.ccRecipients
      END
  `
  ).run(
    r.id,
    e,
    t,
    r.subject || "",
    r.bodyPreview || "",
    h,
    a,
    r.receivedDateTime || "",
    i,
    d,
    s,
    n,
    o,
    JSON.stringify(r.toRecipients || []),
    JSON.stringify(r.ccRecipients || [])
  );
}
function Iu(e, t) {
  oe.transaction(() => {
    oe.prepare(
      `
      DELETE FROM email_labels
      WHERE accountId = ? AND messageId = ?
    `
    ).run(e, t), oe.prepare(
      `
      DELETE FROM emails
      WHERE accountId = ? AND id = ?
    `
    ).run(e, t);
  })();
}
function Tn(e, t) {
  oe.prepare(
    `
    DELETE FROM folder_sync_state
    WHERE accountId = ? AND folderId = ?
  `
  ).run(e, t);
}
function Oh(e) {
  return oe.prepare(
    `
      SELECT id
      FROM folders
      WHERE accountId = ?
        AND (
          wellKnownName = 'inbox'
          OR LOWER(displayName) = 'inbox'
          OR LOWER(id) = 'inbox'
        )
      LIMIT 1
    `
  ).get(e)?.id || "inbox";
}
function Be(e, t, r = 4096) {
  if (typeof e != "string")
    throw new Error(`${t} must be a string`);
  const n = e.trim();
  if (!n)
    throw new Error(`${t} is required`);
  if (n.length > r)
    throw new Error(`${t} is too long`);
  return n;
}
function Ph() {
  const t = In().gemini?.apiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
  if (!t)
    throw new Error(
      "Gemini API key is missing. Add it in Settings > AI & keys."
    );
  return t;
}
function Fh() {
  return (na().geminiModel || process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash").replace(/^models\//, "");
}
function xh() {
  return na().aiProvider === "ollama" ? "ollama" : "gemini";
}
function Lh() {
  const e = na(), t = (e.ollamaBaseUrl || "http://127.0.0.1:11434").trim(), r = (e.ollamaModel || "llama3.2").trim();
  if (!r)
    throw new Error("Ollama model is missing. Add it in Settings > AI & keys.");
  let n;
  try {
    n = new URL(t);
  } catch {
    throw new Error("Ollama server URL is invalid.");
  }
  const o = n.hostname === "localhost" || n.hostname === "127.0.0.1" || n.hostname === "::1";
  if (n.protocol !== "http:" || !o)
    throw new Error("Ollama server URL must be a local http URL.");
  return {
    baseUrl: n.origin,
    model: r
  };
}
function na() {
  try {
    if (!He.existsSync(Oo))
      return {};
    const e = JSON.parse(He.readFileSync(Oo, "utf8"));
    return typeof e == "object" && e ? e : {};
  } catch (e) {
    return console.error("Failed to load backend settings:", e), {};
  }
}
function Uh() {
  return process.env.GEMINI_API_VERSION?.trim() || "v1";
}
function ia(e) {
  return e.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<iframe[\s\S]*?<\/iframe>/gi, "").replace(/<object[\s\S]*?<\/object>/gi, "").replace(/<embed[\s\S]*?>/gi, "").replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "").replace(/(href|src|action)\s*=\s*["']?\s*(?:javascript|vbscript)\s*:[^"'>]*/gi, "");
}
function kh(e) {
  return e.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/\s+/g, " ").trim();
}
function Rc(e, t = 12e3) {
  return e.length <= t ? e : `${e.slice(0, t)}

[Email content truncated for privacy and performance.]`;
}
function $h(e) {
  const t = e.trim(), n = t.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1] || t, o = n.indexOf("{"), s = n.lastIndexOf("}");
  return o === -1 || s === -1 || s <= o ? null : n.slice(o, s + 1);
}
function bc(e) {
  const t = $h(e);
  if (t)
    try {
      const r = JSON.parse(t), n = typeof r.summary == "string" ? r.summary.trim() : "", o = Array.isArray(r.keyPoints) ? r.keyPoints.filter((i) => typeof i == "string").map((i) => i.trim()).filter(Boolean).slice(0, 5) : [], s = Array.isArray(r.suggestedActions) ? r.suggestedActions.filter((i) => typeof i == "string").map((i) => i.trim()).filter(Boolean).slice(0, 3) : [];
      if (n || o.length > 0 || s.length > 0)
        return {
          summary: n,
          keyPoints: o,
          suggestedActions: s
        };
    } catch {
    }
  return {
    summary: e.trim(),
    keyPoints: [],
    suggestedActions: []
  };
}
function Mh(e) {
  return {
    subject: xe(e?.subject, "subject", 512),
    senderName: xe(e?.senderName, "senderName", 256),
    senderEmail: xe(e?.senderEmail, "senderEmail", 512),
    body: xe(e?.body, "body", 5e5),
    preview: xe(e?.preview, "preview", 5e3)
  };
}
function qh(e) {
  const t = e && typeof e == "object" ? e : {}, r = xe(t.aiProvider, "aiProvider", 32).trim(), n = xe(t.geminiModel, "geminiModel", 64).trim(), o = xe(t.ollamaBaseUrl, "ollamaBaseUrl", 512).trim(), s = xe(t.ollamaModel, "ollamaModel", 128).trim();
  return {
    aiProvider: r === "ollama" ? "ollama" : "gemini",
    geminiModel: n || "gemini-2.5-flash",
    ollamaBaseUrl: o || "http://127.0.0.1:11434",
    ollamaModel: s || "llama3.2"
  };
}
function Bh(e) {
  if (!Array.isArray(e))
    throw new Error("drafts must be an array");
  return e.slice(0, 20).map((t, r) => {
    const n = t && typeof t == "object" ? t : {};
    return {
      id: xe(n.id, `drafts[${r}].id`, 128).trim() || `draft-${tt.randomUUID()}`,
      to: xe(n.to, `drafts[${r}].to`, 4096),
      cc: xe(n.cc, `drafts[${r}].cc`, 4096),
      subject: xe(n.subject, `drafts[${r}].subject`, 512),
      body: ia(
        xe(n.body, `drafts[${r}].body`, 5e5)
      ),
      isMinimized: !!n.isMinimized,
      isFullscreen: !!n.isFullscreen,
      aiTone: xe(n.aiTone, `drafts[${r}].aiTone`, 32) || void 0,
      aiHint: xe(n.aiHint, `drafts[${r}].aiHint`, 2048) || void 0
    };
  });
}
function xe(e, t, r = 4096) {
  if (e == null)
    return "";
  if (typeof e != "string")
    throw new Error(`${t} must be a string`);
  if (e.length > r)
    throw new Error(`${t} is too long`);
  return e;
}
function Ae(e) {
  const t = Be(e, "accountId", 256);
  if (!wh(t))
    throw new Error("Invalid accountId");
  return t;
}
function wt(e) {
  return Be(e, "messageId", 2048);
}
function _n(e) {
  const t = Be(e, "labelId", 128);
  if (!/^label-[A-Za-z0-9._-]+$/.test(t))
    throw new Error("Invalid labelId");
  return t;
}
function Su(e) {
  const t = Be(e, "name", 64).replace(/\s+/g, " ").trim();
  if (t.length < 2)
    throw new Error("Label name must be at least 2 characters");
  return t;
}
function Au(e) {
  const t = Be(e, "folderName", 64).replace(/\s+/g, " ").trim();
  if (t.length < 2)
    throw new Error("Folder name must be at least 2 characters");
  if ((/* @__PURE__ */ new Set([
    "inbox",
    "sent",
    "sent items",
    "drafts",
    "archive",
    "deleted items",
    "trash",
    "junk",
    "junk email",
    "outbox"
  ])).has(t.toLowerCase()))
    throw new Error("That folder name is reserved by the mail provider.");
  if (/[\\/:*?"<>|]/.test(t))
    throw new Error("Folder name contains invalid characters.");
  return t;
}
function Hh(e) {
  const t = xe(e, "color", 16).trim() || "#C9A84C";
  if (!/^#[0-9A-Fa-f]{6}$/.test(t))
    throw new Error("Invalid label color");
  return t;
}
function or(e) {
  return Be(e, "folderId", 2048);
}
const jh = /* @__PURE__ */ new Set([
  "folder",
  "briefcase",
  "users",
  "star",
  "heart",
  "home",
  "receipt",
  "shopping",
  "travel",
  "code",
  "bank",
  "alert",
  "archive",
  "tag"
]);
function Gh(e) {
  const t = xe(e, "icon", 64).trim();
  if (!t)
    return "folder";
  if (!jh.has(t))
    throw new Error("Invalid folder icon");
  return t;
}
function Wh(e) {
  const t = Be(
    e,
    "destinationFolder",
    64
  ).toLowerCase();
  if (!Ch.has(t))
    throw new Error("Invalid destination folder");
  return t;
}
function Vh(e, t) {
  const r = oe.prepare(
    `
      SELECT id, parentFolderId
      FROM folders
      WHERE accountId = ?
    `
  ).all(e), n = /* @__PURE__ */ new Map();
  for (const i of r) {
    const d = i.parentFolderId || "";
    if (!d) continue;
    const a = n.get(d) || [];
    a.push(i.id), n.set(d, a);
  }
  const o = /* @__PURE__ */ new Set(), s = (i) => {
    if (!o.has(i)) {
      o.add(i);
      for (const d of n.get(i) || [])
        s(d);
    }
  };
  return s(t), Array.from(o);
}
function Cc(e) {
  return e ? e.split(",").map((t) => t.trim()).filter(Boolean).map((t) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t))
      throw new Error(`Invalid email address: ${t}`);
    return {
      emailAddress: {
        address: t
      }
    };
  }) : [];
}
function tr(e) {
  return (Buffer.isBuffer(e) ? e.toString("base64") : Buffer.from(e).toString("base64")).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function Ru() {
  const e = "b32a0e59-d61f-4655-981c-a18266e0af4f".trim() || "b32a0e59-d61f-4655-981c-a18266e0af4f".trim(), t = "common".trim() || "common", r = "http://127.0.0.1:42813/auth/microsoft/callback".trim() || "http://127.0.0.1:42813/auth/microsoft/callback".trim() || "http://127.0.0.1:42813/auth/microsoft/callback", n = "openid profile offline_access User.Read Mail.Read Mail.ReadWrite Mail.Send Calendars.Read".trim() || "openid profile offline_access User.Read Mail.Read Mail.ReadWrite Mail.Send Calendars.Read";
  if (!e)
    throw new Error("Missing MICROSOFT_OAUTH_CLIENT_ID");
  if (!/^[0-9a-fA-F-]{36}$/.test(e))
    throw new Error(
      "MICROSOFT_OAUTH_CLIENT_ID must be the Azure Application client ID GUID, not a client secret value"
    );
  const o = new URL(r);
  if (!["127.0.0.1", "localhost"].includes(o.hostname) || o.protocol !== "http:")
    throw new Error(
      "MICROSOFT_OAUTH_REDIRECT_URI must be a localhost loopback URL"
    );
  if (!o.port)
    throw new Error(
      "MICROSOFT_OAUTH_REDIRECT_URI must include an explicit port, for example: http://127.0.0.1:42813/auth/microsoft/callback"
    );
  return {
    clientId: e,
    tenantId: t,
    redirectUri: r,
    scope: n
  };
}
function zh(e) {
  const t = e.clientId?.trim(), r = e.tenantId?.trim(), n = e.oauthScope?.trim();
  if (t && r && n) {
    if (!/^[0-9a-fA-F-]{36}$/.test(t))
      throw new Error(
        "Stored Microsoft OAuth client ID is invalid. Please reconnect the account."
      );
    return {
      clientId: t,
      tenantId: r,
      scope: n
    };
  }
  try {
    const o = Ru();
    return {
      clientId: o.clientId,
      tenantId: o.tenantId,
      scope: o.scope
    };
  } catch (o) {
    throw o instanceof Error && o.message === "Missing MICROSOFT_OAUTH_CLIENT_ID" ? new Error(
      "Microsoft OAuth config is missing and this account token needs refresh. Please reconnect the account."
    ) : o;
  }
}
function un() {
  try {
    if (!He.existsSync(Po))
      return {};
    const e = He.readFileSync(Po, "utf8");
    if (!e)
      return {};
    if (!ze.isEncryptionAvailable())
      throw new Error("Secure token storage is not available on this system");
    const t = ze.decryptString(
      Buffer.from(e, "base64")
    );
    return JSON.parse(t);
  } catch (e) {
    return console.error("Failed to load stored Microsoft tokens:", e), {};
  }
}
function oa(e) {
  try {
    if (!ze.isEncryptionAvailable())
      throw new Error("Secure token storage is not available on this system");
    const t = JSON.stringify(e), r = ze.encryptString(t).toString("base64");
    He.writeFileSync(Po, r, {
      encoding: "utf8",
      mode: 384
    });
  } catch (t) {
    throw console.error("Failed to save Microsoft tokens:", t), t;
  }
}
const xr = "224714941754-dmhs2n3lmljpgajk3qak2glsoqdtl6ea.apps.googleusercontent.com", bu = "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", Or = "http://localhost:53682", Nc = "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send", Cu = [
  { id: "INBOX", displayName: "Inbox", wellKnownName: "inbox", depth: 0, path: "Inbox" },
  { id: "SENT", displayName: "Sent", wellKnownName: "sentitems", depth: 0, path: "Sent" },
  { id: "DRAFT", displayName: "Drafts", wellKnownName: "drafts", depth: 0, path: "Drafts" },
  { id: "ARCHIVE", displayName: "Archive", wellKnownName: "archive", depth: 0, path: "Archive" },
  { id: "TRASH", displayName: "Trash", wellKnownName: "deleteditems", depth: 0, path: "Trash" },
  { id: "STARRED", displayName: "Starred", wellKnownName: "", depth: 0, path: "Starred" },
  { id: "SPAM", displayName: "Spam", wellKnownName: "junkmail", depth: 0, path: "Spam" }
];
function Lr() {
  try {
    if (!He.existsSync(Fo)) return {};
    const e = He.readFileSync(Fo, "utf8");
    if (!e) return {};
    if (!ze.isEncryptionAvailable())
      throw new Error("Secure token storage is not available on this system");
    const t = ze.decryptString(Buffer.from(e, "base64"));
    return JSON.parse(t);
  } catch (e) {
    return console.error("Failed to load stored Google tokens:", e), {};
  }
}
function aa(e) {
  try {
    if (!ze.isEncryptionAvailable())
      throw new Error("Secure token storage is not available on this system");
    const t = ze.encryptString(JSON.stringify(e)).toString("base64");
    He.writeFileSync(Fo, t, { encoding: "utf8", mode: 384 });
  } catch (t) {
    throw console.error("Failed to save Google tokens:", t), t;
  }
}
const bo = /* @__PURE__ */ new Map();
async function Vt(e) {
  const r = Lr()[e];
  if (!r) throw new Error("No Google token stored for this account");
  if (r.expiresAt > Date.now() + wu) return r.accessToken;
  if (!r.refreshToken)
    throw new Error("Google refresh token missing. Please reconnect the account.");
  const n = bo.get(e);
  if (n) return n;
  const o = (async () => {
    try {
      const s = r.clientId || xr, i = _h({
        clientId: s,
        clientSecret: bu,
        refreshToken: r.refreshToken
      }), d = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: i.toString()
      });
      if (!d.ok) {
        const c = await d.text();
        throw new Error(mu(d.status, c));
      }
      const a = await d.json(), h = Lr();
      return h[e] = {
        ...r,
        accessToken: a.access_token,
        expiresAt: Date.now() + a.expires_in * 1e3,
        scope: a.scope || r.scope,
        tokenType: a.token_type || r.tokenType,
        clientId: s
      }, aa(h), h[e].accessToken;
    } finally {
      bo.delete(e);
    }
  })();
  return bo.set(e, o), o;
}
function Pr(e, t) {
  return e.find((r) => r.name.toLowerCase() === t.toLowerCase())?.value ?? "";
}
function Co(e) {
  const t = /^(.*?)\s*<([^>]+)>$/.exec(e.trim());
  return t ? { name: t[1].replace(/^"|"$/g, "").trim(), address: t[2].trim() } : { name: "", address: e.trim() };
}
function sa(e) {
  if (!e) return { content: "", contentType: "text" };
  if (e.parts && e.parts.length > 0) {
    const t = e.parts.find((n) => n.mimeType === "text/html"), r = e.parts.find((n) => n.mimeType === "text/plain");
    for (const n of [t, r])
      if (n) {
        if (n.body?.data)
          return { content: Buffer.from(n.body.data, "base64").toString("utf8"), contentType: n.mimeType === "text/html" ? "html" : "text" };
        if (n.parts) {
          const o = sa(n);
          if (o.content) return o;
        }
      }
  }
  return e.body?.data ? { content: Buffer.from(e.body.data, "base64").toString("utf8"), contentType: e.mimeType === "text/html" ? "html" : "text" } : { content: "", contentType: "text" };
}
function Nu(e) {
  const t = oe.prepare(`
    INSERT INTO folders (id, accountId, displayName, parentFolderId, wellKnownName, totalItemCount, unreadItemCount, depth, path)
    VALUES (?, ?, ?, NULL, ?, 0, 0, ?, ?)
    ON CONFLICT(accountId, id) DO UPDATE SET
      displayName = excluded.displayName,
      wellKnownName = excluded.wellKnownName,
      depth = excluded.depth,
      path = excluded.path
  `);
  for (const r of Cu)
    t.run(r.id, e, r.displayName, r.wellKnownName, r.depth, r.path);
}
function Du(e, t, r) {
  const n = r.payload?.headers ?? [], o = Pr(n, "From"), { name: s, address: i } = Co(o), d = Pr(n, "To"), a = d ? JSON.stringify([{ emailAddress: Co(d) }]) : "[]", h = Pr(n, "Cc"), c = h ? JSON.stringify([{ emailAddress: Co(h) }]) : "[]", l = Pr(n, "Subject"), f = Pr(n, "Date"), p = f ? new Date(f).toISOString() : (/* @__PURE__ */ new Date()).toISOString(), g = r.snippet ?? "", y = (r.labelIds ?? []).includes("UNREAD") ? 0 : 1, m = (r.labelIds ?? []).includes("STARRED") ? 1 : 0, _ = sa(r.payload);
  oe.prepare(`
    INSERT INTO emails (
      id, accountId, folder, subject, bodyPreview, bodyContentType, bodyContent,
      receivedDateTime, isRead, hasAttachments, isStarred, fromName, fromAddress,
      toRecipients, ccRecipients
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      folder             = excluded.folder,
      subject            = CASE WHEN excluded.subject <> '' THEN excluded.subject ELSE emails.subject END,
      bodyPreview        = CASE WHEN excluded.bodyPreview <> '' THEN excluded.bodyPreview ELSE emails.bodyPreview END,
      bodyContentType    = CASE WHEN excluded.bodyContentType <> '' THEN excluded.bodyContentType ELSE emails.bodyContentType END,
      bodyContent        = CASE WHEN excluded.bodyContent <> '' THEN excluded.bodyContent ELSE emails.bodyContent END,
      receivedDateTime   = excluded.receivedDateTime,
      isRead             = excluded.isRead,
      isStarred          = excluded.isStarred,
      fromName           = excluded.fromName,
      fromAddress        = excluded.fromAddress,
      toRecipients       = excluded.toRecipients,
      ccRecipients       = excluded.ccRecipients
  `).run(
    r.id,
    e,
    t,
    l,
    g,
    _.content ? _.contentType : "",
    _.content,
    p,
    y,
    m,
    s,
    i,
    a,
    c
  );
}
async function Yh(e, t, r, n) {
  const o = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
  o.searchParams.set("labelIds", r), o.searchParams.set("maxResults", String(n));
  const s = await fetch(o.toString(), {
    headers: { Authorization: `Bearer ${e}` }
  });
  if (!s.ok) {
    const a = await s.text();
    throw new Error(`Gmail messages list failed (${s.status}): ${a}`);
  }
  const d = ((await s.json()).messages ?? []).map((a) => a.id);
  for (const a of d) {
    const h = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(a)}?format=full`, c = await fetch(h, {
      headers: { Authorization: `Bearer ${e}` }
    });
    if (!c.ok) {
      console.warn(`Gmail fetch message ${a} failed (${c.status})`);
      continue;
    }
    const l = await c.json();
    Du(t, r, l), await It(30);
  }
}
function In() {
  try {
    if (!He.existsSync(xo))
      return {};
    const e = He.readFileSync(xo, "utf8");
    if (!e)
      return {};
    if (!ze.isEncryptionAvailable())
      throw new Error("Secure AI key storage is not available on this system");
    const t = ze.decryptString(
      Buffer.from(e, "base64")
    );
    return JSON.parse(t);
  } catch (e) {
    return console.error("Failed to load stored AI provider keys:", e), {};
  }
}
function Ou(e) {
  if (!ze.isEncryptionAvailable())
    throw new Error("Secure AI key storage is not available on this system");
  const t = JSON.stringify(e), r = ze.encryptString(t).toString("base64");
  He.writeFileSync(xo, r, {
    encoding: "utf8",
    mode: 384
  });
}
function la(e) {
  const t = In()[e], r = e === "gemini" ? process.env.GEMINI_API_KEY?.trim() : "";
  return {
    provider: e,
    configured: !!(t?.apiKey || r),
    source: t?.apiKey ? "local" : r ? "environment" : null,
    updatedAt: t?.updatedAt || null,
    encryptionAvailable: ze.isEncryptionAvailable()
  };
}
async function Xh(e, t, r, n) {
  const o = `https://login.microsoftonline.com/${r}/oauth2/v2.0`, s = new URLSearchParams({
    client_id: t,
    grant_type: "refresh_token",
    refresh_token: e,
    scope: n
  }), i = await fetch(`${o}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: s.toString()
  });
  if (!i.ok) {
    const d = await i.text();
    throw new Error(
      `Microsoft refresh token exchange failed (${i.status}): ${d}`
    );
  }
  return await i.json();
}
const No = /* @__PURE__ */ new Map();
async function Ye(e) {
  const r = un()[e];
  if (!r) throw new Error("No Microsoft token stored for this account");
  if (r.expiresAt > Date.now() + wu)
    return r.accessToken;
  if (!r.refreshToken)
    throw new Error(
      "Microsoft refresh token missing. Please reconnect the account."
    );
  const n = No.get(e);
  if (n) return n;
  const o = (async () => {
    try {
      const { clientId: s, tenantId: i, scope: d } = zh(r), a = await Xh(
        r.refreshToken,
        s,
        i,
        d
      ), h = un();
      return h[e] = {
        ...r,
        accessToken: a.access_token,
        refreshToken: a.refresh_token || r.refreshToken,
        expiresAt: Date.now() + a.expires_in * 1e3,
        scope: a.scope || r.scope,
        tokenType: a.token_type || r.tokenType,
        clientId: s,
        tenantId: i,
        oauthScope: d
      }, oa(h), h[e].accessToken;
    } finally {
      No.delete(e);
    }
  })();
  return No.set(e, o), o;
}
async function Pu(e, t) {
  for (let r = 1; r <= Dt; r += 1) {
    const n = await fetch(t, {
      headers: {
        Authorization: `Bearer ${e}`,
        Prefer: "odata.maxpagesize=100"
      }
    });
    if (n.ok)
      return await n.json();
    const o = await n.text();
    if (!(n.status === 429 || n.status === 500 || n.status === 502 || n.status === 503 || n.status === 504) || r === Dt)
      throw new Error(
        `Microsoft Graph message delta request failed (${n.status}): ${o}`
      );
    await It(vn(n, r));
  }
  throw new Error("Microsoft Graph message delta request failed after retries");
}
async function Lo(e, t, r) {
  const n = new URLSearchParams({
    $select: "id,subject,bodyPreview,receivedDateTime,isRead,hasAttachments,from,toRecipients,ccRecipients,flag"
    // <--- Added ,flag
  });
  let o = `https://graph.microsoft.com/v1.0/me/mailFolders/${encodeURIComponent(
    r
  )}/messages/delta?${n.toString()}`, s = "", i = 0;
  for (; o; ) {
    const d = await Pu(e, o);
    if (oe.transaction(() => {
      for (const h of d.value) {
        if (h["@removed"]) {
          Iu(t, h.id);
          continue;
        }
        _u(t, r, h), i += 1;
      }
    })(), d["@odata.deltaLink"]) {
      s = d["@odata.deltaLink"];
      break;
    }
    o = d["@odata.nextLink"], await It(80);
  }
  if (!s)
    throw new Error(
      `Microsoft Graph did not return a deltaLink for folder ${r}`
    );
  return Tu(t, r, s, "full"), {
    success: !0,
    syncedCount: i,
    deltaLink: s
  };
}
async function Fu(e, t, r) {
  const n = Dh(t, r);
  if (!n)
    return Lo(e, t, r);
  let o = n, s = 0, i = 0, d = "";
  try {
    for (; o; ) {
      const a = await Pu(
        e,
        o
      );
      if (oe.transaction(() => {
        for (const c of a.value) {
          if (c["@removed"]) {
            Iu(t, c.id), i += 1;
            continue;
          }
          _u(t, r, c), s += 1;
        }
      })(), a["@odata.deltaLink"]) {
        d = a["@odata.deltaLink"];
        break;
      }
      o = a["@odata.nextLink"], await It(50);
    }
  } catch (a) {
    const h = a instanceof Error ? a.message : String(a);
    if (h.includes("410") || h.toLowerCase().includes("sync state") || h.toLowerCase().includes("deltalink"))
      return Tn(t, r), Lo(e, t, r);
    throw a;
  }
  return d && Tu(t, r, d, "delta"), {
    success: !0,
    updatedCount: s,
    deletedCount: i
  };
}
async function Sn(e) {
  const t = await Ye(e), r = await ku(t), n = Array.isArray(r) ? r : r.value || [], o = ra(n);
  console.log(
    `[sync] Initial full sync for ${e}: ${n.length} folders`
  ), console.log(`[sync] Message sync folders: ${o.length}`), $u(e, n);
  for (const s of o)
    try {
      console.log(
        `[sync] Full delta sync folder: ${s.displayName} (${s.id})`
      );
      const i = await Lo(
        t,
        e,
        s.id
      );
      console.log(
        `[sync] Finished folder: ${s.displayName} (${i.syncedCount ?? 0} messages)`
      );
    } catch (i) {
      console.error(
        `[sync] Failed folder: ${s.displayName} (${s.id})`,
        i
      ), Tn(e, s.id);
    }
  return { success: !0 };
}
async function xu(e, t) {
  const r = await Ye(e), n = Bu(e), o = new Set(t.filter(Boolean)), s = ra(n).filter(
    (i) => o.has(i.id)
  );
  console.log(
    `[sync] Targeted delta sync for ${e}: ${s.length} folders`
  );
  for (const i of s)
    try {
      const d = await Fu(
        r,
        e,
        i.id
      );
      console.log(
        `[sync] Targeted delta finished folder: ${i.displayName} (${d.updatedCount ?? d.syncedCount ?? 0} changed, ${d.deletedCount ?? 0} deleted)`
      );
    } catch (d) {
      console.error(
        `[sync] Targeted delta failed folder: ${i.displayName} (${i.id})`,
        d
      ), Tn(e, i.id);
    }
  return { success: !0 };
}
async function Lu(e) {
  const t = await Ye(e), r = await ku(t), n = Array.isArray(r) ? r : r.value || [], o = ra(n);
  console.log(`[sync] Delta sync for ${e}: ${n.length} folders`), console.log(`[sync] Message delta folders: ${o.length}`), $u(e, n);
  for (const s of o)
    try {
      const i = await Fu(
        t,
        e,
        s.id
      ), d = i.updatedCount ?? i.syncedCount ?? 0, a = i.deletedCount ?? 0;
      console.log(
        `[sync] Delta finished folder: ${s.displayName} (${d} changed, ${a} deleted)`
      );
    } catch (i) {
      console.error(
        `[sync] Delta failed folder: ${s.displayName} (${s.id})`,
        i
      ), Tn(e, s.id);
    }
  return { success: !0 };
}
async function Kh(e, t) {
  for (let r = 1; r <= Dt; r += 1) {
    const n = await fetch(t, {
      headers: {
        Authorization: `Bearer ${e}`
      }
    });
    if (n.ok)
      return await n.json();
    const o = await n.text();
    if (n.status === 404 || n.status === 403 || o.includes("ErrorItemNotFound") || o.includes("ErrorAccessDenied"))
      return { value: [] };
    if (!(n.status === 429 || n.status === 503 || n.status === 504) || r === Dt)
      throw new Error(
        `Microsoft Graph folders request failed (${n.status}): ${o}`
      );
    await It(vn(n, r));
  }
  throw new Error("Microsoft Graph folders request failed after retries");
}
async function Jh(e, t) {
  const r = await fetch(
    "https://graph.microsoft.com/v1.0/me/mailFolders",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${e}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        displayName: t
      })
    }
  );
  if (!r.ok) {
    const n = await r.text();
    throw new Error(
      `Microsoft Graph folder creation failed (${r.status}): ${n}`
    );
  }
  return await r.json();
}
async function Uu(e, t, r) {
  const o = `https://graph.microsoft.com/v1.0/me/messages/${encodeURIComponent(t)}/move`;
  for (let s = 1; s <= Dt; s += 1) {
    const i = await fetch(o, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${e}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        destinationId: r
      })
    });
    if (i.ok)
      return await i.json();
    const d = await i.text();
    if (!(i.status === 429 || i.status === 500 || i.status === 502 || i.status === 503 || i.status === 504) || s === Dt)
      throw new Error(
        `Microsoft Graph move failed (${i.status}): ${d}`
      );
    await It(vn(i, s));
  }
  throw new Error("Microsoft Graph move failed after retries");
}
async function Qh(e, t, r) {
  const n = encodeURIComponent(t), o = await fetch(
    `https://graph.microsoft.com/v1.0/me/mailFolders/${n}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${e}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        displayName: r
      })
    }
  );
  if (!o.ok) {
    const s = await o.text();
    throw new Error(
      `Microsoft Graph folder rename failed (${o.status}): ${s}`
    );
  }
  return await o.json();
}
async function Zh(e, t) {
  const r = encodeURIComponent(t), n = await fetch(
    `https://graph.microsoft.com/v1.0/me/mailFolders/${r}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${e}`
      }
    }
  );
  if (!n.ok && n.status !== 404) {
    const o = await n.text();
    throw new Error(
      `Microsoft Graph folder delete failed (${n.status}): ${o}`
    );
  }
  return { success: !0 };
}
async function ep(e, t) {
  const n = `https://graph.microsoft.com/v1.0/me/messages/${encodeURIComponent(t)}`;
  for (let o = 1; o <= Dt; o += 1) {
    const s = await fetch(n, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${e}`
      }
    });
    if (s.ok || s.status === 404)
      return;
    const i = await s.text();
    if (!(s.status === 429 || s.status === 500 || s.status === 502 || s.status === 503 || s.status === 504) || o === Dt)
      throw new Error(
        `Microsoft Graph message delete failed (${s.status}): ${i}`
      );
    await It(vn(s, o));
  }
}
async function tp(e, t, r) {
  const n = "deleteditems";
  let o = 0, s = `https://graph.microsoft.com/v1.0/me/mailFolders/${encodeURIComponent(
    t
  )}/messages?$top=100&$select=id`;
  const i = [];
  for (; s; ) {
    const d = await fetch(s, {
      headers: {
        Authorization: `Bearer ${e}`
      }
    });
    if (!d.ok) {
      const h = await d.text();
      throw new Error(
        `Microsoft Graph list folder messages failed (${d.status}): ${h}`
      );
    }
    const a = await d.json();
    i.push(...a.value.map((h) => h.id)), s = a["@odata.nextLink"], await It(80);
  }
  for (const d of i)
    r ? await ep(e, d) : await Uu(
      e,
      d,
      n
    ), o += 1, await It(120);
  return {
    success: !0,
    affectedCount: o
  };
}
async function ku(e) {
  const r = `https://graph.microsoft.com/v1.0/me/mailFolders?${new URLSearchParams({
    $top: "100"
  }).toString()}`, n = [], o = async (s, i, d) => {
    let a = s;
    for (; a; ) {
      let h;
      try {
        h = await Kh(e, a);
      } catch (c) {
        throw console.error(
          `[sync] Failed to fetch folder page for path "${d || "root"}":`,
          c
        ), c;
      }
      for (const c of h.value) {
        const l = d ? `${d}/${c.displayName}` : c.displayName, f = {
          ...c,
          depth: i,
          path: l
        };
        n.push(f);
        const p = new URLSearchParams({
          $top: "100"
        }), y = `https://graph.microsoft.com/v1.0/me/mailFolders/${encodeURIComponent(c.id)}/childFolders?${p.toString()}`;
        try {
          await o(y, i + 1, l);
        } catch (m) {
          console.error(
            `[sync] Failed to fetch sub-folders for ${c.displayName} (${c.id}):`,
            m
          );
        }
      }
      a = h["@odata.nextLink"];
    }
  };
  return await o(r, 0, ""), { value: n };
}
function Uo(e) {
  if (e.wellKnownName)
    return e.wellKnownName.toLowerCase();
  const t = e.id.toLowerCase(), r = e.displayName.toLowerCase().replace(/\s+/g, "");
  return t === "inbox" || r === "inbox" || r === "indbakke" || r === "bandejadeentrada" || r === "boîtederéception" ? "inbox" : t === "sentitems" || r === "sentitems" || r === "sent" || r === "sendtpost" || r === "elementosenviados" || r === "élémentsenvoyés" ? "sentitems" : t === "drafts" || r === "drafts" || r === "kladder" || r === "borradores" || r === "brouillons" ? "drafts" : t === "archive" || r === "archive" || r === "arkiv" || r === "archivo" ? "archive" : t === "deleteditems" || r === "deleteditems" || r === "deleted" || r === "trash" || r === "papirkurv" || r === "elementoseliminados" || r === "élémentsupprimés" ? "deleteditems" : "";
}
function $u(e, t) {
  const r = oe.prepare(`
    INSERT INTO folders (
      id,
      accountId,
      displayName,
      parentFolderId,
      wellKnownName,
      totalItemCount,
      unreadItemCount,
      depth,
      path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(accountId, id) DO UPDATE SET
      displayName = excluded.displayName,
      parentFolderId = excluded.parentFolderId,
      wellKnownName = excluded.wellKnownName,
      totalItemCount = excluded.totalItemCount,
      unreadItemCount = excluded.unreadItemCount,
      depth = excluded.depth,
      path = excluded.path
  `);
  oe.transaction((o) => {
    for (const s of o)
      r.run(
        s.id,
        e,
        s.displayName || "Folder",
        s.parentFolderId || "",
        Uo(s),
        s.totalItemCount || 0,
        s.unreadItemCount || 0,
        s.depth || 0,
        s.path || s.displayName || "Folder"
      );
  })(t);
}
function rp(e) {
  return !!oe.prepare(
    `
      SELECT id
      FROM emails
      WHERE accountId = ?
      LIMIT 1
    `
  ).get(e);
}
function ca(e) {
  return !Mu(e) || !rp(e);
}
function Mu(e) {
  return !!oe.prepare(
    `
      SELECT folderId
      FROM folder_sync_state
      WHERE accountId = ?
      LIMIT 1
    `
  ).get(e);
}
function qu(e) {
  return e.map((t) => ({
    id: t.id,
    subject: t.subject,
    bodyPreview: t.bodyPreview,
    body: t.bodyContentType ? {
      contentType: t.bodyContentType,
      content: t.bodyContent
    } : void 0,
    receivedDateTime: t.receivedDateTime,
    isRead: !!t.isRead,
    hasAttachments: !!t.hasAttachments,
    attachments: JSON.parse(t.attachments || "[]"),
    isStarred: !!t.isStarred,
    from: {
      emailAddress: {
        name: t.fromName,
        address: t.fromAddress
      }
    },
    toRecipients: JSON.parse(t.toRecipients || "[]"),
    ccRecipients: JSON.parse(t.ccRecipients || "[]")
  }));
}
function Bu(e) {
  return oe.prepare(
    `
      SELECT *
      FROM folders
      WHERE accountId = ?
      ORDER BY path COLLATE NOCASE ASC
    `
  ).all(e);
}
function Hu(e) {
  const t = Bu(e), r = {};
  for (const n of t) {
    const o = oe.prepare(
      `
    SELECT
      id,
      accountId,
      folder,
      subject,
      bodyPreview,
      bodyContentType,
      bodyContent,
      receivedDateTime,
      isRead,
      hasAttachments,
      isStarred,
      attachments,
      fromName,
      fromAddress,
      toRecipients,
      ccRecipients
    FROM emails
    WHERE accountId = ? AND folder = ?
    ORDER BY receivedDateTime DESC
  `
    ).all(e, n.id);
    r[n.id] = qu(o);
  }
  return r;
}
function np(e) {
  return oe.prepare(
    `
      SELECT id, accountId, name, color, createdAt, updatedAt
      FROM labels
      WHERE accountId = ?
      ORDER BY name COLLATE NOCASE ASC
    `
  ).all(e);
}
function ip() {
  try {
    if (He.existsSync(Do))
      return JSON.parse(He.readFileSync(Do, "utf8"));
  } catch (e) {
    console.error("Failed to load window state:", e);
  }
  return { width: 1200, height: 800 };
}
function op(e) {
  try {
    if (!e.isMaximized() && !e.isMinimized()) {
      const t = e.getBounds();
      He.writeFileSync(Do, JSON.stringify(t), {
        encoding: "utf8",
        mode: 384
      });
    }
  } catch (t) {
    console.error("Failed to save window state:", t);
  }
}
function ju() {
  const e = ip(), t = lt.resolve(ln, "preload.mjs"), r = Ve.isPackaged ? lt.join(ln, "../dist/logo.ico") : lt.join(ln, "../../public/logo.ico"), n = new ft({
    x: e.x,
    y: e.y,
    width: e.width,
    height: e.height,
    minWidth: 800,
    minHeight: 600,
    frame: !1,
    icon: r,
    webPreferences: {
      nodeIntegration: !1,
      // Never expose Node.js to renderer
      contextIsolation: !0,
      // Isolate renderer from preload globals
      sandbox: !0,
      // Full Chromium sandboxing
      webSecurity: !0,
      // Enforce same-origin policy
      allowRunningInsecureContent: !1,
      preload: t
    }
  });
  n.webContents.setWindowOpenHandler(({ url: o }) => {
    try {
      const s = new URL(o);
      if (!["https:", "mailto:"].includes(s.protocol))
        return { action: "deny" };
      ta.openExternal(o);
    } catch {
      return { action: "deny" };
    }
    return { action: "deny" };
  }), n.webContents.on("will-navigate", (o, s) => {
    process.env.VITE_DEV_SERVER_URL && s.startsWith(process.env.VITE_DEV_SERVER_URL) || s.startsWith("file://") || o.preventDefault();
  }), n.on("close", () => {
    op(n);
  }), process.env.VITE_DEV_SERVER_URL ? n.loadURL(process.env.VITE_DEV_SERVER_URL) : n.loadFile(lt.resolve(ln, "../dist/index.html"));
}
pe.handle("ai:get-provider-key-status", (e, t) => {
  const r = Be(t?.provider, "provider", 32);
  if (r !== "gemini")
    throw new Error("Unsupported AI provider");
  return la(r);
});
pe.handle("ai:set-provider-key", (e, t) => {
  const r = Be(t?.provider, "provider", 32), n = Be(t?.apiKey, "apiKey", 8192);
  if (r !== "gemini")
    throw new Error("Unsupported AI provider");
  const o = In();
  return o[r] = {
    apiKey: n,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }, Ou(o), la(r);
});
pe.handle("ai:delete-provider-key", (e, t) => {
  const r = Be(t?.provider, "provider", 32);
  if (r !== "gemini")
    throw new Error("Unsupported AI provider");
  const n = In();
  return delete n[r], Ou(n), la(r);
});
class ap {
  constructor(t, r) {
    this.maxCalls = t, this.windowMs = r;
  }
  maxCalls;
  windowMs;
  timestamps = [];
  allow() {
    const t = Date.now();
    return this.timestamps = this.timestamps.filter((r) => t - r < this.windowMs), this.timestamps.length >= this.maxCalls ? !1 : (this.timestamps.push(t), !0);
  }
}
const sp = new ap(10, 6e4);
pe.handle("ai:summarize-email", async (e, t) => {
  if (!sp.allow())
    throw new Error("Too many AI requests. Please wait a moment before summarising another email.");
  const r = Mh(t), n = Rc(
    kh(r.body || r.preview || "")
  );
  if (!n.trim() && !r.subject.trim())
    throw new Error("No email content available to summarize.");
  const o = [
    "You are RYZE AI, a private email assistant inside a desktop email app.",
    "",
    "Analyze this email for the user.",
    "",
    "Return only valid JSON with this exact shape:",
    '{"summary":"one concise paragraph","keyPoints":["point 1","point 2"],"suggestedActions":["action 1","action 2"]}',
    "",
    "Rules:",
    "- Keep summary concise.",
    "- keyPoints should capture the most important facts, questions, deadlines, amounts, or decisions.",
    "- suggestedActions should be practical next steps for the user.",
    "- Do not invent details.",
    "- Use empty arrays when there are no key points or actions.",
    "",
    `From: ${r.senderName} <${r.senderEmail}>`,
    `Subject: ${r.subject}`,
    "",
    "Email content:",
    n
  ].join(`
`);
  if (xh() === "ollama") {
    const { baseUrl: l, model: f } = Lh(), p = Rc(n, 4e3), g = [
      "Return only valid JSON.",
      'Shape: {"summary":"short summary","keyPoints":["point"],"suggestedActions":["action"]}',
      "Use max 3 keyPoints and max 2 suggestedActions.",
      "Do not invent details.",
      "",
      `From: ${r.senderName} <${r.senderEmail}>`,
      `Subject: ${r.subject}`,
      "",
      p
    ].join(`
`), y = async (I) => {
      const N = await fetch(`${l}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: f,
          prompt: g,
          stream: !1,
          options: {
            temperature: 0.2,
            num_predict: I
          }
        })
      });
      if (!N.ok) {
        const O = await N.text();
        throw new Error(
          `Ollama summarize failed (${N.status}): ${O}`
        );
      }
      return await N.json();
    };
    let m = await y(500), _ = (m.response || m.message?.content || m.output || "").trim();
    if (!_ && m.done_reason === "length" && (m = await y(1e3), _ = (m.response || m.message?.content || m.output || "").trim()), !_) {
      const I = m.error || m.done_reason || "no response text";
      throw new Error(`Ollama returned an empty summary (${I}).`);
    }
    return {
      ...bc(_)
    };
  }
  const s = Ph(), i = Fh(), d = Uh(), a = await fetch(
    `https://generativelanguage.googleapis.com/${encodeURIComponent(
      d
    )}/models/${encodeURIComponent(i)}:generateContent?key=${encodeURIComponent(
      s
    )}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: o
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 900
        }
      })
    }
  );
  if (!a.ok) {
    const l = await a.text();
    throw a.status === 400 && l.includes("API_KEY") ? new Error("Gemini API key is invalid or missing.") : new Error(
      `Gemini summarize failed (${a.status}): ${l}`
    );
  }
  const c = (await a.json()).candidates?.[0]?.content?.parts?.map((l) => l.text || "").join("").trim();
  if (!c)
    throw new Error("Gemini returned an empty summary.");
  return {
    ...bc(c)
  };
});
pe.handle("microsoft-calendar:get-events", async (e, t) => {
  const r = Ae(t?.accountId), n = await Ye(r), o = /* @__PURE__ */ new Date();
  o.setHours(0, 0, 0, 0);
  const s = /* @__PURE__ */ new Date();
  s.setDate(s.getDate() + 14);
  const i = new URLSearchParams({
    $select: "id,subject,bodyPreview,start,end,location,isAllDay",
    $orderby: "start/dateTime ASC",
    $top: "50"
  }), d = await fetch(
    `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${o.toISOString()}&endDateTime=${s.toISOString()}&${i.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${n}`,
        Prefer: 'outlook.timezone="UTC"'
      }
    }
  );
  if (!d.ok) {
    const h = await d.text();
    throw console.error("Failed to fetch calendar:", h), new Error(`Failed to fetch calendar events: ${h}`);
  }
  return (await d.json()).value || [];
});
pe.handle("microsoft-mail:download-attachment", async (e, t) => {
  const r = Ae(t?.accountId), n = wt(t?.messageId), o = Be(
    t?.attachmentId,
    "attachmentId",
    2048
  ), s = Be(t?.filename, "filename", 1024), i = ft.fromWebContents(e.sender);
  if (!i) throw new Error("No window found");
  const { canceled: d, filePath: a } = await Rh.showSaveDialog(i, {
    defaultPath: s,
    title: "Save Attachment"
  });
  if (d || !a)
    return { success: !1, canceled: !0 };
  const h = await Ye(r), c = encodeURIComponent(n), l = encodeURIComponent(o), p = `${`https://graph.microsoft.com/v1.0/me/messages/${c}/attachments/${l}`}/$value`, g = async (I) => {
    const N = await fetch(p, {
      headers: {
        Authorization: `Bearer ${h}`,
        ...I ? { Prefer: 'IdType="ImmutableId"' } : {}
      }
    });
    if (N.ok) {
      const R = await N.arrayBuffer();
      return { ok: !0, bytes: Buffer.from(R) };
    }
    const O = await N.text();
    return { ok: !1, status: N.status, errorText: O };
  }, y = await g(!0), m = y.ok || y.status !== 404 ? null : await g(!1), _ = y.ok ? y : m?.ok ? m : null;
  if (!_) {
    const I = m || y;
    throw new Error(`Failed to download attachment: ${I.errorText}`);
  }
  return He.writeFileSync(a, _.bytes), { success: !0, filePath: a };
});
pe.handle("microsoft-mail:toggle-star", async (e, t) => {
  const r = Ae(t?.accountId), n = wt(t?.messageId), o = !!t?.isStarred, s = await Ye(r), i = encodeURIComponent(n), d = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages/${i}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${s}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        flag: {
          flagStatus: o ? "flagged" : "notFlagged"
        }
      })
    }
  );
  if (!d.ok) {
    const a = await d.text();
    if (d.status === 404 || a.includes("ErrorItemNotFound"))
      return oe.prepare("DELETE FROM emails WHERE accountId = ? AND id = ?").run(
        r,
        n
      ), { success: !1, missing: !0 };
    throw new Error(`Failed to toggle star: ${a}`);
  }
  return oe.prepare(
    "UPDATE emails SET isStarred = ? WHERE accountId = ? AND id = ?"
  ).run(o ? 1 : 0, r, n), { success: !0 };
});
pe.handle("system:get-storage-usage", () => {
  try {
    return {
      // Return size in GB
      dbSizeGB: He.statSync(Eu).size / (1024 * 1024 * 1024)
    };
  } catch {
    return { dbSizeGB: 0 };
  }
});
pe.on("system:update-settings", (e, t) => {
  const r = qh(t);
  He.writeFileSync(Oo, JSON.stringify(r, null, 2), {
    encoding: "utf8",
    mode: 384
  });
});
pe.handle("microsoft-mail:syncFolders", async (e, t) => {
  const r = Ae(t?.accountId);
  if (Et.has(r))
    return Et.get(r);
  const o = (Array.isArray(t?.folderIds) ? t.folderIds : []).map(
    (s) => or(s)
  );
  return o.length === 0 ? { success: !0 } : ca(r) ? await Sn(r) : await xu(r, o);
});
const ko = lt.join(Ve.getPath("userData"), "ryze-drafts.enc");
pe.handle("system:get-drafts", () => {
  try {
    if (!ze.isEncryptionAvailable())
      return console.warn("Secure storage unavailable — drafts cannot be loaded."), [];
    if (!He.existsSync(ko)) return [];
    const e = He.readFileSync(ko), t = ze.decryptString(e);
    return JSON.parse(t);
  } catch (e) {
    return console.error("Failed to load encrypted drafts:", e), [];
  }
});
pe.on("system:save-drafts", (e, t) => {
  if (!ze.isEncryptionAvailable()) {
    console.error("Secure storage unavailable — drafts will not be saved to disk.");
    const r = ft.getAllWindows();
    r.length > 0 && r[0].webContents.send("drafts:save-failed", "Secure storage is unavailable on this system. Drafts cannot be saved.");
    return;
  }
  try {
    const r = JSON.stringify(Bh(t)), n = ze.encryptString(r);
    He.writeFileSync(ko, n, { mode: 384 });
  } catch (r) {
    console.error("Failed to securely save drafts:", r);
    const n = ft.getAllWindows();
    n.length > 0 && n[0].webContents.send(
      "drafts:save-failed",
      "Drafts could not be saved due to an encryption error."
    );
  }
});
pe.handle("labels:create", (e, t) => {
  const r = Ae(t?.accountId), n = Su(t?.name), o = Hh(t?.color), s = (/* @__PURE__ */ new Date()).toISOString(), i = `label-${tt.randomUUID()}`;
  return oe.prepare(
    `
    INSERT INTO labels (id, accountId, name, color, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `
  ).run(i, r, n, o, s, s), {
    id: i,
    accountId: r,
    name: n,
    color: o,
    createdAt: s,
    updatedAt: s
  };
});
pe.handle("microsoft-folder:create", async (e, t) => {
  const r = Ae(t?.accountId), n = Au(t?.displayName), o = await Ye(r), s = await Jh(o, n), i = {
    ...s,
    depth: 0,
    path: s.displayName || n
  };
  return oe.prepare(
    `
    INSERT OR REPLACE INTO folders (
      id,
      accountId,
      displayName,
      parentFolderId,
      wellKnownName,
      totalItemCount,
      unreadItemCount,
      depth,
      path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    i.id,
    r,
    i.displayName || n,
    i.parentFolderId || "",
    Uo(i),
    i.totalItemCount || 0,
    i.unreadItemCount || 0,
    i.depth || 0,
    i.path || i.displayName || n
  ), {
    id: i.id,
    accountId: r,
    displayName: i.displayName || n,
    parentFolderId: i.parentFolderId || "",
    wellKnownName: Uo(i),
    totalItemCount: i.totalItemCount || 0,
    unreadItemCount: i.unreadItemCount || 0,
    depth: i.depth || 0,
    path: i.path || i.displayName || n
  };
});
pe.handle("microsoft-folder:rename", async (e, t) => {
  const r = Ae(t?.accountId), n = or(t?.folderId), o = Au(t?.displayName), s = oe.prepare(
    `
      SELECT id, wellKnownName
      FROM folders
      WHERE accountId = ? AND id = ?
      LIMIT 1
    `
  ).get(r, n);
  if (!s)
    throw new Error("Folder not found");
  if (s.wellKnownName)
    throw new Error("System folders cannot be renamed.");
  const i = await Ye(r), d = await Qh(
    i,
    n,
    o
  );
  return oe.prepare(
    `
    UPDATE folders
    SET displayName = ?
    WHERE accountId = ? AND id = ?
  `
  ).run(d.displayName || o, r, n), oe.prepare(
    `
      SELECT *
      FROM folders
      WHERE accountId = ? AND id = ?
    `
  ).get(r, n);
});
pe.handle("microsoft-folder:delete", async (e, t) => {
  const r = Ae(t?.accountId), n = or(t?.folderId), o = oe.prepare(
    `
      SELECT id, wellKnownName
      FROM folders
      WHERE accountId = ? AND id = ?
      LIMIT 1
    `
  ).get(r, n);
  if (!o)
    throw new Error("Folder not found");
  if (o.wellKnownName)
    throw new Error("System folders cannot be deleted.");
  const s = await Ye(r);
  await Zh(s, n);
  const i = Vh(r, n);
  return oe.transaction(() => {
    for (const a of i)
      oe.prepare(
        `
        DELETE FROM email_labels
        WHERE accountId = ?
          AND messageId IN (
            SELECT id FROM emails WHERE accountId = ? AND folder = ?
          )
      `
      ).run(r, r, a), oe.prepare(
        `
        DELETE FROM emails
        WHERE accountId = ? AND folder = ?
      `
      ).run(r, a), oe.prepare(
        `
        DELETE FROM folders
        WHERE accountId = ? AND id = ?
      `
      ).run(r, a);
  })(), {
    success: !0,
    deletedFolderIds: i
  };
});
pe.handle("microsoft-folder:empty", async (e, t) => {
  const r = Ae(t?.accountId), n = or(t?.folderId), o = oe.prepare(
    `
    SELECT id, displayName, wellKnownName
    FROM folders
    WHERE accountId = ? AND id = ?
    LIMIT 1
  `
  ).get(r, n);
  if (!o)
    throw new Error("Folder not found");
  const s = await Ye(r), i = o.wellKnownName === "deleteditems" || o.displayName?.toLowerCase() === "deleted items" || o.displayName?.toLowerCase() === "trash", d = await tp(
    s,
    n,
    i
  );
  return oe.transaction(() => {
    oe.prepare(
      `
      DELETE FROM email_labels
      WHERE accountId = ?
        AND messageId IN (
          SELECT id FROM emails WHERE accountId = ? AND folder = ?
        )
    `
    ).run(r, r, n), oe.prepare(
      `
      DELETE FROM emails
      WHERE accountId = ? AND folder = ?
    `
    ).run(r, n);
  })(), {
    success: !0,
    affectedCount: d.affectedCount
  };
});
pe.handle("microsoft-folder:set-icon", (e, t) => {
  const r = Ae(t?.accountId), n = or(t?.folderId), o = Gh(t?.icon);
  if (oe.prepare(
    `
    UPDATE folders
    SET icon = ?
    WHERE accountId = ? AND id = ?
  `
  ).run(o, r, n).changes === 0)
    throw new Error("Folder not found");
  return oe.prepare(
    `
      SELECT *
      FROM folders
      WHERE accountId = ? AND id = ?
    `
  ).get(r, n);
});
pe.handle("labels:rename", (e, t) => {
  const r = Ae(t?.accountId), n = _n(t?.labelId), o = Su(t?.name), s = (/* @__PURE__ */ new Date()).toISOString();
  if (oe.prepare(
    `
    UPDATE labels
    SET name = ?, updatedAt = ?
    WHERE accountId = ? AND id = ?
  `
  ).run(o, s, r, n).changes === 0)
    throw new Error("Label not found");
  return oe.prepare(
    `
      SELECT id, accountId, name, color, createdAt, updatedAt
      FROM labels
      WHERE accountId = ? AND id = ?
    `
  ).get(r, n);
});
pe.handle("labels:assign-email", (e, t) => {
  const r = Ae(t?.accountId), n = wt(t?.messageId), o = _n(t?.labelId), s = (/* @__PURE__ */ new Date()).toISOString();
  if (!oe.prepare(
    `
    SELECT id FROM emails
    WHERE accountId = ? AND id = ?
    LIMIT 1
  `
  ).get(r, n))
    throw new Error("Email not found");
  if (!oe.prepare(
    `
    SELECT id FROM labels
    WHERE accountId = ? AND id = ?
    LIMIT 1
  `
  ).get(r, o))
    throw new Error("Label not found");
  return oe.prepare(
    `
    INSERT OR IGNORE INTO email_labels (accountId, messageId, labelId, createdAt)
    VALUES (?, ?, ?, ?)
  `
  ).run(r, n, o, s), { success: !0 };
});
pe.on("window-minimize", (e) => {
  ft.fromWebContents(e.sender)?.minimize();
});
pe.on("window-maximize", (e) => {
  const t = ft.fromWebContents(e.sender);
  t && (t.isMaximized() ? t.unmaximize() : t.maximize());
});
pe.on("window-close", (e) => {
  ft.fromWebContents(e.sender)?.close();
});
pe.handle("microsoft-oauth:connect", async () => {
  const { clientId: e, tenantId: t, redirectUri: r, scope: n } = Ru(), o = tr(tt.randomBytes(64)), s = tr(
    tt.createHash("sha256").update(o).digest()
  ), i = tr(tt.randomBytes(32)), d = new URL(r), a = `https://login.microsoftonline.com/${t}/oauth2/v2.0`, h = new URL(`${a}/authorize`);
  h.search = new URLSearchParams({
    client_id: e,
    response_type: "code",
    redirect_uri: r,
    response_mode: "query",
    scope: n,
    prompt: "select_account",
    code_challenge_method: "S256",
    code_challenge: s,
    state: i
  }).toString();
  const c = await new Promise((N, O) => {
    const R = Mo.createServer((A, w) => {
      if (!A.url) return;
      const C = `${d.hostname}:${d.port}`;
      if (A.headers.host !== C) {
        w.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" }), w.end("Bad request.");
        return;
      }
      const T = new URL(A.url, r);
      if (T.pathname !== d.pathname) {
        w.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }), w.end("Not found.");
        return;
      }
      const U = T.searchParams.get("state"), L = T.searchParams.get("code"), $ = T.searchParams.get("error"), F = T.searchParams.get("error_description");
      if ($) {
        w.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" }), w.end("Microsoft sign-in failed. You can close this window."), R.close(() => O(new Error(F || $)));
        return;
      }
      if (U !== i || !L) {
        w.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" }), w.end("Invalid sign-in response. You can close this window."), R.close(
          () => O(new Error("Invalid OAuth state or authorization code"))
        );
        return;
      }
      w.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" }), w.end(
        "Your Microsoft account is now connected. You can close this window."
      ), R.close(() => N(L));
    });
    R.once("error", (A) => O(A));
    const b = setTimeout(() => {
      R.close(
        () => O(new Error("Timed out waiting for Microsoft sign-in callback"))
      );
    }, yu);
    R.on("close", () => clearTimeout(b)), R.listen(Number(d.port), d.hostname, () => {
      ta.openExternal(h.toString()).catch((A) => {
        R.close(() => O(A));
      });
    });
  }), l = new URLSearchParams({
    client_id: e,
    grant_type: "authorization_code",
    code: c,
    redirect_uri: r,
    code_verifier: o,
    scope: n
  }), f = await fetch(`${a}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: l.toString()
  });
  if (!f.ok) {
    const N = await f.text();
    throw new Error(
      `Microsoft token exchange failed (${f.status}): ${N}`
    );
  }
  const p = await f.json(), g = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: {
      Authorization: `Bearer ${p.access_token}`
    }
  });
  if (!g.ok) {
    const N = await g.text();
    throw new Error(
      `Microsoft profile request failed (${g.status}): ${N}`
    );
  }
  const y = await g.json(), m = `ms-${y.id}`, _ = y.mail || y.userPrincipalName;
  if (!_)
    throw new Error("Microsoft profile did not include an email address");
  const I = un();
  return I[m] = {
    accountId: m,
    provider: "microsoft",
    accessToken: p.access_token,
    refreshToken: p.refresh_token,
    expiresAt: Date.now() + p.expires_in * 1e3,
    scope: p.scope,
    tokenType: p.token_type,
    clientId: e,
    tenantId: t,
    redirectUri: r,
    oauthScope: n
  }, oa(I), {
    account: {
      id: m,
      name: y.displayName || _,
      email: _,
      provider: "microsoft",
      externalId: y.id
    }
  };
});
pe.handle("microsoft-account:delete", async (e, t) => {
  const r = Ae(t?.accountId);
  oe.prepare("DELETE FROM emails WHERE accountId = ?").run(r);
  const n = un();
  return n[r] && (delete n[r], oa(n)), { success: !0 };
});
pe.handle("google-oauth:connect", async () => {
  const e = new URL(Or), t = tr(tt.randomBytes(64)), r = tr(tt.createHash("sha256").update(t).digest()), n = tr(tt.randomBytes(32)), o = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  o.search = new URLSearchParams({
    client_id: xr,
    response_type: "code",
    redirect_uri: Or,
    scope: Nc,
    access_type: "offline",
    prompt: "consent select_account",
    code_challenge_method: "S256",
    code_challenge: r,
    state: n
  }).toString();
  const s = await new Promise((p, g) => {
    const y = Mo.createServer((_, I) => {
      if (!_.url) return;
      const N = `${e.hostname}:${e.port}`;
      if (_.headers.host !== N) {
        I.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" }), I.end("Bad request.");
        return;
      }
      const O = new URL(_.url, Or);
      if (O.pathname !== e.pathname) {
        I.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }), I.end("Not found.");
        return;
      }
      const R = O.searchParams.get("state"), b = O.searchParams.get("code"), A = O.searchParams.get("error"), w = O.searchParams.get("error_description");
      if (A) {
        I.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" }), I.end("Google sign-in failed. You can close this window."), y.close(() => g(new Error(w || A)));
        return;
      }
      if (R !== n || !b) {
        I.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" }), I.end("Invalid sign-in response. You can close this window."), y.close(() => g(new Error("Invalid OAuth state or authorization code")));
        return;
      }
      I.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" }), I.end("Your Google account is now connected. You can close this window."), y.close(() => p(b));
    });
    y.once("error", (_) => g(_));
    const m = setTimeout(() => {
      y.close(() => g(new Error("Timed out waiting for Google sign-in callback")));
    }, yu);
    y.on("close", () => clearTimeout(m)), y.listen(Number(e.port), e.hostname, () => {
      ta.openExternal(o.toString()).catch((_) => {
        y.close(() => g(_));
      });
    });
  }), i = Th({
    clientId: xr,
    clientSecret: bu,
    code: s,
    redirectUri: Or,
    codeVerifier: t
  }), d = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: i.toString()
  });
  if (!d.ok) {
    const p = await d.text(), g = Ih({
      clientId: xr,
      redirectUri: Or
    });
    throw console.error("[google-oauth] token exchange failed", {
      status: d.status,
      errorText: p,
      ...g
    }), new Error(
      mu(
        d.status,
        p,
        g
      )
    );
  }
  const a = await d.json(), h = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${a.access_token}` }
  });
  if (!h.ok) {
    const p = await h.text();
    throw new Error(`Google profile request failed (${h.status}): ${p}`);
  }
  const c = await h.json();
  if (!c.email) throw new Error("Google profile did not include an email address");
  const l = `google-${c.id}`, f = Lr();
  return f[l] = {
    accountId: l,
    provider: "google",
    accessToken: a.access_token,
    refreshToken: a.refresh_token,
    expiresAt: Date.now() + a.expires_in * 1e3,
    scope: a.scope,
    tokenType: a.token_type,
    clientId: xr,
    oauthScope: Nc
  }, aa(f), Nu(l), {
    account: {
      id: l,
      name: c.name || c.email,
      email: c.email,
      provider: "google",
      externalId: c.id
    }
  };
});
pe.handle("google-account:delete", async (e, t) => {
  const r = Ae(t?.accountId);
  oe.prepare("DELETE FROM emails WHERE accountId = ?").run(r), oe.prepare("DELETE FROM folders WHERE accountId = ?").run(r);
  const n = Lr();
  return n[r] && (delete n[r], aa(n)), { success: !0 };
});
pe.handle("gmail:sync", async (e, t) => {
  const r = Ae(t?.accountId), n = await Vt(r);
  Nu(r);
  const o = [
    { labelId: "INBOX", max: 50 },
    { labelId: "SENT", max: 25 },
    { labelId: "DRAFT", max: 10 },
    { labelId: "STARRED", max: 10 },
    { labelId: "TRASH", max: 10 }
  ];
  for (const { labelId: s, max: i } of o)
    await Yh(n, r, s, i);
  return { messagesByFolder: Hu(r) };
});
pe.handle("gmail:get-body", async (e, t) => {
  const r = Ae(t?.accountId), n = Be(t?.messageId, "messageId", 2048), o = await Vt(r), s = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(n)}?format=full`,
    { headers: { Authorization: `Bearer ${o}` } }
  );
  if (!s.ok) {
    const h = await s.text();
    throw new Error(`Gmail get message failed (${s.status}): ${h}`);
  }
  const i = await s.json(), d = (i.labelIds ?? []).find(
    (h) => Cu.some((c) => c.id === h)
  ) ?? "INBOX";
  Du(r, d, i);
  const a = sa(i.payload);
  return { content: a.content, contentType: a.contentType };
});
pe.handle("gmail:send", async (e, t) => {
  const r = Ae(t?.accountId), n = Be(t?.to, "to", 4096), o = xe(t?.cc, "cc", 4096), s = xe(t?.subject, "subject", 512), i = xe(t?.body, "body", 5e5), d = await Vt(r);
  if (!Lr()[r]) throw new Error("No Google token stored for this account");
  const c = [
    `To: ${n}`,
    ...o ? [`Cc: ${o}`] : [],
    `Subject: ${s || "(No subject)"}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "",
    ia(i || " ")
  ], l = Buffer.from(c.join(`\r
`)).toString("base64url"), f = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${d}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ raw: l })
  });
  if (!f.ok) {
    const p = await f.text();
    throw new Error(`Gmail send failed (${f.status}): ${p}`);
  }
  return { success: !0 };
});
pe.handle("gmail:mark-read", async (e, t) => {
  const r = Ae(t?.accountId), n = Be(t?.messageId, "messageId", 2048), o = await Vt(r), s = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(n)}/modify`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${o}`, "Content-Type": "application/json" },
      body: JSON.stringify({ removeLabelIds: ["UNREAD"] })
    }
  );
  if (!s.ok) {
    const i = await s.text();
    throw new Error(`Gmail mark-read failed (${s.status}): ${i}`);
  }
  return oe.prepare("UPDATE emails SET isRead = 1 WHERE id = ? AND accountId = ?").run(n, r), { success: !0 };
});
pe.handle("gmail:mark-unread", async (e, t) => {
  const r = Ae(t?.accountId), n = Be(t?.messageId, "messageId", 2048), o = await Vt(r), s = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(n)}/modify`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${o}`, "Content-Type": "application/json" },
      body: JSON.stringify({ addLabelIds: ["UNREAD"] })
    }
  );
  if (!s.ok) {
    const i = await s.text();
    throw new Error(`Gmail mark-unread failed (${s.status}): ${i}`);
  }
  return oe.prepare("UPDATE emails SET isRead = 0 WHERE id = ? AND accountId = ?").run(n, r), { success: !0 };
});
pe.handle("gmail:toggle-star", async (e, t) => {
  const r = Ae(t?.accountId), n = Be(t?.messageId, "messageId", 2048), o = !!t?.isStarred, s = await Vt(r), i = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(n)}/modify`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${s}`, "Content-Type": "application/json" },
      body: JSON.stringify(
        o ? { addLabelIds: ["STARRED"] } : { removeLabelIds: ["STARRED"] }
      )
    }
  );
  if (!i.ok) {
    const d = await i.text();
    throw new Error(`Gmail toggle-star failed (${i.status}): ${d}`);
  }
  return oe.prepare("UPDATE emails SET isStarred = ? WHERE id = ? AND accountId = ?").run(
    o ? 1 : 0,
    n,
    r
  ), { success: !0 };
});
pe.handle("gmail:move", async (e, t) => {
  const r = Ae(t?.accountId), n = Be(t?.messageId, "messageId", 2048), o = Be(t?.destination, "destination", 64).toUpperCase();
  if (!(/* @__PURE__ */ new Set(["INBOX", "TRASH", "SPAM", "DRAFT", "ARCHIVE"])).has(o)) throw new Error("Invalid Gmail destination label");
  const i = await Vt(r), { addLabelIds: d, removeLabelIds: a } = vh(o), h = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(n)}/modify`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${i}`, "Content-Type": "application/json" },
      body: JSON.stringify({ addLabelIds: d, removeLabelIds: a })
    }
  );
  if (!h.ok) {
    const c = await h.text();
    throw new Error(`Gmail move failed (${h.status}): ${c}`);
  }
  return oe.prepare("UPDATE emails SET folder = ? WHERE id = ? AND accountId = ?").run(
    o,
    n,
    r
  ), { success: !0 };
});
pe.handle("microsoft-mail:send", async (e, t) => {
  const r = Ae(t?.accountId), n = Be(t?.to, "to", 4096), o = xe(t?.cc, "cc", 4096), s = xe(t?.subject, "subject", 512), i = xe(t?.body, "body", 5e5), d = await Ye(r), a = {
    message: {
      subject: s || "(No subject)",
      body: {
        contentType: "html",
        content: ia(i || " ")
      },
      toRecipients: Cc(n),
      ccRecipients: Cc(o)
    },
    saveToSentItems: !0
  }, h = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${d}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(a)
  });
  if (!h.ok) {
    const c = await h.text();
    throw new Error(`Failed to send email: ${c}`);
  }
  return { success: !0 };
});
pe.handle("microsoft-mail:reply", async (e, t) => {
  const r = Ae(t?.accountId), n = wt(t?.messageId), o = xe(t?.comment, "comment", 5e5), s = await Ye(r), i = encodeURIComponent(n), d = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages/${i}/reply`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${s}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(yh(o || ""))
    }
  );
  if (!d.ok) {
    const a = await d.text();
    throw new Error(`Failed to reply to email: ${a}`);
  }
  return { success: !0 };
});
pe.handle("microsoft-mail:syncInbox", async (e, t) => {
  const r = Ae(t?.accountId);
  if (Et.has(r))
    return Et.get(r);
  const n = (async () => {
    try {
      if (ca(r))
        return await Sn(r);
      const o = Oh(r);
      return await xu(r, [o]);
    } finally {
      Et.delete(r);
    }
  })();
  return Et.set(r, n), n;
});
pe.handle("labels:list", (e, t) => {
  const r = Ae(t?.accountId);
  return np(r);
});
pe.handle("labels:delete", (e, t) => {
  const r = Ae(t?.accountId), n = _n(t?.labelId);
  if (oe.transaction(() => (oe.prepare(
    `
      DELETE FROM email_labels
      WHERE accountId = ? AND labelId = ?
    `
  ).run(r, n), oe.prepare(
    `
      DELETE FROM labels
      WHERE accountId = ? AND id = ?
    `
  ).run(r, n)))().changes === 0)
    throw new Error("Label not found");
  return { success: !0 };
});
pe.handle("labels:remove-email", (e, t) => {
  const r = Ae(t?.accountId), n = wt(t?.messageId), o = _n(t?.labelId);
  return oe.prepare(
    `
    DELETE FROM email_labels
    WHERE accountId = ? AND messageId = ? AND labelId = ?
  `
  ).run(r, n, o), { success: !0 };
});
pe.handle("microsoft-mail:mark-read", async (e, t) => {
  const r = Ae(t?.accountId), n = wt(t?.messageId), o = Eh(t?.isRead);
  oe.prepare(
    "UPDATE emails SET isRead = ? WHERE id = ? AND accountId = ?"
  ).run(o ? 1 : 0, n, r);
  const s = await Ye(r), i = encodeURIComponent(n), d = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages/${i}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${s}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ isRead: o })
    }
  );
  if (!d.ok) {
    const a = await d.text();
    if (d.status === 404 || a.includes("ErrorItemNotFound"))
      return oe.prepare("DELETE FROM emails WHERE accountId = ? AND id = ?").run(
        r,
        n
      ), { success: !1, missing: !0 };
    throw new Error(`Failed to mark message as read: ${a}`);
  }
  return { success: !0 };
});
pe.handle("microsoft-mail:mark-unread", async (e, t) => {
  const r = Ae(t?.accountId), n = wt(t?.messageId), o = await Ye(r), s = encodeURIComponent(n), i = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages/${s}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${o}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ isRead: !1 })
    }
  );
  if (!i.ok) {
    const d = await i.text();
    if (i.status === 404 || d.includes("ErrorItemNotFound"))
      return oe.prepare("DELETE FROM emails WHERE accountId = ? AND id = ?").run(
        r,
        n
      ), { success: !1, missing: !0 };
    throw new Error(`Failed to mark message as unread: ${d}`);
  }
  return oe.prepare("UPDATE emails SET isRead = 0 WHERE accountId = ? AND id = ?").run(
    r,
    n
  ), { success: !0 };
});
pe.handle("microsoft-mail:getAllLocal", () => {
  const e = oe.prepare(
    "SELECT * FROM folders ORDER BY accountId, path COLLATE NOCASE ASC"
  ).all(), t = oe.prepare(
    `
    SELECT
      id, accountId, folder, subject, bodyPreview, bodyContentType, bodyContent,
      receivedDateTime, isRead, hasAttachments, isStarred, attachments,
      fromName, fromAddress, toRecipients, ccRecipients
    FROM emails
    ORDER BY receivedDateTime DESC
  `
  ).all(), r = {};
  for (const i of e)
    r[i.id] = qu(
      t.filter((d) => d.folder === i.id)
    );
  const n = oe.prepare("SELECT * FROM labels ORDER BY accountId, name COLLATE NOCASE ASC").all(), s = oe.prepare(
    `
    SELECT el.messageId, l.id, l.accountId, l.name, l.color, l.createdAt, l.updatedAt
    FROM email_labels el
    INNER JOIN labels l ON l.id = el.labelId AND l.accountId = el.accountId
    ORDER BY l.name COLLATE NOCASE ASC
  `
  ).all().reduce(
    (i, d) => (i[d.messageId] || (i[d.messageId] = []), i[d.messageId].push({
      id: d.id,
      accountId: d.accountId,
      name: d.name,
      color: d.color,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt
    }), i),
    {}
  );
  return { folders: e, messagesByFolder: r, labels: n, labelsByMessageId: s };
});
pe.handle("microsoft-mail:sync", async (e, t) => {
  const r = Ae(t?.accountId);
  if (Et.has(r))
    return Et.get(r);
  const n = (async () => {
    try {
      return ca(r) ? await Sn(r) : await Lu(r);
    } finally {
      Et.delete(r);
    }
  })();
  return Et.set(r, n), n;
});
pe.handle("microsoft-mail:list", async (e, t) => {
  const r = Ae(t?.accountId);
  return Mu(r) ? await Lu(r) : await Sn(r), { messagesByFolder: Hu(r) };
});
pe.removeHandler("microsoft-mail:get-body");
pe.removeHandler("microsoft-mail:get-body");
pe.handle("microsoft-mail:get-body", async (e, t) => {
  const r = Ae(t?.accountId), n = wt(t?.messageId), o = oe.prepare(
    `
      SELECT
        id,
        accountId,
        bodyContent,
        bodyContentType,
        bodyPreview,
        hasAttachments,
        attachments
      FROM emails
      WHERE accountId = ?
        AND id = ?
      LIMIT 1
    `
  ).get(r, n);
  if (!o)
    throw new Error("Message not found locally.");
  const s = gu(o.attachments);
  if (Sh({
    bodyContent: o.bodyContent,
    hasAttachments: !!o.hasAttachments,
    attachmentsJson: o.attachments
  }))
    return {
      success: !0,
      body: {
        content: o.bodyContent,
        contentType: o.bodyContentType || "html"
      },
      attachments: s,
      source: "local"
    };
  const i = await Ye(r), d = `https://graph.microsoft.com/v1.0/me/messages/${encodeURIComponent(
    n
  )}?$select=${encodeURIComponent("id,body,bodyPreview")}&$expand=${encodeURIComponent(
    "attachments($select=id,name,size,contentType,isInline)"
  )}`, a = await fetch(d, {
    headers: {
      Authorization: `Bearer ${i}`,
      Prefer: 'outlook.body-content-type="html", IdType="ImmutableId"'
    }
  });
  if (!a.ok) {
    const p = await a.text();
    if (console.error("Failed to fetch message body from Microsoft Graph:", {
      status: a.status,
      accountId: r,
      messageId: n,
      errorText: p
    }), o.bodyPreview?.trim())
      return {
        success: !0,
        body: {
          content: `<p>${Nh(o.bodyPreview).replace(
            /\n/g,
            "<br/>"
          )}</p>`,
          contentType: "html"
        },
        source: "preview-fallback",
        warning: "Could not fetch the full email body from Microsoft Graph. Showing preview instead."
      };
    throw new Error(
      `Cannot access full message body. Microsoft Graph returned ${a.status}.`
    );
  }
  const h = await a.json(), c = h.body?.content || "", l = h.body?.contentType || "html", f = Array.isArray(h.attachments) ? h.attachments.filter(
    (p) => String(p?.["@odata.type"] || "").includes("fileAttachment")
  ).map((p) => ({
    id: p.id || "",
    name: p.name || "Unknown File",
    size: p.size || 0,
    contentType: p.contentType || "application/octet-stream",
    isInline: !!p.isInline,
    contentId: p.contentId || void 0
  })).filter((p) => p.id) : [];
  return oe.prepare(
    `
    UPDATE emails
    SET
      bodyContent = ?,
      bodyContentType = ?,
      attachments = ?,
      bodyPreview = CASE
        WHEN ? <> '' THEN ?
        ELSE bodyPreview
      END
    WHERE accountId = ?
      AND id = ?
  `
  ).run(
    c,
    l,
    JSON.stringify(f),
    h.bodyPreview || "",
    h.bodyPreview || "",
    r,
    n
  ), {
    success: !0,
    body: {
      content: c,
      contentType: l
    },
    attachments: f,
    source: "graph"
  };
});
pe.handle("microsoft-mail:move-to-folder", async (e, t) => {
  const r = Ae(t?.accountId), n = wt(t?.messageId), o = or(t?.destinationFolderId);
  if (!oe.prepare(
    `
      SELECT id
      FROM folders
      WHERE accountId = ? AND id = ?
      LIMIT 1
    `
  ).get(r, o))
    throw new Error("Destination folder not found");
  if (!oe.prepare(
    `
      SELECT id
      FROM emails
      WHERE accountId = ? AND id = ?
      LIMIT 1
    `
  ).get(r, n))
    throw new Error("Email not found");
  const d = await Ye(r), a = await Uu(
    d,
    n,
    o
  );
  return oe.transaction(() => {
    oe.prepare(
      `
      DELETE FROM emails
      WHERE accountId = ? AND id = ?
    `
    ).run(r, n), oe.prepare(
      `
      INSERT OR REPLACE INTO emails (
        id,
        accountId,
        folder,
        subject,
        bodyPreview,
        receivedDateTime,
        isRead,
        hasAttachments,
        fromName,
        fromAddress,
        toRecipients,
        ccRecipients
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      a.id,
      r,
      o,
      a.subject || "",
      a.bodyPreview || "",
      a.receivedDateTime || "",
      a.isRead ? 1 : 0,
      a.hasAttachments ? 1 : 0,
      a.from?.emailAddress?.name || "",
      a.from?.emailAddress?.address || "",
      JSON.stringify(a.toRecipients || []),
      JSON.stringify(a.ccRecipients || [])
    );
  })(), {
    success: !0,
    messageId: a.id,
    destinationFolderId: o
  };
});
pe.handle("microsoft-mail:move", async (e, t) => {
  const r = Ae(t?.accountId), n = wt(t?.messageId), o = Wh(
    t?.destinationFolder
  ), s = await Ye(r), i = encodeURIComponent(n), a = oe.prepare(
    `
    SELECT id FROM folders 
    WHERE accountId = ? AND wellKnownName = ? 
    LIMIT 1
  `
  ).get(r, o)?.id || o, h = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages/${i}/move`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${s}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        destinationId: o
      })
    }
  );
  if (!h.ok) {
    const l = await h.text();
    if (h.status === 404 || l.includes("ErrorItemNotFound"))
      return oe.prepare("DELETE FROM emails WHERE accountId = ? AND id = ?").run(
        r,
        n
      ), {
        success: !1,
        alreadyMovedOrMissing: !0,
        message: "Message was not found on the server. Local stale copy was removed."
      };
    throw new Error(`Failed to move message on server: ${l}`);
  }
  const c = await h.json();
  return c.id ? oe.prepare(
    "UPDATE emails SET folder = ?, id = ? WHERE accountId = ? AND id = ?"
  ).run(a, c.id, r, n) : oe.prepare(
    "UPDATE emails SET folder = ? WHERE accountId = ? AND id = ?"
  ).run(a, r, n), { success: !0 };
});
const lp = [
  "default-src 'self'",
  "script-src 'self'",
  // unsafe-inline is required for React inline style props
  "style-src 'self' 'unsafe-inline'",
  // https: covers remote email images inside the sandboxed iframe
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'"
].join("; "), cp = [
  "default-src 'self' http://localhost:* ws://localhost:*",
  "script-src 'self' http://localhost:* 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' http://localhost:*",
  "img-src 'self' data: blob: https: http://localhost:*",
  "font-src 'self' data: http://localhost:*",
  "connect-src 'self' ws://localhost:* http://localhost:*",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'"
].join("; ");
Ve.whenReady().then(() => {
  cn.session.defaultSession.webRequest.onHeadersReceived(
    (e, t) => {
      t({
        responseHeaders: {
          ...e.responseHeaders,
          "Content-Security-Policy": [
            Ve.isPackaged ? lp : cp
          ]
        }
      });
    }
  ), cn.session.defaultSession.setPermissionRequestHandler(
    (e, t, r) => r(!1)
  ), ju(), Ve.isPackaged && setTimeout(() => {
    mt.autoUpdater.checkForUpdates().catch((e) => {
      console.error("[updater] Startup check failed:", e?.message ?? e);
    });
  }, 5e3);
});
Ve.on("window-all-closed", () => {
  process.platform !== "darwin" && Ve.quit();
});
Ve.on("activate", () => {
  ft.getAllWindows().length === 0 && ju();
});
