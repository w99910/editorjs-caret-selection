class q {
  constructor(e, f, i, n, O) {
    this.editor = e, this.id = f, this.display = i, this.caretStyle = n, this.selectionBoxStyle = O, this.carets = [], this.currentCaret = null, this._onChange = null;
    let x = null;
    document.addEventListener("selectionchange", (I) => {
      x && clearTimeout(x), x = setTimeout(() => {
        let a = document.getSelection();
        if (!a || a.rangeCount === 0) return;
        let t = a.focusNode;
        if (!t) return;
        let c = this.findParent(t, "ce-block");
        if (c && (c = c.querySelector("[contenteditable]"), c && t.nodeType === Node.TEXT_NODE)) {
          let o = a.toString(), h = c.innerText.indexOf(t.nodeValue ?? "") + a.getRangeAt(0).startOffset;
          o && !t.nodeValue.includes(o) && (h = c.innerText.indexOf(o)), this.currentCaret = {
            id: f,
            display: i,
            blockIndex: e.blocks.getCurrentBlockIndex(),
            startOffset: h,
            endOffset: h + o.length,
            caretStyle: n ?? {},
            selectionBoxStyle: O ?? {}
          }, this._onChange && this._onChange(this.currentCaret);
        }
      }, 300);
    });
  }
  findParent(e, f) {
    let i = e.parentElement;
    for (; i; ) {
      if (i.classList.contains(f))
        return i;
      i = i.parentElement;
    }
    return !1;
  }
  onChange(e) {
    return this._onChange = e, this;
  }
  showSelection(e) {
    var N;
    let f = this.carets.filter((l) => l.id !== l.id)[0];
    f ? (f.display = e.display, f.startOffset = e.startOffset, f.endOffset = e.endOffset, f.blockIndex = e.blockIndex) : this.carets.push(e);
    let i = (N = this.editor.blocks.getBlockByIndex(e.blockIndex)) == null ? void 0 : N.holder;
    if (!i)
      throw new Error("Block cannot find in the editor");
    let n = i.querySelector("[contenteditable]"), O = `${e.id}-caret-position-indicator`;
    n.style.position = "relative", document.querySelectorAll("." + O).forEach((l) => {
      l.remove();
    });
    let x = parseFloat(window.getComputedStyle(n).lineHeight), I = parseFloat(window.getComputedStyle(n).fontSize), a = window.getComputedStyle(n).fontFamily, t = window.getComputedStyle(n).fontWeight, c = parseInt(window.getComputedStyle(n).paddingTop), o = parseInt(window.getComputedStyle(n).paddingBottom);
    function h(l) {
      let b = document.createElement("canvas").getContext("2d");
      b.font = `${t} ${I}px ${a}`;
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
        var B;
        if (s[d].lines[r] && s[d].lines[r].content && h(s[d].lines[r].content + S) >= w.getBoundingClientRect().width && (s[d].lines[r].endIndex = m.indexOf(s[d].lines[r].content) + s[d].lines[r].content.length, r++), !s[d].lines[r]) {
          let T = (B = s[d].lines[r - 1]) == null ? void 0 : B.endIndex;
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
    let p = null;
    s.filter((l) => e.startOffset >= l.startOffset || e.endOffset > l.startOffset).forEach((l, d) => {
      let b = l.element.getBoundingClientRect(), E = b.top + window.scrollY + x / 2 - c - o, w = b.left + window.scrollX;
      l.lines.forEach((m) => {
        let C = l.startOffset + m.startIndex, S = l.startOffset + m.endIndex, k = e.startOffset > C ? e.startOffset : C, B = e.endOffset > S ? S : e.endOffset;
        if (e.startOffset !== 0 && e.endOffset !== 0 && e.startOffset > S) return;
        let T = E + m.lineIndex * x + "px", $ = k !== C ? w + h(m.content.substring(0, k - C + 1)) + "px" : w + "px";
        if (!p) {
          p = document.createElement("div"), p.className = O, p.style.position = "absolute", p.style.height = `${x}px`, p.style.background = "black", p.style.borderRadius = "6px", p.style.display = "inline-block", p.style.width = "2px", p.style.zIndex = "100", p.style.top = T, p.style.left = $, e.caretStyle && Object.keys(e.caretStyle).forEach((F) => {
            p.style[F] = e.caretStyle[F];
          });
          let u = document.createElement("span");
          u.style.display = "inline-block", u.style.position = "absolute", u.style.fontSize = "10px", e.display instanceof HTMLElement ? u.appendChild(e.display) : (u.style.background = "black", u.style.borderRadius = "4px", u.style.display = "inline-block", u.style.padding = "0px 4px", u.textContent = e.display), u.style.top = `-${x / 2}px`, u.style.color = "white", p.appendChild(u), document.getElementById(this.editor.configuration.holder).appendChild(p);
        }
        if (e.startOffset === e.endOffset) return;
        let y = document.createElement("div");
        y.className = O, y.style.position = "absolute", y.style.height = `${x}px`, y.style.background = "black", y.style.opacity = "0.3", y.style.zIndex = "100", y.style.width = h(m.content.substring(k - C, B - C + 1)) + "px", y.style.top = T, y.style.left = $, e.selectionBoxStyle && Object.keys(e.selectionBoxStyle).forEach((u) => {
          y.style[u] = e.selectionBoxStyle[u];
        }), document.getElementById(this.editor.configuration.holder).appendChild(y);
      });
    });
  }
  hideSelection(e) {
    let f = `${e}-caret-position-indicator`;
    document.querySelectorAll("." + f).forEach((i) => {
      i.remove();
    });
  }
  getCurrentSelection() {
    return this.currentCaret;
  }
  traverseChildren(e, f, i) {
    let n = [], O = e.children ?? [], x = [];
    for (let t = 0; t <= O.length - 1; t++) {
      let c = O[t], o = c.textContent ?? "", h = e.innerText.indexOf(o), g = {
        startOffset: h,
        endOffset: h + o.length,
        element: c
      };
      c.children.length > 0 ? g.children = this.traverseChildren(c, h, i) : g.content = o, x.push(h, g.endOffset), n.push(g);
    }
    if (n.length === 0)
      return [
        {
          startOffset: f,
          endOffset: i,
          element: e,
          content: e.innerText.substring(f, i)
        }
      ];
    let I = e.innerText.length - 1, a = Array.from(x);
    return x.forEach((t, c) => {
      c === x.length - 1 && t < I && n.push({
        startOffset: t + 1,
        endOffset: I,
        element: e,
        content: e.innerText.substring(t + 1, I)
      });
      let o = a.indexOf(t);
      if (o === 0 && t !== 0) {
        n.push({
          startOffset: 0,
          endOffset: t - 1,
          element: e,
          content: e.innerText.substring(0, t - 1)
        }), a.splice(0, 0, 0), a.splice(1, 0, t - 1);
        return;
      }
      let h = o - 2, g = o - 1;
      if (h < 0 || g < 0)
        return;
      let r = a[h], s = a[g];
      t - s !== 1 && s - r !== 1 && (n.push({
        startOffset: s + 1,
        endOffset: t - 1,
        element: e,
        content: e.innerText.substring(s + 1, t - 1)
      }), a.splice(o, 0, s + 1), a.splice(o + 1, 0, t - 1));
    }), n;
  }
}
export {
  q as default
};
