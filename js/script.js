document.getElementById("content").style.display = "none";
document.getElementById("result").style.display = "none";

var sf = new Snowflakes({
    color: "#ffd700",
    minSize: 20
});
var url_string = window.location.href; //window.location.href
var url = new URL(url_string);
var c = url.searchParams.get("name") || "mayn";
if (c != null) {
    document.getElementById("name").innerHTML = c;
    document.getElementById("nae").innerHTML = c;
}
$(".main").fadeOut(1);

var typed = new Typed("#typed", {
    stringsElement: "#typed-strings",
    typeSpeed: 30,
    backSpeed: 10,
    loop: true
});
var retina = window.devicePixelRatio,
    // Math shorthands
    PI = Math.PI,
    sqrt = Math.sqrt,
    round = Math.round,
    random = Math.random,
    cos = Math.cos,
    sin = Math.sin,

    // Local WindowAnimationTiming interface
    rAF = window.requestAnimationFrame,
    cAF = window.cancelAnimationFrame || window.cancelRequestAnimationFrame,
    _now = Date.now || function () {
        return new Date().getTime();
    };

// Local WindowAnimationTiming interface polyfill
(function (w) {
    /**
     * Fallback implementation.
     */
    var prev = _now();

    function fallback(fn) {
        var curr = _now();
        var ms = Math.max(0, 16 - (curr - prev));
        var req = setTimeout(fn, ms);
        prev = curr;
        return req;
    }

    /**
     * Cancel.
     */
    var cancel = w.cancelAnimationFrame ||
        w.webkitCancelAnimationFrame ||
        w.clearTimeout;

    rAF = w.requestAnimationFrame ||
        w.webkitRequestAnimationFrame ||
        fallback;

    cAF = function (id) {
        cancel.call(w, id);
    };
}(window));

