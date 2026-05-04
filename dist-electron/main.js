import * as Ge from "fs";
import At from "fs";
import yd from "constants";
import Dr from "stream";
import Oo from "util";
import Ec from "assert";
import * as ct from "path";
import Le from "path";
import an from "child_process";
import yc from "events";
import dt from "crypto";
import vc from "tty";
import Pr from "os";
import Nt, { fileURLToPath as vd } from "url";
import * as on from "electron";
import Ht from "electron";
import wc from "zlib";
import _c from "http";
import wd from "better-sqlite3";
var ut = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, $t = {}, _n = {}, Gr = {}, ca;
function nt() {
  return ca || (ca = 1, Gr.fromCallback = function(e) {
    return Object.defineProperty(function(...t) {
      if (typeof t[t.length - 1] == "function") e.apply(this, t);
      else
        return new Promise((r, i) => {
          t.push((s, a) => s != null ? i(s) : r(a)), e.apply(this, t);
        });
    }, "name", { value: e.name });
  }, Gr.fromPromise = function(e) {
    return Object.defineProperty(function(...t) {
      const r = t[t.length - 1];
      if (typeof r != "function") return e.apply(this, t);
      t.pop(), e.apply(this, t).then((i) => r(null, i), r);
    }, "name", { value: e.name });
  }), Gr;
}
var Tn, ua;
function _d() {
  if (ua) return Tn;
  ua = 1;
  var e = yd, t = process.cwd, r = null, i = process.env.GRACEFUL_FS_PLATFORM || process.platform;
  process.cwd = function() {
    return r || (r = t.call(process)), r;
  };
  try {
    process.cwd();
  } catch {
  }
  if (typeof process.chdir == "function") {
    var s = process.chdir;
    process.chdir = function(n) {
      r = null, s.call(process, n);
    }, Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, s);
  }
  Tn = a;
  function a(n) {
    e.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && f(n), n.lutimes || o(n), n.chown = l(n.chown), n.fchown = l(n.fchown), n.lchown = l(n.lchown), n.chmod = h(n.chmod), n.fchmod = h(n.fchmod), n.lchmod = h(n.lchmod), n.chownSync = u(n.chownSync), n.fchownSync = u(n.fchownSync), n.lchownSync = u(n.lchownSync), n.chmodSync = d(n.chmodSync), n.fchmodSync = d(n.fchmodSync), n.lchmodSync = d(n.lchmodSync), n.stat = p(n.stat), n.fstat = p(n.fstat), n.lstat = p(n.lstat), n.statSync = E(n.statSync), n.fstatSync = E(n.fstatSync), n.lstatSync = E(n.lstatSync), n.chmod && !n.lchmod && (n.lchmod = function(m, T, A) {
      A && process.nextTick(A);
    }, n.lchmodSync = function() {
    }), n.chown && !n.lchown && (n.lchown = function(m, T, A, N) {
      N && process.nextTick(N);
    }, n.lchownSync = function() {
    }), i === "win32" && (n.rename = typeof n.rename != "function" ? n.rename : (function(m) {
      function T(A, N, D) {
        var I = Date.now(), b = 0;
        m(A, N, function S(w) {
          if (w && (w.code === "EACCES" || w.code === "EPERM" || w.code === "EBUSY") && Date.now() - I < 6e4) {
            setTimeout(function() {
              n.stat(N, function(C, _) {
                C && C.code === "ENOENT" ? m(A, N, S) : D(w);
              });
            }, b), b < 100 && (b += 10);
            return;
          }
          D && D(w);
        });
      }
      return Object.setPrototypeOf && Object.setPrototypeOf(T, m), T;
    })(n.rename)), n.read = typeof n.read != "function" ? n.read : (function(m) {
      function T(A, N, D, I, b, S) {
        var w;
        if (S && typeof S == "function") {
          var C = 0;
          w = function(_, U, x) {
            if (_ && _.code === "EAGAIN" && C < 10)
              return C++, m.call(n, A, N, D, I, b, w);
            S.apply(this, arguments);
          };
        }
        return m.call(n, A, N, D, I, b, w);
      }
      return Object.setPrototypeOf && Object.setPrototypeOf(T, m), T;
    })(n.read), n.readSync = typeof n.readSync != "function" ? n.readSync : /* @__PURE__ */ (function(m) {
      return function(T, A, N, D, I) {
        for (var b = 0; ; )
          try {
            return m.call(n, T, A, N, D, I);
          } catch (S) {
            if (S.code === "EAGAIN" && b < 10) {
              b++;
              continue;
            }
            throw S;
          }
      };
    })(n.readSync);
    function f(m) {
      m.lchmod = function(T, A, N) {
        m.open(
          T,
          e.O_WRONLY | e.O_SYMLINK,
          A,
          function(D, I) {
            if (D) {
              N && N(D);
              return;
            }
            m.fchmod(I, A, function(b) {
              m.close(I, function(S) {
                N && N(b || S);
              });
            });
          }
        );
      }, m.lchmodSync = function(T, A) {
        var N = m.openSync(T, e.O_WRONLY | e.O_SYMLINK, A), D = !0, I;
        try {
          I = m.fchmodSync(N, A), D = !1;
        } finally {
          if (D)
            try {
              m.closeSync(N);
            } catch {
            }
          else
            m.closeSync(N);
        }
        return I;
      };
    }
    function o(m) {
      e.hasOwnProperty("O_SYMLINK") && m.futimes ? (m.lutimes = function(T, A, N, D) {
        m.open(T, e.O_SYMLINK, function(I, b) {
          if (I) {
            D && D(I);
            return;
          }
          m.futimes(b, A, N, function(S) {
            m.close(b, function(w) {
              D && D(S || w);
            });
          });
        });
      }, m.lutimesSync = function(T, A, N) {
        var D = m.openSync(T, e.O_SYMLINK), I, b = !0;
        try {
          I = m.futimesSync(D, A, N), b = !1;
        } finally {
          if (b)
            try {
              m.closeSync(D);
            } catch {
            }
          else
            m.closeSync(D);
        }
        return I;
      }) : m.futimes && (m.lutimes = function(T, A, N, D) {
        D && process.nextTick(D);
      }, m.lutimesSync = function() {
      });
    }
    function h(m) {
      return m && function(T, A, N) {
        return m.call(n, T, A, function(D) {
          y(D) && (D = null), N && N.apply(this, arguments);
        });
      };
    }
    function d(m) {
      return m && function(T, A) {
        try {
          return m.call(n, T, A);
        } catch (N) {
          if (!y(N)) throw N;
        }
      };
    }
    function l(m) {
      return m && function(T, A, N, D) {
        return m.call(n, T, A, N, function(I) {
          y(I) && (I = null), D && D.apply(this, arguments);
        });
      };
    }
    function u(m) {
      return m && function(T, A, N) {
        try {
          return m.call(n, T, A, N);
        } catch (D) {
          if (!y(D)) throw D;
        }
      };
    }
    function p(m) {
      return m && function(T, A, N) {
        typeof A == "function" && (N = A, A = null);
        function D(I, b) {
          b && (b.uid < 0 && (b.uid += 4294967296), b.gid < 0 && (b.gid += 4294967296)), N && N.apply(this, arguments);
        }
        return A ? m.call(n, T, A, D) : m.call(n, T, D);
      };
    }
    function E(m) {
      return m && function(T, A) {
        var N = A ? m.call(n, T, A) : m.call(n, T);
        return N && (N.uid < 0 && (N.uid += 4294967296), N.gid < 0 && (N.gid += 4294967296)), N;
      };
    }
    function y(m) {
      if (!m || m.code === "ENOSYS")
        return !0;
      var T = !process.getuid || process.getuid() !== 0;
      return !!(T && (m.code === "EINVAL" || m.code === "EPERM"));
    }
  }
  return Tn;
}
var An, da;
function Td() {
  if (da) return An;
  da = 1;
  var e = Dr.Stream;
  An = t;
  function t(r) {
    return {
      ReadStream: i,
      WriteStream: s
    };
    function i(a, n) {
      if (!(this instanceof i)) return new i(a, n);
      e.call(this);
      var f = this;
      this.path = a, this.fd = null, this.readable = !0, this.paused = !1, this.flags = "r", this.mode = 438, this.bufferSize = 64 * 1024, n = n || {};
      for (var o = Object.keys(n), h = 0, d = o.length; h < d; h++) {
        var l = o[h];
        this[l] = n[l];
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
          f._read();
        });
        return;
      }
      r.open(this.path, this.flags, this.mode, function(u, p) {
        if (u) {
          f.emit("error", u), f.readable = !1;
          return;
        }
        f.fd = p, f.emit("open", p), f._read();
      });
    }
    function s(a, n) {
      if (!(this instanceof s)) return new s(a, n);
      e.call(this), this.path = a, this.fd = null, this.writable = !0, this.flags = "w", this.encoding = "binary", this.mode = 438, this.bytesWritten = 0, n = n || {};
      for (var f = Object.keys(n), o = 0, h = f.length; o < h; o++) {
        var d = f[o];
        this[d] = n[d];
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
  return An;
}
var Rn, fa;
function Ad() {
  if (fa) return Rn;
  fa = 1, Rn = t;
  var e = Object.getPrototypeOf || function(r) {
    return r.__proto__;
  };
  function t(r) {
    if (r === null || typeof r != "object")
      return r;
    if (r instanceof Object)
      var i = { __proto__: e(r) };
    else
      var i = /* @__PURE__ */ Object.create(null);
    return Object.getOwnPropertyNames(r).forEach(function(s) {
      Object.defineProperty(i, s, Object.getOwnPropertyDescriptor(r, s));
    }), i;
  }
  return Rn;
}
var Wr, ha;
function et() {
  if (ha) return Wr;
  ha = 1;
  var e = At, t = _d(), r = Td(), i = Ad(), s = Oo, a, n;
  typeof Symbol == "function" && typeof Symbol.for == "function" ? (a = /* @__PURE__ */ Symbol.for("graceful-fs.queue"), n = /* @__PURE__ */ Symbol.for("graceful-fs.previous")) : (a = "___graceful-fs.queue", n = "___graceful-fs.previous");
  function f() {
  }
  function o(m, T) {
    Object.defineProperty(m, a, {
      get: function() {
        return T;
      }
    });
  }
  var h = f;
  if (s.debuglog ? h = s.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (h = function() {
    var m = s.format.apply(s, arguments);
    m = "GFS4: " + m.split(/\n/).join(`
GFS4: `), console.error(m);
  }), !e[a]) {
    var d = ut[a] || [];
    o(e, d), e.close = (function(m) {
      function T(A, N) {
        return m.call(e, A, function(D) {
          D || E(), typeof N == "function" && N.apply(this, arguments);
        });
      }
      return Object.defineProperty(T, n, {
        value: m
      }), T;
    })(e.close), e.closeSync = (function(m) {
      function T(A) {
        m.apply(e, arguments), E();
      }
      return Object.defineProperty(T, n, {
        value: m
      }), T;
    })(e.closeSync), /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && process.on("exit", function() {
      h(e[a]), Ec.equal(e[a].length, 0);
    });
  }
  ut[a] || o(ut, e[a]), Wr = l(i(e)), process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !e.__patched && (Wr = l(e), e.__patched = !0);
  function l(m) {
    t(m), m.gracefulify = l, m.createReadStream = pe, m.createWriteStream = Z;
    var T = m.readFile;
    m.readFile = A;
    function A(Q, de, ve) {
      return typeof de == "function" && (ve = de, de = null), Re(Q, de, ve);
      function Re(Ne, Ce, Ae, v) {
        return T(Ne, Ce, function(g) {
          g && (g.code === "EMFILE" || g.code === "ENFILE") ? u([Re, [Ne, Ce, Ae], g, v || Date.now(), Date.now()]) : typeof Ae == "function" && Ae.apply(this, arguments);
        });
      }
    }
    var N = m.writeFile;
    m.writeFile = D;
    function D(Q, de, ve, Re) {
      return typeof ve == "function" && (Re = ve, ve = null), Ne(Q, de, ve, Re);
      function Ne(Ce, Ae, v, g, q) {
        return N(Ce, Ae, v, function(P) {
          P && (P.code === "EMFILE" || P.code === "ENFILE") ? u([Ne, [Ce, Ae, v, g], P, q || Date.now(), Date.now()]) : typeof g == "function" && g.apply(this, arguments);
        });
      }
    }
    var I = m.appendFile;
    I && (m.appendFile = b);
    function b(Q, de, ve, Re) {
      return typeof ve == "function" && (Re = ve, ve = null), Ne(Q, de, ve, Re);
      function Ne(Ce, Ae, v, g, q) {
        return I(Ce, Ae, v, function(P) {
          P && (P.code === "EMFILE" || P.code === "ENFILE") ? u([Ne, [Ce, Ae, v, g], P, q || Date.now(), Date.now()]) : typeof g == "function" && g.apply(this, arguments);
        });
      }
    }
    var S = m.copyFile;
    S && (m.copyFile = w);
    function w(Q, de, ve, Re) {
      return typeof ve == "function" && (Re = ve, ve = 0), Ne(Q, de, ve, Re);
      function Ne(Ce, Ae, v, g, q) {
        return S(Ce, Ae, v, function(P) {
          P && (P.code === "EMFILE" || P.code === "ENFILE") ? u([Ne, [Ce, Ae, v, g], P, q || Date.now(), Date.now()]) : typeof g == "function" && g.apply(this, arguments);
        });
      }
    }
    var C = m.readdir;
    m.readdir = U;
    var _ = /^v[0-5]\./;
    function U(Q, de, ve) {
      typeof de == "function" && (ve = de, de = null);
      var Re = _.test(process.version) ? function(Ae, v, g, q) {
        return C(Ae, Ne(
          Ae,
          v,
          g,
          q
        ));
      } : function(Ae, v, g, q) {
        return C(Ae, v, Ne(
          Ae,
          v,
          g,
          q
        ));
      };
      return Re(Q, de, ve);
      function Ne(Ce, Ae, v, g) {
        return function(q, P) {
          q && (q.code === "EMFILE" || q.code === "ENFILE") ? u([
            Re,
            [Ce, Ae, v],
            q,
            g || Date.now(),
            Date.now()
          ]) : (P && P.sort && P.sort(), typeof v == "function" && v.call(this, q, P));
        };
      }
    }
    if (process.version.substr(0, 4) === "v0.8") {
      var x = r(m);
      k = x.ReadStream, Y = x.WriteStream;
    }
    var $ = m.ReadStream;
    $ && (k.prototype = Object.create($.prototype), k.prototype.open = G);
    var F = m.WriteStream;
    F && (Y.prototype = Object.create(F.prototype), Y.prototype.open = ee), Object.defineProperty(m, "ReadStream", {
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
        return Y;
      },
      set: function(Q) {
        Y = Q;
      },
      enumerable: !0,
      configurable: !0
    });
    var L = k;
    Object.defineProperty(m, "FileReadStream", {
      get: function() {
        return L;
      },
      set: function(Q) {
        L = Q;
      },
      enumerable: !0,
      configurable: !0
    });
    var j = Y;
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
      me(Q.path, Q.flags, Q.mode, function(de, ve) {
        de ? (Q.autoClose && Q.destroy(), Q.emit("error", de)) : (Q.fd = ve, Q.emit("open", ve), Q.read());
      });
    }
    function Y(Q, de) {
      return this instanceof Y ? (F.apply(this, arguments), this) : Y.apply(Object.create(Y.prototype), arguments);
    }
    function ee() {
      var Q = this;
      me(Q.path, Q.flags, Q.mode, function(de, ve) {
        de ? (Q.destroy(), Q.emit("error", de)) : (Q.fd = ve, Q.emit("open", ve));
      });
    }
    function pe(Q, de) {
      return new m.ReadStream(Q, de);
    }
    function Z(Q, de) {
      return new m.WriteStream(Q, de);
    }
    var ye = m.open;
    m.open = me;
    function me(Q, de, ve, Re) {
      return typeof ve == "function" && (Re = ve, ve = null), Ne(Q, de, ve, Re);
      function Ne(Ce, Ae, v, g, q) {
        return ye(Ce, Ae, v, function(P, _e) {
          P && (P.code === "EMFILE" || P.code === "ENFILE") ? u([Ne, [Ce, Ae, v, g], P, q || Date.now(), Date.now()]) : typeof g == "function" && g.apply(this, arguments);
        });
      }
    }
    return m;
  }
  function u(m) {
    h("ENQUEUE", m[0].name, m[1]), e[a].push(m), y();
  }
  var p;
  function E() {
    for (var m = Date.now(), T = 0; T < e[a].length; ++T)
      e[a][T].length > 2 && (e[a][T][3] = m, e[a][T][4] = m);
    y();
  }
  function y() {
    if (clearTimeout(p), p = void 0, e[a].length !== 0) {
      var m = e[a].shift(), T = m[0], A = m[1], N = m[2], D = m[3], I = m[4];
      if (D === void 0)
        h("RETRY", T.name, A), T.apply(null, A);
      else if (Date.now() - D >= 6e4) {
        h("TIMEOUT", T.name, A);
        var b = A.pop();
        typeof b == "function" && b.call(null, N);
      } else {
        var S = Date.now() - I, w = Math.max(I - D, 1), C = Math.min(w * 1.2, 100);
        S >= C ? (h("RETRY", T.name, A), T.apply(null, A.concat([D]))) : e[a].push(m);
      }
      p === void 0 && (p = setTimeout(y, 0));
    }
  }
  return Wr;
}
var pa;
function er() {
  return pa || (pa = 1, (function(e) {
    const t = nt().fromCallback, r = et(), i = [
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
    ].filter((s) => typeof r[s] == "function");
    Object.assign(e, r), i.forEach((s) => {
      e[s] = t(r[s]);
    }), e.exists = function(s, a) {
      return typeof a == "function" ? r.exists(s, a) : new Promise((n) => r.exists(s, n));
    }, e.read = function(s, a, n, f, o, h) {
      return typeof h == "function" ? r.read(s, a, n, f, o, h) : new Promise((d, l) => {
        r.read(s, a, n, f, o, (u, p, E) => {
          if (u) return l(u);
          d({ bytesRead: p, buffer: E });
        });
      });
    }, e.write = function(s, a, ...n) {
      return typeof n[n.length - 1] == "function" ? r.write(s, a, ...n) : new Promise((f, o) => {
        r.write(s, a, ...n, (h, d, l) => {
          if (h) return o(h);
          f({ bytesWritten: d, buffer: l });
        });
      });
    }, typeof r.writev == "function" && (e.writev = function(s, a, ...n) {
      return typeof n[n.length - 1] == "function" ? r.writev(s, a, ...n) : new Promise((f, o) => {
        r.writev(s, a, ...n, (h, d, l) => {
          if (h) return o(h);
          f({ bytesWritten: d, buffers: l });
        });
      });
    }), typeof r.realpath.native == "function" ? e.realpath.native = t(r.realpath.native) : process.emitWarning(
      "fs.realpath.native is not a function. Is fs being monkey-patched?",
      "Warning",
      "fs-extra-WARN0003"
    );
  })(_n)), _n;
}
var Vr = {}, Sn = {}, ma;
function Rd() {
  if (ma) return Sn;
  ma = 1;
  const e = Le;
  return Sn.checkPath = function(r) {
    if (process.platform === "win32" && /[<>:"|?*]/.test(r.replace(e.parse(r).root, ""))) {
      const s = new Error(`Path contains invalid characters: ${r}`);
      throw s.code = "EINVAL", s;
    }
  }, Sn;
}
var ga;
function Sd() {
  if (ga) return Vr;
  ga = 1;
  const e = /* @__PURE__ */ er(), { checkPath: t } = /* @__PURE__ */ Rd(), r = (i) => {
    const s = { mode: 511 };
    return typeof i == "number" ? i : { ...s, ...i }.mode;
  };
  return Vr.makeDir = async (i, s) => (t(i), e.mkdir(i, {
    mode: r(s),
    recursive: !0
  })), Vr.makeDirSync = (i, s) => (t(i), e.mkdirSync(i, {
    mode: r(s),
    recursive: !0
  })), Vr;
}
var In, Ea;
function yt() {
  if (Ea) return In;
  Ea = 1;
  const e = nt().fromPromise, { makeDir: t, makeDirSync: r } = /* @__PURE__ */ Sd(), i = e(t);
  return In = {
    mkdirs: i,
    mkdirsSync: r,
    // alias
    mkdirp: i,
    mkdirpSync: r,
    ensureDir: i,
    ensureDirSync: r
  }, In;
}
var bn, ya;
function jt() {
  if (ya) return bn;
  ya = 1;
  const e = nt().fromPromise, t = /* @__PURE__ */ er();
  function r(i) {
    return t.access(i).then(() => !0).catch(() => !1);
  }
  return bn = {
    pathExists: e(r),
    pathExistsSync: t.existsSync
  }, bn;
}
var Cn, va;
function Tc() {
  if (va) return Cn;
  va = 1;
  const e = et();
  function t(i, s, a, n) {
    e.open(i, "r+", (f, o) => {
      if (f) return n(f);
      e.futimes(o, s, a, (h) => {
        e.close(o, (d) => {
          n && n(h || d);
        });
      });
    });
  }
  function r(i, s, a) {
    const n = e.openSync(i, "r+");
    return e.futimesSync(n, s, a), e.closeSync(n);
  }
  return Cn = {
    utimesMillis: t,
    utimesMillisSync: r
  }, Cn;
}
var Nn, wa;
function tr() {
  if (wa) return Nn;
  wa = 1;
  const e = /* @__PURE__ */ er(), t = Le, r = Oo;
  function i(u, p, E) {
    const y = E.dereference ? (m) => e.stat(m, { bigint: !0 }) : (m) => e.lstat(m, { bigint: !0 });
    return Promise.all([
      y(u),
      y(p).catch((m) => {
        if (m.code === "ENOENT") return null;
        throw m;
      })
    ]).then(([m, T]) => ({ srcStat: m, destStat: T }));
  }
  function s(u, p, E) {
    let y;
    const m = E.dereference ? (A) => e.statSync(A, { bigint: !0 }) : (A) => e.lstatSync(A, { bigint: !0 }), T = m(u);
    try {
      y = m(p);
    } catch (A) {
      if (A.code === "ENOENT") return { srcStat: T, destStat: null };
      throw A;
    }
    return { srcStat: T, destStat: y };
  }
  function a(u, p, E, y, m) {
    r.callbackify(i)(u, p, y, (T, A) => {
      if (T) return m(T);
      const { srcStat: N, destStat: D } = A;
      if (D) {
        if (h(N, D)) {
          const I = t.basename(u), b = t.basename(p);
          return E === "move" && I !== b && I.toLowerCase() === b.toLowerCase() ? m(null, { srcStat: N, destStat: D, isChangingCase: !0 }) : m(new Error("Source and destination must not be the same."));
        }
        if (N.isDirectory() && !D.isDirectory())
          return m(new Error(`Cannot overwrite non-directory '${p}' with directory '${u}'.`));
        if (!N.isDirectory() && D.isDirectory())
          return m(new Error(`Cannot overwrite directory '${p}' with non-directory '${u}'.`));
      }
      return N.isDirectory() && d(u, p) ? m(new Error(l(u, p, E))) : m(null, { srcStat: N, destStat: D });
    });
  }
  function n(u, p, E, y) {
    const { srcStat: m, destStat: T } = s(u, p, y);
    if (T) {
      if (h(m, T)) {
        const A = t.basename(u), N = t.basename(p);
        if (E === "move" && A !== N && A.toLowerCase() === N.toLowerCase())
          return { srcStat: m, destStat: T, isChangingCase: !0 };
        throw new Error("Source and destination must not be the same.");
      }
      if (m.isDirectory() && !T.isDirectory())
        throw new Error(`Cannot overwrite non-directory '${p}' with directory '${u}'.`);
      if (!m.isDirectory() && T.isDirectory())
        throw new Error(`Cannot overwrite directory '${p}' with non-directory '${u}'.`);
    }
    if (m.isDirectory() && d(u, p))
      throw new Error(l(u, p, E));
    return { srcStat: m, destStat: T };
  }
  function f(u, p, E, y, m) {
    const T = t.resolve(t.dirname(u)), A = t.resolve(t.dirname(E));
    if (A === T || A === t.parse(A).root) return m();
    e.stat(A, { bigint: !0 }, (N, D) => N ? N.code === "ENOENT" ? m() : m(N) : h(p, D) ? m(new Error(l(u, E, y))) : f(u, p, A, y, m));
  }
  function o(u, p, E, y) {
    const m = t.resolve(t.dirname(u)), T = t.resolve(t.dirname(E));
    if (T === m || T === t.parse(T).root) return;
    let A;
    try {
      A = e.statSync(T, { bigint: !0 });
    } catch (N) {
      if (N.code === "ENOENT") return;
      throw N;
    }
    if (h(p, A))
      throw new Error(l(u, E, y));
    return o(u, p, T, y);
  }
  function h(u, p) {
    return p.ino && p.dev && p.ino === u.ino && p.dev === u.dev;
  }
  function d(u, p) {
    const E = t.resolve(u).split(t.sep).filter((m) => m), y = t.resolve(p).split(t.sep).filter((m) => m);
    return E.reduce((m, T, A) => m && y[A] === T, !0);
  }
  function l(u, p, E) {
    return `Cannot ${E} '${u}' to a subdirectory of itself, '${p}'.`;
  }
  return Nn = {
    checkPaths: a,
    checkPathsSync: n,
    checkParentPaths: f,
    checkParentPathsSync: o,
    isSrcSubdir: d,
    areIdentical: h
  }, Nn;
}
var On, _a;
function Id() {
  if (_a) return On;
  _a = 1;
  const e = et(), t = Le, r = yt().mkdirs, i = jt().pathExists, s = Tc().utimesMillis, a = /* @__PURE__ */ tr();
  function n(U, x, $, F) {
    typeof $ == "function" && !F ? (F = $, $ = {}) : typeof $ == "function" && ($ = { filter: $ }), F = F || function() {
    }, $ = $ || {}, $.clobber = "clobber" in $ ? !!$.clobber : !0, $.overwrite = "overwrite" in $ ? !!$.overwrite : $.clobber, $.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
      `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
      "Warning",
      "fs-extra-WARN0001"
    ), a.checkPaths(U, x, "copy", $, (L, j) => {
      if (L) return F(L);
      const { srcStat: k, destStat: G } = j;
      a.checkParentPaths(U, k, x, "copy", (Y) => Y ? F(Y) : $.filter ? o(f, G, U, x, $, F) : f(G, U, x, $, F));
    });
  }
  function f(U, x, $, F, L) {
    const j = t.dirname($);
    i(j, (k, G) => {
      if (k) return L(k);
      if (G) return d(U, x, $, F, L);
      r(j, (Y) => Y ? L(Y) : d(U, x, $, F, L));
    });
  }
  function o(U, x, $, F, L, j) {
    Promise.resolve(L.filter($, F)).then((k) => k ? U(x, $, F, L, j) : j(), (k) => j(k));
  }
  function h(U, x, $, F, L) {
    return F.filter ? o(d, U, x, $, F, L) : d(U, x, $, F, L);
  }
  function d(U, x, $, F, L) {
    (F.dereference ? e.stat : e.lstat)(x, (k, G) => k ? L(k) : G.isDirectory() ? D(G, U, x, $, F, L) : G.isFile() || G.isCharacterDevice() || G.isBlockDevice() ? l(G, U, x, $, F, L) : G.isSymbolicLink() ? C(U, x, $, F, L) : G.isSocket() ? L(new Error(`Cannot copy a socket file: ${x}`)) : G.isFIFO() ? L(new Error(`Cannot copy a FIFO pipe: ${x}`)) : L(new Error(`Unknown file: ${x}`)));
  }
  function l(U, x, $, F, L, j) {
    return x ? u(U, $, F, L, j) : p(U, $, F, L, j);
  }
  function u(U, x, $, F, L) {
    if (F.overwrite)
      e.unlink($, (j) => j ? L(j) : p(U, x, $, F, L));
    else return F.errorOnExist ? L(new Error(`'${$}' already exists`)) : L();
  }
  function p(U, x, $, F, L) {
    e.copyFile(x, $, (j) => j ? L(j) : F.preserveTimestamps ? E(U.mode, x, $, L) : A($, U.mode, L));
  }
  function E(U, x, $, F) {
    return y(U) ? m($, U, (L) => L ? F(L) : T(U, x, $, F)) : T(U, x, $, F);
  }
  function y(U) {
    return (U & 128) === 0;
  }
  function m(U, x, $) {
    return A(U, x | 128, $);
  }
  function T(U, x, $, F) {
    N(x, $, (L) => L ? F(L) : A($, U, F));
  }
  function A(U, x, $) {
    return e.chmod(U, x, $);
  }
  function N(U, x, $) {
    e.stat(U, (F, L) => F ? $(F) : s(x, L.atime, L.mtime, $));
  }
  function D(U, x, $, F, L, j) {
    return x ? b($, F, L, j) : I(U.mode, $, F, L, j);
  }
  function I(U, x, $, F, L) {
    e.mkdir($, (j) => {
      if (j) return L(j);
      b(x, $, F, (k) => k ? L(k) : A($, U, L));
    });
  }
  function b(U, x, $, F) {
    e.readdir(U, (L, j) => L ? F(L) : S(j, U, x, $, F));
  }
  function S(U, x, $, F, L) {
    const j = U.pop();
    return j ? w(U, j, x, $, F, L) : L();
  }
  function w(U, x, $, F, L, j) {
    const k = t.join($, x), G = t.join(F, x);
    a.checkPaths(k, G, "copy", L, (Y, ee) => {
      if (Y) return j(Y);
      const { destStat: pe } = ee;
      h(pe, k, G, L, (Z) => Z ? j(Z) : S(U, $, F, L, j));
    });
  }
  function C(U, x, $, F, L) {
    e.readlink(x, (j, k) => {
      if (j) return L(j);
      if (F.dereference && (k = t.resolve(process.cwd(), k)), U)
        e.readlink($, (G, Y) => G ? G.code === "EINVAL" || G.code === "UNKNOWN" ? e.symlink(k, $, L) : L(G) : (F.dereference && (Y = t.resolve(process.cwd(), Y)), a.isSrcSubdir(k, Y) ? L(new Error(`Cannot copy '${k}' to a subdirectory of itself, '${Y}'.`)) : U.isDirectory() && a.isSrcSubdir(Y, k) ? L(new Error(`Cannot overwrite '${Y}' with '${k}'.`)) : _(k, $, L)));
      else
        return e.symlink(k, $, L);
    });
  }
  function _(U, x, $) {
    e.unlink(x, (F) => F ? $(F) : e.symlink(U, x, $));
  }
  return On = n, On;
}
var Dn, Ta;
function bd() {
  if (Ta) return Dn;
  Ta = 1;
  const e = et(), t = Le, r = yt().mkdirsSync, i = Tc().utimesMillisSync, s = /* @__PURE__ */ tr();
  function a(S, w, C) {
    typeof C == "function" && (C = { filter: C }), C = C || {}, C.clobber = "clobber" in C ? !!C.clobber : !0, C.overwrite = "overwrite" in C ? !!C.overwrite : C.clobber, C.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
      `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
      "Warning",
      "fs-extra-WARN0002"
    );
    const { srcStat: _, destStat: U } = s.checkPathsSync(S, w, "copy", C);
    return s.checkParentPathsSync(S, _, w, "copy"), n(U, S, w, C);
  }
  function n(S, w, C, _) {
    if (_.filter && !_.filter(w, C)) return;
    const U = t.dirname(C);
    return e.existsSync(U) || r(U), o(S, w, C, _);
  }
  function f(S, w, C, _) {
    if (!(_.filter && !_.filter(w, C)))
      return o(S, w, C, _);
  }
  function o(S, w, C, _) {
    const x = (_.dereference ? e.statSync : e.lstatSync)(w);
    if (x.isDirectory()) return T(x, S, w, C, _);
    if (x.isFile() || x.isCharacterDevice() || x.isBlockDevice()) return h(x, S, w, C, _);
    if (x.isSymbolicLink()) return I(S, w, C, _);
    throw x.isSocket() ? new Error(`Cannot copy a socket file: ${w}`) : x.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${w}`) : new Error(`Unknown file: ${w}`);
  }
  function h(S, w, C, _, U) {
    return w ? d(S, C, _, U) : l(S, C, _, U);
  }
  function d(S, w, C, _) {
    if (_.overwrite)
      return e.unlinkSync(C), l(S, w, C, _);
    if (_.errorOnExist)
      throw new Error(`'${C}' already exists`);
  }
  function l(S, w, C, _) {
    return e.copyFileSync(w, C), _.preserveTimestamps && u(S.mode, w, C), y(C, S.mode);
  }
  function u(S, w, C) {
    return p(S) && E(C, S), m(w, C);
  }
  function p(S) {
    return (S & 128) === 0;
  }
  function E(S, w) {
    return y(S, w | 128);
  }
  function y(S, w) {
    return e.chmodSync(S, w);
  }
  function m(S, w) {
    const C = e.statSync(S);
    return i(w, C.atime, C.mtime);
  }
  function T(S, w, C, _, U) {
    return w ? N(C, _, U) : A(S.mode, C, _, U);
  }
  function A(S, w, C, _) {
    return e.mkdirSync(C), N(w, C, _), y(C, S);
  }
  function N(S, w, C) {
    e.readdirSync(S).forEach((_) => D(_, S, w, C));
  }
  function D(S, w, C, _) {
    const U = t.join(w, S), x = t.join(C, S), { destStat: $ } = s.checkPathsSync(U, x, "copy", _);
    return f($, U, x, _);
  }
  function I(S, w, C, _) {
    let U = e.readlinkSync(w);
    if (_.dereference && (U = t.resolve(process.cwd(), U)), S) {
      let x;
      try {
        x = e.readlinkSync(C);
      } catch ($) {
        if ($.code === "EINVAL" || $.code === "UNKNOWN") return e.symlinkSync(U, C);
        throw $;
      }
      if (_.dereference && (x = t.resolve(process.cwd(), x)), s.isSrcSubdir(U, x))
        throw new Error(`Cannot copy '${U}' to a subdirectory of itself, '${x}'.`);
      if (e.statSync(C).isDirectory() && s.isSrcSubdir(x, U))
        throw new Error(`Cannot overwrite '${x}' with '${U}'.`);
      return b(U, C);
    } else
      return e.symlinkSync(U, C);
  }
  function b(S, w) {
    return e.unlinkSync(w), e.symlinkSync(S, w);
  }
  return Dn = a, Dn;
}
var Pn, Aa;
function Do() {
  if (Aa) return Pn;
  Aa = 1;
  const e = nt().fromCallback;
  return Pn = {
    copy: e(/* @__PURE__ */ Id()),
    copySync: /* @__PURE__ */ bd()
  }, Pn;
}
var Fn, Ra;
function Cd() {
  if (Ra) return Fn;
  Ra = 1;
  const e = et(), t = Le, r = Ec, i = process.platform === "win32";
  function s(E) {
    [
      "unlink",
      "chmod",
      "stat",
      "lstat",
      "rmdir",
      "readdir"
    ].forEach((m) => {
      E[m] = E[m] || e[m], m = m + "Sync", E[m] = E[m] || e[m];
    }), E.maxBusyTries = E.maxBusyTries || 3;
  }
  function a(E, y, m) {
    let T = 0;
    typeof y == "function" && (m = y, y = {}), r(E, "rimraf: missing path"), r.strictEqual(typeof E, "string", "rimraf: path should be a string"), r.strictEqual(typeof m, "function", "rimraf: callback function required"), r(y, "rimraf: invalid options argument provided"), r.strictEqual(typeof y, "object", "rimraf: options should be object"), s(y), n(E, y, function A(N) {
      if (N) {
        if ((N.code === "EBUSY" || N.code === "ENOTEMPTY" || N.code === "EPERM") && T < y.maxBusyTries) {
          T++;
          const D = T * 100;
          return setTimeout(() => n(E, y, A), D);
        }
        N.code === "ENOENT" && (N = null);
      }
      m(N);
    });
  }
  function n(E, y, m) {
    r(E), r(y), r(typeof m == "function"), y.lstat(E, (T, A) => {
      if (T && T.code === "ENOENT")
        return m(null);
      if (T && T.code === "EPERM" && i)
        return f(E, y, T, m);
      if (A && A.isDirectory())
        return h(E, y, T, m);
      y.unlink(E, (N) => {
        if (N) {
          if (N.code === "ENOENT")
            return m(null);
          if (N.code === "EPERM")
            return i ? f(E, y, N, m) : h(E, y, N, m);
          if (N.code === "EISDIR")
            return h(E, y, N, m);
        }
        return m(N);
      });
    });
  }
  function f(E, y, m, T) {
    r(E), r(y), r(typeof T == "function"), y.chmod(E, 438, (A) => {
      A ? T(A.code === "ENOENT" ? null : m) : y.stat(E, (N, D) => {
        N ? T(N.code === "ENOENT" ? null : m) : D.isDirectory() ? h(E, y, m, T) : y.unlink(E, T);
      });
    });
  }
  function o(E, y, m) {
    let T;
    r(E), r(y);
    try {
      y.chmodSync(E, 438);
    } catch (A) {
      if (A.code === "ENOENT")
        return;
      throw m;
    }
    try {
      T = y.statSync(E);
    } catch (A) {
      if (A.code === "ENOENT")
        return;
      throw m;
    }
    T.isDirectory() ? u(E, y, m) : y.unlinkSync(E);
  }
  function h(E, y, m, T) {
    r(E), r(y), r(typeof T == "function"), y.rmdir(E, (A) => {
      A && (A.code === "ENOTEMPTY" || A.code === "EEXIST" || A.code === "EPERM") ? d(E, y, T) : A && A.code === "ENOTDIR" ? T(m) : T(A);
    });
  }
  function d(E, y, m) {
    r(E), r(y), r(typeof m == "function"), y.readdir(E, (T, A) => {
      if (T) return m(T);
      let N = A.length, D;
      if (N === 0) return y.rmdir(E, m);
      A.forEach((I) => {
        a(t.join(E, I), y, (b) => {
          if (!D) {
            if (b) return m(D = b);
            --N === 0 && y.rmdir(E, m);
          }
        });
      });
    });
  }
  function l(E, y) {
    let m;
    y = y || {}, s(y), r(E, "rimraf: missing path"), r.strictEqual(typeof E, "string", "rimraf: path should be a string"), r(y, "rimraf: missing options"), r.strictEqual(typeof y, "object", "rimraf: options should be object");
    try {
      m = y.lstatSync(E);
    } catch (T) {
      if (T.code === "ENOENT")
        return;
      T.code === "EPERM" && i && o(E, y, T);
    }
    try {
      m && m.isDirectory() ? u(E, y, null) : y.unlinkSync(E);
    } catch (T) {
      if (T.code === "ENOENT")
        return;
      if (T.code === "EPERM")
        return i ? o(E, y, T) : u(E, y, T);
      if (T.code !== "EISDIR")
        throw T;
      u(E, y, T);
    }
  }
  function u(E, y, m) {
    r(E), r(y);
    try {
      y.rmdirSync(E);
    } catch (T) {
      if (T.code === "ENOTDIR")
        throw m;
      if (T.code === "ENOTEMPTY" || T.code === "EEXIST" || T.code === "EPERM")
        p(E, y);
      else if (T.code !== "ENOENT")
        throw T;
    }
  }
  function p(E, y) {
    if (r(E), r(y), y.readdirSync(E).forEach((m) => l(t.join(E, m), y)), i) {
      const m = Date.now();
      do
        try {
          return y.rmdirSync(E, y);
        } catch {
        }
      while (Date.now() - m < 500);
    } else
      return y.rmdirSync(E, y);
  }
  return Fn = a, a.sync = l, Fn;
}
var Ln, Sa;
function sn() {
  if (Sa) return Ln;
  Sa = 1;
  const e = et(), t = nt().fromCallback, r = /* @__PURE__ */ Cd();
  function i(a, n) {
    if (e.rm) return e.rm(a, { recursive: !0, force: !0 }, n);
    r(a, n);
  }
  function s(a) {
    if (e.rmSync) return e.rmSync(a, { recursive: !0, force: !0 });
    r.sync(a);
  }
  return Ln = {
    remove: t(i),
    removeSync: s
  }, Ln;
}
var xn, Ia;
function Nd() {
  if (Ia) return xn;
  Ia = 1;
  const e = nt().fromPromise, t = /* @__PURE__ */ er(), r = Le, i = /* @__PURE__ */ yt(), s = /* @__PURE__ */ sn(), a = e(async function(o) {
    let h;
    try {
      h = await t.readdir(o);
    } catch {
      return i.mkdirs(o);
    }
    return Promise.all(h.map((d) => s.remove(r.join(o, d))));
  });
  function n(f) {
    let o;
    try {
      o = t.readdirSync(f);
    } catch {
      return i.mkdirsSync(f);
    }
    o.forEach((h) => {
      h = r.join(f, h), s.removeSync(h);
    });
  }
  return xn = {
    emptyDirSync: n,
    emptydirSync: n,
    emptyDir: a,
    emptydir: a
  }, xn;
}
var Un, ba;
function Od() {
  if (ba) return Un;
  ba = 1;
  const e = nt().fromCallback, t = Le, r = et(), i = /* @__PURE__ */ yt();
  function s(n, f) {
    function o() {
      r.writeFile(n, "", (h) => {
        if (h) return f(h);
        f();
      });
    }
    r.stat(n, (h, d) => {
      if (!h && d.isFile()) return f();
      const l = t.dirname(n);
      r.stat(l, (u, p) => {
        if (u)
          return u.code === "ENOENT" ? i.mkdirs(l, (E) => {
            if (E) return f(E);
            o();
          }) : f(u);
        p.isDirectory() ? o() : r.readdir(l, (E) => {
          if (E) return f(E);
        });
      });
    });
  }
  function a(n) {
    let f;
    try {
      f = r.statSync(n);
    } catch {
    }
    if (f && f.isFile()) return;
    const o = t.dirname(n);
    try {
      r.statSync(o).isDirectory() || r.readdirSync(o);
    } catch (h) {
      if (h && h.code === "ENOENT") i.mkdirsSync(o);
      else throw h;
    }
    r.writeFileSync(n, "");
  }
  return Un = {
    createFile: e(s),
    createFileSync: a
  }, Un;
}
var kn, Ca;
function Dd() {
  if (Ca) return kn;
  Ca = 1;
  const e = nt().fromCallback, t = Le, r = et(), i = /* @__PURE__ */ yt(), s = jt().pathExists, { areIdentical: a } = /* @__PURE__ */ tr();
  function n(o, h, d) {
    function l(u, p) {
      r.link(u, p, (E) => {
        if (E) return d(E);
        d(null);
      });
    }
    r.lstat(h, (u, p) => {
      r.lstat(o, (E, y) => {
        if (E)
          return E.message = E.message.replace("lstat", "ensureLink"), d(E);
        if (p && a(y, p)) return d(null);
        const m = t.dirname(h);
        s(m, (T, A) => {
          if (T) return d(T);
          if (A) return l(o, h);
          i.mkdirs(m, (N) => {
            if (N) return d(N);
            l(o, h);
          });
        });
      });
    });
  }
  function f(o, h) {
    let d;
    try {
      d = r.lstatSync(h);
    } catch {
    }
    try {
      const p = r.lstatSync(o);
      if (d && a(p, d)) return;
    } catch (p) {
      throw p.message = p.message.replace("lstat", "ensureLink"), p;
    }
    const l = t.dirname(h);
    return r.existsSync(l) || i.mkdirsSync(l), r.linkSync(o, h);
  }
  return kn = {
    createLink: e(n),
    createLinkSync: f
  }, kn;
}
var $n, Na;
function Pd() {
  if (Na) return $n;
  Na = 1;
  const e = Le, t = et(), r = jt().pathExists;
  function i(a, n, f) {
    if (e.isAbsolute(a))
      return t.lstat(a, (o) => o ? (o.message = o.message.replace("lstat", "ensureSymlink"), f(o)) : f(null, {
        toCwd: a,
        toDst: a
      }));
    {
      const o = e.dirname(n), h = e.join(o, a);
      return r(h, (d, l) => d ? f(d) : l ? f(null, {
        toCwd: h,
        toDst: a
      }) : t.lstat(a, (u) => u ? (u.message = u.message.replace("lstat", "ensureSymlink"), f(u)) : f(null, {
        toCwd: a,
        toDst: e.relative(o, a)
      })));
    }
  }
  function s(a, n) {
    let f;
    if (e.isAbsolute(a)) {
      if (f = t.existsSync(a), !f) throw new Error("absolute srcpath does not exist");
      return {
        toCwd: a,
        toDst: a
      };
    } else {
      const o = e.dirname(n), h = e.join(o, a);
      if (f = t.existsSync(h), f)
        return {
          toCwd: h,
          toDst: a
        };
      if (f = t.existsSync(a), !f) throw new Error("relative srcpath does not exist");
      return {
        toCwd: a,
        toDst: e.relative(o, a)
      };
    }
  }
  return $n = {
    symlinkPaths: i,
    symlinkPathsSync: s
  }, $n;
}
var Mn, Oa;
function Fd() {
  if (Oa) return Mn;
  Oa = 1;
  const e = et();
  function t(i, s, a) {
    if (a = typeof s == "function" ? s : a, s = typeof s == "function" ? !1 : s, s) return a(null, s);
    e.lstat(i, (n, f) => {
      if (n) return a(null, "file");
      s = f && f.isDirectory() ? "dir" : "file", a(null, s);
    });
  }
  function r(i, s) {
    let a;
    if (s) return s;
    try {
      a = e.lstatSync(i);
    } catch {
      return "file";
    }
    return a && a.isDirectory() ? "dir" : "file";
  }
  return Mn = {
    symlinkType: t,
    symlinkTypeSync: r
  }, Mn;
}
var qn, Da;
function Ld() {
  if (Da) return qn;
  Da = 1;
  const e = nt().fromCallback, t = Le, r = /* @__PURE__ */ er(), i = /* @__PURE__ */ yt(), s = i.mkdirs, a = i.mkdirsSync, n = /* @__PURE__ */ Pd(), f = n.symlinkPaths, o = n.symlinkPathsSync, h = /* @__PURE__ */ Fd(), d = h.symlinkType, l = h.symlinkTypeSync, u = jt().pathExists, { areIdentical: p } = /* @__PURE__ */ tr();
  function E(T, A, N, D) {
    D = typeof N == "function" ? N : D, N = typeof N == "function" ? !1 : N, r.lstat(A, (I, b) => {
      !I && b.isSymbolicLink() ? Promise.all([
        r.stat(T),
        r.stat(A)
      ]).then(([S, w]) => {
        if (p(S, w)) return D(null);
        y(T, A, N, D);
      }) : y(T, A, N, D);
    });
  }
  function y(T, A, N, D) {
    f(T, A, (I, b) => {
      if (I) return D(I);
      T = b.toDst, d(b.toCwd, N, (S, w) => {
        if (S) return D(S);
        const C = t.dirname(A);
        u(C, (_, U) => {
          if (_) return D(_);
          if (U) return r.symlink(T, A, w, D);
          s(C, (x) => {
            if (x) return D(x);
            r.symlink(T, A, w, D);
          });
        });
      });
    });
  }
  function m(T, A, N) {
    let D;
    try {
      D = r.lstatSync(A);
    } catch {
    }
    if (D && D.isSymbolicLink()) {
      const w = r.statSync(T), C = r.statSync(A);
      if (p(w, C)) return;
    }
    const I = o(T, A);
    T = I.toDst, N = l(I.toCwd, N);
    const b = t.dirname(A);
    return r.existsSync(b) || a(b), r.symlinkSync(T, A, N);
  }
  return qn = {
    createSymlink: e(E),
    createSymlinkSync: m
  }, qn;
}
var Bn, Pa;
function xd() {
  if (Pa) return Bn;
  Pa = 1;
  const { createFile: e, createFileSync: t } = /* @__PURE__ */ Od(), { createLink: r, createLinkSync: i } = /* @__PURE__ */ Dd(), { createSymlink: s, createSymlinkSync: a } = /* @__PURE__ */ Ld();
  return Bn = {
    // file
    createFile: e,
    createFileSync: t,
    ensureFile: e,
    ensureFileSync: t,
    // link
    createLink: r,
    createLinkSync: i,
    ensureLink: r,
    ensureLinkSync: i,
    // symlink
    createSymlink: s,
    createSymlinkSync: a,
    ensureSymlink: s,
    ensureSymlinkSync: a
  }, Bn;
}
var Hn, Fa;
function Po() {
  if (Fa) return Hn;
  Fa = 1;
  function e(r, { EOL: i = `
`, finalEOL: s = !0, replacer: a = null, spaces: n } = {}) {
    const f = s ? i : "", o = JSON.stringify(r, a, n);
    if (o === void 0)
      throw new TypeError(`Converting ${typeof r} value to JSON is not supported`);
    return o.replace(/\n/g, i) + f;
  }
  function t(r) {
    return Buffer.isBuffer(r) && (r = r.toString("utf8")), r.replace(/^\uFEFF/, "");
  }
  return Hn = { stringify: e, stripBom: t }, Hn;
}
var jn, La;
function Ud() {
  if (La) return jn;
  La = 1;
  let e;
  try {
    e = et();
  } catch {
    e = At;
  }
  const t = nt(), { stringify: r, stripBom: i } = Po();
  async function s(d, l = {}) {
    typeof l == "string" && (l = { encoding: l });
    const u = l.fs || e, p = "throws" in l ? l.throws : !0;
    let E = await t.fromCallback(u.readFile)(d, l);
    E = i(E);
    let y;
    try {
      y = JSON.parse(E, l ? l.reviver : null);
    } catch (m) {
      if (p)
        throw m.message = `${d}: ${m.message}`, m;
      return null;
    }
    return y;
  }
  const a = t.fromPromise(s);
  function n(d, l = {}) {
    typeof l == "string" && (l = { encoding: l });
    const u = l.fs || e, p = "throws" in l ? l.throws : !0;
    try {
      let E = u.readFileSync(d, l);
      return E = i(E), JSON.parse(E, l.reviver);
    } catch (E) {
      if (p)
        throw E.message = `${d}: ${E.message}`, E;
      return null;
    }
  }
  async function f(d, l, u = {}) {
    const p = u.fs || e, E = r(l, u);
    await t.fromCallback(p.writeFile)(d, E, u);
  }
  const o = t.fromPromise(f);
  function h(d, l, u = {}) {
    const p = u.fs || e, E = r(l, u);
    return p.writeFileSync(d, E, u);
  }
  return jn = {
    readFile: a,
    readFileSync: n,
    writeFile: o,
    writeFileSync: h
  }, jn;
}
var Gn, xa;
function kd() {
  if (xa) return Gn;
  xa = 1;
  const e = Ud();
  return Gn = {
    // jsonfile exports
    readJson: e.readFile,
    readJsonSync: e.readFileSync,
    writeJson: e.writeFile,
    writeJsonSync: e.writeFileSync
  }, Gn;
}
var Wn, Ua;
function Fo() {
  if (Ua) return Wn;
  Ua = 1;
  const e = nt().fromCallback, t = et(), r = Le, i = /* @__PURE__ */ yt(), s = jt().pathExists;
  function a(f, o, h, d) {
    typeof h == "function" && (d = h, h = "utf8");
    const l = r.dirname(f);
    s(l, (u, p) => {
      if (u) return d(u);
      if (p) return t.writeFile(f, o, h, d);
      i.mkdirs(l, (E) => {
        if (E) return d(E);
        t.writeFile(f, o, h, d);
      });
    });
  }
  function n(f, ...o) {
    const h = r.dirname(f);
    if (t.existsSync(h))
      return t.writeFileSync(f, ...o);
    i.mkdirsSync(h), t.writeFileSync(f, ...o);
  }
  return Wn = {
    outputFile: e(a),
    outputFileSync: n
  }, Wn;
}
var Vn, ka;
function $d() {
  if (ka) return Vn;
  ka = 1;
  const { stringify: e } = Po(), { outputFile: t } = /* @__PURE__ */ Fo();
  async function r(i, s, a = {}) {
    const n = e(s, a);
    await t(i, n, a);
  }
  return Vn = r, Vn;
}
var Yn, $a;
function Md() {
  if ($a) return Yn;
  $a = 1;
  const { stringify: e } = Po(), { outputFileSync: t } = /* @__PURE__ */ Fo();
  function r(i, s, a) {
    const n = e(s, a);
    t(i, n, a);
  }
  return Yn = r, Yn;
}
var zn, Ma;
function qd() {
  if (Ma) return zn;
  Ma = 1;
  const e = nt().fromPromise, t = /* @__PURE__ */ kd();
  return t.outputJson = e(/* @__PURE__ */ $d()), t.outputJsonSync = /* @__PURE__ */ Md(), t.outputJSON = t.outputJson, t.outputJSONSync = t.outputJsonSync, t.writeJSON = t.writeJson, t.writeJSONSync = t.writeJsonSync, t.readJSON = t.readJson, t.readJSONSync = t.readJsonSync, zn = t, zn;
}
var Xn, qa;
function Bd() {
  if (qa) return Xn;
  qa = 1;
  const e = et(), t = Le, r = Do().copy, i = sn().remove, s = yt().mkdirp, a = jt().pathExists, n = /* @__PURE__ */ tr();
  function f(u, p, E, y) {
    typeof E == "function" && (y = E, E = {}), E = E || {};
    const m = E.overwrite || E.clobber || !1;
    n.checkPaths(u, p, "move", E, (T, A) => {
      if (T) return y(T);
      const { srcStat: N, isChangingCase: D = !1 } = A;
      n.checkParentPaths(u, N, p, "move", (I) => {
        if (I) return y(I);
        if (o(p)) return h(u, p, m, D, y);
        s(t.dirname(p), (b) => b ? y(b) : h(u, p, m, D, y));
      });
    });
  }
  function o(u) {
    const p = t.dirname(u);
    return t.parse(p).root === p;
  }
  function h(u, p, E, y, m) {
    if (y) return d(u, p, E, m);
    if (E)
      return i(p, (T) => T ? m(T) : d(u, p, E, m));
    a(p, (T, A) => T ? m(T) : A ? m(new Error("dest already exists.")) : d(u, p, E, m));
  }
  function d(u, p, E, y) {
    e.rename(u, p, (m) => m ? m.code !== "EXDEV" ? y(m) : l(u, p, E, y) : y());
  }
  function l(u, p, E, y) {
    r(u, p, {
      overwrite: E,
      errorOnExist: !0
    }, (T) => T ? y(T) : i(u, y));
  }
  return Xn = f, Xn;
}
var Kn, Ba;
function Hd() {
  if (Ba) return Kn;
  Ba = 1;
  const e = et(), t = Le, r = Do().copySync, i = sn().removeSync, s = yt().mkdirpSync, a = /* @__PURE__ */ tr();
  function n(l, u, p) {
    p = p || {};
    const E = p.overwrite || p.clobber || !1, { srcStat: y, isChangingCase: m = !1 } = a.checkPathsSync(l, u, "move", p);
    return a.checkParentPathsSync(l, y, u, "move"), f(u) || s(t.dirname(u)), o(l, u, E, m);
  }
  function f(l) {
    const u = t.dirname(l);
    return t.parse(u).root === u;
  }
  function o(l, u, p, E) {
    if (E) return h(l, u, p);
    if (p)
      return i(u), h(l, u, p);
    if (e.existsSync(u)) throw new Error("dest already exists.");
    return h(l, u, p);
  }
  function h(l, u, p) {
    try {
      e.renameSync(l, u);
    } catch (E) {
      if (E.code !== "EXDEV") throw E;
      return d(l, u, p);
    }
  }
  function d(l, u, p) {
    return r(l, u, {
      overwrite: p,
      errorOnExist: !0
    }), i(l);
  }
  return Kn = n, Kn;
}
var Jn, Ha;
function jd() {
  if (Ha) return Jn;
  Ha = 1;
  const e = nt().fromCallback;
  return Jn = {
    move: e(/* @__PURE__ */ Bd()),
    moveSync: /* @__PURE__ */ Hd()
  }, Jn;
}
var Qn, ja;
function Ot() {
  return ja || (ja = 1, Qn = {
    // Export promiseified graceful-fs:
    .../* @__PURE__ */ er(),
    // Export extra methods:
    .../* @__PURE__ */ Do(),
    .../* @__PURE__ */ Nd(),
    .../* @__PURE__ */ xd(),
    .../* @__PURE__ */ qd(),
    .../* @__PURE__ */ yt(),
    .../* @__PURE__ */ jd(),
    .../* @__PURE__ */ Fo(),
    .../* @__PURE__ */ jt(),
    .../* @__PURE__ */ sn()
  }), Qn;
}
var ar = {}, Mt = {}, Zn = {}, qt = {}, Ga;
function Lo() {
  if (Ga) return qt;
  Ga = 1, Object.defineProperty(qt, "__esModule", { value: !0 }), qt.CancellationError = qt.CancellationToken = void 0;
  const e = yc;
  let t = class extends e.EventEmitter {
    get cancelled() {
      return this._cancelled || this._parent != null && this._parent.cancelled;
    }
    set parent(s) {
      this.removeParentCancelHandler(), this._parent = s, this.parentCancelHandler = () => this.cancel(), this._parent.onCancel(this.parentCancelHandler);
    }
    // babel cannot compile ... correctly for super calls
    constructor(s) {
      super(), this.parentCancelHandler = null, this._parent = null, this._cancelled = !1, s != null && (this.parent = s);
    }
    cancel() {
      this._cancelled = !0, this.emit("cancel");
    }
    onCancel(s) {
      this.cancelled ? s() : this.once("cancel", s);
    }
    createPromise(s) {
      if (this.cancelled)
        return Promise.reject(new r());
      const a = () => {
        if (n != null)
          try {
            this.removeListener("cancel", n), n = null;
          } catch {
          }
      };
      let n = null;
      return new Promise((f, o) => {
        let h = null;
        if (n = () => {
          try {
            h != null && (h(), h = null);
          } finally {
            o(new r());
          }
        }, this.cancelled) {
          n();
          return;
        }
        this.onCancel(n), s(f, o, (d) => {
          h = d;
        });
      }).then((f) => (a(), f)).catch((f) => {
        throw a(), f;
      });
    }
    removeParentCancelHandler() {
      const s = this._parent;
      s != null && this.parentCancelHandler != null && (s.removeListener("cancel", this.parentCancelHandler), this.parentCancelHandler = null);
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
var Yr = {}, Wa;
function ln() {
  if (Wa) return Yr;
  Wa = 1, Object.defineProperty(Yr, "__esModule", { value: !0 }), Yr.newError = e;
  function e(t, r) {
    const i = new Error(t);
    return i.code = r, i;
  }
  return Yr;
}
var Ye = {}, zr = { exports: {} }, Xr = { exports: {} }, ei, Va;
function Gd() {
  if (Va) return ei;
  Va = 1;
  var e = 1e3, t = e * 60, r = t * 60, i = r * 24, s = i * 7, a = i * 365.25;
  ei = function(d, l) {
    l = l || {};
    var u = typeof d;
    if (u === "string" && d.length > 0)
      return n(d);
    if (u === "number" && isFinite(d))
      return l.long ? o(d) : f(d);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(d)
    );
  };
  function n(d) {
    if (d = String(d), !(d.length > 100)) {
      var l = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        d
      );
      if (l) {
        var u = parseFloat(l[1]), p = (l[2] || "ms").toLowerCase();
        switch (p) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return u * a;
          case "weeks":
          case "week":
          case "w":
            return u * s;
          case "days":
          case "day":
          case "d":
            return u * i;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return u * r;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return u * t;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return u * e;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return u;
          default:
            return;
        }
      }
    }
  }
  function f(d) {
    var l = Math.abs(d);
    return l >= i ? Math.round(d / i) + "d" : l >= r ? Math.round(d / r) + "h" : l >= t ? Math.round(d / t) + "m" : l >= e ? Math.round(d / e) + "s" : d + "ms";
  }
  function o(d) {
    var l = Math.abs(d);
    return l >= i ? h(d, l, i, "day") : l >= r ? h(d, l, r, "hour") : l >= t ? h(d, l, t, "minute") : l >= e ? h(d, l, e, "second") : d + " ms";
  }
  function h(d, l, u, p) {
    var E = l >= u * 1.5;
    return Math.round(d / u) + " " + p + (E ? "s" : "");
  }
  return ei;
}
var ti, Ya;
function Ac() {
  if (Ya) return ti;
  Ya = 1;
  function e(t) {
    i.debug = i, i.default = i, i.coerce = h, i.disable = f, i.enable = a, i.enabled = o, i.humanize = Gd(), i.destroy = d, Object.keys(t).forEach((l) => {
      i[l] = t[l];
    }), i.names = [], i.skips = [], i.formatters = {};
    function r(l) {
      let u = 0;
      for (let p = 0; p < l.length; p++)
        u = (u << 5) - u + l.charCodeAt(p), u |= 0;
      return i.colors[Math.abs(u) % i.colors.length];
    }
    i.selectColor = r;
    function i(l) {
      let u, p = null, E, y;
      function m(...T) {
        if (!m.enabled)
          return;
        const A = m, N = Number(/* @__PURE__ */ new Date()), D = N - (u || N);
        A.diff = D, A.prev = u, A.curr = N, u = N, T[0] = i.coerce(T[0]), typeof T[0] != "string" && T.unshift("%O");
        let I = 0;
        T[0] = T[0].replace(/%([a-zA-Z%])/g, (S, w) => {
          if (S === "%%")
            return "%";
          I++;
          const C = i.formatters[w];
          if (typeof C == "function") {
            const _ = T[I];
            S = C.call(A, _), T.splice(I, 1), I--;
          }
          return S;
        }), i.formatArgs.call(A, T), (A.log || i.log).apply(A, T);
      }
      return m.namespace = l, m.useColors = i.useColors(), m.color = i.selectColor(l), m.extend = s, m.destroy = i.destroy, Object.defineProperty(m, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => p !== null ? p : (E !== i.namespaces && (E = i.namespaces, y = i.enabled(l)), y),
        set: (T) => {
          p = T;
        }
      }), typeof i.init == "function" && i.init(m), m;
    }
    function s(l, u) {
      const p = i(this.namespace + (typeof u > "u" ? ":" : u) + l);
      return p.log = this.log, p;
    }
    function a(l) {
      i.save(l), i.namespaces = l, i.names = [], i.skips = [];
      const u = (typeof l == "string" ? l : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const p of u)
        p[0] === "-" ? i.skips.push(p.slice(1)) : i.names.push(p);
    }
    function n(l, u) {
      let p = 0, E = 0, y = -1, m = 0;
      for (; p < l.length; )
        if (E < u.length && (u[E] === l[p] || u[E] === "*"))
          u[E] === "*" ? (y = E, m = p, E++) : (p++, E++);
        else if (y !== -1)
          E = y + 1, m++, p = m;
        else
          return !1;
      for (; E < u.length && u[E] === "*"; )
        E++;
      return E === u.length;
    }
    function f() {
      const l = [
        ...i.names,
        ...i.skips.map((u) => "-" + u)
      ].join(",");
      return i.enable(""), l;
    }
    function o(l) {
      for (const u of i.skips)
        if (n(l, u))
          return !1;
      for (const u of i.names)
        if (n(l, u))
          return !0;
      return !1;
    }
    function h(l) {
      return l instanceof Error ? l.stack || l.message : l;
    }
    function d() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return i.enable(i.load()), i;
  }
  return ti = e, ti;
}
var za;
function Wd() {
  return za || (za = 1, (function(e, t) {
    t.formatArgs = i, t.save = s, t.load = a, t.useColors = r, t.storage = n(), t.destroy = /* @__PURE__ */ (() => {
      let o = !1;
      return () => {
        o || (o = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
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
      let o;
      return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && (o = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(o[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function i(o) {
      if (o[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + o[0] + (this.useColors ? "%c " : " ") + "+" + e.exports.humanize(this.diff), !this.useColors)
        return;
      const h = "color: " + this.color;
      o.splice(1, 0, h, "color: inherit");
      let d = 0, l = 0;
      o[0].replace(/%[a-zA-Z%]/g, (u) => {
        u !== "%%" && (d++, u === "%c" && (l = d));
      }), o.splice(l, 0, h);
    }
    t.log = console.debug || console.log || (() => {
    });
    function s(o) {
      try {
        o ? t.storage.setItem("debug", o) : t.storage.removeItem("debug");
      } catch {
      }
    }
    function a() {
      let o;
      try {
        o = t.storage.getItem("debug") || t.storage.getItem("DEBUG");
      } catch {
      }
      return !o && typeof process < "u" && "env" in process && (o = process.env.DEBUG), o;
    }
    function n() {
      try {
        return localStorage;
      } catch {
      }
    }
    e.exports = Ac()(t);
    const { formatters: f } = e.exports;
    f.j = function(o) {
      try {
        return JSON.stringify(o);
      } catch (h) {
        return "[UnexpectedJSONParseError]: " + h.message;
      }
    };
  })(Xr, Xr.exports)), Xr.exports;
}
var Kr = { exports: {} }, ri, Xa;
function Vd() {
  return Xa || (Xa = 1, ri = (e, t = process.argv) => {
    const r = e.startsWith("-") ? "" : e.length === 1 ? "-" : "--", i = t.indexOf(r + e), s = t.indexOf("--");
    return i !== -1 && (s === -1 || i < s);
  }), ri;
}
var ni, Ka;
function Yd() {
  if (Ka) return ni;
  Ka = 1;
  const e = Pr, t = vc, r = Vd(), { env: i } = process;
  let s;
  r("no-color") || r("no-colors") || r("color=false") || r("color=never") ? s = 0 : (r("color") || r("colors") || r("color=true") || r("color=always")) && (s = 1), "FORCE_COLOR" in i && (i.FORCE_COLOR === "true" ? s = 1 : i.FORCE_COLOR === "false" ? s = 0 : s = i.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(i.FORCE_COLOR, 10), 3));
  function a(o) {
    return o === 0 ? !1 : {
      level: o,
      hasBasic: !0,
      has256: o >= 2,
      has16m: o >= 3
    };
  }
  function n(o, h) {
    if (s === 0)
      return 0;
    if (r("color=16m") || r("color=full") || r("color=truecolor"))
      return 3;
    if (r("color=256"))
      return 2;
    if (o && !h && s === void 0)
      return 0;
    const d = s || 0;
    if (i.TERM === "dumb")
      return d;
    if (process.platform === "win32") {
      const l = e.release().split(".");
      return Number(l[0]) >= 10 && Number(l[2]) >= 10586 ? Number(l[2]) >= 14931 ? 3 : 2 : 1;
    }
    if ("CI" in i)
      return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((l) => l in i) || i.CI_NAME === "codeship" ? 1 : d;
    if ("TEAMCITY_VERSION" in i)
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(i.TEAMCITY_VERSION) ? 1 : 0;
    if (i.COLORTERM === "truecolor")
      return 3;
    if ("TERM_PROGRAM" in i) {
      const l = parseInt((i.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (i.TERM_PROGRAM) {
        case "iTerm.app":
          return l >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    return /-256(color)?$/i.test(i.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(i.TERM) || "COLORTERM" in i ? 1 : d;
  }
  function f(o) {
    const h = n(o, o && o.isTTY);
    return a(h);
  }
  return ni = {
    supportsColor: f,
    stdout: a(n(!0, t.isatty(1))),
    stderr: a(n(!0, t.isatty(2)))
  }, ni;
}
var Ja;
function zd() {
  return Ja || (Ja = 1, (function(e, t) {
    const r = vc, i = Oo;
    t.init = d, t.log = f, t.formatArgs = a, t.save = o, t.load = h, t.useColors = s, t.destroy = i.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), t.colors = [6, 2, 3, 4, 5, 1];
    try {
      const u = Yd();
      u && (u.stderr || u).level >= 2 && (t.colors = [
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
    t.inspectOpts = Object.keys(process.env).filter((u) => /^debug_/i.test(u)).reduce((u, p) => {
      const E = p.substring(6).toLowerCase().replace(/_([a-z])/g, (m, T) => T.toUpperCase());
      let y = process.env[p];
      return /^(yes|on|true|enabled)$/i.test(y) ? y = !0 : /^(no|off|false|disabled)$/i.test(y) ? y = !1 : y === "null" ? y = null : y = Number(y), u[E] = y, u;
    }, {});
    function s() {
      return "colors" in t.inspectOpts ? !!t.inspectOpts.colors : r.isatty(process.stderr.fd);
    }
    function a(u) {
      const { namespace: p, useColors: E } = this;
      if (E) {
        const y = this.color, m = "\x1B[3" + (y < 8 ? y : "8;5;" + y), T = `  ${m};1m${p} \x1B[0m`;
        u[0] = T + u[0].split(`
`).join(`
` + T), u.push(m + "m+" + e.exports.humanize(this.diff) + "\x1B[0m");
      } else
        u[0] = n() + p + " " + u[0];
    }
    function n() {
      return t.inspectOpts.hideDate ? "" : (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function f(...u) {
      return process.stderr.write(i.formatWithOptions(t.inspectOpts, ...u) + `
`);
    }
    function o(u) {
      u ? process.env.DEBUG = u : delete process.env.DEBUG;
    }
    function h() {
      return process.env.DEBUG;
    }
    function d(u) {
      u.inspectOpts = {};
      const p = Object.keys(t.inspectOpts);
      for (let E = 0; E < p.length; E++)
        u.inspectOpts[p[E]] = t.inspectOpts[p[E]];
    }
    e.exports = Ac()(t);
    const { formatters: l } = e.exports;
    l.o = function(u) {
      return this.inspectOpts.colors = this.useColors, i.inspect(u, this.inspectOpts).split(`
`).map((p) => p.trim()).join(" ");
    }, l.O = function(u) {
      return this.inspectOpts.colors = this.useColors, i.inspect(u, this.inspectOpts);
    };
  })(Kr, Kr.exports)), Kr.exports;
}
var Qa;
function Xd() {
  return Qa || (Qa = 1, typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? zr.exports = Wd() : zr.exports = zd()), zr.exports;
}
var sr = {}, Za;
function Rc() {
  if (Za) return sr;
  Za = 1, Object.defineProperty(sr, "__esModule", { value: !0 }), sr.ProgressCallbackTransform = void 0;
  const e = Dr;
  let t = class extends e.Transform {
    constructor(i, s, a) {
      super(), this.total = i, this.cancellationToken = s, this.onProgress = a, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.nextUpdate = this.start + 1e3;
    }
    _transform(i, s, a) {
      if (this.cancellationToken.cancelled) {
        a(new Error("cancelled"), null);
        return;
      }
      this.transferred += i.length, this.delta += i.length;
      const n = Date.now();
      n >= this.nextUpdate && this.transferred !== this.total && (this.nextUpdate = n + 1e3, this.onProgress({
        total: this.total,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.total * 100,
        bytesPerSecond: Math.round(this.transferred / ((n - this.start) / 1e3))
      }), this.delta = 0), a(null, i);
    }
    _flush(i) {
      if (this.cancellationToken.cancelled) {
        i(new Error("cancelled"));
        return;
      }
      this.onProgress({
        total: this.total,
        delta: this.delta,
        transferred: this.total,
        percent: 100,
        bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
      }), this.delta = 0, i(null);
    }
  };
  return sr.ProgressCallbackTransform = t, sr;
}
var es;
function Kd() {
  if (es) return Ye;
  es = 1, Object.defineProperty(Ye, "__esModule", { value: !0 }), Ye.DigestTransform = Ye.HttpExecutor = Ye.HttpError = void 0, Ye.createHttpError = h, Ye.parseJson = u, Ye.configureRequestOptionsFromUrl = y, Ye.configureRequestUrl = m, Ye.safeGetHeader = N, Ye.configureRequestOptions = I, Ye.safeStringifyJson = b;
  const e = dt, t = Xd(), r = At, i = Dr, s = Nt, a = Lo(), n = ln(), f = Rc(), o = (0, t.default)("electron-builder");
  function h(S, w = null) {
    return new l(S.statusCode || -1, `${S.statusCode} ${S.statusMessage}` + (w == null ? "" : `
` + JSON.stringify(w, null, "  ")) + `
Headers: ` + b(S.headers), w);
  }
  const d = /* @__PURE__ */ new Map([
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
    constructor(w, C = `HTTP error: ${d.get(w) || w}`, _ = null) {
      super(C), this.statusCode = w, this.description = _, this.name = "HttpError", this.code = `HTTP_ERROR_${w}`;
    }
    isServerError() {
      return this.statusCode >= 500 && this.statusCode <= 599;
    }
  }
  Ye.HttpError = l;
  function u(S) {
    return S.then((w) => w == null || w.length === 0 ? null : JSON.parse(w));
  }
  class p {
    constructor() {
      this.maxRedirects = 10;
    }
    request(w, C = new a.CancellationToken(), _) {
      I(w);
      const U = _ == null ? void 0 : JSON.stringify(_), x = U ? Buffer.from(U) : void 0;
      if (x != null) {
        o(U);
        const { headers: $, ...F } = w;
        w = {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": x.length,
            ...$
          },
          ...F
        };
      }
      return this.doApiRequest(w, C, ($) => $.end(x));
    }
    doApiRequest(w, C, _, U = 0) {
      return o.enabled && o(`Request: ${b(w)}`), C.createPromise((x, $, F) => {
        const L = this.createRequest(w, (j) => {
          try {
            this.handleResponse(j, w, C, x, $, U, _);
          } catch (k) {
            $(k);
          }
        });
        this.addErrorAndTimeoutHandlers(L, $, w.timeout), this.addRedirectHandlers(L, w, $, U, (j) => {
          this.doApiRequest(j, C, _, U).then(x).catch($);
        }), _(L, $), F(() => L.abort());
      });
    }
    // noinspection JSUnusedLocalSymbols
    // eslint-disable-next-line
    addRedirectHandlers(w, C, _, U, x) {
    }
    addErrorAndTimeoutHandlers(w, C, _ = 60 * 1e3) {
      this.addTimeOutHandler(w, C, _), w.on("error", C), w.on("aborted", () => {
        C(new Error("Request has been aborted by the server"));
      });
    }
    handleResponse(w, C, _, U, x, $, F) {
      var L;
      if (o.enabled && o(`Response: ${w.statusCode} ${w.statusMessage}, request options: ${b(C)}`), w.statusCode === 404) {
        x(h(w, `method: ${C.method || "GET"} url: ${C.protocol || "https:"}//${C.hostname}${C.port ? `:${C.port}` : ""}${C.path}

Please double check that your authentication token is correct. Due to security reasons, actual status maybe not reported, but 404.
`));
        return;
      } else if (w.statusCode === 204) {
        U();
        return;
      }
      const j = (L = w.statusCode) !== null && L !== void 0 ? L : 0, k = j >= 300 && j < 400, G = N(w, "location");
      if (k && G != null) {
        if ($ > this.maxRedirects) {
          x(this.createMaxRedirectError());
          return;
        }
        this.doApiRequest(p.prepareRedirectUrlOptions(G, C), _, F, $).then(U).catch(x);
        return;
      }
      w.setEncoding("utf8");
      let Y = "";
      w.on("error", x), w.on("data", (ee) => Y += ee), w.on("end", () => {
        try {
          if (w.statusCode != null && w.statusCode >= 400) {
            const ee = N(w, "content-type"), pe = ee != null && (Array.isArray(ee) ? ee.find((Z) => Z.includes("json")) != null : ee.includes("json"));
            x(h(w, `method: ${C.method || "GET"} url: ${C.protocol || "https:"}//${C.hostname}${C.port ? `:${C.port}` : ""}${C.path}

          Data:
          ${pe ? JSON.stringify(JSON.parse(Y)) : Y}
          `));
          } else
            U(Y.length === 0 ? null : Y);
        } catch (ee) {
          x(ee);
        }
      });
    }
    async downloadToBuffer(w, C) {
      return await C.cancellationToken.createPromise((_, U, x) => {
        const $ = [], F = {
          headers: C.headers || void 0,
          // because PrivateGitHubProvider requires HttpExecutor.prepareRedirectUrlOptions logic, so, we need to redirect manually
          redirect: "manual"
        };
        m(w, F), I(F), this.doDownload(F, {
          destination: null,
          options: C,
          onCancel: x,
          callback: (L) => {
            L == null ? _(Buffer.concat($)) : U(L);
          },
          responseHandler: (L, j) => {
            let k = 0;
            L.on("data", (G) => {
              if (k += G.length, k > 524288e3) {
                j(new Error("Maximum allowed size is 500 MB"));
                return;
              }
              $.push(G);
            }), L.on("end", () => {
              j(null);
            });
          }
        }, 0);
      });
    }
    doDownload(w, C, _) {
      const U = this.createRequest(w, (x) => {
        if (x.statusCode >= 400) {
          C.callback(new Error(`Cannot download "${w.protocol || "https:"}//${w.hostname}${w.path}", status ${x.statusCode}: ${x.statusMessage}`));
          return;
        }
        x.on("error", C.callback);
        const $ = N(x, "location");
        if ($ != null) {
          _ < this.maxRedirects ? this.doDownload(p.prepareRedirectUrlOptions($, w), C, _++) : C.callback(this.createMaxRedirectError());
          return;
        }
        C.responseHandler == null ? D(C, x) : C.responseHandler(x, C.callback);
      });
      this.addErrorAndTimeoutHandlers(U, C.callback, w.timeout), this.addRedirectHandlers(U, w, C.callback, _, (x) => {
        this.doDownload(x, C, _++);
      }), U.end();
    }
    createMaxRedirectError() {
      return new Error(`Too many redirects (> ${this.maxRedirects})`);
    }
    addTimeOutHandler(w, C, _) {
      w.on("socket", (U) => {
        U.setTimeout(_, () => {
          w.abort(), C(new Error("Request timed out"));
        });
      });
    }
    static prepareRedirectUrlOptions(w, C) {
      const _ = y(w, { ...C }), U = _.headers;
      if (U?.authorization) {
        const x = p.reconstructOriginalUrl(C), $ = E(w, C);
        p.isCrossOriginRedirect(x, $) && (o.enabled && o(`Given the cross-origin redirect (from ${x.host} to ${$.host}), the Authorization header will be stripped out.`), delete U.authorization);
      }
      return _;
    }
    static reconstructOriginalUrl(w) {
      const C = w.protocol || "https:";
      if (!w.hostname)
        throw new Error("Missing hostname in request options");
      const _ = w.hostname, U = w.port ? `:${w.port}` : "", x = w.path || "/";
      return new s.URL(`${C}//${_}${U}${x}`);
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
      const _ = w.port, U = C.port;
      return _ !== U;
    }
    static retryOnServerError(w, C = 3) {
      for (let _ = 0; ; _++)
        try {
          return w();
        } catch (U) {
          if (_ < C && (U instanceof l && U.isServerError() || U.code === "EPIPE"))
            continue;
          throw U;
        }
    }
  }
  Ye.HttpExecutor = p;
  function E(S, w) {
    try {
      return new s.URL(S);
    } catch {
      const C = w.hostname, _ = w.protocol || "https:", U = w.port ? `:${w.port}` : "", x = `${_}//${C}${U}`;
      return new s.URL(S, x);
    }
  }
  function y(S, w) {
    const C = I(w), _ = E(S, w);
    return m(_, C), C;
  }
  function m(S, w) {
    w.protocol = S.protocol, w.hostname = S.hostname, S.port ? w.port = S.port : w.port && delete w.port, w.path = S.pathname + S.search;
  }
  class T extends i.Transform {
    // noinspection JSUnusedGlobalSymbols
    get actual() {
      return this._actual;
    }
    constructor(w, C = "sha512", _ = "base64") {
      super(), this.expected = w, this.algorithm = C, this.encoding = _, this._actual = null, this.isValidateOnEnd = !0, this.digester = (0, e.createHash)(C);
    }
    // noinspection JSUnusedGlobalSymbols
    _transform(w, C, _) {
      this.digester.update(w), _(null, w);
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
        throw (0, n.newError)("Not finished yet", "ERR_STREAM_NOT_FINISHED");
      if (this._actual !== this.expected)
        throw (0, n.newError)(`${this.algorithm} checksum mismatch, expected ${this.expected}, got ${this._actual}`, "ERR_CHECKSUM_MISMATCH");
      return null;
    }
  }
  Ye.DigestTransform = T;
  function A(S, w, C) {
    return S != null && w != null && S !== w ? (C(new Error(`checksum mismatch: expected ${w} but got ${S} (X-Checksum-Sha2 header)`)), !1) : !0;
  }
  function N(S, w) {
    const C = S.headers[w];
    return C == null ? null : Array.isArray(C) ? C.length === 0 ? null : C[C.length - 1] : C;
  }
  function D(S, w) {
    if (!A(N(w, "X-Checksum-Sha2"), S.options.sha2, S.callback))
      return;
    const C = [];
    if (S.options.onProgress != null) {
      const $ = N(w, "content-length");
      $ != null && C.push(new f.ProgressCallbackTransform(parseInt($, 10), S.options.cancellationToken, S.options.onProgress));
    }
    const _ = S.options.sha512;
    _ != null ? C.push(new T(_, "sha512", _.length === 128 && !_.includes("+") && !_.includes("Z") && !_.includes("=") ? "hex" : "base64")) : S.options.sha2 != null && C.push(new T(S.options.sha2, "sha256", "hex"));
    const U = (0, r.createWriteStream)(S.destination);
    C.push(U);
    let x = w;
    for (const $ of C)
      $.on("error", (F) => {
        U.close(), S.options.cancellationToken.cancelled || S.callback(F);
      }), x = x.pipe($);
    U.on("finish", () => {
      U.close(S.callback);
    });
  }
  function I(S, w, C) {
    C != null && (S.method = C), S.headers = { ...S.headers };
    const _ = S.headers;
    return w != null && (_.authorization = w.startsWith("Basic") || w.startsWith("Bearer") ? w : `token ${w}`), _["User-Agent"] == null && (_["User-Agent"] = "electron-builder"), (C == null || C === "GET" || _["Cache-Control"] == null) && (_["Cache-Control"] = "no-cache"), S.protocol == null && process.versions.electron != null && (S.protocol = "https:"), S;
  }
  function b(S, w) {
    return JSON.stringify(S, (C, _) => C.endsWith("Authorization") || C.endsWith("authorization") || C.endsWith("Password") || C.endsWith("PASSWORD") || C.endsWith("Token") || C.includes("password") || C.includes("token") || w != null && w.has(C) ? "<stripped sensitive data>" : _, 2);
  }
  return Ye;
}
var lr = {}, ts;
function Jd() {
  if (ts) return lr;
  ts = 1, Object.defineProperty(lr, "__esModule", { value: !0 }), lr.MemoLazy = void 0;
  let e = class {
    constructor(i, s) {
      this.selector = i, this.creator = s, this.selected = void 0, this._value = void 0;
    }
    get hasValue() {
      return this._value !== void 0;
    }
    get value() {
      const i = this.selector();
      if (this._value !== void 0 && t(this.selected, i))
        return this._value;
      this.selected = i;
      const s = this.creator(i);
      return this.value = s, s;
    }
    set value(i) {
      this._value = i;
    }
  };
  lr.MemoLazy = e;
  function t(r, i) {
    if (typeof r == "object" && r !== null && (typeof i == "object" && i !== null)) {
      const n = Object.keys(r), f = Object.keys(i);
      return n.length === f.length && n.every((o) => t(r[o], i[o]));
    }
    return r === i;
  }
  return lr;
}
var zt = {}, rs;
function Qd() {
  if (rs) return zt;
  rs = 1, Object.defineProperty(zt, "__esModule", { value: !0 }), zt.githubUrl = e, zt.githubTagPrefix = t, zt.getS3LikeProviderBaseUrl = r;
  function e(n, f = "github.com") {
    return `${n.protocol || "https"}://${n.host || f}`;
  }
  function t(n) {
    var f;
    return n.tagNamePrefix ? n.tagNamePrefix : !((f = n.vPrefixedTagName) !== null && f !== void 0) || f ? "v" : "";
  }
  function r(n) {
    const f = n.provider;
    if (f === "s3")
      return i(n);
    if (f === "spaces")
      return a(n);
    throw new Error(`Not supported provider: ${f}`);
  }
  function i(n) {
    let f;
    if (n.accelerate == !0)
      f = `https://${n.bucket}.s3-accelerate.amazonaws.com`;
    else if (n.endpoint != null)
      f = `${n.endpoint}/${n.bucket}`;
    else if (n.bucket.includes(".")) {
      if (n.region == null)
        throw new Error(`Bucket name "${n.bucket}" includes a dot, but S3 region is missing`);
      n.region === "us-east-1" ? f = `https://s3.amazonaws.com/${n.bucket}` : f = `https://s3-${n.region}.amazonaws.com/${n.bucket}`;
    } else n.region === "cn-north-1" ? f = `https://${n.bucket}.s3.${n.region}.amazonaws.com.cn` : f = `https://${n.bucket}.s3.amazonaws.com`;
    return s(f, n.path);
  }
  function s(n, f) {
    return f != null && f.length > 0 && (f.startsWith("/") || (n += "/"), n += f), n;
  }
  function a(n) {
    if (n.name == null)
      throw new Error("name is missing");
    if (n.region == null)
      throw new Error("region is missing");
    return s(`https://${n.name}.${n.region}.digitaloceanspaces.com`, n.path);
  }
  return zt;
}
var Jr = {}, ns;
function Zd() {
  if (ns) return Jr;
  ns = 1, Object.defineProperty(Jr, "__esModule", { value: !0 }), Jr.retry = t;
  const e = Lo();
  async function t(r, i) {
    var s;
    const { retries: a, interval: n, backoff: f = 0, attempt: o = 0, shouldRetry: h, cancellationToken: d = new e.CancellationToken() } = i;
    try {
      return await r();
    } catch (l) {
      if (await Promise.resolve((s = h?.(l)) !== null && s !== void 0 ? s : !0) && a > 0 && !d.cancelled)
        return await new Promise((u) => setTimeout(u, n + f * o)), await t(r, { ...i, retries: a - 1, attempt: o + 1 });
      throw l;
    }
  }
  return Jr;
}
var Qr = {}, is;
function ef() {
  if (is) return Qr;
  is = 1, Object.defineProperty(Qr, "__esModule", { value: !0 }), Qr.parseDn = e;
  function e(t) {
    let r = !1, i = null, s = "", a = 0;
    t = t.trim();
    const n = /* @__PURE__ */ new Map();
    for (let f = 0; f <= t.length; f++) {
      if (f === t.length) {
        i !== null && n.set(i, s);
        break;
      }
      const o = t[f];
      if (r) {
        if (o === '"') {
          r = !1;
          continue;
        }
      } else {
        if (o === '"') {
          r = !0;
          continue;
        }
        if (o === "\\") {
          f++;
          const h = parseInt(t.slice(f, f + 2), 16);
          Number.isNaN(h) ? s += t[f] : (f++, s += String.fromCharCode(h));
          continue;
        }
        if (i === null && o === "=") {
          i = s, s = "";
          continue;
        }
        if (o === "," || o === ";" || o === "+") {
          i !== null && n.set(i, s), i = null, s = "";
          continue;
        }
      }
      if (o === " " && !r) {
        if (s.length === 0)
          continue;
        if (f > a) {
          let h = f;
          for (; t[h] === " "; )
            h++;
          a = h;
        }
        if (a >= t.length || t[a] === "," || t[a] === ";" || i === null && t[a] === "=" || i !== null && t[a] === "+") {
          f = a - 1;
          continue;
        }
      }
      s += o;
    }
    return n;
  }
  return Qr;
}
var Bt = {}, os;
function tf() {
  if (os) return Bt;
  os = 1, Object.defineProperty(Bt, "__esModule", { value: !0 }), Bt.nil = Bt.UUID = void 0;
  const e = dt, t = ln(), r = "options.name must be either a string or a Buffer", i = (0, e.randomBytes)(16);
  i[0] = i[0] | 1;
  const s = {}, a = [];
  for (let l = 0; l < 256; l++) {
    const u = (l + 256).toString(16).substr(1);
    s[u] = l, a[l] = u;
  }
  class n {
    constructor(u) {
      this.ascii = null, this.binary = null;
      const p = n.check(u);
      if (!p)
        throw new Error("not a UUID");
      this.version = p.version, p.format === "ascii" ? this.ascii = u : this.binary = u;
    }
    static v5(u, p) {
      return h(u, "sha1", 80, p);
    }
    toString() {
      return this.ascii == null && (this.ascii = d(this.binary)), this.ascii;
    }
    inspect() {
      return `UUID v${this.version} ${this.toString()}`;
    }
    static check(u, p = 0) {
      if (typeof u == "string")
        return u = u.toLowerCase(), /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-([a-f0-9]{12})$/.test(u) ? u === "00000000-0000-0000-0000-000000000000" ? { version: void 0, variant: "nil", format: "ascii" } : {
          version: (s[u[14] + u[15]] & 240) >> 4,
          variant: f((s[u[19] + u[20]] & 224) >> 5),
          format: "ascii"
        } : !1;
      if (Buffer.isBuffer(u)) {
        if (u.length < p + 16)
          return !1;
        let E = 0;
        for (; E < 16 && u[p + E] === 0; E++)
          ;
        return E === 16 ? { version: void 0, variant: "nil", format: "binary" } : {
          version: (u[p + 6] & 240) >> 4,
          variant: f((u[p + 8] & 224) >> 5),
          format: "binary"
        };
      }
      throw (0, t.newError)("Unknown type of uuid", "ERR_UNKNOWN_UUID_TYPE");
    }
    // read stringified uuid into a Buffer
    static parse(u) {
      const p = Buffer.allocUnsafe(16);
      let E = 0;
      for (let y = 0; y < 16; y++)
        p[y] = s[u[E++] + u[E++]], (y === 3 || y === 5 || y === 7 || y === 9) && (E += 1);
      return p;
    }
  }
  Bt.UUID = n, n.OID = n.parse("6ba7b812-9dad-11d1-80b4-00c04fd430c8");
  function f(l) {
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
  var o;
  (function(l) {
    l[l.ASCII = 0] = "ASCII", l[l.BINARY = 1] = "BINARY", l[l.OBJECT = 2] = "OBJECT";
  })(o || (o = {}));
  function h(l, u, p, E, y = o.ASCII) {
    const m = (0, e.createHash)(u);
    if (typeof l != "string" && !Buffer.isBuffer(l))
      throw (0, t.newError)(r, "ERR_INVALID_UUID_NAME");
    m.update(E), m.update(l);
    const A = m.digest();
    let N;
    switch (y) {
      case o.BINARY:
        A[6] = A[6] & 15 | p, A[8] = A[8] & 63 | 128, N = A;
        break;
      case o.OBJECT:
        A[6] = A[6] & 15 | p, A[8] = A[8] & 63 | 128, N = new n(A);
        break;
      default:
        N = a[A[0]] + a[A[1]] + a[A[2]] + a[A[3]] + "-" + a[A[4]] + a[A[5]] + "-" + a[A[6] & 15 | p] + a[A[7]] + "-" + a[A[8] & 63 | 128] + a[A[9]] + "-" + a[A[10]] + a[A[11]] + a[A[12]] + a[A[13]] + a[A[14]] + a[A[15]];
        break;
    }
    return N;
  }
  function d(l) {
    return a[l[0]] + a[l[1]] + a[l[2]] + a[l[3]] + "-" + a[l[4]] + a[l[5]] + "-" + a[l[6]] + a[l[7]] + "-" + a[l[8]] + a[l[9]] + "-" + a[l[10]] + a[l[11]] + a[l[12]] + a[l[13]] + a[l[14]] + a[l[15]];
  }
  return Bt.nil = new n("00000000-0000-0000-0000-000000000000"), Bt;
}
var Xt = {}, ii = {}, as;
function rf() {
  return as || (as = 1, (function(e) {
    (function(t) {
      t.parser = function(v, g) {
        return new i(v, g);
      }, t.SAXParser = i, t.SAXStream = l, t.createStream = h, t.MAX_BUFFER_LENGTH = 64 * 1024;
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
      function i(v, g) {
        if (!(this instanceof i))
          return new i(v, g);
        var q = this;
        a(q), q.q = q.c = "", q.bufferCheckPosition = t.MAX_BUFFER_LENGTH, q.encoding = null, q.opt = g || {}, q.opt.lowercase = q.opt.lowercase || q.opt.lowercasetags, q.looseCase = q.opt.lowercase ? "toLowerCase" : "toUpperCase", q.opt.maxEntityCount = q.opt.maxEntityCount || 512, q.opt.maxEntityDepth = q.opt.maxEntityDepth || 4, q.entityCount = q.entityDepth = 0, q.tags = [], q.closed = q.closedRoot = q.sawRoot = !1, q.tag = q.error = null, q.strict = !!v, q.noscript = !!(v || q.opt.noscript), q.state = _.BEGIN, q.strictEntities = q.opt.strictEntities, q.ENTITIES = q.strictEntities ? Object.create(t.XML_ENTITIES) : Object.create(t.ENTITIES), q.attribList = [], q.opt.xmlns && (q.ns = Object.create(m)), q.opt.unquotedAttributeValues === void 0 && (q.opt.unquotedAttributeValues = !v), q.trackPosition = q.opt.position !== !1, q.trackPosition && (q.position = q.line = q.column = 0), x(q, "onready");
      }
      Object.create || (Object.create = function(v) {
        function g() {
        }
        g.prototype = v;
        var q = new g();
        return q;
      }), Object.keys || (Object.keys = function(v) {
        var g = [];
        for (var q in v) v.hasOwnProperty(q) && g.push(q);
        return g;
      });
      function s(v) {
        for (var g = Math.max(t.MAX_BUFFER_LENGTH, 10), q = 0, P = 0, _e = r.length; P < _e; P++) {
          var Te = v[r[P]].length;
          if (Te > g)
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
          q = Math.max(q, Te);
        }
        var De = t.MAX_BUFFER_LENGTH - q;
        v.bufferCheckPosition = De + v.position;
      }
      function a(v) {
        for (var g = 0, q = r.length; g < q; g++)
          v[r[g]] = "";
      }
      function n(v) {
        G(v), v.cdata !== "" && (k(v, "oncdata", v.cdata), v.cdata = ""), v.script !== "" && (k(v, "onscript", v.script), v.script = "");
      }
      i.prototype = {
        end: function() {
          pe(this);
        },
        write: Ae,
        resume: function() {
          return this.error = null, this;
        },
        close: function() {
          return this.write(null);
        },
        flush: function() {
          n(this);
        }
      };
      var f;
      try {
        f = require("stream").Stream;
      } catch {
        f = function() {
        };
      }
      f || (f = function() {
      });
      var o = t.EVENTS.filter(function(v) {
        return v !== "error" && v !== "end";
      });
      function h(v, g) {
        return new l(v, g);
      }
      function d(v, g) {
        if (v.length >= 2) {
          if (v[0] === 255 && v[1] === 254)
            return "utf-16le";
          if (v[0] === 254 && v[1] === 255)
            return "utf-16be";
        }
        return v.length >= 3 && v[0] === 239 && v[1] === 187 && v[2] === 191 ? "utf8" : v.length >= 4 ? v[0] === 60 && v[1] === 0 && v[2] === 63 && v[3] === 0 ? "utf-16le" : v[0] === 0 && v[1] === 60 && v[2] === 0 && v[3] === 63 ? "utf-16be" : "utf8" : g ? "utf8" : null;
      }
      function l(v, g) {
        if (!(this instanceof l))
          return new l(v, g);
        f.apply(this), this._parser = new i(v, g), this.writable = !0, this.readable = !0;
        var q = this;
        this._parser.onend = function() {
          q.emit("end");
        }, this._parser.onerror = function(P) {
          q.emit("error", P), q._parser.error = null;
        }, this._decoder = null, this._decoderBuffer = null, o.forEach(function(P) {
          Object.defineProperty(q, "on" + P, {
            get: function() {
              return q._parser["on" + P];
            },
            set: function(_e) {
              if (!_e)
                return q.removeAllListeners(P), q._parser["on" + P] = _e, _e;
              q.on(P, _e);
            },
            enumerable: !0,
            configurable: !1
          });
        });
      }
      l.prototype = Object.create(f.prototype, {
        constructor: {
          value: l
        }
      }), l.prototype._decodeBuffer = function(v, g) {
        if (this._decoderBuffer && (v = Buffer.concat([this._decoderBuffer, v]), this._decoderBuffer = null), !this._decoder) {
          var q = d(v, g);
          if (!q)
            return this._decoderBuffer = v, "";
          this._parser.encoding = q, this._decoder = new TextDecoder(q);
        }
        return this._decoder.decode(v, { stream: !g });
      }, l.prototype.write = function(v) {
        if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(v))
          v = this._decodeBuffer(v, !1);
        else if (this._decoderBuffer) {
          var g = this._decodeBuffer(Buffer.alloc(0), !0);
          g && (this._parser.write(g), this.emit("data", g));
        }
        return this._parser.write(v.toString()), this.emit("data", v), !0;
      }, l.prototype.end = function(v) {
        if (v && v.length && this.write(v), this._decoderBuffer) {
          var g = this._decodeBuffer(Buffer.alloc(0), !0);
          g && (this._parser.write(g), this.emit("data", g));
        } else if (this._decoder) {
          var q = this._decoder.decode();
          q && (this._parser.write(q), this.emit("data", q));
        }
        return this._parser.end(), !0;
      }, l.prototype.on = function(v, g) {
        var q = this;
        return !q._parser["on" + v] && o.indexOf(v) !== -1 && (q._parser["on" + v] = function() {
          var P = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          P.splice(0, 0, v), q.emit.apply(q, P);
        }), f.prototype.on.call(q, v, g);
      };
      var u = "[CDATA[", p = "DOCTYPE", E = "http://www.w3.org/XML/1998/namespace", y = "http://www.w3.org/2000/xmlns/", m = { xml: E, xmlns: y }, T = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, A = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, N = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, D = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function I(v) {
        return v === " " || v === `
` || v === "\r" || v === "	";
      }
      function b(v) {
        return v === '"' || v === "'";
      }
      function S(v) {
        return v === ">" || I(v);
      }
      function w(v, g) {
        return v.test(g);
      }
      function C(v, g) {
        return !w(v, g);
      }
      var _ = 0;
      t.STATE = {
        BEGIN: _++,
        // leading byte order mark or whitespace
        BEGIN_WHITESPACE: _++,
        // leading whitespace
        TEXT: _++,
        // general stuff
        TEXT_ENTITY: _++,
        // &amp and such.
        OPEN_WAKA: _++,
        // <
        SGML_DECL: _++,
        // <!BLARG
        SGML_DECL_QUOTED: _++,
        // <!BLARG foo "bar
        DOCTYPE: _++,
        // <!DOCTYPE
        DOCTYPE_QUOTED: _++,
        // <!DOCTYPE "//blah
        DOCTYPE_DTD: _++,
        // <!DOCTYPE "//blah" [ ...
        DOCTYPE_DTD_QUOTED: _++,
        // <!DOCTYPE "//blah" [ "foo
        COMMENT_STARTING: _++,
        // <!-
        COMMENT: _++,
        // <!--
        COMMENT_ENDING: _++,
        // <!-- blah -
        COMMENT_ENDED: _++,
        // <!-- blah --
        CDATA: _++,
        // <![CDATA[ something
        CDATA_ENDING: _++,
        // ]
        CDATA_ENDING_2: _++,
        // ]]
        PROC_INST: _++,
        // <?hi
        PROC_INST_BODY: _++,
        // <?hi there
        PROC_INST_ENDING: _++,
        // <?hi "there" ?
        OPEN_TAG: _++,
        // <strong
        OPEN_TAG_SLASH: _++,
        // <strong /
        ATTRIB: _++,
        // <a
        ATTRIB_NAME: _++,
        // <a foo
        ATTRIB_NAME_SAW_WHITE: _++,
        // <a foo _
        ATTRIB_VALUE: _++,
        // <a foo=
        ATTRIB_VALUE_QUOTED: _++,
        // <a foo="bar
        ATTRIB_VALUE_CLOSED: _++,
        // <a foo="bar"
        ATTRIB_VALUE_UNQUOTED: _++,
        // <a foo=bar
        ATTRIB_VALUE_ENTITY_Q: _++,
        // <foo bar="&quot;"
        ATTRIB_VALUE_ENTITY_U: _++,
        // <foo bar=&quot
        CLOSE_TAG: _++,
        // </a
        CLOSE_TAG_SAW_WHITE: _++,
        // </a   >
        SCRIPT: _++,
        // <script> ...
        SCRIPT_ENDING: _++
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
        var g = t.ENTITIES[v], q = typeof g == "number" ? String.fromCharCode(g) : g;
        t.ENTITIES[v] = q;
      });
      for (var U in t.STATE)
        t.STATE[t.STATE[U]] = U;
      _ = t.STATE;
      function x(v, g, q) {
        v[g] && v[g](q);
      }
      function $(v) {
        var g = v && v.match(/(?:^|\s)encoding\s*=\s*(['"])([^'"]+)\1/i);
        return g ? g[2] : null;
      }
      function F(v) {
        return v ? v.toLowerCase().replace(/[^a-z0-9]/g, "") : null;
      }
      function L(v, g) {
        const q = F(v), P = F(g);
        return !q || !P ? !0 : P === "utf16" ? q === "utf16le" || q === "utf16be" : q === P;
      }
      function j(v, g) {
        if (!(!v.strict || !v.encoding || !g || g.name !== "xml")) {
          var q = $(g.body);
          q && !L(v.encoding, q) && Z(
            v,
            "XML declaration encoding " + q + " does not match detected stream encoding " + v.encoding.toUpperCase()
          );
        }
      }
      function k(v, g, q) {
        v.textNode && G(v), x(v, g, q);
      }
      function G(v) {
        v.textNode = Y(v.opt, v.textNode), v.textNode && x(v, "ontext", v.textNode), v.textNode = "";
      }
      function Y(v, g) {
        return v.trim && (g = g.trim()), v.normalize && (g = g.replace(/\s+/g, " ")), g;
      }
      function ee(v, g) {
        return G(v), v.trackPosition && (g += `
Line: ` + v.line + `
Column: ` + v.column + `
Char: ` + v.c), g = new Error(g), v.error = g, x(v, "onerror", g), v;
      }
      function pe(v) {
        return v.sawRoot && !v.closedRoot && Z(v, "Unclosed root tag"), v.state !== _.BEGIN && v.state !== _.BEGIN_WHITESPACE && v.state !== _.TEXT && ee(v, "Unexpected end"), G(v), v.c = "", v.closed = !0, x(v, "onend"), i.call(v, v.strict, v.opt), v;
      }
      function Z(v, g) {
        if (typeof v != "object" || !(v instanceof i))
          throw new Error("bad call to strictFail");
        v.strict && ee(v, g);
      }
      function ye(v) {
        v.strict || (v.tagName = v.tagName[v.looseCase]());
        var g = v.tags[v.tags.length - 1] || v, q = v.tag = { name: v.tagName, attributes: {} };
        v.opt.xmlns && (q.ns = g.ns), v.attribList.length = 0, k(v, "onopentagstart", q);
      }
      function me(v, g) {
        var q = v.indexOf(":"), P = q < 0 ? ["", v] : v.split(":"), _e = P[0], Te = P[1];
        return g && v === "xmlns" && (_e = "xmlns", Te = ""), { prefix: _e, local: Te };
      }
      function Q(v) {
        if (v.strict || (v.attribName = v.attribName[v.looseCase]()), v.attribList.indexOf(v.attribName) !== -1 || v.tag.attributes.hasOwnProperty(v.attribName)) {
          v.attribName = v.attribValue = "";
          return;
        }
        if (v.opt.xmlns) {
          var g = me(v.attribName, !0), q = g.prefix, P = g.local;
          if (q === "xmlns")
            if (P === "xml" && v.attribValue !== E)
              Z(
                v,
                "xml: prefix must be bound to " + E + `
Actual: ` + v.attribValue
              );
            else if (P === "xmlns" && v.attribValue !== y)
              Z(
                v,
                "xmlns: prefix must be bound to " + y + `
Actual: ` + v.attribValue
              );
            else {
              var _e = v.tag, Te = v.tags[v.tags.length - 1] || v;
              _e.ns === Te.ns && (_e.ns = Object.create(Te.ns)), _e.ns[P] = v.attribValue;
            }
          v.attribList.push([v.attribName, v.attribValue]);
        } else
          v.tag.attributes[v.attribName] = v.attribValue, k(v, "onattribute", {
            name: v.attribName,
            value: v.attribValue
          });
        v.attribName = v.attribValue = "";
      }
      function de(v, g) {
        if (v.opt.xmlns) {
          var q = v.tag, P = me(v.tagName);
          q.prefix = P.prefix, q.local = P.local, q.uri = q.ns[P.prefix] || "", q.prefix && !q.uri && (Z(
            v,
            "Unbound namespace prefix: " + JSON.stringify(v.tagName)
          ), q.uri = P.prefix);
          var _e = v.tags[v.tags.length - 1] || v;
          q.ns && _e.ns !== q.ns && Object.keys(q.ns).forEach(function(ne) {
            k(v, "onopennamespace", {
              prefix: ne,
              uri: q.ns[ne]
            });
          });
          for (var Te = 0, De = v.attribList.length; Te < De; Te++) {
            var $e = v.attribList[Te], Me = $e[0], We = $e[1], c = me(Me, !0), B = c.prefix, W = c.local, ie = B === "" ? "" : q.ns[B] || "", V = {
              name: Me,
              value: We,
              prefix: B,
              local: W,
              uri: ie
            };
            B && B !== "xmlns" && !ie && (Z(
              v,
              "Unbound namespace prefix: " + JSON.stringify(B)
            ), V.uri = B), v.tag.attributes[Me] = V, k(v, "onattribute", V);
          }
          v.attribList.length = 0;
        }
        v.tag.isSelfClosing = !!g, v.sawRoot = !0, v.tags.push(v.tag), k(v, "onopentag", v.tag), g || (!v.noscript && v.tagName.toLowerCase() === "script" ? v.state = _.SCRIPT : v.state = _.TEXT, v.tag = null, v.tagName = ""), v.attribName = v.attribValue = "", v.attribList.length = 0;
      }
      function ve(v) {
        if (!v.tagName) {
          Z(v, "Weird empty close tag."), v.textNode += "</>", v.state = _.TEXT;
          return;
        }
        if (v.script) {
          if (v.tagName !== "script") {
            v.script += "</" + v.tagName + ">", v.tagName = "", v.state = _.SCRIPT;
            return;
          }
          k(v, "onscript", v.script), v.script = "";
        }
        var g = v.tags.length, q = v.tagName;
        v.strict || (q = q[v.looseCase]());
        for (var P = q; g--; ) {
          var _e = v.tags[g];
          if (_e.name !== P)
            Z(v, "Unexpected close tag");
          else
            break;
        }
        if (g < 0) {
          Z(v, "Unmatched closing tag: " + v.tagName), v.textNode += "</" + v.tagName + ">", v.state = _.TEXT;
          return;
        }
        v.tagName = q;
        for (var Te = v.tags.length; Te-- > g; ) {
          var De = v.tag = v.tags.pop();
          v.tagName = v.tag.name, k(v, "onclosetag", v.tagName);
          var $e = {};
          for (var Me in De.ns)
            $e[Me] = De.ns[Me];
          var We = v.tags[v.tags.length - 1] || v;
          v.opt.xmlns && De.ns !== We.ns && Object.keys(De.ns).forEach(function(c) {
            var B = De.ns[c];
            k(v, "onclosenamespace", { prefix: c, uri: B });
          });
        }
        g === 0 && (v.closedRoot = !0), v.tagName = v.attribValue = v.attribName = "", v.attribList.length = 0, v.state = _.TEXT;
      }
      function Re(v) {
        var g = v.entity, q = g.toLowerCase(), P, _e = "";
        return v.ENTITIES[g] ? v.ENTITIES[g] : v.ENTITIES[q] ? v.ENTITIES[q] : (g = q, g.charAt(0) === "#" && (g.charAt(1) === "x" ? (g = g.slice(2), P = parseInt(g, 16), _e = P.toString(16)) : (g = g.slice(1), P = parseInt(g, 10), _e = P.toString(10))), g = g.replace(/^0+/, ""), isNaN(P) || _e.toLowerCase() !== g || P < 0 || P > 1114111 ? (Z(v, "Invalid character entity"), "&" + v.entity + ";") : String.fromCodePoint(P));
      }
      function Ne(v, g) {
        g === "<" ? (v.state = _.OPEN_WAKA, v.startTagPosition = v.position) : I(g) || (Z(v, "Non-whitespace before first tag."), v.textNode = g, v.state = _.TEXT);
      }
      function Ce(v, g) {
        var q = "";
        return g < v.length && (q = v.charAt(g)), q;
      }
      function Ae(v) {
        var g = this;
        if (this.error)
          throw this.error;
        if (g.closed)
          return ee(
            g,
            "Cannot write after close. Assign an onready handler."
          );
        if (v === null)
          return pe(g);
        typeof v == "object" && (v = v.toString());
        for (var q = 0, P = ""; P = Ce(v, q++), g.c = P, !!P; )
          switch (g.trackPosition && (g.position++, P === `
` ? (g.line++, g.column = 0) : g.column++), g.state) {
            case _.BEGIN:
              if (g.state = _.BEGIN_WHITESPACE, P === "\uFEFF")
                continue;
              Ne(g, P);
              continue;
            case _.BEGIN_WHITESPACE:
              Ne(g, P);
              continue;
            case _.TEXT:
              if (g.sawRoot && !g.closedRoot) {
                for (var Te = q - 1; P && P !== "<" && P !== "&"; )
                  P = Ce(v, q++), P && g.trackPosition && (g.position++, P === `
` ? (g.line++, g.column = 0) : g.column++);
                g.textNode += v.substring(Te, q - 1);
              }
              P === "<" && !(g.sawRoot && g.closedRoot && !g.strict) ? (g.state = _.OPEN_WAKA, g.startTagPosition = g.position) : (!I(P) && (!g.sawRoot || g.closedRoot) && Z(g, "Text data outside of root node."), P === "&" ? g.state = _.TEXT_ENTITY : g.textNode += P);
              continue;
            case _.SCRIPT:
              P === "<" ? g.state = _.SCRIPT_ENDING : g.script += P;
              continue;
            case _.SCRIPT_ENDING:
              P === "/" ? g.state = _.CLOSE_TAG : (g.script += "<" + P, g.state = _.SCRIPT);
              continue;
            case _.OPEN_WAKA:
              if (P === "!")
                g.state = _.SGML_DECL, g.sgmlDecl = "";
              else if (!I(P)) if (w(T, P))
                g.state = _.OPEN_TAG, g.tagName = P;
              else if (P === "/")
                g.state = _.CLOSE_TAG, g.tagName = "";
              else if (P === "?")
                g.state = _.PROC_INST, g.procInstName = g.procInstBody = "";
              else {
                if (Z(g, "Unencoded <"), g.startTagPosition + 1 < g.position) {
                  var _e = g.position - g.startTagPosition;
                  P = new Array(_e).join(" ") + P;
                }
                g.textNode += "<" + P, g.state = _.TEXT;
              }
              continue;
            case _.SGML_DECL:
              if (g.sgmlDecl + P === "--") {
                g.state = _.COMMENT, g.comment = "", g.sgmlDecl = "";
                continue;
              }
              g.doctype && g.doctype !== !0 && g.sgmlDecl ? (g.state = _.DOCTYPE_DTD, g.doctype += "<!" + g.sgmlDecl + P, g.sgmlDecl = "") : (g.sgmlDecl + P).toUpperCase() === u ? (k(g, "onopencdata"), g.state = _.CDATA, g.sgmlDecl = "", g.cdata = "") : (g.sgmlDecl + P).toUpperCase() === p ? (g.state = _.DOCTYPE, (g.doctype || g.sawRoot) && Z(
                g,
                "Inappropriately located doctype declaration"
              ), g.doctype = "", g.sgmlDecl = "") : P === ">" ? (k(g, "onsgmldeclaration", g.sgmlDecl), g.sgmlDecl = "", g.state = _.TEXT) : (b(P) && (g.state = _.SGML_DECL_QUOTED), g.sgmlDecl += P);
              continue;
            case _.SGML_DECL_QUOTED:
              P === g.q && (g.state = _.SGML_DECL, g.q = ""), g.sgmlDecl += P;
              continue;
            case _.DOCTYPE:
              P === ">" ? (g.state = _.TEXT, k(g, "ondoctype", g.doctype), g.doctype = !0) : (g.doctype += P, P === "[" ? g.state = _.DOCTYPE_DTD : b(P) && (g.state = _.DOCTYPE_QUOTED, g.q = P));
              continue;
            case _.DOCTYPE_QUOTED:
              g.doctype += P, P === g.q && (g.q = "", g.state = _.DOCTYPE);
              continue;
            case _.DOCTYPE_DTD:
              P === "]" ? (g.doctype += P, g.state = _.DOCTYPE) : P === "<" ? (g.state = _.OPEN_WAKA, g.startTagPosition = g.position) : b(P) ? (g.doctype += P, g.state = _.DOCTYPE_DTD_QUOTED, g.q = P) : g.doctype += P;
              continue;
            case _.DOCTYPE_DTD_QUOTED:
              g.doctype += P, P === g.q && (g.state = _.DOCTYPE_DTD, g.q = "");
              continue;
            case _.COMMENT:
              P === "-" ? g.state = _.COMMENT_ENDING : g.comment += P;
              continue;
            case _.COMMENT_ENDING:
              P === "-" ? (g.state = _.COMMENT_ENDED, g.comment = Y(g.opt, g.comment), g.comment && k(g, "oncomment", g.comment), g.comment = "") : (g.comment += "-" + P, g.state = _.COMMENT);
              continue;
            case _.COMMENT_ENDED:
              P !== ">" ? (Z(g, "Malformed comment"), g.comment += "--" + P, g.state = _.COMMENT) : g.doctype && g.doctype !== !0 ? g.state = _.DOCTYPE_DTD : g.state = _.TEXT;
              continue;
            case _.CDATA:
              for (var Te = q - 1; P && P !== "]"; )
                P = Ce(v, q++), P && g.trackPosition && (g.position++, P === `
` ? (g.line++, g.column = 0) : g.column++);
              g.cdata += v.substring(Te, q - 1), P === "]" && (g.state = _.CDATA_ENDING);
              continue;
            case _.CDATA_ENDING:
              P === "]" ? g.state = _.CDATA_ENDING_2 : (g.cdata += "]" + P, g.state = _.CDATA);
              continue;
            case _.CDATA_ENDING_2:
              P === ">" ? (g.cdata && k(g, "oncdata", g.cdata), k(g, "onclosecdata"), g.cdata = "", g.state = _.TEXT) : P === "]" ? g.cdata += "]" : (g.cdata += "]]" + P, g.state = _.CDATA);
              continue;
            case _.PROC_INST:
              P === "?" ? g.state = _.PROC_INST_ENDING : I(P) ? g.state = _.PROC_INST_BODY : g.procInstName += P;
              continue;
            case _.PROC_INST_BODY:
              if (!g.procInstBody && I(P))
                continue;
              P === "?" ? g.state = _.PROC_INST_ENDING : g.procInstBody += P;
              continue;
            case _.PROC_INST_ENDING:
              if (P === ">") {
                const We = {
                  name: g.procInstName,
                  body: g.procInstBody
                };
                j(g, We), k(g, "onprocessinginstruction", We), g.procInstName = g.procInstBody = "", g.state = _.TEXT;
              } else
                g.procInstBody += "?" + P, g.state = _.PROC_INST_BODY;
              continue;
            case _.OPEN_TAG:
              w(A, P) ? g.tagName += P : (ye(g), P === ">" ? de(g) : P === "/" ? g.state = _.OPEN_TAG_SLASH : (I(P) || Z(g, "Invalid character in tag name"), g.state = _.ATTRIB));
              continue;
            case _.OPEN_TAG_SLASH:
              P === ">" ? (de(g, !0), ve(g)) : (Z(
                g,
                "Forward-slash in opening tag not followed by >"
              ), g.state = _.ATTRIB);
              continue;
            case _.ATTRIB:
              if (I(P))
                continue;
              P === ">" ? de(g) : P === "/" ? g.state = _.OPEN_TAG_SLASH : w(T, P) ? (g.attribName = P, g.attribValue = "", g.state = _.ATTRIB_NAME) : Z(g, "Invalid attribute name");
              continue;
            case _.ATTRIB_NAME:
              P === "=" ? g.state = _.ATTRIB_VALUE : P === ">" ? (Z(g, "Attribute without value"), g.attribValue = g.attribName, Q(g), de(g)) : I(P) ? g.state = _.ATTRIB_NAME_SAW_WHITE : w(A, P) ? g.attribName += P : Z(g, "Invalid attribute name");
              continue;
            case _.ATTRIB_NAME_SAW_WHITE:
              if (P === "=")
                g.state = _.ATTRIB_VALUE;
              else {
                if (I(P))
                  continue;
                Z(g, "Attribute without value"), g.tag.attributes[g.attribName] = "", g.attribValue = "", k(g, "onattribute", {
                  name: g.attribName,
                  value: ""
                }), g.attribName = "", P === ">" ? de(g) : w(T, P) ? (g.attribName = P, g.state = _.ATTRIB_NAME) : (Z(g, "Invalid attribute name"), g.state = _.ATTRIB);
              }
              continue;
            case _.ATTRIB_VALUE:
              if (I(P))
                continue;
              b(P) ? (g.q = P, g.state = _.ATTRIB_VALUE_QUOTED) : (g.opt.unquotedAttributeValues || ee(g, "Unquoted attribute value"), g.state = _.ATTRIB_VALUE_UNQUOTED, g.attribValue = P);
              continue;
            case _.ATTRIB_VALUE_QUOTED:
              if (P !== g.q) {
                P === "&" ? g.state = _.ATTRIB_VALUE_ENTITY_Q : g.attribValue += P;
                continue;
              }
              Q(g), g.q = "", g.state = _.ATTRIB_VALUE_CLOSED;
              continue;
            case _.ATTRIB_VALUE_CLOSED:
              I(P) ? g.state = _.ATTRIB : P === ">" ? de(g) : P === "/" ? g.state = _.OPEN_TAG_SLASH : w(T, P) ? (Z(g, "No whitespace between attributes"), g.attribName = P, g.attribValue = "", g.state = _.ATTRIB_NAME) : Z(g, "Invalid attribute name");
              continue;
            case _.ATTRIB_VALUE_UNQUOTED:
              if (!S(P)) {
                P === "&" ? g.state = _.ATTRIB_VALUE_ENTITY_U : g.attribValue += P;
                continue;
              }
              Q(g), P === ">" ? de(g) : g.state = _.ATTRIB;
              continue;
            case _.CLOSE_TAG:
              if (g.tagName)
                P === ">" ? ve(g) : w(A, P) ? g.tagName += P : g.script ? (g.script += "</" + g.tagName + P, g.tagName = "", g.state = _.SCRIPT) : (I(P) || Z(g, "Invalid tagname in closing tag"), g.state = _.CLOSE_TAG_SAW_WHITE);
              else {
                if (I(P))
                  continue;
                C(T, P) ? g.script ? (g.script += "</" + P, g.state = _.SCRIPT) : Z(g, "Invalid tagname in closing tag.") : g.tagName = P;
              }
              continue;
            case _.CLOSE_TAG_SAW_WHITE:
              if (I(P))
                continue;
              P === ">" ? ve(g) : Z(g, "Invalid characters in closing tag");
              continue;
            case _.TEXT_ENTITY:
            case _.ATTRIB_VALUE_ENTITY_Q:
            case _.ATTRIB_VALUE_ENTITY_U:
              var De, $e;
              switch (g.state) {
                case _.TEXT_ENTITY:
                  De = _.TEXT, $e = "textNode";
                  break;
                case _.ATTRIB_VALUE_ENTITY_Q:
                  De = _.ATTRIB_VALUE_QUOTED, $e = "attribValue";
                  break;
                case _.ATTRIB_VALUE_ENTITY_U:
                  De = _.ATTRIB_VALUE_UNQUOTED, $e = "attribValue";
                  break;
              }
              if (P === ";") {
                var Me = Re(g);
                g.opt.unparsedEntities && !Object.values(t.XML_ENTITIES).includes(Me) ? ((g.entityCount += 1) > g.opt.maxEntityCount && ee(
                  g,
                  "Parsed entity count exceeds max entity count"
                ), (g.entityDepth += 1) > g.opt.maxEntityDepth && ee(
                  g,
                  "Parsed entity depth exceeds max entity depth"
                ), g.entity = "", g.state = De, g.write(Me), g.entityDepth -= 1) : (g[$e] += Me, g.entity = "", g.state = De);
              } else w(g.entity.length ? D : N, P) ? g.entity += P : (Z(g, "Invalid character in entity name"), g[$e] += "&" + g.entity + P, g.entity = "", g.state = De);
              continue;
            default:
              throw new Error(g, "Unknown state: " + g.state);
          }
        return g.position >= g.bufferCheckPosition && s(g), g;
      }
      String.fromCodePoint || (function() {
        var v = String.fromCharCode, g = Math.floor, q = function() {
          var P = 16384, _e = [], Te, De, $e = -1, Me = arguments.length;
          if (!Me)
            return "";
          for (var We = ""; ++$e < Me; ) {
            var c = Number(arguments[$e]);
            if (!isFinite(c) || // `NaN`, `+Infinity`, or `-Infinity`
            c < 0 || // not a valid Unicode code point
            c > 1114111 || // not a valid Unicode code point
            g(c) !== c)
              throw RangeError("Invalid code point: " + c);
            c <= 65535 ? _e.push(c) : (c -= 65536, Te = (c >> 10) + 55296, De = c % 1024 + 56320, _e.push(Te, De)), ($e + 1 === Me || _e.length > P) && (We += v.apply(null, _e), _e.length = 0);
          }
          return We;
        };
        Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
          value: q,
          configurable: !0,
          writable: !0
        }) : String.fromCodePoint = q;
      })();
    })(e);
  })(ii)), ii;
}
var ss;
function nf() {
  if (ss) return Xt;
  ss = 1, Object.defineProperty(Xt, "__esModule", { value: !0 }), Xt.XElement = void 0, Xt.parseXml = n;
  const e = rf(), t = ln();
  class r {
    constructor(o) {
      if (this.name = o, this.value = "", this.attributes = null, this.isCData = !1, this.elements = null, !o)
        throw (0, t.newError)("Element name cannot be empty", "ERR_XML_ELEMENT_NAME_EMPTY");
      if (!s(o))
        throw (0, t.newError)(`Invalid element name: ${o}`, "ERR_XML_ELEMENT_INVALID_NAME");
    }
    attribute(o) {
      const h = this.attributes === null ? null : this.attributes[o];
      if (h == null)
        throw (0, t.newError)(`No attribute "${o}"`, "ERR_XML_MISSED_ATTRIBUTE");
      return h;
    }
    removeAttribute(o) {
      this.attributes !== null && delete this.attributes[o];
    }
    element(o, h = !1, d = null) {
      const l = this.elementOrNull(o, h);
      if (l === null)
        throw (0, t.newError)(d || `No element "${o}"`, "ERR_XML_MISSED_ELEMENT");
      return l;
    }
    elementOrNull(o, h = !1) {
      if (this.elements === null)
        return null;
      for (const d of this.elements)
        if (a(d, o, h))
          return d;
      return null;
    }
    getElements(o, h = !1) {
      return this.elements === null ? [] : this.elements.filter((d) => a(d, o, h));
    }
    elementValueOrEmpty(o, h = !1) {
      const d = this.elementOrNull(o, h);
      return d === null ? "" : d.value;
    }
  }
  Xt.XElement = r;
  const i = new RegExp(/^[A-Za-z_][:A-Za-z0-9_-]*$/i);
  function s(f) {
    return i.test(f);
  }
  function a(f, o, h) {
    const d = f.name;
    return d === o || h === !0 && d.length === o.length && d.toLowerCase() === o.toLowerCase();
  }
  function n(f) {
    let o = null;
    const h = e.parser(!0, {}), d = [];
    return h.onopentag = (l) => {
      const u = new r(l.name);
      if (u.attributes = l.attributes, o === null)
        o = u;
      else {
        const p = d[d.length - 1];
        p.elements == null && (p.elements = []), p.elements.push(u);
      }
      d.push(u);
    }, h.onclosetag = () => {
      d.pop();
    }, h.ontext = (l) => {
      d.length > 0 && (d[d.length - 1].value = l);
    }, h.oncdata = (l) => {
      const u = d[d.length - 1];
      u.value = l, u.isCData = !0;
    }, h.onerror = (l) => {
      throw l;
    }, h.write(f), o;
  }
  return Xt;
}
var ls;
function He() {
  return ls || (ls = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CURRENT_APP_PACKAGE_FILE_NAME = e.CURRENT_APP_INSTALLER_FILE_NAME = e.XElement = e.parseXml = e.UUID = e.parseDn = e.retry = e.githubTagPrefix = e.githubUrl = e.getS3LikeProviderBaseUrl = e.ProgressCallbackTransform = e.MemoLazy = e.safeStringifyJson = e.safeGetHeader = e.parseJson = e.HttpExecutor = e.HttpError = e.DigestTransform = e.createHttpError = e.configureRequestUrl = e.configureRequestOptionsFromUrl = e.configureRequestOptions = e.newError = e.CancellationToken = e.CancellationError = void 0, e.asArray = l;
    var t = Lo();
    Object.defineProperty(e, "CancellationError", { enumerable: !0, get: function() {
      return t.CancellationError;
    } }), Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
      return t.CancellationToken;
    } });
    var r = ln();
    Object.defineProperty(e, "newError", { enumerable: !0, get: function() {
      return r.newError;
    } });
    var i = Kd();
    Object.defineProperty(e, "configureRequestOptions", { enumerable: !0, get: function() {
      return i.configureRequestOptions;
    } }), Object.defineProperty(e, "configureRequestOptionsFromUrl", { enumerable: !0, get: function() {
      return i.configureRequestOptionsFromUrl;
    } }), Object.defineProperty(e, "configureRequestUrl", { enumerable: !0, get: function() {
      return i.configureRequestUrl;
    } }), Object.defineProperty(e, "createHttpError", { enumerable: !0, get: function() {
      return i.createHttpError;
    } }), Object.defineProperty(e, "DigestTransform", { enumerable: !0, get: function() {
      return i.DigestTransform;
    } }), Object.defineProperty(e, "HttpError", { enumerable: !0, get: function() {
      return i.HttpError;
    } }), Object.defineProperty(e, "HttpExecutor", { enumerable: !0, get: function() {
      return i.HttpExecutor;
    } }), Object.defineProperty(e, "parseJson", { enumerable: !0, get: function() {
      return i.parseJson;
    } }), Object.defineProperty(e, "safeGetHeader", { enumerable: !0, get: function() {
      return i.safeGetHeader;
    } }), Object.defineProperty(e, "safeStringifyJson", { enumerable: !0, get: function() {
      return i.safeStringifyJson;
    } });
    var s = Jd();
    Object.defineProperty(e, "MemoLazy", { enumerable: !0, get: function() {
      return s.MemoLazy;
    } });
    var a = Rc();
    Object.defineProperty(e, "ProgressCallbackTransform", { enumerable: !0, get: function() {
      return a.ProgressCallbackTransform;
    } });
    var n = Qd();
    Object.defineProperty(e, "getS3LikeProviderBaseUrl", { enumerable: !0, get: function() {
      return n.getS3LikeProviderBaseUrl;
    } }), Object.defineProperty(e, "githubUrl", { enumerable: !0, get: function() {
      return n.githubUrl;
    } }), Object.defineProperty(e, "githubTagPrefix", { enumerable: !0, get: function() {
      return n.githubTagPrefix;
    } });
    var f = Zd();
    Object.defineProperty(e, "retry", { enumerable: !0, get: function() {
      return f.retry;
    } });
    var o = ef();
    Object.defineProperty(e, "parseDn", { enumerable: !0, get: function() {
      return o.parseDn;
    } });
    var h = tf();
    Object.defineProperty(e, "UUID", { enumerable: !0, get: function() {
      return h.UUID;
    } });
    var d = nf();
    Object.defineProperty(e, "parseXml", { enumerable: !0, get: function() {
      return d.parseXml;
    } }), Object.defineProperty(e, "XElement", { enumerable: !0, get: function() {
      return d.XElement;
    } }), e.CURRENT_APP_INSTALLER_FILE_NAME = "installer.exe", e.CURRENT_APP_PACKAGE_FILE_NAME = "package.7z";
    function l(u) {
      return u == null ? [] : Array.isArray(u) ? u : [u];
    }
  })(Zn)), Zn;
}
var ze = {}, Zr = {}, bt = {}, cs;
function Fr() {
  if (cs) return bt;
  cs = 1;
  function e(n) {
    return typeof n > "u" || n === null;
  }
  function t(n) {
    return typeof n == "object" && n !== null;
  }
  function r(n) {
    return Array.isArray(n) ? n : e(n) ? [] : [n];
  }
  function i(n, f) {
    var o, h, d, l;
    if (f)
      for (l = Object.keys(f), o = 0, h = l.length; o < h; o += 1)
        d = l[o], n[d] = f[d];
    return n;
  }
  function s(n, f) {
    var o = "", h;
    for (h = 0; h < f; h += 1)
      o += n;
    return o;
  }
  function a(n) {
    return n === 0 && Number.NEGATIVE_INFINITY === 1 / n;
  }
  return bt.isNothing = e, bt.isObject = t, bt.toArray = r, bt.repeat = s, bt.isNegativeZero = a, bt.extend = i, bt;
}
var oi, us;
function Lr() {
  if (us) return oi;
  us = 1;
  function e(r, i) {
    var s = "", a = r.reason || "(unknown reason)";
    return r.mark ? (r.mark.name && (s += 'in "' + r.mark.name + '" '), s += "(" + (r.mark.line + 1) + ":" + (r.mark.column + 1) + ")", !i && r.mark.snippet && (s += `

` + r.mark.snippet), a + " " + s) : a;
  }
  function t(r, i) {
    Error.call(this), this.name = "YAMLException", this.reason = r, this.mark = i, this.message = e(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
  }
  return t.prototype = Object.create(Error.prototype), t.prototype.constructor = t, t.prototype.toString = function(i) {
    return this.name + ": " + e(this, i);
  }, oi = t, oi;
}
var ai, ds;
function of() {
  if (ds) return ai;
  ds = 1;
  var e = Fr();
  function t(s, a, n, f, o) {
    var h = "", d = "", l = Math.floor(o / 2) - 1;
    return f - a > l && (h = " ... ", a = f - l + h.length), n - f > l && (d = " ...", n = f + l - d.length), {
      str: h + s.slice(a, n).replace(/\t/g, "→") + d,
      pos: f - a + h.length
      // relative position
    };
  }
  function r(s, a) {
    return e.repeat(" ", a - s.length) + s;
  }
  function i(s, a) {
    if (a = Object.create(a || null), !s.buffer) return null;
    a.maxLength || (a.maxLength = 79), typeof a.indent != "number" && (a.indent = 1), typeof a.linesBefore != "number" && (a.linesBefore = 3), typeof a.linesAfter != "number" && (a.linesAfter = 2);
    for (var n = /\r?\n|\r|\0/g, f = [0], o = [], h, d = -1; h = n.exec(s.buffer); )
      o.push(h.index), f.push(h.index + h[0].length), s.position <= h.index && d < 0 && (d = f.length - 2);
    d < 0 && (d = f.length - 1);
    var l = "", u, p, E = Math.min(s.line + a.linesAfter, o.length).toString().length, y = a.maxLength - (a.indent + E + 3);
    for (u = 1; u <= a.linesBefore && !(d - u < 0); u++)
      p = t(
        s.buffer,
        f[d - u],
        o[d - u],
        s.position - (f[d] - f[d - u]),
        y
      ), l = e.repeat(" ", a.indent) + r((s.line - u + 1).toString(), E) + " | " + p.str + `
` + l;
    for (p = t(s.buffer, f[d], o[d], s.position, y), l += e.repeat(" ", a.indent) + r((s.line + 1).toString(), E) + " | " + p.str + `
`, l += e.repeat("-", a.indent + E + 3 + p.pos) + `^
`, u = 1; u <= a.linesAfter && !(d + u >= o.length); u++)
      p = t(
        s.buffer,
        f[d + u],
        o[d + u],
        s.position - (f[d] - f[d + u]),
        y
      ), l += e.repeat(" ", a.indent) + r((s.line + u + 1).toString(), E) + " | " + p.str + `
`;
    return l.replace(/\n$/, "");
  }
  return ai = i, ai;
}
var si, fs;
function Je() {
  if (fs) return si;
  fs = 1;
  var e = Lr(), t = [
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
  function i(a) {
    var n = {};
    return a !== null && Object.keys(a).forEach(function(f) {
      a[f].forEach(function(o) {
        n[String(o)] = f;
      });
    }), n;
  }
  function s(a, n) {
    if (n = n || {}, Object.keys(n).forEach(function(f) {
      if (t.indexOf(f) === -1)
        throw new e('Unknown option "' + f + '" is met in definition of "' + a + '" YAML type.');
    }), this.options = n, this.tag = a, this.kind = n.kind || null, this.resolve = n.resolve || function() {
      return !0;
    }, this.construct = n.construct || function(f) {
      return f;
    }, this.instanceOf = n.instanceOf || null, this.predicate = n.predicate || null, this.represent = n.represent || null, this.representName = n.representName || null, this.defaultStyle = n.defaultStyle || null, this.multi = n.multi || !1, this.styleAliases = i(n.styleAliases || null), r.indexOf(this.kind) === -1)
      throw new e('Unknown kind "' + this.kind + '" is specified for "' + a + '" YAML type.');
  }
  return si = s, si;
}
var li, hs;
function Sc() {
  if (hs) return li;
  hs = 1;
  var e = Lr(), t = Je();
  function r(a, n) {
    var f = [];
    return a[n].forEach(function(o) {
      var h = f.length;
      f.forEach(function(d, l) {
        d.tag === o.tag && d.kind === o.kind && d.multi === o.multi && (h = l);
      }), f[h] = o;
    }), f;
  }
  function i() {
    var a = {
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
    }, n, f;
    function o(h) {
      h.multi ? (a.multi[h.kind].push(h), a.multi.fallback.push(h)) : a[h.kind][h.tag] = a.fallback[h.tag] = h;
    }
    for (n = 0, f = arguments.length; n < f; n += 1)
      arguments[n].forEach(o);
    return a;
  }
  function s(a) {
    return this.extend(a);
  }
  return s.prototype.extend = function(n) {
    var f = [], o = [];
    if (n instanceof t)
      o.push(n);
    else if (Array.isArray(n))
      o = o.concat(n);
    else if (n && (Array.isArray(n.implicit) || Array.isArray(n.explicit)))
      n.implicit && (f = f.concat(n.implicit)), n.explicit && (o = o.concat(n.explicit));
    else
      throw new e("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
    f.forEach(function(d) {
      if (!(d instanceof t))
        throw new e("Specified list of YAML types (or a single Type object) contains a non-Type object.");
      if (d.loadKind && d.loadKind !== "scalar")
        throw new e("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
      if (d.multi)
        throw new e("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }), o.forEach(function(d) {
      if (!(d instanceof t))
        throw new e("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    });
    var h = Object.create(s.prototype);
    return h.implicit = (this.implicit || []).concat(f), h.explicit = (this.explicit || []).concat(o), h.compiledImplicit = r(h, "implicit"), h.compiledExplicit = r(h, "explicit"), h.compiledTypeMap = i(h.compiledImplicit, h.compiledExplicit), h;
  }, li = s, li;
}
var ci, ps;
function Ic() {
  if (ps) return ci;
  ps = 1;
  var e = Je();
  return ci = new e("tag:yaml.org,2002:str", {
    kind: "scalar",
    construct: function(t) {
      return t !== null ? t : "";
    }
  }), ci;
}
var ui, ms;
function bc() {
  if (ms) return ui;
  ms = 1;
  var e = Je();
  return ui = new e("tag:yaml.org,2002:seq", {
    kind: "sequence",
    construct: function(t) {
      return t !== null ? t : [];
    }
  }), ui;
}
var di, gs;
function Cc() {
  if (gs) return di;
  gs = 1;
  var e = Je();
  return di = new e("tag:yaml.org,2002:map", {
    kind: "mapping",
    construct: function(t) {
      return t !== null ? t : {};
    }
  }), di;
}
var fi, Es;
function Nc() {
  if (Es) return fi;
  Es = 1;
  var e = Sc();
  return fi = new e({
    explicit: [
      Ic(),
      bc(),
      Cc()
    ]
  }), fi;
}
var hi, ys;
function Oc() {
  if (ys) return hi;
  ys = 1;
  var e = Je();
  function t(s) {
    if (s === null) return !0;
    var a = s.length;
    return a === 1 && s === "~" || a === 4 && (s === "null" || s === "Null" || s === "NULL");
  }
  function r() {
    return null;
  }
  function i(s) {
    return s === null;
  }
  return hi = new e("tag:yaml.org,2002:null", {
    kind: "scalar",
    resolve: t,
    construct: r,
    predicate: i,
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
  }), hi;
}
var pi, vs;
function Dc() {
  if (vs) return pi;
  vs = 1;
  var e = Je();
  function t(s) {
    if (s === null) return !1;
    var a = s.length;
    return a === 4 && (s === "true" || s === "True" || s === "TRUE") || a === 5 && (s === "false" || s === "False" || s === "FALSE");
  }
  function r(s) {
    return s === "true" || s === "True" || s === "TRUE";
  }
  function i(s) {
    return Object.prototype.toString.call(s) === "[object Boolean]";
  }
  return pi = new e("tag:yaml.org,2002:bool", {
    kind: "scalar",
    resolve: t,
    construct: r,
    predicate: i,
    represent: {
      lowercase: function(s) {
        return s ? "true" : "false";
      },
      uppercase: function(s) {
        return s ? "TRUE" : "FALSE";
      },
      camelcase: function(s) {
        return s ? "True" : "False";
      }
    },
    defaultStyle: "lowercase"
  }), pi;
}
var mi, ws;
function Pc() {
  if (ws) return mi;
  ws = 1;
  var e = Fr(), t = Je();
  function r(o) {
    return 48 <= o && o <= 57 || 65 <= o && o <= 70 || 97 <= o && o <= 102;
  }
  function i(o) {
    return 48 <= o && o <= 55;
  }
  function s(o) {
    return 48 <= o && o <= 57;
  }
  function a(o) {
    if (o === null) return !1;
    var h = o.length, d = 0, l = !1, u;
    if (!h) return !1;
    if (u = o[d], (u === "-" || u === "+") && (u = o[++d]), u === "0") {
      if (d + 1 === h) return !0;
      if (u = o[++d], u === "b") {
        for (d++; d < h; d++)
          if (u = o[d], u !== "_") {
            if (u !== "0" && u !== "1") return !1;
            l = !0;
          }
        return l && u !== "_";
      }
      if (u === "x") {
        for (d++; d < h; d++)
          if (u = o[d], u !== "_") {
            if (!r(o.charCodeAt(d))) return !1;
            l = !0;
          }
        return l && u !== "_";
      }
      if (u === "o") {
        for (d++; d < h; d++)
          if (u = o[d], u !== "_") {
            if (!i(o.charCodeAt(d))) return !1;
            l = !0;
          }
        return l && u !== "_";
      }
    }
    if (u === "_") return !1;
    for (; d < h; d++)
      if (u = o[d], u !== "_") {
        if (!s(o.charCodeAt(d)))
          return !1;
        l = !0;
      }
    return !(!l || u === "_");
  }
  function n(o) {
    var h = o, d = 1, l;
    if (h.indexOf("_") !== -1 && (h = h.replace(/_/g, "")), l = h[0], (l === "-" || l === "+") && (l === "-" && (d = -1), h = h.slice(1), l = h[0]), h === "0") return 0;
    if (l === "0") {
      if (h[1] === "b") return d * parseInt(h.slice(2), 2);
      if (h[1] === "x") return d * parseInt(h.slice(2), 16);
      if (h[1] === "o") return d * parseInt(h.slice(2), 8);
    }
    return d * parseInt(h, 10);
  }
  function f(o) {
    return Object.prototype.toString.call(o) === "[object Number]" && o % 1 === 0 && !e.isNegativeZero(o);
  }
  return mi = new t("tag:yaml.org,2002:int", {
    kind: "scalar",
    resolve: a,
    construct: n,
    predicate: f,
    represent: {
      binary: function(o) {
        return o >= 0 ? "0b" + o.toString(2) : "-0b" + o.toString(2).slice(1);
      },
      octal: function(o) {
        return o >= 0 ? "0o" + o.toString(8) : "-0o" + o.toString(8).slice(1);
      },
      decimal: function(o) {
        return o.toString(10);
      },
      /* eslint-disable max-len */
      hexadecimal: function(o) {
        return o >= 0 ? "0x" + o.toString(16).toUpperCase() : "-0x" + o.toString(16).toUpperCase().slice(1);
      }
    },
    defaultStyle: "decimal",
    styleAliases: {
      binary: [2, "bin"],
      octal: [8, "oct"],
      decimal: [10, "dec"],
      hexadecimal: [16, "hex"]
    }
  }), mi;
}
var gi, _s;
function Fc() {
  if (_s) return gi;
  _s = 1;
  var e = Fr(), t = Je(), r = new RegExp(
    // 2.5e4, 2.5 and integers
    "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
  );
  function i(o) {
    return !(o === null || !r.test(o) || // Quick hack to not allow integers end with `_`
    // Probably should update regexp & check speed
    o[o.length - 1] === "_");
  }
  function s(o) {
    var h, d;
    return h = o.replace(/_/g, "").toLowerCase(), d = h[0] === "-" ? -1 : 1, "+-".indexOf(h[0]) >= 0 && (h = h.slice(1)), h === ".inf" ? d === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : h === ".nan" ? NaN : d * parseFloat(h, 10);
  }
  var a = /^[-+]?[0-9]+e/;
  function n(o, h) {
    var d;
    if (isNaN(o))
      switch (h) {
        case "lowercase":
          return ".nan";
        case "uppercase":
          return ".NAN";
        case "camelcase":
          return ".NaN";
      }
    else if (Number.POSITIVE_INFINITY === o)
      switch (h) {
        case "lowercase":
          return ".inf";
        case "uppercase":
          return ".INF";
        case "camelcase":
          return ".Inf";
      }
    else if (Number.NEGATIVE_INFINITY === o)
      switch (h) {
        case "lowercase":
          return "-.inf";
        case "uppercase":
          return "-.INF";
        case "camelcase":
          return "-.Inf";
      }
    else if (e.isNegativeZero(o))
      return "-0.0";
    return d = o.toString(10), a.test(d) ? d.replace("e", ".e") : d;
  }
  function f(o) {
    return Object.prototype.toString.call(o) === "[object Number]" && (o % 1 !== 0 || e.isNegativeZero(o));
  }
  return gi = new t("tag:yaml.org,2002:float", {
    kind: "scalar",
    resolve: i,
    construct: s,
    predicate: f,
    represent: n,
    defaultStyle: "lowercase"
  }), gi;
}
var Ei, Ts;
function Lc() {
  return Ts || (Ts = 1, Ei = Nc().extend({
    implicit: [
      Oc(),
      Dc(),
      Pc(),
      Fc()
    ]
  })), Ei;
}
var yi, As;
function xc() {
  return As || (As = 1, yi = Lc()), yi;
}
var vi, Rs;
function Uc() {
  if (Rs) return vi;
  Rs = 1;
  var e = Je(), t = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
  ), r = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
  );
  function i(n) {
    return n === null ? !1 : t.exec(n) !== null || r.exec(n) !== null;
  }
  function s(n) {
    var f, o, h, d, l, u, p, E = 0, y = null, m, T, A;
    if (f = t.exec(n), f === null && (f = r.exec(n)), f === null) throw new Error("Date resolve error");
    if (o = +f[1], h = +f[2] - 1, d = +f[3], !f[4])
      return new Date(Date.UTC(o, h, d));
    if (l = +f[4], u = +f[5], p = +f[6], f[7]) {
      for (E = f[7].slice(0, 3); E.length < 3; )
        E += "0";
      E = +E;
    }
    return f[9] && (m = +f[10], T = +(f[11] || 0), y = (m * 60 + T) * 6e4, f[9] === "-" && (y = -y)), A = new Date(Date.UTC(o, h, d, l, u, p, E)), y && A.setTime(A.getTime() - y), A;
  }
  function a(n) {
    return n.toISOString();
  }
  return vi = new e("tag:yaml.org,2002:timestamp", {
    kind: "scalar",
    resolve: i,
    construct: s,
    instanceOf: Date,
    represent: a
  }), vi;
}
var wi, Ss;
function kc() {
  if (Ss) return wi;
  Ss = 1;
  var e = Je();
  function t(r) {
    return r === "<<" || r === null;
  }
  return wi = new e("tag:yaml.org,2002:merge", {
    kind: "scalar",
    resolve: t
  }), wi;
}
var _i, Is;
function $c() {
  if (Is) return _i;
  Is = 1;
  var e = Je(), t = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
  function r(n) {
    if (n === null) return !1;
    var f, o, h = 0, d = n.length, l = t;
    for (o = 0; o < d; o++)
      if (f = l.indexOf(n.charAt(o)), !(f > 64)) {
        if (f < 0) return !1;
        h += 6;
      }
    return h % 8 === 0;
  }
  function i(n) {
    var f, o, h = n.replace(/[\r\n=]/g, ""), d = h.length, l = t, u = 0, p = [];
    for (f = 0; f < d; f++)
      f % 4 === 0 && f && (p.push(u >> 16 & 255), p.push(u >> 8 & 255), p.push(u & 255)), u = u << 6 | l.indexOf(h.charAt(f));
    return o = d % 4 * 6, o === 0 ? (p.push(u >> 16 & 255), p.push(u >> 8 & 255), p.push(u & 255)) : o === 18 ? (p.push(u >> 10 & 255), p.push(u >> 2 & 255)) : o === 12 && p.push(u >> 4 & 255), new Uint8Array(p);
  }
  function s(n) {
    var f = "", o = 0, h, d, l = n.length, u = t;
    for (h = 0; h < l; h++)
      h % 3 === 0 && h && (f += u[o >> 18 & 63], f += u[o >> 12 & 63], f += u[o >> 6 & 63], f += u[o & 63]), o = (o << 8) + n[h];
    return d = l % 3, d === 0 ? (f += u[o >> 18 & 63], f += u[o >> 12 & 63], f += u[o >> 6 & 63], f += u[o & 63]) : d === 2 ? (f += u[o >> 10 & 63], f += u[o >> 4 & 63], f += u[o << 2 & 63], f += u[64]) : d === 1 && (f += u[o >> 2 & 63], f += u[o << 4 & 63], f += u[64], f += u[64]), f;
  }
  function a(n) {
    return Object.prototype.toString.call(n) === "[object Uint8Array]";
  }
  return _i = new e("tag:yaml.org,2002:binary", {
    kind: "scalar",
    resolve: r,
    construct: i,
    predicate: a,
    represent: s
  }), _i;
}
var Ti, bs;
function Mc() {
  if (bs) return Ti;
  bs = 1;
  var e = Je(), t = Object.prototype.hasOwnProperty, r = Object.prototype.toString;
  function i(a) {
    if (a === null) return !0;
    var n = [], f, o, h, d, l, u = a;
    for (f = 0, o = u.length; f < o; f += 1) {
      if (h = u[f], l = !1, r.call(h) !== "[object Object]") return !1;
      for (d in h)
        if (t.call(h, d))
          if (!l) l = !0;
          else return !1;
      if (!l) return !1;
      if (n.indexOf(d) === -1) n.push(d);
      else return !1;
    }
    return !0;
  }
  function s(a) {
    return a !== null ? a : [];
  }
  return Ti = new e("tag:yaml.org,2002:omap", {
    kind: "sequence",
    resolve: i,
    construct: s
  }), Ti;
}
var Ai, Cs;
function qc() {
  if (Cs) return Ai;
  Cs = 1;
  var e = Je(), t = Object.prototype.toString;
  function r(s) {
    if (s === null) return !0;
    var a, n, f, o, h, d = s;
    for (h = new Array(d.length), a = 0, n = d.length; a < n; a += 1) {
      if (f = d[a], t.call(f) !== "[object Object]" || (o = Object.keys(f), o.length !== 1)) return !1;
      h[a] = [o[0], f[o[0]]];
    }
    return !0;
  }
  function i(s) {
    if (s === null) return [];
    var a, n, f, o, h, d = s;
    for (h = new Array(d.length), a = 0, n = d.length; a < n; a += 1)
      f = d[a], o = Object.keys(f), h[a] = [o[0], f[o[0]]];
    return h;
  }
  return Ai = new e("tag:yaml.org,2002:pairs", {
    kind: "sequence",
    resolve: r,
    construct: i
  }), Ai;
}
var Ri, Ns;
function Bc() {
  if (Ns) return Ri;
  Ns = 1;
  var e = Je(), t = Object.prototype.hasOwnProperty;
  function r(s) {
    if (s === null) return !0;
    var a, n = s;
    for (a in n)
      if (t.call(n, a) && n[a] !== null)
        return !1;
    return !0;
  }
  function i(s) {
    return s !== null ? s : {};
  }
  return Ri = new e("tag:yaml.org,2002:set", {
    kind: "mapping",
    resolve: r,
    construct: i
  }), Ri;
}
var Si, Os;
function xo() {
  return Os || (Os = 1, Si = xc().extend({
    implicit: [
      Uc(),
      kc()
    ],
    explicit: [
      $c(),
      Mc(),
      qc(),
      Bc()
    ]
  })), Si;
}
var Ds;
function af() {
  if (Ds) return Zr;
  Ds = 1;
  var e = Fr(), t = Lr(), r = of(), i = xo(), s = Object.prototype.hasOwnProperty, a = 1, n = 2, f = 3, o = 4, h = 1, d = 2, l = 3, u = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, p = /[\x85\u2028\u2029]/, E = /[,\[\]\{\}]/, y = /^(?:!|!!|![a-z\-]+!)$/i, m = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
  function T(c) {
    return Object.prototype.toString.call(c);
  }
  function A(c) {
    return c === 10 || c === 13;
  }
  function N(c) {
    return c === 9 || c === 32;
  }
  function D(c) {
    return c === 9 || c === 32 || c === 10 || c === 13;
  }
  function I(c) {
    return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
  }
  function b(c) {
    var B;
    return 48 <= c && c <= 57 ? c - 48 : (B = c | 32, 97 <= B && B <= 102 ? B - 97 + 10 : -1);
  }
  function S(c) {
    return c === 120 ? 2 : c === 117 ? 4 : c === 85 ? 8 : 0;
  }
  function w(c) {
    return 48 <= c && c <= 57 ? c - 48 : -1;
  }
  function C(c) {
    return c === 48 ? "\0" : c === 97 ? "\x07" : c === 98 ? "\b" : c === 116 || c === 9 ? "	" : c === 110 ? `
` : c === 118 ? "\v" : c === 102 ? "\f" : c === 114 ? "\r" : c === 101 ? "\x1B" : c === 32 ? " " : c === 34 ? '"' : c === 47 ? "/" : c === 92 ? "\\" : c === 78 ? "" : c === 95 ? " " : c === 76 ? "\u2028" : c === 80 ? "\u2029" : "";
  }
  function _(c) {
    return c <= 65535 ? String.fromCharCode(c) : String.fromCharCode(
      (c - 65536 >> 10) + 55296,
      (c - 65536 & 1023) + 56320
    );
  }
  function U(c, B, W) {
    B === "__proto__" ? Object.defineProperty(c, B, {
      configurable: !0,
      enumerable: !0,
      writable: !0,
      value: W
    }) : c[B] = W;
  }
  for (var x = new Array(256), $ = new Array(256), F = 0; F < 256; F++)
    x[F] = C(F) ? 1 : 0, $[F] = C(F);
  function L(c, B) {
    this.input = c, this.filename = B.filename || null, this.schema = B.schema || i, this.onWarning = B.onWarning || null, this.legacy = B.legacy || !1, this.json = B.json || !1, this.listener = B.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = c.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
  }
  function j(c, B) {
    var W = {
      name: c.filename,
      buffer: c.input.slice(0, -1),
      // omit trailing \0
      position: c.position,
      line: c.line,
      column: c.position - c.lineStart
    };
    return W.snippet = r(W), new t(B, W);
  }
  function k(c, B) {
    throw j(c, B);
  }
  function G(c, B) {
    c.onWarning && c.onWarning.call(null, j(c, B));
  }
  var Y = {
    YAML: function(B, W, ie) {
      var V, ne, te;
      B.version !== null && k(B, "duplication of %YAML directive"), ie.length !== 1 && k(B, "YAML directive accepts exactly one argument"), V = /^([0-9]+)\.([0-9]+)$/.exec(ie[0]), V === null && k(B, "ill-formed argument of the YAML directive"), ne = parseInt(V[1], 10), te = parseInt(V[2], 10), ne !== 1 && k(B, "unacceptable YAML version of the document"), B.version = ie[0], B.checkLineBreaks = te < 2, te !== 1 && te !== 2 && G(B, "unsupported YAML version of the document");
    },
    TAG: function(B, W, ie) {
      var V, ne;
      ie.length !== 2 && k(B, "TAG directive accepts exactly two arguments"), V = ie[0], ne = ie[1], y.test(V) || k(B, "ill-formed tag handle (first argument) of the TAG directive"), s.call(B.tagMap, V) && k(B, 'there is a previously declared suffix for "' + V + '" tag handle'), m.test(ne) || k(B, "ill-formed tag prefix (second argument) of the TAG directive");
      try {
        ne = decodeURIComponent(ne);
      } catch {
        k(B, "tag prefix is malformed: " + ne);
      }
      B.tagMap[V] = ne;
    }
  };
  function ee(c, B, W, ie) {
    var V, ne, te, ae;
    if (B < W) {
      if (ae = c.input.slice(B, W), ie)
        for (V = 0, ne = ae.length; V < ne; V += 1)
          te = ae.charCodeAt(V), te === 9 || 32 <= te && te <= 1114111 || k(c, "expected valid JSON character");
      else u.test(ae) && k(c, "the stream contains non-printable characters");
      c.result += ae;
    }
  }
  function pe(c, B, W, ie) {
    var V, ne, te, ae;
    for (e.isObject(W) || k(c, "cannot merge mappings; the provided source object is unacceptable"), V = Object.keys(W), te = 0, ae = V.length; te < ae; te += 1)
      ne = V[te], s.call(B, ne) || (U(B, ne, W[ne]), ie[ne] = !0);
  }
  function Z(c, B, W, ie, V, ne, te, ae, ue) {
    var Se, Ie;
    if (Array.isArray(V))
      for (V = Array.prototype.slice.call(V), Se = 0, Ie = V.length; Se < Ie; Se += 1)
        Array.isArray(V[Se]) && k(c, "nested arrays are not supported inside keys"), typeof V == "object" && T(V[Se]) === "[object Object]" && (V[Se] = "[object Object]");
    if (typeof V == "object" && T(V) === "[object Object]" && (V = "[object Object]"), V = String(V), B === null && (B = {}), ie === "tag:yaml.org,2002:merge")
      if (Array.isArray(ne))
        for (Se = 0, Ie = ne.length; Se < Ie; Se += 1)
          pe(c, B, ne[Se], W);
      else
        pe(c, B, ne, W);
    else
      !c.json && !s.call(W, V) && s.call(B, V) && (c.line = te || c.line, c.lineStart = ae || c.lineStart, c.position = ue || c.position, k(c, "duplicated mapping key")), U(B, V, ne), delete W[V];
    return B;
  }
  function ye(c) {
    var B;
    B = c.input.charCodeAt(c.position), B === 10 ? c.position++ : B === 13 ? (c.position++, c.input.charCodeAt(c.position) === 10 && c.position++) : k(c, "a line break is expected"), c.line += 1, c.lineStart = c.position, c.firstTabInLine = -1;
  }
  function me(c, B, W) {
    for (var ie = 0, V = c.input.charCodeAt(c.position); V !== 0; ) {
      for (; N(V); )
        V === 9 && c.firstTabInLine === -1 && (c.firstTabInLine = c.position), V = c.input.charCodeAt(++c.position);
      if (B && V === 35)
        do
          V = c.input.charCodeAt(++c.position);
        while (V !== 10 && V !== 13 && V !== 0);
      if (A(V))
        for (ye(c), V = c.input.charCodeAt(c.position), ie++, c.lineIndent = 0; V === 32; )
          c.lineIndent++, V = c.input.charCodeAt(++c.position);
      else
        break;
    }
    return W !== -1 && ie !== 0 && c.lineIndent < W && G(c, "deficient indentation"), ie;
  }
  function Q(c) {
    var B = c.position, W;
    return W = c.input.charCodeAt(B), !!((W === 45 || W === 46) && W === c.input.charCodeAt(B + 1) && W === c.input.charCodeAt(B + 2) && (B += 3, W = c.input.charCodeAt(B), W === 0 || D(W)));
  }
  function de(c, B) {
    B === 1 ? c.result += " " : B > 1 && (c.result += e.repeat(`
`, B - 1));
  }
  function ve(c, B, W) {
    var ie, V, ne, te, ae, ue, Se, Ie, he = c.kind, R = c.result, H;
    if (H = c.input.charCodeAt(c.position), D(H) || I(H) || H === 35 || H === 38 || H === 42 || H === 33 || H === 124 || H === 62 || H === 39 || H === 34 || H === 37 || H === 64 || H === 96 || (H === 63 || H === 45) && (V = c.input.charCodeAt(c.position + 1), D(V) || W && I(V)))
      return !1;
    for (c.kind = "scalar", c.result = "", ne = te = c.position, ae = !1; H !== 0; ) {
      if (H === 58) {
        if (V = c.input.charCodeAt(c.position + 1), D(V) || W && I(V))
          break;
      } else if (H === 35) {
        if (ie = c.input.charCodeAt(c.position - 1), D(ie))
          break;
      } else {
        if (c.position === c.lineStart && Q(c) || W && I(H))
          break;
        if (A(H))
          if (ue = c.line, Se = c.lineStart, Ie = c.lineIndent, me(c, !1, -1), c.lineIndent >= B) {
            ae = !0, H = c.input.charCodeAt(c.position);
            continue;
          } else {
            c.position = te, c.line = ue, c.lineStart = Se, c.lineIndent = Ie;
            break;
          }
      }
      ae && (ee(c, ne, te, !1), de(c, c.line - ue), ne = te = c.position, ae = !1), N(H) || (te = c.position + 1), H = c.input.charCodeAt(++c.position);
    }
    return ee(c, ne, te, !1), c.result ? !0 : (c.kind = he, c.result = R, !1);
  }
  function Re(c, B) {
    var W, ie, V;
    if (W = c.input.charCodeAt(c.position), W !== 39)
      return !1;
    for (c.kind = "scalar", c.result = "", c.position++, ie = V = c.position; (W = c.input.charCodeAt(c.position)) !== 0; )
      if (W === 39)
        if (ee(c, ie, c.position, !0), W = c.input.charCodeAt(++c.position), W === 39)
          ie = c.position, c.position++, V = c.position;
        else
          return !0;
      else A(W) ? (ee(c, ie, V, !0), de(c, me(c, !1, B)), ie = V = c.position) : c.position === c.lineStart && Q(c) ? k(c, "unexpected end of the document within a single quoted scalar") : (c.position++, V = c.position);
    k(c, "unexpected end of the stream within a single quoted scalar");
  }
  function Ne(c, B) {
    var W, ie, V, ne, te, ae;
    if (ae = c.input.charCodeAt(c.position), ae !== 34)
      return !1;
    for (c.kind = "scalar", c.result = "", c.position++, W = ie = c.position; (ae = c.input.charCodeAt(c.position)) !== 0; ) {
      if (ae === 34)
        return ee(c, W, c.position, !0), c.position++, !0;
      if (ae === 92) {
        if (ee(c, W, c.position, !0), ae = c.input.charCodeAt(++c.position), A(ae))
          me(c, !1, B);
        else if (ae < 256 && x[ae])
          c.result += $[ae], c.position++;
        else if ((te = S(ae)) > 0) {
          for (V = te, ne = 0; V > 0; V--)
            ae = c.input.charCodeAt(++c.position), (te = b(ae)) >= 0 ? ne = (ne << 4) + te : k(c, "expected hexadecimal character");
          c.result += _(ne), c.position++;
        } else
          k(c, "unknown escape sequence");
        W = ie = c.position;
      } else A(ae) ? (ee(c, W, ie, !0), de(c, me(c, !1, B)), W = ie = c.position) : c.position === c.lineStart && Q(c) ? k(c, "unexpected end of the document within a double quoted scalar") : (c.position++, ie = c.position);
    }
    k(c, "unexpected end of the stream within a double quoted scalar");
  }
  function Ce(c, B) {
    var W = !0, ie, V, ne, te = c.tag, ae, ue = c.anchor, Se, Ie, he, R, H, z = /* @__PURE__ */ Object.create(null), X, K, oe, re;
    if (re = c.input.charCodeAt(c.position), re === 91)
      Ie = 93, H = !1, ae = [];
    else if (re === 123)
      Ie = 125, H = !0, ae = {};
    else
      return !1;
    for (c.anchor !== null && (c.anchorMap[c.anchor] = ae), re = c.input.charCodeAt(++c.position); re !== 0; ) {
      if (me(c, !0, B), re = c.input.charCodeAt(c.position), re === Ie)
        return c.position++, c.tag = te, c.anchor = ue, c.kind = H ? "mapping" : "sequence", c.result = ae, !0;
      W ? re === 44 && k(c, "expected the node content, but found ','") : k(c, "missed comma between flow collection entries"), K = X = oe = null, he = R = !1, re === 63 && (Se = c.input.charCodeAt(c.position + 1), D(Se) && (he = R = !0, c.position++, me(c, !0, B))), ie = c.line, V = c.lineStart, ne = c.position, Te(c, B, a, !1, !0), K = c.tag, X = c.result, me(c, !0, B), re = c.input.charCodeAt(c.position), (R || c.line === ie) && re === 58 && (he = !0, re = c.input.charCodeAt(++c.position), me(c, !0, B), Te(c, B, a, !1, !0), oe = c.result), H ? Z(c, ae, z, K, X, oe, ie, V, ne) : he ? ae.push(Z(c, null, z, K, X, oe, ie, V, ne)) : ae.push(X), me(c, !0, B), re = c.input.charCodeAt(c.position), re === 44 ? (W = !0, re = c.input.charCodeAt(++c.position)) : W = !1;
    }
    k(c, "unexpected end of the stream within a flow collection");
  }
  function Ae(c, B) {
    var W, ie, V = h, ne = !1, te = !1, ae = B, ue = 0, Se = !1, Ie, he;
    if (he = c.input.charCodeAt(c.position), he === 124)
      ie = !1;
    else if (he === 62)
      ie = !0;
    else
      return !1;
    for (c.kind = "scalar", c.result = ""; he !== 0; )
      if (he = c.input.charCodeAt(++c.position), he === 43 || he === 45)
        h === V ? V = he === 43 ? l : d : k(c, "repeat of a chomping mode identifier");
      else if ((Ie = w(he)) >= 0)
        Ie === 0 ? k(c, "bad explicit indentation width of a block scalar; it cannot be less than one") : te ? k(c, "repeat of an indentation width identifier") : (ae = B + Ie - 1, te = !0);
      else
        break;
    if (N(he)) {
      do
        he = c.input.charCodeAt(++c.position);
      while (N(he));
      if (he === 35)
        do
          he = c.input.charCodeAt(++c.position);
        while (!A(he) && he !== 0);
    }
    for (; he !== 0; ) {
      for (ye(c), c.lineIndent = 0, he = c.input.charCodeAt(c.position); (!te || c.lineIndent < ae) && he === 32; )
        c.lineIndent++, he = c.input.charCodeAt(++c.position);
      if (!te && c.lineIndent > ae && (ae = c.lineIndent), A(he)) {
        ue++;
        continue;
      }
      if (c.lineIndent < ae) {
        V === l ? c.result += e.repeat(`
`, ne ? 1 + ue : ue) : V === h && ne && (c.result += `
`);
        break;
      }
      for (ie ? N(he) ? (Se = !0, c.result += e.repeat(`
`, ne ? 1 + ue : ue)) : Se ? (Se = !1, c.result += e.repeat(`
`, ue + 1)) : ue === 0 ? ne && (c.result += " ") : c.result += e.repeat(`
`, ue) : c.result += e.repeat(`
`, ne ? 1 + ue : ue), ne = !0, te = !0, ue = 0, W = c.position; !A(he) && he !== 0; )
        he = c.input.charCodeAt(++c.position);
      ee(c, W, c.position, !1);
    }
    return !0;
  }
  function v(c, B) {
    var W, ie = c.tag, V = c.anchor, ne = [], te, ae = !1, ue;
    if (c.firstTabInLine !== -1) return !1;
    for (c.anchor !== null && (c.anchorMap[c.anchor] = ne), ue = c.input.charCodeAt(c.position); ue !== 0 && (c.firstTabInLine !== -1 && (c.position = c.firstTabInLine, k(c, "tab characters must not be used in indentation")), !(ue !== 45 || (te = c.input.charCodeAt(c.position + 1), !D(te)))); ) {
      if (ae = !0, c.position++, me(c, !0, -1) && c.lineIndent <= B) {
        ne.push(null), ue = c.input.charCodeAt(c.position);
        continue;
      }
      if (W = c.line, Te(c, B, f, !1, !0), ne.push(c.result), me(c, !0, -1), ue = c.input.charCodeAt(c.position), (c.line === W || c.lineIndent > B) && ue !== 0)
        k(c, "bad indentation of a sequence entry");
      else if (c.lineIndent < B)
        break;
    }
    return ae ? (c.tag = ie, c.anchor = V, c.kind = "sequence", c.result = ne, !0) : !1;
  }
  function g(c, B, W) {
    var ie, V, ne, te, ae, ue, Se = c.tag, Ie = c.anchor, he = {}, R = /* @__PURE__ */ Object.create(null), H = null, z = null, X = null, K = !1, oe = !1, re;
    if (c.firstTabInLine !== -1) return !1;
    for (c.anchor !== null && (c.anchorMap[c.anchor] = he), re = c.input.charCodeAt(c.position); re !== 0; ) {
      if (!K && c.firstTabInLine !== -1 && (c.position = c.firstTabInLine, k(c, "tab characters must not be used in indentation")), ie = c.input.charCodeAt(c.position + 1), ne = c.line, (re === 63 || re === 58) && D(ie))
        re === 63 ? (K && (Z(c, he, R, H, z, null, te, ae, ue), H = z = X = null), oe = !0, K = !0, V = !0) : K ? (K = !1, V = !0) : k(c, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), c.position += 1, re = ie;
      else {
        if (te = c.line, ae = c.lineStart, ue = c.position, !Te(c, W, n, !1, !0))
          break;
        if (c.line === ne) {
          for (re = c.input.charCodeAt(c.position); N(re); )
            re = c.input.charCodeAt(++c.position);
          if (re === 58)
            re = c.input.charCodeAt(++c.position), D(re) || k(c, "a whitespace character is expected after the key-value separator within a block mapping"), K && (Z(c, he, R, H, z, null, te, ae, ue), H = z = X = null), oe = !0, K = !1, V = !1, H = c.tag, z = c.result;
          else if (oe)
            k(c, "can not read an implicit mapping pair; a colon is missed");
          else
            return c.tag = Se, c.anchor = Ie, !0;
        } else if (oe)
          k(c, "can not read a block mapping entry; a multiline key may not be an implicit key");
        else
          return c.tag = Se, c.anchor = Ie, !0;
      }
      if ((c.line === ne || c.lineIndent > B) && (K && (te = c.line, ae = c.lineStart, ue = c.position), Te(c, B, o, !0, V) && (K ? z = c.result : X = c.result), K || (Z(c, he, R, H, z, X, te, ae, ue), H = z = X = null), me(c, !0, -1), re = c.input.charCodeAt(c.position)), (c.line === ne || c.lineIndent > B) && re !== 0)
        k(c, "bad indentation of a mapping entry");
      else if (c.lineIndent < B)
        break;
    }
    return K && Z(c, he, R, H, z, null, te, ae, ue), oe && (c.tag = Se, c.anchor = Ie, c.kind = "mapping", c.result = he), oe;
  }
  function q(c) {
    var B, W = !1, ie = !1, V, ne, te;
    if (te = c.input.charCodeAt(c.position), te !== 33) return !1;
    if (c.tag !== null && k(c, "duplication of a tag property"), te = c.input.charCodeAt(++c.position), te === 60 ? (W = !0, te = c.input.charCodeAt(++c.position)) : te === 33 ? (ie = !0, V = "!!", te = c.input.charCodeAt(++c.position)) : V = "!", B = c.position, W) {
      do
        te = c.input.charCodeAt(++c.position);
      while (te !== 0 && te !== 62);
      c.position < c.length ? (ne = c.input.slice(B, c.position), te = c.input.charCodeAt(++c.position)) : k(c, "unexpected end of the stream within a verbatim tag");
    } else {
      for (; te !== 0 && !D(te); )
        te === 33 && (ie ? k(c, "tag suffix cannot contain exclamation marks") : (V = c.input.slice(B - 1, c.position + 1), y.test(V) || k(c, "named tag handle cannot contain such characters"), ie = !0, B = c.position + 1)), te = c.input.charCodeAt(++c.position);
      ne = c.input.slice(B, c.position), E.test(ne) && k(c, "tag suffix cannot contain flow indicator characters");
    }
    ne && !m.test(ne) && k(c, "tag name cannot contain such characters: " + ne);
    try {
      ne = decodeURIComponent(ne);
    } catch {
      k(c, "tag name is malformed: " + ne);
    }
    return W ? c.tag = ne : s.call(c.tagMap, V) ? c.tag = c.tagMap[V] + ne : V === "!" ? c.tag = "!" + ne : V === "!!" ? c.tag = "tag:yaml.org,2002:" + ne : k(c, 'undeclared tag handle "' + V + '"'), !0;
  }
  function P(c) {
    var B, W;
    if (W = c.input.charCodeAt(c.position), W !== 38) return !1;
    for (c.anchor !== null && k(c, "duplication of an anchor property"), W = c.input.charCodeAt(++c.position), B = c.position; W !== 0 && !D(W) && !I(W); )
      W = c.input.charCodeAt(++c.position);
    return c.position === B && k(c, "name of an anchor node must contain at least one character"), c.anchor = c.input.slice(B, c.position), !0;
  }
  function _e(c) {
    var B, W, ie;
    if (ie = c.input.charCodeAt(c.position), ie !== 42) return !1;
    for (ie = c.input.charCodeAt(++c.position), B = c.position; ie !== 0 && !D(ie) && !I(ie); )
      ie = c.input.charCodeAt(++c.position);
    return c.position === B && k(c, "name of an alias node must contain at least one character"), W = c.input.slice(B, c.position), s.call(c.anchorMap, W) || k(c, 'unidentified alias "' + W + '"'), c.result = c.anchorMap[W], me(c, !0, -1), !0;
  }
  function Te(c, B, W, ie, V) {
    var ne, te, ae, ue = 1, Se = !1, Ie = !1, he, R, H, z, X, K;
    if (c.listener !== null && c.listener("open", c), c.tag = null, c.anchor = null, c.kind = null, c.result = null, ne = te = ae = o === W || f === W, ie && me(c, !0, -1) && (Se = !0, c.lineIndent > B ? ue = 1 : c.lineIndent === B ? ue = 0 : c.lineIndent < B && (ue = -1)), ue === 1)
      for (; q(c) || P(c); )
        me(c, !0, -1) ? (Se = !0, ae = ne, c.lineIndent > B ? ue = 1 : c.lineIndent === B ? ue = 0 : c.lineIndent < B && (ue = -1)) : ae = !1;
    if (ae && (ae = Se || V), (ue === 1 || o === W) && (a === W || n === W ? X = B : X = B + 1, K = c.position - c.lineStart, ue === 1 ? ae && (v(c, K) || g(c, K, X)) || Ce(c, X) ? Ie = !0 : (te && Ae(c, X) || Re(c, X) || Ne(c, X) ? Ie = !0 : _e(c) ? (Ie = !0, (c.tag !== null || c.anchor !== null) && k(c, "alias node should not have any properties")) : ve(c, X, a === W) && (Ie = !0, c.tag === null && (c.tag = "?")), c.anchor !== null && (c.anchorMap[c.anchor] = c.result)) : ue === 0 && (Ie = ae && v(c, K))), c.tag === null)
      c.anchor !== null && (c.anchorMap[c.anchor] = c.result);
    else if (c.tag === "?") {
      for (c.result !== null && c.kind !== "scalar" && k(c, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + c.kind + '"'), he = 0, R = c.implicitTypes.length; he < R; he += 1)
        if (z = c.implicitTypes[he], z.resolve(c.result)) {
          c.result = z.construct(c.result), c.tag = z.tag, c.anchor !== null && (c.anchorMap[c.anchor] = c.result);
          break;
        }
    } else if (c.tag !== "!") {
      if (s.call(c.typeMap[c.kind || "fallback"], c.tag))
        z = c.typeMap[c.kind || "fallback"][c.tag];
      else
        for (z = null, H = c.typeMap.multi[c.kind || "fallback"], he = 0, R = H.length; he < R; he += 1)
          if (c.tag.slice(0, H[he].tag.length) === H[he].tag) {
            z = H[he];
            break;
          }
      z || k(c, "unknown tag !<" + c.tag + ">"), c.result !== null && z.kind !== c.kind && k(c, "unacceptable node kind for !<" + c.tag + '> tag; it should be "' + z.kind + '", not "' + c.kind + '"'), z.resolve(c.result, c.tag) ? (c.result = z.construct(c.result, c.tag), c.anchor !== null && (c.anchorMap[c.anchor] = c.result)) : k(c, "cannot resolve a node with !<" + c.tag + "> explicit tag");
    }
    return c.listener !== null && c.listener("close", c), c.tag !== null || c.anchor !== null || Ie;
  }
  function De(c) {
    var B = c.position, W, ie, V, ne = !1, te;
    for (c.version = null, c.checkLineBreaks = c.legacy, c.tagMap = /* @__PURE__ */ Object.create(null), c.anchorMap = /* @__PURE__ */ Object.create(null); (te = c.input.charCodeAt(c.position)) !== 0 && (me(c, !0, -1), te = c.input.charCodeAt(c.position), !(c.lineIndent > 0 || te !== 37)); ) {
      for (ne = !0, te = c.input.charCodeAt(++c.position), W = c.position; te !== 0 && !D(te); )
        te = c.input.charCodeAt(++c.position);
      for (ie = c.input.slice(W, c.position), V = [], ie.length < 1 && k(c, "directive name must not be less than one character in length"); te !== 0; ) {
        for (; N(te); )
          te = c.input.charCodeAt(++c.position);
        if (te === 35) {
          do
            te = c.input.charCodeAt(++c.position);
          while (te !== 0 && !A(te));
          break;
        }
        if (A(te)) break;
        for (W = c.position; te !== 0 && !D(te); )
          te = c.input.charCodeAt(++c.position);
        V.push(c.input.slice(W, c.position));
      }
      te !== 0 && ye(c), s.call(Y, ie) ? Y[ie](c, ie, V) : G(c, 'unknown document directive "' + ie + '"');
    }
    if (me(c, !0, -1), c.lineIndent === 0 && c.input.charCodeAt(c.position) === 45 && c.input.charCodeAt(c.position + 1) === 45 && c.input.charCodeAt(c.position + 2) === 45 ? (c.position += 3, me(c, !0, -1)) : ne && k(c, "directives end mark is expected"), Te(c, c.lineIndent - 1, o, !1, !0), me(c, !0, -1), c.checkLineBreaks && p.test(c.input.slice(B, c.position)) && G(c, "non-ASCII line breaks are interpreted as content"), c.documents.push(c.result), c.position === c.lineStart && Q(c)) {
      c.input.charCodeAt(c.position) === 46 && (c.position += 3, me(c, !0, -1));
      return;
    }
    if (c.position < c.length - 1)
      k(c, "end of the stream or a document separator is expected");
    else
      return;
  }
  function $e(c, B) {
    c = String(c), B = B || {}, c.length !== 0 && (c.charCodeAt(c.length - 1) !== 10 && c.charCodeAt(c.length - 1) !== 13 && (c += `
`), c.charCodeAt(0) === 65279 && (c = c.slice(1)));
    var W = new L(c, B), ie = c.indexOf("\0");
    for (ie !== -1 && (W.position = ie, k(W, "null byte is not allowed in input")), W.input += "\0"; W.input.charCodeAt(W.position) === 32; )
      W.lineIndent += 1, W.position += 1;
    for (; W.position < W.length - 1; )
      De(W);
    return W.documents;
  }
  function Me(c, B, W) {
    B !== null && typeof B == "object" && typeof W > "u" && (W = B, B = null);
    var ie = $e(c, W);
    if (typeof B != "function")
      return ie;
    for (var V = 0, ne = ie.length; V < ne; V += 1)
      B(ie[V]);
  }
  function We(c, B) {
    var W = $e(c, B);
    if (W.length !== 0) {
      if (W.length === 1)
        return W[0];
      throw new t("expected a single document in the stream, but found more");
    }
  }
  return Zr.loadAll = Me, Zr.load = We, Zr;
}
var Ii = {}, Ps;
function sf() {
  if (Ps) return Ii;
  Ps = 1;
  var e = Fr(), t = Lr(), r = xo(), i = Object.prototype.toString, s = Object.prototype.hasOwnProperty, a = 65279, n = 9, f = 10, o = 13, h = 32, d = 33, l = 34, u = 35, p = 37, E = 38, y = 39, m = 42, T = 44, A = 45, N = 58, D = 61, I = 62, b = 63, S = 64, w = 91, C = 93, _ = 96, U = 123, x = 124, $ = 125, F = {};
  F[0] = "\\0", F[7] = "\\a", F[8] = "\\b", F[9] = "\\t", F[10] = "\\n", F[11] = "\\v", F[12] = "\\f", F[13] = "\\r", F[27] = "\\e", F[34] = '\\"', F[92] = "\\\\", F[133] = "\\N", F[160] = "\\_", F[8232] = "\\L", F[8233] = "\\P";
  var L = [
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
  function k(R, H) {
    var z, X, K, oe, re, se, fe;
    if (H === null) return {};
    for (z = {}, X = Object.keys(H), K = 0, oe = X.length; K < oe; K += 1)
      re = X[K], se = String(H[re]), re.slice(0, 2) === "!!" && (re = "tag:yaml.org,2002:" + re.slice(2)), fe = R.compiledTypeMap.fallback[re], fe && s.call(fe.styleAliases, se) && (se = fe.styleAliases[se]), z[re] = se;
    return z;
  }
  function G(R) {
    var H, z, X;
    if (H = R.toString(16).toUpperCase(), R <= 255)
      z = "x", X = 2;
    else if (R <= 65535)
      z = "u", X = 4;
    else if (R <= 4294967295)
      z = "U", X = 8;
    else
      throw new t("code point within a string may not be greater than 0xFFFFFFFF");
    return "\\" + z + e.repeat("0", X - H.length) + H;
  }
  var Y = 1, ee = 2;
  function pe(R) {
    this.schema = R.schema || r, this.indent = Math.max(1, R.indent || 2), this.noArrayIndent = R.noArrayIndent || !1, this.skipInvalid = R.skipInvalid || !1, this.flowLevel = e.isNothing(R.flowLevel) ? -1 : R.flowLevel, this.styleMap = k(this.schema, R.styles || null), this.sortKeys = R.sortKeys || !1, this.lineWidth = R.lineWidth || 80, this.noRefs = R.noRefs || !1, this.noCompatMode = R.noCompatMode || !1, this.condenseFlow = R.condenseFlow || !1, this.quotingType = R.quotingType === '"' ? ee : Y, this.forceQuotes = R.forceQuotes || !1, this.replacer = typeof R.replacer == "function" ? R.replacer : null, this.implicitTypes = this.schema.compiledImplicit, this.explicitTypes = this.schema.compiledExplicit, this.tag = null, this.result = "", this.duplicates = [], this.usedDuplicates = null;
  }
  function Z(R, H) {
    for (var z = e.repeat(" ", H), X = 0, K = -1, oe = "", re, se = R.length; X < se; )
      K = R.indexOf(`
`, X), K === -1 ? (re = R.slice(X), X = se) : (re = R.slice(X, K + 1), X = K + 1), re.length && re !== `
` && (oe += z), oe += re;
    return oe;
  }
  function ye(R, H) {
    return `
` + e.repeat(" ", R.indent * H);
  }
  function me(R, H) {
    var z, X, K;
    for (z = 0, X = R.implicitTypes.length; z < X; z += 1)
      if (K = R.implicitTypes[z], K.resolve(H))
        return !0;
    return !1;
  }
  function Q(R) {
    return R === h || R === n;
  }
  function de(R) {
    return 32 <= R && R <= 126 || 161 <= R && R <= 55295 && R !== 8232 && R !== 8233 || 57344 <= R && R <= 65533 && R !== a || 65536 <= R && R <= 1114111;
  }
  function ve(R) {
    return de(R) && R !== a && R !== o && R !== f;
  }
  function Re(R, H, z) {
    var X = ve(R), K = X && !Q(R);
    return (
      // ns-plain-safe
      (z ? (
        // c = flow-in
        X
      ) : X && R !== T && R !== w && R !== C && R !== U && R !== $) && R !== u && !(H === N && !K) || ve(H) && !Q(H) && R === u || H === N && K
    );
  }
  function Ne(R) {
    return de(R) && R !== a && !Q(R) && R !== A && R !== b && R !== N && R !== T && R !== w && R !== C && R !== U && R !== $ && R !== u && R !== E && R !== m && R !== d && R !== x && R !== D && R !== I && R !== y && R !== l && R !== p && R !== S && R !== _;
  }
  function Ce(R) {
    return !Q(R) && R !== N;
  }
  function Ae(R, H) {
    var z = R.charCodeAt(H), X;
    return z >= 55296 && z <= 56319 && H + 1 < R.length && (X = R.charCodeAt(H + 1), X >= 56320 && X <= 57343) ? (z - 55296) * 1024 + X - 56320 + 65536 : z;
  }
  function v(R) {
    var H = /^\n* /;
    return H.test(R);
  }
  var g = 1, q = 2, P = 3, _e = 4, Te = 5;
  function De(R, H, z, X, K, oe, re, se) {
    var fe, ge = 0, Oe = null, Ue = !1, be = !1, Vt = X !== -1, st = -1, Ft = Ne(Ae(R, 0)) && Ce(Ae(R, R.length - 1));
    if (H || re)
      for (fe = 0; fe < R.length; ge >= 65536 ? fe += 2 : fe++) {
        if (ge = Ae(R, fe), !de(ge))
          return Te;
        Ft = Ft && Re(ge, Oe, se), Oe = ge;
      }
    else {
      for (fe = 0; fe < R.length; ge >= 65536 ? fe += 2 : fe++) {
        if (ge = Ae(R, fe), ge === f)
          Ue = !0, Vt && (be = be || // Foldable line = too long, and not more-indented.
          fe - st - 1 > X && R[st + 1] !== " ", st = fe);
        else if (!de(ge))
          return Te;
        Ft = Ft && Re(ge, Oe, se), Oe = ge;
      }
      be = be || Vt && fe - st - 1 > X && R[st + 1] !== " ";
    }
    return !Ue && !be ? Ft && !re && !K(R) ? g : oe === ee ? Te : q : z > 9 && v(R) ? Te : re ? oe === ee ? Te : q : be ? _e : P;
  }
  function $e(R, H, z, X, K) {
    R.dump = (function() {
      if (H.length === 0)
        return R.quotingType === ee ? '""' : "''";
      if (!R.noCompatMode && (L.indexOf(H) !== -1 || j.test(H)))
        return R.quotingType === ee ? '"' + H + '"' : "'" + H + "'";
      var oe = R.indent * Math.max(1, z), re = R.lineWidth === -1 ? -1 : Math.max(Math.min(R.lineWidth, 40), R.lineWidth - oe), se = X || R.flowLevel > -1 && z >= R.flowLevel;
      function fe(ge) {
        return me(R, ge);
      }
      switch (De(
        H,
        se,
        R.indent,
        re,
        fe,
        R.quotingType,
        R.forceQuotes && !X,
        K
      )) {
        case g:
          return H;
        case q:
          return "'" + H.replace(/'/g, "''") + "'";
        case P:
          return "|" + Me(H, R.indent) + We(Z(H, oe));
        case _e:
          return ">" + Me(H, R.indent) + We(Z(c(H, re), oe));
        case Te:
          return '"' + W(H) + '"';
        default:
          throw new t("impossible error: invalid scalar style");
      }
    })();
  }
  function Me(R, H) {
    var z = v(R) ? String(H) : "", X = R[R.length - 1] === `
`, K = X && (R[R.length - 2] === `
` || R === `
`), oe = K ? "+" : X ? "" : "-";
    return z + oe + `
`;
  }
  function We(R) {
    return R[R.length - 1] === `
` ? R.slice(0, -1) : R;
  }
  function c(R, H) {
    for (var z = /(\n+)([^\n]*)/g, X = (function() {
      var ge = R.indexOf(`
`);
      return ge = ge !== -1 ? ge : R.length, z.lastIndex = ge, B(R.slice(0, ge), H);
    })(), K = R[0] === `
` || R[0] === " ", oe, re; re = z.exec(R); ) {
      var se = re[1], fe = re[2];
      oe = fe[0] === " ", X += se + (!K && !oe && fe !== "" ? `
` : "") + B(fe, H), K = oe;
    }
    return X;
  }
  function B(R, H) {
    if (R === "" || R[0] === " ") return R;
    for (var z = / [^ ]/g, X, K = 0, oe, re = 0, se = 0, fe = ""; X = z.exec(R); )
      se = X.index, se - K > H && (oe = re > K ? re : se, fe += `
` + R.slice(K, oe), K = oe + 1), re = se;
    return fe += `
`, R.length - K > H && re > K ? fe += R.slice(K, re) + `
` + R.slice(re + 1) : fe += R.slice(K), fe.slice(1);
  }
  function W(R) {
    for (var H = "", z = 0, X, K = 0; K < R.length; z >= 65536 ? K += 2 : K++)
      z = Ae(R, K), X = F[z], !X && de(z) ? (H += R[K], z >= 65536 && (H += R[K + 1])) : H += X || G(z);
    return H;
  }
  function ie(R, H, z) {
    var X = "", K = R.tag, oe, re, se;
    for (oe = 0, re = z.length; oe < re; oe += 1)
      se = z[oe], R.replacer && (se = R.replacer.call(z, String(oe), se)), (ue(R, H, se, !1, !1) || typeof se > "u" && ue(R, H, null, !1, !1)) && (X !== "" && (X += "," + (R.condenseFlow ? "" : " ")), X += R.dump);
    R.tag = K, R.dump = "[" + X + "]";
  }
  function V(R, H, z, X) {
    var K = "", oe = R.tag, re, se, fe;
    for (re = 0, se = z.length; re < se; re += 1)
      fe = z[re], R.replacer && (fe = R.replacer.call(z, String(re), fe)), (ue(R, H + 1, fe, !0, !0, !1, !0) || typeof fe > "u" && ue(R, H + 1, null, !0, !0, !1, !0)) && ((!X || K !== "") && (K += ye(R, H)), R.dump && f === R.dump.charCodeAt(0) ? K += "-" : K += "- ", K += R.dump);
    R.tag = oe, R.dump = K || "[]";
  }
  function ne(R, H, z) {
    var X = "", K = R.tag, oe = Object.keys(z), re, se, fe, ge, Oe;
    for (re = 0, se = oe.length; re < se; re += 1)
      Oe = "", X !== "" && (Oe += ", "), R.condenseFlow && (Oe += '"'), fe = oe[re], ge = z[fe], R.replacer && (ge = R.replacer.call(z, fe, ge)), ue(R, H, fe, !1, !1) && (R.dump.length > 1024 && (Oe += "? "), Oe += R.dump + (R.condenseFlow ? '"' : "") + ":" + (R.condenseFlow ? "" : " "), ue(R, H, ge, !1, !1) && (Oe += R.dump, X += Oe));
    R.tag = K, R.dump = "{" + X + "}";
  }
  function te(R, H, z, X) {
    var K = "", oe = R.tag, re = Object.keys(z), se, fe, ge, Oe, Ue, be;
    if (R.sortKeys === !0)
      re.sort();
    else if (typeof R.sortKeys == "function")
      re.sort(R.sortKeys);
    else if (R.sortKeys)
      throw new t("sortKeys must be a boolean or a function");
    for (se = 0, fe = re.length; se < fe; se += 1)
      be = "", (!X || K !== "") && (be += ye(R, H)), ge = re[se], Oe = z[ge], R.replacer && (Oe = R.replacer.call(z, ge, Oe)), ue(R, H + 1, ge, !0, !0, !0) && (Ue = R.tag !== null && R.tag !== "?" || R.dump && R.dump.length > 1024, Ue && (R.dump && f === R.dump.charCodeAt(0) ? be += "?" : be += "? "), be += R.dump, Ue && (be += ye(R, H)), ue(R, H + 1, Oe, !0, Ue) && (R.dump && f === R.dump.charCodeAt(0) ? be += ":" : be += ": ", be += R.dump, K += be));
    R.tag = oe, R.dump = K || "{}";
  }
  function ae(R, H, z) {
    var X, K, oe, re, se, fe;
    for (K = z ? R.explicitTypes : R.implicitTypes, oe = 0, re = K.length; oe < re; oe += 1)
      if (se = K[oe], (se.instanceOf || se.predicate) && (!se.instanceOf || typeof H == "object" && H instanceof se.instanceOf) && (!se.predicate || se.predicate(H))) {
        if (z ? se.multi && se.representName ? R.tag = se.representName(H) : R.tag = se.tag : R.tag = "?", se.represent) {
          if (fe = R.styleMap[se.tag] || se.defaultStyle, i.call(se.represent) === "[object Function]")
            X = se.represent(H, fe);
          else if (s.call(se.represent, fe))
            X = se.represent[fe](H, fe);
          else
            throw new t("!<" + se.tag + '> tag resolver accepts not "' + fe + '" style');
          R.dump = X;
        }
        return !0;
      }
    return !1;
  }
  function ue(R, H, z, X, K, oe, re) {
    R.tag = null, R.dump = z, ae(R, z, !1) || ae(R, z, !0);
    var se = i.call(R.dump), fe = X, ge;
    X && (X = R.flowLevel < 0 || R.flowLevel > H);
    var Oe = se === "[object Object]" || se === "[object Array]", Ue, be;
    if (Oe && (Ue = R.duplicates.indexOf(z), be = Ue !== -1), (R.tag !== null && R.tag !== "?" || be || R.indent !== 2 && H > 0) && (K = !1), be && R.usedDuplicates[Ue])
      R.dump = "*ref_" + Ue;
    else {
      if (Oe && be && !R.usedDuplicates[Ue] && (R.usedDuplicates[Ue] = !0), se === "[object Object]")
        X && Object.keys(R.dump).length !== 0 ? (te(R, H, R.dump, K), be && (R.dump = "&ref_" + Ue + R.dump)) : (ne(R, H, R.dump), be && (R.dump = "&ref_" + Ue + " " + R.dump));
      else if (se === "[object Array]")
        X && R.dump.length !== 0 ? (R.noArrayIndent && !re && H > 0 ? V(R, H - 1, R.dump, K) : V(R, H, R.dump, K), be && (R.dump = "&ref_" + Ue + R.dump)) : (ie(R, H, R.dump), be && (R.dump = "&ref_" + Ue + " " + R.dump));
      else if (se === "[object String]")
        R.tag !== "?" && $e(R, R.dump, H, oe, fe);
      else {
        if (se === "[object Undefined]")
          return !1;
        if (R.skipInvalid) return !1;
        throw new t("unacceptable kind of an object to dump " + se);
      }
      R.tag !== null && R.tag !== "?" && (ge = encodeURI(
        R.tag[0] === "!" ? R.tag.slice(1) : R.tag
      ).replace(/!/g, "%21"), R.tag[0] === "!" ? ge = "!" + ge : ge.slice(0, 18) === "tag:yaml.org,2002:" ? ge = "!!" + ge.slice(18) : ge = "!<" + ge + ">", R.dump = ge + " " + R.dump);
    }
    return !0;
  }
  function Se(R, H) {
    var z = [], X = [], K, oe;
    for (Ie(R, z, X), K = 0, oe = X.length; K < oe; K += 1)
      H.duplicates.push(z[X[K]]);
    H.usedDuplicates = new Array(oe);
  }
  function Ie(R, H, z) {
    var X, K, oe;
    if (R !== null && typeof R == "object")
      if (K = H.indexOf(R), K !== -1)
        z.indexOf(K) === -1 && z.push(K);
      else if (H.push(R), Array.isArray(R))
        for (K = 0, oe = R.length; K < oe; K += 1)
          Ie(R[K], H, z);
      else
        for (X = Object.keys(R), K = 0, oe = X.length; K < oe; K += 1)
          Ie(R[X[K]], H, z);
  }
  function he(R, H) {
    H = H || {};
    var z = new pe(H);
    z.noRefs || Se(R, z);
    var X = R;
    return z.replacer && (X = z.replacer.call({ "": X }, "", X)), ue(z, 0, X, !0, !0) ? z.dump + `
` : "";
  }
  return Ii.dump = he, Ii;
}
var Fs;
function Uo() {
  if (Fs) return ze;
  Fs = 1;
  var e = af(), t = sf();
  function r(i, s) {
    return function() {
      throw new Error("Function yaml." + i + " is removed in js-yaml 4. Use yaml." + s + " instead, which is now safe by default.");
    };
  }
  return ze.Type = Je(), ze.Schema = Sc(), ze.FAILSAFE_SCHEMA = Nc(), ze.JSON_SCHEMA = Lc(), ze.CORE_SCHEMA = xc(), ze.DEFAULT_SCHEMA = xo(), ze.load = e.load, ze.loadAll = e.loadAll, ze.dump = t.dump, ze.YAMLException = Lr(), ze.types = {
    binary: $c(),
    float: Fc(),
    map: Cc(),
    null: Oc(),
    pairs: qc(),
    set: Bc(),
    timestamp: Uc(),
    bool: Dc(),
    int: Pc(),
    merge: kc(),
    omap: Mc(),
    seq: bc(),
    str: Ic()
  }, ze.safeLoad = r("safeLoad", "load"), ze.safeLoadAll = r("safeLoadAll", "loadAll"), ze.safeDump = r("safeDump", "dump"), ze;
}
var cr = {}, Ls;
function lf() {
  if (Ls) return cr;
  Ls = 1, Object.defineProperty(cr, "__esModule", { value: !0 }), cr.Lazy = void 0;
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
  return cr.Lazy = e, cr;
}
var en = { exports: {} }, bi, xs;
function cn() {
  if (xs) return bi;
  xs = 1;
  const e = "2.0.0", t = 256, r = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, i = 16, s = t - 6;
  return bi = {
    MAX_LENGTH: t,
    MAX_SAFE_COMPONENT_LENGTH: i,
    MAX_SAFE_BUILD_LENGTH: s,
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
  }, bi;
}
var Ci, Us;
function un() {
  return Us || (Us = 1, Ci = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...t) => console.error("SEMVER", ...t) : () => {
  }), Ci;
}
var ks;
function xr() {
  return ks || (ks = 1, (function(e, t) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: r,
      MAX_SAFE_BUILD_LENGTH: i,
      MAX_LENGTH: s
    } = cn(), a = un();
    t = e.exports = {};
    const n = t.re = [], f = t.safeRe = [], o = t.src = [], h = t.safeSrc = [], d = t.t = {};
    let l = 0;
    const u = "[a-zA-Z0-9-]", p = [
      ["\\s", 1],
      ["\\d", s],
      [u, i]
    ], E = (m) => {
      for (const [T, A] of p)
        m = m.split(`${T}*`).join(`${T}{0,${A}}`).split(`${T}+`).join(`${T}{1,${A}}`);
      return m;
    }, y = (m, T, A) => {
      const N = E(T), D = l++;
      a(m, D, T), d[m] = D, o[D] = T, h[D] = N, n[D] = new RegExp(T, A ? "g" : void 0), f[D] = new RegExp(N, A ? "g" : void 0);
    };
    y("NUMERICIDENTIFIER", "0|[1-9]\\d*"), y("NUMERICIDENTIFIERLOOSE", "\\d+"), y("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${u}*`), y("MAINVERSION", `(${o[d.NUMERICIDENTIFIER]})\\.(${o[d.NUMERICIDENTIFIER]})\\.(${o[d.NUMERICIDENTIFIER]})`), y("MAINVERSIONLOOSE", `(${o[d.NUMERICIDENTIFIERLOOSE]})\\.(${o[d.NUMERICIDENTIFIERLOOSE]})\\.(${o[d.NUMERICIDENTIFIERLOOSE]})`), y("PRERELEASEIDENTIFIER", `(?:${o[d.NONNUMERICIDENTIFIER]}|${o[d.NUMERICIDENTIFIER]})`), y("PRERELEASEIDENTIFIERLOOSE", `(?:${o[d.NONNUMERICIDENTIFIER]}|${o[d.NUMERICIDENTIFIERLOOSE]})`), y("PRERELEASE", `(?:-(${o[d.PRERELEASEIDENTIFIER]}(?:\\.${o[d.PRERELEASEIDENTIFIER]})*))`), y("PRERELEASELOOSE", `(?:-?(${o[d.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${o[d.PRERELEASEIDENTIFIERLOOSE]})*))`), y("BUILDIDENTIFIER", `${u}+`), y("BUILD", `(?:\\+(${o[d.BUILDIDENTIFIER]}(?:\\.${o[d.BUILDIDENTIFIER]})*))`), y("FULLPLAIN", `v?${o[d.MAINVERSION]}${o[d.PRERELEASE]}?${o[d.BUILD]}?`), y("FULL", `^${o[d.FULLPLAIN]}$`), y("LOOSEPLAIN", `[v=\\s]*${o[d.MAINVERSIONLOOSE]}${o[d.PRERELEASELOOSE]}?${o[d.BUILD]}?`), y("LOOSE", `^${o[d.LOOSEPLAIN]}$`), y("GTLT", "((?:<|>)?=?)"), y("XRANGEIDENTIFIERLOOSE", `${o[d.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), y("XRANGEIDENTIFIER", `${o[d.NUMERICIDENTIFIER]}|x|X|\\*`), y("XRANGEPLAIN", `[v=\\s]*(${o[d.XRANGEIDENTIFIER]})(?:\\.(${o[d.XRANGEIDENTIFIER]})(?:\\.(${o[d.XRANGEIDENTIFIER]})(?:${o[d.PRERELEASE]})?${o[d.BUILD]}?)?)?`), y("XRANGEPLAINLOOSE", `[v=\\s]*(${o[d.XRANGEIDENTIFIERLOOSE]})(?:\\.(${o[d.XRANGEIDENTIFIERLOOSE]})(?:\\.(${o[d.XRANGEIDENTIFIERLOOSE]})(?:${o[d.PRERELEASELOOSE]})?${o[d.BUILD]}?)?)?`), y("XRANGE", `^${o[d.GTLT]}\\s*${o[d.XRANGEPLAIN]}$`), y("XRANGELOOSE", `^${o[d.GTLT]}\\s*${o[d.XRANGEPLAINLOOSE]}$`), y("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), y("COERCE", `${o[d.COERCEPLAIN]}(?:$|[^\\d])`), y("COERCEFULL", o[d.COERCEPLAIN] + `(?:${o[d.PRERELEASE]})?(?:${o[d.BUILD]})?(?:$|[^\\d])`), y("COERCERTL", o[d.COERCE], !0), y("COERCERTLFULL", o[d.COERCEFULL], !0), y("LONETILDE", "(?:~>?)"), y("TILDETRIM", `(\\s*)${o[d.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", y("TILDE", `^${o[d.LONETILDE]}${o[d.XRANGEPLAIN]}$`), y("TILDELOOSE", `^${o[d.LONETILDE]}${o[d.XRANGEPLAINLOOSE]}$`), y("LONECARET", "(?:\\^)"), y("CARETTRIM", `(\\s*)${o[d.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", y("CARET", `^${o[d.LONECARET]}${o[d.XRANGEPLAIN]}$`), y("CARETLOOSE", `^${o[d.LONECARET]}${o[d.XRANGEPLAINLOOSE]}$`), y("COMPARATORLOOSE", `^${o[d.GTLT]}\\s*(${o[d.LOOSEPLAIN]})$|^$`), y("COMPARATOR", `^${o[d.GTLT]}\\s*(${o[d.FULLPLAIN]})$|^$`), y("COMPARATORTRIM", `(\\s*)${o[d.GTLT]}\\s*(${o[d.LOOSEPLAIN]}|${o[d.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", y("HYPHENRANGE", `^\\s*(${o[d.XRANGEPLAIN]})\\s+-\\s+(${o[d.XRANGEPLAIN]})\\s*$`), y("HYPHENRANGELOOSE", `^\\s*(${o[d.XRANGEPLAINLOOSE]})\\s+-\\s+(${o[d.XRANGEPLAINLOOSE]})\\s*$`), y("STAR", "(<|>)?=?\\s*\\*"), y("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), y("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  })(en, en.exports)), en.exports;
}
var Ni, $s;
function ko() {
  if ($s) return Ni;
  $s = 1;
  const e = Object.freeze({ loose: !0 }), t = Object.freeze({});
  return Ni = (i) => i ? typeof i != "object" ? e : i : t, Ni;
}
var Oi, Ms;
function Hc() {
  if (Ms) return Oi;
  Ms = 1;
  const e = /^[0-9]+$/, t = (i, s) => {
    if (typeof i == "number" && typeof s == "number")
      return i === s ? 0 : i < s ? -1 : 1;
    const a = e.test(i), n = e.test(s);
    return a && n && (i = +i, s = +s), i === s ? 0 : a && !n ? -1 : n && !a ? 1 : i < s ? -1 : 1;
  };
  return Oi = {
    compareIdentifiers: t,
    rcompareIdentifiers: (i, s) => t(s, i)
  }, Oi;
}
var Di, qs;
function Qe() {
  if (qs) return Di;
  qs = 1;
  const e = un(), { MAX_LENGTH: t, MAX_SAFE_INTEGER: r } = cn(), { safeRe: i, t: s } = xr(), a = ko(), { compareIdentifiers: n } = Hc();
  class f {
    constructor(h, d) {
      if (d = a(d), h instanceof f) {
        if (h.loose === !!d.loose && h.includePrerelease === !!d.includePrerelease)
          return h;
        h = h.version;
      } else if (typeof h != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof h}".`);
      if (h.length > t)
        throw new TypeError(
          `version is longer than ${t} characters`
        );
      e("SemVer", h, d), this.options = d, this.loose = !!d.loose, this.includePrerelease = !!d.includePrerelease;
      const l = h.trim().match(d.loose ? i[s.LOOSE] : i[s.FULL]);
      if (!l)
        throw new TypeError(`Invalid Version: ${h}`);
      if (this.raw = h, this.major = +l[1], this.minor = +l[2], this.patch = +l[3], this.major > r || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > r || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > r || this.patch < 0)
        throw new TypeError("Invalid patch version");
      l[4] ? this.prerelease = l[4].split(".").map((u) => {
        if (/^[0-9]+$/.test(u)) {
          const p = +u;
          if (p >= 0 && p < r)
            return p;
        }
        return u;
      }) : this.prerelease = [], this.build = l[5] ? l[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
    }
    toString() {
      return this.version;
    }
    compare(h) {
      if (e("SemVer.compare", this.version, this.options, h), !(h instanceof f)) {
        if (typeof h == "string" && h === this.version)
          return 0;
        h = new f(h, this.options);
      }
      return h.version === this.version ? 0 : this.compareMain(h) || this.comparePre(h);
    }
    compareMain(h) {
      return h instanceof f || (h = new f(h, this.options)), this.major < h.major ? -1 : this.major > h.major ? 1 : this.minor < h.minor ? -1 : this.minor > h.minor ? 1 : this.patch < h.patch ? -1 : this.patch > h.patch ? 1 : 0;
    }
    comparePre(h) {
      if (h instanceof f || (h = new f(h, this.options)), this.prerelease.length && !h.prerelease.length)
        return -1;
      if (!this.prerelease.length && h.prerelease.length)
        return 1;
      if (!this.prerelease.length && !h.prerelease.length)
        return 0;
      let d = 0;
      do {
        const l = this.prerelease[d], u = h.prerelease[d];
        if (e("prerelease compare", d, l, u), l === void 0 && u === void 0)
          return 0;
        if (u === void 0)
          return 1;
        if (l === void 0)
          return -1;
        if (l === u)
          continue;
        return n(l, u);
      } while (++d);
    }
    compareBuild(h) {
      h instanceof f || (h = new f(h, this.options));
      let d = 0;
      do {
        const l = this.build[d], u = h.build[d];
        if (e("build compare", d, l, u), l === void 0 && u === void 0)
          return 0;
        if (u === void 0)
          return 1;
        if (l === void 0)
          return -1;
        if (l === u)
          continue;
        return n(l, u);
      } while (++d);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(h, d, l) {
      if (h.startsWith("pre")) {
        if (!d && l === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (d) {
          const u = `-${d}`.match(this.options.loose ? i[s.PRERELEASELOOSE] : i[s.PRERELEASE]);
          if (!u || u[1] !== d)
            throw new Error(`invalid identifier: ${d}`);
        }
      }
      switch (h) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", d, l);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", d, l);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", d, l), this.inc("pre", d, l);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", d, l), this.inc("pre", d, l);
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
          const u = Number(l) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [u];
          else {
            let p = this.prerelease.length;
            for (; --p >= 0; )
              typeof this.prerelease[p] == "number" && (this.prerelease[p]++, p = -2);
            if (p === -1) {
              if (d === this.prerelease.join(".") && l === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(u);
            }
          }
          if (d) {
            let p = [d, u];
            l === !1 && (p = [d]), n(this.prerelease[0], d) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = p) : this.prerelease = p;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${h}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return Di = f, Di;
}
var Pi, Bs;
function rr() {
  if (Bs) return Pi;
  Bs = 1;
  const e = Qe();
  return Pi = (r, i, s = !1) => {
    if (r instanceof e)
      return r;
    try {
      return new e(r, i);
    } catch (a) {
      if (!s)
        return null;
      throw a;
    }
  }, Pi;
}
var Fi, Hs;
function cf() {
  if (Hs) return Fi;
  Hs = 1;
  const e = rr();
  return Fi = (r, i) => {
    const s = e(r, i);
    return s ? s.version : null;
  }, Fi;
}
var Li, js;
function uf() {
  if (js) return Li;
  js = 1;
  const e = rr();
  return Li = (r, i) => {
    const s = e(r.trim().replace(/^[=v]+/, ""), i);
    return s ? s.version : null;
  }, Li;
}
var xi, Gs;
function df() {
  if (Gs) return xi;
  Gs = 1;
  const e = Qe();
  return xi = (r, i, s, a, n) => {
    typeof s == "string" && (n = a, a = s, s = void 0);
    try {
      return new e(
        r instanceof e ? r.version : r,
        s
      ).inc(i, a, n).version;
    } catch {
      return null;
    }
  }, xi;
}
var Ui, Ws;
function ff() {
  if (Ws) return Ui;
  Ws = 1;
  const e = rr();
  return Ui = (r, i) => {
    const s = e(r, null, !0), a = e(i, null, !0), n = s.compare(a);
    if (n === 0)
      return null;
    const f = n > 0, o = f ? s : a, h = f ? a : s, d = !!o.prerelease.length;
    if (!!h.prerelease.length && !d) {
      if (!h.patch && !h.minor)
        return "major";
      if (h.compareMain(o) === 0)
        return h.minor && !h.patch ? "minor" : "patch";
    }
    const u = d ? "pre" : "";
    return s.major !== a.major ? u + "major" : s.minor !== a.minor ? u + "minor" : s.patch !== a.patch ? u + "patch" : "prerelease";
  }, Ui;
}
var ki, Vs;
function hf() {
  if (Vs) return ki;
  Vs = 1;
  const e = Qe();
  return ki = (r, i) => new e(r, i).major, ki;
}
var $i, Ys;
function pf() {
  if (Ys) return $i;
  Ys = 1;
  const e = Qe();
  return $i = (r, i) => new e(r, i).minor, $i;
}
var Mi, zs;
function mf() {
  if (zs) return Mi;
  zs = 1;
  const e = Qe();
  return Mi = (r, i) => new e(r, i).patch, Mi;
}
var qi, Xs;
function gf() {
  if (Xs) return qi;
  Xs = 1;
  const e = rr();
  return qi = (r, i) => {
    const s = e(r, i);
    return s && s.prerelease.length ? s.prerelease : null;
  }, qi;
}
var Bi, Ks;
function ft() {
  if (Ks) return Bi;
  Ks = 1;
  const e = Qe();
  return Bi = (r, i, s) => new e(r, s).compare(new e(i, s)), Bi;
}
var Hi, Js;
function Ef() {
  if (Js) return Hi;
  Js = 1;
  const e = ft();
  return Hi = (r, i, s) => e(i, r, s), Hi;
}
var ji, Qs;
function yf() {
  if (Qs) return ji;
  Qs = 1;
  const e = ft();
  return ji = (r, i) => e(r, i, !0), ji;
}
var Gi, Zs;
function $o() {
  if (Zs) return Gi;
  Zs = 1;
  const e = Qe();
  return Gi = (r, i, s) => {
    const a = new e(r, s), n = new e(i, s);
    return a.compare(n) || a.compareBuild(n);
  }, Gi;
}
var Wi, el;
function vf() {
  if (el) return Wi;
  el = 1;
  const e = $o();
  return Wi = (r, i) => r.sort((s, a) => e(s, a, i)), Wi;
}
var Vi, tl;
function wf() {
  if (tl) return Vi;
  tl = 1;
  const e = $o();
  return Vi = (r, i) => r.sort((s, a) => e(a, s, i)), Vi;
}
var Yi, rl;
function dn() {
  if (rl) return Yi;
  rl = 1;
  const e = ft();
  return Yi = (r, i, s) => e(r, i, s) > 0, Yi;
}
var zi, nl;
function Mo() {
  if (nl) return zi;
  nl = 1;
  const e = ft();
  return zi = (r, i, s) => e(r, i, s) < 0, zi;
}
var Xi, il;
function jc() {
  if (il) return Xi;
  il = 1;
  const e = ft();
  return Xi = (r, i, s) => e(r, i, s) === 0, Xi;
}
var Ki, ol;
function Gc() {
  if (ol) return Ki;
  ol = 1;
  const e = ft();
  return Ki = (r, i, s) => e(r, i, s) !== 0, Ki;
}
var Ji, al;
function qo() {
  if (al) return Ji;
  al = 1;
  const e = ft();
  return Ji = (r, i, s) => e(r, i, s) >= 0, Ji;
}
var Qi, sl;
function Bo() {
  if (sl) return Qi;
  sl = 1;
  const e = ft();
  return Qi = (r, i, s) => e(r, i, s) <= 0, Qi;
}
var Zi, ll;
function Wc() {
  if (ll) return Zi;
  ll = 1;
  const e = jc(), t = Gc(), r = dn(), i = qo(), s = Mo(), a = Bo();
  return Zi = (f, o, h, d) => {
    switch (o) {
      case "===":
        return typeof f == "object" && (f = f.version), typeof h == "object" && (h = h.version), f === h;
      case "!==":
        return typeof f == "object" && (f = f.version), typeof h == "object" && (h = h.version), f !== h;
      case "":
      case "=":
      case "==":
        return e(f, h, d);
      case "!=":
        return t(f, h, d);
      case ">":
        return r(f, h, d);
      case ">=":
        return i(f, h, d);
      case "<":
        return s(f, h, d);
      case "<=":
        return a(f, h, d);
      default:
        throw new TypeError(`Invalid operator: ${o}`);
    }
  }, Zi;
}
var eo, cl;
function _f() {
  if (cl) return eo;
  cl = 1;
  const e = Qe(), t = rr(), { safeRe: r, t: i } = xr();
  return eo = (a, n) => {
    if (a instanceof e)
      return a;
    if (typeof a == "number" && (a = String(a)), typeof a != "string")
      return null;
    n = n || {};
    let f = null;
    if (!n.rtl)
      f = a.match(n.includePrerelease ? r[i.COERCEFULL] : r[i.COERCE]);
    else {
      const p = n.includePrerelease ? r[i.COERCERTLFULL] : r[i.COERCERTL];
      let E;
      for (; (E = p.exec(a)) && (!f || f.index + f[0].length !== a.length); )
        (!f || E.index + E[0].length !== f.index + f[0].length) && (f = E), p.lastIndex = E.index + E[1].length + E[2].length;
      p.lastIndex = -1;
    }
    if (f === null)
      return null;
    const o = f[2], h = f[3] || "0", d = f[4] || "0", l = n.includePrerelease && f[5] ? `-${f[5]}` : "", u = n.includePrerelease && f[6] ? `+${f[6]}` : "";
    return t(`${o}.${h}.${d}${l}${u}`, n);
  }, eo;
}
var to, ul;
function Tf() {
  if (ul) return to;
  ul = 1;
  class e {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(r) {
      const i = this.map.get(r);
      if (i !== void 0)
        return this.map.delete(r), this.map.set(r, i), i;
    }
    delete(r) {
      return this.map.delete(r);
    }
    set(r, i) {
      if (!this.delete(r) && i !== void 0) {
        if (this.map.size >= this.max) {
          const a = this.map.keys().next().value;
          this.delete(a);
        }
        this.map.set(r, i);
      }
      return this;
    }
  }
  return to = e, to;
}
var ro, dl;
function ht() {
  if (dl) return ro;
  dl = 1;
  const e = /\s+/g;
  class t {
    constructor(L, j) {
      if (j = s(j), L instanceof t)
        return L.loose === !!j.loose && L.includePrerelease === !!j.includePrerelease ? L : new t(L.raw, j);
      if (L instanceof a)
        return this.raw = L.value, this.set = [[L]], this.formatted = void 0, this;
      if (this.options = j, this.loose = !!j.loose, this.includePrerelease = !!j.includePrerelease, this.raw = L.trim().replace(e, " "), this.set = this.raw.split("||").map((k) => this.parseRange(k.trim())).filter((k) => k.length), !this.set.length)
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
        for (let L = 0; L < this.set.length; L++) {
          L > 0 && (this.formatted += "||");
          const j = this.set[L];
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
    parseRange(L) {
      const k = ((this.options.includePrerelease && p) | (this.options.loose && E)) + ":" + L, G = i.get(k);
      if (G)
        return G;
      const Y = this.options.loose, ee = Y ? o[h.HYPHENRANGELOOSE] : o[h.HYPHENRANGE];
      L = L.replace(ee, x(this.options.includePrerelease)), n("hyphen replace", L), L = L.replace(o[h.COMPARATORTRIM], d), n("comparator trim", L), L = L.replace(o[h.TILDETRIM], l), n("tilde trim", L), L = L.replace(o[h.CARETTRIM], u), n("caret trim", L);
      let pe = L.split(" ").map((Q) => A(Q, this.options)).join(" ").split(/\s+/).map((Q) => U(Q, this.options));
      Y && (pe = pe.filter((Q) => (n("loose invalid filter", Q, this.options), !!Q.match(o[h.COMPARATORLOOSE])))), n("range list", pe);
      const Z = /* @__PURE__ */ new Map(), ye = pe.map((Q) => new a(Q, this.options));
      for (const Q of ye) {
        if (y(Q))
          return [Q];
        Z.set(Q.value, Q);
      }
      Z.size > 1 && Z.has("") && Z.delete("");
      const me = [...Z.values()];
      return i.set(k, me), me;
    }
    intersects(L, j) {
      if (!(L instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((k) => T(k, j) && L.set.some((G) => T(G, j) && k.every((Y) => G.every((ee) => Y.intersects(ee, j)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(L) {
      if (!L)
        return !1;
      if (typeof L == "string")
        try {
          L = new f(L, this.options);
        } catch {
          return !1;
        }
      for (let j = 0; j < this.set.length; j++)
        if ($(this.set[j], L, this.options))
          return !0;
      return !1;
    }
  }
  ro = t;
  const r = Tf(), i = new r(), s = ko(), a = fn(), n = un(), f = Qe(), {
    safeRe: o,
    t: h,
    comparatorTrimReplace: d,
    tildeTrimReplace: l,
    caretTrimReplace: u
  } = xr(), { FLAG_INCLUDE_PRERELEASE: p, FLAG_LOOSE: E } = cn(), y = (F) => F.value === "<0.0.0-0", m = (F) => F.value === "", T = (F, L) => {
    let j = !0;
    const k = F.slice();
    let G = k.pop();
    for (; j && k.length; )
      j = k.every((Y) => G.intersects(Y, L)), G = k.pop();
    return j;
  }, A = (F, L) => (F = F.replace(o[h.BUILD], ""), n("comp", F, L), F = b(F, L), n("caret", F), F = D(F, L), n("tildes", F), F = w(F, L), n("xrange", F), F = _(F, L), n("stars", F), F), N = (F) => !F || F.toLowerCase() === "x" || F === "*", D = (F, L) => F.trim().split(/\s+/).map((j) => I(j, L)).join(" "), I = (F, L) => {
    const j = L.loose ? o[h.TILDELOOSE] : o[h.TILDE];
    return F.replace(j, (k, G, Y, ee, pe) => {
      n("tilde", F, k, G, Y, ee, pe);
      let Z;
      return N(G) ? Z = "" : N(Y) ? Z = `>=${G}.0.0 <${+G + 1}.0.0-0` : N(ee) ? Z = `>=${G}.${Y}.0 <${G}.${+Y + 1}.0-0` : pe ? (n("replaceTilde pr", pe), Z = `>=${G}.${Y}.${ee}-${pe} <${G}.${+Y + 1}.0-0`) : Z = `>=${G}.${Y}.${ee} <${G}.${+Y + 1}.0-0`, n("tilde return", Z), Z;
    });
  }, b = (F, L) => F.trim().split(/\s+/).map((j) => S(j, L)).join(" "), S = (F, L) => {
    n("caret", F, L);
    const j = L.loose ? o[h.CARETLOOSE] : o[h.CARET], k = L.includePrerelease ? "-0" : "";
    return F.replace(j, (G, Y, ee, pe, Z) => {
      n("caret", F, G, Y, ee, pe, Z);
      let ye;
      return N(Y) ? ye = "" : N(ee) ? ye = `>=${Y}.0.0${k} <${+Y + 1}.0.0-0` : N(pe) ? Y === "0" ? ye = `>=${Y}.${ee}.0${k} <${Y}.${+ee + 1}.0-0` : ye = `>=${Y}.${ee}.0${k} <${+Y + 1}.0.0-0` : Z ? (n("replaceCaret pr", Z), Y === "0" ? ee === "0" ? ye = `>=${Y}.${ee}.${pe}-${Z} <${Y}.${ee}.${+pe + 1}-0` : ye = `>=${Y}.${ee}.${pe}-${Z} <${Y}.${+ee + 1}.0-0` : ye = `>=${Y}.${ee}.${pe}-${Z} <${+Y + 1}.0.0-0`) : (n("no pr"), Y === "0" ? ee === "0" ? ye = `>=${Y}.${ee}.${pe}${k} <${Y}.${ee}.${+pe + 1}-0` : ye = `>=${Y}.${ee}.${pe}${k} <${Y}.${+ee + 1}.0-0` : ye = `>=${Y}.${ee}.${pe} <${+Y + 1}.0.0-0`), n("caret return", ye), ye;
    });
  }, w = (F, L) => (n("replaceXRanges", F, L), F.split(/\s+/).map((j) => C(j, L)).join(" ")), C = (F, L) => {
    F = F.trim();
    const j = L.loose ? o[h.XRANGELOOSE] : o[h.XRANGE];
    return F.replace(j, (k, G, Y, ee, pe, Z) => {
      n("xRange", F, k, G, Y, ee, pe, Z);
      const ye = N(Y), me = ye || N(ee), Q = me || N(pe), de = Q;
      return G === "=" && de && (G = ""), Z = L.includePrerelease ? "-0" : "", ye ? G === ">" || G === "<" ? k = "<0.0.0-0" : k = "*" : G && de ? (me && (ee = 0), pe = 0, G === ">" ? (G = ">=", me ? (Y = +Y + 1, ee = 0, pe = 0) : (ee = +ee + 1, pe = 0)) : G === "<=" && (G = "<", me ? Y = +Y + 1 : ee = +ee + 1), G === "<" && (Z = "-0"), k = `${G + Y}.${ee}.${pe}${Z}`) : me ? k = `>=${Y}.0.0${Z} <${+Y + 1}.0.0-0` : Q && (k = `>=${Y}.${ee}.0${Z} <${Y}.${+ee + 1}.0-0`), n("xRange return", k), k;
    });
  }, _ = (F, L) => (n("replaceStars", F, L), F.trim().replace(o[h.STAR], "")), U = (F, L) => (n("replaceGTE0", F, L), F.trim().replace(o[L.includePrerelease ? h.GTE0PRE : h.GTE0], "")), x = (F) => (L, j, k, G, Y, ee, pe, Z, ye, me, Q, de) => (N(k) ? j = "" : N(G) ? j = `>=${k}.0.0${F ? "-0" : ""}` : N(Y) ? j = `>=${k}.${G}.0${F ? "-0" : ""}` : ee ? j = `>=${j}` : j = `>=${j}${F ? "-0" : ""}`, N(ye) ? Z = "" : N(me) ? Z = `<${+ye + 1}.0.0-0` : N(Q) ? Z = `<${ye}.${+me + 1}.0-0` : de ? Z = `<=${ye}.${me}.${Q}-${de}` : F ? Z = `<${ye}.${me}.${+Q + 1}-0` : Z = `<=${Z}`, `${j} ${Z}`.trim()), $ = (F, L, j) => {
    for (let k = 0; k < F.length; k++)
      if (!F[k].test(L))
        return !1;
    if (L.prerelease.length && !j.includePrerelease) {
      for (let k = 0; k < F.length; k++)
        if (n(F[k].semver), F[k].semver !== a.ANY && F[k].semver.prerelease.length > 0) {
          const G = F[k].semver;
          if (G.major === L.major && G.minor === L.minor && G.patch === L.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return ro;
}
var no, fl;
function fn() {
  if (fl) return no;
  fl = 1;
  const e = /* @__PURE__ */ Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(d, l) {
      if (l = r(l), d instanceof t) {
        if (d.loose === !!l.loose)
          return d;
        d = d.value;
      }
      d = d.trim().split(/\s+/).join(" "), n("comparator", d, l), this.options = l, this.loose = !!l.loose, this.parse(d), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, n("comp", this);
    }
    parse(d) {
      const l = this.options.loose ? i[s.COMPARATORLOOSE] : i[s.COMPARATOR], u = d.match(l);
      if (!u)
        throw new TypeError(`Invalid comparator: ${d}`);
      this.operator = u[1] !== void 0 ? u[1] : "", this.operator === "=" && (this.operator = ""), u[2] ? this.semver = new f(u[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(d) {
      if (n("Comparator.test", d, this.options.loose), this.semver === e || d === e)
        return !0;
      if (typeof d == "string")
        try {
          d = new f(d, this.options);
        } catch {
          return !1;
        }
      return a(d, this.operator, this.semver, this.options);
    }
    intersects(d, l) {
      if (!(d instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new o(d.value, l).test(this.value) : d.operator === "" ? d.value === "" ? !0 : new o(this.value, l).test(d.semver) : (l = r(l), l.includePrerelease && (this.value === "<0.0.0-0" || d.value === "<0.0.0-0") || !l.includePrerelease && (this.value.startsWith("<0.0.0") || d.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && d.operator.startsWith(">") || this.operator.startsWith("<") && d.operator.startsWith("<") || this.semver.version === d.semver.version && this.operator.includes("=") && d.operator.includes("=") || a(this.semver, "<", d.semver, l) && this.operator.startsWith(">") && d.operator.startsWith("<") || a(this.semver, ">", d.semver, l) && this.operator.startsWith("<") && d.operator.startsWith(">")));
    }
  }
  no = t;
  const r = ko(), { safeRe: i, t: s } = xr(), a = Wc(), n = un(), f = Qe(), o = ht();
  return no;
}
var io, hl;
function hn() {
  if (hl) return io;
  hl = 1;
  const e = ht();
  return io = (r, i, s) => {
    try {
      i = new e(i, s);
    } catch {
      return !1;
    }
    return i.test(r);
  }, io;
}
var oo, pl;
function Af() {
  if (pl) return oo;
  pl = 1;
  const e = ht();
  return oo = (r, i) => new e(r, i).set.map((s) => s.map((a) => a.value).join(" ").trim().split(" ")), oo;
}
var ao, ml;
function Rf() {
  if (ml) return ao;
  ml = 1;
  const e = Qe(), t = ht();
  return ao = (i, s, a) => {
    let n = null, f = null, o = null;
    try {
      o = new t(s, a);
    } catch {
      return null;
    }
    return i.forEach((h) => {
      o.test(h) && (!n || f.compare(h) === -1) && (n = h, f = new e(n, a));
    }), n;
  }, ao;
}
var so, gl;
function Sf() {
  if (gl) return so;
  gl = 1;
  const e = Qe(), t = ht();
  return so = (i, s, a) => {
    let n = null, f = null, o = null;
    try {
      o = new t(s, a);
    } catch {
      return null;
    }
    return i.forEach((h) => {
      o.test(h) && (!n || f.compare(h) === 1) && (n = h, f = new e(n, a));
    }), n;
  }, so;
}
var lo, El;
function If() {
  if (El) return lo;
  El = 1;
  const e = Qe(), t = ht(), r = dn();
  return lo = (s, a) => {
    s = new t(s, a);
    let n = new e("0.0.0");
    if (s.test(n) || (n = new e("0.0.0-0"), s.test(n)))
      return n;
    n = null;
    for (let f = 0; f < s.set.length; ++f) {
      const o = s.set[f];
      let h = null;
      o.forEach((d) => {
        const l = new e(d.semver.version);
        switch (d.operator) {
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
            throw new Error(`Unexpected operation: ${d.operator}`);
        }
      }), h && (!n || r(n, h)) && (n = h);
    }
    return n && s.test(n) ? n : null;
  }, lo;
}
var co, yl;
function bf() {
  if (yl) return co;
  yl = 1;
  const e = ht();
  return co = (r, i) => {
    try {
      return new e(r, i).range || "*";
    } catch {
      return null;
    }
  }, co;
}
var uo, vl;
function Ho() {
  if (vl) return uo;
  vl = 1;
  const e = Qe(), t = fn(), { ANY: r } = t, i = ht(), s = hn(), a = dn(), n = Mo(), f = Bo(), o = qo();
  return uo = (d, l, u, p) => {
    d = new e(d, p), l = new i(l, p);
    let E, y, m, T, A;
    switch (u) {
      case ">":
        E = a, y = f, m = n, T = ">", A = ">=";
        break;
      case "<":
        E = n, y = o, m = a, T = "<", A = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (s(d, l, p))
      return !1;
    for (let N = 0; N < l.set.length; ++N) {
      const D = l.set[N];
      let I = null, b = null;
      if (D.forEach((S) => {
        S.semver === r && (S = new t(">=0.0.0")), I = I || S, b = b || S, E(S.semver, I.semver, p) ? I = S : m(S.semver, b.semver, p) && (b = S);
      }), I.operator === T || I.operator === A || (!b.operator || b.operator === T) && y(d, b.semver))
        return !1;
      if (b.operator === A && m(d, b.semver))
        return !1;
    }
    return !0;
  }, uo;
}
var fo, wl;
function Cf() {
  if (wl) return fo;
  wl = 1;
  const e = Ho();
  return fo = (r, i, s) => e(r, i, ">", s), fo;
}
var ho, _l;
function Nf() {
  if (_l) return ho;
  _l = 1;
  const e = Ho();
  return ho = (r, i, s) => e(r, i, "<", s), ho;
}
var po, Tl;
function Of() {
  if (Tl) return po;
  Tl = 1;
  const e = ht();
  return po = (r, i, s) => (r = new e(r, s), i = new e(i, s), r.intersects(i, s)), po;
}
var mo, Al;
function Df() {
  if (Al) return mo;
  Al = 1;
  const e = hn(), t = ft();
  return mo = (r, i, s) => {
    const a = [];
    let n = null, f = null;
    const o = r.sort((u, p) => t(u, p, s));
    for (const u of o)
      e(u, i, s) ? (f = u, n || (n = u)) : (f && a.push([n, f]), f = null, n = null);
    n && a.push([n, null]);
    const h = [];
    for (const [u, p] of a)
      u === p ? h.push(u) : !p && u === o[0] ? h.push("*") : p ? u === o[0] ? h.push(`<=${p}`) : h.push(`${u} - ${p}`) : h.push(`>=${u}`);
    const d = h.join(" || "), l = typeof i.raw == "string" ? i.raw : String(i);
    return d.length < l.length ? d : i;
  }, mo;
}
var go, Rl;
function Pf() {
  if (Rl) return go;
  Rl = 1;
  const e = ht(), t = fn(), { ANY: r } = t, i = hn(), s = ft(), a = (l, u, p = {}) => {
    if (l === u)
      return !0;
    l = new e(l, p), u = new e(u, p);
    let E = !1;
    e: for (const y of l.set) {
      for (const m of u.set) {
        const T = o(y, m, p);
        if (E = E || T !== null, T)
          continue e;
      }
      if (E)
        return !1;
    }
    return !0;
  }, n = [new t(">=0.0.0-0")], f = [new t(">=0.0.0")], o = (l, u, p) => {
    if (l === u)
      return !0;
    if (l.length === 1 && l[0].semver === r) {
      if (u.length === 1 && u[0].semver === r)
        return !0;
      p.includePrerelease ? l = n : l = f;
    }
    if (u.length === 1 && u[0].semver === r) {
      if (p.includePrerelease)
        return !0;
      u = f;
    }
    const E = /* @__PURE__ */ new Set();
    let y, m;
    for (const w of l)
      w.operator === ">" || w.operator === ">=" ? y = h(y, w, p) : w.operator === "<" || w.operator === "<=" ? m = d(m, w, p) : E.add(w.semver);
    if (E.size > 1)
      return null;
    let T;
    if (y && m) {
      if (T = s(y.semver, m.semver, p), T > 0)
        return null;
      if (T === 0 && (y.operator !== ">=" || m.operator !== "<="))
        return null;
    }
    for (const w of E) {
      if (y && !i(w, String(y), p) || m && !i(w, String(m), p))
        return null;
      for (const C of u)
        if (!i(w, String(C), p))
          return !1;
      return !0;
    }
    let A, N, D, I, b = m && !p.includePrerelease && m.semver.prerelease.length ? m.semver : !1, S = y && !p.includePrerelease && y.semver.prerelease.length ? y.semver : !1;
    b && b.prerelease.length === 1 && m.operator === "<" && b.prerelease[0] === 0 && (b = !1);
    for (const w of u) {
      if (I = I || w.operator === ">" || w.operator === ">=", D = D || w.operator === "<" || w.operator === "<=", y) {
        if (S && w.semver.prerelease && w.semver.prerelease.length && w.semver.major === S.major && w.semver.minor === S.minor && w.semver.patch === S.patch && (S = !1), w.operator === ">" || w.operator === ">=") {
          if (A = h(y, w, p), A === w && A !== y)
            return !1;
        } else if (y.operator === ">=" && !i(y.semver, String(w), p))
          return !1;
      }
      if (m) {
        if (b && w.semver.prerelease && w.semver.prerelease.length && w.semver.major === b.major && w.semver.minor === b.minor && w.semver.patch === b.patch && (b = !1), w.operator === "<" || w.operator === "<=") {
          if (N = d(m, w, p), N === w && N !== m)
            return !1;
        } else if (m.operator === "<=" && !i(m.semver, String(w), p))
          return !1;
      }
      if (!w.operator && (m || y) && T !== 0)
        return !1;
    }
    return !(y && D && !m && T !== 0 || m && I && !y && T !== 0 || S || b);
  }, h = (l, u, p) => {
    if (!l)
      return u;
    const E = s(l.semver, u.semver, p);
    return E > 0 ? l : E < 0 || u.operator === ">" && l.operator === ">=" ? u : l;
  }, d = (l, u, p) => {
    if (!l)
      return u;
    const E = s(l.semver, u.semver, p);
    return E < 0 ? l : E > 0 || u.operator === "<" && l.operator === "<=" ? u : l;
  };
  return go = a, go;
}
var Eo, Sl;
function Vc() {
  if (Sl) return Eo;
  Sl = 1;
  const e = xr(), t = cn(), r = Qe(), i = Hc(), s = rr(), a = cf(), n = uf(), f = df(), o = ff(), h = hf(), d = pf(), l = mf(), u = gf(), p = ft(), E = Ef(), y = yf(), m = $o(), T = vf(), A = wf(), N = dn(), D = Mo(), I = jc(), b = Gc(), S = qo(), w = Bo(), C = Wc(), _ = _f(), U = fn(), x = ht(), $ = hn(), F = Af(), L = Rf(), j = Sf(), k = If(), G = bf(), Y = Ho(), ee = Cf(), pe = Nf(), Z = Of(), ye = Df(), me = Pf();
  return Eo = {
    parse: s,
    valid: a,
    clean: n,
    inc: f,
    diff: o,
    major: h,
    minor: d,
    patch: l,
    prerelease: u,
    compare: p,
    rcompare: E,
    compareLoose: y,
    compareBuild: m,
    sort: T,
    rsort: A,
    gt: N,
    lt: D,
    eq: I,
    neq: b,
    gte: S,
    lte: w,
    cmp: C,
    coerce: _,
    Comparator: U,
    Range: x,
    satisfies: $,
    toComparators: F,
    maxSatisfying: L,
    minSatisfying: j,
    minVersion: k,
    validRange: G,
    outside: Y,
    gtr: ee,
    ltr: pe,
    intersects: Z,
    simplifyRange: ye,
    subset: me,
    SemVer: r,
    re: e.re,
    src: e.src,
    tokens: e.t,
    SEMVER_SPEC_VERSION: t.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: t.RELEASE_TYPES,
    compareIdentifiers: i.compareIdentifiers,
    rcompareIdentifiers: i.rcompareIdentifiers
  }, Eo;
}
var Kt = {}, Nr = { exports: {} };
Nr.exports;
var Il;
function Ff() {
  return Il || (Il = 1, (function(e, t) {
    var r = 200, i = "__lodash_hash_undefined__", s = 1, a = 2, n = 9007199254740991, f = "[object Arguments]", o = "[object Array]", h = "[object AsyncFunction]", d = "[object Boolean]", l = "[object Date]", u = "[object Error]", p = "[object Function]", E = "[object GeneratorFunction]", y = "[object Map]", m = "[object Number]", T = "[object Null]", A = "[object Object]", N = "[object Promise]", D = "[object Proxy]", I = "[object RegExp]", b = "[object Set]", S = "[object String]", w = "[object Symbol]", C = "[object Undefined]", _ = "[object WeakMap]", U = "[object ArrayBuffer]", x = "[object DataView]", $ = "[object Float32Array]", F = "[object Float64Array]", L = "[object Int8Array]", j = "[object Int16Array]", k = "[object Int32Array]", G = "[object Uint8Array]", Y = "[object Uint8ClampedArray]", ee = "[object Uint16Array]", pe = "[object Uint32Array]", Z = /[\\^$.*+?()[\]{}|]/g, ye = /^\[object .+?Constructor\]$/, me = /^(?:0|[1-9]\d*)$/, Q = {};
    Q[$] = Q[F] = Q[L] = Q[j] = Q[k] = Q[G] = Q[Y] = Q[ee] = Q[pe] = !0, Q[f] = Q[o] = Q[U] = Q[d] = Q[x] = Q[l] = Q[u] = Q[p] = Q[y] = Q[m] = Q[A] = Q[I] = Q[b] = Q[S] = Q[_] = !1;
    var de = typeof ut == "object" && ut && ut.Object === Object && ut, ve = typeof self == "object" && self && self.Object === Object && self, Re = de || ve || Function("return this")(), Ne = t && !t.nodeType && t, Ce = Ne && !0 && e && !e.nodeType && e, Ae = Ce && Ce.exports === Ne, v = Ae && de.process, g = (function() {
      try {
        return v && v.binding && v.binding("util");
      } catch {
      }
    })(), q = g && g.isTypedArray;
    function P(O, M) {
      for (var J = -1, ce = O == null ? 0 : O.length, Pe = 0, we = []; ++J < ce; ) {
        var ke = O[J];
        M(ke, J, O) && (we[Pe++] = ke);
      }
      return we;
    }
    function _e(O, M) {
      for (var J = -1, ce = M.length, Pe = O.length; ++J < ce; )
        O[Pe + J] = M[J];
      return O;
    }
    function Te(O, M) {
      for (var J = -1, ce = O == null ? 0 : O.length; ++J < ce; )
        if (M(O[J], J, O))
          return !0;
      return !1;
    }
    function De(O, M) {
      for (var J = -1, ce = Array(O); ++J < O; )
        ce[J] = M(J);
      return ce;
    }
    function $e(O) {
      return function(M) {
        return O(M);
      };
    }
    function Me(O, M) {
      return O.has(M);
    }
    function We(O, M) {
      return O?.[M];
    }
    function c(O) {
      var M = -1, J = Array(O.size);
      return O.forEach(function(ce, Pe) {
        J[++M] = [Pe, ce];
      }), J;
    }
    function B(O, M) {
      return function(J) {
        return O(M(J));
      };
    }
    function W(O) {
      var M = -1, J = Array(O.size);
      return O.forEach(function(ce) {
        J[++M] = ce;
      }), J;
    }
    var ie = Array.prototype, V = Function.prototype, ne = Object.prototype, te = Re["__core-js_shared__"], ae = V.toString, ue = ne.hasOwnProperty, Se = (function() {
      var O = /[^.]+$/.exec(te && te.keys && te.keys.IE_PROTO || "");
      return O ? "Symbol(src)_1." + O : "";
    })(), Ie = ne.toString, he = RegExp(
      "^" + ae.call(ue).replace(Z, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    ), R = Ae ? Re.Buffer : void 0, H = Re.Symbol, z = Re.Uint8Array, X = ne.propertyIsEnumerable, K = ie.splice, oe = H ? H.toStringTag : void 0, re = Object.getOwnPropertySymbols, se = R ? R.isBuffer : void 0, fe = B(Object.keys, Object), ge = Yt(Re, "DataView"), Oe = Yt(Re, "Map"), Ue = Yt(Re, "Promise"), be = Yt(Re, "Set"), Vt = Yt(Re, "WeakMap"), st = Yt(Object, "create"), Ft = Ut(ge), Su = Ut(Oe), Iu = Ut(Ue), bu = Ut(be), Cu = Ut(Vt), Qo = H ? H.prototype : void 0, vn = Qo ? Qo.valueOf : void 0;
    function Lt(O) {
      var M = -1, J = O == null ? 0 : O.length;
      for (this.clear(); ++M < J; ) {
        var ce = O[M];
        this.set(ce[0], ce[1]);
      }
    }
    function Nu() {
      this.__data__ = st ? st(null) : {}, this.size = 0;
    }
    function Ou(O) {
      var M = this.has(O) && delete this.__data__[O];
      return this.size -= M ? 1 : 0, M;
    }
    function Du(O) {
      var M = this.__data__;
      if (st) {
        var J = M[O];
        return J === i ? void 0 : J;
      }
      return ue.call(M, O) ? M[O] : void 0;
    }
    function Pu(O) {
      var M = this.__data__;
      return st ? M[O] !== void 0 : ue.call(M, O);
    }
    function Fu(O, M) {
      var J = this.__data__;
      return this.size += this.has(O) ? 0 : 1, J[O] = st && M === void 0 ? i : M, this;
    }
    Lt.prototype.clear = Nu, Lt.prototype.delete = Ou, Lt.prototype.get = Du, Lt.prototype.has = Pu, Lt.prototype.set = Fu;
    function vt(O) {
      var M = -1, J = O == null ? 0 : O.length;
      for (this.clear(); ++M < J; ) {
        var ce = O[M];
        this.set(ce[0], ce[1]);
      }
    }
    function Lu() {
      this.__data__ = [], this.size = 0;
    }
    function xu(O) {
      var M = this.__data__, J = Mr(M, O);
      if (J < 0)
        return !1;
      var ce = M.length - 1;
      return J == ce ? M.pop() : K.call(M, J, 1), --this.size, !0;
    }
    function Uu(O) {
      var M = this.__data__, J = Mr(M, O);
      return J < 0 ? void 0 : M[J][1];
    }
    function ku(O) {
      return Mr(this.__data__, O) > -1;
    }
    function $u(O, M) {
      var J = this.__data__, ce = Mr(J, O);
      return ce < 0 ? (++this.size, J.push([O, M])) : J[ce][1] = M, this;
    }
    vt.prototype.clear = Lu, vt.prototype.delete = xu, vt.prototype.get = Uu, vt.prototype.has = ku, vt.prototype.set = $u;
    function xt(O) {
      var M = -1, J = O == null ? 0 : O.length;
      for (this.clear(); ++M < J; ) {
        var ce = O[M];
        this.set(ce[0], ce[1]);
      }
    }
    function Mu() {
      this.size = 0, this.__data__ = {
        hash: new Lt(),
        map: new (Oe || vt)(),
        string: new Lt()
      };
    }
    function qu(O) {
      var M = qr(this, O).delete(O);
      return this.size -= M ? 1 : 0, M;
    }
    function Bu(O) {
      return qr(this, O).get(O);
    }
    function Hu(O) {
      return qr(this, O).has(O);
    }
    function ju(O, M) {
      var J = qr(this, O), ce = J.size;
      return J.set(O, M), this.size += J.size == ce ? 0 : 1, this;
    }
    xt.prototype.clear = Mu, xt.prototype.delete = qu, xt.prototype.get = Bu, xt.prototype.has = Hu, xt.prototype.set = ju;
    function $r(O) {
      var M = -1, J = O == null ? 0 : O.length;
      for (this.__data__ = new xt(); ++M < J; )
        this.add(O[M]);
    }
    function Gu(O) {
      return this.__data__.set(O, i), this;
    }
    function Wu(O) {
      return this.__data__.has(O);
    }
    $r.prototype.add = $r.prototype.push = Gu, $r.prototype.has = Wu;
    function Rt(O) {
      var M = this.__data__ = new vt(O);
      this.size = M.size;
    }
    function Vu() {
      this.__data__ = new vt(), this.size = 0;
    }
    function Yu(O) {
      var M = this.__data__, J = M.delete(O);
      return this.size = M.size, J;
    }
    function zu(O) {
      return this.__data__.get(O);
    }
    function Xu(O) {
      return this.__data__.has(O);
    }
    function Ku(O, M) {
      var J = this.__data__;
      if (J instanceof vt) {
        var ce = J.__data__;
        if (!Oe || ce.length < r - 1)
          return ce.push([O, M]), this.size = ++J.size, this;
        J = this.__data__ = new xt(ce);
      }
      return J.set(O, M), this.size = J.size, this;
    }
    Rt.prototype.clear = Vu, Rt.prototype.delete = Yu, Rt.prototype.get = zu, Rt.prototype.has = Xu, Rt.prototype.set = Ku;
    function Ju(O, M) {
      var J = Br(O), ce = !J && fd(O), Pe = !J && !ce && wn(O), we = !J && !ce && !Pe && sa(O), ke = J || ce || Pe || we, Be = ke ? De(O.length, String) : [], je = Be.length;
      for (var xe in O)
        ue.call(O, xe) && !(ke && // Safari 9 has enumerable `arguments.length` in strict mode.
        (xe == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
        Pe && (xe == "offset" || xe == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        we && (xe == "buffer" || xe == "byteLength" || xe == "byteOffset") || // Skip index properties.
        sd(xe, je))) && Be.push(xe);
      return Be;
    }
    function Mr(O, M) {
      for (var J = O.length; J--; )
        if (na(O[J][0], M))
          return J;
      return -1;
    }
    function Qu(O, M, J) {
      var ce = M(O);
      return Br(O) ? ce : _e(ce, J(O));
    }
    function ir(O) {
      return O == null ? O === void 0 ? C : T : oe && oe in Object(O) ? od(O) : dd(O);
    }
    function Zo(O) {
      return or(O) && ir(O) == f;
    }
    function ea(O, M, J, ce, Pe) {
      return O === M ? !0 : O == null || M == null || !or(O) && !or(M) ? O !== O && M !== M : Zu(O, M, J, ce, ea, Pe);
    }
    function Zu(O, M, J, ce, Pe, we) {
      var ke = Br(O), Be = Br(M), je = ke ? o : St(O), xe = Be ? o : St(M);
      je = je == f ? A : je, xe = xe == f ? A : xe;
      var tt = je == A, lt = xe == A, Ve = je == xe;
      if (Ve && wn(O)) {
        if (!wn(M))
          return !1;
        ke = !0, tt = !1;
      }
      if (Ve && !tt)
        return we || (we = new Rt()), ke || sa(O) ? ta(O, M, J, ce, Pe, we) : nd(O, M, je, J, ce, Pe, we);
      if (!(J & s)) {
        var ot = tt && ue.call(O, "__wrapped__"), at = lt && ue.call(M, "__wrapped__");
        if (ot || at) {
          var It = ot ? O.value() : O, wt = at ? M.value() : M;
          return we || (we = new Rt()), Pe(It, wt, J, ce, we);
        }
      }
      return Ve ? (we || (we = new Rt()), id(O, M, J, ce, Pe, we)) : !1;
    }
    function ed(O) {
      if (!aa(O) || cd(O))
        return !1;
      var M = ia(O) ? he : ye;
      return M.test(Ut(O));
    }
    function td(O) {
      return or(O) && oa(O.length) && !!Q[ir(O)];
    }
    function rd(O) {
      if (!ud(O))
        return fe(O);
      var M = [];
      for (var J in Object(O))
        ue.call(O, J) && J != "constructor" && M.push(J);
      return M;
    }
    function ta(O, M, J, ce, Pe, we) {
      var ke = J & s, Be = O.length, je = M.length;
      if (Be != je && !(ke && je > Be))
        return !1;
      var xe = we.get(O);
      if (xe && we.get(M))
        return xe == M;
      var tt = -1, lt = !0, Ve = J & a ? new $r() : void 0;
      for (we.set(O, M), we.set(M, O); ++tt < Be; ) {
        var ot = O[tt], at = M[tt];
        if (ce)
          var It = ke ? ce(at, ot, tt, M, O, we) : ce(ot, at, tt, O, M, we);
        if (It !== void 0) {
          if (It)
            continue;
          lt = !1;
          break;
        }
        if (Ve) {
          if (!Te(M, function(wt, kt) {
            if (!Me(Ve, kt) && (ot === wt || Pe(ot, wt, J, ce, we)))
              return Ve.push(kt);
          })) {
            lt = !1;
            break;
          }
        } else if (!(ot === at || Pe(ot, at, J, ce, we))) {
          lt = !1;
          break;
        }
      }
      return we.delete(O), we.delete(M), lt;
    }
    function nd(O, M, J, ce, Pe, we, ke) {
      switch (J) {
        case x:
          if (O.byteLength != M.byteLength || O.byteOffset != M.byteOffset)
            return !1;
          O = O.buffer, M = M.buffer;
        case U:
          return !(O.byteLength != M.byteLength || !we(new z(O), new z(M)));
        case d:
        case l:
        case m:
          return na(+O, +M);
        case u:
          return O.name == M.name && O.message == M.message;
        case I:
        case S:
          return O == M + "";
        case y:
          var Be = c;
        case b:
          var je = ce & s;
          if (Be || (Be = W), O.size != M.size && !je)
            return !1;
          var xe = ke.get(O);
          if (xe)
            return xe == M;
          ce |= a, ke.set(O, M);
          var tt = ta(Be(O), Be(M), ce, Pe, we, ke);
          return ke.delete(O), tt;
        case w:
          if (vn)
            return vn.call(O) == vn.call(M);
      }
      return !1;
    }
    function id(O, M, J, ce, Pe, we) {
      var ke = J & s, Be = ra(O), je = Be.length, xe = ra(M), tt = xe.length;
      if (je != tt && !ke)
        return !1;
      for (var lt = je; lt--; ) {
        var Ve = Be[lt];
        if (!(ke ? Ve in M : ue.call(M, Ve)))
          return !1;
      }
      var ot = we.get(O);
      if (ot && we.get(M))
        return ot == M;
      var at = !0;
      we.set(O, M), we.set(M, O);
      for (var It = ke; ++lt < je; ) {
        Ve = Be[lt];
        var wt = O[Ve], kt = M[Ve];
        if (ce)
          var la = ke ? ce(kt, wt, Ve, M, O, we) : ce(wt, kt, Ve, O, M, we);
        if (!(la === void 0 ? wt === kt || Pe(wt, kt, J, ce, we) : la)) {
          at = !1;
          break;
        }
        It || (It = Ve == "constructor");
      }
      if (at && !It) {
        var Hr = O.constructor, jr = M.constructor;
        Hr != jr && "constructor" in O && "constructor" in M && !(typeof Hr == "function" && Hr instanceof Hr && typeof jr == "function" && jr instanceof jr) && (at = !1);
      }
      return we.delete(O), we.delete(M), at;
    }
    function ra(O) {
      return Qu(O, md, ad);
    }
    function qr(O, M) {
      var J = O.__data__;
      return ld(M) ? J[typeof M == "string" ? "string" : "hash"] : J.map;
    }
    function Yt(O, M) {
      var J = We(O, M);
      return ed(J) ? J : void 0;
    }
    function od(O) {
      var M = ue.call(O, oe), J = O[oe];
      try {
        O[oe] = void 0;
        var ce = !0;
      } catch {
      }
      var Pe = Ie.call(O);
      return ce && (M ? O[oe] = J : delete O[oe]), Pe;
    }
    var ad = re ? function(O) {
      return O == null ? [] : (O = Object(O), P(re(O), function(M) {
        return X.call(O, M);
      }));
    } : gd, St = ir;
    (ge && St(new ge(new ArrayBuffer(1))) != x || Oe && St(new Oe()) != y || Ue && St(Ue.resolve()) != N || be && St(new be()) != b || Vt && St(new Vt()) != _) && (St = function(O) {
      var M = ir(O), J = M == A ? O.constructor : void 0, ce = J ? Ut(J) : "";
      if (ce)
        switch (ce) {
          case Ft:
            return x;
          case Su:
            return y;
          case Iu:
            return N;
          case bu:
            return b;
          case Cu:
            return _;
        }
      return M;
    });
    function sd(O, M) {
      return M = M ?? n, !!M && (typeof O == "number" || me.test(O)) && O > -1 && O % 1 == 0 && O < M;
    }
    function ld(O) {
      var M = typeof O;
      return M == "string" || M == "number" || M == "symbol" || M == "boolean" ? O !== "__proto__" : O === null;
    }
    function cd(O) {
      return !!Se && Se in O;
    }
    function ud(O) {
      var M = O && O.constructor, J = typeof M == "function" && M.prototype || ne;
      return O === J;
    }
    function dd(O) {
      return Ie.call(O);
    }
    function Ut(O) {
      if (O != null) {
        try {
          return ae.call(O);
        } catch {
        }
        try {
          return O + "";
        } catch {
        }
      }
      return "";
    }
    function na(O, M) {
      return O === M || O !== O && M !== M;
    }
    var fd = Zo(/* @__PURE__ */ (function() {
      return arguments;
    })()) ? Zo : function(O) {
      return or(O) && ue.call(O, "callee") && !X.call(O, "callee");
    }, Br = Array.isArray;
    function hd(O) {
      return O != null && oa(O.length) && !ia(O);
    }
    var wn = se || Ed;
    function pd(O, M) {
      return ea(O, M);
    }
    function ia(O) {
      if (!aa(O))
        return !1;
      var M = ir(O);
      return M == p || M == E || M == h || M == D;
    }
    function oa(O) {
      return typeof O == "number" && O > -1 && O % 1 == 0 && O <= n;
    }
    function aa(O) {
      var M = typeof O;
      return O != null && (M == "object" || M == "function");
    }
    function or(O) {
      return O != null && typeof O == "object";
    }
    var sa = q ? $e(q) : td;
    function md(O) {
      return hd(O) ? Ju(O) : rd(O);
    }
    function gd() {
      return [];
    }
    function Ed() {
      return !1;
    }
    e.exports = pd;
  })(Nr, Nr.exports)), Nr.exports;
}
var bl;
function Lf() {
  if (bl) return Kt;
  bl = 1, Object.defineProperty(Kt, "__esModule", { value: !0 }), Kt.DownloadedUpdateHelper = void 0, Kt.createTempUpdateFile = f;
  const e = dt, t = At, r = Ff(), i = /* @__PURE__ */ Ot(), s = Le;
  let a = class {
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
      return s.join(this.cacheDir, "pending");
    }
    async validateDownloadedPath(h, d, l, u) {
      if (this.versionInfo != null && this.file === h && this.fileInfo != null)
        return r(this.versionInfo, d) && r(this.fileInfo.info, l.info) && await (0, i.pathExists)(h) ? h : null;
      const p = await this.getValidCachedUpdateFile(l, u);
      return p === null ? null : (u.info(`Update has already been downloaded to ${h}).`), this._file = p, p);
    }
    async setDownloadedFile(h, d, l, u, p, E) {
      this._file = h, this._packageFile = d, this.versionInfo = l, this.fileInfo = u, this._downloadedFileInfo = {
        fileName: p,
        sha512: u.info.sha512,
        isAdminRightsRequired: u.info.isAdminRightsRequired === !0
      }, E && await (0, i.outputJson)(this.getUpdateInfoFile(), this._downloadedFileInfo);
    }
    async clear() {
      this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, await this.cleanCacheDirForPendingUpdate();
    }
    async cleanCacheDirForPendingUpdate() {
      try {
        await (0, i.emptyDir)(this.cacheDirForPendingUpdate);
      } catch {
      }
    }
    /**
     * Returns "update-info.json" which is created in the update cache directory's "pending" subfolder after the first update is downloaded.  If the update file does not exist then the cache is cleared and recreated.  If the update file exists then its properties are validated.
     * @param fileInfo
     * @param logger
     */
    async getValidCachedUpdateFile(h, d) {
      const l = this.getUpdateInfoFile();
      if (!await (0, i.pathExists)(l))
        return null;
      let p;
      try {
        p = await (0, i.readJson)(l);
      } catch (T) {
        let A = "No cached update info available";
        return T.code !== "ENOENT" && (await this.cleanCacheDirForPendingUpdate(), A += ` (error on read: ${T.message})`), d.info(A), null;
      }
      if (!(p?.fileName !== null))
        return d.warn("Cached update info is corrupted: no fileName, directory for cached update will be cleaned"), await this.cleanCacheDirForPendingUpdate(), null;
      if (h.info.sha512 !== p.sha512)
        return d.info(`Cached update sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${p.sha512}, expected: ${h.info.sha512}. Directory for cached update will be cleaned`), await this.cleanCacheDirForPendingUpdate(), null;
      const y = s.join(this.cacheDirForPendingUpdate, p.fileName);
      if (!await (0, i.pathExists)(y))
        return d.info("Cached update file doesn't exist"), null;
      const m = await n(y);
      return h.info.sha512 !== m ? (d.warn(`Sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${m}, expected: ${h.info.sha512}`), await this.cleanCacheDirForPendingUpdate(), null) : (this._downloadedFileInfo = p, y);
    }
    getUpdateInfoFile() {
      return s.join(this.cacheDirForPendingUpdate, "update-info.json");
    }
  };
  Kt.DownloadedUpdateHelper = a;
  function n(o, h = "sha512", d = "base64", l) {
    return new Promise((u, p) => {
      const E = (0, e.createHash)(h);
      E.on("error", p).setEncoding(d), (0, t.createReadStream)(o, {
        ...l,
        highWaterMark: 1024 * 1024
        /* better to use more memory but hash faster */
      }).on("error", p).on("end", () => {
        E.end(), u(E.read());
      }).pipe(E, { end: !1 });
    });
  }
  async function f(o, h, d) {
    let l = 0, u = s.join(h, o);
    for (let p = 0; p < 3; p++)
      try {
        return await (0, i.unlink)(u), u;
      } catch (E) {
        if (E.code === "ENOENT")
          return u;
        d.warn(`Error on remove temp update file: ${E}`), u = s.join(h, `${l++}-${o}`);
      }
    return u;
  }
  return Kt;
}
var ur = {}, tn = {}, Cl;
function xf() {
  if (Cl) return tn;
  Cl = 1, Object.defineProperty(tn, "__esModule", { value: !0 }), tn.getAppCacheDir = r;
  const e = Le, t = Pr;
  function r() {
    const i = (0, t.homedir)();
    let s;
    return process.platform === "win32" ? s = process.env.LOCALAPPDATA || e.join(i, "AppData", "Local") : process.platform === "darwin" ? s = e.join(i, "Library", "Caches") : s = process.env.XDG_CACHE_HOME || e.join(i, ".cache"), s;
  }
  return tn;
}
var Nl;
function Uf() {
  if (Nl) return ur;
  Nl = 1, Object.defineProperty(ur, "__esModule", { value: !0 }), ur.ElectronAppAdapter = void 0;
  const e = Le, t = xf();
  let r = class {
    constructor(s = Ht.app) {
      this.app = s;
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
    onQuit(s) {
      this.app.once("quit", (a, n) => s(n));
    }
  };
  return ur.ElectronAppAdapter = r, ur;
}
var yo = {}, Ol;
function kf() {
  return Ol || (Ol = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ElectronHttpExecutor = e.NET_SESSION_NAME = void 0, e.getNetSession = r;
    const t = He();
    e.NET_SESSION_NAME = "electron-updater";
    function r() {
      return Ht.session.fromPartition(e.NET_SESSION_NAME, {
        cache: !1
      });
    }
    class i extends t.HttpExecutor {
      constructor(a) {
        super(), this.proxyLoginCallback = a, this.cachedSession = null;
      }
      async download(a, n, f) {
        return await f.cancellationToken.createPromise((o, h, d) => {
          const l = {
            headers: f.headers || void 0,
            redirect: "manual"
          };
          (0, t.configureRequestUrl)(a, l), (0, t.configureRequestOptions)(l), this.doDownload(l, {
            destination: n,
            options: f,
            onCancel: d,
            callback: (u) => {
              u == null ? o(n) : h(u);
            },
            responseHandler: null
          }, 0);
        });
      }
      createRequest(a, n) {
        a.headers && a.headers.Host && (a.host = a.headers.Host, delete a.headers.Host), this.cachedSession == null && (this.cachedSession = r());
        const f = Ht.net.request({
          ...a,
          session: this.cachedSession
        });
        return f.on("response", n), this.proxyLoginCallback != null && f.on("login", this.proxyLoginCallback), f;
      }
      addRedirectHandlers(a, n, f, o, h) {
        a.on("redirect", (d, l, u) => {
          a.abort(), o > this.maxRedirects ? f(this.createMaxRedirectError()) : h(t.HttpExecutor.prepareRedirectUrlOptions(u, n));
        });
      }
    }
    e.ElectronHttpExecutor = i;
  })(yo)), yo;
}
var dr = {}, Jt = {}, Dl;
function Gt() {
  if (Dl) return Jt;
  Dl = 1, Object.defineProperty(Jt, "__esModule", { value: !0 }), Jt.newBaseUrl = t, Jt.newUrlFromBase = r, Jt.getChannelFilename = i;
  const e = Nt;
  function t(s) {
    const a = new e.URL(s);
    return a.pathname.endsWith("/") || (a.pathname += "/"), a;
  }
  function r(s, a, n = !1) {
    const f = new e.URL(s, a), o = a.search;
    return o != null && o.length !== 0 ? f.search = o : n && (f.search = `noCache=${Date.now().toString(32)}`), f;
  }
  function i(s) {
    return `${s}.yml`;
  }
  return Jt;
}
var _t = {}, vo, Pl;
function Yc() {
  if (Pl) return vo;
  Pl = 1;
  var e = "[object Symbol]", t = /[\\^$.*+?()[\]{}|]/g, r = RegExp(t.source), i = typeof ut == "object" && ut && ut.Object === Object && ut, s = typeof self == "object" && self && self.Object === Object && self, a = i || s || Function("return this")(), n = Object.prototype, f = n.toString, o = a.Symbol, h = o ? o.prototype : void 0, d = h ? h.toString : void 0;
  function l(m) {
    if (typeof m == "string")
      return m;
    if (p(m))
      return d ? d.call(m) : "";
    var T = m + "";
    return T == "0" && 1 / m == -1 / 0 ? "-0" : T;
  }
  function u(m) {
    return !!m && typeof m == "object";
  }
  function p(m) {
    return typeof m == "symbol" || u(m) && f.call(m) == e;
  }
  function E(m) {
    return m == null ? "" : l(m);
  }
  function y(m) {
    return m = E(m), m && r.test(m) ? m.replace(t, "\\$&") : m;
  }
  return vo = y, vo;
}
var Fl;
function it() {
  if (Fl) return _t;
  Fl = 1, Object.defineProperty(_t, "__esModule", { value: !0 }), _t.Provider = void 0, _t.findFile = n, _t.parseUpdateInfo = f, _t.getFileList = o, _t.resolveFiles = h;
  const e = He(), t = Uo(), r = Nt, i = Gt(), s = Yc();
  let a = class {
    constructor(l) {
      this.runtimeOptions = l, this.requestHeaders = null, this.executor = l.executor;
    }
    // By default, the blockmap file is in the same directory as the main file
    // But some providers may have a different blockmap file, so we need to override this method
    getBlockMapFiles(l, u, p, E = null) {
      const y = (0, i.newUrlFromBase)(`${l.pathname}.blockmap`, l);
      return [(0, i.newUrlFromBase)(`${l.pathname.replace(new RegExp(s(p), "g"), u)}.blockmap`, E ? new r.URL(E) : l), y];
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
    httpRequest(l, u, p) {
      return this.executor.request(this.createRequestOptions(l, u), p);
    }
    createRequestOptions(l, u) {
      const p = {};
      return this.requestHeaders == null ? u != null && (p.headers = u) : p.headers = u == null ? this.requestHeaders : { ...this.requestHeaders, ...u }, (0, e.configureRequestUrl)(l, p), p;
    }
  };
  _t.Provider = a;
  function n(d, l, u) {
    var p;
    if (d.length === 0)
      throw (0, e.newError)("No files provided", "ERR_UPDATER_NO_FILES_PROVIDED");
    const E = d.filter((m) => m.url.pathname.toLowerCase().endsWith(`.${l.toLowerCase()}`)), y = (p = E.find((m) => [m.url.pathname, m.info.url].some((T) => T.includes(process.arch)))) !== null && p !== void 0 ? p : E.shift();
    return y || (u == null ? d[0] : d.find((m) => !u.some((T) => m.url.pathname.toLowerCase().endsWith(`.${T.toLowerCase()}`))));
  }
  function f(d, l, u) {
    if (d == null)
      throw (0, e.newError)(`Cannot parse update info from ${l} in the latest release artifacts (${u}): rawData: null`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    let p;
    try {
      p = (0, t.load)(d);
    } catch (E) {
      throw (0, e.newError)(`Cannot parse update info from ${l} in the latest release artifacts (${u}): ${E.stack || E.message}, rawData: ${d}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    }
    return p;
  }
  function o(d) {
    const l = d.files;
    if (l != null && l.length > 0)
      return l;
    if (d.path != null)
      return [
        {
          url: d.path,
          sha2: d.sha2,
          sha512: d.sha512
        }
      ];
    throw (0, e.newError)(`No files provided: ${(0, e.safeStringifyJson)(d)}`, "ERR_UPDATER_NO_FILES_PROVIDED");
  }
  function h(d, l, u = (p) => p) {
    const E = o(d).map((T) => {
      if (T.sha2 == null && T.sha512 == null)
        throw (0, e.newError)(`Update info doesn't contain nor sha256 neither sha512 checksum: ${(0, e.safeStringifyJson)(T)}`, "ERR_UPDATER_NO_CHECKSUM");
      return {
        url: (0, i.newUrlFromBase)(u(T.url), l),
        info: T
      };
    }), y = d.packages, m = y == null ? null : y[process.arch] || y.ia32;
    return m != null && (E[0].packageInfo = {
      ...m,
      path: (0, i.newUrlFromBase)(u(m.path), l).href
    }), E;
  }
  return _t;
}
var Ll;
function zc() {
  if (Ll) return dr;
  Ll = 1, Object.defineProperty(dr, "__esModule", { value: !0 }), dr.GenericProvider = void 0;
  const e = He(), t = Gt(), r = it();
  let i = class extends r.Provider {
    constructor(a, n, f) {
      super(f), this.configuration = a, this.updater = n, this.baseUrl = (0, t.newBaseUrl)(this.configuration.url);
    }
    get channel() {
      const a = this.updater.channel || this.configuration.channel;
      return a == null ? this.getDefaultChannelName() : this.getCustomChannelName(a);
    }
    async getLatestVersion() {
      const a = (0, t.getChannelFilename)(this.channel), n = (0, t.newUrlFromBase)(a, this.baseUrl, this.updater.isAddNoCacheQuery);
      for (let f = 0; ; f++)
        try {
          return (0, r.parseUpdateInfo)(await this.httpRequest(n), a, n);
        } catch (o) {
          if (o instanceof e.HttpError && o.statusCode === 404)
            throw (0, e.newError)(`Cannot find channel "${a}" update info: ${o.stack || o.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
          if (o.code === "ECONNREFUSED" && f < 3) {
            await new Promise((h, d) => {
              try {
                setTimeout(h, 1e3 * f);
              } catch (l) {
                d(l);
              }
            });
            continue;
          }
          throw o;
        }
    }
    resolveFiles(a) {
      return (0, r.resolveFiles)(a, this.baseUrl);
    }
  };
  return dr.GenericProvider = i, dr;
}
var fr = {}, hr = {}, xl;
function $f() {
  if (xl) return hr;
  xl = 1, Object.defineProperty(hr, "__esModule", { value: !0 }), hr.BitbucketProvider = void 0;
  const e = He(), t = Gt(), r = it();
  let i = class extends r.Provider {
    constructor(a, n, f) {
      super({
        ...f,
        isUseMultipleRangeRequest: !1
      }), this.configuration = a, this.updater = n;
      const { owner: o, slug: h } = a;
      this.baseUrl = (0, t.newBaseUrl)(`https://api.bitbucket.org/2.0/repositories/${o}/${h}/downloads`);
    }
    get channel() {
      return this.updater.channel || this.configuration.channel || "latest";
    }
    async getLatestVersion() {
      const a = new e.CancellationToken(), n = (0, t.getChannelFilename)(this.getCustomChannelName(this.channel)), f = (0, t.newUrlFromBase)(n, this.baseUrl, this.updater.isAddNoCacheQuery);
      try {
        const o = await this.httpRequest(f, void 0, a);
        return (0, r.parseUpdateInfo)(o, n, f);
      } catch (o) {
        throw (0, e.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${o.stack || o.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    resolveFiles(a) {
      return (0, r.resolveFiles)(a, this.baseUrl);
    }
    toString() {
      const { owner: a, slug: n } = this.configuration;
      return `Bitbucket (owner: ${a}, slug: ${n}, channel: ${this.channel})`;
    }
  };
  return hr.BitbucketProvider = i, hr;
}
var Ct = {}, Ul;
function Xc() {
  if (Ul) return Ct;
  Ul = 1, Object.defineProperty(Ct, "__esModule", { value: !0 }), Ct.GitHubProvider = Ct.BaseGitHubProvider = void 0, Ct.computeReleaseNotes = h;
  const e = He(), t = Vc(), r = Nt, i = Gt(), s = it(), a = /\/tag\/([^/]+)$/;
  class n extends s.Provider {
    constructor(l, u, p) {
      super({
        ...p,
        /* because GitHib uses S3 */
        isUseMultipleRangeRequest: !1
      }), this.options = l, this.baseUrl = (0, i.newBaseUrl)((0, e.githubUrl)(l, u));
      const E = u === "github.com" ? "api.github.com" : u;
      this.baseApiUrl = (0, i.newBaseUrl)((0, e.githubUrl)(l, E));
    }
    computeGithubBasePath(l) {
      const u = this.options.host;
      return u && !["github.com", "api.github.com"].includes(u) ? `/api/v3${l}` : l;
    }
  }
  Ct.BaseGitHubProvider = n;
  let f = class extends n {
    constructor(l, u, p) {
      super(l, "github.com", p), this.options = l, this.updater = u;
    }
    get channel() {
      const l = this.updater.channel || this.options.channel;
      return l == null ? this.getDefaultChannelName() : this.getCustomChannelName(l);
    }
    async getLatestVersion() {
      var l, u, p, E, y;
      const m = new e.CancellationToken(), T = await this.httpRequest((0, i.newUrlFromBase)(`${this.basePath}.atom`, this.baseUrl), {
        accept: "application/xml, application/atom+xml, text/xml, */*"
      }, m), A = (0, e.parseXml)(T);
      let N = A.element("entry", !1, "No published versions on GitHub"), D = null;
      try {
        if (this.updater.allowPrerelease) {
          const _ = ((l = this.updater) === null || l === void 0 ? void 0 : l.channel) || ((u = t.prerelease(this.updater.currentVersion)) === null || u === void 0 ? void 0 : u[0]) || null;
          if (_ === null)
            D = a.exec(N.element("link").attribute("href"))[1];
          else
            for (const U of A.getElements("entry")) {
              const x = a.exec(U.element("link").attribute("href"));
              if (x === null)
                continue;
              const $ = x[1], F = ((p = t.prerelease($)) === null || p === void 0 ? void 0 : p[0]) || null, L = !_ || ["alpha", "beta"].includes(_), j = F !== null && !["alpha", "beta"].includes(String(F));
              if (L && !j && !(_ === "beta" && F === "alpha")) {
                D = $;
                break;
              }
              if (F && F === _) {
                D = $;
                break;
              }
            }
        } else {
          D = await this.getLatestTagName(m);
          for (const _ of A.getElements("entry"))
            if (a.exec(_.element("link").attribute("href"))[1] === D) {
              N = _;
              break;
            }
        }
      } catch (_) {
        throw (0, e.newError)(`Cannot parse releases feed: ${_.stack || _.message},
XML:
${T}`, "ERR_UPDATER_INVALID_RELEASE_FEED");
      }
      if (D == null)
        throw (0, e.newError)("No published versions on GitHub", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
      let I, b = "", S = "";
      const w = async (_) => {
        b = (0, i.getChannelFilename)(_), S = (0, i.newUrlFromBase)(this.getBaseDownloadPath(String(D), b), this.baseUrl);
        const U = this.createRequestOptions(S);
        try {
          return await this.executor.request(U, m);
        } catch (x) {
          throw x instanceof e.HttpError && x.statusCode === 404 ? (0, e.newError)(`Cannot find ${b} in the latest release artifacts (${S}): ${x.stack || x.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : x;
        }
      };
      try {
        let _ = this.channel;
        this.updater.allowPrerelease && (!((E = t.prerelease(D)) === null || E === void 0) && E[0]) && (_ = this.getCustomChannelName(String((y = t.prerelease(D)) === null || y === void 0 ? void 0 : y[0]))), I = await w(_);
      } catch (_) {
        if (this.updater.allowPrerelease)
          I = await w(this.getDefaultChannelName());
        else
          throw _;
      }
      const C = (0, s.parseUpdateInfo)(I, b, S);
      return C.releaseName == null && (C.releaseName = N.elementValueOrEmpty("title")), C.releaseNotes == null && (C.releaseNotes = h(this.updater.currentVersion, this.updater.fullChangelog, A, N)), {
        tag: D,
        ...C
      };
    }
    async getLatestTagName(l) {
      const u = this.options, p = u.host == null || u.host === "github.com" ? (0, i.newUrlFromBase)(`${this.basePath}/latest`, this.baseUrl) : new r.URL(`${this.computeGithubBasePath(`/repos/${u.owner}/${u.repo}/releases`)}/latest`, this.baseApiUrl);
      try {
        const E = await this.httpRequest(p, { Accept: "application/json" }, l);
        return E == null ? null : JSON.parse(E).tag_name;
      } catch (E) {
        throw (0, e.newError)(`Unable to find latest version on GitHub (${p}), please ensure a production release exists: ${E.stack || E.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    get basePath() {
      return `/${this.options.owner}/${this.options.repo}/releases`;
    }
    resolveFiles(l) {
      return (0, s.resolveFiles)(l, this.baseUrl, (u) => this.getBaseDownloadPath(l.tag, u.replace(/ /g, "-")));
    }
    getBaseDownloadPath(l, u) {
      return `${this.basePath}/download/${l}/${u}`;
    }
  };
  Ct.GitHubProvider = f;
  function o(d) {
    const l = d.elementValueOrEmpty("content");
    return l === "No content." ? "" : l;
  }
  function h(d, l, u, p) {
    if (!l)
      return o(p);
    const E = [];
    for (const y of u.getElements("entry")) {
      const m = /\/tag\/v?([^/]+)$/.exec(y.element("link").attribute("href"))[1];
      t.valid(m) && t.lt(d, m) && E.push({
        version: m,
        note: o(y)
      });
    }
    return E.sort((y, m) => t.rcompare(y.version, m.version));
  }
  return Ct;
}
var pr = {}, kl;
function Mf() {
  if (kl) return pr;
  kl = 1, Object.defineProperty(pr, "__esModule", { value: !0 }), pr.GitLabProvider = void 0;
  const e = He(), t = Nt, r = Yc(), i = Gt(), s = it();
  let a = class extends s.Provider {
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
    normalizeFilename(f) {
      return f.replace(/ |_/g, "-");
    }
    constructor(f, o, h) {
      super({
        ...h,
        // GitLab might not support multiple range requests efficiently
        isUseMultipleRangeRequest: !1
      }), this.options = f, this.updater = o, this.cachedLatestVersion = null;
      const l = f.host || "gitlab.com";
      this.baseApiUrl = (0, i.newBaseUrl)(`https://${l}/api/v4`);
    }
    get channel() {
      const f = this.updater.channel || this.options.channel;
      return f == null ? this.getDefaultChannelName() : this.getCustomChannelName(f);
    }
    async getLatestVersion() {
      const f = new e.CancellationToken(), o = (0, i.newUrlFromBase)(`projects/${this.options.projectId}/releases/permalink/latest`, this.baseApiUrl);
      let h;
      try {
        const A = { "Content-Type": "application/json", ...this.setAuthHeaderForToken(this.options.token || null) }, N = await this.httpRequest(o, A, f);
        if (!N)
          throw (0, e.newError)("No latest release found", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
        h = JSON.parse(N);
      } catch (A) {
        throw (0, e.newError)(`Unable to find latest release on GitLab (${o}): ${A.stack || A.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
      const d = h.tag_name;
      let l = null, u = "", p = null;
      const E = async (A) => {
        u = (0, i.getChannelFilename)(A);
        const N = h.assets.links.find((I) => I.name === u);
        if (!N)
          throw (0, e.newError)(`Cannot find ${u} in the latest release assets`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
        p = new t.URL(N.direct_asset_url);
        const D = this.options.token ? { "PRIVATE-TOKEN": this.options.token } : void 0;
        try {
          const I = await this.httpRequest(p, D, f);
          if (!I)
            throw (0, e.newError)(`Empty response from ${p}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
          return I;
        } catch (I) {
          throw I instanceof e.HttpError && I.statusCode === 404 ? (0, e.newError)(`Cannot find ${u} in the latest release artifacts (${p}): ${I.stack || I.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : I;
        }
      };
      try {
        l = await E(this.channel);
      } catch (A) {
        if (this.channel !== this.getDefaultChannelName())
          l = await E(this.getDefaultChannelName());
        else
          throw A;
      }
      if (!l)
        throw (0, e.newError)(`Unable to parse channel data from ${u}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
      const y = (0, s.parseUpdateInfo)(l, u, p);
      y.releaseName == null && (y.releaseName = h.name), y.releaseNotes == null && (y.releaseNotes = h.description || null);
      const m = /* @__PURE__ */ new Map();
      for (const A of h.assets.links)
        m.set(this.normalizeFilename(A.name), A.direct_asset_url);
      const T = {
        tag: d,
        assets: m,
        ...y
      };
      return this.cachedLatestVersion = T, T;
    }
    /**
     * Utility function to convert GitlabReleaseAsset to Map<string, string>
     * Maps asset names to their download URLs
     */
    convertAssetsToMap(f) {
      const o = /* @__PURE__ */ new Map();
      for (const h of f.links)
        o.set(this.normalizeFilename(h.name), h.direct_asset_url);
      return o;
    }
    /**
     * Find blockmap file URL in assets map for a specific filename
     */
    findBlockMapInAssets(f, o) {
      const h = [`${o}.blockmap`, `${this.normalizeFilename(o)}.blockmap`];
      for (const d of h) {
        const l = f.get(d);
        if (l)
          return new t.URL(l);
      }
      return null;
    }
    async fetchReleaseInfoByVersion(f) {
      const o = new e.CancellationToken(), h = [`v${f}`, f];
      for (const d of h) {
        const l = (0, i.newUrlFromBase)(`projects/${this.options.projectId}/releases/${encodeURIComponent(d)}`, this.baseApiUrl);
        try {
          const u = { "Content-Type": "application/json", ...this.setAuthHeaderForToken(this.options.token || null) }, p = await this.httpRequest(l, u, o);
          if (p)
            return JSON.parse(p);
        } catch (u) {
          if (u instanceof e.HttpError && u.statusCode === 404)
            continue;
          throw (0, e.newError)(`Unable to find release ${d} on GitLab (${l}): ${u.stack || u.message}`, "ERR_UPDATER_RELEASE_NOT_FOUND");
        }
      }
      throw (0, e.newError)(`Unable to find release with version ${f} (tried: ${h.join(", ")}) on GitLab`, "ERR_UPDATER_RELEASE_NOT_FOUND");
    }
    setAuthHeaderForToken(f) {
      const o = {};
      return f != null && (f.startsWith("Bearer") ? o.authorization = f : o["PRIVATE-TOKEN"] = f), o;
    }
    /**
     * Get version info for blockmap files, using cache when possible
     */
    async getVersionInfoForBlockMap(f) {
      if (this.cachedLatestVersion && this.cachedLatestVersion.version === f)
        return this.cachedLatestVersion.assets;
      const o = await this.fetchReleaseInfoByVersion(f);
      return o && o.assets ? this.convertAssetsToMap(o.assets) : null;
    }
    /**
     * Find blockmap URLs from version assets
     */
    async findBlockMapUrlsFromAssets(f, o, h) {
      let d = null, l = null;
      const u = await this.getVersionInfoForBlockMap(o);
      u && (d = this.findBlockMapInAssets(u, h));
      const p = await this.getVersionInfoForBlockMap(f);
      if (p) {
        const E = h.replace(new RegExp(r(o), "g"), f);
        l = this.findBlockMapInAssets(p, E);
      }
      return [l, d];
    }
    async getBlockMapFiles(f, o, h, d = null) {
      if (this.options.uploadTarget === "project_upload") {
        const l = f.pathname.split("/").pop() || "", [u, p] = await this.findBlockMapUrlsFromAssets(o, h, l);
        if (!p)
          throw (0, e.newError)(`Cannot find blockmap file for ${h} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
        if (!u)
          throw (0, e.newError)(`Cannot find blockmap file for ${o} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
        return [u, p];
      } else
        return super.getBlockMapFiles(f, o, h, d);
    }
    resolveFiles(f) {
      return (0, s.getFileList)(f).map((o) => {
        const d = [
          o.url,
          // Original filename
          this.normalizeFilename(o.url)
          // Normalized filename (spaces/underscores → dashes)
        ].find((u) => f.assets.has(u)), l = d ? f.assets.get(d) : void 0;
        if (!l)
          throw (0, e.newError)(`Cannot find asset "${o.url}" in GitLab release assets. Available assets: ${Array.from(f.assets.keys()).join(", ")}`, "ERR_UPDATER_ASSET_NOT_FOUND");
        return {
          url: new t.URL(l),
          info: o
        };
      });
    }
    toString() {
      return `GitLab (projectId: ${this.options.projectId}, channel: ${this.channel})`;
    }
  };
  return pr.GitLabProvider = a, pr;
}
var mr = {}, $l;
function qf() {
  if ($l) return mr;
  $l = 1, Object.defineProperty(mr, "__esModule", { value: !0 }), mr.KeygenProvider = void 0;
  const e = He(), t = Gt(), r = it();
  let i = class extends r.Provider {
    constructor(a, n, f) {
      super({
        ...f,
        isUseMultipleRangeRequest: !1
      }), this.configuration = a, this.updater = n, this.defaultHostname = "api.keygen.sh";
      const o = this.configuration.host || this.defaultHostname;
      this.baseUrl = (0, t.newBaseUrl)(`https://${o}/v1/accounts/${this.configuration.account}/artifacts?product=${this.configuration.product}`);
    }
    get channel() {
      return this.updater.channel || this.configuration.channel || "stable";
    }
    async getLatestVersion() {
      const a = new e.CancellationToken(), n = (0, t.getChannelFilename)(this.getCustomChannelName(this.channel)), f = (0, t.newUrlFromBase)(n, this.baseUrl, this.updater.isAddNoCacheQuery);
      try {
        const o = await this.httpRequest(f, {
          Accept: "application/vnd.api+json",
          "Keygen-Version": "1.1"
        }, a);
        return (0, r.parseUpdateInfo)(o, n, f);
      } catch (o) {
        throw (0, e.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${o.stack || o.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    resolveFiles(a) {
      return (0, r.resolveFiles)(a, this.baseUrl);
    }
    toString() {
      const { account: a, product: n, platform: f } = this.configuration;
      return `Keygen (account: ${a}, product: ${n}, platform: ${f}, channel: ${this.channel})`;
    }
  };
  return mr.KeygenProvider = i, mr;
}
var gr = {}, Ml;
function Bf() {
  if (Ml) return gr;
  Ml = 1, Object.defineProperty(gr, "__esModule", { value: !0 }), gr.PrivateGitHubProvider = void 0;
  const e = He(), t = Uo(), r = Le, i = Nt, s = Gt(), a = Xc(), n = it();
  let f = class extends a.BaseGitHubProvider {
    constructor(h, d, l, u) {
      super(h, "api.github.com", u), this.updater = d, this.token = l;
    }
    createRequestOptions(h, d) {
      const l = super.createRequestOptions(h, d);
      return l.redirect = "manual", l;
    }
    async getLatestVersion() {
      const h = new e.CancellationToken(), d = (0, s.getChannelFilename)(this.getDefaultChannelName()), l = await this.getLatestVersionInfo(h), u = l.assets.find((y) => y.name === d);
      if (u == null)
        throw (0, e.newError)(`Cannot find ${d} in the release ${l.html_url || l.name}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
      const p = new i.URL(u.url);
      let E;
      try {
        E = (0, t.load)(await this.httpRequest(p, this.configureHeaders("application/octet-stream"), h));
      } catch (y) {
        throw y instanceof e.HttpError && y.statusCode === 404 ? (0, e.newError)(`Cannot find ${d} in the latest release artifacts (${p}): ${y.stack || y.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : y;
      }
      return E.assets = l.assets, E;
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
      const d = this.updater.allowPrerelease;
      let l = this.basePath;
      d || (l = `${l}/latest`);
      const u = (0, s.newUrlFromBase)(l, this.baseUrl);
      try {
        const p = JSON.parse(await this.httpRequest(u, this.configureHeaders("application/vnd.github.v3+json"), h));
        return d ? p.find((E) => E.prerelease) || p[0] : p;
      } catch (p) {
        throw (0, e.newError)(`Unable to find latest version on GitHub (${u}), please ensure a production release exists: ${p.stack || p.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    get basePath() {
      return this.computeGithubBasePath(`/repos/${this.options.owner}/${this.options.repo}/releases`);
    }
    resolveFiles(h) {
      return (0, n.getFileList)(h).map((d) => {
        const l = r.posix.basename(d.url).replace(/ /g, "-"), u = h.assets.find((p) => p != null && p.name === l);
        if (u == null)
          throw (0, e.newError)(`Cannot find asset "${l}" in: ${JSON.stringify(h.assets, null, 2)}`, "ERR_UPDATER_ASSET_NOT_FOUND");
        return {
          url: new i.URL(u.url),
          info: d
        };
      });
    }
  };
  return gr.PrivateGitHubProvider = f, gr;
}
var ql;
function Hf() {
  if (ql) return fr;
  ql = 1, Object.defineProperty(fr, "__esModule", { value: !0 }), fr.isUrlProbablySupportMultiRangeRequests = f, fr.createClient = o;
  const e = He(), t = $f(), r = zc(), i = Xc(), s = Mf(), a = qf(), n = Bf();
  function f(h) {
    return !h.includes("s3.amazonaws.com");
  }
  function o(h, d, l) {
    if (typeof h == "string")
      throw (0, e.newError)("Please pass PublishConfiguration object", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
    const u = h.provider;
    switch (u) {
      case "github": {
        const p = h, E = (p.private ? process.env.GH_TOKEN || process.env.GITHUB_TOKEN : null) || p.token;
        return E == null ? new i.GitHubProvider(p, d, l) : new n.PrivateGitHubProvider(p, d, E, l);
      }
      case "bitbucket":
        return new t.BitbucketProvider(h, d, l);
      case "gitlab":
        return new s.GitLabProvider(h, d, l);
      case "keygen":
        return new a.KeygenProvider(h, d, l);
      case "s3":
      case "spaces":
        return new r.GenericProvider({
          provider: "generic",
          url: (0, e.getS3LikeProviderBaseUrl)(h),
          channel: h.channel || null
        }, d, {
          ...l,
          // https://github.com/minio/minio/issues/5285#issuecomment-350428955
          isUseMultipleRangeRequest: !1
        });
      case "generic": {
        const p = h;
        return new r.GenericProvider(p, d, {
          ...l,
          isUseMultipleRangeRequest: p.useMultipleRangeRequest !== !1 && f(p.url)
        });
      }
      case "custom": {
        const p = h, E = p.updateProvider;
        if (!E)
          throw (0, e.newError)("Custom provider not specified", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
        return new E(p, d, l);
      }
      default:
        throw (0, e.newError)(`Unsupported provider: ${u}`, "ERR_UPDATER_UNSUPPORTED_PROVIDER");
    }
  }
  return fr;
}
var Er = {}, yr = {}, Qt = {}, Zt = {}, Bl;
function jo() {
  if (Bl) return Zt;
  Bl = 1, Object.defineProperty(Zt, "__esModule", { value: !0 }), Zt.OperationKind = void 0, Zt.computeOperations = t;
  var e;
  (function(n) {
    n[n.COPY = 0] = "COPY", n[n.DOWNLOAD = 1] = "DOWNLOAD";
  })(e || (Zt.OperationKind = e = {}));
  function t(n, f, o) {
    const h = a(n.files), d = a(f.files);
    let l = null;
    const u = f.files[0], p = [], E = u.name, y = h.get(E);
    if (y == null)
      throw new Error(`no file ${E} in old blockmap`);
    const m = d.get(E);
    let T = 0;
    const { checksumToOffset: A, checksumToOldSize: N } = s(h.get(E), y.offset, o);
    let D = u.offset;
    for (let I = 0; I < m.checksums.length; D += m.sizes[I], I++) {
      const b = m.sizes[I], S = m.checksums[I];
      let w = A.get(S);
      w != null && N.get(S) !== b && (o.warn(`Checksum ("${S}") matches, but size differs (old: ${N.get(S)}, new: ${b})`), w = void 0), w === void 0 ? (T++, l != null && l.kind === e.DOWNLOAD && l.end === D ? l.end += b : (l = {
        kind: e.DOWNLOAD,
        start: D,
        end: D + b
        // oldBlocks: null,
      }, i(l, p, S, I))) : l != null && l.kind === e.COPY && l.end === w ? l.end += b : (l = {
        kind: e.COPY,
        start: w,
        end: w + b
        // oldBlocks: [checksum]
      }, i(l, p, S, I));
    }
    return T > 0 && o.info(`File${u.name === "file" ? "" : " " + u.name} has ${T} changed blocks`), p;
  }
  const r = process.env.DIFFERENTIAL_DOWNLOAD_PLAN_BUILDER_VALIDATE_RANGES === "true";
  function i(n, f, o, h) {
    if (r && f.length !== 0) {
      const d = f[f.length - 1];
      if (d.kind === n.kind && n.start < d.end && n.start > d.start) {
        const l = [d.start, d.end, n.start, n.end].reduce((u, p) => u < p ? u : p);
        throw new Error(`operation (block index: ${h}, checksum: ${o}, kind: ${e[n.kind]}) overlaps previous operation (checksum: ${o}):
abs: ${d.start} until ${d.end} and ${n.start} until ${n.end}
rel: ${d.start - l} until ${d.end - l} and ${n.start - l} until ${n.end - l}`);
      }
    }
    f.push(n);
  }
  function s(n, f, o) {
    const h = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map();
    let l = f;
    for (let u = 0; u < n.checksums.length; u++) {
      const p = n.checksums[u], E = n.sizes[u], y = d.get(p);
      if (y === void 0)
        h.set(p, l), d.set(p, E);
      else if (o.debug != null) {
        const m = y === E ? "(same size)" : `(size: ${y}, this size: ${E})`;
        o.debug(`${p} duplicated in blockmap ${m}, it doesn't lead to broken differential downloader, just corresponding block will be skipped)`);
      }
      l += E;
    }
    return { checksumToOffset: h, checksumToOldSize: d };
  }
  function a(n) {
    const f = /* @__PURE__ */ new Map();
    for (const o of n)
      f.set(o.name, o);
    return f;
  }
  return Zt;
}
var Hl;
function Kc() {
  if (Hl) return Qt;
  Hl = 1, Object.defineProperty(Qt, "__esModule", { value: !0 }), Qt.DataSplitter = void 0, Qt.copyData = n;
  const e = He(), t = At, r = Dr, i = jo(), s = Buffer.from(`\r
\r
`);
  var a;
  (function(o) {
    o[o.INIT = 0] = "INIT", o[o.HEADER = 1] = "HEADER", o[o.BODY = 2] = "BODY";
  })(a || (a = {}));
  function n(o, h, d, l, u) {
    const p = (0, t.createReadStream)("", {
      fd: d,
      autoClose: !1,
      start: o.start,
      // end is inclusive
      end: o.end - 1
    });
    p.on("error", l), p.once("end", u), p.pipe(h, {
      end: !1
    });
  }
  let f = class extends r.Writable {
    constructor(h, d, l, u, p, E, y, m) {
      super(), this.out = h, this.options = d, this.partIndexToTaskIndex = l, this.partIndexToLength = p, this.finishHandler = E, this.grandTotalBytes = y, this.onProgress = m, this.start = Date.now(), this.nextUpdate = this.start + 1e3, this.transferred = 0, this.delta = 0, this.partIndex = -1, this.headerListBuffer = null, this.readState = a.INIT, this.ignoreByteCount = 0, this.remainingPartDataCount = 0, this.actualPartLength = 0, this.boundaryLength = u.length + 4, this.ignoreByteCount = this.boundaryLength - 2;
    }
    get isFinished() {
      return this.partIndex === this.partIndexToLength.length;
    }
    // noinspection JSUnusedGlobalSymbols
    _write(h, d, l) {
      if (this.isFinished) {
        console.error(`Trailing ignored data: ${h.length} bytes`);
        return;
      }
      this.handleData(h).then(() => {
        if (this.onProgress) {
          const u = Date.now();
          (u >= this.nextUpdate || this.transferred === this.grandTotalBytes) && this.grandTotalBytes && (u - this.start) / 1e3 && (this.nextUpdate = u + 1e3, this.onProgress({
            total: this.grandTotalBytes,
            delta: this.delta,
            transferred: this.transferred,
            percent: this.transferred / this.grandTotalBytes * 100,
            bytesPerSecond: Math.round(this.transferred / ((u - this.start) / 1e3))
          }), this.delta = 0);
        }
        l();
      }).catch(l);
    }
    async handleData(h) {
      let d = 0;
      if (this.ignoreByteCount !== 0 && this.remainingPartDataCount !== 0)
        throw (0, e.newError)("Internal error", "ERR_DATA_SPLITTER_BYTE_COUNT_MISMATCH");
      if (this.ignoreByteCount > 0) {
        const l = Math.min(this.ignoreByteCount, h.length);
        this.ignoreByteCount -= l, d = l;
      } else if (this.remainingPartDataCount > 0) {
        const l = Math.min(this.remainingPartDataCount, h.length);
        this.remainingPartDataCount -= l, await this.processPartData(h, 0, l), d = l;
      }
      if (d !== h.length) {
        if (this.readState === a.HEADER) {
          const l = this.searchHeaderListEnd(h, d);
          if (l === -1)
            return;
          d = l, this.readState = a.BODY, this.headerListBuffer = null;
        }
        for (; ; ) {
          if (this.readState === a.BODY)
            this.readState = a.INIT;
          else {
            this.partIndex++;
            let E = this.partIndexToTaskIndex.get(this.partIndex);
            if (E == null)
              if (this.isFinished)
                E = this.options.end;
              else
                throw (0, e.newError)("taskIndex is null", "ERR_DATA_SPLITTER_TASK_INDEX_IS_NULL");
            const y = this.partIndex === 0 ? this.options.start : this.partIndexToTaskIndex.get(this.partIndex - 1) + 1;
            if (y < E)
              await this.copyExistingData(y, E);
            else if (y > E)
              throw (0, e.newError)("prevTaskIndex must be < taskIndex", "ERR_DATA_SPLITTER_TASK_INDEX_ASSERT_FAILED");
            if (this.isFinished) {
              this.onPartEnd(), this.finishHandler();
              return;
            }
            if (d = this.searchHeaderListEnd(h, d), d === -1) {
              this.readState = a.HEADER;
              return;
            }
          }
          const l = this.partIndexToLength[this.partIndex], u = d + l, p = Math.min(u, h.length);
          if (await this.processPartStarted(h, d, p), this.remainingPartDataCount = l - (p - d), this.remainingPartDataCount > 0)
            return;
          if (d = u + this.boundaryLength, d >= h.length) {
            this.ignoreByteCount = this.boundaryLength - (h.length - u);
            return;
          }
        }
      }
    }
    copyExistingData(h, d) {
      return new Promise((l, u) => {
        const p = () => {
          if (h === d) {
            l();
            return;
          }
          const E = this.options.tasks[h];
          if (E.kind !== i.OperationKind.COPY) {
            u(new Error("Task kind must be COPY"));
            return;
          }
          n(E, this.out, this.options.oldFileFd, u, () => {
            h++, p();
          });
        };
        p();
      });
    }
    searchHeaderListEnd(h, d) {
      const l = h.indexOf(s, d);
      if (l !== -1)
        return l + s.length;
      const u = d === 0 ? h : h.slice(d);
      return this.headerListBuffer == null ? this.headerListBuffer = u : this.headerListBuffer = Buffer.concat([this.headerListBuffer, u]), -1;
    }
    onPartEnd() {
      const h = this.partIndexToLength[this.partIndex - 1];
      if (this.actualPartLength !== h)
        throw (0, e.newError)(`Expected length: ${h} differs from actual: ${this.actualPartLength}`, "ERR_DATA_SPLITTER_LENGTH_MISMATCH");
      this.actualPartLength = 0;
    }
    processPartStarted(h, d, l) {
      return this.partIndex !== 0 && this.onPartEnd(), this.processPartData(h, d, l);
    }
    processPartData(h, d, l) {
      this.actualPartLength += l - d, this.transferred += l - d, this.delta += l - d;
      const u = this.out;
      return u.write(d === 0 && h.length === l ? h : h.slice(d, l)) ? Promise.resolve() : new Promise((p, E) => {
        u.on("error", E), u.once("drain", () => {
          u.removeListener("error", E), p();
        });
      });
    }
  };
  return Qt.DataSplitter = f, Qt;
}
var vr = {}, jl;
function jf() {
  if (jl) return vr;
  jl = 1, Object.defineProperty(vr, "__esModule", { value: !0 }), vr.executeTasksUsingMultipleRangeRequests = i, vr.checkIsRangesSupported = a;
  const e = He(), t = Kc(), r = jo();
  function i(n, f, o, h, d) {
    const l = (u) => {
      if (u >= f.length) {
        n.fileMetadataBuffer != null && o.write(n.fileMetadataBuffer), o.end();
        return;
      }
      const p = u + 1e3;
      s(n, {
        tasks: f,
        start: u,
        end: Math.min(f.length, p),
        oldFileFd: h
      }, o, () => l(p), d);
    };
    return l;
  }
  function s(n, f, o, h, d) {
    let l = "bytes=", u = 0, p = 0;
    const E = /* @__PURE__ */ new Map(), y = [];
    for (let A = f.start; A < f.end; A++) {
      const N = f.tasks[A];
      N.kind === r.OperationKind.DOWNLOAD && (l += `${N.start}-${N.end - 1}, `, E.set(u, A), u++, y.push(N.end - N.start), p += N.end - N.start);
    }
    if (u <= 1) {
      const A = (N) => {
        if (N >= f.end) {
          h();
          return;
        }
        const D = f.tasks[N++];
        if (D.kind === r.OperationKind.COPY)
          (0, t.copyData)(D, o, f.oldFileFd, d, () => A(N));
        else {
          const I = n.createRequestOptions();
          I.headers.Range = `bytes=${D.start}-${D.end - 1}`;
          const b = n.httpExecutor.createRequest(I, (S) => {
            S.on("error", d), a(S, d) && (S.pipe(o, {
              end: !1
            }), S.once("end", () => A(N)));
          });
          n.httpExecutor.addErrorAndTimeoutHandlers(b, d), b.end();
        }
      };
      A(f.start);
      return;
    }
    const m = n.createRequestOptions();
    m.headers.Range = l.substring(0, l.length - 2);
    const T = n.httpExecutor.createRequest(m, (A) => {
      if (!a(A, d))
        return;
      const N = (0, e.safeGetHeader)(A, "content-type"), D = /^multipart\/.+?\s*;\s*boundary=(?:"([^"]+)"|([^\s";]+))\s*$/i.exec(N);
      if (D == null) {
        d(new Error(`Content-Type "multipart/byteranges" is expected, but got "${N}"`));
        return;
      }
      const I = new t.DataSplitter(o, f, E, D[1] || D[2], y, h, p, n.options.onProgress);
      I.on("error", d), A.pipe(I), A.on("end", () => {
        setTimeout(() => {
          T.abort(), d(new Error("Response ends without calling any handlers"));
        }, 1e4);
      });
    });
    n.httpExecutor.addErrorAndTimeoutHandlers(T, d), T.end();
  }
  function a(n, f) {
    if (n.statusCode >= 400)
      return f((0, e.createHttpError)(n)), !1;
    if (n.statusCode !== 206) {
      const o = (0, e.safeGetHeader)(n, "accept-ranges");
      if (o == null || o === "none")
        return f(new Error(`Server doesn't support Accept-Ranges (response code ${n.statusCode})`)), !1;
    }
    return !0;
  }
  return vr;
}
var wr = {}, Gl;
function Gf() {
  if (Gl) return wr;
  Gl = 1, Object.defineProperty(wr, "__esModule", { value: !0 }), wr.ProgressDifferentialDownloadCallbackTransform = void 0;
  const e = Dr;
  var t;
  (function(i) {
    i[i.COPY = 0] = "COPY", i[i.DOWNLOAD = 1] = "DOWNLOAD";
  })(t || (t = {}));
  let r = class extends e.Transform {
    constructor(s, a, n) {
      super(), this.progressDifferentialDownloadInfo = s, this.cancellationToken = a, this.onProgress = n, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.expectedBytes = 0, this.index = 0, this.operationType = t.COPY, this.nextUpdate = this.start + 1e3;
    }
    _transform(s, a, n) {
      if (this.cancellationToken.cancelled) {
        n(new Error("cancelled"), null);
        return;
      }
      if (this.operationType == t.COPY) {
        n(null, s);
        return;
      }
      this.transferred += s.length, this.delta += s.length;
      const f = Date.now();
      f >= this.nextUpdate && this.transferred !== this.expectedBytes && this.transferred !== this.progressDifferentialDownloadInfo.grandTotal && (this.nextUpdate = f + 1e3, this.onProgress({
        total: this.progressDifferentialDownloadInfo.grandTotal,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
        bytesPerSecond: Math.round(this.transferred / ((f - this.start) / 1e3))
      }), this.delta = 0), n(null, s);
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
    _flush(s) {
      if (this.cancellationToken.cancelled) {
        s(new Error("cancelled"));
        return;
      }
      this.onProgress({
        total: this.progressDifferentialDownloadInfo.grandTotal,
        delta: this.delta,
        transferred: this.transferred,
        percent: 100,
        bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
      }), this.delta = 0, this.transferred = 0, s(null);
    }
  };
  return wr.ProgressDifferentialDownloadCallbackTransform = r, wr;
}
var Wl;
function Jc() {
  if (Wl) return yr;
  Wl = 1, Object.defineProperty(yr, "__esModule", { value: !0 }), yr.DifferentialDownloader = void 0;
  const e = He(), t = /* @__PURE__ */ Ot(), r = At, i = Kc(), s = Nt, a = jo(), n = jf(), f = Gf();
  let o = class {
    // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
    constructor(u, p, E) {
      this.blockAwareFileInfo = u, this.httpExecutor = p, this.options = E, this.fileMetadataBuffer = null, this.logger = E.logger;
    }
    createRequestOptions() {
      const u = {
        headers: {
          ...this.options.requestHeaders,
          accept: "*/*"
        }
      };
      return (0, e.configureRequestUrl)(this.options.newUrl, u), (0, e.configureRequestOptions)(u), u;
    }
    doDownload(u, p) {
      if (u.version !== p.version)
        throw new Error(`version is different (${u.version} - ${p.version}), full download is required`);
      const E = this.logger, y = (0, a.computeOperations)(u, p, E);
      E.debug != null && E.debug(JSON.stringify(y, null, 2));
      let m = 0, T = 0;
      for (const N of y) {
        const D = N.end - N.start;
        N.kind === a.OperationKind.DOWNLOAD ? m += D : T += D;
      }
      const A = this.blockAwareFileInfo.size;
      if (m + T + (this.fileMetadataBuffer == null ? 0 : this.fileMetadataBuffer.length) !== A)
        throw new Error(`Internal error, size mismatch: downloadSize: ${m}, copySize: ${T}, newSize: ${A}`);
      return E.info(`Full: ${h(A)}, To download: ${h(m)} (${Math.round(m / (A / 100))}%)`), this.downloadFile(y);
    }
    downloadFile(u) {
      const p = [], E = () => Promise.all(p.map((y) => (0, t.close)(y.descriptor).catch((m) => {
        this.logger.error(`cannot close file "${y.path}": ${m}`);
      })));
      return this.doDownloadFile(u, p).then(E).catch((y) => E().catch((m) => {
        try {
          this.logger.error(`cannot close files: ${m}`);
        } catch (T) {
          try {
            console.error(T);
          } catch {
          }
        }
        throw y;
      }).then(() => {
        throw y;
      }));
    }
    async doDownloadFile(u, p) {
      const E = await (0, t.open)(this.options.oldFile, "r");
      p.push({ descriptor: E, path: this.options.oldFile });
      const y = await (0, t.open)(this.options.newFile, "w");
      p.push({ descriptor: y, path: this.options.newFile });
      const m = (0, r.createWriteStream)(this.options.newFile, { fd: y });
      await new Promise((T, A) => {
        const N = [];
        let D;
        if (!this.options.isUseMultipleRangeRequest && this.options.onProgress) {
          const x = [];
          let $ = 0;
          for (const L of u)
            L.kind === a.OperationKind.DOWNLOAD && (x.push(L.end - L.start), $ += L.end - L.start);
          const F = {
            expectedByteCounts: x,
            grandTotal: $
          };
          D = new f.ProgressDifferentialDownloadCallbackTransform(F, this.options.cancellationToken, this.options.onProgress), N.push(D);
        }
        const I = new e.DigestTransform(this.blockAwareFileInfo.sha512);
        I.isValidateOnEnd = !1, N.push(I), m.on("finish", () => {
          m.close(() => {
            p.splice(1, 1);
            try {
              I.validate();
            } catch (x) {
              A(x);
              return;
            }
            T(void 0);
          });
        }), N.push(m);
        let b = null;
        for (const x of N)
          x.on("error", A), b == null ? b = x : b = b.pipe(x);
        const S = N[0];
        let w;
        if (this.options.isUseMultipleRangeRequest) {
          w = (0, n.executeTasksUsingMultipleRangeRequests)(this, u, S, E, A), w(0);
          return;
        }
        let C = 0, _ = null;
        this.logger.info(`Differential download: ${this.options.newUrl}`);
        const U = this.createRequestOptions();
        U.redirect = "manual", w = (x) => {
          var $, F;
          if (x >= u.length) {
            this.fileMetadataBuffer != null && S.write(this.fileMetadataBuffer), S.end();
            return;
          }
          const L = u[x++];
          if (L.kind === a.OperationKind.COPY) {
            D && D.beginFileCopy(), (0, i.copyData)(L, S, E, A, () => w(x));
            return;
          }
          const j = `bytes=${L.start}-${L.end - 1}`;
          U.headers.range = j, (F = ($ = this.logger) === null || $ === void 0 ? void 0 : $.debug) === null || F === void 0 || F.call($, `download range: ${j}`), D && D.beginRangeDownload();
          const k = this.httpExecutor.createRequest(U, (G) => {
            G.on("error", A), G.on("aborted", () => {
              A(new Error("response has been aborted by the server"));
            }), G.statusCode >= 400 && A((0, e.createHttpError)(G)), G.pipe(S, {
              end: !1
            }), G.once("end", () => {
              D && D.endRangeDownload(), ++C === 100 ? (C = 0, setTimeout(() => w(x), 1e3)) : w(x);
            });
          });
          k.on("redirect", (G, Y, ee) => {
            this.logger.info(`Redirect to ${d(ee)}`), _ = ee, (0, e.configureRequestUrl)(new s.URL(_), U), k.followRedirect();
          }), this.httpExecutor.addErrorAndTimeoutHandlers(k, A), k.end();
        }, w(0);
      });
    }
    async readRemoteBytes(u, p) {
      const E = Buffer.allocUnsafe(p + 1 - u), y = this.createRequestOptions();
      y.headers.range = `bytes=${u}-${p}`;
      let m = 0;
      if (await this.request(y, (T) => {
        T.copy(E, m), m += T.length;
      }), m !== E.length)
        throw new Error(`Received data length ${m} is not equal to expected ${E.length}`);
      return E;
    }
    request(u, p) {
      return new Promise((E, y) => {
        const m = this.httpExecutor.createRequest(u, (T) => {
          (0, n.checkIsRangesSupported)(T, y) && (T.on("error", y), T.on("aborted", () => {
            y(new Error("response has been aborted by the server"));
          }), T.on("data", p), T.on("end", () => E()));
        });
        this.httpExecutor.addErrorAndTimeoutHandlers(m, y), m.end();
      });
    }
  };
  yr.DifferentialDownloader = o;
  function h(l, u = " KB") {
    return new Intl.NumberFormat("en").format((l / 1024).toFixed(2)) + u;
  }
  function d(l) {
    const u = l.indexOf("?");
    return u < 0 ? l : l.substring(0, u);
  }
  return yr;
}
var Vl;
function Wf() {
  if (Vl) return Er;
  Vl = 1, Object.defineProperty(Er, "__esModule", { value: !0 }), Er.GenericDifferentialDownloader = void 0;
  const e = Jc();
  let t = class extends e.DifferentialDownloader {
    download(i, s) {
      return this.doDownload(i, s);
    }
  };
  return Er.GenericDifferentialDownloader = t, Er;
}
var wo = {}, Yl;
function Wt() {
  return Yl || (Yl = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.UpdaterSignal = e.UPDATE_DOWNLOADED = e.DOWNLOAD_PROGRESS = e.CancellationToken = void 0, e.addHandler = i;
    const t = He();
    Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
      return t.CancellationToken;
    } }), e.DOWNLOAD_PROGRESS = "download-progress", e.UPDATE_DOWNLOADED = "update-downloaded";
    class r {
      constructor(a) {
        this.emitter = a;
      }
      /**
       * Emitted when an authenticating proxy is [asking for user credentials](https://github.com/electron/electron/blob/master/docs/api/client-request.md#event-login).
       */
      login(a) {
        i(this.emitter, "login", a);
      }
      progress(a) {
        i(this.emitter, e.DOWNLOAD_PROGRESS, a);
      }
      updateDownloaded(a) {
        i(this.emitter, e.UPDATE_DOWNLOADED, a);
      }
      updateCancelled(a) {
        i(this.emitter, "update-cancelled", a);
      }
    }
    e.UpdaterSignal = r;
    function i(s, a, n) {
      s.on(a, n);
    }
  })(wo)), wo;
}
var zl;
function Go() {
  if (zl) return Mt;
  zl = 1, Object.defineProperty(Mt, "__esModule", { value: !0 }), Mt.NoOpLogger = Mt.AppUpdater = void 0;
  const e = He(), t = dt, r = Pr, i = yc, s = /* @__PURE__ */ Ot(), a = Uo(), n = lf(), f = Le, o = Vc(), h = Lf(), d = Uf(), l = kf(), u = zc(), p = Hf(), E = wc, y = Wf(), m = Wt();
  let T = class Qc extends i.EventEmitter {
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
    set channel(I) {
      if (this._channel != null) {
        if (typeof I != "string")
          throw (0, e.newError)(`Channel must be a string, but got: ${I}`, "ERR_UPDATER_INVALID_CHANNEL");
        if (I.length === 0)
          throw (0, e.newError)("Channel must be not an empty string", "ERR_UPDATER_INVALID_CHANNEL");
      }
      this._channel = I, this.allowDowngrade = !0;
    }
    /**
     *  Shortcut for explicitly adding auth tokens to request headers
     */
    addAuthHeader(I) {
      this.requestHeaders = Object.assign({}, this.requestHeaders, {
        authorization: I
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
    set logger(I) {
      this._logger = I ?? new N();
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * test only
     * @private
     */
    set updateConfigPath(I) {
      this.clientPromise = null, this._appUpdateConfigPath = I, this.configOnDisk = new n.Lazy(() => this.loadUpdateConfig());
    }
    /**
     * Allows developer to override default logic for determining if an update is supported.
     * The default logic compares the `UpdateInfo` minimum system version against the `os.release()` with `semver` package
     */
    get isUpdateSupported() {
      return this._isUpdateSupported;
    }
    set isUpdateSupported(I) {
      I && (this._isUpdateSupported = I);
    }
    /**
     * Allows developer to override default logic for determining if the user is below the rollout threshold.
     * The default logic compares the staging percentage with numerical representation of user ID.
     * An override can define custom logic, or bypass it if needed.
     */
    get isUserWithinRollout() {
      return this._isUserWithinRollout;
    }
    set isUserWithinRollout(I) {
      I && (this._isUserWithinRollout = I);
    }
    constructor(I, b) {
      super(), this.autoDownload = !0, this.autoInstallOnAppQuit = !0, this.autoRunAppAfterInstall = !0, this.allowPrerelease = !1, this.fullChangelog = !1, this.allowDowngrade = !1, this.disableWebInstaller = !1, this.disableDifferentialDownload = !1, this.forceDevUpdateConfig = !1, this.previousBlockmapBaseUrlOverride = null, this._channel = null, this.downloadedUpdateHelper = null, this.requestHeaders = null, this._logger = console, this.signals = new m.UpdaterSignal(this), this._appUpdateConfigPath = null, this._isUpdateSupported = (C) => this.checkIfUpdateSupported(C), this._isUserWithinRollout = (C) => this.isStagingMatch(C), this.clientPromise = null, this.stagingUserIdPromise = new n.Lazy(() => this.getOrCreateStagingUserId()), this.configOnDisk = new n.Lazy(() => this.loadUpdateConfig()), this.checkForUpdatesPromise = null, this.downloadPromise = null, this.updateInfoAndProvider = null, this._testOnlyOptions = null, this.on("error", (C) => {
        this._logger.error(`Error: ${C.stack || C.message}`);
      }), b == null ? (this.app = new d.ElectronAppAdapter(), this.httpExecutor = new l.ElectronHttpExecutor((C, _) => this.emit("login", C, _))) : (this.app = b, this.httpExecutor = null);
      const S = this.app.version, w = (0, o.parse)(S);
      if (w == null)
        throw (0, e.newError)(`App version is not a valid semver version: "${S}"`, "ERR_UPDATER_INVALID_VERSION");
      this.currentVersion = w, this.allowPrerelease = A(w), I != null && (this.setFeedURL(I), typeof I != "string" && I.requestHeaders && (this.requestHeaders = I.requestHeaders));
    }
    //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    getFeedURL() {
      return "Deprecated. Do not use it.";
    }
    /**
     * Configure update provider. If value is `string`, [GenericServerOptions](./publish.md#genericserveroptions) will be set with value as `url`.
     * @param options If you want to override configuration in the `app-update.yml`.
     */
    setFeedURL(I) {
      const b = this.createProviderRuntimeOptions();
      let S;
      typeof I == "string" ? S = new u.GenericProvider({ provider: "generic", url: I }, this, {
        ...b,
        isUseMultipleRangeRequest: (0, p.isUrlProbablySupportMultiRangeRequests)(I)
      }) : S = (0, p.createClient)(I, this, b), this.clientPromise = Promise.resolve(S);
    }
    /**
     * Asks the server whether there is an update.
     * @returns null if the updater is disabled, otherwise info about the latest version
     */
    checkForUpdates() {
      if (!this.isUpdaterActive())
        return Promise.resolve(null);
      let I = this.checkForUpdatesPromise;
      if (I != null)
        return this._logger.info("Checking for update (already in progress)"), I;
      const b = () => this.checkForUpdatesPromise = null;
      return this._logger.info("Checking for update"), I = this.doCheckForUpdates().then((S) => (b(), S)).catch((S) => {
        throw b(), this.emit("error", S, `Cannot check for updates: ${(S.stack || S).toString()}`), S;
      }), this.checkForUpdatesPromise = I, I;
    }
    isUpdaterActive() {
      return this.app.isPackaged || this.forceDevUpdateConfig ? !0 : (this._logger.info("Skip checkForUpdates because application is not packed and dev update config is not forced"), !1);
    }
    // noinspection JSUnusedGlobalSymbols
    checkForUpdatesAndNotify(I) {
      return this.checkForUpdates().then((b) => b?.downloadPromise ? (b.downloadPromise.then(() => {
        const S = Qc.formatDownloadNotification(b.updateInfo.version, this.app.name, I);
        new Ht.Notification(S).show();
      }), b) : (this._logger.debug != null && this._logger.debug("checkForUpdatesAndNotify called, downloadPromise is null"), b));
    }
    static formatDownloadNotification(I, b, S) {
      return S == null && (S = {
        title: "A new update is ready to install",
        body: "{appName} version {version} has been downloaded and will be automatically installed on exit"
      }), S = {
        title: S.title.replace("{appName}", b).replace("{version}", I),
        body: S.body.replace("{appName}", b).replace("{version}", I)
      }, S;
    }
    async isStagingMatch(I) {
      const b = I.stagingPercentage;
      let S = b;
      if (S == null)
        return !0;
      if (S = parseInt(S, 10), isNaN(S))
        return this._logger.warn(`Staging percentage is NaN: ${b}`), !0;
      S = S / 100;
      const w = await this.stagingUserIdPromise.value, _ = e.UUID.parse(w).readUInt32BE(12) / 4294967295;
      return this._logger.info(`Staging percentage: ${S}, percentage: ${_}, user id: ${w}`), _ < S;
    }
    computeFinalHeaders(I) {
      return this.requestHeaders != null && Object.assign(I, this.requestHeaders), I;
    }
    async isUpdateAvailable(I) {
      const b = (0, o.parse)(I.version);
      if (b == null)
        throw (0, e.newError)(`This file could not be downloaded, or the latest version (from update server) does not have a valid semver version: "${I.version}"`, "ERR_UPDATER_INVALID_VERSION");
      const S = this.currentVersion;
      if ((0, o.eq)(b, S) || !await Promise.resolve(this.isUpdateSupported(I)) || !await Promise.resolve(this.isUserWithinRollout(I)))
        return !1;
      const C = (0, o.gt)(b, S), _ = (0, o.lt)(b, S);
      return C ? !0 : this.allowDowngrade && _;
    }
    checkIfUpdateSupported(I) {
      const b = I?.minimumSystemVersion, S = (0, r.release)();
      if (b)
        try {
          if ((0, o.lt)(S, b))
            return this._logger.info(`Current OS version ${S} is less than the minimum OS version required ${b} for version ${S}`), !1;
        } catch (w) {
          this._logger.warn(`Failed to compare current OS version(${S}) with minimum OS version(${b}): ${(w.message || w).toString()}`);
        }
      return !0;
    }
    async getUpdateInfoAndProvider() {
      await this.app.whenReady(), this.clientPromise == null && (this.clientPromise = this.configOnDisk.value.then((S) => (0, p.createClient)(S, this, this.createProviderRuntimeOptions())));
      const I = await this.clientPromise, b = await this.stagingUserIdPromise.value;
      return I.setRequestHeaders(this.computeFinalHeaders({ "x-user-staging-id": b })), {
        info: await I.getLatestVersion(),
        provider: I
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
      const I = await this.getUpdateInfoAndProvider(), b = I.info;
      if (!await this.isUpdateAvailable(b))
        return this._logger.info(`Update for version ${this.currentVersion.format()} is not available (latest version: ${b.version}, downgrade is ${this.allowDowngrade ? "allowed" : "disallowed"}).`), this.emit("update-not-available", b), {
          isUpdateAvailable: !1,
          versionInfo: b,
          updateInfo: b
        };
      this.updateInfoAndProvider = I, this.onUpdateAvailable(b);
      const S = new e.CancellationToken();
      return {
        isUpdateAvailable: !0,
        versionInfo: b,
        updateInfo: b,
        cancellationToken: S,
        downloadPromise: this.autoDownload ? this.downloadUpdate(S) : null
      };
    }
    onUpdateAvailable(I) {
      this._logger.info(`Found version ${I.version} (url: ${(0, e.asArray)(I.files).map((b) => b.url).join(", ")})`), this.emit("update-available", I);
    }
    /**
     * Start downloading update manually. You can use this method if `autoDownload` option is set to `false`.
     * @returns {Promise<Array<string>>} Paths to downloaded files.
     */
    downloadUpdate(I = new e.CancellationToken()) {
      const b = this.updateInfoAndProvider;
      if (b == null) {
        const w = new Error("Please check update first");
        return this.dispatchError(w), Promise.reject(w);
      }
      if (this.downloadPromise != null)
        return this._logger.info("Downloading update (already in progress)"), this.downloadPromise;
      this._logger.info(`Downloading update from ${(0, e.asArray)(b.info.files).map((w) => w.url).join(", ")}`);
      const S = (w) => {
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
        cancellationToken: I,
        disableWebInstaller: this.disableWebInstaller,
        disableDifferentialDownload: this.disableDifferentialDownload
      }).catch((w) => {
        throw S(w);
      }).finally(() => {
        this.downloadPromise = null;
      }), this.downloadPromise;
    }
    dispatchError(I) {
      this.emit("error", I, (I.stack || I).toString());
    }
    dispatchUpdateDownloaded(I) {
      this.emit(m.UPDATE_DOWNLOADED, I);
    }
    async loadUpdateConfig() {
      return this._appUpdateConfigPath == null && (this._appUpdateConfigPath = this.app.appUpdateConfigPath), (0, a.load)(await (0, s.readFile)(this._appUpdateConfigPath, "utf-8"));
    }
    computeRequestHeaders(I) {
      const b = I.fileExtraDownloadHeaders;
      if (b != null) {
        const S = this.requestHeaders;
        return S == null ? b : {
          ...b,
          ...S
        };
      }
      return this.computeFinalHeaders({ accept: "*/*" });
    }
    async getOrCreateStagingUserId() {
      const I = f.join(this.app.userDataPath, ".updaterId");
      try {
        const S = await (0, s.readFile)(I, "utf-8");
        if (e.UUID.check(S))
          return S;
        this._logger.warn(`Staging user id file exists, but content was invalid: ${S}`);
      } catch (S) {
        S.code !== "ENOENT" && this._logger.warn(`Couldn't read staging user ID, creating a blank one: ${S}`);
      }
      const b = e.UUID.v5((0, t.randomBytes)(4096), e.UUID.OID);
      this._logger.info(`Generated new staging user ID: ${b}`);
      try {
        await (0, s.outputFile)(I, b);
      } catch (S) {
        this._logger.warn(`Couldn't write out staging user ID: ${S}`);
      }
      return b;
    }
    /** @internal */
    get isAddNoCacheQuery() {
      const I = this.requestHeaders;
      if (I == null)
        return !0;
      for (const b of Object.keys(I)) {
        const S = b.toLowerCase();
        if (S === "authorization" || S === "private-token")
          return !1;
      }
      return !0;
    }
    async getOrCreateDownloadHelper() {
      let I = this.downloadedUpdateHelper;
      if (I == null) {
        const b = (await this.configOnDisk.value).updaterCacheDirName, S = this._logger;
        b == null && S.error("updaterCacheDirName is not specified in app-update.yml Was app build using at least electron-builder 20.34.0?");
        const w = f.join(this.app.baseCachePath, b || this.app.name);
        S.debug != null && S.debug(`updater cache dir: ${w}`), I = new h.DownloadedUpdateHelper(w), this.downloadedUpdateHelper = I;
      }
      return I;
    }
    async executeDownload(I) {
      const b = I.fileInfo, S = {
        headers: I.downloadUpdateOptions.requestHeaders,
        cancellationToken: I.downloadUpdateOptions.cancellationToken,
        sha2: b.info.sha2,
        sha512: b.info.sha512
      };
      this.listenerCount(m.DOWNLOAD_PROGRESS) > 0 && (S.onProgress = (Z) => this.emit(m.DOWNLOAD_PROGRESS, Z));
      const w = I.downloadUpdateOptions.updateInfoAndProvider.info, C = w.version, _ = b.packageInfo;
      function U() {
        const Z = decodeURIComponent(I.fileInfo.url.pathname);
        return Z.toLowerCase().endsWith(`.${I.fileExtension.toLowerCase()}`) ? f.basename(Z) : I.fileInfo.info.url;
      }
      const x = await this.getOrCreateDownloadHelper(), $ = x.cacheDirForPendingUpdate;
      await (0, s.mkdir)($, { recursive: !0 });
      const F = U();
      let L = f.join($, F);
      const j = _ == null ? null : f.join($, `package-${C}${f.extname(_.path) || ".7z"}`), k = async (Z) => {
        await x.setDownloadedFile(L, j, w, b, F, Z), await I.done({
          ...w,
          downloadedFile: L
        });
        const ye = f.join($, "current.blockmap");
        return await (0, s.pathExists)(ye) && await (0, s.copyFile)(ye, f.join(x.cacheDir, "current.blockmap")), j == null ? [L] : [L, j];
      }, G = this._logger, Y = await x.validateDownloadedPath(L, w, b, G);
      if (Y != null)
        return L = Y, await k(!1);
      const ee = async () => (await x.clear().catch(() => {
      }), await (0, s.unlink)(L).catch(() => {
      })), pe = await (0, h.createTempUpdateFile)(`temp-${F}`, $, G);
      try {
        await I.task(pe, S, j, ee), await (0, e.retry)(() => (0, s.rename)(pe, L), {
          retries: 60,
          interval: 500,
          shouldRetry: (Z) => Z instanceof Error && /^EBUSY:/.test(Z.message) ? !0 : (G.warn(`Cannot rename temp file to final file: ${Z.message || Z.stack}`), !1)
        });
      } catch (Z) {
        throw await ee(), Z instanceof e.CancellationError && (G.info("cancelled"), this.emit("update-cancelled", w)), Z;
      }
      return G.info(`New version ${C} has been downloaded to ${L}`), await k(!0);
    }
    async differentialDownloadInstaller(I, b, S, w, C) {
      try {
        if (this._testOnlyOptions != null && !this._testOnlyOptions.isUseDifferentialDownload)
          return !0;
        const _ = b.updateInfoAndProvider.provider, U = await _.getBlockMapFiles(I.url, this.app.version, b.updateInfoAndProvider.info.version, this.previousBlockmapBaseUrlOverride);
        this._logger.info(`Download block maps (old: "${U[0]}", new: ${U[1]})`);
        const x = async (G) => {
          const Y = await this.httpExecutor.downloadToBuffer(G, {
            headers: b.requestHeaders,
            cancellationToken: b.cancellationToken
          });
          if (Y == null || Y.length === 0)
            throw new Error(`Blockmap "${G.href}" is empty`);
          try {
            return JSON.parse((0, E.gunzipSync)(Y).toString());
          } catch (ee) {
            throw new Error(`Cannot parse blockmap "${G.href}", error: ${ee}`);
          }
        }, $ = {
          newUrl: I.url,
          oldFile: f.join(this.downloadedUpdateHelper.cacheDir, C),
          logger: this._logger,
          newFile: S,
          isUseMultipleRangeRequest: _.isUseMultipleRangeRequest,
          requestHeaders: b.requestHeaders,
          cancellationToken: b.cancellationToken
        };
        this.listenerCount(m.DOWNLOAD_PROGRESS) > 0 && ($.onProgress = (G) => this.emit(m.DOWNLOAD_PROGRESS, G));
        const F = async (G, Y) => {
          const ee = f.join(Y, "current.blockmap");
          await (0, s.outputFile)(ee, (0, E.gzipSync)(JSON.stringify(G)));
        }, L = async (G) => {
          const Y = f.join(G, "current.blockmap");
          try {
            if (await (0, s.pathExists)(Y))
              return JSON.parse((0, E.gunzipSync)(await (0, s.readFile)(Y)).toString());
          } catch (ee) {
            this._logger.warn(`Cannot parse blockmap "${Y}", error: ${ee}`);
          }
          return null;
        }, j = await x(U[1]);
        await F(j, this.downloadedUpdateHelper.cacheDirForPendingUpdate);
        let k = await L(this.downloadedUpdateHelper.cacheDir);
        return k == null && (k = await x(U[0])), await new y.GenericDifferentialDownloader(I.info, this.httpExecutor, $).download(k, j), !1;
      } catch (_) {
        if (this._logger.error(`Cannot download differentially, fallback to full download: ${_.stack || _}`), this._testOnlyOptions != null)
          throw _;
        return !0;
      }
    }
  };
  Mt.AppUpdater = T;
  function A(D) {
    const I = (0, o.prerelease)(D);
    return I != null && I.length > 0;
  }
  class N {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    info(I) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    warn(I) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error(I) {
    }
  }
  return Mt.NoOpLogger = N, Mt;
}
var Xl;
function pn() {
  if (Xl) return ar;
  Xl = 1, Object.defineProperty(ar, "__esModule", { value: !0 }), ar.BaseUpdater = void 0;
  const e = an, t = Go();
  let r = class extends t.AppUpdater {
    constructor(s, a) {
      super(s, a), this.quitAndInstallCalled = !1, this.quitHandlerAdded = !1;
    }
    quitAndInstall(s = !1, a = !1) {
      this._logger.info("Install on explicit quitAndInstall"), this.install(s, s ? a : this.autoRunAppAfterInstall) ? setImmediate(() => {
        Ht.autoUpdater.emit("before-quit-for-update"), this.app.quit();
      }) : this.quitAndInstallCalled = !1;
    }
    executeDownload(s) {
      return super.executeDownload({
        ...s,
        done: (a) => (this.dispatchUpdateDownloaded(a), this.addQuitHandler(), Promise.resolve())
      });
    }
    get installerPath() {
      return this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.file;
    }
    // must be sync (because quit even handler is not async)
    install(s = !1, a = !1) {
      if (this.quitAndInstallCalled)
        return this._logger.warn("install call ignored: quitAndInstallCalled is set to true"), !1;
      const n = this.downloadedUpdateHelper, f = this.installerPath, o = n == null ? null : n.downloadedFileInfo;
      if (f == null || o == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      this.quitAndInstallCalled = !0;
      try {
        return this._logger.info(`Install: isSilent: ${s}, isForceRunAfter: ${a}`), this.doInstall({
          isSilent: s,
          isForceRunAfter: a,
          isAdminRightsRequired: o.isAdminRightsRequired
        });
      } catch (h) {
        return this.dispatchError(h), !1;
      }
    }
    addQuitHandler() {
      this.quitHandlerAdded || !this.autoInstallOnAppQuit || (this.quitHandlerAdded = !0, this.app.onQuit((s) => {
        if (this.quitAndInstallCalled) {
          this._logger.info("Update installer has already been triggered. Quitting application.");
          return;
        }
        if (!this.autoInstallOnAppQuit) {
          this._logger.info("Update will not be installed on quit because autoInstallOnAppQuit is set to false.");
          return;
        }
        if (s !== 0) {
          this._logger.info(`Update will be not installed on quit because application is quitting with exit code ${s}`);
          return;
        }
        this._logger.info("Auto install update on quit"), this.install(!0, !1);
      }));
    }
    spawnSyncLog(s, a = [], n = {}) {
      this._logger.info(`Executing: ${s} with args: ${a}`);
      const f = (0, e.spawnSync)(s, a, {
        env: { ...process.env, ...n },
        encoding: "utf-8",
        shell: !0
      }), { error: o, status: h, stdout: d, stderr: l } = f;
      if (o != null)
        throw this._logger.error(l), o;
      if (h != null && h !== 0)
        throw this._logger.error(l), new Error(`Command ${s} exited with code ${h}`);
      return d.trim();
    }
    /**
     * This handles both node 8 and node 10 way of emitting error when spawning a process
     *   - node 8: Throws the error
     *   - node 10: Emit the error(Need to listen with on)
     */
    // https://github.com/electron-userland/electron-builder/issues/1129
    // Node 8 sends errors: https://nodejs.org/dist/latest-v8.x/docs/api/errors.html#errors_common_system_errors
    async spawnLog(s, a = [], n = void 0, f = "ignore") {
      return this._logger.info(`Executing: ${s} with args: ${a}`), new Promise((o, h) => {
        try {
          const d = { stdio: f, env: n, detached: !0 }, l = (0, e.spawn)(s, a, d);
          l.on("error", (u) => {
            h(u);
          }), l.unref(), l.pid !== void 0 && o(!0);
        } catch (d) {
          h(d);
        }
      });
    }
  };
  return ar.BaseUpdater = r, ar;
}
var _r = {}, Tr = {}, Kl;
function Zc() {
  if (Kl) return Tr;
  Kl = 1, Object.defineProperty(Tr, "__esModule", { value: !0 }), Tr.FileWithEmbeddedBlockMapDifferentialDownloader = void 0;
  const e = /* @__PURE__ */ Ot(), t = Jc(), r = wc;
  let i = class extends t.DifferentialDownloader {
    async download() {
      const f = this.blockAwareFileInfo, o = f.size, h = o - (f.blockMapSize + 4);
      this.fileMetadataBuffer = await this.readRemoteBytes(h, o - 1);
      const d = s(this.fileMetadataBuffer.slice(0, this.fileMetadataBuffer.length - 4));
      await this.doDownload(await a(this.options.oldFile), d);
    }
  };
  Tr.FileWithEmbeddedBlockMapDifferentialDownloader = i;
  function s(n) {
    return JSON.parse((0, r.inflateRawSync)(n).toString());
  }
  async function a(n) {
    const f = await (0, e.open)(n, "r");
    try {
      const o = (await (0, e.fstat)(f)).size, h = Buffer.allocUnsafe(4);
      await (0, e.read)(f, h, 0, h.length, o - h.length);
      const d = Buffer.allocUnsafe(h.readUInt32BE(0));
      return await (0, e.read)(f, d, 0, d.length, o - h.length - d.length), await (0, e.close)(f), s(d);
    } catch (o) {
      throw await (0, e.close)(f), o;
    }
  }
  return Tr;
}
var Jl;
function Ql() {
  if (Jl) return _r;
  Jl = 1, Object.defineProperty(_r, "__esModule", { value: !0 }), _r.AppImageUpdater = void 0;
  const e = He(), t = an, r = /* @__PURE__ */ Ot(), i = At, s = Le, a = pn(), n = Zc(), f = it(), o = Wt();
  let h = class extends a.BaseUpdater {
    constructor(l, u) {
      super(l, u);
    }
    isUpdaterActive() {
      return process.env.APPIMAGE == null && !this.forceDevUpdateConfig ? (process.env.SNAP == null ? this._logger.warn("APPIMAGE env is not defined, current application is not an AppImage") : this._logger.info("SNAP env is defined, updater is disabled"), !1) : super.isUpdaterActive();
    }
    /*** @private */
    doDownloadUpdate(l) {
      const u = l.updateInfoAndProvider.provider, p = (0, f.findFile)(u.resolveFiles(l.updateInfoAndProvider.info), "AppImage", ["rpm", "deb", "pacman"]);
      return this.executeDownload({
        fileExtension: "AppImage",
        fileInfo: p,
        downloadUpdateOptions: l,
        task: async (E, y) => {
          const m = process.env.APPIMAGE;
          if (m == null)
            throw (0, e.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
          (l.disableDifferentialDownload || await this.downloadDifferential(p, m, E, u, l)) && await this.httpExecutor.download(p.url, E, y), await (0, r.chmod)(E, 493);
        }
      });
    }
    async downloadDifferential(l, u, p, E, y) {
      try {
        const m = {
          newUrl: l.url,
          oldFile: u,
          logger: this._logger,
          newFile: p,
          isUseMultipleRangeRequest: E.isUseMultipleRangeRequest,
          requestHeaders: y.requestHeaders,
          cancellationToken: y.cancellationToken
        };
        return this.listenerCount(o.DOWNLOAD_PROGRESS) > 0 && (m.onProgress = (T) => this.emit(o.DOWNLOAD_PROGRESS, T)), await new n.FileWithEmbeddedBlockMapDifferentialDownloader(l.info, this.httpExecutor, m).download(), !1;
      } catch (m) {
        return this._logger.error(`Cannot download differentially, fallback to full download: ${m.stack || m}`), process.platform === "linux";
      }
    }
    doInstall(l) {
      const u = process.env.APPIMAGE;
      if (u == null)
        throw (0, e.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
      (0, i.unlinkSync)(u);
      let p;
      const E = s.basename(u), y = this.installerPath;
      if (y == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      s.basename(y) === E || !/\d+\.\d+\.\d+/.test(E) ? p = u : p = s.join(s.dirname(u), s.basename(y)), (0, t.execFileSync)("mv", ["-f", y, p]), p !== u && this.emit("appimage-filename-updated", p);
      const m = {
        ...process.env,
        APPIMAGE_SILENT_INSTALL: "true"
      };
      return l.isForceRunAfter ? this.spawnLog(p, [], m) : (m.APPIMAGE_EXIT_AFTER_INSTALL = "true", (0, t.execFileSync)(p, [], { env: m })), !0;
    }
  };
  return _r.AppImageUpdater = h, _r;
}
var Ar = {}, Rr = {}, Zl;
function Wo() {
  if (Zl) return Rr;
  Zl = 1, Object.defineProperty(Rr, "__esModule", { value: !0 }), Rr.LinuxUpdater = void 0;
  const e = pn();
  let t = class extends e.BaseUpdater {
    constructor(i, s) {
      super(i, s);
    }
    /**
     * Returns true if the current process is running as root.
     */
    isRunningAsRoot() {
      var i;
      return ((i = process.getuid) === null || i === void 0 ? void 0 : i.call(process)) === 0;
    }
    /**
     * Sanitizies the installer path for using with command line tools.
     */
    get installerPath() {
      var i, s;
      return (s = (i = super.installerPath) === null || i === void 0 ? void 0 : i.replace(/\\/g, "\\\\").replace(/ /g, "\\ ")) !== null && s !== void 0 ? s : null;
    }
    runCommandWithSudoIfNeeded(i) {
      if (this.isRunningAsRoot())
        return this._logger.info("Running as root, no need to use sudo"), this.spawnSyncLog(i[0], i.slice(1));
      const { name: s } = this.app, a = `"${s} would like to update"`, n = this.sudoWithArgs(a);
      this._logger.info(`Running as non-root user, using sudo to install: ${n}`);
      let f = '"';
      return (/pkexec/i.test(n[0]) || n[0] === "sudo") && (f = ""), this.spawnSyncLog(n[0], [...n.length > 1 ? n.slice(1) : [], `${f}/bin/bash`, "-c", `'${i.join(" ")}'${f}`]);
    }
    sudoWithArgs(i) {
      const s = this.determineSudoCommand(), a = [s];
      return /kdesudo/i.test(s) ? (a.push("--comment", i), a.push("-c")) : /gksudo/i.test(s) ? a.push("--message", i) : /pkexec/i.test(s) && a.push("--disable-internal-agent"), a;
    }
    hasCommand(i) {
      try {
        return this.spawnSyncLog("command", ["-v", i]), !0;
      } catch {
        return !1;
      }
    }
    determineSudoCommand() {
      const i = ["gksudo", "kdesudo", "pkexec", "beesu"];
      for (const s of i)
        if (this.hasCommand(s))
          return s;
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
    detectPackageManager(i) {
      var s;
      const a = (s = process.env.ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER) === null || s === void 0 ? void 0 : s.trim();
      if (a)
        return a;
      for (const n of i)
        if (this.hasCommand(n))
          return n;
      return this._logger.warn(`No package manager found in the list: ${i.join(", ")}. Defaulting to the first one: ${i[0]}`), i[0];
    }
  };
  return Rr.LinuxUpdater = t, Rr;
}
var ec;
function tc() {
  if (ec) return Ar;
  ec = 1, Object.defineProperty(Ar, "__esModule", { value: !0 }), Ar.DebUpdater = void 0;
  const e = it(), t = Wt(), r = Wo();
  let i = class eu extends r.LinuxUpdater {
    constructor(a, n) {
      super(a, n);
    }
    /*** @private */
    doDownloadUpdate(a) {
      const n = a.updateInfoAndProvider.provider, f = (0, e.findFile)(n.resolveFiles(a.updateInfoAndProvider.info), "deb", ["AppImage", "rpm", "pacman"]);
      return this.executeDownload({
        fileExtension: "deb",
        fileInfo: f,
        downloadUpdateOptions: a,
        task: async (o, h) => {
          this.listenerCount(t.DOWNLOAD_PROGRESS) > 0 && (h.onProgress = (d) => this.emit(t.DOWNLOAD_PROGRESS, d)), await this.httpExecutor.download(f.url, o, h);
        }
      });
    }
    doInstall(a) {
      const n = this.installerPath;
      if (n == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      if (!this.hasCommand("dpkg") && !this.hasCommand("apt"))
        return this.dispatchError(new Error("Neither dpkg nor apt command found. Cannot install .deb package.")), !1;
      const f = ["dpkg", "apt"], o = this.detectPackageManager(f);
      try {
        eu.installWithCommandRunner(o, n, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
      } catch (h) {
        return this.dispatchError(h), !1;
      }
      return a.isForceRunAfter && this.app.relaunch(), !0;
    }
    static installWithCommandRunner(a, n, f, o) {
      var h;
      if (a === "dpkg")
        try {
          f(["dpkg", "-i", n]);
        } catch (d) {
          o.warn((h = d.message) !== null && h !== void 0 ? h : d), o.warn("dpkg installation failed, trying to fix broken dependencies with apt-get"), f(["apt-get", "install", "-f", "-y"]);
        }
      else if (a === "apt")
        o.warn("Using apt to install a local .deb. This may fail for unsigned packages unless properly configured."), f([
          "apt",
          "install",
          "-y",
          "--allow-unauthenticated",
          // needed for unsigned .debs
          "--allow-downgrades",
          // allow lower version installs
          "--allow-change-held-packages",
          n
        ]);
      else
        throw new Error(`Package manager ${a} not supported`);
    }
  };
  return Ar.DebUpdater = i, Ar;
}
var Sr = {}, rc;
function nc() {
  if (rc) return Sr;
  rc = 1, Object.defineProperty(Sr, "__esModule", { value: !0 }), Sr.PacmanUpdater = void 0;
  const e = Wt(), t = it(), r = Wo();
  let i = class tu extends r.LinuxUpdater {
    constructor(a, n) {
      super(a, n);
    }
    /*** @private */
    doDownloadUpdate(a) {
      const n = a.updateInfoAndProvider.provider, f = (0, t.findFile)(n.resolveFiles(a.updateInfoAndProvider.info), "pacman", ["AppImage", "deb", "rpm"]);
      return this.executeDownload({
        fileExtension: "pacman",
        fileInfo: f,
        downloadUpdateOptions: a,
        task: async (o, h) => {
          this.listenerCount(e.DOWNLOAD_PROGRESS) > 0 && (h.onProgress = (d) => this.emit(e.DOWNLOAD_PROGRESS, d)), await this.httpExecutor.download(f.url, o, h);
        }
      });
    }
    doInstall(a) {
      const n = this.installerPath;
      if (n == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      try {
        tu.installWithCommandRunner(n, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
      } catch (f) {
        return this.dispatchError(f), !1;
      }
      return a.isForceRunAfter && this.app.relaunch(), !0;
    }
    static installWithCommandRunner(a, n, f) {
      var o;
      try {
        n(["pacman", "-U", "--noconfirm", a]);
      } catch (h) {
        f.warn((o = h.message) !== null && o !== void 0 ? o : h), f.warn("pacman installation failed, attempting to update package database and retry");
        try {
          n(["pacman", "-Sy", "--noconfirm"]), n(["pacman", "-U", "--noconfirm", a]);
        } catch (d) {
          throw f.error("Retry after pacman -Sy failed"), d;
        }
      }
    }
  };
  return Sr.PacmanUpdater = i, Sr;
}
var Ir = {}, ic;
function oc() {
  if (ic) return Ir;
  ic = 1, Object.defineProperty(Ir, "__esModule", { value: !0 }), Ir.RpmUpdater = void 0;
  const e = Wt(), t = it(), r = Wo();
  let i = class ru extends r.LinuxUpdater {
    constructor(a, n) {
      super(a, n);
    }
    /*** @private */
    doDownloadUpdate(a) {
      const n = a.updateInfoAndProvider.provider, f = (0, t.findFile)(n.resolveFiles(a.updateInfoAndProvider.info), "rpm", ["AppImage", "deb", "pacman"]);
      return this.executeDownload({
        fileExtension: "rpm",
        fileInfo: f,
        downloadUpdateOptions: a,
        task: async (o, h) => {
          this.listenerCount(e.DOWNLOAD_PROGRESS) > 0 && (h.onProgress = (d) => this.emit(e.DOWNLOAD_PROGRESS, d)), await this.httpExecutor.download(f.url, o, h);
        }
      });
    }
    doInstall(a) {
      const n = this.installerPath;
      if (n == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      const f = ["zypper", "dnf", "yum", "rpm"], o = this.detectPackageManager(f);
      try {
        ru.installWithCommandRunner(o, n, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
      } catch (h) {
        return this.dispatchError(h), !1;
      }
      return a.isForceRunAfter && this.app.relaunch(), !0;
    }
    static installWithCommandRunner(a, n, f, o) {
      if (a === "zypper")
        return f(["zypper", "--non-interactive", "--no-refresh", "install", "--allow-unsigned-rpm", "-f", n]);
      if (a === "dnf")
        return f(["dnf", "install", "--nogpgcheck", "-y", n]);
      if (a === "yum")
        return f(["yum", "install", "--nogpgcheck", "-y", n]);
      if (a === "rpm")
        return o.warn("Installing with rpm only (no dependency resolution)."), f(["rpm", "-Uvh", "--replacepkgs", "--replacefiles", "--nodeps", n]);
      throw new Error(`Package manager ${a} not supported`);
    }
  };
  return Ir.RpmUpdater = i, Ir;
}
var br = {}, ac;
function sc() {
  if (ac) return br;
  ac = 1, Object.defineProperty(br, "__esModule", { value: !0 }), br.MacUpdater = void 0;
  const e = He(), t = /* @__PURE__ */ Ot(), r = At, i = Le, s = _c, a = Go(), n = it(), f = an, o = dt;
  let h = class extends a.AppUpdater {
    constructor(l, u) {
      super(l, u), this.nativeUpdater = Ht.autoUpdater, this.squirrelDownloadedUpdate = !1, this.nativeUpdater.on("error", (p) => {
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
      let u = l.updateInfoAndProvider.provider.resolveFiles(l.updateInfoAndProvider.info);
      const p = this._logger, E = "sysctl.proc_translated";
      let y = !1;
      try {
        this.debug("Checking for macOS Rosetta environment"), y = (0, f.execFileSync)("sysctl", [E], { encoding: "utf8" }).includes(`${E}: 1`), p.info(`Checked for macOS Rosetta environment (isRosetta=${y})`);
      } catch (I) {
        p.warn(`sysctl shell command to check for macOS Rosetta environment failed: ${I}`);
      }
      let m = !1;
      try {
        this.debug("Checking for arm64 in uname");
        const b = (0, f.execFileSync)("uname", ["-a"], { encoding: "utf8" }).includes("ARM");
        p.info(`Checked 'uname -a': arm64=${b}`), m = m || b;
      } catch (I) {
        p.warn(`uname shell command to check for arm64 failed: ${I}`);
      }
      m = m || process.arch === "arm64" || y;
      const T = (I) => {
        var b;
        return I.url.pathname.includes("arm64") || ((b = I.info.url) === null || b === void 0 ? void 0 : b.includes("arm64"));
      };
      m && u.some(T) ? u = u.filter((I) => m === T(I)) : u = u.filter((I) => !T(I));
      const A = (0, n.findFile)(u, "zip", ["pkg", "dmg"]);
      if (A == null)
        throw (0, e.newError)(`ZIP file not provided: ${(0, e.safeStringifyJson)(u)}`, "ERR_UPDATER_ZIP_FILE_NOT_FOUND");
      const N = l.updateInfoAndProvider.provider, D = "update.zip";
      return this.executeDownload({
        fileExtension: "zip",
        fileInfo: A,
        downloadUpdateOptions: l,
        task: async (I, b) => {
          const S = i.join(this.downloadedUpdateHelper.cacheDir, D), w = () => (0, t.pathExistsSync)(S) ? !l.disableDifferentialDownload : (p.info("Unable to locate previous update.zip for differential download (is this first install?), falling back to full download"), !1);
          let C = !0;
          w() && (C = await this.differentialDownloadInstaller(A, l, I, N, D)), C && await this.httpExecutor.download(A.url, I, b);
        },
        done: async (I) => {
          if (!l.disableDifferentialDownload)
            try {
              const b = i.join(this.downloadedUpdateHelper.cacheDir, D);
              await (0, t.copyFile)(I.downloadedFile, b);
            } catch (b) {
              this._logger.warn(`Unable to copy file for caching for future differential downloads: ${b.message}`);
            }
          return this.updateDownloaded(A, I);
        }
      });
    }
    async updateDownloaded(l, u) {
      var p;
      const E = u.downloadedFile, y = (p = l.info.size) !== null && p !== void 0 ? p : (await (0, t.stat)(E)).size, m = this._logger, T = `fileToProxy=${l.url.href}`;
      this.closeServerIfExists(), this.debug(`Creating proxy server for native Squirrel.Mac (${T})`), this.server = (0, s.createServer)(), this.debug(`Proxy server for native Squirrel.Mac is created (${T})`), this.server.on("close", () => {
        m.info(`Proxy server for native Squirrel.Mac is closed (${T})`);
      });
      const A = (N) => {
        const D = N.address();
        return typeof D == "string" ? D : `http://127.0.0.1:${D?.port}`;
      };
      return await new Promise((N, D) => {
        const I = (0, o.randomBytes)(64).toString("base64").replace(/\//g, "_").replace(/\+/g, "-"), b = Buffer.from(`autoupdater:${I}`, "ascii"), S = `/${(0, o.randomBytes)(64).toString("hex")}.zip`;
        this.server.on("request", (w, C) => {
          const _ = w.url;
          if (m.info(`${_} requested`), _ === "/") {
            if (!w.headers.authorization || w.headers.authorization.indexOf("Basic ") === -1) {
              C.statusCode = 401, C.statusMessage = "Invalid Authentication Credentials", C.end(), m.warn("No authenthication info");
              return;
            }
            const $ = w.headers.authorization.split(" ")[1], F = Buffer.from($, "base64").toString("ascii"), [L, j] = F.split(":");
            if (L !== "autoupdater" || j !== I) {
              C.statusCode = 401, C.statusMessage = "Invalid Authentication Credentials", C.end(), m.warn("Invalid authenthication credentials");
              return;
            }
            const k = Buffer.from(`{ "url": "${A(this.server)}${S}" }`);
            C.writeHead(200, { "Content-Type": "application/json", "Content-Length": k.length }), C.end(k);
            return;
          }
          if (!_.startsWith(S)) {
            m.warn(`${_} requested, but not supported`), C.writeHead(404), C.end();
            return;
          }
          m.info(`${S} requested by Squirrel.Mac, pipe ${E}`);
          let U = !1;
          C.on("finish", () => {
            U || (this.nativeUpdater.removeListener("error", D), N([]));
          });
          const x = (0, r.createReadStream)(E);
          x.on("error", ($) => {
            try {
              C.end();
            } catch (F) {
              m.warn(`cannot end response: ${F}`);
            }
            U = !0, this.nativeUpdater.removeListener("error", D), D(new Error(`Cannot pipe "${E}": ${$}`));
          }), C.writeHead(200, {
            "Content-Type": "application/zip",
            "Content-Length": y
          }), x.pipe(C);
        }), this.debug(`Proxy server for native Squirrel.Mac is starting to listen (${T})`), this.server.listen(0, "127.0.0.1", () => {
          this.debug(`Proxy server for native Squirrel.Mac is listening (address=${A(this.server)}, ${T})`), this.nativeUpdater.setFeedURL({
            url: A(this.server),
            headers: {
              "Cache-Control": "no-cache",
              Authorization: `Basic ${b.toString("base64")}`
            }
          }), this.dispatchUpdateDownloaded(u), this.autoInstallOnAppQuit ? (this.nativeUpdater.once("error", D), this.nativeUpdater.checkForUpdates()) : N([]);
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
  return br.MacUpdater = h, br;
}
var Cr = {}, rn = {}, lc;
function Vf() {
  if (lc) return rn;
  lc = 1, Object.defineProperty(rn, "__esModule", { value: !0 }), rn.verifySignature = a;
  const e = He(), t = an, r = Pr, i = Le;
  function s(h, d) {
    return ['set "PSModulePath=" & chcp 65001 >NUL & powershell.exe', ["-NoProfile", "-NonInteractive", "-InputFormat", "None", "-Command", h], {
      shell: !0,
      timeout: d
    }];
  }
  function a(h, d, l) {
    return new Promise((u, p) => {
      const E = d.replace(/'/g, "''");
      l.info(`Verifying signature ${E}`), (0, t.execFile)(...s(`"Get-AuthenticodeSignature -LiteralPath '${E}' | ConvertTo-Json -Compress"`, 20 * 1e3), (y, m, T) => {
        var A;
        try {
          if (y != null || T) {
            f(l, y, T, p), u(null);
            return;
          }
          const N = n(m);
          if (N.Status === 0) {
            try {
              const S = i.normalize(N.Path), w = i.normalize(d);
              if (l.info(`LiteralPath: ${S}. Update Path: ${w}`), S !== w) {
                f(l, new Error(`LiteralPath of ${S} is different than ${w}`), T, p), u(null);
                return;
              }
            } catch (S) {
              l.warn(`Unable to verify LiteralPath of update asset due to missing data.Path. Skipping this step of validation. Message: ${(A = S.message) !== null && A !== void 0 ? A : S.stack}`);
            }
            const I = (0, e.parseDn)(N.SignerCertificate.Subject);
            let b = !1;
            for (const S of h) {
              const w = (0, e.parseDn)(S);
              if (w.size ? b = Array.from(w.keys()).every((_) => w.get(_) === I.get(_)) : S === I.get("CN") && (l.warn(`Signature validated using only CN ${S}. Please add your full Distinguished Name (DN) to publisherNames configuration`), b = !0), b) {
                u(null);
                return;
              }
            }
          }
          const D = `publisherNames: ${h.join(" | ")}, raw info: ` + JSON.stringify(N, (I, b) => I === "RawData" ? void 0 : b, 2);
          l.warn(`Sign verification failed, installer signed with incorrect certificate: ${D}`), u(D);
        } catch (N) {
          f(l, N, null, p), u(null);
          return;
        }
      });
    });
  }
  function n(h) {
    const d = JSON.parse(h);
    delete d.PrivateKey, delete d.IsOSBinary, delete d.SignatureType;
    const l = d.SignerCertificate;
    return l != null && (delete l.Archived, delete l.Extensions, delete l.Handle, delete l.HasPrivateKey, delete l.SubjectName), d;
  }
  function f(h, d, l, u) {
    if (o()) {
      h.warn(`Cannot execute Get-AuthenticodeSignature: ${d || l}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
      return;
    }
    try {
      (0, t.execFileSync)(...s("ConvertTo-Json test", 10 * 1e3));
    } catch (p) {
      h.warn(`Cannot execute ConvertTo-Json: ${p.message}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
      return;
    }
    d != null && u(d), l && u(new Error(`Cannot execute Get-AuthenticodeSignature, stderr: ${l}. Failing signature validation due to unknown stderr.`));
  }
  function o() {
    const h = r.release();
    return h.startsWith("6.") && !h.startsWith("6.3");
  }
  return rn;
}
var cc;
function uc() {
  if (cc) return Cr;
  cc = 1, Object.defineProperty(Cr, "__esModule", { value: !0 }), Cr.NsisUpdater = void 0;
  const e = He(), t = Le, r = pn(), i = Zc(), s = Wt(), a = it(), n = /* @__PURE__ */ Ot(), f = Vf(), o = Nt;
  let h = class extends r.BaseUpdater {
    constructor(l, u) {
      super(l, u), this._verifyUpdateCodeSignature = (p, E) => (0, f.verifySignature)(p, E, this._logger);
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
      const u = l.updateInfoAndProvider.provider, p = (0, a.findFile)(u.resolveFiles(l.updateInfoAndProvider.info), "exe");
      return this.executeDownload({
        fileExtension: "exe",
        downloadUpdateOptions: l,
        fileInfo: p,
        task: async (E, y, m, T) => {
          const A = p.packageInfo, N = A != null && m != null;
          if (N && l.disableWebInstaller)
            throw (0, e.newError)(`Unable to download new version ${l.updateInfoAndProvider.info.version}. Web Installers are disabled`, "ERR_UPDATER_WEB_INSTALLER_DISABLED");
          !N && !l.disableWebInstaller && this._logger.warn("disableWebInstaller is set to false, you should set it to true if you do not plan on using a web installer. This will default to true in a future version."), (N || l.disableDifferentialDownload || await this.differentialDownloadInstaller(p, l, E, u, e.CURRENT_APP_INSTALLER_FILE_NAME)) && await this.httpExecutor.download(p.url, E, y);
          const D = await this.verifySignature(E);
          if (D != null)
            throw await T(), (0, e.newError)(`New version ${l.updateInfoAndProvider.info.version} is not signed by the application owner: ${D}`, "ERR_UPDATER_INVALID_SIGNATURE");
          if (N && await this.differentialDownloadWebPackage(l, A, m, u))
            try {
              await this.httpExecutor.download(new o.URL(A.path), m, {
                headers: l.requestHeaders,
                cancellationToken: l.cancellationToken,
                sha512: A.sha512
              });
            } catch (I) {
              try {
                await (0, n.unlink)(m);
              } catch {
              }
              throw I;
            }
        }
      });
    }
    // $certificateInfo = (Get-AuthenticodeSignature 'xxx\yyy.exe'
    // | where {$_.Status.Equals([System.Management.Automation.SignatureStatus]::Valid) -and $_.SignerCertificate.Subject.Contains("CN=siemens.com")})
    // | Out-String ; if ($certificateInfo) { exit 0 } else { exit 1 }
    async verifySignature(l) {
      let u;
      try {
        if (u = (await this.configOnDisk.value).publisherName, u == null)
          return null;
      } catch (p) {
        if (p.code === "ENOENT")
          return null;
        throw p;
      }
      return await this._verifyUpdateCodeSignature(Array.isArray(u) ? u : [u], l);
    }
    doInstall(l) {
      const u = this.installerPath;
      if (u == null)
        return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
      const p = ["--updated"];
      l.isSilent && p.push("/S"), l.isForceRunAfter && p.push("--force-run"), this.installDirectory && p.push(`/D=${this.installDirectory}`);
      const E = this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.packageFile;
      E != null && p.push(`--package-file=${E}`);
      const y = () => {
        this.spawnLog(t.join(process.resourcesPath, "elevate.exe"), [u].concat(p)).catch((m) => this.dispatchError(m));
      };
      return l.isAdminRightsRequired ? (this._logger.info("isAdminRightsRequired is set to true, run installer using elevate.exe"), y(), !0) : (this.spawnLog(u, p).catch((m) => {
        const T = m.code;
        this._logger.info(`Cannot run installer: error code: ${T}, error message: "${m.message}", will be executed again using elevate if EACCES, and will try to use electron.shell.openItem if ENOENT`), T === "UNKNOWN" || T === "EACCES" ? y() : T === "ENOENT" ? Ht.shell.openPath(u).catch((A) => this.dispatchError(A)) : this.dispatchError(m);
      }), !0);
    }
    async differentialDownloadWebPackage(l, u, p, E) {
      if (u.blockMapSize == null)
        return !0;
      try {
        const y = {
          newUrl: new o.URL(u.path),
          oldFile: t.join(this.downloadedUpdateHelper.cacheDir, e.CURRENT_APP_PACKAGE_FILE_NAME),
          logger: this._logger,
          newFile: p,
          requestHeaders: this.requestHeaders,
          isUseMultipleRangeRequest: E.isUseMultipleRangeRequest,
          cancellationToken: l.cancellationToken
        };
        this.listenerCount(s.DOWNLOAD_PROGRESS) > 0 && (y.onProgress = (m) => this.emit(s.DOWNLOAD_PROGRESS, m)), await new i.FileWithEmbeddedBlockMapDifferentialDownloader(u, this.httpExecutor, y).download();
      } catch (y) {
        return this._logger.error(`Cannot download differentially, fallback to full download: ${y.stack || y}`), process.platform === "win32";
      }
      return !1;
    }
  };
  return Cr.NsisUpdater = h, Cr;
}
var dc;
function Yf() {
  return dc || (dc = 1, (function(e) {
    var t = $t && $t.__createBinding || (Object.create ? (function(m, T, A, N) {
      N === void 0 && (N = A);
      var D = Object.getOwnPropertyDescriptor(T, A);
      (!D || ("get" in D ? !T.__esModule : D.writable || D.configurable)) && (D = { enumerable: !0, get: function() {
        return T[A];
      } }), Object.defineProperty(m, N, D);
    }) : (function(m, T, A, N) {
      N === void 0 && (N = A), m[N] = T[A];
    })), r = $t && $t.__exportStar || function(m, T) {
      for (var A in m) A !== "default" && !Object.prototype.hasOwnProperty.call(T, A) && t(T, m, A);
    };
    Object.defineProperty(e, "__esModule", { value: !0 }), e.NsisUpdater = e.MacUpdater = e.RpmUpdater = e.PacmanUpdater = e.DebUpdater = e.AppImageUpdater = e.Provider = e.NoOpLogger = e.AppUpdater = e.BaseUpdater = void 0;
    const i = /* @__PURE__ */ Ot(), s = Le;
    var a = pn();
    Object.defineProperty(e, "BaseUpdater", { enumerable: !0, get: function() {
      return a.BaseUpdater;
    } });
    var n = Go();
    Object.defineProperty(e, "AppUpdater", { enumerable: !0, get: function() {
      return n.AppUpdater;
    } }), Object.defineProperty(e, "NoOpLogger", { enumerable: !0, get: function() {
      return n.NoOpLogger;
    } });
    var f = it();
    Object.defineProperty(e, "Provider", { enumerable: !0, get: function() {
      return f.Provider;
    } });
    var o = Ql();
    Object.defineProperty(e, "AppImageUpdater", { enumerable: !0, get: function() {
      return o.AppImageUpdater;
    } });
    var h = tc();
    Object.defineProperty(e, "DebUpdater", { enumerable: !0, get: function() {
      return h.DebUpdater;
    } });
    var d = nc();
    Object.defineProperty(e, "PacmanUpdater", { enumerable: !0, get: function() {
      return d.PacmanUpdater;
    } });
    var l = oc();
    Object.defineProperty(e, "RpmUpdater", { enumerable: !0, get: function() {
      return l.RpmUpdater;
    } });
    var u = sc();
    Object.defineProperty(e, "MacUpdater", { enumerable: !0, get: function() {
      return u.MacUpdater;
    } });
    var p = uc();
    Object.defineProperty(e, "NsisUpdater", { enumerable: !0, get: function() {
      return p.NsisUpdater;
    } }), r(Wt(), e);
    let E;
    function y() {
      if (process.platform === "win32")
        E = new (uc()).NsisUpdater();
      else if (process.platform === "darwin")
        E = new (sc()).MacUpdater();
      else {
        E = new (Ql()).AppImageUpdater();
        try {
          const m = s.join(process.resourcesPath, "package-type");
          if (!(0, i.existsSync)(m))
            return E;
          switch ((0, i.readFileSync)(m).toString().trim()) {
            case "deb":
              E = new (tc()).DebUpdater();
              break;
            case "rpm":
              E = new (oc()).RpmUpdater();
              break;
            case "pacman":
              E = new (nc()).PacmanUpdater();
              break;
            default:
              break;
          }
        } catch (m) {
          console.warn("Unable to detect 'package-type' for autoUpdater (rpm/deb/pacman support). If you'd like to expand support, please consider contributing to electron-builder", m.message);
        }
      }
      return E;
    }
    Object.defineProperty(e, "autoUpdater", {
      enumerable: !0,
      get: () => E || y()
    });
  })($t)), $t;
}
var Dt = Yf(), pt = { exports: {} };
const zf = "16.6.1", Xf = {
  version: zf
};
var fc;
function Kf() {
  if (fc) return pt.exports;
  fc = 1;
  const e = At, t = Le, r = Pr, i = dt, a = Xf.version, n = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
  function f(b) {
    const S = {};
    let w = b.toString();
    w = w.replace(/\r\n?/mg, `
`);
    let C;
    for (; (C = n.exec(w)) != null; ) {
      const _ = C[1];
      let U = C[2] || "";
      U = U.trim();
      const x = U[0];
      U = U.replace(/^(['"`])([\s\S]*)\1$/mg, "$2"), x === '"' && (U = U.replace(/\\n/g, `
`), U = U.replace(/\\r/g, "\r")), S[_] = U;
    }
    return S;
  }
  function o(b) {
    b = b || {};
    const S = E(b);
    b.path = S;
    const w = I.configDotenv(b);
    if (!w.parsed) {
      const x = new Error(`MISSING_DATA: Cannot parse ${S} for an unknown reason`);
      throw x.code = "MISSING_DATA", x;
    }
    const C = u(b).split(","), _ = C.length;
    let U;
    for (let x = 0; x < _; x++)
      try {
        const $ = C[x].trim(), F = p(w, $);
        U = I.decrypt(F.ciphertext, F.key);
        break;
      } catch ($) {
        if (x + 1 >= _)
          throw $;
      }
    return I.parse(U);
  }
  function h(b) {
    console.log(`[dotenv@${a}][WARN] ${b}`);
  }
  function d(b) {
    console.log(`[dotenv@${a}][DEBUG] ${b}`);
  }
  function l(b) {
    console.log(`[dotenv@${a}] ${b}`);
  }
  function u(b) {
    return b && b.DOTENV_KEY && b.DOTENV_KEY.length > 0 ? b.DOTENV_KEY : process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0 ? process.env.DOTENV_KEY : "";
  }
  function p(b, S) {
    let w;
    try {
      w = new URL(S);
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
    const _ = w.searchParams.get("environment");
    if (!_) {
      const $ = new Error("INVALID_DOTENV_KEY: Missing environment part");
      throw $.code = "INVALID_DOTENV_KEY", $;
    }
    const U = `DOTENV_VAULT_${_.toUpperCase()}`, x = b.parsed[U];
    if (!x) {
      const $ = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${U} in your .env.vault file.`);
      throw $.code = "NOT_FOUND_DOTENV_ENVIRONMENT", $;
    }
    return { ciphertext: x, key: C };
  }
  function E(b) {
    let S = null;
    if (b && b.path && b.path.length > 0)
      if (Array.isArray(b.path))
        for (const w of b.path)
          e.existsSync(w) && (S = w.endsWith(".vault") ? w : `${w}.vault`);
      else
        S = b.path.endsWith(".vault") ? b.path : `${b.path}.vault`;
    else
      S = t.resolve(process.cwd(), ".env.vault");
    return e.existsSync(S) ? S : null;
  }
  function y(b) {
    return b[0] === "~" ? t.join(r.homedir(), b.slice(1)) : b;
  }
  function m(b) {
    const S = !!(b && b.debug), w = b && "quiet" in b ? b.quiet : !0;
    (S || !w) && l("Loading env from encrypted .env.vault");
    const C = I._parseVault(b);
    let _ = process.env;
    return b && b.processEnv != null && (_ = b.processEnv), I.populate(_, C, b), { parsed: C };
  }
  function T(b) {
    const S = t.resolve(process.cwd(), ".env");
    let w = "utf8";
    const C = !!(b && b.debug), _ = b && "quiet" in b ? b.quiet : !0;
    b && b.encoding ? w = b.encoding : C && d("No encoding is specified. UTF-8 is used by default");
    let U = [S];
    if (b && b.path)
      if (!Array.isArray(b.path))
        U = [y(b.path)];
      else {
        U = [];
        for (const L of b.path)
          U.push(y(L));
      }
    let x;
    const $ = {};
    for (const L of U)
      try {
        const j = I.parse(e.readFileSync(L, { encoding: w }));
        I.populate($, j, b);
      } catch (j) {
        C && d(`Failed to load ${L} ${j.message}`), x = j;
      }
    let F = process.env;
    if (b && b.processEnv != null && (F = b.processEnv), I.populate(F, $, b), C || !_) {
      const L = Object.keys($).length, j = [];
      for (const k of U)
        try {
          const G = t.relative(process.cwd(), k);
          j.push(G);
        } catch (G) {
          C && d(`Failed to load ${k} ${G.message}`), x = G;
        }
      l(`injecting env (${L}) from ${j.join(",")}`);
    }
    return x ? { parsed: $, error: x } : { parsed: $ };
  }
  function A(b) {
    if (u(b).length === 0)
      return I.configDotenv(b);
    const S = E(b);
    return S ? I._configVault(b) : (h(`You set DOTENV_KEY but you are missing a .env.vault file at ${S}. Did you forget to build it?`), I.configDotenv(b));
  }
  function N(b, S) {
    const w = Buffer.from(S.slice(-64), "hex");
    let C = Buffer.from(b, "base64");
    const _ = C.subarray(0, 12), U = C.subarray(-16);
    C = C.subarray(12, -16);
    try {
      const x = i.createDecipheriv("aes-256-gcm", w, _);
      return x.setAuthTag(U), `${x.update(C)}${x.final()}`;
    } catch (x) {
      const $ = x instanceof RangeError, F = x.message === "Invalid key length", L = x.message === "Unsupported state or unable to authenticate data";
      if ($ || F) {
        const j = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
        throw j.code = "INVALID_DOTENV_KEY", j;
      } else if (L) {
        const j = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
        throw j.code = "DECRYPTION_FAILED", j;
      } else
        throw x;
    }
  }
  function D(b, S, w = {}) {
    const C = !!(w && w.debug), _ = !!(w && w.override);
    if (typeof S != "object") {
      const U = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
      throw U.code = "OBJECT_REQUIRED", U;
    }
    for (const U of Object.keys(S))
      Object.prototype.hasOwnProperty.call(b, U) ? (_ === !0 && (b[U] = S[U]), C && d(_ === !0 ? `"${U}" is already defined and WAS overwritten` : `"${U}" is already defined and was NOT overwritten`)) : b[U] = S[U];
  }
  const I = {
    configDotenv: T,
    _configVault: m,
    _parseVault: o,
    config: A,
    decrypt: N,
    parse: f,
    populate: D
  };
  return pt.exports.configDotenv = I.configDotenv, pt.exports._configVault = I._configVault, pt.exports._parseVault = I._parseVault, pt.exports.config = I.config, pt.exports.decrypt = I.decrypt, pt.exports.parse = I.parse, pt.exports.populate = I.populate, pt.exports = I, pt.exports;
}
var Jf = Kf();
function nu(e) {
  try {
    const t = JSON.parse(e || "[]");
    return Array.isArray(t) ? t : [];
  } catch {
    return [];
  }
}
function Qf({
  bodyContent: e,
  hasAttachments: t,
  attachmentsJson: r
}) {
  return e?.trim() ? t ? nu(r).length > 0 : !0 : !1;
}
const Zf = on.default ?? on, { app: Xe, BrowserWindow: gt, ipcMain: Ee, shell: iu, safeStorage: rt, dialog: eh } = Zf;
Xe.isPackaged || Jf.config();
const th = vd(import.meta.url), nn = ct.dirname(th), ou = ct.join(Xe.getPath("userData"), "emails.db"), le = new wd(ou);
le.exec(`
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
function Ur(e, t, r) {
  le.prepare(`PRAGMA table_info(${e})`).all().some((a) => a.name === t) || le.exec(`ALTER TABLE ${e} ADD COLUMN ${t} ${r}`);
}
Ur("folders", "depth", "INTEGER DEFAULT 0");
Ur("folders", "path", "TEXT DEFAULT ''");
Ur("folders", "icon", "TEXT DEFAULT ''");
Ur("emails", "isStarred", "INTEGER DEFAULT 0");
Ur("emails", "attachments", "TEXT DEFAULT '[]'");
const Ao = ct.join(Xe.getPath("userData"), "window-state.json"), Ro = ct.join(Xe.getPath("userData"), "ryze-settings.json"), So = ct.join(
  Xe.getPath("userData"),
  "microsoft-oauth-tokens.json"
), Io = ct.join(
  Xe.getPath("userData"),
  "ai-provider-keys.json"
);
function Tt(e) {
  return new Promise((t) => setTimeout(t, e));
}
function kr(e, t) {
  const r = e.headers.get("retry-after"), i = r ? Number.parseInt(r, 10) : NaN;
  return Number.isFinite(i) ? Math.max(i, 1) * 1e3 : Math.min(3e4, t * 5e3);
}
const mt = /* @__PURE__ */ new Map(), rh = 120 * 1e3, nh = 60 * 1e3, Et = 4, ih = /* @__PURE__ */ new Set([
  "inbox",
  "sentitems",
  "drafts",
  "archive",
  "deleteditems"
]);
Dt.autoUpdater.autoDownload = !1;
Dt.autoUpdater.autoInstallOnAppQuit = !0;
Ee.handle("updater:check", () => (Xe.isPackaged && Dt.autoUpdater.checkForUpdates(), !0));
Ee.handle("updater:start-download", () => (Dt.autoUpdater.downloadUpdate(), !0));
Ee.handle("updater:install", () => (Dt.autoUpdater.quitAndInstall(), !0));
Dt.autoUpdater.on("update-available", (e) => {
  const t = gt.getAllWindows();
  t.length > 0 && t[0].webContents.send("updater:available", e.version);
});
Dt.autoUpdater.on("update-downloaded", () => {
  const e = gt.getAllWindows();
  e.length > 0 && e[0].webContents.send("updater:downloaded");
});
function au(e) {
  const t = (e.displayName || "").toLowerCase().trim(), r = (e.wellKnownName || "").toLowerCase().trim(), i = /* @__PURE__ */ new Set([
    "outbox",
    "syncissues",
    "conflicts",
    "localfailures",
    "serverfailures"
  ]), s = /* @__PURE__ */ new Set([
    "sync issues",
    "conflicts",
    "local failures",
    "server failures",
    "outbox"
  ]);
  return i.has(r) || s.has(t);
}
function hc(e) {
  const t = (e.displayName || "").toLowerCase().trim(), r = (e.wellKnownName || "").toLowerCase().trim();
  return r === "inbox" || t === "inbox" ? 0 : r === "sentitems" || t === "sent items" ? 1 : r === "drafts" || t === "drafts" ? 2 : r === "archive" || t === "archive" ? 3 : r === "deleteditems" || t === "deleted items" || t === "trash" ? 4 : au(e) ? 999 : 10;
}
function oh(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Vo(e) {
  return [...e].filter((t) => !au(t)).sort((t, r) => {
    const i = hc(t) - hc(r);
    return i !== 0 ? i : (t.path || t.displayName || "").localeCompare(
      r.path || r.displayName || ""
    );
  });
}
function ah(e, t) {
  return le.prepare(
    `
      SELECT deltaLink
      FROM folder_sync_state
      WHERE accountId = ? AND folderId = ?
      LIMIT 1
    `
  ).get(e, t)?.deltaLink || "";
}
function su(e, t, r, i) {
  const s = (/* @__PURE__ */ new Date()).toISOString();
  le.prepare(
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
    i === "full" ? s : null,
    i === "delta" ? s : null,
    i,
    i
  );
}
function lu(e, t, r) {
  const i = r.from?.emailAddress?.name || r.sender?.emailAddress?.name || "", s = r.from?.emailAddress?.address || r.sender?.emailAddress?.address || "", a = r.flag ? r.flag.flagStatus === "flagged" ? 1 : 0 : null, n = r.isRead !== void 0 ? r.isRead ? 1 : 0 : null, f = r.hasAttachments !== void 0 ? r.hasAttachments ? 1 : 0 : null, o = r.body?.content || r.bodyContent || "", h = r.body?.contentType || r.bodyContentType || "";
  le.prepare(
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
    o,
    r.receivedDateTime || "",
    n,
    f,
    a,
    i,
    s,
    JSON.stringify(r.toRecipients || []),
    JSON.stringify(r.ccRecipients || [])
  );
}
function cu(e, t) {
  le.transaction(() => {
    le.prepare(
      `
      DELETE FROM email_labels
      WHERE accountId = ? AND messageId = ?
    `
    ).run(e, t), le.prepare(
      `
      DELETE FROM emails
      WHERE accountId = ? AND id = ?
    `
    ).run(e, t);
  })();
}
function mn(e, t) {
  le.prepare(
    `
    DELETE FROM folder_sync_state
    WHERE accountId = ? AND folderId = ?
  `
  ).run(e, t);
}
function sh(e) {
  return le.prepare(
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
function Ke(e, t, r = 4096) {
  if (typeof e != "string")
    throw new Error(`${t} must be a string`);
  const i = e.trim();
  if (!i)
    throw new Error(`${t} is required`);
  if (i.length > r)
    throw new Error(`${t} is too long`);
  return i;
}
function lh() {
  const t = En().gemini?.apiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
  if (!t)
    throw new Error(
      "Gemini API key is missing. Add it in Settings > AI & keys."
    );
  return t;
}
function ch() {
  return (Yo().geminiModel || process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash").replace(/^models\//, "");
}
function uh() {
  return Yo().aiProvider === "ollama" ? "ollama" : "gemini";
}
function dh() {
  const e = Yo(), t = (e.ollamaBaseUrl || "http://127.0.0.1:11434").trim(), r = (e.ollamaModel || "llama3.2").trim();
  if (!r)
    throw new Error("Ollama model is missing. Add it in Settings > AI & keys.");
  let i;
  try {
    i = new URL(t);
  } catch {
    throw new Error("Ollama server URL is invalid.");
  }
  const s = i.hostname === "localhost" || i.hostname === "127.0.0.1" || i.hostname === "::1";
  if (i.protocol !== "http:" || !s)
    throw new Error("Ollama server URL must be a local http URL.");
  return {
    baseUrl: i.origin,
    model: r
  };
}
function Yo() {
  try {
    if (!Ge.existsSync(Ro))
      return {};
    const e = JSON.parse(Ge.readFileSync(Ro, "utf8"));
    return typeof e == "object" && e ? e : {};
  } catch (e) {
    return console.error("Failed to load backend settings:", e), {};
  }
}
function fh() {
  return process.env.GEMINI_API_VERSION?.trim() || "v1";
}
function uu(e) {
  return e.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<iframe[\s\S]*?<\/iframe>/gi, "").replace(/<object[\s\S]*?<\/object>/gi, "").replace(/<embed[\s\S]*?>/gi, "").replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "").replace(/(href|src|action)\s*=\s*["']?\s*(?:javascript|vbscript)\s*:[^"'>]*/gi, "");
}
function hh(e) {
  return e.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/\s+/g, " ").trim();
}
function pc(e, t = 12e3) {
  return e.length <= t ? e : `${e.slice(0, t)}

[Email content truncated for privacy and performance.]`;
}
function ph(e) {
  const t = e.trim(), i = t.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1] || t, s = i.indexOf("{"), a = i.lastIndexOf("}");
  return s === -1 || a === -1 || a <= s ? null : i.slice(s, a + 1);
}
function mc(e) {
  const t = ph(e);
  if (t)
    try {
      const r = JSON.parse(t), i = typeof r.summary == "string" ? r.summary.trim() : "", s = Array.isArray(r.keyPoints) ? r.keyPoints.filter((n) => typeof n == "string").map((n) => n.trim()).filter(Boolean).slice(0, 5) : [], a = Array.isArray(r.suggestedActions) ? r.suggestedActions.filter((n) => typeof n == "string").map((n) => n.trim()).filter(Boolean).slice(0, 3) : [];
      if (i || s.length > 0 || a.length > 0)
        return {
          summary: i,
          keyPoints: s,
          suggestedActions: a
        };
    } catch {
    }
  return {
    summary: e.trim(),
    keyPoints: [],
    suggestedActions: []
  };
}
function mh(e) {
  return {
    subject: qe(e?.subject, "subject", 512),
    senderName: qe(e?.senderName, "senderName", 256),
    senderEmail: qe(e?.senderEmail, "senderEmail", 512),
    body: qe(e?.body, "body", 5e5),
    preview: qe(e?.preview, "preview", 5e3)
  };
}
function gh(e) {
  const t = e && typeof e == "object" ? e : {}, r = qe(t.aiProvider, "aiProvider", 32).trim(), i = qe(t.geminiModel, "geminiModel", 64).trim(), s = qe(t.ollamaBaseUrl, "ollamaBaseUrl", 512).trim(), a = qe(t.ollamaModel, "ollamaModel", 128).trim();
  return {
    aiProvider: r === "ollama" ? "ollama" : "gemini",
    geminiModel: i || "gemini-2.5-flash",
    ollamaBaseUrl: s || "http://127.0.0.1:11434",
    ollamaModel: a || "llama3.2"
  };
}
function Eh(e) {
  if (!Array.isArray(e))
    throw new Error("drafts must be an array");
  return e.slice(0, 20).map((t, r) => {
    const i = t && typeof t == "object" ? t : {};
    return {
      id: qe(i.id, `drafts[${r}].id`, 128).trim() || `draft-${dt.randomUUID()}`,
      to: qe(i.to, `drafts[${r}].to`, 4096),
      cc: qe(i.cc, `drafts[${r}].cc`, 4096),
      subject: qe(i.subject, `drafts[${r}].subject`, 512),
      body: uu(
        qe(i.body, `drafts[${r}].body`, 5e5)
      ),
      isMinimized: !!i.isMinimized,
      isFullscreen: !!i.isFullscreen,
      aiTone: qe(i.aiTone, `drafts[${r}].aiTone`, 32) || void 0,
      aiHint: qe(i.aiHint, `drafts[${r}].aiHint`, 2048) || void 0
    };
  });
}
function qe(e, t, r = 4096) {
  if (e == null)
    return "";
  if (typeof e != "string")
    throw new Error(`${t} must be a string`);
  if (e.length > r)
    throw new Error(`${t} is too long`);
  return e;
}
function Fe(e) {
  const t = Ke(e, "accountId", 256);
  if (!/^ms-[A-Za-z0-9._-]+$/.test(t))
    throw new Error("Invalid accountId");
  return t;
}
function Pt(e) {
  return Ke(e, "messageId", 2048);
}
function gn(e) {
  const t = Ke(e, "labelId", 128);
  if (!/^label-[A-Za-z0-9._-]+$/.test(t))
    throw new Error("Invalid labelId");
  return t;
}
function du(e) {
  const t = Ke(e, "name", 64).replace(/\s+/g, " ").trim();
  if (t.length < 2)
    throw new Error("Label name must be at least 2 characters");
  return t;
}
function fu(e) {
  const t = Ke(e, "folderName", 64).replace(/\s+/g, " ").trim();
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
function yh(e) {
  const t = qe(e, "color", 16).trim() || "#C9A84C";
  if (!/^#[0-9A-Fa-f]{6}$/.test(t))
    throw new Error("Invalid label color");
  return t;
}
function nr(e) {
  return Ke(e, "folderId", 2048);
}
const vh = /* @__PURE__ */ new Set([
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
function wh(e) {
  const t = qe(e, "icon", 64).trim();
  if (!t)
    return "folder";
  if (!vh.has(t))
    throw new Error("Invalid folder icon");
  return t;
}
function _h(e) {
  const t = Ke(
    e,
    "destinationFolder",
    64
  ).toLowerCase();
  if (!ih.has(t))
    throw new Error("Invalid destination folder");
  return t;
}
function Th(e, t) {
  const r = le.prepare(
    `
      SELECT id, parentFolderId
      FROM folders
      WHERE accountId = ?
    `
  ).all(e), i = /* @__PURE__ */ new Map();
  for (const n of r) {
    const f = n.parentFolderId || "";
    if (!f) continue;
    const o = i.get(f) || [];
    o.push(n.id), i.set(f, o);
  }
  const s = /* @__PURE__ */ new Set(), a = (n) => {
    if (!s.has(n)) {
      s.add(n);
      for (const f of i.get(n) || [])
        a(f);
    }
  };
  return a(t), Array.from(s);
}
function gc(e) {
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
function _o(e) {
  return (Buffer.isBuffer(e) ? e.toString("base64") : Buffer.from(e).toString("base64")).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function zo() {
  const e = process.env.MICROSOFT_OAUTH_CLIENT_ID?.trim() || process.env.VITE_MICROSOFT_OAUTH_CLIENT_ID?.trim(), t = process.env.MICROSOFT_OAUTH_TENANT_ID?.trim() || "common", r = process.env.MICROSOFT_OAUTH_REDIRECT_URI?.trim() || process.env.VITE_MICROSOFT_OAUTH_REDIRECT_URI?.trim() || "http://127.0.0.1:42813/auth/microsoft/callback", i = process.env.MICROSOFT_OAUTH_SCOPE?.trim() || "openid profile offline_access User.Read Mail.Read Mail.ReadWrite Mail.Send Calendars.Read";
  if (!e)
    throw new Error("Missing MICROSOFT_OAUTH_CLIENT_ID");
  if (!/^[0-9a-fA-F-]{36}$/.test(e))
    throw new Error(
      "MICROSOFT_OAUTH_CLIENT_ID must be the Azure Application client ID GUID, not a client secret value"
    );
  const s = new URL(r);
  if (!["127.0.0.1", "localhost"].includes(s.hostname) || s.protocol !== "http:")
    throw new Error(
      "MICROSOFT_OAUTH_REDIRECT_URI must be a localhost loopback URL"
    );
  if (!s.port)
    throw new Error(
      "MICROSOFT_OAUTH_REDIRECT_URI must include an explicit port, for example: http://127.0.0.1:42813/auth/microsoft/callback"
    );
  return {
    clientId: e,
    tenantId: t,
    redirectUri: r,
    scope: i
  };
}
function Or() {
  try {
    if (!Ge.existsSync(So))
      return {};
    const e = Ge.readFileSync(So, "utf8");
    if (!e)
      return {};
    if (!rt.isEncryptionAvailable())
      throw new Error("Secure token storage is not available on this system");
    const t = rt.decryptString(
      Buffer.from(e, "base64")
    );
    return JSON.parse(t);
  } catch (e) {
    return console.error("Failed to load stored Microsoft tokens:", e), {};
  }
}
function Xo(e) {
  try {
    if (!rt.isEncryptionAvailable())
      throw new Error("Secure token storage is not available on this system");
    const t = JSON.stringify(e), r = rt.encryptString(t).toString("base64");
    Ge.writeFileSync(So, r, {
      encoding: "utf8",
      mode: 384
    });
  } catch (t) {
    throw console.error("Failed to save Microsoft tokens:", t), t;
  }
}
function En() {
  try {
    if (!Ge.existsSync(Io))
      return {};
    const e = Ge.readFileSync(Io, "utf8");
    if (!e)
      return {};
    if (!rt.isEncryptionAvailable())
      throw new Error("Secure AI key storage is not available on this system");
    const t = rt.decryptString(
      Buffer.from(e, "base64")
    );
    return JSON.parse(t);
  } catch (e) {
    return console.error("Failed to load stored AI provider keys:", e), {};
  }
}
function hu(e) {
  if (!rt.isEncryptionAvailable())
    throw new Error("Secure AI key storage is not available on this system");
  const t = JSON.stringify(e), r = rt.encryptString(t).toString("base64");
  Ge.writeFileSync(Io, r, {
    encoding: "utf8",
    mode: 384
  });
}
function Ko(e) {
  const t = En()[e], r = e === "gemini" ? process.env.GEMINI_API_KEY?.trim() : "";
  return {
    provider: e,
    configured: !!(t?.apiKey || r),
    source: t?.apiKey ? "local" : r ? "environment" : null,
    updatedAt: t?.updatedAt || null,
    encryptionAvailable: rt.isEncryptionAvailable()
  };
}
async function Ah(e, t, r, i) {
  const s = `https://login.microsoftonline.com/${r}/oauth2/v2.0`, a = new URLSearchParams({
    client_id: t,
    grant_type: "refresh_token",
    refresh_token: e,
    scope: i
  }), n = await fetch(`${s}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: a.toString()
  });
  if (!n.ok) {
    const f = await n.text();
    throw new Error(
      `Microsoft refresh token exchange failed (${n.status}): ${f}`
    );
  }
  return await n.json();
}
const To = /* @__PURE__ */ new Map();
async function Ze(e) {
  const { clientId: t, tenantId: r, scope: i } = zo(), a = Or()[e];
  if (!a) throw new Error("No Microsoft token stored for this account");
  if (a.expiresAt > Date.now() + nh)
    return a.accessToken;
  if (!a.refreshToken)
    throw new Error(
      "Microsoft refresh token missing. Please reconnect the account."
    );
  const n = To.get(e);
  if (n) return n;
  const f = (async () => {
    try {
      const o = await Ah(
        a.refreshToken,
        t,
        r,
        i
      ), h = Or();
      return h[e] = {
        ...a,
        accessToken: o.access_token,
        refreshToken: o.refresh_token || a.refreshToken,
        expiresAt: Date.now() + o.expires_in * 1e3,
        scope: o.scope || a.scope,
        tokenType: o.token_type || a.tokenType
      }, Xo(h), h[e].accessToken;
    } finally {
      To.delete(e);
    }
  })();
  return To.set(e, f), f;
}
async function pu(e, t) {
  for (let r = 1; r <= Et; r += 1) {
    const i = await fetch(t, {
      headers: {
        Authorization: `Bearer ${e}`,
        Prefer: "odata.maxpagesize=100"
      }
    });
    if (i.ok)
      return await i.json();
    const s = await i.text();
    if (!(i.status === 429 || i.status === 500 || i.status === 502 || i.status === 503 || i.status === 504) || r === Et)
      throw new Error(
        `Microsoft Graph message delta request failed (${i.status}): ${s}`
      );
    await Tt(kr(i, r));
  }
  throw new Error("Microsoft Graph message delta request failed after retries");
}
async function bo(e, t, r) {
  const i = new URLSearchParams({
    $select: "id,subject,bodyPreview,receivedDateTime,isRead,hasAttachments,from,toRecipients,ccRecipients,flag"
    // <--- Added ,flag
  });
  let s = `https://graph.microsoft.com/v1.0/me/mailFolders/${encodeURIComponent(
    r
  )}/messages/delta?${i.toString()}`, a = "", n = 0;
  for (; s; ) {
    const f = await pu(e, s);
    if (le.transaction(() => {
      for (const h of f.value) {
        if (h["@removed"]) {
          cu(t, h.id);
          continue;
        }
        lu(t, r, h), n += 1;
      }
    })(), f["@odata.deltaLink"]) {
      a = f["@odata.deltaLink"];
      break;
    }
    s = f["@odata.nextLink"], await Tt(80);
  }
  if (!a)
    throw new Error(
      `Microsoft Graph did not return a deltaLink for folder ${r}`
    );
  return su(t, r, a, "full"), {
    success: !0,
    syncedCount: n,
    deltaLink: a
  };
}
async function mu(e, t, r) {
  const i = ah(t, r);
  if (!i)
    return bo(e, t, r);
  let s = i, a = 0, n = 0, f = "";
  try {
    for (; s; ) {
      const o = await pu(
        e,
        s
      );
      if (le.transaction(() => {
        for (const d of o.value) {
          if (d["@removed"]) {
            cu(t, d.id), n += 1;
            continue;
          }
          lu(t, r, d), a += 1;
        }
      })(), o["@odata.deltaLink"]) {
        f = o["@odata.deltaLink"];
        break;
      }
      s = o["@odata.nextLink"], await Tt(50);
    }
  } catch (o) {
    const h = o instanceof Error ? o.message : String(o);
    if (h.includes("410") || h.toLowerCase().includes("sync state") || h.toLowerCase().includes("deltalink"))
      return mn(t, r), bo(e, t, r);
    throw o;
  }
  return f && su(t, r, f, "delta"), {
    success: !0,
    updatedCount: a,
    deletedCount: n
  };
}
async function yn(e) {
  const t = await Ze(e), r = await vu(t), i = Array.isArray(r) ? r : r.value || [], s = Vo(i);
  console.log(
    `[sync] Initial full sync for ${e}: ${i.length} folders`
  ), console.log(`[sync] Message sync folders: ${s.length}`), wu(e, i);
  for (const a of s)
    try {
      console.log(
        `[sync] Full delta sync folder: ${a.displayName} (${a.id})`
      );
      const n = await bo(
        t,
        e,
        a.id
      );
      console.log(
        `[sync] Finished folder: ${a.displayName} (${n.syncedCount ?? 0} messages)`
      );
    } catch (n) {
      console.error(
        `[sync] Failed folder: ${a.displayName} (${a.id})`,
        n
      ), mn(e, a.id);
    }
  return { success: !0 };
}
async function gu(e, t) {
  const r = await Ze(e), i = Au(e), s = new Set(t.filter(Boolean)), a = Vo(i).filter(
    (n) => s.has(n.id)
  );
  console.log(
    `[sync] Targeted delta sync for ${e}: ${a.length} folders`
  );
  for (const n of a)
    try {
      const f = await mu(
        r,
        e,
        n.id
      );
      console.log(
        `[sync] Targeted delta finished folder: ${n.displayName} (${f.updatedCount ?? f.syncedCount ?? 0} changed, ${f.deletedCount ?? 0} deleted)`
      );
    } catch (f) {
      console.error(
        `[sync] Targeted delta failed folder: ${n.displayName} (${n.id})`,
        f
      ), mn(e, n.id);
    }
  return { success: !0 };
}
async function Eu(e) {
  const t = await Ze(e), r = await vu(t), i = Array.isArray(r) ? r : r.value || [], s = Vo(i);
  console.log(`[sync] Delta sync for ${e}: ${i.length} folders`), console.log(`[sync] Message delta folders: ${s.length}`), wu(e, i);
  for (const a of s)
    try {
      const n = await mu(
        t,
        e,
        a.id
      ), f = n.updatedCount ?? n.syncedCount ?? 0, o = n.deletedCount ?? 0;
      console.log(
        `[sync] Delta finished folder: ${a.displayName} (${f} changed, ${o} deleted)`
      );
    } catch (n) {
      console.error(
        `[sync] Delta failed folder: ${a.displayName} (${a.id})`,
        n
      ), mn(e, a.id);
    }
  return { success: !0 };
}
async function Rh(e, t) {
  for (let r = 1; r <= Et; r += 1) {
    const i = await fetch(t, {
      headers: {
        Authorization: `Bearer ${e}`
      }
    });
    if (i.ok)
      return await i.json();
    const s = await i.text();
    if (i.status === 404 || i.status === 403 || s.includes("ErrorItemNotFound") || s.includes("ErrorAccessDenied"))
      return { value: [] };
    if (!(i.status === 429 || i.status === 503 || i.status === 504) || r === Et)
      throw new Error(
        `Microsoft Graph folders request failed (${i.status}): ${s}`
      );
    await Tt(kr(i, r));
  }
  throw new Error("Microsoft Graph folders request failed after retries");
}
async function Sh(e, t) {
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
    const i = await r.text();
    throw new Error(
      `Microsoft Graph folder creation failed (${r.status}): ${i}`
    );
  }
  return await r.json();
}
async function yu(e, t, r) {
  const s = `https://graph.microsoft.com/v1.0/me/messages/${encodeURIComponent(t)}/move`;
  for (let a = 1; a <= Et; a += 1) {
    const n = await fetch(s, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${e}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        destinationId: r
      })
    });
    if (n.ok)
      return await n.json();
    const f = await n.text();
    if (!(n.status === 429 || n.status === 500 || n.status === 502 || n.status === 503 || n.status === 504) || a === Et)
      throw new Error(
        `Microsoft Graph move failed (${n.status}): ${f}`
      );
    await Tt(kr(n, a));
  }
  throw new Error("Microsoft Graph move failed after retries");
}
async function Ih(e, t, r) {
  const i = encodeURIComponent(t), s = await fetch(
    `https://graph.microsoft.com/v1.0/me/mailFolders/${i}`,
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
  if (!s.ok) {
    const a = await s.text();
    throw new Error(
      `Microsoft Graph folder rename failed (${s.status}): ${a}`
    );
  }
  return await s.json();
}
async function bh(e, t) {
  const r = encodeURIComponent(t), i = await fetch(
    `https://graph.microsoft.com/v1.0/me/mailFolders/${r}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${e}`
      }
    }
  );
  if (!i.ok && i.status !== 404) {
    const s = await i.text();
    throw new Error(
      `Microsoft Graph folder delete failed (${i.status}): ${s}`
    );
  }
  return { success: !0 };
}
async function Ch(e, t) {
  const i = `https://graph.microsoft.com/v1.0/me/messages/${encodeURIComponent(t)}`;
  for (let s = 1; s <= Et; s += 1) {
    const a = await fetch(i, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${e}`
      }
    });
    if (a.ok || a.status === 404)
      return;
    const n = await a.text();
    if (!(a.status === 429 || a.status === 500 || a.status === 502 || a.status === 503 || a.status === 504) || s === Et)
      throw new Error(
        `Microsoft Graph message delete failed (${a.status}): ${n}`
      );
    await Tt(kr(a, s));
  }
}
async function Nh(e, t, r) {
  const i = "deleteditems";
  let s = 0, a = `https://graph.microsoft.com/v1.0/me/mailFolders/${encodeURIComponent(
    t
  )}/messages?$top=100&$select=id`;
  const n = [];
  for (; a; ) {
    const f = await fetch(a, {
      headers: {
        Authorization: `Bearer ${e}`
      }
    });
    if (!f.ok) {
      const h = await f.text();
      throw new Error(
        `Microsoft Graph list folder messages failed (${f.status}): ${h}`
      );
    }
    const o = await f.json();
    n.push(...o.value.map((h) => h.id)), a = o["@odata.nextLink"], await Tt(80);
  }
  for (const f of n)
    r ? await Ch(e, f) : await yu(
      e,
      f,
      i
    ), s += 1, await Tt(120);
  return {
    success: !0,
    affectedCount: s
  };
}
async function vu(e) {
  const r = `https://graph.microsoft.com/v1.0/me/mailFolders?${new URLSearchParams({
    $top: "100"
  }).toString()}`, i = [], s = async (a, n, f) => {
    let o = a;
    for (; o; ) {
      let h;
      try {
        h = await Rh(e, o);
      } catch (d) {
        throw console.error(
          `[sync] Failed to fetch folder page for path "${f || "root"}":`,
          d
        ), d;
      }
      for (const d of h.value) {
        const l = f ? `${f}/${d.displayName}` : d.displayName, u = {
          ...d,
          depth: n,
          path: l
        };
        i.push(u);
        const p = new URLSearchParams({
          $top: "100"
        }), y = `https://graph.microsoft.com/v1.0/me/mailFolders/${encodeURIComponent(d.id)}/childFolders?${p.toString()}`;
        try {
          await s(y, n + 1, l);
        } catch (m) {
          console.error(
            `[sync] Failed to fetch sub-folders for ${d.displayName} (${d.id}):`,
            m
          );
        }
      }
      o = h["@odata.nextLink"];
    }
  };
  return await s(r, 0, ""), { value: i };
}
function Co(e) {
  if (e.wellKnownName)
    return e.wellKnownName.toLowerCase();
  const t = e.id.toLowerCase(), r = e.displayName.toLowerCase().replace(/\s+/g, "");
  return t === "inbox" || r === "inbox" || r === "indbakke" || r === "bandejadeentrada" || r === "boîtederéception" ? "inbox" : t === "sentitems" || r === "sentitems" || r === "sent" || r === "sendtpost" || r === "elementosenviados" || r === "élémentsenvoyés" ? "sentitems" : t === "drafts" || r === "drafts" || r === "kladder" || r === "borradores" || r === "brouillons" ? "drafts" : t === "archive" || r === "archive" || r === "arkiv" || r === "archivo" ? "archive" : t === "deleteditems" || r === "deleteditems" || r === "deleted" || r === "trash" || r === "papirkurv" || r === "elementoseliminados" || r === "élémentsupprimés" ? "deleteditems" : "";
}
function wu(e, t) {
  const r = le.prepare(`
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
  le.transaction((s) => {
    for (const a of s)
      r.run(
        a.id,
        e,
        a.displayName || "Folder",
        a.parentFolderId || "",
        Co(a),
        a.totalItemCount || 0,
        a.unreadItemCount || 0,
        a.depth || 0,
        a.path || a.displayName || "Folder"
      );
  })(t);
}
function Oh(e) {
  return !!le.prepare(
    `
      SELECT id
      FROM emails
      WHERE accountId = ?
      LIMIT 1
    `
  ).get(e);
}
function Jo(e) {
  return !_u(e) || !Oh(e);
}
function _u(e) {
  return !!le.prepare(
    `
      SELECT folderId
      FROM folder_sync_state
      WHERE accountId = ?
      LIMIT 1
    `
  ).get(e);
}
function Tu(e) {
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
function Au(e) {
  return le.prepare(
    `
      SELECT *
      FROM folders
      WHERE accountId = ?
      ORDER BY path COLLATE NOCASE ASC
    `
  ).all(e);
}
function Dh(e) {
  const t = Au(e), r = {};
  for (const i of t) {
    const s = le.prepare(
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
    ).all(e, i.id);
    r[i.id] = Tu(s);
  }
  return r;
}
function Ph(e) {
  return le.prepare(
    `
      SELECT id, accountId, name, color, createdAt, updatedAt
      FROM labels
      WHERE accountId = ?
      ORDER BY name COLLATE NOCASE ASC
    `
  ).all(e);
}
function Fh() {
  try {
    if (Ge.existsSync(Ao))
      return JSON.parse(Ge.readFileSync(Ao, "utf8"));
  } catch (e) {
    console.error("Failed to load window state:", e);
  }
  return { width: 1200, height: 800 };
}
function Lh(e) {
  try {
    if (!e.isMaximized() && !e.isMinimized()) {
      const t = e.getBounds();
      Ge.writeFileSync(Ao, JSON.stringify(t), {
        encoding: "utf8",
        mode: 384
      });
    }
  } catch (t) {
    console.error("Failed to save window state:", t);
  }
}
function Ru() {
  const e = Fh(), t = ct.resolve(nn, "preload.mjs"), r = Xe.isPackaged ? ct.join(nn, "../dist/logo.ico") : ct.join(nn, "../../public/logo.ico"), i = new gt({
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
  i.webContents.setWindowOpenHandler(({ url: s }) => {
    try {
      const a = new URL(s);
      if (!["https:", "mailto:"].includes(a.protocol))
        return { action: "deny" };
      iu.openExternal(s);
    } catch {
      return { action: "deny" };
    }
    return { action: "deny" };
  }), i.webContents.on("will-navigate", (s, a) => {
    process.env.VITE_DEV_SERVER_URL && a.startsWith(process.env.VITE_DEV_SERVER_URL) || a.startsWith("file://") || s.preventDefault();
  }), i.on("close", () => {
    Lh(i);
  }), process.env.VITE_DEV_SERVER_URL ? i.loadURL(process.env.VITE_DEV_SERVER_URL) : i.loadFile(ct.resolve(nn, "../dist/index.html"));
}
Ee.handle("ai:get-provider-key-status", (e, t) => {
  const r = Ke(t?.provider, "provider", 32);
  if (r !== "gemini")
    throw new Error("Unsupported AI provider");
  return Ko(r);
});
Ee.handle("ai:set-provider-key", (e, t) => {
  const r = Ke(t?.provider, "provider", 32), i = Ke(t?.apiKey, "apiKey", 8192);
  if (r !== "gemini")
    throw new Error("Unsupported AI provider");
  const s = En();
  return s[r] = {
    apiKey: i,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }, hu(s), Ko(r);
});
Ee.handle("ai:delete-provider-key", (e, t) => {
  const r = Ke(t?.provider, "provider", 32);
  if (r !== "gemini")
    throw new Error("Unsupported AI provider");
  const i = En();
  return delete i[r], hu(i), Ko(r);
});
class xh {
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
const Uh = new xh(10, 6e4);
Ee.handle("ai:summarize-email", async (e, t) => {
  if (!Uh.allow())
    throw new Error("Too many AI requests. Please wait a moment before summarising another email.");
  const r = mh(t), i = pc(
    hh(r.body || r.preview || "")
  );
  if (!i.trim() && !r.subject.trim())
    throw new Error("No email content available to summarize.");
  const s = [
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
    i
  ].join(`
`);
  if (uh() === "ollama") {
    const { baseUrl: l, model: u } = dh(), p = pc(i, 4e3), E = [
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
`), y = async (A) => {
      const N = await fetch(`${l}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: u,
          prompt: E,
          stream: !1,
          options: {
            temperature: 0.2,
            num_predict: A
          }
        })
      });
      if (!N.ok) {
        const D = await N.text();
        throw new Error(
          `Ollama summarize failed (${N.status}): ${D}`
        );
      }
      return await N.json();
    };
    let m = await y(500), T = (m.response || m.message?.content || m.output || "").trim();
    if (!T && m.done_reason === "length" && (m = await y(1e3), T = (m.response || m.message?.content || m.output || "").trim()), !T) {
      const A = m.error || m.done_reason || "no response text";
      throw new Error(`Ollama returned an empty summary (${A}).`);
    }
    return {
      ...mc(T)
    };
  }
  const a = lh(), n = ch(), f = fh(), o = await fetch(
    `https://generativelanguage.googleapis.com/${encodeURIComponent(
      f
    )}/models/${encodeURIComponent(n)}:generateContent?key=${encodeURIComponent(
      a
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
                text: s
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
  if (!o.ok) {
    const l = await o.text();
    throw o.status === 400 && l.includes("API_KEY") ? new Error("Gemini API key is invalid or missing.") : new Error(
      `Gemini summarize failed (${o.status}): ${l}`
    );
  }
  const d = (await o.json()).candidates?.[0]?.content?.parts?.map((l) => l.text || "").join("").trim();
  if (!d)
    throw new Error("Gemini returned an empty summary.");
  return {
    ...mc(d)
  };
});
Ee.handle("microsoft-calendar:get-events", async (e, t) => {
  const r = Fe(t?.accountId), i = await Ze(r), s = /* @__PURE__ */ new Date();
  s.setHours(0, 0, 0, 0);
  const a = /* @__PURE__ */ new Date();
  a.setDate(a.getDate() + 14);
  const n = new URLSearchParams({
    $select: "id,subject,bodyPreview,start,end,location,isAllDay",
    $orderby: "start/dateTime ASC",
    $top: "50"
  }), f = await fetch(
    `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${s.toISOString()}&endDateTime=${a.toISOString()}&${n.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${i}`,
        Prefer: 'outlook.timezone="UTC"'
      }
    }
  );
  if (!f.ok) {
    const h = await f.text();
    throw console.error("Failed to fetch calendar:", h), new Error(`Failed to fetch calendar events: ${h}`);
  }
  return (await f.json()).value || [];
});
Ee.handle("microsoft-mail:download-attachment", async (e, t) => {
  const r = Fe(t?.accountId), i = Pt(t?.messageId), s = Ke(
    t?.attachmentId,
    "attachmentId",
    2048
  ), a = Ke(t?.filename, "filename", 1024), n = gt.fromWebContents(e.sender);
  if (!n) throw new Error("No window found");
  const { canceled: f, filePath: o } = await eh.showSaveDialog(n, {
    defaultPath: a,
    title: "Save Attachment"
  });
  if (f || !o)
    return { success: !1, canceled: !0 };
  const h = await Ze(r), d = encodeURIComponent(i), l = encodeURIComponent(s), p = `${`https://graph.microsoft.com/v1.0/me/messages/${d}/attachments/${l}`}/$value`, E = async (A) => {
    const N = await fetch(p, {
      headers: {
        Authorization: `Bearer ${h}`,
        ...A ? { Prefer: 'IdType="ImmutableId"' } : {}
      }
    });
    if (N.ok) {
      const I = await N.arrayBuffer();
      return { ok: !0, bytes: Buffer.from(I) };
    }
    const D = await N.text();
    return { ok: !1, status: N.status, errorText: D };
  }, y = await E(!0), m = y.ok || y.status !== 404 ? null : await E(!1), T = y.ok ? y : m?.ok ? m : null;
  if (!T) {
    const A = m || y;
    throw new Error(`Failed to download attachment: ${A.errorText}`);
  }
  return Ge.writeFileSync(o, T.bytes), { success: !0, filePath: o };
});
Ee.handle("microsoft-mail:toggle-star", async (e, t) => {
  const r = Fe(t?.accountId), i = Pt(t?.messageId), s = !!t?.isStarred, a = await Ze(r), n = encodeURIComponent(i), f = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages/${n}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${a}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        flag: {
          flagStatus: s ? "flagged" : "notFlagged"
        }
      })
    }
  );
  if (!f.ok) {
    const o = await f.text();
    if (f.status === 404 || o.includes("ErrorItemNotFound"))
      return le.prepare("DELETE FROM emails WHERE accountId = ? AND id = ?").run(
        r,
        i
      ), { success: !1, missing: !0 };
    throw new Error(`Failed to toggle star: ${o}`);
  }
  return le.prepare(
    "UPDATE emails SET isStarred = ? WHERE accountId = ? AND id = ?"
  ).run(s ? 1 : 0, r, i), { success: !0 };
});
Ee.handle("system:get-storage-usage", () => {
  try {
    return {
      // Return size in GB
      dbSizeGB: Ge.statSync(ou).size / (1024 * 1024 * 1024)
    };
  } catch {
    return { dbSizeGB: 0 };
  }
});
Ee.on("system:update-settings", (e, t) => {
  const r = gh(t);
  Ge.writeFileSync(Ro, JSON.stringify(r, null, 2), {
    encoding: "utf8",
    mode: 384
  });
});
Ee.handle("microsoft-mail:syncFolders", async (e, t) => {
  const r = Fe(t?.accountId);
  if (mt.has(r))
    return mt.get(r);
  const s = (Array.isArray(t?.folderIds) ? t.folderIds : []).map(
    (a) => nr(a)
  );
  return s.length === 0 ? { success: !0 } : Jo(r) ? await yn(r) : await gu(r, s);
});
const No = ct.join(Xe.getPath("userData"), "ryze-drafts.enc");
Ee.handle("system:get-drafts", () => {
  try {
    if (!rt.isEncryptionAvailable())
      return console.warn("Secure storage unavailable — drafts cannot be loaded."), [];
    if (!Ge.existsSync(No)) return [];
    const e = Ge.readFileSync(No), t = rt.decryptString(e);
    return JSON.parse(t);
  } catch (e) {
    return console.error("Failed to load encrypted drafts:", e), [];
  }
});
Ee.on("system:save-drafts", (e, t) => {
  if (!rt.isEncryptionAvailable()) {
    console.error("Secure storage unavailable — drafts will not be saved to disk.");
    const r = gt.getAllWindows();
    r.length > 0 && r[0].webContents.send("drafts:save-failed", "Secure storage is unavailable on this system. Drafts cannot be saved.");
    return;
  }
  try {
    const r = JSON.stringify(Eh(t)), i = rt.encryptString(r);
    Ge.writeFileSync(No, i, { mode: 384 });
  } catch (r) {
    console.error("Failed to securely save drafts:", r);
    const i = gt.getAllWindows();
    i.length > 0 && i[0].webContents.send(
      "drafts:save-failed",
      "Drafts could not be saved due to an encryption error."
    );
  }
});
Ee.handle("labels:create", (e, t) => {
  const r = Fe(t?.accountId), i = du(t?.name), s = yh(t?.color), a = (/* @__PURE__ */ new Date()).toISOString(), n = `label-${dt.randomUUID()}`;
  return le.prepare(
    `
    INSERT INTO labels (id, accountId, name, color, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `
  ).run(n, r, i, s, a, a), {
    id: n,
    accountId: r,
    name: i,
    color: s,
    createdAt: a,
    updatedAt: a
  };
});
Ee.handle("microsoft-folder:create", async (e, t) => {
  const r = Fe(t?.accountId), i = fu(t?.displayName), s = await Ze(r), a = await Sh(s, i), n = {
    ...a,
    depth: 0,
    path: a.displayName || i
  };
  return le.prepare(
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
    n.id,
    r,
    n.displayName || i,
    n.parentFolderId || "",
    Co(n),
    n.totalItemCount || 0,
    n.unreadItemCount || 0,
    n.depth || 0,
    n.path || n.displayName || i
  ), {
    id: n.id,
    accountId: r,
    displayName: n.displayName || i,
    parentFolderId: n.parentFolderId || "",
    wellKnownName: Co(n),
    totalItemCount: n.totalItemCount || 0,
    unreadItemCount: n.unreadItemCount || 0,
    depth: n.depth || 0,
    path: n.path || n.displayName || i
  };
});
Ee.handle("microsoft-folder:rename", async (e, t) => {
  const r = Fe(t?.accountId), i = nr(t?.folderId), s = fu(t?.displayName), a = le.prepare(
    `
      SELECT id, wellKnownName
      FROM folders
      WHERE accountId = ? AND id = ?
      LIMIT 1
    `
  ).get(r, i);
  if (!a)
    throw new Error("Folder not found");
  if (a.wellKnownName)
    throw new Error("System folders cannot be renamed.");
  const n = await Ze(r), f = await Ih(
    n,
    i,
    s
  );
  return le.prepare(
    `
    UPDATE folders
    SET displayName = ?
    WHERE accountId = ? AND id = ?
  `
  ).run(f.displayName || s, r, i), le.prepare(
    `
      SELECT *
      FROM folders
      WHERE accountId = ? AND id = ?
    `
  ).get(r, i);
});
Ee.handle("microsoft-folder:delete", async (e, t) => {
  const r = Fe(t?.accountId), i = nr(t?.folderId), s = le.prepare(
    `
      SELECT id, wellKnownName
      FROM folders
      WHERE accountId = ? AND id = ?
      LIMIT 1
    `
  ).get(r, i);
  if (!s)
    throw new Error("Folder not found");
  if (s.wellKnownName)
    throw new Error("System folders cannot be deleted.");
  const a = await Ze(r);
  await bh(a, i);
  const n = Th(r, i);
  return le.transaction(() => {
    for (const o of n)
      le.prepare(
        `
        DELETE FROM email_labels
        WHERE accountId = ?
          AND messageId IN (
            SELECT id FROM emails WHERE accountId = ? AND folder = ?
          )
      `
      ).run(r, r, o), le.prepare(
        `
        DELETE FROM emails
        WHERE accountId = ? AND folder = ?
      `
      ).run(r, o), le.prepare(
        `
        DELETE FROM folders
        WHERE accountId = ? AND id = ?
      `
      ).run(r, o);
  })(), {
    success: !0,
    deletedFolderIds: n
  };
});
Ee.handle("microsoft-folder:empty", async (e, t) => {
  const r = Fe(t?.accountId), i = nr(t?.folderId), s = le.prepare(
    `
    SELECT id, displayName, wellKnownName
    FROM folders
    WHERE accountId = ? AND id = ?
    LIMIT 1
  `
  ).get(r, i);
  if (!s)
    throw new Error("Folder not found");
  const a = await Ze(r), n = s.wellKnownName === "deleteditems" || s.displayName?.toLowerCase() === "deleted items" || s.displayName?.toLowerCase() === "trash", f = await Nh(
    a,
    i,
    n
  );
  return le.transaction(() => {
    le.prepare(
      `
      DELETE FROM email_labels
      WHERE accountId = ?
        AND messageId IN (
          SELECT id FROM emails WHERE accountId = ? AND folder = ?
        )
    `
    ).run(r, r, i), le.prepare(
      `
      DELETE FROM emails
      WHERE accountId = ? AND folder = ?
    `
    ).run(r, i);
  })(), {
    success: !0,
    affectedCount: f.affectedCount
  };
});
Ee.handle("microsoft-folder:set-icon", (e, t) => {
  const r = Fe(t?.accountId), i = nr(t?.folderId), s = wh(t?.icon);
  if (le.prepare(
    `
    UPDATE folders
    SET icon = ?
    WHERE accountId = ? AND id = ?
  `
  ).run(s, r, i).changes === 0)
    throw new Error("Folder not found");
  return le.prepare(
    `
      SELECT *
      FROM folders
      WHERE accountId = ? AND id = ?
    `
  ).get(r, i);
});
Ee.handle("labels:rename", (e, t) => {
  const r = Fe(t?.accountId), i = gn(t?.labelId), s = du(t?.name), a = (/* @__PURE__ */ new Date()).toISOString();
  if (le.prepare(
    `
    UPDATE labels
    SET name = ?, updatedAt = ?
    WHERE accountId = ? AND id = ?
  `
  ).run(s, a, r, i).changes === 0)
    throw new Error("Label not found");
  return le.prepare(
    `
      SELECT id, accountId, name, color, createdAt, updatedAt
      FROM labels
      WHERE accountId = ? AND id = ?
    `
  ).get(r, i);
});
Ee.handle("labels:assign-email", (e, t) => {
  const r = Fe(t?.accountId), i = Pt(t?.messageId), s = gn(t?.labelId), a = (/* @__PURE__ */ new Date()).toISOString();
  if (!le.prepare(
    `
    SELECT id FROM emails
    WHERE accountId = ? AND id = ?
    LIMIT 1
  `
  ).get(r, i))
    throw new Error("Email not found");
  if (!le.prepare(
    `
    SELECT id FROM labels
    WHERE accountId = ? AND id = ?
    LIMIT 1
  `
  ).get(r, s))
    throw new Error("Label not found");
  return le.prepare(
    `
    INSERT OR IGNORE INTO email_labels (accountId, messageId, labelId, createdAt)
    VALUES (?, ?, ?, ?)
  `
  ).run(r, i, s, a), { success: !0 };
});
Ee.on("window-minimize", (e) => {
  gt.fromWebContents(e.sender)?.minimize();
});
Ee.on("window-maximize", (e) => {
  const t = gt.fromWebContents(e.sender);
  t && (t.isMaximized() ? t.unmaximize() : t.maximize());
});
Ee.on("window-close", (e) => {
  gt.fromWebContents(e.sender)?.close();
});
Ee.handle("microsoft-oauth:connect", async () => {
  const { clientId: e, tenantId: t, redirectUri: r, scope: i } = zo(), s = _o(dt.randomBytes(64)), a = _o(
    dt.createHash("sha256").update(s).digest()
  ), n = _o(dt.randomBytes(32)), f = new URL(r), o = `https://login.microsoftonline.com/${t}/oauth2/v2.0`, h = new URL(`${o}/authorize`);
  h.search = new URLSearchParams({
    client_id: e,
    response_type: "code",
    redirect_uri: r,
    response_mode: "query",
    scope: i,
    prompt: "select_account",
    code_challenge_method: "S256",
    code_challenge: a,
    state: n
  }).toString();
  const d = await new Promise((N, D) => {
    const I = _c.createServer((S, w) => {
      if (!S.url) return;
      const C = `${f.hostname}:${f.port}`;
      if (S.headers.host !== C) {
        w.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" }), w.end("Bad request.");
        return;
      }
      const _ = new URL(S.url, r);
      if (_.pathname !== f.pathname) {
        w.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }), w.end("Not found.");
        return;
      }
      const U = _.searchParams.get("state"), x = _.searchParams.get("code"), $ = _.searchParams.get("error"), F = _.searchParams.get("error_description");
      if ($) {
        w.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" }), w.end("Microsoft sign-in failed. You can close this window."), I.close(() => D(new Error(F || $)));
        return;
      }
      if (U !== n || !x) {
        w.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" }), w.end("Invalid sign-in response. You can close this window."), I.close(
          () => D(new Error("Invalid OAuth state or authorization code"))
        );
        return;
      }
      w.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" }), w.end(
        "Your Microsoft account is now connected. You can close this window."
      ), I.close(() => N(x));
    });
    I.once("error", (S) => D(S));
    const b = setTimeout(() => {
      I.close(
        () => D(new Error("Timed out waiting for Microsoft sign-in callback"))
      );
    }, rh);
    I.on("close", () => clearTimeout(b)), I.listen(Number(f.port), f.hostname, () => {
      iu.openExternal(h.toString()).catch((S) => {
        I.close(() => D(S));
      });
    });
  }), l = new URLSearchParams({
    client_id: e,
    grant_type: "authorization_code",
    code: d,
    redirect_uri: r,
    code_verifier: s,
    scope: i
  }), u = await fetch(`${o}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: l.toString()
  });
  if (!u.ok) {
    const N = await u.text();
    throw new Error(
      `Microsoft token exchange failed (${u.status}): ${N}`
    );
  }
  const p = await u.json(), E = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: {
      Authorization: `Bearer ${p.access_token}`
    }
  });
  if (!E.ok) {
    const N = await E.text();
    throw new Error(
      `Microsoft profile request failed (${E.status}): ${N}`
    );
  }
  const y = await E.json(), m = `ms-${y.id}`, T = y.mail || y.userPrincipalName;
  if (!T)
    throw new Error("Microsoft profile did not include an email address");
  const A = Or();
  return A[m] = {
    accountId: m,
    provider: "microsoft",
    accessToken: p.access_token,
    refreshToken: p.refresh_token,
    expiresAt: Date.now() + p.expires_in * 1e3,
    scope: p.scope,
    tokenType: p.token_type
  }, Xo(A), {
    account: {
      id: m,
      name: y.displayName || T,
      email: T,
      provider: "microsoft",
      externalId: y.id
    }
  };
});
Ee.handle("microsoft-account:delete", async (e, t) => {
  const r = Fe(t?.accountId);
  le.prepare("DELETE FROM emails WHERE accountId = ?").run(r);
  const i = Or();
  return i[r] && (delete i[r], Xo(i)), { success: !0 };
});
Ee.handle("microsoft-mail:send", async (e, t) => {
  const r = Fe(t?.accountId), i = Ke(t?.to, "to", 4096), s = qe(t?.cc, "cc", 4096), a = qe(t?.subject, "subject", 512), n = qe(t?.body, "body", 5e5), f = await Ze(r), o = {
    message: {
      subject: a || "(No subject)",
      body: {
        contentType: "html",
        content: uu(n || " ")
      },
      toRecipients: gc(i),
      ccRecipients: gc(s)
    },
    saveToSentItems: !0
  }, h = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${f}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(o)
  });
  if (!h.ok) {
    const d = await h.text();
    throw new Error(`Failed to send email: ${d}`);
  }
  return { success: !0 };
});
Ee.handle("microsoft-mail:syncInbox", async (e, t) => {
  const r = Fe(t?.accountId);
  if (mt.has(r))
    return mt.get(r);
  const i = (async () => {
    try {
      if (Jo(r))
        return await yn(r);
      const s = sh(r);
      return await gu(r, [s]);
    } finally {
      mt.delete(r);
    }
  })();
  return mt.set(r, i), i;
});
Ee.handle("labels:list", (e, t) => {
  const r = Fe(t?.accountId);
  return Ph(r);
});
Ee.handle("labels:delete", (e, t) => {
  const r = Fe(t?.accountId), i = gn(t?.labelId);
  if (le.transaction(() => (le.prepare(
    `
      DELETE FROM email_labels
      WHERE accountId = ? AND labelId = ?
    `
  ).run(r, i), le.prepare(
    `
      DELETE FROM labels
      WHERE accountId = ? AND id = ?
    `
  ).run(r, i)))().changes === 0)
    throw new Error("Label not found");
  return { success: !0 };
});
Ee.handle("labels:remove-email", (e, t) => {
  const r = Fe(t?.accountId), i = Pt(t?.messageId), s = gn(t?.labelId);
  return le.prepare(
    `
    DELETE FROM email_labels
    WHERE accountId = ? AND messageId = ? AND labelId = ?
  `
  ).run(r, i, s), { success: !0 };
});
Ee.handle("microsoft-mail:mark-read", async (e, t) => {
  const r = Fe(t?.accountId), { messageId: i, isRead: s } = t;
  if (!i) throw new Error("Missing messageId");
  le.prepare(
    "UPDATE emails SET isRead = ? WHERE id = ? AND accountId = ?"
  ).run(s ? 1 : 0, i, r), zo();
  const n = Mh(r);
  return n && qh(n.accessToken, i, { isRead: s }).catch(
    (f) => console.error("Failed background sync for mark-read:", f)
  ), !0;
});
Ee.handle("microsoft-mail:mark-unread", async (e, t) => {
  const r = Fe(t?.accountId), i = Pt(t?.messageId), s = await Ze(r), a = encodeURIComponent(i), n = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages/${a}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${s}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ isRead: !1 })
    }
  );
  if (!n.ok) {
    const f = await n.text();
    if (n.status === 404 || f.includes("ErrorItemNotFound"))
      return le.prepare("DELETE FROM emails WHERE accountId = ? AND id = ?").run(
        r,
        i
      ), { success: !1, missing: !0 };
    throw new Error(`Failed to mark message as unread: ${f}`);
  }
  return le.prepare("UPDATE emails SET isRead = 0 WHERE accountId = ? AND id = ?").run(
    r,
    i
  ), { success: !0 };
});
Ee.handle("microsoft-mail:getAllLocal", () => {
  const e = le.prepare(
    "SELECT * FROM folders ORDER BY accountId, path COLLATE NOCASE ASC"
  ).all(), t = le.prepare(
    `
    SELECT
      id, accountId, folder, subject, bodyPreview, bodyContentType, bodyContent,
      receivedDateTime, isRead, hasAttachments, isStarred, attachments,
      fromName, fromAddress, toRecipients, ccRecipients
    FROM emails
    ORDER BY receivedDateTime DESC
  `
  ).all(), r = {};
  for (const n of e)
    r[n.id] = Tu(
      t.filter((f) => f.folder === n.id)
    );
  const i = le.prepare("SELECT * FROM labels ORDER BY accountId, name COLLATE NOCASE ASC").all(), a = le.prepare(
    `
    SELECT el.messageId, l.id, l.accountId, l.name, l.color, l.createdAt, l.updatedAt
    FROM email_labels el
    INNER JOIN labels l ON l.id = el.labelId AND l.accountId = el.accountId
    ORDER BY l.name COLLATE NOCASE ASC
  `
  ).all().reduce(
    (n, f) => (n[f.messageId] || (n[f.messageId] = []), n[f.messageId].push({
      id: f.id,
      accountId: f.accountId,
      name: f.name,
      color: f.color,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt
    }), n),
    {}
  );
  return { folders: e, messagesByFolder: r, labels: i, labelsByMessageId: a };
});
Ee.handle("microsoft-mail:sync", async (e, t) => {
  const r = Fe(t?.accountId);
  if (mt.has(r))
    return mt.get(r);
  const i = (async () => {
    try {
      return Jo(r) ? await yn(r) : await Eu(r);
    } finally {
      mt.delete(r);
    }
  })();
  return mt.set(r, i), i;
});
Ee.handle("microsoft-mail:list", async (e, t) => {
  const r = Fe(t?.accountId);
  return _u(r) ? await Eu(r) : await yn(r), { messagesByFolder: Dh(r) };
});
Ee.removeHandler("microsoft-mail:get-body");
Ee.removeHandler("microsoft-mail:get-body");
Ee.handle("microsoft-mail:get-body", async (e, t) => {
  const r = Fe(t?.accountId), i = Pt(t?.messageId), s = le.prepare(
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
  ).get(r, i);
  if (!s)
    throw new Error("Message not found locally.");
  const a = nu(s.attachments);
  if (Qf({
    bodyContent: s.bodyContent,
    hasAttachments: !!s.hasAttachments,
    attachmentsJson: s.attachments
  }))
    return {
      success: !0,
      body: {
        content: s.bodyContent,
        contentType: s.bodyContentType || "html"
      },
      attachments: a,
      source: "local"
    };
  const n = await Ze(r), f = `https://graph.microsoft.com/v1.0/me/messages/${encodeURIComponent(
    i
  )}?$select=${encodeURIComponent("id,body,bodyPreview")}&$expand=${encodeURIComponent(
    "attachments($select=id,name,size,contentType,isInline)"
  )}`, o = await fetch(f, {
    headers: {
      Authorization: `Bearer ${n}`,
      Prefer: 'outlook.body-content-type="html", IdType="ImmutableId"'
    }
  });
  if (!o.ok) {
    const p = await o.text();
    if (console.error("Failed to fetch message body from Microsoft Graph:", {
      status: o.status,
      accountId: r,
      messageId: i,
      errorText: p
    }), s.bodyPreview?.trim())
      return {
        success: !0,
        body: {
          content: `<p>${oh(s.bodyPreview).replace(
            /\n/g,
            "<br/>"
          )}</p>`,
          contentType: "html"
        },
        source: "preview-fallback",
        warning: "Could not fetch the full email body from Microsoft Graph. Showing preview instead."
      };
    throw new Error(
      `Cannot access full message body. Microsoft Graph returned ${o.status}.`
    );
  }
  const h = await o.json(), d = h.body?.content || "", l = h.body?.contentType || "html", u = Array.isArray(h.attachments) ? h.attachments.filter(
    (p) => String(p?.["@odata.type"] || "").includes("fileAttachment")
  ).map((p) => ({
    id: p.id || "",
    name: p.name || "Unknown File",
    size: p.size || 0,
    contentType: p.contentType || "application/octet-stream",
    isInline: !!p.isInline,
    contentId: p.contentId || void 0
  })).filter((p) => p.id) : [];
  return le.prepare(
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
    d,
    l,
    JSON.stringify(u),
    h.bodyPreview || "",
    h.bodyPreview || "",
    r,
    i
  ), {
    success: !0,
    body: {
      content: d,
      contentType: l
    },
    attachments: u,
    source: "graph"
  };
});
Ee.handle("microsoft-mail:move-to-folder", async (e, t) => {
  const r = Fe(t?.accountId), i = Pt(t?.messageId), s = nr(t?.destinationFolderId);
  if (!le.prepare(
    `
      SELECT id
      FROM folders
      WHERE accountId = ? AND id = ?
      LIMIT 1
    `
  ).get(r, s))
    throw new Error("Destination folder not found");
  if (!le.prepare(
    `
      SELECT id
      FROM emails
      WHERE accountId = ? AND id = ?
      LIMIT 1
    `
  ).get(r, i))
    throw new Error("Email not found");
  const f = await Ze(r), o = await yu(
    f,
    i,
    s
  );
  return le.transaction(() => {
    le.prepare(
      `
      DELETE FROM emails
      WHERE accountId = ? AND id = ?
    `
    ).run(r, i), le.prepare(
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
      o.id,
      r,
      s,
      o.subject || "",
      o.bodyPreview || "",
      o.receivedDateTime || "",
      o.isRead ? 1 : 0,
      o.hasAttachments ? 1 : 0,
      o.from?.emailAddress?.name || "",
      o.from?.emailAddress?.address || "",
      JSON.stringify(o.toRecipients || []),
      JSON.stringify(o.ccRecipients || [])
    );
  })(), {
    success: !0,
    messageId: o.id,
    destinationFolderId: s
  };
});
Ee.handle("microsoft-mail:move", async (e, t) => {
  const r = Fe(t?.accountId), i = Pt(t?.messageId), s = _h(
    t?.destinationFolder
  ), a = await Ze(r), n = encodeURIComponent(i), o = le.prepare(
    `
    SELECT id FROM folders 
    WHERE accountId = ? AND wellKnownName = ? 
    LIMIT 1
  `
  ).get(r, s)?.id || s, h = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages/${n}/move`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${a}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        destinationId: s
      })
    }
  );
  if (!h.ok) {
    const l = await h.text();
    if (h.status === 404 || l.includes("ErrorItemNotFound"))
      return le.prepare("DELETE FROM emails WHERE accountId = ? AND id = ?").run(
        r,
        i
      ), {
        success: !1,
        alreadyMovedOrMissing: !0,
        message: "Message was not found on the server. Local stale copy was removed."
      };
    throw new Error(`Failed to move message on server: ${l}`);
  }
  const d = await h.json();
  return d.id ? le.prepare(
    "UPDATE emails SET folder = ?, id = ? WHERE accountId = ? AND id = ?"
  ).run(o, d.id, r, i) : le.prepare(
    "UPDATE emails SET folder = ? WHERE accountId = ? AND id = ?"
  ).run(o, r, i), { success: !0 };
});
const kh = [
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
].join("; "), $h = [
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
Xe.whenReady().then(() => {
  on.session.defaultSession.webRequest.onHeadersReceived(
    (e, t) => {
      t({
        responseHeaders: {
          ...e.responseHeaders,
          "Content-Security-Policy": [
            Xe.isPackaged ? kh : $h
          ]
        }
      });
    }
  ), on.session.defaultSession.setPermissionRequestHandler(
    (e, t, r) => r(!1)
  ), Ru(), Xe.isPackaged && setTimeout(() => {
    Dt.autoUpdater.checkForUpdates();
  }, 5e3);
});
Xe.on("window-all-closed", () => {
  process.platform !== "darwin" && Xe.quit();
});
Xe.on("activate", () => {
  gt.getAllWindows().length === 0 && Ru();
});
function Mh(e, t) {
  const i = Or()[e];
  if (!(!i || i.provider !== "microsoft" || i.accountId !== e))
    return i;
}
async function qh(e, t, r) {
  const i = encodeURIComponent(
    Ke(t, "messageId", 2048)
  ), s = !!r.isRead, a = `https://graph.microsoft.com/v1.0/me/messages/${i}`, n = JSON.stringify({ isRead: s });
  for (let f = 1; f <= Et; f += 1) {
    const o = await fetch(a, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${e}`,
        "Content-Type": "application/json"
      },
      body: n
    });
    if (o.ok)
      return;
    const h = await o.text();
    if (!(o.status === 429 || o.status === 500 || o.status === 502 || o.status === 503 || o.status === 504) || f === Et)
      throw new Error(
        `Microsoft Graph message update failed (${o.status}): ${h}`
      );
    await Tt(kr(o, f));
  }
  throw new Error("Microsoft Graph message update failed after retries");
}
