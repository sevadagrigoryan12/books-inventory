import 'config/environment/variables';

describe('apiEnvironment', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should throw when there is a validation error', () => {
    jest.doMock('config/environment/variables', () => ({
      notValidKey: 'notValidKey',
    }));

    expect(() => {
      require('config/environment/api');
    }).toThrowError();
  });
});
