import pandas as pd, numpy as np, json

df = pd.read_pickle('all_normalized.pkl')
pc = df[df['사업장']=='포천'].copy()
main = pc[pc['period_label']=='2026 상반기'].copy()
main['월'] = pd.to_datetime(main['발주일'], errors='coerce').dt.month
main['월버킷'] = main['월'].apply(lambda m: m if (pd.notna(m) and 1 <= m <= 6) else '기타')

TOTAL = main['공급가'].sum()

# YoY
yoy = pc.groupby('period_label')['공급가'].sum().reindex(['2023','2024','2025','2026 상반기']).fillna(0)

# category
cat = main.groupby('과목3_norm')['공급가'].sum().sort_values(ascending=False)
TOP_CAT_N = 4
top_cats = cat.head(TOP_CAT_N)
rest_cat = cat.iloc[TOP_CAT_N:].sum()
cat_chart = list(top_cats.items()) + [('그 외', rest_cat)]

# vendor
vend = main.groupby('업체명')['공급가'].sum().sort_values(ascending=False)
TOP_VEND_N = 5
top_vend = vend.head(TOP_VEND_N)
rest_vend_n = len(vend) - TOP_VEND_N
rest_vend = vend.iloc[TOP_VEND_N:].sum()
vend_chart = list(top_vend.items()) + [(f'그 외 {rest_vend_n}개 업체', rest_vend)]

# monthly x category (top4 + 그외)
cat_top_names = list(top_cats.index)
main['cat_bucket'] = main['과목3_norm'].apply(lambda x: x if x in cat_top_names else '그 외')
monthly_cat = main.pivot_table(index='cat_bucket', columns='월', values='공급가', aggfunc='sum', fill_value=0)
monthly_cat = monthly_cat.reindex(cat_top_names + ['그 외'])
monthly_cat_total = monthly_cat.sum(axis=0)

# monthly x vendor (top5 + 그외)
vend_top_names = list(top_vend.index)
main['vend_bucket'] = main['업체명'].apply(lambda x: x if x in vend_top_names else '그 외')
monthly_vend = main.pivot_table(index='vend_bucket', columns='월', values='공급가', aggfunc='sum', fill_value=0)
monthly_vend = monthly_vend.reindex(vend_top_names + ['그 외'])

# item detail per top category
cat_items = {}
for c in cat_top_names:
    sub = main[main['과목3_norm']==c]
    g = sub.groupby('제품명').agg(수량=('발주수량','sum'), 금액=('공급가','sum'))
    g['단가'] = (g['금액']/g['수량']).round(0)
    g = g.sort_values('금액', ascending=False)
    TOPI = 8
    top_items = g.head(TOPI)
    rest_n = len(g) - TOPI
    rest_amt = g['금액'].iloc[TOPI:].sum()
    items = [[idx, int(row['수량']) if not pd.isna(row['수량']) else 0, int(row['단가']) if not pd.isna(row['단가']) else 0, int(row['금액'])] for idx,row in top_items.iterrows()]
    if rest_n > 0:
        items.append([f'그 외 {rest_n}개 품목', None, None, int(rest_amt)])
    cat_items[c] = {'total': int(g['금액'].sum()), 'items': items}

# item detail per top vendor
vend_items = {}
for v in vend_top_names:
    sub = main[main['업체명']==v]
    g = sub.groupby('제품명').agg(수량=('발주수량','sum'), 금액=('공급가','sum'))
    g['단가'] = (g['금액']/g['수량']).round(0)
    g = g.sort_values('금액', ascending=False)
    TOPI = 6
    top_items = g.head(TOPI)
    rest_n = len(g) - TOPI
    rest_amt = g['금액'].iloc[TOPI:].sum()
    items = [[idx, int(row['수량']) if not pd.isna(row['수량']) else 0, int(row['단가']) if not pd.isna(row['단가']) else 0, int(row['금액'])] for idx,row in top_items.iterrows()]
    if rest_n > 0:
        items.append([f'그 외 {rest_n}개 품목', None, None, int(rest_amt)])
    # main category of this vendor (mode)
    main_cat = sub['과목3_norm'].mode().iloc[0] if len(sub) else ''
    vend_items[v] = {'total': int(g['금액'].sum()), 'items': items, 'main_cat': main_cat}

