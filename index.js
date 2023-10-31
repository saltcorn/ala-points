const {
  textarea,
  text,
  table,
  th,
  tr,
  td,
  code,
  pre,
  input,
  i,
  button,
  text_attr,
  select,
  script,
  domReady,
  option,
  span,
  nbsp,
  section,
  div,
  a,
} = require("@saltcorn/markup/tags");

const showLatLng = (v) => {
  if (!v) return "";
  const { ycoord, xcoord } = v;
  return `${Math.abs(ycoord).toFixed(4)}° ${ycoord > 0 ? "N" : "S"}, ${Math.abs(
    xcoord
  ).toFixed(4)}° ${xcoord > 0 ? "E" : "W"}`;
};

const mkMap = (points0, id) => {
  const points = points0.filter(
    (p) => typeof p[0][0] === "number" && typeof p[0][1] === "number"
  );
  const npts = points.length;
  const iniloc =
    npts > 0
      ? JSON.stringify(points[0][0])
      : JSON.stringify([-13.8387663, -171.7886927]);
  return `var points = ${JSON.stringify(points)};
var map = L.map('${id}').setView(${iniloc}, 9);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
if(points.length>0) map.fitBounds(points.map(pt=>pt[0]));
`;
};

const alaPoint = {
  name: "AlaPoint",
  sql_name: "jsonb",
  fieldviews: {
    showJsonObject: {
      isEdit: false,
      run: (v) => pre({ class: "wsprewrap" }, code(JSON.stringify(v))),
    },
    showLatLng: {
      isEdit: false,
      run: showLatLng,
    },
    googleMapsLink: {
      configFields: [{ label: "Label", name: "label", type: "String" }],
      run: (v, req, options) =>
        v
          ? a(
              {
                href: `http://www.google.com/maps/place/${v.ycoord},${v.xcoord}`,
              },
              options?.label || "Google Maps Link"
            )
          : "",
    },
    nearestByMapClick: {
      isEdit: true,
      configFields: [
        {
          name: "height",
          label: "Height in px",
          type: "Integer",
          required: true,
          default: 300,
        },
      ],
      run: (nm, v, attrs, cls, required, field) => {
        const id = `map${Math.round(Math.random() * 100000)}`;
        const points = v ? [[[+v.ycoord, +v.xcoord]]] : []; // [[[-13.8387663, -171.7886927]]];
        return div(
          { class: "ala-input" },
          div({ id, style: `height:${attrs?.height || 300}px;` }) +
            input({
              name: text_attr(nm),
              id: `input${text_attr(nm)}`,
              type: "hidden",
              onChange: attrs.onChange,
              "data-fieldname": text_attr(field.name),
              value: v ? text_attr(JSON.stringify(v)) : false,
            }) +
            script(
              domReady(
                `let curMarkers = []
                    ` +
                  mkMap(points, id) +
                  (v
                    ? `
                    points.forEach(pt=>{
            const m = L.marker(pt[0]).addTo(map);
            curMarkers.push(m);
          });`
                    : "") +
                  `map.on('click',lookup_by_map_click(map, curMarkers));`
              )
            )
        );
      },
    },
    searchAlaNumber: {
      isEdit: true,
      run: (nm, v, attrs, cls, required, field) =>
        div(
          { class: "input-group ala-input" },
          input({
            type: "text",
            disabled: attrs.disabled,
            readonly: attrs.readonly,
            class: ["form-control", "ala-input", cls],
            value: v?.ala_num || false,
          }),
          button(
            {
              class: "btn btn-secondary",
              type: "button",
              onClick: `lookup_by_ala_number(this)`,
            },
            v?.ala_num ? "Find ✓" : "Find"
          ),

          input({
            name: text_attr(nm),
            id: `input${text_attr(nm)}`,
            type: "hidden",
            onChange: attrs.onChange,
            "data-fieldname": text_attr(field.name),
            value: v ? text_attr(JSON.stringify(v)) : false,
          })
        ),
    },
  },
  attributes: [],
  read: (v, attrs) => {
    switch (typeof v) {
      case "string":
        try {
          return JSON.parse(v);
        } catch {
          return undefined;
        }
      default:
        return v;
    }
  },
};

module.exports = {
  sc_plugin_api_version: 1,
  types: [alaPoint],
  plugin_name: "ala-points",
  dependencies: ["@saltcorn/leaflet-map"],
  headers: [
    {
      script: `/plugins/public/ala-points${
        "@" + require("./package.json").version
      }/alaclient.js`,
    },
  ],
};