document.addEventListener("DOMContentLoaded", function () {
    var speed = 50,
        duration = (1.0 / speed),
        confettiRibbonCount = 10,
        ribbonPaperCount = 15,
        ribbonPaperDist = 8.0,
        ribbonPaperThick = 8.0,
        confettiPaperCount = 10,
        DEG_TO_RAD = PI / 180,
        RAD_TO_DEG = 180 / PI,
        colors = [
            ["#df0049", "#660671"],
            ["#00e857", "#005291"],
            ["#2bebbc", "#05798a"],
            ["#ffd200", "#b06c00"]
        ];

    function Vector2(_x, _y) {
        this.x = _x, this.y = _y;
        this.Length = function () {
            return sqrt(this.SqrLength());
        }
        this.SqrLength = function () {
            return this.x * this.x + this.y * this.y;
        }
        this.Add = function (_vec) {
            this.x += _vec.x;
            this.y += _vec.y;
        }
        this.Sub = function (_vec) {
            this.x -= _vec.x;
            this.y -= _vec.y;
        }
        this.Div = function (_f) {
            this.x /= _f;
            this.y /= _f;
        }
        this.Mul = function (_f) {
            this.x *= _f;
            this.y *= _f;
        }
        this.Normalize = function () {
            var sqrLen = this.SqrLength();
            if (sqrLen != 0) {
                var factor = 1.0 / sqrt(sqrLen);
                this.x *= factor;
                this.y *= factor;
            }
        }
        this.Normalized = function () {
            var sqrLen = this.SqrLength();
            if (sqrLen != 0) {
                var factor = 1.0 / sqrt(sqrLen);
                return new Vector2(this.x * factor, this.y * factor);
            }
            return new Vector2(0, 0);
        }
    }
    Vector2.Lerp = function (_vec0, _vec1, _t) {
        return new Vector2((_vec1.x - _vec0.x) * _t + _vec0.x, (_vec1.y - _vec0.y) * _t + _vec0.y);
    }
    Vector2.Distance = function (_vec0, _vec1) {
        return sqrt(Vector2.SqrDistance(_vec0, _vec1));
    }
    Vector2.SqrDistance = function (_vec0, _vec1) {
        var x = _vec0.x - _vec1.x;
        var y = _vec0.y - _vec1.y;
        return (x * x + y * y + z * z);
    }
    Vector2.Scale = function (_vec0, _vec1) {
        return new Vector2(_vec0.x * _vec1.x, _vec0.y * _vec1.y);
    }
    Vector2.Min = function (_vec0, _vec1) {
        return new Vector2(Math.min(_vec0.x, _vec1.x), Math.min(_vec0.y, _vec1.y));
    }
    Vector2.Max = function (_vec0, _vec1) {
        return new Vector2(Math.max(_vec0.x, _vec1.x), Math.max(_vec0.y, _vec1.y));
    }
    Vector2.ClampMagnitude = function (_vec0, _len) {
        var vecNorm = _vec0.Normalized;
        return new Vector2(vecNorm.x * _len, vecNorm.y * _len);
    }
    Vector2.Sub = function (_vec0, _vec1) {
        return new Vector2(_vec0.x - _vec1.x, _vec0.y - _vec1.y, _vec0.z - _vec1.z);
    }

    function EulerMass(_x, _y, _mass, _drag) {
        this.position = new Vector2(_x, _y);
        this.mass = _mass;
        this.drag = _drag;
        this.force = new Vector2(0, 0);
        this.velocity = new Vector2(0, 0);
        this.AddForce = function (_f) {
            this.force.Add(_f);
        }
        this.Integrate = function (_dt) {
            var acc = this.CurrentForce(this.position);
            acc.Div(this.mass);
            var posDelta = new Vector2(this.velocity.x, this.velocity.y);
            posDelta.Mul(_dt);
            this.position.Add(posDelta);
            acc.Mul(_dt);
            this.velocity.Add(acc);
            this.force = new Vector2(0, 0);
        }
        this.CurrentForce = function (_pos, _vel) {
            var totalForce = new Vector2(this.force.x, this.force.y);
            var speed = this.velocity.Length();
            var dragVel = new Vector2(this.velocity.x, this.velocity.y);
            dragVel.Mul(this.drag * this.mass * speed);
            totalForce.Sub(dragVel);
            return totalForce;
        }
    }

    function ConfettiPaper(_x, _y) {
        this.pos = new Vector2(_x, _y);
        this.rotationSpeed = (random() * 600 + 800);
        this.angle = DEG_TO_RAD * random() * 360;
        this.rotation = DEG_TO_RAD * random() * 360;
        this.cosA = 1.0;
        this.size = 5.0;
        this.oscillationSpeed = (random() * 1.5 + 0.5);
        this.xSpeed = 40.0;
        this.ySpeed = (random() * 60 + 50.0);
        this.corners = new Array();
        this.time = random();
        var ci = round(random() * (colors.length - 1));
        this.frontColor = colors[ci][0];
        this.backColor = colors[ci][1];
        for (var i = 0; i < 4; i++) {
            var dx = cos(this.angle + DEG_TO_RAD * (i * 90 + 45));
            var dy = sin(this.angle + DEG_TO_RAD * (i * 90 + 45));
            this.corners[i] = new Vector2(dx, dy);
        }
        this.Update = function (_dt) {
            this.time += _dt;
            this.rotation += this.rotationSpeed * _dt;
            this.cosA = cos(DEG_TO_RAD * this.rotation);
            this.pos.x += cos(this.time * this.oscillationSpeed) * this.xSpeed * _dt
            this.pos.y += this.ySpeed * _dt;
            if (this.pos.y > ConfettiPaper.bounds.y) {
                this.pos.x = random() * ConfettiPaper.bounds.x;
                this.pos.y = 0;
            }
        }
        this.Draw = function (_g) {
            if (this.cosA > 0) {
                _g.fillStyle = this.frontColor;
            } else {
                _g.fillStyle = this.backColor;
            }
            _g.beginPath();
            _g.moveTo((this.pos.x + this.corners[0].x * this.size) * retina, (this.pos.y + this.corners[0].y * this.size * this.cosA) * retina);
            for (var i = 1; i < 4; i++) {
                _g.lineTo((this.pos.x + this.corners[i].x * this.size) * retina, (this.pos.y + this.corners[i].y * this.size * this.cosA) * retina);
            }
            _g.closePath();
            _g.fill();
        }
    }
    ConfettiPaper.bounds = new Vector2(0, 0);

    function ConfettiRibbon(_x, _y, _count, _dist, _thickness, _angle, _mass, _drag) {
        this.particleDist = _dist;
        this.particleCount = _count;
        this.particleMass = _mass;
        this.particleDrag = _drag;
        this.particles = new Array();
        var ci = round(random() * (colors.length - 1));
        this.frontColor = colors[ci][0];
        this.backColor = colors[ci][1];
        this.xOff = (cos(DEG_TO_RAD * _angle) * _thickness);
        this.yOff = (sin(DEG_TO_RAD * _angle) * _thickness);
        this.position = new Vector2(_x, _y);
        this.prevPosition = new Vector2(_x, _y);
        this.velocityInherit = (random() * 2 + 4);
        this.time = random() * 100;
        this.oscillationSpeed = (random() * 2 + 2);
        this.oscillationDistance = (random() * 40 + 40);
        this.ySpeed = (random() * 40 + 80);
        for (var i = 0; i < this.particleCount; i++) {
            this.particles[i] = new EulerMass(_x, _y - i * this.particleDist, this.particleMass, this.particleDrag);
        }
        this.Update = function (_dt) {
            var i = 0;
            this.time += _dt * this.oscillationSpeed;
            this.position.y += this.ySpeed * _dt;
            this.position.x += cos(this.time) * this.oscillationDistance * _dt;
            this.particles[0].position = this.position;
            var dX = this.prevPosition.x - this.position.x;
            var dY = this.prevPosition.y - this.position.y;
            var delta = sqrt(dX * dX + dY * dY);
            this.prevPosition = new Vector2(this.position.x, this.position.y);
            for (i = 1; i < this.particleCount; i++) {
                var dirP = Vector2.Sub(this.particles[i - 1].position, this.particles[i].position);
                dirP.Normalize();
                dirP.Mul((delta / _dt) * this.velocityInherit);
                this.particles[i].AddForce(dirP);
            }
            for (i = 1; i < this.particleCount; i++) {
                this.particles[i].Integrate(_dt);
            }
            for (i = 1; i < this.particleCount; i++) {
                var rp2 = new Vector2(this.particles[i].position.x, this.particles[i].position.y);
                rp2.Sub(this.particles[i - 1].position);
                rp2.Normalize();
                rp2.Mul(this.particleDist);
                rp2.Add(this.particles[i - 1].position);
                this.particles[i].position = rp2;
            }
            if (this.position.y > ConfettiRibbon.bounds.y + this.particleDist * this.particleCount) {
                this.Reset();
            }
        }
        this.Reset = function () {
            this.position.y = -random() * ConfettiRibbon.bounds.y;
            this.position.x = random() * ConfettiRibbon.bounds.x;
            this.prevPosition = new Vector2(this.position.x, this.position.y);
            this.velocityInherit = random() * 2 + 4;
            this.time = random() * 100;
            this.oscillationSpeed = random() * 2.0 + 1.5;
            this.oscillationDistance = (random() * 40 + 40);
            this.ySpeed = random() * 40 + 80;
            var ci = round(random() * (colors.length - 1));
            this.frontColor = colors[ci][0];
            this.backColor = colors[ci][1];
            this.particles = new Array();
            for (var i = 0; i < this.particleCount; i++) {
                this.particles[i] = new EulerMass(this.position.x, this.position.y - i * this.particleDist, this.particleMass, this.particleDrag);
            }
        };
        this.Draw = function (_g) {
            for (var i = 0; i < this.particleCount - 1; i++) {
                var p0 = new Vector2(this.particles[i].position.x + this.xOff, this.particles[i].position.y + this.yOff);
                var p1 = new Vector2(this.particles[i + 1].position.x + this.xOff, this.particles[i + 1].position.y + this.yOff);
                if (this.Side(this.particles[i].position.x, this.particles[i].position.y, this.particles[i + 1].position.x, this.particles[i + 1].position.y, p1.x, p1.y) < 0) {
                    _g.fillStyle = this.frontColor;
                    _g.strokeStyle = this.frontColor;
                } else {
                    _g.fillStyle = this.backColor;
                    _g.strokeStyle = this.backColor;
                }
                if (i == 0) {
                    _g.beginPath();
                    _g.moveTo(this.particles[i].position.x * retina, this.particles[i].position.y * retina);
                    _g.lineTo(this.particles[i + 1].position.x * retina, this.particles[i + 1].position.y * retina);
                    _g.lineTo(((this.particles[i + 1].position.x + p1.x) * 0.5) * retina, ((this.particles[i + 1].position.y + p1.y) * 0.5) * retina);
                    _g.closePath();
                    _g.stroke();
                    _g.fill();
                    _g.beginPath();
                    _g.moveTo(p1.x * retina, p1.y * retina);
                    _g.lineTo(p0.x * retina, p0.y * retina);
                    _g.lineTo(((this.particles[i + 1].position.x + p1.x) * 0.5) * retina, ((this.particles[i + 1].position.y + p1.y) * 0.5) * retina);
                    _g.closePath();
                    _g.stroke();
                    _g.fill();
                } else if (i == this.particleCount - 2) {
                    _g.beginPath();
                    _g.moveTo(this.particles[i].position.x * retina, this.particles[i].position.y * retina);
                    _g.lineTo(this.particles[i + 1].position.x * retina, this.particles[i + 1].position.y * retina);
                    _g.lineTo(((this.particles[i].position.x + p0.x) * 0.5) * retina, ((this.particles[i].position.y + p0.y) * 0.5) * retina);
                    _g.closePath();
                    _g.stroke();
                    _g.fill();
                    _g.beginPath();
                    _g.moveTo(p1.x * retina, p1.y * retina);
                    _g.lineTo(p0.x * retina, p0.y * retina);
                    _g.lineTo(((this.particles[i].position.x + p0.x) * 0.5) * retina, ((this.particles[i].position.y + p0.y) * 0.5) * retina);
                    _g.closePath();
                    _g.stroke();
                    _g.fill();
                } else {
                    _g.beginPath();
                    _g.moveTo(this.particles[i].position.x * retina, this.particles[i].position.y * retina);
                    _g.lineTo(this.particles[i + 1].position.x * retina, this.particles[i + 1].position.y * retina);
                    _g.lineTo(p1.x * retina, p1.y * retina);
                    _g.lineTo(p0.x * retina, p0.y * retina);
                    _g.closePath();
                    _g.stroke();
                    _g.fill();
                }
            }
        }
        this.Side = function (x1, y1, x2, y2, x3, y3) {
            return ((x1 - x2) * (y3 - y2) - (y1 - y2) * (x3 - x2));
        }
    }
    ConfettiRibbon.bounds = new Vector2(0, 0);
    confetti = {};
    confetti.Context = function (id) {
        var i = 0;
        var canvas = document.getElementById(id);
        var canvasParent = canvas.parentNode;
        var canvasWidth = canvasParent.offsetWidth;
        var canvasHeight = canvasParent.offsetHeight;
        canvas.width = canvasWidth * retina;
        canvas.height = canvasHeight * retina;
        var context = canvas.getContext('2d');
        var interval = null;
        var confettiRibbons = new Array();
        ConfettiRibbon.bounds = new Vector2(canvasWidth, canvasHeight);
        for (i = 0; i < confettiRibbonCount; i++) {
            confettiRibbons[i] = new ConfettiRibbon(random() * canvasWidth, -random() * canvasHeight * 2, ribbonPaperCount, ribbonPaperDist, ribbonPaperThick, 45, 1, 0.05);
        }
        var confettiPapers = new Array();
        ConfettiPaper.bounds = new Vector2(canvasWidth, canvasHeight);
        for (i = 0; i < confettiPaperCount; i++) {
            confettiPapers[i] = new ConfettiPaper(random() * canvasWidth, random() * canvasHeight);
        }
        this.resize = function () {
            canvasWidth = canvasParent.offsetWidth;
            canvasHeight = canvasParent.offsetHeight;
            canvas.width = canvasWidth * retina;
            canvas.height = canvasHeight * retina;
            ConfettiPaper.bounds = new Vector2(canvasWidth, canvasHeight);
            ConfettiRibbon.bounds = new Vector2(canvasWidth, canvasHeight);
        }
        this.start = function () {
            this.stop()
            var context = this;
            this.update();
        }
        this.stop = function () {
            cAF(this.interval);
        }
        this.update = function () {
            var i = 0;
            context.clearRect(0, 0, canvas.width, canvas.height);
            for (i = 0; i < confettiPaperCount; i++) {
                confettiPapers[i].Update(duration);
                confettiPapers[i].Draw(context);
            }
            for (i = 0; i < confettiRibbonCount; i++) {
                confettiRibbons[i].Update(duration);
                confettiRibbons[i].Draw(context);
            }
            this.interval = rAF(function () {
                confetti.update();
            });
        }
    };

    var confetti = new confetti.Context('confetti');
    confetti.start();
    window.addEventListener('resize', function (event) {
        confetti.resize();
    });
});

