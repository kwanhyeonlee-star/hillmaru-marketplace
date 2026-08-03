import json
with open('category_map_2023.json', encoding='utf-8') as f:
    m = json.load(f)

overrides = {
    '소모품_장비': '장비 소모품비',
    '안전관리비': '기타',
}
m.update(overrides)
with open('category_map_2023_final.json', 'w', encoding='utf-8') as f:
    json.dump(m, f, ensure_ascii=False, indent=2)
for k,v in m.items():
    print(k, '->', v)
