class q {
  constructor(e, a, i, n, O) {
    this.editor = e, this.id = a, this.display = i, this.caretStyle = n, this.selectionBoxStyle = O, this.carets = [], this.currentCaret = null, this._onChange = null;
    let u = null;
    document.addEventListener("selectionchange", (I) => {
      u && clearTimeout(u), u = setTimeout(() => {
        let c = document.getSelection();
        if (!c || c.rangeCount === 0) return;
        let t = c.focusNode;
        if (!t) return;
        let h = this.findParent(t, "ce-block");
        if (h && (h = h.querySelector("[contenteditable]"), h && t.nodeType === Node.TEXT_NODE)) {
          let o = c.toString(), p = h.innerText.indexOf(t.nodeValue ?? "") + c.getRangeAt(0).startOffset;
          o && !t.nodeValue.includes(o) && (p = h.innerText.indexOf(o)), this.currentCaret = {
            id: a,
            display: i,
            blockIndex: e.blocks.getCurrentBlockIndex(),
            startOffset: p,
            endOffset: p + o.length,
            caretStyle: n ?? {},
            selectionBoxStyle: O ?? {}
          }, this._onChange && this._onChange(this.currentCaret);
        }
      }, 300);
    });
  }
  findParent(e, a) {
    let i = e.parentElement;
    for (; i; ) {
      if (i.classList.contains(a))
        return i;
      i = i.parentElement;
    }
    return !1;
  }
  onChange(e) {
    return this._onChange = e, this;
  }
  showSelection(e) {
    var $;
    let a = this.carets.filter((l) => l.id !== l.id)[0];
    a ? (a.display = e.display, a.startOffset = e.startOffset, a.endOffset = e.endOffset, a.blockIndex = e.blockIndex) : this.carets.push(e);
    let i = ($ = this.editor.blocks.getBlockByIndex(e.blockIndex)) == null ? void 0 : $.holder;
    if (!i)
      throw new Error("Block cannot find in the editor");
    let n = i.querySelector("[contenteditable]"), O = `${e.id}-caret-position-indicator`;
    n.style.position = "relative", document.querySelectorAll("." + O).forEach((l) => {
      l.remove();
    });
    let u = parseFloat(window.getComputedStyle(n).lineHeight), I = parseFloat(window.getComputedStyle(n).fontSize), c = window.getComputedStyle(n).fontFamily, t = window.getComputedStyle(n).fontWeight, h = parseInt(window.getComputedStyle(n).paddingTop), o = parseInt(window.getComputedStyle(n).paddingBottom);
    function p(l) {
      let b = document.createElement("canvas").getContext("2d");
      b.font = `${t} ${I}px ${c}`;
      let E = b.measureText(l);
      return Math.floor(E.width);
    }
    let g = this.traverseChildren(n, e.startOffset, e.endOffset);
    g.sort((l, d) => l.startOffset >= d.startOffset ? 1 : -1);
    let r = 0, s = [];
    n.innerText.split(`
`).forEach((l, d) => {
      let b = n.innerText.indexOf(l), E = b + l.length, w = g.filter((S) => S.startOffset >= b && S.endOffset <= E)[0].element;
      s[d] = {
        startOffset: b,
        endOffset: E,
        lines: [],
        element: w
      };
      let m = l, C = m.split(" ");
      r = 0, C.forEach((S, k) => {
        var N;
        if (s[d].lines[r] && s[d].lines[r].content && p(s[d].lines[r].content + S) >= w.getBoundingClientRect().width && (s[d].lines[r].endIndex = m.indexOf(s[d].lines[r].content) + s[d].lines[r].content.length, r++), !s[d].lines[r]) {
          let T = (N = s[d].lines[r - 1]) == null ? void 0 : N.endIndex;
          s[d].lines[r] = {
            startIndex: T ? T + 1 : 1,
            endIndex: 0,
            content: "",
            lineIndex: r
          };
        }
        k === C.length - 1 && (s[d].lines[r].endIndex = m.length), s[d].lines[r].content += S + " ";
      });
    });
    let y = null;
    s.filter((l) => e.startOffset >= l.startOffset || e.endOffset > l.startOffset).forEach((l, d) => {
      let b = l.element.getBoundingClientRect(), E = b.top + window.scrollY + u / 2 - h - o, w = b.left + window.scrollX;
      l.lines.forEach((m) => {
        let C = l.startOffset + m.startIndex, S = l.startOffset + m.endIndex, k = e.startOffset > C ? e.startOffset : C, N = e.endOffset > S ? S : e.endOffset;
        if (e.startOffset !== 0 && e.endOffset !== 0 && e.startOffset > S) return;
        let T = E + m.lineIndex * u + "px", F = k !== C ? w + p(m.content.substring(0, k - C + 1)) + "px" : w + "px";
        if (!y) {
          y = document.createElement("div"), y.className = O, y.style.position = "absolute", y.style.height = `${u}px`, y.style.background = "black", y.style.borderRadius = "6px", y.style.display = "inline-block", y.style.width = "2px", y.style.zIndex = "100", y.style.top = T, y.style.left = F, e.caretStyle && Object.keys(e.caretStyle).forEach((B) => {
            y.style[B] = e.caretStyle[B];
          });
          let f = document.createElement("span");
          f.style.display = "inline-block", f.style.position = "absolute", f.style.fontSize = "10px", e.display instanceof HTMLElement ? f.appendChild(e.display) : (f.style.background = "black", f.style.borderRadius = "4px", f.style.display = "inline-block", f.style.padding = "0px 4px", f.textContent = e.display, e.caretStyle && Object.keys(e.caretStyle).forEach((B) => {
            f.style[B] = e.caretStyle[B];
          })), f.style.top = `-${u / 2}px`, f.style.color = "white", y.appendChild(f), document.getElementById(this.editor.configuration.holder).appendChild(y);
        }
        if (e.startOffset === e.endOffset) return;
        let x = document.createElement("div");
        x.className = O, x.style.position = "absolute", x.style.height = `${u}px`, x.style.background = "black", x.style.opacity = "0.3", x.style.zIndex = "100", x.style.width = p(m.content.substring(k - C, N - C + 1)) + "px", x.style.top = T, x.style.left = F, e.selectionBoxStyle && Object.keys(e.selectionBoxStyle).forEach((f) => {
          x.style[f] = e.selectionBoxStyle[f];
        }), document.getElementById(this.editor.configuration.holder).appendChild(x);
      });
    });
  }
  hideSelection(e) {
    let a = `${e}-caret-position-indicator`;
    document.querySelectorAll("." + a).forEach((i) => {
      i.remove();
    });
  }
  getCurrentSelection() {
    return this.currentCaret;
  }
  traverseChildren(e, a, i) {
    let n = [], O = e.children ?? [], u = [];
    for (let t = 0; t <= O.length - 1; t++) {
      let h = O[t], o = h.textContent ?? "", p = e.innerText.indexOf(o), g = {
        startOffset: p,
        endOffset: p + o.length,
        element: h
      };
      h.children.length > 0 ? g.children = this.traverseChildren(h, p, i) : g.content = o, u.push(p, g.endOffset), n.push(g);
    }
    if (n.length === 0)
      return [
        {
          startOffset: a,
          endOffset: i,
          element: e,
          content: e.innerText.substring(a, i)
        }
      ];
    let I = e.innerText.length - 1, c = Array.from(u);
    return u.forEach((t, h) => {
      h === u.length - 1 && t < I && n.push({
        startOffset: t + 1,
        endOffset: I,
        element: e,
        content: e.innerText.substring(t + 1, I)
      });
      let o = c.indexOf(t);
      if (o === 0 && t !== 0) {
        n.push({
          startOffset: 0,
          endOffset: t - 1,
          element: e,
          content: e.innerText.substring(0, t - 1)
        }), c.splice(0, 0, 0), c.splice(1, 0, t - 1);
        return;
      }
      let p = o - 2, g = o - 1;
      if (p < 0 || g < 0)
        return;
      let r = c[p], s = c[g];
      t - s !== 1 && s - r !== 1 && (n.push({
        startOffset: s + 1,
        endOffset: t - 1,
        element: e,
        content: e.innerText.substring(s + 1, t - 1)
      }), c.splice(o, 0, s + 1), c.splice(o + 1, 0, t - 1));
    }), n;
  }
}
export {
  q as default
};
