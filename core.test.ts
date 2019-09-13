var sinon = require('sinon');

import {assert, expect} from "chai";


import {Connect, Emitter, GetSuitableIO, Receiver} from "./core";

let receiver = new Receiver();
let emitter = new Emitter();


describe('Task A Tests', function () {
    describe('GetSuitableIO(receiver,emitter,’surname’)', function () {
        it(`should return 
                [
                    ‘name’,
                    ‘getHello’’
                ]
        `, function () {
            assert.deepEqual(GetSuitableIO(receiver, emitter, 'surname'), ['name', 'getHello']);
        });
    });

    describe('GetSuitableIO(receiver,emitter,’log’)', function () {
        it(`should return 
                        [
                            'name',
                            'getHello'
                        ]

        `, function () {
            assert.deepEqual(GetSuitableIO(receiver, emitter, 'log'), ['name', 'getHello']);
        });
    });

    describe('GetSuitableIO(receiver,emitter,’increment’)', function () {
        it(`should return 
                        [
                            'getCount'
                        ]

        `, function () {
            assert.deepEqual(GetSuitableIO(receiver, emitter, 'increment'), ['getCount']);
        });
    });

       describe('GetSuitableIO(receiver,emitter,’incrementt’)', function () {
        it(`it should fail`, function () {

            try {
                GetSuitableIO(receiver, emitter, 'incrementt')
            }
            catch (e) {
                assert.equal(e.message, 'Undefined property: incrementt');
            }
        });
    });
});

let consoleSpy:any = null;

before(() => {

    consoleSpy = sinon.spy(console, 'log');
})

describe('Task B Tests', () => {

    describe('Connect(receiver,emitter,’surname’,’getHello’)', () => {
        it('should set surname field of receiver as ‘Hello’', () => {

            Connect(receiver, emitter, 'surname', 'getHello');

            assert.equal(receiver.surname, 'Hello');
        })
    })

    describe('Connect(receiver,emitter,’log’,’getHello’)', () => {
        it('should print ‘Hello’ in console', () => {

            Connect(receiver, emitter, 'log', 'getHello');

            expect(consoleSpy.calledWith('Hello')).to.be.true;
        })
    })

    describe('Connect(receiver,emitter,’increment,’getCount’)', () => {
        it('should print ‘4’ in console', () => {

            Connect(receiver, emitter, 'increment', 'getCount');

            expect(consoleSpy.calledWith(4)).to.be.true;
        })
    })

     describe('Connect(receiver,emitter,’increment,’getHello’)', () => {
        it('should fail because there are no connection', () => {

            try {
                Connect(receiver, emitter, 'increment', 'getHello');
            }
            catch (e) {
                assert.equal(e.message, 'There no connection between: increment and getHello');
            }

        })
    })
});