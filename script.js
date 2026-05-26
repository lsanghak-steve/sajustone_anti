// HTML 문서에서 요소들을 찾아옵니다.
const form = document.getElementById('saju-form');
const resultSection = document.getElementById('result-section');
const resultTitle = document.getElementById('result-title');
const resetBtn = document.getElementById('reset-btn');
const elementText = document.getElementById('element-text');
const stoneImage = document.getElementById('stone-image');
const stoneName = document.getElementById('stone-name');
const stoneShortDesc = document.getElementById('stone-description');
const stoneLongDesc = document.getElementById('stone-long-text');

// 새롭게 추가된 운세 텍스트 요소들
const sajuOverallText = document.getElementById('saju-overall-text');
const fortuneGeneralText = document.getElementById('fortune-general-text');
const fortuneWealthText = document.getElementById('fortune-wealth-text');
const fortuneBusinessText = document.getElementById('fortune-business-text');
const fortuneLoveText = document.getElementById('fortune-love-text');

// 5가지 천연석 추천 정보입니다. (심층 분석 500자 포함)
const stones = {
    '목': { 
        name: '어벤츄린 (Aventurine)', 
        short_desc: '나무의 기운이 부족할 때 성장을 돕고 마음에 평안을 주는 초록빛 원석입니다.', 
        long_desc: '어벤츄린은 대자연의 싱그러운 생명력을 듬뿍 머금은 강력한 치유의 천연석입니다. 현재 사용자님에게 가장 필요한 기운은 위로 뻗어나가는 성장과 발전, 즉 목(木)의 기운입니다. 사주에서 목 기운이 부족할 경우, 잠재력은 뛰어나지만 이를 현실로 끌어올리는 추진력이나 새로운 변화를 수용하는 유연성이 다소 아쉬울 수 있습니다. 어벤츄린 특유의 맑고 푸른 초록빛 에너지는 마음 깊은 곳에 자리 잡은 막연한 불안감과 스트레스를 부드럽게 녹여주며, 정체된 기운을 뚫고 나갈 수 있는 강한 생명력을 부여해 줍니다. 특히 이 원석은 심장 차크라를 열어주어 타인과의 관계에서 오는 피로감을 덜어주고, 어떤 상황에서도 긍정적인 방향을 바라보게 하는 놀라운 효과가 있습니다. 평소에 이 원석을 곁에 두시면, 겨울 언 땅을 뚫고 나오는 새싹처럼 단단한 의지와 함께 막혀 있던 일들이 서서히 풀려나가는 놀라운 기적을 경험하실 수 있을 것입니다.',
        image: 'images/aventurine_1779795885223.png' 
    },
    '화': { 
        name: '가넷 (Garnet)', 
        short_desc: '불의 기운이 부족할 때 열정과 활력을 채워주는 붉은 원석입니다.', 
        long_desc: '가넷은 꺼지지 않는 뜨거운 열정과 강력한 생명력을 상징하는 진홍빛의 아름다운 천연석입니다. 사주 분석 결과, 현재 사용자님에게는 모든 것을 태워 빛을 내는 화(火)의 기운이 절실히 필요합니다. 화 기운이 부족할 경우, 아이디어나 계획은 훌륭하지만 이를 세상에 적극적으로 드러내고 어필하는 자기표현력이나, 지칠 때 다시 일어서게 하는 내면의 불꽃이 다소 약해질 수 있습니다. 가넷은 심장의 깊은 곳에서부터 뜨거운 열망을 끌어올려, 사용자님의 삶에 강력한 추진력과 흔들림 없는 자신감을 불어넣어 주는 역할을 합니다. 무기력함이나 우울감을 씻어내고 온몸에 따뜻한 활기를 돌게 하며, 목표를 향해 나아가는 과정에서 마주치는 장애물들을 용감하게 뛰어넘을 수 있는 에너지를 선사합니다. 특히 중요한 프로젝트나 사랑하는 사람에게 자신의 매력을 어필해야 하는 순간에 가넷은 최고의 파트너가 되어 줄 것입니다.',
        image: 'images/garnet_1779795902942.png' 
    },
    '토': { 
        name: '호안석 (Tiger\'s Eye)', 
        short_desc: '흙의 기운이 부족할 때 중심을 잡아주고 재물운을 돕는 원석입니다.', 
        long_desc: '호안석은 황금빛과 갈색이 영롱하게 교차하며 호랑이의 날카로운 눈을 닮은, 금전운과 보호를 상징하는 강력한 천연석입니다. 현재 사용자님께 가장 필요한 것은 만물을 품어주고 든든하게 받쳐주는 토(土)의 기운입니다. 토 기운이 부족하면 성격이 다소 조급해지거나, 주변 환경의 변화에 쉽게 휩쓸리며, 그동안 쌓아올린 노력이나 재물이 안정적으로 머물지 못하고 흩어지는 경향이 나타날 수 있습니다. 호안석은 흔들리는 마음에 단단한 뿌리를 내리게 하여, 어떤 폭풍우 속에서도 굳건히 자신의 자리를 지킬 수 있는 흙의 안정감을 듬뿍 채워줍니다. 결단력이 필요한 순간에 예리한 판단을 내리게 도와주며, 금전적인 기운을 단단하게 끌어모아 밖으로 새어나가지 않게 지켜주는 훌륭한 재물 부적이기도 합니다. 타인의 부정적인 기운으로부터 자신을 방어하는 보호석의 역할도 겸하고 있어 마음의 평안을 지켜줍니다.',
        image: 'images/tigers_eye_1779795916884.png' 
    },
    '금': { 
        name: '백수정 (Clear Quartz)', 
        short_desc: '쇠의 기운이 부족할 때 맑고 깨끗한 에너지로 나쁜 기운을 정화해 주는 원석입니다.', 
        long_desc: '백수정은 세상의 모든 부정적인 기운을 씻어내고 맑은 에너지만을 남기는, 정화와 결단력을 상징하는 최고급 투명 천연석입니다. 사주를 살펴보니 사용자님에게는 불필요한 것을 날카롭게 끊어내고 핵심에 집중하게 하는 금(金)의 기운이 다소 부족한 상태입니다. 금 기운이 약하면 정에 휩쓸려 맺고 끊음이 불분명해지거나, 생각이 너무 많아져 결정적인 순간에 선택을 망설이는 상황이 발생할 수 있습니다. 백수정은 안개가 걷힌 맑은 하늘처럼 머릿속을 명쾌하게 비워주고, 날카롭고 이성적인 판단력을 극대화해 줍니다. 복잡하게 얽힌 인간관계나 상황 속에서도 자신에게 진짜 필요한 것이 무엇인지 짚어낼 수 있는 통찰력을 선물합니다. 주변의 나쁜 에너지를 스펀지처럼 흡수하여 맑은 기운으로 정화해 주어, 마음의 평화를 되찾는 데 탁월한 효과가 있습니다. 시련을 시원하게 끊어내고 성공의 길을 열어줄 것입니다.',
        image: 'images/clear_quartz_1779795933106.png' 
    },
    '수': { 
        name: '아쿠아마린 (Aquamarine)', 
        short_desc: '물의 기운이 부족할 때 막힌 흐름을 원활하게 해주고 지혜를 주는 푸른 원석입니다.', 
        long_desc: '아쿠아마린은 잔잔하고 투명한 바다를 그대로 머금은 듯한, 지혜와 소통을 상징하는 영롱한 푸른빛 천연석입니다. 현재 사용자님에게 가장 필요한 에너지는 어디든 스며들고 막힘없이 흘러가는 수(水)의 기운입니다. 사주에 수 기운이 부족할 경우, 변화에 대처하는 유연성이 다소 떨어지고 성격이 경직될 수 있으며, 타인과의 소통에서 감정 표현에 어려움을 겪을 수 있습니다. 아쿠아마린은 메마른 대지에 내리는 단비처럼, 굳어있던 마음을 촉촉하게 적시고 타인과의 관계를 부드럽고 매끄럽게 연결해 주는 강력한 힘을 발휘합니다. 특히 마음속에 담아둔 진심을 상처 주지 않고 가장 아름다운 언어로 표현할 수 있는 소통의 마법을 선사합니다. 복잡한 문제를 마주했을 때 물이 바위를 피해 흘러가듯 지혜롭고 순리대로 해결할 수 있는 직관력과 깊은 혜안을 줍니다. 꽉 막혀있던 인간관계와 금전의 흐름이 시원하게 트이는 것을 느끼실 수 있습니다.',
        image: 'images/aquamarine_1779795946122.png' 
    }
};

