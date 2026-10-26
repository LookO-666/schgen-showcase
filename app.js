(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const catalog = window.SCHGEN_SHOWCASE || {};
  const examples = Array.isArray(catalog.examples) ? catalog.examples : [];
  let selected = 0;
  let view = 'pcb';
  let zoom = 1;
  let previewReady = false;
  let renderSequence = 0;

  function textNode(tag, value, className) {
    const node = document.createElement(tag);
    node.textContent = value;
    if (className) node.className = className;
    return node;
  }
  function icon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#' + name);
    svg.append(use);
    svg.setAttribute('aria-hidden', 'true');
    return svg;
  }
  function inlineMarkdown(node, value) {
    // Original text is rendered as text nodes; it cannot insert markup or links.
    const parts = String(value).split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    for (const part of parts) {
      if (part.startsWith('**') && part.endsWith('**')) node.append(textNode('strong', part.slice(2, -2)));
      else if (part.startsWith('`') && part.endsWith('`')) node.append(textNode('code', part.slice(1, -1)));
      else node.append(document.createTextNode(part));
    }
  }
  function renderPrompt(value) {
    const container = $('prompt-body');
    container.replaceChildren();
    let list = null;
    for (const line of String(value || '').split('\n')) {
      if (!line.trim()) { list = null; continue; }
      const heading = line.match(/^#{1,6}\s+(.+)$/);
      const bullet = line.match(/^\s*(?:[-*]|\d+\.)\s+(.+)$/);
      if (heading) {
        const node = document.createElement('h4'); inlineMarkdown(node, heading[1]); container.append(node); list = null;
      } else if (bullet) {
        if (!list) { list = document.createElement('ul'); container.append(list); }
        const node = document.createElement('li'); inlineMarkdown(node, bullet[1]); list.append(node);
      } else {
        const node = document.createElement('p'); inlineMarkdown(node, line); container.append(node); list = null;
      }
    }
    container.classList.remove('expanded');
    container.scrollTop = 0;
    $('toggle-prompt').setAttribute('aria-expanded', 'false');
    $('toggle-prompt').querySelector('span').textContent = '展开完整原题';
  }
  function count(value) { return Number.isFinite(value) && value >= 0 ? String(value) : '—'; }
  function renderMetrics(item) {
    const data = item.metrics || {};
    const holder = $('metrics');
    holder.replaceChildren();
    for (const [key, label, unit] of [['components', '元件', '个'], ['nets', '网络', '个'], ['tracks', '铜线', '段'], ['vias', '过孔', '个']]) {
      const entry = textNode('dl', '', 'metric');
      const value = textNode('dd', count(data[key]));
      value.append(textNode('span', unit));
      entry.append(textNode('dt', label), value); holder.append(entry);
    }
    const checks = $('check-summary'); checks.replaceChildren();
    for (const [label, values, keys] of [
      ['PCB 设计规则 · DRC', [['drcErrors', '错误'], ['drcWarnings', '警告'], ['unconnected', '未连接']], ['drcErrors', 'drcWarnings', 'unconnected']],
      ['原理图电气规则 · ERC', [['ercErrors', '错误'], ['ercWarnings', '警告']], ['ercErrors', 'ercWarnings']],
    ]) {
      const block = textNode('div', '', 'check-block');
      const available = keys.every((key) => Number.isFinite(data[key]) && data[key] >= 0);
      const description = available ? values.map(([key, suffix]) => count(data[key]) + ' ' + suffix).join(' / ') : '暂无对应检查记录';
      const className = !available ? 'check-unknown' : keys.some((key) => data[key] > 0) ? 'has-issues' : '';
      block.append(textNode('h4', label), textNode('p', description, className)); checks.append(block);
    }
    const rules = Array.isArray(data.ignoredRules) ? data.ignoredRules : [];
    $('ignored-checks').hidden = !rules.length;
    $('ignored-checks').open = false;
    $('ignored-title').textContent = `记录中未启用的规则（${rules.length}）`;
    $('ignored-list').replaceChildren(...rules.map((rule) => textNode('li', typeof rule === 'string' ? rule : rule.description || rule.key || '未命名规则')));
    $('case-note').textContent = item.note || '以上为已有结果的检查记录；未启用的规则不计入错误或警告数量。';
  }
  function safeAsset(value) {
    // A public showcase only accepts bundled, relative image paths.
    if (typeof value !== 'string' || !/^(?:\.\/)?assets\/[a-zA-Z0-9_./-]+\.(?:svg|png|webp)$/i.test(value)) return null;
    if (value.split('/').includes('..')) return null;
    return value;
  }
  function updateZoom() {
    $('image-inner').style.setProperty('--zoom', String(zoom));
    $('zoom-value').textContent = Math.round(zoom * 100) + '%';
    $('zoom-out').disabled = !previewReady || zoom <= 1;
    $('zoom-in').disabled = !previewReady || zoom >= 3;
    $('zoom-fit').disabled = !previewReady;
  }
  function resetZoom() {
    zoom = 1; updateZoom();
    $('result-view').scrollTop = 0; $('result-view').scrollLeft = 0;
  }
  function renderView() {
    const item = examples[selected];
    if (!item) return;
    const sequence = ++renderSequence;
    for (const type of ['pcb', 'schematic']) {
      $('tab-' + type).setAttribute('aria-selected', String(view === type));
      $('tab-' + type).tabIndex = view === type ? 0 : -1;
    }
    $('result-view').dataset.view = view;
    $('result-view').setAttribute('aria-labelledby', 'tab-' + view);
    $('view-description').textContent = view === 'pcb' ? '顶视图 · 铜线与焊盘' : 'KiCad 电路原理图';
    $('image-caption').textContent = '已保存的' + (view === 'pcb' ? ' PCB 布局布线成果' : '原理图成果');
    const image = $('result-image');
    image.hidden = true;
    image.onload = null; image.onerror = null;
    image.removeAttribute('src');
    image.alt = item.title + ' · ' + (view === 'pcb' ? 'PCB 版图' : '电路原理图');
    previewReady = false; resetZoom();
    $('preview-empty').hidden = false;
    const asset = safeAsset(item[view]);
    if (!asset) {
      $('result-view').setAttribute('aria-busy', 'false');
      $('preview-message').textContent = '此原题暂未收录对应的' + (view === 'pcb' ? ' PCB 版图' : '原理图') + '。';
      return;
    }
    $('result-view').setAttribute('aria-busy', 'true');
    $('preview-message').textContent = '正在读取已有成果…';
    image.onload = () => {
      if (sequence !== renderSequence) return;
      image.hidden = false; $('preview-empty').hidden = true; previewReady = true;
      $('result-view').setAttribute('aria-busy', 'false'); updateZoom();
    };
    image.onerror = () => {
      if (sequence !== renderSequence) return;
      $('result-view').setAttribute('aria-busy', 'false');
      $('preview-message').textContent = '预览图片暂时无法读取，请刷新页面重试。';
    };
    image.src = asset;
  }
  function selectExample(index) {
    selected = index;
    const item = examples[index];
    for (const button of $('example-buttons').querySelectorAll('button')) button.setAttribute('aria-pressed', String(Number(button.dataset.index) === index));
    $('result-title').textContent = item.title;
    $('source-label').textContent = '官方数据集原题';
    $('source-label').title = item.source?.line ? 'SchGen 数据集，第 ' + item.source.line + ' 行' : 'SchGen 官方数据集';
    renderPrompt(item.prompt); renderMetrics(item); renderView();
    $('selection-status').textContent = '已切换至' + item.title + '，展示已保存成果。';
  }
  const model = typeof catalog.model === 'string' ? catalog.model : catalog.model?.label;
  if (model) $('model-label').textContent = model;
  $('example-count').textContent = examples.length ? examples.length + ' 个案例' : '';
  examples.forEach((item, index) => {
    const button = textNode('button', '', 'example-button');
    button.type = 'button'; button.dataset.index = String(index); button.setAttribute('aria-pressed', 'false');
    const copy = textNode('span', '', 'case-button-text');
    const number = item.metrics?.components;
    copy.append(textNode('span', item.title, 'case-button-title'), textNode('span', Number.isFinite(number) ? number + ' 个元件 · 官方原题' : '官方原题', 'case-button-caption'));
    const arrow = icon('icon-arrow'); arrow.classList.add('case-arrow');
    button.append(textNode('span', String(index + 1).padStart(2, '0'), 'case-number'), copy, arrow);
    button.addEventListener('click', () => selectExample(index));
    $('example-buttons').append(button);
  });
  $('toggle-prompt').addEventListener('click', () => {
    const expanded = $('prompt-body').classList.toggle('expanded');
    $('toggle-prompt').setAttribute('aria-expanded', String(expanded));
    $('toggle-prompt').querySelector('span').textContent = expanded ? '收起原题' : '展开完整原题';
  });
  for (const type of ['pcb', 'schematic']) {
    const button = $('tab-' + type);
    button.addEventListener('click', () => { view = type; renderView(); });
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      view = event.key === 'Home' ? 'pcb' : event.key === 'End' ? 'schematic' : view === 'pcb' ? 'schematic' : 'pcb';
      renderView(); $('tab-' + view).focus();
    });
  }
  $('zoom-out').addEventListener('click', () => { zoom = Math.max(1, zoom - .25); updateZoom(); });
  $('zoom-in').addEventListener('click', () => { zoom = Math.min(3, zoom + .25); updateZoom(); });
  $('zoom-fit').addEventListener('click', resetZoom);
  if (examples.length) selectExample(0);
  else {
    $('result-title').textContent = '电路案例';
    $('preview-message').textContent = '案例资料暂时无法读取，请刷新页面重试。';
    $('toggle-prompt').hidden = true;
  }
})();
