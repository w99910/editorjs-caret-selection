# EditorJs Caret Selection

> Note: I found out that the caret position is sometimes incorrect in some devices. I will figure out the solution. Let me know if you have idea or solution on it. 

Effortlessly track and simulate caret movements across any device. In real-time collaboration tools like Notion or Google Docs, you've likely noticed a caret indicating when another user is editing or viewing the same document.

I developed this feature because, as of this writing, the official EditorJs has not yet implemented it. Feel free to use, customize, and configure it to suit your needs. Cheers! 🥂🥂

![Demo](https://github.com/w99910/editorjs-caret-selection/raw/refs/heads/master/assets/demo.gif)

## Table Of Contents

- Installation
- Usage
- Realtime Caret Approach
- Bugs
- License
- Support

## Installation

- ### NPM

```bash
npm i editorjs-caret-selection
```

```js
import CaretSelection from 'editorjs-caret-selection'
```

- ### Github ESM module

```js
import CaretSelection from 'https://github.com/w99910/editorjs-caret-selection/blob/master/dist/editorjs-caret-selection.js'
```

- ### Github CJS

```js
const CaretSelection = require('https://github.com/w99910/editorjs-caret-selection/blob/master/dist/editorjs-caret-selection.cjs')
```

## Usage

- ### Initialization

First initialize the class with your editorjs object, unique id, display name. 

```js
let editor = new EditorJS({
    ...
});

let caretSelection = new CaretSelection(editor, 'my-unique-id', 'Thomas');
```

You can pass HTMLElement to display parameter.

```js
let display = document.createElement('span');
display.style.background = 'red';
display.style.padding = '0px 4px';
display.style.fontSize = '10px'
display.textContent = 'Thomas';

let caretSelection = new CaretSelection(editor, 'my-unique-id', display);
```

- ### Listen Event

Once it is initialised, the `selectionChange` event is listened. Register your custom function when that event is triggered.

```js
caretSelection.onChange(function(caret){
    console.log(caret);
})
```

`caret` object contains the following attributes.
```js
type Caret = {
    id: string | number,
    display: string | HTMLElement,
    blockIndex: number,
    startOffset: number,
    endOffset: number,
    caretStyle?: object,
    selectionBoxStyle?: object,
}
```

- ### Show Caret Selection
In order to show caret, use `showSelection` method by passing `caret` object.

```js
caretSelection.showSelection(caret);
```

You can customize caret style and selection box style by modifying `caret` object.

```js
caret.caretStyle.background = 'red'
caret.selectionBoxStyle.background = 'red'

caretSelection.showSelection(caret);
```

- ### Hide Caret 

Use `hideSelection` method to hide specific caret by passing caret's `unique-id`. 

```js
caretSelection.hideSelection('my-unique-id');
```

- ### Get Current Caret and Selection

```js
let caret = caretSelection.getCurretSelection();
```

## Realtime Caret Approach

<!-- Please refer to the article here for a more detailed explanation of the approach. -->
I will write an article about this.

## Bugs and Features
Please kindly submit your issue or request your feature [here](https://github.com/w99910/editorjs-caret-selection/issues).


## License
 MIT

## Support

I am in need of financial assistance, and I would deeply appreciate [any support you can offer](https://github.com/sponsors/w99910), even the smallest amount. 🙏🙏 