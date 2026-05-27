// HTML 문서에서 요소들을 찾아옵니다.
const form = document.getElementById('saju-form');
const resultSection = document.getElementById('result-section');
const resultTitle = document.getElementById('result-title');
const resetBtn = document.getElementById('reset-btn');
const elementText = document.getElementById('element-text');
const recommendedStonesContainer = document.getElementById('recommended-stones-container');

// ✅ 양력/음력 토글 함수 - 버튼 클릭 시 호출됩니다
function setCalendar(type) {
    document.getElementById('calendar-type').value = type;
    // 양력 버튼 활성화 상태 전환
    document.getElementById('btn-solar').classList.toggle('active', type === 'solar');
    // 음력 버튼 활성화 상태 전환
    document.getElementById('btn-lunar').classList.toggle('active', type === 'lunar');
}

const sajuOverallText = document.getElementById('saju-overall-text');
const fortuneGeneralText = document.getElementById('fortune-general-text');
const fortuneWealthText = document.getElementById('fortune-wealth-text');
const fortuneBusinessText = document.getElementById('fortune-business-text');
const fortuneLoveText = document.getElementById('fortune-love-text');

// ✅ 14가지 개별 천연석 데이터
// 원석 사진: images/stone/원석명.png
// 팔찌 사진: images/bracelet/원석명_bra.png
const stones = {
    '목': [
        {
            name: '그린 아벤츄린 (Green Aventurine)',
            short_desc: '성장을 돕고 마음에 평안을 주는 초록빛 원석',
            long_desc: '어벤츄린은 대자연의 싱그러운 생명력을 머금어, 마음 깊은 곳의 불안감을 부드럽게 녹여주고 막혀 있던 일들이 서서히 풀려나가게 돕습니다.',
            image: 'images/stone/GreenAventurine.png',
            bracelet_image: 'images/bracelet/GreenAventurine_bra.png'
        },
        {
            name: '말라카이트 (Malachite)',
            short_desc: '강력한 치유와 보호, 내면의 성장을 돕는 원석',
            long_desc: '말라카이트는 부정적인 에너지를 흡수하고 마음의 상처를 깊숙이 치유하며, 정체된 기운을 뚫고 나갈 수 있는 강한 생명력을 부여해 줍니다.',
            image: 'images/stone/Malachite.png',
            bracelet_image: 'images/bracelet/Malachite_bra.png'
        },
        {
            name: '페리도트 (Peridot)',
            short_desc: '부정적인 감정을 씻어내고 번영을 이끄는 원석',
            long_desc: '페리도트는 태양의 에너지를 담아 두려움과 원망을 씻어내며, 긍정적인 방향을 바라보게 하고 삶에 맑고 밝은 활력을 불어넣어 줍니다.',
            image: 'images/stone/Peridot.png',
            bracelet_image: 'images/bracelet/Peridot_bra.png'
        }
    ],
    '화': [
        {
            name: '가넷 (Garnet)',
            short_desc: '열정과 활력을 채워주는 진홍빛 원석',
            long_desc: '가넷은 꺼지지 않는 뜨거운 열망을 끌어올려, 삶에 강력한 추진력과 흔들림 없는 자신감을 불어넣어 주는 불의 상징입니다.',
            image: 'images/stone/Garnet.png',
            bracelet_image: 'images/bracelet/Garnet_bra.png'
        },
        {
            name: '카넬리안 (Carnelian)',
            short_desc: '용기와 동기 부여, 창의성을 일깨우는 원석',
            long_desc: '카넬리안은 무기력함을 씻어내고 온몸에 활기를 돌게 하며, 목표를 향해 나아갈 때 마주치는 장애물을 뛰어넘을 에너지를 줍니다.',
            image: 'images/stone/Carnelian.png',
            bracelet_image: 'images/bracelet/Carnelian_bra.png'
        },
        {
            name: '레드 재스퍼 (Red Jasper)',
            short_desc: '안정감과 체력, 깊은 인내심을 주는 원석',
            long_desc: '레드 재스퍼는 불의 기운을 다독이며 끈기와 체력을 더해주어, 어떤 상황에서도 쉽게 지치지 않고 목표에 도달할 수 있도록 돕습니다.',
            image: 'images/stone/RedJasper.png',
            bracelet_image: 'images/bracelet/RedJasper_bra.png'
        }
    ],
    '토': [
        {
            name: '타이거 아이 (Tiger\'s Eye)',
            short_desc: '중심을 잡아주고 든든한 재물운을 돕는 원석',
            long_desc: '호안석은 흔들리는 마음에 단단한 뿌리를 내리게 하며, 결단력이 필요한 순간 예리한 판단을 돕고 금전적인 기운을 끌어모아 줍니다.',
            image: 'images/stone/TigerEye.png',
            bracelet_image: 'images/bracelet/TigerEye_bra.png'
        },
        {
            name: '시트린 (Citrine)',
            short_desc: '금전운과 풍요, 그리고 자신감을 심어주는 원석',
            long_desc: '시트린은 따뜻한 햇살 같은 에너지를 발산하여 내면의 부정적인 생각을 지우고 풍요로움과 부를 끌어당기는 자석 역할을 합니다.',
            image: 'images/stone/Citrine.png',
            bracelet_image: 'images/bracelet/Citrine_bra.png'
        },
        {
            name: '스모키 쿼츠 (Smoky Quartz)',
            short_desc: '현실 감각과 스트레스 해소를 돕는 흑갈색 원석',
            long_desc: '스모키 쿼츠는 주변의 나쁜 기운으로부터 자신을 방어하고, 과도한 생각과 스트레스를 땅으로 흘려보내어 안정감을 선사합니다.',
            image: 'images/stone/SmokyQuartz.png',
            bracelet_image: 'images/bracelet/SmokyQuartz_bra.png'
        }
    ],
    '금': [
        {
            name: '클리어 쿼츠 (Clear Quartz)',
            short_desc: '맑고 깨끗한 에너지로 정화해 주는 투명 원석',
            long_desc: '백수정은 주변의 나쁜 에너지를 스펀지처럼 흡수하고 안개가 걷힌 맑은 하늘처럼 머릿속을 명쾌하게 비워 이성적인 판단을 극대화합니다.',
            image: 'images/stone/ClearQuartz.png',
            bracelet_image: 'images/bracelet/ClearQuartz_bra.png'
        },
        {
            name: '헤마타이트 (Hematite)',
            short_desc: '강력한 집중력과 굳건한 방어력을 지닌 원석',
            long_desc: '헤마타이트는 외부의 스트레스와 부정적인 영향을 강하게 차단하며, 차분하게 이성을 찾고 문제의 핵심에 집중할 수 있도록 돕습니다.',
            image: 'images/stone/Hematite.png',
            bracelet_image: 'images/bracelet/Hematite_bra.png'
        },
        {
            name: '화이트 하울라이트 (White Howlite)',
            short_desc: '분노를 조절하고 깊은 평온함을 주는 원석',
            long_desc: '화이트 하울라이트는 극도로 예민해진 신경을 가라앉히고 불필요한 감정 소모를 끊어내어 내면의 완전한 평화를 되찾도록 돕습니다.',
            image: 'images/stone/WhiteHowlite.png',
            bracelet_image: 'images/bracelet/WhiteHowlite_bra.png'
        }
    ],
    '수': [
        {
            name: '라피스 라줄리 (Lapis Lazuli)',
            short_desc: '깊은 통찰력과 진실된 소통을 이끄는 푸른 원석',
            long_desc: '라피스 라줄리는 마음속 깊은 곳의 진실을 마주하게 하고, 복잡한 문제를 마주했을 때 지혜롭고 순리대로 해결할 수 있는 직관력을 줍니다.',
            image: 'images/stone/LapisLazuli.png',
            bracelet_image: 'images/bracelet/LapisLazuli_bra.png'
        },
        {
            name: '블랙 옵시디언 (Black Obsidian)',
            short_desc: '나쁜 에너지를 강력히 차단하고 정화하는 흑색 원석',
            long_desc: '블랙 옵시디언은 타인과의 관계에서 오는 부정적 에너지를 거울처럼 반사시켜 막아주며, 막힌 흐름을 빠르고 시원하게 트이게 해줍니다.',
            image: 'images/stone/BlackObsidian.png',
            bracelet_image: 'images/bracelet/BlackObsidian_bra.png'
        },
        {
            name: '아쿠아마린 (Aquamarine)',
            short_desc: '막힌 흐름을 원활하게 해주고 깊은 지혜를 주는 푸른 원석',
            long_desc: '아쿠아마린은 잔잔한 바다의 에너지를 담아, 굳어있던 마음을 촉촉하게 적시고 타인과의 관계를 부드럽고 매끄럽게 연결해 줍니다. 마음속에 담아둔 진심을 가장 아름다운 언어로 표현할 수 있는 소통의 마법을 선사합니다.',
            image: 'images/stone/Aquamarine.png',
            bracelet_image: 'images/bracelet/Aquamarine_bra.png'
        }
    ]
};

