function pdfEscape(value) {
  return String(value ?? '').replace(/[\\()]/g, '\\$&').replace(/\r/g, '').replace(/\n/g, ' ');
}
function dataUriToBinaryString(dataUri) { return atob(String(dataUri).split(',')[1] || ''); }
function buildImagePdf(pages, { title = 'Client PMR Report', pageWidth = 612, pageHeight = 792 } = {}) {
  const enc = new TextEncoder();
  const chunks = [];
  const offsets = [0];
  let byteLength = 0;
  const addText = value => { const bytes = enc.encode(value); chunks.push(bytes); byteLength += bytes.length; };
  const addBinary = binary => { const bytes = Uint8Array.from(binary, char => char.charCodeAt(0)); chunks.push(bytes); byteLength += bytes.length; };
  const pageCount = pages.length;
  const catalogId = 1;
  const pagesId = 2;
  const firstPageId = 3;
  const imageObjectId = index => firstPageId + pageCount + (index * 2);
  const contentObjectId = index => imageObjectId(index) + 1;
  const writeObjectStart = id => { offsets[id] = byteLength; addText(`${id} 0 obj\n`); };
  addText('%PDF-1.4\n%THA\n');
  writeObjectStart(catalogId); addText(`<< /Type /Catalog /Pages ${pagesId} 0 R >>\nendobj\n`);
  writeObjectStart(pagesId); addText(`<< /Type /Pages /Kids [${pages.map((_, index) => `${firstPageId + index} 0 R`).join(' ')}] /Count ${pageCount} >>\nendobj\n`);
  pages.forEach((_, index) => {
    writeObjectStart(firstPageId + index);
    addText(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im${index + 1} ${imageObjectId(index)} 0 R >> >> /Contents ${contentObjectId(index)} 0 R >>\nendobj\n`);
  });
  pages.forEach((page, index) => {
    const binary = dataUriToBinaryString(page.dataUrl);
    writeObjectStart(imageObjectId(index));
    addText(`<< /Type /XObject /Subtype /Image /Width ${page.pixelWidth} /Height ${page.pixelHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${binary.length} >>\nstream\n`);
    addBinary(binary); addText('\nendstream\nendobj\n');
    const content = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im${index + 1} Do\nQ\n`;
    writeObjectStart(contentObjectId(index)); addText(`<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`);
  });
  const infoId = firstPageId + pageCount + (pageCount * 2);
  writeObjectStart(infoId); addText(`<< /Title (${pdfEscape(title)}) /Creator (THA Snapshot) /Producer (THA Snapshot) >>\nendobj\n`);
  const xrefStart = byteLength;
  addText(`xref\n0 ${infoId + 1}\n0000000000 65535 f \n`);
  for (let id = 1; id <= infoId; id += 1) addText(`${String(offsets[id] || 0).padStart(10, '0')} 00000 n \n`);
  addText(`trailer\n<< /Size ${infoId + 1} /Root ${catalogId} 0 R /Info ${infoId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`);
  const bytes = new Uint8Array(byteLength);
  let cursor = 0;
  chunks.forEach(chunk => { bytes.set(chunk, cursor); cursor += chunk.length; });
  return new Blob([bytes], { type: 'application/pdf' });
}
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new window.Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = src;
  });
}
export async function htmlToPdfBlob(html) {
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:960px;height:1242px;border:0;visibility:hidden;';
  document.body.appendChild(frame);
  try {
    frame.srcdoc = html;
    await new Promise(resolve => { frame.onload = () => requestAnimationFrame(() => requestAnimationFrame(resolve)); setTimeout(resolve, 700); });
    const doc = frame.contentDocument;
    if (!doc?.body) throw new Error('Unable to render client PMR PDF.');
    const serializer = new XMLSerializer();
    const styleText = Array.from(doc.querySelectorAll('style')).map(style => style.textContent || '').join('\n').replace(/]]>/g, ']]]]><![CDATA[>');
    const bodyMarkup = Array.from(doc.body.childNodes).map(node => serializer.serializeToString(node)).join('');
    const htmlWidth = 960;
    const pageHeightPx = Math.round(htmlWidth * (792 / 612));
    const measuredHeight = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
    const totalHeight = Math.max(pageHeightPx, measuredHeight);
    const pageCount = Math.max(1, Math.ceil(Math.max(1, totalHeight - 24) / pageHeightPx));
    const scale = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const pages = [];
    for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
      const y = pageIndex * pageHeightPx;
      const xhtml = `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${htmlWidth}px;min-height:${totalHeight}px;background:#fff;"><style><![CDATA[${styleText}]]></style><div style="transform:translateY(-${y}px);transform-origin:top left;width:${htmlWidth}px;">${bodyMarkup}</div></div>`;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${htmlWidth}" height="${pageHeightPx}" viewBox="0 0 ${htmlWidth} ${pageHeightPx}"><rect width="100%" height="100%" fill="#ffffff"/><foreignObject x="0" y="0" width="${htmlWidth}" height="${totalHeight}">${xhtml}</foreignObject></svg>`;
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
      const image = await loadImage(url); URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(htmlWidth * scale); canvas.height = Math.round(pageHeightPx * scale);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas PDF rendering is unavailable.');
      context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height);
      pages.push({ dataUrl: canvas.toDataURL('image/jpeg', 0.9), pixelWidth: canvas.width, pixelHeight: canvas.height });
    }
    return buildImagePdf(pages);
  } finally { frame.remove(); }
}