/* Candle */
const canvas = document.getElementById('c');
const stage = document.getElementById('stage');
const ctx = canvas.getContext('2d', { alpha: true });

let DPR = Math.max(1, window.devicePixelRatio || 1);

function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * DPR);
    canvas.height = Math.round(rect.height * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', () => { resize(); });

const scene = {
    candle: {
        xRatio: 0.50,
        yRatio: 0.50,
        widthRatio: 0.12,
        heightRatio: 0.38,
        lit: false,
        wickHeight: 12,
        flame: { t: 0 }
    },
    lighter: {
        x: 0, y: 0,
        w: 72, h: 120,
        dragging: false,
        offsetX: 0, offsetY: 0,
        hasFlame: true,
        flameOn: false,
        visible: true
    },
    particles: []
};

function updateSizes() {
    const W = canvas.width / DPR;
    const H = canvas.height / DPR;
    const cw = W * scene.candle.widthRatio;
    const ch = H * scene.candle.heightRatio;
    scene.candle.w = cw;
    scene.candle.h = ch;
    scene.candle.x = W * scene.candle.xRatio;
    scene.candle.y = H * scene.candle.yRatio;
    scene.lighter.w = Math.max(60, Math.min(140, W * 0.22));
    scene.lighter.h = Math.max(80, Math.min(180, H * 0.25));
    scene.lighter.x = W * 0.78 - scene.lighter.w / 2;
    scene.lighter.y = H * 0.7 - scene.lighter.h / 2;
}
resize();
updateSizes();

function dist(ax, ay, bx, by) { const dx = ax - bx, dy = ay - by; return Math.sqrt(dx * dx + dy * dy); }
function rand(min, max) { return Math.random() * (max - min) + min; }

function drawCandle() {
    const { x, y, w, h, wickHeight, lit } = scene.candle;
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.ellipse(0, h * 0.5, w * 0.55, h * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fill();

    const bodyGrad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    bodyGrad.addColorStop(0, '#fffef6');
    bodyGrad.addColorStop(0.6, '#fff8e6');
    bodyGrad.addColorStop(1, '#f1e3c8');
    ctx.fillStyle = bodyGrad;
    roundRect(ctx, -w / 2, -h / 2, w, h, w * 0.12);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(0, -h / 2 + 8, w * 0.48, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fffdf2';
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(-4, -h / 2 + 2, 8, 6);

    ctx.beginPath();
    ctx.fillStyle = '#323232';
    ctx.fillRect(-1, -h / 2 + 8, 2, wickHeight);

    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.6, w * 0.85, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.ellipse(x - w * 0.18, y - h * 0.1, w * 0.08, w * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawWickFlame() {
    const { x, y, w, h, wickHeight } = scene.candle;
    const flameBaseX = x;
    const flameBaseY = y - h / 2 + 8;
    if (!scene.candle.lit) return;

    scene.candle.flame.t += 0.05;
    const t = scene.candle.flame.t;
    const flick = 1 + Math.sin(t * 3) * 0.07 + (Math.random() * 0.02);
    const flameHeight = 36 * flick;
    const flameWidth = 18 * (0.8 + Math.sin(t * 2) * 0.12);

    const coreGrad = ctx.createRadialGradient(flameBaseX, flameBaseY - flameHeight * 0.5, 2, flameBaseX, flameBaseY - flameHeight * 0.2, flameHeight);
    coreGrad.addColorStop(0, 'rgba(255,255,200,0.98)');
    coreGrad.addColorStop(0.4, 'rgba(255,160,70,0.9)');
    coreGrad.addColorStop(1, 'rgba(255,110,20,0.05)');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(flameBaseX, flameBaseY - 2);
    ctx.bezierCurveTo(flameBaseX + flameWidth * 0.6, flameBaseY - flameHeight * 0.4, flameBaseX + flameWidth * 0.2, flameBaseY - flameHeight, flameBaseX, flameBaseY - flameHeight * 1.1);
    ctx.bezierCurveTo(flameBaseX - flameWidth * 0.2, flameBaseY - flameHeight, flameBaseX - flameWidth * 0.6, flameBaseY - flameHeight * 0.4, flameBaseX, flameBaseY - 2);
    ctx.closePath();
    ctx.fillStyle = coreGrad;
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(255,160,70,0.6)';
    ctx.fill();

    ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath();
    ctx.ellipse(flameBaseX, flameBaseY - flameHeight * 0.5, flameWidth * 1.2, flameHeight * 0.9, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,140,40,0.12)';
    ctx.fill();

    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';

    if (Math.random() < 0.4) {
        scene.particles.push({
            x: flameBaseX + rand(-6, 6),
            y: flameBaseY - flameHeight * 0.2,
            vx: rand(-0.15, 0.15),
            vy: rand(-0.6, -1.6),
            life: 30 + Math.random() * 30,
            size: 1 + Math.random() * 2,
            color: `rgba(255,${160 + Math.floor(Math.random() * 60)},${40 + Math.floor(Math.random() * 60)}, ${0.9})`
        });
    }
}

function updateParticles() {
    for (let i = scene.particles.length - 1; i >= 0; i--) {
        const p = scene.particles[i];
        p.x += p.vx; p.y += p.vy; p.life--;
        p.vy -= 0.02;
        p.size *= 0.995;
        if (p.life <= 0 || p.y < -50) scene.particles.splice(i, 1);
    }
    scene.particles.forEach(p => {
        ctx.beginPath();
        ctx.fillStyle = p.color.replace(/0\.[0-9]+\)/, (p.life / 60).toString() + ')') || p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 70));
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.globalAlpha = 1;
    });
}

function drawLighter() {
    const L = scene.lighter;
    const { x, y, w, h } = L;
    ctx.save();
    ctx.beginPath();
    roundRect(ctx, x, y, w, h, 10);
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fill();

    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#ffdfe6');
    g.addColorStop(1, '#ffeef3');
    ctx.fillStyle = g;
    roundRect(ctx, x + 2, y + 2, w - 4, h - 4, 10);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,117,143,0.12)';
    ctx.fillRect(x + w * 0.12, y + h * 0.18, w * 0.74, h * 0.14);

    ctx.fillStyle = '#c7c7c7';
    roundRect(ctx, x + w * 0.12, y + 6, w * 0.76, h * 0.18, 6);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x + w * 0.84, y + h * 0.2, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#444';
    ctx.fill();

    if (L.flameOn) {
        const fx = x + w * 0.44;
        const fy = y + h * 0.06;
        drawMiniLighterFlame(fx, fy, (performance.now() % 1000) / 1000);
    } else {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.ellipse(x + w * 0.5, y + h * 0.06, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
    if (L.dragging) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 2;
        roundRect(ctx, x - 6, y - 6, w + 12, h + 12, 14);
        ctx.stroke();
        ctx.restore();
    }
}

function drawMiniLighterFlame(cx, cy, t) {
    const flick = 1 + Math.sin(t * 20) * 0.08;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(cx, cy - 6, 2, cx, cy - 18 * flick, 18);
    g.addColorStop(0, 'rgba(255,255,200,1)');
    g.addColorStop(0.5, 'rgba(255,150,70,0.9)');
    g.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 8 * flick, 6 * flick, 12 * flick, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
}

function lighterTipPos() {
    const L = scene.lighter;
    return { x: L.x + L.w * 0.5, y: L.y + 6 };
}

function wickPos() {
    const c = scene.candle;
    return { x: c.x, y: c.y - c.h / 2 + 8 };
}

let last = performance.now();
function loop(now) {
    const dt = (now - last) / 1000;
    last = now;
    ctx.clearRect(0, 0, canvas.width / DPR, canvas.height / DPR);
    drawCandle();
    if (scene.lighter.visible) drawLighter();

    if (scene.candle.lit) {
        drawWickFlame();
        updateParticles();
    }

    const tip = lighterTipPos();
    const wick = wickPos();
    const d = dist(tip.x, tip.y, wick.x, wick.y);
    if (scene.lighter.flameOn && d < Math.max(18, scene.lighter.w * 0.5)) {
        scene.candle.lit = true;
    }

    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function onPointerDown(e) {
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left);
    const py = (e.clientY - rect.top);
    const L = scene.lighter;
    if (px >= L.x && px <= L.x + L.w && py >= L.y && py <= L.y + L.h) {
        scene.lighter.dragging = true;
        scene.lighter.offsetX = px - L.x;
        scene.lighter.offsetY = py - L.y;
        scene.lighter.flameOn = true;
        if (e.pointerId) canvas.setPointerCapture(e.pointerId);
    }
}
function onPointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left);
    const py = (e.clientY - rect.top);
    if (scene.lighter.dragging) {
        const W = canvas.width / DPR, H = canvas.height / DPR;
        scene.lighter.x = Math.max(6, Math.min(W - scene.lighter.w - 6, px - scene.lighter.offsetX));
        scene.lighter.y = Math.max(6, Math.min(H - scene.lighter.h - 6, py - scene.lighter.offsetY));
    }
}
function onPointerUp(e) {
    if (scene.lighter.dragging) {
        scene.lighter.dragging = false;
        const tip = lighterTipPos();
        const wick = wickPos();
        const d = dist(tip.x, tip.y, wick.x, wick.y);
        if (d > Math.max(18, scene.lighter.w * 0.5)) {
            setTimeout(() => scene.lighter.flameOn = false, 150);
        } else {
            setTimeout(() => scene.lighter.flameOn = false, 2500);
        }
    } else {
        const rect = canvas.getBoundingClientRect();
        const px = (e.clientX - rect.left);
        const py = (e.clientY - rect.top);
        const L = scene.lighter;
        if (px >= L.x && px <= L.x + L.w && py >= L.y && py <= L.y + L.h) {
            scene.lighter.flameOn = !scene.lighter.flameOn;

            setTimeout(() => { scene.lighter.visible = false; }, 250);

            setTimeout(() => {
                $(".loader").fadeOut(1500);
                $(".main").fadeIn("slow");
                $(".balloon-border").animate({
                    top: -500
                }, 8000);
                var audio = $(".song")[0];
                audio.play();

                document.getElementById("content").style.display = "block";
                sf.destroy();
            }, 1500);
        }
    }
    if (e.pointerId) {
        try { canvas.releasePointerCapture(e.pointerId); } catch (e) { }
    }
}

