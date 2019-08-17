
export class Arrays {

    public static copy<T>(array: T[]): T[] {

        const result: T[] = [];

        array.forEach(element => result.push(element));

        return result;
    }
}
