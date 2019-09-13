mocha.setup('bdd');

(async function () {

  await import('test/core.test');
  mocha.run();

})();
