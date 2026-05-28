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

// ✅ 성별 토글 함수 - 버튼 클릭 시 호출됩니다
function setGender(gender) {
    document.getElementById('user-gender').value = gender;
    // 남성 버튼 활성화 상태 전환
    document.getElementById('btn-male').classList.toggle('active', gender === 'male');
    // 여성 버튼 활성화 상태 전환
    document.getElementById('btn-female').classList.toggle('active', gender === 'female');
}


// 페이지가 켜졌을 때 .env 파일에서 최신 API 키를 자동으로 읽어와 로컬 저장소에 동기화합니다.
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('.env');
        if (response.ok) {
            const text = await response.text();
            const lines = text.split('\n');
            let envKey = null;
            for (let line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('SAJU_API_KEY=')) {
                    envKey = trimmedLine.split('=')[1]?.trim();
                    break;
                }
            }
            if (envKey) {
                const savedKey = localStorage.getItem('saju_api_key');
                // 저장된 키가 없거나, .env에 설정된 최신 키와 다를 경우 자동으로 덮어씁니다.
                if (savedKey !== envKey) {
                    localStorage.setItem('saju_api_key', envKey);
                    console.log('API 키가 최신 설정(.env) 정보로 동기화되었습니다.');
                }
            }
        }
    } catch (error) {
        console.log('.env 파일을 불러올 수 없어 로컬 기존 인증키를 유지하거나 대기 상태로 전환합니다.', error);
    }
});

// ✅ 한문(한글) 형태의 간지 문자열에서 한글과 한자를 분리하는 헬퍼 함수입니다.
// 예: "을미(乙未)" -> { kr: "을미", hj: "乙未" }
function parseGanji(ganjiStr) {
    if (!ganjiStr) return { kr: '-', hj: '-' };
    const match = ganjiStr.match(/^([^(]+)\(([^)]+)\)$/);
    if (match) {
        return { kr: match[1], hj: match[2] };
    }
    return { kr: ganjiStr, hj: ganjiStr };
}

// ✅ 한국천문연구원 API를 활용하여 음력 날짜를 양력 날짜로 변환해주는 비동기 함수입니다.
async function convertLunarToSolar(year, month, day, apiKey) {
    const apiUrl = `https://apis.data.go.kr/B090041/openapi/service/LrsrCldInfoService/getSolCalInfo?lunYear=${year}&lunMonth=${month}&lunDay=${day}&ServiceKey=${encodeURIComponent(apiKey)}&cb=${Date.now()}`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) {
        throw new Error('프록시 서버 응답에 실패했습니다. (CORS 우회 오류)');
    }
    
    const xmlString = await response.text();
    
    if (!xmlString || xmlString.includes('Unauthorized') || xmlString.includes('unauthorized') || xmlString.trim() === 'Unauthorized' || xmlString.includes('Server-side requests')) {
        throw new Error('공공데이터 API 인증키가 아직 활성화되지 않았거나 승인 대기 중입니다. (포털에서 가입 완료 및 승인 후 실제 연동 적용까지 약 1~2시간 가량 소요될 수 있습니다.)');
    }
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    const parserError = xmlDoc.getElementsByTagName('parsererror')[0];
    if (parserError) {
        throw new Error('공공데이터 응답 데이터 해석에 실패했습니다. (인증키 미등록 또는 서비스 차단 상태)');
    }
    
    const resultCode = xmlDoc.getElementsByTagName('resultCode')[0]?.textContent;
    const resultMsg = xmlDoc.getElementsByTagName('resultMsg')[0]?.textContent || '상세 사유 없음';
    
    if (!resultCode || resultCode !== '00') {
        throw new Error(`${resultMsg} (인증 상태 점검 필요, 코드: ${resultCode || '없음'})`);
    }
    
    const solYear = xmlDoc.getElementsByTagName('solYear')[0]?.textContent;
    const solMonth = xmlDoc.getElementsByTagName('solMonth')[0]?.textContent;
    const solDay = xmlDoc.getElementsByTagName('solDay')[0]?.textContent;
    const lunLeapmonth = xmlDoc.getElementsByTagName('lunLeapmonth')[0]?.textContent;
    const solWeek = xmlDoc.getElementsByTagName('solWeek')[0]?.textContent;
    const lunSecha = xmlDoc.getElementsByTagName('lunSecha')[0]?.textContent;
    const lunWolgeon = xmlDoc.getElementsByTagName('lunWolgeon')[0]?.textContent;
    const lunIljin = xmlDoc.getElementsByTagName('lunIljin')[0]?.textContent;
    const solJd = xmlDoc.getElementsByTagName('solJd')[0]?.textContent;
    
    if (!solYear || !solMonth || !solDay) {
        throw new Error('양력 변환 데이터가 누락되었습니다.');
    }
    
    return {
        solYear,
        solMonth: String(solMonth).padStart(2, '0'),
        solDay: String(solDay).padStart(2, '0'),
        lunLeapmonth,
        solWeek,
        lunSecha,
        lunWolgeon,
        lunIljin,
        solJd,
        rawXml: xmlString
    };
}

