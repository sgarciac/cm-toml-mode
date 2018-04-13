/// <reference types="codemirror" />
import * as CodeMirror from "codemirror";
export declare enum NewLine {
    ERROR = 0,
    POP = 1,
}
export declare enum Space {
    SKIP = 0,
    ONLY_CLOSING_LINE = 1,
}
export declare enum PopMode {
    CONSUME_TOKEN = 0,
    LEAVE_TOKEN = 1,
}
export interface Matcher {
    matcher: string | RegExp;
    style: string;
    pushmode?: string;
    popmode?: PopMode;
}
export interface CmTomlState {
    lexer_states_stack: LexerState[];
    currentMatcher: () => Matcher;
    popMatcher: () => Matcher;
    pushMatcher: (Matcher) => number;
    readNext: (stream) => string;
}
export interface LexerState {
    eatSpace?: Space;
    newLine?: NewLine;
    comment?: string;
    patterns: Matcher[];
}
export declare var tomlMode: CodeMirror.ModeFactory<CmTomlState>;
