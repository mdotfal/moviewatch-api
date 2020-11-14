function makeItemsArray() {
  return [
    {
      id: 1,
      title: 'test-title',
      isnetflix: true,
      ishulu: true,
      isprime: true,
      rating: "Watch"
    },
    {
      id: 2,
      title: 'test-title-2',
      isnetflix: true,
      ishulu: true,
      isprime: false,
      rating: "Watch"
    },
    {
      id: 3,
      title: 'test-title-3',
      isnetflix: true,
      ishulu: false,
      isprime: false,
      rating: "Skip"
    },
  ]
}

module.exports = {
  makeItemsArray,
}