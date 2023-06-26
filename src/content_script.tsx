
import { prepare, addVersion, parseMsg } from './fpe';

document.body.addEventListener('click', () => {
  parsePage();
  parseNodes();
})

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    load();
  });

let retries = [1000, 1000, 1000, 3000, 10000];
let c = 0;

const retry = (fn: any) => {
  if (c > retries.length - 1) {
    throw new Error('exceeded retries');
  }

  setTimeout(() => {
    try {
      fn();
    } catch (e) {
      c++;
      retry(fn);
    }
  }, retries[c]);
}

let nodes: XPathResult;

// parsing pages
const parsePage = () => {
  // get the nodes
  nodes = document.evaluate(
    "//span[text()[contains(.,'p1')]]",
    document,
    null,
    XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
    null
  );
}

const parseNodes = () => {
  // parse the nodes
  let node = null;
  while (node = nodes.iterateNext()) {
    handleMsg(node as HTMLElement);
  }
}

const load = () => {
  setTimeout(() => {
    retry(() => {
      parsePage();
      parseNodes();
    });
  }, 1000);
}

load();

function handleMsg(n: HTMLElement) {
  const { version } = parseMsg(n.innerText as `p${number} ${string}`);

  chrome.storage.sync.get('versions', ({ versions }) => {
    addVersion(version, versions[version].secret);

    const { decrypt } = prepare({ version });

    const e = decrypt(n.innerText as `p${number} ${string}`)
      .replace('\n', '<br />'); //nl2br

    n.innerHTML = `
    ${e} 
    
    <i style="font-size: xx-small; float: right">this was decrypted by the extension using version: ${version}</i>
    `;
  });
}
