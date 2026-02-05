#!/usr/bin/env node
const args = process.argv.slice(2);
console.log('Raw args:', args);
console.log('args[0]:', args[0]);
console.log('args[1]:', args[1]);
console.log('args[2]:', args[2]);

const DEFAULT_SPEED = 1.0;
const speed = args[2] ? parseFloat(args[2]) : DEFAULT_SPEED;
console.log('Computed speed:', speed, typeof speed);

const body = {
  input: args[0] || 'test',
  voice: args[1] || 'am_puck',
  speed: speed
};
console.log('Body:', JSON.stringify(body, null, 2));
