const React = {
  createElement: (tag, props, ...children) => {
    if (typeof tag === "function") {
      try {
        return tag(props);
      } catch ({ promise, key }) {
        promise.then(data => {
          promiseCache.set(key, data);
          rerender();
        });
        return { tag: "h1", props: { children: ["I AM LOADING!!!!"] } };
      }
    }
    const element = { tag, props: { ...props, children } };
    return element;
  }
};

const render = (reactElement, container) => {
  if (["string", "number"].includes(typeof reactElement)) {
    container.appendChild(document.createTextNode(String(reactElement)));
    return;
  }

  const actualDOMElement = document.createElement(reactElement.tag);

  if (reactElement.props) {
    Object.keys(reactElement.props)
      .filter(p => p !== "children")
      .forEach(p => (actualDOMElement[p] = reactElement.props[p]));
  }

  if (reactElement.props.children) {
    reactElement.props.children.forEach(child =>
      render(child, actualDOMElement)
    );
  }

  container.appendChild(actualDOMElement);
};

const states = [];
let stateCursor = 0;

const useState = initialState => {
  const FROZENCURSOR = stateCursor;

  states[FROZENCURSOR] = states[FROZENCURSOR] || initialState;

  const setState = newState => {
    states[FROZENCURSOR] = newState;
    rerender();
  };

  stateCursor++;

  return [states[FROZENCURSOR], setState];
};

const promiseCache = new Map();

const createResource = (promise, key) => {
  if (promiseCache.has(key)) return promiseCache.get(key);

  throw { promise, key };
};

const App = () => {
  const [name, setName] = useState("person");
  const [count, setCount] = useState(0);

  const dogPhotoUrl = createResource(
    fetch("https://dog.ceo/api/breeds/image/random")
      .then(r => r.json())
      .then(payload => payload.message),
    "dogPhoto"
  );

  return (
    <div className="my-first-react">
      <h1>Hello, {name}</h1>
      <input
        value={name}
        onchange={e => setName(e.target.value)}
        type="text"
        placeholder="name"
      />
      <h2>The count is {count}</h2>
      <button onclick={() => setCount(count + 1)}>+</button>
      <button onclick={() => setCount(count - 1)}>-</button>
      <p>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. At, accusamus
        laborum, voluptates iste odit aspernatur, id eaque rerum et dolore
        dolores non excepturi. A maxime deserunt fugiat, inventore ipsum iste!
      </p>
      <img alt="gooooood booooooyeeeee" src={dogPhotoUrl} width="300" />
    </div>
  );
};

const rerender = () => {
  stateCursor = 0;
  document.querySelector("#app").firstChild.remove();
  render(<App />, document.querySelector("#app"));
};

render(<App />, document.querySelector("#app"));
