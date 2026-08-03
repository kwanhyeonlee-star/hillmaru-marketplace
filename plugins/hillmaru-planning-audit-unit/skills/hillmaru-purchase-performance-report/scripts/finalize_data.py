import pandas as pd, numpy as np, json

df = pd.read_pickle('all_raw.pkl')
with open('category_map_2023_final.json', encoding='utf-8') as f:
    cat_map = json.load(f)

def fill_cat3(row):
    if pd.notna(row['과목3']):
        return row['과목3']
    return cat_map.get(row['과목2'], '기타')

df['과목3_norm'] = df.apply(fill_cat3, axis=1)
df.to_pickle('all_normalized.pkl')

# YoY totals, 포천 only
pc = df[df['사업장']=='포천']
yoy = pc.groupby('period_label')['공급가'].sum().reindex(['2023','2024','2025','2026 상반기'])
print('=== YoY 총 공급가 (포천) ===')
print(yoy)
print()

main = pc[pc['period_label']=='2026 상반기']
print('main report rows:', len(main), 'total 공급가:', main['공급가'].sum())
print()
print('=== 과목3_norm 별 합계 (상위) ===')
cat = main.groupby('과목3_norm')['공급가'].sum().sort_values(ascending=False)
print(cat.head(15))
print('총 카테고리 수:', len(cat))
print()
print('=== 업체별 합계 (상위) ===')
vend = main.groupby('업체명')['공급가'].sum().sort_values(ascending=False)
print(vend.head(15))
print('총 업체 수:', len(vend))
