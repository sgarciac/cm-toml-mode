# CmTomlMode

A better TOML mode for Codemirror. The current mode offered by codemirror lacks
support for some features of TOML version 4.0 such as datetimes and inline
tables but also fails to correctly colour some of the more basic types.

You can obtain CmTomlMode via npm:

```bash
npm install @sgarciac/cm_toml_mode
```

of simply copy
[dist/cm-toml-mode.js](https://raw.githubusercontent.com/sgarciac/cm-toml-mode/master/dist/cm-toml-mode.js)

and writing something like this in your HTML:

```html
<link rel=stylesheet href="codemirror.css">
<script src="codemirror.js"></script>
<script src="cm-toml-mode.js"></script>
<script>

  CodeMirror.defineMode("sergiomode", CmTomlMode.tomlMode);
</script>
```

You can see this mode in action (here)[https://sgarciac.github.io/cm-toml-mode/]