out = {
    'total_amount': int(TOTAL),
    'total_cat_count': int(cat.shape[0]),
    'total_vend_count': int(vend.shape[0]),
    'yoy': {k: int(v) for k,v in yoy.items()},
    'cat_chart': [[k, int(v)] for k,v in cat_chart],
    'vend_chart': [[k, int(v)] for k,v in vend_chart],
    'monthly_cat': {str(k): [int(monthly_cat.loc[k,m]) if m in monthly_cat.columns else 0 for m in range(1,7)] for k in monthly_cat.index},
    'monthly_cat_total': [int(monthly_cat_total.get(m,0)) for m in range(1,7)],
    'monthly_vend': {str(k): [int(monthly_vend.loc[k,m]) if m in monthly_vend.columns else 0 for m in range(1,7)] for k in monthly_vend.index},
    'cat_items': cat_items,
    'vend_items': vend_items,
    'cat_top_names': cat_top_names,
    'vend_top_names': vend_top_names,
    'rest_vend_n': rest_vend_n,
}
with open('report_data.json','w',encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)
print('exported. total_amount=', TOTAL)
print('yoy', out['yoy'])

# matrix data: per category (all, or top 10 by amount) - cost vs order frequency
cat_all = main.groupby('과목3_norm').agg(금액=('공급가','sum'), 건수=('품의번호','nunique'))
cat_all = cat_all.sort_values('금액', ascending=False).head(10)
cost_med = cat_all['금액'].median()
freq_med = cat_all['건수'].median()
matrix1 = []
for name, row in cat_all.iterrows():
    quad = ('A' if row['금액']>=cost_med and row['건수']>=freq_med else
            'B' if row['금액']>=cost_med and row['건수']<freq_med else
            'C' if row['금액']<cost_med and row['건수']>=freq_med else 'D')
    matrix1.append({'name': name, '금액': int(row['금액']), '건수': int(row['건수']), 'quad': quad})

# matrix2: 단가(평균) vs 발주수량(총량) per category
cat_all2 = main.groupby('과목3_norm').agg(수량=('발주수량','sum'), 금액=('공급가','sum'))
cat_all2['단가'] = cat_all2['금액']/cat_all2['수량']
cat_all2 = cat_all2.sort_values('금액', ascending=False).head(10)
price_med = cat_all2['단가'].median()
qty_med = cat_all2['수량'].median()
matrix2 = []
for name, row in cat_all2.iterrows():
    quad = ('A' if row['단가']>=price_med and row['수량']>=qty_med else
            'B' if row['단가']>=price_med and row['수량']<qty_med else
            'C' if row['단가']<price_med and row['수량']>=qty_med else 'D')
    matrix2.append({'name': name, '단가': int(row['단가']), '수량': int(row['수량']), 'quad': quad})

out['matrix1'] = matrix1
out['matrix2'] = matrix2

with open('report_data.json','w',encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)
print('matrix1', matrix1)
print('matrix2', matrix2)

# ---- Bigger top-N specifically for the monthly breakdown tables (fill the page, minimize '그 외') ----
MONTHLY_CAT_N = 15
MONTHLY_VEND_N = 15

cat_all_sorted = main.groupby('과목3_norm')['공급가'].sum().sort_values(ascending=False)
mtop_cats = list(cat_all_sorted.head(MONTHLY_CAT_N).index)
main['cat_bucket_wide'] = main['과목3_norm'].apply(lambda x: x if x in mtop_cats else '그 외')
monthly_cat_wide = main.pivot_table(index='cat_bucket_wide', columns='월버킷', values='공급가', aggfunc='sum', fill_value=0)
monthly_cat_wide = monthly_cat_wide.reindex(mtop_cats + ['그 외'])

vend_all_sorted = main.groupby('업체명')['공급가'].sum().sort_values(ascending=False)
mtop_vends = list(vend_all_sorted.head(MONTHLY_VEND_N).index)
main['vend_bucket_wide'] = main['업체명'].apply(lambda x: x if x in mtop_vends else '그 외')
monthly_vend_wide = main.pivot_table(index='vend_bucket_wide', columns='월버킷', values='공급가', aggfunc='sum', fill_value=0)
monthly_vend_wide = monthly_vend_wide.reindex(mtop_vends + ['그 외'])

