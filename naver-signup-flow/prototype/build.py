"""
프로토타입을 파일 하나(dist/index.html)로 합치는 스크립트

작업용 코드는 css/, js/ 에 기능별로 나눠 두고,
배포·공유할 때만 이 스크립트로 한 파일을 만든다.
만들어진 파일은 인터넷 없이 더블클릭(file://)으로 열어도 동작한다.
(글꼴만 인터넷이 있을 때 Noto Sans KR로, 없으면 기기 기본 글꼴로 표시)

사용법:  python3 build.py
"""
import posixpath
import re
from pathlib import Path

ROOT = Path(__file__).parent
CSS_FILES = ["css/tokens.css", "css/layout.css", "css/components.css"]
ENTRY = "js/main.js"
OUT = ROOT / "dist" / "index.html"

IMPORT_NAMED = re.compile(r"^import\s*\{([^}]*)\}\s*from\s*'([^']+)';\s*$", re.M)
IMPORT_DEFAULT = re.compile(r"^import\s+(\w+)\s+from\s*'([^']+)';\s*$", re.M)
EXPORT_DECL = re.compile(r"^export\s+(const|function)\s+(\w+)", re.M)
EXPORT_DEFAULT = re.compile(r"^export\s+default\s+", re.M)


def resolve(from_path: str, spec: str) -> str:
    return posixpath.normpath(posixpath.join(posixpath.dirname(from_path), spec))


def transform(path: str, source: str) -> tuple[str, list[str]]:
    """ES 모듈 한 개를 함수 안에서 실행되는 코드로 바꾸고, 의존 모듈 목록을 돌려준다."""
    deps: list[str] = []

    def named(m: re.Match) -> str:
        dep = resolve(path, m.group(2))
        deps.append(dep)
        names = ", ".join(n.strip().replace(" as ", ": ") for n in m.group(1).split(",") if n.strip())
        return f"const {{ {names} }} = __require('{dep}');"

    def default(m: re.Match) -> str:
        dep = resolve(path, m.group(2))
        deps.append(dep)
        return f"const {m.group(1)} = __require('{dep}').default;"

    code = IMPORT_NAMED.sub(named, source)
    code = IMPORT_DEFAULT.sub(default, code)

    exported = EXPORT_DECL.findall(code)
    code = EXPORT_DECL.sub(r"\1 \2", code)
    code = EXPORT_DEFAULT.sub("exports.default = ", code)
    code += "\n" + "".join(f"exports.{name} = {name};\n" for _, name in exported)

    if re.search(r"^\s*(import|export)\b", code, re.M):
        raise SystemExit(f"{path}: 처리하지 못한 import/export가 있어요")
    return code, deps


def collect(entry: str) -> dict[str, str]:
    """entry부터 따라가며 필요한 모듈을 모두 모은다."""
    modules: dict[str, str] = {}
    queue = [entry]
    while queue:
        path = queue.pop()
        if path in modules:
            continue
        code, deps = transform(path, (ROOT / path).read_text(encoding="utf-8"))
        modules[path] = code
        queue.extend(deps)
    return modules


def build() -> None:
    page = (ROOT / "index.html").read_text(encoding="utf-8")
    title = re.search(r"<title>.*?</title>", page).group(0)
    body = re.search(r'(<div class="page">.*?</div>\s*)(?=<script)', page, re.S).group(1).rstrip()

    css = "\n".join((ROOT / f).read_text(encoding="utf-8") for f in CSS_FILES)

    modules = collect(ENTRY)
    defined = "\n".join(
        f"__define('{path}', function (exports, __require) {{\n{code}\n}});"
        for path, code in sorted(modules.items())
    )
    runtime = f"""(function () {{
  var factories = {{}}, cache = {{}};
  function __define(path, factory) {{ factories[path] = factory; }}
  function __require(path) {{
    if (!cache[path]) {{
      cache[path] = {{}};
      factories[path](cache[path], __require);
    }}
    return cache[path];
  }}
{defined}
  __require('{ENTRY}');
}})();"""

    html = f"""<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
{title}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap">
<style>
* {{ box-sizing: border-box; }}
body {{ margin: 0; }}
{css}
</style>
</head>
<body>
{body}
<script>
{runtime}
</script>
</body>
</html>
"""
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    print(f"만들었어요: {OUT.relative_to(ROOT)} ({len(modules)}개 모듈, {OUT.stat().st_size // 1024}KB)")


if __name__ == "__main__":
    build()
