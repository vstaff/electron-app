import { HashNodeConstructor } from "../../util";
import Key from "./Key";
import Value from "./Value";
import { Status } from "../../util";

export default class HashNode {
  public key?: Key;
  public value?: Value;
  public status?: Status;
  public initialHash?: number;
  public secondaryHash?: number;
  // public originRow?: number;

  constructor({ key, value, initialHash, secondaryHash, status, }: HashNodeConstructor) {
    this.key = key;
    this.value = value;
    this.status = status ?? Status.FREE;
    this.initialHash = initialHash;
    this.secondaryHash = secondaryHash;
    // this.originRow = originRow;
  }
}