MONTH_COLS = [1, 2, 3, 4, 5, 6, '기타']
out['monthly_cat'] = {str(k): [int(monthly_cat_wide.loc[k, m]) if m in monthly_cat_wide.columns else 0 for m in MONTH_COLS] for k in monthly_cat_wide.index}
out['monthly_vend'] = {str(k): [int(monthly_vend_wide.loc[k, m]) if m in monthly_vend_wide.columns else 0 for m in MONTH_COLS] for k in monthly_vend_wide.index}
_month_total_series = main.groupby('월버킷')['공급가'].sum()
out['monthly_cat_total'] = [int(_month_total_series.get(m, 0)) for m in MONTH_COLS]
out['month_cols'] = ['1월', '2월', '3월', '4월', '5월', '6월', '기타']

# ---- Expand item-level detail tables (top4 categories / top5 vendors) to minimize '그 외' rows ----
CAT_ITEM_TOPI = 18
cat_items2 = {}
for c in cat_top_names:
    sub = main[main['과목3_norm'] == c]
    g = sub.groupby('제품명').agg(수량=('발주수량', 'sum'), 금액=('공급가', 'sum'))
    g['단가'] = (g['금액'] / g['수량']).round(0)
    g = g.sort_values('금액', ascending=False)
    top_items = g.head(CAT_ITEM_TOPI)
    rest_n = len(g) - CAT_ITEM_TOPI
    rest_amt = g['금액'].iloc[CAT_ITEM_TOPI:].sum()
    items = [[idx, int(row['수량']) if not pd.isna(row['수량']) else 0, int(row['단가']) if not pd.isna(row['단가']) else 0, int(row['금액'])] for idx, row in top_items.iterrows()]
    if rest_n > 0:
        items.append([f'그 외 {rest_n}개 품목', None, None, int(rest_amt)])
    cat_items2[c] = {'total': int(g['금액'].sum()), 'items': items}
out['cat_items'] = cat_items2

VEND_ITEM_TOPI = 20
vend_items2 = {}
for v in vend_top_names:
    sub = main[main['업체명'] == v]
    g = sub.groupby('제품명').agg(수량=('발주수량', 'sum'), 금액=('공급가', 'sum'))
    g['단가'] = (g['금액'] / g['수량']).round(0)
    g = g.sort_values('금액', ascending=False)
    top_items = g.head(VEND_ITEM_TOPI)
    rest_n = len(g) - VEND_ITEM_TOPI
    rest_amt = g['금액'].iloc[VEND_ITEM_TOPI:].sum()
    items = [[idx, int(row['수량']) if not pd.isna(row['수량']) else 0, int(row['단가']) if not pd.isna(row['단가']) else 0, int(row['금액'])] for idx, row in top_items.iterrows()]
    if rest_n > 0:
        items.append([f'그 외 {rest_n}개 품목', None, None, int(rest_amt)])
    main_cat = sub['과목3_norm'].mode().iloc[0] if len(sub) else ''
    vend_items2[v] = {'total': int(g['금액'].sum()), 'items': items, 'main_cat': main_cat}
out['vend_items'] = vend_items2

