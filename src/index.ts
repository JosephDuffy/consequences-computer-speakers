import { Addon, AddonInitialiser, Condition, ConditionInput, UserInput, UserInputType, Variable } from 'consequences/addons';

import { EventEmitter } from 'events';
import * as loudness from 'loudness';

export default class ComputerSpeakersInitialiser implements AddonInitialiser {

  public readonly metadata = {
    name: 'Computer Speakers',
    description: 'Provides a variable that allows for the computer\'s volume to be queried and updated',
    supportsMultipleInstances: false,
  };

  public createInstance(metadata: Addon.Metadata): Promise<ComputerSpeakersAddon> {
    return Promise.resolve(new ComputerSpeakersAddon(metadata));
  }

}

export class ComputerSpeakersAddon implements Addon {

  public readonly metadata: Addon.Metadata;

  private speakers: Speakers;

  constructor(metadata: Addon.Metadata) {
    this.metadata = metadata;
    this.speakers = new Speakers();
  }

  public async loadVariables(): Promise<Variable[]> {
    return [
      this.speakers,
    ];
  }

}

class Speakers extends EventEmitter implements Variable {

  public readonly uniqueId = 'speakers_volume';

  public readonly name = 'Computer Speakers Volume';

  public async retrieveValue(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      loudness.getVolume((error?: Error, volume?: number) => {
        if (error) {
          return reject(error);
        }

        resolve(volume);
      });
    });
  }

  public addChangeEventListener(listener: () => void) {
    super.addListener('valueChanged', listener);
  }

  public removeChangeEventListener(listener: () => void) {
    super.removeListener('valueChanged', listener);
  }

  public async updateValue(newValue: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (typeof newValue !== 'number') {
        throw new Error(`Volume parameter must be a number`);
      }

      if (newValue < 0 || newValue > 100) {
        throw new Error(`Volume value must be between 0 and 100`);
      }

      loudness.setVolume(newValue, (error?: Error) => {
        if (error) {
          return reject(error);
        }

        resolve();
        this.emit('valueChanged');
      });
    });
  }

}
