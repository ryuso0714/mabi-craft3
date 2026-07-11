const DOM = {
  calcBtn: document.getElementById("calcBtn"),
  craftResult: document.getElementById("craftResult"),
  rawResult: document.getElementById("rawResult"),
  detailResult: document.getElementById("detailResult"),
  
  // 보유 재료 쪽 DOM
  invSearchInput: document.getElementById("invSearchInput"),
  searchResults: document.getElementById("searchResults"),
  invInputRow: document.getElementById("invInputRow"),
  selectedItemName: document.getElementById("selectedItemName"),
  invCountInput: document.getElementById("invCountInput"),
  addInvBtn: document.getElementById("addInvBtn"),
  invList: document.getElementById("invList"),

  // 제작 목표 쪽 DOM
  quickSearchInput: document.getElementById("quickSearchInput"),
  quickSearchResults: document.getElementById("quickSearchResults"),
  targetInputRow: document.getElementById("targetInputRow"),
  selectedTargetName: document.getElementById("selectedTargetName"),
  targetCountInput: document.getElementById("targetCountInput"),
  addTargetBtn: document.getElementById("addTargetBtn"),
  targetList: document.getElementById("targetList")
};

// 유저 입력 상태 관리
let USER_INVENTORY = {}; // 보유 재료 리스트
let TARGET_GOALS = {};   // 제작 목표 리스트

// 게임 DB 마스터 데이터 생성[span_7](start_span)[span_7](end_span)[span_8](start_span)[span_8](end_span)
function getMasterList() {
  if (window.ITEM_MASTER_CACHE) return window.ITEM_MASTER_CACHE;
  if (typeof GAME_DB === 'undefined') return {};

  const allItems = {};
  for (const category in GAME_DB) {
    let categoryName = "";
    switch(category) {
      case 'metal': categoryName = "금속 가공"; break;
      case 'wood': categoryName = "목재 가공"; break;
      case 'leather': categoryName = "가죽 가공"; break;
      case 'cloth': categoryName = "옷감 가공"; break;
      case 'potion': categoryName = "약품 가공"; break;
      case 'food': categoryName = "식재료 가공"; break;
    }
    for (const itemName in GAME_DB[category]) {
      allItems[itemName] = { isCrafted: true, tagText: categoryName, category };
    }
  }

  for (const category in GAME_DB) {
    for (const itemName in GAME_DB[category]) {
      for (const matName in GAME_DB[category][itemName].ingredients) {
        if (!allItems[matName]) {
          allItems[matName] = { isCrafted: false, tagText: "원재료", category: "raw" };
        }
      }
    }
  }
  window.ITEM_MASTER_CACHE = allItems;
  return allItems;
}

function findItem(itemName) {
  for (const category in GAME_DB) {
    if (GAME_DB[category][itemName]) return GAME_DB[category][itemName];
  }
  return null;
}

/* ===================================================
   [1] 제작 목표 아이템 검색 및 추가 로직
=================================================== */
DOM.quickSearchInput.addEventListener("input", (e) => {
  const currentMaster = getMasterList();
  const query = e.target.value.trim().toLowerCase();
  if (!query) { DOM.quickSearchResults.classList.add("hidden"); return; }

  DOM.quickSearchResults.innerHTML = "";
  let hasResults = false;

  for (const [name, info] of Object.entries(currentMaster)) {
    if (info.isCrafted && name.toLowerCase().includes(query)) {
      hasResults = true;
      const div = document.createElement("div");
      div.className = "search-item";
      div.innerHTML = `<span>${name}</span><span class="badge crafted">${info.tagText}</span>`;
      div.addEventListener("click", () => {
        DOM.selectedTargetName.textContent = name;
        DOM.targetCountInput.value = 1;
        DOM.targetInputRow.classList.remove("hidden");
        DOM.quickSearchResults.classList.add("hidden");
        DOM.quickSearchInput.value = "";
      });
      DOM.quickSearchResults.appendChild(div);
    }
  }
  if (hasResults) DOM.quickSearchResults.classList.remove("hidden");
  else DOM.quickSearchResults.classList.add("hidden");
});

DOM.addTargetBtn.addEventListener("click", () => {
  const name = DOM.selectedTargetName.textContent;
  const count = parseInt(DOM.targetCountInput.value);
  if (!name || isNaN(count) || count <= 0) return;

  TARGET_GOALS[name] = (TARGET_GOALS[name] || 0) + count;
  DOM.targetInputRow.classList.add("hidden");
  renderTags(TARGET_GOALS, DOM.targetList, true);
});