// 방대한 운세 텍스트 (총평 2000자, 올해의 운세 각 500자 분량)
const sajuTexts = {
    overall: `사용자님의 사주는 한마디로 '깊은 산속에 우뚝 솟은 큰 나무가 따뜻한 햇살을 받아 마침내 화려한 꽃을 피워내는 형국'이라고 할 수 있습니다. 

타고난 본성은 매우 따뜻하고 다정하며, 남들이 보지 못하는 세밀한 부분까지 챙기는 섬세한 배려심을 지니고 있습니다. 겉으로는 조용하고 부드러워 보이지만, 내면에는 어떤 비바람이 몰아쳐도 절대 꺾이지 않는 강인한 인내심과 단단한 자존심이 깊게 뿌리내리고 있습니다. 초년에는 마치 흙 속에 묻힌 보석처럼 자신의 진가를 세상에 제대로 인정받지 못해 남몰래 마음고생을 하거나 이리저리 방황하는 시기가 있었을 수 있습니다. 남들에게는 쉽게 말 못 할 외로움이나, 노력한 만큼 결과가 바로 나타나지 않아 답답함을 느꼈던 순간들도 적지 않았을 것입니다. 

하지만 사용자님의 진정한 저력은 바로 그 기다림의 시간 속에서 완성되었습니다. 세월이 흐를수록 그동안 차곡차곡 쌓아온 경험과 내공이 찬란한 빛을 발하기 시작하는 대기만성형(大器晩成型)의 훌륭한 명식(命式)을 타고나셨습니다. 한 번 목표를 정하면 중간에 포기하지 않고 끝까지 밀어붙이는 우직함이 있으며, 특유의 성실함과 책임감 덕분에 주변 사람들에게 '어떤 일을 맡겨도 믿을 수 있는 사람'이라는 깊은 신뢰를 얻게 됩니다. 

특히 올해를 기점으로 사용자님의 사주에는 막혀 있던 운의 흐름이 뻥 뚫리고, 인생의 새로운 전성기가 시작되는 거대한 운의 교차점이 다가오고 있습니다. 그동안은 자신이 가진 능력의 30%밖에 발휘하지 못했다면, 이제부터는 100%, 200%의 기량을 온전히 세상에 펼칠 수 있는 완벽한 무대가 마련됩니다. 봄날의 대지가 얼음을 녹이고 새싹을 틔우듯, 과거의 힘들었던 기억이나 실패의 상처들은 모두 앞으로의 큰 성공을 위한 훌륭한 거름이 될 것입니다. 

인간관계에 있어서는 사람을 한 번 믿기까지 시간이 오래 걸리지만, 한 번 내 사람이라고 생각하면 간과 쓸개까지 모두 내어줄 정도로 의리가 깊습니다. 다만, 지나치게 남을 배려하다가 정작 자신이 감당해야 할 짐이 무거워져 홀로 상처받는 경우가 있으니, 때로는 자신의 이익을 먼저 챙기고 단호하게 '거절하는 용기'를 가지는 것이 남은 인생을 더욱 풍요롭고 평안하게 만드는 가장 중요한 열쇠가 될 것입니다. 다가오는 미래에는 사용자님이 상상했던 것 이상의 큰 성취와 빛나는 영광이 기다리고 있으니, 지금의 자리에서 묵묵히 정진하시길 바랍니다. 우주의 모든 긍정적인 기운이 당신의 앞날을 열렬히 응원하고 있습니다.`,

    general: `올해는 사용자님의 인생에서 잊을 수 없는 '황금의 수확기'가 될 것입니다. 지난 몇 년간 땀 흘려 씨앗을 뿌리고 정성껏 가꾸어 온 일들이 드디어 눈부신 결실을 맺는 시기입니다. 연초부터 예상치 못한 곳에서 좋은 소식이 들려오며, 꽉 막혀있던 문제들이 눈 녹듯 스르르 풀려나가는 것을 경험하게 됩니다. 

가장 중요한 열쇠는 '과감한 도전'과 '자신감'입니다. 평소라면 주저하고 망설였을 일이라도, 올해만큼은 긍정적인 마음으로 일단 부딪혀보는 것이 좋습니다. 하늘의 기운이 당신을 적극적으로 돕고 있으니, 약간의 무리가 따르더라도 결국에는 모든 상황이 사용자님에게 유리한 방향으로 흘러가게 될 것입니다. 건강 면에서도 활력이 넘치며, 그동안 지쳐있던 몸과 마음이 완벽하게 회복되는 치유의 한 해가 될 것입니다. 가슴속에 품고 있던 꿈이 있다면 더 이상 미루지 마세요. 올해가 바로 그 꿈을 현실로 바꿀 완벽한 타이밍입니다.`,

    wealth: `올해의 재물운은 마치 '마르지 않는 깊은 우물'과 같이 끊임없이 재물이 솟아나는 형국입니다. 특히 하반기로 갈수록 금전적인 운이 최고조에 달하며, 예상치 못한 보너스, 투자 수익, 혹은 과거에 잊고 있었던 돈이 들어오는 등 뜻밖의 횡재수도 강하게 들어와 있습니다. 

직장인이라면 승진과 함께 연봉이 크게 오를 수 있는 절호의 기회가 찾아오고, 사업자라면 매출이 급성장하여 창고에 재물이 가득 쌓이는 기쁨을 누리게 됩니다. 다만 주의할 점은, 돈이 쉽게 들어오는 만큼 쉽게 나갈 수도 있다는 것입니다. 주변의 달콤한 유혹이나 확실하지 않은 투기성 정보에 흔들리지 말고, 가장 안전하고 보수적인 방법으로 자산을 관리해야 합니다. 들어온 재물을 밖으로 새어나가지 않게 단단히 묶어두는 데 집중한다면, 올해 모은 재물이 평생을 든든하게 받쳐주는 가장 튼튼한 금전적 기반(종잣돈)이 되어줄 것입니다.`,

    business: `사업 및 직장운에 있어서 올해는 '날개를 달고 비상하는 호랑이'의 모습입니다. 직장에서는 그동안의 성실함과 능력을 직속 상사나 결정권자에게 확실하게 인정받아, 아주 중요한 핵심 프로젝트를 맡게 되거나 한 단계 높은 자리로 고속 승진할 수 있는 강력한 운기가 들어와 있습니다. 

자신의 아이디어나 의견을 회의에서 적극적으로 어필하세요. 당신의 기획이 채택되어 큰 성과로 이어질 확률이 매우 높습니다. 사업을 하시는 분이라면 새로운 거래처가 늘어나고 훌륭한 파트너를 만나 사업의 규모를 크게 확장할 수 있는 최고의 시기입니다. 특히 올해 당신에게 도움의 손길을 내미는 '귀인(貴人)'이 나타날 것이니 새로운 사람과의 만남을 소홀히 하지 마십시오. 약간의 위기가 오더라도 이는 당신의 능력을 증명할 수 있는 기회로 작용하며 결국 큰 명예를 거머쥐게 될 것입니다.`,

    love: `올해의 연애 및 대인관계 운은 '따뜻한 봄바람에 활짝 핀 도화꽃'처럼 화사하고 아름답습니다. 싱글이신 분이라면 올봄부터 여름 사이에 당신의 마음을 단번에 사로잡을 운명적인 인연이 나타날 가능성이 매우 큽니다. 우연히 참석한 모임이나 지인의 소개, 취미 활동 등 예상하지 못했던 자연스러운 장소에서 평생을 함께할 든든한 동반자를 만나게 될 운입니다. 

이미 연인이 있거나 기혼자이신 경우에는 두 사람 사이의 애정이 그 어느 때보다 깊고 단단해집니다. 그동안 크고 작은 오해나 갈등이 있었다면 올해를 기점으로 모든 응어리가 깨끗하게 풀리고 서로를 더욱 깊이 이해하게 되는 따뜻한 화해의 시기가 찾아옵니다. 대인관계에서도 당신의 부드러운 매력과 소통 능력이 빛을 발하여, 어딜 가나 사람들의 중심에 서게 되고 많은 이들의 사랑과 신뢰를 독차지하게 될 것입니다. 사람으로 인해 행복을 만끽하는 한 해입니다.`
};