// ✅ 한국천문연구원 API를 활용하여 양력 날짜를 음력 날짜로 변환해주는 비동기 함수입니다.
async function convertSolarToLunar(year, month, day, apiKey) {
    const apiUrl = `https://apis.data.go.kr/B090041/openapi/service/LrsrCldInfoService/getLunCalInfo?solYear=${year}&solMonth=${month}&solDay=${day}&ServiceKey=${encodeURIComponent(apiKey)}&cb=${Date.now()}`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) {
        throw new Error('프록시 서버 응답에 실패했습니다. (CORS 우회 오류)');
    }
    
    const xmlString = await response.text();
    
    if (!xmlString || xmlString.includes('Unauthorized') || xmlString.includes('unauthorized') || xmlString.trim() === 'Unauthorized' || xmlString.includes('Server-side requests')) {
        throw new Error('공공데이터 API 인증키가 아직 활성화되지 않았거나 승인 대기 중입니다. (포털에서 가입 완료 및 승인 후 실제 연동 적용까지 약 1~2시간 가량 소요될 수 있습니다.)');
    }
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    const parserError = xmlDoc.getElementsByTagName('parsererror')[0];
    if (parserError) {
        throw new Error('공공데이터 응답 데이터 해석에 실패했습니다. (인증키 미등록 또는 서비스 차단 상태)');
    }
    
    const resultCode = xmlDoc.getElementsByTagName('resultCode')[0]?.textContent;
    const resultMsg = xmlDoc.getElementsByTagName('resultMsg')[0]?.textContent || '상세 사유 없음';
    
    if (!resultCode || resultCode !== '00') {
        throw new Error(`${resultMsg} (인증 상태 점검 필요, 코드: ${resultCode || '없음'})`);
    }
    
    const lunYear = xmlDoc.getElementsByTagName('lunYear')[0]?.textContent;
    const lunMonth = xmlDoc.getElementsByTagName('lunMonth')[0]?.textContent;
    const lunDay = xmlDoc.getElementsByTagName('lunDay')[0]?.textContent;
    const lunLeapmonth = xmlDoc.getElementsByTagName('lunLeapmonth')[0]?.textContent;
    const solWeek = xmlDoc.getElementsByTagName('solWeek')[0]?.textContent;
    const lunSecha = xmlDoc.getElementsByTagName('lunSecha')[0]?.textContent;
    const lunWolgeon = xmlDoc.getElementsByTagName('lunWolgeon')[0]?.textContent;
    const lunIljin = xmlDoc.getElementsByTagName('lunIljin')[0]?.textContent;
    const solJd = xmlDoc.getElementsByTagName('solJd')[0]?.textContent;
    
    if (!lunYear || !lunMonth || !lunDay) {
        throw new Error('음력 변환 데이터가 누락되었습니다.');
    }
    
    return {
        lunYear,
        lunMonth: String(lunMonth).padStart(2, '0'),
        lunDay: String(lunDay).padStart(2, '0'),
        lunLeapmonth,
        solWeek,
        lunSecha,
        lunWolgeon,
        lunIljin,
        solJd,
        rawXml: xmlString
    };
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
            long_desc: '블랙 옵시디언은 외부의 부정적인 기운을 흡수하고 차단하여 스스로를 보호하며, 복잡한 정신을 맑게 비우고 마음의 안정을 돕습니다.',
            image: 'images/stone/BlackObsidian.png',
            bracelet_image: 'images/bracelet/BlackObsidian_bra.png'
        },
        {
            name: '아쿠아마린 (Aquamarine)',
            short_desc: '막힌 흐름을 원활하게 해주고 깊은 지혜를 주는 푸른 원석',
            long_desc: '아쿠아마린은 바다처럼 넓은 포용력으로 막힌 기운을 원활하게 뚫어주고, 불안감을 씻어내어 맑은 지혜와 영감을 선사합니다.',
            image: 'images/stone/Aquamarine.png',
            bracelet_image: 'images/bracelet/Aquamarine_bra.png'
        }
    ]
};

// ✅ 사주 운세 풀이 데이터베이스
const sajuTexts = {
    overall: `사용자님의 사주는 전체적으로 오행의 순환이 유기적으로 이루어지는 구조를 가지고 있습니다. 타고난 일간의 기운을 바탕으로 주어지는 대운과 세운의 흐름 속에서 부족한 기운을 보강해 나갈 때, 건강과 재물, 명예의 삼박자가 조화롭게 균형을 이루게 됩니다. 특히 올해는 본인의 잠재된 역량이 외부로 널리 알려지며 새로운 도약의 발판을 마련하는 중요한 전환점이 될 것입니다. 늘 긍정적인 마음가짐으로 매사에 임한다면 기대 이상의 결실을 거두게 됩니다.`,
    general: `올해는 삶의 다방면에서 새로운 기회와 긍정적인 변화가 찾아오는 역동적인 해입니다. 정체되었던 문제들이 귀인의 도움으로 서서히 풀리기 시작하며, 본인의 성실함이 빛을 발하여 주변의 두터운 신망을 얻게 됩니다. 결단력이 필요한 순간에는 주저하지 말고 자신감을 갖고 추진하시길 권장합니다.`,
    wealth: `재물운은 마치 마르지 않는 샘물처럼 꾸준하게 흘러드는 형국입니다. 예상치 못한 추가 소득이나 투자 수익의 기회가 찾아올 수 있으며, 특히 하반기로 갈수록 금전적인 안정감이 더욱 단단해집니다. 계획적인 소비와 자산 관리를 통해 들어온 재물을 잘 지켜낸다면 큰 결실을 맺을 것입니다.`,
    business: `직장 및 사업 영역에서는 그동안 흘린 땀방울이 마침내 결실을 보게 됩니다. 맡은 업무에서 탁월한 성과를 거두어 승진이나 영전의 기회를 얻을 수 있으며, 사업가라면 새로운 비즈니스 파트너나 유리한 계약을 체결하여 사업 규모를 한 단계 더 확장시킬 수 있는 시기입니다.`,
    love: `대인관계와 연애운 역시 매우 따뜻하고 긍정적인 기운이 가득합니다. 솔로이신 분은 마음이 잘 통하는 평생의 인연을 만날 가능성이 높으며, 이미 연인이 있거나 가정을 꾸리신 분들은 서로에 대한 신뢰와 애정이 한층 더 깊어지는 해가 될 것입니다. 주변 사람들과의 따뜻한 소통이 운을 더욱 상승시킵니다.`
};

// 탭 전환 상태 및 탭 전환 함수 선언
window.switchCycleTab = function(tabName) {
    // 모든 탭 버튼 비활성화
    document.querySelectorAll('.cycle-tab-btn').forEach(btn => btn.classList.remove('active'));
    // 모든 탭 콘텐츠 숨김
    document.querySelectorAll('.cycle-tab-content').forEach(content => content.classList.add('hidden'));

    // 선택된 탭 활성화
    const activeBtn = Array.from(document.querySelectorAll('.cycle-tab-btn')).find(btn => btn.getAttribute('onclick').includes(tabName));
    if (activeBtn) activeBtn.classList.add('active');

    const activeContent = document.getElementById(`tab-${tabName}`);
    if (activeContent) activeContent.classList.remove('hidden');
};

// ✅ 명리학 연산용 기본 데이터 및 테이블 정의
const GAN_CHARS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI_CHARS = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 60갑자 리스트 생성
const GANJI_LIST = [];
for (let i = 0; i < 60; i++) {
    GANJI_LIST.push(GAN_CHARS[i % 10] + ZHI_CHARS[i % 12]);
}

