mocha.setup('bdd');

(async function () {

  await import('./src/test/core.test');
  mocha.run();

})();
