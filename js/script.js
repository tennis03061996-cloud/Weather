let currentCode = '270000';
let currentName = '大阪';
let isInitialLoad = true;

const proxyUrl = "https://my-cors-proxy.tennis03061996.workers.dev/?url=";
const targetUrl = "https://www.nao.ac.jp/astro/sky/"; 

const prefCoordinates = {
    "高知": {lat: 33.5597, lon: 133.5311}, "大阪": {lat: 34.6937, lon: 135.5023}, "京都": {lat: 35.0116, lon: 135.7681},
    "兵庫": {lat: 34.6901, lon: 135.1955}, "滋賀": {lat: 35.0178, lon: 135.8546}, "奈良": {lat: 34.6851, lon: 135.8048},
    "和歌山": {lat: 34.2305, lon: 135.1706}, "沖縄": {lat: 26.2124, lon: 127.6809}, "石垣": {lat: 24.3448, lon: 124.1553}
};

// ▼ 更新：定数(const)から変数(let)に変更。もし通信に失敗したときの予備データとして残しているよ
let astroEvents = [
    { date: "2026-04-22", name: "こと座流星群が極大", type: "流星群" },
    { date: "2026-08-13", name: "ペルセウス座流星群が極大", type: "流星群" },
    { date: "2026-10-06", name: "中秋の名月", type: "月" }
];

const jmaIconMap = {
    "100":"100", "101":"101", "102":"102", "103":"102", "104":"104", "105":"104", "106":"102", "107":"102", "108":"102",
    "110":"110", "111":"110", "112":"112", "113":"112", "114":"112", "115":"114", "116":"114", "117":"114", "118":"112", "119":"112",
    "120":"102", "121":"102", "122":"112", "123":"112", "124":"112", "125":"112", "126":"112", "127":"112", "128":"112", "129":"112",
    "130":"100", "131":"100", "132":"101", "140":"102", "160":"104", "170":"104",
    "200":"200", "201":"201", "202":"202", "203":"202", "204":"204", "205":"204", "206":"202", "207":"202", "208":"202", "209":"200",
    "210":"210", "211":"210", "212":"212", "213":"212", "214":"212", "215":"214", "216":"214", "217":"214", "218":"212", "219":"212",
    "220":"202", "221":"202", "222":"212", "223":"212", "224":"212", "225":"212", "226":"212", "227":"212", "228":"212", "229":"212",
    "230":"200", "231":"200", "240":"202", "250":"204", "260":"204", "270":"204",
    "300":"300", "301":"301", "302":"302", "303":"303", "304":"300", "306":"300", "308":"300", "309":"303",
    "311":"311", "313":"313", "314":"314", "315":"314", "316":"311", "317":"313", "320":"311", "321":"313", "322":"303", "323":"311", "324":"311", "325":"311", "328":"300", "329":"303",
    "340":"400", "350":"300", "361":"411", "371":"413",
    "400":"400", "401":"401", "402":"402", "403":"403", "405":"400", "406":"400", "407":"400", "409":"403",
    "411":"411", "413":"413", "414":"414", "420":"411", "421":"413", "422":"414", "423":"411", "425":"411", "426":"411", "427":"414",
    "450":"400"
};

function decodeWMO(code) {
    if(code === 0) return {text: "快晴", icon: "☀️"};
    if(code <= 3) return {text: "晴れ/曇り", icon: "⛅"};
    if(code >= 45 && code <= 48) return {text: "霧", icon: "🌫️"};
    if(code >= 51 && code <= 67) return {text: "雨", icon: "🌧️"};
    if(code >= 71 && code <= 77) return {text: "雪", icon: "❄️"};
    if(code >= 80 && code <= 82) return {text: "にわか雨", icon: "🌦️"};
    if(code >= 95) return {text: "雷雨", icon: "⛈️"};
    return {text: "不明", icon: "❓"};
}

