import { prepare, addVersion, parseMsg } from './fpe';
import { allVersions } from './secrets';

const CURRENT_VERSION = () => (allVersions.sort().slice(-1)[0]);

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('mybutton')?.addEventListener('click', saveVersion);
  document.getElementById('encryptButton')?.addEventListener('click', encrypt);
  document.getElementById('decryptButton')?.addEventListener('click', decrypt);
  document.getElementById('tab1')?.addEventListener('click', listVersions); // get fresh versions after add
  document.getElementById('tab2')?.addEventListener('click', listVersions); // get fresh versions after add
  document.getElementById('tab3')?.addEventListener('click', listVersions); // get fresh versions after add

  // stuff not inited yet
  setTimeout(() => {
    listVersions();
    setTimeout(() => {
      (document.getElementById('version_string') as HTMLSpanElement).innerHTML = `<i>Latest version: ${CURRENT_VERSION()}</i>`
    }, 1);
  }, 500);
})

function listVersions() {
  chrome.storage.sync.get('versions', ({ versions }) => {
    // versions tab
    (document.getElementById('version_list') as HTMLSelectElement).innerHTML = '';

    // Selecting the version to add
    const select = document.getElementById('version_select') as HTMLSelectElement;
    select.innerHTML = '';

    for (let version of allVersions) {
      const select = document.getElementById('version_select');

      const opt = document.createElement('option');
      opt.value = version.toString();
      opt.innerHTML = version.toString();

      select?.appendChild(opt);
    }

    for (let version of Object.entries<Record<string, string>>(versions)) {
      addVersion(+version[0], version[1].secret);
    }

    if (!versions) {
      (document.getElementById('version_list') as HTMLSelectElement).innerHTML += 'No owned versions. Please add one.';
      // return;
    }

    for (let i of allVersions) {
      if (Object.keys(versions).map(Number).includes(i)) {
        (document.getElementById('version_list') as HTMLSelectElement).innerHTML += `${i} ✔️`;
      } else {
        (document.getElementById('version_list') as HTMLSelectElement).innerHTML += `${i} ❌`;
      }
    }

  });
}

function showMessage(msg: string) {
  (document.getElementById('messages') as HTMLElement).innerHTML = msg
}

function saveVersion() {
  const version = Number.parseInt((document.getElementById('version_select') as HTMLInputElement).value);
  const secret = (document.getElementById('secret') as HTMLInputElement).value;

  if (!version) {
    showMessage('No version')
    return;
  }

  if (!secret) {
    showMessage('No secret')
    return;
  }

  chrome.storage.sync.get('versions', ({ versions }) => {
    chrome.storage.sync.set({
      versions: {
        ...versions,
        [version]: {
          secret
        }
      }
    });
  })

  listVersions();

  addVersion(version, secret);

  showMessage('Saved successfully');
}
function encrypt(this: HTMLElement, ev: MouseEvent) {
  try {
    // const version = (document.getElementById('version_select') as HTMLSelectElement).value

    const version = CURRENT_VERSION();

    const { encrypt } = prepare({ version });

    const input = (document.getElementById('inputText') as HTMLTextAreaElement).value
    const e = encrypt(input);

    (document.getElementById('encrypt_output') as HTMLTextAreaElement).innerHTML = e;
    (document.getElementById('encrypt_output') as HTMLTextAreaElement).classList.remove('hidden');

    showMessage(`Successfully created your message using ${CURRENT_VERSION()}`);
  } catch (err: any) {
    showMessage(err.message);
  }
}

function decrypt(this: HTMLElement, ev: MouseEvent) {
  try {
    (document.getElementById('decrypt_output') as HTMLTextAreaElement).innerHTML = '';

    const input = (document.getElementById('outputText') as HTMLTextAreaElement).value
    const { version } = parseMsg(input as `p${number} ${string}`);

    const { decrypt } = prepare({ version });

    const e = decrypt(input as `p${number} ${string}`)
      .replace('\n', '<br />'); //nl2br

    (document.getElementById('decrypt_output') as HTMLTextAreaElement).innerHTML = e;
    (document.getElementById('decrypt_output') as HTMLTextAreaElement).classList.remove('hidden');

    showMessage('Decryped the message. <a href="#?">Not what you expected?</a>');
  } catch (err: any) {
    showMessage(err.message);
  }
}
