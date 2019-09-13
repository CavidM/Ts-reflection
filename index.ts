mocha.setup('bdd');

(async function () {

  await import('./core.test');
  mocha.run();

})();