function telopToText(code) {
    const c = String(code);
    const codeMap = {
        "100":"晴れ", "101":"晴時々曇", "102":"晴一時雨", "104":"晴一時雪", "110":"晴後時々曇", "111":"晴のち曇", "112":"晴のち雨", "115":"晴のち雪", "130":"晴朝夕曇",
        "200":"曇り", "201":"曇時々晴", "202":"曇一時雨", "204":"曇一時雪", "210":"曇後時々晴", "211":"曇のち晴", "212":"曇のち雨", "215":"曇のち雪",
        "300":"雨", "301":"雨時々晴", "302":"雨時々止む", "303":"雨時々雪", "311":"雨のち晴", "313":"雨のち曇", "314":"雨のち雪",
        "400":"雪", "401":"雪時々晴", "402":"雪時々止む", "403":"雪時々雨", "411":"雪のち晴", "413":"雪のち曇", "414":"雪のち雨"
    };
    if (codeMap[c]) return codeMap[c];
    const first = c.charAt(0);
    if(first === "1") return "晴れ";
    if(first === "2") return "曇り";
    if(first === "3") return "雨";
    if(first === "4") return "雪";
    return "不明";
}

const warnMap = {
    "02":"暴風雪警報","03":"大雨警報","04":"洪水警報","05":"暴風警報","06":"大雪警報","07":"波浪警報","08":"高潮警報","09":"レベル3土砂災害警報",
    "10":"大雨注意報","12":"大雪注意報","13":"風雪注意報","14":"雷注意報","15":"強風注意報","16":"波浪注意報","17":"融雪注意報","18":"洪水注意報","19":"高潮注意報","20":"濃霧注意報","21":"乾燥注意報","22":"なだれ注意報","23":"低温注意報","24":"霜注意報","25":"着氷注意報","26":"着雪注意報",
    "32":"暴風雪特別警報","33":"大雨特別警報","35":"暴風特別警報","36":"大雪特別警報","37":"波浪特別警報","38":"高潮特別警報"
};

function getLunarDetails(date) {
    const refDate = new Date(2000, 0, 6, 18, 14);
    const diff = (date - refDate) / (1000 * 60 * 60 * 24);
    const age = diff % 29.53;
    let icon = age < 1 ? "🌑" : age < 7 ? "🌒" : age < 9 ? "🌓" : age < 14 ? "🌔" : age < 16 ? "🌕" : age < 22 ? "🌖" : age < 24 ? "🌗" : "🌘";
    return { age: age.toFixed(1), icon, name: age < 1 ? "新月" : age < 15 ? "満月へ向かう月" : "満月" , desc: "月の満ち欠けを表示しています。" };
}

function updateMoonHeader() {
    const info = getLunarDetails(new Date());
    document.getElementById('headerMoonIcon').innerText = info.icon;
    document.getElementById('headerMoonName').innerText = `月齢 ${info.age}`;
}

function openMoonModal() {
    document.getElementById('moonModal').style.display = 'flex';
    const info = getLunarDetails(new Date());
    document.getElementById('moonLargeIcon').innerText = info.icon;
    document.getElementById('moonPhaseName').innerText = `月齢 ${info.age}`;
    renderAstroEvents();
}

function closeMoonModal() { document.getElementById('moonModal').style.display = 'none'; }

// ▼ 更新：astroEventsを元にリストを作るように変更
function renderAstroEvents() {
    const container = document.getElementById('eventContainer');
    // 最新のイベントを3つだけ表示するよ
    container.innerHTML = astroEvents.slice(0, 3).map(e => `
        <div class="event-item">
            <span class="event-tag">${e.type}</span>
            <div style="color:white;"><b>${e.name}</b><br><small>${e.date}</small></div>
        </div>
    `).join('');
}