/* ===================================================
   [2] 보유 재료 검색 및 추가 로직[span_9](start_span)[span_9](end_span)
=================================================== */
DOM.invSearchInput.addEventListener("input", (e) => {
  const currentMaster = getMasterList();
  const query = e.target.value.trim().toLowerCase();
  if (!query) { DOM.searchResults.classList.add("hidden"); return; }

  DOM.searchResults.innerHTML = "";
  let hasResults = false;

  for (const [name, info] of Object.entries(currentMaster)) {
    if (name.toLowerCase().includes(query)) {
      hasResults = true;
      const div = document.createElement("div");
      div.className = "search-item";
      div.innerHTML = `<span>${name}</span><span class="badge ${info.isCrafted ? 'crafted' : 'raw'}">${info.tagText}</span>`;
      div.addEventListener("click", () => {
        DOM.selectedItemName.textContent = name;
        DOM.invCountInput.value = 1;
        DOM.invInputRow.classList.remove("hidden");
        DOM.searchResults.classList.add("hidden");
        DOM.invSearchInput.value = "";
      });
      DOM.searchResults.appendChild(div);
    }
  }
  if (hasResults) DOM.searchResults.classList.remove("hidden");
  else DOM.searchResults.classList.add("hidden");
});

DOM.addInvBtn.addEventListener("click", () => {
  const name = DOM.selectedItemName.textContent;
  const count = parseInt(DOM.invCountInput.value);
  if (!name || isNaN(count) || count <= 0) return;

  USER_INVENTORY[name] = (USER_INVENTORY[name] || 0) + count;
  DOM.invInputRow.classList.add("hidden");
  renderTags(USER_INVENTORY, DOM.invList, false);
});

// 공통 태그 렌더링 함수
function renderTags(dataObj, containerDOM, isTarget) {
  containerDOM.innerHTML = "";
  for (const [name, count] of Object.entries(dataObj)) {
    if (count <= 0) continue;
    const tag = document.createElement("div");
    tag.className = "inv-tag";
    tag.innerHTML = `<span>${name} x ${count}</span><button class="remove-btn" data-name="${name}">×</button>`;
    tag.querySelector(".remove-btn").addEventListener("click", (e) => {
      const targetName = e.target.getAttribute("data-name");
      if (isTarget) delete TARGET_GOALS[targetName];
      else delete USER_INVENTORY[targetName];
      renderTags(dataObj, containerDOM, isTarget);
    });
    containerDOM.appendChild(tag);
  }
}

// 엔터 및 외부 클릭 이벤트 리스너 통합 관리
[DOM.quickSearchInput, DOM.invSearchInput].forEach(input => {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const resultsDiv = input.id === "quickSearchInput" ? DOM.quickSearchResults : DOM.searchResults;
      const first = resultsDiv.querySelector(".search-item");
      if (first) first.click();
    }
  });
});

document.addEventListener("click", (e) => {
  if (!DOM.quickSearchInput.contains(e.target) && !DOM.quickSearchResults.contains(e.target)) DOM.quickSearchResults.classList.add("hidden");
  if (!DOM.invSearchInput.contains(e.target) && !DOM.searchResults.contains(e.target)) DOM.searchResults.classList.add("hidden");
});

/* ===================================================
   [3] 핵심 ⚙️ 연산 정렬 및 계층 계산 알고리즘[span_10](start_span)[span_10](end_span)
=================================================== */

// 아이템의 조합 트리 깊이(상위 가공단계 점수)를 측정해 주는 함수
function getItemDepth(itemName) {
  const item = findItem(itemName);
  if (!item) return 0;
  let maxDepth = 0;
  for (const ingredient in item.ingredients) {
    maxDepth = Math.max(maxDepth, getItemDepth(ingredient));
  }
  return maxDepth + 1;
}

// 하위 재료 재귀 분해 함수[span_11](start_span)[span_11](end_span)
function resolveItem(itemName, quantity, result, currentInventory) {
  if (currentInventory[itemName] && currentInventory[itemName] > 0) {
    const available = currentInventory[itemName];
    if (available >= quantity) { currentInventory[itemName] -= quantity; return; }
    else { quantity -= available; currentInventory[itemName] = 0; }
  }

  const item = findItem(itemName);
  if (!item) {
    result.materials[itemName] = (result.materials[itemName] || 0) + quantity;
    return;
  }

  const craftsNeeded = Math.ceil(quantity / item.output);
  result.processCount[itemName] = (result.processCount[itemName] || 0) + craftsNeeded;

  const totalProduced = craftsNeeded * item.output;
  const surplus = totalProduced - quantity;
  if (surplus > 0) currentInventory[itemName] = (currentInventory[itemName] || 0) + surplus;

  for (const [mat, amt] of Object.entries(item.ingredients)) {
    resolveItem(mat, amt * craftsNeeded, result, currentInventory);
  }
}

