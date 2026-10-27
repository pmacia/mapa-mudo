import { availableRiverParents } from './riverRelations';
import type { GeoElement } from '../types/geography';
import { BADGES, CATEGORY_INFO } from '../data/geographyData';

/** Exporta valores finales: no vuelve a aplicar los ajustes del dataset original. */
export function buildGeographyFiles(elements: readonly GeoElement[]) {
  const ids = new Set<string>();
  const vectors = { viewBox: '0 0 1200 675', rivers: {} as Record<string, string>, mountainRanges: {} as Record<string, string>, rangeCenters: {} as Record<string, { x: number; y: number }>, landmarks: {} as Record<string, { x: number; y: number }> };
  const entries = elements.map(element => {
    if (!element.id || ids.has(element.id)) throw new Error('Hay identificadores vacíos o duplicados.');
    ids.add(element.id);
    if (!Number.isFinite(element.mapX) || !Number.isFinite(element.mapY)) throw new Error(`Coordenadas inválidas: ${element.name}`);
    if (element.parentRiverId && (element.category !== 'afluentes' ||
        !availableRiverParents(elements, element.id).some(e => e.id === element.parentRiverId))) {
      throw new Error(`Río receptor inválido o relación circular: ${element.name}`);
    }
    const { mapX, mapY, svgPath, ...metadata } = element;
    const key = JSON.stringify(element.id);
    const centerGroup = element.svgType === 'polygon' ? 'rangeCenters' : 'landmarks';
    // defineProperty también admite identificadores como __proto__ sin alterar el objeto.
    Object.defineProperty(vectors[centerGroup], element.id, { value: { x: mapX, y: mapY }, enumerable: true });
    let path = '';
    if (svgPath !== undefined) {
      const group = element.svgType === 'polyline' ? 'rivers' : 'mountainRanges';
      Object.defineProperty(vectors[group], element.id, { value: svgPath, enumerable: true });
      path = `,\n  svgPath: ACCIDENTS_VECTOR_DATA.${group}[${key}]`;
    }
    return `${JSON.stringify(metadata, null, 2).slice(0, -1)},\n  mapX: ACCIDENTS_VECTOR_DATA.${centerGroup}[${key}].x,\n  mapY: ACCIDENTS_VECTOR_DATA.${centerGroup}[${key}].y${path}\n}`;
  });
  return [
    { name: 'geographyData.ts', content: `// Generado desde el editor. Coordenadas y geometrías finales.\nimport type { GeoElement, Badge } from '../types/geography';\nimport { ACCIDENTS_VECTOR_DATA } from './geographyAccidentsData';\n\nexport const GEO_ELEMENTS: GeoElement[] = [\n${entries.join(',\n')}\n];\n\nexport const BADGES: Badge[] = ${JSON.stringify(BADGES, null, 2)};\n\nexport const CATEGORY_INFO: Record<string, { label: string; icon: string; color: string; badgeColor: string }> = ${JSON.stringify(CATEGORY_INFO, null, 2)};\n` },
    { name: 'geographyAccidentsData.ts', content: `// Generado desde el editor. Claves basadas en el id de cada accidente.\nexport const ACCIDENTS_VECTOR_DATA = ${JSON.stringify(vectors, null, 2).replace(/^(\s*)"__proto__":/gm, '$1["__proto__"]:')};\n\nexport const REAL_SPAIN_MAP = ACCIDENTS_VECTOR_DATA;\n` },
  ];
}

// ZIP sin compresión: evita dependencias y descargas múltiples.
export function buildConfigurationZip(files: { name: string; content: string }[]): Uint8Array {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [], central: Uint8Array[] = [];
  let offset = 0, centralSize = 0;
  const crc32 = (bytes: Uint8Array) => {
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    return (crc ^ 0xffffffff) >>> 0;
  };
  for (const file of files) {
    const name = encoder.encode(file.name), data = encoder.encode(file.content), crc = crc32(data);
    const local = new Uint8Array(30 + name.length), l = new DataView(local.buffer);
    l.setUint32(0, 0x04034b50, true); l.setUint16(4, 20, true); l.setUint16(6, 0x800, true);
    l.setUint16(12, 33, true); l.setUint32(14, crc, true); l.setUint32(18, data.length, true); l.setUint32(22, data.length, true); l.setUint16(26, name.length, true); local.set(name, 30);
    const directory = new Uint8Array(46 + name.length), d = new DataView(directory.buffer);
    d.setUint32(0, 0x02014b50, true); d.setUint16(4, 20, true); d.setUint16(6, 20, true); d.setUint16(8, 0x800, true);
    d.setUint16(14, 33, true); d.setUint32(16, crc, true); d.setUint32(20, data.length, true); d.setUint32(24, data.length, true); d.setUint16(28, name.length, true); d.setUint32(42, offset, true); directory.set(name, 46);
    chunks.push(local, data); central.push(directory); offset += local.length + data.length; centralSize += directory.length;
  }
  const end = new Uint8Array(22), e = new DataView(end.buffer);
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, centralSize, true); e.setUint32(16, offset, true);
  const result = new Uint8Array(offset + centralSize + end.length);
  let cursor = 0;
  for (const chunk of [...chunks, ...central, end]) { result.set(chunk, cursor); cursor += chunk.length; }
  return result;
}

export function downloadGeographyConfiguration(elements: readonly GeoElement[]) {
  const bytes = buildConfigurationZip(buildGeographyFiles(elements));
  const blob = new Blob([bytes as BlobPart], { type: 'application/zip' });
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = 'geoespana-configuracion.zip';
  document.body.appendChild(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