canvas.addEventListener('pointerdown', onPointerDown);
canvas.addEventListener('pointermove', onPointerMove);
canvas.addEventListener('pointerup', onPointerUp);
canvas.addEventListener('pointercancel', onPointerUp);
canvas.addEventListener('pointerleave', onPointerUp);

function init() {
    resize();
    updateSizes();
    scene.lighter.x = canvas.width / DPR * 0.78 - scene.lighter.w / 2;
    scene.lighter.y = canvas.height / DPR * 0.72 - scene.lighter.h / 2;
}

init();
window.addEventListener('orientationchange', () => { setTimeout(() => { resize(); updateSizes(); }, 120); });

/* Scroll Page */
let currentScroll = 0;
let isScrolling = false;
const step = window.innerHeight;

function scrollToStep() {
    window.scrollTo({
        top: currentScroll,
        behavior: "smooth"
    });
}

window.addEventListener("wheel", (e) => {
    if (isScrolling) return;
    isScrolling = true;

    if (e.deltaY > 0) {
        currentScroll += step;
    } else {
        currentScroll -= step;
    }

    currentScroll = Math.max(0, Math.min(currentScroll, document.body.scrollHeight - step));

    scrollToStep();

    setTimeout(() => {
        isScrolling = false;
    }, 800);
});

