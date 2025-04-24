// utils/crypto.js (you'll eventually move encryption logic here with sodium)
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";

/**
 * Generates a Curve25519 key pair.
 * @returns {{ publicKey: Uint8Array, secretKey: Uint8Array }}
 */
export function generateKeyPair() {
  const keyPair = nacl.box.keyPair();
  return {
    publicKey: keyPair.publicKey,
    secretKey: keyPair.secretKey,
  };
}

export const encodeBase64 = naclUtil.encodeBase64;
export const decodeBase64 = naclUtil.decodeBase64;
export const encodeUTF8 = naclUtil.encodeUTF8;
export const decodeUTF8 = naclUtil.decodeUTF8;
