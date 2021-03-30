export abstract class AbstractHandler {
  protected token: string;
  protected incrSequence: () => number;

  constructor(token: string, incrSequence: () => number) {
    this.token = token;
    this.incrSequence = incrSequence;
  }
}