let startY = 0;
window.addEventListener("touchstart", e => startY = e.touches[0].clientY);
window.addEventListener("touchend", e => {
    if (isScrolling) return;
    const endY = e.changedTouches[0].clientY;
    const diff = startY - endY;
    if (Math.abs(diff) < 50) return;

    isScrolling = true;
    if (diff > 0) currentScroll += step;
    else currentScroll -= step;

    currentScroll = Math.max(0, Math.min(currentScroll, document.body.scrollHeight - step));
    scrollToStep();

    setTimeout(() => {
        isScrolling = false;
    }, 800);
});

/* Check-in */
let photoLists = [];
const checkinBtn = document.getElementById("checkinBtn");
const video = document.getElementById("cam");
const canvasPhoto = document.getElementById("canvasPhoto");
const snapBtn = document.getElementById("snapBtn");
const img = document.getElementById("photo");
const result = document.querySelector("#result div");

video.style.display = "none";
snapBtn.style.display = "none";
canvasPhoto.style.display = "none";
img.style.display = "none";

checkinBtn.onclick = () => {
    video.style.display = "block";
    snapBtn.style.display = "block";
    canvasPhoto.style.display = "block";
    checkinBtn.style.display = "none";

    document.querySelector(".main").style.zIndex = "1";
    StartCamera(video, canvasPhoto, snapBtn, img);
}