// ▼ 更新：自動でキーワードを抽出するスクレイピング処理
async function fetchNAOJEvents() {
    const statusEl = document.getElementById('naojStatus');
    if (!statusEl) return;
    
    try {
        const response = await fetch(proxyUrl + targetUrl);
        const textData = await response.text(); 
        const parser = new DOMParser();
        const doc = parser.parseFromString(textData, "text/html");
        
        // ページ内のリンク(a)や見出し(h2,h3,h4)をすべて取得
        const elements = doc.querySelectorAll('a, h2, h3, h4');
        
        // 探したい天文イベントのキーワードリスト
        const keywords = ['流星群', '月食', '日食', 'スーパームーン', '接近', '彗星', '満月', '新月'];
        let newEvents = [];

        elements.forEach(el => {
            // 余計な空白や改行を消して綺麗にする
            const text = el.innerText.replace(/\s+/g, ' ').trim(); 
            
            // 短すぎたり長すぎる文章はノイズとして弾く（4〜35文字くらいがイベント名の目安）
            if (text.length > 3 && text.length < 35) {
                // キーワードが含まれているか判定
                const hasKeyword = keywords.some(kw => text.includes(kw));
                // すでに同じ名前のイベントが追加されていないか判定
                const isDuplicate = newEvents.some(e => e.name === text);

                if (hasKeyword && !isDuplicate) {
                    // キーワードに応じたタグ付け
                    let typeTag = "星空";
                    if (text.includes("流星群")) typeTag = "流星群";
                    else if (text.includes("食")) typeTag = "天文現象";
                    else if (text.includes("月") || text.includes("スーパームーン")) typeTag = "月";
                    else if (text.includes("接近")) typeTag = "惑星";
                    else if (text.includes("彗星")) typeTag = "彗星";

                    newEvents.push({
                        date: "最新情報(NAOJ)", // htmlの構造上、日付の抽出は複雑になるため固定文字にしているよ
                        name: text,
                        type: typeTag
                    });
                }
            }
        });

        if (newEvents.length > 0) {
            // うまく取得できたら、グローバル変数を上書きして画面を更新！
            astroEvents = newEvents;
            renderAstroEvents();
            statusEl.innerHTML = `✅ 国立天文台の最新情報に更新済み`;
            statusEl.style.border = "none"; // 枠線を消してさりげなく
        } else {
            statusEl.innerHTML = `⚠️ キーワードが見つからなかったよ（予備データを表示）`;
        }
    } catch (err) {
        console.error("NAOJデータ取得エラー:", err);
        statusEl.innerHTML = `⚠️ 通信エラー: 予備のイベントデータを表示中`;
    }
}
// ▲ ここまで ▲

