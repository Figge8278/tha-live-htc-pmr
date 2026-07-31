(() => {
  const ID = 'tha-v3586-form-control-stability';
  if (window[ID]) return;
  window[ID] = true;

  const GROUP_HOST = 'thaV3584TradeGroups';
  const GROUP = 'thaV3584TradeGroup';
  const GROUP_BODY = 'thaV3584TradeGroupBody';
  const CARD = 'checklistItemCard';
  const RESOURCE_MEMORY_KEY = 'tha-v3586-resource-overrides';

  const nativeReplaceChildren = Element.prototype.replaceChildren;
  const nativeAppend = Element.prototype.append;

  const text = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const readResourceMemory = () => {
    try { return JSON.parse(sessionStorage.getItem(RESOURCE_MEMORY_KEY) || '{}') || {}; }
    catch { return {}; }
  };
  const writeResourceMemory = value => {
    try { sessionStorage.setItem(RESOURCE_MEMORY_KEY, JSON.stringify(value)); }
    catch {}
  };

  function cardTitle(card) {
    return text(card?.querySelector('.checklistSummaryRow .itemTitleLine strong')?.textContent || card?.querySelector('.expandedItemHead h2')?.textContent);
  }

  function isResourceSelect(select) {
    if (!(select instanceof HTMLSelectElement)) return false;
    const label = select.closest('.checklistDetailPanel .inputs > label');
    return Boolean(label && /Suggested Trade \/ Resource|Likely Resource/i.test(text(label.textContent)));
  }

  function groupKey(group) {
    return group?.dataset?.v3585Category || group?.dataset?.v3584Category || '';
  }

  function existingGroup(host, key, except = null) {
    return Array.from(host.children).find(node => node !== except && node.classList?.contains(GROUP) && groupKey(node) === key) || null;
  }

  Element.prototype.replaceChildren = function (...nodes) {
    if (this.classList?.contains(GROUP_HOST) && nodes.length === 0) {
      return;
    }
    return nativeReplaceChildren.apply(this, nodes);
  };

  Element.prototype.append = function (...nodes) {
    if (this.classList?.contains(GROUP_BODY)) {
      nodes.forEach(node => {
        if (node instanceof Element && node.classList.contains(CARD) && node.parentElement === this) return;
        nativeAppend.call(this, node);
      });
      return;
    }

    if (this.classList?.contains(GROUP_HOST) && nodes.length === 1) {
      const group = nodes[0];
      if (group instanceof Element && group.classList.contains(GROUP)) {
        const key = groupKey(group);
        const current = key ? existingGroup(this, key, group) : null;
        if (current) {
          const currentBody = current.querySelector(`.${GROUP_BODY}`);
          const incomingBody = group.querySelector(`.${GROUP_BODY}`);
          if (currentBody && incomingBody) {
            Array.from(incomingBody.children).forEach(card => {
              if (card.parentElement !== currentBody) nativeAppend.call(currentBody, card);
            });
          }
          current.hidden = group.hidden;
          return;
        }
      }
    }

    return nativeAppend.apply(this, nodes);
  };

  function dedupeGroups() {
    document.querySelectorAll(`.${GROUP_HOST}`).forEach(host => {
      const seen = new Map();
      Array.from(host.children).filter(node => node.classList?.contains(GROUP)).forEach(group => {
        const key = groupKey(group);
        if (!key || !seen.has(key)) {
          if (key) seen.set(key, group);
          return;
        }
        const keeper = seen.get(key);
        const keeperBody = keeper.querySelector(`.${GROUP_BODY}`);
        const duplicateBody = group.querySelector(`.${GROUP_BODY}`);
        if (keeperBody && duplicateBody) {
          Array.from(duplicateBody.children).forEach(card => {
            if (card.parentElement !== keeperBody) nativeAppend.call(keeperBody, card);
          });
        }
        group.remove();
      });

      Array.from(host.children).filter(node => node.classList?.contains(GROUP)).forEach(group => {
        const body = group.querySelector(`.${GROUP_BODY}`);
        if (body && !body.querySelector(`.${CARD}`)) group.remove();
      });
    });
  }

  document.addEventListener('change', event => {
    const select = event.target;
    if (!isResourceSelect(select)) return;
    const key = cardTitle(select.closest(`.${CARD}`));
    if (!key) return;

    const memory = readResourceMemory();
    if (event.isTrusted) {
      memory[key] = select.value;
      writeResourceMemory(memory);
      return;
    }

    const savedValue = memory[key];
    if (savedValue && select.value !== savedValue) {
      select.value = savedValue;
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }, true);

  document.addEventListener('focusout', () => setTimeout(dedupeGroups, 0), true);
  dedupeGroups();
  setTimeout(dedupeGroups, 600);
  setTimeout(dedupeGroups, 1500);
  setInterval(dedupeGroups, 3000);
})();
