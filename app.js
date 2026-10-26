/* Static presentation controller for the unchanged local workbench UI. */
"use strict";
(() => {
  const $ = (id) => document.getElementById(id);
  const catalog = Array.isArray(window.SCHGEN_EXAMPLES) ? window.SCHGEN_EXAMPLES : [];
  const saved = Array.isArray(window.SCHGEN_SHOWCASE?.examples) ? window.SCHGEN_SHOWCASE.examples : [];
  const staticOnly = "静态展示版不连接 Colab，不执行生成或文件操作。";
  let promptMode = "preview";
  let currentResult = null;
  let zoom = 1;
  let previewReady = false;
  let renderSequence = 0;

  function renderMarkdown(element, text) {
    if (window.SchGenMarkdown) window.SchGenMarkdown.render(element, text);
    else element.textContent = text;
  }

  function count(value) {
    return Number.isFinite(value) && value >= 0 ? String(value) : "未记录";
  }

  function setZoom(value) {
    zoom = Math.min(4, Math.max(1, value));
    $("image-stage").style.width = `${zoom * 100}%`;
    $("image-stage").style.height = `${zoom * 100}%`;
    $("zoom-value").textContent = `${Math.round(zoom * 100)}%`;
    if (zoom === 1) {
      $("preview-canvas").scrollLeft = 0;
      $("preview-canvas").scrollTop = 0;
    }
  }

  function resetResult() {
    ++renderSequence;
    previewReady = false;
    for (const id of ["schematic-image", "pcb-image"]) {
      const image = $(id);
      image.onload = null;
      image.onerror = null;
      image.removeAttribute("src");
    }
    $("image-stage").hidden = true;
    $("preview-empty").hidden = false;
    $("pcb-image").hidden = true;
    $("pcb-preview-empty").hidden = false;
    for (const id of ["zoom-out", "zoom-in", "zoom-fit"]) $(id).disabled = true;
    for (const id of ["checks-panel", "pcb-report", "quality-panel", "checks-summary", "pcb-details", "pcb-downloads", "source-files", "schematic-layout-status"]) $(id).hidden = true;
    for (const id of ["checks-content", "pcb-notes"]) $(id).replaceChildren();
    for (const id of ["checks-status", "checks-summary", "pcb-report", "erc-badge", "quality-note", "import-status"]) $(id).textContent = "";
    $("pcb-panel").dataset.state = "waiting";
    $("pcb-panel").setAttribute("aria-busy", "false");
    $("preview-state").className = "preview-state";
    $("pcb-state").className = "small-tag";
    setZoom(1);
  }

  function showEmpty(example) {
    const detail = example
      ? "此原题尚未收录已保存结果；静态展示版不会运行模型。"
      : "当前需求没有匹配的已保存结果；可选择示例查看。";
    $("preview-state").textContent = "暂无结果";
    $("preview-empty").querySelector("h3").textContent = "暂无已保存原理图";
    $("preview-empty").querySelector("p").textContent = detail;
    $("pcb-state").textContent = "暂无结果";
    $("pcb-empty-title").textContent = "暂无已保存 PCB";
    $("pcb-empty-detail").textContent = detail;
    $("pcb-status").textContent = detail;
    $("canvas-context").textContent = detail;
    $("workflow-detail").textContent = "以下阶段均未在本页面运行。选择有保存结果的示例可查看预览。";
  }

  function showChecks(result) {
    const m = result.metrics || {};
    $("checks-panel").hidden = false;
    $("pcb-report").hidden = false;
    $("pcb-report").textContent = `${count(m.components)} 个元件 · ${count(m.nets)} 个网络（${count(m.routedNets)} 个需布线） · ${count(m.tracks)} 段铜线 · ${count(m.vias)} 个过孔`;
    $("quality-panel").hidden = false;
    $("erc-badge").textContent = `ERC · ${count(m.ercErrors)} 错误 / ${count(m.ercWarnings)} 警告`;
    $("erc-badge").className = `erc-badge${m.ercErrors || m.ercWarnings ? " warning" : ""}`;
    $("quality-note").textContent = m.ercErrors || m.ercWarnings
      ? "保存的原理图仍有规则问题，需要检查。"
      : "此处展示保存的检查记录；本页面不重新评测。";
    $("checks-summary").hidden = false;
    $("checks-summary").textContent = `PCB 检查：${count(m.drcErrors)} 错误 / ${count(m.drcWarnings)} 警告 · ${count(m.unconnected)} 项漏连`;
    $("checks-status").textContent = "已保存的检查记录 · 本次未重新检查。";

    if (window.SchGenChecks) {
      const reports = result.checks || {};
      window.SchGenChecks.render($("checks-content"), {
        ...reports,
        source: reports.source || "已保存结果的检查记录",
        ercStatus: "此展示包未包含 ERC 逐项报告，上方保留保存记录中的数量。",
        drcStatus: "此展示包未包含 DRC 逐项报告，上方保留保存记录中的数量。",
      });
      // Missing detailed reports must not be presented as a clean rule check.
      if (!reports.drc?.available && Array.isArray(m.ignoredRules) && m.ignoredRules.length) {
        const details = document.createElement("details");
        details.className = "check-ignored";
        const summary = document.createElement("summary");
        summary.textContent = `未启用的规则（${m.ignoredRules.length}）`;
        const list = document.createElement("ul");
        m.ignoredRules.forEach((rule) => {
          const item = document.createElement("li");
          item.textContent = rule.description || rule.key;
          list.append(item);
        });
        details.append(summary, list);
        $("checks-content").append(details);
      }
    }
    if (result.note) {
      const item = document.createElement("li");
      renderMarkdown(item, result.note);
      $("pcb-notes").append(item);
      $("pcb-details").hidden = false;
    }
  }

  function loadPreview(id, path, sequence, result) {
    const image = $(id);
    const schematic = id === "schematic-image";
    image.alt = `${result.title} · 已保存的${schematic ? "原理图" : "PCB 版图"}`;
    image.onload = () => {
      if (sequence !== renderSequence) return;
      if (schematic) {
        previewReady = true;
        $("image-stage").hidden = false;
        $("preview-empty").hidden = true;
        for (const control of ["zoom-out", "zoom-in", "zoom-fit"]) $(control).disabled = false;
      } else {
        image.hidden = false;
        $("pcb-preview-empty").hidden = true;
      }
    };
    image.onerror = () => {
      if (sequence !== renderSequence) return;
      if (schematic) {
        previewReady = false;
        $("image-stage").hidden = true;
        $("preview-empty").hidden = false;
        $("preview-state").textContent = "预览未加载";
        $("preview-empty").querySelector("h3").textContent = "原理图预览未加载";
        $("preview-empty").querySelector("p").textContent = "请刷新页面重新读取已保存图片。";
        for (const control of ["zoom-out", "zoom-in", "zoom-fit"]) $(control).disabled = true;
      } else {
        image.hidden = true;
        $("pcb-preview-empty").hidden = false;
        $("pcb-state").textContent = "预览未加载";
        $("pcb-empty-title").textContent = "PCB 预览未加载";
        $("pcb-empty-detail").textContent = "请刷新页面重新读取已保存图片。";
      }
    };
    image.src = path;
  }

  function showResult(result, example) {
    resetResult();
    currentResult = result;
    if (!result) { showEmpty(example); return; }
    const sequence = renderSequence;
    const m = result.metrics || {};
    $("canvas-context").textContent = `已保存结果 · ${result.title} · 本次未推理`;
    $("preview-state").textContent = m.ercErrors || m.ercWarnings ? "已保存 · 待检查" : "已保存结果";
    $("preview-state").className = `preview-state${m.ercErrors || m.ercWarnings ? " warning" : ""}`;
    $("preview-empty").querySelector("h3").textContent = "读取已保存原理图";
    $("preview-empty").querySelector("p").textContent = result.title;
    $("import-status").textContent = "展示已保存图片与检查记录；本页面不运行生成。";
    $("pcb-state").textContent = "已保存结果";
    $("pcb-status").textContent = "已保存的 PCB，可查看预览与检查结果。";
    $("pcb-empty-title").textContent = "读取已保存 PCB";
    $("pcb-empty-detail").textContent = result.title;
    $("workflow-detail").textContent = "以下阶段本次未运行；下方展示该原题已保存的原理图、PCB 与检查记录。";
    showChecks(result);
    $("pcb-downloads").hidden = false;
    $("source-files").hidden = false;
    loadPreview("schematic-image", result.schematic, sequence, result);
    loadPreview("pcb-image", result.pcb, sequence, result);
  }

  function updatePromptView() {
    const preview = promptMode === "preview";
    $("user-request").hidden = preview;
    $("prompt-preview").hidden = !preview;
    $("prompt-preview-mode").setAttribute("aria-pressed", String(preview));
    $("prompt-edit-mode").setAttribute("aria-pressed", String(!preview));
    if (preview) renderMarkdown($("prompt-preview"), $("user-request").value || "点击“编辑”填写电路需求。");
  }

  function updateInput() {
    const value = $("user-request").value;
    const example = catalog.find((item) => item.prompt === value);
    const result = saved.find((item) => item.available && item.prompt === value) || null;
    $("char-count").textContent = `${value.length} / 16000`;
    $("input-source-note").textContent = example
      ? "SchGen 官方数据集原题 · 静态展示，可切换预览或编辑。"
      : "自定义需求 · 静态展示版不会提交或生成。";
    $("input-source-note").title = example?.source?.source_line ? `数据集第 ${example.source.source_line} 行。` : "";
    $("live-status").textContent = "静态展示版仅查看已有结果，不执行推理。";
    document.querySelectorAll("[data-example]").forEach((button) => {
      const selected = catalog[Number(button.dataset.example)]?.prompt === value;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    updatePromptView();
    if (result !== currentResult || !result) showResult(result, example);
  }

  $("workbench-mode").textContent = "静态展示";
  $("connection-badge").textContent = "未连接";
  $("connection-status").textContent = "展示模式，不连接 Colab；点击示例查看已保存结果。";
  $("connection-diagnostics").textContent = "静态展示模式：没有连接 Colab、申请 GPU 或加载模型。";
  $("runtime-note").textContent = "此页面不使用 Colab 额度，无需启动或释放 GPU。";
  for (const id of ["owner-help", "guest-help"]) {
    const instructions = [
      "选择原题示例，查看其中已保存的原理图与 PCB。",
      "需求支持 Markdown 预览和编辑；此展示版不会提交或生成新结果。",
      "查看已有检查记录；静态展示版未提供可编辑工程下载。",
    ];
    $(id).querySelectorAll("ol > li").forEach((item, index) => { item.textContent = instructions[index]; });
    $(id).querySelector("p").textContent = "仅展示已保存结果，不连接模型或使用 GPU 额度。";
  }
  $("usage-guide").querySelector(":scope > p").textContent = "刷新页面将恢复默认示例，不会启动或恢复任务。";
  $("source-files").querySelector(".scope-note").textContent = "静态展示版未包含可编辑原理图或原始结果文件。";
  $("workflow").dataset.state = "waiting";
  $("workflow-status").textContent = "静态展示 · 未运行";
  document.querySelectorAll(".workflow-steps > li").forEach((step) => {
    step.dataset.state = "pending";
    step.querySelector(".workflow-step-state").textContent = "未运行";
  });
  for (const id of ["connect-live", "disconnect-live", "generate-live", "import-result", "result-file", "generate-pcb", "resume-pcb", "stop-live", "resume-live", "retry-checks", "download-pcb-project", "download-pcb-board", "download-schematic", "download-original-schematic", "download-result", "copy-code", "confirm-disconnect", "cancel-disconnect"]) {
    $(id).disabled = true;
    $(id).title = staticOnly;
  }
  for (const id of ["live-progress", "result-details", "disconnect-confirm", "stop-live", "resume-live", "pcb-footprint-form", "generate-pcb", "resume-pcb", "retry-checks"]) $(id).hidden = true;

  $("example-buttons").replaceChildren();
  $("more-example-buttons").replaceChildren();
  catalog.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.example = String(index);
    button.textContent = item.title;
    if (item.origin === "official" || item.source?.kind === "official") {
      const badge = document.createElement("span");
      badge.className = "example-origin";
      badge.textContent = item.source?.input_scope === "functional" ? "功能" : "原题";
      button.append(badge);
    }
    button.addEventListener("click", () => {
      $("user-request").value = item.prompt;
      promptMode = "preview";
      updateInput();
    });
    $(index < 6 ? "example-buttons" : "more-example-buttons").append(button);
  });
  $("more-examples").hidden = catalog.length <= 6;
  $("more-example-count").textContent = String(Math.max(0, catalog.length - 6));
  $("user-request").addEventListener("input", updateInput);
  $("prompt-preview-mode").addEventListener("click", () => { promptMode = "preview"; updatePromptView(); });
  $("prompt-edit-mode").addEventListener("click", () => {
    promptMode = "edit";
    updatePromptView();
    $("user-request").focus();
  });
  $("zoom-out").addEventListener("click", () => { if (previewReady) setZoom(zoom - 0.25); });
  $("zoom-in").addEventListener("click", () => { if (previewReady) setZoom(zoom + 0.25); });
  $("zoom-fit").addEventListener("click", () => { if (previewReady) setZoom(1); });
  $("user-request").value = catalog[0]?.prompt || "";
  updateInput();
})();
