const canvas = document.getElementById('noiseCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
const particleCount = 2000;
let mouse = { x: 0, y: 0 };
let lastMouseMoveTime = Date.now();
let hintX, hintY;
let hintTimer;

const popupMessages = [
    "即座に閉じてください。",
    "後ろを見て。",
    "逃げられない。",
    "特異点",
    "カブト虫",
    "カブト虫",
    "カブト虫",
    "イチジクのタルト",
    "らせん階段",
    "ジョット",
    "エンジェル",
    "廃墟の街",
    "ドロローサへの道",
    "紫陽花",
    "特異点",
    "秘密の皇帝",
    "カブト虫",
    "あなたのPCは監視されています",
    "やめて。",
    "どこへ行くの？",
    "見ているよ",
    "削除を開始します...",
    "致命的な例外が発生しました",
    "諦めなさい",
    "20s",
    "...",
    "助けて",
    "滲みだす混濁の紋章",
    "不遜なる狂気の器",
    "湧き上がり・否定し",
    "痺れ・瞬き",
    "眠りを妨げる",
    "爬行する鉄の王女",
    "絶えず自壊する泥の人形",
    "結合せよ反発せよ",
    "地に満ち己の無力を知れ",
    "破道の九十『黒棺』",
    "待て、しかして希望せよ"
];

const secretCodes = [12525, 12531, 12480, 12491, 12540, 12491, 12398, 40658, 29356];
let secretMessage = String.fromCharCode(...secretCodes);

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
}

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 2 + 1;
        this.color = `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 0.8)`;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
    }

    update() {
        // マウスとの距離計算
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = 200; // マウスの影響範囲
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < maxDistance) {
            // マウスに近い場合、激しく動く (騒がしい動き)
            this.x -= directionX * 5 + (Math.random() - 0.5) * 20; 
            this.y -= directionY * 5 + (Math.random() - 0.5) * 20;
            this.color = `rgba(255, ${Math.random()*100}, 0, 1)`; // 赤っぽく変化
        } else {
            // 通常の動き
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx/10;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy/10;
            }
            // ランダムなノイズ
            this.x += (Math.random() - 0.5) * 4;
            this.y += (Math.random() - 0.5) * 4;
            this.color = `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 0.5)`;
        }
        
        // 操作がない場合のヒント位置への集約
        handleInactiveAttraction(this);
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function handleInactiveAttraction(particle) {
    const now = Date.now();
    const timeSinceLastMove = now - lastMouseMoveTime;
    
    // 5秒以上操作がない場合
    if (timeSinceLastMove > 5000) {
        // 5秒周期で2秒間だけ集まる
        if ((timeSinceLastMove % 5000) < 2000) {
            let dx = hintX - particle.x;
            let dy = hintY - particle.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 0) {
                // 強力に引き寄せる
                particle.x += (dx / distance) * 10;
                particle.y += (dy / distance) * 10;
            }
        }
    }
}

function createStaticNoise() {
    const w = width;
    const h = height;
    const idata = ctx.getImageData(0, 0, w, h);
    // ランダムにピクセルをいじる (軽量化: drawRectで代用)
    for (let i = 0; i < 1000; i++) {
        const x = Math.floor(Math.random() * w);
        const y = Math.floor(Math.random() * h);
        ctx.fillStyle = Math.random() > 0.5 ? '#FFF' : '#000';
        ctx.fillRect(x, y, 2, 2);
    }
}

function drawHiddenMessage() {
    if (Math.random() > 0.98) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((Math.random() - 0.5) * 0.5); 
        ctx.font = `${Math.random() * 20 + 10}px 'Courier New'`;
        const alpha = Math.random() * 0.3; 
        ctx.fillStyle = `rgba(200, 200, 200, ${alpha})`;
        ctx.fillText(secretMessage, 0, 0);
        ctx.restore();
    }
}

