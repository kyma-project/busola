self.onmessage = async $event => {
  console.log(23132333);
  console.log($event);
};

function incApple(countApple) {
  const start = Date.now();
  while (Date.now() < start + 5000) {}
  return countApple + 1;
}
