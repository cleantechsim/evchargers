
export class Color {

    public static readonly MAX_COLORS = 5;

    private static LIGHT_GREEN: Color;
    private static LIGHT_BLUE: Color;

    private static DARK_GREEN: Color;
    private static DARK_BLUE: Color;

    private static LIGHT_RED: Color;

    public static GREY: Color;

    private static COLORS: Color[];

    private static initialize() {

        if (Color.COLORS == null) {

            Color.LIGHT_GREEN = new Color(0x00, 0xFF, 0x00);
            Color.LIGHT_BLUE = new Color(0x00, 0xC0, 0xE0);
            Color.DARK_GREEN = new Color(0x00, 0xAA, 0x00);
            Color.DARK_BLUE = new Color(0x00, 0x60, 0xAA0);
            Color.LIGHT_RED = new Color(0xFF, 0xA0, 0xA0);
            Color.GREY = new Color(0xA0, 0xA0, 0xA0);

            Color.COLORS = [
                Color.LIGHT_GREEN,
                Color.LIGHT_BLUE,
                Color.DARK_GREEN,
                Color.DARK_BLUE,
                Color.LIGHT_RED
            ];
        }

        if (Color.COLORS.length < Color.MAX_COLORS) {
            throw new Error('Not enough colors');
        }
    }

    public static color(index: number): Color {

        this.initialize();

        if (index >= this.MAX_COLORS) {
            throw new Error('Outside of range');
        }

        return this.COLORS[index];
    }

    constructor(private red: number, private green: number, private blue: number) {

    }

    get r(): number {
        return this.red;
    }

    get g(): number {
        return this.green;
    }

    get b(): number {
        return this.blue;
    }
}

