import pandas as pd, numpy as np, json

df = pd.read_pickle('all_normalized.pkl')
pc = df[df['사업장']=='포천'].copy()

with open('report_data.json', encoding='utf-8') as f:
    D = json.load(f)

periods = ['2023','2024','2025','2026 상반기']

cat_yoy = {}
for c in D['cat_top_names']:
    s = pc[pc['과목3_norm']==c].groupby('period_label')['공급가'].sum().reindex(periods).fillna(0)
    cat_yoy[c] = [int(s[p]) for p in periods]

vend_yoy = {}
for v in D['vend_top_names']:
    s = pc[pc['업체명']==v].groupby('period_label')['공급가'].sum().reindex(periods).fillna(0)
    vend_yoy[v] = [int(s[p]) for p in periods]

D['periods'] = periods
D['cat_yoy'] = cat_yoy
D['vend_yoy'] = vend_yoy

with open('report_data.json','w',encoding='utf-8') as f:
    json.dump(D, f, ensure_ascii=False, indent=2)

print('cat_yoy'); [print(k,v) for k,v in cat_yoy.items()]
print('vend_yoy'); [print(k,v) for k,v in vend_yoy.items()]
