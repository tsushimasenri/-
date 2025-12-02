const canvas = document.getElementById('wheel-canvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spin-button');
const resultEl = document.getElementById('result');
const optionsListEl = document.getElementById('options-list');
const addOptionBtn = document.getElementById('add-option');
const presetSelect = document.getElementById('preset-select');

// --- 更新後的預設選單定義 ---
const PRESET_OPTIONS = {
    'classic': [
        "炸雞", "雞排", "鐵板燒", "台式便當", "自助餐", 
        "麥當勞", "拉麵", "燒肉", "火鍋", "義大利麵"
    ],
    'japanese': [
        "壽司/生魚片", "日式拉麵", "丼飯", "燒肉", "串燒",
        "章魚燒", "大阪燒", "咖哩飯", "居酒屋", "烏龍麵"
    ],
    'american': [
        "美式漢堡", "披薩", "炸物拼盤", "熱狗堡", "牛排",
        "烤肋排", "美式沙拉", "冰淇淋", "Taco", "墨西哥捲"
    ],
    'nightmarket': [
        "臭豆腐", "地瓜球", "大腸包小腸", "藥燉排骨", "滷味",
        "沙威瑪", "碳烤雞排", "現打果汁", "蚵仔煎", "套圈圈 (當飯吃)"
    ],
    'convenience': [
        "茶葉蛋", "涼麵", "御飯糰", "微波便當", "關東煮",
        "熱狗", "三明治", "義大利麵", "沙拉", "包子"
    ],
    'drinks': [
        "50嵐", "清心福全", "CoCo都可", "迷客夏", "可不可熟成紅茶", 
        "大苑子", "再睡五分鐘", "龜記茗品", "珍煮丹", "麻古茶坊"
    ],
    'fastfood': [
        "麥當勞", "肯德基", "摩斯漢堡", "頂呱呱", "漢堡王", 
        "Subway", "吉野家", "丹丹漢堡", "拿坡里", "隨便！"
    ],
    'custom': [] 
};

// --- 核心變數 (保持不變) ---
let options = [...PRESET_OPTIONS.classic]; 
const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#F7DC6F", "#A569BD", 
    "#F4B393", "#E37B40", "#C1E1A6", "#B3E2FF", "#E9897E",
    "#FFD700", "#C0C0C0" 
];
let isSpinning = false;
let customOptionsSnapshot = []; 

// --------------------- A. 繪製邏輯 (指針對齊修正) ---------------------

function drawWheel() {
    const numOptions = options.length;
    const arcSize = (2 * Math.PI) / numOptions;
    const radius = canvas.width / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'right';
    ctx.font = '16px Arial';

    // 核心修正：加入繪製偏移量 (-Math.PI / 2 = -90度)，讓第一個扇形的中心對準指針 (頂部)
    const offset = -Math.PI / 2; 

    options.forEach((option, i) => {
        // 角度計算加上偏移量
        const startAngle = i * arcSize + offset;
        const endAngle = (i + 1) * arcSize + offset;
        const color = colors[i % colors.length];

        // 繪製扇形
        ctx.beginPath();
        ctx.arc(radius, radius, radius, startAngle, endAngle);
        ctx.lineTo(radius, radius);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff'; 
        ctx.lineWidth = 2;
        ctx.stroke();

        // 繪製文字
        ctx.save();
        ctx.fillStyle = '#333';
        ctx.translate(radius, radius);
        // 文字旋轉角度也需要加上偏移量
        ctx.rotate(startAngle + arcSize / 2);
        ctx.fillText(option, radius * 0.9, 10);
        ctx.restore();
    });
}


// --------------------- B. 旋轉邏輯 (指針對齊修正) ---------------------

spinBtn.addEventListener('click', () => {
    if (isSpinning) return;
    if (options.length < 2) { 
        resultEl.innerHTML = '請至少新增 **兩個** 選項！';
        return;
    }
    
    isSpinning = true;
    spinBtn.disabled = true;
    resultEl.textContent = '轉盤啟動中...';

    const numOptions = options.length;
    const arcSize = 360 / numOptions; 
    const prizeIndex = Math.floor(Math.random() * numOptions); // 隨機選中的選項索引
    
    // 計算停止角度：將選中項目的中心線轉到 0 度 (指針位置)
    const stopAngle = 360 - (prizeIndex * arcSize + arcSize / 2); 
    
    // 總旋轉圈數
    const minTurns = 5; 
    const maxTurns = 10;
    const totalRotation = 
        (Math.floor(Math.random() * (maxTurns - minTurns + 1)) + minTurns) * 360 + 
        stopAngle; 

    // 應用旋轉
    canvas.style.transform = `rotate(${totalRotation}deg)`;

    // 動畫結束
    setTimeout(() => {
        isSpinning = false;
        spinBtn.disabled = false;
        const result = options[prizeIndex];
        resultEl.innerHTML = `🎉 **恭喜！今日美食是：${result}** 🎉`;
        
        // 重設 CSS 確保下次旋轉平滑
        const finalAngle = totalRotation % 360;
        canvas.style.transition = 'none';
        canvas.style.transform = `rotate(${finalAngle}deg)`; 
        setTimeout(() => {
            canvas.style.transition = 'transform 6s cubic-bezier(0.2, 0.9, 0.2, 1)';
        }, 10); 
        
    }, 6000); // 需與 CSS transition-duration 一致
});


// --------------------- C. 選項管理與選單切換 (保持不變) ---------------------

function renderOptions() {
    optionsListEl.innerHTML = '';
    options.forEach((option, index) => {
        const div = document.createElement('div');
        div.className = 'option-item';
        div.innerHTML = `
            <input type="text" value="${option}" data-index="${index}">
            <button class="remove-btn" data-index="${index}">X</button>
        `;
        optionsListEl.appendChild(div);
    });
    drawWheel();
}

optionsListEl.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT') {
        const index = parseInt(e.target.dataset.index);
        options[index] = e.target.value;
        if (presetSelect.value === 'custom') {
            customOptionsSnapshot = [...options]; 
        }
        drawWheel(); 
    }
});

optionsListEl.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-btn')) {
        const index = parseInt(e.target.dataset.index);
        options.splice(index, 1);
        if (presetSelect.value === 'custom') {
            customOptionsSnapshot = [...options];
        }
        renderOptions(); 
    }
});

addOptionBtn.addEventListener('click', () => {
    options.push(`新選項 ${options.length + 1}`);
    if (presetSelect.value === 'custom') {
        customOptionsSnapshot = [...options];
    }
    renderOptions();
});

presetSelect.addEventListener('change', (e) => {
    const selectedKey = e.target.value;
    
    if (selectedKey !== 'custom' && presetSelect.value === 'custom') {
        customOptionsSnapshot = [...options];
    }
    
    if (selectedKey === 'custom') {
        options = customOptionsSnapshot.length > 0 ? [...customOptionsSnapshot] : [];
    } else {
        options = [...PRESET_OPTIONS[selectedKey]];
    }
    
    resultEl.textContent = '轉盤選項已更新。';
    renderOptions();
});


// --------------------- D. 初始化 (保持不變) ---------------------

document.addEventListener('DOMContentLoaded', () => {
    // 確保選單切換時能正確載入預設選項
    const initialKey = presetSelect.value;
    options = [...PRESET_OPTIONS[initialKey]]; 
    renderOptions();
});