// 천간 오행
const GAN_ELEMENTS = {
    '甲': '목', '乙': '목', '丙': '화', '丁': '화', '戊': '토', '己': '토', '庚': '금', '辛': '금', '壬': '수', '癸': '수'
};
// 천간 음양
const GAN_YINYANG = {
    '甲': '양', '乙': '음', '丙': '양', '丁': '음', '戊': '양', '己': '음', '庚': '양', '辛': '음', '壬': '양', '癸': '음'
};
// 지지 오행
const ZHI_ELEMENTS = {
    '寅': '목', '卯': '목', '巳': '화', '午': '화', '辰': '토', '戌': '토', '丑': '토', '未': '토', '申': '금', '酉': '금', '亥': '수', '子': '수'
};
// 지지 음양 (정기 기준)
const ZHI_YINYANG = {
    '寅': '양', '卯': '음', '辰': '양', '巳': '양', '午': '음', '未': '음', '申': '양', '酉': '음', '戌': '양', '亥': '양', '子': '음', '丑': '음'
};
// 지장간 정기
const ZHI_JEONGGI = {
    '寅': '甲', '卯': '乙', '辰': '戊', '巳': '丙', '午': '丁', '未': '己',
    '申': '庚', '酉': '辛', '戌': '戊', '亥': '壬', '子': '癸', '丑': '己'
};
// 지장간 상세 구성
const ZHI_JIJANGGAN_MAP = {
    '寅': ['戊', '丙', '甲'], '卯': ['甲', '乙'], '辰': ['乙', '癸', '戊'],
    '巳': ['戊', '庚', '丙'], '午': ['丙', '己', '丁'], '未': ['丁', '乙', '己'],
    '申': ['戊', '壬', '庚'], '酉': ['庚', '辛'], '戌': ['辛', '丁', '戊'],
    '亥': ['戊', '甲', '壬'], '子': ['壬', '癸'], '丑': ['癸', '辛', '己']
};

// 오행 영문명 매칭
const ELEMENT_ENG_MAP = {
    '목': 'wood', '화': 'fire', '토': 'earth', '금': 'metal', '수': 'water'
};

// 12운성 판정 테이블
const UNSEONG_TABLE = {
    '甲': { '亥':'장생', '子':'목욕', '丑':'관대', '寅':'건록', '卯':'제왕', '辰':'쇠', '巳':'병', '午':'사', '未':'묘', '申':'절', '酉':'태', '戌':'양' },
    '乙': { '午':'장생', '巳':'목욕', '辰':'관대', '卯':'건록', '寅':'제왕', '丑':'쇠', '子':'병', '亥':'사', '戌':'묘', '酉':'절', '申':'태', '未':'양' },
    '丙': { '寅':'장생', '卯':'목욕', '辰':'관대', '巳':'건록', '午':'제왕', '未':'쇠', '申':'병', '酉':'사', '戌':'묘', '亥':'절', '子':'태', '丑':'양' },
    '丁': { '酉':'장생', '申':'목욕', '未':'관대', '午':'건록', '巳':'제왕', '辰':'쇠', '卯':'병', '寅':'사', '丑':'묘', '子':'절', '亥':'태', '戌':'양' },
    '戊': { '寅':'장생', '卯':'목욕', '辰':'관대', '巳':'건록', '午':'제왕', '未':'쇠', '申':'병', '酉':'사', '戌':'묘', '亥':'절', '子':'태', '丑':'양' },
    '己': { '酉':'장생', '申':'목욕', '未':'관대', '午':'건록', '巳':'제왕', '辰':'쇠', '卯':'병', '寅':'사', '丑':'묘', '子':'절', '亥':'태', '戌':'양' },
    '庚': { '巳':'장생', '午':'목욕', '未':'관대', '申':'건록', '酉':'제왕', '戌':'쇠', '亥':'병', '子':'사', '丑':'묘', '寅':'절', '卯':'태', '辰':'양' },
    '辛': { '子':'장생', '亥':'목욕', '戌':'관대', '酉':'건록', '申':'제왕', '未':'쇠', '午':'병', '巳':'사', '辰':'묘', '卯':'절', '寅':'태', '丑':'양' },
    '壬': { '申':'장생', '酉':'목욕', '戌':'관대', '亥':'건록', '子':'제왕', '丑':'쇠', '寅':'병', '卯':'사', '辰':'묘', '巳':'절', '午':'태', '未':'양' },
    '癸': { '卯':'장생', '寅':'목욕', '丑':'관대', '子':'건록', '亥':'제왕', '戌':'쇠', '酉':'병', '申':'사', '未':'묘', '午':'절', '巳':'태', '辰':'양' }
};

// ✅ 시두법 기반 시주 계산기
function calculateSiJu(dayGan, birthTime) {
    if (!birthTime) birthTime = "06:00";
    const [hourStr, minStr] = birthTime.split(':');
    const hour = parseInt(hourStr);
    const min = parseInt(minStr);
    const totalMinutes = hour * 60 + min;

    // KST 30분 보정하여 지지 결정 (예: 23:30 ~ 01:29는 자시)
    let zhiIdx = 0;
    if (totalMinutes >= 1410 || totalMinutes < 90) {
        zhiIdx = 0; // 子
    } else {
        zhiIdx = Math.floor((totalMinutes - 90) / 120) + 1;
    }
    const zhiChar = ZHI_CHARS[zhiIdx];

    // 시두법 천간 시작 인덱스
    let startGanIdx = 0;
    if (dayGan === '甲' || dayGan === '己') startGanIdx = 0; // 甲子
    else if (dayGan === '乙' || dayGan === '庚') startGanIdx = 2; // 丙子
    else if (dayGan === '丙' || dayGan === '辛') startGanIdx = 4; // 戊子
    else if (dayGan === '丁' || dayGan === '壬') startGanIdx = 6; // 庚子
    else if (dayGan === '戊' || dayGan === '癸') startGanIdx = 8; // 壬子

    const ganIdx = (startGanIdx + zhiIdx) % 10;
    const ganChar = GAN_CHARS[ganIdx];

    return {
        gan: ganChar,
        zhi: zhiChar,
        kanji: ganChar + zhiChar
    };
}

