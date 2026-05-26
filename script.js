// HTML 문서에서 필요한 요소들(입력창, 버튼 등)을 찾아와서 이름을 붙여줍니다.
const form = document.getElementById('saju-form');
const resultSection = document.getElementById('result-section');
const stoneImage = document.getElementById('stone-image');
const stoneName = document.getElementById('stone-name');
const stoneDescription = document.getElementById('stone-description');
const resetBtn = document.getElementById('reset-btn');

// 5가지 기운(나무, 불, 흙, 쇠, 물)에 따른 천연석 추천 정보입니다.
const stones = [
    {
        element: '나무(木)',
        name: '어벤츄린 (Aventurine)',
        description: '나무의 기운이 부족할 때 성장을 돕고 마음에 평안을 주는 초록빛 원석입니다. 스트레스를 줄여주고 긍정적인 에너지를 불어넣어 줍니다.',
        image: 'images/aventurine_1779795885223.png' // AI가 생성한 어벤츄린 사진
    },
    {
        element: '불(火)',
        name: '가넷 (Garnet)',
        description: '불의 기운이 부족할 때 열정과 활력을 채워주는 붉은 원석입니다. 자신감을 높여주고 목표를 향해 나아갈 수 있는 에너지를 줍니다.',
        image: 'images/garnet_1779795902942.png' // AI가 생성한 가넷 사진
    },
    {
        element: '흙(土)',
        name: '호안석 (Tiger\'s Eye)',
        description: '흙의 기운이 부족할 때 중심을 잡아주고 재물운을 돕는 원석입니다. 불안한 마음을 진정시키고 흔들림 없는 용기를 줍니다.',
        image: 'images/tigers_eye_1779795916884.png' // AI가 생성한 호안석 사진
    },
    {
        element: '쇠(金)',
        name: '백수정 (Clear Quartz)',
        description: '쇠의 기운이 부족할 때 맑고 깨끗한 에너지로 나쁜 기운을 정화해 주는 원석입니다. 결단력을 높여주고 머리를 맑게 해줍니다.',
        image: 'images/clear_quartz_1779795933106.png' // AI가 생성한 백수정 사진
    },
    {
        element: '물(水)',
        name: '아쿠아마린 (Aquamarine)',
        description: '물의 기운이 부족할 때 막힌 흐름을 원활하게 해주고 지혜를 주는 푸른 원석입니다. 대인관계를 부드럽게 하고 소통을 돕습니다.',
        image: 'images/aquamarine_1779795946122.png' // AI가 생성한 아쿠아마린 사진
    }
];

// 사용자가 폼(입력창)에서 '나의 천연석 찾기' 버튼을 눌렀을 때 실행됩니다.
form.addEventListener('submit', function(event) {
    // 버튼을 누르면 페이지가 새로고침 되는 웹의 기본 현상을 막아줍니다.
    event.preventDefault(); 

    // 사용자가 입력한 생년월일을 가져옵니다. (예: "1990-01-01")
    const birthDate = document.getElementById('birth-date').value;
    
    // 만약 날짜가 제대로 입력되지 않았다면 여기서 멈춥니다.
    if (!birthDate) return;

    // 생년월일 글자에서 연, 월, 일 숫자를 뽑아내어 모두 더해줍니다.
    const numbers = birthDate.split('-'); // ["1990", "01", "01"] 형태로 분리
    const sum = parseInt(numbers[0]) + parseInt(numbers[1]) + parseInt(numbers[2]);
    
    // 숫자를 모두 더한 값을 5로 나누어 나머지(0, 1, 2, 3, 4 중 하나)를 구합니다.
    const lackIndex = sum % 5;
    
    // 구해진 숫자를 바탕으로 부족한 기운에 맞는 천연석을 선택합니다.
    const recommendedStone = stones[lackIndex];

    // 결과 화면에 선택된 천연석의 이름과 설명을 글씨로 넣어줍니다.
    stoneName.innerText = recommendedStone.name;
    stoneDescription.innerText = recommendedStone.description;
    
    // 기존의 그라데이션 대신, AI가 생성한 천연석 사진을 배경 이미지로 넣어줍니다.
    stoneImage.style.backgroundImage = 'url(' + recommendedStone.image + ')';

    // 입력창은 눈에서 안 보이게 숨기고, 결과를 보여주는 영역을 화면에 나타냅니다.
    form.classList.add('hidden');
    resultSection.classList.remove('hidden');
});

// 결과 화면에서 '다시 하기' 버튼을 눌렀을 때 실행됩니다.
resetBtn.addEventListener('click', function() {
    // 입력되어 있던 생년월일과 시간 칸을 빈칸으로 깨끗하게 지워줍니다.
    document.getElementById('birth-date').value = '';
    document.getElementById('birth-time').value = '';
    
    // 결과 화면을 숨기고, 다시 처음의 입력창을 화면에 나타냅니다.
    resultSection.classList.add('hidden');
    form.classList.remove('hidden');
});
