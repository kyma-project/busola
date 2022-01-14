console.log('jakis worker');

// eslint-disable-next-line no-restricted-globals
self.onmessage($ev => {
  console.log('hehe', $ev);
});
