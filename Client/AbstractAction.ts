export abstract class AbstractAction {
  protected token: string;
  protected incrSequence: () => number;

  constructor(token: string, incrSequence: () => number) {
    this.token = token;
    this.incrSequence = incrSequence;
  }
}
