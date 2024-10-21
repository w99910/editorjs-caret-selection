import EditorJS from '@editorjs/editorjs';

type Caret = {
    id: string | number,
    display: string | HTMLElement,
    blockIndex: number,
    startOffset: number,
    endOffset: number,
    caretStyle?: object,
    selectionBoxStyle?: object,
}

export default class CaretSelection {
    protected carets: Array<Caret> = [];

    protected currentCaret: Caret | null = null;

    protected _onChange: Function | null = null;

    findParent(element: HTMLElement | Element | Node, parentClass: string) {
        let parent = element.parentElement;
        while (parent) {
            if (parent.classList.contains(parentClass)) {
                return parent;
            }
            parent = parent.parentElement;
        }
        return false;
    }

    onChange(fn: Function) {
        this._onChange = fn;
        return this;
    }

    constructor(protected editor: EditorJS, protected id: string | number, protected display: string | HTMLElement, protected caretStyle?: object, protected selectionBoxStyle?: object) {
        let t: any = null;
        document.addEventListener('selectionchange', (e) => {
            if (t) clearTimeout(t);
            t = setTimeout(() => {
                // get current selection and
                let selection = document.getSelection();
                if (!selection || selection.rangeCount === 0) return;
                let focusNode = selection.focusNode;

                if (!focusNode) return;

                let parentEl = this.findParent(focusNode, 'ce-block');
                if (!parentEl) return;
                parentEl = parentEl.querySelector('[contenteditable]') as HTMLElement;
                if (parentEl && focusNode.nodeType === Node.TEXT_NODE) {
                    let selectedText = selection.toString();
                    let startOffset = parentEl.innerText.indexOf(focusNode.nodeValue ?? '') + selection.getRangeAt(0).startOffset;

                    if (selectedText && !focusNode.nodeValue!.includes(selectedText)) {
                        startOffset = parentEl.innerText.indexOf(selectedText);
                    }

                    this.currentCaret = {
                        id: id,
                        display: display,
                        blockIndex: editor.blocks.getCurrentBlockIndex(),
                        startOffset: startOffset,
                        endOffset: startOffset + selectedText.length,
                        caretStyle: caretStyle ?? {},
                        selectionBoxStyle: selectionBoxStyle ?? {}
                    }

                    if (this._onChange) this._onChange(this.currentCaret)
                }
            }, 300)
        })
    }

