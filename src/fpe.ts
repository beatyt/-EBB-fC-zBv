import { createHmac } from 'crypto';

const digits = new Set('1234567890'.split(''));
const letters = new Set('abcdefghijklmnopqrstuvwxyz'.split(''));
const uppercase = new Set('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
const symbols = new Set('!@#$%^&*()[]+,-./:;<=>?\\\'\" \n\t'.split(''));
const special = new Set('“”‘’é'.split(''));

const domain = [...digits, ...letters, ...uppercase, ...symbols, ...special];

const VERSIONS: Array<string> = [];
let CURRENT_VERSION = () => (VERSIONS.length - 1);

const encTable: Record<string, string> = {};
const decTable: Record<string, string> = {};

type P = `p${number} ${string}`;

// user supplies the secret they think it is for the version
function addVersion(version: number, secret: string) {
  VERSIONS[version] = secret;
}

/**
 * If you encrypt using a bad secret, others will identify you
 * 
 * @param param0 
 * @returns 
 */
function prepare({ version }: { version: number }) {
  if (!VERSIONS[version]) {
    throw new Error(`No secret for the version ${version}. Please obtain the secret and save it for this number`)
  }

  const secret = VERSIONS[version];

  function enc(text: string) {
    return createHmac('sha256', secret).update(text).digest('hex');
  }

  // create a permutation of domain
  const sorted = domain
    .map((c) => c)
    .sort((c1, c2) => enc(c1).localeCompare(enc(c2)));

  // builds the table for lookups from enc to enc using secret
  for (let i = 0; i < domain.length; i++) {
    encTable[domain[i]] = sorted[i];
    decTable[sorted[i]] = domain[i];
  }

  return { encrypt, decrypt }
}

function validate(text: string, result: string) {
  if (text.length !== result.length) {
    throw new Error(
      `some of the input characters are not in the cipher's domain: [${domain}]`
    );
  }
}

function encrypt(text: string): P {
  const encrypted = text
    .split('')
    .map((c) => encTable[c])
    .join('');

  validate(text, encrypted);

  return `p${CURRENT_VERSION()} ${encrypted}`;
}

function parseMsg(text: P) {
  const r = new RegExp('(p(\[0-9\]+) )(.*)', 'g');
  const f = text.matchAll(r);

  const a = f.next();
  const { prefix, version, msg }: { prefix: string, version: number, msg: string } = {
    prefix: a.value[1],
    version: a.value[2],
    msg: a.value[3]
  };

  return {
    prefix, version, msg
  }
}

function decrypt(text: P) {
  const { prefix, version, msg } = parseMsg(text);

  const decrypted = msg
    .split('')
    .map((c) => decTable[c])
    .join('');

  validate(msg, decrypted);

  return decrypted;
}

export {
  addVersion,
  parseMsg,
  prepare,
  CURRENT_VERSION,
};

