import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  it('returns the root view model', () => {
    const appController = new AppController(new AppService());
    expect(appController.root()).toEqual({ message: 'Hello world!' });
  });
});
