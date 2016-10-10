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

var midiTypes = {
    '8': 'noteoff',
    '9': 'noteon',
    '10': 'polyat',
    '11': 'controlchange',
    '12': 'programchange',
    '13': 'channelat',
    '14': 'pitchbend'
};

var midiCharacteristic = new Characteristic({
    uuid: midiCharacteristicUUID, // or 'fff1' for 16-bit
    properties: ['write', 'writeWithoutResponse', 'notify', 'read'], // can be a combination of 'read', 'write', 'writeWithoutResponse', 'notify', 'indicate'
    secure: ['write', 'notify', 'read'], // enable security for properties, can be a combination of 'read', 'write', 'writeWithoutResponse', 'notify', 'indicate'
    //value: null, // optional static value, must be of type Buffer - for read only characteristics
    descriptors: [
        // see Descriptor for data type
    ],
    onReadRequest: function(offset, callback) {
      console.log('onReadRequest');
      callback(this.RESULT_SUCCESS); // optional read request handler, function(offset, callback) { ... }
    },
    onWriteRequest: function(data, offset, withoutResponse, callback) {
      console.log(`onWriteRequest data: ${data.toString('hex')}, ${offset}, ${withoutResponse}`);
      var header = data[0];
      var timestamp = data[1];
      var status = data[2];
      var byte1 = data[3];
      var byte2 = data[4];

      var channel = (status & 0xF) + 1;
      var type = midiTypes[status >> 4];

      console.log(`type: ${type} channel: ${channel} data1: ${byte1} data2: ${byte2}`);
    }, // optional write request handler, function(data, offset, withoutResponse, callback) { ...}
    onSubscribe: function(maxValueSize, updateValueCallback) {
      console.log(`onSubscribe: ${maxValueSize}`);
    }, // optional notify/indicate subscribe handler, function(maxValueSize, updateValueCallback) { ...}
    onUnsubscribe: function(){
      console.log('onUnsubscribe');
    }, // optional notify/indicate unsubscribe handler, function() { ...}
    onNotify: function(){
      console.log('onNotify');
    }, // optional notify sent handler, function() { ...}
    onIndicate: function(){
      console.log('onIndicate');
    } // optional indicate confirmation received handler, function() { ...}
});

var midiService = new PrimaryService({
    uuid: midiServiceUUID, // or 'fff0' for 16-bit
    characteristics: [midiCharacteristic]
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

bleno.on('accept', function(clientAddress) {
    console.log("Accepted connection from address: " + clientAddress);
});

bleno.on('disconnect', function(clientAddress) {
    console.log("Disconnected from address: " + clientAddress);
});