async function fetchCurrentWeather(lat, lon, target) {
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Asia%2FTokyo`);
        const data = await res.json();
        const info = decodeWMO(data.current_weather.weathercode);
        if(target === 'pref') {
            document.getElementById('prefCurrentDesc').innerText = `${info.icon} ${info.text}`;
            document.getElementById('prefCurrentTemp').innerText = `${data.current_weather.temperature}℃`;
        } else if(target === 'gps') {
            document.getElementById('gpsLoading').style.display = 'none';
            document.getElementById('gpsResult').style.display = 'block';
            document.getElementById('gpsIcon').innerText = info.icon;
            document.getElementById('gpsDesc').innerText = info.text;
            document.getElementById('gpsTemp').innerText = `${data.current_weather.temperature}℃`;
        }
    } catch(e) { console.error("現在の天気取得エラー:", e); }
}

function fetchGPSWeather(isAuto = false) {
    document.getElementById('gpsModal').style.display = 'flex';
    document.getElementById('gpsLoading').style.display = 'block';
    document.getElementById('gpsResult').style.display = 'none';
    
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => { fetchCurrentWeather(pos.coords.latitude, pos.coords.longitude, 'gps'); },
            (err) => { document.getElementById('gpsLoading').innerText = "GPS情報の取得に失敗しました。"; },
            { timeout: 8000 }
        );
    } else {
        document.getElementById('gpsLoading').innerText = "お使いのブラウザはGPSに対応していません。";
    }
}

function closeModal() { document.getElementById('gpsModal').style.display = 'none'; }

async function loadWeatherMap() {
    try {
        const res = await fetch('https://www.jma.go.jp/bosai/weather_map/data/list.json');
        const data = await res.json();
        const latest = data.near.now[data.near.now.length - 1];
        document.getElementById('mapBox').innerHTML = `<img src="https://www.jma.go.jp/bosai/weather_map/data/png/${latest}" class="map-img" onclick="window.open(this.src)">`;
    } catch(e) { document.getElementById('mapBox').innerText = "天気図の取得に失敗しました。"; }
}

async function updateArea(code, name, el) {
    currentCode = code;
    currentName = name;
    document.getElementById('loading-overlay').style.display = 'block';
    document.getElementById('areaLabel').innerText = name;
    
    if(el) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
    }

    const coords = prefCoordinates[name];
    if(coords) fetchCurrentWeather(coords.lat, coords.lon, 'pref');

    try {
        const [fRes, oRes, wRes, iRes] = await Promise.all([
            fetch(`https://www.jma.go.jp/bosai/forecast/data/forecast/${code}.json`),
            fetch(`https://www.jma.go.jp/bosai/forecast/data/overview_forecast/${code}.json`),
            fetch(`https://www.jma.go.jp/bosai/warning/data/warning/${code}.json`),
            fetch(`https://www.jma.go.jp/bosai/information/data/information.json`).catch(() => null)
        ]);

        const fData = await fRes.json();
        const oData = await oRes.json();
        const wData = await wRes.json();
        let iData = null;
        if(iRes && iRes.ok) { iData = await iRes.json(); }

        const mainAreas = fData[0]?.timeSeries[0]?.areas || [];
        let allShortHtml = "";
        let allWeeklyHtml = "";

        mainAreas.forEach((area) => {
            const areaCode = area.area.code;
            const areaName = area.area.name;
            let dailyData = {}; 
            let popMap = {};

            try {
                const shortPopSeries = fData[0]?.timeSeries?.find(s => s.areas && s.areas.some(a => a.pops));
                if (shortPopSeries) {
                    const targetArea = shortPopSeries.areas.find(a => a.area.code === areaCode) || shortPopSeries.areas[0];
                    shortPopSeries.timeDefines.forEach((t, i) => {
                        const dateStr = t.split('T')[0];
                        const popStr = targetArea.pops[i];
                        if (popStr !== undefined && popStr !== "") {
                            const popVal = parseInt(popStr);
                            if (!isNaN(popVal)) {
                                if (popMap[dateStr] === undefined || popVal > popMap[dateStr]) popMap[dateStr] = popVal;
                            }
                        }
                    });
                }
                const weeklyPopSeries = fData[1]?.timeSeries?.find(s => s.areas && s.areas.some(a => a.pops));
                if (weeklyPopSeries) {
                    const targetArea = weeklyPopSeries.areas.find(a => a.area.code === areaCode) || weeklyPopSeries.areas[0];
                    weeklyPopSeries.timeDefines.forEach((t, i) => {
                        const dateStr = t.split('T')[0];
                        const popStr = targetArea.pops[i];
                        if (popStr !== undefined && popStr !== "") {
                            const popVal = parseInt(popStr);
                            if (!isNaN(popVal)) {
                                if (popMap[dateStr] === undefined || popVal > popMap[dateStr]) popMap[dateStr] = popVal;
                            }
                        }
                    });
                }

                if (shortPopSeries) {
                    const targetArea = shortPopSeries.areas.find(a => a.area.code === areaCode) || shortPopSeries.areas[0];
                    shortPopSeries.timeDefines.forEach((t, i) => {
                        const dateStr = t.split('T')[0];
                        const timeHourStr = t.split('T')[1].substring(0, 2);
                        const popStr = targetArea.pops[i];
                        if (!dailyData[dateStr]) dailyData[dateStr] = { popsArray: ["-", "-", "-", "-"] };
                        if (popStr !== undefined && popStr !== "") {
                            let popIdx = -1;
                            if (timeHourStr === "00") popIdx = 0;
                            else if (timeHourStr === "06") popIdx = 1;
                            else if (timeHourStr === "12") popIdx = 2;
                            else if (timeHourStr === "18") popIdx = 3;
                            if (popIdx !== -1) dailyData[dateStr].popsArray[popIdx] = popStr + "%";
                        }
                    });
                }
            } catch (e) {}

            if (fData[0] && fData[0].timeSeries && fData[0].timeSeries[0]) {
                const shortWeather = fData[0].timeSeries[0];
                const targetArea = shortWeather.areas.find(a => a.area.code === areaCode) || shortWeather.areas[0];
                shortWeather.timeDefines.forEach((time, index) => {
                    const dateStr = time.split('T')[0];
                    const d = new Date(time);
                    let dayLabel = `${d.getMonth()+1}/${d.getDate()}`;
                    if(dateStr === new Date().toISOString().split('T')[0]) dayLabel = "今日";
                    else if(dateStr === new Date(Date.now() + 86400000).toISOString().split('T')[0]) dayLabel = "明日";
                    if (!dailyData[dateStr]) dailyData[dateStr] = {};
                    let wText = targetArea.weathers ? targetArea.weathers[index] : telopToText(targetArea.weatherCodes[index]);
                    dailyData[dateStr] = { ...dailyData[dateStr], dateText: dayLabel, weatherCode: targetArea.weatherCodes[index], weatherText: wText, minTemp: dailyData[dateStr].minTemp || "-", maxTemp: dailyData[dateStr].maxTemp || "-", popsArray: dailyData[dateStr].popsArray || ["-", "-", "-", "-"] };
                });
            }

            if (fData[0] && fData[0].timeSeries && fData[0].timeSeries.length > 2) {
                const shortTemps = fData[0].timeSeries[2];
                const targetArea = shortTemps.areas.find(a => a.area.code === areaCode) || shortTemps.areas[0];
                shortTemps.timeDefines.forEach((time, index) => {
                    const dateStr = time.split('T')[0];
                    const timeHour = time.split('T')[1].substring(0, 2);
                    if (dailyData[dateStr] && index < targetArea.temps.length) {
                        const tempValue = targetArea.temps[index];
                        if (timeHour === "00" || timeHour === "06") { dailyData[dateStr].minTemp = tempValue; }
                        else if (timeHour === "09" || timeHour === "12") { dailyData[dateStr].maxTemp = tempValue; }
                    }
                });
            }

            if (fData.length > 1 && fData[1].timeSeries) {
                const weeklyWeather = fData[1].timeSeries[0];
                const weeklyTemps = fData[1].timeSeries.length > 1 ? fData[1].timeSeries[1] : null;
                const targetAreaW = weeklyWeather.areas.find(a => a.area.code === areaCode) || weeklyWeather.areas[0];
                weeklyWeather.timeDefines.forEach((time, index) => {
                    const dateStr = time.split('T')[0];
                    const wCode = targetAreaW.weatherCodes[index];
                    if (!dailyData[dateStr]) dailyData[dateStr] = {};
                    let wText = dailyData[dateStr].weatherText || telopToText(wCode);
                    if (!dailyData[dateStr].weatherCode) {
                        const d = new Date(time);
                        dailyData[dateStr] = { ...dailyData[dateStr], dateText: `${d.getMonth()+1}/${d.getDate()}`, weatherCode: wCode, weatherText: wText, minTemp: "-", maxTemp: "-" };
                    }
                });
                if (weeklyTemps) {
                    const targetAreaT = weeklyTemps.areas.find(a => a.area.code === areaCode) || weeklyTemps.areas[0];
                    weeklyTemps.timeDefines.forEach((time, index) => {
                        const dateStr = time.split('T')[0];
                        if (dailyData[dateStr]) {
                            if (targetAreaT.tempsMin?.[index]) dailyData[dateStr].minTemp = targetAreaT.tempsMin[index];
                            if (targetAreaT.tempsMax?.[index]) dailyData[dateStr].maxTemp = targetAreaT.tempsMax[index];
                        }
                    });
                }
            }

            let shortHtml = ""; let weeklyHtml = ""; let dayCount = 0;
            Object.keys(dailyData).sort().forEach(dateStr => {
                const d = dailyData[dateStr];
                if (!d.weatherCode) return;
                const mappedCode = jmaIconMap[d.weatherCode] || (String(d.weatherCode).charAt(0) + "00");
                const iconUrl = `https://www.jma.go.jp/bosai/forecast/img/${mappedCode}.svg`;
                const popDisplay = popMap[dateStr] !== undefined ? `${popMap[dateStr]}%` : "--%";
                if (dayCount < 3) {
                    let popSectionHtml = `<div class="pop-box">☔ ${popDisplay}</div>`;
                    if (dayCount < 2 && d.popsArray) {
                        popSectionHtml = `<table class="pop-table"><tr><th>0-6</th><th>6-12</th><th>12-18</th><th>18-24</th></tr><tr><td>${d.popsArray[0]}</td><td>${d.popsArray[1]}</td><td>${d.popsArray[2]}</td><td>${d.popsArray[3]}</td></tr></table>`;
                    }
                    shortHtml += `<div class="forecast-day"><div class="forecast-date">${d.dateText}</div><img src="${iconUrl}" class="weather-img"><div class="weather-text">${d.weatherText}</div>${popSectionHtml}<div class="temp-box"><span class="temp-max">${d.maxTemp}${d.maxTemp!=="-"?"℃":""}</span> / <span class="temp-min">${d.minTemp}${d.minTemp!=="-"?"℃":""}</span></div></div>`;
                } else {
                    weeklyHtml += `<div class="forecast-day"><div class="forecast-date">${d.dateText}</div><img src="${iconUrl}" class="weather-img"><div class="weather-text">${d.weatherText}</div><div class="pop-box">☔ ${popDisplay}</div><div class="temp-box"><span class="temp-max">${d.maxTemp}${d.maxTemp!=="-"?"℃":""}</span>/<br><span class="temp-min">${d.minTemp}${d.minTemp!=="-"?"℃":""}</span></div></div>`;
                }
                dayCount++;
            });
            allShortHtml += `<div class="sub-area-card"><h3 class="sub-forecast-title">${areaName}</h3><div class="forecast-container">${shortHtml}</div></div>`;
            allWeeklyHtml += `<div class="sub-area-card"><h3 class="sub-forecast-title">${areaName}</h3><div class="forecast-container">${weeklyHtml}</div></div>`;
        });

        document.getElementById('shortForecastsWrapper').innerHTML = allShortHtml;
        document.getElementById('weeklyForecastsWrapper').innerHTML = allWeeklyHtml;
        document.getElementById('overview').innerText = oData.text || "概況なし";

        const alertBox = document.getElementById('alertContainer');
        let alertHtml = wData.headlineText ? `<div class="warning-badge">📢 ${wData.headlineText}</div>` : "";
        let alerts = [];
        function findWarn(o) {
            if(Array.isArray(o)) o.forEach(findWarn);
            else if(typeof o === 'object' && o !== null) {
                if(o.code && warnMap[o.code] && (o.status==="発表" || o.status==="継続")) alerts.push(warnMap[o.code]);
                for(let k in o) findWarn(o[k]);
            }
        }
        findWarn(wData);
        alerts = [...new Set(alerts)];
        if(alerts.length > 0) alerts.forEach(a => alertHtml += `<div class="${a.includes('警報')?'danger-badge':'warning-badge'}">${a}</div>`);
        else if(!wData.headlineText) alertHtml = `<div class="safe-badge">🟢 現在、警報・注意報はありません</div>`;
        alertBox.innerHTML = alertHtml;
        document.getElementById('linkAlert').href = `https://www.jma.go.jp/bosai/warning/#area_type=offices&area_code=${code}&lang=ja`;

        const infoBox = document.getElementById('infoContainer');
        if(iData) {
            let localInfos = iData.filter(info => {
                const title = info.title || info.headTitle || "";
                const office = info.publishingOffice || "";
                if (name === "京都" && (title.includes("東京都") || office.includes("東京"))) return false; 
                return title.includes(name) || office.includes(name);
            });
            if (localInfos.length > 0) {
                localInfos.sort((a, b) => new Date(b.reportDatetime || 0) - new Date(a.reportDatetime || 0));
                let fHtml = "", cHtml = "", fList = [], cList = [];
                localInfos.forEach(info => {
                    const extT = info.headTitle || info.title || info.controlTitle || '気象情報';
                    if (extT.includes(name) || extT.includes("府") || extT.includes("県")) fList.push(info); else cList.push(info);
                });
                function build(list) {
                    if(!list.length) return "";
                    let m = ""; let a = "";
                    list.forEach((info, index) => {
                        const time = info.reportDatetime ? new Date(info.reportDatetime).toLocaleString('ja-JP', {month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'}) : "不明";
                        const extT = info.headTitle || info.title || info.controlTitle || '気象情報';
                        const sno = info.serialNo || "";
                        const isL = index === 0;
                        const item = `<a href="https://www.jma.go.jp/bosai/information/#area_type=offices&area_code=${code}" target="_blank" style="text-decoration:none; color:inherit;"><div class="warning-badge" style="${isL?'background:#fff5f5; border-left-color:#e53935;':'background:#e3f2fd;'}"><div style="font-size:0.75rem; color:#666;">🕒 ${time}</div><div style="font-weight:bold;">${isL?'<span style="background:#e53935; color:#fff; padding:2px 4px; border-radius:3px; font-size:0.6rem;">NEW</span> ':''}${extT}${sno?' 第'+sno+'号':''}</div></div></a>`;
                        if(isL) m += item; else a += item;
                    });
                    if(a) m += `<details class="info-accordion"><summary>過去の発表 (${list.length-1}件)</summary>${a}</details>`;
                    return m;
                }
                infoBox.innerHTML = (fList.length ? `<div style="font-size:0.8rem; font-weight:bold; color:var(--primary);">📍 府県情報</div>` + build(fList) : "") + (cList.length ? `<div style="font-size:0.8rem; font-weight:bold; color:#d97706; margin-top:10px;">🌐 地方情報</div>` + build(cList) : "");
            } else infoBox.innerHTML = `<div class="safe-badge">🟢 気象情報はありません</div>`;
        }

        fetch(`https://www.jma.go.jp/bosai/forecaster_comment/data/comments/${code}.txt`).then(res => {
            if (res.ok) res.arrayBuffer().then(buf => { document.getElementById('commentIframe').srcdoc = new TextDecoder("utf-8").decode(buf); });
            else document.getElementById('commentIframe').srcdoc = "コメントはありません。";
        });

    } catch(e) { console.error("Error:", e); }
    loadHistory(code);
    setTimeout(() => { document.getElementById('loading-overlay').style.display = 'none'; }, 500);
}

function recordHistory(code, content) {
    let history = JSON.parse(localStorage.getItem(`hist_${code}`)) || [];
    history.unshift({ dateLabel: new Date().toLocaleTimeString('ja-JP', {hour:'2-digit', minute:'2-digit'}), content });
    if(history.length > 10) history.pop();
    localStorage.setItem(`hist_${code}`, JSON.stringify(history));
    loadHistory(currentCode);
}

function loadHistory(code) {
    let h = JSON.parse(localStorage.getItem(`hist_${code}`)) || [];
    document.getElementById('historyBox').innerHTML = h.length ? h.map(x => `<div class="history-item"><span class="history-time">${x.dateLabel}</span> ${x.content}</div>`).join("") : "記録なし";
}

window.onload = () => {
    updateMoonHeader();
    loadWeatherMap();
    fetchNAOJEvents();
    
    const tabs = document.querySelectorAll('.tab');
    let osakaTab = Array.from(tabs).find(t => t.innerText.includes('大阪')) || tabs[0];
    if (osakaTab) {
        osakaTab.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
        updateArea('270000', '大阪', osakaTab);
    }
    setTimeout(() => fetchGPSWeather(false), 1000);
    isInitialLoad = false;
};
