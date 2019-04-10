# CmTomlMode

A better TOML mode for Codemirror. The current mode offered by codemirror lacks
support for some features of TOML version 0.4 such as datetimes and inline
tables but also fails to correctly colour some of the more basic types.

You can obtain CmTomlMode via npm:

```bash
npm install @sgarciac/cm_toml_mode
```

of simply copying 
[dist/cm-toml-mode.js](https://raw.githubusercontent.com/sgarciac/cm-toml-mode/master/dist/cm-toml-mode.web.js)

 ... and writing something like this in your HTML:

```html
<link rel=stylesheet href="codemirror.css">
<script src="codemirror.js"></script>
<script src="cm-toml-mode.web.js"></script>
<script>

  CodeMirror.defineMode("bettertomlmode", CmTomlMode.tomlMode);
</script>

<style>
  .CodeMirror { height: auto; border: 1px solid #ddd; }
  .CodeMirror-scroll { max-height: 200px; }
  .CodeMirror pre { padding-left: 7px; line-height: 1.25; }
</style>

<form style="position: relative; margin-top: .5em;">
  <textarea id="demotext">
</textarea>
</form>
<script>
    var editor = CodeMirror.fromTextArea(document.getElementById("demotext"), {
      lineNumbers: true,
      mode: "bettertomlmode",
      matchBrackets: true
    });
</script>

```

You can see this mode in action [here](https://sgarciac.github.io/cm-toml-mode/)