form.addEventListener('submit', function(event) {
    event.preventDefault(); 
    
    // 1. 입력 데이터 가져오기
    const userName = document.getElementById('user-name').value;
    const birthDate = document.getElementById('birth-date').value;
    
    if (!userName || !birthDate) return;

    // 2. 제목 업데이트
    resultTitle.innerText = userName + '님의 오행 결과';

    // 3. 막대 그래프 (가짜 데이터 적용)
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

    // 4. 대규모 텍스트 업데이트 적용
    sajuOverallText.innerText = sajuTexts.overall;
    fortuneGeneralText.innerText = sajuTexts.general;
    fortuneWealthText.innerText = sajuTexts.wealth;
    fortuneBusinessText.innerText = sajuTexts.business;
    fortuneLoveText.innerText = sajuTexts.love;

    // 5. 추천 천연석 계산 및 업데이트
    const numbers = birthDate.split('-');
    const sum = parseInt(numbers[0]) + parseInt(numbers[1]) + parseInt(numbers[2]);
    const elements = ['목', '화', '토', '금', '수'];
    const lackIndex = sum % 5;
    const lackingElement = elements[lackIndex];

    const recommendedStone = stones[lackingElement];

    elementText.innerHTML = '분석 결과, 사용자님은 <strong>' + lackingElement + '</strong> 기운이 가장 필요합니다.';
    stoneName.innerText = recommendedStone.name;
    stoneShortDesc.innerText = recommendedStone.short_desc;
    stoneLongDesc.innerText = recommendedStone.long_desc;
    stoneImage.style.backgroundImage = 'url(' + recommendedStone.image + ')';

    // 6. 화면 전환 및 자동 스크롤
    form.classList.add('hidden');
    resultSection.classList.remove('hidden');
    
    // 결과가 매우 길기 때문에 스크롤을 결과창 맨 위로 부드럽게 이동시킵니다.
    window.scrollTo({ top: resultSection.offsetTop - 20, behavior: 'smooth' });
});

resetBtn.addEventListener('click', function() {
    document.getElementById('user-name').value = '';
    document.getElementById('birth-date').value = '';
    document.getElementById('birth-time').value = '';
    
    resultSection.classList.add('hidden');
    form.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