with open('report_data.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)
print('re-exported with wider monthly tables and expanded item lists')
print('cat item counts:', {k: len(v['items']) for k, v in cat_items2.items()})
print('vend item counts:', {k: len(v['items']) for k, v in vend_items2.items()})

# ---- Kraljic-style matrix: 비용영향(지출액) x 공급리스크(업체 수 역수) ----
cat_supplier = main.groupby('과목3_norm').agg(금액=('공급가', 'sum'), 업체수=('업체명', 'nunique'))
cat_supplier = cat_supplier.sort_values('금액', ascending=False).head(10)
cost_med2 = cat_supplier['금액'].median()
supplier_med = cat_supplier['업체수'].median()
matrix_kraljic = []
for name, row in cat_supplier.iterrows():
    high_spend = row['금액'] >= cost_med2
    high_risk = row['업체수'] <= supplier_med  # fewer suppliers = higher risk
    quad = ('A' if high_spend and high_risk else
            'B' if high_spend and not high_risk else
            'C' if not high_spend and high_risk else 'D')
    matrix_kraljic.append({'name': name, '금액': int(row['금액']), '업체수': int(row['업체수']), 'quad': quad})

out['matrix_kraljic'] = matrix_kraljic
print('kraljic', matrix_kraljic)

# ---- Extra insight 1: 단일 공급처 의존 품목구분 (상위 15개 중) ----
cat_supplier_all = main.groupby('과목3_norm').agg(금액=('공급가', 'sum'), 업체수=('업체명', 'nunique')).sort_values('금액', ascending=False)
single_source = cat_supplier_all[(cat_supplier_all['업체수'] == 1) & (cat_supplier_all['금액'] >= 3_000_000)].head(12)
single_source_list = []
for name, row in single_source.iterrows():
    vend = main[main['과목3_norm'] == name]['업체명'].iloc[0]
    single_source_list.append({'name': name, '금액': int(row['금액']), '업체': vend})
out['single_source'] = single_source_list
print('single_source', single_source_list)

# ---- Extra insight 2: 동일 품목 단가 편차 (price variance) ----
PRICE_VAR_STOP = ['운송비', '배송비', '설치비', '인건비', '수수료', '시공비', '작업비', '처리비', '운반비', '폐기비', '대행수수료', '기타']
item_price = main.groupby('제품명').agg(
    최소단가=('단가', 'min'), 최대단가=('단가', 'max'), 평균단가=('단가', 'mean'),
    건수=('단가', 'count'), 총금액=('공급가', 'sum')
)
item_price = item_price[(item_price['건수'] >= 2) & (item_price['최소단가'] > 0)]
item_price = item_price[~item_price.index.isin(PRICE_VAR_STOP)]
item_price['편차비율'] = (item_price['최대단가'] - item_price['최소단가']) / item_price['최소단가']
item_price = item_price[item_price['편차비율'] >= 0.15].sort_values('편차비율', ascending=False).head(8)
price_variance_list = []
for name, row in item_price.iterrows():
    price_variance_list.append({
        'name': name, 'min': int(row['최소단가']), 'max': int(row['최대단가']),
        'avg': int(row['평균단가']), 'n': int(row['건수']), 'pct': round(row['편차비율'] * 100),
        'total': int(row['총금액']),
    })
out['price_variance'] = price_variance_list
print('price_variance', price_variance_list)

with open('report_data.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

# ---- Kraljic matrix: attach vendor name list per category (for verification) ----
def vendor_display(cat_name, top_n=3):
    v = main[main['과목3_norm'] == cat_name].groupby('업체명')['공급가'].sum().sort_values(ascending=False)
    names = list(v.index)
    if len(names) <= top_n:
        return ', '.join(names)
    return ', '.join(names[:top_n]) + f' 외 {len(names)-top_n}곳'

for entry in out['matrix_kraljic']:
    entry['vendors_display'] = vendor_display(entry['name'])
with open('report_data.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)
print('kraljic w/ vendors:', [(e['name'], e['vendors_display']) for e in out['matrix_kraljic']])

# ---- Strategy add-on 1: ABC 분석 (파레토) ----
cat_rank = main.groupby('과목3_norm')['공급가'].sum().sort_values(ascending=False)
cum = cat_rank.cumsum() / cat_rank.sum()
grade = cum.apply(lambda x: 'A' if x <= 0.70 else ('B' if x <= 0.90 else 'C'))
abc_summary = {}
abc_items = {'A': [], 'B': [], 'C': []}
for name, amt in cat_rank.items():
    g = grade[name]
    abc_items[g].append({'name': name, '금액': int(amt), 'pct': round(cum[name]*100, 1)})
for g in ['A', 'B', 'C']:
    total = sum(x['금액'] for x in abc_items[g])
    abc_summary[g] = {'count': len(abc_items[g]), 'total': total, 'pct_of_all': round(total/cat_rank.sum()*100, 1)}
out['abc_summary'] = abc_summary
out['abc_items'] = abc_items
print('ABC summary:', abc_summary)

# ---- Strategy add-on 2: 정기계약(연간 단가계약) 전환 후보 — 발주빈도 상위 ----
freq_rank = main.groupby('업체명').agg(건수=('품의번호', 'nunique'), 금액=('공급가', 'sum'), 주요품목=('과목3_norm', lambda s: s.mode().iloc[0] if len(s) else ''))
freq_rank = freq_rank[freq_rank['건수'] >= 5].sort_values('건수', ascending=False).head(6)
blanket_candidates = [{'name': n, '건수': int(r['건수']), '금액': int(r['금액']), '주요품목': r['주요품목']} for n, r in freq_rank.iterrows()]
out['blanket_candidates'] = blanket_candidates
print('blanket candidates (vendor-based):', blanket_candidates)

# ---- New insight A: 리드타임(발주→입고) 분석 ----
d1 = pd.to_datetime(main['발주일'], errors='coerce')
d2 = pd.to_datetime(main['입고일'], errors='coerce')
main['lead'] = (d2 - d1).dt.days
cat_lead = main.groupby('과목3_norm').agg(평균리드=('lead', 'mean'), 건수=('lead', 'count'), 금액=('공급가', 'sum'))
cat_lead = cat_lead[cat_lead['건수'] >= 2].sort_values('평균리드', ascending=False).head(8)
lead_time_list = [{'name': n, 'lead': round(r['평균리드'], 1), 'n': int(r['건수']), '금액': int(r['금액'])} for n, r in cat_lead.iterrows()]
out['lead_time'] = lead_time_list
print('lead_time:', lead_time_list)

# ---- New insight B: 대금 미지급 현황 ----
unpaid = main[main['대금지급'] != '완료']
unpaid_total = int(unpaid['공급가'].sum())
unpaid_pct = round(unpaid_total / main['공급가'].sum() * 100, 1)
by_vend_unpaid = unpaid.groupby('업체명').agg(금액=('공급가', 'sum'), 건수=('품의번호', 'nunique')).sort_values('금액', ascending=False).head(8)
unpaid_list = [{'name': n, '금액': int(r['금액']), '건수': int(r['건수'])} for n, r in by_vend_unpaid.iterrows()]
out['unpaid_total'] = unpaid_total
out['unpaid_pct'] = unpaid_pct
out['unpaid_list'] = unpaid_list
print('unpaid:', unpaid_total, unpaid_pct, unpaid_list)

with open('report_data.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

# ---- New insight A: 월별 발주 패턴 (계절성) ----
month_labels = ['1월', '2월', '3월', '4월', '5월', '6월', '기타(범위외)']
month_totals = out['monthly_cat_total']
peak_idx = max(range(6), key=lambda i: month_totals[i])  # exclude '기타' from peak search
peak_month = month_labels[peak_idx]
peak_amt = month_totals[peak_idx]
peak_cats = main[main['월'] == (peak_idx + 1)].groupby('과목3_norm')['공급가'].sum().sort_values(ascending=False).head(3)
out['seasonality'] = {
    'labels': month_labels,
    'values': month_totals,
    'peak_month': peak_month,
    'peak_amt': peak_amt,
    'peak_drivers': [{'name': n, '금액': int(v)} for n, v in peak_cats.items()],
}
print('seasonality:', out['seasonality'])

# ---- New insight B: 연도별 신규/이탈 거래업체 ----
periods_all = ['2023', '2024', '2025', '2026 상반기']
vend_sets = {p: set(pc[pc['period_label'] == p]['업체명'].dropna().unique()) for p in periods_all}
new_2026 = vend_sets['2026 상반기'] - vend_sets['2023'] - vend_sets['2024'] - vend_sets['2025']
churn = (vend_sets['2023'] | vend_sets['2024'] | vend_sets['2025']) - vend_sets['2026 상반기']

new_amt = main[main['업체명'].isin(new_2026)].groupby('업체명')['공급가'].sum().sort_values(ascending=False).head(8)
new_vendors_list = [{'name': n, '금액': int(v)} for n, v in new_amt.items()]

churn_pool = pc[(pc['period_label'].isin(['2023', '2024', '2025'])) & (pc['업체명'].isin(churn))]
churn_amt = churn_pool.groupby('업체명')['공급가'].sum().sort_values(ascending=False).head(8)
churned_vendors_list = [{'name': n, '금액': int(v)} for n, v in churn_amt.items()]

out['new_vendor_count'] = len(new_2026)
out['new_vendors'] = new_vendors_list
out['churned_vendor_count'] = len(churn)
out['churned_vendors'] = churned_vendors_list
print('new_vendors:', new_vendors_list)
print('churned_vendors:', churned_vendors_list)

with open('report_data.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)
