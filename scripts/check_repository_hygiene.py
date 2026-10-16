"""Read-only checks for private artifacts and high-confidence secrets; never print matches."""
import argparse
import re
import subprocess
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[1]
MEDIA = {'.wav', '.mp3', '.mp4', '.mov', '.avi', '.mkv', '.webm', '.flac', '.ogg',
         '.m4a', '.aac', '.wma', '.opus', '.aiff', '.aif', '.amr', '.m4b', '.wmv', '.flv', '.m4v', '.jpg', '.jpeg', '.png', '.gif',
         '.webp', '.bmp', '.tiff', '.tif', '.heic', '.raw', '.psd', '.aviproject',
         '.srt', '.vtt', '.db', '.sqlite', '.sqlite3', '.log', '.pem', '.key', '.p12', '.pfx',
         '.onnx', '.pt', '.pth', '.ckpt', '.safetensors', '.pb', '.har', '.dump', '.bak', '.jsonl'}
PRIVATE_DIRS = {'uploads', 'processed', 'projects', 'logs', 'data', 'memory', 'user_skills',
                'test_media_scratch', 'github_profile', 'github_profile_repo'}
PRODUCT_ASSETS = {'static/brand-mark.svg', 'static/logo.png'}
RULES = {
    'private-key': re.compile(rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'),
    'github-token': re.compile(rb'gh[pousr]_[A-Za-z0-9]{30,}'),
    'service-token': re.compile(rb'sk-(?:proj-)?[A-Za-z0-9_-]{24,}'),
    'aws-access-key': re.compile(rb'AKIA[A-Z0-9]{16}'),
    'url-credentials': re.compile(rb'https?://[^\s/\x22\x27:]+:[^\s/@\x22\x27]+@'),
}


def git(*args):
    return subprocess.check_output(['git', '-C', str(ROOT), *args])


def private_path(name):
    path = PurePosixPath(name)
    if name in PRODUCT_ASSETS or name.startswith('docs/diagrams/') and path.suffix == '.svg':
        return False
    if path.name == '.gitkeep':
        return False
    if (path.name in {'.env', '.envrc', '.netrc', '.pypirc', 'credentials.json'}
            or path.name.endswith('.env')
            or path.name.startswith('.env.') and path.name != '.env.example'
            or path.name.startswith('service-account') and path.suffix == '.json'):
        return True
    return bool(path.parts and path.parts[0] in PRIVATE_DIRS or path.suffix.lower() in MEDIA
                or name.startswith('static/samples/'))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--history', action='store_true', help='Also scan blobs reachable from all local refs')
    args = parser.parse_args()
    failures = []
    paths = git('ls-files', '-z').decode('utf-8').split('\0')
    for name in filter(None, paths):
        if private_path(name):
            failures.append(('working-tree', 'private-artifact', name))
        path = ROOT / name
        if path.is_file():
            data = path.read_bytes()
            for rule, pattern in RULES.items():
                if pattern.search(data):
                    failures.append(('working-tree', rule, name))
    blobs = 0
    if args.history:
        objects = git('rev-list', '--objects', '--all').decode('utf-8').splitlines()
        # Batch I/O avoids one process per historical object. Content stays in memory.
        object_ids = [line.split(' ', 1)[0] for line in objects]
        batch = subprocess.run(['git', '-C', str(ROOT), 'cat-file', '--batch'],
                               input=('\n'.join(object_ids) + '\n').encode(), stdout=subprocess.PIPE,
                               check=True).stdout
        offset = 0
        for entry in objects:
            object_id, _, name = entry.partition(' ')
            end = batch.index(b'\n', offset)
            header = batch[offset:end].split()
            size = int(header[2])
            data = batch[end + 1:end + 1 + size]
            offset = end + 1 + size + 1
            if header[1] != b'blob':
                continue
            blobs += 1
            if name and private_path(name):
                failures.append(('history', 'private-artifact', object_id[:12]))
            for rule, pattern in RULES.items():
                if pattern.search(data):
                    failures.append(('history', rule, object_id[:12]))
    for scope, rule, location in failures:
        print(f'FAIL [{scope}] {rule}: {location}')
    print(f'Checked {len(list(filter(None, paths)))} tracked paths and {blobs} historical blobs; '
          f'{len(failures)} finding(s). Secret values are never printed.')
    return 1 if failures else 0


if __name__ == '__main__':
    raise SystemExit(main())