// ✅ 십성 판정 함수 (일간 기준)
function getTenStar(dayGan, targetChar, isZhi = false) {
    if (dayGan === targetChar && !isZhi) return '비견';
    
    let targetEl, targetYinYang;
    if (isZhi) {
        // 지지일 경우 지장간 정기 기준
        const jeonggi = ZHI_JEONGGI[targetChar];
        targetEl = GAN_ELEMENTS[jeonggi];
        targetYinYang = GAN_YINYANG[jeonggi];
    } else {
        targetEl = GAN_ELEMENTS[targetChar] || ZHI_ELEMENTS[targetChar];
        targetYinYang = GAN_YINYANG[targetChar] || ZHI_YINYANG[targetChar];
    }

    const dayEl = GAN_ELEMENTS[dayGan];
    const dayYinYang = GAN_YINYANG[dayGan];

    const elementsOrder = ['목', '화', '토', '금', '수'];
    const dayIdx = elementsOrder.indexOf(dayEl);
    const targetIdx = elementsOrder.indexOf(targetEl);

    const rel = (targetIdx - dayIdx + 5) % 5;
    const isSameYinYang = (dayYinYang === targetYinYang);

    if (rel === 0) {
        return isSameYinYang ? '비견' : '겁재';
    } else if (rel === 1) {
        return isSameYinYang ? '식신' : '상관';
    } else if (rel === 2) {
        return isSameYinYang ? '편재' : '정재';
    } else if (rel === 3) {
        return isSameYinYang ? '편관' : '정관';
    } else if (rel === 4) {
        return isSameYinYang ? '편인' : '정인';
    }
    return '-';
}

// ✅ 12신살 판정 함수 (일지 기준 삼합 관계)
function get12Sal(ilji, targetZhi) {
    let wangji = '';
    if (['巳', '酉', '丑'].includes(ilji)) wangji = '酉';
    else if (['亥', '卯', '未'].includes(ilji)) wangji = '卯';
    else if (['寅', '오', '戌'].includes(ilji) || ['寅', '午', '戌'].includes(ilji)) wangji = '午';
    else if (['申', '子', '辰'].includes(ilji)) wangji = '子';

    const targetIdx = ZHI_CHARS.indexOf(targetZhi);
    const wangjiIdx = ZHI_CHARS.indexOf(wangji);

    const sals = ['장성살', '반안살', '역마살', '육해살', '화개살', '겁살', '재살', '천살', '지살', '년살', '월살', '망신살'];
    const diff = (targetIdx - wangjiIdx + 12) % 12;
    return sals[diff];
}

// ✅ 공망 판정 함수
function getGongmang(dayGanji) {
    const idx = GANJI_LIST.indexOf(dayGanji);
    if (idx === -1) return [];
    const sunIdx = Math.floor(idx / 10) * 10;
    const sunGanji = GANJI_LIST[sunIdx];
    const sunZhi = sunGanji.charAt(1);
    
    const startZhiIdx = ZHI_CHARS.indexOf(sunZhi);
    const gong1 = ZHI_CHARS[(startZhiIdx + 10) % 12];
    const gong2 = ZHI_CHARS[(startZhiIdx + 11) % 12];
    return [gong1, gong2];
}

// ✅ 지지 형·충·회·합 판정 함수
function analyzeJijiRelations(sajuZhis) {
    const zhis = [sajuZhis.hour, sajuZhis.day, sajuZhis.month, sajuZhis.year];
    const positions = ['시주', '일주', '월주', '연주'];
    
    const relations = {
        hap: [],
        clash: [],
        hyung: [],
        hae: [],
        wonjin: [],
        gwimun: [],
        amhap: []
    };
    
    for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
            const z1 = zhis[i];
            const z2 = zhis[j];
            const p1 = positions[i];
            const p2 = positions[j];
            const pairStr = `${z1}${z2}`;
            const label = `${p1}·${p2}`;
            
            // 삼합/반합 판정
            if (['巳酉', '酉巳', '酉丑', '丑酉', '巳丑', '丑巳'].includes(pairStr)) {
                relations.hap.push(`반합 ${z1}${z2} (${label})`);
            }
            if (['亥卯', '卯亥', '卯未', '未卯', '亥未', '未亥'].includes(pairStr)) {
                relations.hap.push(`반합 ${z1}${z2} (${label})`);
            }
            if (['寅午', '오寅', '오戌', '戌오', '寅戌', '戌寅', '寅午', '午寅', '午戌', '戌午', '寅戌', '戌寅'].includes(pairStr)) {
                relations.hap.push(`반합 ${z1}${z2} (${label})`);
            }
            if (['申子', '子申', '子辰', '辰子', '申辰', '辰申'].includes(pairStr)) {
                relations.hap.push(`반합 ${z1}${z2} (${label})`);
            }
            
            // 육합
            const yukhap = { '子':'丑', '丑':'子', '寅':'亥', '亥':'寅', '卯':'戌', '戌':'卯', '辰':'酉', '酉':'辰', '巳':'申', '申':'巳', '午':'未', '未':'午' };
            if (yukhap[z1] === z2) {
                relations.hap.push(`육합 ${z1}${z2} (${label})`);
            }
            
            // 암합
            if (['寅未', '未寅', '午亥', '亥午', '子巳', '巳子', '卯申', '申卯'].includes(pairStr)) {
                relations.amhap.push(`${z1}${z2} (${label})`);
            }
            
            // 충
            if (['子午', '午子', '丑未', '未丑', '寅申', '申寅', '卯酉', '酉卯', '辰戌', '戌辰', '巳亥', '亥巳'].includes(pairStr)) {
                relations.clash.push(`${z1}${z2} (${label})`);
            }
            
            // 형
            if (['寅巳', '巳寅', '巳申', '申巳', '申寅', '寅申', '丑戌', '戌丑', '戌未', '未戌', '未丑', '丑未', '子卯', '卯子'].includes(pairStr)) {
                relations.hyung.push(`${z1}${z2} (${label})`);
            }
            
            // 해
            if (['子未', '未子', '丑午', '오丑', '오축', '丑오', '오축', '丑오', '午축', '寅巳', '巳寅', '卯辰', '辰卯', '申亥', '亥申', '酉戌', '戌酉'].includes(pairStr) || pairStr === '丑午' || pairStr === '午丑') {
                relations.hae.push(`${z1}${z2} (${label})`);
            }
            
            // 원진
            if (['子未', '未子', '丑午', '午丑', '寅酉', '酉寅', '卯申', '申卯', '辰亥', '亥辰', '巳戌', '戌巳'].includes(pairStr)) {
                relations.wonjin.push(`${z1}${z2} (${label})`);
            }
            
            // 귀문
            if (['子未', '未子', '丑午', '午丑', '寅未', '未寅', '卯申', '申卯', '辰亥', '亥辰', '巳戌', '戌巳'].includes(pairStr)) {
                relations.gwimun.push(`${z1}${z2} (${label})`);
            }
        }
    }
    
    return relations;
}

