export class SchemaValidators {
  public static ArrayMaxLength(limit: number) {
    return function (value: any[]) {
      return value.length <= limit;
    };
  }
}
