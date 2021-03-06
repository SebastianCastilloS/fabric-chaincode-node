/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/
/* global describe it */

const ecdsaKey = require('../lib/ecdsa-key.js');

const jsrsa = require('jsrsasign');
const KEYUTIL = jsrsa.KEYUTIL;

const chai = require('chai');
const expect = chai.expect;

describe('ECDSA Key', () => {

    it ('should throw an error when missing key parameter', () => {
        expect(() => {
            new ecdsaKey();
        }).to.throw(/The key parameter is required by this key class implementation, whether this instance is for the public key or private key/);
    });

    it ('should throw an error when key does not have type property', () => {
        expect(() => {
            new ecdsaKey('dummy private key');
        }).to.throw(/This key implementation only supports keys generated by jsrsasign.KEYUTIL. It must have a "type" property of value "EC"/);
    });

    it ('should throw an error when key does not have type property value of EC', () => {
        expect(() => {
            new ecdsaKey({type: 'RSA'});
        }).to.throw(/This key implementation only supports keys generated by jsrsasign.KEYUTIL. It must have a "type" property of value "EC"/);
    });

    it ('should throw an error when prvKeyHex missing', () => {
        expect(() => {
            new ecdsaKey({type: 'EC'});
        }).to.throw(/This key implementation only supports keys generated by jsrsasign.KEYUTIL. It must have a "prvKeyHex" property/);
    });

    it ('should throw an error when pubKeyHex missing', () => {
        expect(() => {
            new ecdsaKey({type: 'EC', prvKeyHex: null});
        }).to.throw(/This key implementation only supports keys generated by jsrsasign.KEYUTIL. It must have a "pubKeyHex" property/);
    });

    it ('should throw an error when pubKeyHex null', () => {
        expect(() => {
            new ecdsaKey({type: 'EC', prvKeyHex: null, pubKeyHex: null});
        }).to.throw(/This key implementation only supports keys generated by jsrsasign.KEYUTIL. It must have a "pubKeyHex" property/);
    });

    it ('should set the value of _key when valid key passed', () => {
        const key = {type: 'EC', prvKeyHex: null, pubKeyHex: 'some random value'};
        const myEcdsaKey = new ecdsaKey(key);

        expect(myEcdsaKey._key).to.deep.equal(key);
    });

    describe('isPrivate', () => {
        it ('should return true when _key has prvKeyHex', () => {
            const myEcdsaKey = new ecdsaKey({type: 'EC', prvKeyHex: 'some random value', pubKeyHex: 'some random value'});

            expect(myEcdsaKey.isPrivate()).to.deep.equal(true);
        });

        it ('should return false when _key prvKeyHex is null', () => {
            const myEcdsaKey = new ecdsaKey({type: 'EC', prvKeyHex: null, pubKeyHex: 'some random value'});
            expect(myEcdsaKey.isPrivate()).to.deep.equal(false);
        });
    });

    describe('getPublicKey', () => {
        it ('should return the instance for public key', () => {
            const myEcdsaKey = new ecdsaKey(KEYUTIL.generateKeypair('EC', 'secp256r1').pubKeyObj);
            expect(myEcdsaKey.getPublicKey()).to.deep.equal(myEcdsaKey);
        });

        it ('should return a public key from ECDSA if using private key', () => {
            const key = KEYUTIL.generateKeypair('EC', 'secp256r1').prvKeyObj;
            const myEcdsaKey = new ecdsaKey(key);

            const publicKey = myEcdsaKey.getPublicKey();

            expect(publicKey).to.not.equal(myEcdsaKey);
            expect(publicKey._key.isPublic).to.deep.equal(true);
            expect(publicKey._key.isPrivate).to.deep.equal(false);
            expect(publicKey._key.prvKeyHex).to.be.null;
            expect(publicKey._key.pubKeyHex).to.deep.equal(key.pubKeyHex);
        });
    });

    describe('toBytes', () => {
        it ('should return private key', () => {
            const myEcdsaKey = new ecdsaKey(KEYUTIL.generateKeypair('EC', 'secp256r1').prvKeyObj);
            expect(myEcdsaKey.toBytes()).to.match(/(-----\s*BEGIN PRIVATE KEY?[^-]+?-----)([\s\S]*)(-----\s*END PRIVATE KEY?[^-]+?-----)/);
        });

        it ('should return public key', () => {

            const myEcdsaKey = new ecdsaKey(KEYUTIL.generateKeypair('EC', 'secp256r1').pubKeyObj);
            expect(myEcdsaKey.toBytes()).to.match(/(-----\s*BEGIN PUBLIC KEY?[^-]+?-----)([\s\S]*)(-----\s*END PUBLIC KEY?[^-]+?-----)/);
        });
    });
});
