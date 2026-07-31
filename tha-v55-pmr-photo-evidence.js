(() => {
  const SCRIPT_ID = 'tha-v55-pmr-photo-evidence';
  const STYLE_ID = `${SCRIPT_ID}-styles`;
  if (window[SCRIPT_ID]) return;
  window[SCRIPT_ID] = true;

  function installStyles() {
    const existing = document.getElementById(STYLE_ID);
    if (existing) existing.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* V3.55: Finding photos belong inside the expanded PMR line item, not only in the appendix/index. */
      main.pmr:not(.passWorkspace) .tha-v55-photo-evidence{
        margin-top:12px!important;
        border:1px solid #d8e4ea!important;
        border-radius:16px!important;
        background:#fff!important;
        padding:12px!important;
      }
      main.pmr:not(.passWorkspace) .tha-v55-photo-evidence h4{
        margin:0 0 4px!important;
        color:#0b3658!important;
        font-size:15px!important;
        display:flex!important;
        align-items:center!important;
        gap:7px!important;
      }
      main.pmr:not(.passWorkspace) .tha-v55-photo-evidence p{
        margin:0 0 10px!important;
        color:#60717c!important;
        font-size:12px!important;
        font-weight:800!important;
        line-height:1.35!important;
      }
      .tha-v55-photo-grid{
        display:grid!important;
        grid-template-columns:repeat(auto-fit,minmax(132px,1fr))!important;
        gap:10px!important;
      }
      .tha-v55-photo-card{
        border:1px solid #e2e8ed!important;
        border-radius:14px!important;
        background:#fbfdfe!important;
        padding:8px!important;
        min-width:0!important;
      }
      .tha-v55-photo-card.has-preview{
        background:#fff!important;
      }
      .tha-v55-photo-frame{
        width:100%!important;
        aspect-ratio:4/3!important;
        border-radius:11px!important;
        background:#eef4f7!important;
        border:1px solid #d8e4ea!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        overflow:hidden!important;
        color:#60717c!important;
        font-size:12px!important;
        font-weight:900!important;
        text-align:center!important;
      }
      .tha-v55-photo-frame img{
        width:100%!important;
        height:100%!important;
        object-fit:cover!important;
        display:block!important;
      }
      .tha-v55-photo-meta{
        margin-top:7px!important;
        display:grid!important;
        gap:3px!important;
      }
      .tha-v55-photo-meta strong{
        color:#203040!important;
        font-size:12px!important;
        line-height:1.25!important;
        font-weight:950!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
      }
      .tha-v55-photo-meta span{
        color:#60717c!important;
        font-size:11px!important;
        line-height:1.25!important;
        font-weight:800!important;
      }
      .tha-v55-drive-link{
        margin-top:7px!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        border:1px solid #cbdde7!important;
        border-radius:999px!important;
        background:#fff!important;
        color:#0b3658!important;
        padding:5px 8px!important;
        font-size:11px!important;
        font-weight:950!important;
        text-decoration:none!important;
      }
      .tha-v55-photo-empty{
        border:1px dashed #d8e4ea!important;
        border-radius:14px!important;
        background:#fbfdfe!important;
        padding:10px 12px!important;
        color:#60717c!important;
        font-size:12px!important;
        font-weight:850!important;
      }
      @media(max-width:760px){.tha-v55-photo-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
      @media print{.tha-v55-photo-evidence{break-inside:avoid!important}.tha-v55-photo-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
    `;
    document.head.append(style);
  }

  function textOf(element) {
    return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function escapeHtml(value = '') {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function reactFiberFor(element) {
    if (!element) return null;
    const key = Object.keys(element).find(candidate => candidate.startsWith('__reactFiber$') || candidate.startsWith('__reactInternalInstance$'));
    return key ? element[key] : null;
  }

  function rowFromReactFiber(element) {
    let fiber = reactFiberFor(element);
    let depth = 0;
    while (fiber && depth < 18) {
      const row = fiber.memoizedProps?.row || fiber.pendingProps?.row;
      if (row?.answer?.photos || row?.answer?.photoRef) return row;
      fiber = fiber.return;
      depth += 1;
    }
    return null;
  }

  function normalizePhoto(photo = {}) {
    const hasDriveReference = Boolean(photo.driveFileId || photo.driveViewLink || photo.webViewLink);
    return {
      ...photo,
      label: photo.label || 'Photo',
      name: photo.name || photo.driveFileName || photo.photoRef || 'Photo',
      uploadStatus: photo.uploadStatus || (hasDriveReference ? 'uploaded' : 'local'),
      driveViewLink: photo.driveViewLink || photo.webViewLink || '',
      webViewLink: photo.webViewLink || photo.driveViewLink || '',
      thumbnailDataUrl: photo.thumbnailDataUrl || '',
      dataUrl: photo.dataUrl || ''
    };
  }

  function photoList(answer = {}) {
    if (Array.isArray(answer.photos)) return answer.photos.map(normalizePhoto);
    if (answer.photos && typeof answer.photos === 'object') {
      return Object.entries(answer.photos)
        .filter(([, value]) => value)
        .map(([key]) => normalizePhoto({ id: key, label: key === 'close' ? 'Close-up' : key === 'detail' ? 'Detail' : 'Context', name: answer.photoRef || key }));
    }
    return [];
  }

  function photoSrc(photo = {}) {
    return photo.thumbnailDataUrl || photo.dataUrl || '';
  }

  function photoStatusLabel(photo = {}) {
    const status = String(photo.uploadStatus || '').toLowerCase();
    if (status === 'uploaded') return 'Uploaded to Drive';
    if (status === 'pending') return 'Pending Drive upload';
    if (status === 'failed') return 'Drive upload failed';
    return 'Local photo';
  }

  function photoHash(photos = []) {
    return photos.map(photo => [photo.id, photo.name, photo.label, photo.uploadStatus, Boolean(photoSrc(photo)), photo.driveViewLink || photo.webViewLink].join('|')).join('||');
  }

  function photoCardHtml(photo, index) {
    const src = photoSrc(photo);
    const driveLink = photo.driveViewLink || photo.webViewLink || '';
    const label = photo.label || `Photo ${index + 1}`;
    const name = photo.name || `Photo ${index + 1}`;
    return `<article class="tha-v55-photo-card ${src ? 'has-preview' : ''}">
      <div class="tha-v55-photo-frame">${src ? `<img src="${src}" alt="${escapeHtml(label)} evidence photo" loading="lazy"/>` : '<span>No local preview<br/>available</span>'}</div>
      <div class="tha-v55-photo-meta"><strong title="${escapeHtml(name)}">${escapeHtml(label)}</strong><span title="${escapeHtml(name)}">${escapeHtml(name)}</span><span>${escapeHtml(photoStatusLabel(photo))}</span></div>
      ${driveLink ? `<a class="tha-v55-drive-link" href="${escapeHtml(driveLink)}" target="_blank" rel="noreferrer">Open Drive photo</a>` : ''}
    </article>`;
  }

  function evidenceHtml(row) {
    const photos = photoList(row?.answer || {});
    if (!photos.length) {
      return `<section class="tha-v55-photo-evidence" data-tha-v55-photo-hash="empty"><h4>📷 Photos / evidence</h4><div class="tha-v55-photo-empty">No finding photos are attached to this PMR line item yet.</div></section>`;
    }
    const visibleCount = photos.filter(photo => photoSrc(photo)).length;
    const driveOnlyCount = photos.length - visibleCount;
    return `<section class="tha-v55-photo-evidence" data-tha-v55-photo-hash="${escapeHtml(photoHash(photos))}">
      <h4>📷 Photos / evidence</h4>
      <p>${photos.length} finding photo${photos.length === 1 ? '' : 's'} attached to this HTC line item.${driveOnlyCount ? ` ${driveOnlyCount} photo${driveOnlyCount === 1 ? '' : 's'} ${driveOnlyCount === 1 ? 'has' : 'have'} Drive/reference info but no local thumbnail preview.` : ''}</p>
      <div class="tha-v55-photo-grid">${photos.map(photoCardHtml).join('')}</div>
    </section>`;
  }

  function ensureEvidenceForWrapper(wrapper) {
    const rowElement = wrapper.querySelector('.packetActionRow');
    const body = wrapper.querySelector('.tha-v53-action-body') || wrapper.querySelector('.tha-v55-action-body');
    if (!rowElement || !body) return;
    const row = rowFromReactFiber(rowElement);
    if (!row) return;
    const photos = photoList(row.answer || {});
    const nextHash = photos.length ? photoHash(photos) : 'empty';
    const existing = body.querySelector(':scope > .tha-v55-photo-evidence');
    if (existing?.dataset?.thaV55PhotoHash === nextHash) return;
    if (existing) existing.remove();
    body.insertAdjacentHTML('beforeend', evidenceHtml(row));
  }

  function enhancePmrLineItems() {
    const pmr = document.querySelector('main.pmr:not(.passWorkspace)');
    if (!pmr) return;
    pmr.querySelectorAll('.tha-v53-action-expandable').forEach(ensureEvidenceForWrapper);
  }

  function sync() {
    installStyles();
    enhancePmrLineItems();
  }

  let scheduled = false;
  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      sync();
      window.setTimeout(sync, 120);
    });
  }

  window.addEventListener('load', sync);
  document.addEventListener('DOMContentLoaded', sync);
  document.addEventListener('click', () => window.setTimeout(sync, 80), true);
  document.addEventListener('change', scheduleSync, true);
  new MutationObserver(scheduleSync).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'open', 'hidden', 'aria-expanded'] });
  sync();
})();
