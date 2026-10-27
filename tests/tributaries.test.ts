import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GEO_ELEMENTS, CATEGORY_INFO } from '../src/data/geographyData';
import { parseSvgPathToPoints } from '../src/utils/vectorEditorUtils';
import { availableRiverParents, migrateStoredElements, inheritRiverSlopes } from '../src/utils/riverRelations';
import { buildGeographyFiles } from '../src/utils/exportGeography';


test('tributaries have connected paths, valid receivers and inherited drainage slopes', () => {
  const tributaries = GEO_ELEMENTS.filter(e => e.category === 'afluentes');
  assert.equal(tributaries.length, 16);
  assert.ok(CATEGORY_INFO.afluentes);
  for (const element of tributaries) {
    const parent = GEO_ELEMENTS.find(e => e.id === element.parentRiverId);
    assert.ok(parent, element.name);
    assert.equal(element.svgType, 'polyline');
    assert.equal(element.vertiente, parent.vertiente);
    const points = parseSvgPathToPoints(element.svgPath!);
    assert.ok(points.length >= 3);
    const end = points.at(-1)!;
    assert.ok(parseSvgPathToPoints(parent.svgPath!).some(p => Math.hypot(p.x-end.x,p.y-end.y)<0.1), element.name);
  }
  assert.equal(new Set(GEO_ELEMENTS.map(e=>e.id)).size,GEO_ELEMENTS.length);
});


test('upgrades old saves without losing edits, and respects deletions after migration', () => {
  const legacy = GEO_ELEMENTS.filter(e=>e.category!=='afluentes').map(e=>({...e,name:`Editado ${e.name}`}));
  const migrated = migrateStoredElements(legacy,GEO_ELEMENTS);
  assert.equal(migrated.filter(e=>e.category==='afluentes').length,16);
  assert.equal(migrated.find(e=>e.id==='rio-ebro')?.name,'Editado Río Ebro');
  const afterDelete = migrated.filter(e=>e.id!=='rio-mundo');
  assert.deepEqual(migrateStoredElements({version:3,elements:afterDelete},GEO_ELEMENTS),afterDelete);
  assert.equal(migrateStoredElements([...legacy.filter(e=>e.id!=='rio-duero')],GEO_ELEMENTS).some(e=>e.id==='rio-duero'),false);
});

test('a receiver cannot be itself or a descendant', () => {
  const segreParents=availableRiverParents(GEO_ELEMENTS,'rio-segre');
  assert.ok(!segreParents.some(e=>e.id==='rio-cinca'||e.id==='rio-segre'));
  assert.ok(segreParents.some(e=>e.id==='rio-ebro'));
});

test('exports include the tributary category, geometry and receiver', () => {
  const files=buildGeographyFiles(GEO_ELEMENTS);
  assert.match(files[0].content,/"parentRiverId": "rio-segre"/);
  assert.match(files[0].content,/"category": "afluentes"/);
  assert.match(files[1].content,/"rio-cinca"/);
});

test('changing a receiver updates the slope of indirect tributaries too', () => {
  const updated = GEO_ELEMENTS.map(e => e.id === 'rio-ebro' ? {...e, vertiente: 'atlantico' as const} : e);
  const result = inheritRiverSlopes(updated, 'rio-ebro');
  assert.equal(result.find(e => e.id === 'rio-segre')?.vertiente, 'atlantico');
  assert.equal(result.find(e => e.id === 'rio-cinca')?.vertiente, 'atlantico');
  assert.equal(GEO_ELEMENTS.find(e => e.id === 'rio-cinca')?.vertiente, 'mediterraneo');
});

test('export rejects missing receivers and circular tributary relations', () => {
  const missing = GEO_ELEMENTS.map(e => e.id === 'rio-cinca' ? {...e, parentRiverId: 'missing-river'} : e);
  assert.throws(() => buildGeographyFiles(missing), /Río receptor inválido/);
  const circular = GEO_ELEMENTS.map(e => e.id === 'rio-segre' ? {...e, parentRiverId: 'rio-cinca'} : e);
  assert.throws(() => buildGeographyFiles(circular), /relación circular/);
});
