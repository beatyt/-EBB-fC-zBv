import { prepare, addVersion } from './fpe';

const run = () => {
  testEncrypt();
  testDecrypt();

  function testEncrypt() {
    addVersion(0, 'secret');
    const { encrypt } = prepare({ version: 0 });
    const e = encrypt('Hello world');
    console.log(e);
  }

  function testDecrypt() {
    addVersion(0, 'secret');
    const { decrypt } = prepare({ version: 0 });
    console.log(decrypt('p0 qjSS;M8;ESR'));
  }
}

export { run };