// 계산 메인 엔진[span_12](start_span)[span_12](end_span)
function calculate() {
  const targetKeys = Object.keys(TARGET_GOALS).filter(k => TARGET_GOALS[k] > 0);
  if (targetKeys.length === 0) { alert("제작할 목표 아이템을 최소 하나 이상 추가해 주세요."); return; }

  // 1단계: 강철괴-철괴가 꼬이지 않게 상위 아이템 단계 순서대로 정렬 (Top-Down 해결법)
  targetKeys.sort((a, b) => getItemDepth(b) - getItemDepth(a));

  const inventoryCopy = JSON.parse(JSON.stringify(USER_INVENTORY));
  
  // 누적 최종 집계 저장소
  const globalProcess = {};  // 전체 가공 횟수 합산
  const globalRawTotal = {}; // 전체 순수 원재료 찐 총합
  const detailsReport = [];  // 목표 아이템별 개별 소요 내역 리포트

  // 2단계: 정렬된 목표 아이템들을 차례대로 순회 연산
  for (const targetName of targetKeys) {
    let neededCount = TARGET_GOALS[targetName];
    
    // 목표 아이템 완제품이 인벤토리에 있으면 먼저 깎기[span_13](start_span)[span_13](end_span)
    if (inventoryCopy[targetName] && inventoryCopy[targetName] > 0) {
      if (inventoryCopy[targetName] >= neededCount) {
        inventoryCopy[targetName] -= neededCount;
        neededCount = 0;
      } else {
        neededCount -= inventoryCopy[targetName];
        inventoryCopy[targetName] = 0;
      }
    }

    const localResult = { processCount: {}, materials: {} };
    if (neededCount > 0) {
      resolveItem(targetName, neededCount, localResult, inventoryCopy);
    }

    // 각 아이템별 상세 내역 보고서 백업
    detailsReport.push({ targetName, goalCount: TARGET_GOALS[targetName], report: localResult });

    // 글로벌 누적 합산
    for (const [m, c] of Object.entries(localResult.processCount)) globalProcess[m] = (globalProcess[m] || 0) + c;
    for (const [m, c] of Object.entries(localResult.materials)) globalRawTotal[m] = (globalRawTotal[m] || 0) + c;
  }

  renderFinalResult(globalProcess, globalRawTotal, detailsReport);
}

// 결과 화면 통합 화면 렌더링[span_14](start_span)[span_14](end_span)
function renderFinalResult(globalProcess, globalRawTotal, detailsReport) {
  const master = getMasterList();

  // [1] 순수 원재료 찐 총합 출력
  let rawHtml = "";
  for (const [mat, count] of Object.entries(globalRawTotal)) {
    if (count > 0) rawHtml += `<div class="result-item"><strong>${mat}</strong> <span>${count}개 필요</span></div>`;
  }
  DOM.rawResult.innerHTML = rawHtml || "필요한 원재료가 없습니다. (보유 재료 충분)";

    // [2] 가공 시설별 그룹화 공정 출력
  const facilityGroups = {};
  for (const [item, count] of Object.entries(globalProcess)) {
    if (count <= 0) continue;
    const info = master[item];
    const categoryText = info ? info.tagText : "기타 가공";
    if (!facilityGroups[categoryText]) facilityGroups[categoryText] = [];
    
    // DB에서 해당 아이템의 1회당 생산량(output)을 가져와 총 생산 아이템 수 계산
    const dbItem = findItem(item);
    const totalOutput = dbItem ? (dbItem.output * count) : 0;
    
    facilityGroups[categoryText].push(`
      <div class="result-item">
        <strong>${item}</strong> 
        <span>${totalOutput}개</span>
        <span style="color: #a0aec0; font-size: 13px; font-weight: 400; margin-left: 4px;">(${count}회 가공)</span>
      </div>
    `);
  }

  let craftHtml = "";
  for (const [facility, itemsArray] of Object.entries(facilityGroups)) {
    craftHtml += `<div class="result-group-title">[${facility}]</div>` + itemsArray.join("");
  }
  DOM.craftResult.innerHTML = craftHtml || "진행할 공정이 없습니다.";

  
  // [3] 목표 아이템별 개별 상세 정보 출력
  let detailHtml = "";
  for (const itemReport of detailsReport) {
    detailHtml += `<div class="result-group-title">🎯 ${itemReport.targetName} (${itemReport.goalCount}개 제작용)</div>`;
    let subMats = [];
    for (const [mat, count] of Object.entries(itemReport.report.materials)) {
      if (count > 0) subMats.push(`${mat} ${count}개`);
    }
    if (subMats.length === 0) {
      detailHtml += `<div class="result-item" style="color:#718096;">인벤토리 보유량으로 충당 완료됨</div>`;
    } else {
      detailHtml += `<div class="result-item" style="font-size:13px; color:#4a5568;">소요 원재료 : ${subMats.join(", ")}</div>`;
    }
  }
  DOM.detailResult.innerHTML = detailHtml || "상세 내역이 없습니다.";
}

DOM.calcBtn.addEventListener("click", calculate);

window.addEventListener("DOMContentLoaded", () => {
  window.ITEM_MASTER_CACHE = null; 
  getMasterList();
});
