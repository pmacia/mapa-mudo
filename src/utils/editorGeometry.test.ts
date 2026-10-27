import assert from 'node:assert/strict';
import { test } from 'node:test';
import { geometryForCategory } from './vectorEditorUtils';
for (const [category, type] of Object.entries({ rios: 'polyline', afluentes: 'polyline', montanas: 'polygon', picos: 'point', costas: 'point', mares: 'point', islas: 'point', unidades_relieve: 'point' })) {
  test(`geometry for ${category} preserves center and uses ${type}`, () => {
    const result = geometryForCategory({ mapX: 430, mapY: 270, svgType: category === 'montanas' ? 'point' : 'polygon', svgPath: 'M 1 2 L 3 4 L 5 6 Z' }, category as import('../types/geography').CategoryType);
    assert.equal(result.svgType, type);
    assert.equal(result.mapX, 430);
    assert.equal(result.mapY, 270);
    if (type === 'point') assert.equal(result.svgPath, undefined);
    else assert.match(result.svgPath!, /430|390/);
  });
}
test('keeps an existing path when the geometry type already matches', () => {
  const element = { mapX: 10, mapY: 20, svgType: 'polygon' as const, svgPath: 'M 0 0 L 20 0 L 10 20 Z' };
  assert.equal(geometryForCategory(element, 'montanas').svgPath, element.svgPath);
});
