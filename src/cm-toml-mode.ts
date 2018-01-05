import * as CodeMirror from "codemirror";

enum NewLine {
    ERROR,
    POP
};

enum Space {
    SKIP,
    ONLY_CLOSING_LINE
};

enum PopMode {
    CONSUME_TOKEN,
    LEAVE_TOKEN
}


interface Matcher {
    matcher: string | RegExp,
    style: string,
    pushmode?: string,
    popmode?: PopMode
}

interface CmTomlState {
    lexer_states_stack: LexerState[],
    currentMatcher: () => Matcher,
    popMatcher: () => Matcher,
    pushMatcher: (Matcher) => number,
    readNext: (stream) => string
}

interface LexerState {
    eatSpace?: Space,
    newLine?: NewLine,
    comment?: string,
    patterns: Matcher[]
}

function makeStates<T extends { [name: string]: LexerState }>(states: T): T {
    return states
}

// Complex regex's
var escaped_char_regex = /^((\\b)|(\\t)|(\\n)|(\\f)|(\\")|(\\r)|(\\\\))/;
var escaped_unicode_regex = /^((\\u([0-9A-Fa-f]{4}))|(\\U([0-9A-Fa-f]{8})))/;
var offset_datetime_regex = /^(-?\d{4}-\d{2}-\d{2}(t|\s)\d{2}:\d{2}:\d{2}(\.\d+)?(z|([-+]\d{2}:\d{2})))/i;
var local_datetime_regex = /^(-?\d{4}-\d{2}-\d{2}(t|\s)\d{2}:\d{2}:\d{2}(\.\d+)?)/i;
var local_date_regex = /^(-?\d{4}-\d{2}-\d{2})/i;
var local_time_regex = /^(\d{2}:\d{2}:\d{2}(\.\d+)?)/i;
var float_regex = /^([+-]?(\d_|_\d|\d)+)(((\.(\d_|_\d|\d)+)([Ee]([+-])?(\d_|_\d|\d)+))|((\.(\d_|_\d|\d)+)|([Ee]([+-])?(\d_|_\d|\d)+)))/;
var integer_regex = /^([+-]?(\d_|_\d|\d)+)/;

// common matchers
var string_escape_matchers: Matcher[] = [
    { matcher: escaped_char_regex, style: "string" },
    { matcher: escaped_unicode_regex, style: "string" },
];

var atomic_value_matchers: Matcher[] = [
    { matcher: "\"\"\"", style: "string", pushmode: "basic_string_multi_line" },
    { matcher: "\"", style: "string", pushmode: "basic_string" },
    { matcher: "'''", style: "string", pushmode: "literal_string_multi_line" },
    { matcher: "'", style: "string", pushmode: "literal_string" },
    { matcher: offset_datetime_regex, style: "builtin" }, // offset datetime
    { matcher: local_datetime_regex, style: "builtin" }, // local datetime
    { matcher: local_date_regex, style: "builtin" }, // local date
    { matcher: local_time_regex, style: "builtin" }, // local time
    { matcher: float_regex, style: "number" }, // float
    { matcher: integer_regex, style: "number" }, // integer
    { matcher: /^(true|false)/, style: "number" } // boolean
];

var top_table_identifiers: Matcher[] = [
    { matcher: /^[A-Za-z0-9_-]+/, style: "keyword" }, //identifier
    { matcher: "\"", style: "keyword", pushmode: "basic_identifier_string" },
    { matcher: "'", style: "keyword", pushmode: "literal_identifier_string" },
    { matcher: ".", style: "punctuation" },
]

var matchers: { [name: string]: LexerState } = {
    top: {
        eatSpace: Space.SKIP,
        comment: "#",
        patterns: [
            { matcher: "[[", style: "bracket", pushmode: "table_array_item" },
            { matcher: "[", style: "bracket", pushmode: "table_array" },
            { matcher: /^[A-Za-z0-9_-]+/, style: "keyword" },
            { matcher: "\"", style: "keyword", pushmode: "basic_identifier_string" },
            { matcher: "'", style: "keyword", pushmode: "literal_identifier_string" },
            { matcher: /=\s*/, style: "punctuation", pushmode: "value" }
        ]
    },
    basic_identifier_string: {
        newLine: NewLine.ERROR,
        patterns: [
            { matcher: "\"", style: "keyword", popmode: PopMode.CONSUME_TOKEN },
            { matcher: escaped_char_regex, style: "keyword" },
            { matcher: escaped_unicode_regex, style: "keyword" },
            { matcher: /^[^\\"]+/, style: "keyword" }
        ]
    },
    literal_identifier_string: {
        newLine: NewLine.ERROR,
        patterns: [
            { matcher: "'", style: "keyword", popmode: PopMode.CONSUME_TOKEN },
            { matcher: /^[^']+/, style: "keyword" }
        ]
    },
    literal_string: {
        newLine: NewLine.ERROR,
        patterns: [
            { matcher: "'", style: "string", popmode: PopMode.CONSUME_TOKEN },
            { matcher: /^[^']+/, style: "string" }
        ]
    },
    basic_string: {
        newLine: NewLine.ERROR,
        patterns: [
            { matcher: "\"", style: "string", popmode: PopMode.CONSUME_TOKEN },
            ...string_escape_matchers,
            { matcher: /^[^\\"]+/, style: "string" }
        ]
    },
    basic_string_multi_line: {
        patterns: [
            { matcher: "\"\"\"", style: "string", popmode: PopMode.CONSUME_TOKEN },
            ...string_escape_matchers,
            { matcher: /^(\\\s*)$/, style: "string" },
            { matcher: /^([^\\"]|"(?!""))+/, style: "string" }
        ]
    },
    literal_string_multi_line: {
        patterns: [
            { matcher: "'''", style: "string", popmode: PopMode.CONSUME_TOKEN },
            { matcher: /^([^']+|'(?!''))+/, style: "string" }
        ]
    }
    ,
    table_array: {
        eatSpace: Space.SKIP,
        newLine: NewLine.ERROR,
        patterns: [
            ...top_table_identifiers,
            { matcher: "]", style: "bracket", popmode: PopMode.CONSUME_TOKEN }
        ]
    },
    table_array_item: {
        eatSpace: Space.SKIP,
        newLine: NewLine.ERROR,
        patterns: [
            ...top_table_identifiers,
            { matcher: "]]", style: "bracket", popmode: PopMode.CONSUME_TOKEN }
        ]
    },
    value: {
        newLine: NewLine.POP,
        eatSpace: Space.ONLY_CLOSING_LINE,
        comment: "#",
        patterns: [
            ...atomic_value_matchers,
            { matcher: "[", style: "bracket", pushmode: "array" },
            { matcher: "{", style: "bracket", pushmode: "inner_table" }
        ]
    },
    array: {
        eatSpace: Space.SKIP,
        comment: "#",
        patterns: [
            ...atomic_value_matchers,
            { matcher: "{", style: "bracket", pushmode: "inner_table" },
            { matcher: "[", style: "bracket", pushmode: "array" },
            { matcher: ",", style: "punctuation" },
            { matcher: "]", style: "bracket", popmode: PopMode.CONSUME_TOKEN }
        ]
    },
    inner_table: {
        eatSpace: Space.SKIP,
        comment: "#",
        patterns: [
            { matcher: /^[A-Za-z0-9_-]+/, style: "keyword" },
            { matcher: "\"", style: "keyword", pushmode: "basic_identifier_string" },
            { matcher: "'", style: "keyword", pushmode: "literal_identifier_string" },
            { matcher: /=\s*/, style: "punctuation", pushmode: "inner_table_value" },
            { matcher: "}", style: "bracket", popmode: PopMode.CONSUME_TOKEN }
        ]
    },
    inner_table_value: {
        eatSpace: Space.SKIP,
        patterns: [
            ...atomic_value_matchers,
            { matcher: "[", style: "bracket", pushmode: "array" },
            { matcher: "{", style: "bracket", pushmode: "inner_table" },
            { matcher: "}", style: "bracket", popmode: PopMode.LEAVE_TOKEN },
            { matcher: ",", style: "bracket", popmode: PopMode.CONSUME_TOKEN }
        ]
    }
}

export var tomlMode: CodeMirror.ModeFactory<CmTomlState> = function(config) {
    return {
        startState: function() {
            return {

                lexer_states_stack: [matchers.top],

                currentMatcher: function() {
                    return this.lexer_states_stack[this.lexer_states_stack.length - 1];
                },

                popMatcher: function() {
                    return this.lexer_states_stack.pop();
                },

                pushMatcher: function(matcherName) {
                    return this.lexer_states_stack.push(matchers[matcherName]);
                },

                readNext: function(stream: CodeMirror.StringStream) {
                    let matcher = this.currentMatcher();
                    // HANDLE NEW LINES
                    if ((matcher.newLine === NewLine.ERROR) && stream.sol()) {
                        stream.skipToEnd();
                        return "error strikethrough";
                    }

                    if ((matcher.newLine === NewLine.POP) && stream.sol()) {
                        this.popMatcher();
                        return this.readNext(stream);
                    }

                    if (matcher.eatSpace === Space.SKIP && stream.eatSpace()) {
                        return null;
                    }

                    if (matcher.comment) {
                        if (stream.match(new RegExp(`\\s*${matcher.comment}.*`), false)) {
                            stream.skipToEnd();
                            return "comment";
                        }
                    }

                    if (matcher.eatSpace === Space.ONLY_CLOSING_LINE && stream.peek() && stream.peek().match(/\s/)) {
                        if (stream.match(/\s+[^\s]/, false)) {
                            stream.skipToEnd();
                            return "error strikethrough";
                        } else {
                            stream.skipToEnd();
                            return null;
                        }
                    }

                    for (let pattern of matcher.patterns) {
                        let consumeToken = pattern.popmode !== PopMode.LEAVE_TOKEN;
                        let matched = stream.match(pattern.matcher, consumeToken);
                        if (matched) {
                            if (pattern.popmode === PopMode.CONSUME_TOKEN || pattern.popmode === PopMode.LEAVE_TOKEN) {
                                this.popMatcher();
                            }
                            if (pattern.pushmode) {
                                this.pushMatcher(pattern.pushmode);
                            }
                            return pattern.style;
                        }
                    }
                    stream.next();
                    return "error strikethrough";
                }
            }
        },
        token: function(stream, state) {
            return state.readNext(stream);
        }
    }
};