function StartCamera(video, canvas, snap, img) {
    const cam = new Webcam(video, "user", canvas);

    cam.start().then(() => {
        snap.onclick = () => {
            if (snap.textContent == "Chụp") {
                let picture = cam.snap();

                video.style.display = "none";
                snapBtn.style.display = "none";
                canvasPhoto.style.display = "none";
                img.style.display = "block";

                img.src = picture;
                img.style.display = "block";

                if (!photoLists.includes(picture))
                    photoLists.push(picture);

                document.getElementById("result").style.display = "block";

                PrintImage();

                setTimeout(() => {
                    checkinBtn.textContent = "Chụp tiếp";
                    img.style.display = "none";
                    checkinBtn.style.display = "block";
                    video.style.display = "block";
                    canvasPhoto.style.display = "block";
                }, 1200);
            } else if (snap.textContent == "Chụp tiếp") {
                snap.textContent = "Chụp";
            }
        }
    }).catch(err => {
        console.log(err);
    })
}

function PrintImage() {
    console.log(photoLists);
    result.innerHTML = "";
    if (photoLists.length > 0) {
        photoLists.forEach((p, i) => {
            let img = document.createElement("img");
            img.src = p;

            result.appendChild(img);
        });
    } else {
        for (let i = 0; i < 4; i++) {
            let img = document.createElement("img");
            result.appendChild(img);
        }
    }
}