// 방대한 운세 텍스트
const sajuTexts = {
    overall: `사용자님의 사주는 한마디로 '깊은 산속에 우뚝 솟은 큰 나무가 따뜻한 햇살을 받아 마침내 화려한 꽃을 피워내는 형국'이라고 할 수 있습니다. \n\n타고난 본성은 매우 따뜻하고 다정하며, 남들이 보지 못하는 세밀한 부분까지 챙기는 섬세한 배려심을 지니고 있습니다. 겉으로는 조용하고 부드러워 보이지만, 내면에는 어떤 비바람이 몰아쳐도 절대 꺾이지 않는 강인한 인내심과 단단한 자존심이 깊게 뿌리내리고 있습니다. 초년에는 마치 흙 속에 묻힌 보석처럼 자신의 진가를 세상에 제대로 인정받지 못해 남몰래 마음고생을 하거나 이리저리 방황하는 시기가 있었을 수 있습니다. 남들에게는 쉽게 말 못 할 외로움이나, 노력한 만큼 결과가 바로 나타나지 않아 답답함을 느꼈던 순간들도 적지 않았을 것입니다. \n\n하지만 사용자님의 진정한 저력은 바로 그 기다림의 시간 속에서 완성되었습니다. 세월이 흐를수록 그동안 차곡차곡 쌓아온 경험과 내공이 찬란한 빛을 발하기 시작하는 대기만성형(大器晩成型)의 훌륭한 명식(命式)을 타고나셨습니다. 한 번 목표를 정하면 중간에 포기하지 않고 끝까지 밀어붙이는 우직함이 있으며, 특유의 성실함과 책임감 덕분에 주변 사람들에게 '어떤 일을 맡겨도 믿을 수 있는 사람'이라는 깊은 신뢰를 얻게 됩니다. \n\n특히 올해를 기점으로 사용자님의 사주에는 막혀 있던 운의 흐름이 뻥 뚫리고, 인생의 새로운 전성기가 시작되는 거대한 운의 교차점이 다가오고 있습니다. 그동안은 자신이 가진 능력의 30%밖에 발휘하지 못했다면, 이제부터는 100%, 200%의 기량을 온전히 세상에 펼칠 수 있는 완벽한 무대가 마련됩니다. 봄날의 대지가 얼음을 녹이고 새싹을 틔우듯, 과거의 힘들었던 기억이나 실패의 상처들은 모두 앞으로의 큰 성공을 위한 훌륭한 거름이 될 것입니다. \n\n인간관계에 있어서는 사람을 한 번 믿기까지 시간이 오래 걸리지만, 한 번 내 사람이라고 생각하면 간과 쓸개까지 모두 내어줄 정도로 의리가 깊습니다. 다만, 지나치게 남을 배려하다가 정작 자신이 감당해야 할 짐이 무거워져 홀로 상처받는 경우가 있으니, 때로는 자신의 이익을 먼저 챙기고 단호하게 '거절하는 용기'를 가지는 것이 남은 인생을 더욱 풍요롭고 평안하게 만드는 가장 중요한 열쇠가 될 것입니다.`,
    general: `올해는 사용자님의 인생에서 잊을 수 없는 '황금의 수확기'가 될 것입니다. 지난 몇 년간 땀 흘려 씨앗을 뿌리고 정성껏 가꾸어 온 일들이 드디어 눈부신 결실을 맺는 시기입니다. 연초부터 예상치 못한 곳에서 좋은 소식이 들려오며, 꽉 막혀있던 문제들이 눈 녹듯 스르르 풀려나가는 것을 경험하게 됩니다. 가장 중요한 열쇠는 '과감한 도전'과 '자신감'입니다. 평소라면 주저하고 망설였을 일이라도, 올해만큼은 긍정적인 마음으로 일단 부딪혀보는 것이 좋습니다.`,
    wealth: `올해의 재물운은 마치 '마르지 않는 깊은 우물'과 같이 끊임없이 재물이 솟아나는 형국입니다. 특히 하반기로 갈수록 금전적인 운이 최고조에 달하며, 예상치 못한 보너스, 투자 수익, 혹은 과거에 잊고 있었던 돈이 들어오는 등 뜻밖의 횡재수도 강하게 들어와 있습니다. 직장인이라면 승진과 함께 연봉이 크게 오를 수 있는 절호의 기회가 찾아오고, 사업자라면 매출이 급성장하여 창고에 재물이 가득 쌓이는 기쁨을 누리게 됩니다.`,
    business: `사업 및 직장운에 있어서 올해는 '날개를 달고 비상하는 호랑이'의 모습입니다. 직장에서는 그동안의 성실함과 능력을 직속 상사나 결정권자에게 확실하게 인정받아, 아주 중요한 핵심 프로젝트를 맡게 되거나 한 단계 높은 자리로 고속 승진할 수 있는 강력한 운기가 들어와 있습니다. 사업을 하시는 분이라면 새로운 거래처가 늘어나고 훌륭한 파트너를 만나 사업의 규모를 크게 확장할 수 있는 최고의 시기입니다.`,
    love: `올해의 연애 및 대인관계 운은 '따뜻한 봄바람에 활짝 핀 도화꽃'처럼 화사하고 아름답습니다. 싱글이신 분이라면 올봄부터 여름 사이에 당신의 마음을 단번에 사로잡을 운명적인 인연이 나타날 가능성이 매우 큽니다. 이미 연인이 있거나 기혼자이신 경우에는 두 사람 사이의 애정이 그 어느 때보다 깊고 단단해집니다. 대인관계에서도 당신의 부드러운 매력과 소통 능력이 빛을 발하여, 어딜 가나 사람들의 중심에 서게 됩니다.`
};

