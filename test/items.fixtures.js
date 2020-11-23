function makeItemsArray() {
  return [
    {
      id: 1,
      title: 'test-title',
      is_netflix: true,
      is_hulu: true,
      is_prime: true,
      rating: "Watch"
    },
    {
      id: 2,
      title: 'test-title-2',
      is_netflix: true,
      is_hulu: true,
      is_prime: false,
      rating: "Watch"
    },
    {
      id: 3,
      title: 'test-title-3',
      is_netflix: true,
      is_hulu: false,
      is_prime: false,
      rating: "Skip"
    },
  ];
};

module.exports = {
  makeItemsArray,
};