    showSelection(caret: Caret) {
        let _caret = this.carets.filter((caret) => caret.id !== caret.id)[0];
        if (_caret) {
            _caret.display = caret.display;
            _caret.startOffset = caret.startOffset;
            _caret.endOffset = caret.endOffset;
            _caret.blockIndex = caret.blockIndex;
        } else {
            this.carets.push(caret);
        }
        let holder = this.editor.blocks.getBlockByIndex(caret.blockIndex)?.holder;

        if (!holder) {
            throw new Error('Block cannot find in the editor');
        }

        let parentEl = holder.querySelector('[contenteditable]') as HTMLElement;
        let caretClassName = `${caret.id}-caret-position-indicator`;
        parentEl.style.position = 'relative';

        // remove previous caret and selection boxes
        document.querySelectorAll('.' + caretClassName).forEach((caret) => {
            caret.remove();
        })

        let lineHeight = parseFloat(window.getComputedStyle(parentEl).lineHeight);
        let fontSize = parseFloat(window.getComputedStyle(parentEl).fontSize);
        let fontFamily = window.getComputedStyle(parentEl).fontFamily;
        let fontWeight = window.getComputedStyle(parentEl).fontWeight;
        let paddingTop = parseInt(window.getComputedStyle(parentEl).paddingTop);
        let paddingBottom = parseInt(window.getComputedStyle(parentEl).paddingBottom);

        function measureWordWidth(word) {
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d')!;
            ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
            let matrix = ctx.measureText(word);
            return Math.floor(matrix.width);
        }

        // the problem is that if text is not directly descendent of contenteditable element but a descendent of a child of contenteditable.
        // so in such situation, we need to get real parent of text. so how?
        let childrenOffsets = this.traverseChildren(parentEl, caret.startOffset, caret.endOffset);
        childrenOffsets.sort((offsetA, offsetB) => offsetA.startOffset >= offsetB.startOffset ? 1 : -1)

        // split words and see if words break at the end and leaving some space left
        let currentLineIndex = 0;
        // pre-determine lines to predict position
        let data: Array<{
            startOffset: number,
            endOffset: number,
            lines: Array<any>,
            element: HTMLElement,
        }> = [];

        // we have to consider line break
        let paragraphs = parentEl.innerText.split('\n');


        // we will simulate paragraph structure by using word width, word length and parent element
        paragraphs.forEach((paragraph, i) => {
            let start = parentEl.innerText.indexOf(paragraph);
            let end = start + paragraph.length;
            let parentElement = childrenOffsets.filter((offset) => {
                return offset.startOffset >= start && offset.endOffset <= end;
            })[0].element;
            data[i] = {
                startOffset: start,
                endOffset: end,
                lines: [],
                element: parentElement,
            };
            let content = paragraph;
            let splitWords = content.split(' ');
            currentLineIndex = 0;

            splitWords.forEach((word, index) => {
                if (data[i].lines[currentLineIndex] && data[i].lines[currentLineIndex].content && measureWordWidth(data[i].lines[currentLineIndex].content + word) >= parentElement.getBoundingClientRect().width) {
                    data[i].lines[currentLineIndex].endIndex = content.indexOf(data[i].lines[currentLineIndex].content) + data[i].lines[currentLineIndex].content.length;
                    currentLineIndex++;
                }

                if (!data[i].lines[currentLineIndex]) {
                    let startIndex = data[i].lines[currentLineIndex - 1]?.endIndex;
                    data[i].lines[currentLineIndex] = {
                        startIndex: startIndex ? startIndex + 1 : 1,
                        endIndex: 0,
                        content: '',
                        lineIndex: currentLineIndex,
                    };
                }
                if (index === splitWords.length - 1) {
                    data[i].lines[currentLineIndex].endIndex = content.length;
                }
                data[i].lines[currentLineIndex].content += word + ' ';
            })
        })

        let caretIndicator: HTMLElement | null = null;
        data.filter((datum) => caret.startOffset >= datum.startOffset || caret.endOffset > datum.startOffset).forEach((datum, i) => {
            let elementRect = datum.element.getBoundingClientRect();
            let topOffset = elementRect.top + window.scrollY + lineHeight / 2 - paddingTop - paddingBottom;
            let leftOffset = elementRect.left + window.scrollX;
            datum.lines.forEach((line) => {
                let lineStartIndex = datum.startOffset + line.startIndex;
                let lineEndIndex = datum.startOffset + line.endIndex;
                let start = caret.startOffset > lineStartIndex ? caret.startOffset : lineStartIndex;
                let end = caret.endOffset > lineEndIndex ? lineEndIndex : caret.endOffset;

                if (caret.startOffset !== 0 && caret.endOffset !== 0 && (caret.startOffset > lineEndIndex)) return;
                let top = topOffset + (line.lineIndex * lineHeight) + 'px';

                // calculate left offset of caret 
                // if selection is not at the start of line, compute the width before the selection 
                let left = start !== lineStartIndex ? leftOffset + measureWordWidth(line.content.substring(0, start - lineStartIndex + 1)) + 'px' : leftOffset + 'px';
                if (!caretIndicator) {
                    // create caret indicator
                    caretIndicator = document.createElement('div');
                    caretIndicator.className = caretClassName;
                    caretIndicator.style.position = 'absolute';
                    caretIndicator.style.height = `${lineHeight}px`;
                    caretIndicator.style.background = 'black';
                    caretIndicator.style.borderRadius = '6px';
                    caretIndicator.style.display = 'inline-block';
                    caretIndicator.style.width = '2px';
                    caretIndicator.style.zIndex = '100';
                    caretIndicator.style.top = top;
                    caretIndicator.style.left = left;

                    if (caret.caretStyle) {
                        Object.keys(caret.caretStyle).forEach((attr) => {
                            caretIndicator!.style[attr] = caret.caretStyle![attr];
                        })
                    }

                    let span = document.createElement('span');
                    span.style.display = 'inline-block';
                    span.style.position = 'absolute';
                    span.style.fontSize = '10px';

                    if (caret.display instanceof HTMLElement) {
                        span.appendChild(caret.display)
                    } else {
                        span.style.background = 'black';
                        span.style.borderRadius = '4px';
                        span.style.display = 'inline-block';
                        span.style.padding = '0px 4px';
                        span.textContent = caret.display;
                    }

                    span.style.top = `-${lineHeight / 2}px`;
                    span.style.color = 'white';

                    caretIndicator.appendChild(span);

                    document.getElementById(this.editor.configuration.holder)!.appendChild(caretIndicator);
                }
                if (caret.startOffset === caret.endOffset) return;

                let selectionBox = document.createElement('div');
                selectionBox.className = caretClassName;
                selectionBox.style.position = 'absolute';
                selectionBox.style.height = `${lineHeight}px`;
                selectionBox.style.background = 'black';
                selectionBox.style.opacity = '0.3';
                selectionBox.style.zIndex = '100';

                selectionBox.style.width = measureWordWidth(line.content.substring(start - lineStartIndex, end - lineStartIndex + 1)) + 'px';

                selectionBox.style.top = top;
                selectionBox.style.left = left;

                if (caret.selectionBoxStyle) {
                    Object.keys(caret.selectionBoxStyle).forEach((attr) => {
                        selectionBox.style[attr] = caret.selectionBoxStyle![attr];
                    })
                }

                document.getElementById(this.editor.configuration.holder)!.appendChild(selectionBox);
            })
        })
    }

