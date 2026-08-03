import pandas as pd, numpy as np, json, re
from collections import defaultdict

df = pd.read_pickle('all_normalized.pkl')  # already has 과목3_norm from 2023 fallback mapping

def key2(s):
    s = str(s)
    s = re.sub(r'[\s,]+', '', s)
    s = s.replace('(', '/').replace(')', '')
    return s

vc = df['과목3_norm'].dropna().value_counts()
groups = defaultdict(list)
for cat, cnt in vc.items():
    groups[key2(cat)].append((cat, cnt))

canon_map = {}
merged_report = []
for k, v in groups.items():
    if len(v) > 1:
        v_sorted = sorted(v, key=lambda x: -x[1])
        canonical = v_sorted[0][0]
        for cat, cnt in v_sorted:
            canon_map[cat] = canonical
        merged_report.append(v_sorted)
    else:
        canon_map[v[0][0]] = v[0][0]

df['과목3_norm'] = df['과목3_norm'].map(lambda x: canon_map.get(x, x) if pd.notna(x) else x)

# ---- User-requested override: roll up by 과목2 for 락카 소모품 / 시설 groups ----
GROUP2_OVERRIDE = {
    '락카 소모품': '락카 소모품',
    '시설': '시설', '시설 소모품': '시설', '시설물': '시설',
}
mask = df['과목2'].isin(GROUP2_OVERRIDE.keys())
print(f'과목2 override applied to {mask.sum()} rows')
df.loc[mask, '과목3_norm'] = df.loc[mask, '과목2'].map(GROUP2_OVERRIDE)

df.to_pickle('all_normalized.pkl')

print(f'{len(merged_report)} groups merged:')
for g in merged_report:
    print(g, '->', g[0][0])

with open('canon_map.json', 'w', encoding='utf-8') as f:
    json.dump(canon_map, f, ensure_ascii=False, indent=2)
