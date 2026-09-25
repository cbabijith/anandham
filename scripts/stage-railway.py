"""Create a small, secret-free Railway build context. Prints its absolute path."""
from pathlib import Path
import shutil, tempfile
ROOT=Path(__file__).resolve().parents[1]
DEST=Path(tempfile.mkdtemp(prefix='anandham-railway-'))
ignore=shutil.ignore_patterns('node_modules','.next','.env*','.private','*.tsbuildinfo','graphify-out','.cache')
for filename in ['package.json','package-lock.json','Dockerfile.library','.dockerignore']:
 shutil.copy2(ROOT/filename,DEST/filename)
for name in ['web-user','web-admin']:
 shutil.copytree(ROOT/'apps'/name,DEST/'apps'/name,ignore=ignore)
for name in ['web-author','gurusmruthi']:
 p=DEST/'apps'/name;p.mkdir(parents=True)
 shutil.copy2(ROOT/'apps'/name/'package.json',p/'package.json')
for package in (ROOT/'packages').iterdir():
 if (package/'package.json').is_file(): shutil.copytree(package,DEST/'packages'/package.name,ignore=ignore)
if any(p.name.startswith('.env') or p.suffix in ['.jks','.aab'] for p in DEST.rglob('*')):
 raise RuntimeError('Unexpected sensitive file in build context')
print(DEST)