function drawGlitchLines() {
    if (Math.random() > 0.1) return; // 10%の確率で描画フレーム

    const lineCount = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < lineCount; i++) {
        const y = Math.random() * height;
        const h = Math.random() * 50 + 2; // 太さ
        const w = Math.random() * width;
        const x = Math.random() * width;
        
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0, 255, 255, 0.5)' : 'rgba(255, 0, 255, 0.5)'; // シアン or マゼンタ
        ctx.fillRect(0, y, width, h); // 全幅
        
        // 断片的なノイズも
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(x, y, Math.random() * 100, Math.random() * 5);
    }
}

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }

    createStaticNoise();
    drawGlitchLines(); // 追加
    drawHiddenMessage();

    requestAnimationFrame(animate);
}

function createPopup(x, y) {
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.style.left = (x !== undefined ? x : Math.random() * (window.innerWidth - 300)) + 'px';
    popup.style.top = (y !== undefined ? y : Math.random() * (window.innerHeight - 150)) + 'px';

    const header = document.createElement('div');
    header.className = 'popup-header';
    header.innerHTML = '<span>警告</span>';

    const closeBtn = document.createElement('div');
    closeBtn.className = 'popup-close';
    closeBtn.innerText = '×';
    closeBtn.onclick = (e) => {
        e.stopPropagation();
        document.body.removeChild(popup);
        spawnPopups(3);
    };

    const body = document.createElement('div');
    body.className = 'popup-body';
    body.innerText = popupMessages[Math.floor(Math.random() * popupMessages.length)];

    header.appendChild(closeBtn);
    popup.appendChild(header);
    popup.appendChild(body);
    document.body.appendChild(popup);
}

function spawnPopups(count) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            createPopup();
        }, i * 100);
    }
}

// ヒント座標を事前に決定
function setHintPosition() {
    hintX = Math.random() * (window.innerWidth - 200);
    hintY = Math.random() * (window.innerHeight - 50);
}

function startHintTimer() {
    if (hintTimer) clearTimeout(hintTimer);
    hintTimer = setTimeout(() => {
        showSecretHint();
    }, 20000); // 20秒間操作がない場合に表示
}

function showSecretHint() {
    // 既にヒントがある場合は作成しない
    if (document.querySelector('.secret-hint')) return;

    const hint = document.createElement('div');
    hint.className = 'secret-hint';
    hint.style.left = hintX + 'px';
    hint.style.top = hintY + 'px';
    hint.innerText = secretMessage;
    document.body.appendChild(hint);
    console.log("Hint spawned at", hintX, hintY);
}

// Event Listeners
window.addEventListener('resize', () => {
    resize();
    setHintPosition();
});
window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
    lastMouseMoveTime = Date.now();
    startHintTimer(); // マウスが動いたらタイマーリセット
});

// Initialization
resize();
setHintPosition();
animate();

// Initial Popup
setTimeout(() => {
    createPopup(window.innerWidth / 2 - 150, window.innerHeight / 2 - 75);
}, 1000);

// Hint Timer Start
startHintTimer();

// --- DevTools Countermeasures ---
setInterval(() => {
    const msg1 = document.createElement('div');
    msg1.innerText = 'デベロッパーツール閉じろ';
    msg1.style.display = 'none';
    document.body.appendChild(msg1);

    const msg2 = document.createElement('div');
    msg2.innerText = '不正禁止';
    msg2.style.display = 'none';
    document.body.appendChild(msg2);
    
    // コンソールにもスパム
    console.warn("デベロッパーツール閉じろ");
    console.error("不正禁止");
}, 1000);

// --- Canvas Persistence (Anti-Tamper) ---
const canvasObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.target === canvas) {
            const style = window.getComputedStyle(canvas);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                canvas.style.display = 'block';
                canvas.style.visibility = 'visible';
                canvas.style.opacity = '1';
                console.warn("キャンバスの非表示は許可されていません");
            }
        }
    });
});
canvasObserver.observe(canvas, { attributes: true, attributeFilter: ['style', 'class', 'hidden'] });

const bodyObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
            if (node === canvas) {
                document.body.appendChild(canvas);
                console.warn("キャンバスの削除は許可されていません");
            }
        });
    });
});
bodyObserver.observe(document.body, { childList: true });