    hideSelection(id: string | number) {
        let caretClassName = `${id}-caret-position-indicator`;
        document.querySelectorAll('.' + caretClassName).forEach((caret) => {
            caret.remove();
        })
    }

    getCurrentSelection() {
        return this.currentCaret;
    }

    protected traverseChildren(element: HTMLElement, startOffset: number, endOffset: number) {
        let t: Array<any> = [];
        let children = element.children ?? [];
        let sequence: Array<any> = [];
        for (let i = 0; i <= children.length - 1; i++) {
            let child = children[i] as HTMLElement;
            let textC = child.textContent ?? ''
            let startOffset = element.innerText.indexOf(textC);
            let b: {
                startOffset: number,
                endOffset: number,
                element: HTMLElement | Element,
                content?: string,
                children?: Array<any>
            } = {
                startOffset: startOffset,
                endOffset: startOffset + textC.length,
                element: child,
            };
            if (child.children.length > 0) {
                b.children = this.traverseChildren(child, startOffset, endOffset);
            } else {
                b.content = textC;
            }
            sequence.push(...[startOffset, b.endOffset])
            t.push(b);
        }

        if (t.length === 0) {
            return [
                {
                    startOffset: startOffset,
                    endOffset: endOffset,
                    element: element,
                    content: element.innerText.substring(startOffset, endOffset)
                }
            ]
        }

        let maxOffset = element.innerText.length - 1;
        let a = Array.from(sequence);
        sequence.forEach((value, _i) => {
            if (_i === sequence.length - 1 && value < maxOffset) {
                t.push({
                    startOffset: value + 1,
                    endOffset: maxOffset,
                    element: element,
                    content: element.innerText.substring(value + 1, maxOffset)
                })
            }
            let i = a.indexOf(value);
            // console.log(value, i)
            if (i === 0 && value !== 0) {
                t.push({
                    startOffset: 0,
                    endOffset: value - 1,
                    element: element,
                    content: element.innerText.substring(0, value - 1)
                })
                a.splice(0, 0, 0)
                a.splice(1, 0, value - 1)
                return;
            }
            let beforeSecondIndex = i - 2;
            let beforeFirstIndex = i - 1;
            if (beforeSecondIndex < 0 || beforeFirstIndex < 0) {
                return;
            }

            let beforeSecond = a[beforeSecondIndex];
            let beforeFirst = a[beforeFirstIndex];
            if (value - beforeFirst !== 1 && beforeFirst - beforeSecond !== 1) {
                t.push({
                    startOffset: beforeFirst + 1,
                    endOffset: value - 1,
                    element: element,
                    content: element.innerText.substring(beforeFirst + 1, value - 1)
                })
                a.splice(i, 0, beforeFirst + 1)
                a.splice(i + 1, 0, value - 1)
            }
        })

        return t;
    }

}