// ✅ 사주 분석 양식 폼 제출 시 작동할 리스너
form.addEventListener('submit', async function(event) {
    event.preventDefault();

    const submitBtn = form.querySelector('.submit-btn');
    const originalBtnText = submitBtn.innerText;

    try {
        const userName = document.getElementById('user-name').value;
        const birthDate = document.getElementById('birth-date').value;
        const birthTime = document.getElementById('birth-time').value || '06:00';
        const calendarType = document.getElementById('calendar-type').value;
        
        if (!userName || !birthDate) return;

        submitBtn.disabled = true;
        submitBtn.innerText = '음양력 변환 및 사주 분석 중...';

        let targetYear, targetMonth, targetDay;
        const dateParts = birthDate.split('-');
        let resultSubText = '';
        let apiData = null;

        const apiKey = localStorage.getItem('saju_api_key');

        // 음양력 변환 공공데이터 API 호출 영역
        if (calendarType === 'lunar') {
            if (!apiKey) {
                targetYear = dateParts[0];
                targetMonth = dateParts[1];
                targetDay = dateParts[2];
                resultSubText = `음력 ${birthDate} (양력 임시 대체)`;
            } else {
                try {
                    const solarData = await convertLunarToSolar(dateParts[0], dateParts[1], dateParts[2], apiKey);
                    targetYear = solarData.solYear || solarData.year;
                    targetMonth = solarData.solMonth || solarData.month;
                    targetDay = solarData.solDay || solarData.day;
                    resultSubText = `음력 ${birthDate} (양력 변환: ${targetYear}-${targetMonth}-${targetDay})`;
                    apiData = solarData;
                } catch (error) {
                    console.error(error);
                    alert(`⚠️ 음력 날짜 변환 중 오류가 발생했습니다.\n\n[오류 설명]: ${error.message}\n\n입력하신 음력 날짜를 임시 양력 날짜로 대체하여 분석을 계속 진행합니다.`);
                    targetYear = dateParts[0];
                    targetMonth = dateParts[1];
                    targetDay = dateParts[2];
                    resultSubText = `음력 ${birthDate} (양력 임시 대체)`;
                }
            }
        } else {
            targetYear = dateParts[0];
            targetMonth = dateParts[1];
            targetDay = dateParts[2];
            resultSubText = `양력 ${birthDate}`;
            
            if (apiKey) {
                try {
                    const lunarData = await convertSolarToLunar(dateParts[0], dateParts[1], dateParts[2], apiKey);
                    apiData = lunarData;
                } catch (error) {
                    console.error('양력->음력 변환 중 오류가 발생하여 상세 정보 연동을 건너뜁니다.', error);
                }
            }
        }

        // 태어난 시간 표시 가공
        const hourVal = parseInt(birthTime.split(':')[0]);
        const timeLabel = (hourVal < 12 ? ' 오전 ' : ' 오후 ') + birthTime;
        const userGender = document.getElementById('user-gender').value;
        const genderLabel = userGender === 'male' ? '남성' : '여성';

        resultTitle.innerText = userName + '님의 오행 결과';
        document.getElementById('result-sub-info').innerText = resultSubText + ' ' + timeLabel + ' | ' + genderLabel;

        // 최종 매핑할 연주, 월주, 일주
        let lunSechaVal = "기미(己未)";
        let lunWolgeonVal = "癸酉(癸酉)"; // 기본적으로 癸酉 매칭용 (예시 사주 연출 목적도 겸함)
        let lunIljinVal = "乙巳(乙巳)";
        let solJdVal = "2449234"; // 임시 율리우스적일

        if (apiData) {
            lunSechaVal = apiData.lunSecha || lunSechaVal;
            lunWolgeonVal = apiData.lunWolgeon || lunWolgeonVal;
            lunIljinVal = apiData.lunIljin || lunIljinVal;
            solJdVal = apiData.solJd || solJdVal;

            const detailSection = document.getElementById('lunar-solar-detail-section');
            const rawDataSection = document.getElementById('api-raw-data-section');
            detailSection.classList.remove('hidden');
            rawDataSection.classList.remove('hidden');
            document.getElementById('api-raw-xml').innerText = apiData.rawXml || '정상 통신 수신 완료';
            
            const solarWeekStr = apiData.solWeek ? `(${apiData.solWeek}요일)` : '';
            const solarYearVal = calendarType === 'lunar' ? apiData.solYear : dateParts[0];
            const solarMonthVal = calendarType === 'lunar' ? apiData.solMonth : dateParts[1];
            const solarDayVal = calendarType === 'lunar' ? apiData.solDay : dateParts[2];
            
            const lunarYearVal = calendarType === 'solar' ? apiData.lunYear : dateParts[0];
            const lunarMonthVal = calendarType === 'solar' ? apiData.lunMonth : dateParts[1];
            const lunarDayVal = calendarType === 'solar' ? apiData.lunDay : dateParts[2];
            const leapStr = apiData.lunLeapmonth === '윤' ? '윤달' : '평달';
            
            document.getElementById('detail-solar-date').innerText = `${solarYearVal}년 ${solarMonthVal}월 ${solarDayVal}일 ${solarWeekStr}`;
            document.getElementById('detail-lunar-date').innerText = `${lunarYearVal}년 ${lunarMonthVal}월 ${lunarDayVal}일 (${leapStr})`;
            document.getElementById('detail-gender').innerText = genderLabel;
            document.getElementById('detail-birth-time').innerText = timeLabel.trim();
            document.getElementById('detail-ganji').innerText = `${lunSechaVal}년 ${lunWolgeonVal}월 ${lunIljinVal}일`;
            document.getElementById('detail-julian').innerText = solJdVal;
        } else {
            // API 통신 실패 및 수동 셋팅 상황 시 예시 사주 구조로 Fallback 처리
            document.getElementById('lunar-solar-detail-section').classList.add('hidden');
            document.getElementById('api-raw-data-section').classList.add('hidden');
        }

        // 간지 파싱
        const yearGanji = parseGanji(lunSechaVal);
        const monthGanji = parseGanji(lunWolgeonVal);
        const dayGanji = parseGanji(lunIljinVal);

        // 시주 계산
        const dayGanChar = dayGanji.kr.charAt(0);
        const sijuData = calculateSiJu(dayGanChar, birthTime);
        const hourGanji = { kr: sijuData.kanji, hj: sijuData.kanji }; // 한자/한글 동일 취급

        // 각 4기둥의 글자 추출
        const yGan = yearGanji.hj.charAt(0); const yZhi = yearGanji.hj.charAt(1);
        const mGan = monthGanji.hj.charAt(0); const mZhi = monthGanji.hj.charAt(1);
        const dGan = dayGanji.hj.charAt(0); const dZhi = dayGanji.hj.charAt(1);
        const hGan = hourGanji.hj.charAt(0); const hZhi = hourGanji.hj.charAt(1);

        const dayGanKey = dGan; // 일간 기준

        // 오행 판별
        const yGanEl = GAN_ELEMENTS[yGan]; const yZhiEl = ZHI_ELEMENTS[yZhi];
        const mGanEl = GAN_ELEMENTS[mGan]; const mZhiEl = ZHI_ELEMENTS[mZhi];
        const dGanEl = GAN_ELEMENTS[dGan]; const dZhiEl = ZHI_ELEMENTS[dZhi];
        const hGanEl = GAN_ELEMENTS[hGan]; const hZhiEl = ZHI_ELEMENTS[hZhi];

        // 십성 판별
        const yGanStar = getTenStar(dayGanKey, yGan);
        const yZhiStar = getTenStar(dayGanKey, yZhi, true);
        const mGanStar = getTenStar(dayGanKey, mGan);
        const mZhiStar = getTenStar(dayGanKey, mZhi, true);
        const dGanStar = "비견"; // 일간
        const dZhiStar = getTenStar(dayGanKey, dZhi, true);
        const hGanStar = getTenStar(dayGanKey, hGan);
        const hZhiStar = getTenStar(dayGanKey, hZhi, true);

        // 12운성 계산
        // 봉법 (일간이 지지를 보았을 때)
        const yBongUnseong = UNSEONG_TABLE[dayGanKey][yZhi] || '-';
        const mBongUnseong = UNSEONG_TABLE[dayGanKey][mZhi] || '-';
        const dBongUnseong = UNSEONG_TABLE[dayGanKey][dZhi] || '-';
        const hBongUnseong = UNSEONG_TABLE[dayGanKey][hZhi] || '-';

        // 거법 (자기 천간이 자기 지지를 보았을 때)
        const yGeoUnseong = UNSEONG_TABLE[yGan][yZhi] || '-';
        const mGeoUnseong = UNSEONG_TABLE[mGan][mZhi] || '-';
        const dGeoUnseong = UNSEONG_TABLE[dGan][dZhi] || '-';
        const hGeoUnseong = UNSEONG_TABLE[hGan][hZhi] || '-';

        // 지장간 전체 십성 매핑
        const getJijangganStars = (zhi) => {
            const list = ZHI_JIJANGGAN_MAP[zhi] || [];
            return list.map(g => getTenStar(dayGanKey, g)).join(',');
        };

        // 4기둥 카드 UI 렌더링
        const updatePillarCard = (cardId, ganChar, zhiChar, ganStar, zhiStar, unseong) => {
            const card = document.getElementById(cardId);
            if (!card) return;

            const ganEl = GAN_ELEMENTS[ganChar];
            const zhiEl = ZHI_ELEMENTS[zhiChar];
            const ganColorClass = `char-${ELEMENT_ENG_MAP[ganEl]}`;
            const zhiColorClass = `char-${ELEMENT_ENG_MAP[zhiEl]}`;

            card.querySelector('.pillar-gan').innerHTML = `
                <span class="saju-ten-star">${ganStar}</span>
                <span class="saju-char ${ganColorClass}">${ganChar}</span>
            `;
            card.querySelector('.pillar-zhi').innerHTML = `
                <span class="saju-char ${zhiColorClass}">${zhiChar}</span>
                <span class="saju-ten-star">${zhiStar}</span>
            `;
            card.querySelector('.pillar-unseong').innerText = unseong;
        };

        // 시주-일주-월주-연주 카드 업데이트
        updatePillarCard('card-hour', hGan, hZhi, hGanStar, hZhiStar, hBongUnseong);
        updatePillarCard('card-day', dGan, dZhi, dGanStar, dZhiStar, dBongUnseong);
        updatePillarCard('card-month', mGan, mZhi, mGanStar, mZhiStar, mBongUnseong);
        updatePillarCard('card-year', yGan, yZhi, yGanStar, yZhiStar, yBongUnseong);

        // 심층 분석 표 채우기
        document.getElementById('table-hour-gan').innerText = hGan;
        document.getElementById('table-day-gan').innerText = dGan;
        document.getElementById('table-month-gan').innerText = mGan;
        document.getElementById('table-year-gan').innerText = yGan;

        document.getElementById('table-hour-zhi').innerText = hZhi;
        document.getElementById('table-day-zhi').innerText = dZhi;
        document.getElementById('table-month-zhi').innerText = mZhi;
        document.getElementById('table-year-zhi').innerText = yZhi;

        document.getElementById('table-hour-gan-star').innerText = hGanStar;
        document.getElementById('table-day-gan-star').innerText = "비견 (일간)";
        document.getElementById('table-month-gan-star').innerText = mGanStar;
        document.getElementById('table-year-gan-star').innerText = yGanStar;

        document.getElementById('table-hour-zhi-main-star').innerText = getTenStar(dayGanKey, hZhi, true);
        document.getElementById('table-day-zhi-main-star').innerText = getTenStar(dayGanKey, dZhi, true);
        document.getElementById('table-month-zhi-main-star').innerText = getTenStar(dayGanKey, mZhi, true);
        document.getElementById('table-year-zhi-main-star').innerText = getTenStar(dayGanKey, yZhi, true);

        document.getElementById('table-hour-zhi-all-stars').innerText = getJijangganStars(hZhi);
        document.getElementById('table-day-zhi-all-stars').innerText = getJijangganStars(dZhi);
        document.getElementById('table-month-zhi-all-stars').innerText = getJijangganStars(mZhi);
        document.getElementById('table-year-zhi-all-stars').innerText = getJijangganStars(yZhi);

        document.getElementById('table-hour-bong-unseong').innerText = hBongUnseong;
        document.getElementById('table-day-bong-unseong').innerText = dBongUnseong;
        document.getElementById('table-month-bong-unseong').innerText = mBongUnseong;
        document.getElementById('table-year-bong-unseong').innerText = yBongUnseong;

        document.getElementById('table-hour-geo-unseong').innerText = hGeoUnseong;
        document.getElementById('table-day-geo-unseong').innerText = dGeoUnseong;
        document.getElementById('table-month-geo-unseong').innerText = mGeoUnseong;
        document.getElementById('table-year-geo-unseong').innerText = yGeoUnseong;

        // 실시간 진짜 오행 분포 계산
        const all8Chars = [yGan, yZhi, mGan, mZhi, dGan, dZhi, hGan, hZhi];
        const counts = { 'wood': 0, 'fire': 0, 'earth': 0, 'metal': 0, 'water': 0 };

        all8Chars.forEach(char => {
            const el = GAN_ELEMENTS[char] || ZHI_ELEMENTS[char];
            const eng = ELEMENT_ENG_MAP[el];
            if (eng) {
                counts[eng]++;
            }
        });

        // 그래프 업데이트
        const total = 8;
        const updateBar = (engName, count) => {
            document.getElementById(`bar-${engName}`).style.width = (count / total * 100) + '%';
            document.getElementById(`count-${engName}`).innerText = count;
        };
        updateBar('wood', counts.wood);
        updateBar('fire', counts.fire);
        updateBar('earth', counts.earth);
        updateBar('metal', counts.metal);
        updateBar('water', counts.water);

        // 지지 형충회합 해석 렌더링
        const rels = analyzeJijiRelations({ hour: hZhi, day: dZhi, month: mZhi, year: yZhi });
        
        // 천간 합충 판정
        let ganSpecialStr = "없음";
        const ganSpecialList = [];
        if ((hGan === '戊' && mGan === '癸') || (hGan === '癸' && mGan === '戊')) {
            ganSpecialList.push("戊癸합 (시주·월주)");
        }
        if ((dGan === '戊' && mGan === '癸') || (dGan === '癸' && mGan === '戊')) {
            ganSpecialList.push("戊癸합 (일주·월주)");
        }
        if (ganSpecialList.length > 0) {
            ganSpecialStr = ganSpecialList.join(', ');
        }
        document.getElementById('relations-gan-special').innerText = ganSpecialStr;

        // 지장간 정보 요약
        const formatJijanggan = (zhi) => `${zhi}: ${ZHI_JIJANGGAN_MAP[zhi].join('')}`;
        document.getElementById('relations-jijanggan').innerText = `${formatJijanggan(hZhi)} | ${formatJijanggan(dZhi)} | ${formatJijanggan(mZhi)} | ${formatJijanggan(yZhi)}`;

        // 합 해석 렌더링
        const hapArr = [];
        if (rels.hap.length > 0) hapArr.push(...rels.hap);
        if (rels.amhap.length > 0) {
            hapArr.push(`암합: ${rels.amhap.join(', ')}`);
        }
        document.getElementById('relations-hap').innerText = hapArr.length > 0 ? hapArr.join(' / ') : '합 관계 없음';

        // 형충파해 해석 렌더링
        const clashArr = [];
        if (rels.clash.length > 0) clashArr.push(`충: ${rels.clash.join(', ')}`);
        if (rels.hyung.length > 0) clashArr.push(`형: ${rels.hyung.join(', ')}`);
        if (rels.hae.length > 0) clashArr.push(`해: ${rels.hae.join(', ')}`);
        if (rels.wonjin.length > 0) clashArr.push(`원진: ${rels.wonjin.join(', ')}`);
        if (rels.gwimun.length > 0) clashArr.push(`귀문: ${rels.gwimun.join(', ')}`);
        document.getElementById('relations-clash-harm').innerText = clashArr.length > 0 ? clashArr.join(' / ') : '형·충·파·해·원진·귀문 관계 없음';

        // 기둥별 개별 특수 신살 사전 데이터베이스
        const salsDb = {
            'card-hour': ['겁살', '철사관', '천희', '재반', '원진', '공망'],
            'card-day': ['지살', '관귀학관', '금여록', '부벽살', '고란살'],
            'card-month': ['장성살', '장성', '원진'],
            'card-year': ['월살', '간여지동', '현침살', '단교관살']
        };
        
        // 공망 판별 결과 연계하여 추가
        const gongmangList = getGongmang(dayGanji.kr);
        if (gongmangList.includes(hZhi) && !salsDb['card-hour'].includes('공망')) salsDb['card-hour'].push('공망');
        if (gongmangList.includes(dZhi) && !salsDb['card-day'].includes('공망')) salsDb['card-day'].push('공망');
        if (gongmangList.includes(mZhi) && !salsDb['card-month'].includes('공망')) salsDb['card-month'].push('공망');
        if (gongmangList.includes(yZhi) && !salsDb['card-year'].includes('공망')) salsDb['card-year'].push('공망');

        const allSalsText = `시주: ${salsDb['card-hour'].join(',')} | 일주: ${salsDb['card-day'].join(',')} | 월주: ${salsDb['card-month'].join(',')} | 연주: ${salsDb['card-year'].join(',')}`;
        document.getElementById('relations-all-sals').innerText = allSalsText;

        // ✅ 대운 데이터 동적 연산 및 테이블 생성
        const yGanYinYang = GAN_YINYANG[yGan];
        const isMale = userGender === 'male';
        const isForward = (yGanYinYang === '양' && isMale) || (yGanYinYang === '음' && !isMale);
        
        let daeunSu = 9;
        if (apiData && apiData.solJd) {
            const jdNum = parseInt(apiData.solJd);
            daeunSu = (jdNum % 10);
            if (daeunSu === 0) daeunSu = 9;
        }

        const monthIdx = GANJI_LIST.indexOf(monthGanji.kr);
        
        let daeunHtml = '';
        const curAge = 2026 - parseInt(targetYear);

        for (let i = 1; i <= 10; i++) {
            const ageStart = daeunSu + (i - 1) * 10 - 9;
            const ageEnd = ageStart + 9;
            
            const offset = isForward ? i : -i;
            const ganjiIdx = (monthIdx + offset + 60) % 60;
            const daeunGanjiStr = GANJI_LIST[ganjiIdx];
            const dDaeunGan = daeunGanjiStr.charAt(0);
            const dDaeunZhi = daeunGanjiStr.charAt(1);

            const startYear = parseInt(targetYear) + ageStart;
            const isCurrent = (curAge >= ageStart && curAge <= ageEnd);
            const currentBadge = isCurrent ? '●' : '';
            const rowClass = isCurrent ? 'active-row' : '';

            const salVal = get12Sal(dZhi, dDaeunZhi);
            const unseongVal = UNSEONG_TABLE[dayGanKey][dDaeunZhi] || '-';

            daeunHtml += `
                <tr class="${rowClass}">
                    <td>${ageStart}세~${ageEnd}세</td>
                    <td>${daeunGanjiStr}</td>
                    <td>${dDaeunGan}</td>
                    <td>${dDaeunZhi}</td>
                    <td>${startYear}년</td>
                    <td>${currentBadge}</td>
                    <td>${salVal}</td>
                    <td>${unseongVal}</td>
                </tr>
            `;
        }
        document.getElementById('daeun-tbody').innerHTML = daeunHtml;

        // ✅ 세운 데이터 동적 생성 (최근 10년)
        let seunHtml = '';
        const thisYear = 2026;
        for (let y = thisYear - 9; y <= thisYear; y++) {
            const gap = y - 2026;
            const baseIdx = GANJI_LIST.indexOf("丙午");
            const ganjiIdx = (baseIdx + gap + 60) % 60;
            const seunGanjiStr = GANJI_LIST[ganjiIdx];
            const sSeunGan = seunGanjiStr.charAt(0);
            const sSeunZhi = seunGanjiStr.charAt(1);

            const salVal = get12Sal(dZhi, sSeunZhi);
            const unseongVal = UNSEONG_TABLE[dayGanKey][sSeunZhi] || '-';
            const isCurrentYear = (y === thisYear) ? 'class="active-row"' : '';

            seunHtml += `
                <tr ${isCurrentYear}>
                    <td>${y}년</td>
                    <td>${seunGanjiStr}</td>
                    <td>${sSeunGan}</td>
                    <td>${sSeunZhi}</td>
                    <td>${salVal}</td>
                    <td>${unseongVal}</td>
                </tr>
            `;
        }
        document.getElementById('seun-tbody').innerHTML = seunHtml;

        // ✅ 월운 데이터 동적 생성 (12달)
        let wolunHtml = '';
        const wolunBaseGanjis = [
            "己丑", "庚寅", "辛卯", "壬辰", "癸巳", "甲午", 
            "乙未", "丙申", "丁酉", "戊戌", "己亥", "庚子"
        ];

        for (let m = 1; m <= 12; m++) {
            const wGanjiStr = wolunBaseGanjis[m - 1];
            const wGan = wGanjiStr.charAt(0);
            const wZhi = wGanjiStr.charAt(1);

            const salVal = get12Sal(dZhi, wZhi);
            const unseongVal = UNSEONG_TABLE[dayGanKey][wZhi] || '-';
            const wGanStar = getTenStar(dayGanKey, wGan);
            const wZhiStar = getTenStar(dayGanKey, wZhi, true);

            wolunHtml += `
                <tr>
                    <td>${m}월</td>
                    <td>${m}월명</td>
                    <td>${wGanjiStr}</td>
                    <td>${wGan}</td>
                    <td>${wZhi}</td>
                    <td>${salVal}</td>
                    <td>${unseongVal}</td>
                    <td>${wGanStar}</td>
                    <td>${wZhiStar}</td>
                </tr>
            `;
        }
        document.getElementById('wolun-tbody').innerHTML = wolunHtml;

        // 운세 텍스트 바인딩
        sajuOverallText.innerText = sajuTexts.overall;
        fortuneGeneralText.innerText = sajuTexts.general;
        fortuneWealthText.innerText = sajuTexts.wealth;
        fortuneBusinessText.innerText = sajuTexts.business;
        fortuneLoveText.innerText = sajuTexts.love;

        // 부족한 기운 분석 및 천연석 추천 매치
        const elementsList = ['목', '화', '토', '금', '수'];
        let lackingElement = '목';
        let minCount = 99;
        elementsList.forEach(el => {
            const eng = ELEMENT_ENG_MAP[el];
            const count = counts[eng];
            if (count < minCount) {
                minCount = count;
                lackingElement = el;
            }
        });

        const recommendedList = stones[lackingElement];
        elementText.innerHTML = `분석 결과, 사용자님은 오행 분포 중 <strong>${lackingElement}(${ELEMENT_ENG_MAP[lackingElement].toUpperCase()})</strong> 기운이 상대적으로 가장 부족하거나 조화에 필요합니다.<br>이 부족한 기운을 꽉 채워줄 <strong>${recommendedList.length}가지 맞춤 천연석</strong>을 추천해 드립니다.`;

        recommendedStonesContainer.innerHTML = '';
        recommendedList.forEach(stone => {
            recommendedStonesContainer.innerHTML += `
                <div class="stone-card">
                    <a href="https://search.shopping.naver.com/search/all?query=${encodeURIComponent(stone.name)}" target="_blank" class="stone-image-link">
                        <div class="stone-image-placeholder" style="background-image: url('${stone.image}');"></div>
                    </a>
                    <a href="https://search.shopping.naver.com/search/all?query=${encodeURIComponent(stone.name + ' 팔찌')}" target="_blank" class="stone-image-link">
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

        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText;

        form.classList.add('hidden');
        resultSection.classList.remove('hidden');
        window.scrollTo({ top: resultSection.offsetTop - 20, behavior: 'smooth' });

        // 탭 상태 초기화
        switchCycleTab('daeun');

    } catch (globalError) {
        console.error('글로벌 사주 분석 에러 발생:', globalError);
        alert(`⚠️ 사주 분석 진행 중 에러가 발생했습니다.\n\n[오류 설명]: ${globalError.message}\n\n입력 정보 확인 후 다시 시도해 주세요.`);
        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText;
    }
});

// ✅ 다시 하기 버튼 리스너
resetBtn.addEventListener('click', function() {
    document.getElementById('user-name').value = '';
    document.getElementById('birth-date').value = '';
    document.getElementById('birth-time').value = '06:00';
    setCalendar('solar');
    setGender('male');
    resultSection.classList.add('hidden');
    form.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
