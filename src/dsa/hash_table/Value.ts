export default class Value {
  public classCode: string;

  constructor(classCode: string) {
    if (!Value.validate(classCode)) {
      throw new Error(`Invalid class format: "${classCode}"`);
    }
    this.classCode = classCode;
  }

  // Формат NL, где N - число 1..11, L - буква из АБВГ
  static validate(code: string): boolean {
    return /[1-9][АБВГ]/.test(code) || /11[АБВГ]/.test(code) || /10[АБВГ]/.test(code);
  }
}