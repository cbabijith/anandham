# /// script
# dependencies = ["beautifulsoup4>=4.13,<5"]
# ///
"""Import Guru's original texts, not modern commentary or recordings.
Run: uv run scripts/import-sivagiri.py
Writes only after every catalogue entry has a successfully fetched, non-empty text.
"""
from bs4 import BeautifulSoup
from urllib.request import Request, urlopen
from urllib.parse import urlparse, parse_qs
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, re, time

ROOT = Path(__file__).resolve().parents[1]
URL = 'https://sivagiri.com/gurudevakrithikal'
NAMES = '''Vinayakashtakam|Devi Sthavam|Mannanthala Devi Sthavam|Kali Natakam|Janani Navaratna Manjari|Bhadrakalyashtakam|Devi Pranama Devyashtakam|Guhashtakam|Bahuleyashtakam|Shanmukha Sthothram|Shanmukha Dasakam|Subrahmanya Keerthanam|Navamanjari|Shanmathura Sthavam|Siva Prasada Panchakam|Sadasiva Darsanam|Siva Sathakam|Ardhanareeswara Sthavam|Mananatheetham|Chijjada Chinthanam|Kundalini Pattu|Indriya Vairagyam|Siva Sthavam|Kolathiresa Sthavam|Swanubhava Geethi|Pinda Nandi|Chidambarashtakam|Thevara Pathikangal|Oru Tamil Slokam|Vasudevashtakam|Vishnvashtakam|Sree Krishna Darsanam|Jathi Nirnayam|Jathi Lakshanam|Sadacharam|Jeevakarunya Panchakam|Anukampa Dasakam|Asramam|Dharmam|Atmopadesa Sathakam|Advaita Deepika|Arivu|Daiva Dasakam|Darsana Mala|Brahmavidya Panchakam|Municharya Panchakam|Nirvrithi Panchakam|Sloka Thrayi|Homa Manthram|Vedanta Suthram|Isavasya Upanishad|Thirukkural|Gadya Prarthana|Daiva Chinthanam 1|Daiva Chinthanam 2|Atma Vilasam|Chijjada Chinthanam (Prose)|Mangalasamsakal|Samasya Pooranam|Samadhi Slokam'''.split('|')
SOURCE_IDS = [1,4,5,6,9,10,25,7,8,11,12,13,14,27,15,16,17,18,19,20,21,22,23,24,28,29,30,31,32,2,3,26,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60]
ALIASES = dict(zip(SOURCE_IDS, NAMES, strict=True))
CATEGORIES = {
'GANAPATHY': ('ganapathy', 'Ganapathy', 'ഗണപതി'),
'DEVI KRITHIKAL': ('devi', 'Devi', 'ദേവി'),
'SUBRAMANNYA KRITHIKAL': ('subrahmanya', 'Subrahmanya', 'സുബ്രഹ്മണ്യൻ'),
'SIVA KRITHIKAL': ('siva', 'Siva', 'ശിവൻ'),
'VISHNU KRITHIKAL': ('vishnu', 'Vishnu', 'വിഷ്ണു'),
'PRABODHANATHMAKA KRITHIKAL': ('ethical', 'Ethics & compassion', 'പ്രബോധനാത്മകം'),
'DARSANIKA KRITHIKAL': ('philosophy', 'Philosophy', 'ദാർശനികം'),
'THARJAMAKAL': ('translations', 'Translations', 'തർജമകൾ'),
'GADHYA KRITHIKAL': ('prose', 'Prose', 'ഗദ്യം'),
'ANUBANTHAM': ('appendix', 'Other writings', 'അനുബന്ധം'),
}

def fetch(url):
    for attempt in range(3):
        try:
            with urlopen(Request(url, headers={'User-Agent':'AnandhamLibrary/1.0 (source-attributed literary archive)'}), timeout=45) as r:
                return r.read().decode('utf-8')
        except Exception:
            if attempt == 2: raise
            time.sleep(2 * (attempt+1))

def plain_text(node):
    # Keep line breaks and verse spacing, remove presentation markup only.
    for bad in node.select('script, style, iframe, audio, video'): bad.decompose()
    for text_node in list(node.find_all(string=True)):
        if not text_node.strip() and '\n' in text_node:
            text_node.extract()
    for br in node.find_all('br'): br.replace_with('\n')
    for el in node.find_all(['p','div','h1','h2','h3','h4','li','tr']):
        el.insert_after('\n')
    lines = [re.sub(r'[^\S\n]+',' ', x).strip() for x in node.get_text().replace('\xa0',' ').splitlines()]
    return re.sub(r'\n{3,}', '\n\n', '\n'.join(lines)).strip()

def main():
    page = BeautifulSoup(fetch(URL), 'html.parser')
    entries, category = [], None
    for node in page.select('h2, .w3-third'):
        if node.name == 'h2':
            category = CATEGORIES.get(node.get_text(strip=True))
        else:
            link = node.select_one('a[href*="krithikal-lyrics"]')
            if not link: raise RuntimeError('Catalogue card without lyrics link')
            if not category: raise RuntimeError('Unknown category')
            entries.append((node.h3.get_text(strip=True), link['href'], category))
    if len(entries) != len(NAMES):
        raise RuntimeError(f'Catalogue changed: {len(entries)} entries, expected {len(NAMES)}. Review English aliases before import.')
    result=[]
    for i, (title, url, category) in enumerate(entries):
        source_id=int(parse_qs(urlparse(url).query)['id'][0])
        if source_id not in ALIASES: raise RuntimeError(f'Unknown source ID: {source_id}; review aliases.')
        alias=ALIASES[source_id]
        page=BeautifulSoup(fetch(url), 'html.parser')
        content=page.select_one('.pro-des')
        if content is None: raise RuntimeError(f'Missing text container: {url}')
        body=plain_text(content)
        if len(body)<30: raise RuntimeError(f'Empty/truncated text: {url}')
        result.append(dict(sourceId=source_id, slug=re.sub(r'[^a-z0-9]+','-',alias.lower()).strip('-'), title=title, transliteration=alias, category=category[0], categoryName=category[1], categoryMalayalam=category[2], body=body, sourceUrl=url, sourceHash=hashlib.sha256(body.encode()).hexdigest(), sortOrder=i, status='published'))
        print(f'{i+1:02d}/{len(entries)} {title}: {len(body)} characters', flush=True)
        time.sleep(.15)
    if len({r['sourceId'] for r in result}) != len(result): raise RuntimeError('Duplicate source IDs')
    output=ROOT/'packages/library/data'
    output.mkdir(parents=True,exist_ok=True)
    (output/'krithis.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    manifest=dict(sourceUrl=URL, fetchedAt=datetime.now(timezone.utc).isoformat(), catalogueCount=len(entries), importedCount=len(result), failedCount=0, categories=len(CATEGORIES), notes='Original literary text as supplied by Sivagiri. English aliases are search aids, not translations. Modern commentary and recordings are not copied. Completeness is against this catalogue, not a critical edition of the collected works.', entries=[{k:r[k] for k in ['sourceId','title','slug','sourceUrl','sourceHash']}|{'characters':len(r['body'])} for r in result])
    (output/'import-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    print('Complete:', len(result), 'source entries imported.')
if __name__=='__main__': main()
