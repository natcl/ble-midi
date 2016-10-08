#!/usr/local/bin/node

'use strict';
const os = require('os');
const bleno = require('bleno');
const PrimaryService = bleno.PrimaryService;
const Characteristic = bleno.Characteristic;

const hostname = os.hostname();
const serviceName = `${hostname} MIDI`;

const midiServiceUUID = '03b80e5aede84b33a7516ce34ec4c700';
const midiCharacteristicUUID = '7772e5db38684112a1a9f2669d106bf3';

var midiCharacteristic = new Characteristic({
    uuid: midiCharacteristicUUID, // or 'fff1' for 16-bit
    properties: ['read', 'write', 'notify'], // can be a combination of 'read', 'write', 'writeWithoutResponse', 'notify', 'indicate'
    secure: ['read', 'write', 'notify'], // enable security for properties, can be a combination of 'read', 'write', 'writeWithoutResponse', 'notify', 'indicate'
    //value: null, // optional static value, must be of type Buffer - for read only characteristics
    descriptors: [
        // see Descriptor for data type
    ],
    onReadRequest: null, // optional read request handler, function(offset, callback) { ... }
    onWriteRequest: null, // optional write request handler, function(data, offset, withoutResponse, callback) { ...}
    onSubscribe: null, // optional notify/indicate subscribe handler, function(maxValueSize, updateValueCallback) { ...}
    onUnsubscribe: null, // optional notify/indicate unsubscribe handler, function() { ...}
    onNotify: null, // optional notify sent handler, function() { ...}
    onIndicate: null // optional indicate confirmation received handler, function() { ...}
});

var midiService = new PrimaryService({
    uuid: midiServiceUUID, // or 'fff0' for 16-bit
    characteristics: [
        midiCharacteristic
    ]
});

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising(serviceName, [midiServiceUUID]);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    console.log('Setting MIDI Service');
    bleno.setServices([midiService]);
  }
});

console.log('hello');
