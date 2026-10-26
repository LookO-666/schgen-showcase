/* Read saved KiCad reports. No generation, rerun, or remote URLs are triggered here. */
"use strict";
(() => {
  const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
  const require = (condition, message) => { if (!condition) throw new Error(message); };
  const text = (value, max = 6000) => typeof value === "string" ? value.slice(0, max) : "";
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const titles = {
    power_pin_not_driven: "电源输入引脚未被驱动", pin_not_connected: "引脚未连接",
    pin_not_driven: "输入引脚未被驱动", endpoint_off_grid: "连接端点偏离网格",
    lib_symbol_issues: "符号库配置问题", duplicate_reference: "元件标号重复",
    unconnected_items: "焊盘或走线未连接", clearance: "铜线或焊盘间距不足",
    shorting_items: "不同网络短路", copper_edge_clearance: "铜层与板边间距不足",
    silk_overlap: "丝印重叠", silk_over_copper: "丝印覆盖铜层", silk_edge_clearance: "丝印与板边间距不足",
    courtyard_overlap: "元件占位区域重叠", track_width: "走线宽度不符合规则",
    hole_clearance: "孔间距不足", schematic_parity: "原理图与 PCB 不一致",
  };

  function issues(raw, sheet = "") {
    require(Array.isArray(raw) && raw.length <= 5000, "检查报告的问题列表无效或过大。");
    return raw.map(issue => {
      require(object(issue) && typeof issue.severity === "string", "检查报告缺少问题级别。");
      require(issue.items === undefined || Array.isArray(issue.items) && issue.items.length <= 200, "检查报告的相关对象列表无效。");
      return {
        severity: text(issue.severity, 80), type: text(issue.type, 160), description: text(issue.description), sheet,
        items: (issue.items || []).map(item => {
          require(object(item), "检查报告的相关对象无效。");
          const pos = item.pos;
          return { description: text(item.description), uuid: text(item.uuid, 100),
            pos: object(pos) && Number.isFinite(pos.x) && Number.isFinite(pos.y) ? { x: pos.x, y: pos.y } : null };
        }),
      };
    });
  }

  function metadata(raw) {
    return { date: text(raw.date, 100), units: text(raw.coordinate_units, 20),
      ignored: Array.isArray(raw.ignored_checks) ? raw.ignored_checks.slice(0, 100).filter(object)
        .map(item => ({ key: text(item.key, 160), description: text(item.description, 1000) })) : [] };
  }
  function count(list) {
    return { errors: list.filter(issue => issue.severity === "error").length,
      warnings: list.filter(issue => issue.severity === "warning").length,
      exclusions: list.filter(issue => issue.severity === "exclusion").length,
      others: list.filter(issue => !["error", "warning", "exclusion"].includes(issue.severity)).length,
      violations: list.length };
  }
  function missing(kind) { return { kind, available: false, counts: null, groups: [] }; }
  function normalizeERC(raw) {
    if (raw === null || raw === undefined) return missing("erc");
    require(object(raw) && Array.isArray(raw.sheets) && raw.sheets.length > 0 && raw.sheets.length <= 1000, "ERC 报告格式无效。");
    const list = raw.sheets.flatMap(sheet => {
      require(object(sheet), "ERC 图纸记录无效。");
      return issues(sheet.violations, text(sheet.path, 300));
    });
    require(list.length <= 5000, "ERC 报告的问题列表过大。");
    return { kind: "erc", available: true, ...metadata(raw), counts: count(list),
      groups: [{ key: "violations", label: "电气规则问题", issues: list }] };
  }
  function normalizeDRC(raw) {
    if (raw === null || raw === undefined) return missing("drc");
    require(object(raw), "DRC 报告格式无效。");
    const groups = [
      { key: "violations", label: "PCB 规则问题", issues: issues(raw.violations) },
      { key: "unconnected_items", label: "未连接项目", issues: issues(raw.unconnected_items) },
      { key: "schematic_parity", label: "原理图一致性问题", issues: issues(raw.schematic_parity) },
    ];
    require(groups.reduce((sum, group) => sum + group.issues.length, 0) <= 5000, "DRC 报告的问题列表过大。");
    return { kind: "drc", available: true, ...metadata(raw),
      counts: { ...count(groups[0].issues), unconnected_items: groups[1].issues.length, schematic_parity: groups[2].issues.length }, groups };
  }

  function inspectZip(bytes) {
    require(bytes instanceof Uint8Array && bytes.length >= 22 && bytes.length <= 64 * 1024 * 1024, "PCB 工程 ZIP 无效或超过 64 MB。");
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let end = -1;
    for (let at = bytes.length - 22; at >= Math.max(0, bytes.length - 65557); at--) {
      if (view.getUint32(at, true) === 0x06054b50 && at + 22 + view.getUint16(at + 20, true) === bytes.length) { end = at; break; }
    }
    require(end >= 0, "PCB 工程 ZIP 目录不完整。");
    const entries = view.getUint16(end + 10, true), size = view.getUint32(end + 12, true), start = view.getUint32(end + 16, true);
    require(view.getUint16(end + 4, true) === 0 && view.getUint16(end + 6, true) === 0 && view.getUint16(end + 8, true) === entries,
      "不支持分卷 PCB 工程 ZIP。");
    require(entries > 0 && entries <= 256 && start !== 0xffffffff && size !== 0xffffffff && start + size === end, "PCB 工程 ZIP 目录无效或文件过多。");
    const table = new Map(), ranges = [];
    let cursor = start, expanded = 0;
    for (let n = 0; n < entries; n++) {
      require(cursor + 46 <= end && view.getUint32(cursor, true) === 0x02014b50, "PCB 工程 ZIP 目录损坏。");
      const flags = view.getUint16(cursor + 8, true), method = view.getUint16(cursor + 10, true);
      const crc = view.getUint32(cursor + 16, true), packed = view.getUint32(cursor + 20, true), unpacked = view.getUint32(cursor + 24, true);
      const nameSize = view.getUint16(cursor + 28, true), extraSize = view.getUint16(cursor + 30, true), commentSize = view.getUint16(cursor + 32, true);
      const local = view.getUint32(cursor + 42, true), next = cursor + 46 + nameSize + extraSize + commentSize;
      require(next <= end && nameSize > 0, "PCB 工程 ZIP 文件名不完整。");
      const name = decoder.decode(bytes.subarray(cursor + 46, cursor + 46 + nameSize));
      const parts = name.replace(/\/$/, "").split("/");
      require(name.length <= 240 && !/[^\x20-\x7e]|[\\:]/.test(name) && parts.every(part => part && part !== "." && part !== "..") && !table.has(name),
        "PCB 工程 ZIP 含异常路径或重复文件。");
      require(!(flags & 1) && [0, 8].includes(method) && view.getUint16(cursor + 34, true) === 0 &&
        ![packed, unpacked, local].includes(0xffffffff), "不支持此 PCB 工程 ZIP 格式。");
      expanded += unpacked;
      require(expanded <= 32 * 1024 * 1024, "PCB 工程 ZIP 解压后超过 32 MB。");
      require(local + 30 <= start && view.getUint32(local, true) === 0x04034b50, "PCB 工程 ZIP 本地文件头无效。");
      const localNameSize = view.getUint16(local + 26, true), localExtra = view.getUint16(local + 28, true);
      const dataStart = local + 30 + localNameSize + localExtra;
      require(dataStart + packed <= start && decoder.decode(bytes.subarray(local + 30, local + 30 + localNameSize)) === name &&
        view.getUint16(local + 8, true) === method && view.getUint16(local + 6, true) === flags, "PCB 工程 ZIP 目录与内容不一致。");
      ranges.push([local, dataStart + packed]); table.set(name, { crc, packed, unpacked }); cursor = next;
    }
    require(cursor === end, "PCB 工程 ZIP 目录长度无效。");
    ranges.sort((a, b) => a[0] - b[0]);
    for (let n = 1; n < ranges.length; n++) require(ranges[n][0] >= ranges[n - 1][1], "PCB 工程 ZIP 条目重叠。");
    return table;
  }
  const crcTable = Uint32Array.from({ length: 256 }, (_, value) => {
    let crc = value;
    for (let n = 0; n < 8; n++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    return crc >>> 0;
  });
  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 255];
    return (crc ^ 0xffffffff) >>> 0;
  }
  function compareCounts(report, expected, label) {
    if (!object(expected)) return;
    const fields = report.kind === "erc" ? ["errors", "warnings"] : ["errors", "warnings", "violations", "unconnected_items", "schematic_parity"];
    for (const key of fields) if (expected[key] !== undefined) {
      require(report.available && Number.isInteger(expected[key]) && expected[key] >= 0 && report.counts[key] === expected[key], `${label}的 ${key} 数量与详细检查报告不一致。`);
    }
  }
  async function readProject(bytes, { expected, sha256 } = {}) {
    const table = inspectZip(bytes);
    if (sha256 !== undefined) {
      require(typeof sha256 === "string" && /^[a-f0-9]{64}$/i.test(sha256), "PCB 工程缺少有效的文件指纹。");
      const actual = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), n => n.toString(16).padStart(2, "0")).join("");
      require(actual === sha256.toLowerCase(), "PCB 工程文件指纹不一致。");
    }
    const selected = new Set(["erc.json", "drc.json", "report.json"]);
    for (const name of selected) if (table.has(name)) require(table.get(name).unpacked <= 4 * 1024 * 1024, "检查报告文件超过 4 MB。");
    require(window.fflate?.unzipSync, "ZIP 读取工具未加载，请刷新页面。");
    const files = window.fflate.unzipSync(bytes, { filter: entry => {
      const descriptor = table.get(entry.name);
      require(descriptor && descriptor.packed === entry.size && descriptor.unpacked === entry.originalSize, "PCB ZIP 解压信息不一致。");
      return selected.has(entry.name);
    } });
    function read(name) {
      if (!table.has(name)) return null;
      const data = files[name], descriptor = table.get(name);
      require(data && data.length === descriptor.unpacked && crc32(data) === descriptor.crc, `${name} 文件校验失败。`);
      let raw;
      try { raw = JSON.parse(decoder.decode(data)); } catch { throw new Error(`${name} 不是有效的 JSON 报告。`); }
      require(object(raw), `${name} 报告格式无效。`);
      return raw;
    }
    const summary = read("report.json");
    require(summary?.schema === "schgen_pcb_report_v1", "PCB 工程缺少对应的检查汇总。");
    const erc = normalizeERC(read("erc.json")), drc = normalizeDRC(read("drc.json"));
    compareCounts(erc, summary.erc, "工程 ERC 汇总"); compareCounts(drc, summary.drc, "工程 DRC 汇总");
    if (object(expected)) {
      compareCounts(erc, expected.erc, "任务 ERC 汇总"); compareCounts(drc, expected.drc, "任务 DRC 汇总");
      for (const key of ["source_zip_sha256", "original_schematic_sha256", "final_schematic_sha256"]) {
        const hash = expected.provenance?.[key];
        if (typeof hash === "string") require(summary.provenance?.[key] === hash, "PCB 检查报告与当前任务来源不一致。");
      }
    }
    return { erc, drc, source: "PCB 工程检查" };
  }

  function node(tag, className, content) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content !== undefined) element.textContent = content;
    return element;
  }
  function render(container, reports = {}) {
    container.replaceChildren();
    if (reports.source) container.append(node("p", "check-report-source", text(reports.source, 250)));
    for (const kind of ["erc", "drc"]) {
      const report = reports[kind] || missing(kind), section = node("section", "check-report");
      section.dataset.kind = kind;
      section.append(node("h4", "check-report-title", kind === "erc" ? "ERC · 原理图电气检查" : "DRC · PCB 规则检查"));
      if (!report.available) {
        section.append(node("p", "check-report-empty", reports[kind + "Status"] || "尚未取得检查报告。"));
        container.append(section); continue;
      }
      const counts = report.counts;
      let summary = `${counts.errors} 个错误 · ${counts.warnings} 个警告`;
      if (counts.exclusions) summary += ` · ${counts.exclusions} 个已排除项`;
      if (counts.others) summary += ` · ${counts.others} 个其他项`;
      if (kind === "drc") summary += ` · ${counts.unconnected_items} 项漏连 · ${counts.schematic_parity} 项原理图不一致`;
      section.append(node("p", "check-report-counts", summary));
      let total = 0;
      for (const group of report.groups) {
        if (!group.issues.length) continue;
        total += group.issues.length;
        if (kind === "drc") section.append(node("h5", "check-report-group", `${group.label}（${group.issues.length}）`));
        const list = node("ol", "check-issues");
        for (const issue of group.issues) {
          const severity = ["error", "warning", "exclusion"].includes(issue.severity) ? issue.severity : "other";
          const row = node("li", `check-issue check-${severity}`);
          const heading = node("div", "check-issue-heading");
          heading.append(node("span", "check-severity", { error: "错误", warning: "警告", exclusion: "已排除", other: issue.severity || "其他" }[severity]),
            node("strong", "check-issue-name", titles[issue.type] || issue.type || group.label));
          row.append(heading);
          if (issue.description) row.append(node("p", "check-description", issue.description));
          if (issue.sheet) row.append(node("p", "check-location", `图纸：${issue.sheet}`));
          if (issue.items.length) {
            const items = node("ul", "check-items");
            for (const item of issue.items) {
              const position = item.pos ? `（x=${item.pos.x}, y=${item.pos.y}${report.units ? " " + report.units : ""}）` : "";
              items.append(node("li", "", item.description + position));
            }
            row.append(items);
          }
          list.append(row);
        }
        section.append(list);
      }
      if (!total) section.append(node("p", "check-report-empty", "本次检查未报告问题。"));
      if (report.ignored?.length) {
        const details = node("details", "check-ignored"), list = node("ul", "");
        details.append(node("summary", "", `未启用的规则（${report.ignored.length}）`));
        for (const item of report.ignored) list.append(node("li", "", item.description || item.key));
        details.append(list); section.append(details);
      }
      container.append(section);
    }
  }
  window.SchGenChecks = Object.freeze({ normalizeERC, normalizeDRC, readProject, render });
})();