form.addEventListener('submit', function(event) {
    event.preventDefault();

    const userName = document.getElementById('user-name').value;
    const birthDate = document.getElementById('birth-date').value;
    const birthTime = document.getElementById('birth-time').value;
    // 양력/음력 선택 값 가져오기
    const calendarType = document.getElementById('calendar-type').value;
    const calendarLabel = calendarType === 'solar' ? '양력' : '음력';
    // 시간 표시용 레이블 (오전/오후 구분)
    let timeLabel = '';
    if (birthTime) {
        const hour = parseInt(birthTime.split(':')[0]);
        timeLabel = (hour < 12 ? ' 오전 ' : ' 오후 ') + birthTime;
    }

    if (!userName || !birthDate) return;

    // 결과 제목에 이름, 양력/음력, 시간 정보 표시
    resultTitle.innerText = userName + '님의 오행 결과';
    // 생년월일 + 양력/음력 + 시간 정보를 부제목으로 표시
    document.getElementById('result-sub-info').innerText =
        calendarLabel + ' ' + birthDate + (timeLabel ? timeLabel : '');

    // 오행 막대 그래프 (Mock 데이터)
    const mockCounts = { 'wood': 3, 'fire': 1, 'earth': 2, 'metal': 1, 'water': 1 };
    const total = 8;
    document.getElementById('bar-wood').style.width = (mockCounts.wood / total * 100) + '%';
    document.getElementById('count-wood').innerText = mockCounts.wood;
    document.getElementById('bar-fire').style.width = (mockCounts.fire / total * 100) + '%';
    document.getElementById('count-fire').innerText = mockCounts.fire;
    document.getElementById('bar-earth').style.width = (mockCounts.earth / total * 100) + '%';
    document.getElementById('count-earth').innerText = mockCounts.earth;
    document.getElementById('bar-metal').style.width = (mockCounts.metal / total * 100) + '%';
    document.getElementById('count-metal').innerText = mockCounts.metal;
    document.getElementById('bar-water').style.width = (mockCounts.water / total * 100) + '%';
    document.getElementById('count-water').innerText = mockCounts.water;

    // 운세 텍스트 표시
    sajuOverallText.innerText = sajuTexts.overall;
    fortuneGeneralText.innerText = sajuTexts.general;
    fortuneWealthText.innerText = sajuTexts.wealth;
    fortuneBusinessText.innerText = sajuTexts.business;
    fortuneLoveText.innerText = sajuTexts.love;

    // 부족한 기운 계산 및 천연석 추천 카드 동적 생성
    const numbers = birthDate.split('-');
    const sum = parseInt(numbers[0]) + parseInt(numbers[1]) + parseInt(numbers[2]);
    const elements = ['목', '화', '토', '금', '수'];
    const lackingElement = elements[sum % 5];
    const recommendedList = stones[lackingElement];

    elementText.innerHTML = '분석 결과, 사용자님은 <strong>' + lackingElement + '</strong> 기운이 가장 필요합니다.<br>이 기운을 꽉 채워줄 <strong>' + recommendedList.length + '가지 천연석</strong>을 추천해 드립니다.';

    // 이전 카드 모두 지우고 새로 생성
    recommendedStonesContainer.innerHTML = '';
    recommendedList.forEach(stone => {
        recommendedStonesContainer.innerHTML += `
            <div class="stone-card">
                <!-- 원석 이미지: 클릭하면 새 탭으로 구매 페이지 열기 (href는 추후 실제 URL로 교체) -->
                <a href="#" target="_blank" class="stone-image-link">
                    <div class="stone-image-placeholder" style="background-image: url('${stone.image}');"></div>
                </a>
                <!-- 팔찌 이미지: 클릭하면 새 탭으로 구매 페이지 열기 (href는 추후 실제 URL로 교체) -->
                <a href="#" target="_blank" class="stone-image-link">
                    <div class="bracelet-image-placeholder" style="background-image: url('${stone.bracelet_image}');"></div>
                </a>
                <h3>${stone.name}</h3>
                <p class="stone-short-desc">${stone.short_desc}</p>
                <div class="stone-long-desc">
                    <h4>원석 심층 분석</h4>
                    <p>${stone.long_desc}</p>
                </div>
            </div>`;
    });

    form.classList.add('hidden');
    resultSection.classList.remove('hidden');
    window.scrollTo({ top: resultSection.offsetTop - 20, behavior: 'smooth' });
});

resetBtn.addEventListener('click', function() {
    document.getElementById('user-name').value = '';
    document.getElementById('birth-date').value = '';
    // 다시하기 시 오전(06:00)으로 기본값 복원
    document.getElementById('birth-time').value = '06:00';
    // 양력으로 초기화
    setCalendar('solar');
    resultSection.classList.add('hidden');
    form.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
