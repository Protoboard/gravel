import {setDomProperty} from "./setDomProperty";

const window = <any>global;

beforeEach(() => {
  window.Attr = function () {//
  };
  window.Comment = function () {//
  };
  window.Text = function () {//
  };
  window.CSSStyleDeclaration = function () {//
  };
  window.DOMTokenList = function () {
    this._items = {};
  };
  window.DOMTokenList.prototype = {
    add(name) {
      this._items[name] = name;
    },
    contains(name) {
      return this._items[name] !== undefined;
    },
    remove(name) {
      delete this._items[name];
    }
  };
  window.NamedNodeMap = function () {
    this._items = {};
  };
  window.NamedNodeMap.prototype = {
    getNamedItem(name) {
      return this._items[name];
    },
    removeNamedItem(name) {
      delete this._items[name];
    },
    setNamedItem(attr) {
      this._items[attr.name] = attr;
    }
  };
  window.Node = function () {
    this.childNodes = new window.NodeList();
    this.attributes = new window.NamedNodeMap();
    this.classList = new window.DOMTokenList();
    this.style = new window.CSSStyleDeclaration();
  };
  window.Node.prototype = {
    appendChild(newChild) {
      this.childNodes[this.childNodes.length++] = newChild;
    },
    replaceChild(newChild, oldChild) {
      for (let i = 0; i < this.childNodes.length; i++) {
        if (this.childNodes[i] === oldChild) {
          this.childNodes[i] = newChild;
          break;
        }
      }
    }
  };
  window.NodeList = function () {
    this.length = 0;
  };
  window.document = new Node();
  window.document.body = new window.Node();
  window.document.createAttribute = (name) => {
    const attr = new window.Attr();
    attr.name = name;
    return attr;
  };
  window.document.createComment = (data) => {
    const comment = new window.Comment();
    comment.data = data;
    return comment;
  };
  window.document.createElement = (tagName) => {
    const node = new window.Node();
    node.tagName = tagName;
    return node;
  };
});

afterEach(() => {
  delete window.Attr;
  delete window.Comment;
  delete window.CSSStyleDeclaration;
  delete window.DOMTokenList;
  delete window.NamedNodeMap;
  delete window.Node;
  delete window.NodeList;
  delete window.document;
});

describe("setDomProperty()", () => {
  it("should create nodes along the way", () => {
    const path = "body.childNodes.1:div.childNodes.3:span.classList.foo";
    setDomProperty(window.document, window.document, path, true);
    expect(window.document.body.childNodes[1].tagName).toBe("div");
    expect(window.document.body.childNodes[1].childNodes[3].tagName).toBe("span");
  });

  it("should create placeholders along the way", () => {
    const path = "body.childNodes.1:div.childNodes.3:span.classList.foo";
    setDomProperty(window.document, window.document, path, true);
    expect(window.document.body.childNodes[0].data).toBe("");
    expect(window.document.body.childNodes[1].childNodes[0].data).toBe("");
    expect(window.document.body.childNodes[1].childNodes[1].data).toBe("");
    expect(window.document.body.childNodes[1].childNodes[2].data).toBe("");
  });

  it("should return true", () => {
    const path = "body.childNodes.1:div.childNodes.3:span.classList.foo";
    expect(setDomProperty(window.document, window.document, path, true)).toBe(true);
  });

  describe("when comments are in the way", () => {
    beforeEach(() => {
      const path = "body.childNodes.1:div.childNodes.3:span.classList.foo";
      setDomProperty(window.document, window.document, path, true);
    });

    it("should replace comments with nodes", () => {
      const path = "body.childNodes.0:span.innerText";
      setDomProperty(window.document, window.document, path, "Hello");
      expect(window.document.body.childNodes[0].tagName).toBe("span");
      expect(window.document.body.childNodes[0].innerText).toBe("Hello");
    });
  });

  describe("for attribute", () => {
    describe("when attribute does not exist yet", () => {
      it("should add new attribute", () => {
        const path = "body.childNodes.1:div.childNodes.3:span.attributes.foo";
        setDomProperty(window.document, window.document, path, "bar");
        expect(
          window.document.body.childNodes[1].childNodes[3].attributes
          .getNamedItem("foo").value
        ).toBe("bar");
      });
    });

    describe("when attribute already exists", () => {
      beforeEach(() => {
        const path = "body.childNodes.1:div.childNodes.3:span.attributes.foo";
        setDomProperty(window.document, window.document, path, "bar");
      });

      it("should set attribute value", () => {
        const path = "body.childNodes.1:div.childNodes.3:span.attributes.foo";
        setDomProperty(window.document, window.document, path, "baz");
        expect(
          window.document.body.childNodes[1].childNodes[3].attributes
          .getNamedItem("foo").value
        ).toBe("baz");
      });
    });
  });

  describe("for CSS class", () => {
    it("should add class", () => {
      const path = "body.childNodes.1:div.childNodes.3:span.classList.foo";
      setDomProperty(window.document, window.document, path, true);
      expect(
        window.document.body.childNodes[1].childNodes[3].classList.contains("foo")
      ).toBeTruthy();
    });
  });

  describe("for style", () => {
    it("should set style property", () => {
      const path = "body.childNodes.1:div.childNodes.3:span.style.foo";
      setDomProperty(window.document, window.document, path, "bar");
      expect(window.document.body.childNodes[1].childNodes[3].style.foo)
      .toBe("bar");
    });
  });

  describe("for event handler", () => {
    it("should set handler property", () => {
      const cb = () => null;
      const path = "body.childNodes.1:div.childNodes.3:span.onclick";
      setDomProperty(window.document, window.document, path, cb);
      expect(window.document.body.childNodes[1].childNodes[3].onclick)
      .toBe(cb);
    });
  });

  describe("when unsuccessful", () => {
    it("should return false", () => {
      const path = "body.childNodes.1.classList.foo";
      expect(setDomProperty(window.document, window.document, path, true)).toBe(false);
    });
  });
});