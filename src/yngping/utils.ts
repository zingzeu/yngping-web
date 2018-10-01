import { Composition } from "../ui/candidateWindowState";

const regex = /\{([a-z,]*)\}([a-z]*)(=>(.*))?/;

export function parseRimeComposition(str: string): Composition {
    const tokens = str.split('|');
    return new Composition(tokens.map(token => {
        const matches = regex.exec(token);
        const type = matches[1];
        const input = matches[2];
        const output = matches[4];
        if (type.includes("partial")) {
            return output;
        } else {
            return input;
        }
    }).join(""), 0);
}