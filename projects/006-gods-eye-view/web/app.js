const cards = [...document.querySelectorAll('.source-card')];
const search = document.querySelector('#source-search');
const filters = [...document.querySelectorAll('[data-filter]')];
const count = document.querySelector('#result-count');
let selected = 'all';
function update() {
  const query = search.value.trim().toLocaleLowerCase();
  let visible = 0;
  for (const card of cards) {
    const matches = (selected === 'all' || card.dataset.group === selected)
      && (!query || card.textContent.toLocaleLowerCase().includes(query));
    card.hidden = !matches;
    if (matches) visible += 1;
  }
  for (const filter of filters) filter.setAttribute('aria-pressed', String(filter.dataset.filter === selected));
  count.textContent = `显示 ${visible} / ${cards.length} 类来源`;
  document.querySelector('#no-results').hidden = visible > 0;
}
for (const filter of filters) filter.addEventListener('click', () => { selected = filter.dataset.filter; update(); });
search.addEventListener('input', update);
for (const link of document.querySelectorAll('[data-select]')) link.addEventListener('click', () => {
  selected = link.dataset.select;
  search.value = '';
  update();
});
document.querySelector('#expand-visible').addEventListener('click', () => {
  for (const card of cards) if (!card.hidden) card.open = true;
});
document.querySelector('#collapse-all').addEventListener('click', () => {
  for (const card of cards) card.open = false;
});
update();

const effectButtons = [...document.querySelectorAll('[data-effect]')];
const effectPanels = [...document.querySelectorAll('.effect-panel')];
for (const button of effectButtons) button.addEventListener('click', () => {
  for (const panel of effectPanels) panel.hidden = panel.id !== button.dataset.effect;
  for (const option of effectButtons) option.setAttribute('aria-pressed', String(option === button));
});

const readingTools = document.querySelector('#reading-tools');
const chapterSelect = document.querySelector('#chapter-select');
const studySearch = document.querySelector('#study-search');
const studyResults = document.querySelector('#study-results');
const studyResultList = document.querySelector('#study-result-list');
const studySearchStatus = document.querySelector('#study-search-status');
const clearStudySearch = document.querySelector('#study-search-clear');
const chapters = [...document.querySelectorAll('main > section[id]')];
const chapterEntries = chapters.map(section => ({
  id: section.id,
  title: section.querySelector('h2').textContent.trim(),
  text: section.textContent.replace(/\s+/g, ' ').trim(),
  source: false,
}));
for (const entry of chapterEntries) {
  const option = document.createElement('option');
  option.value = entry.id;
  option.textContent = entry.title;
  chapterSelect.append(option);
}
const searchEntries = [
  ...cards.map(card => ({id:card.id, title:card.querySelector('.source-title').textContent,
    text:card.textContent.replace(/\s+/g, ' ').trim(), source:true})),
  ...chapterEntries.filter(entry => entry.id !== 'sources'),
];
function searchStudy() {
  const query = studySearch.value.trim().toLocaleLowerCase();
  clearStudySearch.hidden = !query;
  studyResultList.replaceChildren();
  studyResults.hidden = !query;
  if (!query) { studySearchStatus.textContent = ''; return; }
  const terms = query.split(/\s+/);
  const matches = searchEntries.filter(entry => terms.every(term => entry.text.toLocaleLowerCase().includes(term)));
  studySearchStatus.textContent = matches.length
    ? `找到 ${matches.length} 处，显示前 ${Math.min(12, matches.length)} 处；点击跳到原文。`
    : '没有匹配内容。试试更短的关键词，或用空格组合多个词。';
  for (const entry of matches.slice(0, 12)) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    const title = document.createElement('strong');
    const excerpt = document.createElement('span');
    link.href = `#${entry.id}`;
    title.textContent = `${entry.source ? '来源 · ' : '研究 · '}${entry.title}`;
    const position = entry.text.toLocaleLowerCase().indexOf(terms[0]);
    const start = Math.max(0, position - 25);
    excerpt.textContent = `${start ? '…' : ''}${entry.text.slice(start, start + 125)}…`;
    link.append(title, excerpt);
    link.addEventListener('click', () => {
      if (entry.source) {
        selected = 'all'; search.value = ''; update();
        document.getElementById(entry.id).open = true;
        document.getElementById(entry.id).querySelector('summary').focus({preventScroll:true});
      }
      studyResults.hidden = true;
    });
    item.append(link); studyResultList.append(item);
  }
}
chapterSelect.addEventListener('change', () => {
  if (chapterSelect.value) window.location.hash = chapterSelect.value;
});
studySearch.addEventListener('input', searchStudy);
studySearch.addEventListener('focus', searchStudy);
studySearch.addEventListener('keydown', event => {
  if (event.key === 'Escape') studyResults.hidden = true;
  if (event.key === 'Enter') {
    const first = studyResultList.querySelector('a');
    if (first && !studyResults.hidden) { event.preventDefault(); first.click(); }
  }
});
clearStudySearch.addEventListener('click', () => {
  studySearch.value = ''; searchStudy(); studySearch.focus();
});
document.addEventListener('click', event => {
  if (!readingTools.contains(event.target)) studyResults.hidden = true;
});
readingTools.hidden = false;

for (const link of document.querySelectorAll('a[href="#overview-image"]')) {
  link.addEventListener('click', () => { document.querySelector('#overview-image').open = true; });
}
