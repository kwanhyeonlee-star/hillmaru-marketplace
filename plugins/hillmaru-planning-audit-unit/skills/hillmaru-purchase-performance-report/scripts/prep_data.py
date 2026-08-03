import pandas as pd
import numpy as np
import re
import json

SRC = '/mnt/user-data/uploads/구매_데이터_2023_2026상반기.xlsx'
SHEETS = ['2023','2024','2025','2026 상반기']

COMMON_COLS = ['담당자','연도','사업장','요청부서','과목1','과목2','과목3','품의번호','제목',
               '업체명','발주일','입고일','제품구분','제품명','규격','발주수량','단가','공급가',
               '입고수량','포장단위','대금지급일','대금지급','지급처','비고']

def load_sheet(sn):
    df = pd.read_excel(SRC, sheet_name=sn, header=2)
    df = df.iloc[:, :24].copy()
    cols = list(df.columns)
    # normalize 2023-style headers
    rename = {}
    if '구분1' in cols: rename['구분1'] = '과목1'
    if '구분2' in cols: rename['구분2'] = '과목2'
    if '입고요청일' in cols: rename['입고요청일'] = '입고일'
    df = df.rename(columns=rename)
    # ensure 과목3 exists
    if '과목3' not in df.columns:
        df['과목3'] = np.nan
    df['period_label'] = sn
    return df[COMMON_COLS + ['period_label']]

dfs = {sn: load_sheet(sn) for sn in SHEETS}
for sn, d in dfs.items():
    print(sn, d.shape)

all_df = pd.concat(dfs.values(), ignore_index=True)
print('total', all_df.shape)

# clean 공급가
all_df['공급가'] = pd.to_numeric(all_df['공급가'], errors='coerce')
before = len(all_df)
all_df = all_df[all_df['공급가'].notna()]
print('dropped non-numeric 공급가 rows:', before - len(all_df))

all_df.to_pickle('./all_raw.pkl')
print(all_df['과목3'].isna().sum(), 'rows missing 과목3 (2023 rows)')
